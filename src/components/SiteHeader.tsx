import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LiveTicker } from "./LiveTicker";
import { useLocale } from "@/lib/locale-context";
import { t, type DictKey } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type NavItem = { key: DictKey; to: "/news" | "/government" | "/ministry" | "/tools" | "/learn" | "/editor"; section?: string };

// News sections first, like a broadcaster's front page; resources after.
const NAV: NavItem[] = [
  { key: "canada", to: "/news", section: "canada" },
  { key: "world", to: "/news", section: "world" },
  { key: "government", to: "/government" },
  { key: "ministry", to: "/ministry" },
  { key: "business", to: "/news", section: "business" },
  { key: "research", to: "/news", section: "research" },
  { key: "analysis", to: "/news", section: "analysis" },
  { key: "tools", to: "/tools" },
  { key: "learn", to: "/learn" },
  { key: "editorsDesk", to: "/editor" },
];

export function SiteHeader() {
  const { locale, setLocale } = useLocale();
  const loc = useRouterState({ select: s => s.location });
  const [open, setOpen] = useState(false);
  const currentSection = (loc.search as { section?: string })?.section;

  const isActive = (n: NavItem) =>
    n.section ? loc.pathname === "/news" && currentSection === n.section : loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");

  const dateLine = new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "America/Toronto",
  });

  const navLink = (n: NavItem, mobile = false) => (
    <Link
      key={n.key}
      to={n.to}
      search={n.section ? ({ section: n.section } as never) : undefined}
      onClick={() => setOpen(false)}
      className={mobile
        ? "py-3 text-lg font-semibold border-b border-white/15"
        : `relative px-2.5 h-full inline-flex items-center text-[0.95rem] font-semibold whitespace-nowrap transition-colors ${isActive(n) ? "text-white after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-[3px] after:bg-live" : "text-white/80 hover:text-white"}`}
    >
      {t(n.key, locale)}
    </Link>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">{t("skip", locale)}</a>
      <header className="bg-ink text-white sticky top-0 z-40">
        <div className="container-mw flex items-center gap-5 h-[60px]">
          <button className="lg:hidden p-2 -ml-2" aria-label={t("menu", locale)} aria-expanded={open} onClick={() => setOpen(o => !o)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link to="/" aria-label={`${SITE.name} — home`} onClick={() => setOpen(false)} className="shrink-0">
            <Logo compact inverse />
          </Link>
          <nav aria-label="Sections" className="hidden lg:flex items-stretch h-full overflow-x-auto no-scrollbar">
            {NAV.map(n => navLink(n))}
          </nav>
          <button
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
            className="ml-auto shrink-0 text-sm font-semibold px-3 py-1.5 rounded-[5px] border border-white/30 hover:border-white"
            lang={locale === "en" ? "fr" : "en"}
          >
            {t("lang", locale)}
          </button>
        </div>
        {open && (
          <nav aria-label="Sections" className="lg:hidden border-t border-white/15 bg-ink">
            <div className="container-mw py-2 flex flex-col">{NAV.map(n => navLink(n, true))}</div>
          </nav>
        )}
      </header>
      <div className="bg-surface border-b border-line">
        <div className="container-mw flex items-center gap-4 h-10 text-[0.85rem]">
          <p className="hidden md:block text-muted-ink shrink-0 capitalize" suppressHydrationWarning>{dateLine}</p>
          <LiveTicker />
        </div>
      </div>
    </>
  );
}
