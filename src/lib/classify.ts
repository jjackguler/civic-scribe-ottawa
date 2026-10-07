/**
 * Keyword rules shared by the news and media desks. Rules only ever *file*
 * a story under a desk; they never change its headline or summary.
 */
import type { Topic } from "./news-sources";

export const AI_RE = /\b(A\.?I\.?|artificial intelligence|machine learning|deep learning|neural net\w*|LLMs?|large language models?|generative|chatbots?|ChatGPT|OpenAI|Anthropic|Claude AI|Google Gemini|Gemini AI|Copilot|Mistral AI|Cohere|DeepSeek|Nvidia|data cent(?:er|re)s?|humanoid robots?|AI agents?|intelligence artificielle|IA|IAG|apprentissage automatique|robots? conversationnels?|centres? de données)\b/;

/** Interview shows talk about AI without always saying "AI" in the title. */
export const AI_TALK_RE = /\b(agents?|agentic|alignment|AGI|superintelligen\w*|GPTs?|reinforcement learning|transformers?|models?|compute|scaling|robotics|automation|Claude|Gemini|Llama|Grok|Sora|deepfakes?)\b/i;

export const INTERVIEW_RE = /\b(interview\w*|in conversation|conversation with|fireside|sits? down with|Q&A|entretien|entrevue)\b/i;

/** Desks in priority order: the first match is the story's primary desk. */
const RULES: [Topic, RegExp][] = [
  ["immersive", /\b(AR|VR|XR|virtual reality|augmented reality|mixed reality|spatial computing|headsets?|Vision Pro|Meta Quest|Quest \d|smart ?glasses|Ray-Ban Meta|metaverse|immersive|réalité virtuelle|réalité augmentée)\b/i],
  ["robotics", /\b(robots?|robotics|humanoids?|autonomous vehicles?|self-driving|driverless|robotaxis?|drones?|Waymo|Optimus|Figure AI|Boston Dynamics|robotique)\b/i],
  ["infrastructure", /\b(data cent(?:er|re)s?|chips?|chipmakers?|GPUs?|TPUs?|semiconductors?|Nvidia|AMD|TSMC|Broadcom|compute|supercomputers?|hyperscalers?|cloud capacity|gigawatts?|GW|power grid|centres? de données|puces?)\b/i],
  ["health", /\b(health|healthcare|medical|medicine|hospitals?|patients?|doctors?|clinical|drugs?|biotech|protein|cancer|diagnos\w+|santé|médical)\b/i],
  ["sustainability", /\b(climate|emissions?|carbon|sustainab\w+|renewables?|nuclear|water use|energy use|electricity demand|environment\w*|climat|énergie)\b/i],
  ["business", /\b(raises?|raised|funding round|Series [A-F]|investors?|invest\w*|valuation|IPO|acqui\w+|merger|revenue|earnings|profit|startups?|unicorn|stock|shares|billion|financement|investissement|jeunes pousses)\b/i],
  ["policy", /\b(regulat\w+|legislat\w+|laws?|bill C-\d+|government|minister|ministry|parliament|senate|congress|White House|EU AI Act|European Commission|sovereign\w*|national strategy|policy|politique|gouvernement|ministre|loi)\b/i],
  ["responsible", /\b(safety|ethic\w*|bias\w*|fairness|privacy|surveillance|copyright|lawsuits?|sued|court|deepfakes?|misinformation|disinformation|alignment|guardrails?|harms?|transparen\w+|accountab\w+|éthique|sécurité|vie privée)\b/i],
  ["people", /\b(jobs?|workers?|workforce|employ\w+|hiring|layoffs?|skills?|reskill\w*|education|students?|schools?|teachers?|universit\w+|careers?|talent|emploi|travailleurs|compétences|éducation)\b/i],
  ["agents", /\b(agents?|agentic|assistants?|chatbots?|ChatGPT|Claude|Gemini|Copilot|Siri|Alexa|Grok|Perplexity|Llama|agent IA|assistant)\b/i],
  ["research", /\b(research\w*|study|studies|paper|arXiv|benchmarks?|open[- ]source|open[- ]weights?|reasoning|training|scientists?|model|models|breakthrough|recherche|étude)\b/i],
  ["data", /\b(data(?! cent)|datasets?|analytics|databases?|data science|données(?! de)|vector search)\b/i],
];

export function tagsOf(text: string, forced?: Topic): Topic[] {
  const tags = RULES.filter(([, re]) => re.test(text)).map(([t]) => t);
  if (forced && !tags.includes(forced)) tags.unshift(forced);
  if (tags.length === 0) tags.push("applications");
  return tags.slice(0, 4);
}
