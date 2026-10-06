/**
 * Server-side AI news aggregator. Imported only from the server function in
 * news.ts, so none of this ships to the browser.
 */
import { NEWS_SOURCES, type NewsSource, type Region, type Topic } from "./news-sources";

export type Story = {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceId: string;
  region: Region;
  topic: Topic;
  lang: "en" | "fr";
  publishedAt: string;
  image: string | null;
  gov: boolean;
  lab: boolean;
};

export type SourceStatus = { id: string; name: string; ok: boolean; count: number; error?: string };
export type NewsPayload = { stories: Story[]; sources: SourceStatus[]; fetchedAt: string };

const UA = "Mozilla/5.0 (compatible; MapleWireNews/1.0; +https://maplewire.ca)";
const CACHE_MS = 8 * 60 * 1000;
const MAX_AGE_DAYS = 30;
const MAX_OG_LOOKUPS = 20;

const g = globalThis as unknown as {
  __mwNews?: { ts: number; payload: NewsPayload };
  __mwNewsInflight?: Promise<NewsPayload>;
  __ogCache?: Map<string, string | null>;
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
const AI_RE = /\b(A\.?I\.?|artificial intelligence|machine learning|deep learning|neural net\w*|LLMs?|large language models?|generative|chatbots?|ChatGPT|OpenAI|Anthropic|Claude|Gemini|Copilot|Mistral|Cohere|DeepSeek|Llama|Nvidia|GPUs?|data cent(?:er|re)s?|humanoid robots?|AI agents?|intelligence artificielle|IA)\b/;
const CANADA_RE = /\b(Canada|Canadian|Canadians|Ottawa|Toronto|Montr[ée]al|Vancouver|Calgary|Edmonton|Waterloo|Ontario|Qu[ée]bec|Alberta|British Columbia|Manitoba|Saskatchewan|Nova Scotia|New Brunswick|Mila|Vector Institute|Amii|Cohere|Carney|Solomon|Shopify)\b/i;

function topicOf(text: string, src: NewsSource): Topic {
  if (src.gov) return "policy";
  if (/\b(regulat\w*|laws?|legislat\w*|bill C-|government|minister|parliament|senate|congress|EU\b|ban(?:s|ned)?|lawsuits?|court|copyright|safety|privacy|election|sovereign|strategy|policy|politique)\b/i.test(text)) return "policy";
  if (/\b(raises?|raised|funding round|Series [A-E]|invest\w*|startups?|acqui\w+|valuation|IPO|revenue|layoffs?|jobs?|hiring|billion|million|stock|shares|market)\b/i.test(text)) return "business";
  if (src.lab || /\b(research\w*|study|studies|paper|benchmark|open[- ]source|open-weight|scientists?|universit\w+|model)\b/i.test(text)) return "research";
  if (/\b(launch\w*|releases?|released|feature|app|update|rolls? out|available|announc\w+|devices?|glasses|phone)\b/i.test(text)) return "products";
  return "society";
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function parseFeed(xml: string, src: NewsSource): Story[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const out: Story[] = [];
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  for (const b of blocks) {
    const title = stripTags(raw(b, "title"));
    if (!title) continue;
    let link = stripTags(raw(b, "link"));
    if (!link) link = b.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "";
    if (!/^https?:\/\//.test(link)) continue;

    const summary = truncate(stripTags(raw(b, "description") || raw(b, "summary") || raw(b, "content")));
    const text = `${title} ${summary}`;
    if (!src.aiOnly && !AI_RE.test(text)) continue;

    const dateRaw = stripTags(raw(b, "pubDate") || raw(b, "published") || raw(b, "updated") || raw(b, "dc:date"));
    const d = dateRaw ? new Date(dateRaw) : null;
    if (!d || isNaN(d.getTime()) || d.getTime() < cutoff || d.getTime() > Date.now() + 3600000) continue;

    const region: Region = src.region === "canada" || CANADA_RE.test(text) ? "canada" : "world";
    out.push({
      id: hash(link),
      title,
      summary: summary === title ? "" : summary,
      link,
      source: src.name,
      sourceId: src.id,
      region,
      topic: topicOf(text, src),
      lang: src.lang,
      publishedAt: d.toISOString(),
      image: src.gov ? null : firstImage(b),
      gov: !!src.gov,
      lab: !!src.lab,
    });
  }
  return out.slice(0, 30);
}

async function fetchText(url: string, ms: number) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*" },
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
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

async function buildPayload(): Promise<NewsPayload> {
  const results = await Promise.all(
    NEWS_SOURCES.map(async (src) => {
      try {
        const xml = await fetchText(src.url, 6000);
        if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(xml)) throw new Error("Not a feed (blocked or HTML)");
        const stories = parseFeed(xml, src);
        return { status: { id: src.id, name: src.name, ok: true, count: stories.length } as SourceStatus, stories };
      } catch (e: any) {
        return { status: { id: src.id, name: src.name, ok: false, count: 0, error: String(e?.message ?? e) } as SourceStatus, stories: [] as Story[] };
      }
    }),
  );

  const seen = new Set<string>();
  const stories = results
    .flatMap(r => r.stories)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter(s => {
      const k = s.title.toLowerCase().replace(/[^a-z0-9àâçéèêëîïôûùüÿœ]+/g, " ").trim();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 90);

  // Fill missing photos from the publisher's own og:image, newest first.
  const needImage = stories.filter(s => !s.image && !s.gov).slice(0, MAX_OG_LOOKUPS);
  await Promise.all(needImage.map(async s => { s.image = await lookupOgImage(s.link); }));

  return { stories, sources: results.map(r => r.status), fetchedAt: new Date().toISOString() };
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
