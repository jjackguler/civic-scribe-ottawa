/**
 * The AI desk: Claude writes a fresh headline and a two-sentence brief, in
 * English and French, for the stories leading the desk.
 *
 * House rules (see /standards):
 * - It works only from the publishers' own headlines and excerpts for that
 *   story. It adds no facts, names, numbers, quotes or opinions.
 * - Every result passes a mechanical check before it is used: each number and
 *   each capitalised name it wrote must appear in the source text. Anything
 *   that fails is thrown away and the publisher's headline stays.
 * - It is labelled on every page, with the publisher's original headline and
 *   a link to the original story.
 *
 * Runs in the background after a desk rebuild. Results are kept in memory and
 * in the shared cache, so each story is written once, not once per isolate.
 * Without ANTHROPIC_API_KEY nothing happens and the site shows the originals.
 */
import type { NewsPayload, Story } from "./news-engine";
import { sharedRead, sharedWrite } from "./shared-cache";

export type DeskCopy = { title: string; summary: string };
export type AiDeskEntry = { en: DeskCopy; fr: DeskCopy; from: string[]; at: string };

const KEY = "ai-desk:v1";
const MAX_ENTRIES = 600;
const PER_RUN = 10;

const g = globalThis as unknown as {
  __aiDesk?: Map<string, AiDeskEntry>;
  __aiDeskRejected?: Set<string>;
  __aiDeskLoaded?: boolean;
  __aiDeskRunning?: number;
};
const desk = () => (g.__aiDesk ??= new Map());
const rejected = () => (g.__aiDeskRejected ??= new Set());

/** Read the shared AI desk once per isolate; a slow or failed read is simply retried next time. */
async function loadShared(): Promise<void> {
  if (g.__aiDeskLoaded) return;
  const saved = await sharedRead<{ e: [string, AiDeskEntry][]; r: string[] }>(KEY);
  for (const [id, e] of saved?.e ?? []) if (!desk().has(id)) desk().set(id, e);
  for (const id of saved?.r ?? []) rejected().add(id);
  if (saved) g.__aiDeskLoaded = true;
}

/** Put the AI desk's copy on the stories it has written for. */
export async function attachDesk(payload: NewsPayload): Promise<NewsPayload> {
  await loadShared();
  if (desk().size === 0) return payload;
  return { ...payload, stories: payload.stories.map(s => (desk().has(s.id) ? { ...s, ai: desk().get(s.id) } : s)) };
}

// ── the fact guard ─────────────────────────────────────────────────────────
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'");
const STOP = new Set(("a an the this that these those its it new why how what when who where after before as at by for from in into of on over to under with and but or " +
  "le la les l un une des du de d au aux ce cette ces son sa ses leur leurs pourquoi comment quand qui ou apres avant pour par sur sous avec et mais dans en selon").split(" "));
/** Words that are fine anywhere: generic terms our copy may use in either language. */
const ALWAYS = new Set(["ai", "ia", "i"]);

/** Numbers and names in `out` that the sources don't contain. Empty = passes. */
export function unsupported(out: string, source: string, allow: Iterable<string> = []): string[] {
  const extra = new Set([...allow].map(w => w.toLowerCase()));
  const src = fold(source);
  const bad: string[] = [];
  // Numbers must appear as whole numbers in the sources, with the same scale word
  // ("2 million" doesn't pass just because "2" appears somewhere).
  const scale = (w = "") => ({ millions: "million", milliard: "billion", milliards: "billion", billions: "billion", "pour cent": "%", percent: "%", mille: "thousand" } as Record<string, string>)[w] ?? w;
  const NUM = /(\d[\d.,\u00a0\u202f ]*\d|\d)(?:\s*(%|percent|pour cent|millions?|billions?|milliards?|thousand|mille)\b)?/g;
  const srcNums = [...src.matchAll(NUM)].map(m => ({ n: m[1].replace(/[\s\u00a0\u202f]/g, ""), s: scale(m[2]) }));
  const same = (a: string, b: string) => {
    const v = (x: string) => [x, x.replace(/,/g, ""), x.replace(/,/g, "."), x.replace(/\./g, ",")];
    return v(a).some(x => v(b).includes(x));
  };
  for (const m of fold(out).matchAll(NUM)) {
    const n = m[1].replace(/[\s\u00a0\u202f]/g, "");
    const sc = scale(m[2]);
    if (!srcNums.some(x => same(x.n, n) && (!sc || x.s === sc))) bad.push(m[0].trim());
  }
  for (const sentence of out.split(/(?<=[.!?:;])\s+|\s[—–-]\s/)) {
    const words = sentence.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? [];
    words.forEach((w, i) => {
      const clean = w.replace(/['’]s$/i, "").replace(/[.'’-]+$/, "");
      if (!/^\p{Lu}/u.test(clean) && !/\d/.test(clean)) return;
      const f = fold(clean);
      if (ALWAYS.has(f) || extra.has(f)) return;
      if (i === 0 && STOP.has(f)) return;
      if (src.includes(f)) return;
      // Sentence-initial ordinary words ("Researchers", "Le") are fine when the lowercase form is in the source.
      if (i === 0 && src.includes(f.toLowerCase())) return;
      bad.push(clean);
    });
  }
  return bad;
}

function valid(e: AiDeskEntry, source: string): boolean {
  for (const c of [e.en, e.fr]) {
    if (!c || typeof c.title !== "string" || typeof c.summary !== "string") return false;
    const t = c.title.trim();
    if (t.length < 20 || t.length > 120 || /[!?]/.test(t) || /breaking|urgent|choc|shock/i.test(t)) return false;
    if (c.summary.length > 420) return false;
    if (unsupported(`${t}. ${c.summary}`, source).length > 0) return false;
  }
  return true;
}

// ── choosing what to write ─────────────────────────────────────────────────
type Job = { lead: Story; group: Story[] };

const tokens = (t: string) => new Set(fold(t).split(/[^a-z0-9]+/).filter(w => w.length > 3 && !STOP.has(w)));
/** Stories that share several distinctive words with the lead (cheap clustering for context). */
function sameStory(lead: Story, all: Story[]): Story[] {
  const a = tokens(lead.title);
  return all.filter(s => s.id !== lead.id && s.source !== lead.source && [...tokens(s.title)].filter(w => a.has(w)).length >= 2).slice(0, 4);
}

function pickJobs(payload: NewsPayload): Job[] {
  const pool = payload.stories
    .filter(s => !s.gov && s.kind !== "trending" && s.kind !== "beat" && Date.now() - new Date(s.publishedAt).getTime() < 36 * 3600_000)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  // Non-English stories first: the English site shows them only once our desk has written English copy.
  pool.sort((a, b) => Number(a.lang === "en") - Number(b.lang === "en"));
  const jobs: Job[] = [];
  for (const s of pool) {
    if (jobs.length >= PER_RUN) break;
    if (desk().has(s.id) || rejected().has(s.id)) continue;
    if (!s.summary && s.title.length < 40) continue; // too little to work from
    jobs.push({ lead: s, group: [s, ...sameStory(s, pool)] });
  }
  return jobs;
}

const SYSTEM = `You are the copy desk of AI Broadsheet, a bilingual (English / Canadian French) AI news site. For each item you get the reporting of one or more publishers on ONE story: their headlines and short excerpts. Write, for each item:
- "en": {"title", "summary"} and "fr": {"title", "summary"} (Canadian French).
- title: an AI Broadsheet headline, 50 to 95 characters: our own wording, never a copy of the publisher's. Clear, specific, active voice, present tense. Lead with who did what; where the text supports it, say who is affected (people first). No questions, no exclamation marks, no "breaking", no hype words, no puns.
- summary: at most two short sentences: what happened, then why it matters ONLY if the excerpts say so. Otherwise the second sentence says who reported it.

Hard rules:
- Use ONLY facts stated in the item's text. Do not add any name, number, date, place, quote, motive or consequence that is not written there.
- Keep every name, product name and number exactly as written in the sources (do not convert currencies or units; in French you may use a decimal comma).
- If sources disagree, or the text is too thin to say anything beyond the original headline, return {"id": ..., "skip": true}.
Return {"items":[{"id","en":{"title","summary"},"fr":{"title","summary"}} or {"id","skip":true}]}.`;

/** Write copy for a few new lead stories. Never throws; does nothing without an API key. */
export async function runDesk(payload: NewsPayload): Promise<number> {
  if (g.__aiDeskRunning && Date.now() - g.__aiDeskRunning < 60_000) return 0;
  g.__aiDeskRunning = Date.now();
  try {
    const c = await import("./claude.server");
    if (!c.claudeAvailable()) return 0;
    await loadShared();
    const jobs = pickJobs(payload);
    if (jobs.length === 0) return 0;
    const items = jobs.map(j => ({
      id: j.lead.id,
      reporting: j.group.map(s => ({ publisher: s.source, headline: s.title, excerpt: s.summary.slice(0, 500) })),
    }));
    const res = await c.claudeJson<{ items?: { id: string; skip?: boolean; en?: DeskCopy; fr?: DeskCopy }[] }>({
      task: "desk",
      model: c.SONNET,
      system: SYSTEM,
      user: JSON.stringify({ items }),
      maxTokens: 3000,
      ttlMs: 24 * 3600_000,
    });
    let added = 0;
    for (const it of res?.items ?? []) {
      const job = jobs.find(j => j.lead.id === it.id);
      if (!job) continue;
      const source = job.group.map(s => `${s.title}. ${s.summary}. ${s.source}`).join("\n");
      const entry: AiDeskEntry = {
        en: { title: it.en?.title?.trim() ?? "", summary: it.en?.summary?.trim() ?? "" },
        fr: { title: it.fr?.title?.trim() ?? "", summary: it.fr?.summary?.trim() ?? "" },
        from: [...new Set(job.group.map(s => s.source))],
        at: new Date().toISOString(),
      };
      if (it.skip || !valid(entry, source)) {
        if (!it.skip) console.warn("[ai-desk] rejected by fact check:", it.id, unsupported(`${entry.en.title}. ${entry.en.summary} ${entry.fr.title}. ${entry.fr.summary}`, source).slice(0, 5));
        rejected().add(it.id);
        continue;
      }
      desk().set(it.id, entry);
      added++;
    }
    // A failed call (no reply) is retried later; an answered-but-unusable item is not.
    if (res) for (const j of jobs) if (!desk().has(j.lead.id)) rejected().add(j.lead.id);
    const all = [...desk().entries()].sort((a, b) => b[1].at.localeCompare(a[1].at)).slice(0, MAX_ENTRIES);
    g.__aiDesk = new Map(all);
    sharedWrite(KEY, { e: all, r: [...rejected()].slice(-1500) }, 14 * 24 * 3600);
    return added;
  } catch (e) {
    console.warn("[ai-desk]", (e as Error).message);
    return 0;
  } finally {
    g.__aiDeskRunning = 0;
  }
}
