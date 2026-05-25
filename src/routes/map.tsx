import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { LeafletMap, SIGNAL_STYLES } from "@/components/LeafletMapClient";
import { generateMockSignals, OTTAWA_NEIGHBORHOODS } from "@/lib/map-signals";
import { useLocale } from "@/lib/locale-context";
import type { SignalType, SignalVerification, MapSignal } from "@/types/database";
import { Search as SearchIcon } from "lucide-react";

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
  const allSignals = useMemo(() => generateMockSignals(160), []);
  const [activeTypes, setActiveTypes] = useState<Set<SignalType>>(new Set(ALL_TYPES));
  const [activeVerif, setActiveVerif] = useState<Set<SignalVerification>>(new Set(VERIFICATION_OPTIONS));
  const [neighborhood, setNeighborhood] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo<MapSignal[]>(() => {
    const q = query.trim().toLowerCase();
    return allSignals.filter(s =>
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
          </div>
        </aside>

        {/* Map + list */}
        <div className="lg:col-span-9 space-y-4">
          <LeafletMap signals={filtered} height="calc(100vh - 220px)" />
          <div className="border border-rule bg-card">
            <div className="px-3 py-2 border-b border-rule kicker text-civic-red">
              {locale === "fr" ? "Liste — signaux visibles" : "Signal list — current view"}
            </div>
            <ul className="max-h-72 overflow-auto divide-y divide-rule">
              {filtered.slice(0, 30).map(s => {
                const { Icon, color, label } = SIGNAL_STYLES[s.type];
                return (
                  <li key={s.id} className="px-3 py-2 flex items-start gap-3 hover:bg-secondary/50">
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
