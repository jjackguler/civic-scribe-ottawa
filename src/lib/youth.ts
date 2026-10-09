/**
 * Youth formats for the browser: the day's story stack, the daily quiz and the
 * small per-viewer memories (quiz streak, stories seen, "your take"). Every
 * memory lives only in this browser; nothing personal is sent anywhere.
 */
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { clusterStories, display, getAiNews, type NewsPayload, type Story } from "./news";
import { fixtureRequested, useDispatches, type DispatchList, type DispatchSummary } from "./dispatch";
import { WHY_DESK, prevDay, quizDay, type DailyQuiz } from "./youth-core";
import type { Locale } from "./i18n";

export * from "./youth-core";

// ── data ───────────────────────────────────────────────────────────────────
export const getDailyQuiz = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ fixture: z.boolean().optional() }).parse(d ?? {}))
  .handler(async ({ data }): Promise<DailyQuiz | null> => {
    try {
      const { dailyQuiz } = await import("./quiz.server");
      return await dailyQuiz(!!data.fixture && import.meta.env.DEV);
    } catch (e) {
      console.warn("[quiz]", (e as Error).message);
      return null;
    }
  });

/** For route loaders: never hold the page for long. */
export async function getDailyQuizFast(ms = 3500): Promise<DailyQuiz | null> {
  return Promise.race([getDailyQuiz({ data: {} }).catch(() => null), new Promise<null>(r => setTimeout(() => r(null), ms))]);
}

export function useDailyQuiz(initial?: DailyQuiz | null) {
  const fixture = fixtureRequested();
  return useQuery({
    queryKey: ["daily-quiz", fixture],
    queryFn: () => getDailyQuiz({ data: { fixture } }),
    initialData: !fixture && initial ? initial : undefined,
    staleTime: 5 * 60_000,
    // A quiz that isn't frozen yet (model questions still being checked) is fetched again soon.
    refetchInterval: (q) => (q.state.data && !q.state.data.final ? 60_000 : 30 * 60_000),
  });
}

/** The desk's stories, or the dev fixture with ?fixture=1. */
export function useDeskStories(initial?: NewsPayload | null): { stories: Story[]; loading: boolean } {
  const fixture = fixtureRequested();
  // Same cache entry as the front page's news, so mounting this costs no extra request.
  const live = useQuery({
    queryKey: ["ai-news"],
    queryFn: () => getAiNews(),
    initialData: !fixture && initial && initial.stories.length > 0 ? initial : undefined,
    staleTime: 60_000,
    refetchInterval: 3 * 60_000,
    enabled: !fixture,
  });
  const fx = useQuery({
    queryKey: ["youth-fixture-stories"],
    // The guard lets the build drop the fixture file from production entirely.
    queryFn: async (): Promise<Story[]> => (import.meta.env.DEV ? (await import("./youth-fixture")).FIXTURE_STORIES : []),
    enabled: import.meta.env.DEV && fixture,
    staleTime: Infinity,
  });
  if (import.meta.env.DEV && fixture) return { stories: fx.data ?? [], loading: !fx.data };
  return { stories: live.data?.stories ?? [], loading: !live.data && !live.isError };
}

// ── Today in 60 seconds ────────────────────────────────────────────────────
export type TodayItem = {
  id: string;
  kind: "dispatch" | "story";
  headline: string;
  /** One line: what happened. */
  what: string;
  /** Why it matters to people. */
  matters: string;
  /** true: the desk's general line ("why stories like this matter"), not written from this story. */
  mattersGeneral: boolean;
  /** The story whose desk we show. */
  lead: Story | null;
  /** The publisher's own photo, credited to `imageCredit`; null shows the house pattern. */
  image: string | null;
  imageCredit: string | null;
  outlets: string[];
  publishedAt: string;
  link: { to: "/dispatch/$id" | "/story/$id"; id: string };
};

export const TODAY_MAX = 8;
export const TODAY_MIN = 6;

const firstSentence = (t: string, max = 170) => {
  const s = (t.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t).trim();
  return s.length <= max ? s : s.slice(0, s.lastIndexOf(" ", max)).replace(/[,;:\s]+$/, "") + "…";
};

const outletList = (xs: string[], locale: Locale) => {
  const n = xs.slice(0, 3);
  const more = xs.length - n.length;
  const and = locale === "fr" ? "et" : "and";
  const s = n.length <= 1 ? n.join("") : `${n.slice(0, -1).join(", ")} ${and} ${n[n.length - 1]}`;
  return more > 0 ? `${s} ${locale === "fr" ? `et ${more} autres` : `and ${more} more`}` : s;
};

/**
 * The day's stack: our own dispatches on today's biggest events, then the
 * events the most outlets are reporting, then the newest photo stories, up to
 * eight. Each item says what happened and why it matters to people, and links
 * to the full story.
 */
export function buildToday(stories: Story[], dispatches: DispatchSummary[], locale: Locale, now = Date.now()): TodayItem[] {
  const clusters = clusterStories(stories, 30);
  const covered = new Set<string>();
  const scored: { item: TodayItem; score: number }[] = [];
  const ageH = (iso: string) => (now - new Date(iso).getTime()) / 3600_000;
  const localLead = (group: Story[]) => group.find(s => s.lang === locale) ?? group[0];

  for (const d of dispatches.filter(x => ageH(x.createdAt) < 30).slice(0, 4)) {
    const ids = new Set(d.storyIds ?? []);
    const c = clusters.find(x => x.stories.some(s => ids.has(s.id)));
    c?.stories.forEach(s => covered.add(s.id));
    ids.forEach(id => covered.add(id));
    const lead = c ? (c.lead.image ? c.lead : c.stories.find(s => s.image) ?? c.lead) : null;
    const copy = d[locale];
    scored.push({
      score: d.outlets.length * 2 + 3 - ageH(d.createdAt) / 6,
      item: {
        id: d.id, kind: "dispatch", headline: copy.headline, what: copy.news,
        matters: copy.matters || (lead ? WHY_DESK[lead.topic][locale] : ""), mattersGeneral: !copy.matters,
        lead, image: lead?.image ?? null, imageCredit: lead?.image ? lead.source : null,
        outlets: d.outlets, publishedAt: d.createdAt, link: { to: "/dispatch/$id", id: d.id },
      },
    });
  }

  // Single-outlet stories without a photo only fill a thin day (the stack keeps at least TODAY_MIN).
  const fill: { item: TodayItem; score: number }[] = [];
  for (const c of clusters) {
    if (c.stories.some(s => covered.has(s.id))) continue;
    const into = c.sources < 2 && !c.lead.image ? fill : scored;
    c.stories.forEach(s => covered.add(s.id));
    const text = localLead(c.stories);
    const shown = display(text, locale);
    const photo = c.lead.image ? c.lead : c.stories.find(s => s.image) ?? c.lead;
    const outlets = [...new Set(c.stories.map(s => s.source))];
    into.push({
      score: c.sources * 2 - ageH(c.latest) / 6 + (photo.image ? 0.5 : 0),
      item: {
        id: c.lead.id, kind: "story", headline: shown.title,
        what: shown.summary ? firstSentence(shown.summary) : locale === "fr" ? `Rapporté par ${outletList(outlets, locale)}.` : `Reported by ${outletList(outlets, locale)}.`,
        matters: WHY_DESK[text.topic]?.[locale] ?? "", mattersGeneral: true,
        lead: text, image: photo.image, imageCredit: photo.image ? photo.source : null,
        outlets, publishedAt: c.latest, link: { to: "/story/$id", id: text.id },
      },
    });
  }

  const top = scored.sort((a, b) => b.score - a.score).slice(0, TODAY_MAX);
  const extra = fill.sort((a, b) => b.score - a.score).slice(0, Math.max(0, TODAY_MIN - top.length));
  return [...top, ...extra].map(x => x.item);
}

/** The stack for this page: desk stories and dispatches (fixtures with ?fixture=1). */
export function useToday(initialNews?: NewsPayload | null, initialDispatches?: DispatchList | null) {
  const { stories, loading } = useDeskStories(initialNews);
  const { data: dispatches } = useDispatches(initialDispatches);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); }, []);
  return { stories, dispatches: dispatches?.items ?? [], loading, now };
}

// ── per-viewer memory (this browser only) ──────────────────────────────────
function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw) as T;
    return v && typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* blocked or full: it still works for this visit */ }
}

/** A small store in localStorage, read after hydration, shared between components on the page. */
function useLocal<T>(key: string, fallback: T): [T, (fn: (prev: T) => T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setValue(readJson(key, fallback));
    setReady(true);
    const on = (e: Event) => { if ((e as CustomEvent<string>).detail === key) setValue(readJson(key, fallback)); };
    const onStorage = (e: StorageEvent) => { if (e.key === key) setValue(readJson(key, fallback)); };
    window.addEventListener("aib-local", on);
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener("aib-local", on); window.removeEventListener("storage", onStorage); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = useCallback((fn: (prev: T) => T) => {
    const next = fn(readJson(key, fallback));
    writeJson(key, next);
    setValue(next);
    window.dispatchEvent(new CustomEvent("aib-local", { detail: key }));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return [value, update, ready];
}

// Stories seen in the stack today (rings on the launcher bubbles go quiet once seen).
type Seen = { day: string; ids: string[] };
export function useSeen() {
  const [seen, update, ready] = useLocal<Seen>("aib-today-seen-v1", { day: "", ids: [] });
  const today = quizDay();
  const ids = seen.day === today ? seen.ids : [];
  const markSeen = useCallback((id: string) => update(p => {
    const base = p.day === today ? p.ids : [];
    return base.includes(id) ? p : { day: today, ids: [...base, id].slice(-40) };
  }), [update, today]);
  return { seen: new Set(ids), markSeen, ready };
}

// The quiz: answers per day and the streak.
export type QuizDayState = { qids: string[]; answers: (number | null)[]; done?: boolean; score?: number; total?: number };
type QuizLocal = { days: Record<string, QuizDayState>; streak: { count: number; last: string | null } };
const QUIZ_EMPTY: QuizLocal = { days: {}, streak: { count: 0, last: null } };

export function useQuizLocal() {
  const [state, update, ready] = useLocal<QuizLocal>("aib-quiz-v1", QUIZ_EMPTY);
  const today = quizDay();
  const days = state.days ?? {};
  const streak = state.streak ?? { count: 0, last: null };
  // A streak counts while the last finished quiz is today's or yesterday's.
  const current = streak.last === today || streak.last === prevDay(today) ? streak.count : 0;

  const save = useCallback((day: string, s: QuizDayState) => update(p => {
    const all = { ...(p.days ?? {}), [day]: s };
    const keep = Object.keys(all).sort().slice(-14);
    const st = p.streak ?? { count: 0, last: null };
    let streak = st;
    if (s.done && st.last !== day) streak = { count: st.last === prevDay(day) ? st.count + 1 : 1, last: day };
    return { days: Object.fromEntries(keep.map(k => [k, all[k]])), streak };
  }), [update]);

  return { days, streak: current, save, ready, today };
}

// "Your take" on dispatches.
export type Take = "learned" | "question" | "worried";
type Takes = Record<string, { r: Take[]; at: string }>;
export function useTakes() {
  const [takes, update, ready] = useLocal<Takes>("aib-takes-v1", {});
  const toggle = useCallback((id: string, t: Take) => update(p => {
    const cur = p[id]?.r ?? [];
    const r = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
    const next: Takes = { ...p, [id]: { r, at: new Date().toISOString() } };
    if (r.length === 0) delete next[id];
    // Keep the most recent 200.
    const keys = Object.keys(next).sort((a, b) => next[b].at.localeCompare(next[a].at)).slice(0, 200);
    return Object.fromEntries(keys.map(k => [k, next[k]]));
  }), [update]);
  /** This viewer's own tally over the last 30 days. */
  const tally = (() => {
    const since = Date.now() - 30 * 86400_000;
    const out: Record<Take, number> = { learned: 0, question: 0, worried: 0 };
    for (const v of Object.values(takes)) if (Date.parse(v.at) > since) for (const t of v.r) out[t]++;
    return out;
  })();
  return { takes, toggle, tally, ready };
}
