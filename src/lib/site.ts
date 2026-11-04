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
  /** The business that publishes the site. Named in the footer, on /about#ownership and in JSON-LD. */
  publisher: {
    name: "GEN:A Labs",
    url: "https://buildgena.ca",
    city: "Ottawa",
    region: "Ontario",
    country: "Canada",
    /**
     * TODO [PUBLISHER_MAILING_ADDRESS] — a full postal address (street, city, postal code).
     * Canada's Anti-Spam Legislation asks for a mailing address in every newsletter and
     * consent request. While empty, the sign-up box shows the city and the contact email.
     */
    mailingAddress: "",
  },
  /** GEN:A Labs' editor-approved newsroom app. Credited only on the pieces it produced (/desk/<id>). */
  studio: {
    name: "Buildgena Studio",
    url: "https://buildgena.ca/studio",
  },
  /**
   * Who runs the site, shown on /about, /standards and /how-we-use-ai. One person:
   * Cem Guler, known as Jack, founder of AI Broadsheet and of its publisher GEN:A Labs.
   * Use `name` wherever the editor is named so the two spellings never drift apart again.
   */
  editor: {
    name: "Cem (Jack) Guler",
    /** schema.org Person.alternateName */
    alternateName: ["Jack Guler", "Cem Guler"],
    role: { en: "Founder and editor", fr: "Fondateur et responsable éditorial" },
    bio: {
      en: "Cem (Jack) Guler is a journalist, filmmaker and the founder of AI Broadsheet and of its publisher, GEN:A Labs, in Ottawa. He leads editorial direction and is building a small team with volunteer university students, beginning with interviews and reporting projects.",
      fr: "Cem (Jack) Guler est journaliste, cinéaste et fondateur d'AI Broadsheet et de son éditeur, GEN:A Labs, à Ottawa. Il dirige la rédaction et constitue une petite équipe avec des étudiants universitaires bénévoles, en commençant par des entretiens et des projets journalistiques.",
    },
  },
  email: {
    /** Cloudflare Email Routing, enabled 2026-10-10. */
    general: "hello@aibroadsheet.com",
    editor: "corrections@aibroadsheet.com",
    advertise: "hello@aibroadsheet.com",
  },
  newsletter: {
    /** The weekly newsletter. Launches with issue #1; founding sponsors are sold on /advertise. */
    name: { en: "The Canadian AI Brief", fr: "Le Brief canadien de l'IA" },
    frequency: { en: "weekly", fr: "hebdomadaire" },
    /** TODO [NEWSLETTER_PROVIDER], e.g. "Buttondown" or "Beehiiv". Named on /privacy once set. */
    provider: "",
    /**
     * TODO [NEWSLETTER_SUBSCRIBE_URL] — optional. When set (e.g. "https://aibroadsheet.substack.com"),
     * the sign-up box sends readers to the provider's own subscribe page after they tick the
     * consent box. When empty, sign-ups go to POST /api/subscribe, which forwards them to the
     * SUBSCRIBE_WEBHOOK_URL secret (and says "opening soon" with an email fallback while that
     * secret is missing).
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
