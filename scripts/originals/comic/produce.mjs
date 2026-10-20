// Motion comic (16:9), forked from ../noir/produce.mjs: ElevenLabs narration per shot with
// word timings, sound effects, an ambience bed and a score, then timeline.json for comic.html.
// Panels are drawn in code (comic-scenes.js); no image model is called.
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
await mkdir(join(dir, "vo"), { recursive: true });
await mkdir(join(dir, "sfx"), { recursive: true });

const XI = process.env.ELEVENLABS_API_KEY?.trim();
if (!mock && !XI) { console.error("ELEVENLABS_API_KEY is needed (or pass --mock)"); process.exit(1); }
const IMAGE_MODELS = (process.env.NOIR_IMAGE_MODELS || "gemini-3-pro-image-preview,gemini-2.5-flash-image").split(",").map((s) => s.trim()).filter(Boolean);
const VOICES = (process.env.NOIR_VOICES || (story.voices ?? ["Brian", "George", "Bill", "Daniel"]).join(",")).split(",");
const VO_MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

const probe = async (f) => Number((await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f])).stdout.trim());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

let stockVoices;
async function stock() {
  if (stockVoices) return stockVoices;
  const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": XI } });
  stockVoices = res.ok ? (await res.json()).voices.filter((v) => v.category === "premade") : []; // stock voices only, never a clone of a real person
  return stockVoices;
}
async function voice(names = VOICES) {
  const wanted = story.voices ? "" : process.env.NOIR_VOICE_ID?.trim(); // a story that names its voices keeps them
  if (wanted && names === VOICES) return { id: wanted, name: "custom" };
  const list = await stock();
  if (!list.length) return { id: "nPczCjzI2devNBz1zQrb", name: "Brian" };
  return names.map((n) => list.find((v) => v.name.startsWith(n))).find(Boolean) ?? list[0];
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

// ── Dialogue ────────────────────────────────────────────────────────────────
// shot.lines: [{ id, who, text, gap }], spoken after the narration by a stock voice per character
// (story.cast: { who: [voice names] }). Only words on the record: quotes from filings and interviews.
const cast = {};
for (const shot of story.shots) for (const l of shot.lines ?? []) {
  const mp3 = join(dir, "vo", `${shot.id}-${l.id}.mp3`);
  if (existsSync(mp3)) continue;
  if (mock) { await silent(Math.max(1, l.text.split(/\s+/).length * 0.4), mp3); continue; }
  const who = cast[l.who] ??= await voice([].concat(story.cast?.[l.who] ?? "Bill"));
  const res = await xi(`/v1/text-to-speech/${who.voice_id ?? who.id}?output_format=mp3_44100_128`, {
    text: l.text, model_id: VO_MODEL,
    voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true, speed: l.speed ?? 0.95 },
  });
  await writeFile(mp3, Buffer.from(await res.arrayBuffer()));
  console.log(`line ${shot.id}-${l.id} (${who.name})`);
}

// ── Timeline ────────────────────────────────────────────────────────────────
const END = story.endCard ?? 7.0, shots = [];
let t = 0;
for (const [i, shot] of story.shots.entries()) {
  const vo = await probe(join(dir, "vo", `${shot.id}.mp3`));
  const lead = shot.lead ?? (i === 0 ? 1.8 : 0.35), tail = shot.hold ?? (i === story.shots.length - 1 ? 2.2 : 0.45);
  const ws = JSON.parse(await readFile(join(dir, "vo", `${shot.id}.json`), "utf8"));
  let at = lead + vo; const lines = [];
  for (const l of shot.lines ?? []) { at += l.gap ?? 0.45; const d = await probe(join(dir, "vo", `${shot.id}-${l.id}.mp3`)); lines.push({ id: l.id, who: l.who, at: +at.toFixed(3), dur: +d.toFixed(3) }); at += d; }
  shots.push({ id: shot.id, start: +t.toFixed(3), dur: +(at + tail).toFixed(3), voAt: lead, vo: +vo.toFixed(3), words: ws, lines });
  t += at + tail;
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
if (!existsSync(mus) && story.musicFrom && existsSync(join(here, "build", story.musicFrom, "music.mp3"))) { await writeFile(mus, await readFile(join(here, "build", story.musicFrom, "music.mp3"))); credits.music = "ElevenLabs Music"; } // reuse a series track
if (!existsSync(mus)) { if (mock) { await silent(Math.ceil(total + 1), mus); credits.music = "mock"; } else credits.music = await music(Math.ceil(total + 1), mus); }

const prev = existsSync(join(dir, "timeline.json")) ? JSON.parse(await readFile(join(dir, "timeline.json"), "utf8")) : {};
await writeFile(join(dir, "timeline.json"), JSON.stringify({
  slug, total, end: { start: +t.toFixed(3), dur: END }, shots,
  credits: {
    images: story.aiImages ? "Google Flow (Nano Banana Pro)" : "",
    voice: credits.voice || prev.credits?.voice || "",
    music: credits.music || prev.credits?.music || "",
  },
}, null, 1));
console.log(`timeline: ${total.toFixed(1)} s, ${shots.length} shots`);
