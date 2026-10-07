/**
 * The editor's desk overlay: hand-written headlines for the day's biggest
 * stories. Write one only after reading the original article, and keep it
 * true to it — punchy, never misleading. The story page always shows the
 * publisher's original headline underneath.
 *
 * `link` is the publisher's article URL (copy it from the story page).
 */
import type { Bi } from "./i18n";

export type DeskHeadline = { link: string; headline: Bi; dek?: Bi };

export const DESK_HEADLINES: DeskHeadline[] = [
  // {
  //   link: "https://www.example.com/the-original-article",
  //   headline: { en: "Your sharper headline", fr: "Votre titre" },
  //   dek: { en: "One line on why it matters.", fr: "Une ligne sur l'enjeu." },
  // },
];

const byLink = new Map(DESK_HEADLINES.map(d => [d.link, d]));
export const deskFor = (link: string) => byLink.get(link);
