/**
 * Server-only "pulse" desk: what people are building with AI this week, and
 * what Canada and the U.S. are searching for. Imported only from pulse.ts.
 *
 * - Built with AI: Show HN posts about AI (Hacker News, ranked by points)
 * - Open source rising: new GitHub repositories tagged llm / ai-agents, by stars
 * - Try it: trending Hugging Face Spaces (live demos)
 * - Search trends: Google Trends daily trending searches, Canada and U.S.
 *
 * Every item links to where it was made and credits its maker. Adult or
 * "uncensored" projects are filtered out (brand safety for readers and advertisers).
 */
import { AI_RE } from "./classify";
import { withTimeout } from "./news-engine";
import { canKeepAlive, keepAlive, sharedRead, sharedWrite } from "./shared-cache";

export type BuiltItem = { id: string; title: string; url: string; discussUrl: string; points: number; comments: number; at: string; openSource: boolean };
export type RepoItem = { id: string; name: string; owner: string; url: string; description: string; stars: number; language: string | null; license: string | null; at: string; topics: string[] };
export type SpaceItem = { id: string; name: string; owner: string; url: string; likes: number; sdk: string | null; at: string };
export type Trend = { term: string; traffic: string; newsTitle?: string; newsUrl?: string; newsSource?: string };
export type PulsePayload = {
  built: BuiltItem[];
  repos: RepoItem[];
  spaces: SpaceItem[];
  trends: { ca: Trend[]; us: Trend[] };
  fetchedAt: string;
};

const UA = "Mozilla/5.0 (compatible; AIBroadsheet/1.0; +https://aibroadsheet.com)";
const TTL = 20 * 60 * 1000;
const KEY = "pulse:v1";
const UNSAFE = /uncensored|nsfw|nude|naked|porn|hentai|lewd|explicit|erotic|sexy|18\+|onlyfans|undress|deepnude|waifu|not-for-all-audiences|gore/i;

const g = globalThis as unknown as { __pulse?: { ts: number; payload: PulsePayload }; __pulseInflight?: Promise<PulsePayload>; __pulseAt?: number };

async function getText(url: string, accept = "*/*", ms = 7000): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: accept }, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return withTimeout(res.text(), ms, "");
}

const decode = (s: string) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, "&").trim();
const tag = (b: string, n: string) => decode(b.match(new RegExp(`<${n}>([\\s\\S]*?)</${n}>`))?.[1] ?? "");

async function trends(geo: "CA" | "US"): Promise<Trend[]> {
  const xml = await getText(`https://trends.google.com/trending/rss?geo=${geo}`, "application/rss+xml, text/xml");
  return (xml.match(/<item>[\s\S]*?<\/item>/g) ?? []).slice(0, 20).map(b => ({
    term: tag(b, "title"),
    traffic: tag(b, "ht:approx_traffic"),
    newsTitle: tag(b, "ht:news_item_title") || undefined,
    newsUrl: tag(b, "ht:news_item_url") || undefined,
    newsSource: tag(b, "ht:news_item_source") || undefined,
  })).filter(t => t.term);
}

async function built(): Promise<BuiltItem[]> {
  const since = Math.floor(Date.now() / 1000) - 10 * 86400;
  const json = JSON.parse(await getText(`https://hn.algolia.com/api/v1/search?tags=show_hn&numericFilters=created_at_i>${since},points>15&hitsPerPage=80`, "application/json"));
  const hits = (json.hits ?? []) as { objectID: string; title?: string; url?: string; points?: number; num_comments?: number; created_at: string }[];
  return hits
    .filter(h => h.title && (AI_RE.test(h.title) || BUILT_RE.test(h.title)) && !UNSAFE.test(h.title))
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, 10)
    .map(h => ({
      id: h.objectID,
      title: h.title!.replace(/^Show HN:\s*/i, ""),
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      discussUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: h.points ?? 0,
      comments: h.num_comments ?? 0,
      at: h.created_at,
      openSource: /github\.com|gitlab\.com|open[- ]source|\bOSS\b/i.test(`${h.url ?? ""} ${h.title}`),
    }));
}

/** Show HN titles that are clearly about AI ("model" alone also matches 3D models). */
const BUILT_RE = /\b(LLMs?|GPTs?|ChatGPT|Claude|Gemini|Llama|Mistral|DeepSeek|Qwen|agents?|agentic|MCP|RAG|embeddings?|diffusion|transformers?|neural|fine-?tun\w*|inference|prompts?|vibe[- ]cod\w*|Opus|Sonnet|Haiku|Codex|Cursor|Copilot)\b/i;

const latin = (s: string) => (s.match(/[A-Za-z]/g)?.length ?? 0) / Math.max(1, s.replace(/\s/g, "").length);

async function repos(): Promise<RepoItem[]> {
  const since = new Date(Date.now() - 14 * 86400_000).toISOString().slice(0, 10);
  const out = new Map<string, RepoItem>();
  for (const topic of ["llm", "ai-agents"]) {
    try {
      const json = JSON.parse(await getText(`https://api.github.com/search/repositories?q=topic:${topic}+created:%3E${since}&sort=stars&order=desc&per_page=25`, "application/vnd.github+json"));
      for (const r of (json.items ?? []) as { id: number; full_name: string; name: string; owner?: { login: string }; html_url: string; description?: string; stargazers_count: number; language?: string; license?: { spdx_id?: string }; created_at: string; topics?: string[] }[]) {
        const text = `${r.full_name} ${r.description ?? ""} ${(r.topics ?? []).join(" ")}`;
        if (!r.description || UNSAFE.test(text)) continue;
        out.set(r.full_name, {
          id: String(r.id), name: r.name, owner: r.owner?.login ?? r.full_name.split("/")[0], url: r.html_url,
          description: r.description.slice(0, 180), stars: r.stargazers_count, language: r.language ?? null,
          license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null, at: r.created_at, topics: (r.topics ?? []).slice(0, 4),
        });
      }
    } catch { /* one topic failing is fine */ }
  }
  // English descriptions first, then by stars.
  return [...out.values()].sort((a, b) => (latin(b.description) > 0.6 ? 1 : 0) - (latin(a.description) > 0.6 ? 1 : 0) || b.stars - a.stars).slice(0, 10);
}

async function spaces(): Promise<SpaceItem[]> {
  const json = JSON.parse(await getText("https://huggingface.co/api/spaces?sort=trendingScore&limit=60", "application/json")) as { id: string; likes?: number; sdk?: string; tags?: string[]; createdAt?: string; private?: boolean }[];
  return json
    .filter(s => !s.private && !UNSAFE.test(`${s.id} ${(s.tags ?? []).join(" ")}`))
    .slice(0, 10)
    .map(s => {
      const [owner, name] = s.id.split("/");
      return { id: s.id, owner, name: (name ?? s.id).replace(/[-_]+/g, " "), url: `https://huggingface.co/spaces/${s.id}`, likes: s.likes ?? 0, sdk: s.sdk ?? null, at: s.createdAt ?? "" };
    });
}

async function build(prev?: PulsePayload): Promise<PulsePayload> {
  const keep = <T,>(p: Promise<T>, fallback: T) => withTimeout(p.catch(() => fallback), 9000, fallback);
  const [b, r, s, ca, us] = await Promise.all([
    keep(built(), prev?.built ?? []),
    keep(repos(), prev?.repos ?? []),
    keep(spaces(), prev?.spaces ?? []),
    keep(trends("CA"), prev?.trends.ca ?? []),
    keep(trends("US"), prev?.trends.us ?? []),
  ]);
  return {
    built: b.length ? b : prev?.built ?? [],
    repos: r.length ? r : prev?.repos ?? [],
    spaces: s.length ? s : prev?.spaces ?? [],
    trends: { ca: ca.length ? ca : prev?.trends.ca ?? [], us: us.length ? us : prev?.trends.us ?? [] },
    fetchedAt: new Date().toISOString(),
  };
}

function rebuild(): Promise<PulsePayload> {
  if (g.__pulseInflight && Date.now() - (g.__pulseAt ?? 0) < 30_000) return g.__pulseInflight;
  g.__pulseAt = Date.now();
  const prev = g.__pulse?.payload;
  g.__pulseInflight = build(prev)
    .then(p => {
      g.__pulse = { ts: Date.now(), payload: p };
      sharedWrite(KEY, { ts: Date.now(), payload: p }, 2 * 24 * 3600);
      return p;
    })
    .catch(() => prev ?? { built: [], repos: [], spaces: [], trends: { ca: [], us: [] }, fetchedAt: new Date().toISOString() })
    .finally(() => { g.__pulseInflight = undefined; });
  keepAlive(g.__pulseInflight);
  return g.__pulseInflight;
}

export async function loadPulse(): Promise<PulsePayload> {
  if (!g.__pulse) {
    const snap = await sharedRead<{ ts: number; payload: PulsePayload }>(KEY);
    if (snap?.payload && !g.__pulse) g.__pulse = snap;
  }
  const cached = g.__pulse;
  if (cached && Date.now() - cached.ts < TTL) return cached.payload;
  if (cached) {
    if (canKeepAlive() && Date.now() - cached.ts < 2 * TTL) { void rebuild(); return cached.payload; }
    return withTimeout(rebuild(), 12000, cached.payload);
  }
  return withTimeout(rebuild(), 12000, { built: [], repos: [], spaces: [], trends: { ca: [], us: [] }, fetchedAt: new Date().toISOString() });
}
