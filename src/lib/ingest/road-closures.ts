import type { MapSignal } from "@/types/database";

const CLOSURES = [
  { title: "Hwy 417 EB closed at Nicholas — collision", summary: "Use Vanier Parkway as detour.", source: "Ontario 511", url: "https://511on.ca", lat: 45.4215, lng: -75.6750, n: "Downtown", urgency: "high" as const },
  { title: "Bank Street lane closure — water main repair", summary: "One lane open in each direction through Friday.", source: "City of Ottawa", url: "https://ottawa.ca/en/news", lat: 45.4015, lng: -75.6890, n: "Glebe", urgency: "medium" as const },
  { title: "Portage Bridge — scheduled lane reduction", summary: "Federal crews; allow extra time at peak hours.", source: "NCC", url: "https://ncc-ccn.gc.ca", lat: 45.4242, lng: -75.7115, n: "Downtown", urgency: "medium" as const },
  { title: "Hunt Club Rd EB — signal repair", summary: "Expect short delays near Riverside.", source: "City of Ottawa", url: "https://ottawa.ca/en/news", lat: 45.3700, lng: -75.6620, n: "Alta Vista", urgency: "low" as const },
];

export function generateRoadClosureSignals(): MapSignal[] {
  const now = Date.now();
  return CLOSURES.map((c, i) => ({
    id: `road-${i}`,
    type: "road-closure",
    title: c.title,
    summary: c.summary,
    lat: c.lat, lng: c.lng,
    neighborhood: c.n,
    urgency: c.urgency,
    verification: "official-source",
    source_type: "official",
    source_name: c.source,
    source_url: c.url,
    source_group: "government-roads",
    safety_classifications: ["traffic_or_closure"],
    publish_status: "auto_published",
    created_at: new Date(now - i * 1000 * 60 * 30).toISOString(),
    updated_at: new Date(now - i * 1000 * 60 * 30).toISOString(),
    language: "both",
  }));
}
