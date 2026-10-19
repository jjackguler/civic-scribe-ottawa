/**
 * AI Broadsheet Originals: short explainer videos made by the pipeline in
 * scripts/originals and listed in a manifest on the repository's `media`
 * branch. Shared by the pipeline (writer) and the site (reader).
 */
export type OriginalSource = { name: string; url: string };

/** Shelves on the Explainers page, in display order. */
export type OriginalSection = "noir" | "culture" | "mind" | "news";
export const ORIGINAL_SECTIONS: { id: OriginalSection; en: string; fr: string; dekEn: string; dekFr: string }[] = [
  { id: "noir", en: "The Sir Jack Files", fr: "Les dossiers Sir Jack", dekEn: "Film-noir investigations into AI and the people it touches.", dekFr: "Des enquêtes façon film noir sur l'IA et les personnes qu'elle touche." },
  { id: "culture", en: "Culture, Art & Cinema", fr: "Culture, art et cinéma", dekEn: "Stories, films and art, and why they stay with us.", dekFr: "Des histoires, des films et de l'art, et pourquoi ils nous marquent." },
  { id: "mind", en: "Mind & Society", fr: "Esprit et société", dekEn: "Psychology, behaviour and how AI changes everyday life.", dekFr: "Psychologie, comportements et la façon dont l'IA change le quotidien." },
  { id: "news", en: "News explainers", fr: "Explicatifs d'actualité", dekEn: "The day's AI stories in about a minute.", dekFr: "L'actualité de l'IA en une minute environ." },
];
export function originalSection(o: { id: string; section?: OriginalSection }): OriginalSection {
  if (o.section) return o.section;
  if (o.id.includes("sir-jack")) return "noir";
  if (o.id.includes("mind-society")) return "mind";
  return "news";
}

export type Original = {
  id: string;
  /** "explainer" (default): a news explainer written from publishers' reporting. "titles": our own opening titles. */
  kind?: "explainer" | "titles";
  /** Shelf on the Explainers page; inferred from the id when missing (see originalSection). */
  section?: OriginalSection;
  publishedAt: string;
  /** Headline of the explainer (ours, checked against the sources). */
  title: string;
  /** One-sentence summary shown under the video. */
  summary: string;
  durationSec: number;
  /** YouTube video id once uploaded. */
  youtubeId?: string;
  /** YouTube's privacy status after upload; uploads from unaudited API projects are locked to "private". */
  youtubePrivacy?: "public" | "unlisted" | "private";
  /** Our own copy (GitHub release asset), played when YouTube can't be. */
  fileUrl?: string;
  /** Poster image for our own player (first card). */
  posterUrl?: string;
  /** The publishers' reporting the script was written from. */
  sources: OriginalSource[];
  /** Full narration, for accessibility and search. */
  transcript: string;
  voice: string;
  aiImages: boolean;
  /** Sources and licences for archive photos, music and sound effects actually used. */
  credits?: string;
};

export type OriginalsManifest = { updatedAt: string; items: Original[] };

export const ORIGINALS_MANIFEST_URL = "https://raw.githubusercontent.com/jjackguler/civic-scribe-ottawa/media/originals/manifest.json";

/** Whether the YouTube copy can be embedded (public or unlisted). */
export const youtubePlayable = (o: Original) => !!o.youtubeId && o.youtubePrivacy !== "private";

/** The owner reported this version's Suno music was made on the free plan.
 * Keep its files for re-editing; publish a new id after replacing the soundtrack.
 */
const MUSIC_RIGHTS_HOLD = new Set(["202610081600-what-is-ai-opening-titles"]);
export const originalPublishable = (o: Original) => !MUSIC_RIGHTS_HOLD.has(o.id) && (youtubePlayable(o) || !!o.fileUrl);
