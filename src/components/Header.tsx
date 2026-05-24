import { Link } from "@tanstack/react-router";
import { Search, Heart, PenSquare, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

const PRIMARY: { key: any; to: string }[] = [
  { key: "ottawaGuide", to: "/guide/ottawa" },
  { key: "activities", to: "/activities" },
  { key: "kidsFamily", to: "/kids" },
  { key: "youth", to: "/youth" },
  { key: "deals", to: "/deals" },
  { key: "canadaGuide", to: "/guide/canada" },
];

const SECONDARY: { key: any; to: string }[] = [
  { key: "pulse", to: "/pulse" },
  { key: "neighborhoods", to: "/neighborhoods" },
  { key: "politics", to: "/section/politics" },
  { key: "factCheck", to: "/fact-check" },
  { key: "solutions", to: "/solutions" },
  { key: "sportsHub", to: "/sports" },
  { key: "food", to: "/food" },
  { key: "traffic", to: "/traffic" },
  { key: "weather", to: "/weather" },
  { key: "events", to: "/events" },
  { key: "jobs", to: "/jobs" },
  { key: "trendDesk", to: "/trend-desk" },
  { key: "linkToStory", to: "/link-to-story" },
  { key: "canada", to: "/section/canada" },
  { key: "world", to: "/section/world" },
];

export function Header() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const today = new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80 rule-bottom">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="hidden md:flex items-center justify-between py-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>{today}</span>
          <span className="font-serif italic normal-case tracking-normal text-[12px]">{t("supportLine", locale)}</span>
          <div className="flex items-center gap-4"><LanguageToggle /></div>
        </div>

        <div className="flex items-center justify-between py-4 md:py-5 border-t border-rule">
          <button className="md:hidden p-2 -ml-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1 md:flex-none text-center md:text-left">
            <Link to="/" className="inline-block group">
              <div className="kicker text-civic-red">Ottawa · Canada</div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-[2.6rem] leading-none tracking-tight">{t("brand", locale)}</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2 hover:text-civic-red" aria-label={t("search", locale)}><Search className="h-5 w-5" /></button>
            <Link to="/donate" className="hidden sm:inline-flex items-center gap-1.5 border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-paper transition-colors">
              <Heart className="h-3.5 w-3.5" /> {t("donate", locale)}
            </Link>
            <Link to="/submit" className="hidden sm:inline-flex items-center gap-1.5 bg-civic-red text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-ink transition-colors">
              <PenSquare className="h-3.5 w-3.5" /> {t("submit", locale)}
            </Link>
          </div>
        </div>

        <nav className="hidden md:block border-t border-rule">
          <ul className="flex items-center gap-1 lg:gap-2 py-2.5 text-sm">
            {PRIMARY.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="inline-flex items-center px-3 py-1.5 font-semibold tracking-tight hover:text-civic-red transition-colors data-[status=active]:text-civic-red data-[status=active]:bg-secondary">
                  {t(s.key, locale)}
                </Link>
              </li>
            ))}
            <li className="relative ml-auto">
              <button
                onClick={() => setMoreOpen(o => !o)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold border border-rule hover:border-ink"
              >
                {t("more", locale)} <ChevronDown className="h-3 w-3" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 bg-paper border border-rule shadow-lg py-2 min-w-[260px] z-50">
                  <ul className="grid grid-cols-2 gap-x-2">
                    {SECONDARY.map(s => (
                      <li key={s.to}>
                        <Link to={s.to} onMouseDown={() => setMoreOpen(false)} className="block px-3 py-1.5 text-[13px] hover:text-civic-red hover:bg-secondary">
                          {t(s.key, locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </nav>

        {open && (
          <nav className="md:hidden pb-4 border-t border-rule">
            <div className="pt-3 mb-2 kicker text-civic-red">{locale === "fr" ? "Découvrir" : "Discover"}</div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-semibold">
              {PRIMARY.map((s) => (
                <li key={s.to}><Link to={s.to} onClick={() => setOpen(false)} className="block py-1">{t(s.key, locale)}</Link></li>
              ))}
            </ul>
            <div className="mt-4 mb-2 kicker text-muted-foreground">{locale === "fr" ? "Salle de presse" : "Newsroom"}</div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {SECONDARY.map((s) => (
                <li key={s.to}><Link to={s.to} onClick={() => setOpen(false)} className="block py-1">{t(s.key, locale)}</Link></li>
              ))}
            </ul>
            <div className="flex gap-2 mt-4">
              <Link to="/donate" onClick={() => setOpen(false)} className="flex-1 text-center border border-ink py-2 text-xs uppercase tracking-wider font-semibold">{t("donate", locale)}</Link>
              <Link to="/submit" onClick={() => setOpen(false)} className="flex-1 text-center bg-civic-red text-white py-2 text-xs uppercase tracking-wider font-semibold">{t("submit", locale)}</Link>
            </div>
            <div className="mt-3"><LanguageToggle /></div>
          </nav>
        )}
      </div>
    </header>
  );
}
