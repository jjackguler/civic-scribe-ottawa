/**
 * Reader consent for personalised advertising — a small, CMP-ready state.
 *
 * - Until the reader chooses, ads are NON-personalised (no ad profile, no
 *   cross-site tracking). Choosing "No thanks" keeps it that way.
 * - A Global Privacy Control signal (navigator.globalPrivacyControl) counts as
 *   a refusal and cannot be overridden by a default; we don't even ask.
 * - The choice is stored in this browser only (localStorage key
 *   "aib-consent-v1"), which is strictly necessary to remember it. Clearing
 *   site data resets it.
 * - Google Consent Mode v2 signals are set to "denied" by default and updated
 *   when the reader agrees, so Google's tags behave accordingly.
 *
 * This is NOT a certified CMP. For readers in the EEA, the UK and Switzerland,
 * Google requires a Google-certified CMP: the owner turns on Google's own
 * consent message in AdSense → Privacy & messaging (see docs/seo-launch.md).
 * That message is served by the AdSense script itself and takes precedence;
 * this state still governs everyone else (Canada, Québec Law 25, US GPC).
 */
import { useEffect, useState } from "react";

export type ConsentChoice = "granted" | "denied";
export type ConsentState = { choice: ConsentChoice | null; gpc: boolean; at?: string };

const KEY = "aib-consent-v1";
const EVENT = "aib-consent";
/** Fired by the "Privacy choices" link to reopen the banner. */
export const OPEN_CHOICES_EVENT = "aib-consent-open";

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; navigator: Navigator & { globalPrivacyControl?: boolean } };

export function gpcOn(): boolean {
  try { return typeof navigator !== "undefined" && (navigator as GtagWindow["navigator"]).globalPrivacyControl === true; } catch { return false; }
}

export function readConsent(): ConsentState {
  const gpc = gpcOn();
  if (typeof window === "undefined") return { choice: null, gpc };
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as { choice?: ConsentChoice; at?: string }) : null;
    const choice = v?.choice === "granted" || v?.choice === "denied" ? v.choice : null;
    return { choice: gpc && choice === "granted" ? "denied" : choice, gpc, at: v?.at };
  } catch {
    return { choice: null, gpc };
  }
}

/** Personalised ads only with an explicit "yes" and no GPC signal. */
export const personalisedAllowed = (s: ConsentState) => s.choice === "granted" && !s.gpc;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  // Consent Mode reads the arguments object, exactly as gtag.js pushes it.
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
}

let defaultsSet = false;
/** Consent Mode v2 defaults: everything denied until the reader agrees. Safe to call many times. */
export function applyConsentSignals(s: ConsentState = readConsent()) {
  if (typeof window === "undefined") return;
  const yes = personalisedAllowed(s) ? "granted" : "denied";
  if (!defaultsSet) {
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", wait_for_update: 500 });
    defaultsSet = true;
  }
  gtag("consent", "update", { ad_storage: yes, ad_user_data: yes, ad_personalization: yes });
}

export function writeConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify({ choice, at: new Date().toISOString() })); } catch { /* storage blocked: lasts this visit */ }
  const s = readConsent();
  applyConsentSignals(s);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: s }));
}

/** Live consent state for components. `ready` is false during SSR and the first client render. */
export function useConsent(): ConsentState & { ready: boolean } {
  const [state, setState] = useState<ConsentState & { ready: boolean }>({ choice: null, gpc: false, ready: false });
  useEffect(() => {
    const sync = () => setState({ ...readConsent(), ready: true });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return state;
}

export const openPrivacyChoices = () => { if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_CHOICES_EVENT)); };
