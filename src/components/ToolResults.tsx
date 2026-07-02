"use client";

import type { ReactNode } from "react";
import {
  collectToolOutputs,
  extractCategories,
  extractCheckout,
  extractCities,
  extractDelivery,
  extractOrderTrack,
  extractProducts,
  type ToolUIPart,
} from "@/lib/tool-output";
import { ProductCarousel } from "./ProductCarousel";
import { PayLinkCard } from "./PayLinkCard";
import { DeliveryCard } from "./DeliveryCard";
import { OrderTrackCard } from "./OrderTrackCard";
import { ProductDetailCard } from "./ProductDetailCard";
import { CategoryChips } from "./CategoryChips";
import { CitiesCard } from "./CitiesCard";

type Props = {
  parts: ToolUIPart[];
  onCategorySelect?: (name: string) => void;
  onCitySelect?: (city: string) => void;
};

export function ToolResults({ parts, onCategorySelect, onCitySelect }: Props) {
  const blocks: ReactNode[] = [];
  const toolResults = collectToolOutputs(parts);

  for (const { name, output } of toolResults) {
    const products = extractProducts(output);
    if (
      products.length > 0 &&
      (name === "search_products" || name.includes("search") || name === "get_product" || name.includes("get_product"))
    ) {
      if (products.length === 1 && name.includes("get_product")) {
        blocks.push(
          <ProductDetailCard key={`detail-${blocks.length}`} product={products[0]} />
        );
      } else {
        blocks.push(
          <ProductCarousel key={`search-${blocks.length}`} products={products} />
        );
      }
      continue;
    }

    const checkout = extractCheckout(output);
    if (checkout && name.includes("create_order")) {
      blocks.push(<PayLinkCard key={`pay-${blocks.length}`} checkout={checkout} />);
      continue;
    }

    const delivery = extractDelivery(output);
    if (delivery && name.includes("check_delivery")) {
      blocks.push(<DeliveryCard key={`delivery-${blocks.length}`} delivery={delivery} />);
      continue;
    }

    const order = extractOrderTrack(output);
    if (order && name.includes("track_order")) {
      blocks.push(<OrderTrackCard key={`track-${blocks.length}`} order={order} />);
      continue;
    }

    const categories = extractCategories(output);
    if (categories.length > 0 && name.includes("list_categories")) {
      blocks.push(
        <CategoryChips
          key={`cats-${blocks.length}`}
          categories={categories}
          onSelect={onCategorySelect}
        />
      );
      continue;
    }

    const cities = extractCities(output);
    if (cities.length > 0 && name.includes("list_delivery_cities")) {
      blocks.push(
        <CitiesCard
          key={`cities-${blocks.length}`}
          cities={cities}
          onSelect={(city) => onCitySelect?.(`Deliver to ${city}`)}
        />
      );
    }
  }

  if (!blocks.length) return null;
  return <div className="mt-4 space-y-4">{blocks}</div>;
}
