"use client";

import { motion } from "framer-motion";
import type { ProductSummary } from "@/types/kapruka";
import { ProductCard } from "./ProductCard";

type Props = {
  products: ProductSummary[];
};

export function ProductCarousel({ products }: Props) {
  if (!products.length) return null;

  return (
    <div className="-mx-1">
      <p className="kapruka-section-title mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-kapruka-purple">
        {products.length} {products.length === 1 ? "product" : "products"} found
      </p>
      {/* -mx-1 + px-1 keeps cards flush on mobile while preserving scroll edge padding */}
      <div className="flex gap-2.5 overflow-x-auto pb-3 pl-1 pt-1 scrollbar-thin snap-x snap-mandatory sm:gap-3">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="snap-start"
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
        {/* spacer keeps last card from sticking to edge on iOS */}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
    </div>
  );
}
