import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { NewsPayload, Story } from "./news-engine";
import type { Topic } from "./news-sources";
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
