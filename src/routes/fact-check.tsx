import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { FACT_CHECKS } from "@/lib/data";
import { FactCheckCard } from "@/components/FactCheckCard";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Clock } from "lucide-react";

const STATUS_FILTERS = [
  { key: "all" as const, label: { en: "All claims", fr: "Toutes" }, Icon: null, tone: "" },
  { key: "verified" as const, label: { en: "Verified true", fr: "Vrai vérifié" }, Icon: CheckCircle2, tone: "text-solution" },
  { key: "false" as const, label: { en: "False", fr: "Faux" }, Icon: XCircle, tone: "text-civic-red" },
  { key: "misleading" as const, label: { en: "Misleading", fr: "Trompeur" }, Icon: AlertTriangle, tone: "text-civic-red" },
  { key: "needs-context" as const, label: { en: "Needs context", fr: "Manque de contexte" }, Icon: HelpCircle, tone: "text-river" },
  { key: "review" as const, label: { en: "Under review", fr: "En cours" }, Icon: Clock, tone: "text-muted-foreground" },
];

export const Route = createFileRoute("/fact-check")({
  head: () => ({ meta: [
    { title: "Fact Check — Ottawa Civic Ledger" },
    { name: "description", content: "Verify claims about Ottawa and Canadian civic life." },
    { property: "og:title", content: "Fact Check — Ottawa Civic Ledger" },
    { property: "og:description", content: "We verify viral claims circulating in Ottawa, with sources." },
  ] }),
  component: FactCheckPage,
});

function FactCheckPage() {
  const { locale } = useLocale();
  const [claim, setClaim] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<typeof STATUS_FILTERS[number]["key"]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => FACT_CHECKS.filter(f => {
    if (filter !== "all" && f.status !== filter) return false;
    if (query && !f.claim[locale].toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [filter, query, locale]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: FACT_CHECKS.length };
    for (const f of FACT_CHECKS) c[f.status] = (c[f.status] ?? 0) + 1;
    return c;
  }, []);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Vérification des faits" : "Fact check"}
        title={locale === "fr" ? "Ce qui est vrai, ce qui ne l'est pas." : "What's true. What isn't. With sources."}
        dek={locale === "fr" ? "Nous vérifions les affirmations qui circulent à Ottawa. Soumettez la vôtre." : "We verify claims circulating in Ottawa. Submit yours."}
      />

      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setClaim(""); }}
        className="bg-card border border-rule p-6 mb-10"
      >
        <label className="kicker text-civic-red">{locale === "fr" ? "Soumettre une affirmation" : "Submit a claim"}</label>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <input
            value={claim}
            onChange={e => setClaim(e.target.value)}
            maxLength={300}
            placeholder={locale === "fr" ? "Ex. : « Les frais de stationnement ont doublé… »" : 'e.g. "Parking fees doubled overnight…"'}
            className="flex-1 bg-paper border border-rule px-4 py-3 font-serif focus:outline-none focus:border-civic-red"
          />
          <button className="bg-civic-red text-white px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-ink transition-colors">
            {locale === "fr" ? "Demander une vérification" : "Request verification"}
          </button>
        </div>
        {submitted && <p className="text-sm font-serif text-solution mt-3">{locale === "fr" ? "Merci. Votre demande est dans la file." : "Thank you. Your request is in our queue."}</p>}
      </form>

      <div className="rule-bottom rule-top py-4 mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map(s => {
            const Icon = s.Icon;
            const active = filter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilter(s.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold border transition-colors ${active ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}
              >
                {Icon && <Icon className={`h-3 w-3 ${active ? "" : s.tone}`} />}
                <span>{s.label[locale]}</span>
                <span className={`text-[10px] font-normal ${active ? "text-paper/60" : "text-muted-foreground"}`}>· {counts[s.key] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder", locale)}
          className="md:ml-auto bg-paper border border-rule px-3 py-2 text-sm font-serif focus:outline-none focus:border-civic-red md:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="font-serif italic text-muted-foreground py-10 text-center">{t("noResults", locale)}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {filtered.map(f => <FactCheckCard key={f.id} fc={f} />)}
        </div>
      )}

      <section className="mt-14 grid lg:grid-cols-[2fr_1fr] gap-8">
        <div className="p-6 bg-secondary">
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
        </div>
        <div className="p-6 border border-rule bg-card">
          <span className="kicker text-civic-red">{locale === "fr" ? "Comment nous étiquetons" : "How we label"}</span>
          <ul className="mt-3 space-y-2 text-sm font-serif">
            <li><span className="text-solution font-semibold">{locale === "fr" ? "Vrai vérifié" : "Verified true"}</span> — {locale === "fr" ? "deux sources primaires concordantes." : "two corroborating primary sources."}</li>
            <li><span className="text-civic-red font-semibold">{locale === "fr" ? "Faux" : "False"}</span> — {locale === "fr" ? "contredit par les preuves." : "contradicted by available evidence."}</li>
            <li><span className="text-civic-red font-semibold">{locale === "fr" ? "Trompeur" : "Misleading"}</span> — {locale === "fr" ? "vrai techniquement mais déformé hors contexte." : "technically true but distorted out of context."}</li>
            <li><span className="text-river font-semibold">{locale === "fr" ? "Manque de contexte" : "Needs context"}</span> — {locale === "fr" ? "partiellement vrai, manque des faits clés." : "partially true, missing key facts."}</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
