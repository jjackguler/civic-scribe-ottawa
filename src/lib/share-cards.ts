/**
 * Share cards for Instagram, TikTok, WhatsApp and friends, drawn in the
 * browser on a <canvas> with the page's own fonts. No server, nothing sent.
 *
 *   const canvas = await renderShareCard(content, "collage", "story");
 *
 * Formats: 1080×1350 (feed post, 4:5) and 1080×1920 (story, 9:16; the key
 * text stays clear of the app's own buttons at the top and bottom).
 * Templates: newsprint "front page", night "collage" and yellow "signal",
 * all original artwork (type, torn paper, halftone dots), never a photo.
 * Stories about death, violence or abuse get the sober front page only, with
 * a plain kicker: no cut-out letters on someone's tragedy.
 */
import { BRAND, ransomStyles, rotatePts, tapePoly, tornRect, type Pt } from "./og/shapes";
import { SENSITIVE, rng, seedOf } from "./youth-core";
import type { Bi, Locale } from "./i18n";

export type CardFormat = "portrait" | "story";
export type CardTemplate = "front" | "collage" | "signal";

export const CARD_SIZE: Record<CardFormat, readonly [number, number]> = { portrait: [1080, 1350], story: [1080, 1920] };

export const CARD_TEMPLATES: { id: CardTemplate; label: Bi; hint: Bi }[] = [
  { id: "collage", label: { en: "Collage", fr: "Collage" }, hint: { en: "Torn paper on night", fr: "Papier déchiré sur fond nuit" } },
  { id: "signal", label: { en: "Signal", fr: "Signal" }, hint: { en: "Big type on yellow", fr: "Gros titre sur jaune" } },
  { id: "front", label: { en: "Front page", fr: "La une" }, hint: { en: "Newsprint", fr: "Papier journal" } },
];

export const CARD_FORMATS: { id: CardFormat; label: Bi; hint: Bi }[] = [
  { id: "portrait", label: { en: "Post", fr: "Publication" }, hint: { en: "4:5", fr: "4:5" } },
  { id: "story", label: { en: "Story", fr: "Story" }, hint: { en: "9:16", fr: "9:16" } },
];

export type QuizCardData = { score: number; total: number; marks: boolean[]; streak: number; dayLabel: string };

export type ShareCardContent = {
  locale: Locale;
  kind: "article" | "quiz" | "fact";
  /** "Dispatch", "Policy", "Daily quiz"… */
  kicker: string;
  headline: string;
  /** The news in one line. */
  line?: string;
  /** "Reported by …" */
  source?: string;
  /** Printed on the card, e.g. "aibroadsheet.com/dispatch/abc". */
  url: string;
  /** Anything stable (an id): the same card tears the same way every time. */
  seed: string;
  quiz?: QuizCardData;
  /** Card of the day: the big number ("40%") or short fact. */
  big?: string;
  /** Date line on the front page template. */
  dateLabel?: string;
};

/** True for stories about death, violence or abuse: they get the sober template only. */
export const isSober = (c: ShareCardContent) => SENSITIVE.test(`${c.headline} ${c.line ?? ""}`);

export function templatesFor(c: ShareCardContent): CardTemplate[] {
  return isSober(c) ? ["front"] : CARD_TEMPLATES.map(t => t.id);
}

const L = {
  en: { oneLine: "The news in one line", beat: "Can you beat it?", streak: (n: number) => (n === 1 ? "1-day streak" : `${n}-day streak`), tagline: "The world's AI newspaper", quizName: "The Broadsheet 5", ofDay: "Card of the day" },
  fr: { oneLine: "La nouvelle en une ligne", beat: "Ferez-vous mieux?", streak: (n: number) => (n === 1 ? "1 jour de suite" : `${n} jours de suite`), tagline: "Le journal mondial de l'IA", quizName: "Les 5 du Broadsheet", ofDay: "La carte du jour" },
};

// ── type ────────────────────────────────────────────────────────────────────
const GROT = "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
const SERIF = "Newsreader, Georgia, 'Times New Roman', serif";
const f = (w: number, size: number, fam: string, italic = false) => `${italic ? "italic " : ""}${w} ${Math.round(size)}px ${fam}`;

/** Waits (briefly) for the house fonts, including the subsets this card's letters need. */
export async function loadCardFonts(text: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const specs = [f(900, 80, GROT), f(800, 80, GROT), f(700, 80, GROT), f(600, 80, SERIF), f(700, 80, SERIF), f(500, 80, SERIF, true), f(600, 80, SERIF, true)];
  await Promise.race([
    Promise.all(specs.map(s => document.fonts.load(s, text || "A").catch(() => []))),
    new Promise(r => setTimeout(r, 2500)),
  ]);
}

type Ctx = CanvasRenderingContext2D;

function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(next).width > maxW) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Biggest size that fits `maxLines` lines of `maxW` and `maxH` tall; the smallest size ellipsises. */
function fit(ctx: Ctx, text: string, font: (s: number) => string, sizes: number[], maxW: number, maxLines: number, maxH = Infinity, lh = 1.05): { size: number; lines: string[]; lh: number } {
  for (const size of sizes) {
    ctx.font = font(size);
    const lines = wrap(ctx, text, maxW);
    const h = lines.length * size * lh;
    if (lines.length <= maxLines && h <= maxH && lines.every(l => ctx.measureText(l).width <= maxW)) return { size, lines, lh };
  }
  const size = sizes[sizes.length - 1];
  ctx.font = font(size);
  const n = Math.max(1, Math.min(maxLines, Math.floor(maxH / (size * lh))));
  const lines = wrap(ctx, text, maxW);
  if (lines.length <= n) return { size, lines, lh };
  const kept = lines.slice(0, n);
  let last = kept[n - 1];
  while (last && ctx.measureText(`${last}…`).width > maxW) last = last.replace(/\s*\S+$/, "");
  kept[n - 1] = `${last.replace(/[,;:.\s]+$/, "")}…`;
  return { size, lines: kept, lh };
}

function poly(ctx: Ctx, pts: Pt[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function fillPoly(ctx: Ctx, pts: Pt[], color: string, shadow = 0) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.38)";
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = shadow * 0.45;
  }
  ctx.fillStyle = color;
  poly(ctx, pts);
  ctx.fill();
  ctx.restore();
}

/** A 45° halftone screen whose dots grow toward (cx, cy). */
function halftone(ctx: Ctx, cx: number, cy: number, radius: number, cell: number, color: string, alpha = 1) {
  const k = Math.SQRT1_2;
  const x0 = Math.max(0, cx - radius), x1 = Math.min(ctx.canvas.width, cx + radius);
  const y0 = Math.max(0, cy - radius), y1 = Math.min(ctx.canvas.height, cy + radius);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const uMin = Math.floor(((x0 + y0) * k) / cell), uMax = Math.ceil(((x1 + y1) * k) / cell);
  const vMin = Math.floor(((-x1 + y0) * k) / cell), vMax = Math.ceil(((-x0 + y1) * k) / cell);
  for (let u = uMin; u <= uMax; u++) {
    for (let v = vMin; v <= vMax; v++) {
      const x = (u - v) * cell * k, y = (u + v) * cell * k;
      if (x < x0 - cell || x > x1 + cell || y < y0 - cell || y > y1 + cell) continue;
      const t = 1.05 - Math.hypot(x - cx, y - cy) / radius;
      if (t <= 0.04) continue;
      const r = Math.min(1, t) * cell * 0.5;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }
  }
  ctx.fill();
  ctx.restore();
}

/** The house mark: masthead bar, lead photo, column of type, live dot. */
function mark(ctx: Ctx, x: number, y: number, size: number, on: "dark" | "light") {
  const k = size / 64;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = on === "light" ? BRAND.ink : BRAND.signal;
  ctx.beginPath();
  ctx.roundRect(0, 0, 64, 64, 12);
  ctx.fill();
  ctx.fillStyle = on === "light" ? BRAND.signal : BRAND.ink;
  ctx.fillRect(11, 11, 42, 9);
  ctx.fillRect(11, 26, 20, 27);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(37, 29); ctx.lineTo(53, 29);
  ctx.moveTo(37, 38); ctx.lineTo(53, 38);
  ctx.moveTo(37, 47); ctx.lineTo(45, 47);
  ctx.stroke();
  ctx.fillStyle = BRAND.red;
  ctx.beginPath();
  ctx.arc(51, 48, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Mark + "AI Broadsheet" with its baseline at y. Returns the width. */
function wordmark(ctx: Ctx, x: number, baseline: number, size: number, color: string, on: "dark" | "light", measureOnly = false): number {
  const m = size * 1.05;
  ctx.font = f(600, size, SERIF);
  const w = m + size * 0.32 + ctx.measureText("AI Broadsheet").width;
  if (measureOnly) return w;
  mark(ctx, x, baseline - m * 0.82, m, on);
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("AI Broadsheet", x + m + size * 0.32, baseline);
  return w;
}

/** Ransom-note kicker: one cut-out per letter. Sober cards get a plain label instead. */
function ransom(ctx: Ctx, text: string, x: number, top: number, size: number, seed: number, on: "dark" | "yellow" | "light", sober: boolean): { w: number; h: number } {
  if (sober) {
    ctx.font = f(800, size * 0.62, GROT);
    const w = ctx.measureText(text).width + size * 0.6;
    ctx.fillStyle = on === "dark" ? BRAND.signal : BRAND.ink;
    ctx.fillRect(x, top, w, size * 1.05);
    ctx.fillStyle = on === "dark" ? BRAND.ink : BRAND.white;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + size * 0.3, top + size * 0.55);
    ctx.textBaseline = "alphabetic";
    return { w, h: size * 1.05 };
  }
  const styles = ransomStyles(text, seed, on);
  let pen = x;
  [...text].forEach((ch, i) => {
    if (ch === " ") { pen += size * 0.34; return; }
    const st = styles[i];
    const fs = size * st.scale;
    const fam = st.face === "grotesk" ? GROT : SERIF;
    ctx.font = f(st.weight, fs, fam, st.face === "serif-italic");
    const cw = ctx.measureText(ch).width;
    const padX = fs * 0.17, padY = fs * 0.12;
    const tw = cw + padX * 2, th = fs * 0.74 + padY * 2.4;
    const ty = top + st.dy + (size * 1.05 - th) / 2;
    const cx = pen + tw / 2, cy = ty + th / 2;
    const tile = rotatePts(tornRect(pen, ty, tw, th, seed * 31 + i, { amp: 2.4, step: 5 }), st.rot, cx, cy);
    fillPoly(ctx, tile, st.bg, 6);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((st.rot * Math.PI) / 180);
    ctx.fillStyle = st.fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(ch, 0, th / 2 - padY * 1.25);
    ctx.restore();
    pen += tw + size * 0.07;
  });
  return { w: pen - x, h: size * 1.05 };
}

/** Lines of text with a hand-laid highlighter stroke behind each. */
function highlighted(ctx: Ctx, lines: string[], x: number, firstBaseline: number, size: number, lh: number, font: string, color: string, marker: string, seed: number) {
  ctx.font = font;
  lines.forEach((l, i) => {
    const y = firstBaseline + i * size * lh;
    const w = ctx.measureText(l).width;
    fillPoly(ctx, tornRect(x - size * 0.18, y - size * 0.72, w + size * 0.36, size * 0.95, seed + i * 7, { amp: 3, step: 9, sides: { left: true, right: true } }), marker);
    ctx.fillStyle = color;
    ctx.fillText(l, x, y);
  });
}

function textLines(ctx: Ctx, lines: string[], x: number, firstBaseline: number, size: number, lh: number, font: string, color: string, align: CanvasTextAlign = "left") {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  lines.forEach((l, i) => ctx.fillText(l, x, firstBaseline + i * size * lh));
  ctx.textAlign = "left";
}

/** A small flame (our own drawing) for the quiz streak. */
function flame(ctx: Ctx, x: number, y: number, h: number, color: string) {
  const w = h * 0.72;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, 0);
  ctx.bezierCurveTo(w * 0.62, h * 0.22, w, h * 0.38, w, h * 0.66);
  ctx.bezierCurveTo(w, h * 0.88, w * 0.78, h, w * 0.5, h);
  ctx.bezierCurveTo(w * 0.22, h, 0, h * 0.88, 0, h * 0.64);
  ctx.bezierCurveTo(0, h * 0.44, w * 0.18, h * 0.34, w * 0.26, h * 0.18);
  ctx.bezierCurveTo(w * 0.32, h * 0.32, w * 0.4, h * 0.36, w * 0.44, h * 0.36);
  ctx.bezierCurveTo(w * 0.42, h * 0.22, w * 0.44, h * 0.1, w * 0.5, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.74, w * 0.2, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── the hero: headline, big fact or quiz score ──────────────────────────────
type Palette = { fg: string; accent: string; good: string; bad: string; dotRing: string };
type Hero = { h: number; draw: (x: number, y: number) => void };

function hero(ctx: Ctx, c: ShareCardContent, w: number, maxH: number, pal: Palette, weight: 800 | 900, story: boolean): Hero {
  const T = L[c.locale];
  if (c.kind === "quiz" && c.quiz) {
    const q = c.quiz;
    const numSize = Math.min(340, maxH * 0.55);
    const dotR = Math.min(50, (w - 4 * 26) / 10);
    const h = numSize * 0.78 + 40 + dotR * 2 + 46 + 64 + 30 + 74;
    return {
      h,
      draw: (x, y) => {
        ctx.font = f(600, numSize, SERIF);
        const base = y + numSize * 0.76;
        ctx.fillStyle = pal.fg;
        const s = String(q.score);
        ctx.fillText(s, x, base);
        const sw = ctx.measureText(s).width;
        ctx.globalAlpha = 0.5;
        ctx.font = f(600, numSize * 0.55, SERIF);
        ctx.fillText(` / ${q.total}`, x + sw, base);
        ctx.globalAlpha = 1;
        let yy = base + 40 + dotR;
        q.marks.forEach((ok, i) => {
          const cx = x + dotR + i * (dotR * 2 + 26);
          ctx.fillStyle = ok ? pal.good : pal.bad;
          ctx.beginPath(); ctx.arc(cx, yy, dotR, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = pal.dotRing; ctx.lineWidth = 4; ctx.stroke();
          ctx.strokeStyle = "#fff"; ctx.lineWidth = dotR * 0.22; ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.beginPath();
          if (ok) { ctx.moveTo(cx - dotR * 0.42, yy + 2); ctx.lineTo(cx - dotR * 0.08, yy + dotR * 0.34); ctx.lineTo(cx + dotR * 0.46, yy - dotR * 0.34); }
          else { ctx.moveTo(cx - dotR * 0.34, yy - dotR * 0.34); ctx.lineTo(cx + dotR * 0.34, yy + dotR * 0.34); ctx.moveTo(cx + dotR * 0.34, yy - dotR * 0.34); ctx.lineTo(cx - dotR * 0.34, yy + dotR * 0.34); }
          ctx.stroke();
        });
        yy += dotR + 46;
        if (q.streak > 0) {
          flame(ctx, x, yy, 60, pal.bad);
          ctx.font = f(800, 40, GROT);
          ctx.fillStyle = pal.fg;
          ctx.fillText(T.streak(q.streak), x + 58, yy + 46);
        } else {
          ctx.font = f(700, 34, GROT);
          ctx.fillStyle = pal.fg;
          ctx.fillText(q.dayLabel, x, yy + 40);
        }
        yy += 64 + 30;
        ctx.font = f(weight, 66, GROT);
        ctx.fillStyle = pal.accent;
        ctx.fillText(T.beat, x, yy + 50);
      },
    };
  }
  if (c.kind === "fact" && c.big) {
    const big = fit(ctx, c.big, s => f(900, s, GROT), [320, 280, 240, 200, 170, 140, 120], w, 2, maxH * 0.5, 0.92);
    const bigH = big.lines.length * big.size * 0.92;
    const sub = fit(ctx, c.headline, s => f(weight, s, GROT), [70, 62, 56, 50, 44, 40], w, story ? 5 : 4, Math.max(120, maxH - bigH - 36), 1.06);
    const subH = sub.lines.length * sub.size * 1.06;
    return {
      h: bigH + 36 + subH,
      draw: (x, y) => {
        textLines(ctx, big.lines, x, y + big.size * 0.76, big.size, 0.92, f(900, big.size, GROT), pal.accent);
        textLines(ctx, sub.lines, x, y + bigH + 36 + sub.size * 0.78, sub.size, 1.06, f(weight, sub.size, GROT), pal.fg);
      },
    };
  }
  const sizes = weight === 900 ? [140, 128, 116, 106, 96, 88, 80, 72, 64, 58, 52] : [124, 112, 102, 94, 86, 78, 70, 64, 58, 52];
  const hl = fit(ctx, c.headline, s => f(weight, s, GROT), sizes, w, story ? 8 : 7, maxH, 1.03);
  return {
    h: hl.lines.length * hl.size * 1.03,
    draw: (x, y) => textLines(ctx, hl.lines, x, y + hl.size * 0.78, hl.size, 1.03, f(weight, hl.size, GROT), pal.fg),
  };
}

/** "The news in one line": a label and the line, sized to fit. */
function lineBlock(ctx: Ctx, c: ShareCardContent, w: number, maxLines: number) {
  if (!c.line) return null;
  const t = fit(ctx, c.line, s => f(500, s, SERIF, true), [50, 46, 42, 38, 34], w, maxLines, Infinity, 1.24);
  return { ...t, h: 40 + t.lines.length * t.size * 1.24 };
}

// ── templates ───────────────────────────────────────────────────────────────
type Frame = { W: number; H: number; top: number; bottom: number; M: number; story: boolean; seed: number; sober: boolean };

function front(ctx: Ctx, c: ShareCardContent, fr: Frame) {
  const { W, H, top, bottom, M, story, seed, sober } = fr;
  const T = L[c.locale];
  ctx.fillStyle = "#F3EFE6";
  ctx.fillRect(0, 0, W, H);
  if (!sober) halftone(ctx, W + 60, top + 330, 300, 22, BRAND.ink, 0.12);

  // Masthead
  ctx.fillStyle = BRAND.ink;
  ctx.fillRect(M, top, W - 2 * M, 8);
  const wmW = wordmark(ctx, 0, 0, 74, BRAND.ink, "light", true);
  wordmark(ctx, (W - wmW) / 2, top + 98, 74, BRAND.ink, "light");
  ctx.fillRect(M, top + 128, W - 2 * M, 2);
  ctx.font = f(700, 24, GROT);
  ctx.fillText((c.dateLabel ?? "").toUpperCase(), M, top + 162);
  ctx.textAlign = "right";
  ctx.fillText(T.tagline.toUpperCase(), W - M, top + 162);
  ctx.textAlign = "left";
  ctx.fillRect(M, top + 180, W - 2 * M, 2);

  const kick = ransom(ctx, c.kicker.toUpperCase(), M, top + 222, 56, seed % 997, "light", sober);

  // Footer band (sized to its text), then fit the rest between.
  const foot = footer(ctx, c, W - 2 * M, BRAND.ink, BRAND.ink);
  const bandTop = bottom - foot.h - 52;
  const heroTop = top + 222 + kick.h + 44;
  const lb = lineBlock(ctx, c, W - 2 * M, story ? 5 : 4);
  const room = bandTop - 50 - heroTop - (lb ? lb.h + 44 : 0);
  const h = hero(ctx, c, W - 2 * M, room, { fg: BRAND.ink, accent: BRAND.red, good: BRAND.spruce, bad: BRAND.red, dotRing: BRAND.ink }, 800, story);
  h.draw(M, heroTop);

  if (lb) {
    const y = heroTop + h.h + 44;
    ctx.font = f(800, 24, GROT);
    ctx.fillStyle = BRAND.red;
    ctx.fillText(T.oneLine.toUpperCase(), M, y + 22);
    highlighted(ctx, lb.lines, M, y + 40 + lb.size * 0.9, lb.size, 1.24, f(500, lb.size, SERIF, true), BRAND.ink, sober ? "rgba(17,17,17,0.06)" : "rgba(245,196,0,0.85)", seed);
  }

  // Torn yellow band: source and address.
  fillPoly(ctx, tornRect(-20, bandTop, W + 40, H - bandTop + 30, seed + 3, { amp: 9, step: 11, sides: { top: true } }), sober ? "#E5DFD2" : BRAND.signal, 10);
  foot.draw(M, bandTop + 40);
}

/** Source line(s) and the address, measured first so every template can make room for them. */
function footer(ctx: Ctx, c: ShareCardContent, w: number, color: string, urlColor: string) {
  const src = c.source ? fit(ctx, c.source, sz => f(700, sz, GROT), [30, 27, 24], w, 2, Infinity, 1.2) : null;
  const url = fit(ctx, c.url, sz => f(800, sz, GROT), [30, 26, 22], w, 1);
  const srcH = src ? src.lines.length * src.size * 1.2 + 12 : 0;
  return {
    h: srcH + url.size,
    /** Draws with the block's top edge at y. */
    draw: (x: number, y: number) => {
      if (src) textLines(ctx, src.lines, x, y + src.size * 0.86, src.size, 1.2, f(700, src.size, GROT), color);
      textLines(ctx, url.lines.slice(0, 1), x, y + srcH + url.size * 0.86, url.size, 1, f(800, url.size, GROT), urlColor);
    },
  };
}

function collage(ctx: Ctx, c: ShareCardContent, fr: Frame) {
  const { W, H, top, bottom, M, story, seed, sober } = fr;
  const T = L[c.locale];
  const r = rng(seed);
  ctx.fillStyle = BRAND.night;
  ctx.fillRect(0, 0, W, H);
  halftone(ctx, W + 30, top - 40, 560, 26, BRAND.signal, 0.85);
  halftone(ctx, -80, H * 0.48, 340, 24, BRAND.brass, 0.4);

  wordmark(ctx, M, top + 52, 46, BRAND.white, "dark");
  const kick = ransom(ctx, c.kicker.toUpperCase(), M, top + 104, 64, seed % 997, "dark", sober);

  // The sheet: sized to its contents, pinned askew with two strips of tape.
  const sheetX = M - 18, sheetW = W - 2 * M + 36, pad = 52;
  const sheetTop = top + 104 + kick.h + 54;
  const lb = lineBlock(ctx, c, W - 2 * M - 70, story ? 5 : 4);
  const foot = footer(ctx, c, W - 2 * M, "rgba(255,255,255,0.86)", BRAND.signal);
  const room = bottom - foot.h - 40 - sheetTop - pad * 2 - (lb ? lb.h + 96 : 0);
  const h = hero(ctx, c, sheetW - pad * 2, room, { fg: BRAND.ink, accent: BRAND.red, good: BRAND.spruce, bad: BRAND.red, dotRing: BRAND.ink }, 800, story);
  const sheetH = h.h + pad * 2;
  const rot = -1.8 + r() * 0.8, cx = sheetX + sheetW / 2, cy = sheetTop + sheetH / 2;
  fillPoly(ctx, rotatePts(tornRect(sheetX, sheetTop, sheetW, sheetH, seed + 1, { amp: 9, step: 10 }), rot, cx, cy), BRAND.paper, 22);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  h.draw(sheetX + pad, sheetTop + pad);
  ctx.restore();
  for (const [tx, tr] of [[sheetX + 70, -28], [sheetX + sheetW - 70, 24]] as const) {
    fillPoly(ctx, rotatePts(tapePoly(tx, sheetTop + 4, 170, 50, seed + tx), tr + rot, tx, sheetTop + 4), "rgba(236,226,196,0.86)", 4);
  }

  // The news in one line, on a black torn strip.
  let y = sheetTop + sheetH + 40;
  if (lb) {
    const sh = lb.h + 56, sx = M - 6, sw = W - 2 * M + 12, srot = 1.2;
    const scx = sx + sw / 2, scy = y + sh / 2;
    fillPoly(ctx, rotatePts(tornRect(sx, y, sw, sh, seed + 5, { amp: 7, step: 9 }), srot, scx, scy), BRAND.ink, 16);
    ctx.save();
    ctx.translate(scx, scy);
    ctx.rotate((srot * Math.PI) / 180);
    ctx.translate(-scx, -scy);
    ctx.font = f(800, 24, GROT);
    ctx.fillStyle = BRAND.signal;
    ctx.fillText(T.oneLine.toUpperCase(), sx + 36, y + 50);
    textLines(ctx, lb.lines, sx + 36, y + 28 + 40 + lb.size * 0.9, lb.size, 1.24, f(500, lb.size, SERIF, true), BRAND.white);
    ctx.restore();
    y += sh + 20;
  }
  foot.draw(M, Math.max(y + 24, bottom - foot.h));
}

function signal(ctx: Ctx, c: ShareCardContent, fr: Frame) {
  const { W, H, top, bottom, M, story, seed, sober } = fr;
  const T = L[c.locale];
  ctx.fillStyle = BRAND.signal;
  ctx.fillRect(0, 0, W, H);
  halftone(ctx, W + 40, top - 40, 330, 24, BRAND.ink, 0.9);

  const kick = ransom(ctx, c.kicker.toUpperCase(), M, top + 30, 62, seed % 997, "yellow", sober);
  const heroTop = top + 30 + kick.h + 60;

  // Night band along the bottom, sized to the wordmark, source and address.
  const foot = footer(ctx, c, W - 2 * M, "rgba(255,255,255,0.84)", BRAND.signal);
  const bandTop = bottom - foot.h - 46 - 70;
  const lb = lineBlock(ctx, c, W - 2 * M - 64, story ? 5 : 4);
  const room = bandTop - 50 - heroTop - (lb ? lb.h + 100 : 0);
  const h = hero(ctx, c, W - 2 * M, room, { fg: BRAND.ink, accent: BRAND.ink, good: BRAND.spruce, bad: BRAND.red, dotRing: BRAND.ink }, 900, story);
  h.draw(M, heroTop);

  if (lb) {
    const y = heroTop + h.h + 50;
    const sh = lb.h + 50;
    fillPoly(ctx, tornRect(M - 8, y, W - 2 * M + 16, sh, seed + 2, { amp: 6, step: 8 }), BRAND.white, 0);
    ctx.font = f(800, 24, GROT);
    ctx.fillStyle = BRAND.red;
    ctx.fillText(T.oneLine.toUpperCase(), M + 28, y + 46);
    textLines(ctx, lb.lines, M + 28, y + 24 + 40 + lb.size * 0.9, lb.size, 1.24, f(500, lb.size, SERIF, true), BRAND.ink);
  }

  fillPoly(ctx, tornRect(-20, bandTop, W + 40, H - bandTop + 40, seed + 4, { amp: 10, step: 12, sides: { top: true } }), BRAND.night, 0);
  wordmark(ctx, M, bandTop + 82, 44, BRAND.white, "dark");
  foot.draw(M, bandTop + 116);
}

/** Draws a card. Fonts are loaded first; the canvas is returned for preview, download or sharing. */
export async function renderShareCard(c: ShareCardContent, template: CardTemplate, format: CardFormat, canvas?: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const [W, H] = CARD_SIZE[format];
  const cv = canvas ?? document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  await loadCardFonts(`${c.kicker} ${c.headline} ${c.line ?? ""} ${c.source ?? ""} ${c.big ?? ""} ${c.url} AI Broadsheet ${L[c.locale].oneLine} ${L[c.locale].beat} 0123456789/`);
  const story = format === "story";
  const sober = isSober(c);
  const frame: Frame = {
    W, H, M: 72, story, sober, seed: seedOf(c.seed),
    // Stories keep text clear of the app's own header and reply bar.
    top: story ? 220 : 64,
    bottom: story ? H - 250 : H - 64,
  };
  const tpl = sober ? "front" : template;
  ctx.save();
  ctx.textBaseline = "alphabetic";
  if (tpl === "front") front(ctx, c, frame);
  else if (tpl === "collage") collage(ctx, c, frame);
  else signal(ctx, c, frame);
  ctx.restore();
  return cv;
}

export function canvasToBlob(cv: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}

/** A file name like "aibroadsheet-northwind-labs-releases-collage-story.png". */
export function cardFileName(c: ShareCardContent, template: CardTemplate, format: CardFormat): string {
  const slug = (c.kind === "quiz" ? "quiz-score" : c.headline)
    .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");
  return `aibroadsheet-${slug || "card"}-${template}-${format}.png`;
}
