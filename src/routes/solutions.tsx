import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { SOLUTIONS } from "@/lib/data";
import { SolutionCard } from "@/components/SolutionCard";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/solutions")({
  head: () => ({ meta: [{ title: "Solutions — Ottawa Civic Ledger" }, { name: "description", content: "Solutions journalism for Ottawa: what works, what didn't, and what's next." }] }),
  component: SolutionsPage,
});

function SolutionsPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Journalisme de solutions" : "Solutions journalism"}
        title={locale === "fr" ? "Du problème à ce qui fonctionne" : "From problem to what works"}
        dek={locale === "fr" ? "Pour chaque enjeu majeur, nous présentons des solutions essayées ailleurs — sans prétendre qu'une recette unique convienne à Ottawa." : "For every major issue, we surface approaches tried elsewhere — without pretending one recipe fits Ottawa."}
      />
      <div className="grid lg:grid-cols-2 gap-6">
        {SOLUTIONS.map(s => <SolutionCard key={s.id} s={s} />)}
        {SOLUTIONS.map(s => <SolutionCard key={s.id + "_2"} s={s} />)}
      </div>
    </PageShell>
  );
}
