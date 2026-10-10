/**
 * The collage vocabulary, shared by the server OG renderer (raster.ts) and the
 * browser share cards (canvas): torn-paper polygons, tape, ransom-note letter
 * styles. Deterministic: the same seed always tears the same edge, so a card
 * looks the same every time it's made. Original artwork only: shapes and type,
 * never a photo.
 */
import { rng, seedOf } from "../youth-core";

export type Pt = readonly [number, number];

export const BRAND = {
  signal: "#F5C400",
  ink: "#111111",
  night: "#0B2A2F",
  night2: "#123A40",
  paper: "#F1ECE1",
  newsprint: "#F4F5F2",
  red: "#D7372F",
  brass: "#C9A24D",
  spruce: "#2B6A4E",
  white: "#FFFFFF",
  board: "#1B1A18",
} as const;

export { seedOf };

type Sides = { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };

/**
 * A rectangle with torn edges: small jitter every few pixels and the odd
 * deeper bite, like newsprint ripped by hand. Untorn sides stay straight.
 */
export function tornRect(x: number, y: number, w: number, h: number, seed: number, opts: { amp?: number; step?: number; sides?: Sides } = {}): Pt[] {
  const r = rng(seed);
  const amp = opts.amp ?? 7;
  const step = opts.step ?? 9;
  const sides: Sides = opts.sides ?? { top: true, right: true, bottom: true, left: true };
  const out: Pt[] = [];
  const edge = (ax: number, ay: number, bx: number, by: number, torn: boolean | undefined, nx: number, ny: number) => {
    const len = Math.hypot(bx - ax, by - ay);
    const n = torn ? Math.max(2, Math.round(len / step)) : 1;
    let drift = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      let off = 0;
      if (torn && i > 0) {
        // A wandering line with fine fibres and the occasional deeper bite.
        drift = drift * 0.6 + (r() - 0.5) * amp * 0.9;
        off = drift + (r() - 0.5) * amp * 0.5 + (r() < 0.06 ? -amp * (0.8 + r()) : 0);
        off = Math.max(-amp * 1.6, Math.min(amp * 0.7, off)) - amp * 0.35;
      }
      out.push([ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off]);
    }
  };
  // Outward normals: top (0,-1), right (1,0), bottom (0,1), left (-1,0). Negative offsets bite inward.
  edge(x, y, x + w, y, sides.top, 0, -1);
  edge(x + w, y, x + w, y + h, sides.right, 1, 0);
  edge(x + w, y + h, x, y + h, sides.bottom, 0, 1);
  edge(x, y + h, x, y, sides.left, -1, 0);
  return out;
}

/** A strip of masking tape: a slightly skewed band with torn short ends. */
export function tapePoly(cx: number, cy: number, w: number, h: number, seed: number): Pt[] {
  return tornRect(cx - w / 2, cy - h / 2, w, h, seed, { amp: 4, step: 5, sides: { left: true, right: true } });
}

/** Rotates points about (cx, cy). */
export function rotatePts(pts: Pt[], deg: number, cx: number, cy: number): Pt[] {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as Pt);
}

export type RansomFace = "grotesk" | "serif" | "serif-italic";
export type RansomStyle = { bg: string; fg: string; face: RansomFace; weight: number; rot: number; scale: number; dy: number };

/**
 * Ransom-note letters: each one cut from a different page. The palette stays
 * in the house colours so a kicker reads as ours, not as a threat.
 */
export function ransomStyles(text: string, seed: number, on: "dark" | "yellow" | "light" = "dark"): RansomStyle[] {
  const r = rng(seed);
  const all: Omit<RansomStyle, "rot" | "scale" | "dy">[] = [
    { bg: BRAND.signal, fg: BRAND.ink, face: "grotesk", weight: 900 },
    { bg: BRAND.ink, fg: BRAND.signal, face: "serif", weight: 700 },
    { bg: BRAND.paper, fg: BRAND.ink, face: "serif-italic", weight: 600 },
    { bg: BRAND.red, fg: BRAND.white, face: "grotesk", weight: 800 },
    { bg: BRAND.white, fg: BRAND.night, face: "grotesk", weight: 900 },
    { bg: BRAND.night, fg: BRAND.white, face: "serif", weight: 700 },
  ];
  // A tile the colour of the page would vanish: leave those out.
  const hidden: string[] = on === "dark" ? [BRAND.night, BRAND.ink] : on === "yellow" ? [BRAND.signal] : [BRAND.paper, BRAND.white];
  const looks = all.filter(l => !hidden.includes(l.bg));
  let last = -1;
  return [...text].map(() => {
    let k = Math.floor(r() * looks.length);
    if (k === last) k = (k + 1) % looks.length;
    last = k;
    return { ...looks[k], rot: (r() - 0.5) * 12, scale: 0.9 + r() * 0.22, dy: (r() - 0.5) * 8 };
  });
}

/** "A, B and C" / "A, B et C", with "+N" beyond three. */
export function outletsLine(names: string[], locale: "en" | "fr", max = 3): string {
  const n = names.slice(0, max);
  const and = locale === "fr" ? "et" : "and";
  const more = names.length - n.length;
  if (more > 0) return `${n.join(", ")} ${and} ${more} ${locale === "fr" ? (more > 1 ? "autres" : "autre") : "more"}`;
  return n.length <= 1 ? n.join("") : `${n.slice(0, -1).join(", ")} ${and} ${n[n.length - 1]}`;
}
