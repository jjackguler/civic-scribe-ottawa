import { hasTranslation } from "./translations";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { NewsPayload, Story } from "./news-engine";
import type { Topic, Level } from "./news-sources";
import { deskFor } from "./desk";
import { humanLens } from "./editorial";
import type { Bi, Locale } from "./i18n";
import { getTranslation } from "./translations";
import { refineClusters } from "./claude.functions";
import { clusterStories, clusterScore, isDeveloping, isBreaking, isFrontPool, type Cluster } from "./cluster";

export { clusterStories, isDeveloping, isBreaking, isFrontPool, type Cluster };

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

export const getFrontPageNews = createServerFn({ method: "GET" }).handler(async () => {
  const { loadFrontPageNews } = await import("./news-engine");
  return loadFrontPageNews();
});

/** Used by route loaders: never hold SSR hostage to a slow feed. */
export async function getAiNewsFast(ms = 4500): Promise<NewsPayload | null> {
  return Promise.race([
    getAiNews().catch(() => null),
    new Promise<null>(r => setTimeout(() => r(null), ms)),
  ]);
}

const REFRESH_MS = 90 * 1000; // the front page stays live

export function useAiNews(initial: NewsPayload | null | undefined) {
  return useQuery({
    queryKey: ["ai-news"],
    queryFn: () => getAiNews(),
    initialData: initial && initial.stories.length > 0 ? initial : undefined,
    staleTime: q => q.state.data?.partial ? 0 : 60_000,
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
  { id: "tech", label: { en: "Technology", fr: "Technologie" } },
  { id: "society", label: { en: "Mind & society", fr: "Esprit et société" } },
];

export type SectionId = "canada" | "world" | "rights" | "work" | "science" | "government" | "ministry" | "labs" | "analysis" | "trending" | Topic;

/**
 * The five public desks: what the header, footer and front page show. The older topic desks
 * stay reachable at /news?section=… so existing links keep working.
 */
export const DESKS: { id: SectionId; label: Bi; dek: Bi }[] = [
  { id: "canada", label: { en: "Canada", fr: "Canada" }, dek: { en: "Ottawa, the provinces, Canadian labs and companies.", fr: "Ottawa, les provinces, les laboratoires et entreprises d'ici." } },
  { id: "rights", label: { en: "Rights & power", fr: "Droits et pouvoir" }, dek: { en: "Data sovereignty, privacy, military AI, democracy and regulation.", fr: "Souveraineté des données, vie privée, IA militaire, démocratie et réglementation." } },
  { id: "work", label: { en: "Work & culture", fr: "Travail et culture" }, dek: { en: "Jobs, artists' rights, schools, families and everyday life.", fr: "Emploi, droits des artistes, écoles, familles et vie quotidienne." } },
  { id: "science", label: { en: "Research", fr: "Recherche" }, dek: { en: "What labs and scientists found, and what it does not prove.", fr: "Ce que les laboratoires et les chercheurs ont trouvé, et ce que ça ne prouve pas." } },
  { id: "world", label: { en: "World", fr: "Monde" }, dek: { en: "The rest of the world, briefly.", fr: "Le reste du monde, en bref." } },
];

/** Power over people: who holds data, weapons and the rules. Read with the human lens. */
const POWER = /\b(military|militar\w*|defen[cs]e|armed forces|weapons?|autonomous weapons?|drones?|surveillance|sovereign\w*|souverainet\w*|cloud act|data residency|facial recognition|reconnaissance faciale|copyright|droit d'auteur|regulat\w*|réglement\w*|bill c-\d+|privacy commissioner)\b/i;
const CULTURE = /\b(artists?|artistes?|musicians?|writers?|authors?|actors?|creators?|culture|cultural|journalis\w*|newsrooms?)\b/i;

/** Sections of the news page, in navigation order. */
export const SECTIONS: { id: SectionId; label: Bi }[] = [
  ...DESKS.map(({ id, label }) => ({ id, label })),
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
    case "rights": {
      if (s.gov || s.kind === "trending") return false;
      const tags = s.tags ?? [s.topic];
      return tags.includes("responsible") || tags.includes("policy") || POWER.test(`${s.title} ${s.summary ?? ""}`)
        || humanLens(s).some(l => l === "rights" || l === "privacy" || l === "democracy" || l === "safety");
    }
    case "work": {
      if (s.gov || s.kind === "trending") return false;
      const tags = s.tags ?? [s.topic];
      return tags.includes("people") || tags.includes("society") || CULTURE.test(`${s.title} ${s.summary ?? ""}`)
        || humanLens(s).some(l => l === "work" || l === "children");
    }
    case "science": {
      if (s.gov || s.kind === "trending") return false;
      const tags = s.tags ?? [s.topic];
      return s.kind === "lab" || tags.includes("research") || tags.includes("health") || tags.includes("robotics");
    }
    default: return (s.tags ?? [s.topic]).includes(id) && !s.gov && s.kind !== "trending";
  }
}


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
  // The English site is English only: a story from a French (or any other
  // language) source appears once our desk or translator has English copy for it.
  if (locale === "en") return stories.filter(s => s.lang === "en" || !!s.ai || hasTranslation("en", s.id));
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
  return out.sort((a, b) => clusterScore(b, now) - clusterScore(a, now));
}
