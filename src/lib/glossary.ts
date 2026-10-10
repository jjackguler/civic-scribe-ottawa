/**
 * The AI glossary: plain-language definitions of the words in AI news, in
 * English and French, written by AI Broadsheet (no copied text).
 *
 * Each term has a short definition, a one-liner a 12-year-old would follow,
 * an everyday example, why it matters to people, related terms and, where
 * useful, the Labs path or guide that goes further.
 *
 * The term data (glossary-terms-*.ts) is large, so routes load it with a
 * dynamic import inside their loaders: it never lands in the main bundle.
 * Use loadGlossary() rather than importing the data files directly.
 */
import type { Bi, Locale } from "./i18n";

/** Date the glossary was last reviewed as a whole (YYYY-MM-DD). Shown on the page and used for lastmod. */
export const GLOSSARY_UPDATED = "2026-10-09";

export type GlossaryCategory = "basics" | "inside" | "using" | "safety" | "law" | "work" | "media";

export const CATEGORY_LABEL: Record<GlossaryCategory, Bi> = {
  basics: { en: "The basics", fr: "Les bases" },
  inside: { en: "How models work", fr: "Comment fonctionnent les modèles" },
  using: { en: "Using AI", fr: "Utiliser l'IA" },
  safety: { en: "Safety and ethics", fr: "Sécurité et éthique" },
  law: { en: "Law and policy", fr: "Droit et politiques" },
  work: { en: "Work and business", fr: "Travail et entreprises" },
  media: { en: "Images, voice and video", fr: "Images, voix et vidéo" },
};

export const CATEGORY_ORDER: GlossaryCategory[] = ["basics", "inside", "using", "media", "safety", "law", "work"];

/** A link out of a term page: a Labs path id, a /learn guide slug or a /guides hub slug. */
export type TermLink = { labs?: string; learn?: string; hub?: string };

export type GlossaryTerm = {
  /** URL slug, the same in both languages so /glossary/x and /fr/glossary/x pair up. */
  slug: string;
  term: Bi;
  /** Other names, abbreviations. */
  aka?: Bi;
  category: GlossaryCategory;
  /** The definition: two or three plain sentences. */
  short: Bi;
  /** "In one line for a 12-year-old." */
  kid: Bi;
  /** An everyday example. */
  example: Bi;
  /** Why it matters to people: rights, work, privacy, safety… */
  why: Bi;
  /** Related term slugs (must exist). */
  related: string[];
  links?: TermLink[];
};

/** One term in one language, as the pages need it. */
export type TermView = {
  slug: string;
  term: string;
  aka?: string;
  category: GlossaryCategory;
  categoryLabel: string;
  short: string;
  kid: string;
  example: string;
  why: string;
  related: { slug: string; term: string }[];
  links: TermLink[];
};

/** Compact entry for the A–Z list and search. */
export type TermCard = Pick<TermView, "slug" | "term" | "aka" | "category" | "short" | "kid">;

export async function loadGlossary(): Promise<GlossaryTerm[]> {
  const [a, b, c, d] = await Promise.all([
    import("./glossary-terms-1"),
    import("./glossary-terms-2"),
    import("./glossary-terms-3"),
    import("./glossary-terms-4"),
  ]);
  return [...a.TERMS, ...b.TERMS, ...c.TERMS, ...d.TERMS];
}

/** Sort key that ignores accents and case ("Éthique" files under E). */
export const foldKey = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function sortTerms<T extends { term: string }>(list: T[], locale: Locale): T[] {
  return [...list].sort((x, y) => foldKey(x.term).localeCompare(foldKey(y.term), locale === "fr" ? "fr-CA" : "en-CA"));
}

export function viewTerm(t: GlossaryTerm, all: GlossaryTerm[], l: Locale): TermView {
  const bySlug = new Map(all.map(x => [x.slug, x]));
  return {
    slug: t.slug,
    term: t.term[l],
    aka: t.aka?.[l],
    category: t.category,
    categoryLabel: CATEGORY_LABEL[t.category][l],
    short: t.short[l],
    kid: t.kid[l],
    example: t.example[l],
    why: t.why[l],
    related: t.related.map(s => bySlug.get(s)).filter((x): x is GlossaryTerm => !!x).map(x => ({ slug: x.slug, term: x.term[l] })),
    links: t.links ?? [],
  };
}

export const cardOf = (t: GlossaryTerm, l: Locale): TermCard => ({ slug: t.slug, term: t.term[l], aka: t.aka?.[l], category: t.category, short: t.short[l], kid: t.kid[l] });
