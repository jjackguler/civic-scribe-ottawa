/**
 * Where our Open Graph images live, for page heads. Safe to import anywhere:
 * no rendering code, no server code.
 *
 *   head: ({ match, loaderData }) => {
 *     const d = loaderData?.dispatch;
 *     const locale = localeOf(match);
 *     const head = seoHead(match, { ..., image: ogImageFor("article", d.id, locale, { version: d.createdAt }) });
 *     return { ...head, meta: [...head.meta, ...ogImageMeta(d[locale].headline)] };
 *   }
 */
import { ORIGIN } from "../seo";
import { quizDay } from "../youth-core";
import type { Locale } from "../i18n";

/** Bump when the card designs change: every OG URL changes with it, so CDNs and social caches refetch. */
export const OG_REV = "1";

export type OgKind = "article" | "quiz" | "section";

/** A short, stable hash for URL versions. */
export function ogHash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** The version part of an OG URL: design revision + content version. */
export const ogVersion = (content = "") => (content ? `${OG_REV}.${ogHash(content)}` : OG_REV);

/**
 * Path (no origin) of the share image for a page. Versioned per content, so
 * each URL is immutable and cached by the CDN for a year.
 *
 *   article  idOrName = dispatch id; opts.version = its createdAt (or any content version)
 *   quiz     idOrName ignored (or a "YYYY-MM-DD" day); defaults to today in Ottawa
 *   section  idOrName = a section name, e.g. "policy", "canada", "dispatch", "today"
 */
export function ogImagePath(kind: OgKind, idOrName: string | undefined, locale: Locale, opts: { version?: string; day?: string } = {}): string {
  const q = new URLSearchParams();
  if (locale === "fr") q.set("lang", "fr");
  if (kind === "quiz") {
    const day = opts.day ?? (idOrName && /^\d{4}-\d{2}-\d{2}$/.test(idOrName) ? idOrName : quizDay());
    q.set("d", day);
    q.set("v", OG_REV);
    return `/og/quiz.png?${q}`;
  }
  q.set("v", ogVersion(kind === "article" ? opts.version ?? "" : ""));
  const name = encodeURIComponent(idOrName ?? "");
  return kind === "article" ? `/og/article/${name}.png?${q}` : `/og/section/${name}.png?${q}`;
}

/** Absolute URL of the share image for a page: pass it as `image` to seoHead(). */
export function ogImageFor(kind: OgKind, idOrName: string | undefined, locale: Locale, opts: { version?: string; day?: string } = {}): string {
  return `${ORIGIN}${ogImagePath(kind, idOrName, locale, opts)}`;
}

/**
 * The image tags seoHead() only adds for the default card. Append them to its
 * `meta` when you pass one of ours: `meta: [...head.meta, ...ogImageMeta(alt)]`.
 */
export function ogImageMeta(alt: string): Array<Record<string, string>> {
  return [
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:alt", content: alt },
    { name: "twitter:image:alt", content: alt },
  ];
}
