/**
 * Web research for thin events (owner's request, 2026-11-16: "our own voice, less dependence on feeds").
 *
 * Most feeds give a headline and no text, so pick.ts turns those events down for
 * "too little reporting". For a few of them a run asks Claude, with Anthropic's
 * web search tool, what happened. We keep only the passages the answer cites
 * (`cited_text`, verbatim, at most about 150 characters each) grouped by the page
 * they came from: those become the event's reporting, with each page named and
 * linked as a source. Claude's own wording of the research is never used as a
 * source, so the fact guard still checks every name and number against text
 * that a real page published.
 *
 * Researched articles never publish on their own: they wait in drafts/ for the
 * editor (see run.ts), until the owner says otherwise.
 *
 * Spend: one call per event (search results are billed as input tokens) plus
 * $10 per 1,000 searches. Capped per run and per day (NEWSROOM_RESEARCH_PER_RUN,
 * NEWSROOM_RESEARCH_DAILY); an event is researched at most once in three days.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Story } from "../../src/lib/news-engine";
import { priceOf, withRetry } from "./models";

export const SEARCH_USD = 10 / 1000;
/** Aggregators, social media and forums: never a source we name. */
export const BLOCKED = ["news.google.com", "msn.com", "yahoo.com", "flipboard.com", "reddit.com", "x.com", "twitter.com", "facebook.com", "instagram.com", "threads.net", "tiktok.com", "youtube.com", "linkedin.com", "medium.com", "substack.com", "quora.com", "daily.dev", "news.ycombinator.com", "wikipedia.org",
  // Content farms and scrapers that republish other outlets' reporting (seen in research on 16-17 Nov 2026).
  "blogspot.com", "headtopics.com", "newsbreak.com", "ground.news", "inkl.com", "biztoc.com"];
/** Features, lists and reviews are not events: researching them finds nothing to report. */
export const NOT_AN_EVENT = /\b(running list|list of|how to|hands-on|review|opinion|podcast|newsletter|explained|everything we know|what to know|deep dive|interview|was a|best \w+ of)\b/i;
const RESEARCH_COOLDOWN_MS = 72 * 3600_000;

export type Cited = { url: string; title: string; text: string };
export type ResearchResult = { stories: Story[]; searches: number; inTokens: number; outTokens: number; usd: number; note: string };

type Block = { type: string; text?: string; citations?: { type: string; url?: string; title?: string; cited_text?: string }[] };

/** Every web passage the answer cites, in order, without repeats. */
export function citedPassages(content: Block[]): Cited[] {
  const out: Cited[] = [];
  const seen = new Set<string>();
  for (const b of content) {
    if (b.type !== "text") continue;
    for (const c of b.citations ?? []) {
      if (c.type !== "web_search_result_location" || !c.url || !c.cited_text) continue;
      const text = c.cited_text.replace(/\s+/g, " ").trim();
      const key = `${c.url}\n${text}`;
      if (!text || seen.has(key)) continue;
      seen.add(key);
      out.push({ url: c.url, title: (c.title ?? "").trim(), text });
    }
  }
  return out;
}

/** "www.theglobeandmail.com" -> "theglobeandmail.com"; a page title's "… - Outlet" suffix wins when there is one. */
export function outletOf(url: string, title: string): string {
  const tail = title.match(/\s[-|–—]\s([^-|–—]{2,40})$/)?.[1]?.trim();
  if (tail && !/\d{4}/.test(tail)) return tail;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "web"; }
}

const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

/** One synthetic report per cited page: its passages, verbatim, are the excerpt the writer and the fact guard see. */
export function passagesToStories(cited: Cited[], lead: Story): Story[] {
  const byUrl = new Map<string, Cited[]>();
  for (const c of cited) {
    let host = "";
    try { host = new URL(c.url).hostname.replace(/^www\./, ""); } catch { continue; }
    if (BLOCKED.some(b => host === b || host.endsWith(`.${b}`))) continue;
    byUrl.set(c.url, [...(byUrl.get(c.url) ?? []), c]);
  }
  return [...byUrl.entries()].map(([url, cs]) => {
    const title = cs.find(c => c.title)?.title ?? lead.title;
    return {
      id: `web-${hash(url)}`,
      title: title.replace(/\s[-|–—]\s[^-|–—]{2,40}$/, "").trim() || lead.title,
      summary: cs.map(c => /[.!?…"”]$/.test(c.text) ? c.text : `${c.text} …`).join(" "),
      link: url,
      source: outletOf(url, title),
      sourceId: "web-research",
      region: lead.region,
      topic: lead.topic,
      tags: lead.tags,
      lang: "en",
      publishedAt: lead.publishedAt,
      image: null,
      kind: "news",
      gov: false,
      lab: false,
      level: null,
      minister: false,
    } as Story;
  });
}

export const RESEARCH_SYSTEM = `You are a research assistant for a news desk. You find out what happened in one news event, using web search.
Rules:
- Search for reports of this exact event, published around the given date. Prefer the announcing organisation's own page, government pages and established news outlets. Never rely on social media, forums or aggregators.
- Then write a short factual brief, 6 to 10 sentences: who, what, when, where, the numbers, what was said and by whom, and what is not yet known.
- Every sentence must rest on a search result you cite. No opinion, no guesses, nothing from memory.
- If you cannot find this event, or the reports disagree on the basic facts, reply with only the word NOT_FOUND.`;

export function researchPrompt(lead: Story): string {
  return [
    `Headline: ${lead.title}`,
    `Reported by: ${lead.source}, ${lead.publishedAt.slice(0, 10)}`,
    lead.summary ? `Feed text: ${lead.summary.slice(0, 600)}` : "",
    `Link: ${lead.link}`,
  ].filter(Boolean).join("\n");
}

/** Ask Claude (web search tool) what happened. Never throws: a failure returns null and the event stays skipped. */
export async function researchEvent(lead: Story, opts: { apiKey: string; model: string; maxSearches?: number; fetch?: typeof fetch; timeoutMs?: number }): Promise<ResearchResult | null> {
  const f = opts.fetch ?? fetch;
  const price = priceOf(opts.model);
  if (!price) return null;
  const messages: { role: "user" | "assistant"; content: unknown }[] = [{ role: "user", content: researchPrompt(lead) }];
  const content: Block[] = [];
  let searches = 0, inTokens = 0, outTokens = 0;
  try {
    // A long search turn can pause (stop_reason "pause_turn"): send it back unchanged to continue, at most twice.
    for (let turn = 0; turn < 3; turn++) {
      const res = await withRetry(() => f("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": opts.apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: opts.model,
          max_tokens: 8192,
          system: RESEARCH_SYSTEM,
          messages,
          // Direct calls: with dynamic filtering (the default caller) the answer came back without citations, and citations are all we use.
          tools: [{ type: "web_search_20260209", name: "web_search", max_uses: opts.maxSearches ?? 3, allowed_callers: ["direct"], blocked_domains: BLOCKED }],
          output_config: { effort: "low" },
        }),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 180_000),
      }));
      if (!res.ok) { await res.body?.cancel(); return { stories: [], searches, inTokens, outTokens, usd: cost(), note: `research call answered HTTP ${res.status}` }; }
      const body = await res.json() as { content?: Block[]; stop_reason?: string; usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number; server_tool_use?: { web_search_requests?: number } } };
      inTokens += (body.usage?.input_tokens ?? 0) + (body.usage?.cache_read_input_tokens ?? 0) + (body.usage?.cache_creation_input_tokens ?? 0);
      outTokens += body.usage?.output_tokens ?? 0;
      searches += body.usage?.server_tool_use?.web_search_requests ?? 0;
      content.push(...(body.content ?? []));
      if (body.stop_reason === "refusal") return { stories: [], searches, inTokens, outTokens, usd: cost(), note: "declined" };
      if (body.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: body.content ?? [] });
    }
  } catch (e) {
    return { stories: [], searches, inTokens, outTokens, usd: cost(), note: `research failed: ${(e as Error).message}` };
  }
  const answer = content.filter(b => b.type === "text").map(b => b.text ?? "").join("").trim();
  if (/^NOT_FOUND\b/.test(answer) || /\bNOT_FOUND\s*$/.test(answer)) return { stories: [], searches, inTokens, outTokens, usd: cost(), note: "event not found on the web" };
  const stories = passagesToStories(citedPassages(content), lead);
  const shape = stories.length ? "" : ` [answer: ${content.map(b => b.type + (b.citations?.length ? `+${b.citations.length}` : "")).join(",").slice(0, 300)}; ${answer.slice(0, 160).replace(/\s+/g, " ")}]`;
  return { stories, searches, inTokens, outTokens, usd: cost(), note: `${stories.length} page(s) cited, ${searches} search(es)${shape}` };

  function cost() { return (inTokens * price![0] + outTokens * price![1]) / 1e6 + searches * SEARCH_USD; }
}

/** Which events were researched, and how many today (UTC): kept in the store so the caps hold across runs. */
export type ResearchLog = { date: string; count: number; at: Record<string, string> };

export async function loadResearchLog(store: string, today: string): Promise<ResearchLog> {
  const file = join(store, "log", "research.json");
  let log: ResearchLog = { date: today, count: 0, at: {} };
  if (existsSync(file)) { try { log = JSON.parse(await readFile(file, "utf8")) as ResearchLog; } catch { /* start over */ } }
  if (log.date !== today) log = { date: today, count: 0, at: log.at ?? {} };
  const cutoff = Date.now() - RESEARCH_COOLDOWN_MS;
  log.at = Object.fromEntries(Object.entries(log.at ?? {}).filter(([, t]) => new Date(t).getTime() > cutoff));
  return log;
}

export async function saveResearchLog(store: string, log: ResearchLog) {
  await writeFile(join(store, "log", "research.json"), JSON.stringify(log, null, 2) + "\n");
}
