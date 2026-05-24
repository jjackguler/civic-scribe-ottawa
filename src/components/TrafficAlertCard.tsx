import { TRAFFIC_ALERTS, type TrafficAlert } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { Train, Construction, AlertOctagon, Car } from "lucide-react";

const icon = { transit: Train, construction: Construction, incident: AlertOctagon, closure: Car };
const impact = {
  high: "text-civic-red",
  medium: "text-highlight",
  low: "text-solution",
};

export function TrafficAlertCard({ alert }: { alert: TrafficAlert }) {
  const { locale } = useLocale();
  const Icon = icon[alert.type];
  return (
    <div className="flex gap-3 items-start py-3 rule-bottom">
      <Icon className={`h-5 w-5 mt-1 ${impact[alert.impact]}`} />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="kicker text-muted-foreground">{alert.type} · {alert.location}</span>
          <span className={`text-[10px] uppercase tracking-wider font-bold ${impact[alert.impact]}`}>{alert.impact}</span>
        </div>
        <p className="font-serif text-sm leading-snug mt-1">{alert.title[locale]}</p>
        <div className="text-[11px] text-muted-foreground mt-1">Until {new Date(alert.until).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}</div>
      </div>
    </div>
  );
}

export function TrafficAlertsList() {
  return <div className="bg-card border border-rule p-4">{TRAFFIC_ALERTS.map((a) => <TrafficAlertCard key={a.id} alert={a} />)}</div>;
}
