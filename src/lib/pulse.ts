import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import type { PulsePayload, Trend } from "./pulse-engine";
import type { Story } from "./news-engine";

export type { PulsePayload, Trend };
export type { BuiltItem, RepoItem, SpaceItem } from "./pulse-engine";

export const getPulse = createServerFn({ method: "GET" }).handler(async () => {
  const { loadPulse } = await import("./pulse-engine");
  return loadPulse();
});

export async function getPulseFast(ms = 3500): Promise<PulsePayload | null> {
  return Promise.race([getPulse().catch(() => null), new Promise<null>(r => setTimeout(() => r(null), ms))]);
}

/** Made-with-AI showcase and search trends; refreshed every 10 minutes. */
export function usePulse(initial?: PulsePayload | null) {
  return useQuery({
    queryKey: ["ai-pulse"],
    queryFn: () => getPulse(),
    initialData: initial ?? undefined,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });
}

/** Tech and AI search terms worth showing on an AI newspaper. */
export const TECH_RE = /\b(ai|a\.i\.|chatgpt|openai|gpt|claude|anthropic|gemini|google|deepmind|copilot|microsoft|windows|apple|iphone|ipad|macbook|vision pro|meta|llama|nvidia|amd|intel|tesla|optimus|robot\w*|samsung|pixel|android|xbox|playstation|ps5|nintendo|grok|xai|perplexity|mistral|deepseek|cohere|chip\w*|data cent\w*|tiktok|youtube|instagram|whatsapp|spotify|netflix|amazon|alexa|aws|starlink|spacex|quantum|crypto|bitcoin|smartphone|laptop|software|cyber\w*|hackers?|chatbots?)\b/i;

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Trending terms that are about technology (for the panel). */
export function techTrends(list: Trend[]): Trend[] {
  return list.filter(t => TECH_RE.test(t.term) || (!!t.newsTitle && AI_HINT.test(t.newsTitle)));
}
const AI_HINT = /\b(AI|artificial intelligence|ChatGPT|OpenAI|Claude|Gemini|Nvidia|chatbot|robot)\b/i;

/** Which region's trending searches a story matches (by a trending term appearing in its headline). */
export function trendMatch(s: Story, pulse: PulsePayload | undefined | null): "ca" | "us" | null {
  if (!pulse) return null;
  const title = ` ${fold(s.title)} `;
  for (const region of ["ca", "us"] as const) {
    for (const t of pulse.trends[region]) {
      const term = fold(t.term).trim();
      // Single short words match too much ("ai", "us"); need a distinctive term.
      if (term.length < 4 || (!term.includes(" ") && term.length < 5)) continue;
      if (title.includes(` ${term} `) || title.includes(` ${term}'`) || title.includes(` ${term},`) || title.includes(` ${term}:`)) return region;
    }
  }
  return null;
}
