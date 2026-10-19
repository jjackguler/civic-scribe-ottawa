// Renders a produced noir reel (build/<slug>/) to out/<slug>.mp4: 1080x1920, 30 fps,
// frames drawn by reel.html, narration + effects + rain + music mixed by FFmpeg.
//   node render.mjs <slug> [--stills 3,12.5,40]     (run produce.mjs first)
import { chromium } from "playwright";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";

const here = import.meta.dirname;
const [slug, flag, list] = process.argv.slice(2);
if (!slug) { console.error("usage: node render.mjs <slug> [--stills t1,t2]"); process.exit(1); }
const out = join(here, "out"); await mkdir(out, { recursive: true });
const build = join(here, "build", slug);
const story = JSON.parse(await readFile(join(here, "stories", `${slug}.json`), "utf8"));
const tl = JSON.parse(await readFile(join(build, "timeline.json"), "utf8"));

const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg" };
const server = createServer(async (req, res) => {
  const path = join(here, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(here)) return res.writeHead(403).end();
  let body;
  try { body = await readFile(path); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(body);
}).listen(0);

const ffmpeg = (args) => new Promise((ok, no) => { const p = spawn("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: ["pipe", "inherit", "inherit"] }); p.on("close", (c) => c ? no(new Error(`ffmpeg exit ${c}`)) : ok()); return p; });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/reel.html?slug=${slug}`);
const { duration, fps } = await page.evaluate(() => window.setup());

if (flag === "--stills") {
  for (const s of list.split(",").map(Number)) {
    await page.evaluate((t) => window.frame(t), s);
    await page.screenshot({ path: join(out, `${slug}-t${s}.jpg`), type: "jpeg", quality: 90 });
  }
  console.log(`stills in ${out}`);
} else {
  const video = join(out, `${slug}-video.mp4`), frames = Math.round(duration * fps);
  if (process.env.NOIR_MIX_ONLY !== "1") { // NOIR_MIX_ONLY=1 re-mixes the sound over the last rendered frames
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-crf", "17", "-maxrate", "16M", "-bufsize", "24M", "-preset", "slow", video], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.frame(t), f / fps);
    const jpg = await page.screenshot({ type: "jpeg", quality: 94 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f === Math.round(3.6 * fps)) await page.screenshot({ path: join(out, `${slug}-poster.jpg`), type: "jpeg", quality: 92 });
    if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
  }

  // ── sound ──
  const inputs = [], chains = [], vo = [], fx = [];
  const add = (file, loop = false) => { inputs.push(...(loop ? ["-stream_loop", "-1"] : []), "-i", file); return inputs.filter((a) => a === "-i").length - 1; };
  const ms = (s) => Math.max(0, Math.round(s * 1000));
  story.shots.forEach((shot, i) => {
    const T = tl.shots[i];
    const k = add(join(build, "vo", `${shot.id}.mp3`));
    chains.push(`[${k}]adelay=${ms(T.start + T.voAt)}:all=1[v${i}]`); vo.push(`[v${i}]`);
    for (const s of shot.sfx ?? []) {
      let at = s.at ?? 0;
      if (s.w) { const w = T.words.find((w) => w.w.toLowerCase().replace(/[^a-z0-9'-]/g, "").startsWith(s.w.toLowerCase())); if (w) at = T.voAt + w.start + (s.at ?? 0); }
      const j = add(join(build, "sfx", `${s.id}.mp3`));
      chains.push(`[${j}]volume=${s.gain ?? -14}dB,afade=t=in:d=0.08,afade=t=out:st=${Math.max(0.2, s.dur - 0.6)}:d=0.6,adelay=${ms(T.start + at)}:all=1[f${fx.length}]`); fx.push(`[f${fx.length}]`);
    }
  });
  const amb = add(join(build, "sfx", "_ambience.mp3"), true), mus = add(join(build, "music.mp3"), true), D = tl.total.toFixed(3);
  chains.push(`${vo.join("")}amix=inputs=${vo.length}:normalize=0,asplit=2[vo][key]`);
  chains.push(`${fx.join("")}amix=inputs=${fx.length}:normalize=0[fx]`);
  chains.push(`[${amb}]atrim=0:${D},volume=-24dB,afade=t=in:d=1.2,afade=t=out:st=${(tl.total - 2).toFixed(2)}:d=2[amb]`);
  chains.push(`[${mus}]atrim=0:${D},volume=-11dB,afade=t=in:d=2,afade=t=out:st=${(tl.total - 3).toFixed(2)}:d=3[mus0]`);
  chains.push(`[mus0][key]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=600[mus]`);
  chains.push(`[vo][fx][amb][mus]amix=inputs=4:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`);
  await ffmpeg([...inputs, "-i", video, "-filter_complex", chains.join(";"), "-map", `${inputs.filter((a) => a === "-i").length}:v`, "-map", "[a]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", D, "-movflags", "+faststart", join(out, `${slug}.mp4`)]);
  console.log(join(out, `${slug}.mp4`));
}
await browser.close();
server.close();
