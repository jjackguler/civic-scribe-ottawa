import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { LeafletMap, SIGNAL_STYLES } from "./LeafletMapClient";
import { generateMockSignals } from "@/lib/map-signals";
import type { SignalType, MapSignal } from "@/types/database";
import { useLocale } from "@/lib/locale-context";

const COMPACT_TYPES: SignalType[] = [
  "breaking-news", "traffic", "transit", "weather-alert", "citizen-report", "good-news",
];

export function HomepageMapEmbed() {
  const { locale } = useLocale();
  const base = useMemo(() => generateMockSignals(120), []);
  const [signals, setSignals] = useState<MapSignal[]>(base);
  const [active, setActive] = useState<Set<SignalType>>(new Set(COMPACT_TYPES));

  // Mock live tick: every 20s, resolve one unresolved, bump a few timestamps
  useEffect(() => {
    const i = setInterval(() => {
      setSignals(prev => {
        const next = [...prev];
        const idx = next.findIndex(s => s.type === "unresolved");
        if (idx > -1) next[idx] = { ...next[idx], type: "solved", updated_at: new Date().toISOString() };
        for (let k = 0; k < 3; k++) {
          const j = Math.floor(Math.random() * next.length);
          next[j] = { ...next[j], updated_at: new Date().toISOString() };
        }
        return next;
      });
    }, 20000);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(
    () => signals.filter(s =>
      active.has(s.type) &&
      (s.verification === "verified" || s.verification === "developing" || s.verification === "official-source" || s.verification === "editor-reviewed")
    ),
    [signals, active]
  );

  const toggle = (t: SignalType) => {
    const next = new Set(active);
    next.has(t) ? next.delete(t) : next.add(t);
    setActive(next);
  };

  return (
    <div className="bg-card border border-rule">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-rule">
        <span className="kicker text-civic-red mr-1">{locale === "fr" ? "Filtres" : "Filters"}</span>
        {COMPACT_TYPES.map(t => {
          const { Icon, color, label } = SIGNAL_STYLES[t];
          const on = active.has(t);
          return (
            <button key={t} onClick={() => toggle(t)}
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border ${on ? "text-paper" : "bg-paper text-foreground border-rule"}`}
              style={on ? { background: color, borderColor: color } : undefined}
            >
              <Icon size={11} /> {label}
            </button>
          );
        })}
        <Link to="/map" className="ml-auto text-[11px] uppercase tracking-wider font-semibold border-b border-ink pb-0.5 hover:text-civic-red">
          {locale === "fr" ? "Ouvrir la carte complète" : "Open full map"} →
        </Link>
      </div>
      <LeafletMap signals={filtered} height="500px" compact />
    </div>
  );
}
