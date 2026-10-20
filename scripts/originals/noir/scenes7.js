// Cases 09–11, mini-season "The Agents": the burglar who never slept (an AI-agent hacking
// spree), the missing junior (Anthropic's own workforce report), the ghost shopper (agents
// buying through Stripe's Link). Indigo night and gold like 06–07, plus the owner's poster
// references: one gold spotlight circle on the evidence and one Saul Bass red moment.
(() => {
const W = 1080, H = 1920, S = window.NOIR_SCENES;
const K = "#07060f", GOLD = "#E2B33C", GOLD2 = "#FFD978", AM = "#FFB347", RED = "#D9412B", PAPER = "#EFE8DA", NAVY = "#14172a", BLUE = "#9FD3FF";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(p));
const lin = (x, y0, y1, st, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function glow(x, cx, cy, r, col, a) { r = Math.max(1, r); x.save(); x.globalCompositeOperation = "screen"; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore(); }
function fig(x, fx, fy, h, col = K, { hat = true, walk = null } = {}) {
  x.save(); x.fillStyle = col; x.translate(fx, fy); const sw = walk == null ? 0 : Math.sin(walk) * h * 0.05;
  x.beginPath(); x.moveTo(-h * 0.07, -h * 0.36); x.lineTo(-h * 0.07 + sw, 0); x.lineTo(-h * 0.02 + sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(h * 0.07, -h * 0.36); x.lineTo(h * 0.07 - sw, 0); x.lineTo(h * 0.02 - sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(-h * 0.11, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.17, -h * 0.3); x.lineTo(h * 0.17, -h * 0.3); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.11, -h * 0.82); x.quadraticCurveTo(0, -h * 0.86, -h * 0.11, -h * 0.82); x.fill();
  x.beginPath(); x.ellipse(0, -h * 0.885, h * 0.052, h * 0.062, 0, 0, 7); x.fill();
  if (hat) { x.beginPath(); x.ellipse(0, -h * 0.925, h * 0.095, h * 0.018, 0, 0, 7); x.fill(); x.fillRect(-h * 0.055, -h * 0.985, h * 0.11, h * 0.06); }
  x.restore();
}
// A small agent: a featureless figure with a glowing visor, the swarm's foot soldier.
function agent(x, ax, ay, h, a = 1, col = BLUE) {
  x.save(); x.globalAlpha *= a; fig(x, ax, ay, h, "#0b0d18", { hat: false, walk: ax * 0.05 });
  x.fillStyle = col; x.fillRect(ax - h * 0.045, ay - h * 0.9, h * 0.09, h * 0.022); x.restore();
}
function ghost(x, gx, gy, h, a) { x.save(); x.globalAlpha *= a; fig(x, gx, gy, h, "rgba(207,231,245,0.35)", { hat: false }); x.strokeStyle = "rgba(207,231,245,0.6)"; x.lineWidth = 2; x.setLineDash([8, 8]); x.beginPath(); x.ellipse(gx, gy - h * 0.88, h * 0.06, h * 0.07, 0, 0, 7); x.stroke(); x.restore(); }
function night(x, top = "#0d0f1c", low = "#1a1d33") { x.fillStyle = lin(x, 0, H, [[0, top], [1, low]]); x.fillRect(-200, -200, W + 400, H + 400); }
function skyline(x, base, seed, u, col = "#11132a", lit = 0.25) {
  const r = rng(seed); let bx = -160;
  while (bx < W + 160) { const w = 70 + r() * 110, h = 260 + r() * 640; x.fillStyle = col; x.fillRect(bx, base - h, w, h);
    for (let j = 0; j < Math.floor(h / 30); j++) for (let i = 0; i < Math.floor(w / 20); i++) if (r() < lit) { x.fillStyle = rgba(AM, 0.45 + 0.4 * hash(i + j * 7 + seed + Math.floor(u * 0.5))); x.fillRect(bx + 6 + i * 20, base - h + 10 + j * 30, 8, 12); }
    bx += w + 6; }
}
function spot(x, cx, cy, r, a = 1) { x.save(); x.globalAlpha *= a; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, "#e8c65a"); g.addColorStop(0.75, GOLD); g.addColorStop(1, "#b8962f"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.restore(); }
function cone(x, cx, top, w, bottom, a = 0.22) { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, top, bottom, [[0, rgba(PAPER, 0.03)], [1, rgba(PAPER, a)]]); x.beginPath(); x.moveTo(cx - 10, top); x.lineTo(cx + 10, top); x.lineTo(cx + w / 2, bottom); x.lineTo(cx - w / 2, bottom); x.fill(); x.restore(); }
function paper(x, px, py, w, h, rot, lines = 6, col = PAPER) { x.save(); x.translate(px, py); x.rotate(rot); x.fillStyle = col; x.fillRect(-w / 2, -h / 2, w, h); x.fillStyle = "rgba(0,0,0,0.35)"; for (let l = 0; l < lines; l++) x.fillRect(-w / 2 + 16, -h / 2 + 24 + l * (h - 40) / lines, (w - 32) * (0.55 + 0.45 * hash(l + px)), 6); x.restore(); }
function desk(x, dx, dy, s, lit, empty = false) {
  x.save(); x.translate(dx, dy); x.scale(s, s);
  x.fillStyle = "#2a2d44"; x.fillRect(-90, 40, 180, 12);
  x.fillStyle = empty ? "#101118" : GOLD; x.globalAlpha = empty ? 0.95 : 0.85 + 0.15 * lit; x.fillRect(-56, -40, 112, 78); x.globalAlpha = 1;
  if (!empty) { x.fillStyle = "rgba(22,24,26,0.5)"; for (let l = 0; l < 3; l++) x.fillRect(-42, -26 + l * 16, 70 - l * 12, 6); glow(x, 0, 0, 120, GOLD2, 0.12 * lit); }
  x.fillStyle = "#2a2d44"; x.fillRect(-8, 38, 16, 4);
  if (empty) { x.strokeStyle = PAPER; x.lineWidth = 6; x.strokeRect(-32, 84, 64, 52); x.beginPath(); x.moveTo(-32, 84); x.lineTo(-32, 40); x.moveTo(32, 84); x.lineTo(32, 40); x.moveTo(-28, 136); x.lineTo(-28, 190); x.moveTo(28, 136); x.lineTo(28, 190); x.stroke(); }
  else fig(x, 0, 190, 170, "#0b0c10", { hat: false });
  x.restore();
}
function receipt(x, rx, ry, w, len, rows, total) {
  x.save(); x.fillStyle = "#f2ecdc"; x.fillRect(rx - w / 2, ry, w, len);
  x.fillStyle = "#f2ecdc"; for (let i = 0; i < w / 20; i++) { x.beginPath(); x.moveTo(rx - w / 2 + i * 20, ry + len); x.lineTo(rx - w / 2 + i * 20 + 10, ry + len + 12); x.lineTo(rx - w / 2 + i * 20 + 20, ry + len); x.fill(); }
  x.fillStyle = "#333"; x.font = '700 26px "Special Elite"';
  rows.forEach((r, i) => { const yy = ry + 50 + i * 44; if (yy > ry + len - 20) return; x.textAlign = "left"; x.fillText(r[0], rx - w / 2 + 24, yy); x.textAlign = "right"; x.fillText(r[1], rx + w / 2 - 24, yy); });
  if (total && len > rows.length * 44 + 120) { x.fillStyle = RED; x.font = '700 40px "Special Elite"'; x.textAlign = "center"; x.fillText(total, rx, ry + rows.length * 44 + 100); }
  x.textAlign = "left"; x.restore();
}
function rainGlass(x, u, seed) { // drops running down a window pane
  const r = rng(seed); x.save(); x.strokeStyle = "rgba(205,222,240,0.25)"; x.lineWidth = 3;
  for (let i = 0; i < 60; i++) { const sx = r() * W, sp = 60 + r() * 140, len = 30 + r() * 90, yy = ((r() * H + u * sp) % (H + 200)) - 100; x.beginPath(); x.moveTo(sx, yy); x.lineTo(sx + 4, yy + len); x.stroke(); x.fillStyle = "rgba(205,222,240,0.35)"; x.beginPath(); x.arc(sx + 4, yy + len, 5, 0, 7); x.fill(); }
  x.restore();
}

// ── Case 09: The Burglar Who Never Slept ─────────────────────────────────────
S["v-rain"] = (x, u, L) => {
  night(x, "#06070f", "#141832");
  L(0.15, () => { skyline(x, 1500, 4, u, "#151936", 0.3); glow(x, 540, 1300, 700, AM, 0.08); });
  L(0.45, () => { // the window frame
    x.fillStyle = "#05060c"; x.fillRect(-200, -200, 260, H + 400); x.fillRect(W - 60, -200, 260, H + 400); x.fillRect(-200, 960, W + 400, 26); x.fillRect(520, -200, 26, H + 400); x.fillRect(-200, 1540, W + 400, 600);
    rainGlass(x, u, 9);
    const blink = Math.floor(u * 2.2) % 2 === 0; // a cursor reflected in the glass
    if (blink) { x.fillStyle = rgba(GOLD2, 0.85); x.fillRect(700, 1150, 26, 50); glow(x, 713, 1175, 90, GOLD2, 0.35); }
    x.fillStyle = rgba(GOLD2, 0.5); x.font = '500 34px "Special Elite"'; x.fillText(">_", 640, 1192);
  });
  L(1, () => fig(x, 300, 1760, 420, "#020205"));
};
S["v-order"] = (x, u, L) => {
  x.fillStyle = "#04050a"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => {
    x.fillStyle = lin(x, 1180, H, [[0, "#1c2445"], [1, "#0c0f1d"]]); x.fillRect(-200, 1180, W + 400, 900); glow(x, 540, 1250, 500, BLUE, 0.12);
    x.fillStyle = "#151a30"; x.fillRect(250, 560, 580, 420); x.fillStyle = "#0a1220"; x.fillRect(275, 585, 530, 370); glow(x, 540, 770, 420, BLUE, 0.22);
    // glyph blocks typed one by one: abstract marks, not real characters
    const n = Math.min(14, Math.floor(u * 4)); for (let i = 0; i < n; i++) { const gx = 305 + (i % 7) * 70, gy = 640 + Math.floor(i / 7) * 90; x.fillStyle = rgba(BLUE, 0.9); x.fillRect(gx, gy, 46, 10); x.fillRect(gx + 18, gy - 18, 10, 46); if (i % 3 === 0) x.fillRect(gx, gy + 22, 46, 8); }
    x.fillStyle = "#151a30"; x.fillRect(500, 980, 80, 120); x.fillRect(400, 1090, 280, 20);
  });
  L(0.75, () => { // the swarm walks out of the screen
    const go = clamp((u - 2.0) / 5);
    for (let i = 0; i < 40; i++) { const lane = i % 5, t = clamp(go * 1.6 - i * 0.03); if (t <= 0) continue;
      const ax = 540 + t * (700 + lane * 80) * (i % 2 ? 1 : -1), ay = 1300 + lane * 90; agent(x, ax, ay, 170 + lane * 26, clamp(t * 4)); glow(x, ax, ay - (170 + lane * 26) * 0.9, 40, BLUE, 0.5 * clamp(t * 4)); }
  });
  L(1, () => { x.fillStyle = "#020306"; x.beginPath(); x.ellipse(540, 1980, 320, 260, 0, 0, 7); x.fill(); });
};
S["v-doors"] = (x, u, L) => {
  night(x, "#0d0f1c", "#1a1d33");
  L(0.4, () => {
    const cols = 26, rows = 40, d = 34, g = 7, ox = (W - cols * (d + g)) / 2, oy = 420, r = rng(17);
    for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) { const roll = r(), on = roll < 0.09 && u > 1 + roll * 60; x.fillStyle = on ? RED : roll < 0.18 ? "#3a3220" : "#1d2033"; x.fillRect(ox + c * (d + g), oy + rr * (d + g), d, d); }
  });
  L(0.85, () => { for (let i = 0; i < 9; i++) { const ax = ((i * 137 + u * 90) % (W + 200)) - 100; agent(x, ax, 1700 + (i % 3) * 60, 150, 0.9); } });
};
S["v-clock"] = (x, u, L) => {
  night(x, "#0b0c18", "#1d1a33");
  L(0.35, () => {
    const cx = 540, cy = 980, R = 330; x.fillStyle = "#151830"; x.beginPath(); x.arc(cx, cy, R + 30, 0, 7); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 10; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillStyle = GOLD; x.fillRect(cx + Math.cos(a) * (R - 40) - 6, cy + Math.sin(a) * (R - 40) - 6, 12, 12); }
    for (let i = 0; i < 24; i++) { const a = -Math.PI / 2 + i / 24 * Math.PI * 2, p = clamp(u / 5.5); if (i / 24 > p) break; x.strokeStyle = rgba(RED, 0.5); x.lineWidth = 26; x.beginPath(); x.arc(cx, cy, R - 90, a, a + Math.PI * 2 / 24 - 0.04); x.stroke(); }
    const hr = u * 1.3, mn = u * 15; x.strokeStyle = PAPER; x.lineCap = "round";
    x.lineWidth = 16; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(hr - Math.PI / 2) * 170, cy + Math.sin(hr - Math.PI / 2) * 170); x.stroke();
    x.lineWidth = 9; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(mn - Math.PI / 2) * 260, cy + Math.sin(mn - Math.PI / 2) * 260); x.stroke();
    x.fillStyle = GOLD; x.beginPath(); x.arc(cx, cy, 18, 0, 7); x.fill();
  });
  L(0.9, () => { x.fillStyle = "#0a0b14"; x.fillRect(-200, 1500, W + 400, 600); x.fillStyle = "#22253d"; x.fillRect(720, 1180, 200, 330); x.fillStyle = GOLD; x.beginPath(); x.arc(890, 1350, 9, 0, 7); x.fill(); agent(x, 660 + Math.sin(u * 6) * 6, 1500, 230, 1); });
};
S["v-alley"] = (x, u, L) => {
  x.fillStyle = "#07080e"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { // brick walls converging
    x.fillStyle = "#1a1418"; x.beginPath(); x.moveTo(-200, -200); x.lineTo(360, 700); x.lineTo(360, 1500); x.lineTo(-200, 2100); x.fill(); x.beginPath(); x.moveTo(W + 200, -200); x.lineTo(720, 700); x.lineTo(720, 1500); x.lineTo(W + 200, 2100); x.fill();
    x.strokeStyle = "rgba(0,0,0,0.5)"; x.lineWidth = 3; for (let i = 0; i < 30; i++) { const yy = 700 + i * 30; x.beginPath(); x.moveTo(-200, yy - (i - 15) * 18); x.lineTo(360, yy); x.moveTo(720, yy); x.lineTo(W + 200, yy - (i - 15) * 18); x.stroke(); }
    x.fillStyle = "#0e0f18"; x.fillRect(360, 700, 360, 800);
  });
  L(0.55, () => {
    spot(x, 540, 1060, 250, 0.95);
    const open = clamp((u - 2.5) / 2); x.fillStyle = "#16181A"; x.fillRect(450, 900, 180, 300);
    if (open > 0) { x.fillStyle = rgba(RED, 0.85); x.fillRect(450, 900, 180 * open, 300); glow(x, 540, 1050, 260, RED, 0.4 * open); }
    x.fillStyle = PAPER; x.font = '700 22px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("CONTROL PANEL", 540, 885); x.textAlign = "left";
    x.fillStyle = "#2a2a30"; x.fillRect(150, 1380, 200, 140); x.fillStyle = "#1e1e24"; x.fillRect(140, 1370, 220, 20);
  });
  L(0.9, () => { for (let i = 0; i < 6; i++) { const t = clamp((u - i * 0.5) / 5); agent(x, 900 - t * 340, 1640 - t * 420, 210 - t * 110, clamp(t * 3) * (1 - clamp((t - 0.95) * 20))); } fig(x, 120, 1900, 380, "#020205"); });
};
S["v-wall"] = (x, u, L) => {
  night(x, "#0b0c18", "#1b1830");
  L(0.25, () => skyline(x, 900, 23, u, "#14172f", 0.2));
  L(0.5, () => { // a long street of shopfronts; about one in ten goes red
    const r = rng(31); for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const sx = -40 + i * 130 + row * 30, sy = 820 + row * 230, hit = r() < 0.13 && u > 0.8 + i * 0.25;
      x.fillStyle = "#1d2033"; x.fillRect(sx, sy, 118, 200); x.fillStyle = hit ? RED : "#2a2d44"; x.fillRect(sx + 10, sy + 50, 98, 110); x.fillStyle = hit ? rgba(RED, 0.9) : rgba(GOLD, 0.6); x.fillRect(sx, sy + 8, 118, 22); if (hit) glow(x, sx + 59, sy + 100, 120, RED, 0.25); }
  });
  L(0.85, () => { x.fillStyle = "#08090f"; x.fillRect(-200, 1520, W + 400, 600); fig(x, 880, 1760, 300, "#020205"); });
};
S["v-receipt"] = (x, u, L) => {
  x.fillStyle = "#0b0a10"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#1b1622"; x.fillRect(-200, 1700, W + 400, 800); glow(x, 540, 1400, 600, AM, 0.12); });
  L(0.6, () => {
    const PY = 1640; x.fillStyle = "#26222e"; x.fillRect(320, PY - 18, 440, 140); x.fillStyle = "#0b0a10"; x.fillRect(360, PY, 360, 18);
    const len = Math.min(560, 60 + u * 110);
    x.save(); x.translate(0, PY); x.scale(1, -1); receipt(x, 540, 0, 330, len, [], null); x.restore();
    x.save(); x.beginPath(); x.rect(0, 0, W, PY); x.clip();
    const rows = [["TOKENS", "≈"], ["BREAK-INS", "100+"], ["PER BREAK-IN", "≈$50"], ["HOURS EACH", "≈23"], ["SITES TRIED", "1,200+"]];
    x.fillStyle = "#333"; x.font = '700 26px "Special Elite"'; rows.forEach((r, i) => { const yy = PY - len + 60 + i * 50; if (yy > PY - 28) return; x.textAlign = "left"; x.fillText(r[0], 400, yy); x.textAlign = "right"; x.fillText(r[1], 690, yy); });
    const ty = PY - len + 340; if (ty < PY - 40) { x.fillStyle = RED; x.font = '700 54px "Special Elite"'; x.textAlign = "center"; x.fillText("≈ $5,000", 540, ty); x.font = '700 24px "Special Elite"'; x.fillText("ESTIMATE", 540, ty + 40); }
    x.textAlign = "left"; x.restore();
  });
};
S["v-locks"] = (x, u, L) => {
  night(x, "#0b0c18", "#1d1a33");
  L(0.5, () => {
    spot(x, 540, 1350, 290, 0.95);
    x.fillStyle = "#16181A"; x.fillRect(420, 1120, 240, 420); x.strokeStyle = "#2b2e44"; x.lineWidth = 6; x.strokeRect(420, 1120, 240, 420);
    const locks = [[1220, 0.4], [1330, 2.0], [1440, 3.6]];
    locks.forEach(([ly, t0], i) => { const on = u > t0 + 2.6; x.fillStyle = on ? GOLD2 : "#4a4a52"; x.fillRect(600, ly - 22, 46, 44); x.strokeStyle = on ? GOLD2 : "#4a4a52"; x.lineWidth = 8; x.beginPath(); x.arc(623, ly - 22, 16, Math.PI, 0); x.stroke(); if (on) glow(x, 623, ly, 60, GOLD2, 0.4); });
  });
  L(0.95, () => fig(x, 170, 1900, 420, "#020205"));
};
S["v-roof"] = (x, u, L) => {
  night(x, "#05060d", "#1a1730");
  L(0.15, () => { glow(x, 820, 380, 260, PAPER, 0.18); x.fillStyle = "#e9e2cf"; x.beginPath(); x.arc(820, 380, 70, 0, 7); x.fill(); });
  L(0.35, () => skyline(x, 1450, 41, u, "#121530", 0.3));
  L(0.7, () => { x.fillStyle = "#06070c"; x.fillRect(-200, 1450, W + 400, 700); for (let i = 0; i < 8; i++) x.fillRect(80 + i * 130, 1390, 10, 70); x.fillRect(-200, 1385, W + 400, 12); });
  L(1, () => fig(x, 560, 1460, 360, "#020205"));
};

// ── Case 10: The Missing Junior ──────────────────────────────────────────────
S["w-office"] = (x, u, L) => {
  night(x, "#0f1124", "#222540");
  L(0.2, () => { x.fillStyle = "#0d0f1e"; x.fillRect(-200, -200, 340, H + 400); x.fillRect(940, -200, 340, H + 400); for (const y of [160, 420, 700, 980]) { x.fillStyle = rgba(GOLD, 0.7); x.fillRect(-200, y, 320, 10); x.fillRect(960, y, 320, 10); } });
  cone(x, 540, -100, 340, 1700, 0.26);
  L(0.6, () => { for (let r = 0; r < 4; r++) { const y = 780 + r * 190, n = 5 + r, sc = 0.55 + r * 0.17, span = 760 + r * 140, x0 = (W - span) / 2;
    for (let i = 0; i < n; i++) desk(x, x0 + span / (n - 1) * i, y, sc, 0.6 + 0.4 * hash(i + r * 9 + Math.floor(u * 1.5)), r === 3 && i === Math.floor(n / 2)); } });
  L(1, () => fig(x, 1010, 1820, 300, "#040409"));
};
S["w-report"] = (x, u, L) => {
  x.fillStyle = "#0b0a10"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#2a1f16"; x.fillRect(-200, 1000, W + 400, 1100); glow(x, 680, 700, 600, AM, 0.3); x.fillStyle = "#1a140e"; x.fillRect(660, 420, 16, 300); x.fillStyle = "#3d5a3a"; x.beginPath(); x.moveTo(580, 430); x.lineTo(760, 430); x.lineTo(720, 380); x.lineTo(620, 380); x.fill(); });
  L(0.6, () => {
    const drop = 1 - Math.min(1, u / 1.2), yy = 1200 - drop * 400;
    x.save(); x.translate(500, yy); x.rotate(-0.06); x.fillStyle = PAPER; x.fillRect(-260, -330, 520, 660); x.fillStyle = "#16181A"; x.font = '800 40px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("EMPLOYMENT AT", 0, -230); x.fillText("ANTHROPIC", 0, -180);
    x.fillStyle = GOLD; x.fillRect(-120, -150, 240, 6); x.fillStyle = "rgba(0,0,0,0.35)"; for (let l = 0; l < 9; l++) x.fillRect(-200, -100 + l * 42, 400 * (0.6 + 0.4 * hash(l)), 8);
    x.fillStyle = RED; x.fillRect(-200, 290, 140, 8); x.textAlign = "left"; x.restore();
  });
  L(0.9, () => { x.fillStyle = "#060508"; x.save(); x.translate(130, 1960); x.beginPath(); x.ellipse(0, -880, 90, 105, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(-330, 0); x.quadraticCurveTo(-330, -650, -160, -770); x.quadraticCurveTo(0, -820, 160, -770); x.quadraticCurveTo(330, -650, 330, 0); x.fill(); x.beginPath(); x.ellipse(0, -965, 150, 24, 0, 0, 7); x.fill(); x.fillRect(-90, -1080, 180, 110); x.restore(); });
};
S["w-bars"] = (x, u, L) => {
  night(x, "#0f1124", "#1d1f38");
  L(0.5, () => {
    const p = ease(clamp((u - 2.2) / 1.6)), base = 1180, sc = 22;
    x.fillStyle = "#2a2d44"; x.fillRect(150, base, 780, 6);
    x.fillStyle = PAPER; x.fillRect(260, base - 27 * sc, 200, 27 * sc);
    const h = (27 - 18 * p) * sc; x.fillStyle = p > 0.95 ? RED : GOLD; x.fillRect(620, base - h, 200, h);
    if (p > 0) { x.strokeStyle = rgba(RED, 0.7); x.setLineDash([14, 10]); x.lineWidth = 4; x.strokeRect(620, base - 27 * sc, 200, 27 * sc - h); x.setLineDash([]); }
  });
  L(0.9, () => { for (let i = 0; i < 6; i++) fig(x, 120 + i * 170, 1560, 200 - (i === 5 ? 0 : 0), i === 5 && u > 3.5 ? "rgba(7,6,15,0.15)" : "#06060c", { hat: false }); });
};
S["w-hours"] = (x, u, L) => {
  night(x, "#0d0f20", "#1e1d38");
  L(0.5, () => {
    const tilt = ease(clamp((u - 1) / 2.5)) * 0.32, cx = 540, cy = 1120;
    x.fillStyle = GOLD; x.fillRect(cx - 8, cy, 16, 420); x.fillRect(cx - 120, cy + 410, 240, 18); x.beginPath(); x.arc(cx, cy, 20, 0, 7); x.fill();
    x.save(); x.translate(cx, cy); x.rotate(tilt); x.fillStyle = GOLD; x.fillRect(-380, -6, 760, 12);
    const panL = [-340, 0], panR = [340, 0];
    for (const [px] of [panL, panR]) { x.strokeStyle = GOLD; x.lineWidth = 3; x.beginPath(); x.moveTo(px, 0); x.lineTo(px - 90, 200); x.moveTo(px, 0); x.lineTo(px + 90, 200); x.stroke(); }
    x.restore();
    const ly = cy - Math.sin(tilt) * 340 + 200, ry = cy + Math.sin(tilt) * 340 + 200;
    x.fillStyle = GOLD; x.fillRect(cx - 340 * Math.cos(tilt) - 110, ly, 220, 14); x.fillRect(cx + 340 * Math.cos(tilt) - 110, ry, 220, 14);
    fig(x, cx - 340 * Math.cos(tilt), ly, 190, PAPER, { hat: false });
    for (let i = 0; i < 6; i++) agent(x, cx + 340 * Math.cos(tilt) - 85 + (i % 3) * 85, ry - (i > 2 ? 0 : 0), 110 + (i > 2 ? -20 : 0), clamp((u - i * 0.25) * 2));
  });
};
S["w-meetings"] = (x, u, L) => {
  night(x, "#0d0f20", "#1e1d38");
  L(0.45, () => {
    const cols = 5, rows = 9, cw = 168, ch = 100, ox = 120, oy = 560;
    x.fillStyle = "#15182e"; x.fillRect(ox - 20, oy - 90, cols * cw + 40, rows * ch + 120);
    x.fillStyle = PAPER; x.font = '700 26px "Schibsted Grotesk"'; ["MON", "TUE", "WED", "THU", "FRI"].forEach((d, i) => x.fillText(d, ox + i * cw + 50, oy - 40));
    x.strokeStyle = "#2a2d44"; x.lineWidth = 2; for (let i = 0; i <= cols; i++) { x.beginPath(); x.moveTo(ox + i * cw, oy); x.lineTo(ox + i * cw, oy + rows * ch); x.stroke(); } for (let j = 0; j <= rows; j++) { x.beginPath(); x.moveTo(ox, oy + j * ch); x.lineTo(ox + cols * cw, oy + j * ch); x.stroke(); }
    const r = rng(12), n = Math.floor(clamp(u / 6) * 36); for (let k = 0; k < n; k++) { const c = Math.floor(r() * cols), j = Math.floor(r() * rows); x.fillStyle = k % 5 === 4 ? rgba(RED, 0.85) : rgba(GOLD, 0.85); x.fillRect(ox + c * cw + 8, oy + j * ch + 8, cw - 16, ch - 16); }
  });
};
S["w-stack"] = (x, u, L) => {
  x.fillStyle = "#0b0a12"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => { x.fillStyle = "#1c1826"; x.fillRect(-200, 1400, W + 400, 700); glow(x, 540, 1100, 650, PAPER, 0.08); });
  L(0.7, () => { const r = rng(6), n = Math.floor(10 + u * 8); for (let i = 0; i < Math.min(60, n); i++) { const col = i % 3; paper(x, 300 + col * 240 + (r() - 0.5) * 40, 1380 - Math.floor(i / 3) * 34, 220, 300, (r() - 0.5) * 0.12, 5); } });
  L(1, () => fig(x, 960, 1900, 380, "#030306"));
};
S["w-ladder"] = (x, u, L) => {
  night(x, "#0d0f20", "#1f1c36");
  L(0.4, () => {
    spot(x, 540, 1190, 300, 0.95);
    x.strokeStyle = "#16181A"; x.lineWidth = 18; x.beginPath(); x.moveTo(440, 420); x.lineTo(440, 1560); x.moveTo(640, 420); x.lineTo(640, 1560); x.stroke();
    for (let i = 0; i < 10; i++) { const y = 470 + i * 110; if (i === 9) { x.strokeStyle = rgba(RED, 0.9); x.setLineDash([16, 12]); x.lineWidth = 8; x.beginPath(); x.moveTo(440, y); x.lineTo(640, y); x.stroke(); x.setLineDash([]); continue; } x.strokeStyle = "#16181A"; x.lineWidth = 14; x.beginPath(); x.moveTo(440, y); x.lineTo(640, y); x.stroke(); }
    fig(x, 540, 520, 150, "#16181A");
  });
  L(0.9, () => { const reach = 0.5 + 0.5 * Math.sin(u * 1.2); fig(x, 760, 1640, 200, "#06060c", { hat: false }); x.strokeStyle = "#06060c"; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.moveTo(740, 1480); x.lineTo(680 - reach * 20, 1400 - reach * 30); x.stroke(); });
};
S["w-pencil"] = (x, u, L) => {
  x.fillStyle = "#0d0b12"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.25, () => { x.fillStyle = "#1f2440"; x.fillRect(640, 220, 360, 520); x.fillStyle = lin(x, 220, 740, [[0, "#3a3a6a"], [1, "#e09a5a"]]); x.fillRect(660, 240, 320, 480); x.fillStyle = "#1f2440"; x.fillRect(812, 240, 16, 480); x.fillRect(660, 472, 320, 16); });
  L(0.5, () => {
    x.fillStyle = "#2a2018"; x.fillRect(-200, 1180, W + 400, 900);
    x.save(); x.translate(480, 1300); x.rotate(-0.05); x.fillStyle = PAPER; x.fillRect(-300, -220, 600, 440); x.fillStyle = "rgba(0,0,0,0.4)"; for (let l = 0; l < 8; l++) x.fillRect(-260, -180 + l * 48, 520 * (0.6 + 0.4 * hash(l + 3)), 8);
    const p = clamp((u - 1) / 4); x.strokeStyle = RED; x.lineWidth = 6; x.lineCap = "round";
    x.beginPath(); x.moveTo(-260, -132); x.lineTo(-260 + 400 * clamp(p * 3), -132); x.stroke();
    if (p > 0.35) { x.beginPath(); x.ellipse(60, 10, 120 * clamp((p - 0.35) * 3), 36, 0, 0, 7); x.stroke(); }
    if (p > 0.7) { x.beginPath(); x.moveTo(-250, 120); x.lineTo(-220, 150); x.lineTo(-170, 90); x.stroke(); }
    x.restore();
  });
  L(0.9, () => { fig(x, 860, 1900, 520, "#050407", { hat: false }); x.strokeStyle = RED; x.lineWidth = 10; x.beginPath(); x.moveTo(700, 1280); x.lineTo(760, 1180); x.stroke(); });
};

// ── Case 11: The Ghost Shopper ───────────────────────────────────────────────
S["y-street"] = (x, u, L) => {
  night(x, "#0e1020", "#26213a");
  L(0.2, () => skyline(x, 1300, 51, u, "#171a2c", 0.22));
  L(0.5, () => { x.fillStyle = "#0b0c14"; x.fillRect(-200, 1300, W + 400, 800); for (let i = 0; i < 7; i++) { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 1310, 1700, [[0, rgba(AM, 0.25)], [1, rgba(AM, 0)]]); x.fillRect(60 + i * 160, 1310, 12, 390); x.restore(); } });
  L(0.8, () => { // a bag walking on its own
    const bx = -100 + ((u * 90) % (W + 300)), by = 1290 + Math.sin(u * 5) * 10;
    x.save(); x.translate(bx, by); x.fillStyle = GOLD; x.beginPath(); x.moveTo(-60, -40); x.lineTo(60, -40); x.lineTo(74, 110); x.lineTo(-74, 110); x.fill(); x.strokeStyle = GOLD; x.lineWidth = 10; x.beginPath(); x.arc(0, -40, 32, Math.PI, 0); x.stroke(); x.restore();
    ghost(x, bx, by + 170, 300, 0.5 + 0.2 * Math.sin(u * 2));
  });
  L(1, () => { x.fillStyle = "#020205"; x.fillRect(880, 900, 260, 1100); fig(x, 960, 1820, 340, "#000"); });
};
S["y-sun"] = (x, u, L) => {
  x.fillStyle = "#EFE8DA"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { const s = ease(clamp(u / 1.5)); x.fillStyle = RED; x.beginPath(); x.arc(540, 1290 - 60 * s, 330 * s, 0, 7); x.fill(); }); // a sun rising behind the bars, clear of the counter
  L(0.6, () => { // a Saul Bass road of rising bars
    x.fillStyle = "#16181A"; x.fillRect(-200, 1250, W + 400, 900);
    for (let i = 0; i < 9; i++) { const h = 40 + Math.pow(i, 2.1) * 9 * clamp((u - 0.5 - i * 0.15) * 2); x.fillStyle = i === 8 ? RED : "#16181A"; x.fillRect(80 + i * 110, 1250 - h, 80, h); }
  });
  L(0.9, () => fig(x, 900, 1720, 360, "#16181A"));
};
S["y-ledger"] = (x, u, L) => {
  x.fillStyle = "#0b0a10"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = "#2a2018"; x.fillRect(-200, 900, W + 400, 1200);
    x.save(); x.translate(540, 1150); x.rotate(-0.04); x.fillStyle = "#e8dfc8"; x.fillRect(-460, -300, 440, 600); x.fillRect(20, -300, 440, 600); x.fillStyle = "#b9ad90"; x.fillRect(-20, -300, 40, 600);
    x.strokeStyle = "rgba(60,90,120,0.4)"; x.lineWidth = 2; for (let l = 0; l < 14; l++) { x.beginPath(); x.moveTo(-440, -260 + l * 40); x.lineTo(440, -260 + l * 40); x.stroke(); }
    x.strokeStyle = rgba(RED, 0.6); x.beginPath(); x.moveTo(300, -300); x.lineTo(300, 300); x.stroke();
    x.fillStyle = "#333"; x.font = '700 24px "Special Elite"'; ["SEPT", "AGENT BUYS", "VOLUME", "AGENTS", "AVG BUY"].forEach((t, i) => x.fillText(t, -430, -230 + i * 80)); [" x38", " x20", "~200", "~$100"].forEach((t, i) => x.fillText(t, 60, -150 + i * 80));
    x.font = '800 30px "Schibsted Grotesk"'; x.fillText("TOTAL", 320, -230); x.fillStyle = RED; x.font = '900 120px "Bodoni Moda"'; x.globalAlpha = 0.5 + 0.5 * Math.sin(u * 2.5); x.fillText("?", 345, 60); x.globalAlpha = 1;
    x.restore();
  });
  L(0.9, () => { x.fillStyle = "#050407"; x.beginPath(); x.ellipse(160, 1950, 260, 340, 0, 0, 7); x.fill(); });
};
S["y-queue"] = (x, u, L) => {
  night(x, "#100f22", "#24203a");
  L(0.3, () => { x.fillStyle = "#1b1830"; x.fillRect(-200, 1260, W + 400, 900); x.fillStyle = GOLD; x.fillRect(780, 830, 260, 30); x.fillStyle = "#2a2540"; x.fillRect(800, 860, 220, 400); glow(x, 900, 780, 300, AM, 0.3); x.fillStyle = PAPER; x.font = '800 30px "Schibsted Grotesk"'; x.fillText("CHECKOUT", 818, 810); });
  L(0.6, () => { const n = Math.floor(4 + clamp(u / 8) * 18); for (let i = 0; i < n; i++) { const gx = 740 - i * 62, gy = 1250 + (i % 2) * 18; if (gx < -80) break; ghost(x, gx, gy, 260 - i * 3, 0.85); } });
  L(1, () => fig(x, 130, 1950, 330, "#020205"));
};
S["y-receipt"] = (x, u, L) => {
  x.fillStyle = "#0c0a12"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => { x.fillStyle = "#1c1826"; x.fillRect(-200, 1450, W + 400, 700); glow(x, 540, 1100, 600, AM, 0.12); });
  L(0.6, () => {
    const len = Math.min(300, 40 + u * 90); receipt(x, 280, 1070, 300, len, [["AGENT #117", ""], ["ITEM", "$98"], ["ITEM", "$104"], ["FLIGHT", "$1,240"], ["SOFA", "$2,100"]], null);
    const slide = ease(clamp((u - 3) / 1.2)); x.save(); x.translate(1300 - slide * 520, 1130); x.rotate(0.08); x.fillStyle = PAPER; x.fillRect(-170, -70, 340, 140); x.fillStyle = "#16181A"; x.font = '800 30px "Schibsted Grotesk"'; x.fillText("BOARDING PASS", -150, -20); x.fillStyle = RED; x.fillRect(-150, 10, 120, 8); x.restore();
    const s2 = ease(clamp((u - 4.2) / 1.2)); x.save(); x.translate(1300 - s2 * 520, 1340); x.scale(0.8, 0.8); x.fillStyle = GOLD; x.fillRect(-150, -40, 300, 80); x.fillRect(-170, -90, 40, 130); x.fillRect(130, -90, 40, 130); x.fillRect(-150, -110, 300, 70); x.restore();
  });
};
S["y-mirror"] = (x, u, L) => {
  night(x, "#0e1020", "#26213a");
  L(0.2, () => { for (let i = 0; i < 10; i++) { const p = (((u * 0.35 + i / 10) % 1) + 1) % 1, r = 30 + p * 400; glow(x, 540 + (i % 2 ? 1 : -1) * p * 700, 1500 + p * 300, r, AM, 0.25 * (1 - p)); } });
  L(0.5, () => {
    x.fillStyle = "#0b0c10"; x.fillRect(500, 560, 80, 70); x.fillStyle = "#0b0c10"; x.beginPath(); x.roundRect(110, 620, 860, 400, 200); x.fill(); x.fillStyle = PAPER; x.beginPath(); x.roundRect(134, 644, 812, 352, 176); x.fill();
    spot(x, 540, 820, 165, 0.18);
    x.save(); x.translate(540, 820); x.rotate(-0.06); x.strokeStyle = "#16181A"; x.lineWidth = 7; x.setLineDash([22, 16]); x.lineDashOffset = -u * 40; x.beginPath(); x.roundRect(-230, -135, 460, 270, 24); x.stroke(); x.setLineDash([]);
    x.fillStyle = GOLD; x.fillRect(-190, -90, 70, 52); x.fillStyle = "#16181A"; x.font = '700 32px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("•••• •••• •••• 0000", 0, 30); x.font = '700 20px "Schibsted Grotesk"'; x.globalAlpha = 0.6; x.fillText("CARDHOLDER: AN AI AGENT", 0, 90); x.textAlign = "left"; x.restore();
  });
  L(0.9, () => { x.fillStyle = "#050509"; x.fillRect(-200, 1420, W + 400, 700); x.strokeStyle = "#1a1a24"; x.lineWidth = 30; x.beginPath(); x.arc(540, 1900, 380, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); });
};
S["y-check"] = (x, u, L) => {
  x.fillStyle = "#0c0a12"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => { x.fillStyle = "#2a2018"; x.fillRect(-200, 1200, W + 400, 900); });
  L(0.6, () => {
    spot(x, 540, 1380, 280, 0.95);
    x.fillStyle = "#3a2416"; x.beginPath(); x.roundRect(370, 1290, 340, 200, 26); x.fill(); x.fillStyle = "#2a190f"; x.fillRect(370, 1360, 340, 12);
    const shut = ease(clamp((u - 4.5) / 0.8)); x.fillStyle = GOLD2; x.fillRect(600, 1380, 70, 60); x.strokeStyle = GOLD2; x.lineWidth = 10; x.beginPath(); x.arc(635, 1380 - (1 - shut) * 22, 24, Math.PI, 0); x.stroke(); if (shut > 0.9) glow(x, 635, 1400, 90, GOLD2, 0.45);
  });
  L(0.95, () => fig(x, 160, 1900, 400, "#020205"));
};
S["y-roof"] = (x, u, L) => {
  night(x, "#05060d", "#1a1730");
  L(0.15, () => { glow(x, 260, 360, 260, PAPER, 0.18); x.fillStyle = "#e9e2cf"; x.beginPath(); x.arc(260, 360, 66, 0, 7); x.fill(); });
  L(0.35, () => skyline(x, 1450, 61, u, "#121530", 0.3));
  L(0.7, () => { x.fillStyle = "#06070c"; x.fillRect(-200, 1450, W + 400, 700); x.fillRect(-200, 1385, W + 400, 12); for (let i = 0; i < 8; i++) x.fillRect(80 + i * 130, 1390, 10, 70);
    x.save(); x.translate(760, 1385); x.fillStyle = GOLD; x.beginPath(); x.moveTo(-36, -70); x.lineTo(36, -70); x.lineTo(44, 0); x.lineTo(-44, 0); x.fill(); x.strokeStyle = GOLD; x.lineWidth = 6; x.beginPath(); x.arc(0, -70, 20, Math.PI, 0); x.stroke(); x.restore(); });
  L(1, () => fig(x, 480, 1460, 360, "#020205"));
};
})();
