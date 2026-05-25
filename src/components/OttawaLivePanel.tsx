import { useMemo, useState } from "react";
import { MapPin, Car, Train, Utensils, Sun, Sunrise, Sunset, Moon, CloudSnow, Activity as ActivityIcon } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

type Tab = "neighborhoods" | "traffic" | "transit" | "places";
type TimeOfDay = "morning" | "midday" | "evening" | "night" | "now";

// Mock wards positioned on a stylized SVG canvas (1000x600 viewBox)
const WARDS = [
  { id: "centretown",   name: "Centretown",   x: 520, y: 320, r: 38, issues: 2, hot: false },
  { id: "byward",       name: "ByWard",       x: 600, y: 280, r: 32, issues: 1, hot: false },
  { id: "glebe",        name: "Glebe",        x: 500, y: 380, r: 34, issues: 0, hot: false },
  { id: "hintonburg",   name: "Hintonburg",   x: 420, y: 330, r: 36, issues: 3, hot: true  },
  { id: "westboro",     name: "Westboro",     x: 360, y: 320, r: 38, issues: 1, hot: false },
  { id: "vanier",       name: "Vanier",       x: 640, y: 320, r: 36, issues: 2, hot: false },
  { id: "sandyhill",    name: "Sandy Hill",   x: 620, y: 340, r: 26, issues: 0, hot: false },
  { id: "altavista",    name: "Alta Vista",   x: 600, y: 420, r: 44, issues: 4, hot: true  },
  { id: "oldottsouth",  name: "Old Ottawa S.",x: 540, y: 430, r: 32, issues: 1, hot: false },
  { id: "littleitaly",  name: "Little Italy", x: 470, y: 380, r: 28, issues: 0, hot: false },
  { id: "orleans",      name: "Orléans",      x: 820, y: 280, r: 56, issues: 2, hot: false },
  { id: "kanata",       name: "Kanata",       x: 180, y: 310, r: 60, issues: 1, hot: false },
  { id: "barrhaven",    name: "Barrhaven",    x: 370, y: 470, r: 52, issues: 2, hot: false },
  { id: "nepean",       name: "Nepean",       x: 300, y: 390, r: 44, issues: 1, hot: false },
];

const ROADS: { id: string; name: string; d: string; flow: "free" | "slow" | "jam" }[] = [
  { id: "417e", name: "417 East",  d: "M 80 360 Q 400 330 920 320", flow: "jam" },
  { id: "417w", name: "417 West",  d: "M 80 380 Q 400 360 920 360", flow: "slow" },
  { id: "416",  name: "416",       d: "M 320 600 Q 330 440 360 340", flow: "free" },
  { id: "bronson", name: "Bronson", d: "M 500 200 L 500 560", flow: "slow" },
  { id: "bank", name: "Bank",      d: "M 540 200 L 540 560", flow: "free" },
  { id: "carling", name: "Carling", d: "M 80 410 L 700 400", flow: "slow" },
  { id: "huntclub", name: "Hunt Club", d: "M 200 500 L 800 490", flow: "free" },
  { id: "stlaurent", name: "St-Laurent", d: "M 700 200 L 700 560", flow: "slow" },
];

const BRIDGES = [
  { id: "macdonald", name: "Macdonald-Cartier", x: 620, y: 240, status: "ok" },
  { id: "portage",   name: "Portage",           x: 540, y: 230, status: "ok" },
  { id: "chaudiere", name: "Chaudière",         x: 480, y: 235, status: "slow" },
  { id: "champlain", name: "Champlain",         x: 360, y: 235, status: "ok" },
  { id: "alexandra", name: "Alexandra",         x: 600, y: 235, status: "ok" },
];

// O-Train lines (mock)
const LINE1: [number, number][] = [[100,310],[260,320],[400,330],[500,340],[600,330],[750,300],[900,290]];
const LINE2: [number, number][] = [[500,200],[500,340],[490,440],[470,540]];
const STATIONS = [
  { name: "Tunney's Pasture", x: 400, y: 330, line: 1, status: "ok" },
  { name: "Bayview",          x: 470, y: 335, line: 1, status: "delay" },
  { name: "Pimisi",            x: 520, y: 340, line: 1, status: "ok" },
  { name: "Lyon",              x: 545, y: 340, line: 1, status: "ok" },
  { name: "Parliament",        x: 575, y: 338, line: 1, status: "ok" },
  { name: "Rideau",            x: 605, y: 335, line: 1, status: "ok" },
  { name: "uOttawa",           x: 640, y: 335, line: 1, status: "ok" },
  { name: "Hurdman",           x: 700, y: 320, line: 1, status: "closed" },
  { name: "Carling",           x: 500, y: 395, line: 2, status: "ok" },
  { name: "Carleton",          x: 495, y: 440, line: 2, status: "ok" },
  { name: "Mooney's Bay",      x: 480, y: 485, line: 2, status: "ok" },
];

const PLACES = [
  { id: "p1", name: "Aksim Sweet Bakes", x: 595, y: 295, cat: "food",    note: "Critic's pick" },
  { id: "p2", name: "Equator Coffee",    x: 410, y: 335, cat: "food",    note: "Local roaster" },
  { id: "p3", name: "Art-Is-In Bakery",  x: 425, y: 320, cat: "food",    note: "Hintonburg" },
  { id: "p4", name: "Shawarma Palace",   x: 610, y: 285, cat: "food",    note: "Late night" },
  { id: "p5", name: "National Gallery",  x: 620, y: 265, cat: "culture", note: "Free Thursdays" },
  { id: "p6", name: "NAC",               x: 595, y: 320, cat: "culture", note: "Bilingual" },
  { id: "p7", name: "Major's Hill Park", x: 615, y: 270, cat: "park",    note: "River views" },
  { id: "p8", name: "Dow's Lake",        x: 500, y: 400, cat: "park",    note: "Skate winter" },
  { id: "p9", name: "Service Ontario",   x: 530, y: 360, cat: "service", note: "ID renewals" },
  { id: "p10", name: "VeloGo Station",   x: 555, y: 325, cat: "bike",    note: "12 bikes" },
];

const FLOW_COLOR: Record<string, string> = { free: "#1f9d55", slow: "#d97706", jam: "#b91c1c" };
const STATION_COLOR: Record<string, string> = { ok: "#1f9d55", delay: "#d97706", closed: "#b91c1c" };

export function OttawaLivePanel() {
  const { locale } = useLocale();
  const [tab, setTab] = useState<Tab>("neighborhoods");
  const [time, setTime] = useState<TimeOfDay>("now");
  const [weatherImpact, setWeatherImpact] = useState(false);
  const [selectedWard, setSelectedWard] = useState(WARDS[3]);
  const [placeCats, setPlaceCats] = useState<Record<string, boolean>>({
    food: true, culture: true, park: true, service: false, bike: false,
  });
  const [selectedPlace, setSelectedPlace] = useState<typeof PLACES[number] | null>(null);

  const adjustedFlow = useMemo(() => {
    if (!weatherImpact && time === "now") return ROADS;
    return ROADS.map(r => {
      let f = r.flow;
      if (time === "morning" || time === "evening") f = f === "free" ? "slow" : "jam";
      if (weatherImpact) f = "jam";
      return { ...r, flow: f as any };
    });
  }, [time, weatherImpact]);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "neighborhoods", label: locale === "fr" ? "Quartiers" : "Neighborhoods", icon: MapPin },
    { key: "traffic",       label: locale === "fr" ? "Circulation" : "Live traffic", icon: Car },
    { key: "transit",       label: "Transit",                                        icon: Train },
    { key: "places",        label: locale === "fr" ? "Lieux" : "Places",             icon: Utensils },
  ];

  const timeBtns: { key: TimeOfDay; label: string; icon: any }[] = [
    { key: "morning", label: locale === "fr" ? "Matin" : "Morning",     icon: Sunrise },
    { key: "midday",  label: locale === "fr" ? "Midi"  : "Midday",      icon: Sun },
    { key: "evening", label: locale === "fr" ? "Soir"  : "Evening",     icon: Sunset },
    { key: "night",   label: locale === "fr" ? "Nuit"  : "Late night",  icon: Moon },
  ];

  return (
    <section className="bg-card border border-rule">
      {/* Tabs */}
      <div className="flex flex-wrap items-stretch justify-between gap-2 border-b border-rule px-4 pt-3">
        <div className="flex flex-wrap gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${
                tab === key ? "border-civic-red text-civic-red" : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 pb-2">
          {timeBtns.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTime(key)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border ${time === key ? "bg-ink text-paper border-ink" : "border-rule text-muted-foreground hover:text-ink"}`}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
          <button
            onClick={() => setTime("now")}
            className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border ${time === "now" ? "bg-civic-red text-paper border-civic-red" : "border-rule text-muted-foreground hover:text-ink"}`}
          >
            <span className="ticker-dot" /> {locale === "fr" ? "Live" : "Live now"}
          </button>
          <label className="inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border border-rule cursor-pointer hover:text-ink">
            <input type="checkbox" checked={weatherImpact} onChange={e => setWeatherImpact(e.target.checked)} className="accent-civic-red" />
            <CloudSnow className="h-3 w-3" /> {locale === "fr" ? "Météo" : "Weather"}
          </label>
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 relative bg-[#f3efe6]">
          <svg viewBox="0 0 1000 600" className="w-full h-[460px] lg:h-[520px]">
            {/* River */}
            <path d="M 0 230 Q 250 200 500 230 T 1000 220 L 1000 250 Q 750 270 500 250 T 0 260 Z" fill="#bcd8e6" />
            <text x="120" y="220" fontFamily="Georgia,serif" fontStyle="italic" fontSize="14" fill="#4b6f80">Ottawa River</text>

            {/* Greenbelt swoosh */}
            <path d="M 60 500 Q 500 540 940 500" fill="none" stroke="#9bbf8f" strokeWidth="22" strokeLinecap="round" opacity="0.5" />

            {/* TAB: Neighborhoods */}
            {tab === "neighborhoods" && WARDS.map(w => (
              <g key={w.id} onClick={() => setSelectedWard(w)} style={{ cursor: "pointer" }}>
                <circle cx={w.x} cy={w.y} r={w.r}
                  fill={selectedWard.id === w.id ? "#b91c1c" : w.hot ? "#fbbf24" : "#e8e2d2"}
                  stroke="#3a3a3a" strokeWidth={selectedWard.id === w.id ? 2 : 1}
                  opacity={selectedWard.id === w.id ? 0.9 : 0.7}
                  className={w.hot ? "animate-pulse" : ""}
                />
                <text x={w.x} y={w.y + 4} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="10" fontWeight="600" fill={selectedWard.id === w.id ? "#fff" : "#1a1a1a"}>{w.name}</text>
              </g>
            ))}

            {/* TAB: Traffic */}
            {tab === "traffic" && (
              <>
                {adjustedFlow.map(r => (
                  <g key={r.id}>
                    <path d={r.d} stroke={FLOW_COLOR[r.flow]} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
                  </g>
                ))}
                {BRIDGES.map(b => (
                  <g key={b.id}>
                    <rect x={b.x - 18} y={b.y - 6} width="36" height="12" fill={b.status === "ok" ? "#1f9d55" : "#d97706"} stroke="#1a1a1a" />
                    <text x={b.x} y={b.y + 22} textAnchor="middle" fontSize="9" fontFamily="Inter,sans-serif" fill="#1a1a1a">{b.name}</text>
                  </g>
                ))}
                {/* Incidents */}
                <g className="animate-pulse">
                  <circle cx={500} cy={355} r="8" fill="#b91c1c" />
                  <circle cx={500} cy={355} r="14" fill="none" stroke="#b91c1c" />
                </g>
                <g className="animate-pulse">
                  <circle cx={750} cy={300} r="8" fill="#d97706" />
                </g>
              </>
            )}

            {/* TAB: Transit */}
            {tab === "transit" && (
              <>
                <polyline points={LINE1.map(p => p.join(",")).join(" ")} stroke="#b91c1c" strokeWidth="5" fill="none" strokeLinecap="round" />
                <polyline points={LINE2.map(p => p.join(",")).join(" ")} stroke="#1f9d55" strokeWidth="5" fill="none" strokeLinecap="round" />
                {STATIONS.map(s => (
                  <g key={s.name}>
                    <circle cx={s.x} cy={s.y} r="6" fill={STATION_COLOR[s.status]} stroke="#1a1a1a" strokeWidth="1.5" />
                    <text x={s.x} y={s.y - 10} textAnchor="middle" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="600" fill="#1a1a1a">{s.name}</text>
                  </g>
                ))}
              </>
            )}

            {/* TAB: Places */}
            {tab === "places" && PLACES.filter(p => placeCats[p.cat]).map(p => (
              <g key={p.id} onClick={() => setSelectedPlace(p)} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r="8" fill={selectedPlace?.id === p.id ? "#b91c1c" : "#1a1a1a"} stroke="#fff" strokeWidth="2" />
                <text x={p.x + 12} y={p.y + 4} fontSize="10" fontFamily="Inter,sans-serif" fontWeight="600" fill="#1a1a1a">{p.name}</text>
              </g>
            ))}
          </svg>

          {/* Place filters */}
          {tab === "places" && (
            <div className="absolute top-3 left-3 bg-paper/95 border border-rule p-2 flex flex-wrap gap-1 max-w-[280px]">
              {(["food","culture","park","service","bike"] as const).map(c => (
                <label key={c} className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 border cursor-pointer ${placeCats[c] ? "bg-ink text-paper border-ink" : "border-rule text-muted-foreground"}`}>
                  <input type="checkbox" className="hidden" checked={placeCats[c]} onChange={e => setPlaceCats(s => ({ ...s, [c]: e.target.checked }))} />
                  {c}
                </label>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-paper/95 border border-rule px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {tab === "traffic" && <span>🟢 free · 🟡 slow · 🔴 jam</span>}
            {tab === "transit" && <span>● Line 1 Confederation · ● Line 2 Trillium</span>}
            {tab === "neighborhoods" && <span>{locale === "fr" ? "Cliquez un quartier" : "Click a ward"}</span>}
            {tab === "places" && <span>{locale === "fr" ? "Cliquez un point" : "Click a pin"}</span>}
          </div>
        </div>

        {/* Side panel */}
        <aside className="p-4 border-t lg:border-t-0 lg:border-l border-rule min-h-[260px]">
          {tab === "neighborhoods" && (
            <div>
              <div className="kicker text-civic-red">{locale === "fr" ? "Quartier sélectionné" : "Selected ward"}</div>
              <h3 className="font-display text-2xl leading-tight mt-1">{selectedWard.name}</h3>
              <p className="text-sm font-serif text-muted-foreground mt-1">
                {selectedWard.issues} {locale === "fr" ? "enjeux ouverts" : "open issues"} ·{" "}
                {locale === "fr" ? "3 récits cette semaine" : "3 stories this week"}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-start gap-2"><ActivityIcon className="h-3.5 w-3.5 mt-1 text-civic-red" /> {locale === "fr" ? "Nid-de-poule signalé, Wellington O." : "Pothole reported, Wellington W."}</li>
                <li className="flex items-start gap-2"><ActivityIcon className="h-3.5 w-3.5 mt-1 text-civic-red" /> {locale === "fr" ? "Marché de quartier samedi" : "Neighborhood market Saturday"}</li>
                <li className="flex items-start gap-2"><ActivityIcon className="h-3.5 w-3.5 mt-1 text-civic-red" /> {locale === "fr" ? "Nouveau passage piéton demandé" : "New crosswalk requested"}</li>
              </ul>
              <a href={`/neighborhoods/${selectedWard.id}`} className="inline-block mt-4 text-[11px] uppercase tracking-wider font-semibold border-b border-ink hover:text-civic-red">
                {locale === "fr" ? "Voir tout le quartier" : "View entire ward"} →
              </a>
            </div>
          )}
          {tab === "traffic" && (
            <div>
              <div className="kicker text-civic-red">{locale === "fr" ? "Incidents en direct" : "Live incidents"}</div>
              <h3 className="font-display text-xl leading-tight mt-1">{locale === "fr" ? "417 Ouest — ralentissement" : "417 West — slowdown"}</h3>
              <p className="text-sm font-serif text-muted-foreground mt-1">{locale === "fr" ? "Près de la sortie Maitland · délai estimé 12 min" : "Near Maitland exit · est. delay 12 min"}</p>
              <hr className="my-3 border-rule" />
              <p className="text-sm">{locale === "fr" ? "Pont Chaudière — circulation lente" : "Chaudière Bridge — slow traffic"}</p>
              <p className="text-xs text-muted-foreground mt-1 font-serif italic">{locale === "fr" ? "Source : Ville d'Ottawa, mise à jour 5 min" : "Source: City of Ottawa, refreshed 5 min ago"}</p>
            </div>
          )}
          {tab === "transit" && (
            <div>
              <div className="kicker text-civic-red">O-Train</div>
              <h3 className="font-display text-xl leading-tight mt-1">Line 1 · {locale === "fr" ? "Perturbation" : "Disruption"}</h3>
              <p className="text-sm font-serif text-muted-foreground mt-1">{locale === "fr" ? "Hurdman fermé temporairement. Autobus de remplacement aux 7–9 min." : "Hurdman briefly closed. Replacement buses every 7–9 min."}</p>
              <hr className="my-3 border-rule" />
              <p className="text-sm">Line 2 · {locale === "fr" ? "À l'heure" : "On time"}</p>
              <p className="text-xs text-muted-foreground mt-1 font-serif italic">{locale === "fr" ? "Prochain départ Bayview : 4 min" : "Next at Bayview: 4 min"}</p>
            </div>
          )}
          {tab === "places" && (
            <div>
              {selectedPlace ? (
                <>
                  <div className="kicker text-civic-red">{locale === "fr" ? "Lieu" : "Place"}</div>
                  <h3 className="font-display text-xl leading-tight mt-1">{selectedPlace.name}</h3>
                  <p className="text-sm font-serif text-muted-foreground mt-1">{selectedPlace.note}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-serif italic">{locale === "fr" ? "Lié à un article de notre rédaction" : "Linked to a story from our newsroom"}</p>
                  <button className="mt-3 inline-block text-[11px] uppercase tracking-wider font-semibold border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper">{locale === "fr" ? "Lire notre critique" : "Read our review"}</button>
                </>
              ) : (
                <>
                  <div className="kicker text-civic-red">{locale === "fr" ? "Découvrir" : "Discover"}</div>
                  <p className="text-sm font-serif text-muted-foreground mt-2">{locale === "fr" ? "Sélectionnez un point sur la carte. Les données proviennent de Google Maps Places et de nos critiques." : "Select a pin on the map. Data combines Google Maps Places with our editorial reviews."}</p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
