"use client";

import { Truck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatLkr } from "@/lib/format";
import type { DeliveryInfo } from "@/lib/tool-output";

type Props = { delivery: DeliveryInfo };

export function DeliveryCard({ delivery }: Props) {
  const ok = delivery.available;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        ok
          ? "border-emerald-200 bg-emerald-50"
          : "border-kapruka-gold/50 bg-kapruka-gold/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <Truck className={`h-5 w-5 shrink-0 ${ok ? "text-emerald-600" : "text-kapruka-purple"}`} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{delivery.city}</p>
          {delivery.checked_date && (
            <p className="text-xs text-kapruka-muted mt-0.5">
              Delivery date: {delivery.checked_date}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {ok ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 text-kapruka-purple" />
            )}
            <span className={`text-sm ${ok ? "text-emerald-700" : "text-kapruka-purple"}`}>
              {ok ? "Delivery available" : "Not available on this date"}
            </span>
          </div>
          {ok && delivery.rate != null && (
            <p className="mt-2 text-sm text-foreground">
              Flat delivery rate: <span className="font-bold text-kapruka-purple">{formatLkr(delivery.rate)}</span>
            </p>
          )}
          {!ok && delivery.next_available_date && (
            <p className="mt-1 text-xs text-kapruka-muted">
              Next available: {delivery.next_available_date}
            </p>
          )}
          {!ok && delivery.reason && (
            <p className="mt-1 text-xs text-kapruka-muted">{delivery.reason}</p>
          )}
          {delivery.perishable_warning && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-kapruka-gold/20 px-3 py-2 text-xs text-kapruka-purple-deep">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {delivery.perishable_warning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
