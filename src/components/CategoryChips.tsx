"use client";

import type { CategoryItem } from "@/lib/tool-output";

type Props = {
  categories: CategoryItem[];
  onSelect?: (name: string) => void;
};

export function CategoryChips({ categories, onSelect }: Props) {
  const top = categories.slice(0, 12);

  return (
    <div>
      <p className="kapruka-section-title mb-2 text-xs font-semibold uppercase tracking-wide text-kapruka-purple">
        Browse categories
      </p>
      <div className="flex flex-wrap gap-2">
        {top.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelect?.(`Show me products in ${cat.name}`)}
            className="rounded-full border border-kapruka-purple/20 bg-white px-3 py-1.5 text-sm text-foreground transition hover:border-kapruka-purple/40 hover:bg-kapruka-purple/5"
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
