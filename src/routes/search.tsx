import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { PageShell, PageIntro } from "@/components/PageShell";
import { StoryCard } from "@/components/StoryCard";
import { getAiNewsFast, useAiNews, byLocale } from "@/lib/news";
import type { Story } from "@/lib/news-engine";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

type Range = "24h" | "7d" | "30d";
type Search = { q?: string; range?: Range; source?: string };
const RANGES: { id: Range; hours: number; label: { en: string; fr: string } }[] = [
  { id: "24h", hours: 24, label: { en: "Past 24 hours", fr: "24 dernières heures" } },
  { id: "7d", hours: 24 * 7, label: { en: "Past week", fr: "7 derniers jours" } },
  { id: "30d", hours: 24 * 30, label: { en: "Past month", fr: "30 derniers jours" } },
];

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q.slice(0, 120) : undefined,
    range: RANGES.some(r => r.id === s.range) ? (s.range as Range) : undefined,
    source: typeof s.source === "string" && s.source ? s.source.slice(0, 80) : undefined,
  }),
  loader: () => getAiNewsFast(),
  // Result pages are for readers, not for search engines.
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Search AI news — ${SITE.name}`, fr: `Rechercher dans l'actualité IA — ${SITE.name}` },
      description: { en: "Search the AI news desk by headline, source or summary.", fr: "Cherchez dans l'actualité IA par titre, source ou résumé." },
      noindex: true,
    }),
  component: SearchPage,
});

/** Lowercase, accents removed, so "réglementation" matches "reglementation". */
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function matches(s: Story, terms: string[]) {
  const hay = fold(`${s.title} ${s.source} ${s.summary}`);
  return terms.every(term => hay.includes(term));
}

function SearchPage() {
  const initial = Route.useLoaderData();
  const { q = "", range, source } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const { data } = useAiNews(initial);
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [draft, setDraft] = useState(q);
  const inputRef = useRef<HTMLInputElement>(null);
  const [limit, setLimit] = useState(30);

  useEffect(() => setDraft(q), [q]);
  useEffect(() => { if (!q) inputRef.current?.focus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stories = byLocale(data?.stories ?? [], locale).filter(s => s.kind !== "beat" || s.gov);
  const sources = useMemo(() => [...new Set(stories.map(s => s.source))].sort((a, b) => a.localeCompare(b)), [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const terms = fold(q).split(/\s+/).filter(Boolean);
    const hours = RANGES.find(r => r.id === range)?.hours;
    const cutoff = hours ? Date.now() - hours * 3600_000 : 0;
    return stories
      .filter(s => (!source || s.source === source) && (!cutoff || new Date(s.publishedAt).getTime() >= cutoff) && (terms.length === 0 || matches(s, terms)))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [data, q, range, source, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch: Partial<Search>) => navigate({ search: prev => ({ ...prev, ...patch }), replace: true });
  const active = !!(q || range || source);
  const chip = (on: boolean) =>
    `px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${on ? "bg-night text-white border-night" : "bg-surface border-line hover:border-night"}`;

  return (
    <PageShell>
      <PageIntro
        title={fr ? "Rechercher" : "Search"}
        dek={fr ? "Cherchez par titre, source ou résumé dans les nouvelles des 30 derniers jours." : "Search headlines, sources and summaries from the last 30 days of news."}
      >
        <form
          role="search"
          className="mt-6 flex gap-2 max-w-2xl"
          onSubmit={e => { e.preventDefault(); set({ q: draft.trim() || undefined }); }}
        >
          <label htmlFor="search-q" className="sr-only">{fr ? "Rechercher" : "Search"}</label>
          <div className="relative flex-1 min-w-0">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-ink" aria-hidden="true" />
            <input
              id="search-q"
              ref={inputRef}
              type="search"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={fr ? "Ex. : Cohere, GPT-6, réglementation" : "e.g. Cohere, GPT-6, regulation"}
              className="w-full h-12 pl-11 pr-4 rounded-[4px] border border-line bg-surface text-[1.05rem] focus:outline-none focus:border-night focus:ring-2 focus:ring-lake/30"
            />
          </div>
          <button type="submit" className="h-12 px-5 rounded-[4px] bg-night text-white font-bold hover:bg-lake">{fr ? "Rechercher" : "Search"}</button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label={fr ? "Période" : "Date"}>
          <button type="button" onClick={() => set({ range: undefined })} className={chip(!range)}>{fr ? "Toutes les dates" : "Any time"}</button>
          {RANGES.map(r => (
            <button key={r.id} type="button" onClick={() => set({ range: r.id })} className={chip(range === r.id)} aria-pressed={range === r.id}>{pick(r.label)}</button>
          ))}
          <label htmlFor="search-source" className="sr-only">{fr ? "Source" : "Source"}</label>
          <select
            id="search-source"
            value={source ?? ""}
            onChange={e => set({ source: e.target.value || undefined })}
            className="h-9 px-3 rounded-full border border-line bg-surface text-sm font-semibold max-w-[16rem]"
          >
            <option value="">{fr ? "Toutes les sources" : "All sources"}</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {active && (
            <button type="button" onClick={() => navigate({ search: {}, replace: true })} className="inline-flex items-center gap-1 text-sm font-semibold text-lake hover:underline ml-1">
              <X className="h-4 w-4" aria-hidden="true" />{fr ? "Effacer" : "Clear"}
            </button>
          )}
        </div>
      </PageIntro>

      <section className="container-mw mt-8" aria-live="polite">
        {!data ? (
          <p className="hl text-xl flex items-center gap-3"><span className="live-dot" aria-hidden="true" />{t("loading", locale)}</p>
        ) : (
          <>
            <p className="meta mb-5">
              {active
                ? fr ? `${results.length} résultat${results.length === 1 ? "" : "s"}${q ? ` pour « ${q} »` : ""}` : `${results.length} result${results.length === 1 ? "" : "s"}${q ? ` for “${q}”` : ""}`
                : fr ? `${results.length} nouvelles au fil. Tapez un mot ou choisissez une période.` : `${results.length} stories on the desk. Type a word or pick a time range.`}
            </p>
            {results.length === 0 ? (
              <div className="max-w-xl">
                <p className="font-serif text-[1.15rem] leading-relaxed">
                  {fr
                    ? "Aucune nouvelle ne correspond. Essayez un mot plus court, une autre orthographe, ou retirez le filtre de date ou de source."
                    : "No stories match. Try a shorter word or another spelling, or remove the date or source filter."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
                  {results.slice(0, limit).map(s => <StoryCard key={s.id} s={s} variant="row" />)}
                </div>
                {results.length > limit && (
                  <button onClick={() => setLimit(l => l + 30)} className="mt-8 border border-night px-5 py-2.5 rounded-[4px] font-semibold hover:bg-night hover:text-white">
                    {fr ? "Plus de résultats" : "More results"}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </section>
    </PageShell>
  );
}
