// Editorial publishing types. DB-ready; swap fixtures for Supabase later
// by replacing src/lib/editorial-data.ts implementations.

export type EditorialType =
  | "news" | "interview" | "opinion" | "analysis" | "essay"
  | "cartoon" | "satire" | "photo-essay" | "investigation"
  | "explainer" | "solution" | "op-doc" | "column" | "letter"
  | "community-voice";

export type EditorialLabel =
  | "NEWS" | "INTERVIEW" | "OPINION" | "ANALYSIS" | "CARTOON"
  | "SATIRE" | "LETTER" | "INVESTIGATION" | "EXPLAINER"
  | "SOLUTIONS" | "OP-DOC" | "ESSAY" | "PHOTO ESSAY"
  | "COLUMN" | "COMMUNITY VOICE";

export type AuthorRole =
  | "reporter" | "columnist" | "editor" | "cartoonist"
  | "contributor" | "community-voice" | "photographer";

export interface Author {
  id: string;
  slug: string;
  name: string;
  role: AuthorRole;
  bio_en: string;
  bio_fr: string;
  language: "en" | "fr" | "both";
  neighborhood?: string;
  social_links?: { twitter?: string; instagram?: string; mastodon?: string; website?: string };
  disclosure?: string;
  portrait_src?: string; // newsprint:<color> sentinel ok
}

export interface ColumnDef {
  slug: string;
  name_en: string;
  name_fr: string;
  columnist_id: string;
  description_en: string;
  description_fr: string;
  topic_tags: string[];
  cadence: "weekly" | "biweekly" | "monthly";
  accent: string; // hex for newsprint placeholder
}

export interface MediaAsset {
  id: string;
  kind: "image" | "audio" | "video";
  src: string; // url or newsprint:<color> sentinel
  alt_en: string;
  alt_fr: string;
  credit: string;
  rights_status: "owner-confirmed" | "cc-licensed" | "ai-generated" | "editorial-stock";
  consent_status?: "owner-confirmed" | "not-required" | "pending";
  location?: string;
  caption_en?: string;
  caption_fr?: string;
}

export type Locale = "en" | "fr";
export interface Bilingual { en: string; fr: string }

export interface EditorialBase {
  slug: string;
  type: EditorialType;
  label: EditorialLabel;
  title: Bilingual;
  dek: Bilingual;
  byline_author_ids: string[];
  publishedAt: string;
  updatedAt?: string;
  neighborhood?: string;
  language: "en" | "fr" | "both";
  hero?: MediaAsset;
  body_blocks: Bilingual[]; // paragraphs; rich blocks can be added later
  pull_quote?: Bilingual;
  sources?: { label: string; url?: string }[];
  corrections?: { at: string; note: Bilingual }[];
  editor_note?: Bilingual;
  comments_enabled?: boolean; // default false
  related_slugs?: string[]; // {type}:{slug}
  donation_cta?: boolean;
  sensitive_topic?: boolean; // forces no satire cross-link, no letters CTA
  topic_tags?: string[];
  read_minutes?: number;
}

// Specializations
export interface InterviewArticle extends EditorialBase {
  type: "interview";
  person: { name: string; role: string; neighborhood?: string; portrait?: MediaAsset };
  intro: Bilingual;
  qa: { q: Bilingual; a: Bilingual }[];
  key_quote: Bilingual;
  transcript?: Bilingual;
  audio_placeholder?: boolean;
  video_placeholder?: boolean;
}

export interface OpinionArticle extends EditorialBase {
  type: "opinion";
  author_disclosure: Bilingual;
  conflict_note?: Bilingual;
}

export interface ColumnEntry extends EditorialBase {
  type: "column";
  column_slug: string;
}

export interface AnalysisArticle extends EditorialBase {
  type: "analysis";
  key_findings: Bilingual[];
}

export interface EssayArticle extends EditorialBase { type: "essay" }

export interface CartoonArticle extends EditorialBase {
  type: "cartoon";
  artist_id: string;
  caption: Bilingual;
  alt_text: Bilingual;
  image: MediaAsset;
}

export interface SatireArticle extends EditorialBase {
  type: "satire";
  content_warnings?: string[];
}

export interface PhotoEssayArticle extends EditorialBase {
  type: "photo-essay";
  photographer_id: string;
  photos: MediaAsset[];
}

export interface InvestigationArticle extends EditorialBase {
  type: "investigation";
  chapters: { id: string; title: Bilingual; body_blocks: Bilingual[] }[];
  methodology: Bilingual;
  documents?: { label: string; url?: string }[];
}

export interface ExplainerArticle extends EditorialBase {
  type: "explainer";
  questions: { q: Bilingual; a: Bilingual }[];
  glossary?: { term: Bilingual; def: Bilingual }[];
}

export interface SolutionArticle extends EditorialBase {
  type: "solution";
  problem: Bilingual;
  evidence: Bilingual[];
  local_application: Bilingual;
}

export interface OpDocArticle extends EditorialBase {
  type: "op-doc";
  status: "coming-soon" | "published";
  video_src?: string;
  thumbnail?: MediaAsset;
  transcript?: Bilingual;
  credits?: Bilingual;
}

export interface CommunityVoiceArticle extends EditorialBase {
  type: "community-voice";
}

export interface NewsArticle extends EditorialBase { type: "news" }

export interface LetterArticle extends EditorialBase {
  type: "letter";
  writer_display_name: string;
  anonymous: boolean;
  topic: string;
  body: Bilingual;
  moderation_status: "pending" | "approved" | "rejected";
  editor_response?: Bilingual;
}

export type AnyEditorial =
  | NewsArticle | InterviewArticle | OpinionArticle | ColumnEntry
  | AnalysisArticle | EssayArticle | CartoonArticle | SatireArticle
  | PhotoEssayArticle | InvestigationArticle | ExplainerArticle
  | SolutionArticle | OpDocArticle | CommunityVoiceArticle | LetterArticle;
