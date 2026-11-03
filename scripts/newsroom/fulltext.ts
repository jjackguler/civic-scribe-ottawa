/**
 * Full text for first-party announcements whose feed excerpt is too short to write from.
 *
 * Only the announcing party's own page: an AI lab's or company's post, or a government's news
 * release (Story.lab / Story.gov), and only when the link is on that source's own site
 * (news-sources.ts `home`). Third-party reporting is never fetched: newsrooms' feeds already give
 * the newsroom all they allow (content:encoded, see news-engine useNewsroomExcerpts), and their
 * terms (docs/feed-terms.md) limit reuse, so their bar is unchanged.
 *
 * Polite and bounded: robots.txt is read once per site and obeyed (an unreadable robots.txt
 * means no fetch), one request at a time, a few seconds each, a size cap, and a per-run cap.
 * No paid calls. The page text then counts as the source for the length bar in pick.ts.
 *
 *   const n = await enrichOfficial(stories, { log });
 */
import type { Story } from "../../src/lib/news-engine";
import { NEWS_SOURCES } from "../../src/lib/news-sources";

export const FULLTEXT_UA = "AIBroadsheetNewsroom/1.0 (+https://aibroadsheet.com/standards)";
/** Below this many characters of excerpt, an official item gets its page fetched. */
export const SHORT_EXCERPT = 600;
/** Most of the page text the newsroom keeps (pick.ts passes up to OFFICIAL_EXCERPT of it to the writer). */
const KEEP = 4000;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", ecirc: "ê", ocirc: "ô", icirc: "î", ucirc: "û", acirc: "â" };
const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
  .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n: string) => ENTITIES[n.toLowerCase()] ?? m);

/**
 * The readable text of an article page: paragraphs and list items inside <article> (or <main>,
 * or the whole body), without scripts, navigation, headers, footers, forms or asides.
 */
export function extractText(html: string): string {
  let h = html.replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|form|nav|header|footer|aside|button|select)\b[\s\S]*?<\/\1>/gi, " ");
  const pick = (tag: string) => {
    const all = [...h.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))].map(m => m[1]);
    return all.sort((a, b) => b.length - a.length)[0];
  };
  h = pick("article") ?? pick("main") ?? h;
  const blocks = [...h.matchAll(/<(p|li|h2|h3|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(m => decode(m[2].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter(t => t.length >= 25 && !/^(share|partager|subscribe|abonnez|cookie|follow us|suivez-nous|related|read more|lire aussi)\b/i.test(t));
  // Same line twice (a pull quote, a repeated caption) counts once.
  return [...new Set(blocks)].join("\n").trim();
}

/** Whether robots.txt lets `ua` fetch `path`: its own group, else `*`; longest matching rule wins; Allow wins ties. */
export function robotsAllows(robots: string, path: string, ua = FULLTEXT_UA): boolean {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  let cur: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [k, v] = [m[1].toLowerCase(), m[2].trim()];
    if (k === "user-agent") {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(v.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (cur && (k === "allow" || k === "disallow") && v) cur.rules.push({ allow: k === "allow", path: v });
    }
  }
  const name = ua.toLowerCase().split("/")[0];
  const mine = groups.filter(g => g.agents.some(a => a !== "*" && name.includes(a)));
  const rules = (mine.length ? mine : groups.filter(g => g.agents.includes("*"))).flatMap(g => g.rules);
  const matches = (pattern: string) => {
    const re = new RegExp("^" + pattern.split("*").map(x => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*").replace(/\\\$$/, "$"));
    return re.test(path);
  };
  let best: { allow: boolean; len: number } | null = null;
  for (const r of rules) {
    if (!matches(r.path)) continue;
    if (!best || r.path.length > best.len || (r.path.length === best.len && r.allow)) best = { allow: r.allow, len: r.path.length };
  }
  return best ? best.allow : true;
}

const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
/** The link is on the announcing source's own site (same host or a subdomain of it). */
export function onOwnSite(link: string, home: string): boolean {
  const a = hostOf(link), b = hostOf(home);
  if (!a || !b) return false;
  const root = (h: string) => h.split(".").slice(-2).join(".");
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`) || root(a) === root(b);
}

/** First-party items with a short excerpt, newest first. */
export function officialCandidates(stories: Story[], min = SHORT_EXCERPT): Story[] {
  const home = new Map(NEWS_SOURCES.map(s => [s.id, s.home]));
  return stories
    .filter(s => (s.lab || s.gov) && s.kind !== "trending" && (s.summary?.length ?? 0) < min && onOwnSite(s.link, home.get(s.sourceId) ?? ""))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;
export type EnrichOptions = { max?: number; timeoutMs?: number; maxBytes?: number; budgetMs?: number; fetch?: Fetch; log?: (s: string) => void };

async function readCapped(r: Response, maxBytes: number): Promise<string> {
  if (!r.body) return (await r.text()).slice(0, maxBytes);
  const reader = r.body.getReader();
  const chunks: Uint8Array[] = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value); n += value.length;
    if (n >= maxBytes) { await reader.cancel().catch(() => {}); break; }
  }
  return new TextDecoder().decode(Buffer.concat(chunks.map(c => Buffer.from(c))).subarray(0, maxBytes));
}

/**
 * Replaces the short excerpt of up to `max` first-party items with their page's text, when the
 * page allows it and gives more. Returns how many items were filled. Never throws.
 */
export async function enrichOfficial(stories: Story[], opts: EnrichOptions = {}): Promise<number> {
  const { max = 8, timeoutMs = 8000, maxBytes = 1_500_000, budgetMs = 60_000, log = () => {} } = opts;
  const doFetch: Fetch = opts.fetch ?? ((u, i) => fetch(u, i));
  const started = Date.now();
  const robots = new Map<string, string | null>();
  const get = async (url: string) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      return await doFetch(url, { headers: { "user-agent": FULLTEXT_UA, accept: "text/html,text/plain;q=0.8" }, redirect: "follow", signal: ctl.signal });
    } finally { clearTimeout(t); }
  };
  let filled = 0, tried = 0;
  for (const s of officialCandidates(stories)) {
    if (tried >= max || Date.now() - started > budgetMs) break;
    let url: URL;
    try { url = new URL(s.link); } catch { continue; }
    if (!robots.has(url.origin)) {
      try {
        const r = await get(`${url.origin}/robots.txt`);
        // No robots.txt: allowed. Any other failure: we can't tell, so we don't fetch.
        robots.set(url.origin, r.ok ? await readCapped(r, 200_000) : r.status === 404 || r.status === 410 ? "" : null);
      } catch { robots.set(url.origin, null); }
    }
    const rules = robots.get(url.origin);
    if (rules === null || rules === undefined || !robotsAllows(rules, url.pathname + url.search)) { log(`  full text: ${url.host} does not allow it (robots.txt)`); continue; }
    tried++;
    try {
      const r = await get(url.href);
      if (!r.ok || !/text\/html|text\/plain|xhtml/i.test(r.headers.get("content-type") ?? "")) { log(`  full text: ${url.host} answered ${r.status}`); continue; }
      const text = extractText(await readCapped(r, maxBytes));
      if (text.length <= (s.summary?.length ?? 0) || text.length < 200) continue;
      s.summary = text.slice(0, KEEP);
      filled++;
      log(`  full text: ${s.source}, ${text.length} characters from its own page`);
    } catch (e) {
      log(`  full text: ${url.host} failed (${(e as Error).name})`);
    }
  }
  return filled;
}
