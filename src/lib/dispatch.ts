/**
 * Dispatches for the browser: server functions and the hook the front page
 * uses. The writing happens in dispatch.server.ts, in the background.
 */
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { summarize, type DispatchList, type DispatchPage, type DispatchSummary } from "./dispatch-types";
import type { NewsroomSummary } from "./newsroom-types";

export * from "./dispatch-types";

const EMPTY: DispatchList = { items: [], audio: false };

/** A Newsroom article as a dispatch summary: rails, Today and "Explain it like I'm 12" link to the article. */
function fromNewsroom(n: NewsroomSummary): DispatchSummary {
  return {
    id: n.id,
    createdAt: n.createdAt,
    outlets: n.outlets,
    times: n.times,
    en: { headline: n.en.headline, news: n.en.news, matters: n.en.matters },
    fr: { headline: n.fr.headline, news: n.fr.news, matters: n.fr.matters },
    storyIds: n.storyIds,
    article: n.slug,
  };
}

/**
 * The latest dispatches (summaries), newest first. Once the Newsroom
 * (scripts/newsroom) has published, these are its articles; until then, the
 * Worker-side Dispatch desk's. Empty when both are off.
 */
export const getDispatches = createServerFn({ method: "GET" }).handler(async (): Promise<DispatchList> => {
  try {
    const { newsroomState } = await import("./newsroom.server");
    const nr = await newsroomState();
    if (nr.items.length) return { items: nr.items.slice(0, 24).map(fromNewsroom), audio: false };
  } catch { /* fall back to the Worker desk */ }
  try {
    const [{ listDispatches }, { ttsAvailable }] = await Promise.all([import("./dispatch.server"), import("./dispatch-audio.server")]);
    const all = await listDispatches();
    return { items: all.slice(0, 24).map(summarize), audio: ttsAvailable() };
  } catch {
    return EMPTY;
  }
});

export const getDispatch = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().max(120) }).parse(d))
  .handler(async ({ data }): Promise<DispatchPage> => {
    // An id the Newsroom wrote (or one of the stories it wrote from): the article, and where it lives now.
    try {
      const { newsroomState, articleById } = await import("./newsroom.server");
      const nr = await newsroomState();
      const item = nr.items.find(i => i.id === data.id) ?? nr.items.find(i => i.storyIds.includes(data.id));
      if (item) {
        const article = await articleById(item.id);
        if (article) return { dispatch: article, audio: false, more: nr.items.filter(i => i.id !== item.id).slice(0, 8).map(fromNewsroom), article: item.slug };
      }
    } catch { /* fall back to the Worker desk */ }
    try {
      const [{ listDispatches }, { ttsAvailable }] = await Promise.all([import("./dispatch.server"), import("./dispatch-audio.server")]);
      const all = await listDispatches();
      const dispatch = all.find(d => d.id === data.id) ?? null;
      return { dispatch, audio: ttsAvailable(), more: all.filter(d => d.id !== data.id).slice(0, 8).map(summarize) };
    } catch {
      return { dispatch: null, audio: false, more: [] };
    }
  });

/** For route loaders: never hold the page for long. */
export async function getDispatchesFast(ms = 1500): Promise<DispatchList | null> {
  return Promise.race([getDispatches().catch(() => null), new Promise<null>(r => setTimeout(() => r(null), ms))]);
}

/** Dev only: `?fixture=1` shows sample dispatches, since feeds and models are unreachable locally. */
export function fixtureRequested(search?: string): boolean {
  if (!import.meta.env.DEV) return false;
  const s = search ?? (typeof window !== "undefined" ? window.location.search : "");
  return /[?&]fixture=1\b/.test(s);
}

/**
 * The latest dispatches. Pass the loader's copy as `initial` when there is
 * one. Returns an empty list (and the rail renders nothing) when the desk is
 * off or hasn't written anything yet.
 */
export function useDispatches(initial?: DispatchList | null) {
  const fixture = fixtureRequested();
  return useQuery({
    queryKey: ["dispatches", fixture],
    queryFn: async (): Promise<DispatchList> => {
      if (import.meta.env.DEV && fixture) {
        const { FIXTURES } = await import("./dispatch-fixture");
        return { items: FIXTURES.map(summarize), audio: false };
      }
      return getDispatches();
    },
    initialData: !fixture && initial ? initial : undefined,
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}
