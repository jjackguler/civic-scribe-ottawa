import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { TOPICS, type SectionId } from "@/lib/news";
import { SITE } from "@/lib/site";
import { STUDIO } from "@/lib/studio";
import { localePath } from "@/lib/seo";
import type { Bi } from "@/lib/i18n";

type Item = { label: Bi; to: string; section?: SectionId; hash?: string };

/**
 * The section bar (CNA-style: one row, every desk a tap away, swipeable on phones).
 * News desks first, then our own journalism, then learning.
 */
const BAR: Item[] = [
  { label: { en: "Latest", fr: "En continu" }, to: "/news" },
  { label: { en: "Canada", fr: "Canada" }, to: "/canada" },
  { label: { en: "Policy", fr: "Politiques" }, to: "/news", section: "policy" },
  { label: { en: "Business", fr: "Affaires" }, to: "/news", section: "business" },
  { label: { en: "Research", fr: "Recherche" }, to: "/news", section: "research" },
  { label: { en: "Responsible AI", fr: "IA responsable" }, to: "/news", section: "responsible" },
  { label: { en: "Agents", fr: "Agents" }, to: "/news", section: "agents" },
  ...(STUDIO.length ? [{ label: { en: "From our desk", fr: "Notre pupitre" }, to: "/desk" }] : []),
  { label: { en: "Explained", fr: "Expliqué" }, to: "/dispatch" },
  { label: { en: "Video", fr: "Vidéo" }, to: "/originals" },
  { label: { en: "Learn AI", fr: "Apprendre l'IA" }, to: "/labs" },
];

/** The full menu, grouped the way readers look for things. */
const GROUPS: { title: Bi; items: Item[] }[] = [
  {
    title: { en: "News", fr: "Actualités" },
    items: [
      { label: { en: "Latest AI news", fr: "Dernières nouvelles" }, to: "/news" },
      { label: { en: "AI in Canada", fr: "L'IA au Canada" }, to: "/canada" },
      { label: { en: "AI Ministry tracker", fr: "Suivi du ministère de l'IA" }, to: "/ministry" },
      { label: { en: "Government", fr: "Gouvernement" }, to: "/government" },
      { label: { en: "World", fr: "Monde" }, to: "/news", section: "world" },
      { label: { en: "Analysis", fr: "Analyses" }, to: "/news", section: "analysis" },
      { label: { en: "From the labs", fr: "Des laboratoires" }, to: "/news", section: "labs" },
      { label: { en: "Trending", fr: "Tendances" }, to: "/news", section: "trending" },
    ],
  },
  {
    title: { en: "Our journalism", fr: "Notre journalisme" },
    items: [
      ...(STUDIO.length ? [{ label: { en: "From our desk", fr: "De notre pupitre" }, to: "/desk" }] : []),
      { label: { en: "Newsroom summaries", fr: "Résumés de la rédaction" }, to: "/dispatch" },
      { label: { en: "Explainer videos", fr: "Vidéos explicatives" }, to: "/originals" },
      { label: { en: "The Sir Jack Files", fr: "The Sir Jack Files" }, to: "/sir-jack" },
      { label: { en: "Immersive journalism", fr: "Journalisme immersif" }, to: "/immersive" },
      { label: { en: "Interviews", fr: "Entrevues" }, to: "/interviews" },
      { label: { en: "Podcasts", fr: "Balados" }, to: "/listen" },
      { label: { en: "Editor's desk", fr: "Mot de la rédaction" }, to: "/editor" },
    ],
  },
  {
    title: { en: "Learn and use", fr: "Apprendre et utiliser" },
    items: [
      { label: { en: "Learn AI (Labs)", fr: "Apprendre l'IA (Labs)" }, to: "/labs" },
      { label: { en: "Beginner guides", fr: "Guides pour débuter" }, to: "/learn" },
      { label: { en: "Glossary", fr: "Glossaire" }, to: "/glossary" },
      { label: { en: "AI funding in Canada", fr: "Financement de l'IA au Canada" }, to: "/funding" },
      { label: { en: "Tools worth trying", fr: "Outils à essayer" }, to: "/tools" },
      { label: { en: "Made with AI", fr: "Fait avec l'IA" }, to: "/showcase" },
      { label: { en: "The Brief app", fr: "L'application Le Brief" }, to: "/app" },
      { label: { en: "Ask the Keeper", fr: "Demandez au Gardien" }, to: "/ask" },
    ],
  },
  {
    title: { en: "About us", fr: "À propos" },
    items: [
      { label: { en: "How we use AI", fr: "Comment nous utilisons l'IA" }, to: "/how-we-use-ai" },
      { label: { en: "Editorial standards", fr: "Normes éditoriales" }, to: "/standards" },
      { label: { en: "Corrections", fr: "Corrections" }, to: "/corrections" },
      { label: { en: "About and ownership", fr: "À propos et propriété" }, to: "/about" },
      { label: { en: "Newsletter", fr: "Infolettre" }, to: "/newsletter" },
      { label: { en: "Send a tip", fr: "Envoyer un tuyau" }, to: "/tips" },
      { label: { en: "Founding sponsors", fr: "Commanditaires fondateurs" }, to: "/advertise" },
    ],
  },
];

export function SiteHeader() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const loc = useRouterState({ select: s => s.location });
  const [open, setOpen] = useState(false);
  const [desks, setDesks] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const desksRef = useRef<HTMLLIElement>(null);
  const currentSection = (loc.search as { section?: string })?.section;
  const young = loc.pathname.includes("/labs/young");

  useEffect(() => { setOpen(false); setDesks(false); }, [loc.pathname, currentSection]);
  useEffect(() => {
    if (!open && !desks) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) { setOpen(false); menuBtn.current?.focus(); }
      setDesks(false);
    };
    const onClick = (e: MouseEvent) => { if (desks && !desksRef.current?.contains(e.target as Node)) setDesks(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open, desks]);
  useEffect(() => { if (open) menuRef.current?.querySelector<HTMLElement>("a,button")?.focus(); }, [open]);

  const isActive = (n: Item) =>
    n.section ? loc.pathname === "/news" && currentSection === n.section
      : n.to === "/news" ? loc.pathname === "/news" && !currentSection
      : loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");

  const dateLine = new Date().toLocaleDateString(fr ? "fr-CA" : "en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "America/Toronto" });

  const L = ({ n, className, children }: { n: Item; className: string; children: ReactNode }) => (
    <Link to={n.to as never} search={(n.section ? { section: n.section } : undefined) as never} hash={n.hash} className={className} aria-current={isActive(n) ? "page" : undefined}>{children}</Link>
  );
  const groups = young ? GROUPS.map(g => ({ ...g, items: g.items.filter(i => i.to !== "/ask") })) : GROUPS;
  const otherLang = localePath(loc.href, fr ? "en" : "fr");

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-surface focus:p-3 focus:font-semibold">{t("skip", locale)}</a>

      {/* Utility line: date, place, the pages that build trust, language. */}
      <div className="border-b border-line text-[0.8rem] text-muted-ink">
        <div className="container-mw flex items-center gap-4 h-9">
          <p className="truncate"><span className="inline-block first-letter:uppercase" suppressHydrationWarning>{dateLine}</span><span className="hidden sm:inline"> · Ottawa</span></p>
          <nav aria-label={fr ? "Liens utiles" : "Utility"} className="ml-auto flex items-center gap-4 shrink-0">
            <Link to="/how-we-use-ai" className="hidden lg:inline hover:text-ink hover:underline">{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</Link>
            <Link to="/tips" className="hidden md:inline hover:text-ink hover:underline">{fr ? "Envoyer un tuyau" : "Send a tip"}</Link>
            <Link to="/advertise" className="hidden md:inline hover:text-ink hover:underline">{fr ? "Commanditaires" : "Sponsor"}</Link>
            <a href={otherLang} hrefLang={fr ? "en" : "fr"} lang={fr ? "en" : "fr"} className="font-bold text-ink hover:text-lake">{t("lang", locale)}</a>
          </nav>
        </div>
      </div>

      {/* Masthead */}
      <header className="bg-paper">
        <div className="container-mw grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 sm:py-5">
          <div className="flex items-center gap-1">
            <button ref={menuBtn} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="site-menu" className="inline-flex items-center gap-2 h-11 px-2 -ml-2 rounded-[4px] font-semibold text-[0.9rem] hover:bg-ice">
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              <span className="hidden sm:inline">{fr ? "Sections" : "Sections"}</span>
              <span className="sr-only sm:hidden">{t("menu", locale)}</span>
            </button>
            <Link to="/search" aria-label={fr ? "Rechercher" : "Search"} title={fr ? "Rechercher" : "Search"} className={`hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-[4px] hover:bg-ice ${loc.pathname === "/search" ? "text-lake" : ""}`}>
              <Search className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="text-center min-w-0">
            <Link to="/" aria-label={`${SITE.name} — ${fr ? "à la une" : "front page"}`} className="inline-block align-middle">
              <span className="sm:hidden"><Logo compact /></span>
              <span className="hidden sm:inline"><Logo masthead /></span>
            </Link>
            <p className="hidden md:block mt-1.5 font-serif italic text-[0.95rem] text-muted-ink">{fr ? "L'IA au Canada et dans le monde, avec les enjeux humains" : "AI in Canada and the world, with the human stakes left in"}</p>
          </div>
          <div className="flex justify-end">
            <Link to="/newsletter" className="inline-flex items-center h-10 sm:h-11 px-2.5 sm:px-4 rounded-[4px] bg-ink text-white text-[0.8rem] sm:text-[0.9rem] font-bold hover:bg-lake whitespace-nowrap">
              {fr ? "S'abonner" : "Subscribe"}<span className="hidden lg:inline">&nbsp;{fr ? "gratuitement" : "free"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Section bar: sticky, one row; scrolls sideways on phones. */}
      <nav aria-label={fr ? "Sections" : "Sections"} className="sticky top-0 z-40 bg-night text-white shadow-[0_1px_0_rgba(0,0,0,0.25)]">
        <div className="container-mw relative">
          <ul className="flex items-stretch h-11 overflow-x-auto no-scrollbar -mx-2 sm:mx-0">
            {BAR.map(n => (
              <li key={pick(n.label)} className="shrink-0">
                <L n={n} className={`relative h-full inline-flex items-center px-2.5 sm:px-3 text-[0.9rem] font-semibold whitespace-nowrap ${isActive(n) ? "text-white after:absolute after:inset-x-2.5 after:bottom-0 after:h-[3px] after:bg-brass" : "text-white/80 hover:text-white"}`}>
                  {pick(n.label)}
                </L>
              </li>
            ))}
            <li ref={desksRef} className="shrink-0 ml-auto hidden lg:block">
              <button onClick={() => setDesks(d => !d)} aria-expanded={desks} aria-controls="all-desks" className={`h-full inline-flex items-center gap-1 px-3 text-[0.9rem] font-semibold ${desks ? "text-white" : "text-white/80 hover:text-white"}`}>
                {fr ? "Tous les thèmes" : "All desks"} <ChevronDown className={`h-4 w-4 transition-transform ${desks ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
            </li>
          </ul>
          {desks && (
            <div id="all-desks" className="absolute right-0 top-full w-[min(760px,calc(100vw-32px))] bg-surface text-ink border border-line border-t-[3px] border-t-brass shadow-xl">
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 p-2">
                {TOPICS.map(tp => (
                  <li key={tp.id}>
                    <Link to="/news" search={{ section: tp.id }} className="block px-4 py-2.5 rounded-[3px] font-semibold hover:bg-ice">{pick(tp.label)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Full menu: every section, grouped. */}
      {open && (
        <div id="site-menu" ref={menuRef} role="region" aria-label={fr ? "Menu" : "Menu"} className="fixed inset-x-0 top-0 bottom-0 z-50 overflow-y-auto bg-paper">
          <div className="container-mw py-4">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <Logo compact />
              <Link to="/search" className="ml-auto inline-flex items-center gap-2 h-11 px-3 rounded-[4px] font-semibold hover:bg-ice"><Search className="h-5 w-5" aria-hidden="true" />{fr ? "Rechercher" : "Search"}</Link>
              <button onClick={() => { setOpen(false); menuBtn.current?.focus(); }} className="inline-flex items-center gap-2 h-11 px-3 rounded-[4px] font-semibold hover:bg-ice">
                <X className="h-5 w-5" aria-hidden="true" />{fr ? "Fermer" : "Close"}
              </button>
            </div>
            <div className="grid gap-x-10 gap-y-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
              {groups.map(g => (
                <div key={g.title.en}>
                  <p className="kicker border-b-2 border-ink pb-2 text-ink">{pick(g.title)}</p>
                  <ul>
                    {g.items.map(n => (
                      <li key={pick(n.label)}><L n={n} className="block py-2.5 border-b border-line font-serif text-[1.1rem] hover:text-lake">{pick(n.label)}</L></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-ink pt-4 pb-10">
              <p className="kicker text-ink">{fr ? "Tous les thèmes" : "All desks"}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {TOPICS.map(tp => (
                  <li key={tp.id}><Link to="/news" search={{ section: tp.id }} className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.9rem] font-semibold hover:border-ink">{pick(tp.label)}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
