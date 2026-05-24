import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { InteractiveMap } from "@/components/InteractiveMap";
import { TrafficAlertsList } from "@/components/TrafficAlertCard";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [
    { title: "Ottawa Live Map — Civic Ledger" },
    { name: "description", content: "Interactive Ottawa map with live traffic, transit, bike lanes, closures and incident pins." },
  ]}),
  component: MapPage,
});

function MapPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Carte vivante" : "Live map"}
        title={locale === "fr" ? "Ottawa, en direct sur la carte" : "Ottawa, live on the map"}
        dek={locale === "fr" ? "Trafic, transport en commun, voies cyclables, fermetures, chantiers et signalements citoyens." : "Traffic, transit, bike paths, closures, construction and citizen reports."}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><InteractiveMap height="h-[560px]" /></div>
        <aside><TrafficAlertsList /></aside>
      </div>
    </PageShell>
  );
}
