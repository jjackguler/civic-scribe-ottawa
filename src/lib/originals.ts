import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ORIGINALS_MANIFEST_URL, originalPublishable, type Original, type OriginalsManifest } from "./originals-types";

export type { Original, OriginalsManifest };

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
