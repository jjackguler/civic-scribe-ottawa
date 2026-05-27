import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { InterviewTemplate } from "@/components/editorial/Templates";
import { listByType, getArticle } from "@/lib/editorial-data";
import type { InterviewArticle } from "@/types/editorial";

export const Route = createFileRoute("/interviews")({
  head: () => ({ meta: [{ title: "Interviews — Ottawa Civic Ledger" }, { name: "description", content: "Long-form interviews with Ottawa residents, workers, and decision-makers." }] }),
  component: () => <SectionIndexPage kicker="Interviews" title="In their own words." dek="Long-form conversations with the people who keep Ottawa moving." items={listByType("interview")} />,
});
