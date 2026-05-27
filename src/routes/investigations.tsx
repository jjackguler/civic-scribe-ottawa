import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/investigations")({
  head: () => ({ meta: [{ title: "Investigations & Long Reads — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Investigations" title="Long reads." dek="Months of reporting in one piece." items={listByType("investigation")} />,
});
