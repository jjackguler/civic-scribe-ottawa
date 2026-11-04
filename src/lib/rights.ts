/**
 * How much of each publisher's feed we show. See docs/feed-terms.md: most
 * publishers' terms limit their RSS feeds to personal, non-commercial use or
 * ask for permission, and some forbid using their photos on other sites.
 *
 * "full"     — headline, short excerpt and photo, linked to the original
 * "headline" — headline, source, time and link only: no excerpt, no photo
 *
 * Since 31 Oct 2026 the whole site is headline-and-link by default
 * (DEFAULT_DISPLAY = "headline"). A source is shown in full only when its own
 * published terms allow it, or when we hold written permission. Every entry in
 * DISPLAY must name the page or the agreement that allows it, and be recorded
 * in docs/feed-terms.md.
 *
 * Our own work (newsroom articles, Studio dispatches, videos, guides) is not
 * affected: this file only governs other publishers' feed content.
 */
export type Display = "full" | "headline";

export const DEFAULT_DISPLAY: Display = "headline";

/** Per-source allowances, by source id from news-sources.ts. Add only with a citable permission. */
export const DISPLAY: Record<string, Display> = {
  // techcrunch.com/rss-terms-of-use: display feed content as provided, attribute TechCrunch,
  // link to the full article, don't modify it and don't insert ads into the feed itself.
  techcrunch: "full",
};

export const displayFor = (sourceId: string): Display => DISPLAY[sourceId] ?? DEFAULT_DISPLAY;

/** A story as we may show it: excerpt and photo removed unless the source allows them. */
export function applyDisplay<T extends { sourceId: string; summary: string; image: string | null }>(s: T): T {
  return displayFor(s.sourceId) === "full" ? s : { ...s, summary: "", image: null };
}
