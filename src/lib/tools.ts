import type { Bi } from "./i18n";

/** Curated AI tools. Plans and prices change often, so we link out instead of quoting prices. */
export type ToolCategory = "assistants" | "research" | "language" | "create" | "meetings" | "build";

export type Tool = {
  name: string;
  maker: string;
  category: ToolCategory;
  url: string;
  freePlan: boolean;
  canadian?: boolean;
  goodFor: Bi;
};

export const TOOL_CATEGORIES: { id: ToolCategory; label: Bi }[] = [
  { id: "assistants", label: { en: "Everyday assistants", fr: "Assistants du quotidien" } },
  { id: "research", label: { en: "Research and reading", fr: "Recherche et lecture" } },
  { id: "language", label: { en: "Writing and translation", fr: "Rédaction et traduction" } },
  { id: "create", label: { en: "Images, audio and video", fr: "Images, audio et vidéo" } },
  { id: "meetings", label: { en: "Meetings and notes", fr: "Réunions et notes" } },
  { id: "build", label: { en: "Build apps and sites", fr: "Créer des applis et des sites" } },
];

export const TOOLS: Tool[] = [
  { name: "ChatGPT", maker: "OpenAI", category: "assistants", url: "https://chatgpt.com", freePlan: true,
    goodFor: { en: "Drafting emails, brainstorming, explaining anything step by step.", fr: "Rédiger des courriels, trouver des idées, tout expliquer étape par étape." } },
  { name: "Claude", maker: "Anthropic", category: "assistants", url: "https://claude.ai", freePlan: true,
    goodFor: { en: "Long documents, careful writing and working through complex tasks.", fr: "Longs documents, rédaction soignée et tâches complexes." } },
  { name: "Gemini", maker: "Google", category: "assistants", url: "https://gemini.google.com", freePlan: true,
    goodFor: { en: "Questions that connect to Gmail, Docs and Google search.", fr: "Questions liées à Gmail, Docs et la recherche Google." } },
  { name: "Microsoft Copilot", maker: "Microsoft", category: "assistants", url: "https://copilot.microsoft.com", freePlan: true,
    goodFor: { en: "Help inside Word, Excel, Outlook and Windows.", fr: "De l'aide dans Word, Excel, Outlook et Windows." } },
  { name: "Le Chat", maker: "Mistral AI", category: "assistants", url: "https://chat.mistral.ai", freePlan: true,
    goodFor: { en: "A fast assistant with strong French.", fr: "Un assistant rapide, très bon en français." } },
  { name: "Cohere North", maker: "Cohere", category: "assistants", url: "https://cohere.com", freePlan: false, canadian: true,
    goodFor: { en: "Secure AI workspace for organizations, built in Toronto.", fr: "Espace de travail IA sécurisé pour les organisations, conçu à Toronto." } },
  { name: "Perplexity", maker: "Perplexity", category: "research", url: "https://www.perplexity.ai", freePlan: true,
    goodFor: { en: "Answers with sources you can click and check.", fr: "Des réponses avec des sources à vérifier." } },
  { name: "NotebookLM", maker: "Google", category: "research", url: "https://notebooklm.google.com", freePlan: true,
    goodFor: { en: "Study your own PDFs and notes; turns them into summaries and audio overviews.", fr: "Étudier vos PDF et notes; résumés et aperçus audio." } },
  { name: "DeepL", maker: "DeepL", category: "language", url: "https://www.deepl.com", freePlan: true,
    goodFor: { en: "Natural English–French translation for work documents.", fr: "Traduction anglais-français naturelle pour le travail." } },
  { name: "Grammarly", maker: "Grammarly", category: "language", url: "https://www.grammarly.com", freePlan: true,
    goodFor: { en: "Clearer, more confident writing everywhere you type.", fr: "Une écriture plus claire, partout où vous tapez." } },
  { name: "Canva", maker: "Canva", category: "create", url: "https://www.canva.com", freePlan: true,
    goodFor: { en: "Posters, social posts and slides with AI design help.", fr: "Affiches, publications et présentations avec l'aide de l'IA." } },
  { name: "Adobe Firefly", maker: "Adobe", category: "create", url: "https://firefly.adobe.com", freePlan: true,
    goodFor: { en: "Image generation trained with commercial use in mind.", fr: "Génération d'images pensée pour l'usage commercial." } },
  { name: "ElevenLabs", maker: "ElevenLabs", category: "create", url: "https://elevenlabs.io", freePlan: true,
    goodFor: { en: "Natural voice-overs and audio in many languages.", fr: "Voix hors champ naturelles dans plusieurs langues." } },
  { name: "Descript", maker: "Descript", category: "create", url: "https://www.descript.com", freePlan: true,
    goodFor: { en: "Edit video and podcasts by editing the transcript.", fr: "Monter vidéos et balados en modifiant la transcription." } },
  { name: "Otter.ai", maker: "Otter.ai", category: "meetings", url: "https://otter.ai", freePlan: true,
    goodFor: { en: "Live meeting transcripts and action items.", fr: "Transcriptions de réunions et suivis." } },
  { name: "Lovable", maker: "Lovable", category: "build", url: "https://lovable.dev", freePlan: true,
    goodFor: { en: "Describe a website or app and get working code.", fr: "Décrivez un site ou une appli et obtenez du code fonctionnel." } },
  { name: "Cursor", maker: "Anysphere", category: "build", url: "https://cursor.com", freePlan: true,
    goodFor: { en: "An AI code editor for people who already write code.", fr: "Un éditeur de code IA pour ceux qui codent déjà." } },
];
