/**
 * Renders a collage explainer frame by frame (collage.html in headless Chromium),
 * then mixes narration with paper/stamp sound effects made from noise in FFmpeg.
 *
 *   npx tsx collage/render-collage.ts <storyboard.json> <work dir with voice.wav + timing.json> <out.mp4>
 *        [--stills 1.5,6,12]   only screenshot these times (seconds) for review
 */
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";

const run = promisify(execFile);
const HERE = import.meta.dirname;
const FONT_DIR = "file://" + resolve(HERE, "../node_modules/@fontsource-variable");
const FSRC_DIR = "file://" + resolve(HERE, "../node_modules/@fontsource");
/** Prepared collage material: figs/*.png (cut-outs), newsprint/page-a|b.jpg, thumbs/*.jpg. */
const ASSETS = process.env.COLLAGE_ASSETS ? resolve(process.env.COLLAGE_ASSETS) : "";
/** {"slap": ["path.wav", ...], ...}: real recordings per sound cue; anything missing is synthesised. */
const SFX_MAP = process.env.COLLAGE_SFX_MAP ? resolve(process.env.COLLAGE_SFX_MAP) : "";
const MUSIC = process.env.COLLAGE_MUSIC ? resolve(process.env.COLLAGE_MUSIC) : "";
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
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => null))));
  await page.evaluate(() => Promise.all([...document.querySelectorAll<HTMLElement>("*")].flatMap(e => {
    const m = getComputedStyle(e).backgroundImage.match(/url\("(file:[^"]+)"\)/);
    return m ? [new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = m[1]; })] : [];
  })));
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
  snip: "anoisesrc=d=0.06:c=white:a=0.5,highpass=f=2500,afade=t=out:st=0.005:d=0.05",
  paper: "anoisesrc=d=0.5:c=pink:a=0.25,bandpass=f=3000:w=2500,tremolo=f=9:d=0.6,afade=t=in:d=0.1,afade=t=out:st=0.3:d=0.2",
  pencil: "anoisesrc=d=0.45:c=pink:a=0.2,bandpass=f=2400:w=1500,tremolo=f=12:d=0.8,afade=t=out:st=0.3:d=0.15",
  tear: "anoisesrc=d=0.6:c=white:a=0.3,bandpass=f=3500:w=3000,tremolo=f=30:d=0.7,afade=t=out:st=0.4:d=0.2",
  type: "anoisesrc=d=0.03:c=white:a=0.6,highpass=f=1500,afade=t=out:st=0.005:d=0.025",
  click: "anoisesrc=d=0.03:c=white:a=0.4,highpass=f=2000,afade=t=out:st=0.005:d=0.025",
  shutter: "anoisesrc=d=0.08:c=white:a=0.5,highpass=f=1200,afade=t=out:st=0.01:d=0.07",
  slide: "anoisesrc=d=0.35:c=pink:a=0.25,bandpass=f=1800:w=1500,afade=t=in:d=0.1,afade=t=out:st=0.15:d=0.2",
};
const GAIN: Record<string, number> = { whoosh: 0.45, slap: 0.7, thump: 0.8, stamp: 0.95, marker: 0.5, scribble: 0.5, pencil: 0.55, sweep: 0.4, tick: 0.5, snip: 0.45, paper: 0.45, tear: 0.6, type: 0.5, click: 0.4, shutter: 0.5, slide: 0.5 };

async function mixAudio(voice: string, events: { t: number; kind: string }[], dur: number, out: string) {
  const map: Record<string, string[]> = SFX_MAP && existsSync(SFX_MAP) ? JSON.parse(await readFile(SFX_MAP, "utf8")) : {};
  const used: Record<string, number> = {};
  // drop cues that land on top of the same kind (keeps the mix clean)
  const last: Record<string, number> = {};
  const ev = events.filter(e => (SFX[e.kind] || map[e.kind]?.length) && e.t >= 0 && e.t < dur && !(last[e.kind] !== undefined && e.t - last[e.kind] < 0.09) && ((last[e.kind] = e.t), true));
  const inputs: string[] = ["-i", voice];
  const filters: string[] = [];
  ev.forEach((e, i) => {
    const files = map[e.kind];
    if (files?.length) {
      const k = used[e.kind] = (used[e.kind] ?? -1) + 1;
      inputs.push("-i", files[k % files.length]);
    } else inputs.push("-f", "lavfi", "-i", SFX[e.kind]);
    const ms = Math.round(e.t * 1000);
    filters.push(`[${i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:2.5,volume=${GAIN[e.kind] ?? 0.6},adelay=${ms}|${ms}[s${i}]`);
  });
  const n = ev.length;
  filters.push(`[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0,asplit=2[v][vk]`);
  let bed = "";
  if (MUSIC && existsSync(MUSIC)) {
    inputs.push("-stream_loop", "-1", "-i", MUSIC);
    // music sits under the voice and ducks while it talks
    filters.push(`[${n + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${dur.toFixed(2)},volume=0.22,afade=t=in:d=1.2,afade=t=out:st=${(dur - 2.5).toFixed(2)}:d=2.5[m0]`);
    filters.push(`[m0][vk]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[m]`);
    bed = "[m]";
  } else filters.push(`[vk]anullsink`);
  filters.push(`[v]${ev.map((_, i) => `[s${i}]`).join("")}${bed}amix=inputs=${n + 1 + (bed ? 1 : 0)}:normalize=0:duration=first,loudnorm=I=-15:TP=-1.5:LRA=9[a]`);
  await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", filters.join(";"), "-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-t", dur.toFixed(2), out], { maxBuffer: 1 << 26 });
}

/** Width and height from a PNG header. */
async function pngSize(f: string): Promise<[number, number]> {
  const b = await readFile(f);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

async function main() {
  const board = JSON.parse(await readFile(boardPath, "utf8"));
  const timing = JSON.parse(await readFile(join(work, "timing.json"), "utf8"));
  const html = join(work, "collage.html");
  await writeFile(html, (await readFile(join(HERE, "collage.html"), "utf8")).replaceAll("FSRC_DIR", FSRC_DIR).replaceAll("FONT_DIR", FONT_DIR));
  await writeFile(join(work, "collage-v2.js"), (await readFile(join(HERE, "collage-v2.js"), "utf8")).replaceAll("ASSET_DIR", "file://" + ASSETS));
  if (ASSETS) {
    const figs: Record<string, [number, number]> = {};
    if (existsSync(join(ASSETS, "figs"))) for (const f of await readdir(join(ASSETS, "figs"))) if (f.endsWith(".png")) figs[f.slice(0, -4)] = await pngSize(join(ASSETS, "figs", f));
    const thumbs = existsSync(join(ASSETS, "thumbs")) ? (await readdir(join(ASSETS, "thumbs"))).sort().map(f => `thumbs/${f}`) : [];
    board.assets = { figs, thumbs };
  }

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
