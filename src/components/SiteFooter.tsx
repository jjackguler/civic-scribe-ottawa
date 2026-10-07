import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useLocale } from "@/lib/locale-context";
import { TOPICS } from "@/lib/news";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const year = new Date().getFullYear();
  const head = "font-bold text-white mb-3";
  const link = "text-white/75 hover:text-white hover:underline";
  return (
    <footer className="mt-20 bg-night text-white">
      <div className="container-mw pt-12 pb-10 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo inverse />
          <p className="mt-4 max-w-md text-white/75 font-serif text-[1.05rem] leading-relaxed">{SITE.description[locale]}</p>
          <p className="mt-4 text-sm text-white/55 max-w-md">{t("sourcesNote", locale)}</p>
        </div>
        <nav aria-label={fr ? "Thèmes" : "Topics"}>
          <p className={head}>{fr ? "Thèmes" : "Topics"}</p>
          <ul className="grid gap-1.5 text-[0.92rem]">
            {TOPICS.slice(0, 9).map(tp => (
              <li key={tp.id}><Link to="/news" search={{ section: tp.id }} className={link}>{pick(tp.label)}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label={fr ? "Sections" : "Sections"}>
          <p className={head}>{fr ? "Sections" : "Sections"}</p>
          <ul className="grid gap-1.5 text-[0.92rem]">
            <li><Link to="/news" className={link}>{fr ? "En continu" : "Latest"}</Link></li>
            <li><Link to="/watch" className={link}>{fr ? "Vidéos" : "Watch"}</Link></li>
            <li><Link to="/interviews" className={link}>{fr ? "Entrevues" : "Interviews"}</Link></li>
            <li><Link to="/listen" className={link}>{fr ? "Balados" : "Podcasts"}</Link></li>
            <li><Link to="/ministry" className={link}>{t("trackerTitle", locale)}</Link></li>
            <li><Link to="/government" className={link}>{t("government", locale)}</Link></li>
            <li><Link to="/tools" className={link}>{t("tools", locale)}</Link></li>
            <li><Link to="/learn" className={link}>{t("learn", locale)}</Link></li>
            <li><Link to="/funding" className={link}>{t("funding", locale)}</Link></li>
            <li><Link to="/editor" className={link}>{t("editorsDesk", locale)}</Link></li>
          </ul>
        </nav>
        <nav aria-label={fr ? "L'entreprise" : "Company"}>
          <p className={head}>{SITE.name}</p>
          <ul className="grid gap-1.5 text-[0.92rem]">
            <li><Link to="/advertise" className={link}>{fr ? "Annoncer" : "Advertise"}</Link></li>
            <li><Link to="/newsletter" className={link}>{fr ? "Infolettre" : "Newsletter"}</Link></li>
            <li><Link to="/standards" className={link}>{fr ? "Normes éditoriales" : "Editorial standards"}</Link></li>
            <li><Link to="/about" className={link}>{fr ? "À propos et sources" : "About and sources"}</Link></li>
            <li><Link to="/privacy" className={link}>{fr ? "Confidentialité" : "Privacy"}</Link></li>
            <li><a href={`mailto:${SITE.email.editor}`} className={link}>{fr ? "Écrire à la rédaction" : "Contact the editor"}</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <div className="container-mw py-5 text-sm text-white/55 flex flex-wrap gap-x-6 gap-y-1">
          <span>© {year} {SITE.name}</span>
          <span>{fr ? "Les titres, extraits, photos et vidéos appartiennent à leurs éditeurs." : "Headlines, excerpts, photos and videos belong to their publishers."}</span>
        </div>
      </div>
    </footer>
  );
}
