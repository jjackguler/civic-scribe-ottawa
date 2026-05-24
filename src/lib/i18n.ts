export type Locale = "en" | "fr";

type Dict = Record<string, { en: string; fr: string }>;

export const dict: Dict = {
  brand: { en: "Ottawa Civic Ledger", fr: "Le Registre Civique d'Ottawa" },
  tagline: {
    en: "Local journalism, street by street. Verified, bilingual, independent.",
    fr: "Journalisme local, rue par rue. Vérifié, bilingue, indépendant.",
  },
  nav: { en: "Sections", fr: "Sections" },
  search: { en: "Search", fr: "Rechercher" },
  donate: { en: "Donate", fr: "Faire un don" },
  submit: { en: "Submit a Story", fr: "Soumettre" },
  readMore: { en: "Continue reading", fr: "Lire la suite" },
  liveAlerts: { en: "Live civic alerts", fr: "Alertes en direct" },
  todayInOttawa: { en: "Today in Ottawa", fr: "Aujourd'hui à Ottawa" },
  liveUpdates: { en: "Live updates", fr: "Mises à jour en direct" },
  neighborhoods: { en: "Neighborhoods", fr: "Quartiers" },
  whatsNear: { en: "What's happening near you", fr: "Ce qui se passe près de vous" },
  factCheck: { en: "Fact check", fr: "Vérification des faits" },
  solutions: { en: "Solutions", fr: "Solutions" },
  goodNews: { en: "Good news", fr: "Bonnes nouvelles" },
  jobs: { en: "Jobs", fr: "Emplois" },
  events: { en: "Events", fr: "Événements" },
  traffic: { en: "Traffic & Transit", fr: "Circulation et transport" },
  weather: { en: "Weather", fr: "Météo" },
  ottawa: { en: "Ottawa", fr: "Ottawa" },
  canada: { en: "Canada", fr: "Canada" },
  world: { en: "World", fr: "Monde" },
  politics: { en: "Politics", fr: "Politique" },
  sports: { en: "Sports", fr: "Sports" },
  arts: { en: "Arts", fr: "Arts" },
  education: { en: "Education", fr: "Éducation" },
  about: { en: "About", fr: "À propos" },
  trust: { en: "Trust & Ethics", fr: "Confiance et éthique" },
  verified: { en: "Verified", fr: "Vérifié" },
  developing: { en: "Developing", fr: "En développement" },
  community: { en: "Community", fr: "Communauté" },
  opinion: { en: "Opinion", fr: "Opinion" },
  sponsored: { en: "Sponsored", fr: "Commandité" },
  minRead: { en: "min read", fr: "min de lecture" },
  updated: { en: "Updated", fr: "Mis à jour" },
  supportLine: {
    en: "Independent civic journalism, supported by readers.",
    fr: "Journalisme civique indépendant, soutenu par les lecteurs.",
  },
};

export function t(key: keyof typeof dict, locale: Locale) {
  return dict[key]?.[locale] ?? key;
}
