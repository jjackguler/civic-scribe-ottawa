import { WEATHER_ALERTS, type WeatherAlert } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { AlertTriangle, CloudSnow } from "lucide-react";
import { useWeatherAlerts, type LiveWeatherAlert } from "@/lib/use-live-conditions";

const sev: Record<WeatherAlert["severity"], string> = {
  warning: "border-civic-red bg-civic-red/5 text-civic-red",
  watch: "border-highlight bg-highlight/15 text-foreground",
  advisory: "border-river bg-river/5 text-river",
};

const liveSev: Record<string, string> = {
  warning: "border-civic-red bg-civic-red/5 text-civic-red",
  watch: "border-highlight bg-highlight/15 text-foreground",
  advisory: "border-river bg-river/5 text-river",
  ended: "border-solution bg-solution/5 text-solution",
  info: "border-river bg-river/5 text-river",
};

export function WeatherAlertCard({ alert }: { alert: WeatherAlert }) {
  const { locale } = useLocale();
  return (
    <div className={`border-l-4 p-4 ${sev[alert.severity]} bg-card`}>
      <div className="flex items-start gap-3">
        {alert.severity === "warning" ? <AlertTriangle className="h-5 w-5 mt-0.5" /> : <CloudSnow className="h-5 w-5 mt-0.5" />}
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="kicker">{alert.severity}</span>
            <span className="text-xs text-muted-foreground">{alert.area}</span>
          </div>
          <h3 className="font-display text-lg mt-1 text-foreground">{alert.title[locale]}</h3>
          <p className="text-sm font-serif text-foreground/80 mt-2">{alert.advice[locale]}</p>
          <div className="text-[11px] text-muted-foreground mt-2">Issued {new Date(alert.issuedAt).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}</div>
        </div>
      </div>
    </div>
  );
}

function LiveWeatherCard({ alert }: { alert: LiveWeatherAlert }) {
  return (
    <div className={`border-l-4 p-4 ${liveSev[alert.severity] ?? liveSev.info} bg-card`}>
      <div className="flex items-start gap-3">
        {alert.severity === "warning" ? <AlertTriangle className="h-5 w-5 mt-0.5" /> : <CloudSnow className="h-5 w-5 mt-0.5" />}
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="kicker">{alert.severity}</span>
            <span className="text-xs text-muted-foreground">Environment Canada</span>
          </div>
          <h3 className="font-display text-lg mt-1 text-foreground">{alert.title}</h3>
          {alert.summary && <p className="text-sm font-serif text-foreground/80 mt-2">{alert.summary}</p>}
          <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-2">
            <span>Updated {new Date(alert.updatedAt).toLocaleString("en-CA")}</span>
            <a href={alert.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-civic-red">Source</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Real Environment Canada weather alerts for Ottawa-Carleton.
 * Falls back to the static sample WEATHER_ALERTS only while loading or
 * if the live feed is unavailable — never renders blank.
 */
export function WeatherAlertsList() {
  const { items, loading, error } = useWeatherAlerts();

  if (!loading && items.length === 0 && !error) {
    return (
      <div className="border border-rule bg-card p-4 text-sm font-serif text-muted-foreground">
        No active Environment Canada watches or warnings for Ottawa right now.
      </div>
    );
  }

  if (loading || (items.length === 0 && error)) {
    return (
      <div className="space-y-3">
        {WEATHER_ALERTS.map((a) => <WeatherAlertCard key={a.id} alert={a} />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((a) => <LiveWeatherCard key={a.id} alert={a} />)}
    </div>
  );
}

export function WeatherAlertsList() {
  return (
    <div className="space-y-3">
      {WEATHER_ALERTS.map((a) => <WeatherAlertCard key={a.id} alert={a} />)}
    </div>
  );
}
