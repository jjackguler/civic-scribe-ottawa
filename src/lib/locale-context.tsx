import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale } from "./i18n";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; toggle: () => void };
const LocaleContext = createContext<Ctx>({ locale: "en", setLocale: () => {}, toggle: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ocl-locale") as Locale | null;
      if (saved === "en" || saved === "fr") setLocaleState(saved);
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("ocl-locale", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggle: () => setLocale(locale === "en" ? "fr" : "en") }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
