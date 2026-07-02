/**
 * Fetches all Kapruka deliverable cities + aliases via MCP.
 * Run: node scripts/fetch-kapruka-cities.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src/data/kapruka-delivery-cities.json");

// Keep under ~40 calls/min (Kapruka MCP free tier)
const QUERIES = [
  "",
  "a",
  "b",
  "c",
  "d",
  "e",
  "g",
  "h",
  "k",
  "m",
  "n",
  "p",
  "r",
  "s",
  "t",
  "w",
  "col",
  "kan",
  "gal",
  "mat",
  "neg",
  "kur",
  "anu",
  "bad",
  "ham",
  "bat",
  "tri",
  "mor",
  "deh",
  "pan",
  "gam",
  "keg",
  "nuw",
  "wel",
  "hom",
  "mah",
  "min",
  "mir",
  "mon",
  "pit",
  "vav",
  "pol",
  "put",
  "emb",
  "jam",
];

function parseResult(result) {
  const text = result.content?.find((p) => p.type === "text")?.text;
  if (text) return JSON.parse(text);
  if (result.structuredContent) return result.structuredContent;
  throw new Error("No JSON in MCP result");
}

const client = new Client({ name: "kapa-city-fetch", version: "1.0.0" });
await client.connect(
  new StreamableHTTPClientTransport(new URL("https://mcp.kapruka.com/mcp"))
);

const byName = new Map();

for (const query of QUERIES) {
  try {
    const result = await client.callTool(
      {
        name: "kapruka_list_delivery_cities",
        arguments: {
          params: { query: query || null, limit: 50, response_format: "json" },
        },
      },
      CallToolResultSchema
    );
    const data = parseResult(result);
    for (const city of data.cities ?? []) {
      byName.set(city.name, city);
    }
  } catch (e) {
    console.warn("query failed:", query, e.message);
  }
}

const cities = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(outPath, JSON.stringify({ cities, total: cities.length }, null, 2));
console.log(`Wrote ${cities.length} cities to ${outPath}`);
