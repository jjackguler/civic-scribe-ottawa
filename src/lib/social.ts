import type { Bi } from "./i18n";

/**
 * Picks from social media — chosen by the editor.
 *
 * X and LinkedIn don't offer a free, legal way to pull posts automatically,
 * so popular posts are added here by hand. Add the newest at the top:
 * a link to the post, who posted it, the date, and one line in your own words
 * about why it matters (don't paste the post's text). The section appears on
 * the front page as soon as there is at least one pick.
 */
export type SocialPick = {
  platform: "x" | "linkedin" | "youtube" | "other";
  author: string;
  url: string;
  date: string; // YYYY-MM-DD
  why: Bi;
};

export const SOCIAL_PICKS: SocialPick[] = [];
