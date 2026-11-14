/**
 * Open Desk Ledger drafts (no network, no credentials).
 *   npx tsx scripts/ledger-drafts-test.ts
 * Drafts in newsroom/ledger-drafts/ are never shown on the site. They must already follow the
 * record rules, and still carry the "EDITOR SIGNS HERE" placeholder until the editor signs.
 * A real record (src/content/ledger/) must never carry the placeholder.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseLedgerFile } from "../src/lib/ledger-schema";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const PLACEHOLDER = "EDITOR SIGNS HERE";

const drafts = join(root, "newsroom/ledger-drafts");
let n = 0;
if (existsSync(drafts))
  for (const f of readdirSync(drafts).filter((f) => f.endsWith(".json"))) {
    const out = parseLedgerFile(f, JSON.parse(readFileSync(join(drafts, f), "utf8")));
    assert.ok(out.ok, `draft ${f}: ${!out.ok ? out.errors.join("; ") : ""}`);
    n++;
  }

const live = join(root, "src/content/ledger");
for (const f of readdirSync(live).filter((f) => f.endsWith(".json")))
  assert.ok(
    !readFileSync(join(live, f), "utf8").includes(PLACEHOLDER),
    `${f} is unsigned: replace "${PLACEHOLDER}" with the editor's name`,
  );

console.log(`ledger drafts: ${n} draft(s) valid, no unsigned live record`);
