"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  getCategoryDisplay,
  getCategorySectionTitle,
  KAPRUKA_HOME_CATEGORIES,
} from "@/data/kapruka-home-categories";
import type { UiLanguage } from "@/types/kapruka";

type Props = {
  onSelect: (searchQuery: string) => void;
  language?: UiLanguage;
};

export function KaprukaCategoryGrid({ onSelect, language = "en" }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto px-1">
      <p
        className="kapruka-section-title mb-3 text-center text-xs font-semibold uppercase tracking-wide text-kapruka-purple"
        lang={language}
      >
        {getCategorySectionTitle(language)}
      </p>
      <div className="grid grid-cols-5 gap-x-0.5 gap-y-2 xs:gap-x-1 sm:grid-cols-8 sm:gap-x-1 sm:gap-y-3 md:grid-cols-10">
        {KAPRUKA_HOME_CATEGORIES.map((cat, i) => {
          const fullLabel = getCategoryDisplay(cat, language, false);
          const shortLabel = getCategoryDisplay(cat, language, true);

          return (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.25 }}
              onClick={() => onSelect(cat.searchQuery)}
              className="group flex flex-col items-center gap-1 rounded-lg p-0.5 transition active:scale-95 hover:bg-kapruka-purple/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kapruka-purple/30"
              aria-label={fullLabel}
              title={fullLabel}
            >
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0f0f0] sm:h-[56px] sm:w-[56px] md:h-[60px] md:w-[60px]">
                <Image
                  src={cat.image}
                  alt=""
                  width={60}
                  height={60}
                  className="h-full w-full rounded-full object-cover"
                  unoptimized
                />
              </span>
              <span
                className="line-clamp-2 w-full max-w-[60px] text-center text-[9px] leading-tight text-foreground group-hover:text-kapruka-purple sm:max-w-[72px] sm:text-[10px] md:text-[11px]"
                lang={language}
              >
                <span className="hidden sm:inline">{fullLabel}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
