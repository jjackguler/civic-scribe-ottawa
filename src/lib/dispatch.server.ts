/**
 * The Dispatch desk: original articles AI Broadsheet writes, with AI, about
 * one event that two or more outlets are reporting.
 *
 * House rules (see /standards#dispatches):
 * - Written only from the headlines and excerpts those outlets published for
 *   the event (one cluster from cluster.ts). Nothing else goes in.
 * - The same mechanical fact guard as the AI desk (ai-desk.server.ts): every
 *   number and every capitalised name in every field must appear in the
 *   sources. One miss and the draft is thrown away (one retry, told which
 *   words failed; then the event is skipped).
 * - "Confirmed" means two or more outlets report it as fact, or the company,
 *   lab or agency announced it itself. Anything else is shown as a claim, in
 *   someone's name.
 * - Every dispatch lists and links every source, and is labelled.
 *
 * Two short model calls per dispatch, English first, then Canadian French from
 * the English and the same sources, so each call fits inside a Worker's
 * background time. A few calls per desk rebuild; kept in memory and in the
 * shared cache; capped per day (plus claudeJson's own daily budget). Without a
 * model key nothing runs and the feature is simply absent.
 */
import type { NewsPayload, Story } from "./news-engine";
import { clusterStories, type Cluster } from "./cluster";
import { sharedRead, sharedWrite } from "./shared-cache";
import { unsupported } from "./ai-desk.server";
import { DEPTHS, stripMarkers, type Dispatch, type DispatchCopy, type DispatchSource, type DispatchClaim, type DispatchAttributed, type DispatchEvent } from "./dispatch-types";

const KEY = "dispatch:v1";
const MAX_KEEP = 120;
const KEEP_DAYS = 30;
const PER_RUN = 2;
const MAX_TRIES = 2;
const dailyCap = () => Number(process.env["DISPATCH_DAILY_CAP"]) || 8;

type Pending = {
  id: string;
  createdAt: string;
  topic: string;
  sources: DispatchSource[];
  /** The outlets' excerpts, aligned with `sources`. */
  excerpts: string[];
  sourceText: string;
  en?: DispatchCopy;
  /** Calls that got no reply at all (network, timeout, budget). */
  fails?: number;
  enTries: number;
  frTries: number;
  /** Words the fact guard rejected last time, fed back on the retry. */
  bad?: string[];
};
type Saved = { d: [string, Dispatch][]; p: [string, Pending][]; r: string[]; day?: { day: string; count: number } };

const g = globalThis as unknown as {
  __dispatch?: Map<string, Dispatch>;
  __dispatchPending?: Map<string, Pending>;
  __dispatchRejected?: Set<string>;
  __dispatchDay?: { day: string; count: number };
  __dispatchLoaded?: boolean;
  __dispatchRunning?: number;
};
const done = () => (g.__dispatch ??= new Map());
const pending = () => (g.__dispatchPending ??= new Map());
const rejected = () => (g.__dispatchRejected ??= new Set());

async function loadShared(): Promise<void> {
  if (g.__dispatchLoaded) return;
  const saved = await sharedRead<Saved>(KEY);
  for (const [id, d] of saved?.d ?? []) if (!done().has(id)) done().set(id, d);
  for (const [id, p] of saved?.p ?? []) if (!pending().has(id) && !done().has(id)) pending().set(id, p);
  for (const id of saved?.r ?? []) rejected().add(id);
  if (saved?.day && (!g.__dispatchDay || g.__dispatchDay.day !== saved.day.day || g.__dispatchDay.count < saved.day.count)) g.__dispatchDay = saved.day;
  if (saved) g.__dispatchLoaded = true;
}

function save() {
  const cutoff = Date.now() - KEEP_DAYS * 86400_000;
  const all = [...done().entries()]
    .filter(([, d]) => new Date(d.createdAt).getTime() > cutoff)
    .sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt))
    .slice(0, MAX_KEEP);
  g.__dispatch = new Map(all);
  const p = [...pending().entries()].filter(([, x]) => Date.now() - new Date(x.createdAt).getTime() < 2 * 86400_000);
  g.__dispatchPending = new Map(p);
  sharedWrite(KEY, { d: all, p, r: [...rejected()].slice(-800), day: g.__dispatchDay } satisfies Saved, KEEP_DAYS * 86400);
}

/**
 * Every published dispatch, newest first. Never throws. Once the Newsroom
 * (scripts/newsroom, stored on the `newsroom` branch) has published, its
 * newest articles are the dispatches and this desk stands down.
 */
export async function listDispatches(): Promise<Dispatch[]> {
  try {
    const { newestArticles } = await import("./newsroom.server");
    const articles = await newestArticles(12);
    if (articles.length) return articles;
  } catch { /* the Worker desk below */ }
  try { await loadShared(); } catch { /* memory only */ }
  return [...done().values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDispatchById(id: string): Promise<Dispatch | null> {
  try { await loadShared(); } catch { /* memory only */ }
  return done().get(id) ?? null;
}

// ── the fact guard, extended ───────────────────────────────────────────────
/**
 * Ordinary words that may start a sentence in our copy without appearing in
 * the sources. Function words only: no nouns ("Experts", "Critics") and no
 * dates ("Today"), which would let invented facts through.
 */
const STARTERS = (
  "whether when where while what which who whom whose why how both several some many most few neither either none no not nor " +
  "however meanwhile still also yet so then there here they them their he she his her we our you your it its if although though " +
  "because since until unless instead rather only even just each every all any another other such same than once again already " +
  "according among across about between during without within against despite beyond like unlike including is are was were has have " +
  "had do does did can could may might will would should must one that this these those but and or for in on at by to of with from " +
  "under over after before as into the a an not more less much nothing nobody someone something anything everything " +
  "il elle ils elles on nous vous ce cet cette ces c ca que qui quoi quel quelle quels quelles lorsque quand comment pourquoi ou " +
  "si mais donc ni car ainsi aussi encore toujours deja plus moins tres peu beaucoup plusieurs certains certaines chaque tous toutes " +
  "tout toute aucun aucune autre autres meme selon dans pour par sur sous avec sans entre depuis pendant avant apres jusqu reste rien " +
  "personne cependant toutefois pourtant neanmoins alors puis enfin notamment y est sont a ont etait sera pourrait peut doit fait ne pas " +
  "le la les un une des du de au aux son sa ses leur leurs en et oui non"
).split(" ");

/** French elisions ("l'", "d'", "qu'") hide the word after them; take them off so that word is checked. */
const unElide = (s: string) => s.replace(/(^|[\s«“"(])(?:[LDJMNSTC]|Qu|Jusqu|Lorsqu|Puisqu)['’](?=\p{L})/giu, "$1");

/** Every field, one at a time, so each sentence start is a real sentence start. */
function fieldsOf(c: DispatchCopy): string[] {
  return [
    c.headline, c.news, ...c.thirty, c.matters, ...c.unknown,
    ...c.confirmed.map(x => x.text), ...c.claimed.flatMap(x => [x.text, x.by]),
    ...c.timeline.flatMap(x => [x.when, x.text]),
    ...DEPTHS.flatMap(d => c.body[d].map(stripMarkers)),
  ];
}

export function guard(c: DispatchCopy, sourceText: string): string[] {
  const src = unElide(sourceText);
  const bad = new Set<string>();
  for (const f of fieldsOf(c)) for (const w of unsupported(unElide(f), src, STARTERS)) bad.add(w);
  return [...bad];
}

// ── shaping and checking a model reply ─────────────────────────────────────
type Raw = Partial<{
  skip: boolean;
  headline: string; news: string; thirty: unknown[]; matters: string; unknown: unknown[];
  confirmed: { text?: unknown; src?: unknown }[]; claimed: { text?: unknown; by?: unknown; src?: unknown }[];
  timeline: { when?: unknown; text?: unknown; src?: unknown }[];
  body: Partial<Record<string, unknown[]>>;
}>;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const keys = (v: unknown, valid: Set<string>) => [...new Set((Array.isArray(v) ? v : []).filter((k): k is string => typeof k === "string" && valid.has(k)))];
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Turn a reply into a DispatchCopy, or return why it can't be one. */
function shape(r: Raw | null | undefined, sources: DispatchSource[]): DispatchCopy | string {
  if (!r || typeof r !== "object") return "no reply";
  if (r.skip) return "skip";
  const valid = new Set(sources.map(s => s.key));
  const headline = str(r.headline, 140);
  const news = str(r.news, 260);
  const thirty = arr<unknown>(r.thirty).map(x => str(x, 160)).filter(Boolean);
  const matters = str(r.matters, 420);
  if (headline.length < 25 || /[!?]/.test(headline) || /breaking|urgent|shock|choc/i.test(headline)) return "headline";
  if (news.length < 30 || thirty.length !== 3 || !matters) return "fields";
  const confirmed: DispatchClaim[] = arr<{ text?: unknown; src?: unknown }>(r.confirmed)
    .map(x => ({ text: str(x.text, 240), src: keys(x.src, valid) })).filter(x => x.text && x.src.length).slice(0, 5);
  const claimed: DispatchAttributed[] = arr<{ text?: unknown; by?: unknown; src?: unknown }>(r.claimed)
    .map(x => ({ text: str(x.text, 240), by: str(x.by, 80), src: keys(x.src, valid) })).filter(x => x.text && x.by && x.src.length).slice(0, 5);
  const unknown = arr<unknown>(r.unknown).map(x => str(x, 200)).filter(Boolean).slice(0, 4);
  const timeline: DispatchEvent[] = arr<{ when?: unknown; text?: unknown; src?: unknown }>(r.timeline)
    .map(x => ({ when: str(x.when, 60), text: str(x.text, 200), src: keys(x.src, valid) })).filter(x => x.when && x.text && x.src.length).slice(0, 6);
  const body = {} as DispatchCopy["body"];
  for (const d of DEPTHS) {
    const paras = arr<unknown>(r.body?.[d]).map(p => (typeof p === "string" ? p.trim() : "")).filter(Boolean)
      // Keep only markers that point at a real source.
      .map(p => p.replace(/\[((?:s\d+)(?:\s*,\s*s\d+)*)\]/g, (m, ks: string) => { const ok = ks.split(/\s*,\s*/).filter(k => valid.has(k)); return ok.length ? `[${ok.join(",")}]` : ""; }))
      .slice(0, 7);
    if (paras.length === 0) return `body.${d}`;
    body[d] = paras.map(p => p.slice(0, 1400));
  }
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
  return { headline, news, thirty, confirmed: confirmedOk, claimed: claimed.slice(0, 6), unknown, matters, body, timeline };
}

// ── choosing events ────────────────────────────────────────────────────────
const usedStoryIds = () => {
  const s = new Set<string>();
  for (const d of done().values()) for (const x of d.sources) s.add(x.storyId);
  for (const p of pending().values()) for (const x of p.sources) s.add(x.storyId);
  return s;
};

function toSources(c: Cluster): DispatchSource[] {
  // One report per outlet (its newest), richest excerpts first, at most six.
  const byOutlet = new Map<string, Story>();
  for (const s of c.stories) if (!byOutlet.has(s.source)) byOutlet.set(s.source, s);
  return [...byOutlet.values()]
    .sort((a, b) => (b.summary?.length ?? 0) - (a.summary?.length ?? 0))
    .slice(0, 6)
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
    .map((s, i) => ({ key: `s${i + 1}`, outlet: s.source, title: s.title, url: s.link, publishedAt: s.publishedAt, storyId: s.id, official: s.lab || s.gov, lang: s.lang }));
}

function pickNew(payload: NewsPayload, n: number): Pending[] {
  if (n <= 0) return [];
  const used = usedStoryIds();
  const out: Pending[] = [];
  for (const c of clusterStories(payload.stories, 36)) {
    if (out.length >= n) break;
    if (c.sources < 2 || rejected().has(c.id) || done().has(c.id) || pending().has(c.id)) continue;
    if (c.stories.some(s => used.has(s.id))) continue;
    const sources = toSources(c);
    const excerptChars = c.stories.reduce((t, s) => t + (s.summary?.length ?? 0), 0);
    if (sources.length < 2 || excerptChars < 240) continue; // too little to write from
    const excerpts = sources.map(s => (c.stories.find(x => x.id === s.storyId)?.summary ?? "").slice(0, 700));
    const sourceText = sources.map((s, i) => `${s.outlet}: ${s.title}. ${excerpts[i]}`).join("\n");
    out.push({ id: c.id, createdAt: new Date().toISOString(), topic: c.lead.topic, sources, excerpts, sourceText, enTries: 0, frTries: 0 });
  }
  return out;
}

// ── prompts ────────────────────────────────────────────────────────────────
const RULES = `Hard rules:
- Use ONLY facts written in the sources' headlines and excerpts. Do not add any name, number, date, place, quote, motive, reaction or consequence that is not written there. No background from memory.
- Keep every name, product name and number exactly as written in the sources (no unit or currency conversion). Never count the outlets.
- Start sentences with a name from the sources or a plain function word (It, This, The, Whether, Both…). Never "Experts", "Critics", "Analysts", "Observers", "Today", "Yesterday".
- Plain verbs, short sentences, no hype, no exclamation marks, no questions in the headline, no ALL CAPS.
- If the sources disagree with each other on a fact, put each version in "claimed", attributed. If they are too thin to write more than a headline, return {"skip": true}.`;

const SHAPE = `Return JSON:
{"headline": 50-95 characters, who did what, active voice,
 "news": one sentence, at most 25 words: the news,
 "thirty": exactly 3 lines, each at most 14 words, that together tell the story in 30 seconds,
 "confirmed": 0-4 [{"text", "src": ["s1","s3"]}] facts reported as fact by two or more of the sources, or announced by the company, lab or agency itself (official source),
 "claimed": 0-4 [{"text", "by", "src": [...]}] statements made by someone, in their name ("by" is that party, named in the sources; "text" is written as "X says…"),
 "unknown": 1-3 short lines naming what the sources leave open, phrased neutrally ("Whether…", "When…", "How much…"), never speculating,
 "matters": at most 2 plain sentences on what this changes for an ordinary reader, ONLY as far as the sources say; if they say nothing about impact, say plainly what is different now,
 "body": {"plain": 2 short paragraphs for someone new to AI, define any technical term in everyday words;
          "standard": 3 paragraphs, newspaper style;
          "expert": 3-4 paragraphs, precise, use the sources' technical terms, note where the outlets' accounts differ},
   end each sentence that carries a fact with the source marker(s) it comes from, like "[s2]" or "[s1,s3]",
 "timeline": [{"when", "text", "src"}] ONLY for times or dates the sources themselves state ("when" copied as written); otherwise []}`;

const SYSTEM_EN = `You are the Dispatch desk of AI Broadsheet, a bilingual AI news site in Canada. You write one short original article, a "Dispatch", about ONE event, from the reporting of several outlets. You get each source as {key, outlet, official, published, headline, excerpt}.

${SHAPE}

${RULES}`;

const SYSTEM_FR = `You are the Dispatch desk of AI Broadsheet, a bilingual AI news site in Canada. You get an English Dispatch (JSON) and the sources it was written from. Write the same Dispatch in Canadian French for the same readers: natural French newspaper style, not a word-for-word translation.

Return exactly the same JSON shape with the same number of items in every list, in the same order, the same "src" arrays and the same [sN] markers in the same sentences. Headline 50-110 characters.

${RULES}
- Keep names exactly as written in the sources; use a French form of a name only if a French source writes it that way. You may use a decimal comma and "%" with a space.`;

const sourcesFor = (p: Pending) => p.sources.map((s, i) => ({
  key: s.key, outlet: s.outlet, official: s.official, published: s.publishedAt, headline: s.title, excerpt: p.excerpts[i] ?? "",
}));

/** No reply at all: try again on a later run, but not forever. */
function noReply(p: Pending): never {
  p.fails = (p.fails ?? 0) + 1;
  if (p.fails >= 3) reject(p, "no reply");
  throw new Error("no reply");
}

function retryNote(p: Pending) {
  return p.bad?.length ? `\n\nA previous draft was rejected because these words are not in the sources: ${p.bad.slice(0, 12).join(", ")}. Do not use them.` : "";
}

async function writeEnglish(c: typeof import("./claude.server"), p: Pending): Promise<void> {
  p.enTries++;
  const raw = await c.claudeJson<Raw>({
    task: "dispatch-en",
    model: c.SONNET,
    system: SYSTEM_EN,
    user: JSON.stringify({ sources: sourcesFor(p) }) + retryNote(p),
    maxTokens: 2600,
    ttlMs: 24 * 3600_000,
    timeoutMs: 26_000,
  });
  if (raw == null) { p.enTries--; noReply(p); }
  const copy = shape(raw, p.sources);
  if (typeof copy === "string") { p.bad = []; if (copy === "skip" || p.enTries >= MAX_TRIES) reject(p, `en: ${copy}`); return; }
  const bad = guard(copy, p.sourceText);
  if (bad.length) { p.bad = bad; console.warn("[dispatch] en rejected by fact check:", p.id, bad.slice(0, 6)); if (p.enTries >= MAX_TRIES) reject(p, "en: facts"); return; }
  p.en = copy;
  p.bad = [];
}

async function writeFrench(c: typeof import("./claude.server"), p: Pending): Promise<Dispatch | null> {
  const en = p.en!;
  p.frTries++;
  const raw = await c.claudeJson<Raw>({
    task: "dispatch-fr",
    model: c.SONNET,
    system: SYSTEM_FR,
    user: JSON.stringify({ english: en, sources: sourcesFor(p) }) + retryNote(p),
    maxTokens: 3000,
    ttlMs: 24 * 3600_000,
    timeoutMs: 26_000,
  });
  if (raw == null) { p.frTries--; noReply(p); }
  const fr = shape(raw, p.sources);
  // The French must line up with the English point for point; the English decides the sources.
  const same = typeof fr !== "string" && fr.confirmed.length === en.confirmed.length && fr.claimed.length === en.claimed.length && fr.timeline.length === en.timeline.length;
  if (typeof fr === "string" || !same) { p.bad = []; if (p.frTries >= MAX_TRIES) reject(p, "fr: shape"); return null; }
  fr.confirmed.forEach((x, i) => (x.src = en.confirmed[i].src));
  fr.claimed.forEach((x, i) => (x.src = en.claimed[i].src));
  fr.timeline.forEach((x, i) => (x.src = en.timeline[i].src));
  const bad = guard(fr, p.sourceText);
  if (bad.length) { p.bad = bad; console.warn("[dispatch] fr rejected by fact check:", p.id, bad.slice(0, 6)); if (p.frTries >= MAX_TRIES) reject(p, "fr: facts"); return null; }
  return { id: p.id, createdAt: new Date().toISOString(), topic: p.topic, sources: p.sources, en, fr, model: c.modelProvider() ?? "claude" };
}

function reject(p: Pending, why: string) {
  console.warn("[dispatch] skipped", p.id, why);
  pending().delete(p.id);
  rejected().add(p.id);
}

function takeDay(): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const d = (g.__dispatchDay ??= { day, count: 0 });
  if (d.day !== day) { d.day = day; d.count = 0; }
  if (d.count >= dailyCap()) return false;
  d.count++;
  return true;
}

/** Move a few dispatches forward. Never throws; does nothing without a model key. */
export async function runDispatches(payload: NewsPayload): Promise<number> {
  if (g.__dispatchRunning && Date.now() - g.__dispatchRunning < 90_000) return 0;
  g.__dispatchRunning = Date.now();
  try {
    const c = await import("./claude.server");
    if (!c.claudeAvailable()) return 0;
    // The Newsroom writes our articles now; this desk is the fallback while it has published nothing.
    const { newsroomHasItems } = await import("./newsroom.server");
    if (await newsroomHasItems()) return 0;
    await loadShared();
    // French for drafts whose English passed, then English retries, then new events.
    const jobs: (() => Promise<Dispatch | null | void>)[] = [];
    const waiting = [...pending().values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const p of waiting) if (jobs.length < PER_RUN && p.en) jobs.push(() => writeFrench(c, p));
    for (const p of waiting) if (jobs.length < PER_RUN && !p.en) jobs.push(() => writeEnglish(c, p));
    for (const p of pickNew(payload, PER_RUN - jobs.length)) {
      if (!takeDay()) break;
      pending().set(p.id, p);
      jobs.push(() => writeEnglish(c, p));
    }
    if (jobs.length === 0) return 0;
    const results = await Promise.allSettled(jobs.map(j => j()));
    let added = 0;
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        done().set(r.value.id, r.value);
        pending().delete(r.value.id);
        added++;
      }
    }
    save();
    return added;
  } catch (e) {
    console.warn("[dispatch]", (e as Error).message);
    return 0;
  } finally {
    g.__dispatchRunning = 0;
  }
}
