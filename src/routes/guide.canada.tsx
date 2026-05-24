import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { GuideTopicCard } from "@/components/GuideTopicCard";
import { CANADA_GUIDE } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/guide/canada")({
  head: () => ({ meta: [
    { title: "Canada Guide — Practical answers for newcomers and residents" },
    { name: "description", content: "Plain-language Canada-wide guides: SIN, taxes, renting, voting, health care, driving, schooling and winter survival." },
    { property: "og:title", content: "Canada Guide — Ottawa Civic Ledger" },
    { property: "og:description", content: "Useful, bilingual, Canada-wide guides written for real life." },
  ]}),
  component: CanadaGuidePage,
});

function CanadaGuidePage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Guide du Canada" : "Canada Guide"}
        title={locale === "fr" ? "Le Canada, expliqué simplement" : "Canada, explained plainly"}
        dek={locale === "fr"
          ? "Pour les nouveaux arrivants comme pour les résidents. Bilingue, pratique, sans jargon."
          : "For newcomers and lifelong residents alike. Bilingual, practical, jargon-free."}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CANADA_GUIDE.map(g => <GuideTopicCard key={g.id} g={g} />)}
      </div>
    </PageShell>
  );
}
