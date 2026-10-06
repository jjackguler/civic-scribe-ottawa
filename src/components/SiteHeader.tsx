import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LiveTicker } from "./LiveTicker";
import { useLocale } from "@/lib/locale-context";
import { t, type DictKey } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const NAV: { to: "/news" | "/funding" | "/tools" | "/learn" | "/editor"; key: DictKey }[] = [
  { to: "/news", key: "news" },
  { to: "/funding", key: "funding" },
  { to: "/tools", key: "tools" },
  { to: "/learn", key: "learn" },
  { to: "/editor", key: "editorsDesk" },
];

export function SiteHeader() {
  const { locale, setLocale } = useLocale();
  const path = useRouterState({ select: s => s.location.pathname });
  const [open, setOpen] = useState(false);

  const dateLine = new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long", month: "long", day: "numeric", timeZone: "America/Toronto",
  });

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">{t("skip", locale)}</a>
      <LiveTicker />
      <header className="bg-surface border-b border-line sticky top-0 z-40">
        <div className="container-mw flex items-center gap-6 h-16">
          <Link to="/" aria-label={`${SITE.name} — home`} onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <p className="hidden xl:block meta border-l border-line pl-5" suppressHydrationWarning>
            {SITE.tagline[locale]}<br />
            <span className="capitalize">{dateLine}</span>
          </p>
          <nav aria-label="Sections" className="hidden md:flex items-center gap-1 ml-auto">
            {NAV.map(n => {
              const active = path === n.to || path.startsWith(n.to + "/");
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 rounded-[5px] text-[0.95rem] font-semibold transition-colors ${active ? "bg-ice text-ink" : "text-ink/75 hover:text-ink hover:bg-ice/60"}`}
                >
                  {t(n.key, locale)}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
            className="ml-auto md:ml-2 text-sm font-semibold px-3 py-1.5 rounded-[5px] border border-line hover:border-ink"
            lang={locale === "en" ? "fr" : "en"}
          >
            {t("lang", locale)}
          </button>
          <button className="md:hidden p-2 -mr-2" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <nav aria-label="Sections" className="md:hidden border-t border-line bg-surface">
            <div className="container-mw py-2 flex flex-col">
              {NAV.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-lg font-semibold border-b border-line last:border-0">
                  {t(n.key, locale)}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
