import { createFileRoute } from "@tanstack/react-router";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import { listByType } from "@/lib/editorial-data";
export const Route = createFileRoute("/community-voices")({
  head: () => ({ meta: [{ title: "Community Voices — Ottawa Civic Ledger" }] }),
  component: () => <SectionIndexPage kicker="Community Voices" title="Residents, in their own words." dek="Lightly edited essays from people living the story." items={listByType("community-voice")} />,
});
