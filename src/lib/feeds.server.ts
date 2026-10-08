/**
 * Server-only builders for /sitemap.xml and /rss.xml (+ /fr/rss.xml).
 * Imported dynamically from the server route handlers.
 */
import { SITE } from "./site";
import { ORIGIN, absUrl } from "./seo";
import type { Locale } from "./i18n";
import { GUIDES } from "./guides";
import { EDITORIALS } from "./editorials";
import { TOPICS } from "./news";
import { loadNews, withTimeout, type NewsPayload, type Story } from "./news-engine";

// XML 1.0 forbids most control characters; one in a feed item would break the whole file.
const esc = (s: string) =>
  s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** The news desk as it stands, without waiting long for slow feeds. */
async function currentNews(): Promise<NewsPayload | null> {
  // A cold isolate needs up to ~14 s to build the desk (loadNews has its own limit).
  return withTimeout(loadNews().catch(() => null), 16000, null);
}

const isPublic = (s: Story) => s.kind !== "trending" && s.kind !== "beat";

type Entry = { path: string; changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly"; priority: string; lastmod?: string };

/** Fixed pages. Only the front page and the live news desk change "always". */
const STATIC: Entry[] = [
  { path: "/", changefreq: "always", priority: "1.0" },
  { path: "/news", changefreq: "always", priority: "0.9" },
  { path: "/watch", changefreq: "hourly", priority: "0.7" },
  { path: "/showcase", changefreq: "hourly", priority: "0.7" },
  { path: "/listen", changefreq: "daily", priority: "0.6" },
  { path: "/interviews", changefreq: "daily", priority: "0.6" },
  { path: "/government", changefreq: "hourly", priority: "0.7" },
  { path: "/ministry", changefreq: "hourly", priority: "0.7" },
  { path: "/funding", changefreq: "weekly", priority: "0.7" },
  { path: "/tools", changefreq: "weekly", priority: "0.5" },
  { path: "/learn", changefreq: "weekly", priority: "0.6" },
  { path: "/editor", changefreq: "weekly", priority: "0.6" },
  { path: "/advertise", changefreq: "monthly", priority: "0.4" },
  { path: "/newsletter", changefreq: "monthly", priority: "0.4" },
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/standards", changefreq: "monthly", priority: "0.3" },
  { path: "/corrections", changefreq: "weekly", priority: "0.3" },
  { path: "/privacy", changefreq: "monthly", priority: "0.2" },
  { path: "/terms", changefreq: "monthly", priority: "0.2" },
];

function urlEntry(e: Entry) {
  const alt = (["en", "fr"] as Locale[])
    .map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(absUrl(e.path, l))}"/>`)
    .join("") + `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(absUrl(e.path, "en"))}"/>`;
  return (["en", "fr"] as Locale[])
    .map(l =>
      `<url><loc>${esc(absUrl(e.path, l))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority>${alt}</url>`,
    )
    .join("\n");
}

export async function buildSitemap(): Promise<string> {
  const entries: Entry[] = [...STATIC];
  for (const tp of TOPICS) entries.push({ path: `/news?section=${tp.id}`, changefreq: "hourly", priority: "0.6" });
  for (const id of ["world", "canada", "labs", "analysis"]) entries.push({ path: `/news?section=${id}`, changefreq: "hourly", priority: "0.6" });
  for (const g of GUIDES) entries.push({ path: `/learn/${g.slug}`, changefreq: "monthly", priority: "0.5" });
  for (const e of EDITORIALS) entries.push({ path: `/editor/${e.slug}`, changefreq: "monthly", priority: "0.5", lastmod: e.date });

  const news = await currentNews();
  for (const s of (news?.stories ?? []).filter(isPublic).slice(0, 400)) {
    entries.push({ path: `/story/${s.id}`, changefreq: "daily", priority: "0.5", lastmod: s.publishedAt.slice(0, 10) });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(urlEntry).join("\n")}
</urlset>
`;
}

function excerpt(s: string, max = 240) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** null when the desk has no stories yet (cold start): the route answers 503 so readers keep their last copy. */
export async function buildRss(locale: Locale): Promise<string | null> {
  const fr = locale === "fr";
  const news = await currentNews();
  const all = (news?.stories ?? []).filter(isPublic);
  if (all.length === 0) return null;
  // French readers get French-language sources first, as on the site.
  const ordered = fr ? [...all.filter(s => s.lang === "fr"), ...all.filter(s => s.lang !== "fr")] : all;
  const items = ordered
    .slice(0, 60)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(s => {
      const link = absUrl(`/story/${s.id}`, locale);
      const body = `${s.summary ? `${excerpt(s.summary)} ` : ""}${fr ? `Source : ${s.source}.` : `Source: ${s.source}.`}`;
      return `<item>
  <title>${esc(s.title)}</title>
  <link>${esc(link)}</link>
  <guid isPermaLink="true">${esc(link)}</guid>
  <pubDate>${new Date(s.publishedAt).toUTCString()}</pubDate>
  <source url="${esc(s.link)}">${esc(s.source)}</source>
  <description>${esc(body)}</description>
</item>`;
    })
    .join("\n");

  const self = absUrl("/rss.xml", locale);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(SITE.name)}${fr ? " (français)" : ""}</title>
  <link>${esc(absUrl("/", locale))}</link>
  <atom:link href="${esc(self)}" rel="self" type="application/rss+xml"/>
  <description>${esc(SITE.description[locale])}</description>
  <language>${fr ? "fr-ca" : "en-ca"}</language>
  <lastBuildDate>${new Date(news?.fetchedAt ?? Date.now()).toUTCString()}</lastBuildDate>
  <ttl>10</ttl>
  <image><url>${ORIGIN}/logo-512.png</url><title>${esc(SITE.name)}</title><link>${esc(absUrl("/", locale))}</link></image>
${items}
</channel>
</rss>
`;
}

/** Google News sitemap: stories from the last 48 hours, in both languages. */
export async function buildNewsSitemap(): Promise<string> {
  const news = await currentNews();
  const cutoff = Date.now() - 48 * 3600_000;
  const recent = (news?.stories ?? []).filter(s => isPublic(s) && new Date(s.publishedAt).getTime() >= cutoff).slice(0, 450);
  const entry = (s: Story, l: Locale) => {
    const title = s.ai?.[l]?.title || s.title;
    return `<url><loc>${esc(absUrl(`/story/${s.id}`, l))}</loc><news:news><news:publication><news:name>${esc(SITE.name)}</news:name><news:language>${l}</news:language></news:publication><news:publication_date>${s.publishedAt}</news:publication_date><news:title>${esc(title)}</news:title></news:news></url>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent.flatMap(s => [entry(s, "en"), entry(s, "fr")]).join("\n")}
</urlset>
`;
}
