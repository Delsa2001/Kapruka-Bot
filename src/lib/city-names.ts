import aliasData from "@/data/city-aliases.json";

type AliasFile = {
  aliases: Record<string, string>;
};

const { aliases: CITY_ALIASES } = aliasData as AliasFile;

function stripLocationSuffixes(text: string): string {
  return text
    .replace(/ට$/u, "")
    .replace(/ටින්$/u, "")
    .replace(/වලට$/u, "")
    .replace(/ලට$/u, "")
    .replace(/க்கு$/u, "")
    .replace(/க்கூ$/u, "")
    .replace(/இல்$/u, "")
    .replace(/இன்$/u, "")
    .replace(/\s+(city|town)$/i, "")
    .trim();
}

function normLatin(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Resolve user/model city text to a Kapruka search term (English name or zone).
 * Covers 272+ deliverable cities, 5300+ aliases in English, Sinhala, and Tamil.
 */
export function normalizeCityQuery(query: string): string {
  const trimmed = stripLocationSuffixes(query.trim());
  if (!trimmed) return query.trim();

  const direct = CITY_ALIASES[trimmed] ?? CITY_ALIASES[trimmed.toLowerCase()];
  if (direct) return direct;

  const latin = normLatin(trimmed);
  if (latin.length >= 2 && CITY_ALIASES[latin]) return CITY_ALIASES[latin];

  for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
    if (alias.length < 2) continue;
    if (trimmed.includes(alias) || trimmed.toLowerCase().includes(alias.toLowerCase())) {
      return canonical;
    }
  }

  return trimmed;
}
