import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { TRAFFIC_ALERTS } from "@/lib/data";
import { TrafficAlertCard } from "@/components/TrafficAlertCard";
import { InteractiveMap } from "@/components/InteractiveMap";
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
        dek={locale === "fr" ? "OC Transpo, fermetures, chantiers, sécurité piétonne et cycliste — sur une carte vivante." : "OC Transpo, closures, construction, pedestrian and cyclist safety — on a live map."}
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2"><InteractiveMap height="h-[520px]" /></div>
        <aside className="bg-river/5 border border-river/20 p-5">
          <h3 className="kicker text-river">{locale === "fr" ? "Indice d'impact du trajet" : "Commute impact score"}</h3>
          <div className="font-display text-6xl mt-3 text-river">62</div>
          <p className="font-serif text-sm text-muted-foreground mt-2">{locale === "fr" ? "Modéré · Allouez 15 min supplémentaires" : "Moderate · Add 15 min to evening commute"}</p>
          <hr className="my-4 border-rule" />
          <ul className="text-xs space-y-2 font-sans">
            <li className="flex justify-between"><span>Hwy 417 (Westboro → Vanier)</span><span className="text-civic-red font-bold">Heavy</span></li>
            <li className="flex justify-between"><span>Queensway bridge</span><span className="text-highlight font-bold">Slow</span></li>
            <li className="flex justify-between"><span>Bank St · Glebe</span><span className="text-highlight font-bold">Construction</span></li>
            <li className="flex justify-between"><span>Airport Parkway</span><span className="text-solution font-bold">Clear</span></li>
            <li className="flex justify-between"><span>Hunt Club Rd</span><span className="text-solution font-bold">Clear</span></li>
          </ul>
        </aside>
      </div>

      <h2 className="kicker text-civic-red mb-3">{locale === "fr" ? "Tous les incidents" : "All incidents"}</h2>
      <div className="bg-card border border-rule p-5">
        {TRAFFIC_ALERTS.map(a => <TrafficAlertCard key={a.id} alert={a} />)}
      </div>
    </PageShell>
  );
}
