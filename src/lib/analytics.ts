/**
 * Google Analytics 4, opt-in only.
 *
 * - Nothing loads from Google until the reader says yes in the small
 *   "count my visit" bar (StatsConsent). No yes, no script, no cookie, no ping.
 *   This keeps our privacy promise and Quebec's Law 25 (tracking off by default).
 * - Never on children's pages (Young Lab) or editor tools, never on previews,
 *   never for a browser sending Global Privacy Control (treated as a no; we don't ask).
 * - Statistics only: Google signals and ad personalisation are off, ad consent
 *   stays denied. The yes covers analytics_storage and nothing else.
 * - The choice is kept in this browser only (localStorage "aib-stats-v1").
 *   Withdrawing removes GA's cookies and stops further hits.
 *
 * Cloudflare Web Analytics (cookieless, everyone) still gives the full totals.
 * GA account: aibroadsheet@gmail.com, property "aibroadsheet.com", stream "AI Broadsheet web".
 */
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { gpcOn } from "@/lib/consent";

export type StatsChoice = "granted" | "denied";
export type StatsState = { choice: StatsChoice | null; gpc: boolean };

const KEY = "aib-stats-v1";
const EVENT = "aib-stats";
const SCRIPT_ID = "ga4-gtag";

/** Paths (without /fr) that are never measured and never show the question. */
export const STATS_FREE: RegExp[] = [
  /^\/labs\/young(\/|$)/, // children's pages
  /^\/editor\/tools(\/|$)/,
  /^\/app(\/|$)/, // the separate PWA
];

export function statsAllowedPath(path: string): boolean {
  const p = path.replace(/^\/fr(?=\/|$)/, "") || "/";
  return !STATS_FREE.some((re) => re.test(p));
}

/** Only the real site: previews and local dev never talk to Google Analytics. */
export function statsHost(): boolean {
  return typeof window !== "undefined" && window.location.hostname === SITE.domain;
}

export function readStats(): StatsState {
  const gpc = gpcOn();
  if (typeof window === "undefined") return { choice: null, gpc };
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || "null") as {
      choice?: StatsChoice;
    } | null;
    const choice = v?.choice === "granted" || v?.choice === "denied" ? v.choice : null;
    return { choice: gpc ? "denied" : choice, gpc };
  } catch {
    return { choice: null, gpc };
  }
}

export const statsAllowed = (s: StatsState) =>
  !!SITE.gaMeasurementId && s.choice === "granted" && !s.gpc;

type GaWindow = Window & {
  dataLayer?: unknown[];
  [k: `ga-disable-${string}`]: boolean | undefined;
};

function gtag(..._args: unknown[]) {
  const w = window as unknown as GaWindow;
  w.dataLayer = w.dataLayer || [];
  // gtag.js reads the arguments object, exactly as Google's snippet pushes it.
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
}

/** Loads gtag.js once, after a yes. Page views of in-app navigation come from GA's enhanced measurement. */
export function startStats() {
  const id = SITE.gaMeasurementId;
  if (!id || !statsHost()) return;
  (window as unknown as GaWindow)[`ga-disable-${id}`] = false;
  if (document.getElementById(SCRIPT_ID)) {
    gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("set", "ads_data_redaction", true);
  gtag("js", new Date());
  gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

/**
 * One GA4 event, only when the reader said yes, gtag.js is loaded and the page is measured.
 * Never on children's pages (STATS_FREE), so Young Lab stays unmeasured: its sign-ups are
 * counted by beehiiv's UTM source instead. Parameters must never hold anything a reader typed.
 */
export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined" || !SITE.gaMeasurementId || !statsHost()) return;
  if (!statsAllowedPath(window.location.pathname) || !statsAllowed(readStats())) return;
  if (!document.getElementById(SCRIPT_ID)) return;
  gtag("event", name, params);
}

/** Stops further hits in this page and deletes GA's first-party cookies. */
export function stopStats() {
  const id = SITE.gaMeasurementId;
  if (!id || typeof window === "undefined") return;
  (window as unknown as GaWindow)[`ga-disable-${id}`] = true;
  if (document.getElementById(SCRIPT_ID))
    gtag("consent", "update", { analytics_storage: "denied" });
  const host = window.location.hostname;
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      for (const domain of [
        "",
        `; domain=${host}`,
        `; domain=.${host}`,
        `; domain=.${host.replace(/^www\./, "")}`,
      ]) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
      }
    }
  }
}

export function writeStats(choice: StatsChoice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
  } catch {
    /* storage blocked: lasts this visit */
  }
  const s = readStats();
  if (statsAllowed(s)) startStats();
  else stopStats();
  window.dispatchEvent(new CustomEvent(EVENT, { detail: s }));
}

/** Live choice for components. `ready` is false during SSR and the first client render. */
export function useStats(): StatsState & { ready: boolean } {
  const [state, setState] = useState<StatsState & { ready: boolean }>({
    choice: null,
    gpc: false,
    ready: false,
  });
  useEffect(() => {
    const sync = () => setState({ ...readStats(), ready: true });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}
