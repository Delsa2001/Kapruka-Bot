"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLink, ShoppingBag, Check } from "lucide-react";
import { formatLkr } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import type { ProductSummary } from "@/types/kapruka";

type Props = { product: ProductSummary };

export function ProductDetailCard({ product }: Props) {
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);
  const cartItem = items.find((i) => i.product_id === product.id);
  const inCart = !!cartItem;
  const cartQty = cartItem?.quantity ?? 0;
  const price = product.price?.amount ?? 0;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-kapruka-border bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-square w-full sm:w-48 shrink-0 overflow-hidden bg-kapruka-surface">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-kapruka-surface" />
          )}
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
              onLoad={() => setImgLoaded(true)}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="text-lg font-bold text-foreground leading-snug">{product.name}</h3>
          {product.summary && (
            <p className="line-clamp-3 text-xs text-kapruka-muted">{product.summary}</p>
          )}
          <p className="text-xl font-bold text-kapruka-purple">{formatLkr(price)}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!product.in_stock}
              onClick={() =>
                addItem({
                  product_id: product.id,
                  name: product.name,
                  image_url: product.image_url,
                  price,
                  currency: product.price?.currency ?? "LKR",
                })
              }
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-40 ${
                inCart
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-kapruka-gold text-kapruka-purple-deep hover:bg-kapruka-gold/90"
              }`}
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
            </button>
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-kapruka-purple/30 px-4 py-2.5 text-sm text-kapruka-purple hover:bg-kapruka-purple/5"
              >
                View on Kapruka
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
