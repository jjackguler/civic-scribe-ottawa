export type Locale = "en" | "fr";
export type Bi = { en: string; fr: string };

export const dict = {
  news: { en: "News", fr: "Actualités" },
  canada: { en: "Canada", fr: "Canada" },
  funding: { en: "Funding", fr: "Financement" },
  tools: { en: "Tools", fr: "Outils" },
  learn: { en: "Learn", fr: "Apprendre" },
  editorsDesk: { en: "Editor's desk", fr: "Mot de la rédaction" },
  about: { en: "About", fr: "À propos" },
  live: { en: "Live", fr: "En direct" },
  latest: { en: "Latest", fr: "Dernières nouvelles" },
  topStories: { en: "Top stories", fr: "À la une" },
  readAtSource: { en: "Read at", fr: "Lire sur" },
  justNow: { en: "just now", fr: "à l'instant" },
  minAgo: { en: "min ago", fr: "min" },
  hAgo: { en: "h ago", fr: "h" },
  dAgo: { en: "d ago", fr: "j" },
  showNew: { en: "Show {n} new stories", fr: "Afficher {n} nouvelles" },
  updated: { en: "Updated", fr: "Mis à jour" },
  loading: { en: "Loading the latest AI news…", fr: "Chargement des dernières nouvelles IA…" },
  feedDown: {
    en: "News sources are not responding right now. The page retries every few minutes.",
    fr: "Les sources ne répondent pas pour le moment. La page réessaie toutes les quelques minutes.",
  },
  all: { en: "All", fr: "Tout" },
  photo: { en: "Photo", fr: "Photo" },
  seeAll: { en: "See all", fr: "Tout voir" },
  canadaDesk: { en: "AI in Canada", fr: "L'IA au Canada" },
  govAnnouncements: { en: "Government announcements", fr: "Annonces gouvernementales" },
  moneyForAi: { en: "Money for AI projects", fr: "De l'argent pour vos projets IA" },
  moneyForAiSub: {
    en: "Federal and provincial programs that pay for AI adoption, compute, research and talent — checked against official pages.",
    fr: "Programmes fédéraux et provinciaux qui financent l'adoption de l'IA, le calcul, la recherche et les talents — vérifiés sur les pages officielles.",
  },
  researchLabs: { en: "From the labs", fr: "Des laboratoires" },
  startHere: { en: "Start here", fr: "Commencer ici" },
  startHereSub: {
    en: "Plain-language guides for people who want AI to make life and work easier.",
    fr: "Des guides simples pour que l'IA facilite la vie et le travail.",
  },
  bestTools: { en: "Tools worth trying", fr: "Outils à essayer" },
  lang: { en: "Français", fr: "English" },
  skip: { en: "Skip to content", fr: "Aller au contenu" },
  sources: { en: "Sources", fr: "Sources" },
  sourcesNote: {
    en: "Headlines and short summaries link to the original publisher. Photos belong to their publishers and are shown with credit.",
    fr: "Les titres et résumés renvoient à l'éditeur d'origine. Les photos appartiennent à leurs éditeurs et sont créditées.",
  },
  lastChecked: { en: "Last checked", fr: "Dernière vérification" },
  officialPage: { en: "Official page", fr: "Page officielle" },
  whoFor: { en: "Who it's for", fr: "Pour qui" },
  whatYouGet: { en: "What you get", fr: "Ce que vous obtenez" },
  free: { en: "Free plan", fr: "Version gratuite" },
  goodFor: { en: "Good for", fr: "Idéal pour" },
  minRead: { en: "min read", fr: "min de lecture" },
  backTo: { en: "Back to", fr: "Retour à" },
  world: { en: "World", fr: "Monde" },
  government: { en: "Government", fr: "Gouvernement" },
  ministry: { en: "AI Ministry", fr: "Ministère de l'IA" },
  business: { en: "Business", fr: "Affaires" },
  research: { en: "Research", fr: "Recherche" },
  labs: { en: "AI labs", fr: "Laboratoires" },
  analysis: { en: "Analysis", fr: "Analyses" },
  resources: { en: "Guides and resources", fr: "Guides et ressources" },
  officialReleases: { en: "Official releases", fr: "Communiqués officiels" },
  inTheNews: { en: "In the news", fr: "Dans l'actualité" },
  moreHeadlines: { en: "More headlines", fr: "Autres manchettes" },
  trackerTitle: { en: "AI Ministry tracker", fr: "Suivi du ministère de l'IA" },
  minister: { en: "Minister of Artificial Intelligence and Digital Innovation", fr: "Ministre de l'Intelligence artificielle et de l'Innovation numérique" },
  noItems: { en: "Nothing new here in the last 30 days.", fr: "Rien de nouveau ici depuis 30 jours." },
  menu: { en: "Menu", fr: "Menu" },
} satisfies Record<string, Bi>;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, locale: Locale, vars?: Record<string, string | number>) {
  let s: string = dict[key][locale];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
