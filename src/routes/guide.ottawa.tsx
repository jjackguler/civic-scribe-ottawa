import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { GuideTopicCard } from "@/components/GuideTopicCard";
import { OTTAWA_GUIDE } from "@/lib/guide-data";
import { NEIGHBORHOODS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/guide/ottawa")({
  head: () => ({ meta: [
    { title: "The Ottawa Guide — Live here, move here, thrive here" },
    { name: "description", content: "A bilingual local guide to Ottawa: neighborhoods, transit, schools, health, snow, biking, newcomer services and free things to do." },
    { property: "og:title", content: "Ottawa Guide — Ottawa Civic Ledger" },
    { property: "og:description", content: "Everything you actually need to live well in Ottawa." },
  ]}),
  component: OttawaGuidePage,
});

function OttawaGuidePage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Guide d'Ottawa" : "Ottawa Guide"}
        title={locale === "fr" ? "Vivre bien à Ottawa" : "Live well in Ottawa"}
        dek={locale === "fr"
          ? "Bilingue. Indépendant. Bâti pour les résidents, les nouveaux arrivants et les visiteurs."
          : "Bilingual. Independent. Built for residents, newcomers, and visitors."}
      />

      <section className="mb-14">
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "Sujets essentiels" : "Essential topics"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OTTAWA_GUIDE.map(g => <GuideTopicCard key={g.id} g={g} />)}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "Tous les quartiers" : "All neighborhoods"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {NEIGHBORHOODS.map(n => (
            <Link key={n} to="/neighborhoods/$slug" params={{ slug: n.toLowerCase().replace(/\s+/g, "-") }}
              className="border border-rule px-3 py-2 hover:border-ink hover:text-civic-red transition-colors">
              {n}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
