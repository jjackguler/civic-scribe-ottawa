/**
 * Persistent count of events the newsroom has started today, written before
 * each event's first model call, so infrastructure failures (which leave no
 * rejection record) still count against NEWSROOM_DAILY_CAP. Lives in the
 * newsroom store as attempts.json. Per-store, not concurrency-safe across
 * parallel runs (the workflow's concurrency group serialises runs).
 */
import { readFile, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";

export type Attempts = { date: string; count: number; ids: string[] };

export function parseAttempts(raw: string | null, today: string): Attempts {
  if (raw === null) return { date: today, count: 0, ids: [] };
  let a: Partial<Attempts>;
  try { a = JSON.parse(raw); } catch { throw new Error("Invalid attempts.json: paid run stopped; restore the daily counter before retrying."); }
  if (!a || typeof a.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(a.date) || a.date > today || !Number.isInteger(a.count) || (a.count as number) < 0) throw new Error("Invalid daily counter: paid run stopped.");
  if (a.date < today) return { date: today, count: 0, ids: [] };
  return { date: today, count: a.count as number, ids: Array.isArray(a.ids) ? a.ids.filter(x => typeof x === "string").slice(-200) : [] };
}

export async function loadAttempts(dir: string, today: string) {
  return parseAttempts(await readFile(join(dir, "attempts.json"), "utf8").catch(e => { if (e.code === "ENOENT") return null; throw e; }), today);
}

export async function recordAttempt(dir: string, a: Attempts, id: string) {
  const next = { date: a.date, count: a.count + 1, ids: [...a.ids, id].slice(-200) };
  const temp = join(dir, "attempts.json.tmp");
  await writeFile(temp, JSON.stringify(next, null, 2) + "\n");
  await rename(temp, join(dir, "attempts.json"));
  Object.assign(a, next);
}
