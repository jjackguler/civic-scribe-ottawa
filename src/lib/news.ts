import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { NewsPayload, Story } from "./news-engine";
import type { Topic, Level } from "./news-sources";
import { deskFor } from "./desk";
import type { Bi, Locale } from "./i18n";
import { getTranslation } from "./translations";
import { refineClusters } from "./claude.functions";

/** Claude second pass on the top front-page clusters; falls back to the heuristic. */
export function useRefinedClusters(clusters: Cluster[]): Cluster[] {
  const cands = clusters.filter(c => c.stories.length >= 2).slice(0, 12)
    .map(c => ({ id: c.id, ids: c.stories.slice(0, 12).map(s => s.id) }));
  const sig = cands.map(c => c.id + ":" + c.ids.join(",")).join("|");
  const { data } = useQuery({
    queryKey: ["cluster-refine", sig],
    queryFn: () => refineClusters({ data: { clusters: cands } }).catch(() => ({})),
    enabled: cands.length > 0,
    staleTime: 30 * 60_000,
    retry: false,
  });
  return useMemo(() => applyRefinement(clusters, data), [clusters, data]);
}

export type { Story, NewsPayload };

export const getAiNews = createServerFn({ method: "GET" }).handler(async () => {
  const { loadNews } = await import("./news-engine");
  return loadNews();
});

/** Used by route loaders: never hold SSR hostage to a slow feed. */
export async function getAiNewsFast(ms = 4500): Promise<NewsPayload | null> {
  return Promise.race([
    getAiNews().catch(() => null),
    new Promise<null>(r => setTimeout(() => r(null), ms)),
  ]);
}

const REFRESH_MS = 3 * 60 * 1000;

export function useAiNews(initial: NewsPayload | null | undefined) {
  return useQuery({
    queryKey: ["ai-news"],
    queryFn: () => getAiNews(),
    initialData: initial && initial.stories.length > 0 ? initial : undefined,
    staleTime: 60_000,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });
}

/** Topic desks, in menu order. */
export const TOPICS: { id: Topic; label: Bi }[] = [
  { id: "agents", label: { en: "AI assistants & agents", fr: "Assistants et agents IA" } },
  { id: "applications", label: { en: "Applications", fr: "Applications" } },
  { id: "immersive", label: { en: "AR, VR & immersive", fr: "RA, RV et immersif" } },
  { id: "data", label: { en: "Data & analytics", fr: "Données et analytique" } },
  { id: "infrastructure", label: { en: "Infrastructure & chips", fr: "Infrastructures et puces" } },
  { id: "research", label: { en: "Machine learning & research", fr: "Apprentissage automatique et recherche" } },
  { id: "people", label: { en: "People & skills", fr: "Personnes et compétences" } },
  { id: "responsible", label: { en: "Responsible AI", fr: "IA responsable" } },
  { id: "policy", label: { en: "Policy & regulation", fr: "Politiques et réglementation" } },
  { id: "business", label: { en: "Business & funding", fr: "Affaires et financement" } },
  { id: "sustainability", label: { en: "Sustainability", fr: "Durabilité" } },
  { id: "robotics", label: { en: "Robotics", fr: "Robotique" } },
  { id: "health", label: { en: "Health & science", fr: "Santé et sciences" } },
];

export type SectionId = "canada" | "world" | "government" | "ministry" | "labs" | "analysis" | "trending" | Topic;

/** Sections of the news page, in navigation order. */
export const SECTIONS: { id: SectionId; label: Bi }[] = [
  { id: "world", label: { en: "World", fr: "Monde" } },
  { id: "canada", label: { en: "Canada", fr: "Canada" } },
  ...TOPICS,
  { id: "government", label: { en: "Government", fr: "Gouvernement" } },
  { id: "ministry", label: { en: "AI Ministry", fr: "Ministère de l'IA" } },
  { id: "labs", label: { en: "AI labs", fr: "Laboratoires" } },
  { id: "analysis", label: { en: "Analysis", fr: "Analyses" } },
  { id: "trending", label: { en: "Trending", fr: "Tendances" } },
];

export function inSection(s: Story, id: SectionId): boolean {
  switch (id) {
    case "canada": return s.region === "canada" && !s.gov && s.kind !== "trending" && s.kind !== "beat";
    case "world": return s.region === "world" && s.kind === "news";
    case "government": return s.gov || s.level != null;
    case "ministry": return s.minister;
    case "labs": return s.kind === "lab";
    case "analysis": return s.kind === "analysis";
    case "trending": return s.kind === "trending";
    default: return (s.tags ?? [s.topic]).includes(id) && !s.gov && s.kind !== "trending";
  }
}

/** Front-page pool: newsroom, lab and analysis stories about AI. */
export const isFrontPool = (s: Story) => !s.gov && s.kind !== "trending" && s.kind !== "beat";

export const LEVEL_LABEL: Record<Level, Bi> = {
  federal: { en: "Federal", fr: "Fédéral" },
  provincial: { en: "Provincial", fr: "Provincial" },
  municipal: { en: "Municipal", fr: "Municipal" },
};

export function topicLabel(topic: Topic, locale: Locale) {
  return TOPICS.find(t => t.id === topic)?.label[locale] ?? topic;
}

export function sectionLabel(id: SectionId, locale: Locale) {
  return SECTIONS.find(x => x.id === id)?.label[locale] ?? id;
}

// ── Story clusters ──────────────────────────────────────────────────────────
// When several newsrooms cover the same event, their headlines share rare
// words (names, products, numbers). Clusters drive the front page: the story
// most outlets are covering right now leads, the way an editor would judge it.

const STOP = new Set(("the a an and or but of to in on for with at by from as is are was were be been it its this that these those " +
  "new news says say said will would could can may might how why what when who which into over after about more than just now " +
  "ai artificial intelligence report reports first big top week today year years its it's here there their they them his her " +
  "le la les des du de et en un une pour sur dans avec par est sont au aux ia").split(" "));

function tokens(title: string): string[] {
  return [...new Set(title.toLowerCase().replace(/['’]s\b/g, "").split(/[^a-z0-9àâçéèêëîïôûùüÿœ.-]+/)
    .map(w => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter(w => w.length >= 3 && !STOP.has(w)))];
}

export type Cluster = { id: string; lead: Story; stories: Story[]; sources: number; latest: string };

export function clusterStories(stories: Story[], hours = 48): Cluster[] {
  const now = Date.now();
  const pool = stories.filter(s => isFrontPool(s) && now - new Date(s.publishedAt).getTime() < hours * 3600000);
  const toks = pool.map(s => tokens(s.title));
  const df = new Map<string, number>();
  for (const ts of toks) for (const t of ts) df.set(t, (df.get(t) ?? 0) + 1);
  // A word is "telling" when few stories use it (it names this event), or
  // when it is a product/version name like gpt-6 or llama-4.
  const rareMax = Math.max(3, Math.round(pool.length * 0.08));
  const product = (t: string) => /[a-z]-?\d|\d-?[a-z]{2,}/.test(t) && !/^\$?\d+(\.\d+)?[kmb]?$/.test(t);
  const telling = (t: string) => product(t) || (df.get(t) ?? 0) <= rareMax;

  const parent = pool.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < pool.length; i++) {
    const a = new Set(toks[i]);
    for (let j = i + 1; j < pool.length; j++) {
      if (pool[i].source === pool[j].source) continue;
      const shared = toks[j].filter(t => a.has(t));
      if (shared.length < 2) continue;
      const strong = shared.filter(telling).length;
      const hasProduct = shared.some(product);
      // Conservative on purpose: a wrong "full coverage" list is worse than a missed one.
      if (strong >= 2 || (strong >= 1 && shared.length >= 3) || hasProduct) parent[find(i)] = find(j);
    }
  }
  const groups = new Map<number, Story[]>();
  pool.forEach((s, i) => { const r = find(i); groups.set(r, [...(groups.get(r) ?? []), s]); });

  return [...groups.values()]
    .map(group => {
      const sorted = [...group].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      const sources = new Set(sorted.map(s => s.source)).size;
      const lead = sorted.find(s => s.image && s.kind === "news") ?? sorted.find(s => s.image) ?? sorted[0];
      return { id: lead.id, lead, stories: [lead, ...sorted.filter(s => s !== lead)], sources, latest: sorted[0].publishedAt };
    })
    .sort((a, b) => score(b, now) - score(a, now));
}

function score(c: Cluster, now: number) {
  const ageH = (now - new Date(c.latest).getTime()) / 3600000;
  return c.sources * 2 - ageH / 6 + (c.lead.image ? 0.5 : 0);
}

/** A story is "developing" when three or more newsrooms reported it in the last six hours. */
export function isDeveloping(c: Cluster, now = Date.now()) {
  const recent = c.stories.filter(s => now - new Date(s.publishedAt).getTime() < 6 * 3600000);
  return new Set(recent.map(s => s.source)).size >= 3;
}

/** "Breaking": three or more newsrooms reported it within the last two hours. */
export function isBreaking(c: Cluster, now = Date.now()) {
  const recent = c.stories.filter(s => now - new Date(s.publishedAt).getTime() < 2 * 3600000);
  return new Set(recent.map(s => s.source)).size >= 3;
}

/** Ticks once a minute so relative times stay fresh; null during SSR to avoid hydration drift. */
export function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(i);
  }, []);
  return now;
}

export function timeAgo(iso: string, now: number | null, locale: Locale) {
  const d = new Date(iso);
  if (now == null) {
    return d.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric", timeZone: "America/Toronto" });
  }
  const min = Math.max(0, Math.round((now - d.getTime()) / 60000));
  const fr = locale === "fr";
  if (min < 1) return fr ? "à l'instant" : "just now";
  if (min < 60) return fr ? `il y a ${min} min` : `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return fr ? `il y a ${h} h` : `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return fr ? `il y a ${days} j` : `${days} d ago`;
  return d.toLocaleDateString(fr ? "fr-CA" : "en-CA", { month: "short", day: "numeric" });
}

/** Stories readers in this language see first (French readers get French sources first). */
export function byLocale(stories: Story[], locale: Locale) {
  if (locale === "en") return stories;
  return [...stories.filter(s => s.lang === "fr"), ...stories.filter(s => s.lang !== "fr")];
}

/**
 * Keep one prolific publisher from filling the top of a list: within each
 * window of `window` stories, a source appears at most `max` times; the
 * overflow moves further down (nothing is dropped).
 */
export function diversify(stories: Story[], max = 2, window = 12): Story[] {
  const out: Story[] = [];
  let queue = [...stories];
  while (queue.length) {
    const counts = new Map<string, number>();
    const deferred: Story[] = [];
    let taken = 0;
    for (const s of queue) {
      const c = counts.get(s.source) ?? 0;
      if (taken < window && c < max) { out.push(s); counts.set(s.source, c + 1); taken++; }
      else deferred.push(s);
    }
    if (deferred.length === queue.length) { out.push(...deferred); break; }
    queue = deferred;
  }
  return out;
}

/**
 * Headline and summary to show: the editor's own version when there is one,
 * then the AI desk's labelled version, then a labelled Claude translation when
 * the reader's language differs, otherwise the publisher's own. Links, sources, dates and credits never change.
 */
export function display(s: Story, locale: Locale) {
  const d = deskFor(s.link);
  // Keep product names like GPT-6 on one line (non-breaking hyphen; same text).
  const keep = (t: string) => t.replace(/([A-Za-z])-(\d)/g, "$1\u2011$2");
  const ai = !d && s.ai?.[locale]?.title ? s.ai[locale] : undefined;
  const tr = !d && !ai && s.lang !== locale ? getTranslation(locale, s.id) : undefined;
  return {
    title: keep(d ? d.headline[locale] : ai ? ai.title : tr ? tr.title : s.title),
    summary: d?.dek ? d.dek[locale] : ai?.summary ? ai.summary : tr ? (tr.summary || s.summary) : s.summary,
    edited: !!d,
    /** Headline and brief written by the AI desk from these publishers' reporting. */
    ai: ai ? (s.ai?.from ?? [s.source]) : null,
    translated: !!tr,
    original: s.title,
  };
}

/** Rebuild a cluster from a subset of its stories (used after Claude splits one). */
export function makeCluster(group: Story[]): Cluster {
  const sorted = [...group].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const sources = new Set(sorted.map(s => s.source)).size;
  const lead = sorted.find(s => s.image && s.kind === "news") ?? sorted.find(s => s.image) ?? sorted[0];
  return { id: lead.id, lead, stories: [lead, ...sorted.filter(s => s !== lead)], sources, latest: sorted[0].publishedAt };
}

/** Apply Claude's same-event groups to heuristic clusters; anything unanswered stays as is. */
export function applyRefinement(clusters: Cluster[], splits: Record<string, string[][]> | undefined): Cluster[] {
  if (!splits || Object.keys(splits).length === 0) return clusters;
  const now = Date.now();
  const out: Cluster[] = [];
  for (const c of clusters) {
    const groups = splits[c.id];
    if (!groups || groups.length <= 1) { out.push(c); continue; }
    const byId = new Map(c.stories.map(s => [s.id, s]));
    for (const g of groups) {
      const members = g.map(id => byId.get(id)).filter((s): s is Story => !!s);
      if (members.length) out.push(makeCluster(members));
    }
  }
  return out.sort((a, b) => score(b, now) - score(a, now));
}
