"use client";

import { MapPin } from "lucide-react";
import type { CityItem } from "@/lib/tool-output";

type Props = {
  cities: CityItem[];
  onSelect?: (city: string) => void;
};

export function CitiesCard({ cities, onSelect }: Props) {
  if (!cities.length) return null;
  return (
    <div className="rounded-2xl border border-kapruka-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-kapruka-purple" />
        <p className="text-xs font-semibold uppercase tracking-wide text-kapruka-purple">
          Delivery cities — tap to select
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cities.map((c) => (
          <button
            key={c.id ?? c.name}
            type="button"
            onClick={() => onSelect?.(c.name)}
            className="rounded-full bg-kapruka-surface px-3 py-1 text-xs font-medium text-foreground border border-kapruka-border transition hover:border-kapruka-purple/40 hover:bg-kapruka-purple/5 active:scale-[0.97]"
          >
            {c.name}
            {c.province && (
              <span className="ml-1 text-kapruka-muted">· {c.province}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
