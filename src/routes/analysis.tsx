import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/analysis")({
  head: () => ({ meta: [{ title: "Analysis — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Analysis" title="Past the headline." dek="What the numbers, contracts and votes actually mean." items={listByType("analysis")} />,
});
