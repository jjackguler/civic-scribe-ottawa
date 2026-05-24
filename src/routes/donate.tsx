import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { DONATION_TIERS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useState } from "react";
import { Heart, Check } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ amount: z.coerce.number().optional() });

export const Route = createFileRoute("/donate")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Support citizen journalism — Ottawa Civic Ledger" }, { name: "description", content: "Donate to support bilingual, independent, reader-funded journalism in Ottawa." }] }),
  component: DonatePage,
});

function DonatePage() {
  const { amount: initial } = Route.useSearch();
  const { locale } = useLocale();
  const [freq, setFreq] = useState<"one" | "monthly">("one");
  const [amount, setAmount] = useState<number>(initial ?? 25);
  const [done, setDone] = useState(false);

  return (
    <PageShell narrow>
      <PageHero
        kicker={locale === "fr" ? "Soutenir" : "Support"}
        title={locale === "fr" ? "Le journalisme civique appartient à ses lecteurs." : "Civic journalism belongs to its readers."}
        dek={locale === "fr" ? "Sans paywall. Sans publicité agressive. Sans propriétaire milliardaire." : "No paywall. No aggressive advertising. No billionaire owner."}
      />

      {done ? (
        <div className="bg-solution/10 border-l-4 border-solution p-6">
          <h2 className="font-display text-2xl">{locale === "fr" ? "Merci." : "Thank you."}</h2>
          <p className="font-serif mt-2">{locale === "fr" ? "Votre soutien finance directement nos reporters, nos vérifications et nos traductions." : "Your support directly funds reporters, fact-checking, and translation."}</p>
        </div>
      ) : (
      <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-6">
        <div className="flex gap-2 p-1 bg-secondary w-fit">
          {(["one","monthly"] as const).map(f => (
            <button key={f} type="button" onClick={() => setFreq(f)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${freq === f ? "bg-ink text-paper" : "text-foreground"}`}>
              {f === "one" ? (locale === "fr" ? "Don unique" : "One-time") : (locale === "fr" ? "Mensuel" : "Monthly")}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {DONATION_TIERS.map(t => (
            <button key={t} type="button" onClick={() => setAmount(t)}
              className={`py-4 border text-lg font-display transition-colors ${amount === t ? "border-civic-red bg-civic-red/5 text-civic-red" : "border-rule hover:border-ink"}`}>
              ${t}
            </button>
          ))}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-display">$</span>
          <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))}
            className="font-display text-5xl bg-transparent border-b-2 border-rule focus:border-civic-red outline-none w-40" />
          <span className="text-sm text-muted-foreground">CAD {freq === "monthly" ? `/ ${locale === "fr" ? "mois" : "month"}` : ""}</span>
        </div>

        <button type="submit" className="w-full bg-civic-red text-white py-4 text-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-ink transition-colors">
          <Heart className="h-4 w-4" /> {locale === "fr" ? `Donner ${amount}$ ${freq === "monthly" ? "par mois" : ""}` : `Donate $${amount} ${freq === "monthly" ? "/ month" : ""}`}
        </button>

        <p className="text-xs text-muted-foreground font-serif italic">
          {locale === "fr" ? "Démonstration. Aucun paiement n'est traité." : "Demonstration only. No payment is processed."}
        </p>
      </form>
      )}

      <section className="mt-14 grid sm:grid-cols-2 gap-4">
        {[
          { en: "Pays bilingual reporters covering all 18 neighborhoods.", fr: "Paie les reporters bilingues couvrant les 18 quartiers." },
          { en: "Funds independent fact-checking of viral civic claims.", fr: "Finance la vérification indépendante des affirmations virales." },
          { en: "Translates every major story into both official languages.", fr: "Traduit chaque reportage majeur dans les deux langues officielles." },
          { en: "Keeps the platform free, ad-light, and free of paywalls.", fr: "Garde la plateforme gratuite, sans paywall." },
        ].map((b, i) => (
          <div key={i} className="flex gap-3 p-4 border border-rule bg-card">
            <Check className="h-5 w-5 text-solution shrink-0 mt-0.5" />
            <p className="font-serif text-sm">{b[locale]}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 p-5 bg-secondary text-sm font-serif">
        <strong className="font-sans uppercase tracking-wider text-xs">{locale === "fr" ? "Transparence du financement" : "Funding transparency"}</strong>
        <p className="mt-2">{locale === "fr"
          ? "76 % de notre budget vient des lecteurs. 18 % de subventions de journalisme local. 6 % de commandites clairement étiquetées. Aucun donateur n'a de droit de regard éditorial."
          : "76% of our budget comes from readers. 18% from local journalism grants. 6% from clearly labeled sponsorships. No donor has editorial influence."}</p>
      </section>
    </PageShell>
  );
}
