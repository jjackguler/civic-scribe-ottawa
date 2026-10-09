/**
 * Youth formats ("Today in 60 seconds", "The Broadsheet 5", "Explain it like
 * I'm 12", "Your take"): types and pure helpers shared by the server
 * (quiz.server.ts) and the page. No React, no server code.
 */
import type { Topic } from "./news-sources";
import type { Bi } from "./i18n";

// ── days ───────────────────────────────────────────────────────────────────
/** The quiz day, in Ottawa time, as "YYYY-MM-DD". */
export function quizDay(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** The day before a "YYYY-MM-DD" day. */
export function prevDay(day: string): string {
  const t = Date.parse(`${day}T12:00:00Z`) - 86400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** "Friday, October 9" / "vendredi 9 octobre" for a quiz day. */
export function dayLabel(day: string, locale: "en" | "fr"): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

// ── deterministic randomness (same quiz for every reader on a given day) ────
export function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── values ─────────────────────────────────────────────────────────────────
/**
 * Stories about death, violence or abuse never become quiz questions: a
 * person's tragedy is not trivia. They still appear in the news itself.
 */
export const SENSITIVE = /\b(kill(?:s|ed|ing)?|death|dead|dies|died|suicide|self-harm|abuse[sd]?|assault|sexual|sexually|porn\w*|nude|nudify|rape|murder\w*|shooting|massacre|terror\w*|bomb\w*|war|wars|violen\w*|genocide|exploitation|csam|mort[se]?|décès|suicid\w*|agression\w*|sexuel\w*|guerre|attentat\w*|meurtre\w*|viol)\b/i;

// ── Today in 60 seconds ────────────────────────────────────────────────────
/**
 * Why stories on each desk matter to people, in general terms. Shown, and
 * labelled "Why stories like this matter", only when we have no dispatch with
 * a "why it matters" written from the reporting itself.
 */
export const WHY_DESK: Record<Topic, Bi> = {
  agents: { en: "AI assistants are starting to act for people: booking, buying, writing. Who checks their work matters.", fr: "Les assistants IA commencent à agir pour les gens : réserver, acheter, écrire. Savoir qui vérifie leur travail compte." },
  applications: { en: "This is where AI meets daily life: school, work, health and the apps on your phone.", fr: "C'est là que l'IA rejoint la vie de tous les jours : l'école, le travail, la santé et les applis de votre téléphone." },
  immersive: { en: "Headsets and virtual worlds shape how people learn, play and meet. Safety and access count.", fr: "Les casques et les mondes virtuels changent la façon d'apprendre, de jouer et de se rencontrer. La sécurité et l'accès comptent." },
  data: { en: "AI runs on data, often about people. How it is collected and protected affects everyone.", fr: "L'IA fonctionne avec des données, souvent sur des personnes. Leur collecte et leur protection nous concernent tous." },
  infrastructure: { en: "Chips and data centres decide who can build AI, what it costs and how much power it uses.", fr: "Les puces et les centres de données décident de qui peut bâtir l'IA, de son coût et de l'énergie qu'elle consomme." },
  research: { en: "Today's research becomes tomorrow's tools. Knowing what is proven, and what isn't yet, helps you judge the claims.", fr: "La recherche d'aujourd'hui devient l'outil de demain. Savoir ce qui est prouvé, et ce qui ne l'est pas encore, aide à juger les promesses." },
  people: { en: "Jobs and skills are changing. Knowing what is shifting helps people plan, learn and speak up.", fr: "Les emplois et les compétences changent. Savoir ce qui bouge aide à planifier, à apprendre et à se faire entendre." },
  responsible: { en: "Fairness, safety and human rights: this is where people push for AI that treats everyone with dignity.", fr: "Équité, sécurité et droits de la personne : c'est ici qu'on exige une IA qui traite chacun avec dignité." },
  policy: { en: "Laws decide how AI can be used on you, at school, at work and online. Citizens have a say.", fr: "Les lois décident comment l'IA peut être utilisée à votre sujet, à l'école, au travail et en ligne. Les citoyens ont leur mot à dire." },
  business: { en: "Money shapes which AI gets built, and who it is built to serve.", fr: "L'argent décide de quelle IA est construite, et au service de qui." },
  sustainability: { en: "AI uses energy and water. Its footprint, and how it might help the planet, affects us all.", fr: "L'IA consomme de l'énergie et de l'eau. Son empreinte, et l'aide qu'elle peut apporter à la planète, nous touchent tous." },
  robotics: { en: "Robots are moving into homes, farms and hospitals. How they work alongside people matters.", fr: "Les robots arrivent dans les maisons, les fermes et les hôpitaux. Leur façon de travailler avec les gens compte." },
  health: { en: "AI in medicine can help patients, but it has to be tested, safe and fair for everyone.", fr: "En médecine, l'IA peut aider les patients, mais elle doit être testée, sûre et équitable pour tous." },
};

// ── The Broadsheet 5 ───────────────────────────────────────────────────────
export type QuizLink = { to: "/story/$id" | "/dispatch/$id"; id: string };

export type QuizQ = {
  id: string;
  /** outlet: who published this headline · gap: fill the gap · ledger: confirmed, claimed or unknown · desk: which desk · ai: written by the model, fact-checked */
  kind: "outlet" | "gap" | "ledger" | "desk" | "ai";
  prompt: string;
  /** A headline or a point from a dispatch, shown as a quote. */
  quote?: string;
  quoteLang?: "en" | "fr";
  options: string[];
  answer: number;
  explain: string;
  link: QuizLink;
  linkLabel: string;
};

export type DailyQuiz = {
  day: string;
  builtAt: string;
  /** Frozen for the day: every reader gets the same five. */
  final: boolean;
  /** Some questions were written with AI (and passed the fact guard). */
  ai: boolean;
  en: QuizQ[];
  fr: QuizQ[];
};

export const QUIZ_LENGTH = 5;
