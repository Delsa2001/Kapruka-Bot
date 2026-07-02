/**
 * Run 100 search-query normalization tests.
 * node scripts/test-search-query.mjs
 */
import { normalizeSearchQuery } from "../src/lib/search-query";
import {
  MUST_DIFFER_PAIRS,
  SEARCH_QUERY_CASES,
} from "./search-query-cases.mjs";

let failed = 0;
let passed = 0;

const resultsById = new Map();

console.log(`Running ${SEARCH_QUERY_CASES.length} search query cases...\n`);

for (const tc of SEARCH_QUERY_CASES) {
  const got = normalizeSearchQuery(tc.input);
  resultsById.set(tc.id, got);

  if (tc.expect && got !== tc.expect) {
    console.log(`FAIL #${tc.id}`);
    console.log(`  input:  ${tc.input.slice(0, 60)}${tc.input.length > 60 ? "…" : ""}`);
    console.log(`  expect: ${tc.expect}`);
    console.log(`  got:    ${got}\n`);
    failed++;
  } else {
    passed++;
  }
}

console.log(`Exact match: ${passed}/${SEARCH_QUERY_CASES.length} passed, ${failed} failed\n`);

let pairFails = 0;
for (const [a, b] of MUST_DIFFER_PAIRS) {
  const qa = resultsById.get(a);
  const qb = resultsById.get(b);
  if (qa === qb) {
    console.log(`COLLISION pair #${a} vs #${b} → both "${qa}"`);
    pairFails++;
  }
}

const allOutputs = [...resultsById.entries()];
const byQuery = new Map();
for (const [id, q] of allOutputs) {
  if (!byQuery.has(q)) byQuery.set(q, []);
  byQuery.get(q).push(id);
}

const collisions = [...byQuery.entries()].filter(([, ids]) => ids.length > 1);
const badCollisions = collisions.filter(([q, ids]) => {
  const intents = new Set(
    ids.map((id) => {
      const tc = SEARCH_QUERY_CASES.find((c) => c.id === id);
      return tc?.expect?.split(" ")[0] ?? id;
    })
  );
  return intents.size > 1;
});

if (badCollisions.length) {
  console.log(`\n${badCollisions.length} query strings shared by different intents:`);
  for (const [q, ids] of badCollisions.slice(0, 15)) {
    console.log(`  "${q}" ← cases ${ids.join(", ")}`);
  }
}

const totalFail = failed + pairFails;
console.log(
  `\n${totalFail === 0 ? "PASS" : "FAIL"}: ${pairFails} critical pair collisions, ${failed} expectation mismatches`
);
process.exit(totalFail > 0 ? 1 : 0);
