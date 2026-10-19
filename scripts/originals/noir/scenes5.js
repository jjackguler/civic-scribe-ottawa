// Cases 06–07: art deco noir after the owner's references — indigo and violet night, gold
// trim, stepped skyscrapers with spires, searchlights, an elevated train, a jazz-club spotlight.
(() => {
const W = 1080, H = 1920, S = window.NOIR_SCENES;
const K = "#07060f", GOLD = "#E2B33C", GOLD2 = "#FFD978", PINK = "#E0559B", TEAL = "#2BB3A3", RED = "#B3122E", AM = "#FFB347";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const lin = (x, y0, y1, st, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function glow(x, cx, cy, r, col, a) { x.save(); x.globalCompositeOperation = "screen"; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore(); }
function beam(x, bx, by, ang, len, w, col, a) { x.save(); x.globalCompositeOperation = "screen"; x.translate(bx, by); x.rotate(ang); x.fillStyle = lin(x, 0, -len, [[0, rgba(col, a)], [1, rgba(col, 0)]]); x.beginPath(); x.moveTo(-6, 0); x.lineTo(6, 0); x.lineTo(w / 2, -len); x.lineTo(-w / 2, -len); x.fill(); x.restore(); }
function fig(x, fx, fy, h, col = K, { hat = true, walk = null, dress = false } = {}) {
  x.save(); x.fillStyle = col; x.translate(fx, fy); const sw = walk == null ? 0 : Math.sin(walk) * h * 0.05;
  if (dress) { x.beginPath(); x.moveTo(-h * 0.09, -h * 0.8); x.quadraticCurveTo(-h * 0.12, -h * 0.4, -h * 0.22, 0); x.lineTo(h * 0.22, 0); x.quadraticCurveTo(h * 0.12, -h * 0.4, h * 0.09, -h * 0.8); x.fill(); }
  else {
    x.beginPath(); x.moveTo(-h * 0.07, -h * 0.36); x.lineTo(-h * 0.07 + sw, 0); x.lineTo(-h * 0.02 + sw, 0); x.lineTo(0, -h * 0.34); x.fill();
    x.beginPath(); x.moveTo(h * 0.07, -h * 0.36); x.lineTo(h * 0.07 - sw, 0); x.lineTo(h * 0.02 - sw, 0); x.lineTo(0, -h * 0.34); x.fill();
    x.beginPath(); x.moveTo(-h * 0.11, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.17, -h * 0.3); x.lineTo(h * 0.17, -h * 0.3); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.11, -h * 0.82); x.quadraticCurveTo(0, -h * 0.86, -h * 0.11, -h * 0.82); x.fill();
  }
  x.beginPath(); x.ellipse(0, -h * 0.885, h * 0.052, h * 0.062, 0, 0, 7); x.fill();
  if (hat) { x.beginPath(); x.ellipse(0, -h * 0.925, h * 0.095, h * 0.018, 0, 0, 7); x.fill(); x.fillRect(-h * 0.055, -h * 0.985, h * 0.11, h * 0.06); }
  x.restore();
}
// A stepped art deco tower with a spire and lit windows.
function deco(x, cx, base, w, h, body, lit, seed, u, spire = true) {
  const r = rng(seed), steps = [[1, 0.62], [0.78, 0.2], [0.56, 0.1], [0.34, 0.08]];
  let y = base;
  for (const [fw, fh] of steps) { const ww = w * fw, hh = h * fh; x.fillStyle = body; x.fillRect(cx - ww / 2, y - hh, ww, hh + 2);
    for (let j = 0; j < Math.floor(hh / 26); j++) for (let i = 0; i < Math.floor(ww / 18); i++) if (r() < lit) { x.fillStyle = r() < 0.2 ? GOLD2 : rgba(AM, 0.6 + 0.4 * hash(i + j + seed + Math.floor(u))); x.fillRect(cx - ww / 2 + 6 + i * 18, y - hh + 8 + j * 26, 7, 12); }
    x.fillStyle = rgba(GOLD, 0.8); x.fillRect(cx - ww / 2, y - hh, ww, 4); y -= hh; }
  if (spire) { x.fillStyle = body; x.beginPath(); x.moveTo(cx - w * 0.08, y); x.lineTo(cx, y - h * 0.18); x.lineTo(cx + w * 0.08, y); x.fill(); glow(x, cx, y - h * 0.18, 40, GOLD2, 0.6); }
  return y;
}
function sky(x, top = "#120a2e", mid = "#3a1d6e", low = "#6b2f7a") { x.fillStyle = lin(x, 0, H, [[0, top], [0.55, mid], [0.8, low], [1, "#120a1e"]]); x.fillRect(-200, -200, W + 400, H + 400); }
function sunburst(x, cx, cy, r, col, a, n = 18) { x.save(); x.strokeStyle = rgba(col, a); x.lineWidth = 4; for (let i = 0; i < n; i++) { const t = Math.PI + (i / (n - 1)) * Math.PI; x.beginPath(); x.moveTo(cx + Math.cos(t) * r * 0.3, cy + Math.sin(t) * r * 0.3); x.lineTo(cx + Math.cos(t) * r, cy + Math.sin(t) * r); x.stroke(); } x.restore(); }

// ── Case 06: The Suspicion Machine ───────────────────────────────────────────
S["d-skyline"] = (x, u, L) => {
  sky(x);
  L(0.1, () => { for (const [bx, a] of [[300, -0.35], [760, 0.3]]) beam(x, bx, 1300, a + Math.sin(u * 0.4 + bx) * 0.15, 1500, 260, "#cfd8ff", 0.22); });
  L(0.3, () => { const r = rng(3); for (let i = 0; i < 9; i++) deco(x, 60 + i * 125, 1400, 120 + r() * 60, 500 + r() * 400, "#241645", 0.25, 30 + i, u, r() < 0.5); });
  L(0.6, () => { deco(x, 540, 1500, 360, 1200, "#1a1035", 0.35, 7, u); deco(x, 140, 1550, 260, 900, "#140c2a", 0.3, 9, u, false); deco(x, 950, 1550, 280, 1000, "#140c2a", 0.3, 11, u); });
  x.fillStyle = lin(x, 1500, H, [[0, "#2a1640"], [1, "#07050c"]]); x.fillRect(-200, 1500, W + 400, 600);
  L(0.9, () => { for (let i = 0; i < 14; i++) { const lx = 40 + i * 80; x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 1520, 1900, [[0, rgba(AM, 0.4)], [1, rgba(AM, 0)]]); x.fillRect(lx, 1520, 10, 380); x.restore(); } });
  L(1, () => fig(x, 540, 1760, 260, K, { walk: u * 2.5 }));
};
S["d-office"] = (x, u, L) => {
  x.fillStyle = "#0b0912"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => {
    x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 0, 0, [[0, "rgba(255,230,180,0.3)"], [1, "rgba(255,230,180,0)"]], 1000, 300); x.beginPath(); x.moveTo(1080, 100); x.lineTo(1080, 700); x.lineTo(200, 1300); x.lineTo(450, 500); x.fill(); x.restore();
    for (let i = 0; i < 8; i++) { x.fillStyle = "rgba(255,240,210,0.85)"; x.fillRect(880, 80 + i * 48, 200, 26); }
    const pins = [[180, 260], [460, 360], [300, 760], [760, 900], [200, 1100], [600, 560]], r = rng(5);
    pins.forEach(([px, py], i) => { x.save(); x.translate(px, py); x.rotate((r() - 0.5) * 0.2); x.fillStyle = "#cfc6b3"; x.fillRect(-90, -110, 180, 220); x.fillStyle = "#2a2a2a"; x.fillRect(-75, -95, 150, 120);
      x.fillStyle = "rgba(0,0,0,0.5)"; for (let l = 0; l < 3; l++) x.fillRect(-70, 40 + l * 18, 120 - l * 20, 6); x.restore(); });
    x.fillStyle = "#2a2a2a"; x.font = '700 70px "Bodoni Moda"'; x.fillText("?", 285, 790); x.fillStyle = GOLD; x.font = '800 44px "Schibsted Grotesk"'; x.fillText("0.87", 715, 935);
    const p = Math.min(1, u / 4); x.strokeStyle = RED; x.lineWidth = 4; x.beginPath();
    for (let i = 0; i < pins.length - 1; i++) { const [ax, ay] = pins[i], [bx, by] = pins[i + 1], t = Math.min(1, Math.max(0, p * (pins.length - 1) - i)); if (t <= 0) break; x.moveTo(ax, ay - 100); x.lineTo(ax + (bx - ax) * t, ay - 100 + (by - ay) * t); }
    x.stroke(); pins.forEach(([px, py]) => { x.fillStyle = RED; x.beginPath(); x.arc(px, py - 100, 9, 0, 7); x.fill(); });
  });
  L(0.9, () => {
    x.fillStyle = "#050409"; x.save(); x.translate(560, 1960);
    x.beginPath(); x.ellipse(0, -820, 95, 112, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -880, 200, 34, -0.05, 0, 7); x.fill(); x.fillRect(-110, -1000, 220, 120);
    x.beginPath(); x.moveTo(-360, 0); x.quadraticCurveTo(-360, -560, -170, -690); x.quadraticCurveTo(0, -740, 170, -690); x.quadraticCurveTo(360, -560, 360, 0); x.fill(); x.restore();
    x.strokeStyle = rgba(RED, 0.7); x.lineWidth = 5; x.beginPath(); x.moveTo(380, 1190); x.quadraticCurveTo(300, 1500, 230, 1960); x.stroke();
    x.fillStyle = "#14101c"; x.fillRect(-200, 1700, W + 400, 300); x.fillStyle = "#1e1828"; x.fillRect(820, 1620, 120, 80);
  });
};
S["d-dial"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#140b30"], [1, "#2a0f3f"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.strokeStyle = rgba(GOLD, 0.25); x.lineWidth = 3; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(-200, 200 + i * 150); x.lineTo(W + 200, 200 + i * 150); x.stroke(); } sunburst(x, 540, 1150, 900, GOLD, 0.15, 30); });
  L(0.7, () => {
    const cx = 540, cy = 1000, R = 380;
    x.fillStyle = "#1a1130"; x.beginPath(); x.arc(cx, cy, R + 40, Math.PI, 0); x.lineTo(cx + R + 40, cy + 60); x.lineTo(cx - R - 40, cy + 60); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 10; x.beginPath(); x.arc(cx, cy, R + 40, Math.PI, 0); x.stroke();
    for (let i = 0; i <= 10; i++) { const t = Math.PI + i / 10 * Math.PI; x.strokeStyle = i > 7 ? RED : GOLD2; x.lineWidth = i % 5 ? 4 : 8; x.beginPath(); x.moveTo(cx + Math.cos(t) * (R - 40), cy + Math.sin(t) * (R - 40)); x.lineTo(cx + Math.cos(t) * R, cy + Math.sin(t) * R); x.stroke(); }
    x.fillStyle = GOLD2; x.font = '800 44px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("0", cx - R + 20, cy + 50); x.fillText("1", cx + R - 20, cy + 50); x.textAlign = "left";
    const v = 0.15 + 0.7 * (0.5 - 0.5 * Math.cos(Math.min(1, u / 5) * Math.PI)) + 0.03 * Math.sin(u * 6), t = Math.PI + v * Math.PI;
    x.strokeStyle = RED; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(t) * (R - 60), cy + Math.sin(t) * (R - 60)); x.stroke();
    x.fillStyle = GOLD; x.beginPath(); x.arc(cx, cy, 34, 0, 7); x.fill();
    const labels = ["AGE", "GENDER", "LANGUAGE", "NEIGHBOURHOOD", "CASEWORKER NOTES", "+310 MORE"];
    labels.forEach((l, i) => { const a = Math.min(1, Math.max(0, u * 1.5 - i * 0.6)); x.globalAlpha = a; x.fillStyle = "#24173f"; x.fillRect(150 + (i % 2) * 400, 1200 + Math.floor(i / 2) * 110, 380, 80); x.strokeStyle = GOLD; x.lineWidth = 3; x.strokeRect(150 + (i % 2) * 400, 1200 + Math.floor(i / 2) * 110, 380, 80);
      x.fillStyle = GOLD2; x.font = '700 30px "Schibsted Grotesk"'; x.fillText(l, 175 + (i % 2) * 400, 1252 + Math.floor(i / 2) * 110); x.globalAlpha = 1; });
  });
};
S["d-lobby"] = (x, u, L) => {
  x.fillStyle = "#0c1a1c"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = "#0f2427"; x.fillRect(-200, 200, W + 400, 1500);
    x.fillStyle = lin(x, 900, 1500, [[0, "#ff7a2a"], [1, "#c2451a"]]); x.fillRect(400, 820, 280, 760); x.strokeStyle = rgba(GOLD2, 0.5); x.lineWidth = 3; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(440 + i * 50, 840); x.lineTo(440 + i * 50, 1560); x.stroke(); }
    x.strokeStyle = GOLD2; x.lineWidth = 5; x.beginPath(); x.arc(540, 1150, 70, 0, 7); x.stroke(); x.fillStyle = GOLD2; x.font = '800 70px "Bodoni Moda"'; x.textAlign = "center"; x.fillText("FOI", 540, 1175); x.textAlign = "left";
    glow(x, 540, 1150, 500, "#ff7a2a", 0.3);
    x.fillStyle = "#3a2a10"; x.beginPath(); x.ellipse(540, 330, 300, 90, 0, 0, 7); x.fill(); glow(x, 540, 330, 380, AM, 0.5);
    x.fillStyle = GOLD; x.fillRect(470, 250, 140, 220); x.fillRect(440, 300, 200, 120); x.fillStyle = GOLD2; for (let i = 0; i < 4; i++) x.fillRect(480 + i * 32, 260, 14, 200);
  });
  L(0.7, () => {
    for (const cx of [130, 950]) { x.fillStyle = "#081416"; x.fillRect(cx - 90, 100, 180, 1650); x.fillStyle = rgba(TEAL, 0.5); x.fillRect(cx - 90, 1500, 180, 250); x.strokeStyle = GOLD; x.lineWidth = 4; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(cx - 30 + k * 30, 120); x.lineTo(cx - 30 + k * 30, 600); x.stroke(); }
      x.fillStyle = "#fff3cc"; x.fillRect(cx - 22, 1000, 44, 160); glow(x, cx, 1080, 150, AM, 0.6); }
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#0e1d20" : "#132a2e"; x.fillRect(250 + i * 10, 1580 + i * 22, 580 - i * 20, 22); }
  });
  x.fillStyle = lin(x, 1760, H, [[0, "#132326"], [1, "#050a0b"]]); x.fillRect(-200, 1760, W + 400, 300);
  L(1, () => { fig(x, 500, 1600, 230, K, {}); fig(x, 580, 1600, 215, K, { hat: false, dress: true }); });
};
S["d-scales"] = (x, u, L) => {
  x.fillStyle = "#0b0714"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { beam(x, 540, -100, Math.PI, 1600, 900, PINK, 0.35); glow(x, 540, 1500, 500, PINK, 0.3); });
  L(0.7, () => {
    const tilt = 0.18 * Math.min(1, u / 3) + 0.02 * Math.sin(u * 2);
    x.fillStyle = GOLD; x.fillRect(530, 600, 20, 900); x.fillRect(420, 1480, 240, 30); x.beginPath(); x.arc(540, 590, 30, 0, 7); x.fill();
    x.save(); x.translate(540, 640); x.rotate(tilt); x.fillRect(-380, -8, 760, 16);
    for (const s of [-1, 1]) { const px = s * 360; x.strokeStyle = GOLD; x.lineWidth = 4; x.beginPath(); x.moveTo(px, 0); x.lineTo(px - 90, 280); x.moveTo(px, 0); x.lineTo(px + 90, 280); x.stroke();
      x.save(); x.translate(px, 280); x.rotate(-tilt); x.fillStyle = GOLD; x.beginPath(); x.ellipse(0, 0, 130, 30, 0, 0, Math.PI); x.fill();
      if (s < 0) { fig(x, -40, -2, 120, "#2a1440", { hat: false }); fig(x, 30, -2, 120, "#2a1440", { hat: false, dress: true }); } else { x.fillStyle = "#cfc6b3"; x.fillRect(-60, -70, 120, 70); x.fillStyle = RED; x.font = '800 36px "Schibsted Grotesk"'; x.fillText("0.92", -42, -22); }
      x.restore(); }
    x.restore();
  });
  x.fillStyle = "#120a1c"; x.fillRect(-200, 1600, W + 400, 400);
};
S["d-train"] = (x, u, L) => {
  sky(x, "#1b1046", "#4b2a7a", "#c15a5a");
  L(0.2, () => { x.fillStyle = "#ffd9a0"; x.beginPath(); x.arc(780, 420, 90, 0, 7); x.fill(); glow(x, 780, 420, 300, "#ffd9a0", 0.35); });
  L(0.35, () => { const r = rng(21); for (let i = 0; i < 8; i++) deco(x, 80 + i * 140, 1300, 130 + r() * 50, 600 + r() * 500, "#2b1a52", 0.3, 50 + i, u, r() < 0.6); });
  L(0.7, () => {
    x.fillStyle = "#120a22"; x.fillRect(-200, 1140, W + 400, 50); for (let i = 0; i < 9; i++) { x.fillRect(i * 140, 1190, 26, 600); x.beginPath(); x.moveTo(i * 140 - 50, 1190); x.quadraticCurveTo(i * 140 + 13, 1290, i * 140 + 76, 1190); x.lineWidth = 8; x.strokeStyle = "#120a22"; x.stroke(); }
    const tx = -900 + ((u * 160) % 2600);
    for (let c = 0; c < 3; c++) { const cx = tx + c * 380; x.fillStyle = "#0e0818"; x.beginPath(); x.roundRect(cx, 990, 360, 150, 30); x.fill(); for (let w = 0; w < 6; w++) { x.fillStyle = AM; x.fillRect(cx + 20 + w * 55, 1020, 40, 50); } glow(x, cx + 180, 1045, 220, AM, 0.25); }
    x.fillStyle = GOLD2; x.beginPath(); x.arc(tx + 1120, 1060, 14, 0, 7); x.fill(); glow(x, tx + 1130, 1060, 160, GOLD2, 0.6);
  });
  x.fillStyle = lin(x, 1700, H, [[0, "#2a1640"], [1, "#07050c"]]); x.fillRect(-200, 1700, W + 400, 300);
  L(1, () => { for (const lx of [200, 880]) { x.fillStyle = K; x.fillRect(lx - 5, 1460, 10, 300); x.fillStyle = GOLD2; x.beginPath(); x.arc(lx, 1455, 18, 0, 7); x.fill(); glow(x, lx, 1455, 120, GOLD2, 0.6); } fig(x, 540, 1820, 240, K, { walk: u * 2.6 }); });
};

// ── Case 07: The Invisible Hands ─────────────────────────────────────────────
S["e-club"] = (x, u, L) => {
  x.fillStyle = "#0c0a1c"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { for (const cx of [140, 940]) { x.fillStyle = "#16132e"; x.fillRect(cx - 120, -200, 240, 1700); for (let k = 0; k < 4; k++) { x.fillStyle = GOLD; x.fillRect(cx - 100, 200 + k * 260, 200, 18); x.fillRect(cx - 80, 230 + k * 260, 160, 10); } } });
  L(0.5, () => { beam(x, 540, -100, Math.PI, 1600, 700, AM, 0.5); x.fillStyle = "#2a2140"; x.beginPath(); x.ellipse(540, 1450, 380, 70, 0, 0, 7); x.fill(); x.fillStyle = rgba(AM, 0.35); x.beginPath(); x.ellipse(540, 1440, 300, 50, 0, 0, 7); x.fill();
    x.strokeStyle = "#c9c9c9"; x.lineWidth = 6; x.beginPath(); x.moveTo(540, 1440); x.lineTo(540, 1180); x.stroke(); x.fillStyle = "#d8d8d8"; x.beginPath(); x.ellipse(540, 1165, 22, 34, 0, 0, 7); x.fill(); glow(x, 540, 1170, 80, "#ffffff", 0.4); });
  L(0.9, () => { for (const [tx, ty] of [[160, 1650], [880, 1700]]) { x.fillStyle = "#1c2a2a"; x.beginPath(); x.ellipse(tx, ty, 140, 36, 0, 0, 7); x.fill(); x.fillStyle = rgba(AM, 0.8); x.fillRect(tx - 40, ty - 70, 26, 50); x.fillRect(tx + 10, ty - 60, 26, 40); }
    fig(x, 250, 1900, 420, "#08070f", { hat: true }); });
};
S["e-tower"] = (x, u, L) => {
  sky(x, "#0d0826", "#24154d", "#3b1f5e");
  L(0.25, () => { const r = rng(8); for (let i = 0; i < 10; i++) deco(x, 40 + i * 115, 1500, 110 + r() * 40, 500 + r() * 300, "#1d1238", 0.2, 70 + i, u, r() < 0.4); });
  L(0.6, () => {
    const top = deco(x, 540, 1650, 460, 1400, "#150d2c", 0.0, 3, u);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 14; i++) { x.fillStyle = rgba(AM, 0.85 + 0.15 * Math.sin(u * 3 + i)); x.fillRect(330 + i * 30, 1080 + j * 40, 18, 26); }
    glow(x, 540, 1110, 360, AM, 0.35);
    x.fillStyle = GOLD2; x.font = '800 30px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("NAIROBI", 540, 1220); x.textAlign = "left";
  });
  x.fillStyle = lin(x, 1650, H, [[0, "#1e1238"], [1, "#05040a"]]); x.fillRect(-200, 1650, W + 400, 300);
};
S["e-desks"] = (x, u, L) => {
  x.fillStyle = "#0a0912"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => { x.strokeStyle = rgba(GOLD, 0.2); x.lineWidth = 3; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(540, 300); x.lineTo(-200 + i * 250, 1950); x.stroke(); } });
  L(0.8, () => {
    for (let row = 0; row < 4; row++) { const s = 0.45 + row * 0.2, y = 700 + row * 300; for (let i = 0; i < 3 + row; i++) {
      const cx = 540 + (i - (2 + row) / 2) * 260 * s, glowA = 0.5 + 0.2 * Math.sin(u * 2 + i + row);
      x.fillStyle = "#1a1626"; x.fillRect(cx - 110 * s, y, 220 * s, 16 * s); x.fillStyle = "#c9e2ff"; x.fillRect(cx - 50 * s, y - 80 * s, 100 * s, 70 * s); glow(x, cx, y - 45 * s, 120 * s, "#9fc7ff", glowA * 0.5);
      x.fillStyle = "#05040a"; x.beginPath(); x.ellipse(cx, y - 30 * s, 26 * s, 30 * s, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(cx - 60 * s, y + 80 * s); x.quadraticCurveTo(cx - 60 * s, y, cx, y - 6 * s); x.quadraticCurveTo(cx + 60 * s, y, cx + 60 * s, y + 80 * s); x.fill();
      x.fillStyle = GOLD; x.fillRect(cx + 70 * s, y - 120 * s, 6 * s, 120 * s); x.beginPath(); x.moveTo(cx + 50 * s, y - 120 * s); x.lineTo(cx + 110 * s, y - 120 * s); x.lineTo(cx + 95 * s, y - 150 * s); x.lineTo(cx + 65 * s, y - 150 * s); x.fill(); glow(x, cx + 80 * s, y - 110 * s, 90 * s, AM, 0.5);
    } }
  });
  L(1, () => { const r = rng(4); for (let i = 0; i < 16; i++) { const yy = 1900 - ((u * 120 + i * 140) % 1700); x.globalAlpha = 0.5; x.fillStyle = i % 3 ? "#cfd6e6" : RED; x.fillRect(80 + r() * 900, yy, 70 + r() * 80, 10); } x.globalAlpha = 1; });
};
S["e-counter"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#1b0f33"], [1, "#0a0614"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => { sunburst(x, 540, 1200, 1000, GOLD, 0.12, 36); x.strokeStyle = GOLD; x.lineWidth = 8; x.strokeRect(120, 560, 840, 760); x.lineWidth = 3; x.strokeRect(150, 590, 780, 700); for (const [a, b] of [[120, 560], [960, 560], [120, 1320], [960, 1320]]) { x.fillStyle = GOLD; x.beginPath(); x.arc(a, b, 18, 0, 7); x.fill(); } });
  L(0.8, () => { x.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 10; i++) x.fillRect(180, 640 + i * 60, 720, 2); });
};
S["e-hands"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#0d0a24"], [0.6, "#2a1450"], [1, "#0a0614"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { sunburst(x, 540, 900, 900, GOLD, 0.2, 28); });
  L(0.6, () => {
    const pulse = 1 + 0.05 * Math.sin(u * 2.5); glow(x, 540, 820, 380 * pulse, "#9fd3ff", 0.5);
    x.fillStyle = "#dff3ff"; x.beginPath(); x.arc(540, 820, 130 * pulse, 0, 7); x.fill(); x.strokeStyle = TEAL; x.lineWidth = 4; for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(540, 820, 180 + k * 40, 60 + k * 20, u * 0.3 + k, 0, 7); x.stroke(); }
    const r = rng(9);
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + 0.7 * i / 8), bx = 540 + Math.cos(a) * 520, by = 1900 - Math.sin(a) * 200, tx = 540 + Math.cos(a) * 170, ty = 1000 + Math.sin(a) * 40;
      x.strokeStyle = i % 2 ? "#1a0f2a" : "#2a1838"; x.lineWidth = 60; x.lineCap = "round"; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo((bx + tx) / 2, by - 300 - r() * 200, tx, ty + 30); x.stroke();
      x.fillStyle = x.strokeStyle; x.beginPath(); x.ellipse(tx, ty, 46, 30, a, 0, 7); x.fill(); }
  });
};
S["e-rooftop"] = (x, u, L) => {
  x.fillStyle = "#0a0716"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = lin(x, 600, H, [[0, "#1a0f3a"], [0.6, "#5a2470"], [1, "#ff7a2a"]]); x.fillRect(-200, 500, W + 400, H); const r = rng(13);
    for (let i = 0; i < 26; i++) { const bx = r() * W, bw = 60 + r() * 90, top = 900 + r() * 600; x.fillStyle = "#170d33"; x.fillRect(bx, top, bw, H); for (let k = 0; k < 20; k++) if (r() < 0.4) { x.fillStyle = rgba(AM, 0.8); x.fillRect(bx + 8 + (k % 3) * 22, top + 12 + Math.floor(k / 3) * 30, 8, 12); } } });
  L(0.55, () => { deco(x, 240, 1500, 260, 1300, "#22154a", 0.4, 17, u); glow(x, 240, 300, 260, "#c9b8ff", 0.4); });
  L(0.95, () => { x.fillStyle = "#06040c"; x.beginPath(); x.moveTo(560, 1960); x.lineTo(640, 1400); x.lineTo(1300, 1400); x.lineTo(1300, 1960); x.fill(); fig(x, 860, 1400, 520, "#06040c", {});
    x.fillStyle = rgba(AM, 0.9); x.beginPath(); x.arc(790, 970, 6, 0, 7); x.fill(); x.strokeStyle = "rgba(220,220,220,0.3)"; x.lineWidth = 6; x.beginPath(); for (let t = 0; t < 20; t++) { const yy = 960 - t * 12, xx = 790 - t * 3 + Math.sin(t * 0.4 + u * 1.5) * 8; t ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); });
};
})();
