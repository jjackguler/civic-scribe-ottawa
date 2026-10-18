// Renders scene.html frame by frame with Chromium and pipes JPEGs to FFmpeg, then mixes
// the voice lines (out/line-N.mp3) and an optional music bed into out/video.mp4.
// Usage: node render.mjs [--frames 0,90,300] [--music file.mp3] [--chromium path]
import fs from "node:fs"; import { spawn, execFileSync } from "node:child_process";
import { chromium } from "playwright";
const dir = new URL(".", import.meta.url).pathname, out = dir + "out/";
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const timing = JSON.parse(fs.readFileSync(out + "timing.json", "utf8")); const FPS = 30;
const browser = await chromium.launch(arg("--chromium") ? { executablePath: arg("--chromium") } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto("file://" + dir + "scene.html", { waitUntil: "networkidle" });
await page.evaluate(async t => { await document.fonts.ready; window.init(t); }, timing);
const shot = async t => { await page.evaluate(t => window.render(t), t); return page.screenshot({ type: "jpeg", quality: 90 }); };
if (arg("--frames")) {
  for (const f of arg("--frames").split(",")) fs.writeFileSync(`${out}frame-${f}.jpg`, await shot(+f / FPS));
  await browser.close(); process.exit(0);
}
const n = Math.ceil(timing.total * FPS);
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "20", out + "silent.mp4"], { stdio: ["pipe", "inherit", "inherit"] });
for (let i = 0; i < n; i++) { const buf = await shot(i / FPS); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r)); if (i % 300 === 0) console.log("frame", i, "/", n); }
ff.stdin.end(); await new Promise(r => ff.on("close", r)); await browser.close();
// audio: each line delayed to its start, plus music bed under it
const ins = [], filt = []; timing.lines.forEach((l, i) => { ins.push("-i", `${out}line-${i}.mp3`); filt.push(`[${i}:a]adelay=${Math.round(l.start * 1000)}:all=1[v${i}]`); });
const N = timing.lines.length; let mix = timing.lines.map((_, i) => `[v${i}]`).join("") + `amix=inputs=${N}:normalize=0[vo]`;
const music = arg("--music");
if (music && fs.existsSync(music)) { ins.push("-i", music); mix += `;[${N}:a]atrim=0:${timing.total},volume=0.10,afade=t=in:d=1,afade=t=out:st=${timing.total - 2}:d=2[mu];[vo][mu]amix=inputs=2:normalize=0[a]`; } else mix += ";[vo]anull[a]";
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", out + "silent.mp4", ...ins, "-filter_complex", filt.join(";") + ";" + mix,
  "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(timing.total), "-movflags", "+faststart", out + "video.mp4"], { stdio: "inherit" });
console.log("wrote", out + "video.mp4");
