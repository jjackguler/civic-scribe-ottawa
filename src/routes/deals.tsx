import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { DealCard } from "@/components/DealCard";
import { DEALS, type Deal } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";

const CATS: { id: Deal["category"] | "all"; en: string; fr: string }[] = [
  { id: "all", en: "All", fr: "Toutes" },
  { id: "grocery", en: "Grocery", fr: "Épicerie" },
  { id: "home", en: "Home", fr: "Maison" },
  { id: "kids", en: "Kids", fr: "Enfants" },
  { id: "clothing", en: "Clothing", fr: "Vêtements" },
  { id: "electronics", en: "Electronics", fr: "Électronique" },
  { id: "back-to-school", en: "Back to School", fr: "Rentrée" },
  { id: "family", en: "Family", fr: "Famille" },
];

const SCOPES = [
  { id: "all", en: "All", fr: "Tout" },
  { id: "ottawa", en: "Ottawa only", fr: "Ottawa seulement" },
  { id: "canada", en: "Canada-wide", fr: "Pancanadien" },
  { id: "online", en: "Online", fr: "En ligne" },
] as const;

export const Route = createFileRoute("/deals")({
  head: () => ({ meta: [
    { title: "Verified Ottawa & Canada-wide deals — Sales tracker" },
    { name: "description", content: "Costco, Walmart, Canadian Tire, IKEA, Food Basics, Farm Boy and more — verified deals with expiry dates and locations." },
    { property: "og:title", content: "Sales & Deals — Ottawa Civic Ledger" },
    { property: "og:description", content: "Trustworthy deal tracking. Citizen-verified." },
  ]}),
  component: DealsPage,
});

function DealsPage() {
  const { locale } = useLocale();
  const [cat, setCat] = useState<string>("all");
  const [scope, setScope] = useState<string>("all");
  const [underTen, setUnderTen] = useState(false);

  const list = useMemo(() => DEALS.filter(d =>
    (cat === "all" || d.category === cat) &&
    (scope === "all" || d.location === scope) &&
    (!underTen || d.underTen)
  ), [cat, scope, underTen]);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Soldes et aubaines" : "Sales & Deals"}
        title={locale === "fr" ? "Aubaines vérifiées, à Ottawa et partout au Canada" : "Verified deals, Ottawa and Canada-wide"}
        dek={locale === "fr"
          ? "Costco, Walmart, Canadian Tire, IKEA, Food Basics, Farm Boy et plus."
          : "Costco, Walmart, Canadian Tire, IKEA, Food Basics, Farm Boy and more — with expiry and location."}
      />

      <div className="sticky top-[140px] md:top-[180px] z-20 -mx-4 sm:mx-0 mb-6 bg-paper/95 backdrop-blur py-2 rule-bottom">
        <div className="flex items-center gap-2 px-4 sm:px-0 overflow-x-auto no-scrollbar">
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`shrink-0 text-[11px] uppercase tracking-wider font-semibold border px-3 py-1.5 ${cat === c.id ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}>
              {c[locale]}
            </button>
          ))}
          <span className="shrink-0 w-px h-5 bg-rule mx-1" />
          {SCOPES.map(s => (
            <button key={s.id} onClick={() => setScope(s.id)}
              className={`shrink-0 text-[11px] uppercase tracking-wider font-semibold border px-3 py-1.5 ${scope === s.id ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}>
              {s[locale]}
            </button>
          ))}
          <button onClick={() => setUnderTen(v => !v)}
            className={`shrink-0 text-[11px] uppercase tracking-wider font-semibold border px-3 py-1.5 ${underTen ? "bg-civic-red text-paper border-civic-red" : "border-rule hover:border-ink"}`}>
            {locale === "fr" ? "Moins de 10 $" : "Under $10"}
          </button>
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4">{list.length} {locale === "fr" ? "aubaines" : "deals"}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {list.map(d => <DealCard key={d.id} d={d} />)}
      </div>

      {list.length === 0 && (
        <p className="text-center font-serif italic text-muted-foreground py-12">
          {locale === "fr" ? "Aucune aubaine ne correspond." : "No deals match your filters."}
        </p>
      )}

      <section className="mt-14 bg-secondary p-6">
        <h3 className="font-display text-2xl">{locale === "fr" ? "Comment nous vérifions" : "How we verify"}</h3>
        <p className="font-serif text-sm mt-2 text-foreground/80 max-w-3xl">
          {locale === "fr"
            ? "Chaque aubaine est confirmée par un éditeur ou un lecteur sur place. Les meilleurs prix signalés par la communauté sont mis à jour en moins d'une heure."
            : "Every deal is confirmed by an editor or a reader on the floor. Better prices flagged by the community are updated within an hour."}
        </p>
      </section>
    </PageShell>
  );
}
