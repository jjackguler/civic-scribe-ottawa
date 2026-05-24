import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { ARTICLES } from "@/lib/data";
import { ArticleCard } from "@/components/ArticleCard";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/section/$name")({
  head: ({ params }) => ({ meta: [{ title: `${params.name[0].toUpperCase() + params.name.slice(1)} — Ottawa Civic Ledger` }] }),
  component: SectionPage,
});

function SectionPage() {
  const { name } = Route.useParams();
  const { locale } = useLocale();
  const pretty = name.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const matches = ARTICLES.filter(a =>
    a.category.toLowerCase() === pretty.toLowerCase() ||
    a.kicker.en.toLowerCase() === pretty.toLowerCase()
  );
  const list = matches.length ? matches : ARTICLES;

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Section" : "Section"}
        title={pretty}
        dek={locale === "fr" ? `Tout le journalisme du Registre Civique étiqueté « ${pretty} ».` : `All Civic Ledger reporting tagged "${pretty}".`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {list.map(a => <ArticleCard key={a.slug} article={a} />)}
      </div>
    </PageShell>
  );
}
