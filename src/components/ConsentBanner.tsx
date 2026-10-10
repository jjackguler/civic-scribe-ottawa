import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { adsAllowed } from "@/lib/ads";
import { applyConsentSignals, OPEN_CHOICES_EVENT, useConsent, writeConsent } from "@/lib/consent";
import { useLocale } from "@/lib/locale-context";

/**
 * A small, non-blocking bar that asks once whether ads may be personalised.
 * Mounted from the root route only when AdSense is configured. Never shown on
 * ad-free pages (children's pages, the Keeper…) or to readers sending a Global
 * Privacy Control signal. Reading never waits on it: until the reader answers,
 * ads are non-personalised.
 */
export default function ConsentBanner() {
  const path = useRouterState({ select: s => s.location.pathname });
  const consent = useConsent();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [reopened, setReopened] = useState(false);

  useEffect(() => { if (consent.ready) applyConsentSignals(consent); }, [consent]);
  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CHOICES_EVENT, open);
    return () => window.removeEventListener(OPEN_CHOICES_EVENT, open);
  }, []);

  if (!consent.ready || !adsAllowed(path)) return null;
  if (consent.gpc && !reopened) return null;
  if (consent.choice && !reopened) return null;

  const choose = (c: "granted" | "denied") => { writeConsent(c); setReopened(false); };
  return (
    <div role="region" aria-label={fr ? "Choix de confidentialité" : "Privacy choices"} className="fixed inset-x-0 bottom-0 z-[60] border-t-[3px] border-brass bg-night text-white shadow-[0_-8px_24px_rgba(0,0,0,0.25)]">
      <div className="container-mw py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[0.95rem] leading-snug max-w-[70ch]">
          {consent.gpc
            ? (fr
              ? "Votre navigateur envoie un signal Global Privacy Control : les annonces restent non personnalisées."
              : "Your browser sends a Global Privacy Control signal, so ads stay non-personalised.")
            : (fr
              ? "Les annonces nous financent. Elles sont non personnalisées, sauf si vous acceptez que Google utilise des témoins pour les adapter à vos intérêts. Vous pouvez changer d'avis en tout temps."
              : "Ads pay for our journalism. They are non-personalised unless you let Google use cookies to tailor them to your interests. You can change your mind at any time.")}{" "}
          <Link to="/privacy" hash="choices" className="underline underline-offset-2 text-white/85 hover:text-white">{fr ? "En savoir plus" : "Learn more"}</Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!consent.gpc && (
            <button type="button" onClick={() => choose("granted")} className="min-h-11 rounded-[4px] bg-brass px-4 font-bold text-night hover:bg-white">
              {fr ? "Accepter la personnalisation" : "Allow personalised ads"}
            </button>
          )}
          <button type="button" onClick={() => choose("denied")} className="min-h-11 rounded-[4px] border border-white/40 px-4 font-bold hover:border-white">
            {consent.gpc ? (fr ? "Compris" : "OK") : (fr ? "Non merci" : "No thanks")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Inline controls for /privacy#choices: current state and buttons to change it. */
export function ConsentControls() {
  const consent = useConsent();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const state = !consent.ready
    ? "…"
    : consent.gpc
      ? (fr ? "Non personnalisées (signal Global Privacy Control détecté)" : "Non-personalised (Global Privacy Control signal detected)")
      : consent.choice === "granted"
        ? (fr ? "Personnalisées (vous avez accepté)" : "Personalised (you agreed)")
        : consent.choice === "denied"
          ? (fr ? "Non personnalisées (vous avez refusé)" : "Non-personalised (you declined)")
          : (fr ? "Non personnalisées (aucun choix fait)" : "Non-personalised (no choice made yet)");
  const btn = "min-h-11 rounded-[4px] px-4 font-bold";
  return (
    <div className="mt-3 rounded-[8px] border border-line bg-surface p-5">
      <p className="font-semibold">{fr ? "Publicités sur ce navigateur :" : "Ads in this browser:"} <span className="font-normal">{state}</span></p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!consent.ready || consent.gpc} onClick={() => writeConsent("granted")} className={`${btn} bg-ink text-white disabled:opacity-40`}>
          {fr ? "Accepter la personnalisation" : "Allow personalised ads"}
        </button>
        <button type="button" disabled={!consent.ready} onClick={() => writeConsent("denied")} className={`${btn} border border-ink`}>
          {fr ? "Refuser la personnalisation" : "Refuse personalised ads"}
        </button>
      </div>
    </div>
  );
}
