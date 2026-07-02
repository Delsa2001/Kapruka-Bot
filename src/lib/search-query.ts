/**
 * Kapruka product search only matches English catalog keywords.
 * Maps multilingual intent → distinct English queries (recipient / occasion / product).
 */

import {
  buildKaprukaSearchQuery,
  parseSearchIntent,
  type SearchIntent,
} from "./search-intent";

const TANGLISH_RE =
  /\b(venum|venuma|panni|pannunga|kaattu|kaattunga|irukku|irukka|keela|melai|mela|ku|oru|ungaluku)\b/i;

const SINGLISH_RE =
  /\b(mata|mage|ekak|ekk|oni|puluvan|hoyala|balann|oya|mama|dan|mek|hari)\b/i;

const PRICE_RE =
  /(?:රු\.?|rs\.?|rupees?|lkr)\s*([\d,]+)|([\d,]+)\s*(?:රු|rs|rupees|lkr)/gi;

const ROMAN_STOPWORDS = new Set([
  "ku",
  "keela",
  "melai",
  "mela",
  "panni",
  "kaattu",
  "venum",
  "mata",
  "mage",
  "ekak",
  "the",
  "and",
  "for",
  "with",
  "under",
  "below",
  "show",
  "search",
  "products",
  "max",
  "min",
  "budget",
  "adui",
  "gift",
  "gifts",
]);

function stripPrices(text: string): string {
  return text.replace(PRICE_RE, " ").replace(/\s+/g, " ").trim();
}

/** Strip Sinhala dative suffixes only (Tamil suffix strip breaks stems). */
function stripSinhalaSuffixes(text: string): string {
  return text.replace(/ට$/u, "").replace(/ටින්$/u, "").replace(/ගේ$/u, "").trim();
}

function hasLocalScript(text: string): boolean {
  return /[\u0D80-\u0DFF\u0B80-\u0BFF]/.test(text);
}

function needsIntentParse(text: string): boolean {
  return (
    hasLocalScript(text) ||
    TANGLISH_RE.test(text) ||
    SINGLISH_RE.test(text) ||
    /\b(gift|mother|father|girlfriend|boyfriend)\b/i.test(text)
  );
}

/** Extract extra English tokens when mixed with local languages. */
function mergeEnglishTokens(text: string, intent: SearchIntent): SearchIntent {
  const matches =
    text.match(
      /\b[a-z][a-z0-9]*(?:\s+[a-z][a-z0-9]*){0,2}\b/gi
    ) ?? [];
  const extra: string[] = [];
  for (const m of matches) {
    const phrase = m.toLowerCase().trim();
    const tokens = phrase.split(/\s+/).filter((t) => !ROMAN_STOPWORDS.has(t) && t.length > 2);
    if (tokens.length) extra.push(tokens.join(" "));
  }
  intent.rawEnglish = [...new Set([...intent.rawEnglish, ...extra])];
  return intent;
}

/** Build an English Kapruka search string from any language input. */
export function normalizeSearchQuery(raw: string): string {
  const cleaned = stripSinhalaSuffixes(stripPrices(raw.trim()));
  if (!cleaned) return "special gift set";

  const lower = cleaned.toLowerCase();
  if (lower === "gift" || lower === "gifts" || lower === "තෑගි") {
    return "special gift set";
  }

  if (!needsIntentParse(cleaned)) {
    const direct = parseSearchIntent(cleaned);
    if (direct.recipient || direct.occasion || direct.product) {
      return buildKaprukaSearchQuery(direct);
    }
    return cleaned;
  }

  let intent = parseSearchIntent(cleaned);
  intent = mergeEnglishTokens(cleaned, intent);
  return buildKaprukaSearchQuery(intent);
}

/** Context-aware fallback when a search returns zero results. */
export function fallbackSearchQuery(primaryQuery: string): string {
  const intent = parseSearchIntent(primaryQuery);
  if (intent.recipient === "girlfriend" || intent.recipient === "boyfriend") {
    return "romantic gift for lover";
  }
  if (intent.recipient === "mother") return "gift for mother";
  if (intent.recipient === "father") return "gift for father";
  if (intent.product === "flowers") return "flowers bouquet";
  if (intent.product === "chocolate") return "chocolate gift";
  if (intent.occasion === "wedding") return "wedding gift";
  if (intent.recipient || intent.occasion || intent.product) {
    return buildKaprukaSearchQuery(intent);
  }
  const trimmed = primaryQuery.trim();
  if (trimmed.length >= 3) return trimmed;
  return "bestseller";
}
