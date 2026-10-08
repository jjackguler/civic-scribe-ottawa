/**
 * Renders the title sequence (titles.html) frame by frame and lays the music under it.
 *   npx tsx collage/render-titles.ts <titles.json> <work dir> <out.mp4> [--stills 3,10] [--music file]
 * COLLAGE_ASSETS must contain dx/*.png (double-exposure figures) and dx/fill-*.jpg.
 */
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const run = promisify(execFile);
const HERE = import.meta.dirname;
const FONT_DIR = "file://" + resolve(HERE, "../node_modules/@fontsource-variable");
const ASSETS = resolve(process.env.COLLAGE_ASSETS || ".");
const FPS = 30, WORKERS = Number(process.env.COLLAGE_WORKERS || 2);
const [cfgPath, work, outPath] = process.argv.slice(2);
const argv = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const stills = argv("--stills")?.split(",").map(Number);
const music = argv("--music");

async function main() {
  await mkdir(work, { recursive: true });
  const cfg = JSON.parse(await readFile(cfgPath, "utf8"));
  cfg.sizes = {};
  cfg.masks = {};
  // CSS masks are fetched with CORS, which file:// cannot satisfy; hand them over as data URIs.
  for (const f of await readdir(join(ASSETS, "dx"))) if (f.endsWith(".png")) { const b = await readFile(join(ASSETS, "dx", f)); cfg.sizes[f.slice(0, -4)] = [b.readUInt32BE(16), b.readUInt32BE(20)]; cfg.masks[f.slice(0, -4)] = "data:image/png;base64," + b.toString("base64"); }
  const html = join(work, "titles.html");
  await writeFile(html, (await readFile(join(HERE, "titles.html"), "utf8")).replaceAll("FONT_DIR", FONT_DIR).replaceAll("ASSET_DIR", "file://" + ASSETS));
  const open = async () => {
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto("file://" + html);
    await page.evaluate(c => { (window as any).CONFIG = c; (window as any).setup(); }, cfg);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => null))));
    await page.waitForTimeout(800);
    return { browser, page };
  };
  if (stills) {
    const { browser, page } = await open();
    for (const t of stills) { await page.evaluate(x => (window as any).renderAt(x), t); await page.screenshot({ path: join(work, `t-${String(t).replace(".", "_")}.png`) }); }
    await browser.close(); console.log("stills"); return;
  }
  const frames = Math.ceil(cfg.duration * FPS), per = Math.ceil(frames / WORKERS);
  const parts = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const { browser, page } = await open();
    const file = join(work, `tpart-${w}.mp4`);
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", file], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise<void>((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
    for (let f = w * per; f < Math.min(frames, (w + 1) * per); f++) {
      await page.evaluate(x => (window as any).renderAt(x), f / FPS);
      const buf = await page.screenshot({ type: "jpeg", quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    }
    ff.stdin.end(); await done; await browser.close(); return file;
  }));
  await writeFile(join(work, "tparts.txt"), parts.map(f => `file '${f}'`).join("\n"));
  const silent = join(work, "titles-video.mp4");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(work, "tparts.txt"), "-c", "copy", silent]);
  if (music) {
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", music, "-filter_complex", `[1:a]atrim=0:${cfg.duration},afade=t=in:d=1.5,afade=t=out:st=${cfg.duration - 3}:d=3,loudnorm=I=-16:TP=-1.5[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", resolve(outPath)]);
  } else await run("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-c", "copy", resolve(outPath)]);
  console.log(`rendered ${outPath} (${cfg.duration}s)`);
}
main().catch(e => { console.error(e); process.exit(1); });
