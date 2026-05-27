import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";

export const Route = createFileRoute("/opinion")({
  head: () => ({ meta: [{ title: "Opinion — Ottawa Civic Ledger" }, { name: "description", content: "Opinion columns from Ottawa Civic Ledger contributors. Clearly labeled. Not news reporting." }] }),
  component: () => <SectionIndexPage kicker="Opinion" title="Commentary, clearly labeled." dek="Opinion columns from Ledger contributors. This is commentary, not news reporting." items={listByType("opinion")} />,
});
