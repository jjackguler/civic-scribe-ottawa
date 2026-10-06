import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  const { locale } = useLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="container-mw py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo inverse />
          <p className="mt-4 max-w-md text-white/75 font-serif text-[1.05rem] leading-relaxed">{SITE.description[locale]}</p>
        </div>
        <nav aria-label="Footer" className="grid gap-2 content-start">
          <Link to="/news" className="hover:underline">{t("news", locale)}</Link>
          <Link to="/government" className="hover:underline">{t("government", locale)}</Link>
          <Link to="/ministry" className="hover:underline">{t("ministry", locale)}</Link>
          <Link to="/funding" className="hover:underline">{t("funding", locale)}</Link>
          <Link to="/tools" className="hover:underline">{t("tools", locale)}</Link>
          <Link to="/learn" className="hover:underline">{t("learn", locale)}</Link>
          <Link to="/editor" className="hover:underline">{t("editorsDesk", locale)}</Link>
          <Link to="/about" className="hover:underline">{t("about", locale)}</Link>
        </nav>
        <div className="text-sm text-white/70">
          <p className="font-semibold text-white mb-2">{t("sources", locale)}</p>
          <p className="leading-relaxed">{t("sourcesNote", locale)}</p>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-mw py-5 text-sm text-white/60">© {year} {SITE.name}</div>
      </div>
    </footer>
  );
}
