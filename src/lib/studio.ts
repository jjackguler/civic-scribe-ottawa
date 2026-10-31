/**
 * Loads the Buildgena Studio dispatches committed to src/content/studio/*.json at
 * build time. Schema, validation and labels live in studio-schema.ts.
 */
import type { Locale } from "./i18n";
import { loadStudioFiles, type StudioDispatch } from "./studio-schema";

export * from "./studio-schema";

// Build time: every approved file in src/content/studio/ (sub-folders are not read).
const FILES = import.meta.glob("../content/studio/*.json", { eager: true });
const loaded = loadStudioFiles(FILES);
if (loaded.rejected.length && typeof console !== "undefined") {
  for (const r of loaded.rejected) console.warn(`[studio] ${r.file} left off the site: ${r.errors.join("; ")}`);
}

/** Every valid Studio piece, newest first. */
export const STUDIO: StudioDispatch[] = loaded.pieces;

export const studioById = (id: string) => STUDIO.find(p => p.id === id) ?? null;

/** Pieces for a reader: their language first, then the other language. */
export function studioFor(locale: Locale, list: StudioDispatch[] = STUDIO): StudioDispatch[] {
  return [...list.filter(p => p.lang === locale), ...list.filter(p => p.lang !== locale)];
}

/** Internal path of a piece (the router adds /fr for French pages). */
export const studioPath = (p: Pick<StudioDispatch, "id">) => `/desk/${p.id}`;


/** Studio pieces approved within the last `hours` (Google News sitemap window). */
export const studioRecent = (hours: number, now = Date.now(), list: StudioDispatch[] = STUDIO) =>
  list.filter(p => now - Date.parse(p.approvedAt) <= hours * 3600_000);
