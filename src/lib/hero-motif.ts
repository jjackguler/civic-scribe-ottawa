import type { Story } from "@/lib/news";

/** Which living cover (HeroMotif) a story gets, from words in its headline, summary and desk. First match wins. */
export type Motif =
  | "gemini"
  | "chat"
  | "chip"
  | "power"
  | "robot"
  | "image"
  | "law"
  | "money"
  | "security"
  | "bias"
  | "city";

const RULES: [Motif, RegExp][] = [
  ["gemini", /\bgemini\b/i],
  [
    "bias",
    /\b(bias(ed)?|discriminat\w*|stereotyp\w*|fairness|hiring|recruit\w*|biais|embauche)\b/i,
  ],
  [
    "chat",
    /\b(chat ?bots?|chatgpt|claude|character\.?ai|companions?|assistants?|copilot|conversation\w*|agents?|robot conversationnel|agent conversationnel)\b/i,
  ],
  [
    "image",
    /\b(image|images|video|sora|veo|midjourney|nano banana|art|artists?|pictures?|photos?|film|music|suno)\b/i,
  ],
  ["chip", /\b(chips?|gpus?|nvidia|semiconductor\w*|tsmc|amd|intel|processors?|puces?)\b/i],
  [
    "power",
    /\b(energy|electric\w*|power|grid|data ?cent(er|re)s?|nuclear|watts?|énergie|électri\w*|centres? de données)\b/i,
  ],
  ["robot", /\b(robots?|robotics|humanoids?|automation|self-driving|autonomous|robotique)\b/i],
  [
    "security",
    /\b(security|hack\w*|breach\w*|privacy|deepfakes?|cyber\w*|spy\w*|surveillance|sécurité|vie privée)\b/i,
  ],
  [
    "law",
    /\b(law|laws|bill|court|lawsuit|sued|regulat\w*|senate|congress|act|ban|bankrupt\w*|chapter 11|judge|loi|tribunal|faillite)\b/i,
  ],
  [
    "money",
    /\b(funding|raises?|raised|billion|million|invest\w*|ipo|valuation|stocks?|shares|revenue|acqui\w*|milliards?|financement)\b/i,
  ],
];

export function motifFor(s: Pick<Story, "title" | "summary" | "topic">): Motif {
  const text = `${s.title} ${s.summary ?? ""} ${s.topic ?? ""}`;
  return RULES.find(([, re]) => re.test(text))?.[0] ?? "city";
}
