import type { SafetyClassification } from "@/types/database";

const PATTERNS: { re: RegExp; tag: SafetyClassification }[] = [
  { re: /\b(homicide|murder|killed|fatal|dead|deceased)\b/i, tag: "homicide_or_death" },
  { re: /\b(sexual assault|sex assault|rape|sexual violence|indecent)\b/i, tag: "sexual_violence" },
  { re: /\b(domestic|intimate partner|spousal)\b/i, tag: "domestic_violence" },
  { re: /\b(missing|amber alert|silver alert)\b/i, tag: "missing_person" },
  { re: /\b(stabbing|shooting|assault|robbery|abduction|kidnap|arson)\b/i, tag: "violent_crime" },
  { re: /\b(child|youth|minor|teen|student|toddler|infant)\b/i, tag: "involves_minor" },
  { re: /\b(victim|family of)\b/i, tag: "involves_victim" },
  { re: /\b(suspect|accused|charged|arrested)\b/i, tag: "involves_suspect" },
  { re: /\b(investigation|investigators|under investigation)\b/i, tag: "active_investigation" },
  { re: /\b(publication ban|court order)\b/i, tag: "court_or_publication_ban_risk" },
  { re: /\b(road closure|lane closed|detour|construction|closed to traffic)\b/i, tag: "traffic_or_closure" },
  { re: /\b(boil water|advisory|public health|recall|outbreak|measles)\b/i, tag: "public_health_alert" },
  { re: /\b(flood|wildfire|smoke|tornado|severe weather|freezing rain|snow squall|heat warning)\b/i, tag: "weather_or_environment_alert" },
  { re: /\b(school board|school closure|schools closed)\b/i, tag: "school_closure_official" },
];

const HOLD_TAGS = new Set<SafetyClassification>([
  "police_release_sensitive", "involves_minor", "involves_victim", "involves_suspect",
  "violent_crime", "homicide_or_death", "sexual_violence", "domestic_violence",
  "missing_person", "active_investigation", "court_or_publication_ban_risk",
]);

export function classify(text: string): SafetyClassification[] {
  const tags = new Set<SafetyClassification>();
  for (const { re, tag } of PATTERNS) if (re.test(text)) tags.add(tag);
  if (tags.size === 0) tags.add("routine_public_notice");
  return Array.from(tags);
}

export function shouldHold(tags: SafetyClassification[]): boolean {
  return tags.some(t => HOLD_TAGS.has(t));
}

/**
 * Restrained civic rewrite — strip sensational phrasing for public display.
 * Editors can override; this only guards auto-publish paths.
 */
export function restrainedRewrite(title: string, neighborhood?: string): string {
  const area = neighborhood ? ` in ${neighborhood}` : "";
  if (/homicide|murder|killed|fatal/i.test(title))
    return `Police investigating serious incident${area}; residents asked to avoid area`;
  if (/stabbing|shooting|assault/i.test(title))
    return `Police responding to reported incident${area}; investigation underway`;
  if (/missing/i.test(title))
    return `Police asking for public assistance${area} — details pending editor review`;
  if (/sexual|domestic/i.test(title))
    return `Police investigating sensitive incident${area}; details withheld pending review`;
  return title;
}
