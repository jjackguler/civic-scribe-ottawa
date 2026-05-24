import { type EventItem } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { Calendar, MapPin } from "lucide-react";

export function EventCard({ event }: { event: EventItem }) {
  const { locale } = useLocale();
  const date = new Date(event.date);
  const dd = date.getDate();
  const mon = date.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "short" }).toUpperCase();
  return (
    <article className="flex gap-4 py-4 rule-bottom group">
      <div className="shrink-0 w-16 text-center border border-rule p-2">
        <div className="kicker text-civic-red">{mon}</div>
        <div className="font-display text-2xl leading-none mt-1">{dd}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg leading-snug group-hover:text-civic-red transition-colors">{event.title[locale]}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{date.toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venue}, {event.neighborhood}</span>
          {event.free && <span className="text-solution font-semibold uppercase tracking-wider text-[10px]">{locale === "fr" ? "Gratuit" : "Free"}</span>}
          <span className="border border-rule px-1 text-[10px] uppercase tracking-wider">{event.language === "bilingual" ? "EN/FR" : event.language.toUpperCase()}</span>
        </div>
      </div>
    </article>
  );
}
