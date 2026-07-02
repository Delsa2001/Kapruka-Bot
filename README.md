# Kapa — Kapruka AI Shopping Agent

Full-screen AI shopping assistant for the [Kapruka Agent Challenge](https://www.kapruka.com/contactUs/agentChallenge.html) — built on the **free Kapruka MCP** (search, categories, delivery, guest checkout, order tracking).

## What judges are scoring (100 pts)

| Criteria | Points | How Kapa addresses it |
|----------|--------|------------------------|
| Experience & polish | 30 | Kapruka brand UI, full-screen chat, cart drawer |
| Visual richness | 20 | Product image cards, carousels, checkout & delivery cards |
| Personality | 15 | Warm assistant voice in system prompt |
| Usefulness | 15 | Full catalog search + gift help + categories |
| End-to-end checkout | 15 | Cart → delivery → `create_order` → pay link |
| Creativity | 5 | Multilingual (EN / SI / TA / Tanglish) + intent-aware search |

**Bonus:** multi-item cart · delivery-date checks · gift messages · Tanglish · Sinhala city aliases (5,300+)

## MCP tools (all wired)

- `search_products` · `get_product` · `list_categories`
- `list_delivery_cities` · `check_delivery`
- `create_order` · `track_order`

## Features

- **Visual product cards** with images, prices, Add to cart
- **Multi-item cart** and checkout in chat
- **English, සිංහල, Tamil, Tanglish** — reply language follows the user
- **Delivery checks**, gift messages, guest **checkout pay link**
- **Order tracking** by order number
- **Multi-key Gemini** fallback on quota

## Setup

1. Gemini keys: [Google AI Studio](https://aistudio.google.com/apikey)

2. `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_1
GEMINI_API_KEY_2=your_key_2
GEMINI_MODEL=gemini-2.5-flash
```

3. Run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test

```bash
npm run test:search
node scripts/test-e2e.mjs
```

## Demo script for judges

1. **Browse:** "Browse Kapruka categories" → chips → search in a category  
2. **Shop:** "Show me chocolate under Rs. 10000" → product cards  
3. **Cart:** Add items → open cart → Checkout with Kapa  
4. **Delivery:** Colombo, date, recipient details → Kapruka pay link  
5. **Sinhala:** `අම්මට උපන්දින තෑගි — රු. 5000 ට අඩු`  
6. **Tanglish:** `Birthday ku chocolate venum — Rs. 10000 ku keela`  
7. **Track:** "Track my order" (with order number)

## Stack

Next.js 16 · Tailwind · Framer Motion · Vercel AI SDK · Gemini 2.5 Flash · Kapruka MCP
