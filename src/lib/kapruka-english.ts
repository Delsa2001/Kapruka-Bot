/**
 * Kapruka MCP only understands English for search & city lookup.
 * Users may write in English, Sinhala, Tamil, Tanglish, or Singlish —
 * we translate intent here; Kapa still replies in the user's language.
 */

import { normalizeCityQuery } from "@/lib/city-names";
import { normalizeSearchQuery } from "@/lib/search-query";

const CATEGORY_MAP: Record<string, string> = {
  මල්: "flowers",
  කේක්: "cakes",
  චොකලට්: "chocolates",
  තෑගි: "gifts",
  පළතිරු: "groceries",
  "பூக்கள்": "flowers",
  "பூ": "flowers",
  "கேக்": "cakes",
  "சாக்லேட்": "chocolates",
  "பரிசு": "gifts",
};

/** Normalize category slug/name for Kapruka filters. */
export function normalizeCategoryQuery(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const t = raw.trim();
  if (CATEGORY_MAP[t]) return CATEGORY_MAP[t];
  const lower = t.toLowerCase();
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  if (/^[\u0D80-\u0DFF\u0B80-\u0BFF]/.test(t)) {
    for (const [key, en] of Object.entries(CATEGORY_MAP)) {
      if (t.includes(key)) return en;
    }
  }
  return t;
}

/** Apply English normalization before every Kapruka MCP tool call. */
export function prepareKaprukaParams(
  toolName: string,
  params: Record<string, unknown>
): Record<string, unknown> {
  switch (toolName) {
    case "kapruka_search_products": {
      const q = typeof params.q === "string" ? params.q : "";
      const category =
        typeof params.category === "string" ? params.category : undefined;
      return {
        ...params,
        q: normalizeSearchQuery(q),
        category: normalizeCategoryQuery(category),
      };
    }

    case "kapruka_list_delivery_cities": {
      const query = String(params.query ?? params.city ?? "");
      return { ...params, query: normalizeCityQuery(query) };
    }

    case "kapruka_check_delivery":
      return {
        ...params,
        city: normalizeCityQuery(String(params.city ?? "")),
      };

    case "kapruka_create_order": {
      const delivery = params.delivery as { city?: string } | undefined;
      if (!delivery) return params;
      return {
        ...params,
        delivery: {
          ...delivery,
          city: normalizeCityQuery(String(delivery.city ?? "")),
        },
      };
    }

    default:
      return params;
  }
}
