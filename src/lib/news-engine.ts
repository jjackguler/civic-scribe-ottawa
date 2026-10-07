/**
 * Server-side AI news aggregator. Imported only from the server function in
 * news.ts, so none of this ships to the browser.
 */
import { NEWS_SOURCES, type NewsSource, type Region, type Topic, type Kind, type Level } from "./news-sources";
import { AI_RE, tagsOf } from "./classify";

export type Story = {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceId: string;
  region: Region;
  /** Primary desk. */
  topic: Topic;
  /** Every desk the story belongs to (primary first). */
  tags: Topic[];
  lang: "en" | "fr";
  publishedAt: string;
  image: string | null;
  kind: Kind;
  gov: boolean;
  lab: boolean;
  /** Government level: set for government feeds, or inferred for news about a city or province. */
  level: Level | null;
  /** Release from, or coverage of, Canada's Minister of AI and Digital Innovation. */
  minister: boolean;
  /** Community signal for trending items: Hacker News points/comments or paper upvotes. */
  popularity?: { score: number; comments?: number; discussUrl?: string };
};

export type SourceStatus = { id: string; name: string; ok: boolean; count: number; checkedAt?: string; error?: string };
export type NewsPayload = { stories: Story[]; sources: SourceStatus[]; fetchedAt: string };

const UA = "Mozilla/5.0 (compatible; AIBroadsheet/1.0; +https://aibroadsheet.com)";
const CACHE_MS = 3 * 60 * 1000;          // rebuild the payload at most every 3 minutes
const FAST_TTL = 8 * 60 * 1000;           // newsroom feeds
const SLOW_TTL = 30 * 60 * 1000;          // feeds that rarely change
const MAX_AGE_DAYS = 30;
const MINISTER_MAX_AGE_DAYS = 120;        // the ministry tracker keeps a longer record
// Cloudflare Workers cap outgoing requests per invocation, so each rebuild
// spends a fixed budget: overdue feeds first, then publisher photos.
const SUBREQUEST_BUDGET = 44;
const MAX_FEEDS_PER_RUN = 30;
const MAX_OG_LOOKUPS = 14;

type SourceCache = { ts: number; ok: boolean; stories: Story[]; error?: string };

const g = globalThis as unknown as {
  __mwNews?: { ts: number; payload: NewsPayload };
  __mwNewsInflight?: Promise<NewsPayload>;
  __ogCache?: Map<string, string | null>;
  __mwSrc?: Map<string, SourceCache>;
};

// ── text helpers ────────────────────────────────────────────────────────────
function decodeEntities(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&(?:lsquo|rsquo);/g, "'")
    .replace(/&(?:ldquo|rdquo);/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/&(?:ndash|mdash);/g, "—")
    .replace(/&amp;/g, "&");
}
const stripTags = (s: string) => decodeEntities(decodeEntities(s).replace(/<[^>]+>/g, " ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function raw(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
}

function truncate(s: string, max = 230) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "") + "…";
}

const BAD_IMG = /(pixel|1x1|gravatar|feedburner|blank\.gif|spacer|logo|avatar|emoji)/i;

function firstImage(block: string): string | null {
  const candidates: string[] = [];
  const tagRe = /<(?:media:content|media:thumbnail|enclosure)\b[^>]*>/gi;
  for (const tag of block.match(tagRe) ?? []) {
    const url = tag.match(/url=["']([^"']+)["']/i)?.[1];
    const type = tag.match(/type=["']([^"']+)["']/i)?.[1] ?? "";
    if (url && (!type || type.startsWith("image"))) candidates.push(url);
  }
  const html = decodeEntities(block);
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) candidates.push(m[1]);
  const pick = candidates.map(decodeEntities).find(u => /^https?:\/\//.test(u) && !BAD_IMG.test(u));
  return pick ?? null;
}

// ── classification ──────────────────────────────────────────────────────────
const MINISTER_RE = /(Evan Solomon|Minister Solomon|ministre Solomon|Minister of Artificial Intelligence|ministre de l[’']Intelligence artificielle|AI minister|ministre de l[’']IA)/i;
const MUNI_RE = /\b(city council|councill?ors?|mayor|municipal\w*|city hall|City of [A-Z][a-z]+|Ville de|conseil municipal|maire|mairesse|police services? board|school boards?|TTC|OC Transpo|STM)\b/;
const PROV_RE = /\b(premier|provincial|provinces?|Queen's Park|Legislative Assembly|Assemblée nationale|gouvernement du Québec|Quebec government|Ontario government|B\.C\. government|Alberta government|Doug Ford|David Eby|Danielle Smith)\b/i;
const CANADA_RE = /\b(Canada|Canadian|Canadians|Ottawa|Toronto|Montr[ée]al|Vancouver|Calgary|Edmonton|Waterloo|Ontario|Qu[ée]bec|Alberta|British Columbia|Manitoba|Saskatchewan|Nova Scotia|New Brunswick|Mila|Vector Institute|Amii|Cohere|Carney|Solomon|Shopify)\b/i;

function tagsFor(text: string, src: NewsSource): Topic[] {
  if (src.kind === "gov") return (["policy", ...tagsOf(text).filter(t => t !== "policy")] as Topic[]).slice(0, 4);
  return tagsOf(text, src.beat);
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function parseFeed(xml: string, src: NewsSource): Story[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const out: Story[] = [];
  const cutoff = Date.now() - (src.minister ? MINISTER_MAX_AGE_DAYS : MAX_AGE_DAYS) * 86400000;
  for (const b of blocks) {
    const title = stripTags(raw(b, "title"));
    if (!title) continue;
    let link = stripTags(raw(b, "link"));
    if (!link) link = b.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "";
    if (!/^https?:\/\//.test(link)) continue;
    if (src.linkRewrite && link.startsWith(src.linkRewrite[0])) link = src.linkRewrite[1] + link.slice(src.linkRewrite[0].length);

    const summary = truncate(stripTags(raw(b, "description") || raw(b, "summary") || raw(b, "content")));
    const text = `${title} ${summary}`;
    const aboutAi = src.aiOnly || AI_RE.test(text);
    if (!aboutAi && !src.beat) continue;

    const dateRaw = stripTags(raw(b, "pubDate") || raw(b, "published") || raw(b, "updated") || raw(b, "dc:date"));
    const d = dateRaw ? new Date(dateRaw) : null;
    if (!d || isNaN(d.getTime()) || d.getTime() < cutoff || d.getTime() > Date.now() + 3600000) continue;

    const region: Region = src.region === "canada" || CANADA_RE.test(text) ? "canada" : "world";
    const level: Level | null = src.level ?? (region !== "canada" ? null : MUNI_RE.test(text) ? "municipal" : PROV_RE.test(text) ? "provincial" : null);
    const tags = tagsFor(text, src);
    out.push({
      id: hash(link),
      title,
      summary: summary === title ? "" : summary,
      link,
      source: src.name,
      sourceId: src.id,
      region,
      topic: tags[0],
      tags,
      lang: src.lang,
      publishedAt: d.toISOString(),
      image: src.kind === "gov" ? null : firstImage(b),
      // A specialist newsroom's AI stories join the main news file.
      kind: src.kind === "beat" && aboutAi ? "news" : src.kind,
      gov: src.kind === "gov",
      lab: src.kind === "lab",
      level,
      minister: !!src.minister || MINISTER_RE.test(text),
    });
  }
  return out.slice(0, src.minister ? 40 : 30);
}

async function fetchText(url: string, ms: number) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*" },
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return readCapped(res, 600_000);
}

/** Feeds list newest first, so the first ~600 KB holds everything we use. */
export async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return (await res.text()).slice(0, maxBytes);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < maxBytes) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    size += value.byteLength;
  }
  reader.cancel().catch(() => {});
  const buf = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
  return new TextDecoder("utf-8").decode(buf);
}

/** Publisher's own share photo (og:image) for stories whose feed carried none. */
async function lookupOgImage(link: string): Promise<string | null> {
  const cache = (g.__ogCache ??= new Map());
  if (cache.has(link)) return cache.get(link) ?? null;
  let img: string | null = null;
  try {
    const html = (await fetchText(link, 4000)).slice(0, 300_000);
    const m =
      html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/i);
    if (m) {
      const u = new URL(decodeEntities(m[1]), link).toString();
      if (!BAD_IMG.test(u)) img = u;
    }
  } catch {}
  if (cache.size > 600) cache.clear();
  cache.set(link, img);
  return img;
}

function baseStory(src: NewsSource, title: string, link: string, date: Date, extra: Partial<Story> = {}): Story {
  const text = `${title} ${extra.summary ?? ""}`;
  const tags = extra.topic ? [extra.topic, ...tagsOf(text).filter(t => t !== extra.topic)].slice(0, 4) : tagsFor(text, src);
  return {
    id: hash(link), title, summary: "", link, source: src.name, sourceId: src.id,
    region: CANADA_RE.test(text) ? "canada" : src.region, topic: tags[0], tags, lang: src.lang,
    publishedAt: date.toISOString(), image: null, kind: src.kind, gov: false, lab: src.kind === "lab",
    level: null, minister: MINISTER_RE.test(text), ...extra,
  };
}

/** Anthropic has no feed; its newsroom page lists date, category and title for each post. */
function parseAnthropic(html: string, src: NewsSource): Story[] {
  const out: Story[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a[^>]+href="(\/news\/[a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (seen.has(m[1])) continue;
    const parts = m[2].split(/<[^>]+>/).map(x => stripTags(x)).filter(Boolean);
    const dateIdx = parts.findIndex(x => /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(x));
    if (dateIdx < 0) continue;
    const date = new Date(parts[dateIdx] + " 12:00 UTC");
    const title = parts.slice(dateIdx + 1).sort((a, b) => b.length - a.length)[0];
    if (!title || isNaN(date.getTime()) || date.getTime() < Date.now() - MAX_AGE_DAYS * 86400000) continue;
    seen.add(m[1]);
    out.push(baseStory(src, title, "https://www.anthropic.com" + m[1], date));
  }
  return out.slice(0, 12);
}

/** Hacker News (Algolia API): AI stories the tech community is upvoting. */
function parseHN(json: any, src: NewsSource): Story[] {
  const out: Story[] = [];
  for (const h of json?.hits ?? []) {
    if (!h?.title || !h.objectID) continue;
    const discussUrl = `https://news.ycombinator.com/item?id=${h.objectID}`;
    const link = typeof h.url === "string" && /^https?:\/\//.test(h.url) ? h.url : discussUrl;
    let via = "news.ycombinator.com";
    try { via = new URL(link).hostname.replace(/^www\./, ""); } catch {}
    const date = new Date(h.created_at);
    if (isNaN(date.getTime())) continue;
    out.push(baseStory(src, stripTags(h.title), link, date, {
      summary: via,
      popularity: { score: Number(h.points) || 0, comments: Number(h.num_comments) || 0, discussUrl },
    }));
  }
  return out.sort((a, b) => (b.popularity!.score - a.popularity!.score)).slice(0, 15);
}

/** Hugging Face daily papers: research the community is upvoting today. */
function parseHFPapers(json: any, src: NewsSource): Story[] {
  const out: Story[] = [];
  for (const x of Array.isArray(json) ? json : []) {
    const p = x?.paper ?? {};
    const id = p.id ?? x?.id;
    const title = stripTags(x?.title ?? p.title ?? "");
    const date = new Date(x?.publishedAt ?? p.publishedAt ?? "");
    if (!id || !title || isNaN(date.getTime())) continue;
    out.push(baseStory(src, title, `https://huggingface.co/papers/${id}`, date, {
      summary: truncate(stripTags(p.summary ?? ""), 200),
      topic: "research",
      image: typeof x?.thumbnail === "string" && /^https?:\/\//.test(x.thumbnail) ? x.thumbnail : null,
      popularity: { score: Number(p.upvotes ?? x?.upvotes) || 0, comments: Number(x?.numComments) || undefined },
    }));
  }
  return out.sort((a, b) => (b.popularity!.score - a.popularity!.score)).slice(0, 12);
}

async function fetchSource(src: NewsSource): Promise<SourceCache> {
  try {
    if (src.format === "hn") {
      const since = Math.floor(Date.now() / 1000) - 3 * 86400;
      const json = JSON.parse(await fetchText(`${src.url}&numericFilters=points%3E60,created_at_i%3E${since}`, 6000));
      return { ts: Date.now(), ok: true, stories: parseHN(json, src) };
    }
    if (src.format === "hf-papers") {
      return { ts: Date.now(), ok: true, stories: parseHFPapers(JSON.parse(await fetchText(src.url, 6000)), src) };
    }
    if (src.format === "anthropic-html") {
      const stories = parseAnthropic(await fetchText(src.url, 6000), src);
      if (!stories.length) throw new Error("Page layout changed");
      return { ts: Date.now(), ok: true, stories };
    }
    const xml = await fetchText(src.url, 6000);
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(xml)) throw new Error("Not a feed (blocked or HTML)");
    return { ts: Date.now(), ok: true, stories: parseFeed(xml, src) };
  } catch (e: any) {
    return { ts: Date.now(), ok: false, stories: [], error: String(e?.message ?? e) };
  }
}

const titleKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9àâçéèêëîïôûùüÿœ]+/g, " ").trim();

async function buildPayload(): Promise<NewsPayload> {
  const cache = (g.__mwSrc ??= new Map());
  const now = Date.now();

  // Which feeds are due? Never-fetched first, then the most overdue.
  const due = NEWS_SOURCES
    .map((src, order) => {
      const c = cache.get(src.id);
      const ttl = src.slow ? SLOW_TTL : FAST_TTL;
      const age = c ? now - c.ts : Infinity;
      // A failed feed is retried sooner, but not on every rebuild.
      const effTtl = c && !c.ok ? Math.min(ttl, 5 * 60 * 1000) : ttl;
      return { src, order, overdue: age - effTtl };
    })
    .filter(x => x.overdue >= 0)
    .sort((a, b) => (b.overdue === Infinity ? 1 : 0) - (a.overdue === Infinity ? 1 : 0) || a.order - b.order)
    .slice(0, MAX_FEEDS_PER_RUN);

  const fresh = await Promise.all(due.map(async ({ src }) => [src.id, await fetchSource(src)] as const));
  for (const [id, c] of fresh) {
    const prev = cache.get(id);
    // Keep the last good stories if a refresh fails.
    cache.set(id, c.ok || !prev ? c : { ...prev, ts: c.ts, ok: false, error: c.error });
  }

  // Merge every source's stories; duplicates (same headline) are merged, keeping flags.
  const byKey = new Map<string, Story>();
  for (const src of NEWS_SOURCES) {
    for (const s of cache.get(src.id)?.stories ?? []) {
      const k = (s.kind === "trending" ? "t:" : "") + titleKey(s.title);
      const seen = byKey.get(k);
      if (!seen) { byKey.set(k, { ...s }); continue; }
      seen.minister ||= s.minister;
      seen.level ??= s.level;
      seen.image ??= s.image;
    }
  }
  const all = [...byKey.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  // Government releases and the ministry record are kept in full; the rest is capped.
  const keep = new Set<Story>();
  all.filter(s => s.minister).slice(0, 50).forEach(s => keep.add(s));
  all.filter(s => s.gov).slice(0, 50).forEach(s => keep.add(s));
  all.filter(s => s.kind === "trending").forEach(s => keep.add(s));
  all.filter(s => s.kind === "beat").slice(0, 40).forEach(s => keep.add(s));
  all.filter(s => !s.gov && s.kind !== "trending" && s.kind !== "beat").slice(0, 160).forEach(s => keep.add(s));
  const stories = all.filter(s => keep.has(s));

  // Fill missing photos from the publisher's own og:image, newest first.
  const og = (g.__ogCache ??= new Map());
  for (const s of stories) if (!s.image && og.get(s.link)) s.image = og.get(s.link)!;
  const ogBudget = Math.max(0, Math.min(MAX_OG_LOOKUPS, SUBREQUEST_BUDGET - due.length));
  const needImage = stories.filter(s => !s.image && !s.gov && s.kind !== "trending" && !og.has(s.link)).slice(0, ogBudget);
  await Promise.all(needImage.map(async s => { s.image = await lookupOgImage(s.link); }));

  const sources: SourceStatus[] = NEWS_SOURCES.map(src => {
    const c = cache.get(src.id);
    return { id: src.id, name: src.name, ok: !!c?.ok, count: c?.stories.length ?? 0, checkedAt: c ? new Date(c.ts).toISOString() : undefined, error: c?.error };
  });
  return { stories, sources, fetchedAt: new Date().toISOString() };
}

export async function loadNews(): Promise<NewsPayload> {
  const cached = g.__mwNews;
  if (cached && Date.now() - cached.ts < CACHE_MS) return cached.payload;
  if (g.__mwNewsInflight) return g.__mwNewsInflight;
  g.__mwNewsInflight = buildPayload()
    .then(payload => {
      if (payload.stories.length > 0) g.__mwNews = { ts: Date.now(), payload };
      return payload.stories.length > 0 || !cached ? payload : cached.payload;
    })
    .catch(() => cached?.payload ?? { stories: [], sources: [], fetchedAt: new Date().toISOString() })
    .finally(() => { g.__mwNewsInflight = undefined; });
  return g.__mwNewsInflight;
}
