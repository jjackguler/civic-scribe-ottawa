import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * POST /api/public/traffic-radio
 *
 * Generates an Ottawa traffic radio bulletin audio file using ElevenLabs.
 *
 * - Voice style: calm Ottawa local radio announcer (e.g. Daniel — onwK4e9ZLuTAKqWW03F9).
 * - The ELEVENLABS_API_KEY is read ONLY on the server. Never expose to the frontend.
 * - When the key is not configured, this returns JSON `{ ok: true, mock: true, script }` so the
 *   client can still display the bulletin script and a visual "on air" state without audio.
 */
const Body = z.object({
  script: z.string().min(1).max(4000),
  locale: z.enum(["en", "fr"]).default("en"),
});

export const Route = createFileRoute("/api/public/traffic-radio")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch {
          return new Response(JSON.stringify({ error: "Invalid body" }), {
            status: 400, headers: { "Content-Type": "application/json" },
          });
        }
        const { script, locale } = parsed;
        const apiKey = process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
          return new Response(JSON.stringify({ ok: true, mock: true, locale, script }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          });
        }

        // Calm Ottawa local announcer — Daniel
        const voiceId = "onwK4e9ZLuTAKqWW03F9";

        try {
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
            {
              method: "POST",
              headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: script,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                  stability: 0.7,
                  similarity_boost: 0.8,
                  style: 0.25,
                  use_speaker_boost: true,
                  speed: 0.95,
                },
              }),
            }
          );
          if (!res.ok) {
            const err = await res.text();
            return new Response(JSON.stringify({ ok: false, error: err.slice(0, 500) }), {
              status: 502, headers: { "Content-Type": "application/json" },
            });
          }
          const audio = await res.arrayBuffer();
          return new Response(audio, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "no-store",
            },
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: "TTS upstream failure" }), {
            status: 502, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
