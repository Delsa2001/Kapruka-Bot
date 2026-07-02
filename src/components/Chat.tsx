"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ShoppingCart, Sparkles, RotateCcw, X, RefreshCw, Shuffle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "./CartDrawer";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ToolResults } from "./ToolResults";
import { KaprukaLogo } from "./KaprukaLogo";
import { KaprukaCategoryGrid } from "./KaprukaCategoryGrid";
import { formatSimpleMarkdown } from "@/lib/format-text";
import type { ToolUIPart } from "@/lib/tool-output";
import { toUiLanguage, type LanguageMode } from "@/types/kapruka";
import { detectReplyLanguage, getLastUserMessageText } from "@/lib/message-language";
import type { UIMessage } from "ai";

function getTextFromParts(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

const TOOL_PROGRESS_LABELS: Record<string, string> = {
  search_products: "🔍 Searching Kapruka…",
  get_product: "📦 Getting product details…",
  list_categories: "📂 Loading categories…",
  list_delivery_cities: "📍 Looking up delivery cities…",
  check_delivery: "🚚 Checking delivery…",
  create_order: "🛒 Creating your order…",
  track_order: "📬 Tracking your order…",
};

function getActiveToolLabel(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") break;
    const parts = (m.parts ?? []) as ToolUIPart[];
    for (let j = parts.length - 1; j >= 0; j--) {
      const p = parts[j];
      if (p.state === "input-streaming" || p.state === "input-available") {
        const label = TOOL_PROGRESS_LABELS[p.toolName ?? ""];
        return label ?? "⏳ Thinking…";
      }
    }
  }
  return null;
}

type Props = {
  language: LanguageMode;
  onLanguageChange: (l: LanguageMode) => void;
  onReset: () => void;
};

/** Detect the best checkout prompt language from the live conversation + setting. */
function getCheckoutPrompt(messages: UIMessage[], language: LanguageMode): string {
  let lang: string = language;
  if (language === "auto") {
    const lastText = getLastUserMessageText(messages);
    const detected = detectReplyLanguage(lastText);
    if (detected === "si" || detected === "singlish") lang = "si";
    else if (detected === "ta" || detected === "tanglish") lang = "ta";
    else lang = "en";
  }
  if (lang === "si") return "මගේ cart එකෙන් checkout කරන්න. Delivery details ටික අහන්න.";
  if (lang === "ta") return "என் cart-ல் இருந்து checkout செய்ய தயார். Delivery details கேளுங்கள்.";
  return "I'm ready to checkout with my cart. Please ask me for delivery and recipient details.";
}

export function Chat({ language, onLanguageChange, onReset }: Props) {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const cartItems = useCart((s) => s.items);
  const cartHydrated = useCart((s) => s.hydrated);
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    setMounted(true);
    useCart.persist.rehydrate();
  }, []);
  const bottomRef = useRef<HTMLDivElement>(null);

  const cartRef = useRef(cartItems);
  const languageRef = useRef(language);
  useEffect(() => { cartRef.current = cartItems; }, [cartItems]);
  useEffect(() => { languageRef.current = language; }, [language]);

  // Stable transport — reads cart and language from refs at request time,
  // so cart additions never rebuild the transport mid-stream.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          cart: cartRef.current,
          language: languageRef.current,
        }),
      }),
    []
  );

  const [chatError, setChatError] = useState<string | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err) => {
      const msg = err.message ?? "Something went wrong";
      if (msg.includes("quota") || msg.includes("429") || msg.includes("All Gemini")) {
        setChatError(
          msg.includes("Gemini API keys")
            ? msg
            : "API quota hit on all keys. Restart dev server after editing .env.local, or wait a minute."
        );
      } else {
        setChatError(msg);
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";
  const activeToolLabel = isLoading ? getActiveToolLabel(messages as UIMessage[]) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setChatError(null);
    sendMessage({ text: trimmed });
    setInput("");
  };

  const uiLanguage = toUiLanguage(language);

  if (!mounted || !cartHydrated) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-kapruka-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-kapruka-purple border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="kapruka-header flex shrink-0 items-center gap-2 border-b border-kapruka-purple-muted/50 px-3 py-2.5 shadow-md sm:gap-3 sm:px-4 md:px-6">
        <KaprukaLogo height={28} />
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-white leading-tight tracking-tight sm:text-base">
            Kapruka <span className="text-kapruka-gold">Buddy</span>
          </h1>
          <p className="hidden text-[11px] text-white/70 truncate sm:block">
            Your AI shopping companion · Search · Deliver · Pay
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <label
            htmlFor="kapa-language"
            className="hidden text-[11px] font-medium text-white/80 sm:block sm:text-xs"
          >
            Language
          </label>
          <select
            id="kapa-language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageMode)}
            className="w-[72px] rounded-xl border border-white/20 bg-white/10 px-1.5 py-1.5 text-xs text-white sm:w-auto sm:px-2.5 sm:py-2"
            aria-label="Language"
          >
            <option value="auto" className="text-foreground">Auto</option>
            <option value="en" className="text-foreground">EN</option>
            <option value="si" className="text-foreground">සිංහල</option>
            <option value="ta" className="text-foreground">தமிழ்</option>
          </select>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
              aria-label="New chat"
              title="New chat"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:border-kapruka-gold/50 hover:bg-kapruka-gold/15"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-kapruka-gold text-xs font-bold text-kapruka-purple-deep">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-kapruka-surface/50 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-full flex-col items-center gap-3 py-4 sm:gap-4 sm:py-6"
          >
            {/* ── Compact hero ── */}
            <div className="w-full max-w-2xl px-3 text-center sm:px-4">
              {/* Badge inline with headline */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.25 }}
                className="mb-2 inline-flex items-center gap-2 rounded-2xl border border-kapruka-border bg-white px-3 py-1.5 shadow-sm"
              >
                <KaprukaLogo height={22} />
                <span className="rounded-full bg-kapruka-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-kapruka-purple-deep">
                  Buddy
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-xl font-black leading-snug text-kapruka-purple-deep sm:text-2xl md:text-4xl"
                lang={uiLanguage}
              >
                {uiLanguage === "si"
                  ? <>ශ්‍රී ලංකාවේ ඕනෑ දෙයක් — <span className="text-kapruka-gold">chat කරන්න.</span></>
                  : uiLanguage === "ta"
                    ? <>ஒரே chat-ல் — <span className="text-kapruka-gold">Sri Lanka shopping.</span></>
                    : <>Shop Sri Lanka — <span className="text-kapruka-gold">in one conversation.</span></>}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.25 }}
                className="mt-1 text-[11px] text-kapruka-muted sm:text-xs"
                lang={uiLanguage}
              >
                {uiLanguage === "si"
                  ? "Search · Deliver · Checkout — සිංහල · English · Singlish"
                  : uiLanguage === "ta"
                    ? "Search · Deliver · Checkout — தமிழ் · English · Tanglish"
                    : "Search · Deliver · Checkout — English · සිංහල · தமிழ் · Tanglish"}
              </motion.p>

              {/* Feature pills — single scrollable row, never wraps */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22, duration: 0.25 }}
                className="mt-2 flex items-center justify-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin"
              >
                {[
                  { icon: "🔍", label: "Search anything" },
                  { icon: "🛒", label: "Groceries & more" },
                  { icon: "🚚", label: "Deliver island-wide" },
                  { icon: "💳", label: "Pay in 60 sec" },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-kapruka-border bg-white px-2.5 py-1 text-[10px] font-medium text-kapruka-purple shadow-sm sm:text-[11px]"
                  >
                    <span>{f.icon}</span>
                    {f.label}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* ── Quick-start prompts — everyday + gifting balanced ── */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.25 }}
              className="w-full max-w-2xl px-3 sm:px-4"
            >
              <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-kapruka-muted sm:text-[11px]">
                ✨ What are you shopping for?
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin justify-center">
                {(
                  uiLanguage === "si"
                    ? [
                        { label: "🛒 Groceries", q: "මට සතියේ groceries ටික hoyanna" },
                        { label: "📱 Electronics", q: "Kapruka electronics section ekata yanna" },
                        { label: "👗 Fashion", q: "Women's fashion ekata yanna" },
                        { label: "🎁 Gift ekak", q: "Rs. 3000 budget ekakin gift ekak hoyanna" },
                        { label: "🎂 Cake ekak", q: "Colombo deliver karanna cake ekak hoyanna" },
                      ]
                    : uiLanguage === "ta"
                      ? [
                          { label: "🛒 Groceries", q: "வாரத்திற்கான groceries காட்டுங்கள்" },
                          { label: "📱 Electronics", q: "Electronics section காட்டுங்கள்" },
                          { label: "👗 Fashion", q: "Women's fashion காட்டுங்கள்" },
                          { label: "🎁 Gift venum", q: "Rs. 3000 budget-la gift venum" },
                          { label: "🎂 Cake venum", q: "Colombo-ku deliver agum cake venum" },
                        ]
                      : [
                          { label: "🛒 Groceries", q: "Show me groceries I can order this week" },
                          { label: "📱 Electronics", q: "Browse Kapruka electronics" },
                          { label: "👗 Fashion", q: "Show me women's fashion" },
                          { label: "🎁 Send a gift", q: "Find me a great gift under Rs. 3,000" },
                          { label: "🎂 Order a cake", q: "I want to order a cake with delivery" },
                        ]
                ).map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => submit(b.q)}
                    className="shrink-0 rounded-full border-2 border-kapruka-border bg-white px-3 py-1.5 text-xs font-semibold text-kapruka-purple-deep transition hover:border-kapruka-purple hover:bg-kapruka-surface active:scale-[0.97]"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── Category Grid — always visible ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="w-full"
            >
              <KaprukaCategoryGrid
                language={uiLanguage}
                onSelect={(q) => submit(q)}
              />
            </motion.div>

            {/* ── Suggested Prompts + Surprise in one compact row ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="w-full pb-2"
            >
              <SuggestedPrompts language={language} onSelect={(t) => submit(t)} />

              <div className="mt-3 flex justify-center">
                <motion.button
                  type="button"
                  animate={{ boxShadow: ["0 0 0px rgba(248,219,8,0)", "0 0 16px rgba(248,219,8,0.45)", "0 0 0px rgba(248,219,8,0)"] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  onClick={() => {
                    const prompts = [
                      "My boss is coming for dinner tonight — help me look impressive 😬",
                      "I need a gift that says 'sorry' without being too obvious",
                      "It's raining outside. Send me something comforting.",
                      "I want to send amma flowers but I forgot her birthday 3 days ago 😅",
                      "Help me build a romantic movie night at home",
                      "I need a gift under Rs. 2,000 that doesn't look cheap",
                      "What's the most popular thing on Kapruka right now?",
                      "I'm bored — show me something I wouldn't normally buy",
                      "My friend just had a baby — what do I get?",
                      "I want to treat myself to something nice, budget Rs. 3,000",
                    ];
                    submit(prompts[Math.floor(Math.random() * prompts.length)]);
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-kapruka-gold/40 bg-white px-4 py-2 text-sm font-bold text-kapruka-purple shadow-md transition hover:border-kapruka-gold hover:bg-kapruka-gold/5"
                >
                  <Shuffle className="h-3.5 w-3.5 text-kapruka-gold" />
                  Surprise me
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const parts = (m.parts ?? []) as ToolUIPart[];
                const text = getTextFromParts(parts);
                const isUser = m.role === "user";

                return (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-kapruka-purple mt-1">
                        <Sparkles className="h-4 w-4 text-kapruka-gold" />
                      </div>
                    )}
                    <div
                      className={`min-w-0 flex-1 ${isUser ? "flex justify-end" : ""}`}
                    >
                      {text && (
                        <div
                          className={`inline-block max-w-[92%] rounded-2xl px-3 py-2.5 sm:max-w-[95%] sm:px-4 sm:py-3 ${
                            isUser
                              ? "bg-kapruka-purple/10 text-foreground border border-kapruka-purple/20"
                              : "bg-white text-foreground border border-kapruka-border shadow-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {formatSimpleMarkdown(text)}
                          </p>
                        </div>
                      )}
                      {!isUser && (
                        <div className="max-w-full">
                          <ToolResults
                            parts={parts}
                            onCategorySelect={(t) => submit(t)}
                            onCitySelect={(t) => submit(t)}
                          />
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {isLoading && (
              <li className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-kapruka-purple">
                  <Sparkles className="h-4 w-4 text-kapruka-gold" />
                </div>
                <div className="rounded-2xl border border-kapruka-border bg-white px-4 py-4 shadow-sm">
                  {activeToolLabel ? (
                    <p className="text-sm text-kapruka-purple font-medium animate-pulse">
                      {activeToolLabel}
                    </p>
                  ) : (
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-kapruka-purple [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-kapruka-purple [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-kapruka-purple [animation-delay:300ms]" />
                    </div>
                  )}
                </div>
              </li>
            )}
            <div ref={bottomRef} />
          </ul>
        )}
      </main>

      {chatError && (
        <div className="mx-4 mb-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 md:mx-6">
          <div className="flex items-start gap-3">
            <p className="flex-1 text-sm text-red-800">{chatError}</p>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const lastText = getLastUserMessageText(messages as UIMessage[]);
                  if (lastText) {
                    setChatError(null);
                    sendMessage({ text: lastText });
                  }
                }}
                className="flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
              <button
                type="button"
                onClick={() => setChatError(null)}
                className="rounded-lg p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        className="shrink-0 border-t border-kapruka-border bg-white px-3 py-3 shadow-[0_-4px_20px_rgba(64,41,112,0.06)] sm:p-4 md:px-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              uiLanguage === "si"
                ? "මොනවා හොයන්නද? සිංහල / English / Tanglish"
                : uiLanguage === "ta"
                  ? "என்ன வேணும்? தமிழ் / English / Tanglish"
                  : "What do you need? EN / සිංහල / தமிழ் / Tanglish"
            }
            className="flex-1 rounded-2xl border border-kapruka-border bg-kapruka-surface px-3 py-3 text-sm text-foreground placeholder:text-kapruka-muted focus:border-kapruka-purple/50 focus:outline-none focus:ring-2 focus:ring-kapruka-purple/15 sm:px-4 sm:py-3.5"
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-kapruka-gold text-kapruka-purple-deep transition hover:bg-kapruka-gold/90 disabled:opacity-40 shadow-sm sm:h-12 sm:w-12"
            aria-label="Send"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </form>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          submit(getCheckoutPrompt(messages as UIMessage[], language));
        }}
      />
    </div>
  );
}
