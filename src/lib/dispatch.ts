/**
 * Dispatches for the browser: server functions and the hook the front page
 * uses. The writing happens in dispatch.server.ts, in the background.
 */
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { summarize, type DispatchList, type DispatchPage } from "./dispatch-types";

export * from "./dispatch-types";

const EMPTY: DispatchList = { items: [], audio: false };

/** The latest dispatches (summaries), newest first. Empty when the desk is off. */
export const getDispatches = createServerFn({ method: "GET" }).handler(async (): Promise<DispatchList> => {
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
