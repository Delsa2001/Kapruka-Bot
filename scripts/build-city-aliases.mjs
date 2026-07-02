/**
 * Builds src/data/city-aliases.json from Kapruka cities + Sri Lanka trilingual DB.
 * Requires: src/data/sri-lanka-cities.json (from SKIDDOW/SriLankaCitiesDatabase)
 * Run: node scripts/build-city-aliases.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const slPath = join(root, "src/data/sri-lanka-cities.json");
const kaprukaPath = join(root, "src/data/kapruka-delivery-cities.json");
const outPath = join(root, "src/data/city-aliases.json");

/** @type {Record<string, string>} */
const MANUAL_KAPRUKA_TO_SL = {
  Hambanthota: "Hambantota",
  Akkareipathuwa: "Akkaraipattu",
  Kilinochchiya: "Kilinochchi",
  Thangalle: "Tangalle",
  Tissamaharamaya: "Tissamaharama",
  Rathnapura: "Ratnapura",
  Bangadeniya: "Bentota",
  Benthota: "Bentota",
  Chillaw: "Chilaw",
  Dvulapitiya: "Divulapitiya",
  Gothatuwa: "Gothatuwa",
  Hokandara: "Hokandara",
  "Ja-Ela": "Ja Ela",
  "Ja Ela": "Ja Ela",
  Kanthale: "Kantale",
  Kochchikade: "Kochchikade",
  Koswatha: "Koswatta",
  Madampe: "Madampe",
  Makandura: "Makandura",
  Mattegoda: "Mattegoda",
  Medamahanuwara: "Medamahanuwara",
  Moragollagama: "Moragollagama",
  Panchikawatte: "Panchikawatta",
  Polgasovita: "Polgasowita",
  Polgasowita: "Polgasowita",
  Polhengoda: "Polhengoda",
  Rikillagskada: "Rikillagaskada",
  Siyabalaanduwa: "Siyambalanduwa",
  Thambuthegama: "Tambuttegama",
  kahawatta: "Kahawatta",
  "Mount Lavinia": "Mount Lavinia",
};

function norm(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

function addAlias(map, alias, canonical) {
  if (!alias || alias === "NULL" || alias.length < 2) return;
  const key = alias.trim();
  if (!key) return;
  map[key] = canonical;
  const n = norm(key);
  if (n.length >= 2) map[n] = canonical;
}

function stripSuffixes(text) {
  return text
    .replace(/ට$/u, "")
    .replace(/ටින්$/u, "")
    .replace(/වලට$/u, "")
    .replace(/ලට$/u, "")
    .replace(/க்கு$/u, "")
    .replace(/க்கூ$/u, "")
    .replace(/இல்$/u, "")
    .replace(/இன்$/u, "")
    .replace(/\s+(city|town)$/i, "")
    .trim();
}

if (!existsSync(slPath)) {
  console.error(
    "Missing src/data/sri-lanka-cities.json — download from:\n" +
      "https://github.com/SKIDDOW/SriLankaCitiesDatabase/raw/main/cities.json"
  );
  process.exit(1);
}
if (!existsSync(kaprukaPath)) {
  console.error("Missing kapruka-delivery-cities.json — run: node scripts/fetch-kapruka-cities.mjs");
  process.exit(1);
}

const slCities = JSON.parse(readFileSync(slPath, "utf8"));
const kapruka = JSON.parse(readFileSync(kaprukaPath, "utf8")).cities;

const slByNorm = new Map();
for (const c of slCities) {
  slByNorm.set(norm(c.name_en), c);
}

/** @type {Record<string, string>} */
const aliases = {};

// District-level Sinhala/Tamil → colombo search for capital area
addAlias(aliases, "කොළඹ", "colombo");
addAlias(aliases, "கொழும்பு", "colombo");
addAlias(aliases, "colombo", "colombo");
addAlias(aliases, "kolomba", "colombo");

for (let i = 1; i <= 15; i++) {
  const zone = `Colombo ${String(i).padStart(2, "0")}`;
  const pad = String(i).padStart(2, "0");
  addAlias(aliases, zone, zone);
  addAlias(aliases, `colombo ${i}`, zone);
  addAlias(aliases, `colombo ${pad}`, zone);
  addAlias(aliases, `කොළඹ ${pad}`, zone);
  addAlias(aliases, `කොළඹ ${i}`, zone);
  addAlias(aliases, `கொழும்பு ${pad}`, zone);
}

for (const kCity of kapruka) {
  const canonical = kCity.name;
  addAlias(aliases, canonical, canonical);

  for (const a of kCity.aliases ?? []) {
    addAlias(aliases, a, canonical);
  }

  const slKey = MANUAL_KAPRUKA_TO_SL[canonical] ?? canonical;
  let sl = slByNorm.get(norm(slKey));

  if (!sl) {
    const target = norm(slKey);
    for (const [n, row] of slByNorm) {
      if (n === target || n.startsWith(target) || target.startsWith(n)) {
        sl = row;
        break;
      }
    }
  }

  if (sl) {
    addAlias(aliases, sl.name_si, canonical);
    addAlias(aliases, sl.name_ta, canonical);
    if (sl.sub_name_si && sl.sub_name_si !== "NULL") addAlias(aliases, sl.sub_name_si, canonical);
    if (sl.sub_name_ta && sl.sub_name_ta !== "NULL") addAlias(aliases, sl.sub_name_ta, canonical);
    addAlias(aliases, sl.name_en, canonical);
  }
}

// All SL cities: map Sinhala/Tamil → English for Kapruka partial search
for (const c of slCities) {
  const en = c.name_en;
  const kaprukaMatch = kapruka.find(
    (k) =>
      norm(k.name) === norm(en) ||
      norm(MANUAL_KAPRUKA_TO_SL[k.name] ?? k.name) === norm(en)
  );
  const target = kaprukaMatch?.name ?? en;

  addAlias(aliases, c.name_si, target);
  if (c.name_ta && c.name_ta !== "NULL") addAlias(aliases, c.name_ta, target);
  if (c.sub_name_si && c.sub_name_si !== "NULL") addAlias(aliases, c.sub_name_si, target);
  if (c.sub_name_ta && c.sub_name_ta !== "NULL") addAlias(aliases, c.sub_name_ta, target);
}

const payload = {
  generatedAt: new Date().toISOString(),
  kaprukaCityCount: kapruka.length,
  slCityCount: slCities.length,
  aliasCount: Object.keys(aliases).filter((k) => k.length > 1 && !/^[a-z0-9]+$/.test(k) || k.length > 2).length,
  aliases,
};

writeFileSync(outPath, JSON.stringify(payload));
console.log(
  `Wrote ${Object.keys(aliases).length} alias keys (${payload.kaprukaCityCount} Kapruka cities, ${payload.slCityCount} SL cities)`
);
