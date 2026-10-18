/**
 * Our own "newspaper pages" for the collage backgrounds, so an explainer uses
 * only AI Broadsheet visuals: Ink & Gold typography set from the story's own
 * source headlines, printed as black-and-white broadsheet pages. Writes
 * newsprint/page-a.jpg and page-b.jpg into the kit folder the renderer reads.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const BODONI = "https://aibroadsheet.com/__l5e/assets-v1/fe207202-f955-4cbd-8938-c7442dcd502f/bodoni-moda-brand.woff";

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function page(headlines: string[], body: string, seed: number): string {
  const h = headlines.length ? headlines : ["AI Broadsheet"];
  const cols = Array.from({ length: 4 }, (_, i) => {
    const head = h[(seed + i) % h.length];
    return `<div class="col"><b>${esc(head)}</b>${esc(body).repeat(9)}</div>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Brand;src:url("${BODONI}") format("woff")}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1400px;height:2000px;background:#EFE8DA;color:#16181A;font:400 21px/1.45 Georgia,serif;padding:70px 60px;overflow:hidden}
.mast{display:flex;align-items:center;justify-content:space-between;border-bottom:6px double #16181A;padding-bottom:18px}
.mast span{font:800 96px/1 Brand,Georgia,serif;text-transform:uppercase;letter-spacing:-1px}
.mast i{font:italic 700 34px Brand,Georgia,serif}
.lead{font:800 118px/.92 Brand,Georgia,serif;text-transform:uppercase;margin:34px 0 26px;letter-spacing:-1px}
.cols{columns:4;column-gap:34px;text-align:justify;hyphens:auto;column-rule:1px solid rgba(22,24,26,.35)}
.col b{display:block;font:800 40px/1.02 Brand,Georgia,serif;text-transform:uppercase;margin:4px 0 12px;text-align:left}
</style></head><body><div class="mast"><span>AI Broadsheet</span><i>One catch a day.</i></div>
<div class="lead">${esc(h[seed % h.length])}</div><div class="cols">${cols}</div></body></html>`;
}

export async function renderOwnPages(kitDir: string, headlines: string[], body: string): Promise<void> {
  const out = join(kitDir, "newsprint");
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    const tab = await browser.newPage({ viewport: { width: 1400, height: 2000 } });
    for (const [k, name] of ["page-a.jpg", "page-b.jpg"].entries()) {
      await tab.setContent(page(headlines, body, k), { waitUntil: "networkidle" });
      await tab.evaluate(() => document.fonts.ready);
      await tab.screenshot({ path: join(out, name), type: "jpeg", quality: 82 });
    }
  } finally { await browser.close(); }
}
