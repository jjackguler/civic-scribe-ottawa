import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { EditorialSubnav, AuthorCard } from "@/components/editorial/EditorialPrimitives";
import { AUTHORS } from "@/lib/editorial-data";

export const Route = createFileRoute("/editorial-board")({
  head: () => ({ meta: [{ title: "Editorial Board — Ottawa Civic Ledger" }] }),
  component: () => {
    const board = AUTHORS.filter(a => a.role === "editor" || a.role === "reporter");
    return (
      <PageShell>
        <EditorialSubnav />
        <PageHero kicker="Editorial Board" title="The people responsible." dek="Who decides what runs, and on what standard." />
        <div className="prose font-serif max-w-3xl mb-10">
          <p>The Ledger's Editorial Board sets standards for verification, corrections, sourcing, and bilingual coverage. Opinion pieces are signed; unsigned editorials are decisions of the Board.</p>
        </div>
        <div className="space-y-6 max-w-3xl">
          {board.map(a => <AuthorCard key={a.id} author={a} />)}
        </div>
      </PageShell>
    );
  },
});
