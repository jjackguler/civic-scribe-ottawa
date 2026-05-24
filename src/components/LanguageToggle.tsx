import { useLocale } from "@/lib/locale-context";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div className={`inline-flex items-center text-[11px] font-sans uppercase tracking-[0.14em] border border-rule ${className}`}>
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 transition-colors ${locale === "en" ? "bg-ink text-paper" : "hover:bg-secondary"}`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("fr")}
        className={`px-2.5 py-1 transition-colors ${locale === "fr" ? "bg-ink text-paper" : "hover:bg-secondary"}`}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
    </div>
  );
}
