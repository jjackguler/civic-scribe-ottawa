import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { FoodCard } from "@/components/FoodCard";
import { SectionTicker } from "@/components/LiveTicker";
import { FOOD_PLACES, NEIGHBORHOODS, LIVE_TICKERS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";

const TAGS = ["coffee", "bakery", "halal", "vegan", "vegetarian", "filter-coffee", "brunch", "late-night"] as const;

export const Route = createFileRoute("/food")({
  head: () => ({ meta: [
    { title: "Ottawa Food & Coffee — Verified guides, neighborhood by neighborhood" },
    { name: "description", content: "Trending restaurants, new openings, coffee shops, bakeries, halal, vegan, and community-recommended places — labelled by editor or social trend." },
    { property: "og:title", content: "Ottawa Food & Coffee" },
    { property: "og:description", content: "Trustworthy local food coverage, not clickbait." },
  ] }),
  component: FoodPage,
});

function FoodPage() {
  const { locale } = useLocale();
  const [hood, setHood] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");
  const [price, setPrice] = useState<string>("all");
  const [openNow, setOpenNow] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const list = useMemo(() => FOOD_PLACES.filter(p =>
    (hood === "all" || p.neighborhood === hood) &&
    (tag === "all" || p.tags.includes(tag as typeof TAGS[number])) &&
    (price === "all" || p.priceRange === price) &&
    (!openNow || p.openNow) &&
    (!newOnly || p.newOpening) &&
    (!verifiedOnly || p.verified)
  ), [hood, tag, price, openNow, newOnly, verifiedOnly]);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Bouffe et café" : "Food & Coffee"}
        title={locale === "fr" ? "Ottawa à table, vérifiée." : "Ottawa, on a plate. Verified."}
        dek={locale === "fr"
          ? "Cafés, boulangeries, restaurants, et les nouveautés virales — étiquetées par notre équipe ou la tendance sociale."
          : "Cafés, bakeries, restaurants, and viral newcomers — labelled by our editors or by social trend."}
      />

      <div className="mb-8"><SectionTicker label={locale === "fr" ? "BOUFFE EN VOGUE" : "FOOD TRENDS"} items={LIVE_TICKERS.food} /></div>

      <div className="bg-card border border-rule p-4 mb-8 grid gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Sel value={hood} set={setHood} opts={["all", ...NEIGHBORHOODS]} label={locale === "fr" ? "Quartier" : "Neighborhood"} />
          <Sel value={tag} set={setTag} opts={["all", ...TAGS]} label={locale === "fr" ? "Type" : "Tag"} />
          <Sel value={price} set={setPrice} opts={["all", "$", "$$", "$$$"]} label={locale === "fr" ? "Budget" : "Budget"} />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { v: openNow, s: setOpenNow, l: locale === "fr" ? "Ouvert" : "Open now" },
            { v: newOnly, s: setNewOnly, l: locale === "fr" ? "Nouveautés" : "New openings" },
            { v: verifiedOnly, s: setVerifiedOnly, l: locale === "fr" ? "Vérifié éditeur" : "Editor verified" },
          ].map(c => (
            <button key={c.l} onClick={() => c.s(!c.v)} className={`text-[11px] uppercase tracking-wider font-semibold border px-2.5 py-1 ${c.v ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}>
              {c.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map(p => <FoodCard key={p.id} p={p} />)}
      </div>

      {list.length === 0 && (
        <p className="text-center font-serif italic text-muted-foreground py-12">
          {locale === "fr" ? "Aucun lieu ne correspond." : "No places match your filters."}
        </p>
      )}

      <section className="mt-14 bg-secondary p-6">
        <h3 className="font-display text-2xl">{locale === "fr" ? "À vérifier" : "Worth verifying"}</h3>
        <p className="font-serif text-sm mt-2 text-foreground/80 max-w-3xl">
          {locale === "fr"
            ? "Certaines affirmations virales — ouvertures, files d'attente, classements — sont étiquetées « non vérifié » jusqu'à la visite d'un de nos journalistes."
            : "Some viral claims — openings, lines, rankings — are tagged 'unverified' until one of our reporters visits in person."}
        </p>
      </section>
    </PageShell>
  );
}

function Sel({ value, set, opts, label }: { value: string; set: (v: string) => void; opts: readonly string[]; label: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <select value={value} onChange={e => set(e.target.value)} className="bg-paper border border-rule px-2 py-1.5 text-sm focus:outline-none focus:border-civic-red">
        {opts.map(o => <option key={o} value={o}>{o === "all" ? "All" : o}</option>)}
      </select>
    </label>
  );
}
