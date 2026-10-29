import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useLocale } from "@/lib/locale-context";
import { DESKS } from "@/lib/news";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { editorMailto } from "@/lib/contact";

export function SiteFooter() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const year = new Date().getFullYear();
  const head = "font-bold text-white mb-3";
  const link = "text-white/75 hover:text-white hover:underline";
  const mail = editorMailto();
  const social = ([["LinkedIn", SITE.social.linkedin], ["Instagram", SITE.social.instagram], ["X", SITE.social.x], ["YouTube", SITE.social.youtube], ["Facebook", SITE.social.facebook], ["TikTok", SITE.social.tiktok]] as const).filter(([, href]) => !!href);
  return (
    <footer className="mt-20 bg-night text-white">
      <div className="container-mw pt-12 pb-10 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo inverse />
          <p className="mt-4 max-w-md text-brand-paper/75 font-sans text-[1.05rem] leading-relaxed">{SITE.tagline[locale]}</p>
          <p className="mt-4 text-sm text-white/55 max-w-md">{t("sourcesNote", locale)}</p>
          {SITE.email.general && <p className="mt-4"><a href={`mailto:${SITE.email.general}`} className="text-brass hover:underline">{SITE.email.general}</a></p>}
          {social.length > 0 && (
            <ul className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label={fr ? "Suivre" : "Follow"}>
              <li className="font-semibold text-brand-paper">{fr ? "Suivre" : "Follow"}</li>
              {social.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener" className="inline-flex items-center min-h-9 font-semibold text-brand-paper/85 hover:text-brand-gold hover:underline">{label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label={fr ? "Thèmes" : "Topics"}>
          <p className={head}>{fr ? "Thèmes" : "Topics"}</p>
          <ul className="grid gap-1.5 text-[0.92rem]">
            {DESKS.map(tp => (
              <li key={tp.id}><Link to="/news" search={{ section: tp.id }} className={link}>{pick(tp.label)}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label={fr ? "Sections" : "Sections"}>
          <p className={head}>{fr ? "Sections" : "Sections"}</p>
          <ul className="grid gap-1.5 text-[0.92rem]">
            <li><Link to="/news" className={link}>{fr ? "En continu" : "Latest"}</Link></li>
            <li><Link to="/watch" className={link}>{fr ? "Vidéos" : "Watch"}</Link></li>
            <li><Link to="/originals" className={link}>{fr ? "Explicatifs" : "Explainers"}</Link></li>
            <li><Link to="/immersive" className={link}>{fr ? "Journalisme immersif" : "Immersive Journalism"}</Link></li>
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
            <li><Link to="/values" className={link}>{fr ? "Nos valeurs" : "What we stand for"}</Link></li>
            <li><Link to="/standards" className={link}>{fr ? "Normes éditoriales" : "Editorial standards"}</Link></li>
            <li><Link to="/about" className={link}>{fr ? "À propos" : "About"}</Link></li>
            <li><Link to="/corrections" className={link}>{fr ? "Corrections" : "Corrections"}</Link></li>
            <li><Link to="/privacy" className={link}>{fr ? "Confidentialité" : "Privacy"}</Link></li>
            <li><Link to="/terms" className={link}>{fr ? "Conditions d'utilisation" : "Terms of use"}</Link></li>
            <li><a href={fr ? "/fr/rss.xml" : "/rss.xml"} className={link}>RSS</a></li>
            {mail && <li><a href={mail} className={link}>{fr ? "Écrire à la rédaction" : "Contact the editor"}</a></li>}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <div className="container-mw py-5 text-sm text-white/55 flex flex-wrap gap-x-6 gap-y-1">
          <span>© {year} {SITE.publisher.name}</span>
          <span>{fr ? "Les titres, extraits, photos et vidéos appartiennent à leurs éditeurs." : "Headlines, excerpts, photos and videos belong to their publishers."}</span>
          <a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">{t("builtWithClaude", locale)}</a>
        </div>
      </div>
    </footer>
  );
}
