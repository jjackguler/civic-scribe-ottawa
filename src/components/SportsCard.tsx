import { useLocale } from "@/lib/locale-context";
import type { SportsEvent } from "@/lib/data";
import { MapPin, Calendar, Ticket, Radio } from "lucide-react";

export function SportsCard({ ev }: { ev: SportsEvent }) {
  const { locale } = useLocale();
  const when = new Date(ev.date).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const statusStyle = ev.status === "live" ? "bg-civic-red text-white" : ev.status === "final" ? "bg-ink text-paper" : "bg-river/10 text-river border border-river/30";
  return (
    <article className="bg-card border border-rule p-5 flex flex-col gap-3 hover:border-ink transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="kicker text-civic-red">{ev.league}</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ${statusStyle}`}>
          {ev.status === "live" && <Radio className="h-3 w-3" />}
          {ev.status}
        </span>
      </div>
      <h3 className="font-display text-xl leading-snug">
        {ev.team}{ev.opponent && <> <span className="text-muted-foreground font-serif italic"> vs </span>{ev.opponent}</>}
      </h3>
      {ev.score && (
        <div className="font-display text-4xl tabular-nums tracking-tight">{ev.score}</div>
      )}
      <p className="font-serif text-sm text-muted-foreground">{ev.blurb[locale]}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground rule-top pt-3 mt-auto">
        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{when}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.venue} · {ev.neighborhood}</span>
        {ev.ticketUrl && (
          <a href={ev.ticketUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-civic-red font-semibold">
            <Ticket className="h-3 w-3" />Tickets
          </a>
        )}
        {ev.social && (
          <span className="ml-auto inline-flex items-center gap-1 italic">
            {ev.social.mentions?.toLocaleString()} social mentions
          </span>
        )}
      </div>
    </article>
  );
}
