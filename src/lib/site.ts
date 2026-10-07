/**
 * Brand and owner configuration — change a value here and it updates
 * everywhere (header, footer, page titles, social cards, legal pages).
 *
 * Values marked TODO are waiting for the owner. While a value is empty the
 * site hides whatever depends on it instead of showing a placeholder.
 */
export const SITE = {
  name: "AI Broadsheet",
  /** Planned domain (not registered yet). Used for canonical URLs, sitemap and feeds. */
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
    name: "", // TODO [EDITOR_NAME]
    role: { en: "", fr: "" }, // TODO [ROLE]
    bio: { en: "", fr: "" }, // TODO [BIO]
  },
  email: {
    /** TODO [EDITOR_EMAIL] — corrections, terms and reader contact. Hidden while empty. */
    editor: "",
    /** Advertising enquiries. Works once the domain is registered and forwarding is set up. */
    advertise: "advertise@aibroadsheet.com",
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
    linkedin: "", // TODO [LINKEDIN_URL]
    x: "", // TODO [X_URL]
    youtube: "",
  },
} as const;
