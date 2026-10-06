import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { NewsPayload, Story } from "./news-engine";
import type { Topic, Level } from "./news-sources";
import type { Bi, Locale } from "./i18n";

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

export const TOPICS: { id: Topic | "canada"; label: Bi }[] = [
  { id: "canada", label: { en: "Canada", fr: "Canada" } },
  { id: "policy", label: { en: "Policy", fr: "Politique" } },
  { id: "business", label: { en: "Business", fr: "Affaires" } },
  { id: "research", label: { en: "Research", fr: "Recherche" } },
  { id: "products", label: { en: "Products", fr: "Produits" } },
  { id: "society", label: { en: "Society", fr: "Société" } },
];

export type SectionId = "canada" | "world" | "government" | "ministry" | "labs" | "analysis" | Topic;

/** Sections of the news page, in navigation order. */
export const SECTIONS: { id: SectionId; label: Bi }[] = [
  { id: "canada", label: { en: "Canada", fr: "Canada" } },
  { id: "world", label: { en: "World", fr: "Monde" } },
  { id: "government", label: { en: "Government", fr: "Gouvernement" } },
  { id: "ministry", label: { en: "AI Ministry", fr: "Ministère de l'IA" } },
  { id: "business", label: { en: "Business", fr: "Affaires" } },
  { id: "research", label: { en: "Research", fr: "Recherche" } },
  { id: "products", label: { en: "Products", fr: "Produits" } },
  { id: "policy", label: { en: "Policy", fr: "Politique" } },
  { id: "society", label: { en: "Society", fr: "Société" } },
  { id: "labs", label: { en: "AI labs", fr: "Laboratoires" } },
  { id: "analysis", label: { en: "Analysis", fr: "Analyses" } },
];

export function inSection(s: Story, id: SectionId): boolean {
  switch (id) {
    case "canada": return s.region === "canada" && !s.gov;
    case "world": return s.region === "world" && s.kind === "news";
    case "government": return s.gov || s.level != null;
    case "ministry": return s.minister;
    case "labs": return s.kind === "lab";
    case "analysis": return s.kind === "analysis";
    default: return s.topic === id && !s.gov;
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
