import { SkipRun, limitError } from "./util";

export type WriterKeys = { anthropic?: string; gemini?: string; claudeModel: string; geminiModel: string };

/** One bounded request per draft. No cross-provider or model escalation on billing errors. */
export async function requestWriter(system: string, user: string, keys: WriterKeys, maxTokens = 6000, transport: typeof fetch = fetch): Promise<{ text: string; model: string }> {
  const claude = !!keys.anthropic;
  const model = claude ? keys.claudeModel : keys.geminiModel;
  const service = claude ? "Claude" : "Gemini";
  if (!keys.anthropic && !keys.gemini) throw new SkipRun("No writer key", "Configure GEMINI_API_KEY or ANTHROPIC_API_KEY.");
  let res: Response;
  try {
    res = await transport(claude ? "https://api.anthropic.com/v1/messages" : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: claude ? { "x-api-key": keys.anthropic!, "anthropic-version": "2023-06-01", "content-type": "application/json" } : { "x-goog-api-key": keys.gemini!, "content-type": "application/json" },
      body: JSON.stringify(claude ? { model, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] } : {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: maxTokens + 1024, temperature: 0.4, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    throw new SkipRun(`${service} unavailable`, "Request failed or timed out; usage may have been billed. No automatic model switch or retry. The story stays queued.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw limitError(service, res.status, body) ?? new SkipRun(`${service} unavailable`, `${service} HTTP ${res.status}. Check the configured model and provider status; the story stays queued.`);
  }
  let body: any;
  try { body = await res.json(); } catch { throw new SkipRun(`${service} invalid response`, "The provider response could not be read. No additional paid request was sent."); }
  if (claude) {
    if (body.stop_reason === "max_tokens") throw new SkipRun("Truncated storyboard", "Claude exhausted its output limit. Review the prompt and token limit before retrying.");
    return { model, text: (body.content ?? []).filter((p: any) => p.type === "text").map((p: any) => p.text ?? "").join("") };
  }
  const candidate = body.candidates?.[0];
  if (!candidate || candidate.finishReason !== "STOP") throw new SkipRun("Incomplete storyboard", `Gemini did not return a complete answer (${candidate?.finishReason ?? "empty"}). No draft was published.`);
  return { model, text: (candidate.content?.parts ?? []).filter((p: any) => !p.thought).map((p: any) => p.text ?? "").join("") };
}
