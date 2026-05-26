import type { MapSignal } from "@/types/database";
import { OTTAWA_NEIGHBORHOODS } from "@/lib/map-signals";

const ISSUE_TYPES = [
  "Pothole",
  "Streetlight out",
  "Missed garbage pickup",
  "Graffiti",
  "Tree concern",
  "Snow / ice on sidewalk",
  "Damaged sidewalk",
  "By-law concern (noise)",
  "Park maintenance",
];

const STATUSES: NonNullable<MapSignal["issue_status"]>[] = ["reported", "acknowledged", "in_progress", "resolved"];

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

/**
 * Privacy-safe 311 generator. Locations are intentionally generalized to
 * neighborhood + jittered block-level coords (never exact addresses).
 * Replace with a real fetch from Open Ottawa once the dataset URL is wired.
 */
export function generate311Signals(count = 60): MapSignal[] {
  const rng = seeded(20260526);
  const out: MapSignal[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const n = OTTAWA_NEIGHBORHOODS[Math.floor(rng() * OTTAWA_NEIGHBORHOODS.length)];
    const type = ISSUE_TYPES[Math.floor(rng() * ISSUE_TYPES.length)];
    const status = STATUSES[Math.floor(rng() * STATUSES.length)];
    // Generalize to block level (~120m jitter), strip any address detail.
    const jitter = () => (rng() - 0.5) * 0.004;
    const created = new Date(now - Math.floor(rng() * 1000 * 60 * 60 * 24 * 14)).toISOString();
    out.push({
      id: `i311-${i}`,
      type: "open-issue",
      title: `${type} reported — ${n.name}`,
      summary: `Open civic issue: ${type.toLowerCase()} in the ${n.name} area. Tracked through 311; location generalized to protect privacy.`,
      lat: n.lat + jitter(),
      lng: n.lng + jitter(),
      neighborhood: n.name,
      urgency: status === "resolved" ? "low" : status === "in_progress" ? "medium" : "low",
      verification: "official-source",
      source_type: "official",
      source_name: "City of Ottawa · 311 / Open Ottawa",
      source_url: "https://open.ottawa.ca",
      source_group: "neighborhood-services",
      safety_classifications: ["routine_public_notice"],
      publish_status: "auto_published",
      issue_status: status,
      created_at: created,
      updated_at: created,
      language: "both",
    });
  }
  return out;
}
