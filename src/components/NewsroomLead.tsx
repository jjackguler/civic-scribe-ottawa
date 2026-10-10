/**
 * Our newsroom's articles on lists and the front page.
 *
 *   <NewsroomLead />                       a strong lead and four more, fetched by itself
 *   <NewsroomLead initial={loaderData} />  same, from a loader's copy (getNewsroomFast())
 *   <NewsroomGrid items={…} />             cards in a grid (the /dispatch page, "related")
 *   <NewsroomCard s={…} />                 one card
 *
 * Every item carries its house cover, our headline and dek, and the outlets
 * whose reporting it was written from. Renders nothing until the newsroom
 * has published.
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ZoneHead } from "./PageShell";
import { NewsroomCover } from "./NewsroomCover";
import { keepNames, listOutlets } from "./Dispatch";
import { useLocale } from "@/lib/locale-context";
import { timeAgo, useNow } from "@/lib/news";
import { FORMAT_LABEL, useNewsroom, newsroomFixtureRequested, type NewsroomList, type NewsroomSummary } from "@/lib/newsroom";
import type { Locale } from "@/lib/i18n";

const WORD = { en: "Newsroom", fr: "Rédaction" } as const;

/** Keeps ?fixture=1 on links while previewing the dev fixture. */
const fixtureSearch = () => (newsroomFixtureRequested() ? ({ fixture: "1" } as never) : undefined);

function Reported({ s, locale, className = "" }: { s: NewsroomSummary; locale: Locale; className?: string }) {
  const now = useNow();
  const fr = locale === "fr";
  return (
    <p className={`meta flex flex-wrap items-center gap-x-2 gap-y-0.5 ${className}`}>
      <span>{fr ? "D'après" : "Reported by"} <span className="font-semibold text-ink">{listOutlets(s.outlets.slice(0, 3), locale)}</span>{s.outlets.length > 3 ? ` +${s.outlets.length - 3}` : ""}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={s.createdAt} suppressHydrationWarning>{timeAgo(s.createdAt, now, locale)}</time>
    </p>
  );
}

export function NewsroomCard({ s, size = "card" }: { s: NewsroomSummary; size?: "card" | "compact" }) {
  const { locale } = useLocale();
  const c = s[locale];
  return (
    <article className="group relative h-full">
      <Link
        to="/article/$slug"
        params={{ slug: s.slug[locale] }}
        search={fixtureSearch()}
        className="press flex h-full flex-col bg-surface border border-line hover:border-night focus-visible:outline-offset-4"
      >
        <NewsroomCover cover={s.cover} locale={locale} size="card" />
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="flex items-center gap-2 text-[0.78rem] font-bold">
            <span className="bg-signal text-signal-ink px-1.5 py-0.5">{WORD[locale]}</span>
            <span className="text-brass-ink">{FORMAT_LABEL[s.format]?.[locale]}</span>
          </p>
          <h3 className={`hl mt-2.5 text-ink ${size === "compact" ? "text-[1.15rem]" : "text-[1.3rem]"}`}>
            <span className="headline-sweep">{keepNames(c.headline)}</span>
          </h3>
          {size === "card" && c.dek && <p className="dek mt-2 text-[0.98rem] line-clamp-3">{c.dek}</p>}
          <Reported s={s} locale={locale} className="mt-auto pt-4" />
        </div>
      </Link>
    </article>
  );
}

export function NewsroomGrid({ items, className = "", columns = 3 }: { items: NewsroomSummary[]; className?: string; columns?: 3 | 4 }) {
  if (items.length === 0) return null;
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} ${className}`}>
      {items.map(s => <li key={s.id}><NewsroomCard s={s} size={columns === 4 ? "compact" : "card"} /></li>)}
    </ul>
  );
}

/**
 * The front-page package: a strong lead and four more, newest first.
 * Mount it anywhere; it fetches by itself (pass a loader's copy as `initial`).
 */
export function NewsroomLead({ initial, className = "", title = true, exclude }: {
  initial?: NewsroomList | null;
  className?: string;
  /** Show the section heading (off when the page has its own). */
  title?: boolean;
  /** An article id to leave out. */
  exclude?: string;
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data } = useNewsroom(initial);
  const items = (data?.items ?? []).filter(s => s.id !== exclude).slice(0, 5);
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  const c = lead[locale];
  return (
    <section className={`nr-lead ${className}`} aria-labelledby={title ? "nr-lead-h" : undefined} aria-label={title ? undefined : (fr ? "De notre salle de rédaction" : "From our newsroom")}>
      {title && (
        <ZoneHead
          title={<span id="nr-lead-h">{fr ? "De notre salle de rédaction" : "From our newsroom"}</span>}
          sub={<>{fr ? "Nos propres articles, écrits avec l'IA et vérifiés contre chaque reportage cité." : "Our own articles, written with AI and checked against every report they cite."} <Link to="/standards" hash="newsroom" className="text-lake font-semibold hover:underline">{fr ? "Comment" : "How"}</Link></>}
          action={
            <Link to="/dispatch" search={fixtureSearch()} className="shrink-0 inline-flex items-center gap-1 text-[0.92rem] font-semibold text-lake hover:underline">
              {fr ? "Tous les articles" : "All articles"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      )}
      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
        <article className="group relative lg:col-span-7">
          <Link to="/article/$slug" params={{ slug: lead.slug[locale] }} search={fixtureSearch()} className="block focus-visible:outline-offset-4">
            <NewsroomCover cover={lead.cover} locale={locale} size="hero" />
            <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.8rem] font-bold">
              <span className="bg-signal text-signal-ink px-1.5 py-0.5">{WORD[locale]}</span>
              <span className="text-brass-ink">{FORMAT_LABEL[lead.format]?.[locale]}</span>
            </p>
            <h3 className="hl mt-2 text-ink text-[1.9rem] sm:text-[2.35rem] lg:text-[2.7rem] leading-[1.03] max-w-[24ch]">
              <span className="headline-sweep">{keepNames(c.headline)}</span>
            </h3>
            {c.dek && <p className="mt-3 font-serif text-[1.15rem] sm:text-[1.25rem] leading-snug text-ink/85 max-w-[60ch]">{c.dek}</p>}
          </Link>
          <Reported s={lead} locale={locale} className="mt-3 text-[0.88rem]" />
        </article>

        {rest.length > 0 && (
          <ol className="lg:col-span-5 grid content-start gap-0 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1 border-t-[3px] border-night">
            {rest.map((s, i) => (
              <li key={s.id} className="nr-lead-item border-b border-line" style={{ ["--i" as string]: i }}>
                <article className="group relative">
                  <Link to="/article/$slug" params={{ slug: s.slug[locale] }} search={fixtureSearch()} className="grid grid-cols-[84px_minmax(0,1fr)] sm:grid-cols-[96px_minmax(0,1fr)] gap-4 py-4 focus-visible:outline-offset-2">
                    <NewsroomCover cover={s.cover} locale={locale} size="thumb" />
                    <span className="min-w-0">
                      <span className="block text-[0.75rem] font-bold text-brass-ink">{FORMAT_LABEL[s.format]?.[locale]}</span>
                      <span className="hl mt-1 block text-[1.08rem] sm:text-[1.15rem] text-ink"><span className="headline-sweep">{keepNames(s[locale].headline)}</span></span>
                    </span>
                  </Link>
                  <Reported s={s} locale={locale} className="-mt-2 pb-3 pl-[100px] sm:pl-[112px]" />
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
