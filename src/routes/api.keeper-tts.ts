import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/keeper-tts — the Keeper's premium voice (ElevenLabs).
 * Reads only the Keeper's own signed replies or our fixed tour lines, with a
 * per-visitor limit and a daily character cap. Any refusal is a plain status
 * code; the browser then falls back to its own speech voice.
 */

const DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb"; // ElevenLabs premade voice: calm, warm narrator
const MAX_TEXT = 900;

const no = (status: number) => new Response(null, { status, headers: { "cache-control": "no-store" } });

export const Route = createFileRoute("/api/keeper-tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["ELEVENLABS_API_KEY"];
        if (!key) return no(404);
        let body: { text?: unknown; sig?: unknown; lang?: unknown };
        try { body = await request.json(); } catch { return no(400); }
        const text = typeof body.text === "string" ? body.text.trim() : "";
        const sig = typeof body.sig === "string" ? body.sig : undefined;
        const lang = body.lang === "fr" ? "fr" : "en";
        if (!text || text.length > MAX_TEXT) return no(400);

        const k = await import("@/lib/keeper.server");
        if (!(await k.lineAllowed(text, sig))) return no(403);
        const ip = k.clientIp();
        if (!k.allow(`tts:${ip}`, 20, 10 * 60_000)) return no(429);
        if (!k.takeTtsBudget(text.length)) return no(429);

        const voice = process.env["ELEVENLABS_VOICE_ID"] || DEFAULT_VOICE;
        const model = process.env["ELEVENLABS_MODEL_ID"] || "eleven_flash_v2_5";
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15_000);
        try {
          const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`, {
            method: "POST",
            signal: ctrl.signal,
            headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
            body: JSON.stringify({
              text,
              model_id: model,
              ...(/_v2_5$/.test(model) ? { language_code: lang } : {}),
              voice_settings: { stability: 0.55, similarity_boost: 0.75 },
            }),
          });
          if (!res.ok || !res.body) { console.warn(`[keeper] tts HTTP ${res.status}`); return no(502); }
          return new Response(res.body, {
            headers: { "content-type": "audio/mpeg", "cache-control": "private, max-age=3600" },
          });
        } catch (e) {
          console.warn("[keeper] tts failed:", (e as Error).message);
          return no(502);
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
