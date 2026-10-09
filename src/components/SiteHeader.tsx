import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { LiveTicker } from "./LiveTicker";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { TOPICS, type SectionId } from "@/lib/news";
import { SITE } from "@/lib/site";
import { localePath } from "@/lib/seo";
import type { Bi } from "@/lib/i18n";

type Item = { label: Bi; to: string; section?: SectionId };

const MAIN: Item[] = [
  { label: { en: "Latest", fr: "En continu" }, to: "/news" },
  { label: { en: "Dispatches", fr: "Dépêches" }, to: "/dispatch" },
  { label: { en: "Explainers", fr: "Explicatifs" }, to: "/originals" },
  { label: { en: "Labs", fr: "Labs" }, to: "/labs" },
  { label: { en: "Ask the Keeper", fr: "Demandez au Gardien" }, to: "/ask" },
  { label: { en: "Watch", fr: "Vidéos" }, to: "/watch" },
  { label: { en: "Made with AI", fr: "Fait avec l'IA" }, to: "/showcase" },
  { label: { en: "Podcasts", fr: "Balados" }, to: "/listen" },
];

const MORE: Item[] = [
  { label: { en: "World", fr: "Monde" }, to: "/news", section: "world" },
  { label: { en: "Canada", fr: "Canada" }, to: "/news", section: "canada" },
  { label: { en: "Interviews", fr: "Entrevues" }, to: "/interviews" },
  { label: { en: "Policy", fr: "Politiques" }, to: "/news", section: "policy" },
  { label: { en: "Analysis", fr: "Analyses" }, to: "/news", section: "analysis" },
  { label: { en: "AI Ministry tracker", fr: "Suivi du ministère de l'IA" }, to: "/ministry" },
  { label: { en: "Government", fr: "Gouvernement" }, to: "/government" },
  { label: { en: "From the labs", fr: "Des laboratoires" }, to: "/news", section: "labs" },
  { label: { en: "Trending", fr: "Tendances" }, to: "/news", section: "trending" },
  { label: { en: "Tools worth trying", fr: "Outils à essayer" }, to: "/tools" },
  { label: { en: "Learn AI", fr: "Apprendre l'IA" }, to: "/learn" },
  { label: { en: "Funding", fr: "Financement" }, to: "/funding" },
  { label: { en: "Editor's desk", fr: "Mot de la rédaction" }, to: "/editor" },
];

export function SiteHeader() {
  const { locale, pick } = useLocale();
  const loc = useRouterState({ select: s => s.location });
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<null | "topics" | "more">(null);
  const navRef = useRef<HTMLDivElement>(null);
  const currentSection = (loc.search as { section?: string })?.section;
  // Young Lab keeps children away from open AI chat: no Keeper link there.
  const mainNav = loc.pathname.includes("/labs/young") ? MAIN.filter(n => n.to !== "/ask") : MAIN;

  useEffect(() => { setMenu(null); setOpen(false); }, [loc.pathname, currentSection]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !navRef.current?.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [menu]);

  const isActive = (n: Item) =>
    n.section ? loc.pathname === "/news" && currentSection === n.section
      : n.to === "/news" ? loc.pathname === "/news" && !currentSection
      : loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");

  const dateLine = new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const L = ({ n, className, children }: { n: Item; className: string; children: ReactNode }) => (
    <Link to={n.to as never} search={(n.section ? { section: n.section } : undefined) as never} className={className}>{children}</Link>
  );

  const barLink = (n: Item) => (
    <L key={pick(n.label)} n={n} className={`relative px-2.5 h-full inline-flex items-center text-[0.95rem] font-semibold whitespace-nowrap transition-colors ${isActive(n) ? "text-white after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-[3px] after:bg-brass" : "text-white/80 hover:text-white"}`}>
      {pick(n.label)}
    </L>
  );

  const toggle = (id: "topics" | "more", label: string) => (
    <button
      onClick={() => setMenu(m => (m === id ? null : id))}
      aria-expanded={menu === id}
      className={`px-2.5 h-full inline-flex items-center gap-1 text-[0.95rem] font-semibold whitespace-nowrap ${menu === id ? "text-white" : "text-white/80 hover:text-white"}`}
    >
      {label} <ChevronDown className={`h-4 w-4 transition-transform ${menu === id ? "rotate-180" : ""}`} aria-hidden="true" />
    </button>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">{t("skip", locale)}</a>

      <div className="bg-night text-white/75 border-b border-white/10 text-[0.82rem]">
        <div className="container-mw flex items-center gap-5 h-8">
          <p className="capitalize truncate" suppressHydrationWarning>{dateLine}</p>
          <nav aria-label="Company" className="ml-auto flex items-center gap-4 shrink-0">
            <Link to="/advertise" className="hover:text-white">{locale === "fr" ? "Annoncer" : "Advertise"}</Link>
            <Link to="/newsletter" className="hidden sm:inline hover:text-white">{locale === "fr" ? "Infolettre" : "Newsletter"}</Link>
            <Link to="/values" className="hidden md:inline hover:text-white">{locale === "fr" ? "Nos valeurs" : "Our values"}</Link>
            <a
              href={localePath(loc.href, locale === "en" ? "fr" : "en")}
              hrefLang={locale === "en" ? "fr" : "en"}
              className="font-semibold text-white hover:text-brass"
              lang={locale === "en" ? "fr" : "en"}
            >
              {t("lang", locale)}
            </a>
          </nav>
        </div>
      </div>

      <header className="bg-night text-white sticky top-0 z-40 shadow-[0_1px_0_rgba(255,255,255,0.08)]">
        <div ref={navRef} className="container-mw relative flex items-center gap-5 h-[62px]">
          <button className="xl:hidden p-2 -ml-2" aria-label={t("menu", locale)} aria-expanded={open} onClick={() => setOpen(o => !o)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link to="/" aria-label={`${SITE.name} — home`} className="shrink-0">
            <Logo compact inverse />
          </Link>
          <nav aria-label="Sections" className="hidden xl:flex items-stretch h-full ml-auto">
            {barLink(MAIN[0])}
            {toggle("topics", locale === "fr" ? "Thèmes" : "Topics")}
            {mainNav.slice(1).map(barLink)}
            {toggle("more", locale === "fr" ? "Plus" : "More")}
          </nav>
          <Link
            to="/search"
            aria-label={locale === "fr" ? "Rechercher" : "Search"}
            title={locale === "fr" ? "Rechercher" : "Search"}
            className={`ml-auto xl:ml-1 p-2 -mr-2 xl:mr-0 rounded-[4px] ${loc.pathname === "/search" ? "text-brass" : "text-white/85 hover:text-white"}`}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          {menu === "topics" && (
            <div className="absolute right-4 md:right-7 top-full w-[min(760px,calc(100vw-32px))] bg-night-2 border-t-[3px] border-brass shadow-xl">
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
                {TOPICS.map(tp => (
                  <li key={tp.id}>
                    <Link to="/news" search={{ section: tp.id }} className="block px-5 py-3 border-b border-r border-white/10 font-semibold hover:bg-white/10 hover:text-brass">
                      {pick(tp.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {menu === "more" && (
            <div className="absolute right-4 md:right-7 top-full w-[280px] bg-night-2 border-t-[3px] border-brass shadow-xl">
              <ul>
                {MORE.map(n => (
                  <li key={pick(n.label)}>
                    <L n={n} className="block px-5 py-3 border-b border-white/10 font-semibold hover:bg-white/10 hover:text-brass">{pick(n.label)}</L>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {open && (
          <nav aria-label="Sections" className="xl:hidden border-t border-white/15 bg-night max-h-[calc(100vh-62px)] overflow-y-auto">
            <div className="container-mw py-3 grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col">
                {mainNav.map(n => <L key={pick(n.label)} n={n} className="py-2.5 text-lg font-semibold border-b border-white/15">{pick(n.label)}</L>)}
                {MORE.map(n => <L key={pick(n.label)} n={n} className="py-2.5 font-semibold border-b border-white/15 text-white/85">{pick(n.label)}</L>)}
              </div>
              <div>
                <p className="masthead-serif text-brass text-lg mb-1">{locale === "fr" ? "Thèmes" : "Topics"}</p>
                <div className="flex flex-col">
                  {TOPICS.map(tp => (
                    <Link key={tp.id} to="/news" search={{ section: tp.id }} className="py-2 border-b border-white/10 text-white/85">{pick(tp.label)}</Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      <div className="bg-surface border-b border-line">
        <div className="container-mw flex items-center gap-4 h-10 text-[0.85rem]">
          <LiveTicker />
        </div>
      </div>
    </>
  );
}
