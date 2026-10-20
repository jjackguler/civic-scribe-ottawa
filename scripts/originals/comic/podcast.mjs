// After the Headline: a two-host podcast from a script (podcasts/<slug>.json), voiced with
// ElevenLabs stock voices, with a theme and a bed, mixed to -16 LUFS stereo MP3.
//   ELEVENLABS_API_KEY=… node podcast.mjs <slug>          → out/<slug>.mp3 (+ chapters json)
//   node podcast.mjs <slug> --mock                          → silent placeholder lines
// Lines already in build/podcast-<slug>/ are kept, so a re-run only pays for what changed.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { join } from "node:path";

const run = promisify(execFile);
const here = import.meta.dirname;
const [slug, flag] = process.argv.slice(2);
const mock = flag === "--mock";
const ep = JSON.parse(await readFile(join(here, "podcasts", `${slug}.json`), "utf8"));
const dir = join(here, "build", `podcast-${slug}`);
await mkdir(join(dir, "lines"), { recursive: true });
await mkdir(join(here, "out"), { recursive: true });
const XI = process.env.ELEVENLABS_API_KEY?.trim();
if (!mock && !XI) { console.error("ELEVENLABS_API_KEY is needed (or --mock)"); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const probe = async (f) => Number((await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f])).stdout.trim());
const ff = (args) => run("ffmpeg", ["-y", "-loglevel", "error", ...args], { maxBuffer: 1 << 26 });

async function xi(path, body, accept = "audio/mpeg") {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io${path}`, { method: "POST", headers: { "xi-api-key": XI, "content-type": "application/json", accept }, body: JSON.stringify(body), signal: AbortSignal.timeout(240_000) });
    if (res.ok) return res;
    const err = (await res.text()).replace(/\s+/g, " ").slice(0, 240);
    if (res.status >= 500 || res.status === 429) { console.warn(`[elevenlabs] ${res.status}, retrying`); await sleep(5000 * (attempt + 1)); continue; }
    throw new Error(`ElevenLabs ${path} HTTP ${res.status}: ${err}`);
  }
  throw new Error("ElevenLabs: gave up");
}

// Stock voices only (never a clone of a real person), picked by name.
const voices = {};
if (!mock) {
  const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": XI } });
  const stock = res.ok ? (await res.json()).voices.filter((v) => v.category === "premade") : [];
  for (const [k, h] of Object.entries(ep.hosts)) {
    const v = h.voices.map((n) => stock.find((s) => s.name.startsWith(n))).find(Boolean);
    voices[k] = v ? { id: v.voice_id, name: v.name } : { id: k === "A" ? "nPczCjzI2devNBz1zQrb" : "Xb7hH8MSUJpSbSDYk0k2", name: k === "A" ? "Brian" : "Alice" };
  }
  console.log("voices", JSON.stringify(voices));
}

const files = [];
for (const [i, [who, text]] of ep.lines.entries()) {
  const key = createHash("sha1").update(`${who}|${text}|${voices[who]?.id ?? ""}`).digest("hex").slice(0, 10);
  const f = join(dir, "lines", `${String(i).padStart(3, "0")}-${key}.mp3`);
  if (!existsSync(f)) {
    if (mock) await ff(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(Math.max(1, text.split(/\s+/).length * 0.36)), "-c:a", "libmp3lame", "-q:a", "6", f]);
    else {
      const res = await xi(`/v1/text-to-speech/${voices[who].id}?output_format=mp3_44100_128`, {
        text, model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
        previous_text: ep.lines[i - 1]?.[1], next_text: ep.lines[i + 1]?.[1],
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: who === "A" ? 0.95 : 1.0 },
      });
      await writeFile(f, Buffer.from(await res.arrayBuffer()));
      console.log(`line ${i} ${who}`);
    }
  }
  files.push({ f, who, dur: await probe(f) });
}

// Theme: generated once per show and reused by every episode.
const theme = join(here, "build", `podcast-theme-${createHash("sha1").update(ep.music).digest("hex").slice(0, 8)}.mp3`);
if (!existsSync(theme)) {
  if (mock) await ff(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", "60", "-c:a", "libmp3lame", theme]);
  else {
    try {
      const res = await xi("/v1/music", { prompt: ep.music, music_length_ms: 60_000, model_id: "music_v1", force_instrumental: true });
      await writeFile(theme, Buffer.from(await res.arrayBuffer()));
    } catch (e) {
      console.warn(`[music] ${e.message}; using a sound-generation bed`);
      const res = await xi("/v1/sound-generation", { text: `${ep.music} Seamless loop.`, duration_seconds: 22, prompt_influence: 0.5 });
      await writeFile(theme, Buffer.from(await res.arrayBuffer()));
    }
  }
}

// Timeline: 7 s theme, the conversation (short gaps, a touch longer when the speaker changes), 9 s outro.
const INTRO = 7, OUTRO = 9;
let t = INTRO; const chapters = [];
const parts = files.map((x, i) => { const gap = i && files[i - 1].who !== x.who ? 0.32 : 0.18; t += gap; const at = t; t += x.dur; return { ...x, at }; });
const total = t + OUTRO;
const inputs = [], chains = [];
parts.forEach((p, i) => { inputs.push("-i", p.f); chains.push(`[${i}]adelay=${Math.round(p.at * 1000)}:all=1[v${i}]`); });
const m = parts.length;
inputs.push("-stream_loop", "-1", "-i", theme);
chains.push(`${parts.map((_, i) => `[v${i}]`).join("")}amix=inputs=${m}:normalize=0,asplit=2[vo][key]`);
// Theme full at the top, ducked under the voices, back up at the end.
chains.push(`[${m}]atrim=0:${total.toFixed(2)},volume='if(lt(t,${INTRO - 1}),1,if(gt(t,${(total - OUTRO + 0.5).toFixed(2)}),1,0.16))':eval=frame,afade=t=in:d=1.5,afade=t=out:st=${(total - 4).toFixed(2)}:d=4[bed0]`);
chains.push(`[bed0][key]sidechaincompress=threshold=0.03:ratio=4:attack=40:release=500[bed]`);
chains.push(`[vo][bed]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=44100[a]`);
const out = join(here, "out", `${slug}.mp3`);
await ff([...inputs, "-filter_complex", chains.join(";"), "-map", "[a]", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "160k", "-t", total.toFixed(2),
  "-metadata", `title=${ep.title}`, "-metadata", `album=${ep.show}`, "-metadata", "artist=AI Broadsheet", "-metadata", `track=${ep.episode}`, out]);
await writeFile(join(here, "out", `${slug}.json`), JSON.stringify({ slug, title: ep.title, show: ep.show, episode: ep.episode, durationSec: Math.round(total), voices, transcript: ep.lines.map(([w, x]) => `${ep.hosts[w].name}: ${x}`).join("\n") }, null, 1));
console.log(out, `${Math.round(total)} s`);
