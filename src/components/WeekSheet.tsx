import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ZoneHead } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { deskLabel } from "@/lib/desks";
import type { Bi } from "@/lib/i18n";
import { latestSheet, type SheetEdition, type SheetItem } from "@/lib/week-sheet";

const fmt = (iso: string, fr: boolean) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(fr ? "fr-CA" : "en-CA", { day: "numeric", month: "long", timeZone: "UTC" });

export function sheetRange(e: SheetEdition, fr: boolean) {
  return `${fmt(e.from, fr)} – ${fmt(e.to, fr)}`;
}

/** One story in the house format: what happened, the facts, the human stakes, the source. */
export function SheetStory({ item, n }: { item: SheetItem; n?: number }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const pick = (b: Bi) => b[locale];
  return (
    <article className="py-6 border-b border-line">
      <p className="kicker">{n ? `${n} · ` : ""}{deskLabel(item.desk, locale)}</p>
      <h3 className="hl text-[1.45rem] sm:text-[1.65rem] leading-[1.15] mt-1">{pick(item.headline)}</h3>
      <p className="mt-3"><strong>{fr ? "Ce qui s'est passé : " : "What happened: "}</strong>{pick(item.what)}</p>
      <p className="mt-3 font-semibold">{fr ? "Les faits" : "The facts"}</p>
      <ul className="mt-1 list-disc pl-5 grid gap-1">
        {item.facts.map((f, i) => <li key={i}>{pick(f)}</li>)}
      </ul>
      <p className="mt-3"><strong>{fr ? "L'enjeu humain : " : "The human stakes: "}</strong>{pick(item.stakes)}</p>
      <p className="meta mt-3">
        {fr ? "Source : " : "Source: "}
        <a href={item.source.url} target="_blank" rel="noopener" className="text-lake hover:underline inline-flex items-center gap-1">
          {item.source.name}, {fmt(item.source.date, fr)}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </p>
    </article>
  );
}

/** Front-page band: the latest Week Sheet, three stories and a link to the rest. */
export function WeekSheetBand({ className = "" }: { className?: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const e = latestSheet();
  return (
    <section className={className} aria-labelledby="week-sheet">
      <ZoneHead
        id="week-sheet"
        title={fr ? "La semaine en IA, robotique et techno" : "The week in AI, robotics and tech"}
        sub={`${sheetRange(e, fr)} · ${e.intro[locale]}`}
        action={<Link to="/week" className="shrink-0 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-lake hover:underline">{fr ? "Les six nouvelles" : "All six stories"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
      />
      <ol className="grid gap-x-10 md:grid-cols-3 border-t border-ink/80">
        {e.items.slice(0, 3).map((it, i) => (
          <li key={i} className="py-4 border-b border-line">
            <Link to="/week" hash={`s${i + 1}`} className="group block">
              <p className="kicker">{deskLabel(it.desk, locale)}</p>
              <p className="hl text-[1.2rem] leading-snug mt-1 group-hover:underline">{it.headline[locale]}</p>
              <p className="text-[0.93rem] text-muted-ink mt-2 line-clamp-3">{it.stakes[locale]}</p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
