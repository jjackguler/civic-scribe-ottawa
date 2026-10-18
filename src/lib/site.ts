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
   * Keep this aligned with the primary deployment domain and public/robots.txt.
   */
  domain: "aibroadsheet.com",
  tagline: {
    en: "AI news, with the human stakes left in. One catch a day.",
    fr: "L'actualité IA, sans perdre de vue les enjeux humains. Une mise au point par jour.",
  },
  description: {
    en: "Independent AI news, short videos and visual explainers. Understand artificial intelligence and its human impact, with sources linked and limits explained.",
    fr: "Actualité indépendante de l'IA, vidéos courtes et explications visuelles. Comprendre l'intelligence artificielle et ses effets humains, sources à l'appui.",
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
  /** Cloudflare Web Analytics (cookieless), installed manually to avoid duplicate beacons. */
  cloudflareAnalyticsToken: "9a828408ce894cf0865655bda68a0d73",
  /** Social profiles. An icon appears only when its URL is set. */
  social: {
    instagram: "https://www.instagram.com/aibroadsheet/",
    tiktok: "https://www.tiktok.com/@aibroadsheet",
    facebook: "https://www.facebook.com/profile.php?id=61594952624655",
    linkedin: "https://www.linkedin.com/company/aibroadsheet/",
    x: "https://x.com/aibroadsheet",
    youtube: "https://www.youtube.com/channel/UCbs9TPhUYPPxA0aRkdT7uvQ",
  },
} as const;
