import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/public/news-feeds
 *
 * Server-side RSS/Atom aggregator for the hero + tickers.
 * Same pattern as /api/public/ottawa-traffic: in-memory cache, 5 min TTL,
 * stale-cache-on-failure, one bad feed never blocks the rest.
 */

export type FeedRegion = "ottawa" | "canada";

export type FeedItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  region: FeedRegion;
  publishedAt: string;
  image?: string;
  urgent: boolean;
};

type SourceStatus = { name: string; region: FeedRegion; ok: boolean; count: number; error?: string };
type Payload = { items: FeedItem[]; sources: SourceStatus[] };
type CacheEntry = { ts: number; payload: Payload };

const g = globalThis as unknown as { __ottNews?: CacheEntry };
const TTL_MS = 5 * 60 * 1000;
const UA = "Mozilla/5.0 (compatible; OttawaCivicLedger/1.0; +civic-news)";

const SOURCES: { name: string; region: FeedRegion; url: string; headers?: Record<string, string>; filter?: (title: string, author: string) => boolean }[] = [
  { name: "CBC Ottawa", region: "ottawa", url: "https://www.cbc.ca/webfeed/rss/rss-canada-ottawa" },
  {
    name: "City of Ottawa",
    region: "ottawa",
    url: "https://ottawa.ca/en/rss.xml",
    // ottawa.ca sits behind Imperva bot protection — a fuller, real-browser
    // header set sometimes gets through where a bare User-Agent doesn't.
    // If this still fails, this source should simply be removed rather
    // than left permanently red in the admin dashboard.
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-CA,en;q=0.9",
      "Referer": "https://ottawa.ca/",
    },
  },
  { name: "Global News Ottawa", region: "ottawa", url: "https://globalnews.ca/ottawa/feed/" },
  { name: "CTV News Ottawa", region: "ottawa", url: "https://www.ctvnews.ca/arc/outboundfeeds/rss/category/ottawa/?outputType=xml" },
  {
    // canada.ca does not expose per-department RSS any more; the Canada News Centre
    // Atom feed is filtered down to CRA / ESDC (benefits, tax, EI, CPP).
    name: "Government of Canada — CRA / ESDC",
    region: "canada",
    url: "https://api.io.canada.ca/io-server/gc/news/en/v2?sort=publishedDate&orderBy=desc&pick=100&format=atom&atomtitle=Canada%20News%20Centre",
    filter: (title, author) => {
      const a = author.toLowerCase();
      if (a.includes("revenue agency") || a.includes("employment and social development")) return true;
      const t = title.toLowerCase();
      return /\b(benefit|tax|gst|hst|canada child|employment insurance|\bei\b|\bcpp\b|pension|payment date|rrsp|tfsa)\b/.test(t);
    },
  },
];

const URGENT_RE = /\b(breaking|urgent|alert|emergency|evacuat|warning|closure|closed|shut down|amber alert|urgence|alerte)\b/i;

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&(?:lsquo|rsquo);/g, "'")
    .replace(/&(?:ldquo|rdquo);/g, '"')
    .replace(/&(?:ndash|mdash);/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

function firstImage(block: string): string | undefined {
  const media = block.match(/<(?:media:content|media:thumbnail|enclosure)[^>]*url=["']([^"']+)["']/i);
  if (media) return media[1];
  const inline = block.match(/<img[^>]*src=['"]([^'"]+)['"]/i);
  if (inline) return inline[1];
  const encoded = block.match(/&lt;img[^&]*src=['"]([^'"]+)['"]/i);
  if (encoded) return encoded[1];
  return undefined;
}

function parseFeed(xml: string, src: (typeof SOURCES)[number]): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const out: FeedItem[] = [];
  for (const b of blocks) {
    const title = tag(b, "title");
    if (!title) continue;
    const author = tag(b, "name") || tag(b, "dc:creator") || "";
    if (src.filter && !src.filter(title, author)) continue;
    let link = tag(b, "link");
    if (!link) {
      const href = b.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = href ? href[1] : "";
    }
    const dateRaw = tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date");
    const d = dateRaw ? new Date(dateRaw) : new Date();
    const publishedAt = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    out.push({
      id: `${src.name}:${link || title}`.slice(0, 200),
      title,
      link,
      source: src.name,
      region: src.region,
      publishedAt,
      image: firstImage(b),
      urgent: URGENT_RE.test(title),
    });
  }
  return out.slice(0, 25);
}

async function fetchAll(): Promise<Payload> {
  const results = await Promise.all(
    SOURCES.map(async (src): Promise<{ status: SourceStatus; items: FeedItem[] }> => {
      try {
        const res = await fetch(src.url, {
          headers: {
            "User-Agent": UA,
            Accept: "application/rss+xml, application/xml, text/xml, */*",
            ...src.headers,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        if (!/<(rss|feed)[\s>]/i.test(xml)) throw new Error("Not an XML feed (blocked or HTML response)");
        let items = parseFeed(xml, src);
        if (items.length === 0 && src.filter) {
          // No CRA/ESDC releases in the current window — keep the CANADA lane
          // populated with the latest Government of Canada items instead.
          items = parseFeed(xml, { ...src, filter: undefined }).slice(0, 8);
        }
        return { status: { name: src.name, region: src.region, ok: true, count: items.length }, items };
      } catch (e: any) {
        console.error(`[news-feeds] ${src.name} failed: ${e?.message ?? e}`);
        return { status: { name: src.name, region: src.region, ok: false, count: 0, error: String(e?.message ?? e) }, items: [] };
      }
    }),
  );

  const seen = new Set<string>();
  const items = results
    .flatMap(r => r.items)
    .filter(i => {
      const k = i.title.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return b.publishedAt.localeCompare(a.publishedAt);
    })
    .slice(0, 60);

  return { items, sources: results.map(r => r.status) };
}

export const Route = createFileRoute("/api/public/news-feeds")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        const cached = g.__ottNews;
        if (cached && now - cached.ts < TTL_MS) {
          return Response.json({ ok: true, cached: true, fetchedAt: new Date(cached.ts).toISOString(), ...cached.payload });
        }
        try {
          const payload = await fetchAll();
          if (payload.items.length > 0) g.__ottNews = { ts: now, payload };
          return Response.json({ ok: true, cached: false, fetchedAt: new Date(now).toISOString(), ...payload });
        } catch (e: any) {
          if (cached) {
            return Response.json({
              ok: true, cached: true, stale: true,
              fetchedAt: new Date(cached.ts).toISOString(),
              ...cached.payload, error: "Upstream unavailable, served cache.",
            });
          }
          return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e), items: [], sources: [] }), {
            status: 502, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
