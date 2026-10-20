// The Wrong Face: every panel of the motion comic, drawn in code at 1920x1080 (panels crop the
// centre). Sin City language: black silhouettes, one spot colour per chapter, rim light, rain,
// halftone. Every person is an anonymous silhouette; nobody's likeness is drawn.
(() => {
const W = 1920, H = 1080, S = window.COMIC_SCENES;
const K = "#050507", PAPER = "#EFE8DA", GOLD = "#E2B33C", RED = "#D9412B", CORAL = "#E05A4E", ORANGE = "#F07A2A", TEAL = "#1f4f57", TEAL2 = "#2BB3A3", SODIUM = "#FF9A3C", NIGHT = "#0b1418", BLUE = "#3b6cff";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));
const lin = (g, y0, y1, st, x0 = 0, x1 = 0) => { const gr = g.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function glow(g, cx, cy, r, col, a) { r = Math.max(1, r); g.save(); g.globalCompositeOperation = "screen"; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); g.restore(); }
function bg(g, top, bottom) { g.fillStyle = lin(g, 0, H, [[0, top], [1, bottom]]); g.fillRect(0, 0, W, H); }
function cone(g, cx, top, w, bottom, col, a) { g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = lin(g, top, bottom, [[0, rgba(col, a)], [1, rgba(col, 0)]]); g.beginPath(); g.moveTo(cx - 14, top); g.lineTo(cx + 14, top); g.lineTo(cx + w / 2, bottom); g.lineTo(cx - w / 2, bottom); g.fill(); g.restore(); }
function rainLines(g, u, amt, seed = 1, col = "rgba(205,222,240,0.22)") { g.save(); g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); const n = Math.round(300 * amt); for (let i = 0; i < n; i++) { const L = 40 + hash(i + seed) * 70, yy = ((hash(i * 7 + seed) * (H + L) + u * (1400 + hash(i) * 600)) % (H + L)) - L, xx = hash(i * 13 + seed) * (W + 300) - 150 + yy * 0.15; g.moveTo(xx, yy); g.lineTo(xx + L * 0.15, yy + L); } g.stroke(); g.restore(); }
function halfdots(g, x0, y0, w, h, col, step = 10, fall = 1) { g.save(); g.fillStyle = col; for (let yy = 0; yy < h; yy += step) for (let xx = (yy / step) % 2 ? step / 2 : 0; xx < w; xx += step) { const r = (step / 2.2) * (1 - (yy / h) * fall); if (r > 0.3) { g.beginPath(); g.arc(x0 + xx, y0 + yy, r, 0, 7); g.fill(); } } g.restore(); }
// A standing person: anonymous silhouette. opts: hat (fedora), cap, child, dress, pregnant, rim (rim-light colour), side (-1/1 rim side), arm (raise 0..1).
function person(g, fx, fy, h, col = K, o = {}) {
  g.save(); g.translate(fx, fy);
  const draw = (c, dx = 0) => {
    g.fillStyle = c; g.save(); g.translate(dx, 0);
    const sh = o.child ? 0.62 : 1;
    if (o.dress) { g.beginPath(); g.moveTo(-h * 0.1, -h * 0.8); g.quadraticCurveTo(-h * 0.13, -h * 0.4, -h * 0.2, -h * 0.06); g.lineTo(h * 0.2, -h * 0.06); g.quadraticCurveTo(h * 0.13, -h * 0.4, h * 0.1, -h * 0.8); g.fill(); g.fillRect(-h * 0.07, -h * 0.08, h * 0.04, h * 0.08); g.fillRect(h * 0.03, -h * 0.08, h * 0.04, h * 0.08); }
    else {
      g.fillRect(-h * 0.075, -h * 0.37, h * 0.06, h * 0.37); g.fillRect(h * 0.015, -h * 0.37, h * 0.06, h * 0.37);
      g.beginPath(); g.moveTo(-h * 0.12, -h * 0.82); g.quadraticCurveTo(-h * 0.17, -h * 0.55, -h * 0.16 * sh - h * 0.01, -h * 0.33); g.lineTo(h * 0.16 * sh + h * 0.01, -h * 0.33); g.quadraticCurveTo(h * 0.17, -h * 0.55, h * 0.12, -h * 0.82); g.quadraticCurveTo(0, -h * 0.87, -h * 0.12, -h * 0.82); g.fill();
    }
    if (o.pregnant) { g.beginPath(); g.ellipse(h * 0.1, -h * 0.5, h * 0.09, h * 0.12, 0, 0, 7); g.fill(); }
    if (o.arm) { g.save(); g.translate(h * 0.11, -h * 0.78); g.rotate(-Math.PI * 0.75 * o.arm); g.fillRect(-h * 0.03, 0, h * 0.06, h * 0.33); g.restore(); }
    g.beginPath(); g.ellipse(0, -h * 0.89, h * 0.055, h * 0.066, 0, 0, 7); g.fill(); g.fillRect(-h * 0.03, -h * 0.84, h * 0.06, h * 0.04);
    if (o.hat) { g.beginPath(); g.ellipse(0, -h * 0.93, h * 0.1, h * 0.02, 0, 0, 7); g.fill(); g.fillRect(-h * 0.058, -h * 0.995, h * 0.116, h * 0.065); }
    if (o.cap) { g.fillStyle = o.cap; g.beginPath(); g.ellipse(0, -h * 0.925, h * 0.062, h * 0.04, 0, Math.PI, 0); g.fill(); g.fillRect(-h * 0.01, -h * 0.93, h * 0.1, h * 0.014); }
    if (o.hair) { g.beginPath(); g.ellipse(0, -h * 0.9, h * 0.065, h * 0.075, 0, Math.PI * 0.9, Math.PI * 2.1); g.fill(); }
    g.restore();
  };
  if (o.rim) draw(o.rim, (o.side ?? 1) * h * 0.012);
  draw(col);
  g.restore();
}
function windowsGrid(g, x0, y0, cols, rows, cw, ch, gap, seed, u, lit = 0.35, col = SODIUM) { const r = rng(seed); for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const on = r() < lit; g.fillStyle = on ? rgba(col, 0.6 + 0.4 * hash(i + j * 9 + seed + Math.floor(u * 0.4))) : "rgba(255,255,255,0.03)"; g.fillRect(x0 + i * (cw + gap), y0 + j * (ch + gap), cw, ch); } }
function skyline(g, base, seed, u, col, lit, wcol = SODIUM) { const r = rng(seed); let bx = -200; while (bx < W + 200) { const w = 110 + r() * 170, h = 300 + r() * 520; g.fillStyle = col; g.fillRect(bx, base - h, w, h); windowsGrid(g, bx + 10, base - h + 14, Math.floor((w - 16) / 22), Math.floor((h - 20) / 32), 12, 18, 10, Math.floor(r() * 999), u, lit, wcol); bx += w + 8; } }
function house(g, cx, base, w, h, wall, lit) {
  g.fillStyle = wall; g.fillRect(cx - w / 2, base - h, w, h);
  g.beginPath(); g.moveTo(cx - w / 2 - 40, base - h); g.lineTo(cx, base - h - h * 0.55); g.lineTo(cx + w / 2 + 40, base - h); g.fill();
  if (lit) { g.fillStyle = lit; [[-0.3, 0.35], [0.22, 0.35]].forEach(([dx, dy]) => g.fillRect(cx + dx * w - 50, base - h + dy * h, 100, 80)); }
}
function car(g, cx, base, s, body = K, lights = null, u = 0) {
  g.save(); g.translate(cx, base); g.scale(s, s); g.fillStyle = body;
  g.beginPath(); g.moveTo(-260, -20); g.lineTo(-250, -90); g.lineTo(-150, -100); g.lineTo(-90, -165); g.lineTo(110, -165); g.lineTo(170, -100); g.lineTo(255, -88); g.lineTo(265, -20); g.closePath(); g.fill();
  g.fillStyle = "#000"; [-160, 160].forEach((wx) => { g.beginPath(); g.arc(wx, -18, 46, 0, 7); g.fill(); });
  g.fillStyle = "rgba(160,190,210,0.18)"; g.beginPath(); g.moveTo(-80, -155); g.lineTo(0, -155); g.lineTo(0, -102); g.lineTo(-135, -102); g.fill(); g.beginPath(); g.moveTo(14, -155); g.lineTo(100, -155); g.lineTo(150, -102); g.lineTo(14, -102); g.fill();
  if (lights) { const on = Math.floor(u * 6) % 2; g.fillStyle = on ? RED : BLUE; g.fillRect(-60, -182, 56, 18); g.fillStyle = on ? BLUE : RED; g.fillRect(4, -182, 56, 18); g.restore(); glow(g, cx - 30 * s, base - 175 * s, 520 * s, on ? RED : BLUE, 0.55); glow(g, cx + 30 * s, base - 175 * s, 380 * s, on ? BLUE : RED, 0.4); return; }
  g.restore();
}
function paper(g, px, py, w, h, rot, lines = 7, col = "#efe9da") { g.save(); g.translate(px, py); g.rotate(rot); g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(-w / 2 + 12, -h / 2 + 14, w, h); g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = "rgba(0,0,0,0.35)"; for (let l = 0; l < lines; l++) g.fillRect(-w / 2 + 30, -h / 2 + 50 + l * (h - 90) / lines, (w - 60) * (0.5 + 0.5 * hash(l + px)), 8); g.restore(); }
// A grainy surveillance still: a figure from above in a red cap, face hidden.
function cctvStill(g, x0, y0, w, h, u, blur = 0) {
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.fillStyle = "#3b3d3c"; g.fillRect(x0, y0, w, h);
  g.fillStyle = "#4a4c4a"; for (let i = 0; i < 6; i++) g.fillRect(x0 + i * w / 6, y0 + h * 0.6, w / 6 - 8, h * 0.4);
  g.fillStyle = "#2b2c2b"; g.fillRect(x0 + w * 0.08, y0 + h * 0.15, w * 0.25, h * 0.3);
  const fx = x0 + w * 0.55, fy = y0 + h * 0.86, fh = h * 0.75;
  person(g, fx, fy, fh, "#1a1a1a");
  g.fillStyle = "#b42a22"; g.beginPath(); g.ellipse(fx, fy - fh * 0.93, fh * 0.07, fh * 0.05, 0, Math.PI, 0); g.fill(); g.fillRect(fx - fh * 0.02, fy - fh * 0.935, fh * 0.11, fh * 0.018);
  const r = rng(Math.floor(u * 12) + 3); g.fillStyle = "rgba(255,255,255,0.08)"; for (let i = 0; i < 900; i++) g.fillRect(x0 + r() * w, y0 + r() * h, 2, 2);
  g.fillStyle = "rgba(0,0,0,0.12)"; for (let yy = 0; yy < h; yy += 4) g.fillRect(x0, y0 + yy, w, 1);
  if (blur) { g.filter = `blur(${blur}px)`; g.drawImage(g.canvas, x0, y0, w, h, x0, y0, w, h); g.filter = "none"; }
  g.restore();
}

// ── COLD OPEN ────────────────────────────────────────────────────────────────
S["city-dusk"] = (g, u) => {
  bg(g, "#06121a", "#1b3a40");
  glow(g, 1500, 700, 700, SODIUM, 0.18);
  skyline(g, 760, 11, u, "#0c1d24", 0.18);
  g.fillStyle = "#081016"; g.fillRect(0, 760, W, 320);
  for (let i = 0; i < 12; i++) { const lx = 80 + i * 170; g.fillStyle = K; g.fillRect(lx, 640, 8, 140); glow(g, lx + 4, 640, 120, SODIUM, 0.5); }
  g.save(); g.globalCompositeOperation = "screen"; for (let i = 0; i < 12; i++) { g.fillStyle = lin(g, 780, 1080, [[0, rgba(SODIUM, 0.28)], [1, rgba(SODIUM, 0)]]); g.fillRect(70 + i * 170, 780, 28, 300); } g.restore();
  const cx = -300 + ((u * 120) % 2600); car(g, cx, 900, 0.55, K); glow(g, cx + 140, 860, 160, "#fff3c9", 0.5);
};
S["driveway"] = (g, u) => {
  bg(g, "#07131a", "#14303a");
  glow(g, 960, 520, 900, SODIUM, 0.1);
  house(g, 1180, 760, 760, 320, "#0b1a20", rgba(SODIUM, 0.85)); glow(g, 1180, 560, 460, SODIUM, 0.25);
  g.fillStyle = "#0c1a1f"; g.beginPath(); g.moveTo(860, 760); g.lineTo(1060, 760); g.lineTo(1500, 1080); g.lineTo(520, 1080); g.fill();
  g.fillStyle = "#13262c"; g.fillRect(0, 760, W, 8);
  g.fillStyle = "rgba(255,255,255,0.65)"; const r = rng(4); for (let i = 0; i < 160; i++) g.fillRect(r() * W, 770 + r() * 300, 3, 2); // snow on the lawn
  const p = ease(u / 3.5); car(g, 940 + (1 - p) * 140, 1000 - (1 - p) * 120, 0.95, K);
  glow(g, 1140 + (1 - p) * 140, 900, 260, "#fff3c9", 0.35);
  person(g, 760, 1000, 330, K, { rim: SODIUM, side: 1 });
};
S["doorway"] = (g, u) => {
  bg(g, "#06090b", "#0d1416");
  g.fillStyle = "#0b1012"; g.fillRect(0, 0, W, H);
  const dx = 760, dw = 400; g.fillStyle = lin(g, 180, 900, [[0, "#ffb15c"], [1, "#d46a1f"]]); g.fillRect(dx, 180, dw, 760);
  glow(g, dx + dw / 2, 560, 700, SODIUM, 0.35);
  person(g, dx + 200, 940, 520, K, { dress: true, hair: true });
  person(g, dx + 95, 940, 230, K, { child: true, dress: true, hair: true });
  person(g, dx + 300, 940, 180, K, { child: true, dress: true, hair: true });
  g.fillStyle = "#050607"; g.fillRect(dx - 40, 140, 40, 820); g.fillRect(dx + dw, 140, 40, 820); g.fillRect(dx - 40, 140, dw + 80, 40);
  g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = lin(g, 940, 1080, [[0, rgba(SODIUM, 0.35)], [1, rgba(SODIUM, 0)]]); g.beginPath(); g.moveTo(dx, 940); g.lineTo(dx + dw, 940); g.lineTo(dx + dw + 220, 1080); g.lineTo(dx - 220, 1080); g.fill(); g.restore();
};
S["police-car"] = (g, u) => {
  bg(g, "#05090c", "#0d1a20");
  g.fillStyle = "#0a1418"; g.fillRect(0, 700, W, 380);
  g.save(); g.translate(1000, 860); g.rotate(-0.1); car(g, 0, 0, 1.25, K, true, u); g.restore();
  car(g, 520, 900, 0.95, "#0a0a0c");
  person(g, 300, 930, 360, K, { rim: RED, side: 1 });
  const on = Math.floor(u * 6) % 2; g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = rgba(on ? RED : BLUE, 0.18); g.fillRect(0, 700, W, 380); g.restore();
};
S["cuffs"] = (g, u) => {
  bg(g, "#050607", "#0b0d10");
  const on = Math.floor(u * 6) % 2; glow(g, 300, 200, 900, on ? RED : BLUE, 0.5);
  g.fillStyle = K; g.beginPath(); g.moveTo(300, 1080); g.quadraticCurveTo(600, 620, 960, 600); g.quadraticCurveTo(1320, 620, 1620, 1080); g.fill(); // wrists behind a back
  g.strokeStyle = "#c9ced3"; g.lineWidth = 22; [[800, 640], [1120, 640]].forEach(([cx, cy]) => { g.beginPath(); g.ellipse(cx, cy, 80, 60, 0, 0, 7); g.stroke(); });
  g.lineWidth = 12; g.beginPath(); g.moveTo(880, 640); g.lineTo(1040, 640); g.stroke();
  glow(g, 960, 640, 260, "#ffffff", 0.18);
  g.strokeStyle = rgba(on ? RED : BLUE, 0.9); g.lineWidth = 6; g.beginPath(); g.ellipse(800, 640, 80, 60, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
};
S["warrant"] = (g, u) => {
  bg(g, "#08090b", "#121418");
  glow(g, 960, 300, 800, "#ffffff", 0.08);
  paper(g, 960, 560, 760, 900, -0.04, 10);
  g.save(); g.translate(960, 560); g.rotate(-0.04); g.fillStyle = "#1e1e1e"; g.font = '700 70px "Special Elite"'; g.textAlign = "center"; g.fillText("WARRANT", 0, -320); g.fillStyle = RED; g.fillRect(-180, -300, 360, 8); g.restore();
  const on = Math.floor(u * 6) % 2; g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = rgba(on ? RED : BLUE, 0.25); g.fillRect(0, 0, W, H); g.restore();
};
S["backseat"] = (g, u) => {
  bg(g, "#030405", "#08090b");
  const on = Math.floor(u * 6) % 2;
  g.fillStyle = "#0d1418"; g.fillRect(260, 150, 1400, 620); // the side window
  skyline(g, 770, 5, u, "#0a1216", 0.25);
  g.save(); g.globalAlpha = 0.5 + 0.15 * Math.sin(u * 2); g.strokeStyle = "rgba(159,211,255,0.55)"; g.lineWidth = 2; // a wireframe face reflected in the glass
  const cx = 1200, cy = 450; for (let i = -6; i <= 6; i++) { g.beginPath(); for (let j = -8; j <= 8; j++) { const yy = cy + j * 32, xx = cx + i * 26 * Math.cos(j / 10) * (1 - Math.abs(j) / 16); j === -8 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); }
  for (let j = -8; j <= 8; j++) { g.beginPath(); for (let i = -6; i <= 6; i++) { const yy = cy + j * 32 + Math.sin(i / 3) * 6, xx = cx + i * 26 * Math.cos(j / 10) * (1 - Math.abs(j) / 16); i === -6 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); }
  g.restore();
  g.fillStyle = K; g.fillRect(0, 0, W, 150); g.fillRect(0, 770, W, 310); g.fillRect(0, 0, 260, H); g.fillRect(1660, 0, 260, H);
  person(g, 640, 1080, 760, K, { rim: on ? RED : BLUE, side: 1 });
  rainLines(g, u * 0.4, 0.5, 7, "rgba(205,222,240,0.15)");
};

// ── 1 TWO MINUTES (yellow) ──────────────────────────────────────────────────
S["storefront"] = (g, u) => {
  g.fillStyle = "#F2C230"; g.fillRect(0, 0, W, H);
  halfdots(g, 0, 0, W, 500, "rgba(0,0,0,0.12)", 12, 1);
  g.save(); g.translate(960, 560); g.transform(1, 0.3, 0, 1, 0, 0); // isometric block
  g.fillStyle = "#111"; g.fillRect(-420, -520, 520, 820); g.fillStyle = "#1b1b1b"; g.save(); g.transform(1, -0.6, 0, 1, 0, 0); g.fillRect(100, -460, 420, 820); g.restore();
  for (let j = 0; j < 7; j++) for (let i = 0; i < 4; i++) { g.fillStyle = (i + j) % 3 ? "#F2C230" : "#c99a1a"; g.fillRect(-380 + i * 120, -480 + j * 100, 60, 64); }
  g.fillStyle = "#F7D35A"; g.fillRect(-380, 170, 440, 120); g.fillStyle = "#111"; g.fillRect(-160, 190, 80, 100);
  g.restore();
  g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.moveTo(1060, 1000); g.lineTo(1920, 640); g.lineTo(1920, 1080); g.lineTo(1060, 1080); g.fill();
  const walk = clamp(u / 6); person(g, 600 + walk * 220, 1000 + walk * 60, 300, "#111", { cap: RED });
  g.fillStyle = "#111"; g.font = '120px "Anton"'; g.textAlign = "left"; g.globalAlpha = 0.9; g.fillText("10.02.2018", 1040, 1010); g.globalAlpha = 1;
};
S["watch-case"] = (g, u) => {
  g.fillStyle = "#F2C230"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#111"; g.fillRect(560, 140, 800, 800); g.fillStyle = "#1d1d1d"; g.fillRect(590, 170, 740, 740);
  for (let i = 0; i < 6; i++) { const cx = 760 + (i % 2) * 400, cy = 300 + Math.floor(i / 2) * 230; const gone = i < 5 && u > 0.6 + i * 0.25;
    g.strokeStyle = "#F2C230"; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 70, 0, 7); g.stroke();
    if (!gone) { g.fillStyle = "#F2C230"; g.beginPath(); g.arc(cx, cy, 52, 0, 7); g.fill(); g.strokeStyle = "#111"; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - 34); g.moveTo(cx, cy); g.lineTo(cx + 24, cy + 8); g.stroke(); }
    else { g.setLineDash([10, 10]); g.strokeStyle = "rgba(242,194,48,0.5)"; g.beginPath(); g.arc(cx, cy, 52, 0, 7); g.stroke(); g.setLineDash([]); } }
};
S["cctv"] = (g, u) => {
  g.fillStyle = "#111"; g.fillRect(0, 0, W, H);
  cctvStill(g, 0, 0, W, H, u);
  g.fillStyle = "#e8e8e8"; g.font = '40px "Special Elite"'; g.fillText("CAM 03   10/02/2018", 60, 80); g.fillText(`00:01:${String(10 + Math.floor(u)).padStart(2, "0")}`, 60, 130);
  if (Math.floor(u * 2) % 2 === 0) { g.fillStyle = RED; g.beginPath(); g.arc(1840, 70, 16, 0, 7); g.fill(); g.font = '36px "Special Elite"'; g.fillText("REC", 1720, 84); }
  g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 3; [[60, 160], [1860, 160], [60, 1020], [1860, 1020]].forEach(([cx, cy]) => { g.beginPath(); g.moveTo(cx, cy + (cy > 500 ? -50 : 50)); g.lineTo(cx, cy); g.lineTo(cx + (cx > 900 ? -50 : 50), cy); g.stroke(); });
};

// ── 2 THE MACHINE (wireframe + coral) ────────────────────────────────────────
S["detective-desk"] = (g, u) => {
  bg(g, "#0d0f12", "#16191d");
  cone(g, 1250, 0, 900, 1080, "#fff2d6", 0.22);
  g.fillStyle = "#1c1a17"; g.fillRect(0, 760, W, 320);
  g.fillStyle = "#2a2722"; g.fillRect(1190, 0, 12, 200); g.fillStyle = "#1f3a33"; g.beginPath(); g.moveTo(1120, 200); g.lineTo(1280, 200); g.lineTo(1240, 150); g.lineTo(1160, 150); g.fill();
  paper(g, 1250, 860, 420, 300, 0.05, 0, "#cfcfcf"); cctvStill(g, 1080, 740, 340, 220, u * 0.2, 2);
  person(g, 600, 1080, 700, K, { hat: false, rim: "#cfd8ff", side: 1 });
  g.fillStyle = "#0a0a0a"; g.fillRect(140, 520, 360, 240); g.fillStyle = "rgba(159,211,255,0.35)"; g.fillRect(160, 540, 320, 200); glow(g, 320, 640, 260, "#9fd3ff", 0.3);
};
S["blurry-still"] = (g, u) => {
  g.fillStyle = "#111"; g.fillRect(0, 0, W, H);
  cctvStill(g, 560, 120, 800, 840, u, 4);
  g.strokeStyle = CORAL; g.lineWidth = 6; g.setLineDash([22, 14]); g.strokeRect(830, 150, 260, 260); g.setLineDash([]);
  g.fillStyle = CORAL; g.font = '700 34px "Schibsted Grotesk"'; g.fillText("PROBE IMAGE", 836, 140);
};
S["mesh-face"] = (g, u) => {
  bg(g, "#d9dbd8", "#9a9e9b");
  g.strokeStyle = "rgba(0,0,0,0.07)"; g.lineWidth = 1; for (let i = 0; i < W; i += 24) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, H); g.stroke(); } for (let j = 0; j < H; j += 24) { g.beginPath(); g.moveTo(0, j); g.lineTo(W, j); g.stroke(); }
  const cx = 960, cy = 560, sc = 1;
  g.fillStyle = "#3c4044"; g.beginPath(); g.ellipse(cx, cy, 250 * sc, 330 * sc, 0, 0, 7); g.fill();
  g.strokeStyle = "#1b1d20"; g.lineWidth = 1.5;
  for (let i = -10; i <= 10; i++) { g.beginPath(); for (let j = -14; j <= 14; j++) { const t = j / 14, xx = cx + i * 24 * Math.sqrt(1 - t * t), yy = cy + t * 330; j === -14 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); }
  for (let j = -14; j <= 14; j++) { const t = j / 14, wdt = 250 * Math.sqrt(1 - t * t); g.beginPath(); g.moveTo(cx - wdt, cy + t * 330); g.lineTo(cx + wdt, cy + t * 330); g.stroke(); }
  const sweep = ((u * 0.6) % 1); g.fillStyle = rgba(CORAL, 0.9); g.fillRect(cx - 300, cy - 360 + sweep * 720, 600, 14); glow(g, cx, cy - 360 + sweep * 720, 260, CORAL, 0.35);
  g.fillStyle = CORAL; g.fillRect(cx - 230, cy - 90, 460, 70); g.fillStyle = "#fff"; g.font = '700 30px "Schibsted Grotesk"'; g.fillText("ANALYSING", cx - 90, cy - 44);
  g.strokeStyle = CORAL; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 230, cy - 40); g.lineTo(cx + 230, cy + 520); g.stroke();
  const pts = [[-110, -60], [110, -60], [0, 40], [-80, 140], [80, 140], [0, 200], [-200, 0], [200, 0]]; pts.forEach(([px, py], i) => { g.fillStyle = (Math.floor(u * 4) + i) % 3 ? "#fff" : CORAL; g.beginPath(); g.arc(cx + px, cy + py, 8, 0, 7); g.fill(); });
};
S["face-grid"] = (g, u) => {
  g.fillStyle = "#111417"; g.fillRect(0, 0, W, H);
  const n = 26, m = 14, cw = W / n, ch = H / m, hit = Math.floor(u * 7) % (n * m);
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const id = j * n + i, flick = hash(id + Math.floor(u * 10)) > 0.85; g.fillStyle = flick ? "#3a4046" : "#22272b"; g.fillRect(i * cw + 4, j * ch + 4, cw - 8, ch - 8); g.fillStyle = "#0e1012"; g.beginPath(); g.ellipse(i * cw + cw / 2, j * ch + ch * 0.45, cw * 0.22, ch * 0.3, 0, 0, 7); g.fill(); g.fillRect(i * cw + cw * 0.25, j * ch + ch * 0.72, cw * 0.5, ch * 0.24); }
  const mi = 17, mj = 6; g.strokeStyle = CORAL; g.lineWidth = 6; g.strokeRect(mi * cw, mj * ch, cw, ch); glow(g, mi * cw + cw / 2, mj * ch + ch / 2, 200, CORAL, 0.45);
};
S["licence"] = (g, u) => {
  bg(g, "#1a1c1f", "#0c0d0f");
  g.save(); g.translate(960, 540); g.rotate(-0.05);
  g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(-520 + 14, -320 + 16, 1040, 640); g.fillStyle = "#e7e2d4"; g.fillRect(-520, -320, 1040, 640);
  g.fillStyle = "#2a5c8a"; g.fillRect(-520, -320, 1040, 110); g.fillStyle = "#fff"; g.font = '700 50px "Schibsted Grotesk"'; g.fillText("DRIVER LICENSE", -480, -245);
  g.fillStyle = "#9aa0a6"; g.fillRect(-470, -170, 330, 420); person(g, -305, 250, 520, "#2b2e31", {});
  g.fillStyle = "rgba(0,0,0,0.4)"; for (let l = 0; l < 6; l++) g.fillRect(-90, -150 + l * 70, 480 - l * 40, 22);
  g.restore();
  if (u > 0.5) { const k = clamp((u - 0.5) / 0.15), s = 1 + 1.4 * (1 - k); g.save(); g.translate(1140, 640); g.rotate(-0.18); g.scale(s, s); g.globalAlpha = k * 0.9; g.strokeStyle = CORAL; g.lineWidth = 12; g.strokeRect(-260, -80, 520, 160); g.fillStyle = CORAL; g.font = '110px "Special Elite"'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("EXPIRED", 0, 8); g.restore(); }
};
S["report-desk"] = (g, u) => {
  bg(g, "#0c0d10", "#141518");
  cone(g, 1380, 0, 1200, 1080, "#fff2d6", 0.18);
  g.fillStyle = "#1d1b18"; g.fillRect(0, 820, W, 260);
  person(g, 380, 1080, 760, K, { hat: true, rim: "#d8d2c4", side: 1 });
  g.fillStyle = "#2a2722"; g.fillRect(1700, 0, 12, 160);
};

// ── 3 THE LINEUP (orange caricatures) ────────────────────────────────────────
function caricature(g, cx, cy, s, v, col = ORANGE) {
  const r = rng(v * 97 + 3); g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = "#0b0b0b"; g.fillRect(-150, -210, 300, 420);
  g.fillStyle = col; const hw = 70 + r() * 30, hh = 140 + r() * 40; g.beginPath(); g.roundRect(-hw, -hh + 40, hw * 2, hh * 1.9, 40); g.fill();
  g.fillStyle = "#0b0b0b"; if (r() < 0.6) { g.beginPath(); g.ellipse(0, -hh + 50, hw * 1.05, 50, 0, Math.PI, 0); g.fill(); }
  g.fillStyle = "#fff"; g.beginPath(); g.moveTo(-6, -40); g.lineTo(18 + r() * 14, 70 + r() * 30); g.lineTo(-10, 66); g.fill(); // the long white nose
  const ey = -50; [-34, 30].forEach((ex) => { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(ex, ey, 16, 12, 0, 0, 7); g.fill(); g.fillStyle = "#000"; g.beginPath(); g.arc(ex + 3, ey + 2, 6, 0, 7); g.fill(); });
  g.fillStyle = "#0b0b0b"; g.fillRect(-48, ey - 30 - r() * 8, 34, 7); g.fillRect(14, ey - 30 - r() * 8, 34, 7);
  if (r() < 0.5) { g.beginPath(); g.ellipse(0, 120, hw * 0.8, 60, 0, 0, Math.PI); g.fill(); } else { g.fillRect(-26, 100, 52, 6); }
  g.fillStyle = "#0b0b0b"; g.font = '700 30px "Schibsted Grotesk"'; g.textAlign = "center"; g.fillText(`#${v}`, 0, 196);
  g.restore();
}
S["lineup"] = (g, u) => {
  g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, W, H);
  cone(g, 960, -40, 1500, 900, "#ffd7a8", 0.12);
  g.fillStyle = "#1a1410"; g.fillRect(160, 220, 1600, 600);
  for (let i = 0; i < 6; i++) { const k = clamp((u - 0.5 - i * 0.35) / 0.4); if (k <= 0) continue; g.save(); g.globalAlpha = k; caricature(g, 300 + i * 264, 520 - (1 - k) * 30, 0.95, i + 1); g.restore(); }
  g.fillStyle = "#2a2722"; g.fillRect(954, 0, 12, 120); g.fillStyle = "#3a2a1a"; g.beginPath(); g.moveTo(880, 120); g.lineTo(1040, 120); g.lineTo(1000, 80); g.lineTo(920, 80); g.fill();
};
S["contractor"] = (g, u) => {
  g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#1a1410"; g.fillRect(0, 160, W, 640);
  for (let i = 0; i < 6; i++) caricature(g, 260 + i * 290, 470, 0.9, i + 1);
  g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(0, 0, W, H);
  person(g, 760, 1080, 900, K, { dress: true, hair: true, rim: ORANGE, side: -1 });
  g.save(); g.translate(1120, 820); g.rotate(0.12); g.fillStyle = "#ddd"; g.fillRect(-170, -120, 340, 240); cctvStill(g, -160, -110, 320, 220, u * 0.1, 3); g.restore();
  person(g, 1600, 1080, 820, "#090909", { hat: false });
};
S["circle"] = (g, u) => {
  g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, W, H);
  caricature(g, 960, 520, 2.1, 3);
  const p = clamp(u / 0.8); g.strokeStyle = RED; g.lineWidth = 14; g.lineCap = "round"; g.beginPath(); g.ellipse(960, 520, 380, 470, -0.1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); g.stroke();
};
S["rigged"] = (g, u) => {
  g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) caricature(g, 520 + i * 180, 540, 0.62, i + 1);
  g.fillStyle = "#1a1d22"; g.fillRect(80, 380, 300, 220); g.fillStyle = "rgba(159,211,255,0.35)"; g.fillRect(96, 396, 268, 170); g.fillStyle = "#1a1d22"; g.fillRect(200, 600, 60, 60);
  g.strokeStyle = CORAL; g.lineWidth = 4; for (let i = 0; i < 6; i++) { const p = clamp((u - i * 0.15) / 0.6); g.beginPath(); g.moveTo(380, 490); g.lineTo(380 + (520 + i * 180 - 380) * p, 490 + (380 - 490) * p); g.stroke(); }
  g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.ellipse(880, 540, 100, 140, 0, 0, 7); g.stroke();
};
S["signature"] = (g, u) => {
  g.fillStyle = "#e9e3d3"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,0.35)"; for (let l = 0; l < 8; l++) g.fillRect(200, 140 + l * 70, 1100 * (0.5 + 0.5 * hash(l)), 12);
  const p = clamp(u / 1.4); g.strokeStyle = "#13235a"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); for (let i = 0; i <= 60 * p; i++) { const t = i / 60, xx = 280 + t * 700, yy = 820 + Math.sin(t * 22) * 40 * (1 - t * 0.5) - t * 40; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
  g.fillStyle = "#111"; g.save(); g.translate(280 + p * 700, 760 - p * 40); g.rotate(0.7); g.fillRect(-12, -260, 24, 260); g.fillStyle = GOLD; g.fillRect(-12, -40, 24, 30); g.restore();
};

// ── 4 THIRTY HOURS (Sin City black & white, sodium + teal) ───────────────────
S["goodbye"] = (g, u) => {
  bg(g, "#06090b", "#0f171a");
  const on = Math.floor(u * 6) % 2;
  g.fillStyle = "#0c1316"; g.fillRect(0, 760, W, 320);
  house(g, 1500, 760, 560, 260, "#081012", rgba(SODIUM, 0.8));
  g.fillStyle = K; g.fillRect(0, 0, W, 140); g.fillRect(0, 900, W, 180); g.fillRect(0, 0, 200, H); g.fillRect(1720, 0, 200, H); // the car's rear window frame
  person(g, 1100, 900, 300, K, { child: true, dress: true, hair: true, rim: on ? RED : BLUE, side: -1 });
  person(g, 1240, 900, 470, K, { dress: true, hair: true });
  person(g, 520, 1080, 860, K, { rim: on ? RED : BLUE, side: 1 });
  glow(g, 960, 300, 900, on ? RED : BLUE, 0.18);
};
S["cell"] = (g, u) => {
  g.fillStyle = "#f2f0ea"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#0a0a0a"; g.fillRect(0, 760, W, 320);
  const r = rng(8); for (let i = 0; i < 14; i++) person(g, 80 + i * 135 + r() * 30, 820 + r() * 60, 380 + r() * 80, "#0a0a0a", { hat: r() < 0.2 });
  g.fillStyle = "#0a0a0a"; for (let i = 0; i < 16; i++) g.fillRect(40 + i * 120, 0, 26, H); g.fillRect(0, 60, W, 30); g.fillRect(0, 700, W, 26);
  g.fillStyle = "rgba(0,0,0,0.4)"; g.fillRect(0, 0, W, 60);
};
S["concrete"] = (g, u) => {
  g.fillStyle = "#ecebe6"; g.fillRect(0, 0, W, H); g.fillStyle = "#0a0a0a"; g.fillRect(0, 930, W, 150);
  g.fillStyle = "#8d8b86"; g.fillRect(660, 600, 520, 110);
  g.fillStyle = "#0a0a0a"; g.save(); g.translate(960, 600); g.beginPath(); g.ellipse(-250, -38, 46, 40, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-210, -64); g.quadraticCurveTo(20, -104, 300, -52); g.lineTo(352, -16); g.lineTo(-210, -8); g.fill(); g.restore(); // a man longer than the slab: feet hang off the end
  g.fillStyle = "#0a0a0a"; g.fillRect(660, 710, 30, 220); g.fillRect(1150, 710, 30, 220);
  g.fillStyle = "#0a0a0a"; g.font = '120px "Anton"'; g.textAlign = "center"; g.globalAlpha = 0.9; const hrs = Math.min(30, 2 + Math.floor(u * 3)); g.fillText(`HOUR ${hrs}`, 960, 330); g.globalAlpha = 1;
};
S["table"] = (g, u) => {
  bg(g, "#0b1a1d", "#071012");
  cone(g, 960, -20, 1400, 1080, "#ffd7a8", 0.18);
  person(g, 640, 760, 560, K, { rim: SODIUM, side: 1 }); person(g, 1290, 760, 560, K, { rim: SODIUM, side: -1 });
  g.fillStyle = "#1b2a2d"; g.beginPath(); g.moveTo(420, 380); g.lineTo(1500, 380); g.lineTo(1760, 1000); g.lineTo(160, 1000); g.fill(); g.strokeStyle = rgba(SODIUM, 0.4); g.lineWidth = 3; g.beginPath(); g.moveTo(420, 380); g.lineTo(1500, 380); g.stroke();
  const p2 = ease(u / 2.2); g.save(); g.translate(1300 - p2 * 420, 560 + p2 * 160); g.rotate(-0.2 + p2 * 0.25); g.fillStyle = "#ddd"; g.fillRect(-200, -140, 400, 280); cctvStill(g, -188, -128, 376, 256, u * 0.1, 2); g.restore();
  g.fillStyle = K; g.beginPath(); g.ellipse(1280 - p2 * 420, 700 + p2 * 160, 70, 40, 0.4, 0, 7); g.fill(); // the hand that slides it
};
S["two-faces"] = (g, u) => {
  bg(g, "#0e2427", "#081416");
  glow(g, 700, 460, 800, SODIUM, 0.35);
  g.fillStyle = K; g.save(); g.translate(560, 1080); // a profile, facing right
  g.beginPath(); g.moveTo(-420, 0); g.lineTo(-380, -420); g.quadraticCurveTo(-360, -740, -150, -800); g.quadraticCurveTo(60, -830, 120, -700); g.lineTo(150, -610); g.lineTo(200, -560); g.lineTo(150, -540); g.lineTo(160, -480); g.quadraticCurveTo(140, -420, 70, -410); g.lineTo(60, -330); g.quadraticCurveTo(120, -260, 240, -200); g.lineTo(300, 0); g.fill();
  g.strokeStyle = SODIUM; g.lineWidth = 5; g.beginPath(); g.moveTo(120, -700); g.lineTo(150, -610); g.lineTo(200, -560); g.lineTo(150, -540); g.lineTo(160, -480); g.quadraticCurveTo(140, -420, 70, -410); g.stroke();
  g.restore();
  g.save(); g.translate(1060, 470); g.rotate(0.04); g.fillStyle = "#e7e3d8"; g.fillRect(-230, -310, 460, 620); cctvStill(g, -206, -286, 412, 572, u * 0.1, 2); g.restore();
  g.fillStyle = K; g.beginPath(); g.ellipse(980, 800, 60, 110, 0.3, 0, 7); g.fill(); // the hand holding the print
};
S["detective"] = (g, u) => {
  bg(g, "#081416", "#0e2427");
  g.fillStyle = "#081012"; g.fillRect(0, 0, 640, H);
  g.fillStyle = lin(g, 140, 980, [[0, "#ffae5a"], [1, "#d06a1c"]]); g.fillRect(820, 140, 520, 840);
  glow(g, 1080, 560, 700, SODIUM, 0.35);
  person(g, 1080, 980, 720, K, { hat: false });
  g.fillStyle = "#050505"; g.fillRect(800, 120, 20, 880); g.fillRect(1340, 120, 20, 880); g.fillRect(800, 120, 560, 20); g.fillRect(800, 540, 560, 14);
  g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = lin(g, 980, 1080, [[0, rgba(SODIUM, 0.3)], [1, rgba(SODIUM, 0)]]); g.fillRect(700, 980, 760, 100); g.restore();
};
S["release"] = (g, u) => {
  bg(g, "#0a1a1d", "#122a2e");
  g.fillStyle = "#081214"; g.fillRect(0, 0, 760, 780);
  g.fillStyle = lin(g, 200, 760, [[0, "#ffae5a"], [1, "#d06a1c"]]); g.fillRect(380, 260, 300, 500); glow(g, 530, 520, 520, SODIUM, 0.4);
  g.fillStyle = "#0e1b1d"; g.fillRect(0, 780, W, 300);
  g.save(); g.globalCompositeOperation = "screen"; for (let i = 0; i < 9; i++) { g.fillStyle = lin(g, 780, 1080, [[0, rgba(SODIUM, 0.35 - i * 0.03)], [1, rgba(SODIUM, 0)]]); g.fillRect(400 + i * 30 + Math.sin(u * 2 + i) * 4, 790, 18, 290); } g.restore();
  const walk = clamp(u / 7); person(g, 560 + walk * 380, 780 + walk * 40, 420, K, { rim: SODIUM, side: -1, walk: u });
  glow(g, 1560, 500, 160, SODIUM, 0.7); g.fillStyle = K; g.fillRect(1556, 500, 10, 300);
};

// ── 5 THE PORTRAIT (warm windows, red) ───────────────────────────────────────
S["portrait"] = (g, u) => {
  bg(g, "#12100d", "#1c1712");
  g.fillStyle = "#1a1612"; g.fillRect(0, 0, W, 820);
  glow(g, 360, 560, 520, "#ffcf6a", 0.4); g.fillStyle = "#2a2018"; g.fillRect(340, 560, 40, 300); g.fillStyle = "#ffcf6a"; g.beginPath(); g.moveTo(260, 560); g.lineTo(460, 560); g.lineTo(420, 470); g.lineTo(300, 470); g.fill();
  g.save(); g.translate(1060, 380); g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(-300 + 16, -200 + 18, 600, 400); // the canvas, turned to the wall: we see its back
  g.fillStyle = "#c9a878"; g.fillRect(-300, -200, 600, 400); g.fillStyle = "#a88656"; g.fillRect(-300, -200, 600, 30); g.fillRect(-300, 170, 600, 30); g.fillRect(-300, -200, 30, 400); g.fillRect(270, -200, 30, 400); g.fillRect(-15, -170, 30, 340); g.fillRect(-270, -15, 540, 30);
  g.fillStyle = "#6e5532"; g.font = '26px "Special Elite"'; g.fillText("FAMILY · 2019", -250, 140); g.restore();
  g.fillStyle = "#13100c"; g.fillRect(0, 820, W, 260);
  g.fillStyle = "#1f1914"; g.fillRect(1360, 640, 420, 200);
  person(g, 1500, 900, 300, K, { child: true, dress: true, hair: true });
  g.fillStyle = RED; g.save(); g.translate(1500, 900); g.beginPath(); g.moveTo(-300 * 0.62 * 0.1, -300 * 0.8); g.quadraticCurveTo(-300 * 0.13, -300 * 0.4, -300 * 0.2, -300 * 0.06); g.lineTo(300 * 0.2, -300 * 0.06); g.quadraticCurveTo(300 * 0.13, -300 * 0.4, 300 * 0.06, -300 * 0.8); g.fill(); g.restore();
  rainLines(g, u * 0.5, 0.15, 21, "rgba(255,220,160,0.08)");
};
S["dismissed"] = (g, u) => {
  g.fillStyle = "#e9e3d3"; g.fillRect(0, 0, W, H);
  halfdots(g, 0, 0, W, H, "rgba(0,0,0,0.05)", 14, 0);
  paper(g, 960, 520, 980, 860, -0.02, 12);
  g.save(); g.translate(960, 520); g.rotate(-0.02); g.fillStyle = "#1e1e1e"; g.font = '700 46px "Special Elite"'; g.textAlign = "center"; g.fillText("STATE OF MICHIGAN · WAYNE COUNTY", 0, -340); g.fillText("PEOPLE v. WILLIAMS", 0, -280); g.restore();
};

// ── 6 THE PATTERN (orange sky corridor) ──────────────────────────────────────
S["orange-street"] = (g, u) => {
  g.fillStyle = ORANGE; g.fillRect(0, 0, W, H);
  g.fillStyle = lin(g, 0, H, [[0, "#ff7a2e"], [1, "#ffb072"]]); g.fillRect(760, 0, 400, 760);
  g.fillStyle = "#123236"; g.beginPath(); g.moveTo(0, 0); g.lineTo(760, 0); g.lineTo(820, 760); g.lineTo(0, 1080); g.fill(); g.beginPath(); g.moveTo(W, 0); g.lineTo(1160, 0); g.lineTo(1100, 760); g.lineTo(W, 1080); g.fill();
  for (let i = 0; i < 8; i++) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(80 + i * 80, 100 + i * 70, 40, 900 - i * 120); g.fillRect(1800 - i * 80, 100 + i * 70, 40, 900 - i * 120); }
  g.fillStyle = "#1a4449"; g.beginPath(); g.moveTo(820, 760); g.lineTo(1100, 760); g.lineTo(1500, 1080); g.lineTo(420, 1080); g.fill();
  g.save(); g.globalCompositeOperation = "screen"; g.fillStyle = lin(g, 760, 1080, [[0, rgba(ORANGE, 0.5)], [1, rgba(ORANGE, 0)]]); g.fillRect(900, 760, 120, 320); g.restore();
  person(g, 960, 780, 150, K, { pregnant: true, dress: true, hair: true });
  g.save(); g.translate(0, 1560); g.scale(1, -1); g.globalAlpha = 0.25; person(g, 960, 780, 150, K, { pregnant: true, dress: true, hair: true }); g.restore();
  const on = Math.floor(u * 5) % 2; glow(g, 1000, 740, 70, on ? RED : BLUE, 0.7);
  const r = rng(6); for (let i = 0; i < 26; i++) { g.fillStyle = rgba(RED, 0.8); g.beginPath(); g.ellipse(300 + r() * 1300, 900 + r() * 170, 10 + r() * 14, 5 + r() * 5, 0, 0, 7); g.fill(); }
};
S["faces-96"] = (g, u) => {
  g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, W, H);
  const n = 10, cw = 86, ch = 92, x0 = 120, y0 = 80, red = Math.floor(clamp((u - 0.8) / 2.6) * 96);
  const order = [...Array(100).keys()].sort((a, b) => hash(a) - hash(b)).slice(0, 96);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const id = j * n + i, isRed = order.indexOf(id) > -1 && order.indexOf(id) < red;
    g.fillStyle = isRed ? RED : "#2c2c2c"; g.beginPath(); g.ellipse(x0 + i * cw + cw / 2, y0 + j * ch + 34, 22, 27, 0, 0, 7); g.fill(); g.fillRect(x0 + i * cw + cw / 2 - 28, y0 + j * ch + 60, 56, 26); }
};
S["nist"] = (g, u) => {
  g.fillStyle = "#e9e3d3"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(160, 900 - i * 100); g.lineTo(1760, 900 - i * 100); g.stroke(); }
  const r = rng(19); for (let i = 0; i < 40; i++) { const hb = 120 + r() * 120, hr = hb * (1.6 + r() * 2.2), p = clamp((u - 0.4 - i * 0.03) / 0.8);
    g.fillStyle = "#2c2c2c"; g.fillRect(180 + i * 39, 900 - hb * p, 14, hb * p); g.fillStyle = RED; g.fillRect(196 + i * 39, 900 - Math.min(700, hr) * p, 14, Math.min(700, hr) * p); }
  g.fillStyle = "#111"; g.fillRect(160, 900, 1600, 6);
  g.font = '700 30px "Schibsted Grotesk"'; g.fillStyle = "#2c2c2c"; g.fillRect(180, 960, 30, 30); g.fillStyle = "#111"; g.fillText("lower false-match rate", 230, 986); g.fillStyle = RED; g.fillRect(700, 960, 30, 30); g.fillStyle = "#111"; g.fillText("higher false-match rate (illustrative)", 750, 986);
};

// ── 7 THE RULES (poster collage) ─────────────────────────────────────────────
S["courthouse"] = (g, u) => {
  bg(g, "#0f2a2d", "#071416");
  glow(g, 960, 260, 900, "#ffe6b0", 0.18);
  g.fillStyle = "#d9d2bf"; g.beginPath(); g.moveTo(360, 300); g.lineTo(960, 120); g.lineTo(1560, 300); g.fill();
  g.fillRect(380, 300, 1160, 40); for (let i = 0; i < 8; i++) { g.fillStyle = "#cfc8b4"; g.fillRect(430 + i * 140, 360, 70, 520); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(480 + i * 140, 360, 20, 520); }
  g.fillStyle = "#d9d2bf"; g.fillRect(340, 880, 1240, 40); g.fillRect(300, 920, 1320, 40); g.fillRect(260, 960, 1400, 120);
  person(g, 960, 1000, 200, K, { rim: GOLD });
};
S["rules-poster"] = (g, u) => {
  g.fillStyle = "#e7dcc3"; g.fillRect(0, 0, W, H);
  halfdots(g, 0, 0, 900, H, "rgba(0,0,0,0.06)", 12, 0);
  g.fillStyle = "#111"; g.fillRect(0, 0, 880, H); g.fillStyle = TEAL2; g.fillRect(0, 0, 880, 380);
  g.fillStyle = "#111"; g.font = '230px "Anton"'; g.fillText("NEW", 150, 300);
  g.fillStyle = "#e7dcc3"; g.font = '230px "Anton"'; g.fillText("RULES", 150, 560);
  g.fillStyle = GOLD; g.fillRect(150, 600, 520, 12);
  g.fillStyle = "#e7dcc3"; g.font = '700 34px "Schibsted Grotesk"'; ["DETROIT POLICE", "FACIAL RECOGNITION", "SETTLEMENT · 2024"].forEach((t, i) => g.fillText(t, 154, 700 + i * 52));
  g.save(); g.translate(560, 960); g.rotate(-0.12); g.strokeStyle = RED; g.lineWidth = 6; g.strokeRect(-200, -60, 400, 120); g.fillStyle = RED; g.font = '60px "Special Elite"'; g.textAlign = "center"; g.fillText("BINDING", 0, 22); g.restore();
  g.fillStyle = "rgba(0,0,0,0.08)"; for (let i = 0; i < 6; i++) g.fillRect(900 + hash(i) * 900, hash(i + 4) * 1000, 300, 6);
};
S["morning-drive"] = (g, u) => {
  bg(g, "#f3c9a0", "#e9a26a");
  glow(g, 1500, 360, 600, "#fff1c8", 0.6); g.fillStyle = "#fff1c8"; g.beginPath(); g.arc(1500, 360, 110, 0, 7); g.fill();
  house(g, 1050, 780, 700, 300, "#3a2a24", null); g.fillStyle = "#4a3830"; g.fillRect(0, 780, W, 300);
  g.fillStyle = "#2c201b"; g.fillRect(1700, 300, 14, 480); g.fillRect(1650, 300, 80, 40); g.fillStyle = "#111"; g.beginPath(); g.arc(1660, 320, 14, 0, 7); g.fill(); // a camera on a pole, still watching
  person(g, 700, 980, 420, "#1d1512", {});
  person(g, 560, 980, 240, "#1d1512", { child: true, dress: true, hair: true });
  person(g, 840, 980, 190, "#1d1512", { child: true, dress: true, hair: true });
  car(g, 1250, 1000, 0.9, "#24191a");
};

// ── CLOSE ────────────────────────────────────────────────────────────────────
S["database"] = (g, u) => {
  g.fillStyle = "#F2C230"; g.fillRect(0, 0, W, H);
  halfdots(g, 0, 0, W, 600, "rgba(0,0,0,0.1)", 12, 1);
  g.save(); g.translate(1000, 520); g.transform(1, 0.28, 0, 1, 0, 0);
  g.fillStyle = "#111"; g.fillRect(-460, -560, 640, 1160); g.fillStyle = "#1c1c1c"; g.save(); g.transform(1, -0.56, 0, 1, 0, 0); g.fillRect(180, -460, 380, 1160); g.restore();
  for (let j = 0; j < 14; j++) for (let i = 0; i < 6; i++) { const lit = hash(i * 31 + j * 7 + Math.floor(u * 0.6)) > 0.5; g.fillStyle = lit ? "#F2C230" : "#2a2a2a"; g.fillRect(-420 + i * 100, -520 + j * 80, 56, 58); if (lit) { g.fillStyle = "#111"; g.beginPath(); g.ellipse(-392 + i * 100, -500 + j * 80, 11, 13, 0, 0, 7); g.fill(); g.fillRect(-406 + i * 100, -486 + j * 80, 28, 16); } }
  g.restore();
  person(g, 420, 1000, 120, "#111", { hat: true });
  g.strokeStyle = "#111"; g.lineWidth = 3; g.beginPath(); g.ellipse(420, 960, 70, 14, 0, 0, 7); g.stroke();
  rainLines(g, u, 0.5, 31, "rgba(0,0,0,0.2)");
};
S["booth"] = (g, u) => {
  bg(g, "#0a1c20", "#12343a");
  g.fillStyle = "#123236"; g.fillRect(0, 760, W, 320);
  glow(g, 1500, 300, 120, SODIUM, 0.8); g.fillStyle = "#ffcb8a"; g.beginPath(); g.arc(1500, 300, 50, 0, 7); g.fill();
  for (let i = 0; i < 5; i++) { g.fillStyle = "#0a1a1d"; g.fillRect(1100 + i * 170, 520 - i * 20, 12, 260 + i * 20); }
  g.fillStyle = "#0b1012"; g.fillRect(380, 140, 520, 760);
  g.fillStyle = lin(g, 220, 880, [[0, "#ffb15c"], [1, "#d46a1f"]]); g.fillRect(410, 230, 460, 640);
  glow(g, 640, 540, 600, SODIUM, 0.38);
  g.fillStyle = "#ff8a2a"; g.fillRect(410, 160, 460, 56); g.fillStyle = "#1a0d05"; g.font = '700 40px "Schibsted Grotesk"'; g.textAlign = "center"; g.fillText("TELEPHONE", 640, 202); g.textAlign = "left";
  person(g, 640, 870, 560, K, { hat: true });
  g.fillStyle = "#0b1012"; g.fillRect(410, 520, 460, 12); g.fillRect(630, 230, 12, 640);
  g.save(); g.globalCompositeOperation = "screen"; for (let i = 0; i < 6; i++) { g.fillStyle = lin(g, 900, 1080, [[0, rgba(SODIUM, 0.4)], [1, rgba(SODIUM, 0)]]); g.fillRect(420 + i * 80, 900, 40, 180); } g.restore();
};
})();
