import type { MapSignal, SignalType } from "@/types/database";

// 28 Ottawa neighborhoods with approximate center coords
export const OTTAWA_NEIGHBORHOODS: { name: string; lat: number; lng: number; group: "urban" | "inner" | "outer" }[] = [
  // Urban core
  { name: "Downtown",          lat: 45.4215, lng: -75.6972, group: "urban" },
  { name: "Centretown",        lat: 45.4112, lng: -75.6981, group: "urban" },
  { name: "ByWard Market",     lat: 45.4286, lng: -75.6912, group: "urban" },
  { name: "Lowertown",         lat: 45.4310, lng: -75.6880, group: "urban" },
  { name: "Sandy Hill",        lat: 45.4252, lng: -75.6810, group: "urban" },
  { name: "Chinatown",         lat: 45.4118, lng: -75.7100, group: "urban" },
  { name: "Little Italy",      lat: 45.4030, lng: -75.7140, group: "urban" },
  { name: "Glebe",             lat: 45.4015, lng: -75.6890, group: "urban" },
  { name: "Old Ottawa South",  lat: 45.3930, lng: -75.6850, group: "urban" },
  { name: "Old Ottawa East",   lat: 45.4060, lng: -75.6770, group: "urban" },
  // Inner suburbs
  { name: "Westboro",          lat: 45.3939, lng: -75.7530, group: "inner" },
  { name: "Hintonburg",        lat: 45.4030, lng: -75.7280, group: "inner" },
  { name: "Mechanicsville",    lat: 45.4060, lng: -75.7380, group: "inner" },
  { name: "Wellington West",   lat: 45.4010, lng: -75.7340, group: "inner" },
  { name: "Vanier",            lat: 45.4360, lng: -75.6620, group: "inner" },
  { name: "Overbrook",         lat: 45.4350, lng: -75.6450, group: "inner" },
  { name: "New Edinburgh",     lat: 45.4430, lng: -75.6790, group: "inner" },
  { name: "Rockcliffe Park",   lat: 45.4520, lng: -75.6740, group: "inner" },
  // Outer
  { name: "Kanata",            lat: 45.3088, lng: -75.8990, group: "outer" },
  { name: "Stittsville",       lat: 45.2620, lng: -75.9170, group: "outer" },
  { name: "Barrhaven",         lat: 45.2733, lng: -75.7355, group: "outer" },
  { name: "Nepean",            lat: 45.3400, lng: -75.7400, group: "outer" },
  { name: "Orleans",           lat: 45.4651, lng: -75.5126, group: "outer" },
  { name: "Gloucester",        lat: 45.4180, lng: -75.5800, group: "outer" },
  { name: "Alta Vista",        lat: 45.3870, lng: -75.6620, group: "outer" },
  { name: "Carlington",        lat: 45.3820, lng: -75.7390, group: "outer" },
  { name: "Manotick",          lat: 45.2230, lng: -75.6830, group: "outer" },
  { name: "Rural Ottawa",      lat: 45.2000, lng: -75.5500, group: "outer" },
];

const TYPES: SignalType[] = [
  "citizen-report", "breaking-news", "traffic", "transit", "weather-alert",
  "food", "sports", "event", "public-safety", "good-news", "fact-check",
  "unresolved", "solved",
];

const SAMPLE_TITLES: Partial<Record<SignalType, string[]>> = {
  "citizen-report": ["Pothole on Bank St near Fifth", "Broken streetlight, dim crosswalk", "Graffiti tagged overnight", "Missing recycling pickup"],
  "breaking-news": ["Council passes new transit funding plan", "Major water main break downtown", "Premier visits Ottawa city hall"],
  "traffic": ["Hwy 417 EB slowdown — 15 min", "Bank St lane closure, construction", "Bridge backlog into Gatineau"],
  "transit": ["O-Train Line 1 delayed 8 min", "Route 88 detour via Carling", "OC Transpo service alert: Hurdman"],
  "weather-alert": ["Freezing rain warning until 6pm", "Wind advisory along Ottawa River", "Snow squall watch Kanata"],
  "food": ["Taksim Sweets — fresh baklava drop", "Equator Coffee — new Westboro pop-up", "Art-Is-In Bakery weekend hours"],
  "sports": ["Senators home game tonight 7pm", "RedBlacks training open practice", "67's playoff push, Game 3 sold out"],
  "event": ["Glebe Sparks weekend market", "ByWard Market evening concert", "Rideau Canal skateway opens"],
  "public-safety": ["Police investigation, avoid area", "Smoke advisory near industrial park", "Crosswalk safety concern reported"],
  "good-news": ["Library Lego club hits 200 kids", "Community fridge restocked", "Neighbour fundraiser exceeds goal"],
  "fact-check": ["Claim about transit fares — MISLEADING", "Viral pothole photo — UNRELATED location", "Snow removal rumour — FALSE"],
  "unresolved": ["Bus stop bench broken 6 weeks", "Sidewalk ice complaint pending", "Park playground equipment damaged"],
  "solved": ["Pothole filled by City crew", "Streetlight repaired Tues", "Crosswalk paint refreshed"],
};

const URGENCY_BY_TYPE: Partial<Record<SignalType, MapSignal["urgency"]>> = {
  "breaking-news": "critical", "public-safety": "critical",
  "traffic": "high", "transit": "high", "weather-alert": "high",
  "fact-check": "medium", "unresolved": "medium", "event": "medium",
  "citizen-report": "low", "food": "low", "sports": "low",
  "good-news": "low", "solved": "low",
};

const VERIFICATION_BY_TYPE: Partial<Record<SignalType, MapSignal["verification"]>> = {
  "breaking-news": "developing", "public-safety": "official-source",
  "traffic": "official-source", "transit": "official-source",
  "weather-alert": "official-source", "fact-check": "editor-reviewed",
  "event": "verified", "food": "verified", "sports": "verified",
  "good-news": "verified", "citizen-report": "community-submitted",
  "unresolved": "community-submitted", "solved": "verified",
};

// Seeded RNG so the same set renders consistently
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

export function generateMockSignals(count = 120): MapSignal[] {
  const rng = seeded(2026_05_25);
  const out: MapSignal[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const n = OTTAWA_NEIGHBORHOODS[Math.floor(rng() * OTTAWA_NEIGHBORHOODS.length)];
    const type = TYPES[Math.floor(rng() * TYPES.length)];
    const titles = SAMPLE_TITLES[type];
    const title = titles[Math.floor(rng() * titles.length)];
    const jitter = () => (rng() - 0.5) * 0.025;
    const created = new Date(now - Math.floor(rng() * 1000 * 60 * 60 * 24 * 3)).toISOString();
    out.push({
      id: `sig-${i}`,
      type,
      title,
      summary: `${title} — reported in ${n.name}. ${type === "fact-check" ? "Reviewed by editorial team." : "Updates as we learn more."}`,
      lat: n.lat + jitter(),
      lng: n.lng + jitter(),
      neighborhood: n.name,
      urgency: URGENCY_BY_TYPE[type],
      verification: VERIFICATION_BY_TYPE[type],
      source_type: type === "citizen-report" || type === "unresolved" ? "citizen" :
                   type === "fact-check" ? "editorial" :
                   type === "traffic" || type === "transit" || type === "weather-alert" || type === "public-safety" ? "official" : "editorial",
      source_name: type === "transit" ? "OC Transpo" :
                   type === "traffic" ? "City of Ottawa Traffic" :
                   type === "weather-alert" ? "Environment Canada" :
                   type === "breaking-news" ? "CBC Ottawa" : undefined,
      created_at: created,
      updated_at: created,
      language: "both",
    });
  }
  return out;
}
