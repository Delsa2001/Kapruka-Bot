"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { formatLkr } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import type { ProductSummary } from "@/types/kapruka";

type Props = {
  product: ProductSummary;
};

export function ProductCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);
  const cartItem = items.find((i) => i.product_id === product.id);
  const inCart = !!cartItem;
  const cartQty = cartItem?.quantity ?? 0;
  const price = product.price?.amount ?? 0;
  const currency = product.price?.currency ?? "LKR";
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article className="flex w-[160px] shrink-0 flex-col overflow-hidden rounded-2xl border border-kapruka-border bg-white shadow-md shadow-kapruka-purple/5 sm:w-[200px] md:w-[220px]">
      <div className="relative aspect-[4/5] overflow-hidden bg-kapruka-surface">
        {!imgLoaded && product.image_url && (
          <div className="absolute inset-0 animate-pulse bg-kapruka-surface" />
        )}
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="220px"
            unoptimized
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-kapruka-muted text-sm">
            No image
          </div>
        )}
        {!product.in_stock && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
        {product.category?.name && (
          <span className="absolute left-2 top-2 rounded-full bg-kapruka-purple/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="text-base font-bold text-kapruka-purple">{formatLkr(price)}</p>
        <motion.button
          type="button"
          disabled={!product.in_stock}
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            addItem({
              product_id: product.id,
              name: product.name,
              image_url: product.image_url,
              price,
              currency,
            })
          }
          className={`mt-auto flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            inCart
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-kapruka-gold text-kapruka-purple-deep hover:bg-kapruka-gold/90"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {inCart ? (
            <>
              <Check className="h-4 w-4" />
              In cart{cartQty > 1 ? ` · ${cartQty}` : ""}
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              Add to cart
            </>
          )}
        </motion.button>
      </div>
    </article>
  );
}
