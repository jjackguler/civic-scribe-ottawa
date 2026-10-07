/**
 * Search and social metadata for every page.
 *
 * English lives at /path, French at /fr/path. The router strips the /fr
 * prefix on the way in (see router.tsx) and the root route puts the locale in
 * the route context, so each route's head() can call `seoHead(match, {...})`
 * and get the right title, canonical URL, hreflang alternates, Open Graph and
 * Twitter cards, and JSON-LD for its language.
 */
import { SITE } from "./site";
import type { Bi, Locale } from "./i18n";

export const ORIGIN = `https://${SITE.domain}`;
/** 1200×630 brand card used when a page has no image of its own. */
export const DEFAULT_OG_IMAGE = `${ORIGIN}/og-default.png`;

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

type Text = string | Bi;
const txt = (v: Text, l: Locale) => (typeof v === "string" ? v : v[l]);

export type PageSeo = {
  /** Full page title, e.g. "AI news, live — AI Broadsheet". */
  title: Text;
  description: Text;
  /** Absolute image URL; falls back to the brand card. */
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
  /** Search string to keep in the canonical URL, e.g. "?section=policy". */
  canonicalSearch?: string;
  publishedTime?: string;
  jsonLd?: (locale: Locale, url: string) => unknown[];
};

type MatchLike = { pathname: string; context?: unknown };

export function localeOf(match: MatchLike): Locale {
  return (match.context as { locale?: Locale } | undefined)?.locale === "fr" ? "fr" : "en";
}

export function seoHead(match: MatchLike, page: PageSeo) {
  const locale = localeOf(match);
  const path = (match.pathname.replace(/\/+$/, "") || "/") + (page.canonicalSearch ?? "");
  const url = absUrl(path, locale);
  const title = txt(page.title, locale);
  const description = txt(page.description, locale);
  const image = page.image || DEFAULT_OG_IMAGE;
  const isDefaultImage = image === DEFAULT_OG_IMAGE;

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: page.type ?? "website" },
    { property: "og:image", content: image },
    ...(isDefaultImage
      ? [{ property: "og:image:width", content: "1200" }, { property: "og:image:height", content: "630" }, { property: "og:image:alt", content: SITE.name }]
      : []),
    { property: "og:locale", content: locale === "fr" ? "fr_CA" : "en_CA" },
    { property: "og:locale:alternate", content: locale === "fr" ? "en_CA" : "fr_CA" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    ...(page.publishedTime ? [{ property: "article:published_time", content: page.publishedTime }] : []),
    ...(page.noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
  ];

  const links = page.noindex
    ? []
    : [
        { rel: "canonical", href: url },
        { rel: "alternate", hrefLang: "en", href: absUrl(path, "en") },
        { rel: "alternate", hrefLang: "fr", href: absUrl(path, "fr") },
        { rel: "alternate", hrefLang: "x-default", href: absUrl(path, "en") },
      ];

  const ld = page.jsonLd?.(locale, url) ?? [];
  const scripts = ld.map(obj => ({ type: "application/ld+json", children: JSON.stringify(obj) }));

  return { meta, links, scripts };
}

/** The publication, for JSON-LD `publisher` fields and the home page. */
export function organizationLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${ORIGIN}/#organization`,
    name: SITE.name,
    url: absUrl("/", locale),
    logo: { "@type": "ImageObject", url: `${ORIGIN}/logo-512.png`, width: 512, height: 512 },
    description: SITE.description[locale],
    inLanguage: ["en-CA", "fr-CA"],
    parentOrganization: { "@type": "Organization", name: SITE.publisher.name },
    address: { "@type": "PostalAddress", addressLocality: SITE.publisher.city, addressRegion: SITE.publisher.region, addressCountry: "CA" },
    publishingPrinciples: absUrl("/standards", locale),
    correctionsPolicy: absUrl("/corrections", locale),
    ...(SITE.email.editor ? { email: SITE.email.editor } : {}),
    sameAs: [SITE.social.linkedin, SITE.social.x, SITE.social.youtube].filter(Boolean),
  };
}

export const publisherRef = { "@type": "NewsMediaOrganization", "@id": `${ORIGIN}/#organization`, name: SITE.name, logo: { "@type": "ImageObject", url: `${ORIGIN}/logo-512.png` } };
