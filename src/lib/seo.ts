/**
 * Search and social metadata for every page.
 *
 * English lives at /path, French at /fr/path. The router strips the /fr
 * prefix on the way in (see router.tsx) and the root route puts the locale in
 * the route context, so each route's head() can call `seoHead(match, {...})`
 * and get the right title, canonical URL, hreflang alternates (en-CA, fr-CA,
 * x-default), robots directives, Open Graph and Twitter cards, and JSON-LD
 * for its language.
 *
 * Limits enforced here, so no page can ship a bad snippet:
 * - titles longer than 60 characters lose the " — AI Broadsheet" suffix, then
 *   are cut at a word boundary;
 * - descriptions longer than 155 characters are cut at a sentence end when
 *   one is close, otherwise at a word boundary with an ellipsis.
 */
import { SITE } from "./site";
import type { Bi, Locale } from "./i18n";

export const ORIGIN = `https://${SITE.domain}`;
/** 1200×630 brand card used when a page has no image of its own. */
export const DEFAULT_OG_IMAGE = `${ORIGIN}/og-default.png`;
export const LOGO_URL = `${ORIGIN}/logo-512.png`;

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** True when a public path (pathname, optionally with ?search/#hash) is a French URL. */
export function isFrPath(p: string): boolean {
  return p === "/fr" || /^\/fr[/?#]/.test(p);
}

/** "/fr/news?x" → "/news?x"; "/fr" → "/". Leaves English paths alone. */
export function stripFr(p: string): string {
  if (!isFrPath(p)) return p;
  const rest = p.slice(3);
  return rest.startsWith("/") ? rest : `/${rest}`;
}

/** Public path of an internal path in a given language. */
export function localePath(path: string, locale: Locale): string {
  if (locale !== "fr") return path;
  return path === "/" ? "/fr" : path.startsWith("/?") || path.startsWith("/#") ? `/fr${path.slice(1)}` : `/fr${path}`;
}

export const absUrl = (path: string, locale: Locale) => `${ORIGIN}${localePath(path, locale)}`;

/** BCP 47 tags we publish in. hreflang, og:locale and JSON-LD inLanguage all derive from these. */
export const LANG_TAG: Record<Locale, string> = { en: "en-CA", fr: "fr-CA" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_CA", fr: "fr_CA" };

type Text = string | Bi;
const txt = (v: Text, l: Locale) => (typeof v === "string" ? v : v[l]);

const BRAND_SUFFIX = new RegExp(`\\s+[—–|-]\\s+${SITE.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s+Labs)?$`);

/** A title of at most 60 characters: drop the brand suffix first, then cut at a word. */
export function fitTitle(raw: string, max = TITLE_MAX): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const bare = t.replace(BRAND_SUFFIX, "");
  if (bare.length <= max) return bare;
  const cut = bare.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,:;—–-]+$/, "")}…`;
}

/** A description of at most 155 characters, cut at a sentence end when possible. */
export function fitDescription(raw: string, max = DESCRIPTION_MAX): string {
  const d = raw.replace(/\s+/g, " ").trim();
  if (d.length <= max) return d;
  const head = d.slice(0, max);
  const sentence = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
  if (sentence >= 90) return head.slice(0, sentence + 1);
  const cut = d.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 0 ? cut.slice(0, sp) : cut).replace(/[\s,:;—–-]+$/, "")}…`;
}

/** Robots directives for indexable pages: allow large image previews (Google Discover) and full snippets. */
export const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const ROBOTS_NOINDEX = "noindex, follow";

export type Crumb = { name: Text; path: string };

export type PageSeo = {
  /** Full page title, e.g. "AI news, live — AI Broadsheet". Over 60 characters it is shortened (see fitTitle). */
  title: Text;
  /** Over 155 characters it is shortened (see fitDescription). */
  description: Text;
  /** Absolute image URL for Open Graph / Twitter / Discover (ideally ≥1200 px wide). Falls back to the brand card. */
  image?: string | null;
  /** Alt text for the image. Defaults to the page title (or the site name for the brand card). */
  imageAlt?: Text;
  /** Pixel size of `image`, when known. */
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article";
  /** noindex, follow: search, personal, thin and internal pages. Also drops canonical and hreflang. */
  noindex?: boolean;
  /** Search string to keep in the canonical URL, e.g. "?section=policy". */
  canonicalSearch?: string;
  /** Set false when a page exists in one language only (no hreflang pair). */
  alternates?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /** article:section, e.g. "Glossary". */
  section?: Text;
  /** Trail from the front page (excluded) to this page (included) → BreadcrumbList JSON-LD. */
  breadcrumbs?: Crumb[];
  jsonLd?: (locale: Locale, url: string) => unknown[];
};

type MatchLike = { pathname: string; context?: unknown };

export function localeOf(match: MatchLike): Locale {
  return (match.context as { locale?: Locale } | undefined)?.locale === "fr" ? "fr" : "en";
}

/** Escape "<" so text from a feed can never close the script tag. */
export const ldScript = (obj: unknown) => ({ type: "application/ld+json", children: JSON.stringify(obj).replace(/</g, "\\u003c") });

export function seoHead(match: MatchLike, page: PageSeo) {
  const locale = localeOf(match);
  const path = (match.pathname.replace(/\/+$/, "") || "/") + (page.canonicalSearch ?? "");
  const url = absUrl(path, locale);
  const title = fitTitle(txt(page.title, locale));
  const description = fitDescription(txt(page.description, locale));
  const image = page.image && /^https?:\/\//.test(page.image) ? page.image : DEFAULT_OG_IMAGE;
  const isDefaultImage = image === DEFAULT_OG_IMAGE;
  const imageAlt = page.imageAlt ? txt(page.imageAlt, locale) : isDefaultImage ? SITE.name : title;
  const w = isDefaultImage ? 1200 : page.imageWidth;
  const h = isDefaultImage ? 630 : page.imageHeight;
  const other: Locale = locale === "fr" ? "en" : "fr";

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: page.noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: page.type ?? "website" },
    { property: "og:image", content: image },
    ...(w && h ? [{ property: "og:image:width", content: String(w) }, { property: "og:image:height", content: String(h) }] : []),
    { property: "og:image:alt", content: imageAlt },
    { property: "og:locale", content: OG_LOCALE[locale] },
    ...(page.alternates === false ? [] : [{ property: "og:locale:alternate", content: OG_LOCALE[other] }]),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: imageAlt },
    ...(page.publishedTime ? [{ property: "article:published_time", content: page.publishedTime }] : []),
    ...(page.modifiedTime ? [{ property: "article:modified_time", content: page.modifiedTime }] : []),
    ...(page.section ? [{ property: "article:section", content: txt(page.section, locale) }] : []),
  ];

  const links = page.noindex
    ? []
    : [
        { rel: "canonical", href: url },
        ...(page.alternates === false
          ? []
          : [
              { rel: "alternate", hrefLang: LANG_TAG.en, href: absUrl(path, "en") },
              { rel: "alternate", hrefLang: LANG_TAG.fr, href: absUrl(path, "fr") },
              { rel: "alternate", hrefLang: "x-default", href: absUrl(path, "en") },
            ]),
      ];

  const ld = [
    ...(page.jsonLd?.(locale, url) ?? []),
    ...(page.breadcrumbs?.length && !page.noindex ? [breadcrumbLd(locale, page.breadcrumbs)] : []),
  ];

  return { meta, links, scripts: ld.map(ldScript) };
}

/** BreadcrumbList from the front page to this page. */
export function breadcrumbLd(locale: Locale, crumbs: Crumb[]) {
  const all: Crumb[] = [{ name: { en: "Front page", fr: "À la une" }, path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: txt(c.name, locale), item: absUrl(c.path, locale) })),
  };
}

/** The publication, for JSON-LD `publisher` fields and the home page. */
export function organizationLd(locale: Locale) {
  const sameAs = [SITE.social.linkedin, SITE.social.x, SITE.social.youtube].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${ORIGIN}/#organization`,
    name: SITE.name,
    url: absUrl("/", locale),
    logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
    image: DEFAULT_OG_IMAGE,
    description: SITE.description[locale],
    inLanguage: [LANG_TAG.en, LANG_TAG.fr],
    parentOrganization: { "@type": "Organization", name: SITE.publisher.name },
    address: { "@type": "PostalAddress", addressLocality: SITE.publisher.city, addressRegion: SITE.publisher.region, addressCountry: "CA" },
    publishingPrinciples: absUrl("/standards", locale),
    correctionsPolicy: absUrl("/corrections", locale),
    ethicsPolicy: absUrl("/values", locale),
    actionableFeedbackPolicy: absUrl("/corrections", locale),
    ...(SITE.email.editor ? { email: SITE.email.editor } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** WebSite with a SearchAction (sitelinks search box). */
export function websiteLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${ORIGIN}/#website`,
    name: SITE.name,
    url: absUrl("/", locale),
    inLanguage: LANG_TAG[locale],
    publisher: { "@id": `${ORIGIN}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absUrl("/search", locale)}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export const publisherRef = { "@type": "NewsMediaOrganization", "@id": `${ORIGIN}/#organization`, name: SITE.name, logo: { "@type": "ImageObject", url: LOGO_URL } };

/** FAQPage from question/answer pairs. Only use where the Q&A is visible on the page. */
export function faqLd(locale: Locale, items: { q: Bi; a: Bi }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: LANG_TAG[locale],
    mainEntity: items.map(i => ({ "@type": "Question", name: i.q[locale], acceptedAnswer: { "@type": "Answer", text: i.a[locale] } })),
  };
}
