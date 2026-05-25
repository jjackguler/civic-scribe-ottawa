import { useEffect, useRef, useState } from "react";
import { TRAFFIC_ALERTS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { Train, Construction, AlertOctagon, Car, Layers, Bike, Bus } from "lucide-react";

// Approximate Ottawa lat/lng for pin overlay (mock mode)
type PinSpec = { id: string; name: string; lat: number; lng: number };
const PIN_COORDS: Record<string, PinSpec> = {
  Downtown:         { id: "downtown", name: "Downtown / Parliament Hill", lat: 45.4215, lng: -75.6972 },
  "Parliament Hill":{ id: "parl",     name: "Parliament Hill",            lat: 45.4250, lng: -75.7000 },
  Glebe:            { id: "glebe",    name: "Glebe / Bank St",            lat: 45.4015, lng: -75.6890 },
  Westboro:         { id: "westboro", name: "Westboro / Hwy 417",          lat: 45.3939, lng: -75.7530 },
  Kanata:           { id: "kanata",   name: "Kanata",                     lat: 45.3088, lng: -75.8990 },
  Orleans:          { id: "orleans",  name: "Orléans",                    lat: 45.4651, lng: -75.5126 },
  Barrhaven:        { id: "barrhaven",name: "Barrhaven / Hwy 416",         lat: 45.2733, lng: -75.7355 },
  "ByWard Market":  { id: "byward",   name: "ByWard Market",              lat: 45.4286, lng: -75.6912 },
  "Alta Vista":     { id: "altavista",name: "Alta Vista / Riverside",      lat: 45.3870, lng: -75.6620 },
};

// Project lat/lng to a fake 0..1 viewbox for the mock map.
// Bounds: lat 45.20..45.55, lng -75.95..-75.45
function project(lat: number, lng: number) {
  const x = (lng - -75.95) / (-75.45 - -75.95);
  const y = 1 - (lat - 45.20) / (45.55 - 45.20);
  return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
}

const TYPE_ICON = { transit: Train, construction: Construction, incident: AlertOctagon, closure: Car };
const IMPACT_COLOR = { high: "var(--civic-red)", medium: "var(--highlight)", low: "var(--solution)" };

declare global { interface Window { google?: any; __initOttawaMap?: () => void; } }

export function InteractiveMap({ height = "h-[480px]" }: { height?: string }) {
  const { locale } = useLocale();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState({ traffic: true, transit: false, bicycle: false });
  const [active, setActive] = useState<string | null>(null);
  const [hasGoogle, setHasGoogle] = useState(false);
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  // Attempt Google Maps init if key present
  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    let canceled = false;
    function init() {
      if (canceled || !window.google || !mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 45.4215, lng: -75.6972 }, zoom: 12,
        disableDefaultUI: false, mapTypeControl: false, streetViewControl: false,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      });
      (map as any).__layers = {
        traffic: new window.google.maps.TrafficLayer(),
        transit: new window.google.maps.TransitLayer(),
        bicycle: new window.google.maps.BicyclingLayer(),
      };
      if (layers.traffic) (map as any).__layers.traffic.setMap(map);
      TRAFFIC_ALERTS.forEach(a => {
        const c = PIN_COORDS[a.location] ?? PIN_COORDS.Downtown;
        new window.google.maps.Marker({
          position: { lat: c.lat, lng: c.lng }, map,
          title: a.title[locale],
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 9,
            fillColor: a.impact === "high" ? "#c0392b" : a.impact === "medium" ? "#d4a017" : "#2e8b57",
            fillOpacity: 0.95, strokeColor: "#fff", strokeWeight: 2 },
        });
      });
      (window as any).__ottawaMap = map;
      setHasGoogle(true);
    }
    if (window.google?.maps) { init(); return; }
    window.__initOttawaMap = init;
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=__initOttawaMap`;
    s.async = true; s.defer = true;
    document.head.appendChild(s);
    return () => { canceled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Toggle Google layers when state changes
  useEffect(() => {
    const map = (window as any).__ottawaMap;
    if (!map?.__layers) return;
    (["traffic","transit","bicycle"] as const).forEach(k => {
      map.__layers[k].setMap(layers[k] ? map : null);
    });
  }, [layers]);

  return (
    <div className="bg-card border border-rule overflow-hidden">
      {/* Layer toggles */}
      <div className="flex items-center gap-2 flex-wrap px-3 py-2 border-b border-rule bg-secondary/50">
        <Layers className="h-4 w-4 text-civic-red" />
        <span className="kicker mr-2">{locale === "fr" ? "Couches" : "Layers"}</span>
        {([
          { k: "traffic", icon: Car,  l: t_("toggleTraffic", locale) },
          { k: "transit", icon: Bus,  l: t_("toggleTransit", locale) },
          { k: "bicycle", icon: Bike, l: t_("toggleBicycle", locale) },
        ] as const).map(({ k, icon: Icon, l }) => (
          <button
            key={k}
            onClick={() => setLayers(s => ({ ...s, [k]: !s[k] }))}
            className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold border px-2.5 py-1 transition-colors ${layers[k] ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}
          >
            <Icon className="h-3 w-3" /> {l}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {hasGoogle
            ? (locale === "fr" ? "Google Maps · données en direct" : "Google Maps · live data")
            : apiKey
              ? (locale === "fr" ? "Chargement de Google Maps…" : "Loading Google Maps…")
              : (locale === "fr" ? "Carte indisponible — clé VITE_GOOGLE_MAPS_API_KEY manquante" : "Map unavailable — VITE_GOOGLE_MAPS_API_KEY not configured")}
        </span>
      </div>

      <div className="relative">
        {/* Real Google Maps container */}
        <div ref={mapRef} className={`${height} w-full ${hasGoogle ? "block" : "hidden"}`} />

        {/* Mock map fallback */}
        {!hasGoogle && (
          <div className={`relative ${height} w-full bg-[oklch(0.94_0.02_220)] overflow-hidden`}>
            {/* Stylised street grid */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="oklch(0.85 0.02 220)" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              {/* Rideau Canal sweep */}
              <path d="M 20 95 Q 35 70 42 55 T 55 25 T 70 5" stroke="oklch(0.6 0.1 230)" strokeWidth="1.4" fill="none" opacity="0.85" />
              {/* Ottawa River */}
              <path d="M 0 22 Q 30 12 55 18 T 100 14" stroke="oklch(0.6 0.1 230)" strokeWidth="2.2" fill="none" />
              {/* Hwy 417 */}
              <path d="M 0 52 L 100 48" stroke="oklch(0.55 0.18 27)" strokeWidth="0.9" strokeDasharray="2 1.5" opacity={layers.traffic ? 1 : 0.25} />
              {/* Transit O-Train Line 1 */}
              <path d="M 5 55 Q 30 50 50 48 T 95 44" stroke="oklch(0.45 0.18 280)" strokeWidth={layers.transit ? 1.1 : 0.4} fill="none" />
              {/* Bike paths */}
              <path d="M 10 80 Q 40 65 60 55 T 95 30" stroke="oklch(0.55 0.15 145)" strokeWidth={layers.bicycle ? 0.9 : 0.3} fill="none" strokeDasharray="0.8 0.6" />
              <text x="2" y="20" fontSize="2.2" fill="oklch(0.45 0.08 230)" fontStyle="italic">Ottawa River</text>
              <text x="46" y="60" fontSize="2.2" fill="oklch(0.45 0.18 27)">Hwy 417</text>
              <text x="50" y="30" fontSize="2" fill="oklch(0.45 0.08 230)" fontStyle="italic">Rideau Canal</text>
            </svg>

            {/* Pins */}
            {TRAFFIC_ALERTS.map(a => {
              const c = PIN_COORDS[a.location] ?? PIN_COORDS.Downtown;
              const p = project(c.lat, c.lng);
              const Icon = TYPE_ICON[a.type];
              const color = IMPACT_COLOR[a.impact];
              return (
                <button
                  key={a.id}
                  onClick={() => setActive(active === a.id ? null : a.id)}
                  style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, color }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  aria-label={a.title[locale]}
                >
                  <span className="block relative">
                    <span className="absolute inset-0 -m-2 rounded-full pulse-ring" style={{ background: color, opacity: 0.35 }} />
                    <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper shadow-md" style={{ background: color }}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                  </span>
                  {active === a.id && (
                    <div className="absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-paper border border-ink shadow-xl p-3 text-left text-foreground">
                      <div className="kicker text-civic-red mb-1">{a.type} · {a.location}</div>
                      <div className="font-serif text-sm leading-snug">{a.title[locale]}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {locale === "fr" ? "Jusqu'à" : "Until"} {new Date(a.until).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-paper/95 border border-rule px-3 py-2 text-[11px]">
              <div className="kicker mb-1">{locale === "fr" ? "Légende" : "Legend"}</div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--civic-red)" }} />{locale === "fr" ? "Impact élevé" : "High impact"}</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--highlight)" }} />{locale === "fr" ? "Moyen" : "Medium"}</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--solution)" }} />{locale === "fr" ? "Faible" : "Low"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// tiny local re-export to avoid extra imports above
import { t as t_ } from "@/lib/i18n";
