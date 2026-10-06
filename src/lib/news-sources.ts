/**
 * Free, public RSS/Atom feeds used by the AI news desk.
 * We only store and show: headline, a short summary, the source name,
 * the publish time, a link back to the original, and the publisher's own
 * photo (with credit). Full articles always stay on the publisher's site.
 *
 * To add a source: append an entry. A feed that fails never blocks the rest.
 */

export type Region = "canada" | "world";
export type Topic = "policy" | "business" | "research" | "products" | "society";

export type NewsSource = {
  id: string;
  name: string;
  url: string;
  region: Region;
  lang: "en" | "fr";
  /** General feeds (not AI-only) are filtered down to AI stories. */
  aiOnly: boolean;
  /** Government feeds: shown in the announcements list, never as photo stories. */
  gov?: boolean;
  /** Research labs / company blogs. */
  lab?: boolean;
};

const GC_NEWS = "https://api.io.canada.ca/io-server/gc/news";

export const NEWS_SOURCES: NewsSource[] = [
  // Canada
  { id: "betakit", name: "BetaKit", url: "https://betakit.com/feed/", region: "canada", lang: "en", aiOnly: false },
  { id: "cbc-tech", name: "CBC News", url: "https://www.cbc.ca/webfeed/rss/rss-technology", region: "canada", lang: "en", aiOnly: false },
  { id: "global-tech", name: "Global News", url: "https://globalnews.ca/tech/feed/", region: "canada", lang: "en", aiOnly: false },
  {
    id: "gc-en", name: "Government of Canada", region: "canada", lang: "en", aiOnly: false, gov: true,
    url: `${GC_NEWS}/en/v2?sort=publishedDate&orderBy=desc&pick=100&format=atom&atomtitle=Canada%20News%20Centre`,
  },
  {
    id: "gc-fr", name: "Gouvernement du Canada", region: "canada", lang: "fr", aiOnly: false, gov: true,
    url: `${GC_NEWS}/fr/v2?sort=publishedDate&orderBy=desc&pick=100&format=atom&atomtitle=Centre%20d%27information%20du%20Canada`,
  },

  // World
  { id: "techcrunch", name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/", region: "world", lang: "en", aiOnly: true },
  { id: "verge", name: "The Verge", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", region: "world", lang: "en", aiOnly: true },
  { id: "mittr", name: "MIT Technology Review", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", region: "world", lang: "en", aiOnly: true },
  { id: "venturebeat", name: "VentureBeat", url: "https://venturebeat.com/category/ai/feed/", region: "world", lang: "en", aiOnly: true },
  { id: "ars", name: "Ars Technica", url: "https://arstechnica.com/ai/feed/", region: "world", lang: "en", aiOnly: true },
  { id: "wired", name: "Wired", url: "https://www.wired.com/feed/tag/ai/latest/rss", region: "world", lang: "en", aiOnly: true },

  // Labs
  { id: "google-ai", name: "Google AI", url: "https://blog.google/technology/ai/rss/", region: "world", lang: "en", aiOnly: true, lab: true },
  { id: "openai", name: "OpenAI", url: "https://openai.com/news/rss.xml", region: "world", lang: "en", aiOnly: true, lab: true },
  { id: "huggingface", name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", region: "world", lang: "en", aiOnly: true, lab: true },
];
