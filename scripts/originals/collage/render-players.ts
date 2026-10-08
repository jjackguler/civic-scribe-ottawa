/**
 * Renders the "players" opening titles (players.html) frame by frame, then mixes
 * the music edit, the narration lines and the sound effects from the config.
 *   npx tsx collage/render-players.ts <config.json> <work dir> <out.mp4> --music edit.wav [--stills 6,33] [--audio-only]
 * Env: COLLAGE_ASSETS (players/*.png, newsprint/*.jpg), VOICE_DIR (narration wavs),
 *      COLLAGE_SFX_MAP (sfx-map.json), CHROMIUM_PATH.
 */
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const run = promisify(execFile);
const HERE = import.meta.dirname;
const FONT_DIR = "file://" + resolve(HERE, "../node_modules/@fontsource-variable");
const FSRC_DIR = "file://" + resolve(HERE, "../node_modules/@fontsource");
const ASSETS = resolve(process.env.COLLAGE_ASSETS || ".");
const VOICE = resolve(process.env.VOICE_DIR || ".");
const FPS = 30, WORKERS = Number(process.env.COLLAGE_WORKERS || 2);
const [cfgPath, work, outPath] = process.argv.slice(2);
const argv = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const stills = argv("--stills")?.split(",").map(Number);
const music = argv("--music");
const audioOnly = process.argv.includes("--audio-only");

async function mix(cfg: any, outWav: string) {
  const D = cfg.duration, a = cfg.audio;
  const sfxMap = process.env.COLLAGE_SFX_MAP ? JSON.parse(await readFile(process.env.COLLAGE_SFX_MAP, "utf8")) : {};
  const inputs: string[] = [], chains: string[] = [], vlabels: string[] = [], slabels: string[] = [];
  let n = 0;
  inputs.push("-i", resolve(music!)); const mi = n++;
  a.voice.forEach((v: any, k: number) => {
    inputs.push("-i", join(VOICE, v.file)); const i = n++;
    // a little weight and room on the narrator; place it on the timeline
    chains.push(`[${i}:a]aresample=48000,${v.tempo ? `atempo=${v.tempo},` : ""}highpass=f=70,equalizer=f=160:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,aecho=0.8:0.5:28:0.12,adelay=${Math.round(v.at * 1000)}|${Math.round(v.at * 1000)},apad=whole_dur=${D}[v${k}]`);
    vlabels.push(`[v${k}]`);
  });
  a.sfx.forEach((s: any, k: number) => {
    const list = sfxMap[s.kind]; if (!list?.length) return;
    inputs.push("-i", list[k % list.length]); const i = n++;
    chains.push(`[${i}:a]aresample=48000,volume=${s.gain ?? -6}dB,adelay=${Math.round(s.at * 1000)}|${Math.round(s.at * 1000)},apad=whole_dur=${D}[s${k}]`);
    slabels.push(`[s${k}]`);
  });
  const ducks = (a.music.duck || []).map(([t0, t1, db]: number[]) => `volume=enable='between(t,${t0},${t1})':volume=${db}dB`).join(",");
  chains.push(`[${mi}:a]aresample=48000,atrim=0:${D},${ducks ? ducks + "," : ""}afade=t=in:d=0.3,apad=whole_dur=${D}[m]`);
  chains.push(`${vlabels.join("")}amix=inputs=${vlabels.length}:normalize=0,loudnorm=I=-17:TP=-2,volume=2dB,aformat=channel_layouts=stereo[vv]`);
  chains.push(`${slabels.join("")}amix=inputs=${slabels.length}:normalize=0,aformat=channel_layouts=stereo[ss]`);
  chains.push(`[m]loudnorm=I=-17:TP=-2,aformat=channel_layouts=stereo[mm]`);
  chains.push(`[mm][vv][ss]amix=inputs=3:normalize=0,alimiter=limit=0.89,atrim=0:${D}[out]`);
  await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", chains.join(";"), "-map", "[out]", "-ar", "48000", outWav], { maxBuffer: 1 << 26 });
  // final level: two-pass-ish loudnorm to -15 LUFS like the other Originals
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", outWav, "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", outWav.replace(".wav", "-ln.wav")]);
}

async function main() {
  await mkdir(work, { recursive: true });
  const cfg = JSON.parse(await readFile(cfgPath, "utf8"));
  const mixWav = join(work, "mix.wav");
  if (audioOnly) { await mix(cfg, mixWav); console.log("audio", mixWav); return; }
  cfg.sizes = {};
  for (const f of await readdir(join(ASSETS, "players"))) if (f.endsWith(".png")) { const b = await readFile(join(ASSETS, "players", f)); cfg.sizes[f.slice(0, -4)] = [b.readUInt32BE(16), b.readUInt32BE(20)]; }
  const html = join(work, "players.html");
  await writeFile(html, (await readFile(join(HERE, "players.html"), "utf8")).replaceAll("FSRC_DIR", FSRC_DIR).replaceAll("FONT_DIR", FONT_DIR).replaceAll("ASSET_DIR", "file://" + ASSETS));
  const open = async () => {
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on("pageerror", e => console.error("page error:", e.message));
    await page.goto("file://" + html);
    await page.evaluate(c => { (window as any).CONFIG = c; (window as any).setup(); }, cfg);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => null))));
    await page.waitForTimeout(800);
    return { browser, page };
  };
  if (stills) {
    const { browser, page } = await open();
    for (const t of stills) { await page.evaluate(x => (window as any).renderAt(x), t); await page.screenshot({ path: join(work, `p-${String(t).replace(".", "_")}.png`) }); }
    await browser.close(); console.log("stills"); return;
  }
  const mixing = mix(cfg, mixWav);
  const frames = Math.ceil(cfg.duration * FPS), per = Math.ceil(frames / WORKERS);
  const parts = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const { browser, page } = await open();
    const file = join(work, `ppart-${w}.mp4`);
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", file], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise<void>((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
    for (let f = w * per; f < Math.min(frames, (w + 1) * per); f++) {
      await page.evaluate(x => (window as any).renderAt(x), f / FPS);
      const buf = await page.screenshot({ type: "jpeg", quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    }
    ff.stdin.end(); await done; await browser.close(); return file;
  }));
  await mixing;
  await writeFile(join(work, "pparts.txt"), parts.map(f => `file '${f}'`).join("\n"));
  const silent = join(work, "players-video.mp4");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(work, "pparts.txt"), "-c", "copy", silent]);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", mixWav.replace(".wav", "-ln.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", resolve(outPath)]);
  console.log(`rendered ${outPath} (${cfg.duration}s)`);
}
main().catch(e => { console.error(e); process.exit(1); });
