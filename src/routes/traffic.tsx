import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { InteractiveMap } from "@/components/InteractiveMap";
import { OpenIssuesTracker } from "@/components/OpenIssuesTracker";
import { GoogleTrafficTab } from "@/components/GoogleTrafficTab";
import { generateRoadClosureSignals } from "@/lib/ingest/road-closures";
import { generate311Signals } from "@/lib/ingest/ottawa-311";
import { useLocale } from "@/lib/locale-context";
import { RefreshCcw, AlertOctagon, Construction, Calendar, Train, CloudRain, Users, Map as MapIcon, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/traffic")({
  head: () => ({ meta: [{ title: "Live Traffic — Ottawa Civic Ledger" }] }),
  component: TrafficPage,
});

type OttEvent = {
  id: string; type: string; title: string; description?: string;
  location?: string; severity?: string; lat?: number; lng?: number;
  startTime?: string; updated?: string; endTime?: string; source?: string;
  isSample?: boolean;
};

// Mock fallback used only when the official feed is unreachable.
const SAMPLE_EVENTS: OttEvent[] = [
  { id: "s1", type: "construction", title: "Bank St lane closures — water main repair", location: "Bank St at Gladstone Ave, Centretown", severity: "medium", source: "City of Ottawa", updated: "2026-05-24T18:30:00Z", endTime: "2026-05-31T22:00:00Z", isSample: true },
  { id: "s2", type: "incident", title: "Collision cleared — Hwy 417 EB at Nicholas", location: "Hwy 417 EB · Sandy Hill", severity: "low", source: "Ontario 511", updated: "2026-05-24T17:15:00Z", endTime: "2026-05-24T17:45:00Z", isSample: true },
  { id: "s3", type: "construction", title: "Portage Bridge — scheduled lane reduction", location: "Portage Bridge · Downtown", severity: "medium", source: "NCC", updated: "2026-05-24T15:00:00Z", endTime: "2026-06-04T20:00:00Z", isSample: true },
  { id: "s4", type: "incident", title: "Signal repair on Hunt Club Rd EB near Riverside", location: "Hunt Club Rd EB · Alta Vista", severity: "low", source: "City of Ottawa", updated: "2026-05-24T13:45:00Z", endTime: "2026-05-24T19:00:00Z", isSample: true },
  { id: "s5", type: "construction", title: "Slater St bus lane work, weekday off-peak", location: "Slater St between Bay & Bronson · Centretown", severity: "low", source: "City of Ottawa", updated: "2026-05-24T11:20:00Z", endTime: "2026-06-21T18:00:00Z", isSample: true },
];

type Tab = "incidents" | "closures" | "transit" | "weather" | "citizen" | "google";

function TrafficPage() {
  const { locale } = useLocale();
  const [tab, setTab] = useState<Tab>("incidents");
  const [events, setEvents] = useState<OttEvent[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const closures = useMemo(generateRoadClosureSignals, []);
  const issues = useMemo(() => generate311Signals(40).filter(s => /pothole|sidewalk|snow|streetlight/i.test(s.title)), []);

  async function load() {
    setLoading(true); setError(null);
    // Hard 8s timeout so we never sit in "Loading…" forever.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`/api/public/ottawa-traffic?locale=${locale}`, { signal: ctrl.signal });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Failed to load");
      setEvents(json.events ?? []);
      setFetchedAt(json.fetchedAt ?? null);
    } catch (e: any) {
      setError(e?.name === "AbortError"
        ? (locale === "fr" ? "Délai dépassé" : "Timed out")
        : (e?.message ?? "Failed to load City of Ottawa feed"));
      // Fallback sample so the page never sits empty.
      setEvents(SAMPLE_EVENTS);
      setFetchedAt(null);
    } finally { clearTimeout(timer); setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [locale]);

  const tabs: { key: Tab; label: string; Icon: any }[] = [
    { key: "incidents", label: locale === "fr" ? "Incidents officiels" : "Official incidents", Icon: AlertOctagon },
    { key: "closures",  label: locale === "fr" ? "Fermetures de routes" : "Road closures", Icon: Construction },
    { key: "transit",   label: locale === "fr" ? "Alertes transport" : "Transit alerts", Icon: Train },
    { key: "weather",   label: locale === "fr" ? "Alertes météo" : "Weather alerts", Icon: CloudRain },
    { key: "citizen",   label: locale === "fr" ? "Signalements citoyens" : "Citizen reports", Icon: Users },
    { key: "google",    label: locale === "fr" ? "Google Live (optionnel)" : "Google Live (optional)", Icon: MapIcon },
  ];

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Circulation et transport" : "Live Traffic"}
        title={locale === "fr" ? "Votre trajet, en direct." : "Your commute, in real time."}
        dek={locale === "fr"
          ? "Sources officielles gratuites : Ville d'Ottawa, Ontario 511, OC Transpo, Environnement Canada."
          : "Free official sources: City of Ottawa, Ontario 511, OC Transpo, Environment Canada."}
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2"><InteractiveMap height="h-[420px]" /></div>
        <aside className="bg-river/5 border border-river/20 p-5">
          <h3 className="kicker text-river">{locale === "fr" ? "Indice d'impact" : "Commute impact"}</h3>
          <div className="font-display text-6xl mt-3 text-river">62</div>
          <p className="font-serif text-sm text-muted-foreground mt-2">{locale === "fr" ? "Modéré · +15 min" : "Moderate · +15 min PM"}</p>
        </aside>
      </div>

      {/* Tab bar */}
      <div className="rule-bottom flex flex-wrap gap-1 mb-6 overflow-x-auto">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
              tab === key ? "border-civic-red text-civic-red" : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "incidents" && (
        <div className="bg-card border border-rule p-5">
          <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
            <h2 className="kicker text-civic-red">{locale === "fr" ? "Ville d'Ottawa · en direct" : "City of Ottawa · live"}</h2>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-sans">
              {fetchedAt && <span>{new Date(fetchedAt).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}</span>}
              <button onClick={load} disabled={loading} className="inline-flex items-center gap-1 border border-rule hover:border-ink px-2 py-1 disabled:opacity-50">
                <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> {locale === "fr" ? "Actualiser" : "Refresh"}
              </button>
            </div>
          </div>
          {loading && <p className="text-sm text-muted-foreground font-sans">{locale === "fr" ? "Chargement…" : "Loading City of Ottawa feed…"}</p>}
          {error && !loading && (
            <div className="mb-3 border border-highlight bg-highlight/10 p-3 text-xs font-sans">
              <div className="font-semibold text-ink mb-1">
                {locale === "fr" ? "Flux officiel temporairement indisponible" : "Official feed temporarily unavailable"}
              </div>
              <div className="text-muted-foreground">
                {locale === "fr"
                  ? `Affichage d'échantillons en cache marqués (sample). Dernière tentative : ${new Date().toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA")}. Statut source : ${error}.`
                  : `Showing cached sample records (marked "sample"). Last attempt: ${new Date().toLocaleTimeString("en-CA")}. Source status: ${error}.`}
              </div>
            </div>
          )}
          {!loading && !error && events.length === 0 && (
            <p className="text-sm text-muted-foreground font-sans">{locale === "fr" ? "Aucun événement actif." : "No active events."}</p>
          )}
          <ul className="divide-y divide-rule">
            {events.slice(0, 25).map(ev => {
              const Icon = /construction/i.test(ev.type) ? Construction : /event|special/i.test(ev.type) ? Calendar : AlertOctagon;
              const sevColor = /high|major/i.test(String(ev.severity)) ? "text-civic-red" : /medium|moderate/i.test(String(ev.severity)) ? "text-highlight" : "text-solution";
              return (
                <li key={ev.id} className="py-3 flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-1 ${sevColor}`} />
                  <div className="min-w-0">
                    <div className="font-serif text-sm leading-snug">{ev.title}</div>
                    <div className="text-[11px] text-muted-foreground font-sans mt-0.5">
                      {ev.location && <span>{typeof ev.location === "string" ? ev.location : JSON.stringify(ev.location)}</span>}
                      {ev.updated && <span> · {new Date(ev.updated).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {tab === "closures" && (
        <div className="bg-card border border-rule">
          <header className="px-5 py-3 rule-bottom flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="kicker text-civic-red">{locale === "fr" ? "Fermetures de routes" : "Road closures"}</h2>
            <span className="text-[11px] text-muted-foreground">{locale === "fr" ? "Ville d'Ottawa · Ontario 511 · CCN" : "City of Ottawa · Ontario 511 · NCC"}</span>
          </header>
          <ul className="divide-y divide-rule">
            {closures.map(c => (
              <li key={c.id} className="px-5 py-3 flex items-start gap-3">
                <Construction className="h-4 w-4 mt-1 text-civic-red shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-sm leading-snug">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{c.neighborhood} · {c.source_name}</div>
                </div>
                {c.source_url && (
                  <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-river inline-flex items-center gap-1 hover:underline">
                    {locale === "fr" ? "Source" : "Source"} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "transit" && (
        <div className="bg-card border border-rule p-5">
          <h2 className="kicker text-river mb-3">{locale === "fr" ? "OC Transpo · alertes" : "OC Transpo · alerts"}</h2>
          <p className="font-serif text-sm text-muted-foreground">
            {locale === "fr" ? "Les alertes en direct apparaîtront ici une fois le flux RSS OC Transpo connecté côté admin."
                             : "Live alerts will appear here once the OC Transpo RSS feed is wired in admin."}
          </p>
          <a href="https://www.octranspo.com/en/alerts" target="_blank" rel="noopener noreferrer"
             className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-river hover:underline">
            OC Transpo alerts <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {tab === "weather" && (
        <div className="bg-card border border-rule p-5">
          <h2 className="kicker text-river mb-3">{locale === "fr" ? "Environnement Canada" : "Environment Canada"}</h2>
          <p className="font-serif text-sm text-muted-foreground">
            {locale === "fr" ? "Alertes météo officielles pour la région d'Ottawa." : "Official weather alerts for the Ottawa region."}
          </p>
          <a href="https://weather.gc.ca/city/pages/on-118_metric_e.html" target="_blank" rel="noopener noreferrer"
             className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-river hover:underline">
            weather.gc.ca <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {tab === "citizen" && (
        <div className="space-y-4">
          <OpenIssuesTracker />
          <div className="bg-card border border-rule p-5">
            <h3 className="kicker text-solution mb-2">{locale === "fr" ? "Signalements liés au trafic" : "Traffic-related citizen reports"}</h3>
            <ul className="divide-y divide-rule">
              {issues.slice(0, 10).map(i => (
                <li key={i.id} className="py-3 font-serif text-sm">{i.title}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "google" && <GoogleTrafficTab />}
    </PageShell>
  );
}
