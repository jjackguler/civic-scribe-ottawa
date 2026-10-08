/**
 * AI Broadsheet Originals: short explainer videos made by the pipeline in
 * scripts/originals and listed in a manifest on the repository's `media`
 * branch. Shared by the pipeline (writer) and the site (reader).
 */
export type OriginalSource = { name: string; url: string };

export type Original = {
  id: string;
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
};

export type OriginalsManifest = { updatedAt: string; items: Original[] };

export const ORIGINALS_MANIFEST_URL = "https://raw.githubusercontent.com/jjackguler/civic-scribe-ottawa/media/originals/manifest.json";

/** Whether the YouTube copy can be embedded (public or unlisted). */
export const youtubePlayable = (o: Original) => !!o.youtubeId && o.youtubePrivacy !== "private";
