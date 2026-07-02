"use client";

import { useState } from "react";
import { Chat } from "@/components/Chat";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { LanguageMode } from "@/types/kapruka";

export default function Home() {
  const [language, setLanguage] = useState<LanguageMode>("auto");
  const [chatKey, setChatKey] = useState(0);

  return (
    <div className="relative h-dvh overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(64, 41, 112, 0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(248, 219, 8, 0.08), transparent)",
        }}
      />
      <div className="relative z-10 h-full">
        <ErrorBoundary>
          <Chat
            key={chatKey}
            language={language}
            onLanguageChange={setLanguage}
            onReset={() => setChatKey((k) => k + 1)}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
