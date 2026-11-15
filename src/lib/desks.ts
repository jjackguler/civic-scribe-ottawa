/**
 * The five desks: the only sections AI Broadsheet has. Header, footer, front page,
 * /news chips, the sitemap, story kickers, newsroom summaries, the Brief app and the
 * daily quiz all read this list, and nothing else may add a section.
 *
 * The concept (15 Nov 2026): three beats, AI, Robotics and Tech, with Canada first and the
 * Human stakes desk as our own angle. See docs/editorial-concept.md.
 *
 * Every item maps to exactly one desk, deterministically, with AI as the fallback:
 *   feed story        deskOf(story)          Canada first, then Robotics, Human stakes, Tech, else AI
 *   newsroom summary  deskOfSummary(summary) Canada when it is about Canada, else by its topic
 *   original video    deskOfOriginal(video)  the same rules on its title and summary
 *   any topic string  deskOfTopic(topic)     classification topics and old section ids; unknown → AI
 *
 * Classification topics (news-sources.ts Topic, the newsroom's `topic` field) stay internal:
 * a new feed, beat or topic never creates a page, a chip or a menu entry. Old section URLs
 * (/news?section=policy, …) answer 301 to their parent desk (routes/news.tsx).
 *
 * Pure module: safe on the server, in the browser and in scripts.
 */
import type { Bi, Locale } from "./i18n";
import type { Story } from "./news-engine";
import { humanLens } from "./editorial";
import { tagsOf } from "./classify";

export type DeskId = "canada" | "ai" | "robotics" | "tech" | "people";

/** In display order: Canada first, then the three beats, then the human stakes. */
export const DESKS: { id: DeskId; label: Bi; dek: Bi }[] = [
  { id: "canada", label: { en: "Canada", fr: "Canada" }, dek: { en: "Ottawa, the provinces, Canadian labs and companies.", fr: "Ottawa, les provinces, les laboratoires et entreprises d'ici." } },
  { id: "ai", label: { en: "AI", fr: "IA" }, dek: { en: "Models, labs, tools and the companies building them.", fr: "Les modèles, les laboratoires, les outils et les entreprises qui les font." } },
  { id: "robotics", label: { en: "Robotics", fr: "Robotique" }, dek: { en: "Robots, humanoids, self-driving vehicles and AI in the physical world.", fr: "Robots, humanoïdes, véhicules autonomes et l'IA dans le monde physique." } },
  { id: "tech", label: { en: "Tech", fr: "Techno" }, dek: { en: "Chips, data centres, devices, energy and the platforms around AI.", fr: "Puces, centres de données, appareils, énergie et plateformes autour de l'IA." } },
  { id: "people", label: { en: "Human stakes", fr: "Enjeux humains" }, dek: { en: "Rights, privacy, work, schools, families and the rules that protect people.", fr: "Droits, vie privée, travail, écoles, familles et les règles qui protègent les gens." } },
];

export const DESK_IDS: DeskId[] = DESKS.map(d => d.id);
/** Where anything that matches no other desk goes. */
export const FALLBACK_DESK: DeskId = "ai";

export const isDeskId = (v: unknown): v is DeskId => typeof v === "string" && (DESK_IDS as string[]).includes(v);
export const deskById = (id: DeskId) => DESKS.find(d => d.id === id)!;
export const deskLabel = (id: DeskId, locale: Locale) => deskById(id).label[locale];

/**
 * Classification topics and every section id the site has ever had, with the desk each one
 * now belongs to. Anything not listed (a new feed beat, a topic a model invents) → AI.
 * The five desks of 3 Nov 2026 (rights, work, science, world) answer 301 to their successor.
 */
export const TOPIC_DESK: Record<string, DeskId> = {
  // the desks themselves
  canada: "canada", ai: "ai", robotics: "robotics", tech: "tech", people: "people",
  // the desks before 15 Nov 2026
  rights: "people", work: "people", science: "ai", world: "ai",
  // Canadian trackers
  government: "canada", ministry: "canada",
  // power over people, work and everyday life
  responsible: "people", policy: "people", society: "people", health: "people",
  // hardware, energy and platforms
  infrastructure: "tech", immersive: "tech", sustainability: "tech",
  // everything else is AI
  research: "ai", labs: "ai", agents: "ai", applications: "ai", data: "ai", business: "ai", analysis: "ai", trending: "ai",
};

/** "policy" → "people"; unknown or empty → AI. Never creates a desk. */
export function deskOfTopic(topic: string | null | undefined): DeskId {
  const key = (topic ?? "").trim().toLowerCase();
  return TOPIC_DESK[key] ?? FALLBACK_DESK;
}

/** Power over people: who holds data, weapons and the rules. Read with the human lens. */
const POWER = /\b(military|militar\w*|defen[cs]e|armed forces|weapons?|autonomous weapons?|surveillance|sovereign\w*|souverainet\w*|cloud act|data residency|facial recognition|reconnaissance faciale|copyright|droit d'auteur|regulat\w*|réglement\w*|bill c-\d+|privacy commissioner)\b/i;
const CULTURE = /\b(artists?|artistes?|musicians?|writers?|authors?|actors?|creators?|culture|cultural|journalis\w*|newsrooms?)\b/i;
/** Robots and AI in the physical world. */
const ROBOTS = /\b(robots?|robotics?|robotique|humanoids?|humanoïdes?|cobots?|exoskeletons?|autonomous vehicles?|self-driving|driverless|robotaxis?|drones?|Waymo|Optimus|Figure AI|Boston Dynamics|Agility Robotics|Unitree|physical AI|embodied)\b/i;
/** Hardware, energy and platforms. */
const TECH = /\b(chips?|chipmakers?|GPUs?|TPUs?|semiconductors?|data cent(?:er|re)s?|centres? de données|supercomputers?|smartphones?|laptops?|headsets?|smart ?glasses|wearables?|quantum|batter(?:y|ies)|gigawatts?|power grid|puces?)\b/i;
/** About Canada, for items that carry no region (newsroom summaries, videos). */
const CANADA = /\b(Canad(?:a|ian|ians|ien|iens|ienne|iennes)|Ottawa|Ontario|Qu[ée]bec|Montr[ée]al|Toronto|Vancouver|Calgary|Edmonton|Winnipeg|Halifax|British Columbia|Colombie-Britannique|Alberta|Manitoba|Saskatchewan|Nova Scotia|Nouvelle-[ÉE]cosse|New Brunswick|Nouveau-Brunswick|Newfoundland|Terre-Neuve|Prince Edward Island|Yukon|Nunavut|Northwest Territories|Mila|Vector Institute|Amii|CIFAR|Cohere|Bill C-\d+|projet de loi C-\d+)\b/;

type DeskStory = Pick<Story, "title" | "summary" | "region" | "gov" | "kind" | "topic"> & { tags?: Story["tags"] };

/**
 * Whether a feed story belongs on a desk's page. A story can sit on more than one desk's page
 * (a Canadian privacy story is on Canada and on Human stakes); its home is deskOf().
 * Specialist beats (robotics, tech) appear on their desk even when the story is not about AI.
 */
export function inDesk(s: DeskStory, id: DeskId): boolean {
  const tags = s.tags ?? [s.topic];
  const text = `${s.title} ${s.summary ?? ""}`;
  if (id === "canada") return s.region === "canada" && !s.gov && s.kind !== "trending" && s.kind !== "beat";
  if (s.gov || s.kind === "trending") return false;
  switch (id) {
    case "robotics":
      return tags.includes("robotics") || ROBOTS.test(text);
    case "tech":
      return tags.includes("tech") || tags.includes("infrastructure") || tags.includes("immersive") || TECH.test(text);
    case "people":
      if (s.kind === "beat" && !tags.includes("society")) return false;
      return tags.includes("responsible") || tags.includes("policy") || tags.includes("people") || tags.includes("society")
        || POWER.test(text) || CULTURE.test(text)
        || humanLens(s).some(l => l === "rights" || l === "privacy" || l === "democracy" || l === "safety" || l === "work" || l === "children");
    case "ai":
      return s.kind !== "beat";
  }
}

/** A feed story's one home desk: Canada first, then Robotics, Human stakes, Tech; else AI. */
export function deskOf(s: DeskStory): DeskId {
  if (s.region === "canada" || s.gov) return "canada";
  for (const id of ["robotics", "people", "tech"] as const) if (inDesk(s, id)) return id;
  return FALLBACK_DESK;
}

/** Desk for text with no region: Canada when it is about Canada, then the people-side rules, then the topic. */
function deskOfText(text: string, topic: string | undefined): DeskId {
  if (CANADA.test(text)) return "canada";
  const tags = tagsOf(text);
  const asStory: DeskStory = { title: text, summary: "", region: "world", gov: false, kind: "news", topic: tags[0], tags };
  for (const id of ["robotics", "people", "tech"] as const) if (inDesk(asStory, id)) return id;
  return topic ? deskOfTopic(topic) : FALLBACK_DESK;
}

/** A newsroom summary (index.json item or full article): its topic, headline and dek decide. */
export function deskOfSummary(a: { topic?: string; en: { headline: string; dek?: string } }): DeskId {
  return deskOfText(`${a.en.headline} ${a.en.dek ?? ""}`, a.topic);
}

/** An original video: the same rules on its title and summary. */
export function deskOfOriginal(o: { title: string; summary?: string }): DeskId {
  return deskOfText(`${o.title} ${o.summary ?? ""}`, undefined);
}

/**
 * Old /news?section=… ids → the desk that replaced them, for 301s. undefined when the id was
 * never a section (the link then lands on the full feed).
 */
export function legacySectionDesk(id: string): DeskId | undefined {
  const key = id.trim().toLowerCase();
  return key in TOPIC_DESK ? TOPIC_DESK[key] : undefined;
}
