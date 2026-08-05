import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { LeafletMap, SIGNAL_STYLES } from "@/components/LeafletMapClient";
import { generateMockSignals, OTTAWA_NEIGHBORHOODS } from "@/lib/map-signals";
import { useLocale } from "@/lib/locale-context";
import type { SignalType, SignalVerification, MapSignal } from "@/types/database";
import { Search as SearchIcon } from "lucide-react";
import { useOttawaTraffic } from "@/lib/use-ottawa-traffic";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [
    { title: "Ottawa Live Map — Civic Ledger" },
    { name: "description", content: "Editorial live map of Ottawa: verified signals, citizen reports, traffic, transit, weather and community alerts." },
  ]}),
  component: MapPage,
});

const ALL_TYPES = Object.keys(SIGNAL_STYLES) as SignalType[];
const VERIFICATION_OPTIONS: SignalVerification[] = [
  "verified", "developing", "community-submitted", "needs-fact-check", "official-source", "editor-reviewed",
];

function MapPage() {
  const { locale } = useLocale();
  const mockSignals = useMemo(() => generateMockSignals(160), []);
  const { mapped: liveTraffic, unmapped: unmappedTraffic } = useOttawaTraffic(locale);
  const allSignals = useMemo(() => [...liveTraffic, ...mockSignals], [liveTraffic, mockSignals]);
  const [activeTypes, setActiveTypes] = useState<Set<SignalType>>(new Set(ALL_TYPES));
  const [activeVerif, setActiveVerif] = useState<Set<SignalVerification>>(new Set(VERIFICATION_OPTIONS));
  const [neighborhood, setNeighborhood] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MapSignal | null>(null);

  const filtered = useMemo<MapSignal[]>(() => {
    const q = query.trim().toLowerCase();
    // Public map never exposes raw sensitive public-safety items.
    return allSignals.filter(s =>
      s.type !== "public-safety" &&
      activeTypes.has(s.type) &&
      activeVerif.has(s.verification) &&
      (neighborhood === "all" || s.neighborhood === neighborhood) &&
      (!q || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q) || s.neighborhood.toLowerCase().includes(q))
    );
  }, [allSignals, activeTypes, activeVerif, neighborhood, query]);

  const toggle = <T,>(set: Set<T>, val: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Carte vivante" : "Live editorial map"}
        title={locale === "fr" ? "Ottawa, signal par signal" : "Ottawa, signal by signal"}
        dek={locale === "fr"
          ? "Trafic, transport, météo, signalements citoyens, vérifications éditoriales — sur une seule carte."
          : "Traffic, transit, weather, citizen reports, editorial fact-checks — all on one editorial map."}
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Filters sidebar */}
        <aside className="lg:col-span-3 space-y-5">
          <div>
            <label className="kicker text-civic-red mb-2 block">{locale === "fr" ? "Recherche" : "Search"}</label>
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={locale === "fr" ? "Quartier, mot-clé…" : "Neighbourhood, keyword…"}
                className="w-full border border-rule pl-8 pr-2 py-2 text-sm bg-paper focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <label className="kicker text-civic-red mb-2 block">{locale === "fr" ? "Quartier" : "Neighbourhood"}</label>
            <select
              value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
              className="w-full border border-rule px-2 py-2 text-sm bg-paper"
            >
              <option value="all">{locale === "fr" ? "Tous les quartiers" : "All neighbourhoods"}</option>
              {OTTAWA_NEIGHBORHOODS.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
            </select>
          </div>

          <div>
            <label className="kicker text-civic-red mb-2 block">{locale === "fr" ? "Catégories" : "Categories"}</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TYPES.map(t => {
                const on = activeTypes.has(t);
                const { Icon, color, label } = SIGNAL_STYLES[t];
                return (
                  <button
                    key={t}
                    onClick={() => toggle(activeTypes, t, setActiveTypes)}
                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border ${on ? "text-paper" : "bg-paper text-foreground border-rule"}`}
                    style={on ? { background: color, borderColor: color } : undefined}
                  >
                    <Icon size={11} /> {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="kicker text-civic-red mb-2 block">{locale === "fr" ? "Vérification" : "Verification"}</label>
            <div className="flex flex-wrap gap-1.5">
              {VERIFICATION_OPTIONS.map(v => {
                const on = activeVerif.has(v);
                return (
                  <button key={v}
                    onClick={() => toggle(activeVerif, v, setActiveVerif)}
                    className={`text-[10px] uppercase tracking-wider font-semibold border px-2 py-1 ${on ? "bg-ink text-paper border-ink" : "border-rule"}`}
                  >{v.replace("-", " ")}</button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground border-t border-rule pt-3">
            {filtered.length} {locale === "fr" ? "signaux visibles" : "signals shown"} · {allSignals.length} {locale === "fr" ? "au total" : "total"}
            {liveTraffic.length > 0 && (
              <div className="mt-1 text-civic-red font-semibold">
                {liveTraffic.length} {locale === "fr" ? "incidents en direct (Ville d'Ottawa)" : "live incidents (City of Ottawa)"}
              </div>
            )}
          </div>

          {unmappedTraffic.length > 0 && (
            <div className="border-t border-rule pt-3">
              <label className="kicker text-civic-red mb-2 block">
                {locale === "fr" ? "Signalés, sans localisation" : "Reported, location not mapped"}
              </label>
              <ul className="text-[11px] text-muted-foreground space-y-1.5 max-h-48 overflow-auto">
                {unmappedTraffic.slice(0, 20).map(e => (
                  <li key={e.id} className="leading-snug">
                    <span className="font-semibold text-foreground">{e.title}</span>
                    {typeof e.location === "string" && <span> — {e.location}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Map + list */}
        <div className="lg:col-span-9 space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <LeafletMap
                signals={filtered}
                height="calc(100vh - 220px)"
                onSelect={setSelected}
                liveBadgeLabel={liveTraffic.length > 0
                  ? (locale === "fr" ? "Circulation en direct · Ville d'Ottawa" : "Live traffic · City of Ottawa")
                  : (locale === "fr" ? "Carte vivante · échantillons" : "Live editorial map · sample data")}
              />
            </div>
            <aside className="border border-rule bg-card flex flex-col">
              {selected ? (
                <>
                  <div className="px-4 py-3 rule-bottom flex items-baseline justify-between gap-2">
                    <span className="kicker" style={{ color: SIGNAL_STYLES[selected.type].color }}>
                      {SIGNAL_STYLES[selected.type].label}
                    </span>
                    <button onClick={() => setSelected(null)} className="text-[11px] text-muted-foreground hover:text-ink">×</button>
                  </div>
                  <div className="p-4 space-y-3 flex-1 overflow-auto">
                    <h3 className="font-display text-xl leading-snug">{selected.title}</h3>
                    <p className="font-serif text-sm text-muted-foreground">{selected.summary}</p>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground space-y-1">
                      <div>· {selected.neighborhood}</div>
                      <div>· {selected.verification.replace("-", " ")}</div>
                      {selected.source_name && <div>· {selected.source_name}</div>}
                    </div>
                    {selected.source_url && (
                      <a href={selected.source_url} target="_blank" rel="noreferrer" className="inline-block text-[11px] uppercase tracking-wider font-semibold border-b border-ink">
                        {locale === "fr" ? "Source officielle →" : "Official source →"}
                      </a>
                    )}
                  </div>
                  <a href="/submit" className="block text-center px-4 py-3 bg-civic-red text-paper text-[11px] uppercase tracking-wider font-bold hover:bg-ink">
                    {locale === "fr" ? "Signaler un problème ici" : "Report a problem here"}
                  </a>
                </>
              ) : (
                <div className="p-5 flex-1 flex flex-col">
                  <div className="kicker text-muted-foreground mb-2">{locale === "fr" ? "Légende" : "Legend"}</div>
                  <ul className="space-y-1.5 text-[11px]">
                    {ALL_TYPES.slice(0, 12).map(t => {
                      const { Icon, color, label } = SIGNAL_STYLES[t];
                      return (
                        <li key={t} className="flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ background: color }}>
                            <Icon size={11} color="#fff" />
                          </span>
                          <span className="font-sans">{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-[11px] text-muted-foreground mt-4 font-serif italic">
                    {locale === "fr"
                      ? "Cliquez sur un marqueur pour ouvrir le détail. Les éléments sensibles de sécurité publique n'apparaissent jamais publiquement."
                      : "Click any marker for details. Sensitive public-safety items never appear on the public map."}
                  </p>
                  <a href="/submit" className="mt-auto block text-center px-4 py-3 border border-ink text-[11px] uppercase tracking-wider font-bold hover:bg-ink hover:text-paper">
                    {locale === "fr" ? "Signaler un problème" : "Report a problem"}
                  </a>
                </div>
              )}
            </aside>
          </div>
          <div className="border border-rule bg-card">
            <div className="px-3 py-2 border-b border-rule kicker text-civic-red">
              {locale === "fr" ? "Liste — signaux visibles" : "Signal list — current view"}
            </div>
            <ul className="max-h-72 overflow-auto divide-y divide-rule">
              {filtered.slice(0, 30).map(s => {
                const { Icon, color, label } = SIGNAL_STYLES[s.type];
                return (
                  <li key={s.id} className="px-3 py-2 flex items-start gap-3 hover:bg-secondary/50 cursor-pointer" onClick={() => setSelected(s)}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full shrink-0" style={{ background: color }}>
                      <Icon size={12} color="#fff" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-serif text-sm leading-snug">{s.title}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {label} · {s.neighborhood} · {s.verification.replace("-", " ")}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
