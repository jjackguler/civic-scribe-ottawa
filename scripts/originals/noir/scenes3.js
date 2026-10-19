// Cases 03–05. 03 (p-*): black-and-white with red and yellow accents. 04 (i-*): urban wall-art.
// 05 (k-*): a mix of both. Same rules as before: flat shapes, tiny figures, big atmosphere.
(() => {
const W = 1080, H = 1920, S = window.NOIR_SCENES;
const R = "#E3182D", Y = "#FFC20E", K = "#0b0b0c", M = "#FF2E88", C = "#2EE6FF", SY = "#FFD400";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const lin = (x, y0, y1, st, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
function glow(x, cx, cy, r, col, a) { x.save(); x.globalCompositeOperation = "screen"; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore(); }
function cone(x, lx, ly, w, h, col, a) { x.save(); x.globalCompositeOperation = "screen"; x.filter = "blur(14px)"; x.fillStyle = lin(x, ly, ly + h, [[0, rgba(col, a)], [1, rgba(col, 0)]]); x.beginPath(); x.moveTo(lx - 12, ly); x.lineTo(lx + 12, ly); x.lineTo(lx + w / 2, ly + h); x.lineTo(lx - w / 2, ly + h); x.fill(); x.restore(); }
function streak(x, cx, y0, w, len, col, a) { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, y0, y0 + len, [[0, rgba(col, a)], [1, rgba(col, 0)]]); x.fillRect(cx - w / 2, y0, w, len); x.restore(); }
function fig(x, fx, fy, h, col = K, { hat = true, walk = null, umbrella = null, child = false, hood = false } = {}) {
  x.save(); x.fillStyle = col; x.translate(fx, fy);
  const sw = walk == null ? 0 : Math.sin(walk) * h * 0.05;
  x.beginPath(); x.moveTo(-h * 0.07, -h * 0.36); x.lineTo(-h * 0.07 + sw, 0); x.lineTo(-h * 0.02 + sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(h * 0.07, -h * 0.36); x.lineTo(h * 0.07 - sw, 0); x.lineTo(h * 0.02 - sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(-h * 0.11, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.17, -h * 0.3); x.lineTo(h * 0.17, -h * 0.3); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.11, -h * 0.82); x.quadraticCurveTo(0, -h * 0.86, -h * 0.11, -h * 0.82); x.fill();
  x.beginPath(); x.ellipse(0, -h * 0.885, h * (child ? 0.075 : 0.052), h * (child ? 0.08 : 0.062), 0, 0, 7); x.fill();
  if (hood) { x.beginPath(); x.ellipse(0, -h * 0.9, h * 0.085, h * 0.095, 0, 0, 7); x.fill(); }
  if (hat) { x.beginPath(); x.ellipse(0, -h * 0.925, h * 0.095, h * 0.018, 0, 0, 7); x.fill(); x.fillRect(-h * 0.055, -h * 0.985, h * 0.11, h * 0.06); }
  if (umbrella) { x.fillStyle = umbrella; x.beginPath(); x.moveTo(-h * 0.3, -h * 1.05); x.quadraticCurveTo(0, -h * 1.35, h * 0.3, -h * 1.05); x.quadraticCurveTo(0, -h * 1.12, -h * 0.3, -h * 1.05); x.fill(); x.fillStyle = col; x.fillRect(-h * 0.008, -h * 1.2, h * 0.016, h * 0.4); }
  x.restore();
}
function bubbles(x, bx, by, bw, n, u, light = "#e8e8e8", dark = "#9a9a9a", seed = 1) {
  const r = rng(seed); let y = by;
  for (let i = 0; i < n; i++) { const me = i % 2 === 0, w = bw * (0.45 + r() * 0.4), h = 50 + r() * 40, xx = me ? bx + bw - w : bx;
    x.globalAlpha = Math.min(1, Math.max(0, u * 1.2 - i * 0.6)); x.fillStyle = me ? light : dark; x.beginPath(); x.roundRect(xx, y, w, h, 18); x.fill();
    x.fillStyle = "rgba(0,0,0,0.25)"; for (let l = 0; l < Math.floor(h / 22); l++) x.fillRect(xx + 16, y + 16 + l * 20, w - 40 - r() * 60, 7); y += h + 18; }
  x.globalAlpha = 1;
}
function wallTex(x, base, seed) { x.fillStyle = base; x.fillRect(-200, -200, W + 400, H + 400); const r = rng(seed); for (let i = 0; i < 1800; i++) { x.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"; x.fillRect(r() * W, r() * H, 2 + r() * 5, 2 + r() * 5); } }
function drip(x, px, py, w, len, col) { x.fillStyle = col; x.fillRect(px - w / 2, py, w, len); x.beginPath(); x.arc(px, py + len, w * 0.8, 0, 7); x.fill(); }

// ── Case 03: privacy, Sin City black and white ───────────────────────────────
S["p-street"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#1c1c1c"], [0.55, "#4a4a4a"], [0.7, "#2a2a2a"], [1, "#050505"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#262626"; for (let i = 0; i < 7; i++) x.fillRect(320 + i * 70, 700 - (i % 3) * 120, 64, 700); for (let i = 0; i < 30; i++) { x.fillStyle = hash(i) > 0.6 ? "#d8d8d8" : "#333"; x.fillRect(330 + (i % 7) * 70 + 18, 760 + Math.floor(i / 7) * 110, 22, 40); } });
  L(0.7, () => {
    x.fillStyle = "#111"; x.fillRect(-200, 200, 480, 1250); x.fillRect(820, 150, 460, 1300);
    for (let j = 0; j < 9; j++) for (const bx of [40, 150, 860, 980]) { x.fillStyle = hash(j * 7 + bx) > 0.7 ? "#e6e6e6" : "#1d1d1d"; x.fillRect(bx, 280 + j * 120, 60, 70); }
    for (const [lx, ly] of [[300, 640], [780, 600]]) { x.fillStyle = "#0a0a0a"; x.fillRect(lx - 6, ly, 12, 820); x.fillRect(lx - 40, ly - 10, 80, 18); cone(x, lx, ly + 8, 520, 820, Y, 0.55); glow(x, lx, ly + 10, 120, Y, 0.8); }
  });
  x.fillStyle = lin(x, 1440, H, [[0, "#3a3a3a"], [1, "#050505"]]); x.fillRect(-200, 1440, W + 400, 700);
  L(0.8, () => {
    streak(x, 300, 1450, 120, 420, Y, 0.35); streak(x, 780, 1450, 120, 420, Y, 0.35);
    const cx = 760 + u * 4; x.fillStyle = "#050505"; x.beginPath(); x.moveTo(cx - 170, 1450); x.lineTo(cx - 130, 1385); x.lineTo(cx + 60, 1380); x.lineTo(cx + 140, 1410); x.lineTo(cx + 190, 1450); x.fill();
    x.beginPath(); x.arc(cx - 110, 1452, 28, 0, 7); x.arc(cx + 120, 1452, 28, 0, 7); x.fill();
    x.fillStyle = R; x.fillRect(cx - 178, 1418, 22, 12); glow(x, cx - 167, 1424, 70, R, 0.8); streak(x, cx - 167, 1460, 26, 380, R, 0.6);
  });
  L(1, () => fig(x, 470, 1560 - u * 4, 260, "#000", { walk: u * 3 }));
};
S["p-phone"] = (x, u, L) => {
  x.fillStyle = "#080808"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { for (let i = 0; i < 6; i++) streak(x, 120 + i * 170, -200, 6, 2200, "#ffffff", 0.05); glow(x, 540, 900, 900, "#ffffff", 0.08); });
  L(0.8, () => {
    x.save(); x.translate(540, 980); x.rotate(-0.06);
    glow(x, 0, -60, 700, "#dfe8ff", 0.25);
    x.fillStyle = "#151515"; x.beginPath(); x.roundRect(-300, -620, 600, 1180, 60); x.fill();
    x.fillStyle = "#e9ecef"; x.beginPath(); x.roundRect(-270, -580, 540, 1100, 40); x.fill();
    x.fillStyle = "#cfd4d9"; x.fillRect(-270, -580, 540, 90); x.fillStyle = "#333"; x.font = '700 30px "Schibsted Grotesk"'; x.fillText("AI assistant", -230, -523);
    x.save(); x.beginPath(); x.rect(-260, -480, 520, 820); x.clip(); bubbles(x, -240, -460 - Math.max(0, u - 4) * 40, 480, 9, u, "#c8ccd1", "#ffffff", 5); x.restore();
    const pulse = 1 + 0.06 * Math.sin(u * 5); x.save(); x.translate(0, 440); x.scale(pulse, pulse);
    x.fillStyle = R; x.beginPath(); x.roundRect(-150, -42, 300, 84, 42); x.fill(); x.fillStyle = "#fff"; x.font = '800 36px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("SHARE", 0, 13); x.textAlign = "left"; x.restore();
    const tap = (u % 7) - 5.5; if (tap > 0 && tap < 1) { x.strokeStyle = rgba(R, 1 - tap); x.lineWidth = 6; x.beginPath(); x.arc(0, 440, 60 + tap * 160, 0, 7); x.stroke(); }
    x.restore();
    x.fillStyle = "#000"; x.beginPath(); x.moveTo(250, 1920); x.quadraticCurveTo(300, 1500, 520, 1460); x.quadraticCurveTo(700, 1440, 760, 1560); x.lineTo(900, 1920); x.fill();
    x.beginPath(); x.ellipse(600, 1430, 70, 40, -0.5, 0, 7); x.fill();
  });
};
S["p-billboard"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#141414"], [1, "#2c2c2c"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = "#0c0c0c"; x.fillRect(-200, 120, W + 400, 1200);
    glow(x, 540, 640, 760, "#ffffff", 0.18);
    x.fillStyle = "#f2f2f2"; x.fillRect(110, 220, 860, 900); x.fillStyle = R; x.fillRect(110, 220, 860, 110);
    x.fillStyle = "#fff"; x.font = '800 64px "Schibsted Grotesk"'; x.letterSpacing = "10px"; x.fillText("DISCOVER", 150, 298); x.letterSpacing = "0px";
    x.save(); x.beginPath(); x.rect(110, 330, 860, 790); x.clip(); bubbles(x, 150, 360 - (u * 50) % 400, 780, 14, 99, "#d9d9d9", "#bcbcbc", 9);
    x.fillStyle = Y; x.globalAlpha = 0.85; x.fillRect(180, 520 - (u * 50) % 400, 300, 22); x.fillRect(560, 760 - (u * 50) % 400, 320, 22); x.globalAlpha = 1; x.restore();
  });
  x.fillStyle = "#050505"; x.fillRect(-200, 1500, W + 400, 600);
  L(1, () => { const r = rng(3); for (let i = 0; i < 14; i++) { const fx = 30 + i * 78 + r() * 20; fig(x, fx, 1700 + r() * 140, 250 + r() * 60, "#000", { hat: r() < 0.5, umbrella: i === 6 ? R : (r() < 0.35 ? "#000" : null) }); } });
};
S["p-alley"] = (x, u, L) => {
  x.fillStyle = "#121212"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.6, () => {
    x.fillStyle = "#1e1e1e"; x.beginPath(); x.moveTo(-200, -200); x.lineTo(420, 500); x.lineTo(420, 1300); x.lineTo(-200, 2000); x.fill(); x.beginPath(); x.moveTo(1280, -200); x.lineTo(660, 500); x.lineTo(660, 1300); x.lineTo(1280, 2000); x.fill();
    x.strokeStyle = "rgba(255,255,255,0.05)"; x.lineWidth = 2; for (let i = 0; i < 40; i++) { const t = i / 40; x.beginPath(); x.moveTo(-200, -200 + t * 2200); x.lineTo(420, 500 + t * 800); x.stroke(); x.beginPath(); x.moveTo(1280, -200 + t * 2200); x.lineTo(660, 500 + t * 800); x.stroke(); }
    x.fillStyle = "#3a3a3a"; x.fillRect(420, 500, 240, 800); glow(x, 540, 900, 300, "#ffffff", 0.2);
    const on = hash(Math.floor(u * 7)) > 0.12 ? 1 : 0.25;
    x.save(); x.translate(760, 620); x.rotate(0.12); x.fillStyle = "#111"; x.fillRect(-20, -20, 300, 120);
    x.font = '800 78px "Schibsted Grotesk"'; x.fillStyle = rgba(R, on); x.shadowColor = R; x.shadowBlur = 40 * on; x.fillText("PUBLIC", 0, 75); x.restore();
    glow(x, 880, 660, 380, R, 0.45 * on);
  });
  x.fillStyle = lin(x, 1300, H, [[0, "#2a2a2a"], [1, "#060606"]]); x.fillRect(-200, 1300, W + 400, 700);
  L(0.9, () => { streak(x, 880, 1320, 220, 520, R, 0.35); x.fillStyle = "rgba(255,255,255,0.08)"; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(300 + i * 140, 1500 + i * 60, 90, 14, 0, 0, 7); x.fill(); } });
  L(1, () => fig(x, 560, 1340, 360, "#000", {}));
};
S["p-window"] = (x, u, L) => {
  x.fillStyle = "#0b0b0b"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = "#1b1b1b"; x.fillRect(180, 200, 720, 1000);
    const off = Math.sin(u * 0.4) * 10;
    for (let i = 0; i < 18; i++) { x.fillStyle = rgba(Y, 0.85); x.fillRect(200, 220 + i * 54 + off, 680, 26); }
    x.fillStyle = "#0b0b0b"; x.fillRect(530, 200, 16, 1000); x.fillRect(180, 690, 720, 14);
    x.save(); x.globalCompositeOperation = "screen"; for (let i = 0; i < 18; i++) { x.fillStyle = rgba(Y, 0.12); x.beginPath(); x.moveTo(200, 246 + i * 54 + off); x.lineTo(880, 246 + i * 54 + off); x.lineTo(1300, 760 + i * 80); x.lineTo(-200, 760 + i * 80); x.fill(); } x.restore();
  });
  L(0.9, () => {
    x.fillStyle = "#000"; x.fillRect(-200, 1500, W + 400, 600);
    x.fillRect(250, 1200, 520, 40); x.fillRect(270, 1240, 26, 300); x.fillRect(720, 1240, 26, 300);
    x.beginPath(); x.ellipse(540, 980, 70, 82, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(400, 1200); x.quadraticCurveTo(420, 1060, 540, 1050); x.quadraticCurveTo(660, 1060, 680, 1200); x.fill();
    x.fillStyle = "#cfd4ff"; x.globalAlpha = 0.5 + 0.2 * Math.sin(u * 3); x.fillRect(500, 1150, 80, 50); x.globalAlpha = 1; glow(x, 540, 1170, 160, "#cfd4ff", 0.35);
    for (let i = 0; i < 9; i++) { x.fillStyle = rgba(Y, 0.18); x.fillRect(400, 900 + i * 40 + Math.sin(u * 0.4) * 10, 280, 12); }
  });
};
S["p-end"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#303030"], [0.6, "#6a6a6a"], [1, "#1a1a1a"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "rgba(20,20,20,0.6)"; for (let i = 0; i < 9; i++) x.fillRect(i * 130 - 40, 700 - (i % 4) * 90, 110, 700); });
  L(0.6, () => { x.fillStyle = "#151515"; x.fillRect(820, 500, 10, 900); cone(x, 825, 520, 600, 900, Y, 0.5); glow(x, 825, 520, 120, Y, 0.8); });
  x.fillStyle = lin(x, 1380, H, [[0, "#555"], [1, "#111"]]); x.fillRect(-200, 1380, W + 400, 700);
  L(1, () => { const fy = 1600 - u * 10; streak(x, 470, fy, 60, 260, R, 0.4); fig(x, 470, fy, 300, "#000", { hat: false, walk: u * 3, umbrella: R }); });
};

// ── Case 04: ideas, urban wall-art ───────────────────────────────────────────
S["i-wall"] = (x, u, L) => {
  wallTex(x, "#8d8d86", 3);
  L(0.4, () => {
    x.strokeStyle = "rgba(0,0,0,0.25)"; x.lineWidth = 3; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(-200, 200 + i * 200); x.lineTo(W + 200, 200 + i * 200); x.stroke(); }
    x.save(); x.translate(540, 980); x.fillStyle = M; x.strokeStyle = K; x.lineWidth = 18;
    x.font = '900 900px "Bodoni Moda"'; x.textAlign = "center"; x.strokeText("?", 0, 300); x.fillText("?", 0, 300); x.restore();
    const d = Math.min(1, u / 6); drip(x, 470, 1220, 16, 60 + d * 200, M); drip(x, 610, 1160, 12, 40 + d * 160, M); drip(x, 520, 1480, 18, 30 + d * 100, M);
    x.fillStyle = SY; x.font = '900 60px "Schibsted Grotesk"'; x.save(); x.translate(120, 1590); x.rotate(-0.06); x.fillText("WHAT'S LEFT FOR YOU?", 0, 0); x.restore();
  });
  x.fillStyle = "#2b2b2b"; x.fillRect(-200, 1600, W + 400, 500);
  L(1, () => { fig(x, 860, 1700, 330, K, { hat: false, hood: true }); x.fillStyle = K; x.fillRect(780, 1420, 26, 70); for (let i = 0; i < 20; i++) { x.fillStyle = rgba(M, 0.5 * hash(i + Math.floor(u * 10))); x.beginPath(); x.arc(760 - hash(i) * 120, 1410 - hash(i + 3) * 80, 4, 0, 7); x.fill(); } });
};
S["i-athens"] = (x, u, L) => {
  wallTex(x, "#2b2b2b", 5);
  L(0.4, () => {
    x.strokeStyle = SY; x.lineWidth = 10; x.lineJoin = "round";
    x.beginPath(); x.moveTo(120, 640); x.lineTo(540, 420); x.lineTo(960, 640); x.closePath(); x.stroke();
    x.strokeRect(120, 660, 840, 40);
    for (let i = 0; i < 6; i++) { const cx = 180 + i * 144; x.strokeRect(cx, 720, 70, 700); for (let f = 1; f < 4; f++) { x.beginPath(); x.moveTo(cx + f * 17, 740); x.lineTo(cx + f * 17, 1400); x.stroke(); } }
    x.strokeRect(100, 1420, 880, 50);
    x.fillStyle = rgba(SY, 0.9); for (let i = 0; i < 6; i++) drip(x, 220 + i * 140, 1470, 8, 40 + hash(i) * 120 * Math.min(1, u / 5), SY);
  });
  L(0.8, () => {
    x.save(); x.translate(540, 1080); x.fillStyle = "#eee8da"; x.strokeStyle = K; x.lineWidth = 8;
    x.beginPath(); x.moveTo(-120, 240); x.lineTo(-120, 120); x.quadraticCurveTo(-160, 40, -130, -60); x.quadraticCurveTo(-110, -200, 20, -210); x.quadraticCurveTo(140, -200, 150, -90); x.lineTo(180, -20); x.lineTo(150, 0); x.quadraticCurveTo(160, 80, 120, 110); x.quadraticCurveTo(60, 200, 0, 190); x.lineTo(0, 240); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#cfc8b6"; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(-60 + (i % 5) * 40, 100 + Math.floor(i / 5) * 35, 22, 0, 7); x.fill(); }
    x.restore();
    x.fillStyle = C; x.save(); x.translate(760, 1280); x.rotate(-0.2); x.fillRect(-90, -40, 180, 80); x.fillStyle = K; for (let l = 0; l < 3; l++) x.fillRect(-70, -24 + l * 20, 140 - l * 30, 6); x.restore();
  });
};
S["i-lab"] = (x, u, L) => {
  wallTex(x, "#1d2226", 7);
  L(0.6, () => {
    const labels = ["ChatGPT", "SEARCH", "BRAIN ONLY"], lvl = [0.25, 0.6, 1];
    for (let i = 0; i < 3; i++) {
      const cx = 200 + i * 340;
      x.fillStyle = K; x.fillRect(cx - 130, 1300, 260, 24); x.fillRect(cx - 110, 1324, 14, 220); x.fillRect(cx + 96, 1324, 14, 220);
      fig(x, cx, 1540, 330, K, { hat: false });
      const a = lvl[i] * (0.75 + 0.25 * Math.sin(u * 3 + i));
      glow(x, cx, 900, 230, i === 0 ? M : C, 0.6 * a);
      x.strokeStyle = rgba(i === 0 ? M : C, 0.95); x.lineWidth = 6; x.beginPath();
      for (let t = 0; t <= 60; t++) { const px = cx - 130 + t * 4.3, amp = 70 * lvl[i]; const py = 900 + Math.sin(t * 0.5 + u * 6 + i) * amp * (0.4 + hash(t + Math.floor(u * 8)) * 0.6); t ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
      x.fillStyle = "#eee"; x.font = '800 30px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText(labels[i], cx, 1110); x.textAlign = "left";
    }
    x.fillStyle = SY; x.font = '900 46px "Schibsted Grotesk"'; x.fillText("54 PEOPLE · 3 GROUPS", 120, 420);
  });
};
S["i-dim"] = (x, u, L) => {
  wallTex(x, "#3a3a40", 11);
  L(0.5, () => { for (let i = 0; i < 9; i++) { x.save(); x.translate(560 + Math.sin(i) * 200, 1200 - ((u * 90 + i * 140) % 1200)); x.globalAlpha = 0.85; x.fillStyle = i % 2 ? M : "#eee"; x.beginPath(); x.roundRect(-130, -40, 260, 80, 30); x.fill(); x.fillStyle = "rgba(0,0,0,0.3)"; x.fillRect(-100, -10, 200 - (i % 3) * 40, 10); x.restore(); } });
  L(0.9, () => {
    x.fillStyle = K; x.fillRect(220, 1400, 640, 30); x.fillRect(400, 1250, 280, 160); glow(x, 540, 1320, 300, "#ffffff", 0.3);
    fig(x, 300, 1700, 420, K, { hat: false });
    const dim = Math.max(0.15, 1 - u / 8); x.save(); x.translate(300, 1180); x.strokeStyle = rgba(SY, dim); x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 60, 0, 7); x.stroke(); x.beginPath(); x.moveTo(-30, 0); x.quadraticCurveTo(0, -40, 30, 0); x.stroke(); x.restore();
    glow(x, 300, 1180, 140, SY, 0.5 * dim);
  });
  x.fillStyle = "#222"; x.fillRect(-200, 1700, W + 400, 400);
};
S["i-bulb"] = (x, u, L) => {
  wallTex(x, "#2b2b2b", 13);
  L(0.4, () => {
    glow(x, 540, 800, 700, SY, 0.35 + 0.1 * Math.sin(u * 4));
    x.fillStyle = SY; x.strokeStyle = K; x.lineWidth = 14; x.beginPath(); x.arc(540, 760, 330, Math.PI * 0.8, Math.PI * 2.2); x.lineTo(680, 1210); x.lineTo(400, 1210); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#555"; x.fillRect(410, 1220, 260, 40); x.fillRect(420, 1270, 240, 40); x.fillRect(440, 1320, 200, 40);
    x.fillStyle = K; x.beginPath(); x.ellipse(540, 760, 110, 130, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(380, 1080); x.quadraticCurveTo(400, 920, 540, 900); x.quadraticCurveTo(680, 920, 700, 1080); x.fill();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + u * 0.3, r1 = 400, r2 = 460 + 20 * Math.sin(u * 5 + i); x.strokeStyle = i % 2 ? M : C; x.lineWidth = 10; x.beginPath(); x.moveTo(540 + Math.cos(a) * r1, 760 + Math.sin(a) * r1); x.lineTo(540 + Math.cos(a) * r2, 760 + Math.sin(a) * r2); x.stroke(); }
  });
};
S["i-roof"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#2a0f3a"], [0.5, M], [0.75, "#ff8a3a"], [1, "#1a1a1a"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { x.fillStyle = SY; x.beginPath(); x.arc(540, 1100, 180, 0, 7); x.fill(); });
  L(0.45, () => { x.fillStyle = "#1a1020"; const r = rng(17); for (let i = 0; i < 14; i++) { const h = 300 + r() * 600; x.fillRect(i * 85 - 40, 1400 - h, 80, h + 200); } for (let i = 0; i < 60; i++) { x.fillStyle = r() < 0.5 ? SY : C; x.fillRect(r() * W, 900 + r() * 500, 8, 12); } });
  L(0.8, () => { x.fillStyle = K; x.fillRect(-200, 1500, W + 400, 600); x.fillRect(80, 1440, 260, 60); x.fillRect(120, 1380, 40, 60); for (let i = 0; i < 5; i++) { x.save(); x.translate(200 + ((u * 40 + i * 140) % 900), 500 + i * 40 + Math.sin(u * 3 + i) * 10); x.strokeStyle = K; x.lineWidth = 5; x.beginPath(); x.moveTo(-18, 0); x.quadraticCurveTo(-8, -10, 0, 0); x.quadraticCurveTo(8, -10, 18, 0); x.stroke(); x.restore(); } });
  L(1, () => fig(x, 640, 1500, 380, K, { hat: false, hood: true }));
};

// ── Case 05: children, mixed ─────────────────────────────────────────────────
S["k-room"] = (x, u, L) => {
  x.fillStyle = "#0d0f14"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#1a1e28"; x.fillRect(620, 280, 320, 420); x.fillStyle = "#e8e8e8"; x.beginPath(); x.arc(820, 400, 50, 0, 7); x.fill(); glow(x, 820, 400, 200, "#ffffff", 0.2); x.fillStyle = "#0d0f14"; x.fillRect(775, 280, 10, 420); x.fillRect(620, 485, 320, 10);
    for (let i = 0; i < 12; i++) { x.fillStyle = rgba(Y, 0.6); x.beginPath(); x.arc(120 + i * 80, 200 + (i % 2) * 30, 6, 0, 7); x.fill(); } });
  L(0.7, () => {
    x.fillStyle = "#1c1f27"; x.fillRect(80, 1180, 920, 260); x.fillRect(60, 1000, 60, 600);
    x.fillStyle = "#2a2f3a"; x.beginPath(); x.moveTo(120, 1180); x.quadraticCurveTo(500, 1080, 980, 1180); x.lineTo(980, 1300); x.lineTo(120, 1300); x.fill();
    x.fillStyle = "#11141b"; x.beginPath(); x.ellipse(330, 1110, 75, 70, 0, 0, 7); x.fill();
    glow(x, 420, 1080, 260, "#bcd4ff", 0.55 + 0.1 * Math.sin(u * 7)); x.fillStyle = "#d8e6ff"; x.save(); x.translate(430, 1085); x.rotate(-0.4); x.fillRect(-30, -50, 60, 100); x.restore();
    x.fillStyle = "#11141b"; x.beginPath(); x.ellipse(880, 1420, 60, 70, 0, 0, 7); x.fill(); x.beginPath(); x.arc(850, 1350, 22, 0, 7); x.arc(910, 1350, 22, 0, 7); x.fill();
    x.fillStyle = R; x.beginPath(); x.arc(760, 1480, 30, 0, 7); x.fill();
  });
};
S["k-doc"] = (x, u, L) => {
  x.fillStyle = "#0b0b0b"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.5, () => {
    for (let s = 2; s >= 0; s--) { x.save(); x.translate(540 + s * 18, 960 + s * 14); x.rotate(-0.05 + s * 0.03); x.fillStyle = s ? "#cfcac0" : "#efeae0"; x.fillRect(-340, -560, 680, 1120);
      if (!s) { x.fillStyle = "#222"; x.font = '700 40px "Special Elite"'; x.fillText("CONTENT RISK STANDARDS", -290, -470); x.fillStyle = "rgba(0,0,0,0.55)";
        for (let l = 0; l < 26; l++) { const y = -400 + l * 36; x.fillRect(-290, y, 520 - (l % 4) * 60, 10); if (l === 9 || l === 10) { x.fillStyle = rgba(R, Math.min(1, Math.max(0, (u - 1) / 0.8))); x.fillRect(-296, y - 8, 560 * Math.min(1, Math.max(0, (u - 1) / 0.8)), 26); x.fillStyle = "rgba(0,0,0,0.55)"; } } }
      x.restore(); }
  });
  L(0.9, () => { const mx = 300 + Math.sin(u * 0.6) * 160, my = 900 + Math.cos(u * 0.5) * 120; x.strokeStyle = "#111"; x.lineWidth = 18; x.beginPath(); x.arc(mx, my, 110, 0, 7); x.stroke(); x.beginPath(); x.moveTo(mx + 80, my + 80); x.lineTo(mx + 200, my + 200); x.lineWidth = 30; x.stroke(); glow(x, mx, my, 110, "#ffffff", 0.2); });
};
S["k-switch"] = (x, u, L) => {
  wallTex(x, "#2a2a2e", 21);
  L(0.6, () => {
    x.fillStyle = "#e8e2d4"; x.beginPath(); x.roundRect(390, 620, 300, 480, 30); x.fill(); x.strokeStyle = K; x.lineWidth = 8; x.stroke();
    const p = Math.min(1, Math.max(0, (u - 2) / 0.4)); x.fillStyle = "#d0c8b6"; x.fillRect(470, 700, 140, 320);
    x.fillStyle = p > 0.5 ? R : Y; x.beginPath(); x.roundRect(480, 710 + p * 160, 120, 140, 20); x.fill();
    x.fillStyle = K; x.font = '900 40px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("ON", 540, 690); x.fillText("OFF", 540, 1150); x.textAlign = "left";
    glow(x, 540, 860, 360, p > 0.5 ? R : Y, 0.35);
  });
  L(1, () => { const hx = 800 - Math.min(1, u / 2) * 160; x.fillStyle = K; x.beginPath(); x.moveTo(1300, 1300); x.lineTo(hx + 120, 900); x.quadraticCurveTo(hx, 860, hx - 20, 900); x.lineTo(hx + 40, 960); x.lineTo(1300, 1500); x.fill(); });
};
S["k-doors"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#151515"], [1, "#2b2b2b"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.6, () => {
    x.fillStyle = "#0c0c0c"; x.beginPath(); x.moveTo(-200, -200); x.lineTo(380, 600); x.lineTo(380, 1300); x.lineTo(-200, 2100); x.fill(); x.beginPath(); x.moveTo(1280, -200); x.lineTo(700, 600); x.lineTo(700, 1300); x.lineTo(1280, 2100); x.fill();
    x.fillStyle = "#3a3a3a"; x.fillRect(380, 600, 320, 700); glow(x, 540, 950, 260, "#ffffff", 0.2);
    for (let i = 0; i < 3; i++) { const s = 1 - i * 0.28, dx = 120 - i * 80; x.fillStyle = "#1e1e1e"; x.beginPath(); x.moveTo(dx, 300 + i * 220); x.lineTo(dx + 140 * s, 360 + i * 210); x.lineTo(dx + 140 * s, 1500 - i * 140); x.lineTo(dx, 1640 - i * 170); x.fill();
      x.fillStyle = R; x.fillRect(dx + 20 * s, 500 + i * 230, 90 * s, 50 * s); x.fillStyle = "#fff"; x.font = `800 ${Math.round(30 * s)}px "Schibsted Grotesk"`; x.fillText("18+", dx + 34 * s, 536 + i * 230); }
    const c = Math.min(1, Math.max(0, (u - 1.5) / 0.6)); x.fillStyle = "#000"; x.fillRect(380, 600, 320 * c, 700); glow(x, 540, 950, 200, R, 0.3 * c);
  });
  L(1, () => fig(x, 540, 1650, 300, "#000", { hat: false, child: true }));
};
S["k-friend"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#0a0d14"], [1, "#1c2230"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { const r = rng(4); for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`; x.fillRect(r() * W, r() * 1000, 2, 2); } x.fillStyle = "#e8e8e8"; x.beginPath(); x.arc(780, 420, 70, 0, 7); x.fill(); });
  L(0.5, () => { x.fillStyle = "#0b0e15"; const r = rng(8); for (let i = 0; i < 14; i++) { const h = 200 + r() * 500; x.fillRect(i * 85 - 40, 1300 - h, 80, h + 400); } });
  L(0.9, () => {
    x.fillStyle = K; x.fillRect(150, 1440, 780, 30); x.fillRect(190, 1470, 20, 160); x.fillRect(870, 1470, 20, 160);
    x.save(); x.translate(380, 1440); fig(x, 0, 0, 260, K, { hat: false, child: true }); x.restore();
    glow(x, 430, 1300, 120, "#bcd4ff", 0.5);
    const fade = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(u * 1.3)) * Math.max(0, 1 - u / 10); const r = rng(12);
    for (let i = 0; i < 260; i++) { const py = 1440 - r() * 300, px = 640 + (r() - 0.5) * (py > 1280 ? 120 : 70) ; if (Math.hypot(px - 640, py - 1180) > 60 && py < 1220) continue; x.fillStyle = rgba(C, fade * r()); x.fillRect(px + Math.sin(u * 2 + i) * 3, py, 5, 5); }
  });
  x.fillStyle = "#06080c"; x.fillRect(-200, 1630, W + 400, 500);
};
S["k-hand"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#2a2a2a"], [0.65, "#7a7a76"], [1, "#151515"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "rgba(30,30,30,0.55)"; for (let i = 0; i < 10; i++) x.fillRect(i * 115 - 40, 760 - (i % 3) * 120, 100, 700); });
  L(0.6, () => { for (const lx of [260, 860]) { x.fillStyle = "#111"; x.fillRect(lx - 5, 700, 10, 760); cone(x, lx, 712, 460, 760, Y, 0.55); glow(x, lx, 712, 100, Y, 0.8); } });
  x.fillStyle = lin(x, 1460, H, [[0, "#4a4a48"], [1, "#0d0d0d"]]); x.fillRect(-200, 1460, W + 400, 600);
  L(1, () => {
    const fy = 1700 - u * 8; fig(x, 500, fy, 340, "#000", { hat: false, walk: u * 2.6 }); fig(x, 600, fy, 200, "#000", { hat: false, child: true, walk: u * 3 + 1 });
    x.strokeStyle = "#000"; x.lineWidth = 10; x.beginPath(); x.moveTo(540, fy - 200); x.quadraticCurveTo(565, fy - 150, 585, fy - 130); x.stroke();
    x.strokeStyle = "#000"; x.lineWidth = 3; x.beginPath(); x.moveTo(630, fy - 150); x.lineTo(660, fy - 330); x.stroke(); x.fillStyle = R; x.beginPath(); x.ellipse(662, fy - 380, 42, 52, Math.sin(u) * 0.1, 0, 7); x.fill();
  });
};
})();
