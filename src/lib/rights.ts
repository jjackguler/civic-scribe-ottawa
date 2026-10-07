/**
 * How much of each publisher's feed we show. See docs/feed-terms.md: most
 * publishers' terms limit their RSS feeds to personal, non-commercial use or
 * ask for permission, and some forbid using their photos on other sites.
 *
 * "full"     — headline, short excerpt and photo, linked to the original (today's behaviour)
 * "headline" — headline and link only: no excerpt, no photo
 *
 * DEFAULT_DISPLAY applies to every source not listed in DISPLAY. To switch the
 * whole site to headline-and-link before running ads, set DEFAULT_DISPLAY to
 * "headline" and list licensed or permissive sources as "full".
 */
export type Display = "full" | "headline";

export const DEFAULT_DISPLAY: Display = "full";

/** Per-source overrides, by source id from news-sources.ts. */
export const DISPLAY: Record<string, Display> = {
  // e.g. "cbc-tech": "headline",
};

export const displayFor = (sourceId: string): Display => DISPLAY[sourceId] ?? DEFAULT_DISPLAY;
