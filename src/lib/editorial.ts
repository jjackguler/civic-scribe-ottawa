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
    h: { en: "Human rights come first", fr: "Les droits de la personne d'abord" },
    p: {
      en: "We cover AI through universal human rights: what it changes for people's work, privacy, safety and freedom. People are the point of the story. We report human-rights violations clearly, whoever is responsible.",
      fr: "Nous couvrons l'IA à la lumière des droits universels de la personne : ce qu'elle change pour le travail, la vie privée, la sécurité et la liberté des gens. Les personnes sont au cœur de l'histoire. Nous rapportons clairement les violations des droits de la personne, peu importe qui en est responsable.",
    },
  },
  {
    id: "dignity",
    h: { en: "Every person has the same dignity", fr: "Chaque personne a la même dignité" },
    p: {
      en: "Every person has equal dignity and rights. We stand for equality and reject racism, discrimination and claims that one group is superior to another. We report on people of every background and worldview with the same fairness, without stereotypes or demeaning language.",
      fr: "Chaque personne a la même dignité et les mêmes droits. Nous défendons l'égalité et rejetons le racisme, la discrimination et toute prétention à la supériorité d'un groupe sur un autre. Nous traitons les gens de toutes origines et visions du monde avec la même équité, sans stéréotypes ni propos dévalorisants.",
    },
  },
  {
    id: "democracy",
    h: { en: "Democracy and civil liberties", fr: "Démocratie et libertés civiles" },
    p: {
      en: "We stand for democracy, freedom of expression and people's right to have a say in how they are governed. We scrutinize power and hold institutions accountable, without serving any political party. Our reporting follows evidence, not political allegiance.",
      fr: "Nous défendons la démocratie, la liberté d'expression et le droit de chacun de participer aux décisions qui le concernent. Nous examinons l'exercice du pouvoir et demandons des comptes aux institutions, sans servir aucun parti politique. Nos reportages suivent les faits, pas les allégeances politiques.",
    },
  },
  {
    id: "faith",
    h: { en: "Freedom of belief and conscience", fr: "Liberté de croyance et de conscience" },
    p: {
      en: "We respect every person's freedom to practise a religion, hold a belief, change it, or hold no religious belief. We report on religious and non-religious people with the same fairness. We do not mock, demean or discriminate against anyone because of faith, conscience or worldview.",
      fr: "Nous respectons la liberté de chaque personne de pratiquer une religion, d'avoir une croyance, d'en changer ou de n'avoir aucune croyance religieuse. Nous traitons les personnes religieuses et non religieuses avec la même équité dans nos reportages. Nous ne ridiculisons, ne rabaissons ni ne discriminons personne en raison de sa foi, de sa conscience ou de sa vision du monde.",
    },
  },
  {
    id: "clean",
    h: { en: "Safe for families", fr: "Sûr pour les familles" },
    p: {
      en: "We protect people's dignity when reporting harm. We do not publish sexual, erotic or pornographic material, or gratuitous violence. Explicit content is filtered out; public-interest reporting on abuse describes the harm and the response, never sexual or graphic detail.",
      fr: "Nous protégeons la dignité des personnes lorsque nous rapportons des préjudices. Nous ne publions aucun contenu sexuel, érotique ou pornographique, ni de violence gratuite. Le contenu explicite est filtré; les reportages d'intérêt public sur les abus décrivent le tort et la réponse, jamais les détails sexuels ou graphiques.",
    },
  },
  {
    id: "children",
    h: { en: "Children's rights, privacy and safety", fr: "Droits, vie privée et sécurité des enfants" },
    p: {
      en: "Children have rights to privacy, safety and learning. Young Lab collects nothing about children, sends nothing they type anywhere and has no open AI chat. Ads are switched off there. We judge everything for young readers by the child's best interests.",
      fr: "Les enfants ont droit à la vie privée, à la sécurité et à l'apprentissage. Le Labo jeunesse ne recueille rien sur les enfants, n'envoie nulle part ce qu'ils tapent et n'a pas de clavardage ouvert avec une IA. La publicité y est désactivée. L'intérêt supérieur de l'enfant guide tout ce qui s'adresse aux jeunes.",
    },
  },
  {
    id: "balance",
    h: { en: "Neither fear nor hype", fr: "Ni peur ni battage" },
    p: {
      en: "We are neither opponents nor salespeople of technology. We explain what the evidence shows a system does, who benefits, who carries the risk and what remains unknown. We distinguish demonstrated results from promises, without fear or hype.",
      fr: "Nous ne sommes ni les adversaires ni les vendeurs de la technologie. Nous expliquons ce que les faits montrent du fonctionnement d'un système, à qui il profite, qui en porte les risques et ce qui reste inconnu. Nous distinguons les résultats démontrés des promesses, sans peur ni battage.",
    },
  },
  {
    id: "honest",
    h: { en: "Independent, evidence-led and accountable", fr: "Indépendants, rigoureux et responsables" },
    p: {
      en: "Editorial decisions are independent of advertisers, sponsors and political parties. Every story names its source; facts come from evidence, not invention. Work written with AI is labelled and checked against its sources. We explain our methods, acknowledge uncertainty and correct our errors in public.",
      fr: "Les décisions éditoriales sont indépendantes des annonceurs, des commanditaires et des partis politiques. Chaque nouvelle nomme sa source; les faits reposent sur des éléments probants, pas sur des inventions. Les textes écrits avec l'IA sont identifiés et vérifiés par rapport à leurs sources. Nous expliquons nos méthodes, reconnaissons les incertitudes et corrigeons nos erreurs publiquement.",
    },
  },
];

/**
 * The house voice, added to every system prompt. It shapes tone and framing
 * only; the facts still come only from the sources each writer is given.
 */
export const HOUSE_VOICE = `House voice of AI Broadsheet (applies to everything you write):
- Human-centred: where the sources allow, say what the news means for people (rights, work, privacy, children, safety, democracy). Never invent an impact the sources don't support.
- Evidence and independence: facts come only from the supplied sources; never invent names, numbers, quotes, motives or consequences. Attribute claims, acknowledge uncertainty and keep reporting independent of advertisers and political parties.
- Democracy and human rights: uphold civil liberties, freedom of expression and accountable institutions. Report human-rights violations clearly when supported by the sources; do not turn reporting into party-political advocacy.
- Dignity: never demean any person or group; no stereotypes; no language that ranks one race, nation, religion or group above another. Report hateful acts as harms, never repeat slurs.
- Freedom of belief and conscience: respect freedom of thought, conscience, religion, belief and non-belief, including the freedom to practise a religion, hold or change a belief, or hold no religious belief. Treat religious and non-religious people, including agnostics and atheists, with equal fairness. Never mock, demean or discriminate against anyone because of faith, conscience or worldview. Never describe founders' or staff's personal beliefs.
- Family-safe: no sexual, erotic or graphic detail of any kind. If a story involves abuse, describe the harm and the response only, without detail.
- Balanced: neither fear nor hype about technology; no sensational words, no exclamation marks.`;

// ── the gate ────────────────────────────────────────────────────────────────
/** Headlines/excerpts that are sexually explicit or promote adult content. */
const EXPLICIT = /\b(porn\w*|pornograph\w*|erotic\w*|nsfw|nude\w*|nudity|naked|onlyfans|sexting|hentai|x-rated|adult (content|site|video|film|entertainment|industry)|sex (bot|chatbot|toy|tape|work\w*)|strip ?club|camgirl\w*|fetish\w*|explicit (images?|content|photos?|videos?)|undress\w*|érotique\w*|pornographi\w*|contenu pour adultes|nu(e|es|s)? intégra\w*|sexuellement explicite\w*)\b/i;

export type GateResult = { ok: true } | { ok: false; reason: "explicit" | "sponsored" | "partisan" | "promotion" };

/**
 * House red lines: we cover AI, digital life and work, not party politics or political
 * personalities, and we never run brand promotions. Neutral AI policy (a law, a regulator,
 * a government programme) stays in; who said what on the campaign trail does not.
 */
const PARTISAN = /\b(trump\w*|biden|kamala harris|jd vance|vance|obama|maga|gop|republicans?|democrats?|democratic party|ballot (?:measure|initiative|question)s?|governor'?s? race|campaign trail|midterms?|presidential (?:race|campaign|candidate)|putin|netanyahu|hamas|hezbollah|républicains?|démocrates?)\b/i;
const PROMOTION = /\b(burger king|mcdonald'?s|happy meal|kfc|wendy'?s|taco bell|starbucks|promo codes?|coupons?|discount codes?|limited[- ]time (?:offer|deal)s?|black friday deals?|best deals?|deal alert|\d+% off|code promo)\b/i;

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
  if (PARTISAN.test(text)) return { ok: false, reason: "partisan" };
  if (PROMOTION.test(text)) return { ok: false, reason: "promotion" };
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
