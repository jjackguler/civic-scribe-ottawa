import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { TrafficRadio } from "@/components/TrafficRadio";
import { TrafficAlertsList } from "@/components/TrafficAlertCard";
import { WeatherAlertsList } from "@/components/WeatherAlertCard";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/radio")({
  head: () => ({ meta: [
    { title: "Ottawa Traffic Radio — Civic Ledger" },
    { name: "description", content: "Listen to a generated Ottawa traffic bulletin in a calm local radio voice. Bilingual, always current." },
  ]}),
  component: RadioPage,
});

function RadioPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Radio civique" : "Civic radio"}
        title={locale === "fr" ? "Radio circulation Ottawa" : "Ottawa Traffic Radio"}
        dek={locale === "fr" ? "Un bulletin calme et clair, mis à jour selon les incidents en cours." : "A calm, clear bulletin that refreshes from current incidents."}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><TrafficRadio /></div>
        <div className="space-y-6">
          <div>
            <h3 className="kicker text-civic-red mb-2">{locale === "fr" ? "En direct — circulation" : "Live — traffic"}</h3>
            <TrafficAlertsList />
          </div>
          <div>
            <h3 className="kicker text-civic-red mb-2">{locale === "fr" ? "En direct — météo" : "Live — weather"}</h3>
            <WeatherAlertsList />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
