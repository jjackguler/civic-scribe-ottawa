import { Link } from "@tanstack/react-router";
import { Search, Heart, PenSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

const SECTIONS: { key: any; to: string }[] = [
  { key: "ottawa", to: "/" },
  { key: "pulse", to: "/pulse" },
  { key: "trendDesk", to: "/trend-desk" },
  { key: "neighborhoods", to: "/neighborhoods" },
  { key: "sportsHub", to: "/sports" },
  { key: "food", to: "/food" },
  { key: "politics", to: "/section/politics" },
  { key: "traffic", to: "/traffic" },
  { key: "weather", to: "/weather" },
  { key: "events", to: "/events" },
  { key: "jobs", to: "/jobs" },
  { key: "factCheck", to: "/fact-check" },
  { key: "solutions", to: "/solutions" },
  { key: "linkToStory", to: "/link-to-story" },
  { key: "canada", to: "/section/canada" },
  { key: "world", to: "/section/world" },
];


export function Header() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80 rule-bottom">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Top meta row */}
        <div className="hidden md:flex items-center justify-between py-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>{today}</span>
          <span className="font-serif italic normal-case tracking-normal text-[12px]">
            {t("supportLine", locale)}
          </span>
          <div className="flex items-center gap-4">
            <LanguageToggle />
          </div>
        </div>

        {/* Masthead */}
        <div className="flex items-center justify-between py-4 md:py-5 border-t border-rule">
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex-1 md:flex-none text-center md:text-left">
            <Link to="/" className="inline-block group">
              <div className="kicker text-civic-red">Ottawa · Canada</div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-[2.6rem] leading-none tracking-tight">
                {t("brand", locale)}
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2 hover:text-civic-red" aria-label={t("search", locale)}>
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/donate"
              className="hidden sm:inline-flex items-center gap-1.5 border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-paper transition-colors"
            >
              <Heart className="h-3.5 w-3.5" /> {t("donate", locale)}
            </Link>
            <Link
              to="/submit"
              className="hidden sm:inline-flex items-center gap-1.5 bg-civic-red text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-ink transition-colors"
            >
              <PenSquare className="h-3.5 w-3.5" /> {t("submit", locale)}
            </Link>
          </div>
        </div>

        {/* Section nav */}
        <nav className="hidden md:block border-t border-rule">
          <ul className="flex items-center gap-5 lg:gap-6 overflow-x-auto py-3 text-[13px] font-sans">
            {SECTIONS.map((s) => (
              <li key={s.to + s.key}>
                <Link
                  to={s.to}
                  className="whitespace-nowrap hover:text-civic-red transition-colors data-[status=active]:text-civic-red data-[status=active]:font-semibold"
                  activeOptions={{ exact: true }}
                >
                  {t(s.key, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {open && (
          <nav className="md:hidden pb-4 border-t border-rule">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.to + s.key}>
                  <Link to={s.to} onClick={() => setOpen(false)} className="block py-1">
                    {t(s.key, locale)}
                  </Link>
                </li>
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
