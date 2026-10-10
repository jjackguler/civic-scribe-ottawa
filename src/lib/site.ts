/**
 * Brand and owner configuration — change a value here and it updates
 * everywhere (header, footer, page titles, social cards, legal pages).
 *
 * Values marked TODO are waiting for the owner. While a value is empty the
 * site hides whatever depends on it instead of showing a placeholder.
 */
export const SITE = {
  name: "AI Broadsheet",
  /**
   * The live address, used for canonical URLs, hreflang, sitemaps, feeds and share links.
   * Keep this aligned with the primary domain in Lovable and public/robots.txt.
   */
  domain: "aibroadsheet.com",
  tagline: {
    en: "The world's AI newspaper, live",
    fr: "Le journal mondial de l'IA, en direct",
  },
  description: {
    en: "Live artificial intelligence news from the world's newsrooms, labs and governments — with video, interviews and podcasts. Every story credited and linked to its source.",
    fr: "L'actualité de l'intelligence artificielle en direct, des salles de nouvelles, laboratoires et gouvernements du monde entier — avec vidéos, entrevues et balados. Chaque article est crédité et lié à sa source.",
  },
  /** The business that publishes the site. */
  publisher: {
    name: "GEN:A Labs",
    city: "Ottawa",
    region: "Ontario",
    country: "Canada",
  },
  /** Who runs the site, shown on /about. */
  editor: {
    name: "Jack Guler",
    role: { en: "Editor", fr: "Responsable éditorial" },
    bio: { en: "", fr: "" }, // TODO [BIO]
  },
  email: {
    /** Cloudflare Email Routing, enabled 2026-10-10. */
    general: "hello@aibroadsheet.com",
    editor: "corrections@aibroadsheet.com",
    advertise: "hello@aibroadsheet.com",
  },
  newsletter: {
    /** TODO [NEWSLETTER_PROVIDER], e.g. "Substack" or "Beehiiv". Named on /privacy. */
    provider: "",
    /**
     * TODO [NEWSLETTER_SUBSCRIBE_URL] — the publication's address, e.g.
     * "https://aibroadsheet.substack.com". Until set, the sign-up box says
     * sign-ups open soon.
     */
    url: "",
  },
  /** TODO [CLOUDFLARE_ANALYTICS_TOKEN] — Cloudflare Web Analytics (cookieless). Off while empty. */
  cloudflareAnalyticsToken: "",
  /** Social profiles. An icon appears only when its URL is set. */
  social: {
    instagram: "", // Enable only after the brand account is created and verified.
    tiktok: "",
    facebook: "https://www.facebook.com/aibroadsheet",
    linkedin: "", // TODO [LINKEDIN_URL]
    x: "", // TODO [X_URL]
    youtube: "",
  },
} as const;
