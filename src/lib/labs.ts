/**
 * AI Broadsheet Labs: learning paths that take a beginner from "What is AI?"
 * to building with it, by putting the official free courses from the AI
 * companies (and a few universities and Canadian organizations) in order,
 * with our own explainers and guides in between.
 *
 * Every external link below was opened and checked on LABS_CHECKED. Titles
 * are the providers' own course names (translated for French readers);
 * summaries are ours. When a provider doesn't state a length we estimate it
 * and mark it `approx`. Prices change: "paid" courses are labelled as such and
 * never placed on a path's required steps.
 */
import type { Bi, Locale } from "./i18n";
import { GUIDES } from "./guides";

export const LABS_CHECKED = "2026-10-09";

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

export type ProviderId =
  | "aib" | "anthropic" | "openai" | "google" | "kaggle" | "microsoft" | "deeplearningai"
  | "huggingface" | "fastai" | "helsinki" | "cifar" | "mediasmarts" | "bluedot" | "mila";

export type Provider = {
  id: ProviderId;
  name: string;
  canadian?: boolean;
  /** A colour for the provider's small mark: a CSS colour that reads on paper and on night. */
  mark: string;
};

export const PROVIDERS: Record<ProviderId, Provider> = {
  aib: { id: "aib", name: "AI Broadsheet", canadian: true, mark: "var(--signal)" },
  anthropic: { id: "anthropic", name: "Anthropic", mark: "#d97757" },
  openai: { id: "openai", name: "OpenAI", mark: "#10a37f" },
  google: { id: "google", name: "Google", mark: "#4285f4" },
  kaggle: { id: "kaggle", name: "Kaggle × Google", mark: "#20beff" },
  microsoft: { id: "microsoft", name: "Microsoft", mark: "#7fba00" },
  deeplearningai: { id: "deeplearningai", name: "DeepLearning.AI", mark: "#e0457b" },
  huggingface: { id: "huggingface", name: "Hugging Face", mark: "#ffb000" },
  fastai: { id: "fastai", name: "fast.ai", mark: "#3f8fd2" },
  helsinki: { id: "helsinki", name: "University of Helsinki", mark: "#8a6bd1" },
  cifar: { id: "cifar", name: "CIFAR", canadian: true, mark: "#d7372f" },
  mediasmarts: { id: "mediasmarts", name: "MediaSmarts", canadian: true, mark: "#2b9a6e" },
  bluedot: { id: "bluedot", name: "BlueDot Impact", mark: "#3b6cf0" },
  mila: { id: "mila", name: "Mila", canadian: true, mark: "#c9a24d" },
};

/** French name of a provider when it differs (MediaSmarts is HabiloMédias in French). */
export const providerName = (id: ProviderId, locale: Locale) =>
  locale === "fr" && id === "mediasmarts" ? "HabiloMédias" : locale === "fr" && id === "helsinki" ? "Université d'Helsinki" : PROVIDERS[id].name;

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export type Format = "video" | "text" | "interactive" | "code";
export type Level = "beginner" | "intermediate" | "advanced";
export type Price = "free" | "free-audit" | "paid";
/** "full": a French edition exists. "machine": machine-translated French. "none": English only. */
export type French = "full" | "machine" | "none";

export type Course = {
  id: string;
  provider: ProviderId;
  title: Bi;
  summary: Bi;
  url: string;
  /** The French edition's own address, when it has one. */
  frUrl?: string;
  french: French;
  formats: Format[];
  minutes: number;
  /** The provider doesn't state a length; this is our estimate. */
  approx?: boolean;
  level: Level;
  price: Price;
  priceNote?: Bi;
  /** The provider gives a certificate or badge on completion. */
  certificate?: boolean;
  checked: string;
};

const C = LABS_CHECKED;
const API_BILLED: Bi = {
  en: "Free to read; running the code calls an API that bills per use.",
  fr: "Lecture gratuite; exécuter le code appelle une API facturée à l'usage.",
};

export const COURSES: Course[] = [
  /* Anthropic Academy */
  {
    id: "a-claude-101", provider: "anthropic", url: "https://anthropic.skilljar.com/claude-101",
    title: { en: "Claude 101", fr: "Claude 101" },
    summary: {
      en: "A first tour of Claude for everyday work: starting chats, sharing files, and the core features worth knowing.",
      fr: "Un premier tour de Claude pour le travail courant : lancer une conversation, partager des fichiers, les fonctions à connaître.",
    },
    french: "none", formats: ["video", "text"], minutes: 60, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-ai-fluency", provider: "anthropic", url: "https://anthropic.skilljar.com/ai-fluency-framework-foundations",
    title: { en: "AI Fluency: Framework & Foundations", fr: "Maîtrise de l'IA : cadre et fondements" },
    summary: {
      en: "Anthropic's core course on working with AI well, built on four habits: decide what to hand off, describe it clearly, judge the result, stay accountable.",
      fr: "Le cours de base d'Anthropic pour bien travailler avec l'IA, autour de quatre réflexes : choisir quoi confier, bien le décrire, juger le résultat, en rester responsable.",
    },
    french: "none", formats: ["video", "text"], minutes: 180, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-capabilities", provider: "anthropic", url: "https://anthropic.skilljar.com/ai-capabilities-and-limitations",
    title: { en: "AI Capabilities and Limitations", fr: "Capacités et limites de l'IA" },
    summary: {
      en: "A short mental model of how generative AI behaves: why it is excellent at some tasks and unreliable at others, with small try-it-yourself activities.",
      fr: "Un court modèle mental du comportement de l'IA générative : pourquoi elle excelle à certaines tâches et déraille sur d'autres, avec de petites activités à essayer.",
    },
    french: "none", formats: ["text", "interactive"], minutes: 45, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-cowork", provider: "anthropic", url: "https://anthropic.skilljar.com/introduction-to-claude-cowork",
    title: { en: "Introduction to Claude Cowork", fr: "Introduction à Claude Cowork" },
    summary: {
      en: "Let Claude work on your own files and projects: research and file workflows, plugins and skills, and how to supervise longer tasks safely.",
      fr: "Laisser Claude travailler sur vos fichiers et projets : recherche, gestion de fichiers, plugiciels et compétences, et supervision des tâches longues.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 60, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-small-business", provider: "anthropic", url: "https://anthropic.skilljar.com/ai-fluency-for-small-businesses",
    title: { en: "AI Fluency for Small Businesses", fr: "Maîtrise de l'IA pour les petites entreprises" },
    summary: {
      en: "The AI Fluency habits applied to a small team: where AI saves real time and where a person must check. Take the core AI Fluency course first.",
      fr: "Les réflexes de la maîtrise de l'IA appliqués à une petite équipe : où l'IA fait gagner du temps, où une personne doit vérifier. Suivez d'abord le cours de base.",
    },
    french: "none", formats: ["video", "text"], minutes: 60, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-educators", provider: "anthropic", url: "https://anthropic.skilljar.com/ai-fluency-for-educators",
    title: { en: "AI Fluency for educators", fr: "Maîtrise de l'IA pour le personnel enseignant" },
    summary: {
      en: "For teachers, instructional designers and school leaders: bringing AI Fluency into lessons, assignments and school policy.",
      fr: "Pour les enseignants, conseillers pédagogiques et directions : intégrer la maîtrise de l'IA aux cours, aux travaux et aux politiques de l'école.",
    },
    french: "none", formats: ["video", "text"], minutes: 60, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-students", provider: "anthropic", url: "https://anthropic.skilljar.com/ai-fluency-for-students",
    title: { en: "AI Fluency for students", fr: "Maîtrise de l'IA pour les élèves et étudiants" },
    summary: {
      en: "Using AI to learn rather than to skip the learning: study help, career planning and honest academic work. Good to share with older students.",
      fr: "Utiliser l'IA pour apprendre plutôt que pour éviter d'apprendre : aide à l'étude, orientation, intégrité scolaire. À partager avec les plus grands.",
    },
    french: "none", formats: ["video", "text"], minutes: 60, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-teaching", provider: "anthropic", url: "https://anthropic.skilljar.com/teaching-ai-fluency",
    title: { en: "Teaching AI Fluency", fr: "Enseigner la maîtrise de l'IA" },
    summary: {
      en: "How to teach and assess AI Fluency in a class or workshop, for instructors who have finished the core course.",
      fr: "Comment enseigner et évaluer la maîtrise de l'IA en classe ou en atelier, pour qui a terminé le cours de base.",
    },
    french: "none", formats: ["video", "text"], minutes: 90, approx: true, level: "intermediate", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-api", provider: "anthropic", url: "https://anthropic.skilljar.com/claude-with-the-anthropic-api",
    title: { en: "Building with the Claude API", fr: "Créer avec l'API Claude" },
    summary: {
      en: "A full developer course in 13 modules: first requests, prompting, tool use, retrieval, MCP and agent workflows, with exercises. Needs Python and some JSON.",
      fr: "Un cours complet pour développeurs en 13 modules : premières requêtes, prompting, outils, recherche documentaire, MCP et agents, avec exercices. Python et JSON requis.",
    },
    french: "none", formats: ["video", "code"], minutes: 480, approx: true, level: "intermediate", price: "free", priceNote: API_BILLED, certificate: true, checked: C,
  },
  {
    id: "a-mcp", provider: "anthropic", url: "https://anthropic.skilljar.com/introduction-to-model-context-protocol",
    title: { en: "Introduction to Model Context Protocol", fr: "Introduction au Model Context Protocol (MCP)" },
    summary: {
      en: "Build a small MCP server and client in Python so a model can use your tools, files and prompts. MCP is the common plug for connecting AI to software.",
      fr: "Construire un petit serveur et client MCP en Python pour qu'un modèle utilise vos outils, fichiers et gabarits. MCP est la prise commune entre l'IA et les logiciels.",
    },
    french: "none", formats: ["video", "code"], minutes: 120, approx: true, level: "intermediate", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-skills", provider: "anthropic", url: "https://anthropic.skilljar.com/introduction-to-agent-skills",
    title: { en: "Introduction to agent skills", fr: "Introduction aux compétences d'agent" },
    summary: {
      en: "Package instructions and scripts as reusable skills for Claude Code, and learn when a skill beats a project file, a hook or a subagent.",
      fr: "Regrouper instructions et scripts en compétences réutilisables pour Claude Code, et savoir quand préférer une compétence à un fichier de projet, un crochet ou un sous-agent.",
    },
    french: "none", formats: ["video", "code"], minutes: 60, approx: true, level: "intermediate", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-claude-code", provider: "anthropic", url: "https://anthropic.skilljar.com/claude-code-in-action",
    title: { en: "Claude Code in Action", fr: "Claude Code en action" },
    summary: {
      en: "For developers already using Claude Code: steer long sessions, configure it for a team, automate repeat work and verify what it produced.",
      fr: "Pour qui utilise déjà Claude Code : piloter de longues sessions, le configurer pour une équipe, automatiser le répétitif et vérifier le résultat.",
    },
    french: "none", formats: ["video", "code"], minutes: 90, approx: true, level: "advanced", price: "free", certificate: true, checked: C,
  },
  {
    id: "a-prompt-docs", provider: "anthropic", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview",
    frUrl: "https://platform.claude.com/docs/fr/build-with-claude/prompt-engineering/overview",
    title: { en: "Prompt engineering overview (Claude docs)", fr: "Vue d'ensemble du prompt engineering (docs Claude)" },
    summary: {
      en: "Anthropic's reference on prompting: be clear and direct, give examples, structure long inputs, let the model think, chain prompts. Read once, come back often.",
      fr: "La référence d'Anthropic sur les requêtes : être clair et direct, donner des exemples, structurer, laisser le modèle réfléchir, enchaîner. À lire une fois, à relire souvent.",
    },
    french: "full", formats: ["text"], minutes: 30, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "a-prompt-tutorial", provider: "anthropic", url: "https://github.com/anthropics/prompt-eng-interactive-tutorial",
    title: { en: "Prompt engineering interactive tutorial", fr: "Tutoriel interactif de prompt engineering" },
    summary: {
      en: "Nine hands-on chapters, from basic prompt structure to avoiding made-up answers, each with exercises and an answer key. Runs in notebooks or a spreadsheet version.",
      fr: "Neuf chapitres pratiques, de la structure d'une requête à la prévention des réponses inventées, avec exercices et corrigé. En carnets de code ou en version tableur.",
    },
    french: "none", formats: ["interactive", "code"], minutes: 240, approx: true, level: "intermediate", price: "free", priceNote: API_BILLED, checked: C,
  },
  {
    id: "a-courses", provider: "anthropic", url: "https://github.com/anthropics/courses",
    title: { en: "Anthropic courses on GitHub", fr: "Les cours d'Anthropic sur GitHub" },
    summary: {
      en: "Five notebook courses meant to be taken in order: API fundamentals, prompting, real-world prompting, prompt evaluations and tool use.",
      fr: "Cinq cours en carnets de code, à suivre dans l'ordre : bases de l'API, requêtes, cas réels, évaluation des requêtes et utilisation d'outils.",
    },
    french: "none", formats: ["code"], minutes: 600, approx: true, level: "intermediate", price: "free", priceNote: API_BILLED, checked: C,
  },
  {
    id: "a-agents-essay", provider: "anthropic", url: "https://www.anthropic.com/engineering/building-effective-agents",
    title: { en: "Building effective agents", fr: "Construire des agents efficaces" },
    summary: {
      en: "The most-cited essay on agent design: start with simple, composable patterns and add autonomy only when it measurably helps.",
      fr: "L'essai le plus cité sur la conception d'agents : commencer par des schémas simples et combinables, et n'ajouter de l'autonomie que si elle aide vraiment.",
    },
    french: "none", formats: ["text"], minutes: 15, level: "intermediate", price: "free", checked: C,
  },

  /* OpenAI Academy and docs */
  {
    id: "o-fundamentals", provider: "openai", url: "https://academy.openai.com/en/public/clubs/work-users-ynjqu/resources/chatgpt-basics",
    title: { en: "ChatGPT fundamentals", fr: "Les bases de ChatGPT" },
    summary: {
      en: "OpenAI Academy's illustrated starter: what ChatGPT is, picking a model, sharing chats, and setting up memory and custom instructions.",
      fr: "Le guide illustré d'OpenAI Academy : ce qu'est ChatGPT, choisir un modèle, partager une conversation, régler la mémoire et les instructions personnalisées.",
    },
    french: "none", formats: ["text"], minutes: 45, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "o-prompting", provider: "openai", url: "https://academy.openai.com/en/public/clubs/work-users-ynjqu/resources/prompting",
    title: { en: "Prompting (OpenAI Academy)", fr: "Rédiger des requêtes (OpenAI Academy)" },
    summary: {
      en: "Three moves for a good prompt (the task, the context, the output you want) with sample prompts by job and two short videos.",
      fr: "Trois gestes pour une bonne requête (la tâche, le contexte, le résultat voulu), avec des exemples par métier et deux courtes vidéos.",
    },
    french: "none", formats: ["text", "video"], minutes: 30, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "o-any-role", provider: "openai", url: "https://academy.openai.com/en/public/clubs/work-users-ynjqu/resources/chatgpt-for-any-role",
    title: { en: "ChatGPT for any role", fr: "ChatGPT pour tous les métiers" },
    summary: {
      en: "Twenty prompts to adapt for email, meetings, decisions and planning, each with a one-click way to try it.",
      fr: "Vingt requêtes à adapter pour les courriels, les réunions, les décisions et la planification, chacune à essayer en un clic.",
    },
    french: "none", formats: ["text", "interactive"], minutes: 60, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "o-work", provider: "openai", url: "https://academy.openai.com/pages/ai-at-work-bcx7td",
    title: { en: "Apply AI at Work (AI Foundations)", fr: "Appliquer l'IA au travail (AI Foundations)" },
    summary: {
      en: "OpenAI's course for office work: prompting and review habits, then repeatable workflows and handing tasks to agents. Short test and badge at the end.",
      fr: "Le cours d'OpenAI pour le travail de bureau : réflexes de requête et de vérification, puis flux de travail répétables et délégation à des agents. Court test et insigne.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 75, level: "beginner", price: "free",
    priceNote: { en: "Free; you sign in with a ChatGPT account.", fr: "Gratuit; connexion avec un compte ChatGPT." }, certificate: true, checked: C,
  },
  {
    id: "o-teachers", provider: "openai", url: "https://www.coursera.org/learn/chatgpt-foundations-for-teachers",
    title: { en: "ChatGPT Foundations for Teachers", fr: "ChatGPT : les bases pour le personnel enseignant" },
    summary: {
      en: "OpenAI's course for K–12 teachers, on Coursera: lesson planning, rubrics, notes home and student support, with privacy and human oversight throughout.",
      fr: "Le cours d'OpenAI pour le primaire et le secondaire, sur Coursera : planification, grilles d'évaluation, messages aux familles et soutien aux élèves, avec confidentialité et supervision humaine.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 300, level: "beginner", price: "free", checked: C,
  },
  {
    id: "o-prompt-api", provider: "openai", url: "https://help.openai.com/en/articles/6654000-chatgpt-prompts-guide",
    title: { en: "Best practices for prompt engineering", fr: "Bonnes pratiques pour les requêtes" },
    summary: {
      en: "A four-minute checklist: instructions first, be specific about format and length, show examples, say what to do rather than what not to do.",
      fr: "Une liste de quatre minutes : les consignes d'abord, préciser format et longueur, montrer des exemples, dire quoi faire plutôt que quoi éviter.",
    },
    french: "none", formats: ["text"], minutes: 5, level: "beginner", price: "free", checked: C,
  },
  {
    id: "o-quickstart", provider: "openai", url: "https://developers.openai.com/api/docs/quickstart",
    title: { en: "OpenAI developer quickstart", fr: "Démarrage rapide pour développeurs OpenAI" },
    summary: {
      en: "Get an API key, install the library and make a first request; then send images and files and add tools such as web search and function calling.",
      fr: "Obtenir une clé d'API, installer la bibliothèque et faire une première requête; puis envoyer images et fichiers et ajouter des outils comme la recherche web.",
    },
    french: "none", formats: ["text", "code"], minutes: 30, approx: true, level: "intermediate", price: "free", priceNote: API_BILLED, checked: C,
  },
  {
    id: "o-cookbook", provider: "openai", url: "https://github.com/openai/openai-cookbook",
    title: { en: "OpenAI Cookbook", fr: "Le livre de recettes d'OpenAI (Cookbook)" },
    summary: {
      en: "Open-source, runnable examples for common jobs (retrieval, structured output, evaluation, agents), mostly in Python.",
      fr: "Des exemples libres et exécutables pour les tâches courantes (recherche documentaire, sorties structurées, évaluation, agents), surtout en Python.",
    },
    french: "none", formats: ["code"], minutes: 120, approx: true, level: "intermediate", price: "free", priceNote: API_BILLED, checked: C,
  },

  /* Google, Grow with Google, Google Skills, Gemini */
  {
    id: "g-intro-genai", provider: "google", url: "https://skills.google/course_templates/536",
    title: { en: "Introduction to Generative AI", fr: "Introduction à l'IA générative" },
    summary: {
      en: "A 45-minute micro-course on what generative AI is, how it differs from older machine learning and where it is used.",
      fr: "Un microcours de 45 minutes : ce qu'est l'IA générative, en quoi elle diffère de l'apprentissage automatique classique et où on l'utilise.",
    },
    french: "none", formats: ["video"], minutes: 45, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "g-ai-essentials", provider: "google", url: "https://grow.google/intl/en_ca/enroll-certificates/ai-essentials-mid/",
    title: { en: "Google AI Essentials", fr: "Google AI Essentials" },
    summary: {
      en: "Google's certificate course on using AI at work, in five modules: everyday tools, prompting, responsible use and keeping up.",
      fr: "Le cours à certificat de Google sur l'IA au travail, en cinq modules : outils courants, requêtes, usage responsable et veille.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 360, approx: true, level: "beginner", price: "paid",
    priceNote: { en: "US$49 a month on Coursera after a 7-day trial; financial aid available.", fr: "49 $ US par mois sur Coursera après 7 jours d'essai; aide financière offerte." },
    certificate: true, checked: C,
  },
  {
    id: "g-prompting-essentials", provider: "google", url: "https://grow.google/intl/en_ca/prompting-essentials/",
    title: { en: "Google Prompting Essentials", fr: "Google Prompting Essentials" },
    summary: {
      en: "A step-by-step prompting method from Google, practised on emails, data analysis and presentations.",
      fr: "Une méthode de requête pas à pas de Google, appliquée aux courriels, à l'analyse de données et aux présentations.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 480, approx: true, level: "beginner", price: "paid",
    priceNote: { en: "US$49 on Coursera; financial aid may apply.", fr: "49 $ US sur Coursera; aide financière possible." },
    certificate: true, checked: C,
  },
  {
    id: "g-educators", provider: "google", url: "https://grow.google/intl/en_ca/ai-for-educators",
    title: { en: "Generative AI for Educators", fr: "L'IA générative pour le personnel enseignant" },
    summary: {
      en: "Made with MIT RAISE: five short modules on using AI to plan lessons, adapt material for different learners and cut admin time.",
      fr: "Conçu avec MIT RAISE : cinq courts modules pour planifier, adapter le matériel aux élèves et réduire les tâches administratives avec l'IA.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 120, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "g-gemini-help", provider: "google", url: "https://support.google.com/gemini/answer/13275745",
    title: { en: "Use Gemini Apps (Google help)", fr: "Utiliser les applis Gemini (aide Google)" },
    summary: {
      en: "Google's own how-to for the Gemini app on a computer: chats and temporary chats, choosing a model, editing prompts and exporting files.",
      fr: "Le mode d'emploi de Google pour l'appli Gemini sur ordinateur : conversations, conversations temporaires, choix du modèle, modification des requêtes et export.",
    },
    french: "none", formats: ["text"], minutes: 10, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "g-prompts-workspace", provider: "google", url: "https://workspace.google.com/intl/en_ph/resources/ai/writing-effective-prompts",
    title: { en: "Writing effective prompts (Gemini for Workspace)", fr: "Rédiger de bonnes requêtes (Gemini pour Workspace)" },
    summary: {
      en: "Google's quick formula (persona, task, context, format) with tips and examples for different jobs.",
      fr: "La formule rapide de Google (rôle, tâche, contexte, format), avec conseils et exemples par métier.",
    },
    french: "none", formats: ["text"], minutes: 10, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "g-gemini-api", provider: "google", url: "https://ai.google.dev/gemini-api/docs/get-started",
    title: { en: "Gemini API: getting started", fr: "API Gemini : premiers pas" },
    summary: {
      en: "Create a key and send a first request in Python, JavaScript or plain HTTP; then streaming, images, structured output and tools.",
      fr: "Créer une clé et envoyer une première requête en Python, JavaScript ou HTTP; puis diffusion en continu, images, sorties structurées et outils.",
    },
    french: "none", formats: ["text", "code"], minutes: 30, approx: true, level: "intermediate", price: "free",
    priceNote: { en: "Free tier with rate limits; a paid tier lifts them.", fr: "Palier gratuit avec limites; un palier payant les lève." }, checked: C,
  },
  {
    id: "g-gemini-cookbook", provider: "google", url: "https://ai.google.dev/gemini-api/cookbook",
    title: { en: "Gemini API Cookbook", fr: "Le livre de recettes de l'API Gemini" },
    summary: {
      en: "Quickstarts and worked examples that open as notebooks you can run in the browser.",
      fr: "Démarrages rapides et exemples commentés qui s'ouvrent en carnets exécutables dans le navigateur.",
    },
    french: "none", formats: ["code", "interactive"], minutes: 120, approx: true, level: "intermediate", price: "free", checked: C,
  },
  {
    id: "g-ml-crash", provider: "google", url: "https://developers.google.com/machine-learning/crash-course",
    title: { en: "Machine Learning Crash Course", fr: "Cours accéléré d'apprentissage automatique" },
    summary: {
      en: "How machine learning actually works, in 12 modules of animated videos, interactive visualizations and exercises, including a module on language models.",
      fr: "Comment fonctionne l'apprentissage automatique, en 12 modules de vidéos animées, visualisations interactives et exercices, dont un sur les modèles de langage.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 900, approx: true, level: "intermediate", price: "free", checked: C,
  },
  {
    id: "k-agents", provider: "kaggle", url: "https://www.kaggle.com/learn-guide/5-day-agents",
    title: { en: "5-Day AI Agents Intensive", fr: "Intensif de 5 jours sur les agents IA" },
    summary: {
      en: "The self-paced version of Kaggle and Google's agents course: a technical paper and two code labs a day, built on Gemini and Google's agent toolkit.",
      fr: "La version libre du cours de Kaggle et Google sur les agents : un article technique et deux labos de code par jour, avec Gemini et la trousse d'agents de Google.",
    },
    french: "none", formats: ["text", "code"], minutes: 600, approx: true, level: "intermediate", price: "free", checked: C,
  },

  /* Microsoft Learn and Microsoft's open courses */
  {
    id: "m-ai-concepts", provider: "microsoft", url: "https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/",
    frUrl: "https://learn.microsoft.com/fr-ca/training/modules/get-started-ai-fundamentals/",
    title: { en: "Introduction to AI concepts", fr: "Présentation des concepts de l'IA" },
    summary: {
      en: "The big families of AI in one module (generative AI and agents, vision, speech, language) and what responsible AI asks of each.",
      fr: "Les grandes familles de l'IA en un module (IA générative et agents, vision, parole, langage) et ce que l'IA responsable exige de chacune.",
    },
    french: "machine", formats: ["text", "interactive"], minutes: 60, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "m-copilot", provider: "microsoft", url: "https://learn.microsoft.com/en-us/training/modules/get-started-with-copilot",
    title: { en: "Get started with Microsoft Copilot", fr: "Premiers pas avec Microsoft Copilot" },
    summary: {
      en: "Microsoft's beginner module on its Copilot assistant: what it can do, how to ask, and how to check what it gives back.",
      fr: "Le module d'initiation de Microsoft à son assistant Copilot : ce qu'il sait faire, comment lui demander et comment vérifier ses réponses.",
    },
    french: "none", formats: ["text"], minutes: 45, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "m-365", provider: "microsoft", url: "https://learn.microsoft.com/en-us/training/paths/get-started-with-microsoft-365-copilot",
    title: { en: "Get started with Microsoft 365 Copilot", fr: "Premiers pas avec Microsoft 365 Copilot" },
    summary: {
      en: "Three modules on Copilot inside Word, Excel, Outlook and Teams, for workplaces that already have it.",
      fr: "Trois modules sur Copilot dans Word, Excel, Outlook et Teams, pour les milieux de travail qui l'ont déjà.",
    },
    french: "none", formats: ["text"], minutes: 120, approx: true, level: "beginner", price: "free",
    priceNote: { en: "The course is free; the product needs a paid Microsoft 365 Copilot licence.", fr: "Le cours est gratuit; le produit exige une licence Microsoft 365 Copilot payante." }, checked: C,
  },
  {
    id: "m-business", provider: "microsoft", url: "https://learn.microsoft.com/en-us/training/modules/leverage-ai-tools/",
    title: { en: "Leverage AI tools and resources for your business", fr: "Tirer parti des outils d'IA pour votre entreprise" },
    summary: {
      en: "For owners and managers: where AI tools fit in an organization, how to choose them and what to put in place first.",
      fr: "Pour les propriétaires et gestionnaires : où les outils d'IA s'insèrent, comment les choisir et quoi mettre en place d'abord.",
    },
    french: "none", formats: ["text"], minutes: 60, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "m-genai-beginners", provider: "microsoft", url: "https://github.com/microsoft/generative-ai-for-beginners",
    title: { en: "Generative AI for Beginners", fr: "L'IA générative pour débutants" },
    summary: {
      en: "Microsoft's open course of 21 lessons, each with a short video and code, from prompting basics to building chat, search and image apps.",
      fr: "Le cours libre de Microsoft en 21 leçons, chacune avec une courte vidéo et du code, des bases des requêtes aux applis de clavardage, de recherche et d'images.",
    },
    french: "none", formats: ["video", "text", "code"], minutes: 1260, approx: true, level: "intermediate", price: "free", priceNote: API_BILLED, checked: C,
  },
  {
    id: "m-agents-beginners", provider: "microsoft", url: "https://github.com/microsoft/ai-agents-for-beginners",
    frUrl: "https://microsoft.github.io/ai-agents-for-beginners/translations/fr/",
    title: { en: "AI Agents for Beginners", fr: "Agents IA pour débutants" },
    summary: {
      en: "Eighteen lessons on how agents work (tools, planning, memory, several agents together, security), with code for each.",
      fr: "Dix-huit leçons sur le fonctionnement des agents (outils, planification, mémoire, agents multiples, sécurité), avec du code pour chacune.",
    },
    french: "machine", formats: ["text", "code"], minutes: 900, approx: true, level: "intermediate", price: "free", priceNote: API_BILLED, checked: C,
  },
  {
    id: "m-responsible", provider: "microsoft", url: "https://learn.microsoft.com/en-us/training/modules/responsible-ai-studio/",
    title: { en: "Implement a responsible generative AI solution", fr: "Mettre en œuvre une IA générative responsable" },
    summary: {
      en: "Microsoft's working method for responsible generative AI: map the possible harms, measure them, reduce them, then run the system with care.",
      fr: "La méthode de Microsoft pour une IA générative responsable : recenser les préjudices possibles, les mesurer, les réduire, puis exploiter le système avec soin.",
    },
    french: "none", formats: ["text", "interactive"], minutes: 60, approx: true, level: "intermediate", price: "free", checked: C,
  },

  /* DeepLearning.AI */
  {
    id: "d-genai-everyone", provider: "deeplearningai", url: "https://www.deeplearning.ai/courses/generative-ai-for-everyone",
    title: { en: "Generative AI for Everyone", fr: "L'IA générative pour tous" },
    summary: {
      en: "Andrew Ng on what generative AI can and can't do, how to use it at work and what it means for jobs. No code at all.",
      fr: "Andrew Ng explique ce que l'IA générative peut faire ou non, comment l'utiliser au travail et ce qu'elle change pour l'emploi. Aucun code.",
    },
    french: "none", formats: ["video"], minutes: 300, level: "beginner", price: "free-audit",
    priceNote: { en: "Free to watch; graded work and the certificate need a paid membership.", fr: "Vidéos gratuites; travaux notés et certificat avec un abonnement payant." }, checked: C,
  },
  {
    id: "d-prompt-dev", provider: "deeplearningai", url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
    title: { en: "ChatGPT Prompt Engineering for Developers", fr: "Prompt engineering avec ChatGPT pour développeurs" },
    summary: {
      en: "With OpenAI's Isa Fulford and Andrew Ng: prompting patterns for summarizing, classifying, rewriting and expanding text, plus a small chatbot, in a browser notebook.",
      fr: "Avec Isa Fulford (OpenAI) et Andrew Ng : des schémas de requêtes pour résumer, classer, réécrire et développer du texte, et un petit robot conversationnel, dans un carnet en ligne.",
    },
    french: "none", formats: ["video", "code"], minutes: 100, level: "beginner", price: "free", checked: C,
  },
  {
    id: "d-mcp", provider: "deeplearningai", url: "https://www.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic",
    title: { en: "MCP: Build Rich-Context AI Apps with Anthropic", fr: "MCP : des applis IA riches en contexte, avec Anthropic" },
    summary: {
      en: "Made with Anthropic: build an MCP server and a chatbot that uses it, then plug into servers other people have built.",
      fr: "Conçu avec Anthropic : construire un serveur MCP et un robot conversationnel qui l'utilise, puis se brancher sur des serveurs existants.",
    },
    french: "none", formats: ["video", "code"], minutes: 118, level: "intermediate", price: "free", checked: C,
  },
  {
    id: "d-agentic", provider: "deeplearningai", url: "https://www.deeplearning.ai/courses/agentic-ai",
    title: { en: "Agentic AI", fr: "L'IA agentique" },
    summary: {
      en: "Andrew Ng's course on the core design patterns behind agents and how to evaluate them, implemented in Python.",
      fr: "Le cours d'Andrew Ng sur les grands schémas de conception des agents et leur évaluation, mis en pratique en Python.",
    },
    french: "none", formats: ["video", "code"], minutes: 360, approx: true, level: "intermediate", price: "free-audit",
    priceNote: { en: "Videos free to audit; labs and certificate need Pro (from US$25 a month).", fr: "Vidéos gratuites; labos et certificat avec Pro (dès 25 $ US par mois)." }, checked: C,
  },

  /* Hugging Face, fast.ai */
  {
    id: "h-llm", provider: "huggingface", url: "https://huggingface.co/learn/llm-course/chapter1/1",
    title: { en: "LLM Course", fr: "Cours sur les grands modèles de langage" },
    summary: {
      en: "Hugging Face's open course on how language models work and how to fine-tune, evaluate and share them. Needs good Python.",
      fr: "Le cours libre de Hugging Face sur le fonctionnement des modèles de langage et leur ajustement, évaluation et partage. Bon niveau de Python requis.",
    },
    french: "full", formats: ["text", "video", "code"], minutes: 3600, approx: true, level: "advanced", price: "free", checked: C,
  },
  {
    id: "h-agents", provider: "huggingface", url: "https://huggingface.co/learn/agents-course/unit0/introduction",
    title: { en: "AI Agents Course", fr: "Cours sur les agents IA" },
    summary: {
      en: "From what an agent is to building one with popular frameworks, with hands-on exercises, a final challenge and a free certificate.",
      fr: "De la définition d'un agent à sa construction avec des cadriciels populaires, avec exercices pratiques, défi final et certificat gratuit.",
    },
    french: "full", formats: ["text", "code", "interactive"], minutes: 1200, approx: true, level: "intermediate", price: "free", certificate: true, checked: C,
  },
  {
    id: "f-practical", provider: "fastai", url: "https://course.fast.ai/",
    title: { en: "Practical Deep Learning for Coders", fr: "Apprentissage profond pratique pour programmeurs" },
    summary: {
      en: "Nine 90-minute video lessons that get programmers training real models quickly, with a free book of runnable notebooks.",
      fr: "Neuf leçons vidéo de 90 minutes pour que les programmeurs entraînent de vrais modèles rapidement, avec un livre gratuit de carnets exécutables.",
    },
    french: "none", formats: ["video", "code"], minutes: 810, level: "advanced", price: "free", checked: C,
  },

  /* Universities and non-profits */
  {
    id: "e-elements", provider: "helsinki", url: "https://www.elementsofai.com/", frUrl: "https://course.elementsofai.com/fr",
    title: { en: "Elements of AI", fr: "Elements of AI : introduction à l'IA" },
    summary: {
      en: "The classic no-code introduction: what AI is, how machines learn, and what it means for society, with exercises in every chapter.",
      fr: "L'introduction classique sans code : ce qu'est l'IA, comment les machines apprennent et ce que cela change pour la société, avec exercices à chaque chapitre.",
    },
    french: "full", formats: ["text", "interactive"], minutes: 1800, approx: true, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "e-ethics", provider: "helsinki", url: "https://ethics-of-ai.mooc.fi/",
    title: { en: "Ethics of AI", fr: "Éthique de l'IA" },
    summary: {
      en: "Seven chapters on fairness, accountability, transparency, privacy and human rights, ending with ethics in practice.",
      fr: "Sept chapitres sur l'équité, la responsabilité, la transparence, la vie privée et les droits de la personne, jusqu'à l'éthique en pratique.",
    },
    french: "none", formats: ["text", "interactive"], minutes: 900, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "c-destination", provider: "cifar", url: "https://openclassrooms.com/en/courses/7078811-destination-ai-introduction-to-artificial-intelligence",
    frUrl: "https://openclassrooms.com/fr/courses/6417031-objectif-ia-initiez-vous-a-lintelligence-artificielle",
    title: { en: "Destination AI", fr: "Objectif IA" },
    summary: {
      en: "CIFAR's free introduction adapted for Canadians: what AI is and isn't, its effects on work and society, and how an AI project actually runs.",
      fr: "L'introduction gratuite adaptée au Canada par le CIFAR : ce qu'est l'IA et ce qu'elle n'est pas, ses effets sur le travail et la société, et le déroulement d'un vrai projet.",
    },
    french: "full", formats: ["text", "video"], minutes: 300, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "ms-talk-kids", provider: "mediasmarts", url: "https://mediasmarts.ca/teacher-resources/talking-kids-about-ai-tips-parents",
    frUrl: "https://habilomedias.ca/ressources-pedagogiques/aborder-lintelligence-artificielle-avec-ses-enfants-conseils-pour-les-parents",
    title: { en: "Talking to kids about AI", fr: "Aborder l'IA avec ses enfants" },
    summary: {
      en: "A tip sheet for parents: where kids already meet AI, how to start the conversation and the questions to ask together.",
      fr: "Une fiche pour les parents : où les jeunes croisent déjà l'IA, comment lancer la conversation et quelles questions se poser ensemble.",
    },
    french: "full", formats: ["text"], minutes: 10, level: "beginner", price: "free", checked: C,
  },
  {
    id: "ms-what-is-ai", provider: "mediasmarts", url: "https://mediasmarts.ca/teacher-resources/what-ai",
    frUrl: "https://habilomedias.ca/ressources-pedagogiques/quest-ce-que-lintelligence-artificielle",
    title: { en: "What is AI? (MediaSmarts guide)", fr: "Qu'est-ce que l'intelligence artificielle? (guide HabiloMédias)" },
    summary: {
      en: "A plain guide from Canada's digital literacy centre on what AI is and how it shows up in young people's lives.",
      fr: "Un guide simple du centre canadien d'éducation aux médias : ce qu'est l'IA et comment elle se manifeste dans la vie des jeunes.",
    },
    french: "full", formats: ["text"], minutes: 15, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "ms-classroom", provider: "mediasmarts", url: "https://mediasmarts.ca/teacher-resources/addressing-ai-classroom-tips-teachers",
    frUrl: "https://habilomedias.ca/ressources-pedagogiques/aborder-lintelligence-artificielle-en-classe-conseils-pour-les-enseignants",
    title: { en: "Addressing AI in the classroom", fr: "Aborder l'IA en classe" },
    summary: {
      en: "Tips for teachers on discussing AI tools with students, setting expectations and teaching them to question what AI says.",
      fr: "Des conseils aux enseignants pour parler des outils d'IA en classe, fixer les attentes et apprendre aux élèves à remettre en question l'IA.",
    },
    french: "full", formats: ["text"], minutes: 15, approx: true, level: "beginner", price: "free", checked: C,
  },
  {
    id: "ms-deepfakes", provider: "mediasmarts", url: "https://mediasmarts.ca/teacher-resources/spotting-deepfakes",
    frUrl: "https://habilomedias.ca/ressources-pedagogiques/reperer-les-hypertrucages",
    title: { en: "Spotting deepfakes", fr: "Repérer les hypertrucages" },
    summary: {
      en: "Three quick checks for telling whether a photo, video or voice clip was made or altered by AI, with a short video.",
      fr: "Trois vérifications rapides pour savoir si une photo, une vidéo ou un extrait audio a été créé ou modifié par l'IA, avec une courte vidéo.",
    },
    french: "full", formats: ["text", "video"], minutes: 10, level: "beginner", price: "free", checked: C,
  },
  {
    id: "b-future", provider: "bluedot", url: "https://bluedot.org/courses/future-of-ai",
    title: { en: "The Future of AI", fr: "L'avenir de l'IA" },
    summary: {
      en: "Two hours, no background needed: what AI can do today, where it may be heading and which risks are worth taking seriously.",
      fr: "Deux heures, sans prérequis : ce que l'IA sait faire aujourd'hui, où elle pourrait aller et quels risques méritent d'être pris au sérieux.",
    },
    french: "none", formats: ["video", "interactive"], minutes: 120, level: "beginner", price: "free", certificate: true, checked: C,
  },
  {
    id: "mi-responsible", provider: "mila", url: "https://mila.quebec/en/continuing-education/mila-on-udemy-foundations-in-responsible-ai-series",
    title: { en: "Foundations in Responsible AI & AI Ethics", fr: "Fondements de l'IA responsable et de l'éthique de l'IA" },
    summary: {
      en: "Mila, Quebec's AI institute, on the basics of responsible AI for professionals, as a short self-paced course on Udemy.",
      fr: "Mila, l'institut québécois d'IA, présente les bases de l'IA responsable aux professionnels dans un court cours autonome sur Udemy.",
    },
    french: "none", formats: ["video"], minutes: 105, approx: true, level: "beginner", price: "paid",
    priceNote: { en: "Paid course on Udemy; the price varies.", fr: "Cours payant sur Udemy; le prix varie." }, checked: C,
  },
];

export const courseById = (id: string) => COURSES.find(c => c.id === id);

/* ------------------------------------------------------------------ */
/* Paths                                                               */
/* ------------------------------------------------------------------ */

/** Our "What is AI? Meet the players." opening titles. */
export const WHAT_IS_AI_VIDEO = "202610081600-what-is-ai-opening-titles";

type StepBase = { id: string; optional?: boolean; why?: Bi };
export type Step =
  | (StepBase & { kind: "video"; originalId: string; title: Bi; summary: Bi; minutes: number })
  | (StepBase & { kind: "guide"; slug: string })
  | (StepBase & { kind: "page"; to: "/tools"; title: Bi; summary: Bi; minutes: number })
  | (StepBase & { kind: "course"; course: string });

export type LabPath = {
  id: string;
  n: number;
  /** Short name for the route map. */
  short: Bi;
  title: Bi;
  dek: Bi;
  level: Level;
  audience: Bi;
  skills: Bi[];
  steps: Step[];
  /** Main line runs beginner → builder; side routes can be taken any time. */
  line: "main" | "side";
  /** For side routes: the main-line path it leaves from. */
  from?: string;
};

export const PATHS: LabPath[] = [
  {
    id: "start-here", n: 1, line: "main", level: "beginner",
    short: { en: "What AI is", fr: "Ce qu'est l'IA" },
    title: { en: "Start here: what AI is", fr: "Commencer ici : ce qu'est l'IA" },
    dek: {
      en: "Who builds AI, what it really does when it answers you, and where it falls down. No jargon, no code.",
      fr: "Qui construit l'IA, ce qu'elle fait vraiment quand elle vous répond, et où elle trébuche. Sans jargon ni code.",
    },
    audience: { en: "Anyone, starting from zero", fr: "Tout le monde, à partir de zéro" },
    skills: [
      { en: "Explain what generative AI is in plain words", fr: "Expliquer simplement ce qu'est l'IA générative" },
      { en: "See where AI already shows up in your day", fr: "Repérer où l'IA est déjà dans votre quotidien" },
      { en: "Name its main limits: invented facts, bias, stale knowledge", fr: "Nommer ses limites : faits inventés, biais, connaissances dépassées" },
      { en: "Recognize the companies and labs behind the tools", fr: "Reconnaître les entreprises et laboratoires derrière les outils" },
    ],
    steps: [
      {
        id: "video", kind: "video", originalId: WHAT_IS_AI_VIDEO, minutes: 2,
        title: { en: "What is AI? Meet the players.", fr: "Qu'est-ce que l'IA? Les joueurs." },
        summary: {
          en: "Our opening titles: the people racing to build AI, one card at a time, in under two minutes.",
          fr: "Notre générique : les gens qui se livrent la course de l'IA, une carte à la fois, en moins de deux minutes.",
        },
      },
      { id: "everyday", kind: "guide", slug: "ai-in-everyday-life", why: { en: "Where you already use AI without noticing.", fr: "Là où vous utilisez déjà l'IA sans le savoir." } },
      { id: "limits", kind: "course", course: "a-capabilities", why: { en: "Why it is brilliant at some things and unreliable at others.", fr: "Pourquoi elle brille ici et déraille là." } },
      { id: "genai", kind: "course", course: "g-intro-genai", why: { en: "A 45-minute primer on the technology itself.", fr: "Une initiation de 45 minutes à la technologie elle-même." } },
      { id: "destination", kind: "course", course: "c-destination", why: { en: "The Canadian introduction, in English or in French.", fr: "L'introduction canadienne, en français ou en anglais." } },
      { id: "elements", kind: "course", course: "e-elements", optional: true, why: { en: "Want the long version? The classic course, still no code.", fr: "Envie de la version longue? Le cours classique, toujours sans code." } },
    ],
  },
  {
    id: "assistants", n: 2, line: "main", level: "beginner",
    short: { en: "Use assistants", fr: "Les assistants" },
    title: { en: "Use AI assistants well", fr: "Bien utiliser les assistants IA" },
    dek: {
      en: "Claude, ChatGPT, Gemini and Copilot, from each company's own lessons. Pick one, learn its features, keep your private information out.",
      fr: "Claude, ChatGPT, Gemini et Copilot, avec les leçons de chaque entreprise. Choisissez-en un, apprenez ses fonctions, gardez vos données privées pour vous.",
    },
    audience: { en: "People who have tried a chatbot once or twice", fr: "Celles et ceux qui ont essayé un robot conversationnel une ou deux fois" },
    skills: [
      { en: "Set up Claude, ChatGPT, Gemini or Copilot", fr: "Configurer Claude, ChatGPT, Gemini ou Copilot" },
      { en: "Choose the right assistant for a task", fr: "Choisir le bon assistant selon la tâche" },
      { en: "Use files, memory and custom instructions", fr: "Utiliser fichiers, mémoire et instructions personnalisées" },
      { en: "Keep personal information out of chats", fr: "Garder vos renseignements personnels hors des conversations" },
    ],
    steps: [
      { id: "thirty", kind: "guide", slug: "start-in-30-minutes", why: { en: "Pick one assistant and try three real tasks today.", fr: "Choisissez un assistant et essayez trois vraies tâches aujourd'hui." } },
      {
        id: "tools", kind: "page", to: "/tools", minutes: 5,
        title: { en: "Compare the free assistants", fr: "Comparer les assistants gratuits" },
        summary: { en: "Our short list of assistants with free plans and what each is good at.", fr: "Notre courte liste d'assistants offerts gratuitement et leurs points forts." },
      },
      { id: "claude", kind: "course", course: "a-claude-101" },
      { id: "chatgpt", kind: "course", course: "o-fundamentals" },
      { id: "gemini", kind: "course", course: "g-gemini-help" },
      { id: "copilot", kind: "course", course: "m-copilot" },
      { id: "cowork", kind: "course", course: "a-cowork", optional: true, why: { en: "Next level: let an assistant work on your own files.", fr: "Niveau suivant : laisser un assistant travailler sur vos fichiers." } },
    ],
  },
  {
    id: "prompting", n: 3, line: "main", level: "beginner",
    short: { en: "Prompting", fr: "Les requêtes" },
    title: { en: "Prompting: ask better, get better", fr: "Les requêtes : mieux demander, mieux obtenir" },
    dek: {
      en: "The habits that separate a vague answer from a useful one, taught by OpenAI, Google and Anthropic in their own words.",
      fr: "Les réflexes qui distinguent une réponse vague d'une réponse utile, enseignés par OpenAI, Google et Anthropic.",
    },
    audience: { en: "Regular users who want better answers", fr: "Les habitués qui veulent de meilleures réponses" },
    skills: [
      { en: "Write prompts with a task, context and format", fr: "Rédiger une requête avec tâche, contexte et format" },
      { en: "Give examples and ask for step-by-step reasoning", fr: "Donner des exemples et demander un raisonnement par étapes" },
      { en: "Refine an answer instead of starting over", fr: "Affiner une réponse plutôt que recommencer" },
      { en: "Spot and reduce made-up answers", fr: "Repérer et réduire les réponses inventées" },
    ],
    steps: [
      { id: "openai", kind: "course", course: "o-prompting" },
      { id: "google", kind: "course", course: "g-prompts-workspace" },
      { id: "anthropic", kind: "course", course: "a-prompt-docs", why: { en: "The deepest of the three, and it exists in French.", fr: "La plus complète des trois, et offerte en français." } },
      { id: "checklist", kind: "course", course: "o-prompt-api" },
      { id: "tutorial", kind: "course", course: "a-prompt-tutorial", why: { en: "Practice with exercises and an answer key.", fr: "S'exercer, avec corrigé." } },
      { id: "dev", kind: "course", course: "d-prompt-dev", optional: true },
      { id: "google-paid", kind: "course", course: "g-prompting-essentials", optional: true, why: { en: "Paid, with a Google certificate, if your employer wants one.", fr: "Payant, avec certificat Google, si votre employeur en demande un." } },
    ],
  },
  {
    id: "work", n: 4, line: "main", level: "beginner",
    short: { en: "AI at work", fr: "Au travail" },
    title: { en: "AI at work", fr: "L'IA au travail" },
    dek: {
      en: "From one person saving an hour a day to a small team using AI safely: what to hand off, what to check and how to roll it out.",
      fr: "D'une personne qui gagne une heure par jour à une petite équipe qui utilise l'IA prudemment : quoi confier, quoi vérifier, comment déployer.",
    },
    audience: { en: "Employees, managers and small business owners", fr: "Employés, gestionnaires et propriétaires de PME" },
    skills: [
      { en: "Pick tasks worth handing to AI, and ones to keep", fr: "Choisir les tâches à confier à l'IA, et celles à garder" },
      { en: "Build repeatable workflows", fr: "Bâtir des façons de faire répétables" },
      { en: "Review AI output before it reaches a client", fr: "Vérifier le travail de l'IA avant qu'il n'arrive au client" },
      { en: "Plan a small, safe rollout for a team", fr: "Planifier un déploiement modeste et sûr en équipe" },
    ],
    steps: [
      { id: "smb", kind: "guide", slug: "small-business-first-steps" },
      { id: "any-role", kind: "course", course: "o-any-role" },
      { id: "fluency", kind: "course", course: "a-ai-fluency", why: { en: "The best single course on judgement, not just features.", fr: "Le meilleur cours sur le jugement, pas seulement les fonctions." } },
      { id: "openai-work", kind: "course", course: "o-work" },
      { id: "small-biz", kind: "course", course: "a-small-business" },
      { id: "ms-business", kind: "course", course: "m-business" },
      { id: "ng", kind: "course", course: "d-genai-everyone", optional: true },
      { id: "m365", kind: "course", course: "m-365", optional: true, why: { en: "If your workplace already has Microsoft 365 Copilot.", fr: "Si votre milieu de travail a déjà Microsoft 365 Copilot." } },
      { id: "google-cert", kind: "course", course: "g-ai-essentials", optional: true },
      { id: "funding", kind: "guide", slug: "find-ai-funding", optional: true, why: { en: "Canadian programs that help pay for AI projects.", fr: "Les programmes canadiens qui aident à financer un projet d'IA." } },
    ],
  },
  {
    id: "build", n: 5, line: "main", level: "intermediate",
    short: { en: "Build with APIs", fr: "Créer avec les API" },
    title: { en: "Build with AI APIs", fr: "Créer avec les API d'IA" },
    dek: {
      en: "Call a model from your own code: OpenAI, Gemini and Claude side by side, then Microsoft's open course to put it together. Some Python helps.",
      fr: "Appeler un modèle depuis votre code : OpenAI, Gemini et Claude côte à côte, puis le cours libre de Microsoft pour tout assembler. Un peu de Python aide.",
    },
    audience: { en: "People who can write a little code", fr: "Celles et ceux qui codent un peu" },
    skills: [
      { en: "Call a model from code with an API key", fr: "Appeler un modèle par le code avec une clé d'API" },
      { en: "Stream, structure and check what comes back", fr: "Diffuser, structurer et vérifier les réponses" },
      { en: "Add tools and document search (RAG)", fr: "Ajouter des outils et la recherche documentaire (RAG)" },
      { en: "Keep costs down and measure quality", fr: "Maîtriser les coûts et mesurer la qualité" },
    ],
    steps: [
      { id: "openai", kind: "course", course: "o-quickstart" },
      { id: "gemini", kind: "course", course: "g-gemini-api", why: { en: "Has a free tier, handy for practice.", fr: "Offre un palier gratuit, pratique pour s'exercer." } },
      { id: "claude", kind: "course", course: "a-api" },
      { id: "ms", kind: "course", course: "m-genai-beginners" },
      { id: "cookbook", kind: "course", course: "g-gemini-cookbook" },
      { id: "notebooks", kind: "course", course: "a-courses", optional: true },
      { id: "openai-cookbook", kind: "course", course: "o-cookbook", optional: true },
      { id: "hf", kind: "course", course: "h-llm", optional: true, why: { en: "Go under the hood: how the models themselves work.", fr: "Sous le capot : comment les modèles fonctionnent." } },
      { id: "fastai", kind: "course", course: "f-practical", optional: true },
    ],
  },
  {
    id: "agents", n: 6, line: "main", level: "intermediate",
    short: { en: "Agents", fr: "Les agents" },
    title: { en: "Agents", fr: "Les agents" },
    dek: {
      en: "Software that plans, uses tools and acts on its own. Start with the design essay, connect tools with MCP, then build and test real agents.",
      fr: "Des logiciels qui planifient, utilisent des outils et agissent seuls. L'essai de référence, puis MCP pour brancher les outils, puis de vrais agents à bâtir et tester.",
    },
    audience: { en: "Builders comfortable with an API", fr: "Les créateurs à l'aise avec une API" },
    skills: [
      { en: "Explain what makes a system an agent", fr: "Expliquer ce qui fait d'un système un agent" },
      { en: "Connect models to tools and data with MCP", fr: "Relier modèles, outils et données avec MCP" },
      { en: "Use planning, memory and multi-agent patterns", fr: "Utiliser planification, mémoire et agents multiples" },
      { en: "Test, limit and supervise what agents do", fr: "Tester, encadrer et superviser les agents" },
    ],
    steps: [
      { id: "essay", kind: "course", course: "a-agents-essay", why: { en: "Read this first. It will save you from over-building.", fr: "À lire d'abord : il évite de trop en construire." } },
      { id: "ms", kind: "course", course: "m-agents-beginners" },
      { id: "mcp-dlai", kind: "course", course: "d-mcp" },
      { id: "mcp", kind: "course", course: "a-mcp" },
      { id: "hf", kind: "course", course: "h-agents" },
      { id: "kaggle", kind: "course", course: "k-agents" },
      { id: "ng", kind: "course", course: "d-agentic", optional: true },
      { id: "skills", kind: "course", course: "a-skills", optional: true },
      { id: "claude-code", kind: "course", course: "a-claude-code", optional: true },
    ],
  },
  {
    id: "safety", n: 7, line: "side", from: "start-here", level: "beginner",
    short: { en: "Safety", fr: "Sécurité" },
    title: { en: "AI safety and responsible use", fr: "Sécurité et usage responsable de l'IA" },
    dek: {
      en: "Protect yourself today (privacy, scams, deepfakes), then the bigger questions: fairness, accountability and the risks of more capable AI.",
      fr: "Vous protéger dès aujourd'hui (vie privée, fraudes, hypertrucages), puis les grandes questions : équité, responsabilité et risques d'une IA plus puissante.",
    },
    audience: { en: "Everyone; take it any time", fr: "Tout le monde; à suivre quand vous voulez" },
    skills: [
      { en: "Protect your privacy when using AI", fr: "Protéger votre vie privée en utilisant l'IA" },
      { en: "Spot deepfakes and voice-clone scams", fr: "Repérer hypertrucages et fraudes par voix clonée" },
      { en: "Understand bias, accountability and transparency", fr: "Comprendre biais, responsabilité et transparence" },
      { en: "Follow the debate on advanced AI risks", fr: "Suivre le débat sur les risques de l'IA avancée" },
    ],
    steps: [
      { id: "safely", kind: "guide", slug: "use-ai-safely" },
      { id: "deepfakes", kind: "course", course: "ms-deepfakes" },
      { id: "future", kind: "course", course: "b-future" },
      { id: "ethics", kind: "course", course: "e-ethics" },
      { id: "ms", kind: "course", course: "m-responsible", optional: true, why: { en: "For people building or buying AI systems.", fr: "Pour qui conçoit ou achète des systèmes d'IA." } },
      { id: "mila", kind: "course", course: "mi-responsible", optional: true },
    ],
  },
  {
    id: "educators", n: 8, line: "side", from: "assistants", level: "beginner",
    short: { en: "Educators and parents", fr: "Enseignants et parents" },
    title: { en: "AI for educators and parents", fr: "L'IA pour le personnel enseignant et les parents" },
    dek: {
      en: "Talk about AI at home, use it to plan and teach, and help young people use it to learn rather than to skip learning. Canadian resources first.",
      fr: "Parler d'IA à la maison, l'utiliser pour planifier et enseigner, et aider les jeunes à s'en servir pour apprendre. Ressources canadiennes d'abord.",
    },
    audience: { en: "Teachers, parents and caregivers", fr: "Enseignants, parents et proches aidants" },
    skills: [
      { en: "Talk with kids about AI at home", fr: "Parler d'IA avec les enfants à la maison" },
      { en: "Plan lessons and cut admin time with AI", fr: "Planifier et réduire les tâches administratives avec l'IA" },
      { en: "Set clear classroom rules for AI use", fr: "Fixer des règles claires sur l'IA en classe" },
      { en: "Teach students to question what AI says", fr: "Apprendre aux élèves à remettre l'IA en question" },
    ],
    steps: [
      { id: "talk", kind: "course", course: "ms-talk-kids" },
      { id: "guide", kind: "course", course: "ms-what-is-ai" },
      { id: "classroom", kind: "course", course: "ms-classroom" },
      { id: "google", kind: "course", course: "g-educators" },
      { id: "openai", kind: "course", course: "o-teachers" },
      { id: "anthropic", kind: "course", course: "a-educators" },
      { id: "students", kind: "course", course: "a-students", why: { en: "Share it with students in high school and up.", fr: "À partager avec les élèves du secondaire et plus." } },
      { id: "teaching", kind: "course", course: "a-teaching", optional: true },
    ],
  },
];

export const MAIN_LINE = PATHS.filter(p => p.line === "main");
export const SIDE_ROUTES = PATHS.filter(p => p.line === "side");
export const pathById = (id: string) => PATHS.find(p => p.id === id);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export type StepView = {
  step: Step;
  title: Bi;
  summary: Bi;
  minutes: number;
  approx: boolean;
  provider: ProviderId;
  level: Level;
  price: Price;
  french: French;
  course?: Course;
};

/** Everything a step card needs, whatever kind of step it is. */
export function stepView(step: Step): StepView {
  if (step.kind === "course") {
    const c = courseById(step.course);
    if (!c) throw new Error(`Labs: unknown course ${step.course}`);
    return { step, title: c.title, summary: c.summary, minutes: c.minutes, approx: !!c.approx, provider: c.provider, level: c.level, price: c.price, french: c.french, course: c };
  }
  if (step.kind === "guide") {
    const g = GUIDES.find(x => x.slug === step.slug);
    if (!g) throw new Error(`Labs: unknown guide ${step.slug}`);
    return { step, title: g.title, summary: g.dek, minutes: g.minutes, approx: false, provider: "aib", level: "beginner", price: "free", french: "full" };
  }
  // Our video is narrated in English; our pages are bilingual.
  return { step, title: step.title, summary: step.summary, minutes: step.minutes, approx: false, provider: "aib", level: "beginner", price: "free", french: step.kind === "video" ? "none" : "full" };
}

export const requiredSteps = (p: LabPath) => p.steps.filter(s => !s.optional);
export const pathMinutes = (p: LabPath, includeOptional = false) =>
  (includeOptional ? p.steps : requiredSteps(p)).reduce((n, s) => n + stepView(s).minutes, 0);
export const pathProviders = (p: LabPath) => [...new Set(p.steps.map(s => stepView(s).provider))];

export const LEVEL_LABEL: Record<Level, Bi> = {
  beginner: { en: "Beginner", fr: "Débutant" },
  intermediate: { en: "Intermediate", fr: "Intermédiaire" },
  advanced: { en: "Advanced", fr: "Avancé" },
};

export const FORMAT_LABEL: Record<Format, Bi> = {
  video: { en: "Video", fr: "Vidéo" },
  text: { en: "Reading", fr: "Lecture" },
  interactive: { en: "Interactive", fr: "Interactif" },
  code: { en: "Code", fr: "Code" },
};

/** "45 min", "2 h", "2 h 30", "about 30 h". */
export function fmtMinutes(min: number, locale: Locale, approx = false): string {
  const about = approx ? (locale === "fr" ? "env. " : "about ") : "";
  if (min < 60) return `${about}${min} min`;
  if (min >= 600) return `${about}${Math.round(min / 60)} h`;
  const r = Math.round(min / 5) * 5;
  const h = Math.floor(r / 60);
  const m = r % 60;
  return m === 0 ? `${about}${h} h` : `${about}${h} h ${String(m).padStart(2, "0")}`;
}

/** Totals for the hero. */
export const LABS_STATS = {
  paths: PATHS.length,
  courses: COURSES.length,
  providers: new Set(COURSES.map(c => c.provider)).size,
  french: COURSES.filter(c => c.french !== "none").length,
  free: COURSES.filter(c => c.price !== "paid").length,
};

/* ------------------------------------------------------------------ */
/* "Where should I start?"                                             */
/* ------------------------------------------------------------------ */

export type PickerQuestion = { id: "used" | "goal" | "time"; q: Bi; options: { id: string; label: Bi }[] };

export const PICKER: PickerQuestion[] = [
  {
    id: "used",
    q: { en: "How much have you used AI so far?", fr: "Avez-vous déjà utilisé l'IA?" },
    options: [
      { id: "never", label: { en: "Never, or once or twice", fr: "Jamais, ou une ou deux fois" } },
      { id: "regular", label: { en: "I use a chatbot most weeks", fr: "J'utilise un robot conversationnel presque chaque semaine" } },
      { id: "code", label: { en: "I write code", fr: "J'écris du code" } },
    ],
  },
  {
    id: "goal",
    q: { en: "What do you want most right now?", fr: "Que voulez-vous surtout en ce moment?" },
    options: [
      { id: "understand", label: { en: "Understand what all the fuss is about", fr: "Comprendre pourquoi on en parle tant" } },
      { id: "work", label: { en: "Get more done at work", fr: "En faire plus au travail" } },
      { id: "kids", label: { en: "Teach it, or keep kids safe with it", fr: "L'enseigner, ou protéger les jeunes" } },
      { id: "build", label: { en: "Build something with it", fr: "Construire quelque chose avec" } },
    ],
  },
  {
    id: "time",
    q: { en: "How much time can you give it this week?", fr: "Combien de temps pouvez-vous y consacrer cette semaine?" },
    options: [
      { id: "hour", label: { en: "About an hour", fr: "Environ une heure" } },
      { id: "evenings", label: { en: "A few evenings", fr: "Quelques soirées" } },
      { id: "weekend", label: { en: "A weekend or more", fr: "Une fin de semaine ou plus" } },
    ],
  },
];

export type PickerAnswers = Partial<Record<PickerQuestion["id"], string>>;

/** The recommended path, a runner-up and the reason, in the reader's language. */
export function recommend(a: PickerAnswers): { path: string; also?: string; why: Bi } {
  const { used, goal, time } = a;
  if (goal === "kids") {
    return { path: "educators", also: used === "never" ? "start-here" : "safety", why: { en: "Canadian, bilingual resources for home and the classroom come first, then the AI companies' teacher courses.", fr: "Des ressources canadiennes et bilingues pour la maison et la classe d'abord, puis les cours des entreprises d'IA pour enseignants." } };
  }
  if (goal === "build") {
    if (used === "code") {
      return time === "weekend"
        ? { path: "agents", also: "build", why: { en: "You write code and have a weekend: go straight to agents, and use the API path as a reference.", fr: "Vous codez et avez une fin de semaine : allez droit aux agents, avec le parcours API comme référence." } }
        : { path: "build", also: "agents", why: { en: "You write code, so skip ahead: your first API call takes under an hour. Agents come next.", fr: "Vous codez : passez à la construction. Votre premier appel d'API prend moins d'une heure; les agents suivent." } };
    }
    return { path: used === "never" ? "start-here" : "prompting", also: "build", why: { en: "Building starts with knowing how models behave and how to instruct them. This gets you there fastest.", fr: "Construire commence par comprendre les modèles et savoir les diriger. C'est le chemin le plus court." } };
  }
  if (goal === "work") {
    if (used === "never") return { path: "assistants", also: "work", why: { en: "Get comfortable with one assistant first; the work path builds on it.", fr: "Apprivoisez d'abord un assistant; le parcours travail s'appuie dessus." } };
    if (time === "hour") return { path: "prompting", also: "work", why: { en: "In an hour, better prompts pay off the most.", fr: "En une heure, de meilleures requêtes rapportent le plus." } };
    return { path: "work", also: "prompting", why: { en: "You already use AI. This is about using it well and safely with other people.", fr: "Vous utilisez déjà l'IA. Il s'agit maintenant de bien l'utiliser, et prudemment, avec d'autres." } };
  }
  // understand
  if (used === "code") return { path: "start-here", also: "agents", why: { en: "A quick, non-technical grounding, then jump to the deep end whenever you like.", fr: "Une mise à niveau rapide et non technique, puis plongez quand vous voulez." } };
  if (used === "regular") return { path: "start-here", also: "safety", why: { en: "You use it already; now see how it works and where it fails.", fr: "Vous l'utilisez déjà; voyez maintenant comment elle fonctionne et où elle échoue." } };
  return { path: "start-here", also: "assistants", why: { en: "Exactly where this academy begins: a two-minute video, then short, plain lessons.", fr: "C'est là que tout commence : une vidéo de deux minutes, puis de courtes leçons claires." } };
}
