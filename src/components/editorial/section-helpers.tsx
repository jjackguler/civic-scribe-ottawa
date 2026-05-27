import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { SectionIndexPage } from "@/components/editorial/SectionIndex";
import {
  AnalysisTemplate, EssayTemplate, InvestigationTemplate, ExplainerTemplate,
  CartoonTemplate, SatireTemplate, PhotoEssayTemplate, OpDocTemplate,
  CommunityVoiceTemplate, SolutionStoryTemplate,
} from "@/components/editorial/Templates";
import { getArticle, listByType } from "@/lib/editorial-data";
import type { EditorialType } from "@/types/editorial";

// Helper to spawn an index route
export function makeIndex(type: EditorialType, kicker: string, title: string, dek: string) {
  return () => <SectionIndexPage kicker={kicker} title={title} dek={dek} items={listByType(type)} />;
}

export const TEMPLATES: Record<string, (a: any) => JSX.Element> = {
  analysis: AnalysisTemplate,
  essay: EssayTemplate,
  investigation: InvestigationTemplate,
  explainer: ExplainerTemplate,
  cartoon: CartoonTemplate,
  satire: SatireTemplate,
  "photo-essay": PhotoEssayTemplate,
  "op-doc": OpDocTemplate,
  "community-voice": CommunityVoiceTemplate,
  solution: SolutionStoryTemplate,
};

export function ArticleWrapper({ type }: { type: EditorialType }) {
  // Used by route components; reads slug from params via Route context outside.
  return null;
}
