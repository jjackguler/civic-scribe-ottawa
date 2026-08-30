/**
 * Keyword → illustration category matching for live RSS headlines.
 * Cheap, deterministic, no API calls. Falls back to the region default
 * (general-ottawa / canada-federal) when nothing matches.
 *
 * Order matters: checked top to bottom, first match wins. Public safety
 * is checked first since it's the most editorially sensitive category.
 */

type Category =
  | "public-safety"
  | "weather"
  | "transit"
  | "city-hall"
  | "business"
  | "neighborhood";

const RULES: { category: Category; pattern: RegExp }[] = [
  {
    category: "public-safety",
    pattern: /\b(police|investigat|homicide|death|dead|crash|arrest|shoot|stabb|missing person|assault|robbery|gunfire|victim|emergency|911|fire crew|firefighters?)\b/i,
  },
  {
    category: "weather",
    pattern: /\b(rain|snow|storm|weather|flood|freezing|ice|heat warning|wind|forecast|showers?|thunderstorm|blizzard|humidex|frost)\b/i,
  },
  {
    category: "transit",
    pattern: /\b(o-?train|oc transpo|\bbus(es)?\b|transit|\block\b|line 1|line 2|lrt|station|route \d|airport)\b/i,
  },
  {
    category: "city-hall",
    pattern: /\b(council|mayor|budget|bylaw|by-law|\bvote(d|s)?\b|ward \d|city hall|zoning|councillor|committee)\b/i,
  },
  {
    category: "business",
    pattern: /\b(business(es)?|econom|\bjobs?\b|storefront|retail|opens? (its|a) (new )?(store|shop|location)|closes? (its|a)? ?(store|shop|location)|market(place)?)\b/i,
  },
  {
    category: "neighborhood",
    pattern: /\b(neighbou?rhood|community centre|community center|\bpark\b|playground|street closure|development proposal)\b/i,
  },
];

export function pickIllustration(headline: string, region: "ottawa" | "canada"): string {
  const h = headline || "";
  for (const rule of RULES) {
    if (rule.pattern.test(h)) return `/illustrations/${rule.category}.svg`;
  }
  return region === "canada" ? "/illustrations/canada-federal.svg" : "/illustrations/general-ottawa.svg";
}
