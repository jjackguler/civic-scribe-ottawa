/**
 * Output watch: a green workflow is not proof that anything was published.
 * Reads what actually reached the store branches (newsroom index, daily
 * attempts, Originals manifest) and fails when nothing new was published for
 * too long. No credentials, no paid calls.
 *   npx tsx scripts/output-watch.ts            (needs origin/newsroom and origin/media fetched)
 *   OUTPUT_WATCH_STALE_HOURS=24 (articles), OUTPUT_WATCH_ORIGINALS_STALE_HOURS=72
 */
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

type Article = { id: string; createdAt: string };
const show = (ref: string) => {
  try {
    return execFileSync("git", ["show", ref], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
};
const json = <T>(ref: string): T | null => {
  const raw = show(ref);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export function assess(
  now: Date,
  articles: Article[],
  originals: { publishedAt: string }[],
  attempts: { date: string; count: number } | null,
  staleH: number,
  origStaleH: number,
) {
  const hours = (iso?: string) => (iso ? (now.getTime() - Date.parse(iso)) / 3.6e6 : Infinity);
  const latestArticle = articles
    .map((a) => a.createdAt)
    .sort()
    .at(-1);
  const latestOriginal = originals
    .map((o) => o.publishedAt)
    .filter((t) => Date.parse(t) <= now.getTime())
    .sort()
    .at(-1);
  const last24 = articles.filter((a) => hours(a.createdAt) <= 24).length;
  const problems: string[] = [];
  if (hours(latestArticle) > staleH)
    problems.push(
      `No newsroom article for ${latestArticle ? Math.floor(hours(latestArticle)) + " hours" : "ever"} (limit ${staleH}h). Check the Newsroom run summaries: provider busy (5xx), quota, or editorial rejections.`,
    );
  if (hours(latestOriginal) > origStaleH)
    problems.push(
      `No new Original video for ${latestOriginal ? Math.floor(hours(latestOriginal)) + " hours" : "ever"} (limit ${origStaleH}h).`,
    );
  const today = now.toISOString().slice(0, 10);
  const lines = [
    `Articles published, last 24h: ${last24} (total on record ${articles.length}); latest ${latestArticle ?? "none"}`,
    `Newsroom attempts today (counted against the daily cap): ${attempts?.date === today ? attempts.count : 0}`,
    `Originals on the manifest: ${originals.length}; latest published ${latestOriginal ?? "none"}`,
  ];
  return { problems, lines };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = (k: string, d: number) => {
    const v = Number(process.env[k]);
    return Number.isFinite(v) && v > 0 ? v : d;
  };
  const index = json<{ items: Article[] }>("origin/newsroom:index.json");
  const manifest = json<{ items: { publishedAt: string }[] }>(
    "origin/media:originals/manifest.json",
  );
  const attempts = json<{ date: string; count: number }>("origin/newsroom:attempts.json");
  const { problems, lines } = assess(
    new Date(),
    index?.items ?? [],
    manifest?.items ?? [],
    attempts,
    n("OUTPUT_WATCH_STALE_HOURS", 24),
    n("OUTPUT_WATCH_ORIGINALS_STALE_HOURS", 72),
  );
  if (!index) problems.unshift("Could not read origin/newsroom:index.json.");
  if (!manifest) problems.unshift("Could not read origin/media:originals/manifest.json.");
  const report = [...lines, ...problems.map((p) => "PROBLEM: " + p)];
  console.log(report.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      "## Output watch\n\n" + report.map((l) => "- " + l).join("\n") + "\n",
    );
  for (const p of problems) console.log(`::error title=Nothing published::${p}`);
  process.exit(problems.length ? 1 : 0);
}
