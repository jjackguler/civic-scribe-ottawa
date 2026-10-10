/**
 * The Newsroom for the browser: server functions, the hook the homepage uses,
 * and helpers shared by the article page. The store is read in
 * newsroom.server.ts; the articles are written by scripts/newsroom.
 *
 *   getNewsroomFast()      for route loaders (never holds the page for long)
 *   useNewsroom(initial)   the latest articles, refreshed in the background
 *   getArticlePage({ data: { slug } })
 *   articleOgImage(a)      the social image for an article (one place to plug in a dynamic OG image)
 */
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DEFAULT_OG_IMAGE } from "./seo";
import { NEWSROOM_RAW, type NewsroomArticle, type NewsroomSummary } from "./newsroom-types";

export * from "./newsroom-types";

export type NewsroomList = { items: NewsroomSummary[] };
export type ArticlePage =
  | { status: "ok"; article: NewsroomArticle; related: NewsroomSummary[] }
  | { status: "killed"; headline: { en: string; fr: string } }
  | { status: "missing" }
  | { status: "unavailable" };

const EMPTY: NewsroomList = { items: [] };

/** The latest articles (summaries), newest first. Empty when the newsroom hasn't published yet. */
export const getNewsroom = createServerFn({ method: "GET" }).handler(async (): Promise<NewsroomList> => {
  try {
    const { newsroomState } = await import("./newsroom.server");
    return { items: (await newsroomState()).items.slice(0, 30) };
  } catch {
    return EMPTY;
  }
});

export const getArticlePage = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(160) }).parse(d))
  .handler(async ({ data }): Promise<ArticlePage> => {
    try {
      const { articleBySlug, newsroomState, related } = await import("./newsroom.server");
      const r = await articleBySlug(data.slug);
      if (r.status === "ok") return { status: "ok", article: r.article, related: related((await newsroomState()).items, r.article, 4) };
      if (r.status === "killed") return { status: "killed", headline: { en: r.item.en.headline, fr: r.item.fr.headline } };
      return { status: r.status };
    } catch {
      return { status: "unavailable" };
    }
  });

/** For route loaders: never hold the page for long. */
export async function getNewsroomFast(ms = 1500): Promise<NewsroomList | null> {
  return Promise.race([getNewsroom().catch(() => null), new Promise<null>(r => setTimeout(() => r(null), ms))]);
}

/** Dev only: `?fixture=1` shows the dry run's sample articles (feeds and model APIs are unreachable locally). */
export function newsroomFixtureRequested(search?: string): boolean {
  if (!import.meta.env.DEV) return false;
  const s = search ?? (typeof window !== "undefined" ? window.location.search : "");
  return /[?&]fixture=1\b/.test(s);
}

/** Dev only: the article page from the fixture (any unknown slug shows the first sample). */
export async function fixtureArticlePage(slug: string): Promise<ArticlePage> {
  const { FIXTURE_ARTICLES, FIXTURE_INDEX } = await import("./newsroom-fixture");
  const article = FIXTURE_ARTICLES.find(a => a.slug.en === slug || a.slug.fr === slug) ?? FIXTURE_ARTICLES[0];
  return { status: "ok", article, related: FIXTURE_INDEX.filter(i => i.id !== article.id).slice(0, 4) };
}

/**
 * The latest articles. Pass the loader's copy as `initial` when there is one.
 * Returns an empty list (and NewsroomLead renders nothing) until the newsroom publishes.
 */
export function useNewsroom(initial?: NewsroomList | null) {
  const fixture = newsroomFixtureRequested();
  return useQuery({
    queryKey: ["newsroom", fixture],
    queryFn: async (): Promise<NewsroomList> => {
      if (import.meta.env.DEV && fixture) {
        const { FIXTURE_INDEX } = await import("./newsroom-fixture");
        return { items: FIXTURE_INDEX };
      }
      return getNewsroom();
    },
    initialData: !fixture && initial ? initial : undefined,
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}

/**
 * The Open Graph / Twitter image for an article. Today: the brand card.
 * Another team's dynamic OG image service plugs in here, e.g.
 * `${ORIGIN}/og/article/${a.id}.png`, and every article page, the JSON-LD and
 * the sitemaps pick it up.
 */
export function articleOgImage(a: Pick<NewsroomArticle, "id"> & Partial<Pick<NewsroomArticle, "slug" | "cover">>): string {
  void a;
  return DEFAULT_OG_IMAGE;
}

/** Public URL of a file in the store (the optional cover illustration). */
export const storeFileUrl = (path: string) => `${NEWSROOM_RAW}/${path.replace(/^\/+/, "")}`;
