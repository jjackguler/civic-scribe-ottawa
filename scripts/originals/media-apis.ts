/**
 * Voice (ElevenLabs), optional illustrations (Gemini) and upload (YouTube).
 * Plain fetch, no SDKs. Keys come from GitHub Actions secrets.
 */
import { writeFile } from "node:fs/promises";

// ── ElevenLabs ──────────────────────────────────────────────────────────────
const PREFERRED_VOICES = ["George", "Brian", "Daniel", "Adam", "Matilda", "Rachel"];

export async function pickVoice(apiKey: string, wanted?: string): Promise<{ id: string; name: string }> {
  if (wanted) return { id: wanted, name: "custom" };
  const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": apiKey } });
  if (!res.ok) throw new Error(`ElevenLabs voices HTTP ${res.status}`);
  const { voices } = await res.json() as { voices: { voice_id: string; name: string; category?: string }[] };
  // Only the platform's own stock voices: never a cloned voice of a real person.
  const stock = voices.filter(v => v.category === "premade");
  const pick = PREFERRED_VOICES.map(n => stock.find(v => v.name.startsWith(n))).find(Boolean) ?? stock[0];
  if (!pick) throw new Error("No stock (premade) ElevenLabs voice available");
  return { id: pick.voice_id, name: pick.name };
}

export async function speak(apiKey: string, voiceId: string, text: string, out: string, model = "eleven_multilingual_v2") {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true } }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
}

// ── Gemini illustrations (optional) ─────────────────────────────────────────
export async function illustrate(apiKey: string, prompt: string, out: string, model: string): Promise<boolean> {
  const full = `Abstract editorial illustration for a news explainer about technology: ${prompt}. Bold flat shapes, black and signal-yellow palette with one accent, high contrast, vertical 9:16 composition. No people, no faces, no logos, no brand marks, no text or letters.`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: full }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) { console.warn(`[gemini] HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`); return false; }
    const body = await res.json() as { candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[] };
    const data = body.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data)?.inlineData?.data;
    if (!data) return false;
    await writeFile(out, Buffer.from(data, "base64"));
    return true;
  } catch (e) {
    console.warn("[gemini]", (e as Error).message);
    return false;
  }
}

// ── YouTube upload (optional) ───────────────────────────────────────────────
export type YouTubeCreds = { clientId: string; clientSecret: string; refreshToken: string };

async function accessToken(c: YouTubeCreds): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: c.clientId, client_secret: c.clientSecret, refresh_token: c.refreshToken, grant_type: "refresh_token" }),
  });
  if (!res.ok) throw new Error(`Google token HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function uploadToYouTube(c: YouTubeCreds, file: Buffer, meta: { title: string; description: string; tags: string[]; privacy: "public" | "unlisted" | "private" }): Promise<{ id: string; privacy: "public" | "unlisted" | "private" }> {
  const token = await accessToken(c);
  const begin = (declareSynthetic: boolean) => fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=UTF-8",
      "x-upload-content-type": "video/mp4",
      "x-upload-content-length": String(file.length),
    },
    body: JSON.stringify({
      snippet: { title: meta.title.slice(0, 100), description: meta.description.slice(0, 4900), tags: meta.tags.slice(0, 15), categoryId: "28", defaultLanguage: "en", defaultAudioLanguage: "en" },
      // Synthetic voice and illustrations are declared, as YouTube asks for altered or synthetic content.
      status: { privacyStatus: meta.privacy, selfDeclaredMadeForKids: false, ...(declareSynthetic ? { containsSyntheticMedia: true } : {}) },
    }),
  });
  let init = await begin(true);
  if (init.status === 400) init = await begin(false); // older API surface without the field; the description still discloses it
  if (!init.ok) throw new Error(`YouTube init HTTP ${init.status}: ${(await init.text()).slice(0, 300)}`);
  const url = init.headers.get("location");
  if (!url) throw new Error("YouTube: no upload URL");
  const put = await fetch(url, { method: "PUT", headers: { "content-type": "video/mp4" }, body: file });
  if (!put.ok) throw new Error(`YouTube upload HTTP ${put.status}: ${(await put.text()).slice(0, 300)}`);
  const v = (await put.json()) as { id: string; status?: { privacyStatus?: "public" | "unlisted" | "private" } };
  // Unaudited API projects get their uploads locked to private; report what YouTube actually set.
  return { id: v.id, privacy: v.status?.privacyStatus ?? meta.privacy };
}
