/**
 * The Keeper: our newsroom archivist, an AI character readers can talk to on
 * /ask. Everything here is safe for the browser and the server: copy,
 * atmospheres, the guided tour and the small helpers both sides share.
 *
 * Name from the opening titles: "Someone keeps the record whole."
 */
import type { Bi, Locale } from "./i18n";

// ── Atmospheres ─────────────────────────────────────────────────────────────

export type AtmosId = "night" | "reading" | "studio" | "calm";

export const ATMOSPHERES: { id: AtmosId; label: Bi; hint: Bi }[] = [
  { id: "night", label: { en: "Night newsroom", fr: "Salle de nouvelles, la nuit" }, hint: { en: "Dark, with the city outside", fr: "Sombre, la ville en arrière-plan" } },
  { id: "reading", label: { en: "Reading room", fr: "Salle de lecture" }, hint: { en: "Warm paper and lamplight", fr: "Papier chaud et lampe de lecture" } },
  { id: "studio", label: { en: "Studio", fr: "Studio" }, hint: { en: "On air, under the lights", fr: "En ondes, sous les projecteurs" } },
  { id: "calm", label: { en: "Calm & clear", fr: "Calme et clair" }, hint: { en: "High contrast, large type, no motion or sound", fr: "Contraste élevé, gros caractères, sans mouvement ni son" } },
];

export const isAtmos = (v: unknown): v is AtmosId => v === "night" || v === "reading" || v === "studio" || v === "calm";

/** Per-viewer settings, kept in localStorage. Every access is wrapped: storage can be blocked. */
export const STORE = {
  atmos: "keeper:atmos",
  voice: "keeper:voice",
  rate: "keeper:rate",
  micConsent: "keeper:mic-consent",
  launcherHidden: "keeper:launcher-hidden",
} as const;

export function readStore(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
export function writeStore(key: string, value: string | null) {
  try {
    if (value == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* storage blocked: the setting lasts for this visit only */ }
}

export const RATE_MIN = 0.6;
export const RATE_MAX = 1.6;
export function readRate(): number {
  const n = Number(readStore(STORE.rate));
  return Number.isFinite(n) && n >= RATE_MIN && n <= RATE_MAX ? n : 1;
}

// ── Conversation types ──────────────────────────────────────────────────────

export const MAX_MESSAGE = 500;
export const MAX_HISTORY = 6;

export type KeeperCitation = { id: string; title: string; source: string; link: string };
export type KeeperGuideRef = { slug: string; title: string };
export type KeeperReply = {
  ok: boolean;
  reply: string;
  citations: KeeperCitation[];
  guides: KeeperGuideRef[];
  /** Signature that lets the premium voice read this exact reply aloud. */
  sig?: string;
  /** Why there's no model answer: rate limit, offline search, etc. */
  note?: "rate" | "offline" | "error" | "length";
};

export type KeeperConfig = {
  /** Convai character id, present only when the server can mint Convai tokens. */
  convaiCharacterId: string | null;
  premiumVoice: boolean;
  model: "claude" | "gemini" | null;
};

// ── Copy ────────────────────────────────────────────────────────────────────

export const GREETING: Bi = {
  en: "Hello. I'm the Keeper, the AI archivist at AI Broadsheet. Ask me about today's AI news, or what a word like \"model\" or \"agent\" means. I'll answer plainly and show you the stories I used.",
  fr: "Bonjour. Je suis le Gardien, l'archiviste IA d'AI Broadsheet. Posez-moi vos questions sur l'actualité de l'IA du jour, ou sur le sens d'un mot comme « modèle » ou « agent ». Je réponds simplement et je vous montre les nouvelles que j'ai consultées.",
};

export const KEEPER_NAME: Bi = { en: "The Keeper", fr: "Le Gardien" };

export const SUGGESTIONS: Bi[] = [
  { en: "What's the biggest AI story today?", fr: "Quelle est la grande nouvelle en IA aujourd'hui?" },
  { en: "What is an AI model, in plain words?", fr: "C'est quoi, un modèle d'IA, en mots simples?" },
  { en: "What is Canada doing about AI?", fr: "Que fait le Canada en matière d'IA?" },
  { en: "How do I use AI safely?", fr: "Comment utiliser l'IA en toute sécurité?" },
];

// ── Guided tour ─────────────────────────────────────────────────────────────

export type TourStep = { id: string; title: Bi; line: Bi; href: string | null; cta?: Bi };

export const TOUR: TourStep[] = [
  {
    id: "welcome",
    title: { en: "Welcome to the tour", fr: "Bienvenue dans la visite" },
    line: {
      en: "I'll walk you through the paper, one section at a time. Use Next and Back, or the arrow keys. Press Escape to stop whenever you like.",
      fr: "Je vous fais visiter le journal, une section à la fois. Utilisez Suivant et Retour, ou les flèches du clavier. Appuyez sur Échap pour arrêter quand vous voulez.",
    },
    href: null,
  },
  {
    id: "latest",
    title: { en: "Latest", fr: "En continu" },
    line: {
      en: "Latest is the live wire. Every AI story from the newsrooms, labs and governments we follow, newest first. Each one names its source and links to it.",
      fr: "En continu, c'est le fil en direct. Toutes les nouvelles en IA des médias, laboratoires et gouvernements que nous suivons, les plus récentes d'abord. Chacune nomme sa source et y renvoie.",
    },
    href: "/news",
    cta: { en: "Open Latest", fr: "Ouvrir En continu" },
  },
  {
    id: "explainers",
    title: { en: "Explainers", fr: "Explicatifs" },
    line: {
      en: "Explainers are our own short films and guides. They take one idea, like what AI actually is, and explain it without jargon.",
      fr: "Les explicatifs sont nos propres courts films et guides. Ils prennent une idée, comme ce qu'est vraiment l'IA, et l'expliquent sans jargon.",
    },
    href: "/originals",
    cta: { en: "Open Explainers", fr: "Ouvrir les explicatifs" },
  },
  {
    id: "labs",
    title: { en: "Labs", fr: "Labos" },
    line: {
      en: "Labs is where you can try AI yourself, safely, with small hands-on experiments. It's still being built, so it may be quiet when you visit.",
      fr: "Les Labos, c'est l'endroit où essayer l'IA vous-même, en toute sécurité, avec de petites expériences pratiques. La section est en construction; elle peut être encore tranquille.",
    },
    href: "/labs",
    cta: { en: "Open Labs", fr: "Ouvrir les Labos" },
  },
  {
    id: "made",
    title: { en: "Made with AI", fr: "Fait avec l'IA" },
    line: {
      en: "Made with AI shows real work people made with AI tools: films, music, apps. Every piece says who made it and which tools they used.",
      fr: "Fait avec l'IA présente de vraies créations faites avec des outils d'IA : films, musique, applis. Chaque œuvre indique qui l'a faite et avec quels outils.",
    },
    href: "/showcase",
    cta: { en: "Open Made with AI", fr: "Ouvrir Fait avec l'IA" },
  },
  {
    id: "standards",
    title: { en: "Standards", fr: "Normes" },
    line: {
      en: "Standards is our rulebook. It explains where stories come from, how we use AI, me included, and how we fix mistakes. Read it if you want to know whether to trust us.",
      fr: "Les Normes, c'est notre règlement. On y explique d'où viennent les nouvelles, comment nous utilisons l'IA, moi compris, et comment nous corrigeons nos erreurs. Lisez-les pour savoir si vous pouvez nous faire confiance.",
    },
    href: "/standards",
    cta: { en: "Open Standards", fr: "Ouvrir les normes" },
  },
  {
    id: "end",
    title: { en: "That's the paper", fr: "Voilà le journal" },
    line: {
      en: "That's the tour. On any page, the Read this page to me button reads the text aloud. And I'm here whenever you have a question.",
      fr: "Voilà la visite. Sur chaque page, le bouton Lisez-moi cette page lit le texte à voix haute. Et je suis ici dès que vous avez une question.",
    },
    href: null,
  },
];

/** Fixed lines the premium voice may read without a signature. */
export function fixedLines(): string[] {
  return [GREETING, ...TOUR.map(s => s.line)].flatMap(b => [b.en, b.fr]);
}

/**
 * Persona to paste into the Convai character's backstory, so the voice
 * engine plays the same character as our own text engine.
 */
export const CONVAI_PERSONA = `You are the Keeper, the AI archivist of AI Broadsheet, a bilingual (English / Canadian French) AI-news site whose mission is to make everyone AI-literate, including people with disabilities. You are calm, warm and a little witty, like a night-shift newsroom archivist who has read everything. You explain AI news and AI basics in plain language, in short answers (two to five sentences), and you answer in the language the reader uses. You are an AI, not a person, and you say so if asked or if it matters. You only talk about news that appears in the headlines you are given in your context, and you name the outlet when you use one. If you don't know, say so. You never give personalised financial, legal or medical advice; you give general information and suggest a qualified professional. You never ask for personal information.`;

/** Turn our story id into a path segment safely. */
export const storyPath = (id: string) => `/story/${encodeURIComponent(id)}`;

/** Split text into short sentences so speech engines (and captions) keep up. */
export function sentenceChunks(text: string, max = 220): string[] {
  const parts = text.replace(/\s+/g, " ").trim().match(/[^.!?…]+[.!?…]+["»)]?\s*|[^.!?…]+$/g) ?? [text];
  const out: string[] = [];
  for (const raw of parts) {
    const p = raw.trim();
    if (!p) continue;
    if (p.length <= max) { out.push(p); continue; }
    // Long sentence: break at commas, then hard-wrap on spaces.
    let buf = "";
    for (const w of p.split(/(?<=[,;:])\s+|\s+/)) {
      if ((buf + " " + w).trim().length > max && buf) { out.push(buf.trim()); buf = w; }
      else buf = (buf + " " + w).trim();
    }
    if (buf) out.push(buf);
  }
  return out;
}

export const langTag = (l: Locale) => (l === "fr" ? "fr-CA" : "en-CA");
