import { useEffect, useState } from "react";

export type FeedRegion = "ottawa" | "canada";

export type FeedItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  region: FeedRegion;
  publishedAt: string;
  image?: string;
  urgent: boolean;
};

export type FeedSourceStatus = { name: string; region: FeedRegion; ok: boolean; count: number; error?: string };

type State = {
  items: FeedItem[];
  sources: FeedSourceStatus[];
  loading: boolean;
  error: string | null;
  fetchedAt: string | null;
};

/** Kicker colour by region — Ottawa keeps the civic red, Canada uses river blue. */
export function regionKicker(region: FeedRegion) {
  return region === "canada" ? "text-river" : "text-civic-red";
}
export function regionBadge(region: FeedRegion) {
  return region === "canada" ? "bg-river text-white" : "bg-civic-red text-white";
}
export function regionAccent(region: FeedRegion) {
  return region === "canada" ? "#1E5F8E" : "#C8102E";
}
export function regionLabel(region: FeedRegion, locale: "en" | "fr") {
  if (region === "canada") return "CANADA";
  return locale === "fr" ? "OTTAWA" : "OTTAWA";
}

/**
 * Fetches the merged RSS feed from /api/public/news-feeds.
 * Client-side only (never in a loader) so SSR/prerender never waits on upstream.
 */
export function useLiveFeed(refreshMs = 60_000): State {
  const [state, setState] = useState<State>({ items: [], sources: [], loading: true, error: null, fetchedAt: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/public/news-feeds");
        const json = await res.json();
        if (cancelled) return;
        if (!json?.ok) throw new Error(json?.error ?? "Feed unavailable");
        setState({
          items: Array.isArray(json.items) ? json.items : [],
          sources: Array.isArray(json.sources) ? json.sources : [],
          loading: false,
          error: null,
          fetchedAt: json.fetchedAt ?? null,
        });
      } catch (e: any) {
        if (cancelled) return;
        setState(s => ({ ...s, loading: false, error: String(e?.message ?? e) }));
      }
    }
    load();
    const i = setInterval(load, refreshMs);
    return () => { cancelled = true; clearInterval(i); };
  }, [refreshMs]);

  return state;
}
