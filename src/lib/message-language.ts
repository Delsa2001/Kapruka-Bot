import type { UIMessage } from "ai";
import type { LanguageMode } from "@/types/kapruka";

/** How Kapa must reply — derived from the user's latest message. */
export type ReplyLanguage =
  | "en"
  | "si"
  | "ta"
  | "tanglish"
  | "singlish"
  | "mixed";

const SINHALA = /[\u0D80-\u0DFF]/;
const TAMIL = /[\u0B80-\u0BFF]/;
const LATIN = /[A-Za-z]/;

/** Romanized Tamil + English (Tanglish) cues */
const TANGLISH_RE =
  /\b(venum|venuma|panni|pannunga|kaattu|kaattunga|irukku|irukka|irundhuchu|enga|epdi|vanakkam|romba|nalla|keela|melai|mela|sollu|paaru|paakalam|vechi|thaa|varuthu|pathu|podu|edhuku|appuram|innum|oru|ungaluku|unggalukku|birthday\s*ku)\b/i;

/** Romanized Sinhala + English (Singlish) cues */
const SINGLISH_RE =
  /\b(mata|mage|hari|ekak|ekk|puluvan|puluvam|balann|hoyala|hoyan|kohomada|kiyala|denna|thiyenawa|thiyenai|oya|mama|loku|podi|gihin|enna|monawada|kawda|mokada|dan|mek|hari|lassanai|stuti)\b/i;

export function getLastUserMessageText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const parts = m.parts ?? [];
    return parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  return "";
}

function userExplicitlyMixesLanguages(text: string): boolean {
  const hasSi = SINHALA.test(text);
  const hasTa = TAMIL.test(text);
  const hasLatin = LATIN.test(text);
  const scriptCount = (hasSi ? 1 : 0) + (hasTa ? 1 : 0) + (hasLatin ? 1 : 0);
  if (scriptCount >= 2) return true;
  if (hasSi && hasLatin && SINGLISH_RE.test(text)) return true;
  if (hasTa && hasLatin && TANGLISH_RE.test(text)) return true;
  if (hasSi && TANGLISH_RE.test(text)) return true;
  if (hasTa && SINGLISH_RE.test(text)) return true;
  return false;
}

/**
 * Detect reply language from the user's message text.
 * Message content always wins over the UI language dropdown.
 */
export function detectReplyLanguage(text: string): ReplyLanguage {
  const trimmed = text.trim();
  if (!trimmed) return "en";

  if (userExplicitlyMixesLanguages(trimmed)) return "mixed";

  const hasSi = SINHALA.test(trimmed);
  const hasTa = TAMIL.test(trimmed);
  const hasLatin = LATIN.test(trimmed);

  if (hasSi && hasLatin) return "singlish";
  if (hasSi) return "si";
  if (hasTa && !hasLatin) return "ta";
  if (hasTa && hasLatin) return "tanglish";

  if (TANGLISH_RE.test(trimmed)) return "tanglish";
  if (SINGLISH_RE.test(trimmed)) return "singlish";

  return "en";
}

/** UI dropdown preference; when set, guides replies (message script still respected when clear). */
export function resolveReplyLanguage(
  text: string,
  preferred: LanguageMode = "auto"
): ReplyLanguage {
  const trimmed = text.trim();
  if (preferred === "auto") return detectReplyLanguage(trimmed);
  if (!trimmed) {
    return preferred === "si" ? "si" : preferred === "ta" ? "ta" : "en";
  }
  const detected = detectReplyLanguage(trimmed);
  if (detected === "mixed" || detected === "tanglish" || detected === "singlish") {
    return detected;
  }
  if (preferred === "si" && detected === "ta") return "ta";
  if (preferred === "ta" && detected === "si") return "si";
  if (preferred === "en" && (detected === "si" || detected === "ta")) return detected;
  return preferred === "si" ? "si" : preferred === "ta" ? "ta" : "en";
}

export function buildReplyLanguageRules(lang: ReplyLanguage): string {
  const shared = `
STRICT LANGUAGE RULES (highest priority — never break):
- Match ONLY the reply language below. Do NOT blend other languages or scripts.
- Product names, "Rs.", "LKR", and brand names may stay as on Kapruka.
- Never add Sinhala script, Tamil script, or extra English "help" sentences outside the target language.
- If the user mixes languages in one message (e.g. "මට cake එකක්"), you may mirror that same mix only — do not add a third language.`;

  switch (lang) {
    case "en":
      return `${shared}
REPLY LANGUAGE: English only (Latin script).
FORBIDDEN: Sinhala script, Tamil script, Tanglish, Singlish, romanized Tamil/Sinhala phrases.`;

    case "si":
      return `${shared}
REPLY LANGUAGE: Sinhala only (සිංහල script).
FORBIDDEN: Tamil script, English sentences, Tanglish, Singlish. Short labels like "Rs." are OK.`;

    case "ta":
      return `${shared}
REPLY LANGUAGE: Tamil only (தமிழ் script).
FORBIDDEN: Sinhala script, English sentences, Tanglish, Singlish. Short labels like "Rs." are OK.`;

    case "tanglish":
      return `${shared}
REPLY LANGUAGE: Tanglish only — Tamil + English in Latin/Roman letters (e.g. "birthday ku chocolate gift box venum", "Rs. 10000 ku keela search panni products paaru").
FORBIDDEN: Sinhala script (ක, ර, etc.), Tamil script (க, ள, etc.), full English-only paragraphs, Singlish.
Example tone: "Birthday ku 10,000 ku keela nalla chocolate gift boxes irukku — mela products paaru, edhavadhu pudikkuthaa?"`;

    case "singlish":
      return `${shared}
REPLY LANGUAGE: Singlish only — Sinhala + English the way Sri Lankans text (e.g. "mata cake ekak hoyala", or "මට cake එකක්" if user wrote that mix).
FORBIDDEN: Tamil script, Tanglish Tamil words (venum, panni, irukku), pure English-only or pure Sinhala-only if user mixed.`;

    case "mixed":
      return `${shared}
REPLY LANGUAGE: Mixed — mirror the user's exact blend (scripts and romanization). Do not add Sinhala if they used Tamil+English, or Tamil if they used Sinhala+English, unless they already used both.`;

    default:
      return buildReplyLanguageRules("en");
  }
}
