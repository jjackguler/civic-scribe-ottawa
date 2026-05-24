import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { NEIGHBORHOOD_INFO } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";
import { Users, MapPin } from "lucide-react";

export const Route = createFileRoute("/neighborhoods")({
  head: () => ({ meta: [
    { title: "Neighborhoods — Ottawa Civic Ledger" },
    { name: "description", content: "Reporting from all 18 Ottawa neighborhoods, with local reporters and distinct civic character." },
    { property: "og:title", content: "Neighborhoods — Ottawa Civic Ledger" },
    { property: "og:description", content: "A local desk for every one of Ottawa's 18 neighborhoods." },
  ] }),
  component: NeighborhoodsPage,
});

function NeighborhoodsPage() {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => NEIGHBORHOOD_INFO.filter(n => n.name.toLowerCase().includes(query.toLowerCase()) || n.blurb[locale].toLowerCase().includes(query.toLowerCase())),
    [query, locale],
  );

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Quartiers" : "Neighborhoods"}
        title={locale === "fr" ? "Rue par rue, quartier par quartier" : "Street by street, block by block"}
        dek={locale === "fr" ? "Une rédaction locale pour chacun des 18 quartiers d'Ottawa." : "A local desk for every one of Ottawa's 18 neighborhoods."}
      />
      <NeighborhoodMap />

      <div className="mt-10 mb-6 rule-bottom pb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl">{locale === "fr" ? "Tous les quartiers" : "All neighborhoods"} <span className="text-muted-foreground text-base">· {filtered.length}</span></h2>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={locale === "fr" ? "Filtrer les quartiers…" : "Filter neighborhoods…"}
          className="bg-paper border border-rule px-3 py-2 text-sm font-serif focus:outline-none focus:border-civic-red w-full sm:w-72"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((n) => (
          <Link
            key={n.name}
            to="/neighborhoods/$slug"
            params={{ slug: n.name.toLowerCase().replace(/\s+/g, "-") }}
            className="group p-5 border border-rule bg-card hover:border-ink hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl group-hover:text-civic-red transition-colors">{n.name}</h3>
              <span className="kicker text-civic-red text-right whitespace-nowrap">{n.character[locale]}</span>
            </div>
            <p className="text-sm font-serif text-foreground/75 mt-2 leading-relaxed line-clamp-3">{n.blurb[locale]}</p>
            <div className="mt-4 pt-3 rule-top flex items-center justify-between text-[11px] text-muted-foreground font-sans">
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{n.population}</span>
              <span className="inline-flex items-center gap-1 truncate"><MapPin className="h-3 w-3" />{n.ward}</span>
            </div>
            <div className="kicker text-muted-foreground mt-2">{locale === "fr" ? "Reporter" : "Reporter"} · {n.reporter}</div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
