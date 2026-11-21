import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import {
  startStats,
  statsAllowed,
  statsAllowedPath,
  statsHost,
  useStats,
  writeStats,
} from "@/lib/analytics";

/**
 * Asks once, in a small non-blocking bar, whether we may count this visit with
 * Google Analytics. Never shown on children's pages, on previews, or to a browser
 * sending Global Privacy Control. Reading never waits on it, and until the reader
 * says yes nothing loads from Google. See src/lib/analytics.ts.
 */
export default function StatsConsent() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const stats = useStats();
  const fr = /^\/fr(\/|$)/.test(path);
  const onPage = statsAllowedPath(path);

  // A reader who said yes on an earlier visit: start measuring once we're on a measured page.
  useEffect(() => {
    if (stats.ready && onPage && statsAllowed(stats)) startStats();
  }, [stats, onPage]);

  if (!SITE.gaMeasurementId || !stats.ready || !onPage || !statsHost()) return null;
  if (stats.gpc || stats.choice) return null;

  return (
    <div
      role="region"
      aria-label={fr ? "Statistiques de visite" : "Visitor statistics"}
      className="fixed inset-x-0 bottom-0 z-[60] border-t-[3px] border-brass bg-night text-white shadow-[0_-8px_24px_rgba(0,0,0,0.25)]"
    >
      <div className="container-mw py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[0.95rem] leading-snug max-w-[70ch]">
          {fr
            ? "Pouvons-nous compter votre visite avec Google Analytics? Cela nous aide à savoir quels articles et jeux sont utiles. L'outil utilise des témoins; aucune publicité, rien n'est vendu. Rien ne se charge si vous refusez."
            : "May we count your visit with Google Analytics? It shows us which stories and games are useful. It uses cookies; no ads, nothing sold. Nothing loads if you say no."}{" "}
          <Link
            to="/privacy"
            hash="statistics"
            className="underline underline-offset-2 text-white/85 hover:text-white"
          >
            {fr ? "En savoir plus" : "Learn more"}
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => writeStats("granted")}
            className="min-h-11 rounded-[4px] bg-brass px-4 font-bold text-night hover:bg-white"
          >
            {fr ? "Oui, comptez ma visite" : "Yes, count my visit"}
          </button>
          <button
            type="button"
            onClick={() => writeStats("denied")}
            className="min-h-11 rounded-[4px] border border-white/40 px-4 font-bold hover:border-white"
          >
            {fr ? "Non merci" : "No thanks"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Inline controls for /privacy#statistics: the current choice and buttons to change it. */
export function StatsControls({ fr }: { fr: boolean }) {
  const stats = useStats();
  const state = !stats.ready
    ? "…"
    : stats.gpc
      ? fr
        ? "Désactivé (signal Global Privacy Control détecté)"
        : "Off (Global Privacy Control signal detected)"
      : stats.choice === "granted"
        ? fr
          ? "Activé (vous avez accepté)"
          : "On (you agreed)"
        : stats.choice === "denied"
          ? fr
            ? "Désactivé (vous avez refusé)"
            : "Off (you declined)"
          : fr
            ? "Désactivé (aucun choix fait)"
            : "Off (no choice made yet)";
  const btn = "min-h-11 rounded-[4px] px-4 font-bold";
  return (
    <div className="mt-3 rounded-[8px] border border-line bg-surface p-5">
      <p className="font-semibold">
        {fr ? "Google Analytics sur ce navigateur :" : "Google Analytics in this browser:"}{" "}
        <span className="font-normal">{state}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!stats.ready || stats.gpc || stats.choice === "granted"}
          onClick={() => writeStats("granted")}
          className={`${btn} bg-ink text-white disabled:opacity-40`}
        >
          {fr ? "Compter mes visites" : "Count my visits"}
        </button>
        <button
          type="button"
          disabled={!stats.ready || stats.choice === "denied"}
          onClick={() => writeStats("denied")}
          className={`${btn} border border-ink disabled:opacity-40`}
        >
          {fr ? "Arrêter et effacer les témoins" : "Stop and remove the cookies"}
        </button>
      </div>
    </div>
  );
}
