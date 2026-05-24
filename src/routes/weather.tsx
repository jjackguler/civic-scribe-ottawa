import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { WeatherAlertsList } from "@/components/WeatherAlertCard";
import { useLocale } from "@/lib/locale-context";
import { Cloud, Wind, Droplets, Sun } from "lucide-react";

export const Route = createFileRoute("/weather")({
  head: () => ({ meta: [{ title: "Weather — Ottawa Civic Ledger" }] }),
  component: WeatherPage,
});

function WeatherPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Météo" : "Weather"}
        title={locale === "fr" ? "Ottawa, aujourd'hui" : "Ottawa, right now"}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-card border border-rule p-6 lg:col-span-1">
          <div className="kicker text-muted-foreground">{locale === "fr" ? "Centre-ville" : "Downtown"}</div>
          <div className="font-display text-7xl mt-2">−2°</div>
          <div className="font-serif text-lg text-muted-foreground">{locale === "fr" ? "Pluie verglaçante en soirée" : "Freezing rain by evening"}</div>
          <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
            <Stat icon={Wind} label={locale === "fr" ? "Vent" : "Wind"} value="22 km/h NE" />
            <Stat icon={Droplets} label={locale === "fr" ? "Humidité" : "Humidity"} value="78%" />
            <Stat icon={Sun} label={locale === "fr" ? "UV" : "UV"} value="2" />
            <Stat icon={Cloud} label={locale === "fr" ? "Air" : "Air"} value="AQHI 6" />
          </div>
        </div>
        <div className="lg:col-span-2">
          <h2 className="kicker text-civic-red mb-3">{locale === "fr" ? "Alertes actives" : "Active alerts"}</h2>
          <WeatherAlertsList />
        </div>
      </div>

      <section className="mt-10 p-6 bg-secondary max-w-3xl">
        <h3 className="font-display text-2xl">{locale === "fr" ? "Ce que les résidents doivent savoir" : "What residents should know"}</h3>
        <ul className="mt-3 space-y-2 font-serif text-foreground/80 list-disc pl-5">
          <li>{locale === "fr" ? "Salez les entrées avant 20 h ce soir." : "Salt entryways before 8 pm tonight."}</li>
          <li>{locale === "fr" ? "Les autobus pourraient avoir 15 min de retard." : "Buses may run 15 min late."}</li>
          <li>{locale === "fr" ? "Vérifiez vos voisins âgés." : "Check on elderly neighbours."}</li>
        </ul>
      </section>
    </PageShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="font-semibold">{value}</div></div>
    </div>
  );
}
