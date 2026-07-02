import type {
  CheckoutResult,
  ProductSummary,
} from "@/types/kapruka";

export type ToolUIPart = {
  type: string;
  toolCallId?: string;
  toolName?: string;
  state?: string;
  output?: unknown;
  input?: unknown;
  result?: unknown;
};

function parseJsonValue(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return null;
      }
    }
    return trimmed;
  }
  if (typeof value === "object" && value !== null && "result" in value) {
    return parseJsonValue((value as { result: unknown }).result);
  }
  return value;
}

export function normalizeToolOutput(output: unknown): unknown {
  return parseJsonValue(output);
}

export function toolNameFromPart(part: ToolUIPart): string {
  if (part.toolName) return part.toolName;
  if (part.type.startsWith("tool-") && part.type !== "tool-output-available") {
    return part.type.slice(5);
  }
  return "";
}

export function collectToolOutputs(parts: ToolUIPart[]): {
  name: string;
  output: unknown;
}[] {
  const namesByCallId = new Map<string, string>();
  const results: { name: string; output: unknown }[] = [];

  for (const part of parts) {
    if (
      (part.type === "tool-input-available" ||
        part.type === "tool-input-start") &&
      part.toolCallId &&
      part.toolName
    ) {
      namesByCallId.set(part.toolCallId, part.toolName);
    }
  }

  const skipStates = new Set([
    "input-streaming",
    "input-available",
    "approval-requested",
    "approval-responded",
  ]);

  for (const part of parts) {
    if (part.state && skipStates.has(part.state)) continue;
    if (part.state && part.state !== "output-available" && !part.output && !part.result) {
      continue;
    }

    let name = toolNameFromPart(part);
    let rawOutput = part.output ?? part.result;

    if (part.type === "tool-output-available" && part.toolCallId) {
      name = namesByCallId.get(part.toolCallId) ?? name;
      rawOutput = part.output;
    }

    if (!rawOutput) continue;

    const output = normalizeToolOutput(rawOutput);
    if (output == null) continue;

    if (name) {
      results.push({ name, output });
    }
  }

  return results;
}

export function extractProducts(output: unknown): ProductSummary[] {
  const data = normalizeToolOutput(output);
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  let list: ProductSummary[] = [];
  if (Array.isArray(o.results)) list = o.results as ProductSummary[];
  else if (o.id && o.name) list = [data as ProductSummary];

  const seen = new Set<string>();
  return list.filter((p) => {
    if (!p.id || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function extractCheckout(output: unknown): CheckoutResult | null {
  const data = normalizeToolOutput(output);
  if (!data || typeof data !== "object") return null;
  const o = data as CheckoutResult;
  if (o.checkout_url && o.order_ref) return o;
  return null;
}

export type DeliveryInfo = {
  city: string;
  checked_date?: string;
  available: boolean;
  rate?: number;
  currency?: string;
  reason?: string | null;
  next_available_date?: string | null;
  perishable_warning?: string | null;
};

export function extractDelivery(output: unknown): DeliveryInfo | null {
  const data = normalizeToolOutput(output);
  if (!data || typeof data !== "object") return null;
  const o = data as DeliveryInfo;
  if ("available" in o && "city" in o) return o;
  return null;
}

export type OrderTrackInfo = {
  order_number: string;
  status: string;
  status_display?: string;
  delivery_date?: string;
  recipient?: { name: string; phone: string; address: string; city: string };
  progress?: { step: string; timestamp: string }[];
  items?: { name: string; quantity: number; selling_price: number }[];
};

export function extractOrderTrack(output: unknown): OrderTrackInfo | null {
  const data = normalizeToolOutput(output);
  if (!data || typeof data !== "object") return null;
  const o = data as OrderTrackInfo;
  if (o.order_number && o.status) return o;
  return null;
}

export type CategoryItem = {
  name: string;
  url: string;
  children?: CategoryItem[];
};

export function extractCategories(output: unknown): CategoryItem[] {
  const data = normalizeToolOutput(output);
  if (!data || typeof data !== "object") return [];
  const cats = (data as { categories?: CategoryItem[] }).categories;
  return Array.isArray(cats) ? cats : [];
}

export type CityItem = {
  name: string;
  id?: string;
  region?: string;
  province?: string;
};

export function extractCities(output: unknown): CityItem[] {
  const data = normalizeToolOutput(output);
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  const list =
    Array.isArray(o.cities)
      ? o.cities
      : Array.isArray(o.results)
        ? o.results
        : Array.isArray(data)
          ? data
          : [];
  return (list as CityItem[]).filter((c) => c?.name);
}
