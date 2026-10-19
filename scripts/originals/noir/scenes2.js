// Case 02 scenes: flat poster art, one saturated field against black, tiny figures, giant geometry.
(() => {
const W = 1080, H = 1920, S = window.NOIR_SCENES;
const Y = "#FFC20E", R = "#E3182D", O = "#FF6B1A", CREAM = "#EDE3C8", K = "#0b0b0c";
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const lin = (x, y0, y1, st, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
function fig(x, fx, fy, h, col = K, { hat = true, umbrella = false, walk = null, child = false } = {}) {
  x.save(); x.fillStyle = col; x.translate(fx, fy);
  const sw = walk == null ? 0 : Math.sin(walk) * h * 0.05;
  x.beginPath(); x.moveTo(-h * 0.07, -h * 0.36); x.lineTo(-h * 0.07 + sw, 0); x.lineTo(-h * 0.02 + sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(h * 0.07, -h * 0.36); x.lineTo(h * 0.07 - sw, 0); x.lineTo(h * 0.02 - sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(-h * 0.11, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.17, -h * 0.3);
  x.lineTo(h * 0.17, -h * 0.3); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.11, -h * 0.82); x.quadraticCurveTo(0, -h * 0.86, -h * 0.11, -h * 0.82); x.fill();
  x.beginPath(); x.ellipse(0, -h * 0.885, h * (child ? 0.075 : 0.052), h * (child ? 0.08 : 0.062), 0, 0, 7); x.fill();
  if (hat) { x.beginPath(); x.ellipse(0, -h * 0.925, h * 0.095, h * 0.018, 0, 0, 7); x.fill(); x.fillRect(-h * 0.055, -h * 0.985, h * 0.11, h * 0.06); }
  if (umbrella) { x.beginPath(); x.moveTo(-h * 0.3, -h * 1.05); x.quadraticCurveTo(0, -h * 1.35, h * 0.3, -h * 1.05); x.quadraticCurveTo(0, -h * 1.12, -h * 0.3, -h * 1.05); x.fill(); x.fillRect(-h * 0.008, -h * 1.2, h * 0.016, h * 0.4); }
  x.restore();
}
function grainy(x, col, a, seed) { const r = rng(seed); x.fillStyle = col; for (let i = 0; i < 2500; i++) { x.globalAlpha = a * r(); x.fillRect(r() * W, r() * H, 2, 2); } x.globalAlpha = 1; }

// 1. A wall of eyes on red, all turning toward one small figure.
S.eyes = (x, u, L) => {
  x.fillStyle = R; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    const r = rng(77);
    for (let i = 0; i < 34; i++) {
      const ex = r() * W, ey = r() * 1500 + 40, s = 40 + r() * 120, rot = (r() - 0.5) * 0.3, ph = r() * 9;
      const blink = Math.max(0, 1 - Math.abs(((u * 0.5 + ph) % 6) - 0.1) * 8);
      x.save(); x.translate(ex, ey); x.rotate(rot);
      x.strokeStyle = "#8f0d1b"; x.lineWidth = 6; x.beginPath(); x.ellipse(0, 0, s * 1.25, s * 0.62, 0, 0, 7); x.stroke();
      x.fillStyle = CREAM; x.beginPath(); x.ellipse(0, 0, s, Math.max(1, s * 0.5 * (1 - blink)), 0, 0, 7); x.fill();
      if (blink < 0.9) {
        x.save(); x.beginPath(); x.ellipse(0, 0, s, Math.max(1, s * 0.5 * (1 - blink)), 0, 0, 7); x.clip();
        const k = Math.min(1, u / 3), tx = (540 - ex) / W * s * 0.6 * k, ty = (1700 - ey) / H * s * 0.35 * k;
        x.fillStyle = "#4a5866"; x.beginPath(); x.arc(tx, ty, s * 0.42, 0, 7); x.fill();
        x.fillStyle = "#101418"; x.beginPath(); x.arc(tx, ty, s * 0.2, 0, 7); x.fill();
        x.fillStyle = "rgba(255,255,255,0.8)"; x.beginPath(); x.arc(tx - s * 0.12, ty - s * 0.12, s * 0.07, 0, 7); x.fill();
        x.restore();
      }
      x.restore();
    }
  });
  x.fillStyle = lin(x, -100, 800, [[0, "rgba(40,0,6,0.92)"], [0.7, "rgba(60,0,8,0.6)"], [1, "rgba(60,0,8,0)"]]); x.fillRect(-200, -200, W + 400, 1000);
  x.fillStyle = lin(x, 1350, H, [[0, "rgba(120,5,15,0)"], [1, "rgba(60,0,8,0.8)"]]); x.fillRect(-200, 1350, W + 400, 700);
  L(1, () => fig(x, 540, 1790, 360, "#141a24", { hat: false, child: true }));
};

// 2. A black tower on a yellow street seen from above; rain; one umbrella.
S.tower = (x, u, L) => {
  x.fillStyle = Y; x.fillRect(-200, -200, W + 400, H + 400);
  x.fillStyle = lin(x, 0, 0, [[0, "rgba(0,0,0,0.55)"], [1, "rgba(0,0,0,0)"]], -200, 500); x.fillRect(-200, -200, 700, H + 400);
  L(0.6, () => {
    x.fillStyle = "rgba(0,0,0,0.4)"; x.beginPath(); x.moveTo(640, 1350); x.lineTo(1300, 1000); x.lineTo(1300, 1700); x.lineTo(820, 1920); x.fill();
    x.fillStyle = "#1c1c1e"; x.beginPath(); x.moveTo(330, -200); x.lineTo(640, -200); x.lineTo(640, 1350); x.lineTo(330, 1180); x.fill();
    x.fillStyle = "#101012"; x.beginPath(); x.moveTo(640, -200); x.lineTo(1300, -200); x.lineTo(1300, 1000); x.lineTo(640, 1350); x.fill();
    for (let j = 0; j < 8; j++) for (const cx of [370, 500]) { x.save(); x.translate(cx, -40 + j * 150 + (cx - 330) * 0.17); x.transform(1, 0.17, 0, 1, 0, 0); x.fillStyle = j === 7 && cx === 500 ? "#3a3a3a" : Y; x.fillRect(0, 0, 52, 92); x.restore(); }
    for (let j = 0; j < 7; j++) { x.save(); x.translate(760, 80 + j * 165); x.transform(1, -0.53, 0, 1, 0, 0); x.fillStyle = j % 3 === 1 ? "#2a2a2a" : Y; x.fillRect(0, 0, 50, 95); x.restore(); }
    x.strokeStyle = "rgba(255,255,255,0.07)"; x.lineWidth = 1; for (let i = 0; i < 160; i++) { const yy = hash(i) * 1300 - 100; x.beginPath(); x.moveTo(330, yy); x.lineTo(640, yy + 30); x.stroke(); }
    x.strokeStyle = "#1c1c1e"; x.lineWidth = 4; x.beginPath(); x.moveTo(330, 1180); x.lineTo(160, 1090); x.lineTo(1060, 1960); x.stroke();
  });
  L(0.9, () => {
    const wx = 300 + u * 6, wy = 1500 + u * 3;
    x.fillStyle = "rgba(0,0,0,0.28)"; x.beginPath(); x.moveTo(wx - 10, wy); x.lineTo(wx + 120, wy + 140); x.lineTo(wx + 150, wy + 120); x.lineTo(wx + 20, wy - 5); x.fill();
    fig(x, wx, wy, 120, K, { hat: false, umbrella: true, walk: u * 3 });
    x.save(); x.translate(90, 1720); x.rotate(0.5);
    x.fillStyle = K; x.fillRect(-140, -65, 290, 140); x.fillStyle = Y; x.fillRect(-40, -50, 120, 110); x.fillStyle = K; x.fillRect(-20, -40, 34, 90); x.restore();
    x.fillStyle = K; x.fillRect(960, 1720, 8, 220); x.beginPath(); x.arc(964, 1715, 14, 0, 7); x.fill(); x.fillStyle = Y; x.beginPath(); x.arc(964, 1715, 8, 0, 7); x.fill();
  });
  grainy(x, K, 0.25, 9);
};

// 3. A figure smoking on a balcony against a slab of yellow light.
S.balcony = (x, u, L) => {
  x.fillStyle = "#1f2525"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = Y; for (const [lx, w] of [[70, 4], [100, 3], [200, 4], [660, 3], [690, 2]]) x.fillRect(lx, -200, w, H + 400); x.fillRect(380, 1290, 100, 4); x.fillRect(360, 1450, 4, 300); x.fillRect(300, 980, 4, 120); });
  L(0.5, () => { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = "rgba(255,255,255,0.05)"; x.beginPath(); x.moveTo(250, -200); x.lineTo(500, -200); x.lineTo(1000, 1500); x.lineTo(760, 1500); x.fill(); x.restore(); });
  L(0.8, () => {
    x.fillStyle = Y; x.fillRect(750, -200, 160, 1500);
    x.fillStyle = K; x.fillRect(910, -200, 400, H + 400);
    x.fillStyle = "#c79a14"; x.beginPath(); x.moveTo(610, 1300); x.lineTo(910, 1300); x.lineTo(830, 1360); x.lineTo(420, 1540); x.fill();
    x.fillStyle = K; x.fillRect(420, 1540, 900, 600); x.beginPath(); x.moveTo(410, 1540); x.lineTo(830, 1360); x.lineTo(1300, 1360); x.lineTo(1300, 1540); x.fill();
    fig(x, 800, 1330, 430, K, {});
    x.strokeStyle = K; x.lineWidth = 4; x.beginPath(); x.moveTo(580, 1330); x.lineTo(580, 1160); x.lineTo(910, 1160); x.moveTo(580, 1160); x.lineTo(450, 1380); x.stroke();
    for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(610 + i * 50, 1160); x.lineTo(610 + i * 50, 1320); x.stroke(); }
    x.lineCap = "round"; x.lineWidth = 10;
    for (let k = 0; k < 3; k++) { x.strokeStyle = `rgba(230,225,210,${0.32 - k * 0.08})`; x.beginPath(); for (let t = 0; t < 40; t++) { const yy = 955 - t * 14, xx = 745 - t * 4 + Math.sin(t * 0.3 + u * 1.5 + k) * (10 + t * 1.2); t ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }
    x.fillStyle = "#ff8a2a"; x.beginPath(); x.arc(752, 960, 5 + Math.sin(u * 3) * 1.5, 0, 7); x.fill();
  });
};

// 4. A video-call grid of four orange caricature "colleagues".
function face(x, cx, cy, s, v, u) {
  x.save(); x.translate(cx, cy);
  x.fillStyle = v.shirt; x.fillRect(-s * 0.95, s * 0.8, s * 1.9, s * 0.9);
  x.fillStyle = v.skin; x.beginPath(); x.moveTo(-s * 0.5, -s * 0.8); x.lineTo(s * 0.5, -s * 0.8); x.lineTo(s * 0.55, s * 0.7); x.quadraticCurveTo(0, s * 1.05, -s * 0.55, s * 0.7); x.fill();
  x.fillStyle = v.shade; x.beginPath(); x.moveTo(s * 0.12, -s * 0.8); x.lineTo(s * 0.5, -s * 0.8); x.lineTo(s * 0.55, s * 0.7); x.lineTo(s * 0.22, s * 0.86); x.fill();
  x.fillStyle = "#fff"; x.beginPath(); x.moveTo(-s * 0.04, -s * 0.35); x.lineTo(s * 0.06, -s * 0.35); x.lineTo(s * 0.14, s * 0.25); x.lineTo(-s * 0.08, s * 0.25); x.fill();
  const look = Math.sin(u * 0.7 + v.seed) * s * 0.03;
  for (const sx of [-1, 1]) { x.fillStyle = "#fff"; x.beginPath(); x.arc(sx * s * 0.24, -s * 0.38, s * 0.12, 0, 7); x.fill(); x.fillStyle = K; x.beginPath(); x.arc(sx * s * 0.24 + look, -s * 0.36, s * 0.05, 0, 7); x.fill(); }
  if (v.glasses) { x.fillStyle = K; for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(sx * s * 0.25, -s * 0.38, s * 0.17, s * 0.14, 0, 0, 7); x.fill(); } x.fillRect(-s * 0.1, -s * 0.42, s * 0.2, s * 0.04); }
  x.strokeStyle = K; x.lineWidth = s * 0.05; x.beginPath(); x.moveTo(-s * 0.35, -s * 0.56); x.lineTo(-s * 0.12, -s * 0.52); x.moveTo(s * 0.12, -s * 0.52); x.lineTo(s * 0.35, -s * 0.58); x.stroke();
  x.fillStyle = K;
  if (v.beard) { x.beginPath(); x.moveTo(-s * 0.5, s * 0.25); x.quadraticCurveTo(0, s * 1.2, s * 0.5, s * 0.25); x.lineTo(s * 0.25, s * 0.35); x.quadraticCurveTo(0, s * 0.5, -s * 0.25, s * 0.35); x.fill(); }
  else { x.lineWidth = s * 0.04; x.beginPath(); x.moveTo(-s * 0.15, s * 0.5); x.quadraticCurveTo(0, s * 0.42, s * 0.15, s * 0.5); x.stroke(); }
  x.beginPath(); x.moveTo(-s * 0.55, -s * 0.75); x.quadraticCurveTo(-s * 0.3, -s * (1.1 + v.hair), 0, -s * 0.95); x.quadraticCurveTo(s * 0.4, -s * (1.15 + v.hair), s * 0.58, -s * 0.7); x.lineTo(s * 0.5, -s * 0.8); x.lineTo(-s * 0.5, -s * 0.8); x.fill();
  x.restore();
}
S.faces = (x, u, L) => {
  x.fillStyle = K; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.7, () => {
    const vs = [
      { skin: O, shade: "#e04e0e", shirt: "#c43c08", beard: true, glasses: true, hair: 0.2, seed: 1, name: "CFO" },
      { skin: "#ff7f2a", shade: "#e45a14", shirt: "#2a2a2a", beard: false, glasses: false, hair: 0.05, seed: 2, name: "FINANCE" },
      { skin: "#f2622a", shade: "#c8461a", shirt: "#8a1a10", beard: true, glasses: false, hair: 0.3, seed: 3, name: "LEGAL" },
      { skin: "#ff8f3a", shade: "#e2661e", shirt: "#3a2a20", beard: false, glasses: true, hair: 0.0, seed: 4, name: "OPERATIONS" },
    ];
    vs.forEach((v, i) => {
      const tx = 60 + (i % 2) * 490, ty = 260 + Math.floor(i / 2) * 640, tw = 470, th = 610;
      x.save(); x.beginPath(); x.rect(tx, ty, tw, th); x.clip();
      x.fillStyle = i % 2 ? "#1a0f0a" : "#2a1208"; x.fillRect(tx, ty, tw, th);
      face(x, tx + tw / 2, ty + th * 0.46, 190, v, u);
      x.restore();
      x.strokeStyle = i === 0 && Math.floor(u * 1.5) % 2 ? Y : "#333"; x.lineWidth = 5; x.strokeRect(tx, ty, tw, th);
      x.fillStyle = "rgba(0,0,0,0.6)"; x.fillRect(tx + 14, ty + th - 54, 210, 40);
      x.fillStyle = CREAM; x.font = '600 22px "Schibsted Grotesk"'; x.fillText(v.name, tx + 26, ty + th - 26);
      x.fillStyle = "#3fd16b"; x.beginPath(); x.arc(tx + tw - 30, ty + 30, 8, 0, 7); x.fill();
    });
    x.fillStyle = "#1c1c1c"; x.fillRect(-200, 1580, W + 400, 160);
    for (const [cx, col] of [[400, "#444"], [540, R], [680, "#444"]]) { x.fillStyle = col; x.beginPath(); x.arc(cx, 1660, 46, 0, 7); x.fill(); }
    x.fillStyle = CREAM; x.font = '500 26px "Schibsted Grotesk"'; x.textAlign = "center"; x.fillText("● REC   Confidential call", 540, 205); x.textAlign = "left";
  });
};

// 5. A red runway climbing to a fortress door; one small figure.
S.runway = (x, u, L) => {
  x.fillStyle = lin(x, 0, 1100, [[0, "#e9e0c4"], [1, "#d8cda9"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { x.fillStyle = "rgba(150,140,110,0.18)"; for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(200 + i * 180, 200 + (i % 3) * 120, 260, 50, 0, 0, 7); x.fill(); } });
  L(0.45, () => {
    x.fillStyle = "#151515"; x.beginPath(); x.moveTo(-200, 1100); x.lineTo(560, 860); x.lineTo(560, 620); x.lineTo(380, 640); x.lineTo(380, 760); x.lineTo(-200, 820); x.fill();
    x.fillStyle = "#1b1b1b"; x.fillRect(560, 380, 220, 680);
    x.fillStyle = "#b8774f"; x.fillRect(780, 380, 90, 680); x.beginPath(); x.moveTo(870, 680); x.lineTo(1000, 650); x.lineTo(1000, 1010); x.lineTo(870, 1060); x.fill();
    for (let i = 0; i < 5; i++) { x.fillStyle = "#1b1b1b"; x.fillRect(560 + i * 50, 350, 30, 34); }
    x.fillStyle = "#3a1c12"; x.fillRect(820, 470, 18, 50); x.fillRect(820, 600, 18, 40);
    x.fillStyle = K; x.beginPath(); x.moveTo(640, 1060); x.lineTo(640, 950); x.arc(675, 950, 35, Math.PI, 0); x.lineTo(710, 1060); x.fill();
    x.fillStyle = R; x.beginPath(); x.moveTo(660, 1060); x.lineTo(660, 960); x.arc(675, 960, 15, Math.PI, 0); x.lineTo(690, 1060); x.fill();
    x.fillStyle = "#565049"; x.beginPath(); x.moveTo(870, 1060); x.lineTo(1300, 1150); x.lineTo(1300, 2100); x.lineTo(1040, 2100); x.fill();
  });
  L(0.8, () => {
    x.fillStyle = R; x.beginPath(); x.moveTo(600, 1060); x.lineTo(820, 1060); x.lineTo(1400, 2100); x.lineTo(-300, 2100); x.fill();
    x.strokeStyle = "rgba(0,0,0,0.12)"; x.lineWidth = 3; for (let i = 0; i < 8; i++) { const yy = 1110 + i * 120; x.beginPath(); x.moveTo(560 - i * 90, yy); x.lineTo(860 + i * 70, yy + 20); x.stroke(); }
  });
  L(1, () => { x.fillStyle = "rgba(0,0,0,0.35)"; x.beginPath(); x.moveTo(240, 1800); x.lineTo(-100, 1850); x.lineTo(-100, 1880); x.lineTo(260, 1815); x.fill(); fig(x, 260, 1810, 420, K, { hat: false }); });
};

// 6. A giant shadow head looming over a small red figure.
S.shadow = (x, u, L) => {
  x.fillStyle = "#4a4a4a"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    x.fillStyle = "#151515"; x.beginPath(); x.moveTo(-200, -200); x.lineTo(1300, -200); x.lineTo(1300, 700);
    x.quadraticCurveTo(1100, 760, 1080, 900); x.lineTo(960, 1010); x.quadraticCurveTo(900, 1080, 760, 1050); x.lineTo(700, 1150); x.quadraticCurveTo(560, 1180, 420, 1120); x.quadraticCurveTo(250, 1100, 100, 980); x.lineTo(-200, 900); x.fill();
    x.strokeStyle = "rgba(90,90,90,0.5)"; x.lineWidth = 14; x.beginPath(); x.moveTo(900, -100); x.quadraticCurveTo(1100, 300, 1180, 700); x.stroke();
    x.fillStyle = "rgba(255,255,255,0.7)"; x.beginPath(); x.arc(690, 640, 6 + 3 * Math.sin(u * 2), 0, 7); x.fill();
  });
  grainy(x, "#000", 0.35, 3); grainy(x, "#888", 0.25, 4);
  L(1, () => {
    x.save(); x.fillStyle = "#b5161e"; x.translate(820, 1880);
    x.beginPath(); x.moveTo(-90, 0); x.lineTo(-90, -320); x.quadraticCurveTo(-70, -380, 0, -390); x.quadraticCurveTo(70, -380, 80, -320); x.lineTo(80, 0); x.fill();
    x.beginPath(); x.ellipse(-5, -470, 70, 80, -0.4, 0, 7); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(-30, -500, 5, 0, 7); x.fill(); x.restore();
  });
};

// 7. Looking up between black towers into a red sky; three figures.
S["red-towers"] = (x, u, L) => {
  x.fillStyle = R; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#1a0606"; x.beginPath(); x.moveTo(380, 300); x.lineTo(470, 280); x.lineTo(500, 1800); x.lineTo(430, 1800); x.fill(); x.beginPath(); x.moveTo(610, 280); x.lineTo(700, 300); x.lineTo(650, 1800); x.lineTo(580, 1800); x.fill(); });
  L(0.7, () => {
    x.fillStyle = K; x.beginPath(); x.moveTo(-200, -200); x.lineTo(260, -200); x.lineTo(480, 1820); x.lineTo(-200, 1900); x.fill();
    x.beginPath(); x.moveTo(820, -200); x.lineTo(1300, -200); x.lineTo(1300, 1900); x.lineTo(600, 1820); x.fill();
    x.strokeStyle = "rgba(227,24,45,0.3)"; x.lineWidth = 2;
    for (let i = 0; i < 30; i++) { const t = i / 30; x.beginPath(); x.moveTo(-200 + t * 460, -200); x.lineTo(-200 + t * 680, 1880); x.stroke(); x.beginPath(); x.moveTo(820 + t * 480, -200); x.lineTo(600 + t * 700, 1860); x.stroke(); }
  });
  x.fillStyle = K; x.fillRect(-200, 1820, W + 400, 300);
  L(1, () => { fig(x, 470, 1830, 140, K, { hat: false }); fig(x, 540, 1830, 150, K, { hat: false }); fig(x, 610, 1830, 140, K, { hat: false }); });
  grainy(x, K, 0.3, 8);
};

// 8. A vertical slit of light, half a red sun, a figure walking out of it.
S.slit = (x, u, L) => {
  x.fillStyle = "#0d0b0c"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { x.save(); x.beginPath(); x.rect(-200, -200, 905, H + 400); x.clip(); x.fillStyle = R; x.beginPath(); x.arc(705, 1000, 250, 0, 7); x.fill(); x.restore(); });
  L(0.5, () => {
    x.fillStyle = lin(x, -200, 1580, [[0, "#6f6d62"], [0.6, "#cdb98a"], [1, "#ffd27a"]]); x.fillRect(705, -200, 100, 1780);
    x.fillStyle = "#151313"; x.fillRect(-200, 1580, W + 400, 600);
    x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 1580, 1950, [[0, "rgba(255,210,122,0.6)"], [1, "rgba(255,210,122,0)"]]); x.fillRect(705, 1580, 100, 400); x.restore();
  });
  L(0.9, () => { const fy = 1580 + Math.min(1, u / 8) * 20; fig(x, 755, fy, 210, K, { hat: false, walk: u * 2.4 }); x.save(); x.globalAlpha = 0.35; x.scale(1, -1); fig(x, 755, -fy - 2, 210, "#000", { hat: false, walk: u * 2.4 }); x.restore(); });
};

// 9. A red sun behind two stands of tall thin trees; a tiny figure on snow.
S["sun-trees"] = (x, u, L) => {
  x.fillStyle = lin(x, 0, H, [[0, "#b9bcbb"], [0.8, "#d8d8d4"], [1, "#e9e9e4"]]); x.fillRect(-200, -200, W + 400, H + 400);
  L(0.2, () => { x.fillStyle = R; x.beginPath(); x.arc(540, 1080, 400, 0, 7); x.fill(); });
  x.fillStyle = lin(x, 1500, H, [[0, "#e4e4df"], [1, "#f4f4f0"]]); x.fillRect(-200, 1500, W + 400, 600);
  L(0.6, () => {
    const r = rng(41);
    for (const [c0, c1] of [[110, 470], [610, 960]]) for (let i = 0; i < 16; i++) {
      const tx = c0 + r() * (c1 - c0), top = 180 + r() * 350, w = 3 + r() * 6, side = tx < 540 ? -1 : 1;
      x.fillStyle = "#2b2b2b"; x.fillRect(tx, top, w, 1520 - top);
      x.strokeStyle = "rgba(40,40,40,0.55)"; x.lineWidth = 1.5;
      for (let b = 0; b < 14; b++) { const by = top + b * 40 + r() * 20, len = 30 + r() * 80 * (1 - b / 20); x.beginPath(); x.moveTo(tx + w / 2, by); x.lineTo(tx + w / 2 + (r() < 0.5 ? -1 : 1) * len, by - len * 0.7); x.stroke(); }
      x.fillStyle = "rgba(60,60,60,0.22)"; x.beginPath(); x.moveTo(tx, 1520); x.lineTo(tx + 400 * side, 1700); x.lineTo(tx + 8 + 400 * side, 1705); x.lineTo(tx + w, 1520); x.fill();
    }
  });
  L(1, () => fig(x, 540, 1530 + u * 2, 90, K, { hat: false }));
};
})();
