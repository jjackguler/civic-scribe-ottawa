/**
 * The Open Graph cards (1200×630) for our own pages: a dispatch, the daily
 * quiz and a section. Typographic, in the house colours, set big enough to
 * read as a thumbnail in a chat or a feed. Server only: loaded lazily by the
 * /og/* routes, so the outlines never reach the browser.
 */
import { G700, G800, S600 } from "./font-data";
import { Raster, fitText, hex, measure, mul, rotateAbout, roundRectPoly, type FontData, type Mat, type Pt, type RGB } from "./raster";
import { BRAND, outletsLine, ransomStyles, rotatePts, seedOf, tornRect } from "./shapes";

export const OG_W = 1200;
export const OG_H = 630;

const C = {
  signal: hex(BRAND.signal),
  ink: hex(BRAND.ink),
  night: hex(BRAND.night),
  night2: hex(BRAND.night2),
  paper: hex(BRAND.paper),
  red: hex(BRAND.red),
  brass: hex(BRAND.brass),
  white: hex(BRAND.white),
};

export type OgSpec =
  | { kind: "article"; locale: "en" | "fr"; kicker: string; headline: string; outlets: string[]; id: string }
  | { kind: "quiz"; locale: "en" | "fr"; dayLabel: string }
  | { kind: "section"; locale: "en" | "fr"; name: string; label: string; dek: string };

// ── pieces ───────────────────────────────────────────────────────────────────
/** The house mark: a front page in miniature (masthead bar, lead photo, column of type, live dot). */
function mark(r: Raster, x: number, y: number, size: number, on: "dark" | "light") {
  const k = size / 64;
  const P = (px: number, py: number): Pt => [x + px * k, y + py * k];
  const bg = on === "light" ? C.ink : C.signal;
  const fg = on === "light" ? C.signal : C.ink;
  r.fill([roundRectPoly(x, y, size, size, 12 * k)], bg);
  r.fill([[P(11, 11), P(53, 11), P(53, 20), P(11, 20)]], fg);
  r.fill([[P(11, 26), P(31, 26), P(31, 53), P(11, 53)]], fg);
  for (const [lx, ly, lw] of [[37, 29, 16], [37, 38, 16], [37, 47, 8]] as const) {
    r.fill([roundRectPoly(x + (lx - 2.25) * k, y + (ly - 2.25) * k, (lw + 4.5) * k, 4.5 * k, 2.25 * k)], fg);
  }
  r.circle(x + 51 * k, y + 48 * k, 5 * k, C.red);
}

/** Mark + "AI Broadsheet". Returns the width. */
function wordmark(r: Raster, x: number, baseline: number, size: number, color: RGB, on: "dark" | "light"): number {
  const m = size * 1.05;
  mark(r, x, baseline - m * 0.82, m, on);
  const w = r.text(S600, "AI Broadsheet", x + m + size * 0.32, baseline, size, color);
  return m + size * 0.32 + w;
}

/** Ransom-note kicker: one cut-out tile per letter. Returns the width. */
function ransom(r: Raster, text: string, x: number, top: number, size: number, seed: number, on: "dark" | "yellow" | "light"): number {
  const styles = ransomStyles(text, seed, on);
  let pen = x;
  [...text].forEach((ch, i) => {
    if (ch === " ") { pen += size * 0.32; return; }
    const st = styles[i];
    const font = st.face === "grotesk" ? G800 : S600;
    const fs = size * st.scale;
    const cw = measure(font, ch, fs);
    const padX = fs * 0.16, padY = fs * 0.12;
    const tw = cw + padX * 2;
    const th = font.cap * (fs / font.upem) + padY * 2.4;
    const ty = top + st.dy + (size - th) * 0.5;
    const cx = pen + tw / 2, cy = ty + th / 2;
    const tile = rotatePts(tornRect(pen, ty, tw, th, seed * 31 + i, { amp: 2.2, step: 5 }), st.rot, cx, cy);
    // A soft shadow lifts each cut-out off the page.
    r.fill([tile.map(([px, py]) => [px + 3, py + 4] as Pt)], C.ink, 0.35);
    r.fill([tile], hex(st.bg));
    let m: Mat = rotateAbout(st.rot, cx, cy);
    if (st.face === "serif-italic") m = mul(m, [1, 0, -0.18, 1, 0.18 * (ty + th - padY), 0]);
    r.text(font, ch, pen + padX, ty + th - padY * 1.2, fs, hex(st.fg), { m });
    pen += tw + size * 0.06;
  });
  return pen - x;
}

/** Halftone dots fading away from a corner. */
function dotsFrom(r: Raster, cx: number, cy: number, radius: number, color: RGB, cell = 18, alpha = 1) {
  r.halftone(cx - radius, cy - radius, radius * 2, radius * 2, cell, color, (x, y) => 1.05 - Math.hypot(x - cx, y - cy) / radius, alpha);
}

function headlineBlock(r: Raster, font: FontData, text: string, x: number, top: number, maxW: number, maxH: number, sizes: number[], maxLines: number, color: RGB, lh = 1.04) {
  // Pick the biggest size that fits both the width and the height.
  const usable = sizes.filter(s => {
    const lines = Math.max(1, Math.floor((maxH - font.cap * (s / font.upem)) / (s * lh)) + 1);
    return lines >= 1 && fitText(font, text, [s], maxW, Math.min(maxLines, lines)).size === s && fitsWhole(font, text, s, maxW, Math.min(maxLines, lines));
  });
  const size = usable[0] ?? sizes[sizes.length - 1];
  const linesAllowed = Math.min(maxLines, Math.max(1, Math.floor((maxH - font.cap * (size / font.upem)) / (size * lh)) + 1));
  const { lines } = fitText(font, text, [size], maxW, linesAllowed);
  const cap = font.cap * (size / font.upem);
  lines.forEach((l, i) => r.text(font, l, x, top + cap + i * size * lh, size, color, { tracking: -0.012 }));
  return { size, lines, bottom: top + cap + (lines.length - 1) * size * lh };
}

function fitsWhole(font: FontData, text: string, size: number, maxW: number, maxLines: number) {
  const { lines } = fitText(font, text, [size], maxW, maxLines);
  return !lines[lines.length - 1]?.endsWith("…");
}

// ── the three cards ──────────────────────────────────────────────────────────
function article(spec: Extract<OgSpec, { kind: "article" }>): Raster {
  const r = new Raster(OG_W, OG_H, C.night);
  const seed = seedOf(spec.id);
  // Night board with a yellow dot screen breaking in from the top right.
  dotsFrom(r, OG_W + 20, -40, 430, C.signal, 20, 0.85);
  r.rect(0, 0, 14, OG_H, C.signal);

  ransom(r, spec.kicker.toUpperCase(), 62, 46, 46, seed % 997, "dark");

  // Torn yellow band along the bottom, then the headline above it.
  const bandTop = 492;
  r.fill([tornRect(-20, bandTop, OG_W + 40, OG_H - bandTop + 30, seed, { amp: 9, step: 11, sides: { top: true } })], C.ink, 0.45, [1, 0, 0, 1, 0, 5]);
  r.fill([tornRect(-20, bandTop, OG_W + 40, OG_H - bandTop + 30, seed, { amp: 9, step: 11, sides: { top: true } })], C.signal);

  headlineBlock(r, G800, spec.headline, 62, 134, 1070, 334, [120, 108, 98, 90, 84, 76, 70, 64, 58, 52, 47], 4, C.white);

  const wm = wordmark(r, 62, 585, 40, C.ink, "light");
  // "Reported by …", right-aligned in the band: as many outlets as fit, then "and N more".
  const right = OG_W - 56;
  const avail = right - (62 + wm + 48);
  const by = spec.locale === "fr" ? "D'après" : "Reported by";
  let line = "", size = 25;
  for (const n of [3, 2, 1]) {
    for (const fs of [27, 25, 23]) {
      const l = `${by} ${outletsLine(spec.outlets, spec.locale, n)}`;
      if (!line && measure(G700, l, fs) <= avail) { line = l; size = fs; }
    }
  }
  if (!line) { const f = fitText(G700, `${by} ${outletsLine(spec.outlets, spec.locale, 1)}`, [23], avail, 1); line = f.lines[0] ?? ""; size = 23; }
  if (spec.outlets.length > 0) r.text(G700, line, right - measure(G700, line, size), 563, size, C.ink);
  const dom = "aibroadsheet.com";
  const dw = measure(G700, dom, 21);
  r.text(G700, dom, right - dw, 596, 21, C.ink, { alpha: 0.72 });
  return r;
}

function quiz(spec: Extract<OgSpec, { kind: "quiz" }>): Raster {
  const fr = spec.locale === "fr";
  const r = new Raster(OG_W, OG_H, C.signal);
  const seed = seedOf(`quiz:${spec.dayLabel}`);
  dotsFrom(r, OG_W + 40, OG_H + 60, 520, C.ink, 22, 0.9);

  ransom(r, fr ? "QUIZ DU JOUR" : "DAILY QUIZ", 62, 44, 42, 4242, "yellow");
  r.text(S600, fr ? "Les 5 du Broadsheet" : "The Broadsheet 5", 62, 178, 58, C.ink);

  const big = fr ? "Pouvez-vous faire 5/5?" : "Can you get 5/5?";
  headlineBlock(r, G800, big, 58, 206, 860, 230, [124, 112, 100, 90, 80], 2, C.ink, 0.98);

  // Five answer dots, still to be played.
  for (let i = 0; i < 5; i++) {
    const cx = 92 + i * 74, cy = 470;
    r.circle(cx, cy, 29, C.night);
    const n = String(i + 1);
    const w = measure(G800, n, 30);
    r.text(G800, n, cx - w / 2, cy + 11, 30, C.signal);
  }

  // The date on a torn black strip, as long as its words.
  const stripTop = 530;
  const day = fitText(G700, `${spec.dayLabel} · 5 questions, 2 minutes`, [32, 29, 26], 760, 1);
  const dayW = measure(G700, day.lines[0] ?? "", day.size);
  const sw = dayW + 64, scx = 36 + sw / 2;
  const strip = rotatePts(tornRect(36, stripTop, sw, 68, seed, { amp: 5, step: 8 }), -1.2, scx, stripTop + 34);
  r.fill([strip], C.ink);
  r.text(G700, day.lines[0] ?? "", 68, stripTop + 46, day.size, C.white, { m: rotateAbout(-1.2, scx, stripTop + 34) });

  // The wordmark sits top right, on clean yellow.
  const wmSize = 34;
  const wmW = measure(S600, "AI Broadsheet", wmSize) + wmSize * 1.05 + wmSize * 0.32;
  wordmark(r, OG_W - 56 - wmW, 84, wmSize, C.ink, "light");
  return r;
}

function section(spec: Extract<OgSpec, { kind: "section" }>): Raster {
  const fr = spec.locale === "fr";
  const r = new Raster(OG_W, OG_H, C.night);
  const seed = seedOf(`section:${spec.name}`);
  dotsFrom(r, OG_W + 30, OG_H * 0.45, 430, C.signal, 20, 0.85);

  // A torn sheet of newsprint, pinned slightly askew, sized to what it carries.
  const sx = 40, sw = 860, padX = 56, padY = 52;
  // Two lines when that still reads well, three when the line would get small.
  const dek2 = fitText(G700, spec.dek, [34, 31, 28], sw - padX * 2, 2);
  const dek = dek2.lines[dek2.lines.length - 1]?.endsWith("…") ? fitText(G700, spec.dek, [34, 31, 28, 25, 23], sw - padX * 2, 3) : dek2;
  const dekH = dek.lines.length * dek.size * 1.22;
  // The biggest name (up to three lines) that keeps the sheet off the wordmark band.
  const heightOf = (n: { size: number; lines: string[] }) => {
    const cp = S600.cap * (n.size / S600.upem);
    return padY + cp + (n.lines.length - 1) * n.size + n.size * 0.24 + 26 + dekH + padY * 0.8;
  };
  const sizes = [150, 132, 116, 100, 88, 78, 68, 60];
  let name = fitText(S600, spec.label, [sizes[sizes.length - 1]], sw - padX * 2, 3);
  for (const s of sizes) {
    const n = fitText(S600, spec.label, [s], sw - padX * 2, 3);
    if (!n.lines[n.lines.length - 1]?.endsWith("…") && heightOf(n) <= 420) { name = n; break; }
  }
  const cap = S600.cap * (name.size / S600.upem);
  const sh = heightOf(name);
  const sy = Math.max(104, 300 - sh / 2);
  const rot = -1.6, cx = sx + sw / 2, cy = sy + sh / 2;
  const sheet = rotatePts(tornRect(sx, sy, sw, sh, seed, { amp: 8, step: 10 }), rot, cx, cy);
  r.fill([sheet.map(([x, y]) => [x + 6, y + 9] as Pt)], C.ink, 0.5);
  r.fill([sheet], C.paper);
  const m = rotateAbout(rot, cx, cy);

  let y = sy + padY + cap;
  name.lines.forEach((l, i) => {
    const w = measure(S600, l, name.size);
    // Highlighter swipe behind the name.
    r.fill([tornRect(sx + padX - 12, y - cap * 0.55, w + 30, cap * 0.62, seed + i, { amp: 3, step: 9, sides: { left: true, right: true } })], C.signal, 1, m);
    r.text(S600, l, sx + padX, y, name.size, C.ink, { m });
    if (i < name.lines.length - 1) y += name.size;
  });
  let dy = y + name.size * 0.24 + 26 + dek.size * 0.95;
  dek.lines.forEach(l => { r.text(G700, l, sx + padX, dy, dek.size, C.ink, { m, alpha: 0.86 }); dy += dek.size * 1.22; });

  ransom(r, fr ? "RUBRIQUE" : "SECTION", 56, 30, 40, 777, "dark");

  // Yellow torn strip with the wordmark, bottom right.
  const bx = 620, by = 528;
  r.fill([tornRect(bx, by, 600, 120, seed + 9, { amp: 7, step: 9, sides: { top: true, left: true } })], C.signal);
  wordmark(r, bx + 46, by + 64, 36, C.ink, "light");
  return r;
}

/** Renders one card to PNG bytes. */
export async function renderOg(spec: OgSpec): Promise<Uint8Array<ArrayBuffer>> {
  const r = spec.kind === "article" ? article(spec) : spec.kind === "quiz" ? quiz(spec) : section(spec);
  return r.png();
}
