import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { JOBS } from "@/lib/data";
import { JobCard } from "@/components/JobCard";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Jobs in Ottawa — Ottawa Civic Ledger" }, { name: "description", content: "Local job board for Ottawa, bilingual and clearly labeled." }] }),
  component: JobsPage,
});

function JobsPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Emplois" : "Jobs"}
        title={locale === "fr" ? "Du travail à Ottawa — clair, bilingue, transparent." : "Work in Ottawa — clear, bilingual, transparent."}
        dek={locale === "fr" ? "Salaires affichés, exigences linguistiques, et commandites clairement identifiées." : "Salaries shown, language requirements listed, and sponsored posts clearly labeled."}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {JOBS.map(j => <JobCard key={j.id} job={j} />)}
      </div>
      <section className="mt-12 p-6 bg-secondary max-w-3xl">
        <h3 className="font-display text-2xl">{locale === "fr" ? "Publier un poste" : "Post a role"}</h3>
        <p className="font-serif text-sm mt-2 text-foreground/80">{locale === "fr" ? "Les revenus du babillard financent le journalisme local." : "Job board revenue funds local reporting."}</p>
      </section>
    </PageShell>
  );
}
