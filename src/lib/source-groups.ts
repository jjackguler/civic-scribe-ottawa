import type { SourceConfig } from "@/types/database";

export const ALLOW_PAID_APIS = false;

export type GroupKey =
  | "neighborhood-services"
  | "public-safety"
  | "parks-environment"
  | "government-roads"
  | "education"
  | "museums-culture"
  | "health"
  | "tourism"
  | "sports"
  | "community";

export const GROUP_META: Record<GroupKey, { label: string; color: string; refresh: number }> = {
  "neighborhood-services": { label: "Neighborhood services (311)", color: "var(--solution)", refresh: 30 },
  "public-safety":         { label: "Public safety", color: "var(--civic-red)", refresh: 10 },
  "parks-environment":     { label: "Parks & environment", color: "var(--solution)", refresh: 30 },
  "government-roads":      { label: "Government & roads", color: "var(--river)", refresh: 15 },
  "education":             { label: "Education", color: "var(--highlight)", refresh: 30 },
  "museums-culture":       { label: "Museums & culture", color: "var(--highlight)", refresh: 60 },
  "health":                { label: "Health", color: "var(--river)", refresh: 30 },
  "tourism":               { label: "Tourism", color: "var(--solution)", refresh: 240 },
  "sports":                { label: "Sports", color: "var(--river)", refresh: 30 },
  "community":             { label: "Community", color: "var(--highlight)", refresh: 60 },
};

// Phase 1–4 sources only (additive). Later phases gated until owner approves.
export const SOURCE_REGISTRY: SourceConfig[] = [
  // 1. Neighborhood / 311
  { id: "ott-311",     group: "neighborhood-services", name: "Ottawa 311 service requests", url: "https://open.ottawa.ca", status: "discovered", enabled: true, refresh_interval_minutes: 30 },
  { id: "ott-roads",   group: "neighborhood-services", name: "City of Ottawa road closures",  url: "https://open.ottawa.ca", status: "working", enabled: true, refresh_interval_minutes: 15 },

  // 2. Public safety (HOLD by default for sensitive items)
  { id: "ott-police",  group: "public-safety", name: "Ottawa Police news releases", url: "https://www.ottawapolice.ca", status: "manual_config_required", enabled: true, refresh_interval_minutes: 10, notes: "Sensitive items HOLD_FOR_EDITOR" },
  { id: "rcmp-on",     group: "public-safety", name: "RCMP Ontario news", url: "https://www.rcmp-grc.gc.ca/on/news-nouvelles/index-eng.htm", status: "manual_config_required", enabled: true, refresh_interval_minutes: 30 },
  { id: "recalls-ca",  group: "public-safety", name: "Canada recalls & safety alerts", url: "https://recalls-rappels.canada.ca/en/rss-feeds", status: "working", enabled: true, refresh_interval_minutes: 60 },
  { id: "psc-ca",      group: "public-safety", name: "Public Safety Canada", url: "https://www.publicsafety.gc.ca/cnt/rsrcs/news-nws/index-en.aspx", status: "discovered", enabled: true, refresh_interval_minutes: 60 },

  // 3. Parks & environment
  { id: "parks-ca",    group: "parks-environment", name: "Parks Canada", url: "https://www.pc.gc.ca/en/agence-agency/bib-lib/web-rss", status: "working", enabled: true, refresh_interval_minutes: 60 },
  { id: "ncc",         group: "parks-environment", name: "National Capital Commission", url: "https://ncc-ccn.gc.ca", status: "manual_config_required", enabled: true, refresh_interval_minutes: 60 },
  { id: "rvca",        group: "parks-environment", name: "Rideau Valley Conservation Authority", url: "https://www.rvca.ca", status: "manual_config_required", enabled: true, refresh_interval_minutes: 60 },
  { id: "mvca",        group: "parks-environment", name: "Mississippi Valley Conservation", url: "https://mvc.on.ca", status: "manual_config_required", enabled: true, refresh_interval_minutes: 60 },
  { id: "ec-weather",  group: "parks-environment", name: "Environment Canada alerts (Ottawa)", url: "https://weather.gc.ca/rss/warning/on-118_e.xml", status: "working", enabled: true, refresh_interval_minutes: 15 },

  // 4. Government & roads
  { id: "ott-news",    group: "government-roads", name: "City of Ottawa news", url: "https://ottawa.ca/en/news", status: "discovered", enabled: true, refresh_interval_minutes: 30 },
  { id: "on-511",      group: "government-roads", name: "Ontario 511 incidents", url: "https://511on.ca", status: "discovered", enabled: true, refresh_interval_minutes: 10 },
  { id: "canada-news", group: "government-roads", name: "Canada.ca news feeds", url: "https://www.canada.ca/en/news/web-feeds.html", status: "working", enabled: true, refresh_interval_minutes: 60 },
];

export function sourcesByGroup(group: GroupKey) {
  return SOURCE_REGISTRY.filter(s => s.group === group);
}
