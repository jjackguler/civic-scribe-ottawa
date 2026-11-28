/**
 * Daily social desk: turns our own Newsroom articles into Ink & Gold carousels and
 * our explainer videos into Reels, then posts them to Instagram (carousel, Reel,
 * story), Facebook (photo post, Reel, story) and LinkedIn (carousel, video).
 *
 *   npx tsx run.ts build   --store <dir>   render new items into <dir>/files and <dir>/queue.json
 *   npx tsx run.ts publish --store <dir>   post the queue (after <dir> is pushed to the social branch)
 *
 * <dir> is a checkout of the "social" branch: state.json remembers what was posted,
 * so nothing goes out twice. Images are served to Meta from that public branch.
 * Platforms without secrets are skipped with a note (dry run).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { chromium } from "playwright";
import { beatScore, riskReasons } from "../originals/pick";
import { renderSlides, type SlideArticle } from "./slides";
import { fbPhotos, fbReel, fbStory, igCarousel, igReel, igStory, liCarousel, linkedInFromEnv, liVideoPost, metaFromEnv } from "./platforms";

type Item =
  | { kind: "carousel"; key: string; title: string; caption: string; files: string[] }
  | { kind: "video"; key: string; title: string; caption: string; videoUrl: string };
type State = { posted: Record<string, { at: string; ig?: string; fb?: string; li?: string; errors?: string[] }> };

const arg = (k: string, d: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const MODE = process.argv[2];
const STORE = resolve(arg("--store", "social-store"));
const RAW = process.env.SOCIAL_RAW || "https://raw.githubusercontent.com/jjackguler/civic-scribe-ottawa/social";
const NEWSROOM = "https://raw.githubusercontent.com/jjackguler/civic-scribe-ottawa/newsroom";
const MEDIA = "https://raw.githubusercontent.com/jjackguler/civic-scribe-ottawa/media";
const CAROUSELS = Number(process.env.SOCIAL_CAROUSELS || 1);
const VIDEOS = Number(process.env.SOCIAL_VIDEOS || 1);
const HOURS = Number(process.env.SOCIAL_HOURS || 48);
const TAGS = "#AI #HumanCentredAI #AINews";
const link = (id: string, src: string) => `https://aibroadsheet.com/story/${id}?utm_source=${src}&utm_medium=social&utm_campaign=daily`;

async function json<T>(url: string): Promise<T | null> {
  try { const r = await fetch(url, { headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(20_000) }); return r.ok ? await r.json() as T : null; }
  catch { return null; }
}
async function readState(): Promise<State> {
  try { return JSON.parse(await readFile(join(STORE, "state.json"), "utf8")) as State; } catch { return { posted: {} }; }
}

type IndexItem = { id: string; createdAt: string; topic: string; outlets: string[]; en: { headline: string; dek: string; news: string; matters: string } };
type Original = { id: string; kind?: string; publishedAt: string; title: string; summary: string; fileUrl?: string };

async function build() {
  const state = await readState();
  const queue: Item[] = [];
  const fresh = (t: string) => Date.now() - new Date(t).getTime() < HOURS * 3600_000;

  // Explainer videos made since the last run become Reels and LinkedIn videos.
  const originals = await json<{ items: Original[] }>(`${MEDIA}/originals/manifest.json`);
  const videos = [...(originals?.items ?? [])].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  for (const o of videos) {
    if (queue.length >= VIDEOS) break;
    const key = `video:${o.id}`;
    if (o.kind === "titles" || !o.fileUrl || !fresh(o.publishedAt) || state.posted[key]) continue;
    queue.push({ kind: "video", key, title: o.title, videoUrl: o.fileUrl,
      caption: `${o.title}\n\n${o.summary}\n\nAI news, with the human stakes left in. One catch a day.\n${TAGS}` });
  }

  // Newsroom articles become carousels: our beats first, then newest; risky topics left to the desk.
  const index = await json<{ items: IndexItem[] }>(`${NEWSROOM}/index.json`);
  const picks = (index?.items ?? [])
    .filter(a => fresh(a.createdAt) && !state.posted[`article:${a.id}`] && !riskReasons(`${a.en.headline} ${a.en.dek}`).includes("accusations or the law"))
    .sort((a, b) => beatScore(`${b.en.headline} ${b.en.dek} ${b.en.news}`) - beatScore(`${a.en.headline} ${a.en.dek} ${a.en.news}`) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, CAROUSELS);
  if (picks.length) {
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    try {
      for (const a of picks) {
        const s: SlideArticle = { id: a.id, topic: a.topic, outlets: a.outlets, ...a.en };
        const files = await renderSlides(browser, s, join(STORE, "files", a.id));
        queue.push({ kind: "carousel", key: `article:${a.id}`, title: a.en.headline, files: files.map(f => relative(STORE, f).replace(/\\/g, "/")),
          caption: `${a.en.headline}\n\n${a.en.news}\n\nThe catch: ${a.en.matters}\n\nFull story, sources named: LINK\n${TAGS}` });
      }
    } finally { await browser.close(); }
  }
  await mkdir(STORE, { recursive: true });
  await writeFile(join(STORE, "queue.json"), JSON.stringify(queue, null, 2));
  console.log(`queued ${queue.length}: ${queue.map(q => q.key).join(", ") || "nothing new"}`);
}

async function publish() {
  const state = await readState();
  const queue: Item[] = existsSync(join(STORE, "queue.json")) ? JSON.parse(await readFile(join(STORE, "queue.json"), "utf8")) : [];
  const meta = metaFromEnv(), li = linkedInFromEnv();
  if (!meta) console.log("Meta secrets not set: Instagram and Facebook skipped (dry run).");
  if (!li) console.log("LinkedIn secrets not set: LinkedIn skipped (dry run).");
  for (const q of queue) {
    if (state.posted[q.key]) continue;
    const rec: State["posted"][string] = { at: new Date().toISOString(), errors: [] };
    const tryIt = async (name: string, f: () => Promise<string>) => {
      try { const id = await f(); console.log(`${q.key} → ${name} ${id}`); return id; }
      catch (e) { rec.errors!.push(`${name}: ${(e as Error).message}`); console.warn(`${q.key} → ${name} failed: ${(e as Error).message}`); return undefined; }
    };
    if (q.kind === "carousel") {
      const urls = q.files.map(f => `${RAW}/${f}`);
      const id = q.key.split(":")[1];
      if (meta) {
        rec.ig = await tryIt("instagram", () => igCarousel(meta, urls, q.caption.replace("LINK", "link in bio (aibroadsheet.com)")));
        await tryIt("instagram story", () => igStory(meta, urls[0]));
        rec.fb = await tryIt("facebook", () => fbPhotos(meta, urls, q.caption.replace("LINK", link(id, "facebook"))));
        await tryIt("facebook story", () => fbStory(meta, urls[0]));
      }
      if (li) {
        const bytes = await Promise.all(q.files.map(f => readFile(join(STORE, f))));
        rec.li = await tryIt("linkedin", () => liCarousel(li, bytes, q.caption.replace("LINK", link(id, "linkedin"))));
      }
    } else {
      if (meta) {
        rec.ig = await tryIt("instagram reel", () => igReel(meta, q.videoUrl, q.caption));
        rec.fb = await tryIt("facebook reel", () => fbReel(meta, q.videoUrl, q.caption));
      }
      if (li) {
        const video = Buffer.from(await (await fetch(q.videoUrl)).arrayBuffer());
        rec.li = await tryIt("linkedin video", () => liVideoPost(li, video, q.title, `${q.caption}\n\nhttps://aibroadsheet.com/originals?utm_source=linkedin&utm_medium=social&utm_campaign=daily`));
      }
    }
    // Remembered once anything went out, so a partial success is never posted twice; a full failure retries next run.
    if (rec.ig || rec.fb || rec.li) state.posted[q.key] = rec;
  }
  await writeFile(join(STORE, "state.json"), JSON.stringify(state, null, 2));
}

if (MODE === "build") await build();
else if (MODE === "publish") await publish();
else { console.error("usage: run.ts build|publish --store <dir>"); process.exit(2); }
