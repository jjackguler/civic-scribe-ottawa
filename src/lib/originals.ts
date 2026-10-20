import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ORIGINALS_MANIFEST_URL, ORIGINALS_SCHEDULE_URL, originalPublishable, type Original, type OriginalsManifest, type ScheduledOriginal } from "./originals-types";

export type { Original, OriginalsManifest, ScheduledOriginal };

const g = globalThis as unknown as { __originals?: { ts: number; data: OriginalsManifest } };
const TTL = 10 * 60_000;

/** The explainer manifest from the repository's media branch (written by scripts/originals). */
export const getOriginals = createServerFn({ method: "GET" }).handler(async (): Promise<OriginalsManifest> => {
  const cached = g.__originals;
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  try {
    const res = await fetch(ORIGINALS_MANIFEST_URL, { signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as OriginalsManifest;
    // Playable on the site: on YouTube (public/unlisted) or our own copy.
    data.items = (data.items ?? []).filter(originalPublishable);
    g.__originals = { ts: Date.now(), data };
    return data;
  } catch {
    return cached?.data ?? { updatedAt: new Date(0).toISOString(), items: [] };
  }
});

export async function getOriginalsFast(ms = 2500): Promise<OriginalsManifest | null> {
  return Promise.race([getOriginals().catch(() => null), new Promise<null>(r => setTimeout(() => r(null), ms))]);
}

export function useOriginals(initial?: OriginalsManifest | null) {
  return useQuery({
    queryKey: ["originals"],
    queryFn: () => getOriginals(),
    initialData: initial ?? undefined,
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}

const gs = globalThis as unknown as { __schedule?: { ts: number; data: ScheduledOriginal[] } };

/** Cases waiting for their release time, soonest first (the "next case" countdown). Never throws. */
export const getSchedule = createServerFn({ method: "GET" }).handler(async (): Promise<ScheduledOriginal[]> => {
  const cached = gs.__schedule;
  if (cached && Date.now() - cached.ts < 5 * 60_000) return cached.data;
  try {
    const res = await fetch(ORIGINALS_SCHEDULE_URL, { signal: AbortSignal.timeout(4000), headers: { accept: "application/json" } });
    const raw = res.ok ? ((await res.json()) as ScheduledOriginal[]) : [];
    // A case stays listed up to an hour past its time, while the release job catches up.
    const data = (Array.isArray(raw) ? raw : [])
      .filter(o => o && o.id && o.title && Date.parse(o.publishedAt) > Date.now() - 3600_000)
      .map(({ id, title, summary, publishedAt, posterUrl }) => ({ id, title, summary, publishedAt, posterUrl }))
      .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
    gs.__schedule = { ts: Date.now(), data };
    return data;
  } catch {
    return cached?.data ?? [];
  }
});

export function useSchedule() {
  return useQuery({ queryKey: ["originals-schedule"], queryFn: () => getSchedule(), staleTime: 5 * 60_000, refetchInterval: 5 * 60_000 });
}
