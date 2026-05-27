import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/satire")({
  head: () => ({ meta: [{ title: "Satire & Humor — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Satire" title="Not real news. On purpose." dek="Humor and satire — clearly labeled, never targeting victims or minors." items={listByType("satire")} />,
});
