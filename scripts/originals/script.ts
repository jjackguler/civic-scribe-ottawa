/**
 * Picks today's story and has Claude write a short narrated explainer from the
 * publishers' own text. Every line is checked by the same fact guard as the AI
 * desk: any number or name not in the sources rejects the script.
 */
import type { Story } from "../../src/lib/news-engine";
import type { Cluster } from "../../src/lib/cluster";
import { unsupported } from "../../src/lib/ai-desk.server";

export type Card =
  | { type: "headline"; big: string; small?: string }
  | { type: "number"; big: string; small: string }
  | { type: "quote"; big: string; small: string }
  | { type: "fact"; big: string; small?: string }
  | { type: "sources"; big: string; small?: string };

export type Segment = { say: string; card: Card; imagePrompt?: string };
export type Script = {
  title: string;
  summary: string;
  segments: Segment[];
  youtubeTitle: string;
  description: string;
  tags: string[];
};

/** Words our narration may use that won't appear in a publisher's text. */
export const HOUSE_WORDS = ["here", "here's", "that's", "today", "so", "now", "this", "it", "and", "but", "follow", "subscribe", "broadsheet", "ai", "what", "why", "who", "next", "meanwhile", "plus", "also", "it's", "there", "they", "we", "you", "your", "for", "sources", "source", "according", "reports", "reported", "says", "said"];

export function sourceText(c: Cluster): string {
  return c.stories.map(s => `${s.title}. ${s.summary}. ${s.source}`).join("\n");
}

const SYSTEM = `You write 45–70 second vertical explainer videos (YouTube Shorts) for AI Broadsheet, an AI news site. Style: Vox-like clarity, calm and direct, no hype.

You get several publishers' headlines and short excerpts about ONE story. Write a script as JSON:
{
 "title": "our headline for the video, 40–80 characters",
 "summary": "one sentence",
 "segments": [
   { "say": "narration for this card, 1–2 short sentences",
     "card": { "type": "headline|number|quote|fact|sources", "big": "on-screen words, max 9 words", "small": "max 14 words" },
     "imagePrompt": "optional: an abstract editorial illustration idea for this card, no people, no logos, no text" }
 ],
 "youtubeTitle": "max 90 characters",
 "description": "2–3 sentences, then 'Sources:' and the publisher names",
 "tags": ["5 to 8 tags"]
}
Rules:
- 5 to 7 segments. Total narration 110–170 words. The first segment hooks with the news itself; the last names the sources ("according to …").
- Use ONLY facts written in the text you are given. Do not add any name, number, date, place, quote, cause or consequence that is not there. Keep names and numbers exactly as written.
- "number" cards only for a number that appears in the text. "quote" cards only for words in quotation marks in the text, attributed as written.
- No questions in titles, no exclamation marks, no "breaking", no "shocking".
- If the text is too thin for a fair 45-second explainer, return {"skip": true}.`;

/** Writes the script with Claude when apiKey is set, otherwise with Gemini (geminiKey). */
export async function writeScript(cluster: Cluster, opts: { apiKey?: string; geminiKey?: string; model: string; feedback?: string[] }): Promise<Script | null> {
  const items = cluster.stories.slice(0, 6).map((s: Story) => ({ publisher: s.source, headline: s.title, excerpt: s.summary.slice(0, 600), published: s.publishedAt }));
  const user = JSON.stringify({ story: items }) + (opts.feedback?.length
    ? `\n\nYour previous draft used words that are not in the sources: ${opts.feedback.join(", ")}. Remove them or replace them with words from the sources.`
    : "");
  if (!opts.apiKey) return writeScriptGemini(user, opts.geminiKey!, opts.model);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": opts.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: opts.model, max_tokens: 2500, system: SYSTEM + "\n\nReply with JSON only.", messages: [{ role: "user", content: user }] }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Claude HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = await res.json() as { content?: { type: string; text?: string }[] };
  const text = (body.content ?? []).map(b => b.text ?? "").join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  if (json.skip) return null;
  return json as Script;
}

async function writeScriptGemini(user: string, key: string, model: string): Promise<Script | null> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM + "\n\nReply with JSON only." }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.4, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = (body.candidates?.[0]?.content?.parts ?? []).map(p => p.text ?? "").join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  if (json.skip) return null;
  return json as Script;
}

/** Everything the viewer will hear or read must be supported by the sources. */
export function checkScript(script: Script, source: string): string[] {
  const all = [
    script.title, script.summary,
    ...script.segments.flatMap(s => [s.say, s.card.big, s.card.small ?? ""]),
  ].join(". ");
  return [...new Set(unsupported(all, source, HOUSE_WORDS))];
}

export function validShape(s: Script | null): s is Script {
  return !!s && typeof s.title === "string" && Array.isArray(s.segments) && s.segments.length >= 4 && s.segments.length <= 8
    && s.segments.every(x => typeof x.say === "string" && x.say.length > 5 && x.card && typeof x.card.big === "string");
}

/** The cluster to cover: most outlets first, not covered before, at least 2 outlets, under 24 h old. */
export function pickCluster(clusters: Cluster[], covered: Set<string>): Cluster | null {
  const now = Date.now();
  const fresh = clusters.filter(c => now - new Date(c.latest).getTime() < 24 * 3600_000 && !c.stories.some(s => covered.has(s.id) || covered.has(s.link)));
  return fresh.find(c => c.sources >= 3) ?? fresh.find(c => c.sources >= 2) ?? null;
}
