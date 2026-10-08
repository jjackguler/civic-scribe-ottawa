/**
 * Renders a collage explainer frame by frame (collage.html in headless Chromium),
 * then mixes narration with paper/stamp sound effects made from noise in FFmpeg.
 *
 *   npx tsx collage/render-collage.ts <storyboard.json> <work dir with voice.wav + timing.json> <out.mp4>
 *        [--stills 1.5,6,12]   only screenshot these times (seconds) for review
 */
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";

const run = promisify(execFile);
const HERE = import.meta.dirname;
const FONT_DIR = "file://" + resolve(HERE, "../node_modules/@fontsource-variable");
const FPS = 30;
const WORKERS = Number(process.env.COLLAGE_WORKERS || 2);

const [boardPath, work, outPath] = process.argv.slice(2);
const stillsArg = process.argv.indexOf("--stills");
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(",").map(Number) : null;

async function openPage(html: string, board: unknown, timing: unknown) {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto("file://" + html);
  await page.evaluate(([b, t]) => { (window as any).BOARD = b; (window as any).TIMING = t; }, [board, timing]);
  const info = await page.evaluate(() => (window as any).setup()) as { duration: number; events: { t: number; kind: string }[] };
  await page.evaluate(() => document.fonts.ready);
  return { browser, page, info };
}

async function renderRange(page: Page, from: number, to: number, file: string) {
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS), file], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise<void>((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
  for (let f = from; f < to; f++) {
    await page.evaluate(t => (window as any).renderAt(t), f / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 300 === 0) console.log(`  frame ${f}/${to}`);
  }
  ff.stdin.end();
  await done;
}

/** Short sound effects synthesised from noise and sine, so nothing is licensed. */
const SFX: Record<string, string> = {
  whoosh: "anoisesrc=d=0.45:c=pink:a=0.5,highpass=f=500,lowpass=f=5000,afade=t=in:d=0.2,afade=t=out:st=0.2:d=0.25",
  slap: "anoisesrc=d=0.14:c=white:a=0.55,highpass=f=900,lowpass=f=6000,afade=t=out:st=0.01:d=0.13",
  thump: "sine=f=62:d=0.26,volume=1.6,afade=t=out:st=0.02:d=0.24",
  stamp: "sine=f=55:d=0.32,volume=2,afade=t=out:st=0.02:d=0.3",
  marker: "anoisesrc=d=0.4:c=pink:a=0.18,bandpass=f=2600:w=1800,afade=t=in:d=0.05,afade=t=out:st=0.25:d=0.15",
  scribble: "anoisesrc=d=0.32:c=pink:a=0.22,bandpass=f=2200:w=1600,tremolo=f=14:d=0.7,afade=t=out:st=0.2:d=0.12",
  sweep: "anoisesrc=d=0.9:c=pink:a=0.12,bandpass=f=3000:w=2000,afade=t=in:d=0.3,afade=t=out:st=0.5:d=0.4",
  tick: "sine=f=1800:d=0.03,volume=0.25",
};

async function mixAudio(voice: string, events: { t: number; kind: string }[], dur: number, out: string) {
  const ev = events.filter(e => SFX[e.kind] && e.t >= 0 && e.t < dur);
  const inputs: string[] = ["-i", voice];
  const filters: string[] = [];
  ev.forEach((e, i) => {
    inputs.push("-f", "lavfi", "-i", SFX[e.kind]);
    const ms = Math.round(e.t * 1000);
    filters.push(`[${i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${e.kind === "whoosh" ? 0.5 : 0.7},adelay=${ms}|${ms}[s${i}]`);
  });
  filters.push(`[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0[v]`);
  filters.push(`[v]${ev.map((_, i) => `[s${i}]`).join("")}amix=inputs=${ev.length + 1}:normalize=0:duration=first,loudnorm=I=-15:TP=-1.5:LRA=9[a]`);
  await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", filters.join(";"), "-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-t", dur.toFixed(2), out], { maxBuffer: 1 << 26 });
}

async function main() {
  const board = JSON.parse(await readFile(boardPath, "utf8"));
  const timing = JSON.parse(await readFile(join(work, "timing.json"), "utf8"));
  const html = join(work, "collage.html");
  await writeFile(html, (await readFile(join(HERE, "collage.html"), "utf8")).replaceAll("FONT_DIR", FONT_DIR));

  if (stills) {
    const { browser, page } = await openPage(html, board, timing);
    for (const t of stills) {
      await page.evaluate(x => (window as any).renderAt(x), t);
      await page.screenshot({ path: join(work, `still-${String(t).replace(".", "_")}.png`) });
    }
    await browser.close();
    console.log(`stills: ${stills.join(", ")}`);
    return;
  }

  const frames = Math.ceil(timing.duration * FPS);
  const per = Math.ceil(frames / WORKERS);
  let events: { t: number; kind: string }[] = [];
  const parts = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const { browser, page, info } = await openPage(html, board, timing);
    if (w === 0) events = info.events;
    const file = join(work, `part-${w}.mp4`);
    await renderRange(page, w * per, Math.min(frames, (w + 1) * per), file);
    await browser.close();
    return file;
  }));
  const list = join(work, "parts.txt");
  await writeFile(list, parts.map(f => `file '${f}'`).join("\n"));
  const silent = join(work, "video.mp4");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent]);
  const audio = join(work, "mix.m4a");
  await mixAudio(join(work, "voice.wav"), events, timing.duration, audio);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", "-movflags", "+faststart", "-shortest", resolve(outPath)]);
  console.log(`rendered ${outPath} (${timing.duration.toFixed(1)} s, ${frames} frames, ${events.length} sound cues)`);
}

main().catch(e => { console.error(e); process.exit(1); });
