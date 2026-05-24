import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { NEIGHBORHOOD_INFO } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/neighborhoods")({
  head: () => ({ meta: [{ title: "Neighborhoods — Ottawa Civic Ledger" }, { name: "description", content: "Reporting from all 18 Ottawa neighborhoods." }] }),
  component: NeighborhoodsPage,
});

function NeighborhoodsPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Quartiers" : "Neighborhoods"}
        title={locale === "fr" ? "Rue par rue, quartier par quartier" : "Street by street, block by block"}
        dek={locale === "fr" ? "Une rédaction locale pour chacun des 18 quartiers d'Ottawa." : "A local desk for every one of Ottawa's 18 neighborhoods."}
      />
      <NeighborhoodMap />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {NEIGHBORHOOD_INFO.map((n) => (
          <Link
            key={n.name}
            to="/neighborhoods/$slug"
            params={{ slug: n.name.toLowerCase().replace(/\s+/g, "-") }}
            className="group p-5 border border-rule bg-card hover:border-ink transition-colors"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl group-hover:text-civic-red">{n.name}</h2>
              <span className="text-xs text-muted-foreground">{n.population}</span>
            </div>
            <p className="text-sm font-serif text-muted-foreground mt-2">{n.blurb[locale]}</p>
            <div className="kicker text-muted-foreground mt-3">Reporter · {n.reporter}</div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
