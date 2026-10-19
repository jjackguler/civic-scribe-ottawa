// Case 08 (two parts): Titanic. Night ocean, lit portholes, ice, a cinema marquee, Halifax,
// the grand staircase against steerage, and a sonar-scanned wreck. Same flat noir language.
(() => {
const W = 1080, H = 1920, S = window.NOIR_SCENES;
const K = "#05070c", GOLD = "#E2B33C", GOLD2 = "#FFD978", AM = "#FFB347", ICE = "#cfe7f5", RED = "#C8202E", NAVY = "#0a1a2e";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const lin = (x, y0, y1, st, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function glow(x, cx, cy, r, col, a) { x.save(); x.globalCompositeOperation = "screen"; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore(); }
function stars(x, n, seed, u, maxY = 1100) { const r = rng(seed); for (let i = 0; i < n; i++) { x.fillStyle = `rgba(240,240,255,${0.3 + r() * 0.6 * (0.7 + 0.3 * Math.sin(u * 2 + i))})`; x.beginPath(); x.arc(r() * W, r() * maxY, 0.8 + r() * 1.8, 0, 7); x.fill(); } }
function sea(x, y0, u, col1 = "#08182b", col2 = "#02060c") { x.fillStyle = lin(x, y0, H, [[0, col1], [1, col2]]); x.fillRect(-200, y0, W + 400, H - y0 + 200); x.strokeStyle = "rgba(160,200,230,0.08)"; x.lineWidth = 2; for (let i = 0; i < 26; i++) { const yy = y0 + 10 + i * i * 2.2, off = (u * (10 + i) + i * 40) % 160; x.beginPath(); for (let k = -1; k < 9; k++) { const xx = k * 160 + off; x.moveTo(xx, yy); x.lineTo(xx + 60 + i * 2, yy); } x.stroke(); } }
// The ship in profile, bow to the right. s = scale (1 ≈ 900 px long), tilt in radians (bow down positive).
function ship(x, cx, wy, s, tilt, lit, u) {
  x.save(); x.translate(cx, wy); x.rotate(tilt); x.scale(s, s);
  x.fillStyle = "#0b0b0d"; x.beginPath(); x.moveTo(-450, -60); x.lineTo(430, -60); x.lineTo(470, -90); x.lineTo(460, 0); x.lineTo(-440, 0); x.quadraticCurveTo(-470, -30, -450, -60); x.fill();
  x.fillStyle = RED; x.globalAlpha = 0.6; x.fillRect(-440, -12, 900, 12); x.globalAlpha = 1;
  x.fillStyle = "#e8e2d4"; x.fillRect(-330, -110, 600, 50); x.fillRect(-250, -140, 420, 30);
  for (let i = 0; i < 4; i++) { const fx = -230 + i * 120; x.fillStyle = "#d39a3c"; x.fillRect(fx, -250, 44, 110); x.fillStyle = "#0b0b0d"; x.fillRect(fx, -250, 44, 22); }
  x.strokeStyle = "#0b0b0d"; x.lineWidth = 3; x.beginPath(); x.moveTo(-380, -60); x.lineTo(-360, -300); x.moveTo(380, -60); x.lineTo(360, -300); x.moveTo(-360, -300); x.lineTo(360, -300); x.stroke();
  if (lit) { const r = rng(3); for (let row = 0; row < 3; row++) for (let i = 0; i < 46; i++) { if (r() < 0.25) continue; x.fillStyle = rgba(AM, 0.75 + 0.25 * hash(i + row * 50 + Math.floor(u * 2))); x.fillRect(-420 + i * 18.5, -52 + row * 15 - (row === 0 ? 0 : 0), 6, 5); }
    for (let i = 0; i < 26; i++) { x.fillStyle = rgba(AM, 0.9); x.fillRect(-320 + i * 22, -100, 8, 10); } glow(x, 0, -60, 520, AM, 0.12); }
  x.restore();
}
function iceberg(x, cx, base, s, col = ICE) { x.save(); x.translate(cx, base); x.scale(s, s); x.fillStyle = col; x.beginPath(); x.moveTo(-200, 0); x.lineTo(-140, -150); x.lineTo(-60, -210); x.lineTo(10, -320); x.lineTo(80, -200); x.lineTo(160, -140); x.lineTo(220, 0); x.fill();
  x.fillStyle = "rgba(90,130,160,0.5)"; x.beginPath(); x.moveTo(10, -320); x.lineTo(80, -200); x.lineTo(160, -140); x.lineTo(220, 0); x.lineTo(40, 0); x.fill(); x.restore(); }
function fig(x, fx, fy, h, col = K, hat = true) { x.save(); x.fillStyle = col; x.translate(fx, fy);
  x.beginPath(); x.moveTo(-h * 0.11, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.17, -h * 0.3); x.lineTo(-h * 0.07, 0); x.lineTo(h * 0.07, 0); x.lineTo(h * 0.17, -h * 0.3); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.11, -h * 0.82); x.fill();
  x.beginPath(); x.ellipse(0, -h * 0.885, h * 0.052, h * 0.062, 0, 0, 7); x.fill(); if (hat) { x.beginPath(); x.ellipse(0, -h * 0.925, h * 0.095, h * 0.018, 0, 0, 7); x.fill(); x.fillRect(-h * 0.055, -h * 0.985, h * 0.11, h * 0.06); } x.restore(); }

// ── Part 1 ───────────────────────────────────────────────────────────────────
S["t-ocean"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, 1200, [[0, "#02040a"], [1, "#0b1e33"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.1, () => { stars(x, 220, 5, u); x.strokeStyle = "rgba(200,220,255,0.06)"; x.lineWidth = 60; x.beginPath(); x.moveTo(-200, 300); x.quadraticCurveTo(540, 520, 1300, 200); x.stroke(); });
  sea(x, 1180, u);
  L(0.7, () => { ship(x, 560 - u * 6, 1200, 0.95, 0, true, u); x.save(); x.translate(0, 2400); x.scale(1, -0.55); x.globalAlpha = 0.12; ship(x, 560 - u * 6, 2181, 0.95, 0, true, u); x.restore(); });
};
S["t-radio"] = (x, u, L) => {
  x.fillStyle = "#0c0a08"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = "#2a2016"; x.fillRect(-200, 1100, W + 400, 900); x.fillStyle = "#3a2c1c"; x.fillRect(80, 900, 920, 220);
    glow(x, 760, 760, 420, AM, 0.4); x.fillStyle = "#1a140e"; x.fillRect(740, 600, 14, 300); x.fillStyle = "#3d5a3a"; x.beginPath(); x.moveTo(680, 600); x.lineTo(820, 600); x.lineTo(780, 560); x.lineTo(720, 560); x.fill();
    x.fillStyle = "#15120e"; x.fillRect(150, 700, 420, 200); for (let i = 0; i < 6; i++) { x.fillStyle = "#c9a35a"; x.beginPath(); x.arc(200 + i * 60, 760, 16, 0, 7); x.fill(); }
    const r = rng(9); for (let i = 0; i < 6; i++) { x.save(); x.translate(250 + i * 110, 1180 + (i % 2) * 60); x.rotate((r() - 0.5) * 0.3); x.fillStyle = "#e9e1cf"; x.fillRect(-60, -40, 120, 80); x.fillStyle = "rgba(0,0,0,0.45)"; for (let l = 0; l < 3; l++) x.fillRect(-48, -22 + l * 16, 90 - l * 15, 5); x.fillStyle = RED; x.font = '700 18px "Special Elite"'; x.fillText("ICE", -48, 32); x.restore(); }
  });
  L(0.9, () => { x.fillStyle = "#050403"; x.save(); x.translate(560, 1960); x.beginPath(); x.ellipse(0, -900, 90, 105, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(-330, 0); x.quadraticCurveTo(-330, -650, -160, -770); x.quadraticCurveTo(0, -820, 160, -770); x.quadraticCurveTo(330, -650, 330, 0); x.fill(); x.strokeStyle = "#050403"; x.lineWidth = 18; x.beginPath(); x.arc(0, -910, 100, Math.PI, 0); x.stroke(); x.restore();
    const blink = Math.floor(u * 6) % 3 === 0; if (blink) glow(x, 300, 760, 60, "#ffefa0", 0.8); });
};
S["t-nest"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#02040a"], [1, "#0a1828"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.1, () => stars(x, 260, 11, u, 1600));
  L(0.35, () => { const grow = 0.6 + Math.min(1, u / 6) * 0.6; x.save(); x.globalAlpha = 0.85; iceberg(x, 660, 1500, grow, "#9fb8c8"); x.restore(); x.fillStyle = "rgba(10,24,40,0.6)"; x.fillRect(-200, 1500, W + 400, 500); glow(x, 660, 1350, 300, ICE, 0.12); });
  L(0.8, () => { x.fillStyle = "#0b0b0d"; x.fillRect(120, 1100, 30, 900); x.fillRect(40, 1080, 260, 120); x.strokeStyle = "#0b0b0d"; x.lineWidth = 4; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(135, 1100); x.lineTo(-100 + i * 70, 1960); x.stroke(); }
    fig(x, 170, 1100, 260, "#0b0b0d", false); x.fillStyle = "#0b0b0d"; x.fillRect(190, 860, 120, 16); });
};
S["t-hull"] = (x, u, L) => {
  x.fillStyle = "#04080f"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = "#0e1a26"; x.fillRect(-200, 520, W + 400, 900);
    const n = 8, cw = 120, x0 = 60;
    for (let i = 0; i < n; i++) { const flooded = i >= 3 && u > 0.8 + (i - 3) * 0.6; const lvl = flooded ? Math.min(1, (u - 0.8 - (i - 3) * 0.6) / 1.5) : 0;
      x.strokeStyle = GOLD; x.lineWidth = 4; x.strokeRect(x0 + i * cw, 700, cw, 520);
      if (lvl > 0) { x.fillStyle = "rgba(40,110,170,0.75)"; x.fillRect(x0 + i * cw + 3, 1217 - 514 * lvl, cw - 6, 514 * lvl); }
      x.fillStyle = GOLD2; x.font = '700 30px "Schibsted Grotesk"'; x.fillText(String(i + 1), x0 + i * cw + 48, 680); }
    x.strokeStyle = ICE; x.lineWidth = 6; x.setLineDash([18, 12]); x.beginPath(); x.moveTo(x0 + 3 * cw, 1150); x.lineTo(x0 + 8 * cw, 1110); x.stroke(); x.setLineDash([]);
    iceberg(x, 1000, 1500, 0.9);
  });
  L(0.8, () => { x.fillStyle = "#0b0b0d"; x.beginPath(); x.moveTo(-200, 1260); x.lineTo(1100, 1260); x.lineTo(1160, 1180); x.lineTo(1160, 1320); x.lineTo(-200, 1320); x.fill(); });
  x.fillStyle = "rgba(4,10,18,0.85)"; x.fillRect(-200, 1420, W + 400, 600);
};
S["t-boats"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#02040a"], [1, "#0b1e33"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.1, () => stars(x, 200, 21, u));
  sea(x, 1250, u);
  L(0.4, () => ship(x, 540, 1250, 1.05, 0.05 + Math.min(1, u / 8) * 0.06, true, u));
  L(0.9, () => { const r = rng(7); for (let i = 0; i < 5; i++) { const bx = 120 + i * 200 + Math.sin(u + i) * 6, by = 1460 + (i % 2) * 90; x.fillStyle = "#e8e2d4"; x.beginPath(); x.moveTo(bx - 80, by); x.lineTo(bx + 80, by); x.lineTo(bx + 60, by + 30); x.lineTo(bx - 60, by + 30); x.fill(); for (let k = 0; k < 4 + Math.floor(r() * 3); k++) { x.fillStyle = K; x.beginPath(); x.arc(bx - 60 + k * 24, by - 10, 10, 0, 7); x.fill(); } glow(x, bx, by, 80, AM, 0.12); } });
};
S["t-stars"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#010205"], [1, "#081525"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.1, () => { stars(x, 420, 33, u, 1500); });
  sea(x, 1300, u, "#06111e", "#010306");
  L(0.6, () => { x.save(); x.globalAlpha = Math.max(0, 1 - u / 6); ship(x, 560, 1320 + u * 30, 0.7, 0.6, false, u); x.restore(); for (let i = 0; i < 4; i++) { x.fillStyle = "#cfc8b8"; x.beginPath(); x.ellipse(200 + i * 220, 1500 + (i % 2) * 70, 50, 10, 0, 0, 7); x.fill(); } });
};

// ── Part 2 ───────────────────────────────────────────────────────────────────
S["u-marquee"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#140a22"], [1, "#2a0f1f"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#1c1030"; x.fillRect(80, 200, 920, 1500); x.fillStyle = "#0d0818"; x.fillRect(180, 1200, 720, 500); });
  L(0.6, () => {
    x.fillStyle = "#2a1a10"; x.fillRect(120, 700, 840, 380); x.strokeStyle = GOLD; x.lineWidth = 8; x.strokeRect(120, 700, 840, 380);
    for (let i = 0; i < 40; i++) { const on = (Math.floor(u * 8) + i) % 3 !== 0; x.fillStyle = on ? GOLD2 : "#5a4320"; x.beginPath(); x.arc(140 + i * 20.5, 720, 6, 0, 7); x.arc(140 + i * 20.5, 1060, 6, 0, 7); x.fill(); }
    x.fillStyle = "#f7efd8"; x.font = '900 120px "Bodoni Moda"'; x.textAlign = "center"; x.fillText("TITANIC", 540, 880); x.fillStyle = GOLD2; x.font = '700 44px "Schibsted Grotesk"'; x.fillText("NOW SHOWING · 1997", 540, 980); x.textAlign = "left";
    glow(x, 540, 880, 600, AM, 0.3);
  });
  x.fillStyle = "#120a14"; x.fillRect(-200, 1700, W + 400, 300);
  L(1, () => { const r = rng(5); for (let i = 0; i < 12; i++) fig(x, 60 + i * 90 + r() * 20, 1900, 230 + r() * 50, K, r() < 0.5); });
};
S["u-counter"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#1b0f33"], [1, "#0a0614"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => { x.save(); x.strokeStyle = rgba(GOLD, 0.15); x.lineWidth = 4; for (let i = 0; i < 30; i++) { const t = Math.PI + (i / 29) * Math.PI; x.beginPath(); x.moveTo(540 + Math.cos(t) * 300, 1250 + Math.sin(t) * 300); x.lineTo(540 + Math.cos(t) * 1000, 1250 + Math.sin(t) * 1000); x.stroke(); } x.restore();
    for (let i = 0; i < 11; i++) { const a = Math.min(1, Math.max(0, u * 2 - 3 - i * 0.25)); x.globalAlpha = a; x.fillStyle = GOLD; const ox = 130 + i * 76; x.beginPath(); x.ellipse(ox, 1390, 14, 14, 0, 0, 7); x.fill(); x.fillRect(ox - 8, 1400, 16, 90); x.fillRect(ox - 20, 1490, 40, 12); x.globalAlpha = 1; } });
};
S["u-grave"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#9aa7b0"], [0.6, "#c9cfd2"], [1, "#6b756f"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "rgba(60,70,70,0.5)"; for (let i = 0; i < 9; i++) { x.save(); x.translate(80 + i * 120, 1050 + (i % 3) * 20); x.beginPath(); x.moveTo(-34, 0); x.lineTo(-34, -90); x.arc(0, -90, 34, Math.PI, 0); x.lineTo(34, 0); x.fill(); x.restore(); } x.fillStyle = "#5d6b5c"; x.fillRect(-200, 1080, W + 400, 900); });
  L(0.7, () => {
    x.fillStyle = "#3e4446"; x.beginPath(); x.moveTo(340, 1500); x.lineTo(340, 1060); x.arc(540, 1060, 200, Math.PI, 0); x.lineTo(740, 1500); x.fill();
    x.fillStyle = "#e6e2d8"; x.font = '700 64px "Bodoni Moda"'; x.textAlign = "center"; x.fillText("J. DAWSON", 540, 1120); x.font = '500 34px "Bodoni Moda"'; x.fillText("DIED", 540, 1190); x.fillText("APRIL 15, 1912", 540, 1240); x.font = '700 40px "Schibsted Grotesk"'; x.fillText("227", 540, 1330); x.textAlign = "left";
    for (let i = 0; i < 7; i++) { x.fillStyle = i % 2 ? RED : "#f3e3a0"; x.beginPath(); x.arc(420 + i * 40, 1520 + (i % 2) * 14, 16, 0, 7); x.fill(); x.strokeStyle = "#2c4a2a"; x.lineWidth = 4; x.beginPath(); x.moveTo(420 + i * 40, 1530); x.lineTo(430 + i * 30, 1600); x.stroke(); }
    x.fillStyle = "#f2efe6"; x.save(); x.translate(650, 1560); x.rotate(-0.2); x.fillRect(-50, -24, 100, 48); x.fillStyle = "#333"; x.font = '700 16px "Special Elite"'; x.fillText("ADMIT ONE", -42, 6); x.restore();
  });
  L(1, () => { x.fillStyle = "rgba(255,255,255,0.75)"; const r = rng(2); for (let i = 0; i < 80; i++) { const yy = ((r() * H + u * 40) % H); x.fillRect(r() * W, yy, 2, 2); } });
};
S["u-stairs"] = (x, u, L) => {
  x.fillStyle = "#0b0610"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = lin(x, 0, 960, [[0, "#3a2414"], [1, "#1c120a"]]); x.fillRect(-200, -200, W + 400, 1160);
    glow(x, 540, 160, 420, GOLD2, 0.6); x.fillStyle = GOLD; x.fillRect(470, 80, 140, 120); for (let i = 0; i < 5; i++) x.fillRect(430 + i * 50, 200, 20, 60);
    for (let i = 0; i < 9; i++) { x.fillStyle = i % 2 ? "#5a3a20" : "#6b4628"; x.fillRect(260 - i * 20, 520 + i * 48, 560 + i * 40, 48); }
    x.strokeStyle = GOLD; x.lineWidth = 8; x.beginPath(); x.moveTo(260, 500); x.lineTo(80, 960); x.moveTo(820, 500); x.lineTo(1000, 960); x.stroke();
    fig(x, 470, 700, 170, "#140a04"); fig(x, 600, 700, 170, "#140a04", false);
    x.fillStyle = GOLD2; x.font = '800 42px "Schibsted Grotesk"'; x.fillText("FIRST CLASS", 60, 420);
  });
  L(0.6, () => {
    x.fillStyle = "#0e1418"; x.fillRect(-200, 960, W + 400, 1100); x.fillStyle = "#1c252a"; for (let i = 0; i < 6; i++) x.fillRect(-200, 1010 + i * 150, W + 400, 6);
    x.fillStyle = "#8a9aa0"; x.font = '800 42px "Schibsted Grotesk"'; x.fillText("THIRD CLASS", 60, 1060);
    for (let i = 0; i < 4; i++) { x.fillStyle = "#26323a"; x.fillRect(80 + i * 250, 1200, 200, 300); x.fillStyle = "rgba(255,200,120,0.25)"; x.fillRect(110 + i * 250, 1240, 140, 60); }
    const r = rng(8); for (let i = 0; i < 12; i++) fig(x, 60 + i * 85 + r() * 20, 1780, 160 + r() * 40, "#05080a", r() < 0.4);
    x.strokeStyle = "#3a4a52"; x.lineWidth = 10; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(-200 + i * 120, 1560); x.lineTo(-200 + i * 120, 1640); x.stroke(); } x.beginPath(); x.moveTo(-200, 1560); x.lineTo(W + 200, 1560); x.stroke();
  });
};
S["u-scan"] = (x, u, L) => {
  x.fillStyle = "#010409"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.strokeStyle = "rgba(60,200,220,0.12)"; x.lineWidth = 2; for (let i = 0; i < 30; i++) { x.beginPath(); x.moveTo(-200, 600 + i * 50); x.lineTo(W + 200, 560 + i * 52); x.stroke(); x.beginPath(); x.moveTo(-200 + i * 60, 600); x.lineTo(-400 + i * 80, 2100); x.stroke(); } });
  L(0.6, () => {
    x.save(); x.translate(540, 1250); x.rotate(-0.12);
    x.strokeStyle = "rgba(120,240,255,0.85)"; x.lineWidth = 3; x.fillStyle = "rgba(20,60,70,0.6)";
    x.beginPath(); x.moveTo(-420, 0); x.lineTo(380, 0); x.lineTo(460, -120); x.lineTo(-360, -150); x.closePath(); x.fill(); x.stroke();
    for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(-400 + i * 58, 0); x.lineTo(-350 + i * 58, -145); x.stroke(); }
    x.beginPath(); x.moveTo(-100, -150); x.lineTo(-60, -260); x.lineTo(60, -260); x.lineTo(100, -150); x.stroke();
    x.restore();
    const sy = 700 + ((u * 160) % 1100); x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, sy - 40, sy + 40, [[0, "rgba(80,240,255,0)"], [0.5, "rgba(80,240,255,0.35)"], [1, "rgba(80,240,255,0)"]]); x.fillRect(-200, sy - 40, W + 400, 80); x.restore();
    for (const [rx, ry, ph] of [[260, 820, 0], [820, 900, 2]]) { const bx = rx + Math.sin(u * 0.6 + ph) * 60; x.fillStyle = "#f2c94c"; x.fillRect(bx - 40, ry - 20, 80, 40); glow(x, bx + 50, ry, 120, "#ffffff", 0.5); x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = "rgba(255,255,230,0.12)"; x.beginPath(); x.moveTo(bx + 40, ry); x.lineTo(bx + 300, ry + 500); x.lineTo(bx - 100, ry + 500); x.fill(); x.restore(); }
  });
  L(1, () => { const r = rng(14); x.fillStyle = "rgba(200,240,255,0.5)"; for (let i = 0; i < 60; i++) { x.beginPath(); x.arc(r() * W, (r() * H + u * 20) % H, 1.5, 0, 7); x.fill(); } });
};
S["u-end"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#0a1630"], [0.6, "#3a2a5a"], [1, "#e09a5a"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { stars(x, 120, 41, u, 700); x.fillStyle = "#ffe2a8"; x.beginPath(); x.arc(540, 1260, 150, Math.PI, 0); x.fill(); glow(x, 540, 1260, 500, "#ffcf8a", 0.4); });
  sea(x, 1260, u, "#2a2440", "#05070c");
  L(0.6, () => { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = "rgba(255,200,140,0.25)"; for (let i = 0; i < 14; i++) x.fillRect(500 - i * 4, 1280 + i * 40, 80 + i * 8, 10); x.restore(); });
  L(0.9, () => { x.fillStyle = "#0b0b0d"; x.fillRect(-200, 1560, 700, 460); x.fillRect(-200, 1520, 700, 20); for (let i = 0; i < 9; i++) x.fillRect(i * 60, 1440, 8, 90); fig(x, 340, 1560, 300, "#0b0b0d"); fig(x, 420, 1560, 270, "#0b0b0d", false); });
};
})();
