import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
    .filter(s => s.lang !== locale && !hasTranslation(locale, s.id))
    .slice(0, 30)
    .map(s => s.id);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [trVersion, setTrVersion] = useState(0);
  const [newsTick, setNewsTick] = useState(0);
  const qc = useQueryClient();
  const inflight = useRef<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aibroadsheet-locale");
      if (saved === "en" || saved === "fr") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      } else if (navigator.language?.toLowerCase().startsWith("fr")) {
        setLocaleState("fr");
        document.documentElement.lang = "fr";
      }
    } catch {}
  }, []);

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

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("aibroadsheet-locale", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, pick: (b) => b[locale], trVersion }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
