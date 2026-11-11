/**
 * Open Desk Ledger checks (no network, no credentials).
 *   npx tsx scripts/ledger-test.ts
 * 1. The schema accepts the fictional fixture and rejects every broken rule.
 * 2. Every real file in src/content/ledger/*.json is valid (CI fails on a bad file).
 * 3. The fictional fixture is never shipped as a real record.
 * 4. Helpers: business-day deadline, review schedule, reply state, counts, old stamps → statuses.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addMonths, businessDeadline, isPublicRecord, PUBLIC_STATUSES, currentStage, currentStatus, dueForReopen, loadLedgerFiles, parseLedgerFile,
  publicRecord, reopenDates, replyDeadline, replyState, reviewSchedule, statusCounts, ASPECTS, ASPECT_LABEL,
  PENDING_LABEL, REPLY_LABEL, STAGES, STAGE_LABEL, STAMP_TO_STATUS, STATUSES, STATUS_HELP, STATUS_LABEL,
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
const verdict = (extra: object) => ({ at: "2026-10-01T00:00:00Z", reason: { en: "x reason" }, editor: "Example Editor", secondReader: "Example Reader", ...extra });
bad(r => { r.version = 1; }, "old record version");
bad(r => { r.protocol = "0.9"; }, "unknown protocol");
bad(r => { r.id = "OD-12"; }, "short id");
bad(r => { r.id = "od-9999"; }, "lower-case id");
bad(r => { delete r.claim.archiveUrl; }, "claim without an archived copy");
bad(r => { r.claim.source.url = "http://example.com/x"; }, "http source");
bad(r => { r.history = []; }, "no signed entry");
bad(r => { r.history[2].status = "verified"; }, "unknown status");
bad(r => { r.history[2].stage = "archived"; }, "unknown stage");
bad(r => { r.history[2].editor = "Claude"; }, "result signed by an AI");
bad(r => { r.history[2].editor = "Automated desk"; }, "result signed by a system");
bad(r => { r.history[2].secondReader = "GPT reviewer"; }, "second reader is an AI");
bad(r => { r.history[1].at = "2026-09-14T00:00:00Z"; }, "history out of order");
bad(r => { delete r.history[1].pending; }, "no conclusion yet without a reason");
bad(r => { r.history[0].pending = "insufficient-evidence"; }, "pending on a non-unresolved entry");
// Four parts, test plan
bad(r => { r.parts = r.parts.filter((p: any) => p.aspect !== "cause"); }, "claim not split into the stated cause");
bad(r => { r.parts[0].aspect = "impact"; }, "unknown part");
bad(r => { r.parts[0].finding = "attributed"; }, "a part cannot be merely recorded");
bad(r => { delete r.test; }, "no test plan");
bad(r => { r.test.checks = []; }, "test plan without a dated check");
bad(r => { r.test.checks[0].expectedBy = "soon"; }, "check without a real date");
// Right of reply
bad(r => { delete r.rightOfReply; }, "no right of reply");
bad(r => { r.rightOfReply.deadline = "2026-09-16T14:00:00Z"; }, "reply window shorter than 48 h");
bad(r => { r.rightOfReply.deadline = "2026-09-18T14:00:00Z"; }, "short window without a reason");
bad(r => { r.history[2].at = "2026-09-18T16:00:00Z"; }, "verdict before five business days");
bad(r => { r.rightOfReply.extensions = [{ at: "2026-09-21T14:00:00Z", until: "2026-09-25T21:00:00Z", reason: { en: "Asked for more time." } }]; }, "verdict before an extended deadline");
bad(r => { r.rightOfReply.extensions = [{ at: "2026-09-21T14:00:00Z", until: "2026-09-21T21:00:00Z", reason: { en: "Too short." } }]; }, "extension that ends before the deadline");
bad(r => { r.rightOfReply.response = { receivedAt: "2026-09-16T10:00:00Z", kind: "ignored", summary: { en: "x reply" } }; }, "unknown reply kind");
// Second reader and evidence
bad(r => { delete r.history[2].secondReader; }, "conflicting without a second reader");
bad(r => { r.history[2].secondReader = "example editor"; }, "the editor as their own second reader");
bad(r => { r.evidence = r.evidence.filter((e: any) => e.stance !== "contradicts"); }, "conflicting without contradicting evidence");
bad(r => { r.history.push(verdict({ status: "supported" })); }, "supported without independent supporting evidence");
bad(r => { r.history.push(verdict({ status: "supported", secondReader: undefined })); }, "supported without a second reader");
bad(r => { r.history.push(verdict({ status: "refuted", secondReader: undefined })); }, "refuted without a second reader");
bad(r => { r.evidence.forEach((e: any) => { e.independent = false; }); r.history.push(verdict({ status: "refuted" })); }, "refuted without independent contradicting evidence");
// Protocol v1.1: publication gate, two sources, anonymity, paid footage, one extension, cause.
bad(r => { r.rightOfReply.requestedAt = "2026-09-15T16:00:00Z"; }, "record leaves attributed before the questions are sent");
bad(r => { r.evidence.find((e: any) => e.title.startsWith("Former")).anonymous = true; }, "conflicting resting on one named independent source");
bad(r => { r.evidence.push({ ...r.evidence[1], url: "https://example.com/jobs/2", stance: "supports" }); r.history.push(verdict({ status: "supported" })); }, "supported with a single independent source");
bad(r => { r.history.push(verdict({ status: "refuted" })); }, "refuted with a single independent contradicting source");
bad(r => { r.evidence.push({ ...r.evidence[1], url: "https://example.com/tip", anonymous: true }); r.history.push(verdict({ status: "refuted" })); }, "refuted counting an anonymous source");
bad(r => { r.evidence[2].anonymous = true; r.evidence[2].licensed = true; }, "licence fee paid to an anonymous person");
bad(r => { r.parts[3].finding = "refuted"; }, "cause refuted without a note on direct evidence");
bad(r => { r.rightOfReply.extensions = [
  { at: "2026-09-21T14:00:00Z", until: "2026-09-24T21:00:00Z", reason: { en: "New point raised." } },
  { at: "2026-09-24T14:00:00Z", until: "2026-09-28T21:00:00Z", reason: { en: "Another new point." } },
]; r.history[2].at = "2026-09-29T16:00:00Z"; }, "two extensions");
bad(r => { r.rightOfReply.extensions = [{ at: "2026-09-21T14:00:00Z", until: "2026-10-09T21:00:00Z", reason: { en: "Long extension." } }]; r.history[2].at = "2026-10-10T16:00:00Z"; }, "extension longer than 5 business days");
// Corrections and links
bad(r => { r.corrections = [{ at: "2026-09-24", kind: "correction", what: { en: "Fixed the headcount." }, editor: "Example Editor" }]; }, "correction without a cause");
bad(r => { r.corrections = [{ at: "2026-09-24", kind: "update", what: { en: "Added the Q3 report." }, editor: "Claude" }]; }, "correction signed by an AI");
bad(r => { r.corrections = [{ at: "2026-09-24", kind: "erratum", what: { en: "x change" }, editor: "Example Editor" }]; }, "unknown correction kind");
bad(r => { r.redactions = [{ at: "2026-09-24", what: { en: "Removed a name." }, reason: "because", editor: "Example Editor" }]; }, "redaction without a listed reason");
bad(r => { r.coverage = [{ kind: "story", title: "Bad link", href: "javascript:alert(1)" }]; }, "unsafe coverage link");
assert.equal(parseLedgerFile("OD-0001.json", fixture).ok, false, "file name must match id");

// Allowed paths
{
  // An answer lets the verdict come before the deadline.
  const r = clone();
  r.rightOfReply.response = { receivedAt: "2026-09-16T10:00:00Z", summary: { en: "The company says the postings are for a new service." } };
  r.history[2].at = "2026-09-16T16:00:00Z";
  assert.ok(parseLedgerFile("OD-9999.json", r).ok, "an answered reply allows an early verdict");
  // A refusal to comment counts as a reply.
  const d = clone();
  d.rightOfReply.response = { receivedAt: "2026-09-16T10:00:00Z", kind: "declined", summary: { en: "Declined to comment." } };
  d.history[2].at = "2026-09-17T16:00:00Z";
  const dp = parseLedgerFile("OD-9999.json", d);
  assert.ok(dp.ok, "a declined reply allows an early verdict");
  assert.equal(replyState((dp as { record: LedgerRecord }).record), "declined");
  // A shorter window with a written reason, never under 48 h.
  const e = clone();
  e.rightOfReply.deadline = "2026-09-17T21:00:00Z";
  e.rightOfReply.expedited = { reason: { en: "The cuts take effect on 18 September; readers need the record before then." } };
  e.history[2].at = "2026-09-18T16:00:00Z";
  assert.ok(parseLedgerFile("OD-9999.json", e).ok, "an expedited window with a reason is allowed");
  // Extension, then a refuted result with a second reader, a correction and the company's later action.
  const x = clone();
  x.rightOfReply.extensions = [{ at: "2026-09-21T14:00:00Z", until: "2026-09-25T21:00:00Z", reason: { en: "The company asked for more time to answer a new point." } }];
  x.history[2].at = "2026-09-28T16:00:00Z";
  x.evidence.push({ title: "Provincial mass-termination notice", url: "https://example.com/notice", publisher: "Example Ministry of Labour", stance: "contradicts", independent: true, note: { en: "Lists 420 roles, not 1,200." }, addedAt: "2026-09-29" });
  x.parts[3] = { ...x.parts[3], finding: "refuted", note: { en: "The notice and the postings show the work moved abroad; no AI system was deployed." } };
  x.history.push(verdict({ status: "refuted", stage: "closed" }));
  x.corrections = [{ at: "2026-10-02", kind: "correction", what: { en: "The headcount was 1,150, not 1,200." }, cause: { en: "We copied the figure from the headline, not the filing." }, editor: "Example Editor" }];
  x.rightOfReply.actorAction = { at: "2026-10-05", kind: "stood-by", note: { en: "The company repeated the claim on its blog." } };
  const xo = parseLedgerFile("OD-9999.json", x);
  assert.ok(xo.ok, `extension + refuted with a second reader should pass: ${!xo.ok ? xo.errors.join("; ") : ""}`);
  const xr = (xo as { record: LedgerRecord }).record;
  assert.equal(replyDeadline(xr), "2026-09-25T21:00:00Z");
  assert.equal(currentStage(xr), "closed");
  assert.equal(dueForReopen([xr], "2027-06-01").length, 0, "closed records leave the to-do list");
}

// A cause refuted with a note, and a named witness paid a licence fee for their own video, pass.
{
  const r = clone();
  r.evidence[2].licensed = true;
  assert.ok(parseLedgerFile("OD-9999.json", r).ok, "a disclosed licence fee to a named person is allowed");
}
// Publication gate: a record still at "attributed" is valid but not public.
{
  const r = clone();
  r.history = [r.history[0]];
  const out = parseLedgerFile("OD-9999.json", r);
  assert.ok(out.ok, "an attributed-only record is a valid file");
  assert.equal(isPublicRecord((out as { record: LedgerRecord }).record), false, "attributed-only records stay off the site");
  assert.equal(isPublicRecord(rec), true);
  assert.ok(!(PUBLIC_STATUSES as string[]).includes("attributed"));
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
  assert.ok(!/example\.com|Example Editor|Example Reader|fictional example/i.test(all), `${r.id} looks like the fictional example`);
}

// 4. Helpers
// Business days: Tue 15 Sep 2026 10:00 Ottawa → Tue 22 Sep 17:00 EDT (21:00 UTC).
assert.equal(businessDeadline("2026-09-15T14:00:00Z"), "2026-09-22T21:00:00Z");
// Holidays and standard time: Thu 24 Dec 2026 → skips 25 and 28 Dec and 1 Jan → Mon 4 Jan 2027 17:00 EST.
assert.equal(businessDeadline("2026-12-24T15:00:00Z"), "2027-01-05T22:00:00Z");
// Late evening in Ottawa is still that Ottawa day (01:00 UTC Wed = 21:00 Tue EDT).
assert.equal(businessDeadline("2026-09-16T01:00:00Z"), "2026-09-22T21:00:00Z");
assert.equal(replyDeadline(rec), "2026-09-22T21:00:00Z");
assert.equal(addMonths("2026-08-31", 6), "2027-02-28");
assert.equal(addMonths("2026-11-06", 3), "2027-02-06");
assert.deepEqual(reopenDates(rec), ["2026-11-15", "2026-12-15", "2027-03-15", "2027-03-31"]);
assert.deepEqual(reviewSchedule(rec).map(s => s.kind), ["check", "review", "decision", "check"]);
assert.equal(dueForReopen([rec], "2026-11-14").length, 0);
assert.equal(dueForReopen([rec], "2026-11-15").length, 1);
assert.equal(currentStage(rec), "monitoring");
assert.equal(replyState(rec, Date.parse("2026-09-18T00:00:00Z")), "waiting");
assert.equal(replyState(rec, Date.parse("2026-09-22T21:00:01Z")), "no-response");
const counts = statusCounts([rec]);
assert.equal(counts.conflicting, 1);
assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 1);
const pub = publicRecord(rec);
assert.equal(pub.status, "conflicting");
assert.equal(pub.stage, "monitoring");
assert.equal(pub.replyDeadline, "2026-09-22T21:00:00Z");
for (const s of STAMPS) assert.ok(STATUSES.includes(STAMP_TO_STATUS[s]), `stamp ${s} maps to a status`);
for (const map of [STAGE_LABEL, PENDING_LABEL, REPLY_LABEL, ASPECT_LABEL] as Record<string, { en: string; fr: string }>[])
  for (const [k, v] of Object.entries(map)) assert.ok(v.en && v.fr, `${k} has EN/FR copy`);
assert.equal(STAGES.length, 3);
assert.equal(ASPECTS.length, 4);
for (const s of STATUSES) assert.ok(STATUS_LABEL[s].en && STATUS_LABEL[s].fr && STATUS_HELP[s].en && STATUS_HELP[s].fr, `${s} has EN/FR copy`);

console.log(`ledger-test: ok (${real.records.length} published record${real.records.length === 1 ? "" : "s"})`);
