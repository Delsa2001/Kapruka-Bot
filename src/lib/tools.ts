import { tool } from "ai";
import { z } from "zod";
import { callKaprukaTool, parseKaprukaJson } from "@/lib/kapruka-mcp";
import { fallbackSearchQuery } from "@/lib/search-query";

export const kaprukaTools = {
  search_products: tool({
    description:
      "Search the full Kapruka catalog (gifts, groceries, electronics, flowers, cakes, etc.). Pass the user's request as q in any language; system sends English to Kapruka. Set max_price/min_price from budget (e.g. Rs. 5000).",
    inputSchema: z.object({
      q: z.string().min(3),
      category: z.string().optional(),
      limit: z.number().min(1).max(20).optional(),
      min_price: z.number().optional(),
      max_price: z.number().optional(),
      in_stock_only: z.boolean().optional(),
      sort: z
        .enum(["relevance", "price_asc", "price_desc", "newest", "bestseller"])
        .optional(),
    }),
    execute: async (input) => {
      let raw = await callKaprukaTool("kapruka_search_products", input);
      let parsed = parseKaprukaJson<{ results?: unknown[] }>(raw);
      if (!parsed.results?.length) {
        const q = typeof input.q === "string" ? input.q : "";
        raw = await callKaprukaTool("kapruka_search_products", {
          ...input,
          q: fallbackSearchQuery(q),
        });
        parsed = parseKaprukaJson(raw);
      }
      return parsed;
    },
  }),

  get_product: tool({
    description: "Get full details for one product by Kapruka product_id.",
    inputSchema: z.object({
      product_id: z.string().min(3),
    }),
    execute: async (input) => {
      const raw = await callKaprukaTool("kapruka_get_product", input);
      return parseKaprukaJson(raw);
    },
  }),

  list_categories: tool({
    description: "List Kapruka top-level categories.",
    inputSchema: z.object({
      depth: z.number().min(1).max(2).optional(),
    }),
    execute: async (input) => {
      const raw = await callKaprukaTool("kapruka_list_categories", input);
      return parseKaprukaJson(raw);
    },
  }),

  list_delivery_cities: tool({
    description:
      "Search deliverable cities. Pass city name in any language (Colombo, කොළඹ, கொழும்பு) — auto-translated to English for Kapruka.",
    inputSchema: z.object({
      query: z.string().min(2),
      limit: z.number().min(1).max(50).optional(),
    }),
    execute: async (input) => {
      const raw = await callKaprukaTool("kapruka_list_delivery_cities", input);
      return parseKaprukaJson(raw);
    },
  }),

  check_delivery: tool({
    description:
      "Check delivery availability and LKR rate for a city on a date (YYYY-MM-DD). City name in any language.",
    inputSchema: z.object({
      city: z.string().min(2),
      delivery_date: z.string().optional(),
      product_id: z.string().optional(),
    }),
    execute: async (input) => {
      const raw = await callKaprukaTool("kapruka_check_delivery", input);
      return parseKaprukaJson(raw);
    },
  }),

  create_order: tool({
    description:
      "Create guest checkout order and return pay link. Requires full cart + recipient + delivery + sender.",
    inputSchema: z.object({
      cart: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().min(1).max(99).optional(),
          icing_text: z.string().max(120).optional(),
        })
      ),
      recipient: z.object({
        name: z.string(),
        phone: z.string(),
      }),
      delivery: z.object({
        address: z.string(),
        city: z.string(),
        date: z.string(),
        location_type: z.string().optional(),
        instructions: z.string().optional(),
      }),
      sender: z.object({
        name: z.string(),
        anonymous: z.boolean().optional(),
      }),
      gift_message: z.string().max(300).optional(),
    }),
    execute: async (input) => {
      const raw = await callKaprukaTool("kapruka_create_order", input);
      return parseKaprukaJson(raw);
    },
  }),

  track_order: tool({
    description:
      "Track a paid Kapruka order by order number from confirmation email.",
    inputSchema: z.object({
      order_number: z.string().min(4),
    }),
    execute: async (input) => {
      const raw = await callKaprukaTool("kapruka_track_order", input);
      return parseKaprukaJson(raw);
    },
  }),
};
