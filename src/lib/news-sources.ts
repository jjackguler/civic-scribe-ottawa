/**
 * Free, public RSS/Atom feeds used by the AI news desk.
 * We only store and show: headline, a short summary, the source name,
 * the publish time, a link back to the original, and the publisher's own
 * photo (with credit). Full articles always stay on the publisher's site.
 *
 * Every feed below was opened and checked on 2026-10-06.
 * To add a source: append an entry. A feed that fails never blocks the rest.
 */

export type Region = "canada" | "world";
export type Topic = "policy" | "business" | "research" | "products" | "society";
export type Kind = "news" | "gov" | "lab" | "analysis" | "trending";
export type Level = "federal" | "provincial" | "municipal";

export type NewsSource = {
  id: string;
  name: string;
  url: string;
  /** Publisher home page, shown on the About page. */
  home: string;
  region: Region;
  lang: "en" | "fr";
  kind: Kind;
  /** General feeds (not AI-only) are filtered down to AI stories. */
  aiOnly: boolean;
  /** Government level, for government feeds. */
  level?: Level;
  /** Official releases from the Minister of AI and Digital Innovation. */
  minister?: boolean;
  /** Feeds that rarely change are re-checked every 30 minutes instead of every 8. */
  slow?: boolean;
  /** How to read the source. Defaults to RSS/Atom. */
  format?: "rss" | "anthropic-html" | "hn" | "hf-papers";
  /** Rewrite links from a CMS origin to the public site: [from, to]. */
  linkRewrite?: [string, string];
};

const GC_NEWS = "https://api.io.canada.ca/io-server/gc/news";
const GC_Q = "sort=publishedDate&orderBy=desc&format=atom&atomtitle=x";

// Order matters on a cold start: feeds higher in the list are fetched first.
export const NEWS_SOURCES: NewsSource[] = [
  // ── Government of Canada: the AI minister and federal announcements ──────
  { id: "min-en", name: "Minister of AI and Digital Innovation", url: `${GC_NEWS}/en/v2?minister=honevansolomon&pick=40&${GC_Q}`, home: "https://www.canada.ca/en/innovation-science-economic-development.html", region: "canada", lang: "en", kind: "gov", aiOnly: true, level: "federal", minister: true },
  { id: "min-fr", name: "Ministre de l'IA et de l'Innovation numérique", url: `${GC_NEWS}/fr/v2?minister=honevansolomon&pick=40&${GC_Q}`, home: "https://www.canada.ca/fr/innovation-sciences-developpement-economique.html", region: "canada", lang: "fr", kind: "gov", aiOnly: true, level: "federal", minister: true },
  { id: "gc-en", name: "Government of Canada", url: `${GC_NEWS}/en/v2?pick=100&${GC_Q}`, home: "https://www.canada.ca/en/news.html", region: "canada", lang: "en", kind: "gov", aiOnly: false, level: "federal" },
  { id: "gc-fr", name: "Gouvernement du Canada", url: `${GC_NEWS}/fr/v2?pick=100&${GC_Q}`, home: "https://www.canada.ca/fr/nouvelles.html", region: "canada", lang: "fr", kind: "gov", aiOnly: false, level: "federal" },

  // ── Canadian newsrooms ──────────────────────────────────────────────────
  { id: "betakit", name: "BetaKit", url: "https://betakit.com/feed/", home: "https://betakit.com", region: "canada", lang: "en", kind: "news", aiOnly: false },
  { id: "globe-tech", name: "The Globe and Mail", url: "https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/business/technology/", home: "https://www.theglobeandmail.com", region: "canada", lang: "en", kind: "news", aiOnly: false },
  { id: "cbc-tech", name: "CBC News", url: "https://www.cbc.ca/webfeed/rss/rss-technology", home: "https://www.cbc.ca/news/science", region: "canada", lang: "en", kind: "news", aiOnly: false },
  { id: "cbc-politics", name: "CBC News", url: "https://www.cbc.ca/webfeed/rss/rss-politics", home: "https://www.cbc.ca/news/politics", region: "canada", lang: "en", kind: "news", aiOnly: false },
  { id: "global-tech", name: "Global News", url: "https://globalnews.ca/tech/feed/", home: "https://globalnews.ca/tech/", region: "canada", lang: "en", kind: "news", aiOnly: false },
  { id: "lapresse", name: "La Presse", url: "https://www.lapresse.ca/affaires/techno/rss", home: "https://www.lapresse.ca/affaires/techno/", region: "canada", lang: "fr", kind: "news", aiOnly: false },
  { id: "rc-techno", name: "Radio-Canada", url: "https://ici.radio-canada.ca/info/rss/techno/en-continu", home: "https://ici.radio-canada.ca/techno", region: "canada", lang: "fr", kind: "news", aiOnly: false },

  // ── International newsrooms ─────────────────────────────────────────────
  { id: "techcrunch", name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/", home: "https://techcrunch.com/category/artificial-intelligence/", region: "world", lang: "en", kind: "news", aiOnly: true },
  { id: "verge", name: "The Verge", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", home: "https://www.theverge.com/ai-artificial-intelligence", region: "world", lang: "en", kind: "news", aiOnly: true },
  { id: "mittr", name: "MIT Technology Review", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", home: "https://www.technologyreview.com/topic/artificial-intelligence/", region: "world", lang: "en", kind: "news", aiOnly: true },
  { id: "wired", name: "Wired", url: "https://www.wired.com/feed/tag/ai/latest/rss", home: "https://www.wired.com/tag/artificial-intelligence/", region: "world", lang: "en", kind: "news", aiOnly: true },
  { id: "ars", name: "Ars Technica", url: "https://arstechnica.com/ai/feed/", home: "https://arstechnica.com/ai/", region: "world", lang: "en", kind: "news", aiOnly: true },
  { id: "venturebeat", name: "VentureBeat", url: "https://venturebeat.com/category/ai/feed/", home: "https://venturebeat.com/category/ai/", region: "world", lang: "en", kind: "news", aiOnly: true },

  // ── What the tech community is reading (popularity signals) ────────────
  { id: "hn", name: "Hacker News", url: "https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=40", home: "https://news.ycombinator.com", region: "world", lang: "en", kind: "trending", aiOnly: true, format: "hn" },
  { id: "hf-papers", name: "Hugging Face Papers", url: "https://huggingface.co/api/daily_papers?limit=30", home: "https://huggingface.co/papers", region: "world", lang: "en", kind: "trending", aiOnly: true, format: "hf-papers", slow: true },

  // ── AI labs and company blogs ───────────────────────────────────────────
  { id: "anthropic", name: "Anthropic", url: "https://www.anthropic.com/news", home: "https://www.anthropic.com/news", region: "world", lang: "en", kind: "lab", aiOnly: true, format: "anthropic-html" },
  { id: "openai", name: "OpenAI", url: "https://openai.com/news/rss.xml", home: "https://openai.com/news/", region: "world", lang: "en", kind: "lab", aiOnly: true },
  { id: "deepmind", name: "Google DeepMind", url: "https://deepmind.google/blog/feed", home: "https://deepmind.google/discover/blog/", region: "world", lang: "en", kind: "lab", aiOnly: true },
  { id: "google-ai", name: "Google AI", url: "https://blog.google/technology/ai/rss/", home: "https://blog.google/technology/ai/", region: "world", lang: "en", kind: "lab", aiOnly: true },
  { id: "huggingface", name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", home: "https://huggingface.co/blog", region: "world", lang: "en", kind: "lab", aiOnly: true },

  // ── Provincial and municipal governments (AI items only) ────────────────
  { id: "ontario", name: "Government of Ontario", url: "https://news.ontario.ca/opo/en/rss/news.rss", home: "https://news.ontario.ca", region: "canada", lang: "en", kind: "gov", aiOnly: false, level: "provincial", slow: true },
  { id: "bc-gov", name: "Government of B.C.", url: "https://news.gov.bc.ca/feed", home: "https://news.gov.bc.ca", region: "canada", lang: "en", kind: "gov", aiOnly: false, level: "provincial", slow: true },
  { id: "toronto", name: "City of Toronto", url: "https://www.toronto.ca/news/feed/", home: "https://www.toronto.ca/news/", region: "canada", lang: "en", kind: "gov", aiOnly: false, level: "municipal", slow: true },
  { id: "calgary", name: "City of Calgary", url: "https://newsroom.calgary.ca/feed/", home: "https://newsroom.calgary.ca", region: "canada", lang: "en", kind: "gov", aiOnly: false, level: "municipal", slow: true },

  // ── Local newsrooms (AI stories about cities and provinces) ─────────────
  { id: "cbc-toronto", name: "CBC Toronto", url: "https://www.cbc.ca/webfeed/rss/rss-canada-toronto", home: "https://www.cbc.ca/news/canada/toronto", region: "canada", lang: "en", kind: "news", aiOnly: false, slow: true },
  { id: "cbc-ottawa", name: "CBC Ottawa", url: "https://www.cbc.ca/webfeed/rss/rss-canada-ottawa", home: "https://www.cbc.ca/news/canada/ottawa", region: "canada", lang: "en", kind: "news", aiOnly: false, slow: true },
  { id: "cbc-montreal", name: "CBC Montreal", url: "https://www.cbc.ca/webfeed/rss/rss-canada-montreal", home: "https://www.cbc.ca/news/canada/montreal", region: "canada", lang: "en", kind: "news", aiOnly: false, slow: true },
  { id: "cbc-bc", name: "CBC British Columbia", url: "https://www.cbc.ca/webfeed/rss/rss-canada-britishcolumbia", home: "https://www.cbc.ca/news/canada/british-columbia", region: "canada", lang: "en", kind: "news", aiOnly: false, slow: true },

  // ── Analysis, newsletters and research writing ──────────────────────────
  { id: "the-batch", name: "The Batch", url: "https://charonhub.deeplearning.ai/rss/", home: "https://www.deeplearning.ai/the-batch/", region: "world", lang: "en", kind: "analysis", aiOnly: true, slow: true, linkRewrite: ["https://charonhub.deeplearning.ai/", "https://www.deeplearning.ai/the-batch/"] },
  { id: "importai", name: "Import AI", url: "https://importai.substack.com/feed", home: "https://importai.substack.com", region: "world", lang: "en", kind: "analysis", aiOnly: true, slow: true },
  { id: "oneuseful", name: "One Useful Thing", url: "https://www.oneusefulthing.org/feed", home: "https://www.oneusefulthing.org", region: "world", lang: "en", kind: "analysis", aiOnly: true, slow: true },
  { id: "lastweekin", name: "Last Week in AI", url: "https://lastweekin.ai/feed", home: "https://lastweekin.ai", region: "world", lang: "en", kind: "analysis", aiOnly: true, slow: true },
  { id: "gradient", name: "The Gradient", url: "https://thegradient.pub/rss/", home: "https://thegradient.pub", region: "world", lang: "en", kind: "analysis", aiOnly: true, slow: true },
  { id: "nvidia", name: "NVIDIA Developer", url: "https://developer.nvidia.com/blog/feed", home: "https://developer.nvidia.com/blog", region: "world", lang: "en", kind: "lab", aiOnly: true, slow: true },
  { id: "allbusiness", name: "AllBusiness", url: "https://www.allbusiness.com/feeds/feed.rss", home: "https://www.allbusiness.com", region: "world", lang: "en", kind: "analysis", aiOnly: false, slow: true },
];

/** Followed but without a public feed — linked from the About page. */
export const NO_FEED_SOURCES = [
  { name: "Stanford HAI", home: "https://hai.stanford.edu/news" },
  { name: "TIME — AI", home: "https://time.com/section/tech/" },
  { name: "The Wall Street Journal — Tech", home: "https://www.wsj.com/tech" },
];
