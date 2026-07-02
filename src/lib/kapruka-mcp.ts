import { prepareKaprukaParams } from "@/lib/kapruka-english";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

const MCP_URL = process.env.KAPRUKA_MCP_URL ?? "https://mcp.kapruka.com/mcp";

let client: Client | null = null;
let connectPromise: Promise<Client> | null = null;

function textFromToolResult(result: {
  content?: { type: string; text?: string }[];
  structuredContent?: unknown;
  isError?: boolean;
}): string {
  if (result.structuredContent && typeof result.structuredContent === "object") {
    return JSON.stringify(result.structuredContent);
  }
  const parts = result.content ?? [];
  for (const part of parts) {
    if (part.type === "text" && part.text) return part.text;
  }
  if (result.isError) {
    throw new Error(
      parts.map((p) => (p.type === "text" ? p.text : "")).join(" ") || "Tool error"
    );
  }
  throw new Error("No text in MCP tool result");
}

/** Reset cached connection so the next call reconnects fresh. */
function resetClient() {
  client = null;
  connectPromise = null;
}

async function getClient(): Promise<Client> {
  if (client) return client;
  if (!connectPromise) {
    connectPromise = (async () => {
      const c = new Client({ name: "kapa-agent", version: "1.0.0" });
      const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
      await c.connect(transport);
      client = c;
      return c;
    })().catch((err) => {
      resetClient();
      throw err;
    });
  }
  return connectPromise;
}

export async function callKaprukaTool(
  name: string,
  params: Record<string, unknown>
): Promise<string> {
  const englishParams = prepareKaprukaParams(name, params);
  let c: Client;
  try {
    c = await getClient();
  } catch (err) {
    resetClient();
    throw err;
  }

  try {
    const result = await c.callTool(
      {
        name,
        arguments: {
          params: { ...englishParams, response_format: "json" },
        },
      },
      CallToolResultSchema
    );
    return textFromToolResult(
      result as {
        content?: { type: string; text?: string }[];
        structuredContent?: unknown;
        isError?: boolean;
      }
    );
  } catch (err) {
    // Drop the connection — next request will reconnect from scratch
    resetClient();
    throw err;
  }
}

export function parseKaprukaJson<T>(raw: string): T {
  const trimmed = raw.trim();
  if (trimmed.startsWith("Error")) throw new Error(trimmed);
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error(trimmed.slice(0, 300));
  }
}
