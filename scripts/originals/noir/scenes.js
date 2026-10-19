// Hand-drawn (code-drawn) noir scenes in a flat screen-print style, one per shot id.
// Each scene draws in layers; L(depth, fn) shifts a layer with the camera drift so near
// layers move more than far ones (parallax). Used when a shot has no generated still.
(() => {
const W = 1080, H = 1920;
const C = { ink: "#07090c", navy: "#0c1826", navy2: "#132a40", teal: "#12323b", blue: "#1d4a6e", haze: "#5f86a6", amber: "#f3a93a", amber2: "#ffd27a", gold: "#D7B54A", red: "#D9412B", red2: "#ff5a3c", paper: "#EFE8DA", snow: "#dfe6ea" };
const rng = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const lin = (x, y0, y1, stops, x0 = 0, x1 = 0) => { const g = x.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rad = (x, cx, cy, r, stops) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

function glow(x, cx, cy, r, col, a = 1) { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = rad(x, cx, cy, r, [[0, rgba(col, a)], [1, rgba(col, 0)]]); x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore(); }
function sky(x, stops) { x.fillStyle = lin(x, 0, H, stops); x.fillRect(-200, -200, W + 400, H + 400); }

// Anonymous figure, feet at (fx, fy), height h. walk: phase in radians (0 = still).
function person(x, fx, fy, h, { hat = true, walk = null, color = C.ink, facing = 0, phone = false } = {}) {
  x.save(); x.fillStyle = color; x.translate(fx, fy);
  const sw = walk == null ? 0 : Math.sin(walk) * h * 0.06, bob = walk == null ? 0 : Math.abs(Math.cos(walk)) * h * 0.012;
  x.translate(0, -bob);
  // legs
  x.beginPath(); x.moveTo(-h * 0.07, -h * 0.36); x.lineTo(-h * 0.075 + sw, 0); x.lineTo(-h * 0.02 + sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  x.beginPath(); x.moveTo(h * 0.07, -h * 0.36); x.lineTo(h * 0.075 - sw, 0); x.lineTo(h * 0.02 - sw, 0); x.lineTo(0, -h * 0.34); x.fill();
  // coat
  x.beginPath(); x.moveTo(-h * 0.11, -h * 0.82); x.quadraticCurveTo(-h * 0.15, -h * 0.55, -h * 0.17 - sw * 0.3, -h * 0.3);
  x.lineTo(h * 0.17 + sw * 0.3, -h * 0.3); x.quadraticCurveTo(h * 0.15, -h * 0.55, h * 0.11, -h * 0.82); x.quadraticCurveTo(0, -h * 0.86, -h * 0.11, -h * 0.82); x.fill();
  // head, collar
  x.beginPath(); x.ellipse(facing * h * 0.01, -h * 0.885, h * 0.052, h * 0.062, 0, 0, 7); x.fill();
  x.fillRect(-h * 0.035, -h * 0.84, h * 0.07, h * 0.04);
  if (hat) { x.beginPath(); x.ellipse(0, -h * 0.925, h * 0.095, h * 0.018, 0, 0, 7); x.fill(); x.fillRect(-h * 0.055, -h * 0.985, h * 0.11, h * 0.06); }
  if (phone) { x.fillRect(h * 0.03, -h * 0.9, h * 0.035, h * 0.09); x.beginPath(); x.moveTo(h * 0.1, -h * 0.8); x.lineTo(h * 0.04, -h * 0.86); x.lineTo(h * 0.06, -h * 0.9); x.lineTo(h * 0.13, -h * 0.82); x.fill(); }
  x.restore();
}
// Seated figure at a table, from the side.
function seated(x, fx, fy, h, color = C.ink, laptop = false) {
  x.save(); x.fillStyle = color; x.translate(fx, fy);
  x.beginPath(); x.ellipse(0, -h * 0.86, h * 0.07, h * 0.085, 0, 0, 7); x.fill();
  x.beginPath(); x.moveTo(-h * 0.12, -h * 0.74); x.quadraticCurveTo(-h * 0.16, -h * 0.4, -h * 0.12, -h * 0.3); x.lineTo(h * 0.16, -h * 0.3); x.lineTo(h * 0.24, -h * 0.5); x.lineTo(h * 0.1, -h * 0.74); x.fill();
  x.fillRect(-h * 0.14, -h * 0.3, h * 0.42, h * 0.06); x.fillRect(h * 0.2, -h * 0.3, h * 0.05, h * 0.3);
  x.fillRect(h * 0.26, -h * 0.42, h * 0.5, h * 0.035); x.fillRect(h * 0.68, -h * 0.4, h * 0.04, h * 0.4);
  if (laptop) { x.beginPath(); x.moveTo(h * 0.4, -h * 0.42); x.lineTo(h * 0.5, -h * 0.66); x.lineTo(h * 0.54, -h * 0.64); x.lineTo(h * 0.46, -h * 0.42); x.fill(); }
  x.restore();
}
function windowsGrid(x, bx, by, bw, bh, { cols, rows, gap = 0.35, lit = 0.25, seed = 1, warm = C.amber, u = 0, cool = null }) {
  const r = rng(seed), cw = bw / cols, rh = bh / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const on = r() < lit, wx = bx + i * cw + cw * gap / 2, wy = by + j * rh + rh * gap / 2, ww = cw * (1 - gap), wh = rh * (1 - gap);
    if (!on) { x.fillStyle = "rgba(0,0,0,0.25)"; x.fillRect(wx, wy, ww, wh); continue; }
    const tv = cool && r() < 0.2, fl = tv ? 0.75 + 0.25 * Math.sin(u * 9 + i * 3 + j) : 0.92 + 0.08 * hash(i * 31 + j);
    x.globalAlpha = fl; x.fillStyle = tv ? cool : warm; x.fillRect(wx, wy, ww, wh); x.globalAlpha = 1;
  }
}
function streaks(x, cx, y0, w, len, col, a) { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, y0, y0 + len, [[0, rgba(col, a)], [1, rgba(col, 0)]]); x.fillRect(cx - w / 2, y0, w, len); x.restore(); }
function pine(x, px, py, h, col) { x.fillStyle = col; x.beginPath(); for (let k = 0; k < 5; k++) { const yy = py - h + k * h * 0.2, ww = h * (0.12 + k * 0.07); x.moveTo(px, yy); x.lineTo(px - ww, yy + h * 0.28); x.lineTo(px + ww, yy + h * 0.28); } x.fill(); x.fillRect(px - h * 0.02, py - h * 0.05, h * 0.04, h * 0.05); }
function pole(x, px, by, h, col) { x.fillStyle = col; x.fillRect(px - h * 0.012, by - h, h * 0.024, h); x.fillRect(px - h * 0.09, by - h * 0.95, h * 0.18, h * 0.015); x.fillRect(px - h * 0.07, by - h * 0.9, h * 0.14, h * 0.012); }

const S = {};

S.city = (x, u, L) => {
  sky(x, [[0, "#0a1422"], [0.45, "#1a3a5c"], [0.62, "#35618a"], [1, "#0a1220"]]);
  L(0.15, () => { // far towers in haze
    const r = rng(7);
    for (let i = 0; i < 9; i++) { const bx = 300 + i * 60 + r() * 30, bw = 70 + r() * 60, top = 520 + r() * 300; x.fillStyle = `rgba(40,80,120,${0.5 + r() * 0.3})`; x.fillRect(bx, top, bw, 1200 - top);
      windowsGrid(x, bx, top, bw, 1150 - top, { cols: 4, rows: 30, lit: 0.12, seed: 40 + i, warm: "#ffcf6a" }); }
  });
  L(0.45, () => { // mid towers
    x.fillStyle = "#0e2236"; x.fillRect(-60, 260, 380, 1100); x.fillRect(800, 200, 340, 1160);
    windowsGrid(x, -40, 300, 340, 1000, { cols: 7, rows: 34, lit: 0.18, seed: 3 });
    windowsGrid(x, 820, 240, 300, 1080, { cols: 6, rows: 36, lit: 0.2, seed: 5 });
  });
  L(1, () => { // near walls
    x.fillStyle = C.ink; x.fillRect(-120, -100, 300, 1460); x.fillRect(930, -100, 300, 1460);
    for (let j = 0; j < 7; j++) { x.fillStyle = j % 3 ? "rgba(255,190,90,0.0)" : C.amber; x.fillRect(970, 160 + j * 170, 70, 110); }
    glow(x, 1005, 500, 260, C.amber, 0.25);
  });
  x.fillStyle = lin(x, -100, 760, [[0, "rgba(5,8,12,0.9)"], [0.75, "rgba(5,8,12,0.55)"], [1, "rgba(5,8,12,0)"]]); x.fillRect(-200, -100, W + 400, 860);
  // street + reflections
  x.fillStyle = lin(x, 1320, H, [[0, "#1b3550"], [1, "#05080c"]]); x.fillRect(-200, 1320, W + 400, 700);
  L(0.6, () => { const r = rng(9); for (let i = 0; i < 26; i++) streaks(x, 120 + r() * 840, 1330, 6 + r() * 14, 200 + r() * 420, r() < 0.7 ? C.amber2 : C.haze, 0.35); });
  glow(x, 540, 1260, 420, "#7fb0d6", 0.22);
  L(0.9, () => { const walkX = 560 - u * 6; person(x, walkX, 1400, 250, { walk: u * 3.4 }); x.save(); x.globalAlpha = 0.35; x.scale(1, -0.6); person(x, walkX, -1400 / 0.6 - 0, 250, { walk: u * 3.4, color: "#03050a" }); x.restore(); });
};

S.windows = (x, u, L) => {
  sky(x, [[0, "#0b2238"], [1, "#081522"]]);
  L(0.7, () => {
    x.fillStyle = "#11314d"; x.fillRect(-120, -120, W + 240, H + 240);
    const cols = 2, rows = 6, cw = 470, rh = 300, ox = 60, oy = 60;
    const scenes = { "0,0": "two", "1,1": "kitchen", "0,2": "reader", "1,2": "tv", "1,3": "kid", "0,4": "lamp", "1,5": "laptop" };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wx = ox + i * (cw + 40), wy = oy + j * rh, ww = cw - 60, wh = rh - 70, k = scenes[`${i},${j}`];
      x.fillStyle = "#0a1b2b"; x.fillRect(wx - 10, wy - 10, ww + 20, wh + 20);
      if (!k) { x.fillStyle = "#0d2235"; x.fillRect(wx, wy, ww, wh); x.fillStyle = "rgba(120,170,220,0.06)"; x.fillRect(wx, wy, ww / 2 - 3, wh); continue; }
      if (k === "tv") { x.fillStyle = `rgba(70,140,255,${0.55 + 0.25 * Math.sin(u * 11) * hash(Math.floor(u * 8))})`; x.fillRect(wx, wy, ww, wh); }
      else { x.fillStyle = lin(x, wy, wy + wh, [[0, "#ffcf6a"], [1, "#e8902a"]]); x.fillRect(wx, wy, ww, wh); }
      const fy = wy + wh;
      if (k === "two") { person(x, wx + 140, fy, 210, { hat: false }); person(x, wx + 260, fy, 205, { hat: false }); }
      if (k === "reader") seated(x, wx + 120, fy, 200);
      if (k === "laptop") seated(x, wx + 110, fy, 200, C.ink, true);
      if (k === "kitchen") { x.fillStyle = "rgba(60,30,10,0.55)"; x.fillRect(wx, fy - 70, ww, 70); x.fillRect(wx + 150, wy + 20, 120, 50); person(x, wx + 330, fy, 190, { hat: false }); }
      if (k === "kid") { person(x, wx + 260, fy, 200, { hat: false }); person(x, wx + 150, fy, 110, { hat: false }); }
      if (k === "lamp") { x.fillStyle = "rgba(40,20,5,0.6)"; x.fillRect(wx + 40, fy - 90, 140, 90); }
      x.fillStyle = "#0a1b2b"; x.fillRect(wx + ww / 2 - 4, wy, 8, wh); // mullion
      glow(x, wx + ww / 2, wy + wh / 2, 260, k === "tv" ? "#4c8dff" : C.amber, 0.18);
    }
  });
};

S.desk = (x, u, L) => {
  x.fillStyle = "#1a100a"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { const r = rng(4); x.strokeStyle = "rgba(0,0,0,0.35)"; x.lineWidth = 3; for (let i = 0; i < 40; i++) { const yy = r() * H; x.beginPath(); x.moveTo(-200, yy); x.bezierCurveTo(300, yy + 20, 700, yy - 20, W + 200, yy + 10); x.stroke(); } });
  // rain-blurred window light on the right
  x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 0, 0, [[0, "rgba(60,110,160,0)"], [1, "rgba(60,110,160,0.35)"]], 600, W); x.fillRect(600, 0, 480, H); x.restore();
  L(0.8, () => {
    // folder
    x.save(); x.translate(470, 1010); x.rotate(-0.08);
    x.fillStyle = "#b8925a"; x.fillRect(-300, -380, 600, 760); x.fillRect(-300, -420, 220, 60);
    x.fillStyle = "#cfa96a"; x.fillRect(-285, -365, 570, 730);
    x.fillStyle = C.paper; x.globalAlpha = 0.9; x.fillRect(-250, -300, 360, 90); x.globalAlpha = 1;
    x.fillStyle = "#3a2a18"; x.font = '44px "Special Elite"'; x.fillText("CASE 2016-R", -235, -240);
    x.strokeStyle = C.red; x.lineWidth = 6; x.strokeRect(-40, 160, 280, 110); x.fillStyle = C.red; x.font = '50px "Special Elite"'; x.fillText("COLD", 20, 235);
    x.fillStyle = "rgba(0,0,0,0.12)"; for (let i = 0; i < 9; i++) x.fillRect(-240, -160 + i * 40, 380 - (i % 3) * 60, 8);
    x.restore();
    // coffee
    x.fillStyle = "#e9e1d2"; x.beginPath(); x.arc(860, 1500, 95, 0, 7); x.fill(); x.fillStyle = "#2a160a"; x.beginPath(); x.arc(860, 1500, 75, 0, 7); x.fill();
    x.fillStyle = "#e9e1d2"; x.fillRect(945, 1480, 50, 40);
    // typewriter (top view)
    x.fillStyle = "#121212"; x.fillRect(140, 1540, 520, 300); x.fillStyle = "#1f1f1f"; x.fillRect(110, 1520, 580, 50);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) { x.fillStyle = "#d8d2c2"; x.beginPath(); x.arc(200 + k * 44 + r * 10, 1620 + r * 52, 15, 0, 7); x.fill(); }
    x.fillStyle = C.paper; x.fillRect(250, 1380, 300, 160);
  });
  L(1, () => { // lamp head and pool of light
    glow(x, 470, 760, 820, "#ffcf7a", 0.55);
    x.fillStyle = "#0f3b28"; x.beginPath(); x.ellipse(250, 300, 230, 120, -0.5, 0, 7); x.fill();
    x.fillStyle = "#c79a3a"; x.fillRect(80, 120, 26, 260);
  });
};

S.lightbox = (x, u, L) => {
  x.fillStyle = "#05090d"; x.fillRect(-200, -200, W + 400, H + 400);
  const on = u < 0.6 ? (Math.floor(u * 20) % 3 ? 0.2 : 1) : 1; // flicker on
  L(0.4, () => {
    for (let i = 0; i < 3; i++) {
      const bx = 110 + i * 300, by = 380, bw = 270, bh = 420;
      x.fillStyle = `rgba(200,225,240,${0.85 * on})`; x.fillRect(bx, by, bw, bh);
      x.save(); x.globalAlpha = on; x.fillStyle = "#1a2632"; x.fillRect(bx + 20, by + 20, bw - 40, bh - 40);
      x.strokeStyle = "rgba(235,245,250,0.75)"; x.lineWidth = 7; // ribs and spine
      x.beginPath(); x.moveTo(bx + bw / 2, by + 50); x.lineTo(bx + bw / 2, by + bh - 50); x.stroke();
      x.lineWidth = 6; for (let k = 0; k < 7; k++) { const yy = by + 90 + k * 38; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(bx + bw / 2, yy); x.quadraticCurveTo(bx + bw / 2 + s * 100, yy - 10, bx + bw / 2 + s * 95, yy + 40); x.stroke(); } }
      x.fillStyle = "rgba(235,245,250,0.18)"; x.beginPath(); x.ellipse(bx + bw / 2 - 50, by + 220, 55, 120, 0.1, 0, 7); x.ellipse(bx + bw / 2 + 50, by + 220, 55, 120, -0.1, 0, 7); x.fill();
      x.restore();
    }
    glow(x, 540, 590, 760, "#cfe6f5", 0.35 * on);
  });
  x.fillStyle = lin(x, 900, H, [[0, "#0b141c"], [1, "#020406"]]); x.fillRect(-200, 900, W + 400, H);
  L(0.6, () => { x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = lin(x, 900, 1500, [[0, `rgba(170,200,220,${0.25 * on})`], [1, "rgba(170,200,220,0)"]]); x.beginPath(); x.moveTo(110, 900); x.lineTo(1010, 900); x.lineTo(1200, 1500); x.lineTo(-100, 1500); x.fill(); x.restore(); });
  L(1, () => { // doctor from behind, large, lower centre
    x.fillStyle = "#020304"; x.save(); x.translate(560, 1960);
    x.beginPath(); x.ellipse(0, -1060, 88, 105, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-300, 0); x.quadraticCurveTo(-310, -760, -170, -900); x.quadraticCurveTo(0, -960, 170, -900); x.quadraticCurveTo(310, -760, 300, 0); x.fill();
    x.fillRect(-55, -990, 110, 110); x.restore();
    x.save(); x.globalCompositeOperation = "screen"; x.strokeStyle = `rgba(200,225,240,${0.3 * on})`; x.lineWidth = 5; x.beginPath(); x.ellipse(560, 900, 90, 106, 0, 3.6, 5.8); x.stroke(); x.restore();
  });
};

S.booth = (x, u, L) => {
  sky(x, [[0, "#0b1a1c"], [0.5, "#12302f"], [0.62, "#3a3a2a"], [1, "#07090a"]]);
  L(0.1, () => { x.fillStyle = "#ffb64a"; x.beginPath(); x.arc(760, 520, 70, 0, 7); x.fill(); glow(x, 760, 520, 260, "#ffb64a", 0.4);
    x.fillStyle = "rgba(10,25,25,0.7)"; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(600 + i * 120, 470 + (i % 2) * 70, 160, 22, 0, 0, 7); x.fill(); } });
  L(0.35, () => { x.fillStyle = "#0a1312"; for (let i = 0; i < 6; i++) x.fillRect(620 + i * 90, 820 - (i % 3) * 60, 80, 400); for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? C.amber : "rgba(0,0,0,0)"; x.fillRect(640 + i * 90, 900, 22, 30); }
    pole(x, 920, 1150, 700, "#0a1312"); x.strokeStyle = "#0a1312"; x.lineWidth = 3; x.beginPath(); x.moveTo(500, 520); x.quadraticCurveTo(720, 600, 920, 470); x.stroke();
    x.fillStyle = "#0a1312"; x.fillRect(880, 760, 10, 400); glow(x, 860, 760, 120, "#ffb64a", 0.6); });
  x.fillStyle = lin(x, 1150, H, [[0, "#162b2c"], [1, "#030505"]]); x.fillRect(-200, 1150, W + 400, 900);
  L(0.6, () => { // car with tail lights
    x.fillStyle = "#0b0f0f"; x.beginPath(); x.moveTo(720, 1210); x.lineTo(760, 1160); x.lineTo(900, 1160); x.lineTo(940, 1210); x.lineTo(960, 1250); x.lineTo(700, 1250); x.fill();
    x.fillStyle = C.red2; x.fillRect(710, 1222, 22, 10); x.fillRect(930, 1222, 22, 10); streaks(x, 720, 1255, 14, 300, C.red2, 0.5); streaks(x, 940, 1255, 14, 300, C.red2, 0.5);
    for (let i = 0; i < 10; i++) streaks(x, 600 + hash(i) * 400, 1260, 4 + hash(i + 3) * 10, 200 + hash(i + 5) * 300, C.amber, 0.25);
  });
  L(1, () => { // the booth
    const bx = 40, by = 360, bw = 470, bh = 1060;
    glow(x, bx + bw / 2, by + bh / 2, 700, "#ff8a2a", 0.35);
    x.fillStyle = lin(x, by, by + bh, [[0, "#ffb64a"], [1, "#e0701c"]]); x.fillRect(bx, by, bw, bh);
    person(x, bx + 210, by + bh - 40, 640, { hat: false, phone: true, color: "#1a0c04" });
    x.fillStyle = "#1a0c04"; x.fillRect(bx + 380, by + 340, 50, 120);
    x.fillStyle = "#120a06"; x.fillRect(bx - 20, by - 70, bw + 40, 80); x.fillRect(bx - 20, by, 26, bh); x.fillRect(bx + bw - 6, by, 26, bh); x.fillRect(bx + bw / 2 - 8, by, 16, bh); x.fillRect(bx, by + bh * 0.55, bw, 14); x.fillRect(bx - 20, by + bh, bw + 40, 30);
    x.fillStyle = C.amber; x.fillRect(bx + 60, by - 56, bw - 120, 50);
    x.fillStyle = "#1a0c04"; x.font = '700 40px "Schibsted Grotesk"'; x.textAlign = "center"; x.letterSpacing = "6px"; x.fillText("TELEPHONE", bx + bw / 2, by - 16); x.letterSpacing = "0px"; x.textAlign = "left";
    // light spilling on the wet sidewalk
    x.save(); x.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i++) { x.fillStyle = lin(x, by + bh + 30, H, [[0, "rgba(255,140,40,0.55)"], [1, "rgba(255,140,40,0)"]]); x.beginPath(); const s = bx + i * 160; x.moveTo(s, by + bh + 30); x.lineTo(s + 110, by + bh + 30); x.lineTo(s + 260 + i * 90, H + 100); x.lineTo(s + 40 + i * 90, H + 100); x.fill(); }
    x.restore();
  });
};

S["fog-light"] = (x, u, L) => {
  sky(x, [[0, "#1d2b2b"], [0.6, "#2c3b3a"], [1, "#0d1212"]]);
  L(0.2, () => { for (let i = 0; i < 8; i++) pine(x, -60 + i * 170 + (i % 2) * 40, 1120, 700 + (i % 3) * 200, "rgba(18,30,30,0.75)"); });
  L(0.35, () => { x.fillStyle = "rgba(25,30,30,0.85)"; x.fillRect(640, 900, 480, 260); x.fillStyle = "rgba(160,60,50,0.4)"; x.fillRect(660, 1020, 440, 30); });
  L(0.5, () => { // red street lamp cone
    x.fillStyle = "#151c1c"; x.fillRect(560, 700, 12, 450); x.fillRect(420, 700, 150, 10);
    x.save(); x.globalCompositeOperation = "screen"; x.filter = "blur(18px)"; x.fillStyle = lin(x, 710, 1180, [[0, "rgba(255,60,40,0.5)"], [1, "rgba(255,60,40,0)"]]);
    x.beginPath(); x.moveTo(410, 712); x.lineTo(440, 712); x.lineTo(700, 1180); x.lineTo(160, 1180); x.fill(); x.restore(); glow(x, 425, 715, 160, C.red2, 0.8);
  });
  x.fillStyle = lin(x, 1150, H, [[0, "#2b3434"], [1, "#0b0e0e"]]); x.fillRect(-200, 1150, W + 400, 900);
  L(0.8, () => {
    x.strokeStyle = "#c9a23a"; x.lineWidth = 10; x.beginPath(); x.moveTo(760, 1150); x.quadraticCurveTo(880, 1500, 1140, 1900); x.stroke(); x.beginPath(); x.moveTo(785, 1150); x.quadraticCurveTo(905, 1500, 1170, 1880); x.stroke();
    x.strokeStyle = "rgba(220,220,210,0.5)"; x.lineWidth = 8; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(200 + i * 90, 1350 + i * 10); x.lineTo(260 + i * 90, 1352 + i * 10); x.stroke(); }
    x.strokeStyle = "rgba(0,0,0,0.55)"; x.lineWidth = 3; const r = rng(12); for (let i = 0; i < 18; i++) { let px = r() * W, py = 1250 + r() * 650; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 160; py += (r() - 0.3) * 60; x.lineTo(px, py); } x.stroke(); }
    streaks(x, 420, 1180, 160, 500, C.red2, 0.25);
  });
  L(1, () => { // signal arm and the red light
    x.strokeStyle = "#0b0f0f"; x.lineWidth = 22; x.beginPath(); x.moveTo(-100, 330); x.quadraticCurveTo(400, 210, 820, 230); x.stroke();
    x.fillStyle = "#0b0f0f"; x.fillRect(760, 250, 130, 330); x.fillRect(180, 300, 110, 290);
    const on = 0.9 + 0.1 * Math.sin(u * 2);
    for (const [cx, cy, r] of [[825, 320, 44], [235, 360, 38]]) { x.fillStyle = C.red2; x.globalAlpha = on; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.globalAlpha = 1; glow(x, cx, cy, r * 6, C.red2, 0.5); x.fillStyle = "#1a1d1d"; x.beginPath(); x.arc(cx, cy + r * 2.4, r * 0.9, 0, 7); x.arc(cx, cy + r * 4.6, r * 0.9, 0, 7); x.fill(); }
  });
};

S.hospital = (x, u, L) => {
  sky(x, [[0, "#06121f"], [0.6, "#15324f"], [1, "#0b1622"]]);
  L(0.15, () => { x.fillStyle = "rgba(20,45,70,0.8)"; for (let i = 0; i < 7; i++) x.fillRect(i * 170 - 40, 900 + (i % 3) * 60, 150, 400); });
  L(0.55, () => {
    x.fillStyle = "#0d1d2c"; x.fillRect(80, 330, 920, 960); x.fillRect(260, 230, 560, 120);
    windowsGrid(x, 110, 380, 860, 880, { cols: 9, rows: 12, gap: 0.42, lit: 0.72, seed: 21, warm: "#ffc95e", u });
    x.fillStyle = "#0d1d2c"; x.fillRect(420, 1130, 240, 160); x.fillStyle = "#ffd98a"; x.fillRect(450, 1160, 180, 130);
    x.fillStyle = C.red; x.fillRect(515, 250, 50, 150); x.fillRect(465, 300, 150, 50); glow(x, 540, 325, 160, C.red2, 0.45);
    glow(x, 540, 800, 700, "#ffc95e", 0.2);
    // tiny figures in some lit windows
    const r = rng(5); x.fillStyle = "rgba(60,30,5,0.85)"; for (let i = 0; i < 14; i++) { const cx = 140 + Math.floor(r() * 9) * 95, cy = 440 + Math.floor(r() * 11) * 73; if (r() < 0.6) person(x, cx, cy + 20, 34, { hat: false, color: "rgba(60,30,5,0.85)" }); }
  });
  x.fillStyle = lin(x, 1290, H, [[0, "#9fb4c4"], [1, "#2b3b48"]]); x.fillRect(-200, 1290, W + 400, 900);
  L(0.9, () => { streaks(x, 540, 1295, 200, 300, "#ffc95e", 0.35); x.fillStyle = "rgba(255,255,255,0.15)"; for (let i = 0; i < 6; i++) x.fillRect(-100 + i * 260, 1520 + i * 30, 180, 8);
    person(x, 250, 1600, 150, { walk: u * 3 + 1, hat: false }); person(x, 820, 1720, 170, { hat: true, walk: u * 3 + 2 }); });
};

S.screens = (x, u, L) => {
  x.fillStyle = "#04070b"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.4, () => {
    const mons = [[60, 470, 440, 330], [560, 470, 460, 330], [230, 840, 620, 380]];
    mons.forEach(([mx, my, mw, mh], i) => {
      x.fillStyle = "#101418"; x.fillRect(mx - 14, my - 14, mw + 28, mh + 28);
      x.fillStyle = "#0b0f12"; x.fillRect(mx, my, mw, mh);
      // scan: grey anatomy blobs
      x.save(); x.beginPath(); x.rect(mx, my, mw, mh); x.clip();
      x.fillStyle = "rgba(200,210,215,0.35)"; x.beginPath(); x.ellipse(mx + mw / 2, my + mh / 2, mw * 0.32, mh * 0.4, 0, 0, 7); x.fill();
      x.fillStyle = "rgba(10,14,18,0.8)"; x.beginPath(); x.ellipse(mx + mw * 0.38, my + mh * 0.5, mw * 0.1, mh * 0.25, 0.2, 0, 7); x.ellipse(mx + mw * 0.62, my + mh * 0.5, mw * 0.1, mh * 0.25, -0.2, 0, 7); x.fill();
      x.fillStyle = "rgba(230,235,240,0.55)"; x.beginPath(); x.arc(mx + mw * (0.55 + 0.1 * i), my + mh * 0.42, 12 + i * 4, 0, 7); x.fill();
      // AI markers drawing on
      const p = Math.max(0, Math.min(1, (u - 0.8 - i * 0.7) / 0.6)), cx = mx + mw * (0.55 + 0.1 * i), cy = my + mh * 0.42, s = 46 + i * 8;
      x.strokeStyle = "#7fd0ff"; x.lineWidth = 4; x.globalAlpha = p;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { x.beginPath(); x.moveTo(cx + sx * s, cy + sy * s - sy * 18 * p); x.lineTo(cx + sx * s, cy + sy * s); x.lineTo(cx + sx * s - sx * 18 * p, cy + sy * s); x.stroke(); }
      x.fillStyle = "#7fd0ff"; x.font = '600 20px "Schibsted Grotesk"'; x.fillText(`FLAG 0${i + 1} · ${(0.71 + i * 0.09).toFixed(2)}`, cx - s, cy - s - 14);
      x.globalAlpha = 1; x.restore();
      glow(x, mx + mw / 2, my + mh / 2, 420, "#6fb8ff", 0.16);
    });
  });
  L(0.7, () => { glow(x, 1000, 1100, 500, "#ffbf6a", 0.4); x.fillStyle = "#1a1408"; x.fillRect(930, 980, 16, 300); x.beginPath(); x.moveTo(880, 980); x.lineTo(1000, 980); x.lineTo(960, 930); x.lineTo(920, 930); x.fill(); x.fillStyle = "#0b0c0d"; x.fillRect(-200, 1260, W + 400, 80); });
  L(1, () => { // radiologist from behind
    x.fillStyle = "#010203"; x.save(); x.translate(470, 1960);
    x.beginPath(); x.ellipse(0, -700, 92, 110, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-330, 0); x.quadraticCurveTo(-330, -480, -170, -560); x.quadraticCurveTo(0, -610, 170, -560); x.quadraticCurveTo(330, -480, 330, 0); x.fill(); x.fillRect(-55, -640, 110, 100); x.restore();
    x.save(); x.globalCompositeOperation = "screen"; x.strokeStyle = "rgba(120,190,255,0.35)"; x.lineWidth = 6; x.beginPath(); x.ellipse(470, 1260, 92, 110, 0, 3.5, 6.0); x.stroke(); x.beginPath(); x.moveTo(305, 1400); x.quadraticCurveTo(450, 1350, 640, 1400); x.stroke(); x.restore();
  });
};

S["red-moon"] = (x, u, L) => {
  sky(x, [[0, "#06161d"], [0.55, "#0f2c33"], [0.62, "#1b3a3e"], [1, "#0c1416"]]);
  L(0.05, () => { const r = rng(33); for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(240,240,230,${0.3 + r() * 0.6 * (0.7 + 0.3 * Math.sin(u * 3 + i))})`; x.beginPath(); x.arc(r() * W, r() * 1100, 1 + r() * 2.2, 0, 7); x.fill(); } });
  L(0.12, () => { x.fillStyle = "#d6452c"; x.beginPath(); x.arc(760, 380, 165, 0, 7); x.fill(); glow(x, 760, 380, 420, C.red2, 0.35);
    x.fillStyle = "rgba(120,30,20,0.16)"; for (const [a, b, r] of [[690, 300, 34], [805, 445, 48], [845, 330, 18], [705, 455, 22], [770, 380, 60]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } });
  L(0.25, () => { x.fillStyle = "#0b1517"; x.beginPath(); x.moveTo(-200, 1110); for (let i = 0; i <= 12; i++) x.lineTo(i * 110 - 100, 1090 - hash(i) * 50); x.lineTo(W + 200, 1140); x.lineTo(-200, 1140); x.fill(); });
  // snowfield
  x.fillStyle = lin(x, 1110, H, [[0, "#cfc6b2"], [1, "#8b8576"]]); x.fillRect(-200, 1110, W + 400, 900);
  L(0.6, () => {
    x.fillStyle = "rgba(90,85,75,0.35)"; x.beginPath(); x.moveTo(500, 1110); x.lineTo(580, 1110); x.lineTo(1000, 1960); x.lineTo(80, 1960); x.fill();
    for (let i = 0; i < 8; i++) { const t = i / 8, px = 440 - t * 520, h = 260 + t * 900; pole(x, 470 - (i + 1) * 60 * (1 + i * 0.4), 1120 + i * 90 * (1 + i * 0.25), Math.min(1200, h * 0.6), "#2a2018"); }
    x.strokeStyle = "rgba(40,30,25,0.6)"; x.lineWidth = 3; x.beginPath(); x.moveTo(420, 1050); x.quadraticCurveTo(200, 900, -100, 600); x.stroke();
    for (let i = 0; i < 12; i++) { x.fillStyle = "#3a2c22"; x.fillRect(630 + i * 40 * (1 + i * 0.25), 1120 + i * 22 * (1 + i * 0.3), 6 + i, 30 + i * 6); }
  });
  L(0.85, () => { // the red house
    x.fillStyle = "#7e2a1e"; x.fillRect(-40, 640, 330, 500); x.fillStyle = "#4a1810"; x.beginPath(); x.moveTo(-70, 650); x.lineTo(125, 470); x.lineTo(320, 650); x.fill();
    x.fillStyle = "#d8d2c4"; x.beginPath(); x.moveTo(-70, 650); x.lineTo(125, 470); x.lineTo(320, 650); x.lineTo(300, 640); x.lineTo(125, 490); x.lineTo(-50, 640); x.fill();
    x.fillStyle = "#1a0d0a"; x.fillRect(40, 740, 80, 120); x.fillRect(170, 740, 80, 120); x.fillStyle = "#ffcf6a"; x.globalAlpha = 0.8 + 0.2 * Math.sin(u * 5); x.fillRect(48, 748, 64, 104); x.globalAlpha = 1;
    x.fillStyle = "#3a1510"; for (let i = 0; i < 6; i++) x.fillRect(-40, 900 + i * 40, 330, 4);
  });
  L(1, () => { // walker, footprints
    const wy = 1500 - u * 18, sc = 1 - u * 0.02;
    for (let i = 0; i < 9; i++) { const py = wy + 60 + i * 52, px = 560 + (i % 2 ? 22 : -22) * (1 + i * 0.08); x.fillStyle = "rgba(40,30,25,0.55)"; x.beginPath(); x.ellipse(px, py, 12 + i * 1.5, 7 + i, 0, 0, 7); x.fill(); }
    person(x, 560, wy, 420 * sc, { walk: u * 3 });
    x.fillStyle = "rgba(30,25,20,0.3)"; x.beginPath(); x.ellipse(520, wy + 6, 110, 14, 0, 0, 7); x.fill();
  });
};

S.kiosk = (x, u, L) => {
  sky(x, [[0, "#0a2a4c"], [0.7, "#1c5a8a"], [1, "#0a1d33"]]);
  L(0.15, () => { x.fillStyle = "rgba(30,90,140,0.6)"; for (let i = 0; i < 8; i++) x.fillRect(560 + i * 70, 300 + hash(i) * 600, 90, 1400); });
  L(0.35, () => { x.fillStyle = "#0b2f55"; x.fillRect(-120, -200, 640, 1600); x.fillStyle = "#0e3a66"; x.fillRect(900, 200, 300, 1300); });
  x.fillStyle = lin(x, 1440, H, [[0, "#0d2238"], [1, "#04090f"]]); x.fillRect(-200, 1440, W + 400, 700);
  L(0.8, () => {
    x.fillStyle = "#0a1a2a"; x.fillRect(-100, 1430, 820, 30);
    // kiosk
    const kx = 300, ky = 1180, kw = 220, kh = 250;
    glow(x, kx + kw / 2, ky + kh / 2, 380, "#ff8a2a", 0.45);
    x.fillStyle = "#130a05"; x.fillRect(kx - 10, ky - 60, kw + 20, 40);
    x.fillStyle = "#ff7a1a"; x.beginPath(); x.moveTo(kx - 20, ky - 20); x.lineTo(kx + kw + 40, ky - 20); x.lineTo(kx + kw + 20, ky + 30); x.lineTo(kx - 10, ky + 30); x.fill();
    x.fillStyle = lin(x, ky + 30, ky + kh, [[0, "#ffc061"], [1, "#ff8a2a"]]); x.fillRect(kx, ky + 30, kw, kh - 30);
    x.fillStyle = "#1a0c04"; x.fillRect(kx + kw / 2 - 4, ky + 30, 8, kh - 30); seated(x, kx + 60, ky + kh, 110, "#1a0c04");
    streaks(x, kx + kw / 2, 1460, 180, 420, "#ff8a2a", 0.55);
    // tables, umbrella, people
    x.fillStyle = C.ink; x.fillRect(150, 1360, 6, 70); x.fillStyle = "#ff8a2a"; x.beginPath(); x.ellipse(153, 1355, 60, 18, 0, Math.PI, 0); x.fill();
    seated(x, 130, 1432, 100); person(x, 70, 1432, 120, { hat: true }); person(x, 640, 1432, 120, { hat: true }); person(x, 590, 1432, 118, { hat: false });
    // signal post
    x.fillStyle = C.ink; x.fillRect(560, 1000, 12, 430); x.beginPath(); x.moveTo(566, 1010); x.quadraticCurveTo(700, 950, 880, 970); x.lineTo(880, 980); x.quadraticCurveTo(700, 962, 566, 1022); x.fill();
    x.fillRect(860, 970, 40, 100); x.fillStyle = C.red2; x.beginPath(); x.arc(880, 995, 12, 0, 7); x.fill(); glow(x, 880, 995, 70, C.red2, 0.6);
  });
  L(1, () => { // taxi
    const tx = 780 - u * 8;
    x.fillStyle = "#e9a21f"; x.beginPath(); x.moveTo(tx, 1440); x.lineTo(tx + 20, 1395); x.lineTo(tx + 80, 1390); x.lineTo(tx + 120, 1350); x.lineTo(tx + 230, 1350); x.lineTo(tx + 270, 1392); x.lineTo(tx + 300, 1400); x.lineTo(tx + 305, 1440); x.fill();
    x.fillStyle = "#1a2a3a"; x.fillRect(tx + 130, 1360, 45, 32); x.fillRect(tx + 185, 1360, 45, 32);
    x.fillStyle = "#0a0a0a"; x.beginPath(); x.arc(tx + 70, 1442, 22, 0, 7); x.arc(tx + 245, 1442, 22, 0, 7); x.fill();
    x.fillStyle = "#ffe9a8"; x.fillRect(tx + 2, 1405, 14, 10); streaks(x, tx + 150, 1465, 220, 260, "#e9a21f", 0.3);
  });
};

window.NOIR_SCENES = S;
})();
