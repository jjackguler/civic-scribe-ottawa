/**
 * Brand configuration — change the name here and it updates everywhere
 * (header, footer, page titles, social cards).
 */
export const SITE = {
  name: "AI Broadsheet",
  domain: "aibroadsheet.com",
  tagline: {
    en: "The world's AI newspaper, live",
    fr: "Le journal mondial de l'IA, en direct",
  },
  description: {
    en: "Live artificial intelligence news from the world's newsrooms, labs and governments — with video, interviews and podcasts. Every story credited and linked to its source.",
    fr: "L'actualité de l'intelligence artificielle en direct, des salles de nouvelles, laboratoires et gouvernements du monde entier — avec vidéos, entrevues et balados. Chaque article est crédité et lié à sa source.",
  },
  /** Set these up once the domain is registered (free email forwarding works). */
  email: {
    advertise: "advertise@aibroadsheet.com",
    editor: "editor@aibroadsheet.com",
  },
  /**
   * Daily newsletter, "The Morning Broadsheet". Create a free Substack (or
   * Beehiiv) publication and put its address here, e.g.
   * "https://aibroadsheet.substack.com". Until then the sign-up box says
   * sign-ups open soon.
   */
  newsletterUrl: "",
  social: {
    linkedin: "",
    x: "",
    youtube: "",
  },
} as const;
