// Case 13: The Table of Contents. Meta's Muse built each shared-chat link from the
// conversation's title; security firm Claroc found 6,800+ of them, listed by name, in
// public passive-DNS records, and Meta paused sharing. Indigo night and gold like 09–12;
// the red moment is the titles themselves, the part that should never have been public.
(() => {
const W = 1080, H = 1920, S = window.NOIR_SCENES;
const K = "#07060f", GOLD = "#E2B33C", GOLD2 = "#FFD978", AM = "#FFB347", RED = "#D9412B", PAPER = "#EFE8DA", BLUE = "#9FD3FF";
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
function night(x, top = "#0d0f1c", low = "#1a1d33") { x.fillStyle = lin(x, 0, H, [[0, top], [1, low]]); x.fillRect(-200, -200, W + 400, H + 400); }
function spot(x, cx, cy, r, a = 1) { x.save(); x.globalAlpha *= a; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, "#e8c65a"); g.addColorStop(0.75, GOLD); g.addColorStop(1, "#b8962f"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.restore(); }
function skyline(x, base, seed, u, col = "#11132a", lit = 0.25) {
  const r = rng(seed); let bx = -160;
  while (bx < W + 160) { const w = 70 + r() * 110, h = 260 + r() * 640; x.fillStyle = col; x.fillRect(bx, base - h, w, h);
    for (let j = 0; j < Math.floor(h / 30); j++) for (let i = 0; i < Math.floor(w / 20); i++) if (r() < lit) { x.fillStyle = rgba(AM, 0.45 + 0.4 * hash(i + j * 7 + seed + Math.floor(u * 0.5))); x.fillRect(bx + 6 + i * 20, base - h + 10 + j * 30, 8, 12); }
    bx += w + 6; }
}
function phone(x, px, py, s, lit = 1, rot = 0) {
  x.save(); x.translate(px, py); x.rotate(rot); x.scale(s, s);
  x.fillStyle = "#0b0c14"; x.beginPath(); x.roundRect(-60, -110, 120, 220, 18); x.fill();
  x.fillStyle = lit > 0 ? rgba(BLUE, 0.25 + 0.6 * lit) : "#151830"; x.beginPath(); x.roundRect(-50, -96, 100, 192, 10); x.fill();
  if (lit > 0) { x.fillStyle = rgba(PAPER, 0.7 * lit); for (let i = 0; i < 4; i++) x.fillRect(-38, -76 + i * 26, 76 - (i % 2) * 24, 9); x.fillStyle = rgba(GOLD2, 0.9 * lit); x.fillRect(-38, 40, 76, 22); }
  x.restore();
}
// Redacted title blocks: the part of the address that gave the chat away.
function blocks(x, bx, by, n, h, col, seed) { const r = rng(seed); let cx = bx; for (let i = 0; i < n; i++) { const w = 26 + r() * 60; x.fillStyle = col; x.fillRect(cx, by, w, h); cx += w + 12; } return cx; }

// ── Case 13: The Table of Contents ───────────────────────────────────────────
S["m-phone"] = (x, u, L) => {
  night(x, "#05060d", "#151933");
  L(0.2, () => skyline(x, 1500, 61, u, "#141831", 0.22));
  L(0.5, () => { // a gold link travels out of the phone and up over the rooftops
    const p = clamp((u - 1.5) / 5);
    x.save(); x.strokeStyle = rgba(GOLD2, 0.85); x.lineWidth = 5; x.setLineDash([16, 14]); x.lineDashOffset = -u * 40;
    x.beginPath(); x.moveTo(470, 1430); x.bezierCurveTo(380, 1150, 700, 1050, 520 + 380 * p, 900 - 200 * p); x.stroke(); x.restore();
    if (p > 0) { glow(x, 520 + 380 * p, 900 - 200 * p, 70, GOLD2, 0.6); }
  });
  L(0.8, () => { x.fillStyle = "#07080e"; x.fillRect(-200, 1620, W + 400, 600);
    x.fillStyle = "#11131f"; x.fillRect(196, 1100, 12, 560); glow(x, 202, 1100, 220, AM, 0.25);
    fig(x, 420, 1700, 470, "#020205"); phone(x, 470, 1450, 0.42, 0.9, -0.2); glow(x, 470, 1450, 160, BLUE, 0.35); });
};
S["m-apps"] = (x, u, L) => {
  night(x, "#06070f", "#121630");
  L(0.4, () => { // phones lighting up one by one, rows on rows
    const cols = 7, rows = 9, n = Math.floor(u * 9);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, on = hash(i * 3.1) * 63 < n;
      phone(x, 120 + c * 140, 420 + r * 175, 0.55, on ? 0.75 + 0.25 * hash(i + Math.floor(u * 2)) : 0); }
  });
  L(0.95, () => fig(x, 930, 1900, 400, "#020205"));
};
S["m-sign"] = (x, u, L) => {
  x.fillStyle = "#0b0a10"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#1a1418"; x.fillRect(-200, 500, W + 400, 1200); x.strokeStyle = "rgba(0,0,0,0.45)"; x.lineWidth = 3;
    for (let r = 0; r < 30; r++) { const y = 520 + r * 40; x.beginPath(); x.moveTo(-200, y); x.lineTo(W + 200, y); x.stroke(); for (let c = 0; c < 16; c++) { const xx = (c * 90 + (r % 2) * 45) - 100; x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y + 40); x.stroke(); } } });
  L(0.6, () => { // an enamel street sign: the address, with the chat's title spelled out in it
    spot(x, 540, 1020, 470, 0.22); glow(x, 540, 1020, 520, GOLD2, 0.18);
    x.fillStyle = "#1c2445"; x.beginPath(); x.roundRect(70, 870, 940, 300, 22); x.fill(); x.strokeStyle = PAPER; x.lineWidth = 8; x.beginPath(); x.roundRect(90, 890, 900, 260, 16); x.stroke();
    const p = clamp((u - 1.4) / 1.2), end = blocks(x, 140, 950, 4, 46, rgba(RED, 0.25 + 0.75 * p), 7);
    if (p > 0) glow(x, (140 + end) / 2, 973, 260, RED, 0.35 * p);
    x.fillStyle = PAPER; x.font = '700 40px "Special Elite"'; x.textAlign = "left"; x.fillText(".metaaiusercontent.com", 140, 1090); x.fillStyle = rgba(PAPER, 0.6); x.font = '500 30px "Special Elite"'; x.fillText("cf.", 140, 1040);
  });
  L(0.95, () => fig(x, 900, 1900, 420, "#020205"));
};
S["m-ledger"] = (x, u, L) => {
  night(x, "#0b0c18", "#1d1a33");
  L(0.4, () => { // a giant open register on a desk, under a lamp
    x.fillStyle = "#14121a"; x.fillRect(-200, 1250, W + 400, 900); glow(x, 540, 1150, 560, AM, 0.22);
    x.fillStyle = "#2a1d14"; x.fillRect(150, 1000, 780, 360);
    for (const [px, rot] of [[340, -0.03], [740, 0.03]]) { x.save(); x.translate(px, 1170); x.rotate(rot); x.fillStyle = PAPER; x.fillRect(-190, -160, 380, 320);
      x.fillStyle = "rgba(0,0,0,0.3)"; for (let l = 0; l < 10; l++) x.fillRect(-160, -130 + l * 28, 300 * (0.5 + 0.5 * hash(l + px)), 5); x.restore(); }
    const flip = (u * 0.8) % 1; x.save(); x.translate(540, 1170); x.scale(Math.cos(flip * Math.PI), 1); x.fillStyle = "#e6dfcc"; x.fillRect(0, -160, 190, 320); x.restore();
    x.fillStyle = "#0e0f18"; x.fillRect(520, 640, 40, 360); x.fillStyle = "#1d6b4a"; x.beginPath(); x.moveTo(400, 700); x.lineTo(680, 700); x.lineTo(620, 620); x.lineTo(460, 620); x.fill(); glow(x, 540, 720, 220, GOLD2, 0.35);
  });
  L(1, () => fig(x, 140, 1900, 420, "#020205"));
};
S["m-index"] = (x, u, L) => {
  x.fillStyle = "#07070d"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => { // an endless table of contents: redacted titles, dotted leaders, page numbers
    x.save(); x.translate(0, -((u * 60) % 72)); x.fillStyle = "#1b1a26"; x.fillRect(120, -100, 840, H + 300); x.fillStyle = rgba(GOLD, 0.5); x.fillRect(120, -100, 6, H + 300); x.fillRect(954, -100, 6, H + 300);
    for (let i = 0; i < 32; i++) { const y = -60 + i * 72, hot = hash(i * 7.3) > 0.62; const end = blocks(x, 160, y, 2 + Math.floor(hash(i) * 3), 26, hot ? RED : "#4a4a5e", i + 3);
      x.fillStyle = "#3a3a4c"; for (let d = end + 10; d < 840; d += 18) x.fillRect(d, y + 20, 5, 5);
      x.font = '700 30px "Special Elite"'; x.textAlign = "right"; x.fillStyle = rgba(GOLD, 0.7); x.fillText(String(1 + i * 213 % 6800), 920, y + 26); }
    x.textAlign = "left";
    x.restore();
    x.fillStyle = lin(x, 0, H, [[0, "rgba(7,7,13,0.9)"], [0.2, "rgba(7,7,13,0)"], [0.8, "rgba(7,7,13,0)"], [1, "rgba(7,7,13,0.95)"]]); x.fillRect(-200, -200, W + 400, H + 400);
  });
};
S["m-files"] = (x, u, L) => {
  night(x, "#0b0c18", "#1b1830");
  L(0.4, () => { // a filing drawer slides open; three folders rise, red tabs first
    x.fillStyle = "#1d2033"; x.fillRect(260, 1060, 560, 700); x.fillStyle = "#14172a"; x.fillRect(280, 1080, 520, 300);
    const open = ease(u / 1.5); x.save(); x.translate(0, open * 120); x.fillStyle = "#2a2d44"; x.fillRect(240, 1360, 600, 300); x.fillStyle = GOLD; x.fillRect(500, 1480, 80, 18); x.restore();
    [[0.6, 330], [2.6, 470], [4.6, 610]].forEach(([t0, fx], i) => { const p = ease((u - t0) / 1.2); if (p <= 0) return; const fy = 1380 - p * (560 - i * 40);
      x.save(); x.translate(fx + 70, fy); x.rotate((i - 1) * 0.05); x.fillStyle = "#d9c79c"; x.fillRect(-120, -150, 240, 300); x.fillStyle = RED; x.fillRect(-120, -178, 110, 32);
      x.fillStyle = "rgba(0,0,0,0.3)"; for (let l = 0; l < 5; l++) x.fillRect(-96, -110 + l * 40, 190 * (0.5 + 0.5 * hash(l + i * 9)), 6); x.restore(); });
  });
  L(0.95, () => fig(x, 930, 1900, 420, "#020205"));
};
S["m-lever"] = (x, u, L) => {
  night(x, "#0b0c18", "#1d1a33");
  L(0.5, () => { // a big wall switch is thrown; the SHARE lamp goes dark
    const p = ease((u - 1.2) / 0.6), lit = 1 - p;
    x.fillStyle = "#1d2033"; x.fillRect(330, 820, 420, 760); x.strokeStyle = "#2b2e44"; x.lineWidth = 8; x.strokeRect(330, 820, 420, 760);
    x.fillStyle = lit > 0.05 ? rgba(RED, 0.35 + 0.65 * lit) : "#3a2020"; x.beginPath(); x.arc(540, 940, 60, 0, 7); x.fill(); if (lit > 0) glow(x, 540, 940, 260, RED, 0.6 * lit);
    x.fillStyle = PAPER; x.font = '700 34px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("SHARE", 540, 1060); x.textAlign = "left";
    x.save(); x.translate(540, 1300); x.rotate(-0.9 + p * 1.8); x.fillStyle = "#0b0c14"; x.fillRect(-14, -260, 28, 260); x.fillStyle = GOLD; x.beginPath(); x.arc(0, -260, 40, 0, 7); x.fill(); x.restore();
    x.fillStyle = "#0b0c14"; x.beginPath(); x.arc(540, 1300, 50, 0, 7); x.fill();
    if (u > 1.7 && u < 2.2) glow(x, 540, 1300, 300, GOLD2, 0.5 * (1 - (u - 1.7) / 0.5));
  });
  L(0.95, () => fig(x, 160, 1900, 420, "#020205"));
};
S["m-desk"] = (x, u, L) => {
  night(x, "#0b0c18", "#1d1a33");
  L(0.5, () => { // the phone turned face down under the lamp: nothing to read
    spot(x, 540, 1400, 290, 0.95);
    x.save(); x.translate(540, 1420); x.rotate(-0.12); x.fillStyle = "#0b0c14"; x.beginPath(); x.roundRect(-90, -170, 180, 340, 26); x.fill(); x.fillStyle = "#1a1c28"; x.beginPath(); x.arc(-40, -120, 18, 0, 7); x.fill(); x.restore();
  });
  L(0.95, () => fig(x, 160, 1900, 420, "#020205"));
};
})();
