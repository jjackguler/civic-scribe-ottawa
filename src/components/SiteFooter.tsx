import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { STUDIO } from "@/lib/studio";
import { editorMailto } from "@/lib/contact";

export function SiteFooter() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const year = new Date().getFullYear();
  const mail = editorMailto();
  const social = ([["LinkedIn", SITE.social.linkedin], ["Instagram", SITE.social.instagram], ["YouTube", SITE.social.youtube], ["X", SITE.social.x], ["Facebook", SITE.social.facebook], ["TikTok", SITE.social.tiktok]] as const).filter(([, href]) => !!href);
  const link = "text-white/80 hover:text-white hover:underline";
  const Col = ({ title, children }: { title: string; children: ReactNode }) => (
    <nav aria-label={title}>
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-brass mb-3">{title}</p>
      <ul className="grid gap-2 text-[0.92rem]">{children}</ul>
    </nav>
  );
  return (
    <footer className="mt-20 bg-night text-white">
      <div className="container-mw pt-12 pb-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-end border-b border-white/15 pb-10">
          <div>
            <Logo inverse />
            <p className="mt-4 max-w-md font-serif text-[1.15rem] leading-relaxed text-brand-paper/85">{SITE.tagline[locale]}</p>
          </div>
          <Link to="/newsletter" className="group justify-self-start lg:justify-self-end flex items-center gap-4 border border-white/25 px-5 py-4 hover:border-brass">
            <span>
              <span className="block text-[0.72rem] font-bold uppercase tracking-[0.08em] text-brass">{fr ? "Chaque semaine, gratuit" : "Weekly, free"}</span>
              <span className="block font-serif text-[1.3rem] mt-0.5">{SITE.newsletter.name[locale]}</span>
            </span>
            <ArrowRight className="h-5 w-5 text-brass transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-10 py-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Col title={fr ? "Actualités" : "News"}>
            <li><Link to="/news" className={link}>{fr ? "En continu" : "Latest"}</Link></li>
            <li><Link to="/canada" className={link}>{fr ? "L'IA au Canada" : "AI in Canada"}</Link></li>
            <li><Link to="/news" search={{ section: "policy" }} className={link}>{fr ? "Politiques" : "Policy"}</Link></li>
            <li><Link to="/news" search={{ section: "business" }} className={link}>{fr ? "Affaires" : "Business"}</Link></li>
            <li><Link to="/news" search={{ section: "research" }} className={link}>{fr ? "Recherche" : "Research"}</Link></li>
            <li><Link to="/news" search={{ section: "responsible" }} className={link}>{fr ? "IA responsable" : "Responsible AI"}</Link></li>
            <li><Link to="/ministry" className={link}>{t("trackerTitle", locale)}</Link></li>
            <li><Link to="/government" className={link}>{t("government", locale)}</Link></li>
          </Col>
          <Col title={fr ? "Notre journalisme" : "Our journalism"}>
            {STUDIO.length > 0 && <li><Link to="/desk" className={link}>{fr ? "De notre pupitre" : "From our desk"}</Link></li>}
            <li><Link to="/dispatch" className={link}>{fr ? "Résumés de la rédaction" : "Newsroom summaries"}</Link></li>
            <li><Link to="/originals" className={link}>{fr ? "Vidéos explicatives" : "Explainer videos"}</Link></li>
            <li><Link to="/sir-jack" className={link}>The Sir Jack Files</Link></li>
            <li><Link to="/immersive" className={link}>{fr ? "Journalisme immersif" : "Immersive journalism"}</Link></li>
            <li><Link to="/interviews" className={link}>{fr ? "Entrevues" : "Interviews"}</Link></li>
            <li><Link to="/listen" className={link}>{fr ? "Balados" : "Podcasts"}</Link></li>
            <li><Link to="/editor" className={link}>{t("editorsDesk", locale)}</Link></li>
          </Col>
          <Col title={fr ? "Apprendre" : "Learn"}>
            <li><Link to="/labs" className={link}>{fr ? "Apprendre l'IA" : "Learn AI"}</Link></li>
            <li><Link to="/learn" className={link}>{fr ? "Guides" : "Guides"}</Link></li>
            <li><Link to="/glossary" className={link}>{fr ? "Glossaire" : "Glossary"}</Link></li>
            <li><Link to="/funding" className={link}>{fr ? "Financement de l'IA au Canada" : "AI funding in Canada"}</Link></li>
            <li><Link to="/tools" className={link}>{t("tools", locale)}</Link></li>
            <li><Link to="/app" search={{ story: undefined }} className={link}>{fr ? "L'application Le Brief" : "The Brief app"}</Link></li>
          </Col>
          <Col title={fr ? "Confiance" : "Trust"}>
            <li><Link to="/how-we-use-ai" className={link}>{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</Link></li>
            <li><Link to="/standards" className={link}>{fr ? "Normes éditoriales" : "Editorial standards"}</Link></li>
            <li><Link to="/corrections" className={link}>Corrections</Link></li>
            <li><Link to="/values" className={link}>{fr ? "Nos valeurs" : "What we stand for"}</Link></li>
            <li><Link to="/about" hash="ownership" className={link}>{fr ? "Propriété et financement" : "Ownership and funding"}</Link></li>
            <li><Link to="/privacy" className={link}>{fr ? "Confidentialité" : "Privacy"}</Link></li>
            <li><Link to="/terms" className={link}>{fr ? "Conditions d'utilisation" : "Terms of use"}</Link></li>
          </Col>
          <Col title={fr ? "Nous joindre" : "Contact"}>
            <li><Link to="/about" className={link}>{fr ? "À propos" : "About us"}</Link></li>
            <li><Link to="/tips" className={link}>{fr ? "Envoyer un tuyau" : "Send a tip"}</Link></li>
            <li><Link to="/advertise" className={link}>{fr ? "Commanditaires fondateurs" : "Founding sponsors"}</Link></li>
            {mail && <li><a href={mail} className={link}>{fr ? "Écrire à la rédaction" : "Contact the editor"}</a></li>}
            <li><a href={fr ? "/fr/rss.xml" : "/rss.xml"} className={link}>RSS</a></li>
            {social.length > 0 && (
              <li className="pt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.85rem]" aria-label={fr ? "Suivre" : "Follow"}>
                {social.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener" className="text-white/70 hover:text-brass hover:underline">{label}</a>)}
              </li>
            )}
          </Col>
        </div>

        {/* Ownership, stated where every reader can find it. */}
        <div className="border-t border-white/15 pt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center text-[0.9rem]">
          <p className="text-white/85">
            {fr ? `${SITE.name} est publié par ` : `${SITE.name} is published by `}
            <a href={SITE.publisher.url} rel="noopener" className="font-bold text-white underline decoration-brass underline-offset-4 hover:text-brass">{SITE.publisher.name}</a>
            {fr ? `, ${SITE.publisher.city}, ${SITE.publisher.country}. Responsable éditorial : ${SITE.editor.name}.` : `, ${SITE.publisher.city}, ${SITE.publisher.country}. Editor: ${SITE.editor.name}.`}
          </p>
          <p className="text-white/70">
            {fr ? "Nos outils de rédaction : " : "Our newsroom tools: "}
            <a href={SITE.studio.url} rel="noopener" className="font-semibold text-white/90 underline hover:text-brass">{SITE.studio.name}</a>
          </p>
        </div>
        <div className="mt-5 text-[0.82rem] text-white/60 flex flex-wrap gap-x-6 gap-y-1">
          <span>© {year} {SITE.publisher.name}</span>
          <span>{fr ? "Les titres, photos et vidéos de tiers appartiennent à leurs éditeurs et renvoient à l'original." : "Third-party headlines, photos and videos belong to their publishers and link to the original."}</span>
          <a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">{t("builtWithClaude", locale)}</a>
        </div>
      </div>
    </footer>
  );
}
