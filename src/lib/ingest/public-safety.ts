import type { MapSignal } from "@/types/database";
import { OTTAWA_NEIGHBORHOODS } from "@/lib/map-signals";
import { classify, shouldHold, restrainedRewrite } from "@/lib/safety-classification";

const RAW_FEED: { title: string; summary: string; source: string; source_url?: string }[] = [
  // Routine — safe to auto-publish
  { title: "Traffic advisory: lane closures on Bank Street through Sunday", summary: "City crews working overnight; expect detours via O'Connor.", source: "Ottawa Police · Traffic", source_url: "https://www.ottawapolice.ca" },
  { title: "Product recall: infant rocker recalled by Health Canada", summary: "Recall covers units sold 2023–2025. Return for full refund.", source: "Health Canada recalls", source_url: "https://recalls-rappels.canada.ca" },
  // Sensitive — must HOLD
  { title: "Homicide investigation underway in west-end neighbourhood", summary: "Police on scene; no suspect information released.", source: "Ottawa Police", source_url: "https://www.ottawapolice.ca" },
  { title: "Missing youth — public assistance requested", summary: "Police searching for a teen last seen Tuesday.", source: "Ottawa Police", source_url: "https://www.ottawapolice.ca" },
  { title: "Stabbing reported overnight; suspect at large", summary: "Investigators canvassing area for witnesses.", source: "Ottawa Police", source_url: "https://www.ottawapolice.ca" },
  { title: "Domestic violence charges laid following weekend response", summary: "Court matters ongoing; details withheld.", source: "Ottawa Police", source_url: "https://www.ottawapolice.ca" },
];

export function generatePublicSafetySignals(): MapSignal[] {
  const out: MapSignal[] = [];
  const now = Date.now();
  RAW_FEED.forEach((item, i) => {
    const n = OTTAWA_NEIGHBORHOODS[(i * 7) % OTTAWA_NEIGHBORHOODS.length];
    const tags = classify(`${item.title} ${item.summary}`);
    const hold = shouldHold(tags);
    const display = hold ? restrainedRewrite(item.title, n.name) : item.title;
    out.push({
      id: `ps-${i}`,
      type: "public-safety",
      title: display,
      summary: hold
        ? "Sensitive incident under review. We are withholding identifying details pending editor review and verification."
        : item.summary,
      lat: n.lat + (Math.random() - 0.5) * 0.01,
      lng: n.lng + (Math.random() - 0.5) * 0.01,
      neighborhood: n.name,
      urgency: hold ? "high" : "medium",
      verification: "official-source",
      source_type: "official",
      source_name: item.source,
      // Per safety rule 4/10: never link to original if it might expose identifying details.
      source_url: hold ? undefined : item.source_url,
      source_group: "public-safety",
      safety_classifications: tags,
      publish_status: hold ? "hold_for_editor" : "auto_published",
      editor_notes: hold ? "Sensitive public-safety item. Editorial review required before publication." : undefined,
      created_at: new Date(now - i * 1000 * 60 * 45).toISOString(),
      updated_at: new Date(now - i * 1000 * 60 * 45).toISOString(),
      language: "both",
    });
  });
  return out;
}

export function publicSafetyPublished(signals: MapSignal[]) {
  return signals.filter(s => s.publish_status !== "hold_for_editor");
}
export function publicSafetyHeld(signals: MapSignal[]) {
  return signals.filter(s => s.publish_status === "hold_for_editor");
}
