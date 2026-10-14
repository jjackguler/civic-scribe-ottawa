// Renders a zine reel (boards/<slug>.json) to out/<slug>.mp4, 1080x1920 at 30 fps, with sound.
//   cd scripts/originals/zine && npm i && node render.mjs <slug> [--stills 2,9,20]
// Inputs it looks for, beside the board:
//   .assets/                 archive photos, CC0 music and sounds (from the `assets` branch)
//   voice/<slug>/voice.wav   + timing.json from ElevenLabs (narrate.ts); without them the
//                            timing is estimated and the video has music and sounds only
//   music/<slug>.mp3         the owner's own track (e.g. Suno), with music/<slug>.txt holding
//                            its credit line; without it the board's CC0 track is used
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const here = import.meta.dirname, root = resolve(here, "..");
const [slug, flag, list] = process.argv.slice(2);
if (!slug) { console.error("usage: node render.mjs <slug> [--stills t1,t2]"); process.exit(1); }
const out = join(here, "out"); await mkdir(out, { recursive: true });
const board = JSON.parse(await readFile(join(here, "boards", `${slug}.json`), "utf8"));
const voiceDir = join(here, "voice", slug), hasVoice = existsSync(join(voiceDir, "voice.wav")) && existsSync(join(voiceDir, "timing.json"));
const timing = hasVoice ? JSON.parse(await readFile(join(voiceDir, "timing.json"), "utf8")) : null;
const own = join(here, "music", `${slug}.mp3`), musicFile = existsSync(own) ? own : join(here, ".assets", board.music);
let credit;
if (existsSync(own)) credit = existsSync(join(here, "music", `${slug}.txt`)) ? (await readFile(join(here, "music", `${slug}.txt`), "utf8")).trim() : "owner's track";
else { const c = JSON.parse(await readFile(join(here, ".assets", "credits-sfx2.json"), "utf8")); const m = c.find((x) => x.file.endsWith(board.music));
  const dec = (s) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&"); credit = m ? `“${dec(m.title).replace(/\.(wav|mp3)$/i, "")}” by ${m.author}; sounds: Freesound (CC0)` : "CC0, via Freesound"; }

const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png" };
const server = createServer(async (req, res) => {
  const path = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(root)) return res.writeHead(403).end();
  let body; try { body = await readFile(path); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(body);
}).listen(0);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
page.on("console", (m) => m.type() === "error" && console.error("console:", m.text()));
await page.goto(`http://127.0.0.1:${server.address().port}/zine/zine.html`);
const { duration, fps, sfx } = await page.evaluate(([s, t, c]) => window.setup(s, t, c), [slug, timing, credit]);
console.log(`${slug}: ${duration.toFixed(1)} s, voice: ${hasVoice ? "ElevenLabs" : "none (estimated timing)"}, music: ${credit}`);

if (flag === "--stills") {
  for (const t of list.split(",").map(Number)) { await page.evaluate((x) => window.frame(x), t); await page.screenshot({ path: join(out, `${slug}-t${t}.png`) }); }
} else {
  const silent = join(out, `${slug}.video.mp4`), frames = Math.round(duration * fps);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-b:v", "6M", "-maxrate", "8M", "-bufsize", "12M", "-preset", "slow", silent], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.frame(t), f / fps);
    const jpg = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
  // Sound: music bed (ducked under the voice when there is one), the voice, then the paper/stamp effects.
  const inputs = ["-i", silent, "-stream_loop", "-1", "-i", musicFile], parts = [], mix = [];
  parts.push(`[1:a]volume=${hasVoice ? 0.22 : 0.55},afade=t=in:d=0.4,afade=t=out:st=${(duration - 1.6).toFixed(2)}:d=1.6,atrim=0:${duration.toFixed(2)}[m]`); mix.push("[m]");
  let n = 2;
  if (hasVoice) { inputs.push("-i", join(voiceDir, "voice.wav")); parts.push(`[${n}:a]volume=1.0[v]`); mix.push("[v]"); n++; }
  for (const e of sfx) { inputs.push("-i", join(here, ".assets", e.f)); parts.push(`[${n}:a]atrim=0:${e.d},afade=t=out:st=${Math.max(0, e.d - .2)}:d=0.2,volume=${e.v},adelay=${Math.round(e.t * 1000)}|${Math.round(e.t * 1000)}[s${n}]`); mix.push(`[s${n}]`); n++; }
  parts.push(`${mix.join("")}amix=inputs=${mix.length}:normalize=0:duration=first,alimiter=limit=0.95[a]`);
  const args = ["-y", "-loglevel", "error", ...inputs, "-filter_complex", parts.join(";"), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", duration.toFixed(2), "-movflags", "+faststart", join(out, `${slug}.mp4`)];
  await new Promise((ok, no) => spawn("ffmpeg", args, { stdio: "inherit" }).on("close", (c) => c ? no(new Error("ffmpeg mix failed")) : ok()));
  await rm(silent);
  await page.evaluate((t) => window.frame(t), 1.5); await page.screenshot({ path: join(out, `${slug}-poster.jpg`), type: "jpeg", quality: 90 });
  console.log(join(out, `${slug}.mp4`));
}
await browser.close(); server.close();
