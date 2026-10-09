/**
 * Types for AI Broadsheet Dispatches: original articles our desk writes, with
 * AI, about one event that two or more outlets are reporting. Shared by the
 * server (dispatch.server.ts) and the page; no server code here.
 */

/** One outlet's report that the dispatch was written from. `key` is "s1", "s2"… */
export type DispatchSource = {
  key: string;
  outlet: string;
  title: string;
  url: string;
  publishedAt: string;
  storyId: string;
  /** The outlet is the company, lab or agency itself (an official release). */
  official: boolean;
  lang: "en" | "fr";
};

/** A point, with the sources (keys) that reported it. */
export type DispatchClaim = { text: string; src: string[] };
/** A claim made by someone (a company, a minister, a study), in their name. */
export type DispatchAttributed = DispatchClaim & { by: string };
/** Something that happened at a time the sources state, in their words. */
export type DispatchEvent = { when: string; text: string; src: string[] };

export type DispatchDepth = "plain" | "standard" | "expert";
export const DEPTHS: DispatchDepth[] = ["plain", "standard", "expert"];

/** The dispatch in one language. Body paragraphs may carry [s1]-style source markers. */
export type DispatchCopy = {
  headline: string;
  /** One sentence: the news. */
  news: string;
  /** "In 30 seconds": three short lines. */
  thirty: string[];
  confirmed: DispatchClaim[];
  claimed: DispatchAttributed[];
  unknown: string[];
  /** Why it matters to you, in plain words. */
  matters: string;
  body: Record<DispatchDepth, string[]>;
  timeline: DispatchEvent[];
};

export type Dispatch = {
  id: string;
  createdAt: string;
  topic: string;
  sources: DispatchSource[];
  en: DispatchCopy;
  fr: DispatchCopy;
  /** Which model family wrote it ("claude" or "gemini"), for the label. */
  model: "claude" | "gemini";
};

/** What lists and rails need. */
export type DispatchSummary = {
  id: string;
  createdAt: string;
  outlets: string[];
  /** Publication times of the reports, oldest first (for the little timeline). */
  times: string[];
  en: { headline: string; news: string };
  fr: { headline: string; news: string };
};

export type DispatchList = { items: DispatchSummary[]; audio: boolean };
export type DispatchPage = { dispatch: Dispatch | null; audio: boolean; more: DispatchSummary[] };

export function summarize(d: Dispatch): DispatchSummary {
  const times = [...d.sources].map(s => s.publishedAt).sort();
  return {
    id: d.id,
    createdAt: d.createdAt,
    outlets: [...new Set(d.sources.map(s => s.outlet))],
    times,
    en: { headline: d.en.headline, news: d.en.news },
    fr: { headline: d.fr.headline, news: d.fr.news },
  };
}

/** "[s1]" markers in a paragraph → text and the source keys after each run of text. */
export function splitMarkers(p: string): { text: string; keys: string[] }[] {
  const out: { text: string; keys: string[] }[] = [];
  const re = /\s*\[((?:s\d+)(?:\s*,\s*s\d+)*)\]/g;
  let last = 0;
  for (const m of p.matchAll(re)) {
    out.push({ text: p.slice(last, m.index), keys: m[1].split(/\s*,\s*/) });
    last = (m.index ?? 0) + m[0].length;
  }
  if (last < p.length) out.push({ text: p.slice(last), keys: [] });
  return out;
}

export const stripMarkers = (p: string) => p.replace(/\s*\[(?:s\d+)(?:\s*,\s*s\d+)*\]/g, "");

/** Text the voice reads: headline, the news, the 30-second lines and the standard body. */
export function spokenText(d: Dispatch, locale: "en" | "fr"): string {
  const c = d[locale];
  const intro = locale === "fr" ? "Une dépêche d'AI Broadsheet, écrite avec l'IA." : "An AI Broadsheet dispatch, written with AI.";
  const outro = locale === "fr"
    ? `D'après les reportages de ${[...new Set(d.sources.map(s => s.outlet))].join(", ")}.`
    : `From reporting by ${[...new Set(d.sources.map(s => s.outlet))].join(", ")}.`;
  return [intro, c.headline + ".", c.news, ...c.body.standard.map(stripMarkers), outro].join("\n\n").slice(0, 3200);
}
