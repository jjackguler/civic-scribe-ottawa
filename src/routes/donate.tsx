import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { DONATION_TIERS, DONATION_IMPACT } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useState } from "react";
import { Heart, Check, Lock, Receipt } from "lucide-react";
import { z } from "zod";
import { t } from "@/lib/i18n";

const searchSchema = z.object({ amount: z.coerce.number().optional() });

export const Route = createFileRoute("/donate")({
  validateSearch: searchSchema,
  head: () => ({ meta: [
    { title: "Support citizen journalism — Ottawa Civic Ledger" },
    { name: "description", content: "Donate to support bilingual, independent, reader-funded journalism in Ottawa." },
    { property: "og:title", content: "Support Ottawa Civic Ledger" },
    { property: "og:description", content: "Civic journalism belongs to its readers — no paywall, no billionaire owner." },
  ] }),
  component: DonatePage,
});

function DonatePage() {
  const { amount: initial } = Route.useSearch();
  const { locale } = useLocale();
  const [freq, setFreq] = useState<"one" | "monthly">("monthly");
  const [amount, setAmount] = useState<number>(initial ?? 25);
  const [done, setDone] = useState(false);

  const impactKey = [...DONATION_TIERS].reverse().find(tier => amount >= tier) ?? DONATION_TIERS[0];
  const impact = DONATION_IMPACT[impactKey];

  return (
    <PageShell narrow>
      <PageHero
        kicker={locale === "fr" ? "Soutenir" : "Support"}
        title={locale === "fr" ? "Le journalisme civique appartient à ses lecteurs." : "Civic journalism belongs to its readers."}
        dek={locale === "fr" ? "Sans paywall. Sans publicité agressive. Sans propriétaire milliardaire." : "No paywall. No aggressive advertising. No billionaire owner."}
      />

      {done ? (
        <div className="bg-solution/10 border-l-4 border-solution p-6">
          <h2 className="font-display text-3xl">{locale === "fr" ? "Merci." : "Thank you."}</h2>
          <p className="font-serif mt-2 text-foreground/80">
            {locale === "fr"
              ? `Votre engagement ${freq === "monthly" ? "mensuel" : "unique"} de ${amount} $ finance directement nos reporters, nos vérifications et nos traductions.`
              : `Your ${freq === "monthly" ? "monthly" : "one-time"} gift of $${amount} directly funds reporters, fact-checking, and translation.`}
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-7">
          <div className="inline-flex gap-1 p-1 bg-secondary border border-rule">
            {(["monthly","one"] as const).map(f => (
              <button key={f} type="button" onClick={() => setFreq(f)}
                className={`px-5 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${freq === f ? "bg-ink text-paper" : "text-foreground hover:bg-paper"}`}>
                {f === "one" ? t("oneTime", locale) : t("monthly", locale)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {DONATION_TIERS.map(tier => (
              <button key={tier} type="button" onClick={() => setAmount(tier)}
                className={`py-5 border text-lg font-display transition-all ${amount === tier ? "border-civic-red bg-civic-red/5 text-civic-red shadow-[inset_0_-3px_0_var(--civic-red)]" : "border-rule hover:border-ink"}`}>
                ${tier}
              </button>
            ))}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display">$</span>
            <input type="number" min={1} max={100000} value={amount} onChange={e => setAmount(Number(e.target.value) || 0)}
              className="font-display text-5xl bg-transparent border-b-2 border-rule focus:border-civic-red outline-none w-44" />
            <span className="text-sm text-muted-foreground">CAD {freq === "monthly" ? `/ ${locale === "fr" ? "mois" : "month"}` : ""}</span>
          </div>

          {amount > 0 && (
            <div className="bg-card border-l-4 border-civic-red p-4 flex items-start gap-3">
              <Heart className="h-4 w-4 text-civic-red shrink-0 mt-0.5" />
              <p className="font-serif text-sm text-foreground/85">
                <span className="kicker text-civic-red">{locale === "fr" ? "Votre impact" : "Your impact"}</span>
                <br />
                {impact[locale]}
              </p>
            </div>
          )}

          <button type="submit" className="w-full bg-civic-red text-white py-4 text-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-ink transition-colors">
            <Heart className="h-4 w-4" /> {locale === "fr" ? `Donner ${amount} $ ${freq === "monthly" ? "par mois" : ""}` : `Donate $${amount}${freq === "monthly" ? " / month" : ""}`}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-serif">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3 w-3" /> {t("secureCheckout", locale)}</span>
            <span className="inline-flex items-center gap-1.5"><Receipt className="h-3 w-3" /> {t("taxReceipt", locale)}</span>
          </div>
        </form>
      )}

      <section className="mt-14">
        <h2 className="kicker text-civic-red mb-4">{t("whereGoes", locale)}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
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
        </div>
      </section>

      <section className="mt-10 p-6 bg-secondary border-l-4 border-ink">
        <strong className="font-sans uppercase tracking-wider text-xs">{t("fundingTransparency", locale)}</strong>
        <p className="mt-2 font-serif text-sm text-foreground/85">{locale === "fr"
          ? "76 % de notre budget vient des lecteurs. 18 % de subventions de journalisme local. 6 % de commandites clairement étiquetées. Aucun donateur n'a de droit de regard éditorial."
          : "76% of our budget comes from readers. 18% from local journalism grants (Canada Local Journalism Initiative). 6% from clearly labeled sponsorships. No donor has editorial influence."}</p>
        <div className="mt-4 h-2 flex overflow-hidden">
          <span className="bg-civic-red" style={{ width: "76%" }} />
          <span className="bg-river" style={{ width: "18%" }} />
          <span className="bg-highlight" style={{ width: "6%" }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span><span className="text-civic-red">●</span> {locale === "fr" ? "Lecteurs 76 %" : "Readers 76%"}</span>
          <span><span className="text-river">●</span> {locale === "fr" ? "Subventions 18 %" : "Grants 18%"}</span>
          <span><span className="text-highlight">●</span> {locale === "fr" ? "Commandites 6 %" : "Sponsorships 6%"}</span>
        </div>
      </section>
    </PageShell>
  );
}
