import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { SUBMISSIONS, FACT_CHECKS, ARTICLES } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Editor Dashboard (preview) — Ottawa Civic Ledger" }] }),
  component: AdminPage,
});

const statusColor: Record<string, string> = {
  received: "bg-muted text-foreground",
  reviewing: "bg-river/15 text-river",
  "needs-verification": "bg-highlight/30 text-ink",
  published: "bg-solution/20 text-solution",
  rejected: "bg-civic-red/15 text-civic-red",
};

function AdminPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Tableau de bord éditorial · Aperçu" : "Editor dashboard · Preview"}
        title={locale === "fr" ? "Salle de rédaction" : "Newsroom"}
        dek={locale === "fr" ? "Conceptuel — démonstration du flux éditorial." : "Conceptual — demonstrates the editorial workflow."}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: locale === "fr" ? "Soumissions" : "Submissions", n: SUBMISSIONS.length },
          { label: locale === "fr" ? "En vérification" : "Under review", n: 7 },
          { label: locale === "fr" ? "Fact-checks actifs" : "Active fact-checks", n: FACT_CHECKS.length },
          { label: locale === "fr" ? "Articles publiés" : "Published articles", n: ARTICLES.length },
        ].map(s => (
          <div key={s.label} className="border border-rule p-5 bg-card">
            <div className="kicker text-muted-foreground">{s.label}</div>
            <div className="font-display text-4xl mt-2">{s.n}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "File d'attente des soumissions" : "Submission queue"}</h2>
        <div className="border border-rule bg-card">
          <div className="grid grid-cols-[1fr_140px_140px_120px] gap-3 px-4 py-2 kicker text-muted-foreground rule-bottom">
            <div>{locale === "fr" ? "Titre" : "Title"}</div><div>{locale === "fr" ? "Quartier" : "Neighborhood"}</div><div>{locale === "fr" ? "Statut" : "Status"}</div><div>{locale === "fr" ? "Reçu" : "Received"}</div>
          </div>
          {SUBMISSIONS.map(s => (
            <div key={s.id} className="grid grid-cols-[1fr_140px_140px_120px] gap-3 px-4 py-3 rule-bottom last:border-0 items-center">
              <div className="font-serif">{s.title}</div>
              <div className="text-sm">{s.neighborhood}</div>
              <div><span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${statusColor[s.status]}`}>{s.status}</span></div>
              <div className="text-xs text-muted-foreground">{new Date(s.submittedAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-4">
        {[
          "Approve / reject submissions",
          "Assign verification status",
          "Edit articles",
          "Manage categories",
          "Manage neighborhoods",
          "Manage jobs & events",
          "Manage donations & sponsors",
          "Manage translations",
          "Mark breaking news",
        ].map(c => (
          <div key={c} className="border border-rule p-4 font-serif text-sm bg-secondary/40">{c}</div>
        ))}
      </section>
    </PageShell>
  );
}
