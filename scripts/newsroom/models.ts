/**
 * The model client for the newsroom: Claude (ANTHROPIC_API_KEY) when it is
 * set, otherwise Gemini (GEMINI_API_KEY). Two tiers: "writer" for the
 * reporter, copy editor and translator; "checker" for the standards, SEO and
 * design desks. In --dry-run the canned client answers from fixtures, so no
 * key is needed and nothing leaves the machine.
 *
 * Keys are read from the environment only and never logged.
 */
import { writeFile } from "node:fs/promises";
import type { RoleName } from "../../src/lib/newsroom-types";

export type Tier = "writer" | "checker";
export type CallCtx = { id: string; attempt: number };

export interface Models {
  provider: "claude" | "gemini" | "canned";
  model(tier: Tier): string;
  /** One call that must return a JSON object; null on any failure. */
  json<T>(role: RoleName, tier: Tier, system: string, user: string, ctx: CallCtx, maxTokens?: number): Promise<T | null>;
  /** Usage so far, for the run summary (approximate for Gemini). */
  usage: { calls: number; inTokens: number; outTokens: number };
}

const env = (k: string) => process.env[k]?.trim() || "";

/** Pull the first JSON object out of a reply (models sometimes wrap it in fences). */
export function parseJson<T>(text: string): T | null {
  const t = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const i = t.indexOf("{"), j = t.lastIndexOf("}");
  if (i < 0 || j <= i) return null;
  try { return JSON.parse(t.slice(i, j + 1)) as T; } catch { return null; }
}

async function withRetry(f: () => Promise<Response>): Promise<Response> {
  let res = await f();
  for (let n = 1; n <= 2 && (res.status === 429 || res.status >= 500); n++) {
    await new Promise(r => setTimeout(r, 4000 * n));
    res = await f();
  }
  return res;
}

export function liveModels(): Models | null {
  const claudeKey = env("ANTHROPIC_API_KEY");
  const geminiKey = env("GEMINI_API_KEY");
  if (!claudeKey && !geminiKey) return null;
  const usage = { calls: 0, inTokens: 0, outTokens: 0 };

  if (claudeKey) {
    const names: Record<Tier, string> = {
      writer: env("NEWSROOM_CLAUDE_WRITER") || env("CLAUDE_MODEL") || "claude-sonnet-5-5",
      checker: env("NEWSROOM_CLAUDE_CHECKER") || "claude-haiku-4-5-20251001",
    };
    return {
      provider: "claude",
      usage,
      model: t => names[t],
      async json<T>(role: RoleName, tier: Tier, system: string, user: string, _ctx: CallCtx, maxTokens = 4000) {
        try {
          const res = await withRetry(() => fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "x-api-key": claudeKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
            body: JSON.stringify({ model: names[tier], max_tokens: maxTokens, temperature: 0.3, system: `${system}\n\nReply with JSON only. No prose, no code fences.`, messages: [{ role: "user", content: user }] }),
            signal: AbortSignal.timeout(150_000),
          }));
          usage.calls++;
          if (!res.ok) { console.warn(`[${role}] Claude HTTP ${res.status}`); return null; }
          const body = (await res.json()) as { content?: { type: string; text?: string }[]; stop_reason?: string; usage?: { input_tokens?: number; output_tokens?: number } };
          usage.inTokens += body.usage?.input_tokens ?? 0;
          usage.outTokens += body.usage?.output_tokens ?? 0;
          if (body.stop_reason === "refusal") return null;
          return parseJson<T>((body.content ?? []).filter(b => b.type === "text").map(b => b.text ?? "").join(""));
        } catch (e) {
          console.warn(`[${role}] Claude call failed: ${(e as Error).message}`);
          return null;
        }
      },
    };
  }

  const names: Record<Tier, string> = {
    writer: env("NEWSROOM_GEMINI_WRITER") || "gemini-2.5-pro",
    checker: env("NEWSROOM_GEMINI_CHECKER") || "gemini-2.5-flash",
  };
  return {
    provider: "gemini",
    usage,
    model: t => names[t],
    async json<T>(role: RoleName, tier: Tier, system: string, user: string, _ctx: CallCtx, maxTokens = 8192) {
      try {
        const res = await withRetry(() => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${names[tier]}:generateContent`, {
          method: "POST",
          headers: { "x-goog-api-key": geminiKey, "content-type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `${system}\n\nReply with JSON only.` }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            // 2.5 models think before answering; the budget leaves room for both.
            generationConfig: { maxOutputTokens: Math.max(maxTokens, 8192) * 2, temperature: 0.3, responseMimeType: "application/json" },
          }),
          signal: AbortSignal.timeout(180_000),
        }));
        usage.calls++;
        if (!res.ok) { console.warn(`[${role}] Gemini HTTP ${res.status}`); return null; }
        const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number } };
        usage.inTokens += body.usageMetadata?.promptTokenCount ?? 0;
        usage.outTokens += (body.usageMetadata?.candidatesTokenCount ?? 0) + (body.usageMetadata?.thoughtsTokenCount ?? 0);
        const c = body.candidates?.[0];
        if (!c || c.finishReason === "SAFETY") return null;
        return parseJson<T>((c.content?.parts ?? []).filter(p => !p.thought).map(p => p.text ?? "").join(""));
      } catch (e) {
        console.warn(`[${role}] Gemini call failed: ${(e as Error).message}`);
        return null;
      }
    },
  };
}

/** Dry run: answers come from fixtures, keyed by event id, role and attempt. */
export function cannedModels(answers: Record<string, Partial<Record<RoleName, unknown[]>>>): Models {
  const usage = { calls: 0, inTokens: 0, outTokens: 0 };
  return {
    provider: "canned",
    usage,
    model: t => (t === "writer" ? "canned-writer" : "canned-checker"),
    async json<T>(role: RoleName, _tier: Tier, _system: string, user: string, ctx: CallCtx) {
      usage.calls++;
      usage.inTokens += Math.round(user.length / 4);
      const list = answers[ctx.id]?.[role] ?? [];
      const a = list[Math.min(ctx.attempt, list.length - 1)];
      if (a === undefined) return null;
      usage.outTokens += Math.round(JSON.stringify(a).length / 4);
      return structuredClone(a) as T;
    },
  };
}

/**
 * Optional cover illustration (GEMINI_IMAGE_MODEL): abstract shapes only.
 * Never people, faces, logos, text, or anything that could pass for a news photo.
 */
export async function illustrate(apiKey: string, model: string, prompt: string, out: string): Promise<boolean> {
  const full = `Abstract editorial illustration for a technology news article: ${prompt}. Flat geometric shapes and lines, deep teal (#0b2a2f) and signal yellow (#f5c400) with one muted accent, high contrast, wide 16:9 composition, generous empty space. No people, no faces, no hands, no figures, no logos, no brand marks, no text or letters, not photographic.`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: full }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) { console.warn(`[designer] image HTTP ${res.status}`); return false; }
    const body = (await res.json()) as { candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[] };
    const data = body.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)?.inlineData?.data;
    if (!data) return false;
    await writeFile(out, Buffer.from(data, "base64"));
    return true;
  } catch (e) {
    console.warn("[designer] image failed:", (e as Error).message);
    return false;
  }
}
