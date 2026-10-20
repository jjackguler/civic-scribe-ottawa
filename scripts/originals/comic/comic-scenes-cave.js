// The Good Room (an AI Broadsheet Op-Doc): Lascaux, its replica, and the good room we all live in
// now. Ochre and charcoal for the cave; cold white and blue for the copy and the screens.
(() => {
const W = 1920, H = 1080, S = window.COMIC_SCENES;
const K = "#070605", OCHRE = "#C8742E", RUST = "#9A3B1E", CHAR = "#1a1410", ROCK = "#6b5440", FLAME = "#FFB45A", COLD = "#cfe3f2", ICE = "#9FD3FF", PAPER = "#EFE8DA", GREEN = "#5f8a3a", RED = "#D9412B";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));
const lin = (g, y0, y1, st, x0 = 0, x1 = 0) => { const gr = g.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function glow(g, cx, cy, r, col, a) { r = Math.max(1, r); g.save(); g.globalCompositeOperation = "screen"; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); g.restore(); }
function person(g, fx, fy, h, col = K, o = {}) {
  g.save(); g.translate(fx, fy); g.fillStyle = col;
  if (o.child) { h *= 1; }
  g.fillRect(-h * 0.075, -h * 0.37, h * 0.06, h * 0.37); g.fillRect(h * 0.015, -h * 0.37, h * 0.06, h * 0.37);
  g.beginPath(); g.moveTo(-h * 0.12, -h * 0.82); g.quadraticCurveTo(-h * 0.17, -h * 0.55, -h * 0.17, -h * 0.33); g.lineTo(h * 0.17, -h * 0.33); g.quadraticCurveTo(h * 0.17, -h * 0.55, h * 0.12, -h * 0.82); g.quadraticCurveTo(0, -h * 0.87, -h * 0.12, -h * 0.82); g.fill();
  g.beginPath(); g.ellipse(0, -h * 0.89, h * 0.055, h * 0.066, 0, 0, 7); g.fill();
  if (o.hat) { g.beginPath(); g.ellipse(0, -h * 0.93, h * 0.1, h * 0.02, 0, 0, 7); g.fill(); g.fillRect(-h * 0.058, -h * 0.995, h * 0.116, h * 0.065); }
  if (o.lamp) { g.restore(); glow(g, fx + h * 0.2, fy - h * 0.55, h * 0.9, FLAME, 0.55); g.save(); g.translate(fx, fy); g.fillStyle = FLAME; g.beginPath(); g.ellipse(h * 0.2, -h * 0.55, h * 0.03, h * 0.05, 0, 0, 7); g.fill(); }
  g.restore();
}
// Rock: a mottled wall, made once per size and reused.
const rockCache = {};
function rock(g, base = ROCK, seed = 1) {
  const key = base + seed;
  if (!rockCache[key]) {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    x.fillStyle = base; x.fillRect(0, 0, W, H); const r = rng(seed * 7 + 3);
    for (let i = 0; i < 2600; i++) { const px = r() * W, py = r() * H, rr = 8 + r() * 60; x.fillStyle = `rgba(${r() < 0.5 ? "255,235,210" : "20,12,6"},${0.02 + r() * 0.05})`; x.beginPath(); x.ellipse(px, py, rr, rr * (0.4 + r()), r() * 3, 0, 7); x.fill(); }
    x.strokeStyle = "rgba(20,12,6,0.25)"; x.lineWidth = 2; for (let i = 0; i < 40; i++) { x.beginPath(); let px = r() * W, py = r() * H; x.moveTo(px, py); for (let k = 0; k < 8; k++) { px += (r() - 0.5) * 120; py += r() * 60; x.lineTo(px, py); } x.stroke(); }
    rockCache[key] = c;
  }
  g.drawImage(rockCache[key], 0, 0);
}
// Lascaux-style animals in charcoal and ochre. s scales; dir flips.
function horse(g, cx, cy, s, a = 1, dir = 1, col = CHAR, fill = OCHRE) {
  // After the Lascaux "Chinese horses": a heavy belly, short tapered legs, a small head, a dark
  // crest of mane, the body shaded ochre over a paler belly, the outline only where the painter
  // would have pressed the charcoal.
  g.save(); g.translate(cx, cy); g.scale(s * dir, s); g.globalAlpha *= a; g.lineJoin = "round"; g.lineCap = "round";
  const leg = (x0, y0, bend, len, w) => { g.beginPath(); g.moveTo(x0 - w, y0); g.quadraticCurveTo(x0 - w + bend, y0 + len * 0.5, x0 - w * 0.35, y0 + len); g.lineTo(x0 + w * 0.35, y0 + len); g.quadraticCurveTo(x0 + w + bend, y0 + len * 0.5, x0 + w, y0); g.closePath(); g.fill(); };
  g.fillStyle = col; leg(-120, 30, 10, 105, 20); leg(-80, 45, -8, 92, 17); leg(70, 40, 6, 100, 18); leg(110, 30, -10, 108, 17);
  const body = new Path2D("M 140 -40 C 120 -80 40 -95 -40 -88 C -110 -84 -165 -60 -185 -20 C -200 15 -185 50 -150 60 C -80 85 40 90 105 60 C 140 45 150 5 140 -40 Z");
  const gr = g.createLinearGradient(0, -95, 0, 90); gr.addColorStop(0, fill); gr.addColorStop(0.55, rgba(fill, 0.9)); gr.addColorStop(0.75, "rgba(232,205,160,0.85)"); gr.addColorStop(1, "rgba(232,205,160,0.6)");
  g.fillStyle = gr; g.fill(body);
  const neck = new Path2D("M 95 -70 C 125 -110 150 -140 185 -150 C 215 -158 240 -140 245 -118 C 248 -100 238 -88 222 -82 C 200 -74 175 -55 150 -20 C 135 -35 115 -55 95 -70 Z");
  g.fillStyle = fill; g.fill(neck);
  g.fillStyle = col; g.beginPath(); g.ellipse(232, -112, 16, 11, 0.5, 0, 7); g.fill(); // dark muzzle
  g.beginPath(); g.moveTo(100, -78); g.bezierCurveTo(130, -125, 160, -155, 195, -160); g.lineTo(190, -140); g.bezierCurveTo(160, -128, 135, -100, 112, -66); g.closePath(); g.fill(); // mane crest
  g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.moveTo(-150, 60); g.bezierCurveTo(-80, 85, 40, 90, 105, 60); g.stroke(); // belly line
  g.lineWidth = 4; g.beginPath(); g.moveTo(-40, -88); g.bezierCurveTo(-110, -84, -165, -60, -185, -20); g.stroke();
  g.lineWidth = 12; g.beginPath(); g.moveTo(-185, -25); g.bezierCurveTo(-215, -10, -228, 30, -222, 75); g.stroke(); // tail
  g.fillStyle = "rgba(20,12,6,0.18)"; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(-150 + hash(i) * 290, -70 + hash(i + 9) * 120, 3 + hash(i + 4) * 6, 0, 7); g.fill(); } // pigment speckle
  g.restore();
}
function aurochs(g, cx, cy, s, a = 1, dir = 1) {
  g.save(); g.translate(cx, cy); g.scale(s * dir, s); g.globalAlpha *= a;
  g.strokeStyle = CHAR; g.lineWidth = 11; g.lineJoin = "round"; g.lineCap = "round"; g.fillStyle = rgba(CHAR, 0.18);
  g.beginPath(); g.moveTo(-260, 0); g.bezierCurveTo(-240, -110, -60, -130, 80, -110); g.bezierCurveTo(150, -110, 200, -90, 230, -60); g.bezierCurveTo(260, -40, 270, 0, 250, 20); g.bezierCurveTo(220, 40, 180, 50, 150, 60);
  g.lineTo(140, 150); g.moveTo(150, 60); g.bezierCurveTo(60, 80, -100, 80, -200, 50); g.lineTo(-215, 150); g.moveTo(-200, 50); g.bezierCurveTo(-245, 40, -265, 20, -260, 0); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(215, -70); g.bezierCurveTo(240, -150, 300, -170, 320, -130); g.moveTo(200, -75); g.bezierCurveTo(205, -140, 250, -175, 270, -150); g.stroke(); // horns
  g.fillStyle = CHAR; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(-150 + i * 40, -60 + Math.sin(i) * 12, 9, 0, 7); g.fill(); }
  g.restore();
}
function stag(g, cx, cy, s, a = 1, dir = 1) {
  g.save(); g.translate(cx, cy); g.scale(s * dir, s); g.globalAlpha *= a; g.strokeStyle = CHAR; g.lineWidth = 8; g.lineCap = "round"; g.fillStyle = rgba(RUST, 0.6);
  g.beginPath(); g.moveTo(-120, 0); g.bezierCurveTo(-100, -50, 40, -60, 90, -40); g.lineTo(130, -110); g.lineTo(160, -100); g.lineTo(120, -30); g.bezierCurveTo(110, 10, 60, 30, -100, 30); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); for (const [x0, y0, x1, y1] of [[130, -110, 100, -200], [115, -150, 70, -180], [145, -110, 190, -200], [170, -150, 220, -170]]) { g.moveTo(x0, y0); g.lineTo(x1, y1); } g.stroke();
  g.beginPath(); g.moveTo(-90, 30); g.lineTo(-100, 110); g.moveTo(60, 25); g.lineTo(70, 110); g.stroke();
  g.restore();
}
// A photograph (window.COMIC_IMAGES, loaded from story.images), covering a rectangle. fx/fy pick the focus.
function photo(g, key, x0 = 0, y0 = 0, w = W, h = H, fx = 0.5, fy = 0.5, zoom = 1) {
  const im = window.COMIC_IMAGES?.[key]; if (!im) return false;
  const sc = Math.max(w / im.width, h / im.height) * zoom, iw = im.width * sc, ih = im.height * sc;
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.drawImage(im, x0 + (w - iw) * fx, y0 + (h - ih) * fy, iw, ih); g.restore(); return true;
}
function flame(g, u, cx, cy, r, a = 0.6) { const f = 0.85 + 0.15 * Math.sin(u * 9) * Math.sin(u * 4.3 + 1); glow(g, cx, cy, r * f, FLAME, a * f); }
function dark(g, a) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); }
function screenGlow(g, x0, y0, w, h, u) { g.fillStyle = "#0e1a24"; g.fillRect(x0, y0, w, h); g.fillStyle = rgba(COLD, 0.9); g.fillRect(x0 + 8, y0 + 8, w - 16, h - 16); glow(g, x0 + w / 2, y0 + h / 2, Math.max(w, h), ICE, 0.25); }
function lines(g, x0, y0, w, n, col, lh = 26, prog = 1) { g.fillStyle = col; for (let i = 0; i < n; i++) { const p = clamp(prog * n - i); if (p <= 0) break; g.fillRect(x0, y0 + i * lh, w * (0.6 + 0.4 * hash(i + x0)) * p, 9); } }

// ── 1940 ─────────────────────────────────────────────────────────────────────
S["o-hole"] = (g, u) => {
  g.fillStyle = lin(g, 0, H, [[0, "#0a0d1a"], [1, "#1e1a22"]]); g.fillRect(0, 0, W, H);
  const r = rng(3); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(240,235,220,${0.3 + r() * 0.6})`; g.beginPath(); g.arc(r() * W, r() * 600, 0.8 + r() * 1.6, 0, 7); g.fill(); }
  g.fillStyle = "#14110e"; g.beginPath(); g.moveTo(0, 760); g.bezierCurveTo(500, 560, 1300, 520, 1920, 700); g.lineTo(1920, 1080); g.lineTo(0, 1080); g.fill();
  for (let i = 0; i < 9; i++) { g.fillStyle = "#0b0907"; const tx = 120 + i * 220 + (i % 2) * 60; g.beginPath(); g.moveTo(tx, 760 - (i % 3) * 30); g.lineTo(tx - 50, 640 - (i % 3) * 30); g.lineTo(tx + 50, 640 - (i % 3) * 30); g.fill(); g.fillRect(tx - 6, 640, 12, 140); }
  g.fillStyle = "#000"; g.beginPath(); g.ellipse(1000, 760, 120, 36, 0, 0, 7); g.fill();
  flame(g, u, 1000, 790, 260, 0.45);
  [[860, 760, 220], [940, 750, 200], [1080, 752, 210], [1160, 762, 170]].forEach(([fx, fy, h], i) => person(g, fx, fy, h, "#050403", { lamp: i === 1 }));
  g.fillStyle = "#050403"; g.beginPath(); g.ellipse(760, 750, 46, 22, 0, 0, 7); g.fill(); g.fillRect(730, 740, 10, 30); g.fillRect(785, 740, 10, 30); g.beginPath(); g.ellipse(800, 728, 16, 12, 0, 0, 7); g.fill(); // the dog
};
S["o-wall"] = (g, u) => {
  rock(g, "#5a4432", 2);
  const lx = 300 + ((u * 160) % 1500);
  if (!photo(g, "frieze", 0, 0, W, H, 0.5, 0.5, 1.04 + u * 0.004)) { horse(g, 520, 470, 1.1, 1, 1); aurochs(g, 1150, 420, 1.0, 1, -1); stag(g, 1600, 640, 0.9); }
  dark(g, 0.72);
  g.save(); g.globalCompositeOperation = "destination-out"; const gr = g.createRadialGradient(lx, 520, 0, lx, 520, 520); gr.addColorStop(0, "rgba(0,0,0,0.85)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  flame(g, u, lx, 560, 520, 0.4);
};

// ── 1948–1963 ────────────────────────────────────────────────────────────────
S["o-crowds"] = (g, u) => {
  g.fillStyle = lin(g, 0, H, [[0, "#e8d9b8"], [1, "#b89b6c"]]); g.fillRect(0, 0, W, H);
  g.fillStyle = "#3c2d1f"; g.beginPath(); g.moveTo(0, 520); g.bezierCurveTo(600, 360, 1300, 340, 1920, 480); g.lineTo(1920, 1080); g.lineTo(0, 1080); g.fill();
  g.fillStyle = "#0b0907"; g.beginPath(); g.moveTo(1380, 560); g.bezierCurveTo(1420, 430, 1560, 430, 1600, 560); g.fill();
  const n = Math.floor(8 + clamp(u / 5) * 40); const r = rng(9);
  for (let i = 0; i < n; i++) { const t = (i / 48 + u * 0.03) % 1, px = 100 + t * 1330, py = 840 - t * 280; person(g, px + (r() - 0.5) * 30, py, 170 - t * 90, "#1a1410", { hat: r() < 0.4 }); }
};
S["o-sickness"] = (g, u) => {
  rock(g, "#6b5440", 4); if (!photo(g, "horse", 0, 0, W, H, 0.5, 0.45)) horse(g, 960, 560, 1.6, 1, 1);
  const p = clamp(u / 6), r = rng(12);
  for (let i = 0; i < Math.floor(p * 260); i++) { g.fillStyle = rgba(GREEN, 0.25 + r() * 0.35); g.beginPath(); g.ellipse(r() * W, r() * H, 10 + r() * 50, 6 + r() * 30, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < Math.floor(p * 160); i++) { g.fillStyle = `rgba(245,245,240,${0.25 + r() * 0.4})`; g.beginPath(); g.ellipse(r() * W, r() * H, 6 + r() * 30, 4 + r() * 20, r() * 3, 0, 7); g.fill(); }
  glow(g, 960, 300, 900, "#ffffff", 0.18); // the electric light
};
S["o-closed"] = (g, u) => {
  g.fillStyle = "#0a0908"; g.fillRect(0, 0, W, H);
  rock(g, "#2a211a", 5); dark(g, 0.4);
  const p = ease(u / 2.4), dw = 760;
  g.fillStyle = "#3a3d40"; g.fillRect(580, 160, dw / 2 * p, 800); g.fillRect(580 + dw - dw / 2 * p, 160, dw / 2 * p, 800);
  g.strokeStyle = "#1c1e20"; g.lineWidth = 6; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(580, 200 + i * 100); g.lineTo(580 + dw / 2 * p, 200 + i * 100); g.moveTo(1340 - dw / 2 * p, 200 + i * 100); g.lineTo(1340, 200 + i * 100); g.stroke(); }
  if (p < 1) { g.save(); g.beginPath(); g.rect(580 + dw / 2 * p, 160, dw - dw * p, 800); g.clip(); if (!photo(g, "horse", 580, 160, dw, 800, 0.5, 0.4)) horse(g, 960, 560, 1.2, 0.8); g.restore(); }
};

// ── The copy ─────────────────────────────────────────────────────────────────
S["o-replica"] = (g, u) => {
  g.fillStyle = lin(g, 0, H, [[0, "#f4f1ea"], [1, "#d9d4c8"]]); g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.moveTo(200, 120); g.bezierCurveTo(700, 40, 1300, 60, 1740, 140); g.lineTo(1760, 760); g.bezierCurveTo(1200, 820, 700, 820, 160, 760); g.closePath(); g.clip();
  rock(g, "#a88a6a", 6); if (!photo(g, "replica", 160, 40, 1600, 800, 0.5, 0.5)) { horse(g, 620, 420, 1.0); aurochs(g, 1220, 380, 0.9, 1, -1); }
  g.restore();
  glow(g, 960, 300, 1100, "#fff6e0", 0.35);
  g.strokeStyle = rgba(ICE, 0.35); g.lineWidth = 1.5; const sy = 120 + ((u * 120) % 700); g.beginPath(); g.moveTo(160, sy); g.lineTo(1760, sy); g.stroke(); // the scan
  g.fillStyle = "#cfc8b8"; g.fillRect(0, 860, W, 220);
  [[520, 0], [760, 1], [1300, 0], [1460, 1]].forEach(([px, i]) => person(g, px, 960, 300, "#2b2622", { hat: i === 1 }));
};
S["o-split"] = (g, u) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, W / 2, H); glow(g, W / 4, 300, 700, "#fff6e0", 0.4);
  g.save(); g.beginPath(); g.rect(0, 0, W / 2, H); g.clip(); rock(g, "#a88a6a", 6); if (!photo(g, "replica2", 0, 0, W / 2, 820, 0.5, 0.4)) horse(g, 480, 420, 0.9); g.fillStyle = "rgba(244,241,234,0.35)"; g.fillRect(0, 0, W / 2, H); g.fillStyle = "#cfc8b8"; g.fillRect(0, 820, W / 2, 260);
  const r = rng(4); for (let i = 0; i < 14; i++) person(g, 60 + i * 66 + r() * 20, 960 + r() * 30, 220 + r() * 40, "#2b2622"); g.restore();
  g.save(); g.beginPath(); g.rect(W / 2, 0, W / 2, H); g.clip(); rock(g, "#3a2c20", 7); if (!photo(g, "horse", W / 2, 0, W / 2, H, 0.5, 0.4)) horse(g, 1440, 420, 0.9, 0.8); dark(g, 0.86); g.restore();
  g.fillStyle = "#000"; g.fillRect(W / 2 - 3, 0, 6, H);
};
S["o-sensors"] = (g, u) => {
  rock(g, "#2e241b", 8); if (!photo(g, "megaloceros", 0, 0, W, H, 0.5, 0.4)) { horse(g, 760, 500, 1.2, 0.9); aurochs(g, 1300, 440, 0.9, 0.9, -1); } dark(g, 0.8);
  const r = rng(5); for (let i = 0; i < 9; i++) { const px = 200 + r() * 1500, py = 200 + r() * 700, on = (Math.floor(u * 2) + i) % 3 === 0; g.fillStyle = on ? "#ff4a3a" : "#5a1a14"; g.beginPath(); g.arc(px, py, 6, 0, 7); g.fill(); if (on) glow(g, px, py, 50, "#ff4a3a", 0.5); }
  g.strokeStyle = rgba(ICE, 0.5); g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 120; i++) { const xx = 160 + i * 13.3, yy = 960 + Math.sin(i * 0.4 + u * 2) * 18 + Math.sin(i * 1.3) * 6; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
};
S["o-outside"] = (g, u) => {
  g.fillStyle = lin(g, 0, H, [[0, "#d9c39a"], [0.6, "#e9d6b0"], [1, "#8c7450"]]); g.fillRect(0, 0, W, H);
  g.fillStyle = "#a08a64"; g.beginPath(); g.moveTo(0, 700); g.bezierCurveTo(500, 650, 1300, 690, 1920, 640); g.lineTo(1920, 1080); g.lineTo(0, 1080); g.fill();
  const run = (u * 220) % 2600;
  // Wild horses far off on the horizon, dark silhouettes in their own dust.
  for (let i = 0; i < 6; i++) { const hx = -200 + ((run * 0.6 + i * 170) % 2300), hy = 668 + (i % 3) * 10;
    g.save(); g.globalAlpha = 0.35; g.fillStyle = "#c9b48a"; g.beginPath(); g.ellipse(hx - 60, hy + 6, 90, 14, 0, 0, 7); g.fill(); g.restore();
    g.save(); g.translate(hx, hy); g.scale(0.22, 0.22); g.fillStyle = "#2a1d12";
    g.beginPath(); g.ellipse(0, -60, 170, 62, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(110, -90); g.lineTo(190, -170); g.lineTo(240, -150); g.lineTo(150, -60); g.fill();
    const ph = (u * 9 + i) % (2 * Math.PI); [[-120, 1], [-80, -1], [90, 1], [130, -1]].forEach(([lx, d]) => { g.save(); g.translate(lx, -20); g.rotate(Math.sin(ph) * 0.5 * d); g.fillRect(-9, 0, 18, 110); g.restore(); });
    g.beginPath(); g.moveTo(-165, -80); g.quadraticCurveTo(-230, -40, -220, 10); g.lineWidth = 14; g.strokeStyle = "#2a1d12"; g.stroke(); g.restore(); }
  g.strokeStyle = "rgba(255,255,255,0.4)"; g.lineWidth = 2; for (let i = 0; i < 30; i++) { const yy = 200 + hash(i) * 500, xx = ((hash(i + 3) * W + u * 400) % (W + 200)) - 100; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 80, yy + 6); g.stroke(); } // wind
  person(g, 1500, 900, 420, "#1a120b");
};
S["o-painter"] = (g, u) => {
  rock(g, "#4a3828", 9); dark(g, 0.55);
  const p = clamp(u / 5); g.save(); g.beginPath(); g.rect(0, 0, 500 + p * 1200, H); g.clip(); if (!photo(g, "horse", 0, 0, W, H, 0.62, 0.45)) horse(g, 1000, 470, 1.3); g.restore();
  flame(g, u, 520, 760, 560, 0.55);
  g.fillStyle = "#0b0805"; g.save(); g.translate(380, 1080); g.beginPath(); g.ellipse(0, -620, 70, 82, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-260, 0); g.quadraticCurveTo(-240, -470, -80, -540); g.lineTo(80, -540); g.quadraticCurveTo(240, -470, 260, 0); g.fill();
  g.save(); g.translate(60, -500); g.rotate(-0.9 + Math.sin(u * 2) * 0.05); g.fillRect(0, -18, 380, 36); g.restore(); g.restore();
  g.fillStyle = FLAME; g.beginPath(); g.ellipse(520, 760, 14, 24, 0, 0, 7); g.fill();
};

// ── Now ──────────────────────────────────────────────────────────────────────
function roomWith(g, u, kind) {
  g.fillStyle = lin(g, 0, H, [[0, "#0d1420"], [1, "#05080d"]]); g.fillRect(0, 0, W, H);
  if (kind === "class") { g.fillStyle = "#1e2a24"; g.fillRect(300, 120, 1320, 420); g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 4; g.font = '120px "Special Elite"'; g.fillStyle = "rgba(255,255,255,0.5)"; g.fillText("?", 900, 400); }
  if (kind === "clinic") { g.fillStyle = "#16222e"; g.fillRect(200, 300, 520, 360); g.fillStyle = "#fff"; g.fillRect(420, 360, 80, 240); g.fillRect(340, 440, 240, 80); }
  if (kind === "court") { g.fillStyle = "#2a1f18"; g.fillRect(560, 420, 800, 220); g.fillStyle = "#3a2c22"; g.fillRect(860, 300, 200, 120); }
  const desks = kind === "class" ? [[400, 1], [760, 1], [1120, 1], [1480, 1]] : kind === "clinic" ? [[1120, 0], [1480, 0]] : [[460, 0], [1460, 0]];
  desks.forEach(([dx], i) => { screenGlow(g, dx - 90, 700, 180, 120, u); person(g, dx, 1080, 380, "#020305", {}); glow(g, dx, 760, 260, ICE, 0.2); });
}
S["o-class"] = (g, u) => roomWith(g, u, "class");
S["o-clinic"] = (g, u) => roomWith(g, u, "clinic");
S["o-court"] = (g, u) => roomWith(g, u, "court");
S["o-shaft"] = (g, u) => {
  rock(g, "#5a4432", 11); flame(g, u, 960, 560, 700, 0.35); dark(g, 0.35);
  aurochs(g, 760, 520, 1.1, 1, 1);
  g.strokeStyle = CHAR; g.lineWidth = 9; g.lineCap = "round"; // the bird-headed figure, the bird on a stick
  g.beginPath(); g.moveTo(1180, 700); g.lineTo(1180, 470); g.moveTo(1180, 520); g.lineTo(1110, 600); g.moveTo(1180, 520); g.lineTo(1250, 600); g.moveTo(1180, 700); g.lineTo(1130, 820); g.moveTo(1180, 700); g.lineTo(1230, 820); g.stroke();
  g.beginPath(); g.moveTo(1150, 450); g.lineTo(1210, 430); g.lineTo(1190, 470); g.closePath(); g.fillStyle = CHAR; g.fill();
  g.beginPath(); g.moveTo(1330, 820); g.lineTo(1330, 600); g.stroke(); g.beginPath(); g.moveTo(1300, 590); g.lineTo(1360, 570); g.lineTo(1340, 610); g.closePath(); g.fill();
  g.fillStyle = PAPER; g.font = '120px "Anton"'; g.globalAlpha = 0.85 * clamp((u - 2) / 1); g.fillText("?", 1500, 460); g.globalAlpha = 1;
};
S["o-answer"] = (g, u) => {
  g.fillStyle = "#06090f"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#11161d"; g.beginPath(); g.roundRect(660, 60, 600, 980, 50); g.fill(); g.fillStyle = "#0b0f14"; g.beginPath(); g.roundRect(684, 90, 552, 920, 34); g.fill();
  glow(g, 960, 540, 800, ICE, 0.18);
  g.fillStyle = "#1d2a38"; g.beginPath(); g.roundRect(830, 150, 370, 70, 30); g.fill(); g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(860, 178, 300, 12);
  const prog = clamp((u - 0.6) / 4.5);
  g.fillStyle = "#e9eef4"; g.beginPath(); g.roundRect(720, 260, 470, 700 * Math.max(0.12, prog), 26); g.fill();
  lines(g, 750, 300, 410, 22, "rgba(20,30,40,0.55)", 30, prog);
  if (prog > 0.95) { g.fillStyle = "#2a8a4a"; g.beginPath(); g.arc(1150, 930, 18, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 4; g.beginPath(); g.moveTo(1140, 930); g.lineTo(1148, 938); g.lineTo(1162, 922); g.stroke(); }
};
S["o-summary"] = (g, u) => {
  g.fillStyle = "#f6f7f9"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#e9edf2"; g.beginPath(); g.roundRect(360, 60, 1200, 70, 35); g.fill(); g.fillStyle = "#9aa3ad"; g.fillRect(400, 90, 420, 12);
  g.fillStyle = "#e8f0fe"; g.beginPath(); g.roundRect(360, 170, 1200, 520, 24); g.fill(); glow(g, 960, 420, 700, ICE, 0.25);
  g.fillStyle = "#1a5fd0"; g.font = '700 34px "Schibsted Grotesk"'; g.fillText("AI summary", 400, 230); lines(g, 400, 270, 1100, 13, "rgba(40,50,60,0.55)", 30, clamp(u / 3));
  const fade = 0.25 + 0.35 * (1 - clamp(u / 5));
  for (let i = 0; i < 4; i++) { g.globalAlpha = fade; g.fillStyle = "#1a0dab"; g.fillRect(400, 740 + i * 80, 520, 14); g.fillStyle = "#4d5156"; g.fillRect(400, 764 + i * 80, 860, 10); g.globalAlpha = 1; }
};
S["o-teacher"] = (g, u) => {
  g.fillStyle = "#121a16"; g.fillRect(0, 0, W, H); g.fillStyle = "#1f2e27"; g.fillRect(160, 100, 1600, 620); g.strokeStyle = "#5a4a32"; g.lineWidth = 18; g.strokeRect(160, 100, 1600, 620);
  g.fillStyle = "rgba(240,240,230,0.8)"; g.font = '90px "Special Elite"'; g.fillText("I'm not sure.", 600, 420);
  const p = clamp(u / 2); g.fillRect(600, 450, 700 * p, 6);
  person(g, 1400, 1080, 620, "#050605", {}); g.fillStyle = "#050605"; g.save(); g.translate(1400, 560); g.rotate(-1.1); g.fillRect(0, -16, 260, 32); g.restore();
  for (let i = 0; i < 5; i++) person(g, 260 + i * 220, 1100, 300, "#0b0e0c", {});
};
S["o-editor"] = (g, u) => {
  g.fillStyle = "#e9e3d3"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,0.35)"; for (let l = 0; l < 12; l++) g.fillRect(260, 120 + l * 64, 1300 * (0.55 + 0.45 * hash(l)), 12);
  const p = clamp(u / 1.6); g.strokeStyle = RED; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.ellipse(820, 382, 340 * p + 1, 46, -0.02, 0, 7); g.stroke();
  if (u > 1.4) { g.fillStyle = RED; g.font = 'italic 700 64px "Bodoni Moda"'; g.globalAlpha = clamp((u - 1.4) / 0.6); g.fillText("How do you know that?", 860, 560); g.globalAlpha = 1; g.beginPath(); g.moveTo(1100, 500); g.quadraticCurveTo(1150, 440, 1080, 420); g.stroke(); }
};
S["o-tuesday"] = (g, u) => {
  g.fillStyle = lin(g, 0, H, [[0, "#cfd5da"], [1, "#9aa4ad"]]); g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff"; g.fillRect(140, 100, 420, 340); g.fillStyle = RED; g.fillRect(140, 100, 420, 90); g.fillStyle = "#fff"; g.font = '64px "Anton"'; g.fillText("TUESDAY", 200, 172); g.fillStyle = "#222"; g.font = '170px "Anton"'; g.fillText("14", 270, 390);
  g.fillStyle = "#5a4a3c"; g.beginPath(); g.ellipse(1150, 780, 620, 150, 0, 0, 7); g.fill();
  for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; person(g, 1150 + Math.cos(a) * 640, 720 + Math.sin(a) * 120 + 170, 360, "#22262a", {}); }
  for (let i = 0; i < 6; i++) { g.fillStyle = PAPER; g.fillRect(700 + i * 150, 760, 90, 60); }
};
S["o-walk"] = (g, u) => {
  g.fillStyle = lin(g, 0, H, [[0, "#0b1022"], [1, "#1c1a24"]]); g.fillRect(0, 0, W, H);
  const r = rng(21); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(240,235,220,${0.3 + r() * 0.6})`; g.beginPath(); g.arc(r() * W, r() * 620, 0.8 + r() * 1.6, 0, 7); g.fill(); }
  g.fillStyle = "#14110e"; g.beginPath(); g.moveTo(0, 820); g.bezierCurveTo(600, 560, 1300, 520, 1920, 640); g.lineTo(1920, 1080); g.lineTo(0, 1080); g.fill();
  g.fillStyle = "#000"; g.beginPath(); g.moveTo(1380, 640); g.bezierCurveTo(1420, 520, 1560, 520, 1600, 640); g.fill();
  g.fillStyle = "#f4f1ea"; g.fillRect(120, 620, 380, 240); glow(g, 310, 740, 520, "#fff6e0", 0.45); // the good room behind
  const p = clamp(u / 9); person(g, 520 + p * 760, 880 - p * 220, 260 - p * 120, "#050403", {});
  flame(g, u, 1490, 640, 160, 0.25);
};
})();
