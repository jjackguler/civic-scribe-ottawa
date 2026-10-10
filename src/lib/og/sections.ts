/**
 * Names and one-line descriptions for section share cards (/og/section/:name.png):
 * every news section from SECTIONS, plus the site's own formats. Server only.
 */
import type { Bi } from "../i18n";
import { TOPICS } from "../news";
import { WHY_DESK } from "../youth-core";

export type SectionCard = { label: Bi; dek: Bi };

export const OG_SECTIONS: Record<string, SectionCard> = {
  // Topic desks: the desk's name and why stories on it matter to people.
  ...Object.fromEntries(TOPICS.map(t => [t.id, { label: t.label, dek: WHY_DESK[t.id] }])),
  world: { label: { en: "World", fr: "Monde" }, dek: { en: "AI news from the world's newsrooms, every story credited and linked.", fr: "L'actualité de l'IA des salles de nouvelles du monde, chaque nouvelle créditée et liée." } },
  canada: { label: { en: "Canada", fr: "Canada" }, dek: { en: "AI in Canada: the people, the places and the rules, from coast to coast.", fr: "L'IA au Canada : les gens, les lieux et les règles, d'un océan à l'autre." } },
  government: { label: { en: "Government", fr: "Gouvernement" }, dek: { en: "What governments announce about AI, from the official source.", fr: "Ce que les gouvernements annoncent sur l'IA, à la source officielle." } },
  ministry: { label: { en: "AI Ministry", fr: "Ministère de l'IA" }, dek: { en: "Following Canada's Minister of Artificial Intelligence, one announcement at a time.", fr: "Le suivi du ministre canadien de l'Intelligence artificielle, annonce par annonce." } },
  labs: { label: { en: "AI labs", fr: "Laboratoires" }, dek: { en: "What the labs say about their own work, labelled as theirs.", fr: "Ce que les laboratoires disent de leur travail, identifié comme tel." } },
  analysis: { label: { en: "Analysis", fr: "Analyses" }, dek: { en: "Longer reads that explain what the week's AI news means.", fr: "Des lectures plus longues qui expliquent ce que veut dire l'actualité de la semaine." } },
  trending: { label: { en: "Trending", fr: "Tendances" }, dek: { en: "What developers and researchers are talking about today.", fr: "Ce dont parlent les développeurs et les chercheurs aujourd'hui." } },
  news: { label: { en: "AI news, live", fr: "L'IA en direct" }, dek: { en: "The world's AI news, live. Every story credited and linked to its source.", fr: "L'actualité mondiale de l'IA, en direct. Chaque nouvelle créditée et liée à sa source." } },
  dispatch: { label: { en: "Dispatches", fr: "Dépêches" }, dek: { en: "Our own reports: what's confirmed, what's claimed and what's still unknown.", fr: "Nos propres articles : ce qui est confirmé, ce qui est affirmé et ce qu'on ignore encore." } },
  today: { label: { en: "Today in 60 seconds", fr: "L'actualité en 60 secondes" }, dek: { en: "The day's biggest AI stories, and why they matter to you. One minute.", fr: "Les grandes nouvelles de l'IA du jour, et pourquoi elles comptent. Une minute." } },
  quiz: { label: { en: "The Broadsheet 5", fr: "Les 5 du Broadsheet" }, dek: { en: "Five questions from today's AI headlines. Can you get 5/5?", fr: "Cinq questions sur les manchettes IA du jour. Pouvez-vous faire 5/5?" } },
  learn: { label: { en: "Learn", fr: "Apprendre" }, dek: { en: "Plain-language guides for people who want AI to make life and work easier.", fr: "Des guides simples pour que l'IA facilite la vie et le travail." } },
  tools: { label: { en: "Tools", fr: "Outils" }, dek: { en: "AI tools worth trying, with what they're good for and what they cost.", fr: "Des outils d'IA à essayer : à quoi ils servent et ce qu'ils coûtent." } },
  funding: { label: { en: "Funding", fr: "Financement" }, dek: { en: "Programs that pay for AI projects, checked against official pages.", fr: "Les programmes qui financent les projets d'IA, vérifiés sur les pages officielles." } },
  watch: { label: { en: "Watch", fr: "À voir" }, dek: { en: "AI explained on video, from broadcasters, labs and our own desk.", fr: "L'IA expliquée en vidéo, par des diffuseurs, des laboratoires et notre pupitre." } },
  listen: { label: { en: "Listen", fr: "À écouter" }, dek: { en: "Podcasts and interviews about AI, from people who build it and people it affects.", fr: "Balados et entrevues sur l'IA, avec ceux qui la créent et ceux qu'elle touche." } },
  interviews: { label: { en: "Interviews", fr: "Entrevues" }, dek: { en: "Long conversations about AI, in the speakers' own words.", fr: "De longues conversations sur l'IA, dans les mots des invités." } },
  originals: { label: { en: "Originals", fr: "Originaux" }, dek: { en: "Our own explainers: AI in a minute, from the reporting of others.", fr: "Nos propres capsules : l'IA en une minute, d'après les reportages des autres." } },
  editor: { label: { en: "Editor's desk", fr: "Mot de la rédaction" }, dek: { en: "Opinion and analysis from the editor, and nowhere else on the site.", fr: "L'opinion et l'analyse de la rédaction, et nulle part ailleurs sur le site." } },
  young: { label: { en: "Young Lab", fr: "Labo jeunesse" }, dek: { en: "Play with how AI works. No sign-up, no chat, nothing collected.", fr: "Jouez avec le fonctionnement de l'IA. Sans inscription, sans clavardage, rien n'est recueilli." } },
  values: { label: { en: "Our values", fr: "Nos valeurs" }, dek: { en: "People first. Every person has the same dignity. Safe for families.", fr: "L'humain d'abord. Chaque personne a la même dignité. Sûr pour les familles." } },
};

export const OG_SECTION_NAMES = Object.keys(OG_SECTIONS);
