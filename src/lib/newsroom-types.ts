/**
 * The Newsroom: AI Broadsheet's own articles, written with AI by a staged
 * editorial team (scripts/newsroom) and stored as JSON on the repository's
 * `newsroom` branch. Shared by the pipeline (writer) and the site (reader),
 * so nothing here may import server-only or browser-only code.
 *
 * An article extends the Dispatch shape (dispatch-types.ts) so the Dispatch
 * page components (ledger, depth switch, listen) render it unchanged.
 */
import type { Bi } from "./i18n";
import type { DispatchCopy, DispatchSource } from "./dispatch-types";

export const NEWSROOM_REPO = "jjackguler/civic-scribe-ottawa";
export const NEWSROOM_BRANCH = "newsroom";
/** Fresh copy of the store (raw.githubusercontent caches for ~5 minutes; jsDelivr would cache for hours). */
export const NEWSROOM_RAW = `https://raw.githubusercontent.com/${NEWSROOM_REPO}/${NEWSROOM_BRANCH}`;

export const BYLINE: Bi = { en: "AI Broadsheet Newsroom", fr: "Salle de rédaction d'AI Broadsheet" };

/** How the page designer lays the article out. */
export type ArticleFormat = "standard" | "explainer" | "numbers" | "timeline" | "people";
export const FORMATS: ArticleFormat[] = ["standard", "explainer", "numbers", "timeline", "people"];
export const FORMAT_LABEL: Record<ArticleFormat, Bi> = {
  standard: { en: "News", fr: "Nouvelle" },
  explainer: { en: "Explainer", fr: "Explication" },
  numbers: { en: "By the numbers", fr: "En chiffres" },
  timeline: { en: "Timeline", fr: "Chronologie" },
  people: { en: "People", fr: "Les gens" },
};

/** Short cover kickers for the desk topics (news-sources.ts Topic). */
export const TOPIC_KICKER: Record<string, Bi> = {
  agents: { en: "AI agents", fr: "Agents IA" },
  applications: { en: "In use", fr: "Usages" },
  immersive: { en: "Immersive", fr: "Immersif" },
  data: { en: "Data", fr: "Données" },
  infrastructure: { en: "Chips & power", fr: "Puces et énergie" },
  research: { en: "Research", fr: "Recherche" },
  people: { en: "People & skills", fr: "Compétences" },
  responsible: { en: "Responsible AI", fr: "IA responsable" },
  policy: { en: "Policy", fr: "Politiques" },
  business: { en: "Business", fr: "Affaires" },
  sustainability: { en: "Sustainability", fr: "Durabilité" },
  robotics: { en: "Robotics", fr: "Robotique" },
  health: { en: "Health", fr: "Santé" },
};

/** Our palette (src/styles.css). Covers are typographic: never a publisher's photo. */
export type CoverColor = "night" | "lake" | "spruce" | "brass" | "signal" | "paper";
export const COVER_COLORS: CoverColor[] = ["night", "lake", "spruce", "brass", "signal", "paper"];
export type CoverMotif = "rules" | "grid" | "rings" | "bars" | "dots";
export const COVER_MOTIFS: CoverMotif[] = ["rules", "grid", "rings", "bars", "dots"];

export type CoverText = {
  /** Two or three words above the big word, e.g. "Open models". */
  kicker: string;
  /** One word, name or number from the reporting, set huge. */
  big: string;
  /** Optional line under it (at most ~8 words). */
  small?: string;
};
export type Cover = {
  color: CoverColor;
  motif: CoverMotif;
  en: CoverText;
  fr: CoverText;
  /** Optional AI illustration (abstract, never a real person), path inside the store. Always labelled. */
  illustration?: { path: string; alt: Bi; model: string };
};

/** Sections of the article, in reading order. Headings are ours (fixed), not the model's. */
export type SectionKind = "news" | "known" | "matters" | "background";
export const SECTION_HEADING: Record<SectionKind, Bi> = {
  news: { en: "", fr: "" },
  known: { en: "What we know, and what we don't", fr: "Ce qu'on sait, et ce qu'on ignore" },
  matters: { en: "Why it matters", fr: "Pourquoi c'est important" },
  background: { en: "Background", fr: "Contexte" },
};
export type ArticleSection = { kind: SectionKind; paras: string[] };

export type Faq = { q: string; a: string };
/** A link to one of our own evergreen pages (chosen from a fixed list, never free text). */
export type InternalLink = { path: string; label: string };

/** The article in one language. The DispatchCopy fields feed the ledger and "In 30 seconds". */
export type NewsroomCopy = DispatchCopy & {
  /** Display headline (DispatchCopy.headline) is ours; seoTitle is the <title>, at most 60 characters. */
  seoTitle: string;
  /** One or two sentences under the headline. */
  dek: string;
  /** At most 155 characters. */
  metaDescription: string;
  keywords: string[];
  /** The article itself: paragraphs carry [s1] (source) and [b1] (our background page) markers. */
  sections: ArticleSection[];
  faq: Faq[];
  links: InternalLink[];
};

/** Background text our reporter may use: only from our own pages, each one linked. */
export type BackgroundRef = { key: string; path: string; title: Bi };

export type RoleName = "reporter" | "copy" | "standards" | "translator" | "seo" | "designer";
export type RoleNote = { role: RoleName; model: string; at: string; verdict: "pass" | "fixed" | "fail" | "done"; notes: string[] };

export type NewsroomArticle = {
  version: 1;
  id: string;
  /** Permanent URL slugs: /article/<en> and /fr/article/<fr>. */
  slug: Bi;
  createdAt: string;
  updatedAt: string;
  topic: string;
  format: ArticleFormat;
  sources: DispatchSource[];
  background: BackgroundRef[];
  cover: Cover;
  en: NewsroomCopy;
  fr: NewsroomCopy;
  /** Model family that wrote it, for the label. */
  model: "claude" | "gemini";
  /** Words in the article sections, per language (honest length: never padded). */
  words: { en: number; fr: number };
  /** The people-side of the story (editorial.ts humanLens). */
  lens: string[];
  /** What each desk did: kept with the article for the record. */
  roles: RoleNote[];
};

/** What lists, rails and the homepage need (index.json). */
export type NewsroomSummary = {
  id: string;
  slug: Bi;
  createdAt: string;
  updatedAt: string;
  topic: string;
  format: ArticleFormat;
  outlets: string[];
  /** Publication times of the reports, oldest first. */
  times: string[];
  storyIds: string[];
  cover: Cover;
  words: number;
  en: { headline: string; dek: string; news: string; matters: string };
  fr: { headline: string; dek: string; news: string; matters: string };
};

export type NewsroomIndex = { updatedAt: string; items: NewsroomSummary[] };

export function summarizeArticle(a: NewsroomArticle): NewsroomSummary {
  const pick = (c: NewsroomCopy) => ({ headline: c.headline, dek: c.dek, news: c.news, matters: c.matters });
  return {
    id: a.id,
    slug: a.slug,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    topic: a.topic,
    format: a.format,
    outlets: [...new Set(a.sources.map(s => s.outlet))],
    times: a.sources.map(s => s.publishedAt).sort(),
    storyIds: a.sources.map(s => s.storyId),
    cover: a.cover,
    words: a.words.en,
    en: pick(a.en),
    fr: pick(a.fr),
  };
}

// ── slugs ──────────────────────────────────────────────────────────────────
const SLUG_STOP = new Set(("a an the of to in on for and or with at by from as is are was were be its it this that " +
  "le la les l un une des du de d et ou en au aux a pour par sur avec dans est sont ce cette ces").split(" "));

/**
 * A URL slug: lowercase ASCII words joined by hyphens, accents folded
 * ("Québec" → "quebec"), "&" spelled out, small words dropped when the slug
 * would be long, cut at a word boundary. Never empty for text with a letter
 * or digit in it.
 */
export function slugify(text: string, opts: { max?: number; lang?: "en" | "fr" } = {}): string {
  const max = opts.max ?? 72;
  const amp = opts.lang === "fr" ? " et " : " and ";
  const words = text
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/gi, "oe").replace(/æ/gi, "ae").replace(/ß/g, "ss")
    .replace(/&/g, amp)
    .toLowerCase()
    // "l'IA" → "l ia" (elision), "it's" → "its", "3.5" → "3-5", "$1.2 billion" → "1-2 billion"
    .replace(/(\d)[.,](\d)/g, "$1-$2")
    .replace(/['’](?=s\b)/g, "")
    .split(/[^a-z0-9-]+|-+/)
    .filter(Boolean);
  let kept = words;
  if (kept.join("-").length > max) {
    const content = words.filter((w, i) => i === 0 || !SLUG_STOP.has(w));
    if (content.length) kept = content;
  }
  let out = "";
  for (const w of kept) {
    const next = out ? `${out}-${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  if (!out && kept[0]) out = kept[0].slice(0, max);
  return out;
}

/** `base`, or `base-2`, `base-3`… whichever is not taken yet. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const b = base || "article";
  if (!taken.has(b)) return b;
  for (let n = 2; ; n++) if (!taken.has(`${b}-${n}`)) return `${b}-${n}`;
}

// ── the owner's kill list ──────────────────────────────────────────────────
/**
 * killed.json, edited by the owner in GitHub's web editor. Accepts
 * {"killed": ["id-or-slug", {"id": "...", "reason": "..."}]} or a bare array.
 */
export function killedIds(file: unknown): Set<string> {
  const list = Array.isArray(file) ? file : (file && typeof file === "object" ? (file as { killed?: unknown }).killed : null);
  const out = new Set<string>();
  for (const x of Array.isArray(list) ? list : []) {
    const id = typeof x === "string" ? x : x && typeof x === "object" ? (x as { id?: unknown; slug?: unknown }).id ?? (x as { slug?: unknown }).slug : null;
    if (typeof id === "string" && id.trim()) out.add(id.trim());
  }
  return out;
}

export const isKilled = (killed: Set<string>, a: { id: string; slug: Bi }) => killed.has(a.id) || killed.has(a.slug.en) || killed.has(a.slug.fr);

/** "[s1]" source and "[b1]" background markers. */
export const MARKER_RE = /\s*\[((?:[sb]\d+)(?:\s*,\s*[sb]\d+)*)\]/g;
export const stripAllMarkers = (p: string) => p.replace(MARKER_RE, "");

export const countWords = (paras: string[]) => paras.map(stripAllMarkers).join(" ").split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
