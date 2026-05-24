import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { BreakingHero } from "@/components/BreakingHero";
import { ARTICLES, TRAFFIC_ALERTS, WEATHER_ALERTS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { ArticleCard } from "@/components/ArticleCard";
import { AlertTriangle, Clock } from "lucide-react";

export const Route = createFileRoute("/breaking")({
  head: () => ({ meta: [
    { title: "Breaking News — Ottawa Civic Ledger" },
    { name: "description", content: "Live Ottawa breaking news, urgent alerts and developing stories — verified, bilingual." },
  ]}),
  component: BreakingPage,
});

function BreakingPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <div className="bg-civic-red text-white -mx-4 sm:-mx-6 lg:-mx-10 -mt-4 px-4 sm:px-6 lg:px-10 py-2 mb-6 flex items-center gap-3">
        <span className="ticker-dot" />
        <span className="text-[11px] uppercase tracking-[0.18em] font-bold">{locale === "fr" ? "Mode alerte active" : "Urgent alert mode active"}</span>
        <span className="font-serif italic text-sm">{locale === "fr" ? "Plusieurs incidents en cours à Ottawa" : "Multiple developing incidents across Ottawa"}</span>
      </div>

      <PageHero
        kicker={locale === "fr" ? "Dernière heure" : "Breaking news"}
        title={locale === "fr" ? "Ce qui se passe maintenant à Ottawa" : "What's happening in Ottawa right now"}
        dek={locale === "fr" ? "Vérifié, mis à jour à la minute. Aucun rapport non confirmé n'est diffusé en première page." : "Verified, updated by the minute. No unconfirmed reports run on the front page."}
      />

      <BreakingHero />

      <h2 className="kicker text-civic-red mt-12 mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {locale === "fr" ? "Alertes urgentes" : "Urgent alerts"}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[...WEATHER_ALERTS, ...TRAFFIC_ALERTS.filter(a => a.impact === "high")].map((a: any) => (
          <div key={a.id} className="bg-card border-l-4 border-civic-red p-4">
            <div className="kicker text-civic-red flex items-center gap-1.5"><Clock className="h-3 w-3" />{new Date(a.issuedAt ?? a.until).toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" })}</div>
            <p className="font-serif text-lg mt-1 leading-snug">{a.title[locale]}</p>
            {a.advice && <p className="text-sm text-muted-foreground mt-1">{a.advice[locale]}</p>}
          </div>
        ))}
      </div>

      <h2 className="kicker text-civic-red mt-12 mb-3">{locale === "fr" ? "Histoires en développement" : "Developing stories"}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.slice(0, 6).map(a => <ArticleCard key={a.slug} article={a} />)}
      </div>
    </PageShell>
  );
}
