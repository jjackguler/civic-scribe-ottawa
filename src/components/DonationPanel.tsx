import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { DONATION_TIERS } from "@/lib/data";

export function DonationPanel({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  return (
    <aside className={`border border-rule bg-card ${compact ? "p-5" : "p-7"}`}>
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-civic-red" />
        <span className="kicker text-civic-red">{locale === "fr" ? "Soutenir" : "Support"}</span>
      </div>
      <h3 className={`font-display ${compact ? "text-xl" : "text-2xl"} mt-2 leading-tight`}>
        {locale === "fr" ? "Soutenez le journalisme civique" : "Support citizen journalism"}
      </h3>
      <p className="text-sm font-serif text-muted-foreground mt-2">
        {locale === "fr"
          ? "Indépendant. Bilingue. Sans paywall. Financé par les lecteurs et publié dans l'intérêt public."
          : "Independent. Bilingual. No paywall. Reader-funded and published in the public interest."}
      </p>
      <div className="grid grid-cols-5 gap-1.5 mt-4">
        {DONATION_TIERS.map((t) => (
          <Link
            key={t}
            to="/donate"
            search={{ amount: t }}
            className="text-center text-sm py-2 border border-rule hover:border-ink hover:bg-ink hover:text-paper transition-colors font-semibold"
          >
            ${t}
          </Link>
        ))}
      </div>
      <Link to="/donate" className="block text-center mt-3 bg-civic-red text-white py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-ink transition-colors">
        {locale === "fr" ? "Faire un don" : "Donate now"}
      </Link>
    </aside>
  );
}
