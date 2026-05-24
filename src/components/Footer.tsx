import { Link } from "@tanstack/react-router";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export function Footer() {
  const { locale } = useLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 rule-top bg-secondary/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="kicker text-civic-red">Ottawa · Canada</div>
          <h2 className="font-display text-3xl mt-1">{t("brand", locale)}</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md font-serif italic">
            {t("tagline", locale)}
          </p>
          <Link to="/donate" className="inline-block mt-5 border border-ink px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper transition-colors">
            {t("donate", locale)}
          </Link>
        </div>
        <div className="text-sm space-y-2">
          <h3 className="kicker text-muted-foreground mb-3">Sections</h3>
          <Link to="/neighborhoods" className="block hover:text-civic-red">{t("neighborhoods", locale)}</Link>
          <Link to="/fact-check" className="block hover:text-civic-red">{t("factCheck", locale)}</Link>
          <Link to="/solutions" className="block hover:text-civic-red">{t("solutions", locale)}</Link>
          <Link to="/traffic" className="block hover:text-civic-red">{t("traffic", locale)}</Link>
          <Link to="/weather" className="block hover:text-civic-red">{t("weather", locale)}</Link>
          <Link to="/events" className="block hover:text-civic-red">{t("events", locale)}</Link>
          <Link to="/jobs" className="block hover:text-civic-red">{t("jobs", locale)}</Link>
        </div>
        <div className="text-sm space-y-2">
          <h3 className="kicker text-muted-foreground mb-3">{t("trust", locale)}</h3>
          <Link to="/about" className="block hover:text-civic-red">{t("about", locale)}</Link>
          <Link to="/about" hash="standards" className="block hover:text-civic-red">Editorial standards</Link>
          <Link to="/about" hash="corrections" className="block hover:text-civic-red">Corrections</Link>
          <Link to="/about" hash="funding" className="block hover:text-civic-red">Funding transparency</Link>
          <Link to="/about" hash="privacy" className="block hover:text-civic-red">Privacy</Link>
          <Link to="/admin" className="block hover:text-civic-red text-muted-foreground">Editor dashboard</Link>
        </div>
      </div>
      <div className="rule-top">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {year} {t("brand", locale)}. Independent, reader-supported.</span>
          <span className="font-serif italic">{locale === "fr" ? "Fait à Ottawa, sur le territoire algonquin anishinabe non cédé." : "Made in Ottawa, on unceded Algonquin Anishinaabe territory."}</span>
        </div>
      </div>
    </footer>
  );
}
