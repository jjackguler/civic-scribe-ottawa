import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/explainers")({
  head: () => ({ meta: [{ title: "Explainers — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Explainers" title="How Ottawa actually works." dek="Plain-language answers, sourced." items={listByType("explainer")} />,
});
