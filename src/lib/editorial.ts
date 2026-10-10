/**
 * The editorial charter of AI Broadsheet, in one place.
 *
 * - VALUES is what readers see on /values and at the top of /standards.
 * - HOUSE_VOICE is added to every prompt our AI writers get (desk headlines,
 *   dispatches, explainer scripts, the Keeper, quiz questions), so they all
 *   write in the same voice.
 * - editorialGate() is the mechanical part: stories that fail it never reach
 *   the site.
 * - humanLens() finds the people-side of a story (rights, privacy, work,
 *   children, democracy…) for the "People first" desk.
 */
import type { Bi } from "./i18n";

export const VALUES: { id: string; h: Bi; p: Bi }[] = [
  {
    id: "people",
    h: { en: "People first", fr: "L'humain d'abord" },
    p: {
      en: "We cover AI by asking what it does to people: their rights, their work, their children, their privacy and their say in how they are governed. Machines and markets are part of the story; people are the point of it.",
      fr: "Nous couvrons l'IA en nous demandant ce qu'elle change pour les gens : leurs droits, leur travail, leurs enfants, leur vie privée et leur voix dans la façon dont ils sont gouvernés. Les machines et les marchés font partie de l'histoire; les personnes en sont le cœur.",
    },
  },
  {
    id: "dignity",
    h: { en: "Every person has the same dignity", fr: "Chaque personne a la même dignité" },
    p: {
      en: "We stand for human rights and democracy. We reject racism, the claimed superiority of any group over another, and hate in every form. We report on people of every background, belief and none with the same fairness, and we never use words that demean anyone.",
      fr: "Nous défendons les droits de la personne et la démocratie. Nous rejetons le racisme, la prétendue supériorité d'un groupe sur un autre et la haine sous toutes ses formes. Nous traitons les gens de toutes origines et de toutes convictions avec la même équité, sans jamais employer de mots qui rabaissent qui que ce soit.",
    },
  },
  {
    id: "faith",
    h: { en: "Respect for faith", fr: "Le respect de la foi" },
    p: {
      en: "The people who make AI Broadsheet are people of faith. Our own voice is respectful of faith and of God: we do not mock religion or belief, and we do not write in a voice that dismisses faith. We still report accurately on everyone, whatever they believe.",
      fr: "Les personnes qui font AI Broadsheet sont des croyants. Notre propre voix respecte la foi et Dieu : nous ne tournons pas la religion ou les croyances en dérision, et nous n'écrivons pas sur un ton qui méprise la foi. Nous rapportons tout de même les faits avec exactitude sur chacun, quelles que soient ses croyances.",
    },
  },
  {
    id: "clean",
    h: { en: "Safe for families", fr: "Sûr pour les familles" },
    p: {
      en: "We do not publish sexual, erotic or pornographic material, or violence for its own sake. Stories whose headlines are sexually explicit are filtered out before they reach the site. When abuse must be reported, we report the harm and the response, never the detail.",
      fr: "Nous ne publions aucun contenu sexuel, érotique ou pornographique, ni de violence gratuite. Les nouvelles dont le titre est sexuellement explicite sont filtrées avant d'arriver sur le site. Quand un abus doit être rapporté, nous rapportons le tort et la réponse, jamais les détails.",
    },
  },
  {
    id: "children",
    h: { en: "Children at the centre", fr: "Les enfants au centre" },
    p: {
      en: "Young Lab collects nothing about children, sends nothing they type anywhere and has no open AI chat. Ads are switched off there. Everything for young readers is checked against one question: is this good for the child?",
      fr: "Le Labo jeunesse ne recueille rien sur les enfants, n'envoie nulle part ce qu'ils tapent et n'a pas de clavardage ouvert avec une IA. La publicité y est désactivée. Tout ce qui s'adresse aux jeunes répond à une seule question : est-ce bon pour l'enfant?",
    },
  },
  {
    id: "balance",
    h: { en: "Neither fear nor hype", fr: "Ni peur ni battage" },
    p: {
      en: "We are not against technology, and we are not its salespeople. We say what a system does, who benefits, who carries the risk and what is still unknown, and we leave the verdict to you.",
      fr: "Nous ne sommes pas contre la technologie, et nous n'en sommes pas les vendeurs. Nous disons ce qu'un système fait, à qui il profite, qui en porte le risque et ce qu'on ignore encore, et nous vous laissons juger.",
    },
  },
  {
    id: "honest",
    h: { en: "Honest about how we work", fr: "Transparents sur notre méthode" },
    p: {
      en: "Every story names its source. Everything written with AI is labelled and checked against the reporting it came from. When we are wrong, we correct it in public.",
      fr: "Chaque nouvelle nomme sa source. Tout ce qui est écrit avec l'IA est identifié et vérifié par rapport aux reportages d'origine. Quand nous nous trompons, nous corrigeons publiquement.",
    },
  },
];

/**
 * The house voice, added to every system prompt. It shapes tone and framing
 * only; the facts still come only from the sources each writer is given.
 */
export const HOUSE_VOICE = `House voice of AI Broadsheet (applies to everything you write):
- Human-centred: where the sources allow, say what the news means for people (rights, work, privacy, children, safety, democracy). Never invent an impact the sources don't support.
- Dignity: never demean any person or group; no stereotypes; no language that ranks one race, nation, religion or group above another. Report hateful acts as harms, never repeat slurs.
- Respect for faith: never mock religion, belief or God, and do not write in a voice that dismisses faith. Report people of every belief, and none, fairly.
- Family-safe: no sexual, erotic or graphic detail of any kind. If a story involves abuse, describe the harm and the response only, without detail.
- Balanced: neither fear nor hype about technology; no sensational words, no exclamation marks.`;

// ── the gate ────────────────────────────────────────────────────────────────
/** Headlines/excerpts that are sexually explicit or promote adult content. */
const EXPLICIT = /\b(porn\w*|pornograph\w*|erotic\w*|nsfw|nude\w*|nudity|naked|onlyfans|sexting|hentai|x-rated|adult (content|site|video|film|entertainment|industry)|sex (bot|chatbot|toy|tape|work\w*)|strip ?club|camgirl\w*|fetish\w*|explicit (images?|content|photos?|videos?)|undress\w*|érotique\w*|pornographi\w*|contenu pour adultes|nu(e|es|s)? intégra\w*|sexuellement explicite\w*)\b/i;

export type GateResult = { ok: true } | { ok: false; reason: "explicit" | "sponsored" };

/** Paid content from a feed is advertising, not news: it never enters the editorial stream. */
const SPONSORED = /^\s*(?:sponsored|partner content|paid (?:post|content)|advertorial|promoted|presented by|brought to you by|contenu (?:commandité|sponsorisé|partenaire)|publireportage)\b/i;

/**
 * Public-interest reporting about sexual abuse made with AI (deepfake victims,
 * "nudify" apps, laws and prosecutions) is harm reporting, not explicit
 * content: it stays in the adult news stream. Young Lab never shows news.
 */
const HARM_REPORTING = /\b(?:deepfakes?|victims?|abuse|exploitation|non-?consensual|without (?:their )?consent|harass\w*|ban(?:s|ned)?|law|bill|lawsuit|sued|charged|arrest\w*|police|prosecut\w*|regulat\w*|protect\w*|safety|hypertrucage\w*|victimes?|abus|exploitation|consentement|loi|interdi\w*|poursuite\w*|accus\w*)\b/i;

/** Stories that fail never reach the site. Kept mechanical and published on /values. */
export function editorialGate(s: { title: string; summary?: string }): GateResult {
  const text = `${s.title} ${s.summary ?? ""}`;
  if (SPONSORED.test(s.title) || /\bsponsored\b/i.test(s.title.slice(0, 40))) return { ok: false, reason: "sponsored" };
  if (EXPLICIT.test(text) && !HARM_REPORTING.test(text)) return { ok: false, reason: "explicit" };
  return { ok: true };
}

// ── the human lens ──────────────────────────────────────────────────────────
export type Lens = "rights" | "privacy" | "work" | "children" | "democracy" | "access" | "health" | "safety";

export const LENS_LABEL: Record<Lens, Bi> = {
  rights: { en: "Rights", fr: "Droits" },
  privacy: { en: "Privacy", fr: "Vie privée" },
  work: { en: "Work", fr: "Travail" },
  children: { en: "Children & youth", fr: "Enfants et jeunes" },
  democracy: { en: "Democracy", fr: "Démocratie" },
  access: { en: "Accessibility", fr: "Accessibilité" },
  health: { en: "Health", fr: "Santé" },
  safety: { en: "Safety", fr: "Sécurité" },
};

const LENSES: [Lens, RegExp][] = [
  ["children", /\b(child|children|kids?|teen\w*|minors?|students?|schools?|youth|parents?|enfants?|jeunes|élèves|écoles?|adolescent\w*)\b/i],
  ["democracy", /\b(election\w*|vot(e|ers?|ing)|democra\w*|parliament|congress|misinformation|disinformation|deepfakes?|propaganda|élection\w*|électeur\w*|démocrati\w*|désinformation|hypertrucage\w*)\b/i],
  ["rights", /\b(human rights|civil rights|discriminat\w*|bias(ed)?|racis\w*|surveillance|facial recognition|refugees?|migrants?|freedom of|censor\w*|droits de la personne|droits humains|discrimin\w*|reconnaissance faciale)\b/i],
  ["privacy", /\b(privacy|personal data|data protection|tracking|consent|leak\w*|breach\w*|vie privée|données personnelles|consentement|fuite\w*)\b/i],
  ["work", /\b(jobs?|workers?|employ\w*|layoffs?|labou?r|wages?|unions?|hiring|gig|careers?|emplois?|travailleu\w*|mises? à pied|salaires?|syndicat\w*|embauche)\b/i],
  ["access", /\b(accessib\w*|disabilit\w*|blind|deaf|wheelchair|assistive|accessibilité|handicap\w*|aveugles?|sourds?)\b/i],
  ["health", /\b(health|hospitals?|patients?|doctors?|nurses?|medical|mental health|clinic\w*|santé|hôpita\w*|médec\w*|infirmi\w*)\b/i],
  ["safety", /\b(safety|scam\w*|fraud\w*|harm\w*|abuse|exploitation|cyberattack\w*|sécurité|arnaque\w*|fraude\w*|préjudice\w*)\b/i],
];

/** The people-side of a story, strongest first (at most two). Empty when the story is purely about products or markets. */
export function humanLens(s: { title: string; summary?: string }): Lens[] {
  const text = `${s.title} ${s.summary ?? ""}`;
  return LENSES.filter(([, re]) => re.test(text)).map(([l]) => l).slice(0, 2);
}
