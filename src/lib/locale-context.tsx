import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { isFrPath, localePath, stripFr } from "./seo";
import type { Bi, Locale } from "./i18n";
import type { NewsPayload } from "./news-engine";
import { hasTranslation, putTranslations } from "./translations";
import { translateStories } from "./claude.functions";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; pick: (b: Bi) => string; trVersion: number };
const LocaleContext = createContext<Ctx>({ locale: "en", setLocale: () => {}, pick: (b) => b.en, trVersion: 0 });

/** Same front-page ordering idea as the cards: newsroom stories, newest first. */
function visibleIds(payload: NewsPayload | undefined, locale: Locale): string[] {
  if (!payload) return [];
  return payload.stories
    .filter(s => s.lang !== locale && !s.ai && !hasTranslation(locale, s.id))
    .slice(0, 30)
    .map(s => s.id);
}

/**
 * The language comes from the URL (/fr/... is French), so every page has a
 * crawlable French version. Switching language moves to the other URL.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const publicHref = useRouterState({ select: s => s.location.publicHref ?? s.location.href });
  const locale: Locale = isFrPath(publicHref) ? "fr" : "en";
  const [trVersion, setTrVersion] = useState(0);
  const [newsTick, setNewsTick] = useState(0);
  const qc = useQueryClient();
  const inflight = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale === "fr" ? "fr-CA" : "en-CA";
  }, [locale]);

  // Re-check when the news query updates.
  useEffect(() => qc.getQueryCache().subscribe(e => {
    if (e.query.queryKey[0] === "ai-news" && e.type === "updated") setNewsTick(t => t + 1);
  }), [qc]);

  // Translate the stories currently on screen, in one batched call. Failures are silent.
  useEffect(() => {
    const ids = visibleIds(qc.getQueryData<NewsPayload>(["ai-news"]), locale);
    if (ids.length === 0) return;
    const sig = `${locale}:${ids.join(",")}`;
    if (inflight.current === sig) return;
    inflight.current = sig;
    let cancelled = false;
    const timer = setTimeout(() => {
      translateStories({ data: { ids, target: locale } })
        .then(res => { if (!cancelled && putTranslations(locale, res) > 0) setTrVersion(v => v + 1); })
        .catch(() => {})
        .finally(() => { if (inflight.current === sig) inflight.current = null; });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); if (inflight.current === sig) inflight.current = null; };
  }, [locale, newsTick, qc]);

  // Switching language loads the other URL in full, so every link, title and tag is rebuilt for it.
  const setLocale = (l: Locale) => {
    if (l === locale) return;
    window.location.assign(localePath(stripFr(publicHref), l));
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, pick: (b) => b[locale], trVersion }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
