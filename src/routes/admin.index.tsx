import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { SUBMISSIONS, FACT_CHECKS, ARTICLES } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useState } from "react";
import { Check, X, Eye, ShieldCheck, FileText, Inbox, CheckSquare, Archive } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Editor Dashboard (preview) — Ottawa Civic Ledger" }] }),
  component: AdminPage,
});

const statusColor: Record<string, string> = {
  received: "bg-muted text-foreground border-rule",
  reviewing: "bg-river/10 text-river border-river/30",
  "needs-verification": "bg-highlight/30 text-ink border-highlight",
  published: "bg-solution/15 text-solution border-solution/40",
  rejected: "bg-civic-red/10 text-civic-red border-civic-red/30",
};

type Tab = "queue" | "fact-checks" | "published";

function AdminPage() {
  const { locale } = useLocale();
  const [tab, setTab] = useState<Tab>("queue");
  const [actioned, setActioned] = useState<Record<string, "approved" | "rejected" | "verifying">>({});

  const stats = [
    { label: locale === "fr" ? "Soumissions" : "Submissions", n: SUBMISSIONS.length, Icon: Inbox, tone: "text-river" },
    { label: locale === "fr" ? "En vérification" : "Under review", n: 7, Icon: Eye, tone: "text-highlight" },
    { label: locale === "fr" ? "Fact-checks actifs" : "Active fact-checks", n: FACT_CHECKS.length, Icon: ShieldCheck, tone: "text-civic-red" },
    { label: locale === "fr" ? "Publiés ce mois" : "Published this month", n: ARTICLES.length, Icon: FileText, tone: "text-solution" },
  ];

  const tabs: { key: Tab; label: string; Icon: typeof Inbox; count: number }[] = [
    { key: "queue", label: locale === "fr" ? "File d'attente" : "Submission queue", Icon: Inbox, count: SUBMISSIONS.length },
    { key: "fact-checks", label: locale === "fr" ? "Vérifications" : "Fact-checks", Icon: ShieldCheck, count: FACT_CHECKS.length },
    { key: "published", label: locale === "fr" ? "Publiés" : "Published", Icon: Archive, count: ARTICLES.length },
  ];

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Tableau de bord éditorial · Aperçu" : "Editor dashboard · Preview"}
        title={locale === "fr" ? "Salle de rédaction" : "Newsroom"}
        dek={locale === "fr" ? "Aperçu conceptuel du flux éditorial : triage, vérification, publication." : "Conceptual preview of the editorial workflow: triage, verification, publication."}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/admin/sources" className="inline-flex items-center gap-2 border border-ink px-3 py-2 text-[11px] uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper">
          Source dashboard →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {stats.map(({ label, n, Icon, tone }) => (
          <div key={label} className="border border-rule p-5 bg-card relative">
            <Icon className={`h-4 w-4 ${tone} absolute top-4 right-4 opacity-70`} />
            <div className="kicker text-muted-foreground pr-6">{label}</div>
            <div className="font-display text-4xl mt-2 leading-none">{n}</div>
          </div>
        ))}
      </div>

      <div className="rule-bottom flex flex-wrap gap-1 mb-6">
        {tabs.map(({ key, label, Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2 -mb-px ${
              tab === key ? "border-civic-red text-civic-red" : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className="ml-1 text-[10px] font-normal opacity-70">· {count}</span>
          </button>
        ))}
      </div>

      {tab === "queue" && (
        <section className="border border-rule bg-card">
          <div className="hidden md:grid grid-cols-[1fr_160px_160px_140px_180px] gap-3 px-5 py-3 kicker text-muted-foreground rule-bottom">
            <div>{locale === "fr" ? "Titre" : "Title"}</div>
            <div>{locale === "fr" ? "Quartier" : "Neighborhood"}</div>
            <div>{locale === "fr" ? "Statut" : "Status"}</div>
            <div>{locale === "fr" ? "Reçu" : "Received"}</div>
            <div className="text-right">{locale === "fr" ? "Actions" : "Actions"}</div>
          </div>
          {SUBMISSIONS.map(s => {
            const taken = actioned[s.id];
            return (
              <div key={s.id} className="md:grid md:grid-cols-[1fr_160px_160px_140px_180px] gap-3 px-5 py-4 rule-bottom last:border-0 items-center">
                <div className="font-serif text-foreground/90">{s.title}</div>
                <div className="text-sm text-muted-foreground mt-1 md:mt-0">{s.neighborhood}</div>
                <div className="mt-2 md:mt-0">
                  <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 border ${statusColor[s.status]}`}>{s.status.replace("-", " ")}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 md:mt-0">{new Date(s.submittedAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}</div>
                <div className="flex gap-1.5 justify-end mt-3 md:mt-0">
                  {taken ? (
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1.5 ${taken === "rejected" ? "text-civic-red" : taken === "verifying" ? "text-river" : "text-solution"}`}>
                      {taken === "approved" ? (locale === "fr" ? "Approuvé" : "Approved") : taken === "rejected" ? (locale === "fr" ? "Rejeté" : "Rejected") : (locale === "fr" ? "En vérification" : "Verifying")}
                    </span>
                  ) : (
                    <>
                      <button onClick={() => setActioned(p => ({ ...p, [s.id]: "verifying" }))} className="inline-flex items-center gap-1 border border-river/40 text-river px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold hover:bg-river hover:text-paper transition-colors" title={locale === "fr" ? "Vérifier" : "Verify"}>
                        <ShieldCheck className="h-3 w-3" />
                      </button>
                      <button onClick={() => setActioned(p => ({ ...p, [s.id]: "approved" }))} className="inline-flex items-center gap-1 border border-solution/40 text-solution px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold hover:bg-solution hover:text-paper transition-colors" title={locale === "fr" ? "Approuver" : "Approve"}>
                        <Check className="h-3 w-3" />
                      </button>
                      <button onClick={() => setActioned(p => ({ ...p, [s.id]: "rejected" }))} className="inline-flex items-center gap-1 border border-civic-red/40 text-civic-red px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold hover:bg-civic-red hover:text-paper transition-colors" title={locale === "fr" ? "Rejeter" : "Reject"}>
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "fact-checks" && (
        <section className="border border-rule bg-card">
          {FACT_CHECKS.map(f => (
            <div key={f.id} className="px-5 py-4 rule-bottom last:border-0 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <p className="font-serif text-foreground/90">{f.claim[locale]}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.source}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border self-start ${
                f.status === "false" || f.status === "misleading" ? "border-civic-red/40 text-civic-red bg-civic-red/5"
                : f.status === "verified" ? "border-solution/40 text-solution bg-solution/5"
                : "border-river/40 text-river bg-river/5"
              }`}>{f.status}</span>
              <div className="flex gap-2">
                <button className="text-[10px] uppercase tracking-wider font-semibold border border-rule px-3 py-1.5 hover:bg-secondary">{locale === "fr" ? "Modifier" : "Edit"}</button>
                <button className="text-[10px] uppercase tracking-wider font-semibold bg-ink text-paper px-3 py-1.5 hover:bg-civic-red">{locale === "fr" ? "Publier" : "Publish"}</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "published" && (
        <section className="border border-rule bg-card">
          {ARTICLES.map(a => (
            <div key={a.slug} className="px-5 py-4 rule-bottom last:border-0 flex items-center gap-4">
              <img src={a.image} alt="" className="w-16 h-12 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-serif truncate text-foreground/90">{a.title[locale]}</p>
                <p className="text-xs text-muted-foreground">{a.byline} · {a.neighborhood ?? "—"} · {new Date(a.publishedAt).toLocaleDateString()}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-solution">{a.status}</span>
              <button className="text-[10px] uppercase tracking-wider font-semibold border border-rule px-3 py-1.5 hover:bg-secondary">{locale === "fr" ? "Voir" : "View"}</button>
            </div>
          ))}
        </section>
      )}

      <section className="mt-10 grid md:grid-cols-3 gap-3">
        {[
          { en: "Approve · reject submissions", fr: "Approuver · rejeter les soumissions" },
          { en: "Assign verification status", fr: "Attribuer un statut de vérification" },
          { en: "Edit articles & corrections", fr: "Modifier articles et corrections" },
          { en: "Manage categories & sections", fr: "Gérer catégories et rubriques" },
          { en: "Manage neighborhoods & reporters", fr: "Gérer quartiers et reporters" },
          { en: "Manage jobs & events", fr: "Gérer emplois et événements" },
          { en: "Manage donations & sponsors", fr: "Gérer dons et commandites" },
          { en: "Manage EN/FR translations", fr: "Gérer les traductions EN/FR" },
          { en: "Mark breaking news", fr: "Marquer dernière heure" },
        ].map(c => (
          <div key={c.en} className="border border-rule p-4 font-serif text-sm bg-secondary/40 flex items-center gap-2">
            <CheckSquare className="h-3.5 w-3.5 text-solution shrink-0" /> {c[locale]}
          </div>
        ))}
      </section>
    </PageShell>
  );
}
