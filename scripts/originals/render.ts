/**
 * Renders the explainer: one 1080×1920 card per segment (HTML → PNG with the
 * house fonts), then FFmpeg joins each card to its narration with a slow push-in.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import type { Card, Script } from "./script";

const run = promisify(execFile);
const FONT_DIR = resolve(import.meta.dirname, "node_modules/@fontsource-variable");
const MARK = `<svg viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="12" fill="#111"/><rect x="11" y="11" width="42" height="9" rx="1" fill="#F5C400"/><rect x="11" y="26" width="20" height="27" rx="1" fill="#F5C400"/><path d="M37 29h16M37 38h16M37 47h8" stroke="#F5C400" stroke-width="4.5" stroke-linecap="round"/><circle cx="51" cy="48" r="5" fill="#D7372F"/></svg>`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function cardHtml(card: Card, k: number, n: number, opts: { image?: string; sources: string[]; date: string }): string {
  const onImage = !!opts.image;
  const fg = onImage ? "#fff" : "#111";
  const accent = onImage ? "#F5C400" : "#111";
  const big = esc(card.big);
  const small = card.small ? esc(card.small) : "";
  const body =
    card.type === "number" ? `<div class="num">${big}</div><div class="small">${small}</div>`
    : card.type === "quote" ? `<div class="quote">“${big}”</div><div class="small">— ${small}</div>`
    : card.type === "sources" ? `<div class="label">Sources</div><div class="src">${opts.sources.map(esc).join("<br>")}</div><div class="small">${small}</div>`
    : card.type === "headline" ? `<div class="head">${big}</div><div class="small">${small}</div>`
    : `<div class="fact">${big}</div><div class="small">${small}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Grot;src:url("file://${FONT_DIR}/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2") format("woff2");font-weight:400 900}
@font-face{font-family:News;src:url("file://${FONT_DIR}/newsreader/files/newsreader-latin-opsz-normal.woff2") format("woff2");font-weight:200 800}
@font-face{font-family:News;font-style:italic;src:url("file://${FONT_DIR}/newsreader/files/newsreader-latin-opsz-italic.woff2") format("woff2");font-weight:200 800}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:Grot,sans-serif;color:${fg};background:${onImage ? "#111" : "#F5C400"};position:relative}
.bg{position:absolute;inset:0;background:url("${opts.image ?? ""}") center/cover}
.shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,10,.96) 0%,rgba(10,10,10,.85) 42%,rgba(10,10,10,.25) 72%,rgba(10,10,10,.1) 100%)}
.stripes{position:absolute;inset:0;opacity:.10;background:repeating-linear-gradient(135deg,#111 0 3px,transparent 3px 30px)}
.top{position:absolute;left:72px;right:72px;top:96px;display:flex;align-items:center;gap:22px}
.top b{font-family:News;font-size:46px;font-weight:600}
.pill{margin-left:auto;font-size:28px;font-weight:700;padding:8px 18px;background:${onImage ? "#F5C400" : "#111"};color:${onImage ? "#111" : "#F5C400"}}
.prog{position:absolute;left:72px;right:72px;top:200px;display:flex;gap:10px}
.prog i{flex:1;height:8px;background:${onImage ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.18)"}}
.prog i.on{background:${accent}}
.main{position:absolute;left:72px;right:72px;bottom:300px}
.head{font-size:104px;font-weight:800;line-height:1.02;letter-spacing:-1.5px}
.fact{font-size:84px;font-weight:750;line-height:1.08;letter-spacing:-1px}
.num{font-size:230px;font-weight:850;line-height:.95;letter-spacing:-6px;color:${accent}}
.quote{font-family:News;font-style:italic;font-size:82px;line-height:1.12}
.label{font-size:40px;font-weight:700;opacity:.8}
.src{font-size:76px;font-weight:800;line-height:1.15;margin-top:12px}
.small{font-size:44px;font-weight:500;line-height:1.3;margin-top:34px;opacity:.85}
.foot{position:absolute;left:72px;right:72px;bottom:110px;display:flex;justify-content:space-between;font-size:28px;font-weight:600;opacity:.8}
.idx{position:absolute;left:52px;top:250px;font-family:News;font-weight:600;font-size:620px;line-height:1;color:#111;opacity:.09;letter-spacing:-20px}
.ill{position:absolute;right:72px;top:262px;font-size:24px;font-weight:600;background:rgba(0,0,0,.6);color:#fff;padding:6px 12px}
</style></head><body>
${onImage ? `<div class="bg"></div><div class="shade"></div><div class="ill">AI illustration</div>` : `<div class="stripes"></div>${card.type === "number" ? "" : `<div class="idx">${k + 1}</div>`}`}
<div class="top">${MARK}<b>AI Broadsheet</b><span class="pill">Explainer</span></div>
<div class="prog">${Array.from({ length: n }, (_, i) => `<i class="${i <= k ? "on" : ""}"></i>`).join("")}</div>
<div class="main">${body}</div>
<div class="foot"><span>AI voice · from the publishers' reporting</span><span>${esc(opts.date)}</span></div>
</body></html>`;
}

export async function renderCards(script: Script, dir: string, opts: { images: (string | null)[]; sources: string[]; date: string; chromiumPath?: string }): Promise<string[]> {
  const browser = await chromium.launch(opts.chromiumPath ? { executablePath: opts.chromiumPath } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const out: string[] = [];
  for (let k = 0; k < script.segments.length; k++) {
    const html = join(dir, `card-${k}.html`);
    const img = opts.images[k] ? `file://${resolve(opts.images[k]!)}` : undefined;
    await writeFile(html, cardHtml(script.segments[k].card, k, script.segments.length, { image: img, sources: opts.sources, date: opts.date }));
    await page.goto(`file://${resolve(html)}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const png = join(dir, `card-${k}.png`);
    await page.screenshot({ path: png });
    out.push(png);
  }
  await browser.close();
  return out;
}

export async function duration(file: string): Promise<number> {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]);
  return Number(stdout.trim());
}

/** Silent placeholder narration for dry runs (no API calls). */
export async function silence(seconds: number, out: string) {
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", seconds.toFixed(2), "-c:a", "libmp3lame", "-b:a", "96k", out]);
}

/** One clip per card (card + narration + 0.35 s breath), then join. Returns total seconds. */
export async function compose(cards: string[], voices: string[], dir: string, out: string): Promise<number> {
  const clips: string[] = [];
  let total = 0;
  for (let k = 0; k < cards.length; k++) {
    const d = (await duration(voices[k])) + 0.35;
    total += d;
    const frames = Math.ceil(d * 30);
    const clip = join(dir, `clip-${k}.mp4`);
    await run("ffmpeg", [
      "-y", "-loglevel", "error",
      "-loop", "1", "-framerate", "30", "-t", d.toFixed(2), "-i", cards[k],
      "-i", voices[k],
      "-filter_complex",
      `[0:v]scale=1188:2112,zoompan=z='min(zoom+0.0007,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,format=yuv420p[v];[1:a]apad=pad_dur=0.35[a]`,
      "-map", "[v]", "-map", "[a]", "-frames:v", String(frames), "-t", d.toFixed(2),
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-r", "30",
      "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2",
      clip,
    ]);
    clips.push(clip);
  }
  const list = join(dir, "clips.txt");
  await writeFile(list, clips.map(c => `file '${resolve(c)}'`).join("\n"));
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out]);
  return total;
}

export const readBuffer = (f: string) => readFile(f);

/** JPEG poster from the first card, for our own player. */
export async function poster(png: string, out: string) {
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-vf", "scale=540:960", "-q:v", "4", out]);
}
