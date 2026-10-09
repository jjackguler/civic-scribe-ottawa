import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { ActivityHeader, BackToGroup, BigIdea, YoungShell } from "@/components/YoungLab";
import { AiOrNot } from "@/components/young/AiOrNot";
import { TeachMachine } from "@/components/young/TeachMachine";
import { SpotFake } from "@/components/young/SpotFake";
import { PromptKitchen } from "@/components/young/PromptKitchen";
import { FairOrUnfair } from "@/components/young/FairOrUnfair";
import { NextWord } from "@/components/young/NextWord";
import { PrivacyCheck } from "@/components/young/PrivacyCheck";
import { ChatbotRules } from "@/components/young/ChatbotRules";
import { Careers } from "@/components/young/Careers";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef } from "@/lib/seo";
import { GROUP, activityById, type ActivityId } from "@/lib/young-lab";

const GAMES: Record<ActivityId, ComponentType> = {
  "ai-or-not": AiOrNot,
  "teach-the-machine": TeachMachine,
  "spot-the-fake": SpotFake,
  "prompt-kitchen": PromptKitchen,
  "fair-or-unfair": FairOrUnfair,
  "next-word": NextWord,
  "privacy-check": PrivacyCheck,
  "chatbot-rules": ChatbotRules,
  "career-paths": Careers,
};

export const Route = createFileRoute("/labs/young/$activity")({
  loader: ({ params }) => {
    const a = activityById(params.activity);
    if (!a) throw notFound();
    return { id: a.id };
  },
  head: ({ match, params }) => {
    const a = activityById(params.activity);
    if (!a) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: { en: `${a.title.en}: a Young Lab game — ${SITE.name}`, fr: `${a.title.fr} : un jeu du Jeune Labo — ${SITE.name}` },
      description: a.tagline,
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: a.title[locale],
        description: a.tagline[locale],
        url,
        learningResourceType: "Game",
        interactivityType: "active",
        educationalLevel: GROUP[a.group].ages[locale],
        teaches: a.objectives.map(o => o[locale]),
        timeRequired: `PT${a.minutes}M`,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        isAccessibleForFree: true,
        provider: publisherRef,
        isPartOf: { "@type": "CollectionPage", name: locale === "fr" ? "Jeune Labo" : "Young Lab", url: absUrl("/labs/young", locale) },
      }],
    });
  },
  component: ActivityPage,
});

function ActivityPage() {
  const { id } = Route.useLoaderData();
  const a = activityById(id)!;
  const Game = GAMES[a.id];
  return (
    <YoungShell>
      <ActivityHeader a={a} />
      <div className="container-mw py-8 sm:py-10">
        <Game key={a.id} />
        <BigIdea a={a} />
        <div className="mt-6"><BackToGroup group={a.group} /></div>
      </div>
    </YoungShell>
  );
}
