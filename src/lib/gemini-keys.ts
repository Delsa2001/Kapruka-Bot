const MAX_NUMBERED_GEMINI_KEYS = 50;

/** Google AI Studio keys start with AIza; other formats are skipped for rotation. */
function isGoogleAiStudioKey(key: string): boolean {
  return key.startsWith("AIza");
}

/** Collect Gemini API keys from env — tries next key on quota / rate-limit errors. */
export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];

  const list = process.env.GOOGLE_GENERATIVE_AI_API_KEYS;
  if (list) {
    keys.push(
      ...list
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    );
  }

  const primary = [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GEMINI_API_KEY,
  ];
  for (const k of primary) {
    if (k?.trim()) keys.push(k.trim());
  }

  for (let i = 2; i <= MAX_NUMBERED_GEMINI_KEYS; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k?.trim()) keys.push(k.trim());
  }

  const unique = [...new Set(keys)];
  const valid = unique.filter(isGoogleAiStudioKey);
  return valid.length > 0 ? valid : unique;
}

export function isGeminiQuotaError(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? `${error.message} ${(error as { cause?: Error }).cause?.message ?? ""}`
      : String(error);

  const lower = msg.toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("rate-limit") ||
    lower.includes("resource exhausted") ||
    lower.includes("resourceexhausted") ||
    lower.includes("limit: 0") ||
    lower.includes("429") ||
    lower.includes("too many requests")
  );
}
