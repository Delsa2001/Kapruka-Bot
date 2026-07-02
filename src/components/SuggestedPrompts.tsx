"use client";

import { toUiLanguage, type LanguageMode } from "@/types/kapruka";

type Props = {
  onSelect: (text: string) => void;
  language: LanguageMode;
};

/** Auto — mix of real-life scenarios across languages and shopping modes */
const PROMPTS_AUTO = [
  "I forgot amma's birthday — it's tomorrow 😬",
  "I want to treat myself to something nice",
  "අම්මට උපන්දින තෑගි — රු. 5000 ට අඩු",
  "Girlfriend eke birthday — chocolate ekak hoyanna machan",
  "அம்மாவுக்கு பிறந்தநாள் பரிசு வேணும்",
  "Birthday ku cake venum — Colombo ku deliver panna mudiyuma?",
];

const PROMPTS_EN = [
  "I forgot amma's birthday — it's tomorrow 😬",
  "I want to treat myself to something nice",
  "My girlfriend's birthday is this week — help me find something",
  "Show me what's trending on Kapruka",
  "I need groceries delivered to Colombo",
  "Track my Kapruka order",
];

const PROMPTS_SI = [
  "අම්මගේ birthday හෙට — gift ekak urgently",
  "මට ලස්සන දෙයක් gift කර ගන්න ඕනේ",
  "Girlfriend ට birthday gift — budget Rs. 5000",
  "Colombo ට groceries deliver කරන්න පුළුවන්ද?",
  "Kapruka categories පෙන්වන්න",
  "මගේ order track කරන්න",
];

const PROMPTS_TA = [
  "அம்மாவுக்கு birthday நாளை — urgently பரிசு வேணும்",
  "என்னையே treat பண்ணிக்கணும் — என்ன வாங்கலாம்?",
  "Girlfriend-கு birthday gift — budget Rs. 5000",
  "நாளை Colombo-வுக்கு deliver பண்ண முடியுமா?",
  "Kapruka categories காட்டு",
  "என் order track பண்ண",
];

function getPrompts(language: LanguageMode): string[] {
  if (language === "auto") return PROMPTS_AUTO;
  const ui = toUiLanguage(language);
  if (ui === "si") return PROMPTS_SI;
  if (ui === "ta") return PROMPTS_TA;
  return PROMPTS_EN;
}

export function SuggestedPrompts({ onSelect, language }: Props) {
  const prompts = getPrompts(language);
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto px-2">
      {prompts.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onSelect(p)}
          className="rounded-full border border-kapruka-purple/20 bg-white px-4 py-2.5 text-sm text-foreground shadow-sm transition hover:border-kapruka-purple/40 hover:bg-kapruka-purple/5 active:scale-[0.98]"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
