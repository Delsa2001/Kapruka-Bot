"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Minus, Plus, Trash2, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatLkr } from "@/lib/format";
import { KaprukaLogo } from "./KaprukaLogo";

type Props = {
  open: boolean;
  onClose: () => void;
  onCheckout?: () => void;
};

export function CartDrawer({ open, onClose, onCheckout }: Props) {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const total = useCart((s) => s.total);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-kapruka-purple-deep/40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-kapruka-border bg-white shadow-2xl sm:max-w-sm md:max-w-md"
          >
            <header className="kapruka-header flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <KaprukaLogo height={28} />
                <h2 className="text-lg font-bold text-white">Your cart</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4 bg-kapruka-surface/30">
              {items.length === 0 ? (
                <p className="text-center text-sm text-kapruka-muted py-12">
                  Your cart is empty. Ask Kapruka Buddy to search products or browse categories.
                </p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.product_id}
                      className="flex gap-3 rounded-xl border border-kapruka-border bg-white p-3 shadow-sm"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-kapruka-surface">
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm font-bold text-kapruka-purple">
                          {formatLkr(item.price * item.quantity)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                            className="rounded-md bg-kapruka-surface p-1 text-kapruka-purple"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity + 1)
                            }
                            className="rounded-md bg-kapruka-surface p-1 text-kapruka-purple"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id)}
                            className="ml-auto text-kapruka-muted hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {items.length > 0 && (
              <footer className="border-t border-kapruka-border bg-white px-5 py-4">
                <p className="mb-3 flex justify-between text-sm">
                  <span className="text-kapruka-muted">Total</span>
                  <span className="text-xl font-bold text-kapruka-purple">
                    {formatLkr(total())}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={onCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-kapruka-gold py-3.5 text-sm font-bold text-kapruka-purple-deep transition hover:bg-kapruka-gold/90"
                >
                  <CreditCard className="h-4 w-4" />
                  Start Checkout
                </button>
                <p className="mt-2 text-center text-xs text-kapruka-muted">
                  Kapruka Buddy will ask for delivery city, date, and recipient details
                </p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
