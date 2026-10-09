/**
 * Server-only Claude client (Anthropic Messages API over plain fetch).
 * Every helper returns null on any failure so callers fall back to today's
 * behaviour. Never import this from client code; use claude.functions.ts.
 */

export const HAIKU = "claude-haiku-4-5-20251001";
export const SONNET = "claude-sonnet-5-5";

const TIMEOUT_MS = 20_000;
const CACHE_MAX = 3000;

type Entry = { ts: number; ttl: number; value: unknown };
const g = globalThis as unknown as {
  __claudeCache?: Map<string, Entry>;
  __claudeDay?: { day: string; count: number };
};
const cache = (g.__claudeCache ??= new Map());

export function hashKey(s: string): string {
  // FNV-1a, 32-bit, twice with different seeds: cheap and good enough for cache keys.
  let a = 0x811c9dc5, b = 0x01000193 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c, 0x5bd1e995);
  }
  return (a >>> 0).toString(36) + (b >>> 0).toString(36);
}

export function cacheGet<T>(key: string): T | undefined {
  const e = cache.get(key);
  if (!e) return undefined;
  if (Date.now() - e.ts > e.ttl) { cache.delete(key); return undefined; }
  return e.value as T;
}

export function cacheSet(key: string, value: unknown, ttl: number) {
  if (cache.size > CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  cache.set(key, { ts: Date.now(), ttl, value });
}

export function claudeAvailable(): boolean {
  return !!process.env["ANTHROPIC_API_KEY"];
}

function takeBudget(): boolean {
  const cap = Number(process.env["MAX_DAILY_CLAUDE_CALLS"]) || 300;
  const day = new Date().toISOString().slice(0, 10);
  const d = (g.__claudeDay ??= { day, count: 0 });
  if (d.day !== day) { d.day = day; d.count = 0; }
  if (d.count >= cap) return false;
  d.count++;
  return true;
}

/** Pull the first JSON object/array out of a model reply. */
export function parseJson<T>(text: string): T | null {
  const t = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  for (const [o, c] of [["{", "}"], ["[", "]"]] as const) {
    const i = t.indexOf(o), j = t.lastIndexOf(c);
    if (i >= 0 && j > i) {
      try { return JSON.parse(t.slice(i, j + 1)) as T; } catch { /* try next */ }
    }
  }
  return null;
}

/**
 * One Messages API call that must return JSON. Returns null when the key is
 * missing, the daily cap is reached, the call fails or times out, or the
 * reply is not valid JSON.
 */
export async function claudeJson<T>(opts: {
  task: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
  ttlMs: number;
}): Promise<T | null> {
  const key = process.env["ANTHROPIC_API_KEY"];
  if (!key) return null;
  const ck = `${opts.task}:${hashKey(opts.model + opts.system + opts.user)}`;
  const hit = cacheGet<T>(ck);
  if (hit !== undefined) return hit;
  if (!takeBudget()) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens ?? 2048,
        system: opts.system + "\n\nReply with JSON only. No prose, no code fences.",
        messages: [{ role: "user", content: opts.user }],
      }),
    });
    if (!res.ok) {
      console.warn(`[claude] ${opts.task} HTTP ${res.status}`);
      return null;
    }
    const body = (await res.json()) as { content?: { type: string; text?: string }[]; stop_reason?: string };
    if (body.stop_reason === "refusal") return null;
    const text = (body.content ?? []).filter(b => b.type === "text").map(b => b.text ?? "").join("");
    const parsed = parseJson<T>(text);
    if (parsed == null) { console.warn(`[claude] ${opts.task} returned non-JSON`); return null; }
    cacheSet(ck, parsed, opts.ttlMs);
    return parsed;
  } catch (e) {
    console.warn(`[claude] ${opts.task} failed:`, (e as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
