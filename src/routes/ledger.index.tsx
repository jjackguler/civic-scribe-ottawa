import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Trust";
import { RecordCard, StatusLegend } from "@/components/Ledger";
import { useLocale } from "@/lib/locale-context";
import { LEDGER, currentStatus, isStatus, statusCounts, STATUS_LABEL, type Status } from "@/lib/ledger";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

type Search = { status?: Status };

/** The Open Desk Ledger: every recorded claim, its current result and a filter by result. */
export const Route = createFileRoute("/ledger/")({
  validateSearch: (s: Record<string, unknown>): Search => ({ status: isStatus(s.status) ? s.status : undefined }),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `${SITE.openDesk.ledger.en} — ${SITE.name}`, fr: `${SITE.openDesk.ledger.fr} — ${SITE.name}` },
      description: {
        en: "What AI companies and their leaders say about jobs and AI, tested against documents, earlier statements and outcomes, with a result signed by a named editor after a second reading.",
        fr: "Ce que disent les entreprises d'IA et leurs dirigeants sur l'emploi et l'IA, vérifié auprès des documents, des déclarations antérieures et des résultats.",
      },
      // An empty list is a thin page: keep it out of search until the first record is signed.
      noindex: LEDGER.length === 0,
      breadcrumbs: [{ name: SITE.openDesk.ledger, path: "/ledger" }],
    }),
  component: LedgerIndex,
});

function LedgerIndex() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const { status } = Route.useSearch();
  const counts = statusCounts(LEDGER);
  const items = status ? LEDGER.filter((r) => currentStatus(r) === status) : LEDGER;
  return (
    <PageShell>
      <div className="container-mw pt-6">
        <Breadcrumbs items={[{ label: SITE.openDesk.ledger[locale] }]} />
        <header className="mt-6 pb-8 border-b border-line grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <p className="kicker">{SITE.name} — {SITE.openDesk.subtitle[locale]}</p>
            <h1 className="hl text-[2.5rem] sm:text-[3.2rem] mt-1">{SITE.openDesk.ledger[locale]}</h1>
            <p className="font-serif text-[1.2rem] leading-relaxed text-ink/80 mt-3 max-w-[62ch]">
              {fr
                ? "Un registre public de ce que disent les entreprises d'IA et leurs dirigeants. Chaque déclaration reçoit un numéro permanent, ses sources archivées et un résultat signé par un responsable éditorial nommé, après une deuxième lecture. Rien n'est effacé : chaque changement reste visible, et chaque dossier revient sur la table à 3 et 6 mois et à ses dates de vérification. Une déclaration absente du registre n'a pas été évaluée."
                : "A public record of what AI companies and their leaders say. Each statement gets a permanent number, archived sources and a result signed by a named editor after a second reading. Nothing is erased: every change stays visible, and every record comes back to the desk at 3 and 6 months and on its test dates. A statement that is not in the ledger has not been assessed."}
            </p>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.92rem] font-semibold">
              <Link to="/standards" hash="statuses" className="text-lake hover:underline">{fr ? "Comment nous établissons un résultat" : "How we reach a result"}</Link>
              <Link to="/corrections" className="text-lake hover:underline">{fr ? "Corrections" : "Corrections"}</Link>
              <a href="/api/ledger.json" className="text-lake hover:underline">{fr ? "Données ouvertes (JSON)" : "Open data (JSON)"}</a>
            </p>
          </div>
          <div>
            <h2 className="kicker text-ink pb-1 border-b border-ink mb-4">{fr ? "Filtrer par résultat" : "Filter by result"}</h2>
            <StatusLegend counts={counts} active={status ?? null} linked compact />
          </div>
        </header>

        {status && (
          <p className="mt-6 text-[0.95rem]">
            {fr ? "Statut : " : "Status: "}
            <strong>{pick(STATUS_LABEL[status])}</strong> ·{" "}
            <Link to="/ledger" className="text-lake font-semibold hover:underline">{fr ? "Tout afficher" : "Show all"}</Link>
          </p>
        )}

        {LEDGER.length === 0 ? (
          <div className="py-16 max-w-2xl">
            <p className="hl text-[1.6rem]">{fr ? "Les premiers dossiers ouvrent bientôt." : "The first records open soon."}</p>
            <p className="mt-3 text-muted-ink leading-relaxed">
              {fr
                ? "Notre premier thème : les entreprises qui disent réduire leurs effectifs à cause de l'IA. Vous avez vu une telle déclaration ? Signalez-la."
                : "Our first beat: companies that say they are cutting jobs because of AI. Seen a statement like that? Flag it to us."}{" "}
              <Link to="/tips" className="text-lake font-semibold hover:underline">{fr ? "Envoyer un tuyau" : "Send a tip"}</Link>
            </p>
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-muted-ink">{fr ? "Aucun dossier n'a ce résultat pour l'instant." : "No record has this result yet."}</p>
        ) : (
          <ol className="mt-4 grid gap-x-10 md:grid-cols-2">
            {items.map((r) => (
              <li key={r.id} className="py-6 border-b border-line">
                <RecordCard r={r} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </PageShell>
  );
}
