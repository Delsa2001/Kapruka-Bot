import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  UIMessage,
  type UIMessageChunk,
} from "ai";
import { getGeminiApiKeys, isGeminiQuotaError } from "@/lib/gemini-keys";
import { kaprukaTools } from "@/lib/tools";
import {
  getLastUserMessageText,
  resolveReplyLanguage,
} from "@/lib/message-language";
import { buildSystemPrompt } from "@/lib/system-prompt";
import type { CartItem, LanguageMode } from "@/types/kapruka";

export const maxDuration = 60;

// ─── Security constants ───────────────────────────────────────────────────────

const MAX_BODY_BYTES = 512_000;     // 512 KB
const MAX_MESSAGES   = 60;         // conversation depth cap
const MAX_CART_ITEMS = 50;

const ALLOWED_GEMINI_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
]);

/** Build CORS headers scoped to the app's own origin. */
function corsHeaders(req: Request): Record<string, string> {
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const requestOrigin = req.headers.get("origin") ?? "";

  const isAllowed =
    requestOrigin === appOrigin ||
    requestOrigin.startsWith("http://localhost") ||
    (appOrigin && requestOrigin.endsWith(new URL(appOrigin).hostname));

  return {
    "Access-Control-Allow-Origin":  isAllowed ? requestOrigin : appOrigin || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age":       "86400",
  };
}

/** Mask internal error details in production. */
function safeErrorMessage(error: unknown, keyCount: number): string {
  if (isGeminiQuotaError(error)) {
    return `All ${keyCount} Gemini API keys hit quota. Please wait a minute and try again.`;
  }
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : "Chat failed";
  }
  return "Something went wrong. Please try again.";
}

// ─── Preflight ────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const cors = corsHeaders(req);

  // 1. Content-Type guard
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return new Response(
      JSON.stringify({ error: "Content-Type must be application/json" }),
      { status: 415, headers: { "Content-Type": "application/json", ...cors } }
    );
  }

  // 2. Body size guard (before JSON.parse)
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(
      JSON.stringify({ error: "Request body too large" }),
      { status: 413, headers: { "Content-Type": "application/json", ...cors } }
    );
  }

  // 3. Parse + structural validation
  let body: { messages?: unknown; cart?: unknown; language?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json", ...cors } }
    );
  }

  if (!Array.isArray(body.messages)) {
    return new Response(
      JSON.stringify({ error: "messages must be an array" }),
      { status: 400, headers: { "Content-Type": "application/json", ...cors } }
    );
  }
  if (body.messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({ error: `Conversation exceeds ${MAX_MESSAGES} messages` }),
      { status: 400, headers: { "Content-Type": "application/json", ...cors } }
    );
  }

  const messages = body.messages as UIMessage[];
  const cart = (Array.isArray(body.cart) ? body.cart : []).slice(0, MAX_CART_ITEMS) as CartItem[];
  const preferredLanguage: LanguageMode =
    ["en", "si", "ta", "auto"].includes(body.language as string)
      ? (body.language as LanguageMode)
      : "auto";

  // 4. Keys check
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    return new Response(
      JSON.stringify({ error: "No API keys configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...cors } }
    );
  }

  // 5. Validate model
  const envModel = process.env.GEMINI_MODEL ?? "";
  const modelId = ALLOWED_GEMINI_MODELS.has(envModel) ? envModel : "gemini-2.5-flash";

  const lastUserText = getLastUserMessageText(messages);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Kapa] Keys: ${keys.length} | Model: ${modelId} | Lang: ${resolveReplyLanguage(lastUserText, preferredLanguage)}`);
  }

  const convertedMessages = await convertToModelMessages(messages);
  const system = buildSystemPrompt(cart, lastUserText, preferredLanguage);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let lastError: unknown;

      keyLoop: for (let i = 0; i < keys.length; i++) {
        const buffered: UIMessageChunk[] = [];
        let streamError: string | null = null;

        try {
          const google = createGoogleGenerativeAI({ apiKey: keys[i] });
          const result = streamText({
            model: google(modelId),
            system,
            messages: convertedMessages,
            tools: kaprukaTools,
            stopWhen: stepCountIs(8),
            maxRetries: 0,
          });

          for await (const chunk of result.toUIMessageStream()) {
            if (chunk.type === "error") {
              streamError =
                "errorText" in chunk && typeof chunk.errorText === "string"
                  ? chunk.errorText
                  : "Chat failed";
              break;
            }
            buffered.push(chunk);
          }
        } catch (error) {
          lastError = error;
          if (isGeminiQuotaError(error) && i < keys.length - 1) {
            console.warn(`[Kapa] Key ${i + 1}/${keys.length} quota, rotating…`);
            continue keyLoop;
          }
          throw error;
        }

        if (streamError) {
          lastError = new Error(streamError);
          if (isGeminiQuotaError(lastError) && i < keys.length - 1) {
            console.warn(`[Kapa] Key ${i + 1}/${keys.length} quota, rotating…`);
            continue keyLoop;
          }
          for (const chunk of buffered) writer.write(chunk);
          writer.write({ type: "error", errorText: streamError });
          return;
        }

        for (const chunk of buffered) writer.write(chunk);
        return;
      }

      throw lastError ?? new Error("All Gemini API keys failed");
    },
    onError: (error) => safeErrorMessage(error, keys.length),
  });

  return createUIMessageStreamResponse({ stream, headers: cors });
}
