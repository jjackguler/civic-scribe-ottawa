import { TRAFFIC_ALERTS, type TrafficAlert } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { Train, Construction, AlertOctagon, Car } from "lucide-react";
import { useOttawaTrafficEvents, type LiveTrafficEvent } from "@/lib/use-live-conditions";

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

const liveImpact: Record<string, string> = { high: "text-civic-red", major: "text-civic-red", medium: "text-highlight", moderate: "text-highlight", low: "text-solution", minor: "text-solution", unknown: "text-muted-foreground" };

function LiveTrafficCard({ event }: { event: LiveTrafficEvent }) {
  const Icon = event.type.includes("transit") ? Train : event.type.includes("construction") ? Construction : event.type.includes("closure") ? Car : AlertOctagon;
  return (
    <div className="flex gap-3 items-start py-3 rule-bottom">
      <Icon className={`h-5 w-5 mt-1 ${liveImpact[event.severity] ?? liveImpact.unknown}`} />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="kicker text-muted-foreground">{event.type}{event.location ? ` · ${event.location}` : ""}</span>
          <span className={`text-[10px] uppercase tracking-wider font-bold ${liveImpact[event.severity] ?? liveImpact.unknown}`}>{event.severity}</span>
        </div>
        <p className="font-serif text-sm leading-snug mt-1">{event.title}</p>
        {event.updated && <div className="text-[11px] text-muted-foreground mt-1">Updated {new Date(event.updated).toLocaleString("en-CA")}</div>}
      </div>
    </div>
  );
}

/**
 * Real City of Ottawa traffic events (same feed the live map uses).
 * Falls back to the static sample TRAFFIC_ALERTS only while loading or
 * if the live feed is unavailable — never renders blank.
 */
export function TrafficAlertsList() {
  const { events, loading, error } = useOttawaTrafficEvents();

  if (loading || (events.length === 0 && error)) {
    return <div className="bg-card border border-rule p-4">{TRAFFIC_ALERTS.map((a) => <TrafficAlertCard key={a.id} alert={a} />)}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="border border-rule bg-card p-4 text-sm font-serif text-muted-foreground">
        No active City of Ottawa traffic events reported right now.
      </div>
    );
  }

  return <div className="bg-card border border-rule p-4">{events.slice(0, 12).map((e) => <LiveTrafficCard key={e.id} event={e} />)}</div>;
}
