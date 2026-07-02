export type Money = {
  amount: number | null;
  currency: string;
};

export type ProductSummary = {
  id: string;
  name: string;
  summary: string;
  price: Money;
  compare_at_price?: Money | null;
  in_stock: boolean;
  stock_level: string;
  image_url: string | null;
  category: { id: string; name: string; slug: string };
  url: string;
};

export type SearchResult = {
  results: ProductSummary[];
  next_cursor: string | null;
};

export type CartItem = {
  product_id: string;
  name: string;
  image_url: string | null;
  price: number;
  currency: string;
  quantity: number;
  icing_text?: string;
};

export type CheckoutResult = {
  checkout_url: string;
  order_ref: string;
  summary: {
    items_total: number;
    delivery_fee: number;
    addons_total: number;
    grand_total: number;
    currency: string;
  };
  expires_at: string;
};

export type LanguageMode = "en" | "si" | "ta" | "auto";

/** UI copy language — drives category labels and suggested prompts. */
export type UiLanguage = "en" | "si" | "ta";

export function toUiLanguage(mode: LanguageMode): UiLanguage {
  if (mode === "si") return "si";
  if (mode === "ta") return "ta";
  return "en";
}
