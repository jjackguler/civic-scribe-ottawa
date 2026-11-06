/**
 * Ink & Gold carousel slides (1080x1350 JPEG) for one Newsroom article:
 * cover, the news, the catch (why it matters), sources, and a follow card.
 * Only our own typography and marks: no third-party photos.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Browser } from "playwright";

export type SlideArticle = { id: string; topic: string; headline: string; dek: string; news: string; matters: string; outlets: string[] };

const BODONI = "https://aibroadsheet.com/__l5e/assets-v1/fe207202-f955-4cbd-8938-c7442dcd502f/bodoni-moda-brand.woff";
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;700;800&display=block");
@font-face{font-family:Brand;src:url("${BODONI}") format("woff")}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:#16181A;color:#EFE8DA;font-family:"Schibsted Grotesk",Arial,sans-serif;position:relative;overflow:hidden}
.top{position:absolute;left:64px;right:64px;top:56px;display:flex;justify-content:space-between;align-items:center}
.mark{display:flex;align-items:center;gap:14px;font:700 26px "Schibsted Grotesk",Arial}
.b{font:800 64px/1 Brand,Georgia,serif;color:#D7B54A;position:relative;top:-4px}
.series{font:italic 700 30px Brand,Georgia,serif;color:#D7B54A}
.kick{font:800 26px "Schibsted Grotesk",Arial;letter-spacing:.14em;text-transform:uppercase;color:#D9412B;display:flex;align-items:center;gap:14px}
.dot{display:inline-block;width:18px;height:18px;border-radius:50%;background:#D9412B}
.h{font:800 92px/.95 Brand,Georgia,serif;text-transform:uppercase;letter-spacing:-.01em}
.h2{font:800 64px/1 Brand,Georgia,serif;text-transform:uppercase}
.body{font:500 38px/1.38 "Schibsted Grotesk",Arial}
.gold{color:#D7B54A}
.box{position:absolute;left:64px;right:64px}
.bot{position:absolute;left:64px;right:64px;bottom:52px;border-top:1.5px solid rgba(239,232,218,.35);padding-top:18px;display:flex;justify-content:space-between;font:500 22px "Schibsted Grotesk",Arial;letter-spacing:.06em;text-transform:uppercase;opacity:.8}
`;

function frame(inner: string, series: string, n: number, total: number, foot: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="top"><div class="mark"><span class="b">b</span>AI Broadsheet</div><div class="series">${esc(series)}</div></div>
${inner}<div class="bot"><span>${esc(foot)}</span><span>${n} / ${total}</span></div></body></html>`;
}

/** Headline size that keeps long headlines inside the slide. */
const hSize = (t: string) => (t.length > 90 ? 70 : t.length > 60 ? 80 : 92);

export function slidesFor(a: SlideArticle): string[] {
  const src = a.outlets.slice(0, 3).join(" · ") || "AI Broadsheet Newsroom";
  const total = 5;
  return [
    frame(`<div class="box" style="bottom:150px"><div class="kick" style="margin-bottom:34px"><span class="dot"></span>${esc(a.topic)}</div>
      <div class="h" style="font-size:${hSize(a.headline)}px">${esc(a.headline)}</div></div>`, "The Catch", 1, total, src),
    frame(`<div class="box" style="top:250px"><div class="kick"><span class="dot"></span>The news</div>
      <div class="body" style="margin-top:40px">${esc(a.news)}</div><div class="body gold" style="margin-top:40px;font-size:32px">${esc(a.dek)}</div></div>`, "The Catch", 2, total, src),
    frame(`<div class="box" style="top:250px"><div class="h2 gold">The catch</div>
      <div class="body" style="margin-top:40px">${esc(a.matters)}</div></div>`, "The Catch", 3, total, src),
    frame(`<div class="box" style="top:250px"><div class="h2">Checked against</div>
      ${a.outlets.slice(0, 5).map(o => `<div class="body" style="border-top:1.5px solid rgba(239,232,218,.35);margin-top:26px;padding-top:20px">${esc(o)}</div>`).join("")}
      <div class="body gold" style="margin-top:40px;font-size:30px">Confirmed, claimed and unknown, kept apart on our site.</div></div>`, "The Catch", 4, total, src),
    frame(`<div class="box" style="top:300px;text-align:center"><span style="font:800 260px/1 Brand,Georgia,serif;color:#D7B54A">b</span>
      <div class="h" style="font-size:84px;margin-top:30px">One catch <span class="gold">a day.</span></div>
      <div class="body" style="margin-top:40px">Full story, sources named: aibroadsheet.com</div></div>`, "", 5, total, "Follow @aibroadsheet"),
  ];
}

export async function renderSlides(browser: Browser, a: SlideArticle, dir: string): Promise<string[]> {
  await mkdir(dir, { recursive: true });
  const tab = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const files: string[] = [];
  try {
    for (const [i, html] of slidesFor(a).entries()) {
      await tab.setContent(html, { waitUntil: "networkidle" });
      await tab.evaluate(() => document.fonts.ready);
      const f = join(dir, `${i + 1}.jpg`);
      await tab.screenshot({ path: f, type: "jpeg", quality: 88 });
      files.push(f);
    }
  } finally { await tab.close(); }
  return files;
}
