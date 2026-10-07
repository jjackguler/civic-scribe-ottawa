/**
 * Video and audio desks. Videos come from each channel's public YouTube feed
 * and play in YouTube's own embedded player (credited to the channel).
 * Podcast episodes come from each show's public RSS feed and play from the
 * show's own audio file, exactly as in a podcast app.
 *
 * General news channels are filtered down to AI stories.
 * To add a channel: append an entry with its channel ID (the "UC…" part of
 * youtube.com/channel/UC…). A feed that fails never blocks the rest.
 */

export type MediaSource = {
  id: string;
  name: string;
  type: "youtube" | "podcast";
  /** YouTube channel ID, or the podcast's RSS URL. */
  ref: string;
  home: string;
  lang: "en" | "fr";
  /** Only keep items about AI. */
  filter: boolean;
  /** Every episode is a long-form conversation with a guest. */
  interviews?: boolean;
  /** Newsroom: shown first in the Watch desk. */
  newsroom?: boolean;
};

const yt = (id: string, name: string, ref: string, extra: Partial<MediaSource> = {}): MediaSource => ({
  id, name, type: "youtube", ref, home: `https://www.youtube.com/channel/${ref}`, lang: "en", filter: true, ...extra,
});

export const MEDIA_SOURCES: MediaSource[] = [
  // ── Broadcast and newsroom channels (AI stories only) ───────────────────
  yt("yt-cnbc", "CNBC Television", "UCrp_UI8XtuYfpiqluWLD7Lw", { newsroom: true }),
  yt("yt-bloomberg-tv", "Bloomberg Television", "UCIALMKvObZNtJ6AmdCLP7Lg", { newsroom: true }),
  yt("yt-cnn", "CNN", "UCupvZG-5ko_eiXAupbDfxWw", { newsroom: true }),
  yt("yt-reuters", "Reuters", "UChqUTb7kYRX8-EiaN3XFrSQ", { newsroom: true }),
  yt("yt-wsj", "The Wall Street Journal", "UCK7tptUDHh-RYDsdxO1-5QQ", { newsroom: true }),
  yt("yt-cbc", "CBC News", "UCuFFtHWoLl5fauMMD5Ww2jA", { newsroom: true }),
  yt("yt-global", "Global News", "UChLtXXpo4Ge1ReTEboVvTDg", { newsroom: true }),
  yt("yt-techcrunch", "TechCrunch", "UCCjyq_K1Xwfg8Lndy7lKMpA", { newsroom: true }),
  yt("yt-verge", "The Verge", "UCddiUEpeqJcYeBxX1IVBKvQ", { newsroom: true }),
  yt("yt-wired", "WIRED", "UCftwRNsjfRo08xYE31tkiyw", { newsroom: true }),
  yt("yt-cnet", "CNET", "UCOmcA3f_RrH6b9NmcNa4tdg", { newsroom: true }),

  // ── AI labs and explainers ──────────────────────────────────────────────
  yt("yt-openai", "OpenAI", "UCXZCJLdBC09xxGZ6gcdrc6A", { filter: false }),
  yt("yt-deepmind", "Google DeepMind", "UCP7jMXSY2xbc3KCAE0MHQ-A", { filter: false }),
  yt("yt-nvidia", "NVIDIA", "UCHuiy8bXnmK5nisYHUd1J5g"),
  yt("yt-2mp", "Two Minute Papers", "UCbfYPyITQ-7l4upoX8nvctg", { filter: false }),
  yt("yt-aiexplained", "AI Explained", "UCNJ1Ymd5yFuUPtn21xtRbbw", { filter: false }),
  yt("yt-karpathy", "Andrej Karpathy", "UCXUPKJO5MZQN11PqgIvyuvQ", { filter: false }),

  // ── Interviews on video ─────────────────────────────────────────────────
  yt("yt-lex", "Lex Fridman", "UCSHZKyawb77ixDdsGog4iWA", { interviews: true }),
  yt("yt-mlst", "Machine Learning Street Talk", "UCMLtBahI5DMrt0NPvDSoIRQ", { interviews: true, filter: false }),
  yt("yt-yc", "Y Combinator", "UCcefcZRL2oaA_uBNeo5UOWg"),
  yt("yt-a16z", "a16z", "UC9cn0TuPq4dnbTY-CBsm8XA"),

  // ── Podcasts ────────────────────────────────────────────────────────────
  { id: "pod-hardfork", name: "Hard Fork (The New York Times)", type: "podcast", ref: "https://feeds.simplecast.com/l2i9YnTd", home: "https://www.nytimes.com/column/hard-fork", lang: "en", filter: true },
  { id: "pod-lex", name: "Lex Fridman Podcast", type: "podcast", ref: "https://lexfridman.com/feed/podcast/", home: "https://lexfridman.com/podcast/", lang: "en", filter: true, interviews: true },
  { id: "pod-dwarkesh", name: "Dwarkesh Podcast", type: "podcast", ref: "https://api.substack.com/feed/podcast/69345.rss", home: "https://www.dwarkesh.com", lang: "en", filter: true, interviews: true },
  { id: "pod-latent", name: "Latent Space", type: "podcast", ref: "https://api.substack.com/feed/podcast/1084089.rss", home: "https://www.latent.space", lang: "en", filter: false, interviews: true },
  { id: "pod-nopriors", name: "No Priors", type: "podcast", ref: "https://feeds.megaphone.fm/nopriors", home: "https://www.nopriors.com", lang: "en", filter: false, interviews: true },
  { id: "pod-practical", name: "Practical AI", type: "podcast", ref: "https://changelog.com/practicalai/feed", home: "https://practicalai.fm", lang: "en", filter: false },
];
