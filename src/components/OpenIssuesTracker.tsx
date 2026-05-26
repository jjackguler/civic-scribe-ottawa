import { useMemo, useState } from "react";
import { generate311Signals } from "@/lib/ingest/ottawa-311";
import { ExternalLink, MapPin } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

const STATUS_LABEL: Record<string, { en: string; fr: string; tone: string }> = {
  reported:     { en: "Reported",     fr: "Signalé",     tone: "bg-civic-red/10 text-civic-red border-civic-red/30" },
  acknowledged: { en: "Acknowledged", fr: "Accusé",      tone: "bg-highlight/20 text-ink border-highlight" },
  in_progress:  { en: "In progress",  fr: "En cours",    tone: "bg-river/10 text-river border-river/30" },
  resolved:     { en: "Resolved",     fr: "Résolu",      tone: "bg-solution/15 text-solution border-solution/40" },
};

export function OpenIssuesTracker() {
  const { locale } = useLocale();
  const all = useMemo(() => generate311Signals(60), []);
  const [filter, setFilter] = useState<"all" | "reported" | "acknowledged" | "in_progress" | "resolved">("all");

  const counts = useMemo(() => ({
    reported: all.filter(s => s.issue_status === "reported").length,
    acknowledged: all.filter(s => s.issue_status === "acknowledged").length,
    in_progress: all.filter(s => s.issue_status === "in_progress").length,
    resolved: all.filter(s => s.issue_status === "resolved").length,
  }), [all]);

  const items = filter === "all" ? all : all.filter(s => s.issue_status === filter);

  return (
    <section className="border border-rule bg-card">
      <header className="px-5 py-4 rule-bottom flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="kicker text-solution">{locale === "fr" ? "Suivi des problèmes ouverts · 311" : "Open Issues Tracker · 311"}</h3>
          <p className="font-serif text-sm text-muted-foreground mt-1">
            {locale === "fr"
              ? "Demandes de service civiques. Emplacements généralisés pour protéger la vie privée."
              : "Civic service requests. Locations generalized to protect privacy."}
          </p>
        </div>
        <a href="https://open.ottawa.ca" target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-river hover:underline">
          {locale === "fr" ? "Source : Open Ottawa" : "Source: Open Ottawa"} <ExternalLink className="h-3 w-3" />
        </a>
      </header>

      <div className="grid grid-cols-4 gap-px bg-rule">
        {(["reported","acknowledged","in_progress","resolved"] as const).map(k => (
          <button
            key={k}
            onClick={() => setFilter(filter === k ? "all" : k)}
            className={`bg-card px-3 py-3 text-left transition-colors ${filter === k ? "ring-2 ring-inset ring-ink" : "hover:bg-secondary/40"}`}
          >
            <div className="kicker text-muted-foreground">{STATUS_LABEL[k][locale]}</div>
            <div className="font-display text-3xl leading-none mt-1">{counts[k]}</div>
          </button>
        ))}
      </div>

      <ul className="divide-y divide-rule max-h-[360px] overflow-y-auto">
        {items.slice(0, 30).map(s => {
          const sl = STATUS_LABEL[s.issue_status ?? "reported"];
          return (
            <li key={s.id} className="px-5 py-3 flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-serif text-sm leading-snug">{s.title}</div>
                <div className="text-[11px] text-muted-foreground font-sans mt-0.5">
                  {s.neighborhood} · {new Date(s.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric" })}
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border self-start ${sl.tone}`}>
                {sl[locale]}
              </span>
            </li>
          );
        })}
      </ul>

      <footer className="px-5 py-3 rule-top text-[11px] text-muted-foreground font-sans">
        {locale === "fr"
          ? "Aucune donnée personnelle de demandeur n'est affichée. Emplacements limités au quartier ou au pâté de maisons."
          : "No requester personal information is displayed. Locations limited to neighborhood or block level."}
      </footer>
    </section>
  );
}
