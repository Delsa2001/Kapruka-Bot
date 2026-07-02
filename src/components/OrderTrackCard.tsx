"use client";

import { Package, MapPin } from "lucide-react";
import { formatLkr } from "@/lib/format";
import type { OrderTrackInfo } from "@/lib/tool-output";

type Props = { order: OrderTrackInfo };

export function OrderTrackCard({ order }: Props) {
  return (
    <div className="rounded-2xl border border-kapruka-purple/20 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-5 w-5 text-kapruka-purple" />
        <span className="font-semibold text-foreground">Order {order.order_number}</span>
      </div>
      <p className="text-lg font-bold text-kapruka-purple">
        {order.status_display ?? order.status}
      </p>
      {order.delivery_date && (
        <p className="text-sm text-kapruka-muted mt-1">Delivery: {order.delivery_date}</p>
      )}
      {order.recipient && (
        <div className="mt-3 flex items-start gap-2 text-sm text-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-kapruka-muted mt-0.5" />
          <div>
            <p className="font-medium">{order.recipient.name}</p>
            <p className="text-kapruka-muted">{order.recipient.address}, {order.recipient.city}</p>
          </div>
        </div>
      )}
      {order.progress && order.progress.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-kapruka-border pt-3">
          {order.progress.map((step, i) => (
            <li key={i} className="flex justify-between text-xs">
              <span className="text-foreground">{step.step}</span>
              <span className="text-kapruka-muted">{step.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
      {order.items && order.items.length > 0 && (
        <ul className="mt-3 space-y-1">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm text-kapruka-muted">
              <span>{item.name} ×{item.quantity}</span>
              <span>{formatLkr(item.selling_price)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
