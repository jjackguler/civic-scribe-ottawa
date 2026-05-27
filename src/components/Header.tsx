import { Link } from "@tanstack/react-router";
import { Search, Heart, PenSquare, Menu, X, AlertTriangle, MapPin, Car, Hash, MessageSquare, Mic2, Lightbulb, Palette, Calendar, Newspaper } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

const TABS: { label: string; to: string; icon: any; pulse?: boolean }[] = [
  { label: "News",          to: "/",              icon: Newspaper, pulse: true },
  { label: "Ottawa Map",    to: "/map",           icon: MapPin },
  { label: "Social Trends", to: "/social",        icon: Hash },
  { label: "Traffic",       to: "/traffic",       icon: Car },
  { label: "Interviews",    to: "/interviews",    icon: Mic2 },
  { label: "Opinion",       to: "/opinion",       icon: MessageSquare },
  { label: "Culture",       to: "/editorial",     icon: Palette },
  { label: "Cartoons",      to: "/cartoons",      icon: Palette },
  { label: "Solutions",     to: "/solutions",     icon: Lightbulb },
  { label: "Events",        to: "/events",        icon: Calendar },
  { label: "Letters",       to: "/letters",       icon: PenSquare },
];

export function Header() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85 rule-bottom">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="hidden md:flex items-center justify-between py-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>{today}</span>
          <span className="font-serif italic normal-case tracking-normal text-[12px]">{t("supportLine", locale)}</span>
          <div className="flex items-center gap-4"><LanguageToggle /></div>
        </div>

        <div className="flex items-center justify-between py-3 md:py-4 border-t border-rule">
          <button className="md:hidden p-2 -ml-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1 md:flex-none text-center md:text-left">
            <Link to="/" className="inline-block group">
              <div className="kicker text-civic-red">Ottawa · Canada</div>
              <h1 className="font-display text-xl sm:text-2xl md:text-[2.2rem] leading-none tracking-tight">{t("brand", locale)}</h1>
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
          <div className="overflow-x-auto scrollbar-thin">
            <ul className="flex items-center gap-1 py-2 text-[13px] min-w-max">
              {TABS.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.to + s.label}>
                    <Link
                      to={s.to as any}
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold tracking-tight hover:text-civic-red transition-colors data-[status=active]:text-civic-red data-[status=active]:bg-secondary whitespace-nowrap"
                      activeProps={{ className: "text-civic-red bg-secondary" }}
                    >
                      <Icon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                      {s.label}
                      {s.pulse && <span className="ticker-dot ml-1" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {open && (
          <nav className="md:hidden pb-4 border-t border-rule">
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 text-sm font-semibold">
              {TABS.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.to + s.label}>
                    <Link to={s.to as any} onClick={() => setOpen(false)} className="flex items-center gap-2 py-1.5">
                      <Icon className="h-4 w-4 text-civic-red" />
                      {s.label}
                      {s.pulse && <span className="ticker-dot ml-1" />}
                    </Link>
                  </li>
                );
              })}
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
