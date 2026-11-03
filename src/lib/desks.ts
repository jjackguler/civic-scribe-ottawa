/**
 * The five desks: the only sections AI Broadsheet has. Header, footer, front page,
 * /news chips, the sitemap, story kickers, newsroom summaries, the Brief app and the
 * daily quiz all read this list, and nothing else may add a section.
 *
 * Every item maps to exactly one desk, deterministically, with World as the fallback:
 *   feed story        deskOf(story)          Canada first, then Rights, Work, Research, else World
 *   newsroom summary  deskOfSummary(summary) Canada when it is about Canada, else by its topic
 *   original video    deskOfOriginal(video)  the same rules on its title and summary
 *   any topic string  deskOfTopic(topic)     classification topics and old section ids; unknown → World
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

export type DeskId = "canada" | "rights" | "work" | "science" | "world";

/** In display order: Canada first. */
export const DESKS: { id: DeskId; label: Bi; dek: Bi }[] = [
  { id: "canada", label: { en: "Canada", fr: "Canada" }, dek: { en: "Ottawa, the provinces, Canadian labs and companies.", fr: "Ottawa, les provinces, les laboratoires et entreprises d'ici." } },
  { id: "rights", label: { en: "Rights & power", fr: "Droits et pouvoir" }, dek: { en: "Data sovereignty, privacy, military AI, democracy and regulation.", fr: "Souveraineté des données, vie privée, IA militaire, démocratie et réglementation." } },
  { id: "work", label: { en: "Work & culture", fr: "Travail et culture" }, dek: { en: "Jobs, artists' rights, schools, families and everyday life.", fr: "Emploi, droits des artistes, écoles, familles et vie quotidienne." } },
  { id: "science", label: { en: "Research", fr: "Recherche" }, dek: { en: "What labs and scientists found, and what it does not prove.", fr: "Ce que les laboratoires et les chercheurs ont trouvé, et ce que ça ne prouve pas." } },
  { id: "world", label: { en: "World", fr: "Monde" }, dek: { en: "The rest of the world, briefly.", fr: "Le reste du monde, en bref." } },
];

export const DESK_IDS: DeskId[] = DESKS.map(d => d.id);
/** Where anything that matches no other desk goes. */
export const FALLBACK_DESK: DeskId = "world";

export const isDeskId = (v: unknown): v is DeskId => typeof v === "string" && (DESK_IDS as string[]).includes(v);
export const deskById = (id: DeskId) => DESKS.find(d => d.id === id)!;
export const deskLabel = (id: DeskId, locale: Locale) => deskById(id).label[locale];

/**
 * Classification topics and every section id the site has ever had, with the desk each one
 * now belongs to. Anything not listed (a new feed beat, a topic a model invents) → World.
 */
export const TOPIC_DESK: Record<string, DeskId> = {
  // the desks themselves
  canada: "canada", rights: "rights", work: "work", science: "science", world: "world",
  // Canadian trackers
  government: "canada", ministry: "canada",
  // power over people
  responsible: "rights", policy: "rights",
  // people's work and everyday life
  people: "work", society: "work",
  // what labs and scientists found
  research: "science", health: "science", robotics: "science", labs: "science",
  // everything else is the world in brief
  agents: "world", applications: "world", immersive: "world", data: "world", infrastructure: "world",
  business: "world", sustainability: "world", tech: "world", analysis: "world", trending: "world",
};

/** "policy" → "rights"; unknown or empty → World. Never creates a desk. */
export function deskOfTopic(topic: string | null | undefined): DeskId {
  const key = (topic ?? "").trim().toLowerCase();
  return TOPIC_DESK[key] ?? FALLBACK_DESK;
}

/** Power over people: who holds data, weapons and the rules. Read with the human lens. */
const POWER = /\b(military|militar\w*|defen[cs]e|armed forces|weapons?|autonomous weapons?|drones?|surveillance|sovereign\w*|souverainet\w*|cloud act|data residency|facial recognition|reconnaissance faciale|copyright|droit d'auteur|regulat\w*|réglement\w*|bill c-\d+|privacy commissioner)\b/i;
const CULTURE = /\b(artists?|artistes?|musicians?|writers?|authors?|actors?|creators?|culture|cultural|journalis\w*|newsrooms?)\b/i;
/** About Canada, for items that carry no region (newsroom summaries, videos). */
const CANADA = /\b(Canad(?:a|ian|ians|ien|iens|ienne|iennes)|Ottawa|Ontario|Qu[ée]bec|Montr[ée]al|Toronto|Vancouver|Calgary|Edmonton|Winnipeg|Halifax|British Columbia|Colombie-Britannique|Alberta|Manitoba|Saskatchewan|Nova Scotia|Nouvelle-[ÉE]cosse|New Brunswick|Nouveau-Brunswick|Newfoundland|Terre-Neuve|Prince Edward Island|Yukon|Nunavut|Northwest Territories|Mila|Vector Institute|Amii|CIFAR|Cohere|Bill C-\d+|projet de loi C-\d+)\b/;

type DeskStory = Pick<Story, "title" | "summary" | "region" | "gov" | "kind" | "topic"> & { tags?: Story["tags"] };

/**
 * Whether a feed story belongs on a desk's page. A story can sit on more than one desk's page
 * (a Canadian privacy story is on Canada and on Rights & power); its home is deskOf().
 */
export function inDesk(s: DeskStory, id: DeskId): boolean {
  const tags = s.tags ?? [s.topic];
  const text = `${s.title} ${s.summary ?? ""}`;
  switch (id) {
    case "canada": return s.region === "canada" && !s.gov && s.kind !== "trending" && s.kind !== "beat";
    case "world": return s.region === "world" && s.kind === "news";
    case "rights":
      if (s.gov || s.kind === "trending") return false;
      return tags.includes("responsible") || tags.includes("policy") || POWER.test(text)
        || humanLens(s).some(l => l === "rights" || l === "privacy" || l === "democracy" || l === "safety");
    case "work":
      if (s.gov || s.kind === "trending") return false;
      return tags.includes("people") || tags.includes("society") || CULTURE.test(text)
        || humanLens(s).some(l => l === "work" || l === "children");
    case "science":
      if (s.gov || s.kind === "trending") return false;
      return s.kind === "lab" || tags.includes("research") || tags.includes("health") || tags.includes("robotics");
  }
}

/** A feed story's one home desk: Canada first, then Rights & power, Work & culture, Research; else World. */
export function deskOf(s: DeskStory): DeskId {
  if (s.region === "canada" || s.gov) return "canada";
  for (const id of ["rights", "work", "science"] as const) if (inDesk(s, id)) return id;
  return FALLBACK_DESK;
}

/** Desk for text with no region: Canada when it is about Canada, then the people-side rules, then the topic. */
function deskOfText(text: string, topic: string | undefined): DeskId {
  if (CANADA.test(text)) return "canada";
  const tags = tagsOf(text);
  const asStory: DeskStory = { title: text, summary: "", region: "world", gov: false, kind: "news", topic: tags[0], tags };
  for (const id of ["rights", "work", "science"] as const) if (inDesk(asStory, id)) return id;
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
