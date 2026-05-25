import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { TRAFFIC_ALERTS } from "@/lib/data";
import { TrafficAlertCard } from "@/components/TrafficAlertCard";
import { InteractiveMap } from "@/components/InteractiveMap";
import { useLocale } from "@/lib/locale-context";
import { RefreshCcw, AlertOctagon, Construction, Calendar } from "lucide-react";

export const Route = createFileRoute("/traffic")({
  head: () => ({ meta: [{ title: "Traffic & Transit — Ottawa Civic Ledger" }] }),
  component: TrafficPage,
});

type OttEvent = {
  id: string; type: string; title: string; description?: string;
  location?: string; severity?: string; lat?: number; lng?: number;
  startTime?: string; updated?: string;
};

function TrafficPage() {
  const { locale } = useLocale();
  const [events, setEvents] = useState<OttEvent[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/public/ottawa-traffic?locale=${locale}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Failed to load");
      setEvents(json.events ?? []);
      setFetchedAt(json.fetchedAt ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load City of Ottawa feed");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [locale]);

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

      {/* Live City of Ottawa traffic events */}
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <h2 className="kicker text-civic-red">{locale === "fr" ? "Événements — Ville d'Ottawa" : "Live events — City of Ottawa"}</h2>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-sans">
          {fetchedAt && (
            <span>
              {locale === "fr" ? "Dernière mise à jour de la Ville d'Ottawa" : "Last updated from City of Ottawa"} ·{" "}
              {new Date(fetchedAt).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
            </span>
          )}
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-1 border border-rule hover:border-ink px-2 py-1 disabled:opacity-50">
            <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> {locale === "fr" ? "Actualiser" : "Refresh"}
          </button>
        </div>
      </div>
      <div className="bg-card border border-rule p-5 mb-8">
        {loading && <p className="text-sm text-muted-foreground font-sans">{locale === "fr" ? "Chargement du flux de la Ville…" : "Loading City of Ottawa feed…"}</p>}
        {error && <p className="text-sm text-civic-red font-sans">{error}</p>}
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
                    <span className={`ml-2 uppercase tracking-wider ${sevColor}`}>{String(ev.severity ?? "")}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <h2 className="kicker text-civic-red mb-3">{locale === "fr" ? "Tous les incidents (éditorial)" : "All incidents (editorial)"}</h2>
      <div className="bg-card border border-rule p-5">
        {TRAFFIC_ALERTS.map(a => <TrafficAlertCard key={a.id} alert={a} />)}
      </div>
    </PageShell>
  );
}

