// Case 04 restyled after the owner's urban references: blue night facades with warm amber
// windows, red-brick fronts, a grey tower with orange windows, an orange-sky street canyon.
(() => {
const W = 1080, H = 1920, S = window.NOIR_SCENES;
const K = "#0b0b0c", AM = "#FFB347", OR = "#FF6A2B", M = "#FF2E88", SY = "#FFD400";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const lin = (x, y0, y1, st, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function glow(x, cx, cy, r, col, a) { x.save(); x.globalCompositeOperation = "screen"; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore(); }
function fig(x, fx, fy, h, col = K, { hood = false, walk = null } = {}) {
  x.save(); x.fillStyle = col; x.translate(fx, fy); const sw = walk == null ? 0 : Math.sin(walk) * h * 0.05;
  x.beginPath(); x.moveTo(-h * 0.07, -h * 0.36); x.lineTo(-h * 0.07 + sw, 0); x.lineTo(-h * 0.02 + sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(h * 0.07, -h * 0.36); x.lineTo(h * 0.07 - sw, 0); x.lineTo(h * 0.02 - sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(-h * 0.11, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.17, -h * 0.3); x.lineTo(h * 0.17, -h * 0.3); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.11, -h * 0.82); x.quadraticCurveTo(0, -h * 0.86, -h * 0.11, -h * 0.82); x.fill();
  x.beginPath(); x.ellipse(0, -h * 0.885, h * (hood ? 0.08 : 0.052), h * (hood ? 0.09 : 0.062), 0, 0, 7); x.fill(); x.restore();
}
// A blue facade with a grid of windows; lit(i,j) decides which glow amber.
function facade(x, bx, by, bw, bh, cols, rows, base, lit, u, seed) {
  const r = rng(seed); x.fillStyle = base; x.fillRect(bx, by, bw, bh);
  x.fillStyle = "rgba(0,0,0,0.12)"; for (let i = 0; i < 200; i++) x.fillRect(bx + r() * bw, by + r() * bh, 6 + r() * 30, 2);
  const cw = bw / cols, rh = bh / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const wx = bx + i * cw + cw * 0.22, wy = by + j * rh + rh * 0.18, ww = cw * 0.56, wh = rh * 0.62, on = lit(i, j, r());
    x.fillStyle = "rgba(0,0,0,0.35)"; x.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
    if (on) { const f = 0.85 + 0.15 * Math.sin(u * 2 + i * 3 + j); x.fillStyle = lin(x, wy, wy + wh, [[0, rgba(AM, f)], [1, rgba(OR, f)]]); x.fillRect(wx, wy, ww, wh); glow(x, wx + ww / 2, wy + wh / 2, ww * 1.4, AM, 0.25); }
    else { x.fillStyle = "#0f1f33"; x.fillRect(wx, wy, ww, wh); }
    x.fillStyle = "rgba(0,0,0,0.5)"; x.fillRect(wx + ww / 2 - 2, wy, 4, wh);
  }
}

S["i-wall"] = (x, u, L) => {
  x.fillStyle = "#0a1a33"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { const r = rng(2); for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; x.fillRect(r() * W, r() * 500, 2, 2); } x.fillStyle = "#f4ecc8"; x.beginPath(); x.arc(860, 230, 70, 0, 7); x.fill(); glow(x, 860, 230, 220, "#f4ecc8", 0.3); });
  L(0.6, () => {
    facade(x, -60, 320, 1200, 1400, 6, 9, "#1f4f8a", (i, j, v) => v < 0.35, u, 4);
    x.save(); x.translate(540, 1080); x.font = '900 760px "Bodoni Moda"'; x.textAlign = "center"; x.lineWidth = 16; x.strokeStyle = K; x.strokeText("?", 0, 260); x.fillStyle = rgba(M, 0.92); x.fillText("?", 0, 260); x.restore();
    const d = Math.min(1, u / 6); for (const [px, py, w, l] of [[470, 1300, 16, 220], [610, 1240, 12, 160], [520, 1500, 18, 110]]) { x.fillStyle = M; x.fillRect(px - w / 2, py, w, 40 + d * l); x.beginPath(); x.arc(px, py + 40 + d * l, w * 0.8, 0, 7); x.fill(); }
    x.strokeStyle = "#1a1a1a"; x.lineWidth = 3; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(-200, 380 + k * 30); x.quadraticCurveTo(540, 520 + k * 40, 1280, 360 + k * 20); x.stroke(); }
  });
  x.fillStyle = "#1b2433"; x.fillRect(-200, 1700, W + 400, 400);
  L(1, () => { fig(x, 860, 1760, 330, K, { hood: true }); glow(x, 760, 1440, 100, M, 0.4); });
};
S["i-athens"] = (x, u, L) => {
  x.fillStyle = "#123a6a"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { const r = rng(6); for (let i = 0; i < 400; i++) { x.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.05)"; x.fillRect(r() * W, r() * H, 4 + r() * 40, 3); } });
  L(0.5, () => {
    x.strokeStyle = AM; x.lineWidth = 10; x.lineJoin = "round"; x.shadowColor = AM; x.shadowBlur = 20;
    x.beginPath(); x.moveTo(120, 640); x.lineTo(540, 420); x.lineTo(960, 640); x.closePath(); x.stroke(); x.strokeRect(120, 660, 840, 40);
    for (let i = 0; i < 6; i++) { const cx = 180 + i * 144; x.strokeRect(cx, 720, 70, 700); }
    x.strokeRect(100, 1420, 880, 50); x.shadowBlur = 0;
  });
  L(0.8, () => {
    x.save(); x.translate(540, 1080); x.fillStyle = "#efe6d2"; x.strokeStyle = K; x.lineWidth = 8;
    x.beginPath(); x.moveTo(-120, 240); x.lineTo(-120, 120); x.quadraticCurveTo(-160, 40, -130, -60); x.quadraticCurveTo(-110, -200, 20, -210); x.quadraticCurveTo(140, -200, 150, -90); x.lineTo(180, -20); x.lineTo(150, 0); x.quadraticCurveTo(160, 80, 120, 110); x.quadraticCurveTo(60, 200, 0, 190); x.lineTo(0, 240); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#cfc6b1"; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(-60 + (i % 5) * 40, 100 + Math.floor(i / 5) * 35, 22, 0, 7); x.fill(); } x.restore();
    glow(x, 540, 1000, 500, AM, 0.18);
  });
  x.fillStyle = "#0d1b2c"; x.fillRect(-200, 1600, W + 400, 500);
};
// Three lit windows on a blue block: one figure per group.
S["i-lab"] = (x, u, L) => {
  x.fillStyle = "#0b1a2e"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.6, () => {
    facade(x, -60, 120, 1200, 1700, 5, 8, "#1d4a80", () => false, u, 9);
    const lvl = [0.35, 0.7, 1], names = ["ChatGPT", "SEARCH", "BRAIN ONLY"];
    for (let i = 0; i < 3; i++) {
      const wx = 110 + i * 310, wy = 1100, ww = 240, wh = 340, f = lvl[i] * (0.85 + 0.15 * Math.sin(u * 2 + i));
      x.fillStyle = "rgba(0,0,0,0.5)"; x.fillRect(wx - 8, wy - 8, ww + 16, wh + 16);
      x.fillStyle = lin(x, wy, wy + wh, [[0, rgba(AM, f)], [1, rgba(OR, f)]]); x.fillRect(wx, wy, ww, wh); glow(x, wx + ww / 2, wy + wh / 2, 260, AM, 0.35 * f);
      x.fillStyle = K; x.fillRect(wx + 30, wy + 250, 180, 14); fig(x, wx + 100, wy + wh, 220, K, {});
      x.strokeStyle = rgba("#ffffff", 0.9); x.lineWidth = 4; x.beginPath();
      for (let t = 0; t <= 40; t++) { const px = wx + 20 + t * 5, py = wy + 60 + Math.sin(t * 0.6 + u * 6 + i) * 30 * lvl[i] * (0.5 + hash(t + Math.floor(u * 8)) * 0.5); t ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
      x.fillStyle = "#f2e7cf"; x.font = '800 30px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText(names[i], wx + ww / 2, wy + wh + 60); x.textAlign = "left";
    }
  });
};
// A grey tower whose orange windows go dark one by one.
S["i-dim"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#6d6d6d"], [1, "#2b2b2b"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "rgba(60,60,60,0.7)"; x.fillRect(-60, 200, 260, 1800); x.fillRect(860, 120, 300, 1900); for (let j = 0; j < 30; j++) for (const bx of [0, 60, 120, 900, 970, 1040]) { x.fillStyle = "rgba(200,200,200,0.12)"; x.fillRect(bx, 230 + j * 60, 40, 30); } });
  L(0.7, () => {
    x.fillStyle = "#3a3a3a"; x.fillRect(260, -200, 560, 2300);
    x.strokeStyle = "rgba(0,0,0,0.35)"; x.lineWidth = 3; for (let j = 0; j < 14; j++) { x.beginPath(); x.moveTo(260, 40 + j * 140); x.lineTo(820, 40 + j * 140); x.stroke(); }
    for (let j = 0; j < 13; j++) {
      const off = u > 1 + j * 0.45, wy = 80 + j * 140;
      x.fillStyle = off ? "#202020" : lin(x, wy, wy + 90, [[0, "#FFB347"], [1, OR]]); x.fillRect(340, wy, 130, 90);
      if (!off) glow(x, 405, wy + 45, 150, OR, 0.35);
      x.fillStyle = off ? "#252525" : OR; x.fillRect(620, wy + 20, 26, 18); x.fillRect(654, wy + 20, 26, 18);
    }
  });
};
S["i-bulb"] = (x, u, L) => {
  x.fillStyle = "#0e2747"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => facade(x, -100, -100, 1280, 2200, 6, 12, "#173f70", (i, j, v) => v < 0.18, u, 21));
  L(0.6, () => {
    glow(x, 540, 800, 700, SY, 0.35 + 0.1 * Math.sin(u * 4));
    x.fillStyle = SY; x.strokeStyle = K; x.lineWidth = 14; x.beginPath(); x.arc(540, 760, 330, Math.PI * 0.8, Math.PI * 2.2); x.lineTo(680, 1210); x.lineTo(400, 1210); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#555"; x.fillRect(410, 1220, 260, 40); x.fillRect(420, 1270, 240, 40); x.fillRect(440, 1320, 200, 40);
    x.fillStyle = K; x.beginPath(); x.ellipse(540, 760, 110, 130, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(380, 1080); x.quadraticCurveTo(400, 920, 540, 900); x.quadraticCurveTo(680, 920, 700, 1080); x.fill();
  });
};
// An orange sky at the end of a teal street canyon; one figure walks toward it.
S["i-roof"] = (x, u, L) => {
  x.fillStyle = OR; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#3d6b70"; x.fillRect(620, 700, 200, 900); x.fillStyle = "#4d7c80"; x.fillRect(640, 880, 140, 700); glow(x, 560, 1420, 300, "#ffd0a0", 0.4); });
  L(0.6, () => {
    x.fillStyle = "#1e3c42"; x.beginPath(); x.moveTo(-200, -200); x.lineTo(380, -200); x.lineTo(380, 1450); x.lineTo(-200, 1700); x.fill(); x.beginPath(); x.moveTo(1280, -200); x.lineTo(760, -200); x.lineTo(760, 1450); x.lineTo(1280, 1700); x.fill();
    x.strokeStyle = "rgba(0,0,0,0.25)"; x.lineWidth = 2; for (let j = 0; j < 40; j++) { x.beginPath(); x.moveTo(-200, j * 45); x.lineTo(380, j * 38); x.stroke(); x.beginPath(); x.moveTo(1280, j * 45); x.lineTo(760, j * 38); x.stroke(); }
    for (const [lx, h] of [[330, 260], [800, 260]]) { x.fillStyle = "#0f2226"; x.fillRect(lx, 1450 - h, 6, h); x.fillRect(lx - 10, 1450 - h, 26, 6); }
  });
  x.fillStyle = lin(x, 1450, H, [[0, "#6fa7a6"], [1, "#1a3337"]]); x.fillRect(-200, 1450, W + 400, 700);
  L(0.9, () => { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 1450, 1900, [[0, "rgba(255,120,60,0.45)"], [1, "rgba(255,120,60,0)"]]); x.fillRect(380, 1450, 380, 500); x.restore();
    const r = rng(5); for (let i = 0; i < 30; i++) { x.fillStyle = OR; x.beginPath(); x.ellipse(r() * W, 1600 + r() * 320, 14 + r() * 10, 8, 0, 0, 7); x.fill(); } });
  L(1, () => { const fy = 1520 - u * 4; fig(x, 570, fy, 180, K, { walk: u * 2.5 }); x.save(); x.globalAlpha = 0.4; x.scale(1, -1); fig(x, 570, -fy - 2, 180, "#0a1a1c", { walk: u * 2.5 }); x.restore(); });
};
})();
