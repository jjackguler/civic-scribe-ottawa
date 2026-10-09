/**
 * The Broadsheet 5: five multiple-choice questions from today's headlines.
 *
 * House rules (see /standards):
 * - Most questions are built mechanically from the desk's own data: which
 *   outlet published a headline, which name fills a gap in a headline, whether
 *   a point in one of our dispatches is confirmed, claimed or still unknown.
 *   Every answer is therefore a fact the page can link to.
 * - When a model key is set, Claude (or Gemini) may write up to two more, in
 *   the background. Each must pass a fact guard: the right answer appears word
 *   for word in that story's headline or excerpt, no wrong answer does, and the
 *   question adds no name or number the source lacks. Anything else is thrown
 *   away.
 * - Stories about death, violence or abuse never become questions.
 * - One quiz per day (Ottawa time), the same for every reader, kept in the
 *   shared cache so every isolate serves the same five.
 */
import type { Story } from "./news-engine";
import type { Dispatch } from "./dispatch-types";
import type { Topic } from "./news-sources";
import { clusterStories, isFrontPool, type Cluster } from "./cluster";
import { keepAlive, sharedRead, sharedWrite } from "./shared-cache";
import { QUIZ_LENGTH, SENSITIVE, quizDay, rng, seedOf, shuffle, type DailyQuiz, type QuizQ } from "./youth-core";

type Pair = { en: QuizQ; fr: QuizQ; storyIds: string[] };

const DESK: Record<Topic, { en: string; fr: string }> = {
  agents: { en: "AI assistants & agents", fr: "Assistants et agents IA" },
  applications: { en: "Applications", fr: "Applications" },
  immersive: { en: "AR, VR & immersive", fr: "RA, RV et immersif" },
  data: { en: "Data & analytics", fr: "Données et analytique" },
  infrastructure: { en: "Infrastructure & chips", fr: "Infrastructures et puces" },
  research: { en: "Machine learning & research", fr: "Apprentissage automatique et recherche" },
  people: { en: "People & skills", fr: "Personnes et compétences" },
  responsible: { en: "Responsible AI", fr: "IA responsable" },
  policy: { en: "Policy & regulation", fr: "Politiques et réglementation" },
  business: { en: "Business & funding", fr: "Affaires et financement" },
  sustainability: { en: "Sustainability", fr: "Durabilité" },
  robotics: { en: "Robotics", fr: "Robotique" },
  health: { en: "Health & science", fr: "Santé et sciences" },
};

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘]/g, "'").replace(/[“”«»]/g, '"').replace(/\s+/g, " ").trim();
const listOf = (xs: string[], fr: boolean) => xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${fr ? "et" : "and"} ${xs[xs.length - 1]}`;

// ── names in headlines (for "fill the gap") ────────────────────────────────
/** Capitalised words that are not names. */
const COMMON = new Set(("a an the this that these those how why what when where who which new ai ia is are was were be will can could may might " +
  "in on at by for from of to with and or but after before over under into about as its it's it his her their our your my we you they i " +
  "says say said report reports study exclusive inside here meet watch opinion analysis update live breaking first latest more most now today " +
  "week year month monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december " +
  "le la les l un une des du de d au aux et ou pour par sur dans avec selon comment pourquoi quand qui que quoi nouveau nouvelle nouvelles " +
  "lundi mardi mercredi jeudi vendredi samedi dimanche janvier février mars avril mai juin juillet août septembre octobre novembre décembre " +
  "introducing announcing why how").split(" "));

const WORD = /[\p{L}\p{N}][\p{L}\p{N}&'’.-]*/gu;
const clean = (w: string) => w.replace(/['’]s$/i, "").replace(/[.'’-]+$/, "");
const isNameish = (w: string) => (/^\p{Lu}/u.test(w) || (/\d/.test(w) && /\p{L}/u.test(w))) && !COMMON.has(w.toLowerCase()) && w.length >= 2 && !/^\d/.test(w);

/** A headline set in Title Case gives no signal about which words are names. */
function titleCase(title: string): boolean {
  const long = (title.match(WORD) ?? []).map(clean).filter(w => w.length >= 4 && !/\d/.test(w));
  if (long.length < 3) return false;
  return long.filter(w => /^\p{Ll}/u.test(w)).length / long.length < 0.3;
}

/** Runs of name-like words in a headline ("Northwind Labs", "Aurora-2"). */
function nameRuns(title: string): { text: string; start: boolean }[] {
  const out: { text: string; start: boolean }[] = [];
  let run: string[] = [];
  let runStart = false;
  let i = 0;
  const flush = () => { if (run.length) out.push({ text: run.join(" "), start: runStart }); run = []; };
  // Words separated by anything other than a single space end the run.
  const parts = title.split(/(\s+|[:;,!?()"“”«»—–]+)/);
  for (const p of parts) {
    if (!p) continue;
    if (/^\s+$/.test(p)) continue;
    if (!/^[\p{L}\p{N}]/u.test(p)) { flush(); continue; }
    const w = clean(p);
    if (isNameish(w) && run.length < 3) {
      if (!run.length) runStart = i === 0;
      run.push(w);
      if (p !== w && /['’]s$/i.test(p)) flush(); // possessive ends a name
    } else flush();
    i++;
  }
  flush();
  return out;
}

// ── question builders ──────────────────────────────────────────────────────
type Ctx = { pool: Story[]; clusters: Cluster[]; dispatches: Dispatch[]; rand: () => number; used: Set<string>; usedClusters: Set<string> };

const clusterOf = (ctx: Ctx, s: Story) => ctx.clusters.find(c => c.stories.some(x => x.id === s.id));
const take = (ctx: Ctx, s: Story) => { ctx.used.add(s.id); const c = clusterOf(ctx, s); if (c) ctx.usedClusters.add(c.id); };
const free = (ctx: Ctx, s: Story) => !ctx.used.has(s.id) && !ctx.usedClusters.has(clusterOf(ctx, s)?.id ?? "");
const storyLink = (s: Story) => ({ to: "/story/$id" as const, id: s.id });

function outletQ(ctx: Ctx, s: Story): Pair | null {
  const others = [...new Set(ctx.pool.map(x => x.source))].filter(x => x !== s.source);
  if (others.length < 3) return null;
  const opts = shuffle([s.source, ...shuffle(others, ctx.rand).slice(0, 3)], ctx.rand);
  const answer = opts.indexOf(s.source);
  const c = clusterOf(ctx, s);
  const n = c?.sources ?? 1;
  const base = { kind: "outlet" as const, quote: s.title, quoteLang: s.lang, options: opts, answer, link: storyLink(s) };
  return {
    storyIds: [s.id],
    en: { ...base, id: `o-${s.id}`, prompt: "Who published this headline?", linkLabel: "Read the story",
      explain: `${s.source} published it.${n >= 2 ? ` ${n} outlets are reporting this story.` : ""}` },
    fr: { ...base, id: `o-${s.id}`, prompt: "Qui a publié ce titre?", linkLabel: "Lire la nouvelle",
      explain: `C'est ${s.source} qui l'a publié.${n >= 2 ? ` ${n} médias rapportent cette nouvelle.` : ""}` },
  };
}

function gapQ(ctx: Ctx, s: Story, names: Map<string, number>): Pair | null {
  if (titleCase(s.title)) return null;
  const runs = nameRuns(s.title).filter(r => !r.start || (names.get(r.text) ?? 0) >= 2);
  if (!runs.length) return null;
  const pick = runs[Math.floor(ctx.rand() * runs.length)].text;
  const inTitle = fold(s.title);
  const digit = /\d/.test(pick);
  const cands = [...names.keys()].filter(n => n !== pick && !inTitle.includes(fold(n)) && !fold(n).includes(fold(pick)) && !fold(pick).includes(fold(n)));
  const same = cands.filter(n => /\d/.test(n) === digit);
  const pool = same.length >= 3 ? same : cands;
  if (pool.length < 3) return null;
  const opts = shuffle([pick, ...shuffle(pool, ctx.rand).slice(0, 3)], ctx.rand);
  const esc = pick.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quote = s.title.replace(new RegExp(esc, "g"), "_____");
  if (!quote.includes("_____")) return null;
  const base = { kind: "gap" as const, quote, quoteLang: s.lang, options: opts, answer: opts.indexOf(pick), link: storyLink(s) };
  return {
    storyIds: [s.id],
    en: { ...base, id: `g-${s.id}`, prompt: "Fill the gap in today's headline.", linkLabel: "Read the story", explain: `The headline from ${s.source}: “${s.title}”` },
    fr: { ...base, id: `g-${s.id}`, prompt: "Complétez le titre du jour.", linkLabel: "Lire la nouvelle", explain: `Le titre de ${s.source} : « ${s.title} »` },
  };
}

function ledgerQ(ctx: Ctx, d: Dispatch): Pair | null {
  const outlets = (keys: string[]) => [...new Set(keys.map(k => d.sources.find(s => s.key === k)?.outlet).filter((x): x is string => !!x))];
  type Item = { kind: 0 | 1 | 2; en: string; fr: string; enBy?: string; who: string[] };
  const items: Item[] = [];
  d.en.confirmed.forEach((c, i) => d.fr.confirmed[i] && items.push({ kind: 0, en: c.text, fr: d.fr.confirmed[i].text, who: outlets(c.src) }));
  d.en.claimed.forEach((c, i) => d.fr.claimed[i] && items.push({ kind: 1, en: c.text, fr: d.fr.claimed[i].text, enBy: c.by, who: outlets(c.src) }));
  d.en.unknown.forEach((u, i) => d.fr.unknown[i] && items.push({ kind: 2, en: u, fr: d.fr.unknown[i], who: [] }));
  const ok = items.filter(x => !SENSITIVE.test(x.en) && x.en.length <= 200 && (x.kind !== 0 || x.who.length >= 2));
  if (!ok.length) return null;
  // Claims make the best question: is it a fact, or someone's word?
  const claims = ok.filter(x => x.kind === 1);
  const it = claims.length && ctx.rand() < 0.6 ? claims[Math.floor(ctx.rand() * claims.length)] : ok[Math.floor(ctx.rand() * ok.length)];
  const link = { to: "/dispatch/$id" as const, id: d.id };
  const en: QuizQ = {
    id: `l-${d.id}`, kind: "ledger", link, linkLabel: "Read the dispatch",
    prompt: `In our dispatch “${d.en.headline}”, where does this point belong?`,
    quote: it.en, quoteLang: "en",
    options: ["Confirmed: several outlets reported it", "Claimed: someone says it, in their name", "Still unknown: the reporting doesn't say"],
    answer: it.kind,
    explain: it.kind === 0 ? `Confirmed. ${listOf(it.who, false)} all reported it.`
      : it.kind === 1 ? `Claimed. ${it.enBy ? `${it.enBy} says so` : "Someone says so"}; the reporting doesn't confirm it on its own.`
      : "Still unknown. None of the reports answer this yet. Knowing what we don't know is part of the news.",
  };
  const fr: QuizQ = {
    ...en,
    prompt: `Dans notre dépêche « ${d.fr.headline} », où va ce point?`,
    quote: it.fr, quoteLang: "fr", linkLabel: "Lire la dépêche",
    options: ["Confirmé : plusieurs médias l'ont rapporté", "Affirmé : quelqu'un le dit, en son nom", "Encore inconnu : les reportages ne le disent pas"],
    explain: it.kind === 0 ? `Confirmé. ${listOf(it.who, true)} l'ont tous rapporté.`
      : it.kind === 1 ? `Affirmé. ${it.enBy ? `${it.enBy} le dit` : "Quelqu'un le dit"}; les reportages ne le confirment pas à eux seuls.`
      : "Encore inconnu. Aucun reportage n'y répond pour l'instant. Savoir ce qu'on ignore fait partie de l'information.",
  };
  return { en, fr, storyIds: d.sources.map(s => s.storyId) };
}

function deskQ(ctx: Ctx, s: Story): Pair | null {
  const right = s.topic;
  const wrong = shuffle((Object.keys(DESK) as Topic[]).filter(t => !(s.tags ?? [s.topic]).includes(t)), ctx.rand).slice(0, 3);
  if (wrong.length < 3) return null;
  const order = shuffle([right, ...wrong], ctx.rand);
  const base = { kind: "desk" as const, quote: s.title, quoteLang: s.lang, answer: order.indexOf(right), link: storyLink(s) };
  return {
    storyIds: [s.id],
    en: { ...base, id: `d-${s.id}`, options: order.map(t => DESK[t].en), prompt: "Which desk is this story filed under on AI Broadsheet?", linkLabel: "Read the story",
      explain: `It's on the ${DESK[right].en} desk. We file every story by its subject, the way a newsroom does.` },
    fr: { ...base, id: `d-${s.id}`, options: order.map(t => DESK[t].fr), prompt: "Dans quelle section d'AI Broadsheet cette nouvelle est-elle classée?", linkLabel: "Lire la nouvelle",
      explain: `Elle est dans la section ${DESK[right].fr}. Chaque nouvelle est classée par sujet, comme dans une salle de rédaction.` },
  };
}

/** The pool the quiz draws on: today's newsroom stories, nothing tragic. */
function quizPool(stories: Story[], now = Date.now()): Story[] {
  return stories.filter(s => isFrontPool(s) && (s.kind === "news" || s.kind === "analysis" || s.kind === "lab")
    && now - new Date(s.publishedAt).getTime() < 30 * 3600_000 && !SENSITIVE.test(`${s.title} ${s.summary}`));
}

/** Five questions (fewer on a thin day), the same for every reader on `day`. */
export function buildDeterministic(stories: Story[], dispatches: Dispatch[], day: string): Pair[] {
  const pool = quizPool(stories);
  const ctx: Ctx = { pool, clusters: clusterStories(pool, 30), dispatches, rand: rng(seedOf(day)), used: new Set(), usedClusters: new Set() };
  const names = new Map<string, number>();
  for (const s of pool) {
    if (titleCase(s.title)) continue;
    for (const r of new Set(nameRuns(s.title).map(r => r.text))) names.set(r, (names.get(r) ?? 0) + 1);
  }
  // Big stories first: what several outlets report today is what readers will have seen.
  const ranked = [...ctx.clusters.map(c => c.lead), ...pool].filter((s, i, a) => a.indexOf(s) === i);
  const out: Pair[] = [];
  const add = (p: Pair | null, s?: Story) => {
    if (!p || out.length >= QUIZ_LENGTH) return false;
    out.push(p);
    if (s) take(ctx, s); else for (const id of p.storyIds) { const x = pool.find(y => y.id === id); if (x) take(ctx, x); }
    return true;
  };
  const tryEach = (fn: (s: Story) => Pair | null) => { for (const s of ranked) if (free(ctx, s) && add(fn(s), s)) return true; return false; };

  const recent = dispatches.filter(d => Date.now() - new Date(d.createdAt).getTime() < 36 * 3600_000 && !SENSITIVE.test(d.en.headline));
  const plan: ("gap" | "outlet" | "ledger")[] = ["gap", "outlet", "ledger", "gap", "outlet"];
  for (const kind of plan) {
    if (kind === "ledger") {
      const d = recent.find(x => !x.sources.some(s => ctx.used.has(s.storyId)));
      if (d) add(ledgerQ(ctx, d));
      else tryEach(s => gapQ(ctx, s, names)) || tryEach(s => outletQ(ctx, s));
    } else if (kind === "gap") {
      tryEach(s => gapQ(ctx, s, names)) || tryEach(s => outletQ(ctx, s));
    } else {
      tryEach(s => outletQ(ctx, s)) || tryEach(s => gapQ(ctx, s, names));
    }
  }
  while (out.length < QUIZ_LENGTH && tryEach(s => deskQ(ctx, s))) { /* fill */ }
  return out;
}

// ── model-written questions, fact-guarded ──────────────────────────────────
type AiOut = { questions?: { id: string; en?: AiCopy; fr?: AiCopy }[] };
type AiCopy = { question?: string; options?: string[]; answer?: string; explain?: string };

const SYSTEM = `You write questions for "The Broadsheet 5", AI Broadsheet's daily news quiz for curious young readers (12 and up), in English and Canadian French.
You get today's stories: an id, the publisher, the headline and a short excerpt. Write at most 3 multiple-choice questions, each about ONE story.

Hard rules:
- The correct answer is a short phrase (a name, a number, a product, a place) copied WORD FOR WORD from that story's headline or excerpt. Use the same phrase in "en" and "fr" (names and numbers don't change).
- Exactly 4 options. The 3 wrong options are plausible but must NOT appear anywhere in that story's text.
- The question must not contain the answer, and adds no fact, name or number that isn't in the story's text.
- Plain, friendly, neutral wording. No trick questions, no jokes about people, no fear, no hype. Never mock any person, group, faith or belief.
- Skip stories about death, violence, abuse or anything sexual.
- "explain": one sentence saying what the story reports, using only its text.
Return {"questions":[{"id","en":{"question","options":[4],"answer","explain"},"fr":{"question","options":[4],"answer","explain"}}]}.`;

/** Questions that pass every check; the rest are thrown away. */
export function guardAi(res: AiOut | null, pool: Story[], unsupported: (out: string, src: string) => string[]): Pair[] {
  const out: Pair[] = [];
  for (const q of res?.questions ?? []) {
    const s = pool.find(x => x.id === q.id);
    if (!s || !q.en || !q.fr) continue;
    const src = `${s.title}. ${s.summary}. ${s.source}`;
    const fsrc = fold(`${s.title} ${s.summary}`);
    const check = (c: AiCopy) => {
      const opts = (c.options ?? []).map(o => String(o).trim());
      const ans = String(c.answer ?? "").trim();
      const qText = String(c.question ?? "").trim();
      const ex = String(c.explain ?? "").trim();
      const idx = opts.indexOf(ans);
      if (opts.length !== 4 || new Set(opts.map(fold)).size !== 4 || idx < 0) return null;
      if (!ans || ans.length > 60 || opts.some(o => !o || o.length > 60)) return null;
      if (!qText || qText.length > 170 || !ex || ex.length > 280) return null;
      if (!fsrc.includes(fold(ans))) return null;                                      // the answer is in the source, verbatim
      if (opts.some((o, i) => i !== idx && fsrc.includes(fold(o)))) return null;        // no second right answer
      if (fold(qText).includes(fold(ans))) return null;                                 // no giveaway
      if (SENSITIVE.test(`${qText} ${ex}`)) return null;
      if (unsupported(`${qText} ${ex}`, src).length > 0) return null;                   // no invented names or numbers
      return { opts, idx, qText, ex };
    };
    const en = check(q.en), fr = check(q.fr);
    if (!en || !fr || en.idx !== fr.idx || fold(en.opts[en.idx]) !== fold(fr.opts[fr.idx])) continue;
    const base = { kind: "ai" as const, id: `a-${s.id}`, quote: undefined, link: storyLink(s), answer: en.idx };
    out.push({
      storyIds: [s.id],
      en: { ...base, prompt: en.qText, options: en.opts, explain: en.ex, linkLabel: "Read the story" },
      fr: { ...base, prompt: fr.qText, options: fr.opts, explain: fr.ex, linkLabel: "Lire la nouvelle" },
    });
  }
  return out;
}

async function aiPairs(stories: Story[], avoid: Set<string>): Promise<Pair[]> {
  const c = await import("./claude.server");
  if (!c.claudeAvailable()) return [];
  const { unsupported } = await import("./ai-desk.server");
  const pool = quizPool(stories).filter(s => !avoid.has(s.id) && s.summary.length > 40).slice(0, 10);
  if (pool.length === 0) return [];
  const res = await c.claudeJson<AiOut>({
    task: "quiz",
    model: c.SONNET,
    system: SYSTEM,
    user: JSON.stringify({ stories: pool.map(s => ({ id: s.id, publisher: s.source, headline: s.title, excerpt: s.summary.slice(0, 400) })) }),
    maxTokens: 2500,
    ttlMs: 26 * 3600_000,
    timeoutMs: 30_000,
  });
  return guardAi(res, pool, unsupported).slice(0, 2);
}

/** Model questions take the place of the last two mechanical ones (desk questions first). */
function merge(det: Pair[], ai: Pair[]): Pair[] {
  if (!ai.length) return det;
  const out = [...det];
  const isDesk = (i: number) => (out[i].en.kind === "desk" ? 1 : 0);
  const slots = [...out.keys()].filter(i => out[i].en.kind !== "ledger").sort((a, b) => isDesk(b) - isDesk(a) || b - a);
  let k = 0;
  for (const p of ai) {
    if (out.length < QUIZ_LENGTH) out.push(p);
    else if (slots[k] !== undefined) out[slots[k++]] = p;
  }
  return out.slice(0, QUIZ_LENGTH);
}

const pack = (day: string, pairs: Pair[], final: boolean, ai: boolean): DailyQuiz => ({
  day, builtAt: new Date().toISOString(), final, ai, en: pairs.map(p => p.en), fr: pairs.map(p => p.fr),
});

// ── the day's quiz ─────────────────────────────────────────────────────────
const g = globalThis as unknown as { __quiz?: Map<string, { ts: number; quiz: DailyQuiz }>; __quizAi?: Map<string, number> };
const mem = () => (g.__quiz ??= new Map());
const aiRuns = () => (g.__quizAi ??= new Map());
const KEEP_S = 2 * 24 * 3600;

async function sources(fixture: boolean): Promise<{ stories: Story[]; dispatches: Dispatch[] }> {
  if (import.meta.env.DEV && fixture) {
    const [{ FIXTURE_STORIES }, { FIXTURES }] = await Promise.all([import("./youth-fixture"), import("./dispatch-fixture")]);
    return { stories: FIXTURE_STORIES, dispatches: FIXTURES };
  }
  const [{ loadNews }, { listDispatches }] = await Promise.all([import("./news-engine"), import("./dispatch.server")]);
  const [news, dispatches] = await Promise.all([loadNews(), listDispatches().catch(() => [] as Dispatch[])]);
  return { stories: news.stories, dispatches };
}

export async function dailyQuiz(fixture = false): Promise<DailyQuiz> {
  const day = quizDay();
  const key = `quiz:v1:${day}${fixture ? ":fx" : ""}`;
  const hit = mem().get(key);
  if (hit && (hit.quiz.final || Date.now() - hit.ts < 2 * 60_000)) return hit.quiz;
  if (!fixture) {
    const shared = await sharedRead<DailyQuiz>(key);
    if (shared?.final && shared.day === day) { mem().set(key, { ts: Date.now(), quiz: shared }); return shared; }
  }
  // Old days fall out of memory.
  for (const k of mem().keys()) if (!k.includes(day)) mem().delete(k);

  const { stories, dispatches } = await sources(fixture);
  const det = buildDeterministic(stories, dispatches, day);
  const full = det.length >= QUIZ_LENGTH;
  const { claudeAvailable } = await import("./claude.server");
  if (!full || !claudeAvailable() || fixture) {
    const quiz = pack(day, det, full && !fixture, false);
    mem().set(key, { ts: Date.now(), quiz });
    if (quiz.final) sharedWrite(key, quiz, KEEP_S);
    return quiz;
  }
  // Serve the mechanical five now; the model's questions join once checked, then the day is frozen.
  const quiz = pack(day, det, false, false);
  mem().set(key, { ts: Date.now(), quiz });
  if (Date.now() - (aiRuns().get(key) ?? 0) > 5 * 60_000) {
    aiRuns().set(key, Date.now());
    keepAlive((async () => {
      const ai = await aiPairs(stories, new Set(det.flatMap(p => p.storyIds))).catch(() => [] as Pair[]);
      const merged = merge(det, ai);
      const final = pack(day, merged, true, merged.some(p => p.en.kind === "ai"));
      mem().set(key, { ts: Date.now(), quiz: final });
      sharedWrite(key, final, KEEP_S);
    })());
  }
  return quiz;
}
