// Output watch: a run that published nothing must not pass as healthy.
import assert from "node:assert/strict";
import { assess } from "./output-watch";

const now = new Date("2026-10-16T15:00:00Z");
const fresh = assess(
  now,
  [{ id: "a", createdAt: "2026-10-16T10:00:00Z" }],
  [{ publishedAt: "2026-10-15T10:00:00Z" }],
  { date: "2026-10-16", count: 3 },
  24,
  72,
);
assert.deepEqual(fresh.problems, []);
assert.match(fresh.lines[0], /last 24h: 1/);
assert.match(fresh.lines[1], /today.*: 3/);
const stale = assess(
  now,
  [{ id: "a", createdAt: "2026-10-11T23:51:15Z" }],
  [{ publishedAt: "2026-10-14T16:50:00Z" }],
  null,
  24,
  72,
);
assert.equal(stale.problems.length, 1);
assert.match(stale.problems[0], /No newsroom article for 111 hours/);
assert.equal(assess(now, [], [], null, 24, 72).problems.length, 2);
// A future-dated Original doesn't count as published yet.
assert.equal(
  assess(
    now,
    [{ id: "a", createdAt: "2026-10-16T10:00:00Z" }],
    [{ publishedAt: "2026-10-20T00:00:00Z" }],
    null,
    24,
    72,
  ).problems.length,
  1,
);
console.log("Output watch checks passed.");
