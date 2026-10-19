// Generates everything a noir reel needs into build/<slug>/: one Gemini still per shot,
// ElevenLabs narration (per shot, with word timings), sound effects, a rain bed and a
// music bed, then writes timeline.json for reel.html / render.mjs.
//   GEMINI_API_KEY=… ELEVENLABS_API_KEY=… node produce.mjs <slug>
//   node produce.mjs <slug> --mock     placeholder stills and silent audio, no API calls
// Files already in build/<slug>/ are kept, so a re-run only pays for what is missing.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const run = promisify(execFile);
const here = import.meta.dirname;
const [slug, flag] = process.argv.slice(2);
if (!slug) { console.error("usage: node produce.mjs <slug> [--mock]"); process.exit(1); }
const mock = flag === "--mock";
const story = JSON.parse(await readFile(join(here, "stories", `${slug}.json`), "utf8"));
const dir = join(here, "build", slug);
await mkdir(join(dir, "img"), { recursive: true });
await mkdir(join(dir, "vo"), { recursive: true });
await mkdir(join(dir, "sfx"), { recursive: true });

const GEMINI = process.env.GEMINI_API_KEY?.trim(), XI = process.env.ELEVENLABS_API_KEY?.trim();
if (!mock && (!GEMINI || !XI)) { console.error("GEMINI_API_KEY and ELEVENLABS_API_KEY are needed (or pass --mock)"); process.exit(1); }
const IMAGE_MODELS = (process.env.NOIR_IMAGE_MODELS || "gemini-3-pro-image-preview,gemini-2.5-flash-image").split(",").map((s) => s.trim()).filter(Boolean);
const VOICES = (process.env.NOIR_VOICES || "Brian,George,Bill,Daniel").split(",");
const VO_MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

const probe = async (f) => Number((await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f])).stdout.trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Gemini stills ───────────────────────────────────────────────────────────
async function still(prompt, out) {
  const text = `${prompt}\n\nStyle: ${story.style}`;
  for (const model of IMAGE_MODELS) {
    for (const imageConfig of [{ aspectRatio: "9:16", imageSize: "2K" }, { aspectRatio: "9:16" }]) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "x-goog-api-key": GEMINI, "content-type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig } }),
          signal: AbortSignal.timeout(180_000),
        }).catch((e) => ({ ok: false, status: 0, text: async () => e.message }));
        if (res.ok) {
          const body = await res.json();
          const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
          if (part) { await writeFile(out, Buffer.from(part.inlineData.data, "base64")); return model; }
          console.warn(`[gemini] ${model}: no image (${body.candidates?.[0]?.finishReason ?? "?"})`);
          break;
        }
        const err = (await res.text()).replace(/\s+/g, " ").slice(0, 200);
        console.warn(`[gemini] ${model} ${JSON.stringify(imageConfig)} HTTP ${res.status}: ${err}`);
        if (res.status === 429 || res.status >= 500 || res.status === 0) { await sleep(8000 * (attempt + 1)); continue; }
        break; // 400/404: try the next config or model
      }
    }
  }
  throw new Error(`no still for: ${prompt.slice(0, 60)}`);
}

// ── ElevenLabs ──────────────────────────────────────────────────────────────
async function xi(path, body, accept = "audio/mpeg") {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io${path}`, {
      method: "POST", headers: { "xi-api-key": XI, "content-type": "application/json", accept },
      body: JSON.stringify(body), signal: AbortSignal.timeout(240_000),
    });
    if (res.ok) return res;
    const err = (await res.text()).replace(/\s+/g, " ").slice(0, 240);
    if (res.status >= 500 || res.status === 429) { console.warn(`[elevenlabs] ${path} HTTP ${res.status}, retrying`); await sleep(5000 * (attempt + 1)); continue; }
    throw new Error(`ElevenLabs ${path} HTTP ${res.status}: ${err}`);
  }
  throw new Error(`ElevenLabs ${path}: gave up`);
}

async function voice() {
  const wanted = process.env.NOIR_VOICE_ID?.trim();
  if (wanted) return { id: wanted, name: "custom" };
  const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": XI } });
  if (!res.ok) return { id: "nPczCjzI2devNBz1zQrb", name: "Brian" };
  const { voices } = await res.json();
  const stock = voices.filter((v) => v.category === "premade"); // stock voices only, never a clone of a real person
  return VOICES.map((n) => stock.find((v) => v.name.startsWith(n))).find(Boolean) ?? stock[0];
}

function words(alignment) {
  const out = [];
  if (!alignment) return out;
  const { characters: ch, character_start_times_seconds: s, character_end_times_seconds: e } = alignment;
  let cur = null;
  for (let i = 0; i < ch.length; i++) {
    if (/\s/.test(ch[i])) { if (cur) out.push(cur); cur = null; continue; }
    if (!cur) cur = { w: "", start: s[i], end: e[i] };
    cur.w += ch[i]; cur.end = e[i];
  }
  if (cur) out.push(cur);
  return out;
}

async function sfx(prompt, seconds, out) {
  const res = await xi("/v1/sound-generation", { text: prompt, duration_seconds: Math.min(22, Math.max(0.6, seconds)), prompt_influence: 0.55 });
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
}

async function music(seconds, out) {
  try {
    const res = await xi("/v1/music", { prompt: story.music, music_length_ms: Math.round(seconds * 1000), model_id: "music_v1", force_instrumental: true });
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    return "ElevenLabs Music";
  } catch (e) {
    console.warn(`[music] ${e.message}; falling back to a looped sound-generation bed`);
    await sfx(`${story.music} Seamless loop.`, 22, out);
    return "ElevenLabs Sound Effects (loop)";
  }
}

const silent = (sec, out) => run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(sec), "-c:a", "libmp3lame", "-q:a", "6", out]);

const credits = { images: new Set(), voice: "", music: "" };

// ── Narration ───────────────────────────────────────────────────────────────
const v = mock ? { id: "", name: "mock" } : await voice();
credits.voice = v.name;
for (const [i, shot] of story.shots.entries()) {
  const mp3 = join(dir, "vo", `${shot.id}.mp3`), js = join(dir, "vo", `${shot.id}.json`);
  if (existsSync(mp3) && existsSync(js)) continue;
  if (mock) {
    const n = shot.say.split(/\s+/), per = 0.42;
    await silent(n.length * per, mp3);
    await writeFile(js, JSON.stringify(n.map((w, k) => ({ w, start: k * per, end: k * per + per * 0.8 }))));
    continue;
  }
  const res = await xi(`/v1/text-to-speech/${v.voice_id ?? v.id}/with-timestamps?output_format=mp3_44100_128`, {
    text: shot.say, model_id: VO_MODEL,
    previous_text: story.shots[i - 1]?.say, next_text: story.shots[i + 1]?.say,
    voice_settings: { stability: 0.42, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 0.92 },
  }, "application/json");
  const body = await res.json();
  await writeFile(mp3, Buffer.from(body.audio_base64, "base64"));
  await writeFile(js, JSON.stringify(words(body.alignment ?? body.normalized_alignment)));
  console.log(`voice ${shot.id}`);
}

// ── Timeline ────────────────────────────────────────────────────────────────
const END = 4.0, shots = [];
let t = 0;
for (const [i, shot] of story.shots.entries()) {
  const vo = await probe(join(dir, "vo", `${shot.id}.mp3`));
  const lead = i === 0 ? 1.8 : 0.35, tail = i === story.shots.length - 1 ? 2.2 : 0.45;
  const ws = JSON.parse(await readFile(join(dir, "vo", `${shot.id}.json`), "utf8"));
  shots.push({ id: shot.id, start: +t.toFixed(3), dur: +(lead + vo + tail).toFixed(3), voAt: lead, vo: +vo.toFixed(3), words: ws });
  t += lead + vo + tail;
}
const total = +(t + END).toFixed(3);

// ── Sound ───────────────────────────────────────────────────────────────────
for (const shot of story.shots) for (const s of shot.sfx ?? []) {
  const out = join(dir, "sfx", `${s.id}.mp3`);
  if (existsSync(out)) continue;
  if (mock) await silent(s.dur, out); else { await sfx(s.prompt, s.dur, out); console.log(`sfx ${s.id}`); }
}
const amb = join(dir, "sfx", "_ambience.mp3");
if (!existsSync(amb)) { if (mock) await silent(22, amb); else await sfx(story.ambience, 22, amb); }
const mus = join(dir, "music.mp3");
if (!existsSync(mus)) { if (mock) { await silent(Math.ceil(total + 1), mus); credits.music = "mock"; } else credits.music = await music(Math.ceil(total + 1), mus); }

const missing = [];
// ── Stills (last, so narration and sound are kept even if the image quota runs out) ──────────────────────────────────────────────────────────────────
for (const [i, shot] of story.shots.entries()) {
  const out = join(dir, "img", `${shot.id}.png`);
  if (existsSync(out)) continue;
  if (mock) {
    const hue = (i * 37) % 360;
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", `gradients=s=1080x1920:c0=0x0b1726:c1=0x${hue < 180 ? "c8902a" : "8a2a1c"}:x0=540:y0=300:x1=540:y1=1900:d=1`, "-frames:v", "1", out]);
  } else {
    if (missing.length) { missing.push(shot.id); continue; } // one failure is usually the quota: don't burn time on the rest
    try { credits.images.add(await still(shot.image, out)); console.log(`still ${shot.id}`); }
    catch (e) { missing.push(shot.id); console.error(e.message); }
  }
}

const prev = existsSync(join(dir, "timeline.json")) ? JSON.parse(await readFile(join(dir, "timeline.json"), "utf8")) : {};
await writeFile(join(dir, "timeline.json"), JSON.stringify({
  slug, total, end: { start: +t.toFixed(3), dur: END }, shots,
  credits: {
    images: credits.images.size ? [...credits.images].join(", ") : prev.credits?.images ?? "",
    voice: credits.voice || prev.credits?.voice || "",
    music: credits.music || prev.credits?.music || "",
  },
}, null, 1));
console.log(`timeline: ${total.toFixed(1)} s, ${shots.length} shots`);
if (missing.length) { console.log(`::error title=Gemini stills::No still for ${missing.join(", ")} (see the log above); narration and sound are saved.`); process.exit(1); }
