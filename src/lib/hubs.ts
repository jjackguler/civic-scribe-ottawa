/**
 * Long-form guides for the questions people search most ("What is generative
 * AI?", "AI and jobs in Canada"…), at /guides/<slug> in English and French.
 *
 * This file is the light index (titles, descriptions, dates) used by menus,
 * the footer, the sitemap and the /guides page. The guide bodies are large and
 * live in src/lib/hubs/<slug>.ts; routes load them with loadHub(), a dynamic
 * import, so they never reach the main bundle.
 *
 * Inline links inside guide text use [label](/internal-path) or
 * [label](https://external.site). Internal paths are written in their English
 * form; the page adds /fr for French readers.
 */
import type { Bi } from "./i18n";

export type HubBlock =
  | { k: "p"; t: Bi }
  | { k: "h3"; t: Bi }
  | { k: "ul"; items: Bi[] }
  | { k: "ol"; items: Bi[] }
  | { k: "tip"; t: Bi; label?: Bi }
  | { k: "table"; caption: Bi; head: Bi[]; rows: Bi[][] };

export type HubSection = { id: string; h: Bi; blocks: HubBlock[] };

export type HubMeta = {
  slug: string;
  /** On-page H1. */
  title: Bi;
  /** <title>, at most 60 characters. */
  seoTitle: Bi;
  /** Meta description, at most 155 characters. */
  description: Bi;
  /** Short line for cards and the footer. */
  short: Bi;
  audience: Bi;
  minutes: number;
  /** First published / last reviewed (YYYY-MM-DD). */
  published: string;
  updated: string;
};

export type Hub = HubMeta & {
  dek: Bi;
  sections: HubSection[];
  faq: { q: Bi; a: Bi }[];
  /** Glossary slugs to link at the end. */
  terms: string[];
  /** Labs path ids. */
  labs: string[];
  /** Official and reference sources cited. */
  sources: { name: Bi; url: string | Bi }[];
};

export const HUBS: HubMeta[] = [
  {
    slug: "what-is-generative-ai",
    title: { en: "What is generative AI? A plain-language guide", fr: "Qu'est-ce que l'IA générative? Un guide en langage clair" },
    seoTitle: { en: "What is generative AI? A plain-language guide", fr: "Qu'est-ce que l'IA générative? Guide en langage clair" },
    description: {
      en: "What generative AI is, how ChatGPT, Claude and Gemini work, what they get wrong and what they mean for people in Canada. Plain language, no hype.",
      fr: "Ce qu'est l'IA générative, comment fonctionnent ChatGPT, Claude et Gemini, leurs erreurs et ce qu'ils changent pour les gens au Canada. Sans jargon.",
    },
    short: { en: "What generative AI is", fr: "L'IA générative expliquée" },
    audience: { en: "Everyone", fr: "Tout le monde" },
    minutes: 12,
    published: "2026-10-09",
    updated: "2026-10-09",
  },
  {
    slug: "use-ai-assistants-safely",
    title: { en: "How to use ChatGPT, Claude and Gemini safely", fr: "Utiliser ChatGPT, Claude et Gemini en toute sécurité" },
    seoTitle: { en: "How to use ChatGPT, Claude and Gemini safely", fr: "Utiliser ChatGPT, Claude et Gemini en sécurité" },
    description: {
      en: "Seven rules for using AI assistants safely: what never to share, privacy settings to change, how to check answers and spot AI scams. Updated for 2026.",
      fr: "Sept règles pour utiliser les assistants IA en sécurité : ce qu'il ne faut jamais partager, les réglages à changer, vérifier les réponses, déjouer les arnaques.",
    },
    short: { en: "Use AI assistants safely", fr: "Utiliser les assistants IA en sécurité" },
    audience: { en: "Everyone", fr: "Tout le monde" },
    minutes: 13,
    published: "2026-10-09",
    updated: "2026-10-09",
  },
  {
    slug: "ai-for-students",
    title: { en: "AI for students: use it to learn, not to cheat", fr: "L'IA pour les élèves et les étudiants : apprendre sans tricher" },
    seoTitle: { en: "AI for students: use it to learn, not to cheat", fr: "L'IA pour les élèves : apprendre sans tricher" },
    description: {
      en: "How students can use AI as a tutor, not a ghostwriter: what's usually allowed, study prompts that work, citing AI, privacy, and false AI-detector flags.",
      fr: "Utiliser l'IA comme tuteur, pas comme prête-plume : ce qui est permis, des requêtes d'étude efficaces, citer l'IA, la vie privée et les détecteurs.",
    },
    short: { en: "AI for students", fr: "L'IA pour les élèves" },
    audience: { en: "Students, parents and teachers", fr: "Élèves, parents et enseignants" },
    minutes: 12,
    published: "2026-10-09",
    updated: "2026-10-09",
  },
  {
    slug: "ai-and-jobs-in-canada",
    title: { en: "AI and jobs in Canada: what's changing and what you can do", fr: "L'IA et l'emploi au Canada : ce qui change et ce que vous pouvez faire" },
    seoTitle: { en: "AI and jobs in Canada: what's changing, what to do", fr: "L'IA et l'emploi au Canada : ce qui change" },
    description: {
      en: "Which Canadian jobs AI is changing, what the research says, your rights at work, AI in hiring, and a 90-day plan to keep your skills ahead.",
      fr: "Les emplois que l'IA transforme au Canada, ce que dit la recherche, vos droits au travail, l'IA à l'embauche et un plan de 90 jours pour vos compétences.",
    },
    short: { en: "AI and jobs in Canada", fr: "L'IA et l'emploi au Canada" },
    audience: { en: "Workers, job seekers and employers", fr: "Travailleurs, chercheurs d'emploi et employeurs" },
    minutes: 14,
    published: "2026-10-09",
    updated: "2026-10-09",
  },
  {
    slug: "ai-and-privacy",
    title: { en: "AI and privacy in Canada: how to protect your personal information", fr: "L'IA et la vie privée au Canada : protéger vos renseignements personnels" },
    seoTitle: { en: "AI and privacy in Canada: protect your data", fr: "L'IA et la vie privée au Canada : vos données" },
    description: {
      en: "Where your data goes when you use AI, the Canadian and Québec laws that protect you (PIPEDA, Law 25), your rights, and the settings to change today.",
      fr: "Où vont vos données quand vous utilisez l'IA, les lois qui vous protègent (LPRPDE, Loi 25), vos droits et les réglages à changer dès aujourd'hui.",
    },
    short: { en: "AI and privacy", fr: "L'IA et la vie privée" },
    audience: { en: "Everyone, and businesses using AI", fr: "Tout le monde, et les entreprises qui utilisent l'IA" },
    minutes: 13,
    published: "2026-10-09",
    updated: "2026-10-09",
  },
  {
    slug: "ai-for-small-business",
    title: { en: "AI for small business in Canada: a practical guide", fr: "L'IA pour les petites entreprises au Canada : un guide pratique" },
    seoTitle: { en: "AI for small business in Canada: a practical guide", fr: "L'IA pour les PME au Canada : un guide pratique" },
    description: {
      en: "Where AI saves a small business time first, what it costs, a 30-day plan, a one-page AI policy, and the Canadian rules on privacy, French and advertising.",
      fr: "Où l'IA fait d'abord gagner du temps à une PME, ce qu'elle coûte, un plan de 30 jours, une politique d'une page et les règles canadiennes à respecter.",
    },
    short: { en: "AI for small business", fr: "L'IA pour les PME" },
    audience: { en: "Owners and managers of small businesses", fr: "Propriétaires et gestionnaires de PME" },
    minutes: 14,
    published: "2026-10-09",
    updated: "2026-10-09",
  },
];

export const hubMeta = (slug: string) => HUBS.find(h => h.slug === slug);

const LOADERS: Record<string, () => Promise<{ HUB: Hub }>> = {
  "what-is-generative-ai": () => import("./hubs/what-is-generative-ai"),
  "use-ai-assistants-safely": () => import("./hubs/use-ai-assistants-safely"),
  "ai-for-students": () => import("./hubs/ai-for-students"),
  "ai-and-jobs-in-canada": () => import("./hubs/ai-and-jobs-in-canada"),
  "ai-and-privacy": () => import("./hubs/ai-and-privacy"),
  "ai-for-small-business": () => import("./hubs/ai-for-small-business"),
};

export async function loadHub(slug: string): Promise<Hub | null> {
  const load = LOADERS[slug];
  return load ? (await load()).HUB : null;
}
