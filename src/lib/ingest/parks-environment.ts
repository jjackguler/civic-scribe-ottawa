import type { MapSignal } from "@/types/database";

const ITEMS = [
  { title: "Rideau Canal Skateway — section closed for ice maintenance", summary: "NCC crews resurfacing between Pretoria and Bank.", source: "National Capital Commission", source_url: "https://ncc-ccn.gc.ca", lat: 45.4112, lng: -75.6928, n: "Centretown", urgency: "low" as const },
  { title: "Flood watch: Rideau River near Manotick", summary: "Conservation authority monitoring rising water levels.", source: "Rideau Valley Conservation", source_url: "https://www.rvca.ca", lat: 45.2230, lng: -75.6830, n: "Manotick", urgency: "high" as const },
  { title: "Wildfire smoke advisory in effect", summary: "Reduced air quality; sensitive groups limit outdoor activity.", source: "Environment Canada", source_url: "https://weather.gc.ca", lat: 45.4215, lng: -75.6972, n: "Downtown", urgency: "high" as const },
  { title: "Gatineau Park — Pink Lake trail closed for restoration", summary: "Habitat protection work through April.", source: "National Capital Commission", source_url: "https://ncc-ccn.gc.ca", lat: 45.4970, lng: -75.8500, n: "Rural Ottawa", urgency: "low" as const },
];

export function generateParksEnvironmentSignals(): MapSignal[] {
  const now = Date.now();
  return ITEMS.map((it, i) => ({
    id: `parks-${i}`,
    type: "parks-alert",
    title: it.title,
    summary: it.summary,
    lat: it.lat, lng: it.lng,
    neighborhood: it.n,
    urgency: it.urgency,
    verification: "official-source",
    source_type: "official",
    source_name: it.source,
    source_url: it.source_url,
    source_group: "parks-environment",
    safety_classifications: ["weather_or_environment_alert"],
    publish_status: "auto_published",
    created_at: new Date(now - i * 1000 * 60 * 90).toISOString(),
    updated_at: new Date(now - i * 1000 * 60 * 90).toISOString(),
    language: "both",
  }));
}
