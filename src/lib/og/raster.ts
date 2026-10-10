/**
 * A very small rasteriser for our Open Graph images: anti-aliased polygon and
 * glyph fills into an RGB buffer, a PNG encoder on the platform's own
 * CompressionStream, and nothing else. No WASM, no font engine, no deps, so
 * it adds a few kilobytes to the Worker instead of megabytes (satori + resvg).
 *
 * Coverage is computed with signed-area accumulation (the technique from
 * font-rs): every edge deposits its area into an accumulation buffer, and a
 * running sum along each row gives exact per-pixel coverage. Overlapping
 * contours in the same direction clamp to full, holes cancel out.
 */

export type RGB = readonly [number, number, number];
/** [a, b, c, d, e, f]: x' = a·x + c·y + e, y' = b·x + d·y + f (same as canvas setTransform). */
export type Mat = readonly [number, number, number, number, number, number];
export type Pt = readonly [number, number];
/** A shape: one or more closed polygons, in pixels. */
export type Poly = Pt[][];

export type FontData = {
  upem: number;
  asc: number;
  desc: number;
  cap: number;
  x: number;
  /** char → [advance, relative outline path (m/l/q/c/z, font units, y up)] */
  glyphs: Record<string, [number, string]>;
  /** "AV" → adjustment in font units */
  kern: Record<string, number>;
};

export const hex = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const ID: Mat = [1, 0, 0, 1, 0, 0];
export function mul(m: Mat, n: Mat): Mat {
  return [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}
/** Rotation by `deg` around (cx, cy). */
export function rotateAbout(deg: number, cx: number, cy: number): Mat {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy];
}
const apply = (m: Mat, x: number, y: number): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

export class Raster {
  readonly w: number;
  readonly h: number;
  readonly px: Uint8Array;
  private acc: Float32Array;
  private stride: number;
  private minX = Infinity; private maxX = -Infinity; private minY = Infinity; private maxY = -Infinity;

  constructor(w: number, h: number, bg: RGB = [255, 255, 255]) {
    this.w = w; this.h = h;
    this.px = new Uint8Array(w * h * 3);
    for (let i = 0; i < w * h; i++) { this.px[i * 3] = bg[0]; this.px[i * 3 + 1] = bg[1]; this.px[i * 3 + 2] = bg[2]; }
    this.stride = w + 3;
    this.acc = new Float32Array(this.stride * h);
  }

  // ── edges ────────────────────────────────────────────────────────────────
  private line(x0: number, y0: number, x1: number, y1: number) {
    // Clip to 0 ≤ x ≤ w: split where the edge crosses a side, then clamp.
    // Clamping keeps each edge's winding: everything left of x = 0 lands in column 0.
    const W = this.w;
    for (const edge of [0, W]) {
      if ((x0 < edge && x1 > edge) || (x0 > edge && x1 < edge)) {
        const t = (edge - x0) / (x1 - x0);
        const ym = y0 + t * (y1 - y0);
        this.line(x0, y0, edge, ym);
        this.line(edge, ym, x1, y1);
        return;
      }
    }
    this.edge(Math.min(W, Math.max(0, x0)), y0, Math.min(W, Math.max(0, x1)), y1);
  }

  private edge(ax: number, ay: number, bx: number, by: number) {
    if (Math.abs(ay - by) < 1e-6) return;
    let dir = 1, x0 = ax, y0 = ay, x1 = bx, y1 = by;
    if (ay > by) { dir = -1; x0 = bx; y0 = by; x1 = ax; y1 = ay; }
    if (y1 <= 0 || y0 >= this.h) return;
    const dxdy = (x1 - x0) / (y1 - y0);
    let x = x0;
    if (y0 < 0) x -= y0 * dxdy;
    const yStart = Math.max(0, Math.floor(y0));
    const yEnd = Math.min(this.h, Math.ceil(y1));
    const a = this.acc, S = this.stride;
    if (yStart < this.minY) this.minY = yStart;
    if (yEnd - 1 > this.maxY) this.maxY = yEnd - 1;
    for (let y = yStart; y < yEnd; y++) {
      const ls = y * S;
      const dy = Math.min(y + 1, y1) - Math.max(y, y0);
      const xn = x + dxdy * dy;
      const d = dy * dir;
      const xa = x < xn ? x : xn, xb = x < xn ? xn : x;
      const xaf = Math.floor(xa), xai = xaf | 0;
      const xbc = Math.ceil(xb), xbi = xbc | 0;
      if (xai < this.minX) this.minX = xai;
      if (xbi + 1 > this.maxX) this.maxX = xbi + 1;
      if (xbi <= xai + 1) {
        const xmf = 0.5 * (x + xn) - xaf;
        a[ls + xai] += d - d * xmf;
        a[ls + xai + 1] += d * xmf;
      } else {
        const s = 1 / (xb - xa);
        const x0f = xa - xaf;
        const a0 = 0.5 * s * (1 - x0f) * (1 - x0f);
        const x1f = xb - xbc + 1;
        const am = 0.5 * s * x1f * x1f;
        a[ls + xai] += d * a0;
        if (xbi === xai + 2) {
          a[ls + xai + 1] += d * (1 - a0 - am);
        } else {
          const a1 = s * (1.5 - x0f);
          a[ls + xai + 1] += d * (a1 - a0);
          for (let xi = xai + 2; xi < xbi - 1; xi++) a[ls + xi] += d * s;
          const a2 = a1 + (xbi - xai - 3) * s;
          a[ls + xbi - 1] += d * (1 - a2 - am);
        }
        a[ls + xbi] += d * am;
      }
      x = xn;
    }
  }

  /** Paints what the queued edges cover, then clears them. */
  private flush(color: RGB, alpha: number) {
    if (this.minY > this.maxY) return;
    const a = this.acc, S = this.stride, px = this.px, W = this.w;
    const x0 = Math.max(0, this.minX), x1 = Math.min(S - 1, this.maxX);
    const [r, g, b] = color;
    for (let y = this.minY; y <= this.maxY; y++) {
      let sum = 0;
      const ls = y * S;
      for (let x = x0; x <= x1; x++) {
        sum += a[ls + x];
        a[ls + x] = 0;
        if (x >= W) continue;
        let c = sum < 0 ? -sum : sum;
        if (c < 0.004) continue;
        if (c > 1) c = 1;
        c *= alpha;
        const i = (y * W + x) * 3;
        px[i] += (r - px[i]) * c + 0.5;
        px[i + 1] += (g - px[i + 1]) * c + 0.5;
        px[i + 2] += (b - px[i + 2]) * c + 0.5;
      }
    }
    this.minX = this.minY = Infinity;
    this.maxX = this.maxY = -Infinity;
  }

  // ── public drawing ───────────────────────────────────────────────────────
  fill(shape: Poly, color: RGB, alpha = 1, m: Mat = ID) {
    for (const ring of shape) {
      if (ring.length < 3) continue;
      let [px0, py0] = apply(m, ring[ring.length - 1][0], ring[ring.length - 1][1]);
      for (const p of ring) {
        const [x, y] = apply(m, p[0], p[1]);
        this.line(px0, py0, x, y);
        px0 = x; py0 = y;
      }
    }
    this.flush(color, alpha);
  }

  rect(x: number, y: number, w: number, h: number, color: RGB, alpha = 1, m: Mat = ID) {
    this.fill([[[x, y], [x + w, y], [x + w, y + h], [x, y + h]]], color, alpha, m);
  }

  circle(cx: number, cy: number, r: number, color: RGB, alpha = 1) {
    this.fill([circlePoly(cx, cy, r)], color, alpha);
  }

  /**
   * Halftone: a 45° dot screen over a box, dot radius from `size(x, y)` in
   * 0..1 of half the cell. Computed per pixel, so hundreds of dots stay cheap.
   */
  halftone(bx: number, by: number, bw: number, bh: number, cell: number, color: RGB, size: (x: number, y: number) => number, alpha = 1) {
    const px = this.px, W = this.w;
    const [r, g, b] = color;
    const k = Math.SQRT1_2;
    for (let y = Math.max(0, by | 0); y < Math.min(this.h, by + bh); y++) {
      for (let x = Math.max(0, bx | 0); x < Math.min(W, bx + bw); x++) {
        const u = (x + 0.5) * k + (y + 0.5) * k, v = -(x + 0.5) * k + (y + 0.5) * k;
        const cu = Math.round(u / cell) * cell, cv = Math.round(v / cell) * cell;
        // Centre of this dot back in pixel space, for its size.
        const cx = (cu - cv) * k, cy = (cu + cv) * k;
        const rad = Math.max(0, Math.min(1, size(cx, cy))) * cell * 0.5;
        if (rad < 0.3) continue;
        const dist = Math.hypot(u - cu, v - cv);
        let c = rad - dist + 0.5;
        if (c <= 0) continue;
        if (c > 1) c = 1;
        c *= alpha;
        const i = (y * W + x) * 3;
        px[i] += (r - px[i]) * c + 0.5;
        px[i + 1] += (g - px[i + 1]) * c + 0.5;
        px[i + 2] += (b - px[i + 2]) * c + 0.5;
      }
    }
  }

  // ── text ─────────────────────────────────────────────────────────────────
  /** Draws one line with its baseline at (x, y). Returns the advance in pixels. */
  text(font: FontData, s: string, x: number, y: number, size: number, color: RGB, opts: { tracking?: number; m?: Mat; alpha?: number } = {}): number {
    const k = size / font.upem;
    const tr = (opts.tracking ?? 0) * size;
    let pen = 0;
    const chars = glyphChars(font, s);
    const shape: Poly = [];
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const g = font.glyphs[ch];
      if (!g) continue;
      const ox = x + pen, oy = y;
      for (const ring of glyphRings(g[1], k)) shape.push(ring.map(([gx, gy]) => [ox + gx, oy - gy] as Pt));
      pen += g[0] * k + tr;
      if (i + 1 < chars.length) pen += kernOf(font, ch, chars[i + 1]) * k;
    }
    this.fill(shape, color, opts.alpha ?? 1, opts.m ?? ID);
    return pen - (chars.length ? tr : 0);
  }

  // ── PNG ──────────────────────────────────────────────────────────────────
  async png(): Promise<Uint8Array<ArrayBuffer>> {
    const { w, h, px } = this;
    const raw = new Uint8Array((w * 3 + 1) * h);
    for (let y = 0; y < h; y++) {
      // Filter 1 (Sub): flat colour runs become zeros and compress to almost nothing.
      const o = y * (w * 3 + 1), p = y * w * 3;
      raw[o] = 1;
      raw[o + 1] = px[p]; raw[o + 2] = px[p + 1]; raw[o + 3] = px[p + 2];
      for (let i = 3; i < w * 3; i++) raw[o + 1 + i] = (px[p + i] - px[p + i - 3]) & 255;
    }
    const z = await deflate(raw);
    const ihdr = new Uint8Array(13);
    const dv = new DataView(ihdr.buffer);
    dv.setUint32(0, w); dv.setUint32(4, h);
    ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", z), chunk("IEND", new Uint8Array(0))];
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  }
}

// ── text helpers ─────────────────────────────────────────────────────────────
/** Flattened outlines, per path and size (a headline reuses its letters many times). */
const ringCache = new Map<string, Pt[][]>();

/** The characters of `s` we can draw: unknown letters lose their accent, or fall back to a close cousin. */
function glyphChars(font: FontData, s: string): string[] {
  const out: string[] = [];
  for (const ch of s.normalize("NFC")) {
    if (font.glyphs[ch]) { out.push(ch); continue; }
    const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (base && [...base].every(c => font.glyphs[c])) { out.push(...base); continue; }
    const alt = FALLBACK[ch];
    if (alt && font.glyphs[alt]) { out.push(alt); continue; }
    if (/\s/.test(ch)) out.push(" ");
  }
  return out;
}
const FALLBACK: Record<string, string> = { "‐": "-", "‑": "-", "‒": "–", "―": "—", "′": "’", "″": "”", " ": " ", " ": " ", "→": ">", "←": "<" };

function kernOf(font: FontData, a: string, b: string): number {
  const base = (c: string) => c.normalize("NFD")[0];
  return font.kern[a + b] ?? font.kern[base(a) + base(b)] ?? 0;
}

/** Glyph outline as polygons in font units (y up), scaled by k, flattened for size. */
function glyphRings(path: string, k: number): Pt[][] {
  const key = `${k.toFixed(4)}|${path}`;
  const hit = ringCache.get(key);
  if (hit) return hit;
  const rings: Pt[][] = [];
  let ring: Pt[] = [];
  let cx = 0, cy = 0;
  const nums = (str: string) => (str.match(/-?\d+/g) ?? []).map(Number);
  for (const m of path.matchAll(/([mlqcz])([^mlqcz]*)/g)) {
    const cmd = m[1], n = nums(m[2]);
    if (cmd === "m") {
      if (ring.length > 2) rings.push(ring);
      cx += n[0]; cy += n[1];
      ring = [[cx * k, cy * k]];
    } else if (cmd === "l") {
      cx += n[0]; cy += n[1];
      ring.push([cx * k, cy * k]);
    } else if (cmd === "q") {
      const p0: Pt = [cx * k, cy * k], p1: Pt = [(cx + n[0]) * k, (cy + n[1]) * k], p2: Pt = [(cx + n[2]) * k, (cy + n[3]) * k];
      quad(ring, p0, p1, p2);
      cx += n[2]; cy += n[3];
    } else if (cmd === "c") {
      const p0: Pt = [cx * k, cy * k], p1: Pt = [(cx + n[0]) * k, (cy + n[1]) * k], p2: Pt = [(cx + n[2]) * k, (cy + n[3]) * k], p3: Pt = [(cx + n[4]) * k, (cy + n[5]) * k];
      cubic(ring, p0, p1, p2, p3);
      cx += n[4]; cy += n[5];
    } else if (cmd === "z") {
      if (ring.length > 2) rings.push(ring);
      ring = [];
    }
  }
  if (ring.length > 2) rings.push(ring);
  if (ringCache.size > 3000) ringCache.clear();
  ringCache.set(key, rings);
  return rings;
}

function quad(out: Pt[], p0: Pt, p1: Pt, p2: Pt) {
  const dx = p0[0] - 2 * p1[0] + p2[0], dy = p0[1] - 2 * p1[1] + p2[1];
  const n = 1 + Math.floor(Math.sqrt(Math.sqrt(dx * dx + dy * dy) / 0.35));
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
}

function cubic(out: Pt[], p0: Pt, p1: Pt, p2: Pt, p3: Pt) {
  const d1 = Math.hypot(p0[0] - 2 * p1[0] + p2[0], p0[1] - 2 * p1[1] + p2[1]);
  const d2 = Math.hypot(p1[0] - 2 * p2[0] + p3[0], p1[1] - 2 * p2[1] + p3[1]);
  const n = 1 + Math.floor(Math.sqrt((1.5 * Math.max(d1, d2)) / 0.35));
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

/** Width of one line of text in pixels. */
export function measure(font: FontData, s: string, size: number, tracking = 0): number {
  const k = size / font.upem;
  const chars = glyphChars(font, s);
  let w = 0;
  for (let i = 0; i < chars.length; i++) {
    const g = font.glyphs[chars[i]];
    if (!g) continue;
    w += g[0] * k;
    if (i + 1 < chars.length) w += kernOf(font, chars[i], chars[i + 1]) * k + tracking * size;
  }
  return w;
}

/** Greedy word wrap. Words longer than the line are kept whole (they shrink the size instead, see fitText). */
export function wrap(font: FontData, s: string, size: number, maxW: number, tracking = 0): string[] {
  const words = s.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(font, next, size, tracking) > maxW) { lines.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * The largest size (from `sizes`, biggest first) at which `s` fits in
 * `maxLines` lines of `maxW`. At the smallest size the last line is cut with
 * an ellipsis.
 */
export function fitText(font: FontData, s: string, sizes: number[], maxW: number, maxLines: number, tracking = 0): { size: number; lines: string[] } {
  for (const size of sizes) {
    const lines = wrap(font, s, size, maxW, tracking);
    if (lines.length <= maxLines && lines.every(l => measure(font, l, size, tracking) <= maxW)) return { size, lines };
  }
  const size = sizes[sizes.length - 1];
  const lines = wrap(font, s, size, maxW, tracking);
  if (lines.length <= maxLines && lines.every(l => measure(font, l, size, tracking) <= maxW)) return { size, lines };
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1] ?? "";
  while (last && measure(font, `${last}…`, size, tracking) > maxW) last = last.replace(/\s*\S+$/, "") || last.slice(0, -1);
  kept[kept.length - 1] = `${last.replace(/[,;:.\s]+$/, "")}…`;
  return { size, lines: kept };
}

// ── shapes ───────────────────────────────────────────────────────────────────
export function circlePoly(cx: number, cy: number, r: number): Pt[] {
  const n = Math.max(12, Math.ceil(r * 1.2));
  return Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), cy + r * Math.sin((i / n) * Math.PI * 2)] as Pt);
}

export function roundRectPoly(x: number, y: number, w: number, h: number, r: number): Pt[] {
  const out: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (i / 6) * (Math.PI / 2);
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return out;
}

// ── PNG plumbing ─────────────────────────────────────────────────────────────
async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate");
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(cs);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

let CRC: Uint32Array | null = null;
function crc32(bytes: Uint8Array): number {
  if (!CRC) {
    CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}
