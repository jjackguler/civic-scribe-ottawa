/**
 * Dispatches on lists and the front page.
 *
 *   <DispatchRail />                     latest dispatches, fetched by itself
 *   <DispatchRail initial={loaderData} /> same, starting from a loader's copy (getDispatchesFast)
 *   <DispatchRail variant="grid" />      every dispatch as a grid (the /dispatch page)
 *
 * Renders nothing when the desk is off or has written nothing yet.
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ZoneHead } from "./PageShell";
import { useLocale } from "@/lib/locale-context";
import { useDispatches, type DispatchList, type DispatchSummary } from "@/lib/dispatch";
import type { Locale } from "@/lib/i18n";

/** Keep product names like Aurora-2 on one line (non-breaking hyphen; same text). */
export const keepNames = (t: string) => t.replace(/([A-Za-z])-(\d)/g, "$1\u2011$2");

export const DISPATCH_WORD = { en: "Dispatch", fr: "Dépêche" } as const;

/** "A, B and C" / "A, B et C". */
export function listOutlets(names: string[], locale: Locale) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${locale === "fr" ? "et" : "and"} ${names[names.length - 1]}`;
}

/** Hours between the first and the last report, as "Reported over 6 h". */
export function spanLabel(times: string[], locale: Locale) {
  if (times.length < 2) return "";
  const h = (new Date(times[times.length - 1]).getTime() - new Date(times[0]).getTime()) / 3600_000;
  const span = h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : `${Math.round(h)} h`;
  return locale === "fr" ? `Rapporté en ${span}` : `Reported over ${span}`;
}

/**
 * The spread of the reporting: one dot per report, placed by its time between
 * the first and the last. A quick read of how fast a story travelled.
 */
export function ReportDots({ times, dark = false }: { times: string[]; dark?: boolean }) {
  if (times.length === 0) return null;
  const t = times.map(x => new Date(x).getTime());
  const a = Math.min(...t), b = Math.max(...t);
  return (
    <span aria-hidden="true" className="relative block h-3 w-full">
      <span className={`absolute left-0 right-0 top-1/2 h-px ${dark ? "bg-white/30" : "bg-line"}`} />
      {t.map((x, i) => (
        <span
          key={i}
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${dark ? "border-night bg-signal" : "border-surface bg-night"}`}
          style={{ left: `${b === a ? (i / Math.max(1, t.length - 1)) * 100 : ((x - a) / (b - a)) * 100}%` }}
        />
      ))}
    </span>
  );
}

export function DispatchCard({ d, size = "rail" }: { d: DispatchSummary; size?: "rail" | "grid" }) {
  const { locale } = useLocale();
  const c = d[locale];
  const fr = locale === "fr";
  return (
    <article className="group relative h-full">
      <Link
        to="/dispatch/$id"
        params={{ id: d.id }}
        className="press flex h-full flex-col bg-surface border border-line border-t-[4px] border-t-night p-4 sm:p-5 hover:border-night focus-visible:outline-offset-4"
      >
        <span className="flex items-center gap-2 text-[0.78rem] font-bold">
          <span className="bg-signal text-signal-ink px-1.5 py-0.5">{DISPATCH_WORD[locale]}</span>
          <span className="text-brass-ink">{fr ? `${d.outlets.length} médias` : `${d.outlets.length} outlets`}</span>
        </span>
        <h3 className={`hl mt-2.5 text-ink ${size === "grid" ? "text-[1.35rem]" : "text-[1.2rem] sm:text-[1.28rem]"}`}>
          <span className="headline-sweep">{keepNames(c.headline)}</span>
        </h3>
        <p className="dek mt-2 text-[0.98rem] line-clamp-3">{c.news}</p>
        <div className="mt-auto pt-4">
          <ReportDots times={d.times} />
          <p className="meta mt-1.5 flex justify-between gap-3">
            <span className="truncate">{fr ? "D'après" : "From"} {listOutlets(d.outlets.slice(0, 3), locale)}{d.outlets.length > 3 ? ` +${d.outlets.length - 3}` : ""}</span>
            <span className="shrink-0" suppressHydrationWarning>{spanLabel(d.times, locale)}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}

/** The latest dispatches: a swipeable strip on phones, a row of four on wide screens. */
export function DispatchRail({ initial, variant = "rail", limit = 8, title = true, className = "", exclude }: {
  initial?: DispatchList | null;
  /** A dispatch id to leave out (the one on the page). */
  exclude?: string;
  variant?: "rail" | "grid";
  limit?: number;
  /** Show the section heading (off when the page has its own). */
  title?: boolean;
  className?: string;
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { data } = useDispatches(initial);
  const items = (data?.items ?? []).filter(d => d.id !== exclude).slice(0, limit);
  if (items.length === 0) return null;
  return (
    <section className={className} aria-labelledby={title ? "dispatch-rail-h" : undefined} aria-label={title ? undefined : (fr ? "Dépêches" : "Dispatches")}>
      {title && (
        <ZoneHead
          title={<span id="dispatch-rail-h">{fr ? "Dépêches" : "Dispatches"}</span>}
          sub={<>{fr ? "Nos propres articles, écrits avec l'IA à partir de ce que plusieurs médias rapportent." : "Our own articles, written with AI from what several outlets are reporting."} <Link to="/standards" hash="dispatches" className="text-lake font-semibold hover:underline">{fr ? "Comment" : "How"}</Link></>}
          action={variant === "rail" ? (
            <Link to="/dispatch" className="shrink-0 inline-flex items-center gap-1 text-[0.92rem] font-semibold text-lake hover:underline">
              {fr ? "Toutes" : "All dispatches"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : undefined}
        />
      )}
      {variant === "grid" ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(d => <li key={d.id}><DispatchCard d={d} size="grid" /></li>)}
        </ul>
      ) : (
        <ul className="-mx-4 px-4 scroll-px-4 md:mx-0 md:px-0 md:scroll-px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {items.map(d => (
            <li key={d.id} className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-auto lg:[&:nth-child(n+5)]:hidden">
              <DispatchCard d={d} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
