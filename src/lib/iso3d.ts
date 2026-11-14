/**
 * A tiny 3D helper for canvas scenes drawn in code (no WebGL, no library):
 * perspective projection, shaded boxes and painter's-order sorting. Used by the
 * Young Lab "3D scenes", in the visual language of the 2026 data audit.
 */

export type Pt = { sx: number; sy: number; depth: number; scale: number };
export type Cam = { yaw: number; pitch: number; cx: number; cy: number; fov: number; dist: number };

export function project(x: number, y: number, z: number, c: Cam): Pt | null {
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const y2 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  const depth = c.dist + z2;
  if (depth <= 1) return null;
  const scale = c.fov / depth;
  return { sx: c.cx + x1 * scale, sy: c.cy - y2 * scale, depth, scale };
}

/** Lighten or darken a #rrggbb colour. */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const ch = (v: number) => Math.min(255, Math.max(0, Math.round(v * f)));
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

const FACES: { idx: [number, number, number, number]; f: number }[] = [
  { idx: [4, 5, 6, 7], f: 1.08 }, // top
  { idx: [0, 1, 5, 4], f: 0.9 },
  { idx: [1, 2, 6, 5], f: 0.74 },
  { idx: [2, 3, 7, 6], f: 0.96 },
  { idx: [3, 0, 4, 7], f: 0.82 },
];

export type Box = { depth: number; corners: Pt[]; draw: (ctx: CanvasRenderingContext2D) => void; hit: (x: number, y: number) => boolean };

/** A box standing on the floor (y = 0 to h), centred on (x, z). */
export function box(
  x: number, z: number, w: number, d: number, h: number, color: string, c: Cam,
  opts: { y0?: number; stroke?: string; lineWidth?: number; lift?: number } = {},
): Box | null {
  const hw = w / 2, hd = d / 2, y0 = opts.y0 ?? 0;
  const corners = [
    [-hw, y0, -hd], [hw, y0, -hd], [hw, y0, hd], [-hw, y0, hd],
    [-hw, y0 + h, -hd], [hw, y0 + h, -hd], [hw, y0 + h, hd], [-hw, y0 + h, hd],
  ].map(p => project(x + p[0], p[1], z + p[2], c));
  if (corners.some(p => !p)) return null;
  const pts = corners as Pt[];
  const depth = pts.reduce((s, p) => s + p.depth, 0) / 8;
  const lift = opts.lift ?? 1;
  return {
    depth,
    corners: pts,
    draw: ctx => {
      const faces = FACES.map(f => ({ ...f, d: f.idx.reduce((s, i) => s + pts[i].depth, 0) / 4 })).sort((a, b) => b.d - a.d);
      for (const f of faces) {
        ctx.beginPath();
        f.idx.forEach((i, k) => (k ? ctx.lineTo(pts[i].sx, pts[i].sy) : ctx.moveTo(pts[i].sx, pts[i].sy)));
        ctx.closePath();
        ctx.fillStyle = shade(color, f.f * lift);
        ctx.fill();
        ctx.strokeStyle = opts.stroke ?? "rgba(20,20,19,0.55)";
        ctx.lineWidth = opts.lineWidth ?? 1.2;
        ctx.stroke();
      }
    },
    hit: (mx, my) => {
      const xs = pts.map(p => p.sx), ys = pts.map(p => p.sy);
      return mx >= Math.min(...xs) && mx <= Math.max(...xs) && my >= Math.min(...ys) && my <= Math.max(...ys);
    },
  };
}
