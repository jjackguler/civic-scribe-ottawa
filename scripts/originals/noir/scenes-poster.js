// Code-drawn scenes for The Sir Jack Files, case 02, in a screen-printed poster style:
// ink black, signal red, cream paper and mustard yellow, risograph speckle, tiny figures
// under immense shapes, long-nosed caricature faces. Same contract as scenes.js: one
// function per shot id, (ctx, u seconds into the shot, L(depth, fn) parallax layer).
(() => {
const W = 1080, H = 1920;
const P = { ink: "#0b0b0c", ink2: "#1a1a1c", red: "#d8231f", red2: "#a8140f", red3: "#ff3b2e", cream: "#ece3cf", cream2: "#d9cfb6", mustard: "#f3c315", mustard2: "#c99a0c", orange: "#f26a1b", orange2: "#c9480c", grey: "#8c8b86", slate: "#202427", white: "#f5f1e8" };
const rng = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const lin = (x, y0, y1, stops, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rad = (x, cx, cy, r, stops) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, p)));
const fill = (x, col) => { x.fillStyle = col; x.fillRect(-300, -300, W + 600, H + 600); };
function glow(x, cx, cy, r, col, a = 1) { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = rad(x, cx, cy, r, [[0, rgba(col, a)], [1, rgba(col, 0)]]); x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore(); }
function poly(x, pts, col) { x.fillStyle = col; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill(); }

// Risograph speckle: a fixed dot plate laid over a shape or the whole frame.
let speck;
function speckle(x, a = 0.35, col = "#000", seed = 3) {
  if (!speck) {
    speck = {};
  }
  const key = col + seed;
  if (!speck[key]) {
    const c = document.createElement("canvas"); c.width = W + 400; c.height = H + 400;
    const g = c.getContext("2d"), r = rng(seed); g.fillStyle = col;
    for (let i = 0; i < 26000; i++) { const s = r() < 0.92 ? 1 + r() * 1.6 : 2.5 + r() * 4; g.globalAlpha = 0.25 + r() * 0.75; g.beginPath(); g.arc(r() * c.width, r() * c.height, s, 0, 7); g.fill(); }
    speck[key] = c;
  }
  x.save(); x.globalAlpha = a; x.drawImage(speck[key], -200, -200); x.restore();
}

// Anonymous figure, feet at (fx, fy), height h.
function figure(x, fx, fy, h, { col = P.ink, hat = true, coat = 1, walk = null, bob = false, umbrella = false, phone = false } = {}) {
  x.save(); x.fillStyle = col; x.translate(fx, fy);
  const sw = walk == null ? 0 : Math.sin(walk) * h * 0.05;
  if (walk != null) x.translate(0, -Math.abs(Math.cos(walk)) * h * 0.01);
  x.beginPath(); x.moveTo(-h * 0.06, -h * 0.4); x.lineTo(-h * 0.065 + sw, 0); x.lineTo(-h * 0.015 + sw, 0); x.lineTo(0, -h * 0.38); x.fill();
  x.beginPath(); x.moveTo(h * 0.06, -h * 0.4); x.lineTo(h * 0.065 - sw, 0); x.lineTo(h * 0.015 - sw, 0); x.lineTo(0, -h * 0.38); x.fill();
  const hem = -h * (0.36 - 0.18 * (coat - 1));
  x.beginPath(); x.moveTo(-h * 0.1, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.16 * coat - sw * 0.3, hem);
  x.lineTo(h * 0.16 * coat + sw * 0.3, hem); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.1, -h * 0.82); x.quadraticCurveTo(0, -h * 0.86, -h * 0.1, -h * 0.82); x.fill();
  x.beginPath(); x.ellipse(0, -h * 0.885, h * 0.05, h * 0.06, 0, 0, 7); x.fill();
  if (bob) { x.beginPath(); x.ellipse(0, -h * 0.9, h * 0.075, h * 0.07, 0, Math.PI, 0); x.fill(); x.fillRect(-h * 0.075, -h * 0.9, h * 0.15, h * 0.06); }
  if (hat) { x.beginPath(); x.ellipse(0, -h * 0.925, h * 0.09, h * 0.017, 0, 0, 7); x.fill(); x.fillRect(-h * 0.052, -h * 0.98, h * 0.104, h * 0.058); }
  if (umbrella) { x.beginPath(); x.moveTo(-h * 0.36, -h * 1.02); x.quadraticCurveTo(0, -h * 1.42, h * 0.36, -h * 1.02); x.quadraticCurveTo(h * 0.24, -h * 1.07, h * 0.12, -h * 1.02); x.quadraticCurveTo(0, -h * 1.08, -h * 0.12, -h * 1.02); x.quadraticCurveTo(-h * 0.24, -h * 1.07, -h * 0.36, -h * 1.02); x.fill(); x.fillRect(-h * 0.008, -h * 1.22, h * 0.016, h * 0.4); }
  if (phone) { x.fillRect(h * 0.04, -h * 0.82, h * 0.05, h * 0.06); x.beginPath(); x.moveTo(h * 0.08, -h * 0.66); x.lineTo(h * 0.03, -h * 0.79); x.lineTo(h * 0.07, -h * 0.81); x.lineTo(h * 0.12, -h * 0.68); x.fill(); }
  x.restore();
}

// Long-nosed caricature head, centre of the chin at (cx, cy), head height s.
function face(x, cx, cy, s, o = {}) {
  const { skin = P.orange, shade = P.orange2, hair = P.ink, nose = "#fff3e6", beard = false, glasses = false, shades = false, curls = false, mous = false, look = 0, blink = 0, frown = 0.5, seed = 1 } = o;
  const w = s * 0.42;
  x.save(); x.translate(cx, cy);
  // neck and shoulders
  x.fillStyle = shade; x.beginPath(); x.moveTo(-w * 1.6, s * 0.6); x.quadraticCurveTo(-w * 1.5, s * 0.05, -w * 0.55, -s * 0.02); x.lineTo(w * 0.55, -s * 0.02); x.quadraticCurveTo(w * 1.5, s * 0.05, w * 1.6, s * 0.6); x.fill();
  x.fillStyle = skin; x.beginPath(); x.moveTo(-w * 1.5, s * 0.6); x.quadraticCurveTo(-w * 1.35, s * 0.12, -w * 0.45, s * 0.02); x.lineTo(w * 0.1, s * 0.02); x.lineTo(-w * 0.2, s * 0.6); x.fill();
  // head: tall rounded slab
  x.fillStyle = skin; x.beginPath(); x.moveTo(-w * 0.55, 0); x.quadraticCurveTo(-w * 0.62, -s * 0.5, -w * 0.5, -s * 0.9); x.quadraticCurveTo(0, -s * 1.02, w * 0.5, -s * 0.9); x.quadraticCurveTo(w * 0.62, -s * 0.5, w * 0.55, 0); x.quadraticCurveTo(0, s * 0.08, -w * 0.55, 0); x.fill();
  x.fillStyle = shade; x.beginPath(); x.moveTo(w * 0.15, -s * 0.95); x.quadraticCurveTo(w * 0.6, -s * 0.9, w * 0.58, -s * 0.4); x.quadraticCurveTo(w * 0.62, -s * 0.1, w * 0.55, 0); x.quadraticCurveTo(w * 0.3, s * 0.05, w * 0.2, s * 0.03); x.quadraticCurveTo(w * 0.42, -s * 0.4, w * 0.15, -s * 0.95); x.fill();
  // ears
  x.fillStyle = shade; for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(sx * w * 0.6, -s * 0.5, w * 0.1, s * 0.09, 0, 0, 7); x.fill(); }
  // hair
  x.fillStyle = hair;
  if (curls) { const r = rng(seed); for (let i = 0; i < 16; i++) { const a = Math.PI * (1.05 + i / 16 * 0.9); x.beginPath(); x.arc(Math.cos(a) * w * 0.55, -s * 0.86 + Math.sin(a) * s * 0.14, w * (0.13 + r() * 0.06), 0, 7); x.fill(); } }
  else { x.beginPath(); x.moveTo(-w * 0.6, -s * 0.66); x.quadraticCurveTo(-w * 0.6, -s * 1.06, w * 0.05, -s * 1.02); x.quadraticCurveTo(w * 0.62, -s * 1.0, w * 0.6, -s * 0.7); x.quadraticCurveTo(w * 0.3, -s * 0.9, -w * 0.1, -s * 0.84); x.quadraticCurveTo(-w * 0.4, -s * 0.82, -w * 0.6, -s * 0.66); x.fill(); }
  // eyes
  const ey = -s * 0.6, ex = w * 0.24, er = w * 0.15;
  for (const sx of [-1, 1]) {
    x.save(); x.translate(sx * ex, ey);
    x.fillStyle = "rgba(0,0,0,0.25)"; x.beginPath(); x.ellipse(0, er * 0.35, er * 1.25, er * 1.0, 0, 0, 7); x.fill(); // bags
    if (shades) { x.fillStyle = P.ink; x.beginPath(); x.ellipse(0, 0, er * 1.4, er * 1.05, 0, 0, 7); x.fill(); x.strokeStyle = P.white; x.lineWidth = s * 0.012; x.stroke(); x.fillStyle = "rgba(255,255,255,0.22)"; x.beginPath(); x.ellipse(-er * 0.4, -er * 0.3, er * 0.5, er * 0.25, -0.4, 0, 7); x.fill(); }
    else {
      x.fillStyle = P.white; x.beginPath(); x.ellipse(0, 0, er, er * 0.85 * (1 - blink), 0, 0, 7); x.fill();
      if (blink < 0.8) { x.fillStyle = P.ink; x.beginPath(); x.arc(look * er * 0.45, er * 0.1, er * 0.42, 0, 7); x.fill(); }
      x.fillStyle = skin; x.fillRect(-er * 1.2, -er * 1.1, er * 2.4, er * (0.55 + blink * 0.9)); // heavy lid
      x.strokeStyle = P.ink; x.lineWidth = s * 0.012; x.beginPath(); x.moveTo(-er * 1.05, -er * 0.55 + blink * er * 0.9); x.lineTo(er * 1.05, -er * 0.55 + blink * er * 0.9); x.stroke();
      if (glasses) { x.lineWidth = s * 0.01; x.beginPath(); x.arc(0, 0, er * 1.35, 0, 7); x.stroke(); }
    }
    // brow
    x.fillStyle = hair; x.beginPath(); x.moveTo(-er * 1.3, -er * (1.3 + sx * frown * 0.3)); x.lineTo(er * 1.3, -er * (1.3 - sx * frown * 0.3)); x.lineTo(er * 1.3, -er * (1.05 - sx * frown * 0.3)); x.lineTo(-er * 1.3, -er * (1.05 + sx * frown * 0.3)); x.fill();
    x.restore();
  }
  if (glasses && !shades) { x.strokeStyle = P.ink; x.lineWidth = s * 0.01; x.beginPath(); x.moveTo(-ex + er * 1.35, ey); x.lineTo(ex - er * 1.35, ey); x.stroke(); }
  // nose: a long pale wedge
  x.fillStyle = nose; x.beginPath(); x.moveTo(-w * 0.03, -s * 0.66); x.lineTo(w * 0.04, -s * 0.66); x.lineTo(w * 0.1, -s * 0.24); x.lineTo(-w * 0.12, -s * 0.24); x.closePath(); x.fill();
  x.fillStyle = shade; x.beginPath(); x.moveTo(w * 0.04, -s * 0.66); x.lineTo(w * 0.1, -s * 0.24); x.lineTo(w * 0.18, -s * 0.25); x.closePath(); x.fill();
  // mouth, moustache, beard
  if (beard) { const r = rng(seed + 9); x.strokeStyle = P.ink; x.lineWidth = s * 0.008; for (let i = 0; i < 60; i++) { const bx = -w * 0.45 + r() * w * 0.9, by = -s * 0.2 + r() * s * 0.18; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + (r() - 0.5) * 4, by + s * (0.04 + r() * 0.08)); x.stroke(); } x.fillStyle = "rgba(11,11,12,0.55)"; x.beginPath(); x.moveTo(-w * 0.48, -s * 0.22); x.quadraticCurveTo(0, -s * 0.1, w * 0.48, -s * 0.22); x.quadraticCurveTo(w * 0.4, s * 0.04, 0, s * 0.06); x.quadraticCurveTo(-w * 0.4, s * 0.04, -w * 0.48, -s * 0.22); x.fill(); }
  if (mous) { x.fillStyle = P.ink; x.beginPath(); x.moveTo(-w * 0.28, -s * 0.16); x.quadraticCurveTo(0, -s * 0.24, w * 0.28, -s * 0.16); x.quadraticCurveTo(0, -s * 0.19, -w * 0.28, -s * 0.16); x.fill(); }
  x.strokeStyle = P.ink; x.lineWidth = s * 0.014; x.beginPath(); x.moveTo(-w * 0.16, -s * 0.13 + frown * s * 0.02); x.quadraticCurveTo(0, -s * 0.13 - frown * s * 0.03, w * 0.16, -s * 0.13 + frown * s * 0.02); x.stroke();
  x.restore();
}
const blinkAt = (u, k) => { const p = ((u + hash(k) * 4) % 3.7) / 3.7; return p > 0.95 ? Math.sin((p - 0.95) / 0.05 * Math.PI) : 0; };

const S = window.NOIR_SCENES;

// 1. A slit of light in the dark, a red moon behind it, one man walking in.
S.slit = (x, u, L) => {
  fill(x, P.ink);
  x.fillStyle = lin(x, 0, H, [[0, "#121112"], [0.7, "#0a0a0b"], [1, "#050505"]]); x.fillRect(-300, -300, W + 600, H + 600);
  L(0.15, () => {
    const cy = 760 - u * 5;
    x.fillStyle = rad(x, 470, cy - 60, 300, [[0, "#e12a22"], [1, "#9a1410"]]); x.beginPath(); x.arc(500, cy, 250, 0, 7); x.fill();
    x.save(); x.beginPath(); x.arc(500, cy, 250, 0, 7); x.clip(); speckle(x, 0.28, "#3a0503", 5); x.restore();
  });
  L(0.5, () => {
    x.fillStyle = lin(x, 0, 1500, [[0, "#3c3a35"], [0.55, "#9d9583"], [0.85, "#e9cf98"], [1, "#ffe2a6"]]); x.fillRect(560, -200, 96, 1700);
    glow(x, 608, 1450, 380, "#f6c66b", 0.35);
  });
  x.fillStyle = lin(x, 1500, H, [[0, "#141313"], [1, "#030303"]]); x.fillRect(-300, 1500, W + 600, 800);
  L(0.6, () => { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 1500, H, [[0, "rgba(246,198,107,0.55)"], [1, "rgba(246,198,107,0)"]]); x.beginPath(); x.moveTo(560, 1500); x.lineTo(656, 1500); x.lineTo(700, H); x.lineTo(520, H); x.fill(); x.restore(); });
  L(0.9, () => {
    const s = 1 + Math.min(1, Math.max(0, u) / 8) * 0.06;
    figure(x, 610, 1500, 190 * s, { walk: u * 2.2, hat: false });
    x.save(); x.globalAlpha = 0.35; x.translate(0, 3000); x.scale(1, -1); figure(x, 610, 1500, 190 * s, { walk: u * 2.2, hat: false, col: "#000" }); x.restore();
  });
  speckle(x, 0.18, "#000", 11);
};

// 2. Isometric black tower on mustard ground, rain, an umbrella and a taxi.
S.building = (x, u, L) => {
  fill(x, P.mustard);
  x.fillStyle = lin(x, 0, 900, [[0, "rgba(40,30,0,0.75)"], [1, "rgba(40,30,0,0)"]], 0, 700); x.fillRect(-300, -300, 1100, 1300);
  speckle(x, 0.22, "#3a2a00", 7);
  L(0.6, () => {
    // ground shadow, sidewalk line
    poly(x, [[505, 1395], [1160, 1015], [1400, 1700], [900, 2100]], "rgba(20,16,8,0.88)");
    x.strokeStyle = "rgba(30,24,8,0.55)"; x.lineWidth = 5; x.beginPath(); x.moveTo(120, 1180); x.lineTo(140, 1220); x.lineTo(640, 1520); x.lineTo(1300, 1900); x.stroke();
    // faces
    poly(x, [[240, -400], [505, -250], [505, 1395], [240, 1245]], "#232326");
    poly(x, [[505, -250], [1200, -650], [1200, 995], [505, 1395]], "#121214");
    x.save(); x.beginPath(); x.moveTo(240, -400); x.lineTo(505, -250); x.lineTo(505, 1395); x.lineTo(240, 1245); x.clip(); speckle(x, 0.5, "#000", 13); x.restore();
    // windows, lit and unlit, along the isometric rows
    const lit = (i, j) => hash(i * 17 + j * 5) < 0.62 || (i === 2 && j === 6 && u > 1.2);
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 3; i++) { // left face
        const x0 = 270 + i * 80, y0 = 40 + j * 150 + (x0 - 240) * 0.566;
        poly(x, [[x0, y0], [x0 + 44, y0 + 25], [x0 + 44, y0 + 120], [x0, y0 + 95]], lit(i + 10, j) ? P.mustard : "#2c2c30");
      }
      for (let i = 0; i < 6; i++) { // right face
        const x0 = 560 + i * 105, y0 = 20 + j * 150 - (x0 - 505) * 0.575;
        const on = lit(i, j), fl = on && hash(i * 3 + j) > 0.9 ? 0.75 + 0.25 * Math.sin(u * 7 + i) : 1;
        x.globalAlpha = fl; poly(x, [[x0, y0], [x0 + 52, y0 - 30], [x0 + 52, y0 + 76], [x0, y0 + 106]], on ? "#f8c718" : "#1c1c1f"); x.globalAlpha = 1;
      }
    }
    poly(x, [[400, 1160], [470, 1200], [470, 1360], [400, 1320]], "#0a0a0a"); // door
    poly(x, [[408, 1166], [462, 1198], [462, 1214], [408, 1182]], P.mustard);
  });
  L(1, () => {
    const t = Math.max(0, u);
    figure(x, 300 + t * 9, 1640 - t * 5, 150, { walk: t * 3, umbrella: true });
    poly(x, [[300 + t * 9 - 10, 1640 - t * 5], [300 + t * 9 + 40, 1640 - t * 5], [380 + t * 9, 1760 - t * 5], [330 + t * 9, 1770 - t * 5]], "rgba(20,16,8,0.4)");
    // taxi
    x.save(); x.translate(160 + t * 16, 1830 - t * 9); x.rotate(-0.52);
    x.fillStyle = "rgba(20,16,8,0.45)"; x.fillRect(-20, 30, 300, 90);
    x.fillStyle = P.ink; x.beginPath(); x.roundRect(0, 0, 280, 110, 26); x.fill();
    x.fillStyle = "#f0d060"; x.beginPath(); x.roundRect(60, 10, 150, 60, 16); x.fill();
    x.fillStyle = "#1c1c1f"; x.fillRect(80, 20, 50, 38); x.fillRect(140, 20, 50, 38);
    x.restore();
    // lamp post
    x.fillStyle = P.ink; x.fillRect(978, 1460, 9, 380); x.beginPath(); x.roundRect(966, 1420, 33, 46, 8); x.fill(); glow(x, 982, 1442, 70, "#ffe08a", 0.6);
  });
};

// 3. A man on a high balcony against a slab of yellow light, reading his phone.
S.balcony = (x, u, L) => {
  fill(x, "#1c2023");
  L(0.2, () => {
    x.fillStyle = lin(x, 0, H, [[0, "#2a2f33"], [1, "#121517"]]); x.fillRect(-300, -300, 1200, H + 600);
    for (const [lx, wd, a] of [[60, 3, 0.8], [150, 2, 0.6], [215, 2, 0.5], [500, 3, 0.7], [540, 2, 0.4]]) { const len = H * Math.min(1, 0.4 + Math.max(0, u) * 0.12 + hash(lx) * 0.4); x.fillStyle = rgba(P.mustard, a); x.fillRect(lx, -200, wd, len); }
    x.fillStyle = rgba(P.mustard, 0.8); x.fillRect(290, 960, 70, 3); x.fillRect(250, 1080, 3, 200);
  });
  L(0.45, () => {
    x.fillStyle = lin(x, 0, H, [[0, "#f3c315"], [1, "#e8b00c"]]); x.fillRect(745, -300, 180, 1650); x.fillStyle = "#050505"; x.fillRect(925, -300, 400, H + 600);
    x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = "rgba(255,240,200,0.05)";
    for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(140 + k * 160, -100); x.lineTo(260 + k * 160, -100); x.lineTo(820, 1300); x.lineTo(720, 1300); x.fill(); }
    x.restore();
  });
  L(0.9, () => {
    poly(x, [[420, 1330], [1080, 1330], [1080, 2100], [420, 2100]], "#060606");
    poly(x, [[420, 1330], [1080, 1330], [1080, 1250], [520, 1250]], "#3a3320");
    x.fillStyle = rgba(P.mustard, 0.85); x.fillRect(420, 1328, 660, 4);
    x.strokeStyle = "#0a0a0a"; x.lineWidth = 6; x.beginPath(); x.moveTo(430, 1330); x.lineTo(430, 1150); x.lineTo(1020, 1150); x.moveTo(430, 1190); x.lineTo(1020, 1190); x.stroke();
    x.lineWidth = 3; for (let k = 0; k < 13; k++) { x.beginPath(); x.moveTo(470 + k * 45, 1150); x.lineTo(470 + k * 45, 1330); x.stroke(); }
    x.strokeStyle = rgba(P.mustard, 0.7); x.lineWidth = 2; x.beginPath(); x.moveTo(430, 1150); x.lineTo(1020, 1150); x.stroke();
    figure(x, 850, 1300, 380, { phone: true });
    const ping = Math.max(0, 1 - Math.abs(u - 0.5) / 0.5), lit = 0.55 + 0.45 * ping;
    glow(x, 880, 1000, 120 + ping * 60, "#cfe6ff", 0.35 * lit);
    x.fillStyle = rgba("#e6f2ff", 0.85 * lit); x.fillRect(866, 985, 14, 20);
  });
  speckle(x, 0.16, "#000", 21);
};

// 4. The meeting: a wall of orange caricature colleagues on black, with a hairline glitch.
S.faces = (x, u, L) => {
  fill(x, P.ink);
  const crowd = [
    { cx: 110, cy: 1430, s: 560, curls: false, frown: 0.6, seed: 2 },
    { cx: 975, cy: 1450, s: 540, curls: true, frown: 0.2, seed: 4, glasses: true },
    { cx: 310, cy: 1560, s: 600, beard: true, frown: 0.4, seed: 5 },
    { cx: 775, cy: 1550, s: 620, mous: true, frown: 0.7, seed: 6 },
    { cx: 540, cy: 1700, s: 740, curls: true, beard: true, shades: true, frown: 0.3, seed: 7 },
  ];
  crowd.forEach((f, k) => L(0.35 + k * 0.12, () => {
    const bob = Math.sin(u * 1.3 + k * 1.7) * 6;
    face(x, f.cx, f.cy + bob, f.s, { ...f, blink: blinkAt(u, k), look: Math.sin(u * 0.6 + k) * 0.6 });
  }));
  // the call is not what it seems: a slice of the picture slips now and then
  const g = Math.floor(u * 10);
  if (u > 1.5 && hash(g * 1.7) > 0.8) {
    const y = 500 + hash(g) * 1200, h = 20 + hash(g + 1) * 60;
    x.save(); x.globalCompositeOperation = "difference"; x.fillStyle = "rgba(60,200,255,0.5)"; x.fillRect(-300, y, W + 600, h); x.restore();
    x.fillStyle = "rgba(255,255,255,0.12)"; x.fillRect(-300, y + h, W + 600, 3);
  }
  x.fillStyle = P.red3; x.beginPath(); x.arc(70, 1040, 9 * (0.6 + 0.4 * Math.sin(u * 5)), 0, 7); x.fill();
  speckle(x, 0.2, "#000", 31);
};

// 5. A red wall of eyes, all turning to one small figure.
S.eyes = (x, u, L) => {
  fill(x, P.red);
  L(0.3, () => {
    const r = rng(41); x.strokeStyle = P.red2; x.lineCap = "round";
    for (let i = 0; i < 70; i++) { const y = r() * H, x0 = -200 + r() * 600; x.lineWidth = 3 + r() * 9; x.beginPath(); x.moveTo(x0, y); x.bezierCurveTo(x0 + 300, y - 60 + r() * 120, x0 + 700, y - 60 + r() * 120, x0 + 1300, y + r() * 60); x.stroke(); }
  });
  L(0.55, () => {
    const r = rng(51), tx = 540, ty = 1600;
    for (let j = 0; j < 9; j++) for (let i = 0; i < 4; i++) {
      const ex = 120 + i * 280 + (j % 2) * 140 + (r() - 0.5) * 80, ey = 90 + j * 175 + (r() - 0.5) * 50, s = 70 + r() * 70;
      if (ey > 1350 && Math.abs(ex - 540) < 260) continue;
      const k = i + j * 4, open = Math.min(1, Math.max(0, (u - k * 0.05) / 0.5)), bl = blinkAt(u * 1.3, k + 9), lid = open * (1 - bl);
      x.save(); x.translate(ex, ey);
      x.fillStyle = P.red2; x.beginPath(); x.ellipse(0, 0, s * 1.15, s * 0.62, 0, 0, 7); x.fill();
      x.fillStyle = "#e8e2d4"; x.beginPath(); x.ellipse(0, 0, s, s * 0.5 * lid + 0.1, 0, 0, 7); x.fill();
      if (lid > 0.2) {
        x.save(); x.beginPath(); x.ellipse(0, 0, s, s * 0.5 * lid, 0, 0, 7); x.clip();
        const a = Math.atan2(ty - ey, tx - ex), d = s * 0.32;
        x.fillStyle = "#5e6b78"; x.beginPath(); x.arc(Math.cos(a) * d, Math.sin(a) * d * 0.6, s * 0.42, 0, 7); x.fill();
        x.fillStyle = "#14181c"; x.beginPath(); x.arc(Math.cos(a) * d, Math.sin(a) * d * 0.6, s * 0.2, 0, 7); x.fill();
        x.fillStyle = "#fff"; x.beginPath(); x.arc(Math.cos(a) * d - s * 0.1, Math.sin(a) * d * 0.6 - s * 0.1, s * 0.06, 0, 7); x.fill();
        x.restore();
      }
      x.strokeStyle = "#14181c"; x.lineWidth = 4; x.beginPath(); x.ellipse(0, 0, s, s * 0.5 * lid + 0.5, 0, Math.PI, 0); x.stroke();
      x.restore();
    }
  });
  L(1, () => figure(x, 540, 1760, 430, { col: "#16202a", hat: false, bob: true }));
  speckle(x, 0.25, "#3a0503", 61);
};

// 6. The reveal: an immense ink shadow of a head leans down over a small red figure.
S.shadow = (x, u, L) => {
  fill(x, P.cream);
  speckle(x, 0.18, "#6b5f45", 71);
  L(0.4, () => {
    const drop = ease(Math.max(0, u) / 6) * 140;
    x.save(); x.translate(520, -120 + drop);
    const r = rng(73);
    x.fillStyle = P.ink; x.beginPath();
    // profile of a head and shoulders, upside down from the top edge: crown, brow, nose, lips, chin
    const pts = [[-700, -200], [-640, 420], [-520, 760], [-380, 980], [-160, 1110], [40, 1150], [150, 1120], [190, 1060], [240, 1080], [260, 1020], [220, 960], [300, 900], [250, 860], [330, 780], [280, 700], [250, 600], [330, 520], [280, 420], [330, 200], [420, 0], [700, -200]];
    pts.forEach(([a, b], i) => { const jx = a + (r() - 0.5) * 24, jy = b + (r() - 0.5) * 24; i ? x.lineTo(jx, jy) : x.moveTo(jx, jy); });
    x.closePath(); x.fill();
    for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(-600 + r() * 900, 300 + r() * 800, 6 + r() * 26, 0, 7); x.fill(); } // ragged ink edge
    // one cold eye opening
    const open = Math.min(1, Math.max(0, (u - 1.2) / 0.6));
    x.fillStyle = "#f4f1ea"; x.beginPath(); x.ellipse(150, 700, 34, 18 * open + 0.1, -0.3, 0, 7); x.fill();
    glow(x, 150, 700, 140, "#ffffff", 0.35 * open);
    x.restore();
  });
  L(1, () => {
    x.fillStyle = "rgba(40,30,20,0.25)"; x.beginPath(); x.ellipse(560, 1700, 70, 14, 0, 0, 7); x.fill();
    figure(x, 560, 1700, 190, { col: P.red, hat: false });
  });
};

// 7. The weapon: public clips turned into faces, built line by line in video tiles.
S.screens = (x, u, L) => {
  fill(x, "#2a2a2a");
  speckle(x, 0.35, "#000", 81);
  L(0.6, () => {
    const cols = 3, rows = 4, tw = 290, th = 300, ox = 540 - (cols * tw + 2 * 26) / 2, oy = 240;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = i + j * cols, tx = ox + i * (tw + 26), ty = oy + j * (th + 26);
      const p = Math.min(1, Math.max(0, (u - 0.25 - k * 0.22) / 1.4));
      x.save(); x.beginPath(); x.roundRect(tx, ty, tw, th, 14); x.clip();
      x.fillStyle = k % 3 === 1 ? "#141414" : "#1a0f0d"; x.fillRect(tx, ty, tw, th);
      // the face appears in scanned bands, top down
      x.save(); x.beginPath(); x.rect(tx, ty, tw, th * p); x.clip();
      face(x, tx + tw / 2, ty + th * 1.02, th * 0.78, { skin: k % 2 ? P.red : P.orange, shade: k % 2 ? P.red2 : P.orange2, beard: k % 4 === 1, glasses: k % 5 === 2, curls: k % 3 === 0, mous: k % 4 === 3, frown: hash(k), blink: blinkAt(u, k), seed: k + 3 });
      x.restore();
      if (p > 0 && p < 1) { x.fillStyle = "rgba(255,255,255,0.75)"; x.fillRect(tx, ty + th * p - 2, tw, 3); }
      if (p < 1) { x.strokeStyle = "rgba(255,255,255,0.12)"; x.lineWidth = 1; for (let g = 0; g < 8; g++) { x.beginPath(); x.moveTo(tx, ty + g * th / 8); x.lineTo(tx + tw, ty + g * th / 8); x.stroke(); x.beginPath(); x.moveTo(tx + g * tw / 8, ty); x.lineTo(tx + g * tw / 8, ty + th); x.stroke(); } }
      if (p === 0) { x.fillStyle = "rgba(255,255,255,0.55)"; x.beginPath(); x.moveTo(tx + tw / 2 - 18, ty + th / 2 - 24); x.lineTo(tx + tw / 2 + 26, ty + th / 2); x.lineTo(tx + tw / 2 - 18, ty + th / 2 + 24); x.fill(); }
      x.restore();
      x.strokeStyle = p === 1 ? rgba(P.red3, 0.8) : "rgba(255,255,255,0.18)"; x.lineWidth = 3; x.beginPath(); x.roundRect(tx, ty, tw, th, 14); x.stroke();
    }
  });
};

// 8. Red sky between black towers, three small figures at the bottom.
S.towers = (x, u, L) => {
  fill(x, P.red);
  x.fillStyle = lin(x, 0, H, [[0, "#ff4a32"], [0.6, "#d8231f"], [1, "#7d0d0a"]]); x.fillRect(-300, -300, W + 600, H + 600);
  speckle(x, 0.25, "#3a0503", 91);
  const tower = (pts, seed, d) => L(d, () => {
    poly(x, pts, P.ink);
    x.save(); x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.clip();
    const r = rng(seed); x.strokeStyle = "rgba(216,35,31,0.35)"; x.lineWidth = 2;
    for (let i = 0; i < 90; i++) { const yy = r() * H; x.beginPath(); x.moveTo(-100, yy); x.lineTo(W + 100, yy + (r() - 0.5) * 20); x.stroke(); }
    speckle(x, 0.4, "#000", seed); x.restore();
  });
  tower([[-300, -300], [120, -300], [380, 1820], [-300, 1820]], 93, 0.5);
  tower([[1380, -300], [960, -300], [700, 1820], [1380, 1820]], 95, 0.5);
  tower([[300, -300], [370, -300], [450, 1820], [415, 1820]], 97, 0.25);
  tower([[720, -300], [790, -300], [665, 1820], [630, 1820]], 99, 0.25);
  x.fillStyle = "#0a0a0a"; x.fillRect(-300, 1800, W + 600, 400);
  L(1, () => { for (const [fx, h] of [[490, 120], [540, 128], [592, 118]]) figure(x, fx, 1810, h, { hat: false }); });
};

// 9. Thin trees before an immense red sun on grey; one figure walks toward it.
S.trees = (x, u, L) => {
  fill(x, "#cfcfca");
  x.fillStyle = lin(x, 0, H, [[0, "#b9bab5"], [0.7, "#d6d6d1"], [1, "#f1f1ee"]]); x.fillRect(-300, -300, W + 600, H + 600);
  speckle(x, 0.14, "#555", 101);
  L(0.2, () => { x.fillStyle = rad(x, 500, 1040, 470, [[0, "#e8231d"], [1, "#c4140f"]]); x.beginPath(); x.arc(540, 1100, 460, 0, 7); x.fill(); x.save(); x.beginPath(); x.arc(540, 1100, 460, 0, 7); x.clip(); speckle(x, 0.2, "#4a0603", 103); x.restore(); });
  x.fillStyle = "#f4f4f2"; x.fillRect(-300, 1540, W + 600, 700);
  L(0.7, () => {
    const r = rng(107);
    for (const side of [-1, 1]) for (let k = 0; k < 12; k++) {
      const tx = 540 + side * (70 + k * 32 + r() * 18), top = 260 + r() * 240 + Math.abs(k - 6) * 22, sway = Math.sin(u * 0.9 + k) * 4;
      x.strokeStyle = k % 3 ? "#2b2b2b" : "#151515"; x.lineWidth = 3 + r() * 4; x.beginPath(); x.moveTo(tx, 1550); x.lineTo(tx + sway, top); x.stroke();
      x.lineWidth = 1.5; for (let b = 0; b < 16; b++) { const by = top + b * (1300 - top) / 16, bl = 20 + r() * 50; x.beginPath(); x.moveTo(tx + sway * (1 - b / 16), by); x.lineTo(tx + sway + side * (r() < 0.5 ? -1 : 1) * bl, by - bl * 0.8); x.stroke(); }
      x.fillStyle = "rgba(60,60,60,0.25)"; x.beginPath(); x.moveTo(tx - 3, 1550); x.lineTo(tx + 3, 1550); x.lineTo(tx + side * 400 + 6, 1920); x.lineTo(tx + side * 400 - 6, 1920); x.fill();
    }
  });
  L(1, () => { const t = Math.max(0, u); figure(x, 540, 1560 - t * 3, 70 - t * 0.6, { walk: t * 2.5, hat: false }); x.fillStyle = "rgba(0,0,0,0.3)"; x.fillRect(536, 1560 - t * 3, 8, 22); });
};

// 10. A red path up to a tower door on a cream sky; a figure climbs it.
S.redpath = (x, u, L) => {
  fill(x, P.cream);
  x.fillStyle = lin(x, 0, 1100, [[0, "#e4dab8"], [1, "#efe7cc"]]); x.fillRect(-300, -300, W + 600, 1500);
  L(0.1, () => { const r = rng(111); for (let i = 0; i < 18; i++) { x.fillStyle = `rgba(150,135,100,${0.06 + r() * 0.08})`; x.beginPath(); x.ellipse(r() * W + u * 4, 100 + r() * 700, 160 + r() * 260, 40 + r() * 60, 0, 0, 7); x.fill(); } });
  speckle(x, 0.14, "#6b5f45", 113);
  L(0.4, () => {
    poly(x, [[-300, 1180], [200, 900], [560, 880], [900, 980], [1380, 1100], [1380, 2200], [-300, 2200]], "#1b1b1b");
    poly(x, [[640, 1000], [1380, 1050], [1380, 2200], [760, 2200]], "#6d6a64"); x.save(); x.beginPath(); x.moveTo(640, 1000); x.lineTo(1380, 1050); x.lineTo(1380, 2200); x.lineTo(760, 2200); x.clip(); speckle(x, 0.7, "#111", 115); x.restore();
    // keep: dark block, lit terracotta face, tower
    poly(x, [[260, 720], [520, 650], [520, 1010], [260, 1040]], "#151515");
    poly(x, [[520, 650], [800, 700], [800, 1000], [520, 1010]], "#b06a45");
    poly(x, [[560, 330], [700, 300], [700, 1000], [560, 1000]], "#a45e3c");
    poly(x, [[470, 340], [560, 330], [560, 1000], [470, 1000]], "#141414");
    for (let k = 0; k < 5; k++) x.fillRect(470 + k * 46, 300, 26, 40);
    x.fillStyle = "#141414"; for (let k = 0; k < 3; k++) x.fillRect(630, 420 + k * 120, 16, 44);
    x.save(); x.beginPath(); x.moveTo(520, 650); x.lineTo(800, 700); x.lineTo(800, 1000); x.lineTo(520, 1010); x.clip(); speckle(x, 0.45, "#3a1d0f", 117); x.restore();
    x.fillStyle = "#0b0b0b"; x.fillRect(470, 870, 74, 140); x.fillStyle = P.red3; x.beginPath(); x.moveTo(486, 1010); x.lineTo(486, 905); x.arc(507, 905, 21, Math.PI, 0); x.lineTo(528, 1010); x.fill();
    glow(x, 507, 960, 120, "#ff3b2e", 0.25 + 0.1 * Math.sin(u * 2));
  });
  L(0.8, () => {
    x.fillStyle = lin(x, 1010, H, [[0, "#d61e1a"], [1, "#e9271f"]]); x.beginPath(); x.moveTo(470, 1010); x.lineTo(560, 1010); x.lineTo(1150, 2000); x.lineTo(-250, 2000); x.closePath(); x.fill();
    x.save(); x.beginPath(); x.moveTo(470, 1010); x.lineTo(560, 1010); x.lineTo(1150, 2000); x.lineTo(-250, 2000); x.clip(); speckle(x, 0.25, "#5a0805", 119);
    x.strokeStyle = "rgba(90,8,5,0.35)"; x.lineWidth = 2; for (const yy of [1200, 1420, 1650]) { x.beginPath(); x.moveTo(-200, yy); x.lineTo(1200, yy + 10); x.stroke(); } x.restore();
  });
  L(1, () => {
    const p = ease(Math.max(0, u) / 7), fy = 1820 - p * 380, fx = 230 + p * 170, h = 300 - p * 130;
    x.fillStyle = "rgba(60,0,0,0.45)"; x.beginPath(); x.moveTo(fx - 20, fy); x.lineTo(fx + 20, fy); x.lineTo(fx - 160, fy + 40); x.lineTo(fx - 200, fy + 30); x.fill();
    figure(x, fx, fy, h, { walk: u * 2, hat: false, coat: 1.25 });
  });
};
})();
