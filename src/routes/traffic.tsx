import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { TRAFFIC_ALERTS } from "@/lib/data";
import { TrafficAlertCard } from "@/components/TrafficAlertCard";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/traffic")({
  head: () => ({ meta: [{ title: "Traffic & Transit — Ottawa Civic Ledger" }] }),
  component: TrafficPage,
});

function TrafficPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Circulation et transport" : "Traffic & Transit"}
        title={locale === "fr" ? "Votre trajet, en direct." : "Your commute, in real time."}
        dek={locale === "fr" ? "OC Transpo, fermetures, chantiers, et sécurité piétonne et cycliste." : "OC Transpo, closures, construction, and pedestrian and cyclist safety."}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-rule p-5">
          {TRAFFIC_ALERTS.map(a => <TrafficAlertCard key={a.id} alert={a} />)}
        </div>
        <aside className="bg-river/5 border border-river/20 p-5">
          <h3 className="kicker text-river">{locale === "fr" ? "Indice d'impact" : "Commute impact score"}</h3>
          <div className="font-display text-6xl mt-3 text-river">62</div>
          <p className="font-serif text-sm text-muted-foreground mt-2">{locale === "fr" ? "Modéré · Allouez 15 min supplémentaires" : "Moderate · Add 15 min to evening commute"}</p>
          <hr className="my-4 border-rule" />
          <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground">{locale === "fr" ? "Carte interactive — bientôt" : "Interactive map — coming soon"}</p>
          <div className="aspect-video bg-river/10 mt-2" />
        </aside>
      </div>
    </PageShell>
  );
}
