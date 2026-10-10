/**
 * Which story the next explainer is about ("our chosen stories"), in this order:
 *
 *   1. The owner's queue: originals/queue.json on the media branch, a list of
 *      {"articleId" | "storyId" | "url", "note"} consumed from the top. Queue items
 *      skip the risk filter (the owner chose them) and may remake a covered story.
 *   2. Our own newsroom articles (newsroom branch index.json + articles/<id>.json):
 *      the newest one, from the last few days, not made into a video yet.
 *   3. The desk: the multi-outlet story the most newsrooms are covering.
 *
 * Outside the queue, never a story about children, health, elections or
 * accusations against people (the newsroom's riskReasons idea), and never one
 * that failed in the last week (originals/skipped.json).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { Cluster } from "../../src/lib/cluster";
import type { Story } from "../../src/lib/news-engine";
import type { OriginalsManifest } from "../../src/lib/originals-types";
import type { NewsroomArticle, NewsroomIndex } from "../../src/lib/newsroom-types";
import { env, note } from "./util";

export type SourceRef = { name: string; url: string; title: string; publishedAt?: string };
export type BriefItem = { publisher: string; headline: string; excerpt: string; published?: string; url: string };
export type Origin = { kind: "queue" | "newsroom" | "desk" | "fixture"; articleId?: string; storyId?: string; url?: string; note?: string };
export type Brief = {
  /** Stable key for the skip log ("article:<id>", "story:<id>", "url:<url>"). */
  key: string;
  origin: Origin;
  /** The lead headline, for logs. */
  lead: string;
  /** Publishers, one per outlet, at most six (named on screen and in the manifest). */
  sources: SourceRef[];
  /** What the writer reads: the publishers' headlines and excerpts. */
  items: BriefItem[];
  /** Our own newsroom article, when the story comes from it (already checked against the publishers). */
  reporting?: { headline: string; dek: string; paragraphs: string[]; confirmed: string[]; claimed: string[]; unknown: string[] };
  /** Everything the narration may draw facts from: the fact guard checks against this. */
  sourceText: string;
};

export type QueueItem = { articleId?: string; storyId?: string; url?: string; note?: string };
type Done = QueueItem & { at: string; status: "made" | "skipped"; reason?: string; id?: string };
type Skipped = { key: string; at: string; reason: string };

const NEWSROOM_RAW = env("ORIGINALS_NEWSROOM_RAW") || "https://raw.githubusercontent.com/jjackguler/civic-scribe-ottawa/newsroom";

/** Same idea as scripts/newsroom/run.ts riskReasons, narrowed to the four topics the explainers never touch unasked. */
export function riskReasons(text: string, lens: string[] = []): string[] {
  const out: string[] = [];
  const rules: [RegExp, string][] = [
    [/\b(accus\w*|alleg\w*|lawsuits?|sued|sues|suing|charged|arrest\w*|police|crime|criminal|fraud\w*|scandal|misconduct|fired|firing|harass\w*|investigat\w*|court|guilty|defam\w*)\b/i, "accusations or the law"],
    [/\b(health|medical|patients?|hospital\w*|diagnos\w*|drugs?|mental|suicide|self-harm|death|died|dies|killed)\b/i, "health or life"],
    [/\b(election\w*|vot(e|er|ers|ing)|ballot\w*|campaign\w*|candidate\w*|referendum)\b/i, "elections"],
    [/\b(child|children|kids?|minors?|teen\w*|students?|school\w*)\b/i, "children"],
  ];
  for (const [re, why] of rules) if (re.test(text)) out.push(why);
  for (const l of lens) if (["children", "health", "democracy"].includes(l)) out.push(`lens: ${l}`);
  return [...new Set(out)];
}

async function readJson<T>(f: string, fallback: T): Promise<T> {
  try { return existsSync(f) ? JSON.parse(await readFile(f, "utf8")) as T : fallback; } catch { return fallback; }
}

/** Newsroom store file: a local folder (tests) or the raw branch on GitHub. */
async function newsroomFile<T>(path: string): Promise<T | null> {
  if (!/^https?:/.test(NEWSROOM_RAW)) return readJson<T | null>(join(NEWSROOM_RAW, path), null);
  try {
    const r = await fetch(`${NEWSROOM_RAW}/${path}`, { signal: AbortSignal.timeout(20_000), headers: { "cache-control": "no-cache" } });
    return r.ok ? await r.json() as T : null;
  } catch { return null; }
}

/** All the strings in a value (our article's text, for the fact guard). */
function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach(x => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach(x => strings(x, out));
  return out;
}
const stripMarkers = (p: string) => p.replace(/\s*\[((?:[sb]\d+)(?:\s*,\s*[sb]\d+)*)\]/g, "");

function uniqueOutlets<T extends { name: string }>(xs: T[]): T[] {
  const seen = new Set<string>();
  return xs.filter(x => !seen.has(x.name) && (seen.add(x.name), true)).slice(0, 6);
}

export function briefFromStories(stories: Story[], origin: Origin, key: string): Brief {
  const items = stories.slice(0, 6).map(s => ({ publisher: s.source, headline: s.title, excerpt: (s.summary || "").slice(0, 900), published: s.publishedAt, url: s.link }));
  return {
    key, origin, lead: stories[0].title,
    sources: uniqueOutlets(stories.map(s => ({ name: s.source, url: s.link, title: s.title, publishedAt: s.publishedAt }))),
    items,
    sourceText: stories.map(s => `${s.title}. ${s.summary}. ${s.source}`).join("\n"),
  };
}

export function briefFromArticle(a: NewsroomArticle, origin: Origin): Brief {
  const en = a.en;
  const paragraphs = (en.sections ?? []).flatMap(s => s.paras).map(stripMarkers);
  const sources = uniqueOutlets(a.sources.map(s => ({ name: s.outlet, url: s.url, title: s.title, publishedAt: s.publishedAt })));
  return {
    key: `article:${a.id}`, origin, lead: en.headline, sources,
    items: a.sources.slice(0, 6).map(s => ({ publisher: s.outlet, headline: s.title, excerpt: "", published: s.publishedAt, url: s.url })),
    reporting: {
      headline: en.headline, dek: en.dek, paragraphs,
      confirmed: (en.confirmed ?? []).map(c => c.text),
      claimed: (en.claimed ?? []).map(c => `${c.by}: ${c.text}`),
      unknown: en.unknown ?? [],
    },
    sourceText: [...strings(en).map(stripMarkers), ...a.sources.map(s => `${s.title}. ${s.outlet}`)].join("\n"),
  };
}

/** A publisher page the owner queued that isn't on the desk: its title, description and paragraphs. */
async function briefFromUrl(url: string, origin: Origin): Promise<Brief | null> {
  let html = "";
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { "user-agent": "Mozilla/5.0 (compatible; AIBroadsheetOriginals/1.0; +https://aibroadsheet.com)" } });
    if (!r.ok) return null;
    html = await r.text();
  } catch { return null; }
  const meta = (p: string) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]*content=["']([^"']+)`, "i"))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${p}["']`, "i"))?.[1];
  const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  const title = decode(meta("og:title") ?? html.match(/<title[^>]*>([^<]+)/i)?.[1] ?? "").trim();
  const desc = decode(meta("og:description") ?? meta("description") ?? "").trim();
  const paras = [...html.replace(/<(script|style|nav|footer|header|aside)[\s\S]*?<\/\1>/gi, "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => decode(m[1].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim()).filter(p => p.length > 60);
  const body = paras.join("\n").slice(0, 6000);
  if (!title || (desc + body).length < 300) return null;
  const host = new URL(url).hostname.replace(/^www\./, "");
  const publisher = decode(meta("og:site_name") ?? host).trim();
  return {
    key: `url:${url}`, origin, lead: title,
    sources: [{ name: publisher, url, title }],
    items: [{ publisher, headline: title, excerpt: `${desc}\n${body}`.trim(), url }],
    sourceText: `${title}. ${desc}\n${body}\n${publisher}`,
  };
}

export type Pick = {
  brief: Brief | null;
  /** Record the outcome: consumes the queue item, or remembers a failed story for a week. */
  done(outcome: { status: "made" | "skipped"; reason?: string; id?: string }): Promise<void>;
};

/**
 * @param mediaDir  the media branch checkout's originals/ folder (queue.json, skipped.json live here);
 *                  nothing is written when `write` is false (dry runs).
 */
export async function chooseStory(o: { mediaDir: string; manifest: OriginalsManifest; write: boolean }): Promise<Pick> {
  const queuePath = join(o.mediaDir, "queue.json");
  const donePath = join(o.mediaDir, "queue-done.json");
  const skipPath = join(o.mediaDir, "skipped.json");
  const rawQueue = await readJson<QueueItem[] | { items?: QueueItem[] }>(queuePath, []);
  const queue: QueueItem[] = Array.isArray(rawQueue) ? rawQueue : rawQueue.items ?? [];
  const skipped = await readJson<Skipped[]>(skipPath, []);
  const recent = new Set(skipped.filter(s => Date.now() - new Date(s.at).getTime() < 7 * 86400_000).map(s => s.key));
  const covered = new Set(o.manifest.items.flatMap(i => [...i.sources.map(s => s.url), ...(((i as { origin?: Origin }).origin?.articleId) ? [`article:${(i as { origin?: Origin }).origin!.articleId}`] : [])]));

  const save = async (f: string, v: unknown) => {
    if (!o.write) return;
    await mkdir(dirname(f), { recursive: true });
    await writeFile(f, JSON.stringify(v, null, 2) + "\n");
  };
  const remember = (key: string) => async (r: { status: "made" | "skipped"; reason?: string }) => {
    if (r.status === "skipped") await save(skipPath, [{ key, at: new Date().toISOString(), reason: r.reason ?? "" }, ...skipped].slice(0, 200));
  };

  let desk: Story[] | null = null;
  const loadDesk = async () => {
    if (!desk) {
      const { loadNews } = await import("../../src/lib/news-engine");
      desk = (await loadNews()).stories;
      note(`desk: ${desk.length} stories`);
    }
    return desk;
  };
  const clusters = async (hours: number): Promise<Cluster[]> => {
    const { clusterStories } = await import("../../src/lib/cluster");
    return clusterStories(await loadDesk(), hours);
  };

  // 1. The owner's queue, top first. Items that can't be found are consumed with the reason.
  while (queue.length) {
    const item = queue[0];
    const origin: Origin = { kind: "queue", articleId: item.articleId, storyId: item.storyId, url: item.url, note: item.note };
    const consume = async (r: { status: "made" | "skipped"; reason?: string; id?: string }) => {
      queue.shift();
      await save(queuePath, queue);
      const done = await readJson<Done[]>(donePath, []);
      await save(donePath, [{ ...item, at: new Date().toISOString(), ...r }, ...done].slice(0, 200));
    };
    let brief: Brief | null = null;
    if (item.articleId) {
      const a = await newsroomFile<NewsroomArticle>(`articles/${item.articleId}.json`);
      if (a) brief = briefFromArticle(a, origin);
    } else if (item.storyId || item.url) {
      const stories = await loadDesk().catch(() => [] as Story[]);
      const lead = stories.find(s => (item.storyId && s.id === item.storyId) || (item.url && s.link === item.url));
      if (lead) {
        const c = (await clusters(72)).find(c => c.stories.some(s => s.id === lead.id));
        brief = briefFromStories(c ? [lead, ...c.stories.filter(s => s.id !== lead.id)] : [lead], origin, `story:${lead.id}`);
      } else if (item.url) brief = await briefFromUrl(item.url, origin);
    }
    if (brief) {
      note(`story (owner queue${item.note ? `, note: “${item.note}”` : ""}): ${brief.lead}`);
      return { brief, done: consume };
    }
    note(`queue item not found, removed: ${JSON.stringify(item)}`);
    await consume({ status: "skipped", reason: "not found (not on the desk, not in the newsroom, or the page could not be read)" });
    if (!o.write) break;
  }

  // 2. Our own newsroom articles, newest first.
  const hours = Number(env("ORIGINALS_NEWSROOM_HOURS") || 72);
  const index = await newsroomFile<NewsroomIndex>("index.json");
  const killedFile = await newsroomFile<unknown>("killed.json");
  if (index?.items?.length) {
    const { killedIds, isKilled } = await import("../../src/lib/newsroom-types");
    const killed = killedIds(killedFile);
    const fresh = [...index.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter(s => Date.now() - new Date(s.createdAt).getTime() < hours * 3600_000 && !isKilled(killed, s));
    for (const s of fresh) {
      const key = `article:${s.id}`;
      if (covered.has(key) || recent.has(key)) continue;
      const risk = riskReasons(`${s.en.headline} ${s.en.dek} ${s.en.news}`, s.topic === "health" ? ["health"] : []);
      if (risk.length) { note(`newsroom: passed over “${s.en.headline}” (${risk.join(", ")})`); continue; }
      const a = await newsroomFile<NewsroomArticle>(`articles/${s.id}.json`);
      if (!a) continue;
      if (a.sources.some(x => covered.has(x.url))) continue;
      const lensRisk = riskReasons("", a.lens ?? []);
      if (lensRisk.length) { note(`newsroom: passed over “${s.en.headline}” (${lensRisk.join(", ")})`); continue; }
      note(`story (our newsroom article ${a.id}): ${a.en.headline}`);
      return { brief: briefFromArticle(a, { kind: "newsroom", articleId: a.id }), done: remember(key) };
    }
    note(`newsroom: nothing new in the last ${hours} h`);
  } else note("newsroom: no index yet");

  // 3. The desk's multi-outlet story.
  const all = await clusters(24);
  note(`desk: ${all.filter(c => c.sources >= 2).length} multi-outlet stories`);
  const now = Date.now();
  const fresh = all.filter(c => now - new Date(c.latest).getTime() < 24 * 3600_000 && !c.stories.some(s => covered.has(s.id) || covered.has(s.link)));
  for (const c of [...fresh.filter(c => c.sources >= 3), ...fresh.filter(c => c.sources === 2)]) {
    const key = `story:${c.lead.id}`;
    if (recent.has(key)) continue;
    const risk = riskReasons(c.stories.map(s => `${s.title} ${s.summary}`).join(" "));
    if (risk.length) { note(`desk: passed over “${c.lead.title}” (${risk.join(", ")})`); continue; }
    note(`story (desk, ${c.sources} outlets): ${c.lead.title}`);
    return { brief: briefFromStories(c.stories, { kind: "desk", storyId: c.lead.id }, key), done: remember(key) };
  }
  return { brief: null, done: async () => {} };
}

/** Dry runs: a fixed story, no network. */
export const FIXTURE_BRIEF: Brief = {
  key: "fixture", origin: { kind: "fixture" }, lead: "Dry run",
  sources: [
    { name: "AI Broadsheet", url: "https://example.com/dry-run-1", title: "Dry run: how our collage explainers are made", publishedAt: "2026-10-09T12:00:00Z" },
    { name: "Test Desk", url: "https://example.com/dry-run-2", title: "Every name and number is checked against the sources", publishedAt: "2026-10-09T13:00:00Z" },
  ],
  items: [],
  sourceText: "",
};
