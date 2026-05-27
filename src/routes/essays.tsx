import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/essays")({
  head: () => ({ meta: [{ title: "Essays — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Essays" title="The long view." dek="Personal and literary essays on the city." items={listByType("essay")} />,
});
