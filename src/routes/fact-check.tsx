import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { FACT_CHECKS } from "@/lib/data";
import { FactCheckCard } from "@/components/FactCheckCard";
import { useLocale } from "@/lib/locale-context";
import { useState } from "react";

export const Route = createFileRoute("/fact-check")({
  head: () => ({ meta: [{ title: "Fact Check — Ottawa Civic Ledger" }, { name: "description", content: "Verify claims about Ottawa and Canadian civic life." }] }),
  component: FactCheckPage,
});

function FactCheckPage() {
  const { locale } = useLocale();
  const [claim, setClaim] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Vérification des faits" : "Fact check"}
        title={locale === "fr" ? "Ce qui est vrai, ce qui ne l'est pas" : "What's true. What isn't. With sources."}
        dek={locale === "fr" ? "Nous vérifions les affirmations qui circulent à Ottawa. Soumettez la vôtre." : "We verify claims circulating in Ottawa. Submit yours."}
      />

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setClaim(""); }}
          className="lg:col-span-3 bg-card border border-rule p-6"
        >
          <label className="kicker text-civic-red">{locale === "fr" ? "Soumettre une affirmation" : "Submit a claim"}</label>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <input
              value={claim}
              onChange={e => setClaim(e.target.value)}
              maxLength={300}
              placeholder={locale === "fr" ? "Ex. : « Les frais de stationnement ont doublé… »" : 'e.g. "Parking fees doubled overnight…"'}
              className="flex-1 bg-paper border border-rule px-4 py-3 font-serif"
            />
            <button className="bg-civic-red text-white px-5 py-3 text-xs uppercase tracking-wider font-semibold">
              {locale === "fr" ? "Demander une vérification" : "Request verification"}
            </button>
          </div>
          {submitted && <p className="text-sm font-serif text-solution mt-3">{locale === "fr" ? "Merci. Votre demande est dans la file." : "Thank you. Your request is in our queue."}</p>}
        </form>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {FACT_CHECKS.map(f => <FactCheckCard key={f.id} fc={f} />)}
      </div>

      <section className="mt-14 p-6 bg-secondary max-w-3xl">
        <h3 className="font-display text-2xl">{locale === "fr" ? "Notre méthodologie" : "Our methodology"}</h3>
        <ol className="mt-3 space-y-2 font-serif text-foreground/80 list-decimal pl-5">
          <li>{locale === "fr" ? "Retrouver la source primaire." : "Locate the primary source."}</li>
          <li>{locale === "fr" ? "Recouper avec au moins deux sources indépendantes." : "Corroborate with at least two independent sources."}</li>
          <li>{locale === "fr" ? "Demander un commentaire à toute personne nommée." : "Seek comment from anyone named."}</li>
          <li>{locale === "fr" ? "Publier le statut, les preuves, et la date de mise à jour." : "Publish status, evidence, and update date."}</li>
        </ol>
        <Link to="/about" hash="standards" className="inline-block mt-4 text-xs uppercase tracking-wider font-semibold border-b border-ink">
          {locale === "fr" ? "Lire nos normes éditoriales" : "Read editorial standards"} →
        </Link>
      </section>
    </PageShell>
  );
}
