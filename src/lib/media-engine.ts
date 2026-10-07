/**
 * Server-side video and podcast desk. Imported only from the server function
 * in media.ts. Runs in its own request, so it has its own fetch budget.
 */
import { MEDIA_SOURCES, type MediaSource } from "./media-sources";
import { AI_RE, AI_TALK_RE, INTERVIEW_RE, tagsOf } from "./classify";
import { readCapped, withTimeout } from "./news-engine";
import type { Topic } from "./news-sources";

export type MediaItem = {
  id: string;
  type: "video" | "audio";
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceId: string;
  publishedAt: string;
  /** Channel thumbnail or episode artwork, served by the publisher. */
  image: string | null;
  videoId?: string;
  audioUrl?: string;
  /** Seconds, when the feed gives it. */
  duration?: number;
  views?: number;
  interview: boolean;
  newsroom: boolean;
  topic: Topic;
};

export type MediaStatus = { id: string; name: string; ok: boolean; count: number; feedTitle?: string; error?: string };
export type MediaPayload = { items: MediaItem[]; sources: MediaStatus[]; fetchedAt: string };

const UA = "Mozilla/5.0 (compatible; AIBroadsheet/1.0; +https://aibroadsheet.com)";
const CACHE_MS = 5 * 60 * 1000;
const SOURCE_TTL = 20 * 60 * 1000;
const MAX_FETCH_PER_RUN = 34;
const MAX_AGE_DAYS = 45;

type Cache = { ts: number; ok: boolean; items: MediaItem[]; feedTitle?: string; error?: string };
const g = globalThis as unknown as {
  __abMedia?: { ts: number; payload: MediaPayload };
  __abMediaInflight?: Promise<MediaPayload>;
  __abMediaSrc?: Map<string, Cache>;
};

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}
const text = (s: string) => decode(decode(s).replace(/<[^>]+>/g, " ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const tag = (b: string, name: string) => b.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "";
const attr = (b: string, name: string, a: string) => b.match(new RegExp(`<${name}\\b[^>]*\\b${a}=["']([^"']+)["']`, "i"))?.[1];

function short(s: string, max = 220) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "") + "…";
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function duration(raw: string): number | undefined {
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return Number(raw);
  const p = raw.split(":").map(Number);
  if (p.some(isNaN)) return undefined;
  return p.reduce((acc, n) => acc * 60 + n, 0);
}

function aboutAi(src: MediaSource, t: string) {
  if (!src.filter) return true;
  return AI_RE.test(t) || (!!src.interviews && AI_TALK_RE.test(t));
}

function parseYouTube(xml: string, src: MediaSource): { items: MediaItem[]; feedTitle?: string } {
  const feedTitle = text(tag(xml.split("<entry")[0], "title")) || undefined;
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  const items: MediaItem[] = [];
  for (const b of xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? []) {
    const videoId = text(tag(b, "yt:videoId"));
    const title = text(tag(b, "title"));
    const link = attr(b, "link", "href") ?? `https://www.youtube.com/watch?v=${videoId}`;
    if (!videoId || !title || link.includes("/shorts/")) continue;
    const date = new Date(text(tag(b, "published")));
    if (isNaN(date.getTime()) || date.getTime() < cutoff) continue;
    const description = text(tag(b, "media:description"));
    // Filter on title plus the first lines of the description (where the topic is stated).
    const t = `${title} ${description.slice(0, 280)}`;
    if (!aboutAi(src, t)) continue;
    const views = Number(attr(b, "media:statistics", "views"));
    items.push({
      id: `v${hash(videoId)}`,
      type: "video",
      title,
      summary: short(description.split(/\n|https?:\/\//)[0] ?? ""),
      link: `https://www.youtube.com/watch?v=${videoId}`,
      source: src.name,
      sourceId: src.id,
      publishedAt: date.toISOString(),
      image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      videoId,
      views: Number.isFinite(views) ? views : undefined,
      interview: !!src.interviews || INTERVIEW_RE.test(title),
      newsroom: !!src.newsroom,
      topic: tagsOf(t)[0],
    });
  }
  return { items: items.slice(0, 8), feedTitle };
}

function parsePodcast(xml: string, src: MediaSource): { items: MediaItem[]; feedTitle?: string } {
  const head = xml.split(/<item[\s>]/i)[0];
  const feedTitle = text(tag(head, "title")) || undefined;
  const showArt = attr(head, "itunes:image", "href") ?? (text(tag(tag(head, "image"), "url")) || null);
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  const items: MediaItem[] = [];
  for (const b of xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []) {
    const title = text(tag(b, "title"));
    const audioUrl = attr(b, "enclosure", "url");
    const type = attr(b, "enclosure", "type") ?? "audio/mpeg";
    if (!title || !audioUrl || !/^https:\/\//.test(audioUrl) || !type.startsWith("audio")) continue;
    const date = new Date(text(tag(b, "pubDate")));
    if (isNaN(date.getTime()) || date.getTime() < cutoff) continue;
    const description = text(tag(b, "itunes:summary") || tag(b, "description"));
    const t = `${title} ${description.slice(0, 280)}`;
    if (!aboutAi(src, t)) continue;
    const link = text(tag(b, "link"));
    items.push({
      id: `a${hash(audioUrl)}`,
      type: "audio",
      title,
      summary: short(description),
      link: /^https?:\/\//.test(link) ? link : src.home,
      source: src.name,
      sourceId: src.id,
      publishedAt: date.toISOString(),
      image: attr(b, "itunes:image", "href") ?? showArt,
      audioUrl: decode(audioUrl),
      duration: duration(text(tag(b, "itunes:duration"))),
      interview: !!src.interviews || INTERVIEW_RE.test(title),
      newsroom: false,
      topic: tagsOf(t)[0],
    });
  }
  return { items: items.slice(0, 6), feedTitle };
}

async function fetchSource(src: MediaSource): Promise<Cache> {
  const url = src.type === "youtube" ? `https://www.youtube.com/feeds/videos.xml?channel_id=${src.ref}` : src.ref;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await readCapped(res, src.type === "podcast" ? 450_000 : 300_000, 7000);
    if (!/<(rss|feed)[\s>]/i.test(xml)) throw new Error("Not a feed");
    const { items, feedTitle } = src.type === "youtube" ? parseYouTube(xml, src) : parsePodcast(xml, src);
    return { ts: Date.now(), ok: true, items, feedTitle };
  } catch (e: any) {
    return { ts: Date.now(), ok: false, items: [], error: String(e?.message ?? e) };
  }
}

async function build(): Promise<MediaPayload> {
  const cache = (g.__abMediaSrc ??= new Map());
  const now = Date.now();
  const due = MEDIA_SOURCES
    .filter(s => { const c = cache.get(s.id); return !c || now - c.ts > (c.ok ? SOURCE_TTL : 6 * 60 * 1000); })
    .slice(0, MAX_FETCH_PER_RUN);
  const fresh = await Promise.all(due.map(async s =>
    [s.id, await withTimeout(fetchSource(s), 10000, { ts: Date.now(), ok: false, items: [], error: "Timed out" } as Cache)] as const));
  for (const [id, c] of fresh) {
    const prev = cache.get(id);
    cache.set(id, c.ok || !prev ? c : { ...prev, ts: c.ts, ok: false, error: c.error });
  }
  const seen = new Set<string>();
  const items: MediaItem[] = [];
  for (const s of MEDIA_SOURCES) {
    for (const it of cache.get(s.id)?.items ?? []) {
      const key = it.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(it);
    }
  }
  items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const sources = MEDIA_SOURCES.map(s => {
    const c = cache.get(s.id);
    return { id: s.id, name: s.name, ok: !!c?.ok, count: c?.items.length ?? 0, feedTitle: c?.feedTitle, error: c?.error };
  });
  return { items, sources, fetchedAt: new Date().toISOString() };
}

export async function loadMedia(): Promise<MediaPayload> {
  const cached = g.__abMedia;
  if (cached && Date.now() - cached.ts < CACHE_MS) return cached.payload;
  if (g.__abMediaInflight) return g.__abMediaInflight;
  g.__abMediaInflight = withTimeout(build(), 15000, null as unknown as MediaPayload)
    .then(p => p ?? cached?.payload ?? { items: [], sources: [], fetchedAt: new Date().toISOString() })
    .then(p => {
      if (p.items.length > 0) g.__abMedia = { ts: Date.now(), payload: p };
      return p.items.length > 0 || !cached ? p : cached.payload;
    })
    .catch(() => cached?.payload ?? { items: [], sources: [], fetchedAt: new Date().toISOString() })
    .finally(() => { g.__abMediaInflight = undefined; });
  return g.__abMediaInflight;
}
