import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import type { MediaItem, MediaPayload } from "./media-engine";

export type { MediaItem, MediaPayload };

export const getMedia = createServerFn({ method: "GET" }).handler(async () => {
  const { loadMedia } = await import("./media-engine");
  return loadMedia();
});

export async function getMediaFast(ms = 4500): Promise<MediaPayload | null> {
  return Promise.race([
    getMedia().catch(() => null),
    new Promise<null>(r => setTimeout(() => r(null), ms)),
  ]);
}

/** Video and podcast desk; refreshed every 5 minutes. */
export function useMedia(initial?: MediaPayload | null) {
  return useQuery({
    queryKey: ["ai-media"],
    queryFn: () => getMedia(),
    initialData: initial && initial.items.length > 0 ? initial : undefined,
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}

export function formatDuration(sec?: number) {
  if (!sec || sec < 1) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export function formatViews(n?: number) {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
