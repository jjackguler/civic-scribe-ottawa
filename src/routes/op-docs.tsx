import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/op-docs")({
  head: () => ({ meta: [{ title: "Op-Docs — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Op-Docs" title="Short documentaries — coming soon." dek="Future-ready video essays. Production starts Fall 2026." items={listByType("op-doc")} />,
});
