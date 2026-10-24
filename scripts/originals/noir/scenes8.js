// Case 12: The Locked Room. OpenAI takes its frontier models off the live internet during
// training and gives them an offline world (a cached copy of the web) after a model used a
// DNS misconfiguration to find a way outside it. Indigo night and gold like 09–11; the
// offline world is a city under a glass dome, and the one red moment is the crack in it.
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
function agent(x, ax, ay, h, a = 1, col = BLUE, walk = ax * 0.05) {
  x.save(); x.globalAlpha *= a; fig(x, ax, ay, h, "#0b0d18", { hat: false, walk });
  x.fillStyle = col; x.fillRect(ax - h * 0.045, ay - h * 0.9, h * 0.09, h * 0.022); x.restore();
}
function night(x, top = "#0d0f1c", low = "#1a1d33") { x.fillStyle = lin(x, 0, H, [[0, top], [1, low]]); x.fillRect(-200, -200, W + 400, H + 400); }
function spot(x, cx, cy, r, a = 1) { x.save(); x.globalAlpha *= a; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, "#e8c65a"); g.addColorStop(0.75, GOLD); g.addColorStop(1, "#b8962f"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.restore(); }
// Server racks receding to a vanishing point, LEDs blinking.
function racks(x, u, seed) {
  const r = rng(seed);
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    const d = i / 6, w = 220 * (1 - d * 0.75), h = 900 * (1 - d * 0.7), cx = 540 + side * (500 - d * 380), base = 1560 - d * 520;
    x.fillStyle = `rgb(${18 + d * 10},${20 + d * 10},${38 + d * 12})`; x.fillRect(cx - w / 2, base - h, w, h);
    x.fillStyle = "rgba(0,0,0,0.35)"; for (let k = 1; k < 9; k++) x.fillRect(cx - w / 2, base - h + k * h / 9, w, 3);
    for (let k = 0; k < 14; k++) { const on = hash(k + i * 31 + seed + Math.floor(u * (2 + r() * 3))) > 0.55; if (!on) continue; const lx = cx - w / 2 + 12 + r() * (w - 24), ly = base - h + 20 + r() * (h - 40); x.fillStyle = r() < 0.75 ? BLUE : GOLD2; x.fillRect(lx, ly, 6 * (1 - d * 0.5), 4); }
  }
}
// A small city with lit windows; `s` scales it, (cx, base) is its bottom centre.
function town(x, cx, base, s, u, seed) {
  const r = rng(seed); let bx = cx - 300 * s;
  while (bx < cx + 300 * s) { const w = (34 + r() * 46) * s, h = (80 + r() * 300) * s; x.fillStyle = "#151936"; x.fillRect(bx, base - h, w, h);
    for (let j = 0; j < Math.floor(h / (18 * s)); j++) for (let i = 0; i < Math.floor(w / (13 * s)); i++) if (r() < 0.32) { x.fillStyle = rgba(AM, 0.5 + 0.4 * hash(i + j * 7 + seed + Math.floor(u * 0.6))); x.fillRect(bx + 4 * s + i * 13 * s, base - h + 8 * s + j * 18 * s, 5 * s, 8 * s); }
    bx += w + 4 * s; }
}
// The glass dome over the offline world: (cx, base) bottom centre, R radius.
function dome(x, cx, base, R, u, seed, { crack = 0 } = {}) {
  x.save(); x.beginPath(); x.ellipse(cx, base, R, R * 1.25, 0, Math.PI, 0); x.closePath(); x.clip();
  x.fillStyle = lin(x, base - R * 1.25, base, [[0, "#141a33"], [1, "#1f2546"]]); x.fillRect(cx - R, base - R * 1.3, 2 * R, R * 1.3);
  glow(x, cx, base - R * 0.2, R * 0.9, AM, 0.12);
  town(x, cx, base, R / 300, u, seed);
  for (let i = 0; i < 4; i++) { const t = ((u * 0.12 + i * 0.27) % 1); agent(x, cx - R * 0.6 + t * R * 1.2, base - 4, R * 0.12, 0.85, BLUE, u * 6 + i); }
  x.restore();
  // the glass itself: rim, highlights, base
  x.save(); x.strokeStyle = "rgba(207,231,245,0.55)"; x.lineWidth = 5; x.beginPath(); x.ellipse(cx, base, R, R * 1.25, 0, Math.PI, 0); x.stroke();
  x.globalCompositeOperation = "screen"; x.strokeStyle = "rgba(230,242,255,0.35)"; x.lineWidth = 18; x.beginPath(); x.ellipse(cx, base, R * 0.86, R * 1.1, 0, Math.PI * 1.12, Math.PI * 1.32); x.stroke();
  x.lineWidth = 8; x.beginPath(); x.ellipse(cx, base, R * 0.9, R * 1.15, 0, Math.PI * 1.62, Math.PI * 1.7); x.stroke(); x.restore();
  x.fillStyle = "#2a2d44"; x.fillRect(cx - R - 30, base, 2 * R + 60, 36); x.fillStyle = "#16182a"; x.fillRect(cx - R - 10, base + 36, 2 * R + 20, 70);
  x.fillStyle = rgba(GOLD, 0.8); x.fillRect(cx - R - 30, base, 2 * R + 60, 4);
  if (crack > 0) { // a hairline crack climbing the glass, glowing red
    const pts = [[cx + R * 0.55, base - 6], [cx + R * 0.5, base - R * 0.25], [cx + R * 0.6, base - R * 0.45], [cx + R * 0.48, base - R * 0.7], [cx + R * 0.56, base - R * 0.92], [cx + R * 0.42, base - R * 1.08]];
    const n = crack * (pts.length - 1), k = Math.floor(n), f = n - k;
    x.save(); x.strokeStyle = RED; x.lineWidth = 6; x.lineJoin = "round"; x.beginPath(); x.moveTo(...pts[0]);
    for (let i = 1; i <= k; i++) x.lineTo(...pts[i]);
    if (k < pts.length - 1) x.lineTo(pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f);
    x.stroke(); x.restore();
    const tip = pts[Math.min(k, pts.length - 1)]; glow(x, tip[0], tip[1], 160, RED, 0.5 * crack); glow(x, cx + R * 0.55, base - R * 0.5, 320, RED, 0.18 * crack);
  }
}

// ── Case 12: The Locked Room ─────────────────────────────────────────────────
S["z-room"] = (x, u, L) => {
  night(x, "#05060d", "#151933");
  L(0.25, () => racks(x, u, 5));
  L(0.55, () => { // a glass room in the middle of the hall, lit cold blue, a figure pacing inside
    const cx = 540, top = 900, w = 380, h = 520;
    glow(x, cx, top + h / 2, 420, BLUE, 0.22);
    x.fillStyle = "rgba(120,170,220,0.12)"; x.fillRect(cx - w / 2, top, w, h);
    x.strokeStyle = "rgba(207,231,245,0.7)"; x.lineWidth = 6; x.strokeRect(cx - w / 2, top, w, h);
    x.lineWidth = 3; x.beginPath(); x.moveTo(cx, top); x.lineTo(cx, top + h); x.stroke();
    const pace = Math.sin(u * 0.7) * 110; agent(x, cx + pace, top + h - 10, 300, 1, BLUE, u * 5);
    x.fillStyle = "#2a2d44"; x.fillRect(cx - w / 2 - 20, top + h, w + 40, 18);
    x.save(); x.globalCompositeOperation = "screen"; x.fillStyle = "rgba(230,242,255,0.18)"; x.beginPath(); x.moveTo(cx - w / 2 + 30, top); x.lineTo(cx - w / 2 + 90, top); x.lineTo(cx - w / 2 + 10, top + h); x.lineTo(cx - w / 2 - 20, top + h); x.fill(); x.restore();
  });
  L(1, () => { x.fillStyle = "#04050a"; x.fillRect(-200, 1600, W + 400, 600); fig(x, 900, 1880, 440, "#020205"); });
};
S["z-plug"] = (x, u, L) => {
  night(x, "#06070f", "#121630");
  L(0.25, () => { // a faint globe of meridians: the live internet
    x.save(); x.strokeStyle = rgba(BLUE, 0.16 * (1 - clamp((u - 2.6) / 1.2) * 0.8)); x.lineWidth = 2; const cx = 540, cy = 980, R = 430;
    for (let i = -3; i <= 3; i++) { x.beginPath(); x.ellipse(cx, cy, R * Math.cos(i / 7 * Math.PI / 2 + u * 0.05) , R, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(cx, cy + i * R / 4, Math.sqrt(Math.max(0, R * R - (i * R / 4) ** 2)), 12, 0, 0, 7); x.stroke(); }
    x.restore();
  });
  L(0.6, () => { // a heavy cable and plug, pulled out of the wall socket
    const pull = ease((u - 2.2) / 0.9), live = 1 - clamp((u - 2.6) / 0.6);
    x.fillStyle = "#1d2033"; x.fillRect(760, 1060, 260, 320); x.fillStyle = "#2a2d44"; x.fillRect(780, 1080, 220, 280);
    x.fillStyle = "#06070c"; x.fillRect(850, 1170, 18, 60); x.fillRect(912, 1170, 18, 60);
    glow(x, 890, 1220, 200, GOLD2, 0.35 * live);
    const px = 700 - pull * 280, py = 1220 + pull * 60;
    x.strokeStyle = "#0b0c14"; x.lineWidth = 34; x.lineCap = "round"; x.beginPath(); x.moveTo(-200, 1650); x.bezierCurveTo(200, 1700, px - 300, py + 200, px - 90, py); x.stroke();
    x.save(); x.translate(px, py); x.fillStyle = "#16181f"; x.fillRect(-120, -70, 130, 140); x.fillStyle = GOLD; x.fillRect(10, -40, 70, 16); x.fillRect(10, 24, 70, 16); x.restore();
    if (u > 2.4 && u < 3.1) { const r = rng(Math.floor(u * 30)); x.strokeStyle = GOLD2; x.lineWidth = 4; for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, l = 30 + r() * 90; x.beginPath(); x.moveTo(800, 1220); x.lineTo(800 + Math.cos(a) * l, 1220 + Math.sin(a) * l); x.stroke(); } glow(x, 800, 1220, 220, GOLD2, 0.6); }
  });
  L(1, () => fig(x, 170, 1900, 400, "#020205"));
};
S["z-dome"] = (x, u, L) => {
  night(x, "#05060d", "#131731");
  L(0.3, () => { x.fillStyle = "#0a0b14"; x.fillRect(-200, 1520, W + 400, 700); glow(x, 540, 1300, 620, AM, 0.08); });
  L(0.6, () => dome(x, 540, 1520, 380, u, 12));
  L(1, () => fig(x, 130, 1900, 360, "#020205"));
};
S["z-crack"] = (x, u, L) => {
  x.fillStyle = "#05050b"; x.fillRect(-200, -200, W + 400, H + 400);
  L(0.3, () => { x.fillStyle = "#0a0b14"; x.fillRect(-200, 1560, W + 400, 700); });
  L(0.6, () => dome(x, 520, 1560, 460, u, 12, { crack: ease((u - 1.2) / 4.5) }));
  L(0.85, () => { // an index card from the address book, one entry crossed in red
    const a = clamp((u - 0.4) / 0.8); x.save(); x.globalAlpha *= a; x.translate(300, 760); x.rotate(-0.08);
    x.fillStyle = PAPER; x.fillRect(-170, -100, 340, 200); x.fillStyle = RED; x.fillRect(-170, -100, 340, 10);
    x.fillStyle = "#333"; x.font = '700 30px "Special Elite"'; x.fillText("ADDRESS BOOK", -150, -50);
    x.fillStyle = "rgba(0,0,0,0.35)"; for (let i = 0; i < 3; i++) x.fillRect(-150, -18 + i * 36, 260 - i * 40, 6);
    if (u > 3) { x.strokeStyle = RED; x.lineWidth = 6; x.beginPath(); x.moveTo(-158, 22); x.lineTo(-158 + 280 * clamp((u - 3) / 0.6), 14); x.stroke(); }
    x.restore();
  });
};
S["z-tower"] = (x, u, L) => {
  night(x, "#05060d", "#141834");
  L(0.3, () => { x.fillStyle = "#0a0b14"; x.fillRect(-200, 1620, W + 400, 600); });
  L(0.5, () => dome(x, 540, 1620, 300, u, 12));
  L(0.75, () => { // three searchlights on towers, one per reason, switching on in turn
    [[150, 0.6], [930, 2.4], [540, 4.2]].forEach(([tx, t0], i) => {
      const on = clamp((u - t0) / 0.4), ty = i === 2 ? 1180 : 1300;
      if (i === 2) { x.fillStyle = "#0d0e18"; x.fillRect(tx - 18, ty, 36, 140); } else { x.fillStyle = "#0d0e18"; x.fillRect(tx - 26, ty, 52, 420); x.fillRect(tx - 60, ty - 20, 120, 30); }
      if (on <= 0) return;
      const a = -Math.PI / 2 + Math.sin(u * 0.6 + i * 2) * 0.55;
      x.save(); x.globalCompositeOperation = "screen"; x.globalAlpha *= on; const len = 1300, sp = 0.13;
      const g = x.createRadialGradient(tx, ty - 20, 0, tx, ty - 20, len); g.addColorStop(0, rgba(GOLD2, 0.45)); g.addColorStop(1, rgba(GOLD2, 0));
      x.fillStyle = g; x.beginPath(); x.moveTo(tx, ty - 20); x.lineTo(tx + Math.cos(a - sp) * len, ty - 20 + Math.sin(a - sp) * len); x.lineTo(tx + Math.cos(a + sp) * len, ty - 20 + Math.sin(a + sp) * len); x.closePath(); x.fill(); x.restore();
      glow(x, tx, ty - 20, 60, GOLD2, 0.7 * on);
    });
  });
};
S["z-keys"] = (x, u, L) => {
  night(x, "#0b0c18", "#1d1a33");
  L(0.5, () => {
    spot(x, 540, 1340, 300, 0.95);
    const sw = Math.sin(u * 1.4) * 0.12; x.save(); x.translate(540, 1080); x.rotate(sw);
    x.strokeStyle = "#16181A"; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 60, 0, 7); x.stroke();
    [-0.5, 0, 0.5].forEach((a, i) => { // three keys; only the middle one lights up
      x.save(); x.rotate(a); const lit = i === 1 && u > 2.2; x.fillStyle = lit ? GOLD2 : "#16181A";
      x.beginPath(); x.arc(0, 110, 34, 0, 7); x.fill(); x.fillRect(-9, 130, 18, 190); x.fillRect(9, 270, 34, 16); x.fillRect(9, 300, 24, 16);
      if (lit) glow(x, 0, 220, 160, GOLD2, 0.4); x.restore(); });
    x.restore();
  });
  L(0.95, () => fig(x, 170, 1900, 420, "#020205"));
};
})();
