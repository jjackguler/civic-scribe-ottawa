// Renders a reel page to an MP4 (1080x1920, 30 fps) plus a poster frame.
//   cd scripts/originals/nightcity && npm i && node render-reel.mjs [OUTDIR]
//   PAGE="reel-news.html?story=aibias" NAME=aibias MUSIC=path.mp3 node render-reel.mjs out
// Each frame is drawn by window.frame(t) and piped to ffmpeg as JPEG, so the
// video is frame-exact however slow the machine is.
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const here = import.meta.dirname;
const out = resolve(process.argv[2] ?? join(here, "out"));
await mkdir(out, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const path = join(here, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(here)) return res.writeHead(403).end();
  let body;
  try { body = await readFile(path); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(body);
}).listen(0);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
const PAGE = process.env.PAGE ?? "reel-robots.html", NAME = process.env.NAME ?? "robots-reel";
await page.goto(`http://127.0.0.1:${server.address().port}/${PAGE}`);
const { duration, fps } = await page.evaluate(() => window.setup());
const frames = Math.round(duration * fps);
const only = process.env.FRAMES?.split(",").map(Number); // e.g. FRAMES=30,200 for stills only
if (only) {
  for (const f of only) { await page.evaluate((t) => window.frame(t), f / fps); await page.screenshot({ path: join(out, `reel-f${f}.png`) }); }
} else {
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-b:v", "5M", "-maxrate", "7M", "-bufsize", "10M", "-preset", "slow", "-movflags", "+faststart", join(out, `${NAME}.mp4`)], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.frame(t), f / fps);
    const jpg = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f === Math.round(1.2 * fps)) await page.screenshot({ path: join(out, `${NAME}-poster.jpg`), type: "jpeg", quality: 90 });
    if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
  console.log(join(out, `${NAME}.mp4`));
}
await browser.close();
server.close();
