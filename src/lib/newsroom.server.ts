/**
 * Server-only reader for the Newsroom store (the repository's `newsroom`
 * branch, written by scripts/newsroom). Never import from client code; use
 * newsroom.ts.
 *
 * Reads are pinned to raw.githubusercontent.com (fresh: GitHub's CDN keeps a
 * copy for about five minutes) and cached here briefly:
 *   index.json + killed.json   5 minutes
 *   articles/<id>.json         1 hour
 * Each good copy is also kept for a week in the shared cache (Workers Cache
 * API), so a fresh isolate starts warm, and a failed fetch serves the last
 * good copy (stale-while-error). Everything fails soft: no store, no articles.
 */
import { sharedRead, sharedWrite } from "./shared-cache";
import { NEWSROOM_RAW, isKilled, killedIds, type NewsroomArticle, type NewsroomIndex, type NewsroomSummary } from "./newsroom-types";
import type { Locale } from "./i18n";

const INDEX_TTL = 5 * 60_000;
const ARTICLE_TTL = 60 * 60_000;
const KEEP_S = 7 * 86400;
const FETCH_MS = 4000;

/** Override for a fork or a mirror: NEWSROOM_BASE_URL=https://raw.githubusercontent.com/<owner>/<repo>/newsroom */
const base = () => (process.env["NEWSROOM_BASE_URL"] || NEWSROOM_RAW).replace(/\/+$/, "");

type Entry<T> = { ts: number; data: T | null };
const g = globalThis as unknown as { __newsroom?: Map<string, Entry<unknown>> };
const mem = () => (g.__newsroom ??= new Map());

/**
 * One file from the store. `null` means "not there" (404) or "never reached
 * and no copy anywhere"; `undefined` is never returned.
 */
async function load<T>(path: string, ttl: number, check: (x: unknown) => T | null): Promise<{ data: T | null; ok: boolean }> {
  const hit = mem().get(path) as Entry<T> | undefined;
  if (hit && Date.now() - hit.ts < ttl) return { data: hit.data, ok: true };
  // A fresh isolate: another isolate's copy, when it is still fresh.
  const shared = hit ? null : await sharedRead<Entry<T>>(`newsroom:${path}`, 800);
  if (shared && Date.now() - shared.ts < ttl) { mem().set(path, shared); return { data: shared.data, ok: true }; }
  const stale = hit ?? shared ?? undefined;
  try {
    const res = await fetch(`${base()}/${path}`, { signal: AbortSignal.timeout(FETCH_MS), headers: { accept: "application/json" } });
    if (res.status === 404) {
      const e: Entry<T> = { ts: Date.now(), data: null };
      mem().set(path, e);
      return { data: null, ok: true };
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = check(await res.json());
    if (data == null) throw new Error("unexpected shape");
    const e: Entry<T> = { ts: Date.now(), data };
    mem().set(path, e);
    sharedWrite(`newsroom:${path}`, e, KEEP_S);
    return { data, ok: true };
  } catch (err) {
    console.warn(`[newsroom] ${path}: ${(err as Error).message}`);
    if (stale) {
      // Serve the last good copy, and try the network again in a minute.
      mem().set(path, { ts: Date.now() - ttl + 60_000, data: stale.data });
      return { data: stale.data, ok: true };
    }
    return { data: null, ok: false };
  }
}

const isIndex = (x: unknown): NewsroomIndex | null => {
  const items = (x as NewsroomIndex | null)?.items;
  if (!Array.isArray(items)) return null;
  return { updatedAt: String((x as NewsroomIndex).updatedAt ?? ""), items: items.filter(i => i && typeof i.id === "string" && typeof i.slug?.en === "string" && typeof i.slug?.fr === "string" && i.en?.headline && i.fr?.headline) };
};
const isArticle = (x: unknown): NewsroomArticle | null => {
  const a = x as NewsroomArticle | null;
  return a && typeof a.id === "string" && a.en?.sections && a.fr?.sections && Array.isArray(a.sources) ? a : null;
};

export type NewsroomState = {
  /** Published articles (killed ones removed), newest first. */
  items: NewsroomSummary[];
  /** Every entry in the index, killed included (for 410s and redirects). */
  all: NewsroomSummary[];
  killed: Set<string>;
  /** false when the store could not be reached and no copy was cached. */
  ok: boolean;
};

export async function newsroomState(): Promise<NewsroomState> {
  const [index, killed] = await Promise.all([
    load("index.json", INDEX_TTL, isIndex),
    load("killed.json", INDEX_TTL, x => x as unknown),
  ]);
  const k = killedIds(killed.data);
  const all = index.data?.items ?? [];
  return { items: all.filter(i => !isKilled(k, i)), all, killed: k, ok: index.ok };
}

export async function newsroomHasItems(): Promise<boolean> {
  try { return (await newsroomState()).items.length > 0; } catch { return false; }
}

export async function articleById(id: string): Promise<NewsroomArticle | null> {
  if (!/^[\w-]{1,120}$/.test(id)) return null;
  return (await load(`articles/${id}.json`, ARTICLE_TTL, isArticle)).data;
}

export type ArticleLookup =
  | { status: "ok"; article: NewsroomArticle; locale: Locale; item: NewsroomSummary }
  | { status: "killed"; item: NewsroomSummary }
  | { status: "missing" }
  | { status: "unavailable" };

/** The article behind /article/<slug> (either language's slug). */
export async function articleBySlug(slug: string): Promise<ArticleLookup> {
  const st = await newsroomState();
  const item = st.all.find(i => i.slug.en === slug || i.slug.fr === slug);
  if (!item) return st.ok ? { status: "missing" } : { status: "unavailable" };
  if (isKilled(st.killed, item)) return { status: "killed", item };
  const article = await articleById(item.id);
  if (!article) return { status: "unavailable" };
  return { status: "ok", article, item, locale: item.slug.fr === slug && item.slug.en !== slug ? "fr" : "en" };
}

/** For src/server.ts: the HTTP status an /article/<slug> page should answer with. */
export async function articleHttpStatus(slug: string): Promise<200 | 404 | 410 | 503> {
  try {
    const st = await newsroomState();
    const item = st.all.find(i => i.slug.en === slug || i.slug.fr === slug);
    if (!item) return st.ok ? 404 : 503;
    return isKilled(st.killed, item) ? 410 : 200;
  } catch {
    return 503;
  }
}

/** Up to `n` related articles: same topic first, then the newest. */
export function related(items: NewsroomSummary[], to: { id: string; topic: string; storyIds?: string[] }, n = 4): NewsroomSummary[] {
  const others = items.filter(i => i.id !== to.id);
  return [...others.filter(i => i.topic === to.topic), ...others.filter(i => i.topic !== to.topic)].slice(0, n);
}

/** The newest `n` full articles (for the quiz and other desk features that need the text). */
export async function newestArticles(n = 10): Promise<NewsroomArticle[]> {
  const { items } = await newsroomState();
  const got = await Promise.all(items.slice(0, n).map(i => articleById(i.id).catch(() => null)));
  return got.filter((a): a is NewsroomArticle => !!a);
}

/** The article (if any) that covers one of these desk stories. */
export async function articleForStories(storyIds: string[]): Promise<NewsroomSummary | null> {
  if (storyIds.length === 0) return null;
  const { items } = await newsroomState();
  const ids = new Set(storyIds);
  return items.find(i => i.id && (ids.has(i.id) || i.storyIds.some(s => ids.has(s)))) ?? null;
}
