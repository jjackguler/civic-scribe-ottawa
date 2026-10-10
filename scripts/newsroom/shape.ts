/**
 * Turning a model reply into a draft we can check, or saying why it can't be one.
 * Nothing here trusts the model: lengths are capped, unknown source markers are
 * dropped, and "confirmed" is counted (two outlets, or the party itself), never chosen.
 */
import type { DispatchAttributed, DispatchClaim, DispatchEvent, DispatchSource } from "../../src/lib/dispatch-types";
import { MARKER_RE, type ArticleSection, type SectionKind } from "../../src/lib/newsroom-types";

export type Draft = {
  headline: string;
  dek: string;
  news: string;
  thirty: string[];
  confirmed: DispatchClaim[];
  claimed: DispatchAttributed[];
  unknown: string[];
  matters: string;
  sections: ArticleSection[];
  body: { plain: string[]; expert: string[] };
  timeline: DispatchEvent[];
};

export type RawDraft = Partial<{
  skip: boolean;
  reason: string;
  headline: string; dek: string; news: string; thirty: unknown[]; matters: string; unknown: unknown[];
  confirmed: { text?: unknown; src?: unknown }[];
  claimed: { text?: unknown; by?: unknown; src?: unknown }[];
  timeline: { when?: unknown; text?: unknown; src?: unknown }[];
  article: Partial<Record<SectionKind, unknown[]>>;
  plain: unknown[];
  expert: unknown[];
}>;

const KINDS: SectionKind[] = ["news", "known", "matters", "background"];

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const keysOf = (v: unknown, valid: Set<string>) => [...new Set(arr<unknown>(v).filter((k): k is string => typeof k === "string" && valid.has(k)))];

/** The marker keys in a paragraph, in order: "[s1,s3] … [b1]" → ["s1","s3","b1"]. */
export function markerKeys(p: string): string[] {
  return [...p.matchAll(MARKER_RE)].flatMap(m => m[1].split(/\s*,\s*/));
}

/** Keep only markers that point at something real; [bN] only where background is allowed. */
function cleanMarkers(p: string, valid: Set<string>, allowB: boolean): string {
  return p.replace(MARKER_RE, (_m, ks: string) => {
    const ok = ks.split(/\s*,\s*/).filter(k => valid.has(k) && (allowB || k.startsWith("s")));
    return ok.length ? ` [${ok.join(",")}]` : "";
  }).replace(/\s+([.,;:])/g, "$1").trim();
}

export function shapeDraft(r: RawDraft | null | undefined, sources: DispatchSource[], backgroundKeys: string[]): Draft | string {
  if (!r || typeof r !== "object") return "no reply";
  if (r.skip) return `skip${r.reason ? `: ${str(r.reason, 200)}` : ""}`;
  const srcKeys = new Set(sources.map(s => s.key));
  const valid = new Set([...srcKeys, ...backgroundKeys]);
  const headline = str(r.headline, 140);
  const dek = str(r.dek, 300);
  const news = str(r.news, 300);
  const thirty = arr<unknown>(r.thirty).map(x => str(x, 160)).filter(Boolean).slice(0, 3);
  const matters = str(r.matters, 480);
  if (!headline || !news || thirty.length !== 3 || !matters) return "missing fields";

  const sections: ArticleSection[] = [];
  for (const kind of KINDS) {
    const paras = arr<unknown>(r.article?.[kind])
      .map(p => (typeof p === "string" ? cleanMarkers(p.replace(/\s+/g, " "), valid, kind === "background") : ""))
      .filter(p => p.replace(MARKER_RE, "").trim().length > 0)
      .slice(0, 6)
      .map(p => p.slice(0, 1600));
    if (paras.length) sections.push({ kind, paras });
  }
  if (!sections.some(s => s.kind === "news")) return "no news section";

  const plain = arr<unknown>(r.plain).map(p => (typeof p === "string" ? cleanMarkers(p, srcKeys, false) : "")).filter(Boolean).slice(0, 3);
  const expert = arr<unknown>(r.expert).map(p => (typeof p === "string" ? cleanMarkers(p, srcKeys, false) : "")).filter(Boolean).slice(0, 3);
  if (plain.length === 0) return "no plain version";

  const confirmed = arr<{ text?: unknown; src?: unknown }>(r.confirmed)
    .map(x => ({ text: str(x.text, 260), src: keysOf(x.src, srcKeys) })).filter(x => x.text && x.src.length).slice(0, 5);
  const claimed: DispatchAttributed[] = arr<{ text?: unknown; by?: unknown; src?: unknown }>(r.claimed)
    .map(x => ({ text: str(x.text, 260), by: str(x.by, 80), src: keysOf(x.src, srcKeys) })).filter(x => x.text && x.by && x.src.length).slice(0, 5);
  const unknown = arr<unknown>(r.unknown).map(x => str(x, 220)).filter(Boolean).slice(0, 4);
  const timeline = arr<{ when?: unknown; text?: unknown; src?: unknown }>(r.timeline)
    .map(x => ({ when: str(x.when, 60), text: str(x.text, 220), src: keysOf(x.src, srcKeys) })).filter(x => x.when && x.text && x.src.length).slice(0, 8);
  if (confirmed.length + claimed.length === 0) return "no points";

  // "Confirmed" is counted, not chosen: two outlets, or the party itself.
  const official = new Set(sources.filter(s => s.official).map(s => s.key));
  const outletOf = new Map(sources.map(s => [s.key, s.outlet]));
  const confirmedOk: DispatchClaim[] = [];
  for (const c of confirmed) {
    const outlets = new Set(c.src.map(k => outletOf.get(k)));
    if (outlets.size >= 2 || c.src.some(k => official.has(k))) confirmedOk.push(c);
    else claimed.push({ ...c, by: outletOf.get(c.src[0]) ?? "" });
  }
  return { headline, dek, news, thirty, confirmed: confirmedOk, claimed: claimed.slice(0, 6), unknown, matters, sections, body: { plain, expert }, timeline };
}

/**
 * The French must line up with the English point for point; the English
 * decides which source backs which point. Returns why it doesn't line up.
 */
export function alignFrench(fr: Draft, en: Draft): string | null {
  if (fr.confirmed.length !== en.confirmed.length || fr.claimed.length !== en.claimed.length || fr.timeline.length !== en.timeline.length) return "points don't line up with the English";
  const kinds = (d: Draft) => d.sections.map(s => s.kind).join(",");
  if (kinds(fr) !== kinds(en)) return "sections don't line up with the English";
  fr.confirmed.forEach((x, i) => (x.src = en.confirmed[i].src));
  fr.claimed.forEach((x, i) => (x.src = en.claimed[i].src));
  fr.timeline.forEach((x, i) => (x.src = en.timeline[i].src));
  return null;
}

/** The draft as the model sees it again (for the copy editor and the translator). */
export function toRaw(d: Draft): RawDraft {
  const article: Partial<Record<SectionKind, string[]>> = {};
  for (const s of d.sections) article[s.kind] = s.paras;
  return {
    headline: d.headline, dek: d.dek, news: d.news, thirty: d.thirty, confirmed: d.confirmed, claimed: d.claimed,
    unknown: d.unknown, matters: d.matters, article, plain: d.body.plain, expert: d.body.expert, timeline: d.timeline,
  };
}
