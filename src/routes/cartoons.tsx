import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/cartoons")({
  head: () => ({ meta: [{ title: "Cartoons — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Cartoons" title="Editorial cartoons." dek="Drawn commentary. Clearly labeled, never confused with news." items={listByType("cartoon")} />,
});
