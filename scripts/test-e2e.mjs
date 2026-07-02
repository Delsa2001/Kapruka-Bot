import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const text = readFileSync(join(root, file), "utf8");
      for (const line of text.split("\n")) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
      }
    } catch {
      /* ignore */
    }
  }
}

loadEnv();

const keys = [];
if (process.env.GOOGLE_GENERATIVE_AI_API_KEYS) {
  keys.push(
    ...process.env.GOOGLE_GENERATIVE_AI_API_KEYS.split(",").map((k) => k.trim()).filter(Boolean)
  );
}
for (const name of ["GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY"]) {
  if (process.env[name]) keys.push(process.env[name].trim());
}
for (let i = 2; i <= 50; i++) {
  const k = process.env[`GEMINI_API_KEY_${i}`];
  if (k?.trim()) keys.push(k.trim());
}
const unique = [...new Set(keys)].filter((k) => k.startsWith("AIza"));

console.log(`Keys loaded: ${unique.length}`);

const body = JSON.stringify({
  messages: [
    {
      id: "test-1",
      role: "user",
      parts: [{ type: "text", text: "Search chocolate gifts under 10000 rupees" }],
    },
  ],
  cart: [],
  language: "auto",
});

const res = await fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body,
});

console.log(`Chat HTTP: ${res.status} ${res.statusText}`);

const text = await res.text();
const hasError = /error|quota|429/i.test(text);
const hasText = text.includes("text-delta") || text.includes('"type":"text"');
const hasTool = text.includes("search_products") || text.includes("tool-");

console.log(`Stream length: ${text.length} chars`);
console.log(`Has assistant text: ${hasText}`);
console.log(`Has tool activity: ${hasTool}`);
console.log(`Has error markers: ${hasError}`);

if (res.status !== 200) {
  console.log("FAIL: non-200 response");
  console.log(text.slice(0, 500));
  process.exit(1);
}

if (hasError && !hasText) {
  console.log("FAIL: stream looks like error only");
  console.log(text.slice(0, 800));
  process.exit(1);
}

console.log("PASS: Chat API returned a successful stream");
process.exit(0);
