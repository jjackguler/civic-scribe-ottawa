import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/photo-essays")({
  head: () => ({ meta: [{ title: "Photo Essays — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Photo Essays" title="One street at a time." dek="Visual reporting from Ottawa neighborhoods." items={listByType("photo-essay")} />,
});
