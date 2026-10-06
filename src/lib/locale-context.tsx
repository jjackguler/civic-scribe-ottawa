import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Bi, Locale } from "./i18n";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; pick: (b: Bi) => string };
const LocaleContext = createContext<Ctx>({ locale: "en", setLocale: () => {}, pick: (b) => b.en });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("maplewire-locale");
      if (saved === "en" || saved === "fr") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      } else if (navigator.language?.toLowerCase().startsWith("fr")) {
        setLocaleState("fr");
        document.documentElement.lang = "fr";
      }
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("maplewire-locale", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, pick: (b) => b[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
