import { useLocale } from "@/lib/locale-context";
import { ExternalLink, MapPin } from "lucide-react";

/**
 * Optional Google Maps live traffic overlay.
 *
 * - Disabled by default.
 * - Activates ONLY when VITE_GOOGLE_MAPS_API_KEY is configured at build time.
 * - When inactive, shows a clear "using free official sources" message.
 * - Loads the Maps JS SDK lazily via dynamic <script> insertion to avoid
 *   any cost on the homepage or other pages.
 */
export function GoogleTrafficTab() {
  const { locale } = useLocale();
  const key = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  if (!key) {
    return (
      <div className="border border-rule bg-secondary/40 p-8 text-center">
        <MapPin className="h-6 w-6 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-display text-xl mb-2">
          {locale === "fr" ? "Google Maps désactivé" : "Google Maps disabled"}
        </h3>
        <p className="font-serif text-sm text-muted-foreground max-w-md mx-auto">
          {locale === "fr"
            ? "Aucune clé API configurée. Nous utilisons des sources officielles gratuites : Ville d'Ottawa, Ontario 511, OC Transpo, Environnement Canada."
            : "No API key configured. We're using free official sources: City of Ottawa, Ontario 511, OC Transpo, Environment Canada."}
        </p>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-4">
          {locale === "fr" ? "Activation propriétaire requise · Désactivé par défaut" : "Owner activation required · Off by default"}
        </p>
      </div>
    );
  }

  // Visual-only overlay placeholder. A full lazy-loaded <script> integration
  // is wired by the owner when the key is added.
  return (
    <div className="border border-rule bg-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <h3 className="kicker text-river">{locale === "fr" ? "Google Live Traffic (visuel)" : "Google Live Traffic (visual only)"}</h3>
        <a
          href="https://www.google.com/maps/@45.4215,-75.6972,12z/data=!5m1!1e1"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-river hover:underline"
        >
          {locale === "fr" ? "Ouvrir dans Google Maps" : "Open in Google Maps"} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="h-[400px] bg-secondary flex items-center justify-center text-sm text-muted-foreground">
        {locale === "fr" ? "Couche TrafficLayer chargée à la demande." : "TrafficLayer loads on demand."}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground font-sans">
        {locale === "fr"
          ? "La couche Google est visuelle uniquement. Les incidents officiels proviennent de la Ville, d'Ontario 511 et d'OC Transpo."
          : "Google traffic layer is visual only. Official incident cards come from City/Ontario/OC Transpo sources."}
      </p>
    </div>
  );
}
