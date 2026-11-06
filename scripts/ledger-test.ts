/**
 * Open Desk Ledger checks (no network, no credentials).
 *   npx tsx scripts/ledger-test.ts
 * 1. The schema accepts the fictional fixture and rejects every broken rule.
 * 2. Every real file in src/content/ledger/*.json is valid (CI fails on a bad file).
 * 3. The fictional fixture is never shipped as a real record.
 * 4. Helpers: reopen dates, reply state, counts, old stamps → statuses.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addMonths, currentStatus, dueForReopen, loadLedgerFiles, parseLedgerFile, publicRecord,
  reopenDates, replyState, statusCounts, STAMP_TO_STATUS, STATUSES, STATUS_HELP, STATUS_LABEL,
  type LedgerRecord,
} from "../src/lib/ledger-schema";
import { STAMPS } from "../src/lib/studio-schema";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = join(root, "scripts/fixtures/ledger/OD-9999.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const clone = () => JSON.parse(JSON.stringify(fixture));

// 1. Schema and rules
const ok = parseLedgerFile("OD-9999.json", fixture);
assert.ok(ok.ok, `fixture should be valid: ${!ok.ok ? ok.errors.join("; ") : ""}`);
const rec = (ok as { record: LedgerRecord }).record;
assert.equal(currentStatus(rec), "conflicting");

const bad = (mutate: (r: any) => void, why: string) => {
  const r = clone();
  mutate(r);
  const out = parseLedgerFile("OD-9999.json", r);
  assert.equal(out.ok, false, `should reject: ${why}`);
};
bad(r => { r.version = 2; }, "unknown version");
bad(r => { r.id = "OD-12"; }, "short id");
bad(r => { r.id = "od-9999"; }, "lower-case id");
bad(r => { delete r.claim.archiveUrl; }, "claim without an archived copy");
bad(r => { r.claim.source.url = "http://example.com/x"; }, "http source");
bad(r => { r.history = []; }, "no signed status");
bad(r => { r.history[2].status = "verified"; }, "unknown status");
bad(r => { r.history[2].editor = "Claude"; }, "status signed by an AI");
bad(r => { r.history[2].editor = "Automated desk"; }, "status signed by a system");
bad(r => { r.history[1].at = "2026-09-14T00:00:00Z"; }, "history out of order");
bad(r => { delete r.rightOfReply; }, "no right of reply");
bad(r => { r.rightOfReply.deadlineHours = 24; }, "reply window shorter than 48 h");
bad(r => { r.history[2].at = "2026-09-16T16:00:00Z"; }, "verdict before the reply window ends");
bad(r => { r.evidence = r.evidence.filter((e: any) => e.stance !== "contradicts"); }, "conflicting without contradicting evidence");
bad(r => { r.history.push({ status: "supported", at: "2026-10-01T00:00:00Z", reason: { en: "x reason" }, editor: "Example Editor" }); }, "supported without independent supporting evidence");
bad(r => { r.history.push({ status: "refuted", at: "2026-10-01T00:00:00Z", reason: { en: "x reason" }, editor: "Example Editor" }); }, "refuted without a second reader");
bad(r => { r.history.push({ status: "refuted", at: "2026-10-01T00:00:00Z", reason: { en: "x reason" }, editor: "Example Editor", secondReader: "example editor" }); }, "refuted with the editor as second reader");
bad(r => { r.coverage = [{ kind: "story", title: "Bad link", href: "javascript:alert(1)" }]; }, "unsafe coverage link");
assert.equal(parseLedgerFile("OD-0001.json", fixture).ok, false, "file name must match id");

// Allowed paths: an answered reply lets the verdict come early; refuted with a real second reader.
{
  const r = clone();
  r.rightOfReply.response = { receivedAt: "2026-09-16T10:00:00Z", summary: { en: "The company declined to comment on the postings." } };
  r.history[2].at = "2026-09-16T16:00:00Z";
  assert.ok(parseLedgerFile("OD-9999.json", r).ok, "an answered reply allows an early verdict");
  r.history.push({ status: "refuted", at: "2026-10-01T00:00:00Z", reason: { en: "Second reading done." }, editor: "Example Editor", secondReader: "Second Reader" });
  const out = parseLedgerFile("OD-9999.json", r);
  assert.ok(out.ok, `refuted with a second reader should pass: ${!out.ok ? out.errors.join("; ") : ""}`);
}

const dup = loadLedgerFiles({ "a/OD-9999.json": fixture, "b/OD-9999.json": fixture });
assert.equal(dup.records.length, 1);
assert.equal(dup.rejected.length, 1, "duplicate ids are rejected");

// 2. Real files
const dir = join(root, "src/content/ledger");
const files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".json")) : [];
const real = loadLedgerFiles(Object.fromEntries(files.map(f => [f, JSON.parse(readFileSync(join(dir, f), "utf8"))])));
for (const r of real.rejected) console.error(`✗ ${r.file}: ${r.errors.join("; ")}`);
assert.equal(real.rejected.length, 0, "every file in src/content/ledger must be valid");

// 3. The fixture must stay a fixture
assert.ok(!files.includes("OD-9999.json"), "the fictional fixture must not be copied into src/content/ledger");
for (const r of real.records) {
  const all = JSON.stringify(r);
  assert.ok(!/example\.com|Example Editor|fictional example/i.test(all), `${r.id} looks like the fictional example`);
}

// 4. Helpers
assert.equal(addMonths("2026-08-31", 6), "2027-02-28");
assert.equal(addMonths("2026-11-06", 3), "2027-02-06");
assert.deepEqual(reopenDates(rec), ["2026-12-15", "2027-03-15"]);
assert.equal(dueForReopen([rec], "2026-12-14").length, 0);
assert.equal(dueForReopen([rec], "2026-12-15").length, 1);
assert.equal(replyState(rec, Date.parse("2026-09-16T00:00:00Z")), "waiting");
assert.equal(replyState(rec, Date.parse("2026-09-20T00:00:00Z")), "no-response");
const counts = statusCounts([rec]);
assert.equal(counts.conflicting, 1);
assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 1);
assert.equal(publicRecord(rec).status, "conflicting");
for (const s of STAMPS) assert.ok(STATUSES.includes(STAMP_TO_STATUS[s]), `stamp ${s} maps to a status`);
for (const s of STATUSES) assert.ok(STATUS_LABEL[s].en && STATUS_LABEL[s].fr && STATUS_HELP[s].en && STATUS_HELP[s].fr, `${s} has EN/FR copy`);

console.log(`ledger-test: ok (${real.records.length} published record${real.records.length === 1 ? "" : "s"})`);
