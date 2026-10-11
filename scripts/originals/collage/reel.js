// AI Broadsheet reels: the collage explainer cut down for Reels, Shorts and TikTok.
// Boards with "format": "reel" get a sticker logo instead of the header bar,
// big kinetic captions inside the platforms' safe zone, a hook that is on
// screen from the first frame, and a last scene that loops back to the hook.
// New pieces: halftone duotone photos, magazine ransom letters in mixed faces
// (Bodoni italic, Archivo Black, Permanent Marker, Rubik Mono, typewriter),
// sticky notes, a paper settings panel, an electricity bill, a hand-cut paper
// robot, a ruler timeline. Everything else comes from collage.html / v2.
(() => {
  const A = n => `ASSET_DIR/${n}`;
  const RED = "#C8372D", CREAM = "#F2EDE2", INK = "#141414", Y = "#F5C400", KRAFT = "#C2924A";
  const V = () => window.V2;
  const css = document.createElement("style");
  css.textContent = `
  .bod{font-family:Bodoni,serif;font-style:italic;font-weight:800}
  .bodr{font-family:Bodoni,serif;font-weight:700}
  .arc{font-family:Archivo,sans-serif}
  .mkr{font-family:Marker,cursive}
  .rub{font-family:Rubik,sans-serif}
  .duo{position:absolute;overflow:hidden;background:${Y}}
  .duo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.35) brightness(1.05);mix-blend-mode:multiply}
  .duo .dots{position:absolute;inset:0;background-image:radial-gradient(rgba(20,20,20,.55) 1.5px,transparent 2.3px);background-size:9px 9px;mix-blend-mode:multiply;opacity:.45}
  .duo .gr{position:absolute;inset:0;background-image:var(--grain),var(--blotch);mix-blend-mode:multiply}
  .sticky{position:relative;background-image:var(--blotch),var(--grain);box-shadow:0 2px 0 rgba(0,0,0,.08)}
  .chip{display:inline-block;font-family:Archivo,sans-serif;padding:10px 22px 12px;line-height:1}
  #cap.reel{top:1268px;left:70px;right:150px}
  #cap.reel span{font-family:Archivo,sans-serif;font-weight:400;font-size:66px;line-height:1.08;background:${INK};padding:14px 26px 20px;max-width:860px;clip-path:var(--capclip);box-shadow:none}
  #cap.reel em{background:${Y};color:${INK};padding:0 .12em;margin:0 -.05em}
  #head.reel{left:40px;right:auto;top:112px;padding:10px 20px 12px 12px;gap:12px;transform:rotate(-2deg);box-shadow:0 8px 16px rgba(0,0,0,.3)}
  #head.reel b{font-size:32px}
  #head.reel svg{width:40px;height:40px}
  `;
  document.head.appendChild(css);

  const svgNS = "http://www.w3.org/2000/svg";
  function svgBox(parent, w, hh, z = 6) {
    const s = document.createElementNS(svgNS, "svg");
    s.setAttribute("width", w); s.setAttribute("height", hh);
    s.style.cssText = `position:absolute;left:0;top:0;overflow:visible;z-index:${z}`;
    parent.appendChild(s); return s;
  }
  const at = (si, word, lead, fb) => (word ? cueOr(si, word, lead, fb) : fb);
  /** A cue that must not come before `min`. */
  const after = (x, min) => Math.max(x, min);

  // ── backgrounds ──────────────────────────────────────────────────────────
  const baseBg = window.bgLayer;
  window.bgLayer = (kind, si) => {
    if (!["grid", "riso", "ink", "pink"].includes(kind)) return baseBg(kind, si);
    const el = h(`<div class="bg2"></div>`), r = rng(9100 + si * 31);
    if (kind === "grid") {
      el.style.backgroundColor = "#EDE7D9";
      el.appendChild(h(`<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(60,90,140,.2) 2px,transparent 2px),linear-gradient(90deg,rgba(60,90,140,.2) 2px,transparent 2px);background-size:54px 54px"></div>`));
      V().stain(el, 700 + r() * 200, 1450, 300, 9100 + si);
    } else if (kind === "riso") {
      el.style.backgroundColor = Y;
      el.appendChild(h(`<div style="position:absolute;inset:0;background-image:radial-gradient(rgba(20,20,20,.9) 2.2px,transparent 3px);background-size:22px 22px;-webkit-mask-image:linear-gradient(160deg,rgba(0,0,0,.28),transparent 55%);mask-image:linear-gradient(160deg,rgba(0,0,0,.28),transparent 55%)"></div>`));
    } else if (kind === "pink") {
      el.style.backgroundColor = "#E9B9AE";
    } else {
      el.style.backgroundColor = "#191816";
      V().newsPiece(el, "newsprint/page-a.jpg", 560, 1200 + r() * 100, 560, 700, 4, 9150 + si, "grayscale(1) brightness(.5)", .55);
    }
    return el;
  };

  // ── pieces ───────────────────────────────────────────────────────────────
  /** Halftone duotone photo (ink on signal yellow), torn on every edge. */
  function duo(src, w, hgt, seed, tint = Y) {
    return h(`<div class="duo" style="width:${w}px;height:${hgt}px;background:${tint};clip-path:${torn(seed, 10, 18)}"><img src="${A(src)}"><div class="dots"></div><div class="gr"></div></div>`);
  }
  const STY3 = [
    { bg: INK, fg: "#F4F0E6", f: "arc" }, { bg: CREAM, fg: INK, f: "bod" }, { bg: Y, fg: INK, f: "anton" },
    { bg: "news", fg: INK, f: "bodr" }, { bg: RED, fg: "#F4F0E6", f: "arc" }, { bg: "none", fg: INK, f: "mkr" },
    { bg: "#F4F0E6", fg: RED, f: "rub" }, { bg: KRAFT, fg: INK, f: "elite" }, { bg: CREAM, fg: INK, f: "arc" },
  ];
  /** Magazine ransom letters: rows of words, every letter cut from a different page. */
  function ransom3(rows, fs, seed, light = false) {
    const box = h(`<div style="position:absolute;left:0;right:0;text-align:center;z-index:7"></div>`);
    const letters = [], r = rng(seed);
    rows.forEach((row, ri) => {
      const line = h(`<div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:${ri ? 10 : 0}px"></div>`);
      [...row.join(" ")].forEach((ch, ci) => {
        if (ch === " ") { line.appendChild(h(`<span style="display:inline-block;width:${(fs * .32).toFixed(0)}px"></span>`)); return; }
        let st = STY3[Math.floor(r() * STY3.length)];
        if (st.bg === "none" && (light || /[%$"0-9]/.test(ch))) st = STY3[0];
        const bg = st.bg === "news" ? `background:linear-gradient(rgba(255,255,255,.45),rgba(255,255,255,.45)),url('${A("newsprint/page-b.jpg")}') ${Math.floor(r() * 100)}% ${Math.floor(r() * 100)}%/800px` : st.bg === "none" ? "background:transparent" : `background-color:${st.bg};background-image:var(--grain)`;
        const size = fs * (st.f === "mkr" ? 1.05 : st.f === "rub" ? .78 : .84 + r() * .26);
        const pad = st.bg === "none" ? "0 .04em" : ".06em .13em .09em";
        const L = h(`<span class="rl ${st.f === "serif" ? "serif" : st.f}" style="--fs:${size.toFixed(0)}px;padding:${pad};${bg};color:${st.fg};${st.bg === "none" ? "" : `clip-path:${torn(seed * 13 + ri * 70 + ci, 3, 5)};`}filter:drop-shadow(0 6px 6px rgba(0,0,0,.35))">${esc(ch)}</span>`);
        L.dataset.rot = ((r() - .5) * 16).toFixed(1); L.dataset.dy = ((r() - .5) * 20).toFixed(0);
        line.appendChild(L); letters.push(L);
      });
      box.appendChild(line);
    });
    return { box, letters };
  }
  /** Font size so the longest row of `rows` fits ~940 px. */
  const fitFs = (rows, max = 200) => Math.min(max, 900 / (Math.max(...rows.map(r => r.join(" ").length)) * .86 + .4));

  function marker(text, size, color = INK) {
    return h(`<div class="mkr" style="font-size:${size}px;line-height:1.05;color:${color};white-space:nowrap">${esc(text)}</div>`);
  }
  function sticker(text, seed, bg = Y, size = 64, round = true) {
    const el = h(`<div class="piece" style="z-index:9"><div class="${bg === INK ? "black" : "yellow"}" style="background-color:${bg};${round ? "border-radius:50%;width:300px;height:300px;display:flex;align-items:center;justify-content:center;text-align:center;padding:30px" : "padding:16px 30px 20px"};clip-path:${round ? torn(seed, 6, 40) : torn(seed, 4, 8)}"><div class="mkr" style="font-size:${size}px;line-height:.98;color:${bg === INK ? Y : INK}">${esc(text)}</div></div></div>`);
    return el;
  }
  /** A hand-drawn arrow from (x0,y0) to (x1,y1), drawn as one stroke with a head. */
  function arrow(svg, x0, y0, x1, y1, seed, color = RED, w = 9) {
    const mx = (x0 + x1) / 2 + (y1 - y0) * .25, my = (y0 + y1) / 2 - (x1 - x0) * .25;
    const a = Math.atan2(y1 - my, x1 - mx), L = 46;
    const d = `M${x0} ${y0} Q${mx.toFixed(0)} ${my.toFixed(0)} ${x1} ${y1} M${(x1 - L * Math.cos(a - .5)).toFixed(0)} ${(y1 - L * Math.sin(a - .5)).toFixed(0)} L${x1} ${y1} L${(x1 - L * Math.cos(a + .5)).toFixed(0)} ${(y1 - L * Math.sin(a + .5)).toFixed(0)}`;
    return stroke(svg, d, color, w);
  }
  function burst(svg, cx, cy, r0, seed, color = RED) {
    const r = rng(seed); let d = "";
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + r() * .2; d += `M${(cx + Math.cos(a) * r0).toFixed(0)} ${(cy + Math.sin(a) * r0).toFixed(0)} L${(cx + Math.cos(a) * (r0 + 40 + r() * 30)).toFixed(0)} ${(cy + Math.sin(a) * (r0 + 40 + r() * 30)).toFixed(0)} `; }
    return stroke(svg, d, color, 8);
  }
  /** Hand-cut paper robot, built from torn shapes (no photo needed). */
  function paperRobot(scale = 1, seed = 1) {
    const s = scale, t = (x) => (x * s).toFixed(0);
    const part = (x, y, w, hh, bg, k, extra = "") => `<div style="position:absolute;left:${t(x)}px;top:${t(y)}px;width:${t(w)}px;height:${t(hh)}px;${bg};clip-path:${torn(seed * 31 + k, 5 * s, 8)};${extra}"></div>`;
    const metal = `background:linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)),url('${A("newsprint/page-a.jpg")}') ${(seed * 17) % 100}% 40%/700px;filter:grayscale(1)`;
    const kr = `background-color:${KRAFT};background-image:var(--blotch),var(--grain)`;
    const ink = `background-color:${INK};background-image:var(--grain)`;
    return h(`<div class="piece" style="width:${t(420)}px;height:${t(700)}px">
      <div style="position:absolute;left:${t(206)}px;top:0;width:${t(8)}px;height:${t(70)}px;background:${INK}"></div>
      <div style="position:absolute;left:${t(186)}px;top:${t(-26)}px;width:${t(48)}px;height:${t(48)}px;border-radius:50%;background:${RED}"></div>
      ${part(80, 60, 260, 190, kr, 1)}
      <div style="position:absolute;left:${t(122)}px;top:${t(110)}px;width:${t(64)}px;height:${t(64)}px;border-radius:50%;background:${Y};border:${t(10)}px solid ${INK}"></div>
      <div style="position:absolute;left:${t(234)}px;top:${t(110)}px;width:${t(64)}px;height:${t(64)}px;border-radius:50%;background:${Y};border:${t(10)}px solid ${INK}"></div>
      ${part(140, 200, 140, 26, ink, 2)}
      ${part(40, 270, 340, 270, metal, 3)}
      ${part(0, 290, 46, 210, ink, 4, "transform:rotate(8deg)")}
      ${part(374, 290, 46, 210, ink, 5, "transform:rotate(-8deg)")}
      <div style="position:absolute;left:${t(90)}px;top:${t(320)}px;width:${t(130)}px;height:${t(90)}px;background:${RED};clip-path:${torn(seed + 7, 3, 6)}"></div>
      <div style="position:absolute;left:${t(250)}px;top:${t(330)}px;width:${t(70)}px;height:${t(70)}px;border-radius:50%;background:${CREAM};border:${t(8)}px solid ${INK}"></div>
      ${part(90, 540, 80, 150, ink, 6)}${part(250, 540, 80, 150, ink, 7)}
    </div>`);
  }
  const HOUSE = `<svg viewBox="0 0 20 20" width="34" height="34"><path d="M2 10 L10 3 L18 10 L16 10 L16 18 L4 18 L4 10 Z" fill="${INK}"/><rect x="8.5" y="12" width="3" height="6" fill="${Y}"/></svg>`;
  const PERSON = `<svg viewBox="0 0 20 30" width="44" height="66"><circle cx="10" cy="6" r="5" fill="${RED}"/><path d="M3 30 L3 15 Q3 12 6 12 L14 12 Q17 12 17 15 L17 30 Z" fill="${RED}"/></svg>`;

  // ── reel scenes ──────────────────────────────────────────────────────────
  Object.assign(BUILD, {
    hook(sc, si, root) {
      root.appendChild(window.bgLayer("ink", si));
      const ph = duo(sc.data.photo, 1160, 1760, 9200 + si);
      root.appendChild(h(`<div style="position:absolute;left:-30px;top:236px;width:1140px;height:1760px;background:${RED};clip-path:${torn(9210 + si, 10, 18)};transform:rotate(2deg)"></div>`));
      ph.style.cssText += "left:-40px;top:210px;transform:rotate(-1.5deg)"; root.appendChild(ph);
      const rows = sc.data.lines;
      const { box, letters } = ransom3(rows, fitFs(rows, 210), 9300 + si, true);
      box.style.top = "330px"; root.appendChild(box);
      const loop = !!sc.data.loop;
      const s0 = sent(si, 0);
      const t0 = loop ? sc.start + .05 : 0, gap = Math.min(loop ? .05 : .055, ((s0.end - sc.start) * .55) / letters.length);
      letters.forEach((_, i) => { if (i % 2 === 0) ev(t0 + i * gap, "snip"); });
      const svg = svgBox(root, W, H, 8);
      const done = t0 + letters.length * gap;
      const und = stroke(svg, roughPath([[160, 1200], [520, 1182], [880, 1196]], 9300 + si, 10), INK, 14);
      const b = burst(svg, 900, 300, 60, 9310 + si, Y);
      let st = null, sa = 0, ar = null;
      if (sc.data.sticker) {
        st = sticker(sc.data.sticker, 9320 + si, Y, sc.data.sticker.length > 9 ? 54 : 66); root.appendChild(st);
        sa = after(at(si, sc.data.stickerCue, .1, done + .3), done + .1);
        ev(sa + .15, "slap");
        ar = arrow(svg, 700, 1010, 560, 1110, 9330 + si, INK, 9);
      }
      ev(done + .1, "marker");
      const pst = st && piece(st, 9340 + si, { x: 690, y: 860, rot: 9 });
      return t => {
        V().showLetters(letters, t, t0, gap, 9350 + si);
        ph.querySelector("img").style.transform = `scale(${(1.08 - .06 * clamp((t - sc.start) / 6)).toFixed(4)})`;
        und.draw(ioCubic(p(t, done + .05, .4)));
        b.draw(ioCubic(p(t, done + .25, .3)));
        if (pst) { placePiece(pst, t, sa, { dx: 0, dy: 0, rot: -30, s: 2.2 }, .3); }
        if (ar) ar.draw(ioCubic(p(t, sa + .3, .35)));
      };
    },

    ask(sc, si, root) {
      // Same photo and ransom look as the hook so the loop back to frame one is seamless.
      const upd = BUILD.hook({ ...sc, data: { ...sc.data, loop: true, sticker: null } }, si, root);
      const r = rng(9400 + si);
      const bub = h(`<div class="piece" style="z-index:9"><div style="position:relative;background:#FBFAF6;background-image:var(--grain);padding:26px 40px 34px;border-radius:44px;box-shadow:0 10px 18px rgba(0,0,0,.35)"><div class="mkr" style="font-size:62px;line-height:1;color:${INK};white-space:nowrap">${esc(sc.data.comment || "Tell us below")} ↓</div></div>
        <div style="position:absolute;left:70px;bottom:-34px;width:60px;height:46px;background:#FBFAF6;clip-path:polygon(0 0,100% 0,10% 100%)"></div></div>`);
      root.appendChild(bub);
      const srcs = h(`<div class="piece" style="z-index:9"><div class="paper elite" style="padding:14px 24px 16px;font-size:28px;max-width:860px;clip-path:${torn(9410 + si, 4)}">Sources: ${B.sources.map(s => esc(s.name)).join(", ")}</div></div>`);
      root.appendChild(srcs);
      const ba = after(at(si, "tell us", .2, sc.start + 1.2), sc.start + .6);
      ev(ba + .1, "slap"); ev(sc.start + .9, "type");
      const pb = piece(bub, 9420 + si, { x: 120, y: 1000, rot: -3 }), ps = piece(srcs, 9430 + si, { x: 70, y: 210, rot: 1 + r() });
      return t => { upd(t); placePiece(pb, t, ba, { dx: 0, dy: 0, rot: 10, s: .3 }, .35); placePiece(ps, t, sc.start + .8, { dx: -900, dy: 0, rot: -6 }, .4); };
    },

    count(sc, si, root) {
      root.appendChild(window.bgLayer("riso", si));
      const lab = h(`<div class="piece"><div class="black elite" style="padding:16px 30px 20px;font-size:40px;color:#F4F0E6;clip-path:${torn(9500 + si, 4)}">${esc(sc.data.label)} ≈</div></div>`);
      root.appendChild(lab);
      const cols = 20, rows = 9, N = cols * rows;
      const grid = h(`<div style="position:absolute;left:60px;top:400px;width:960px;display:grid;grid-template-columns:repeat(${cols},48px);gap:0;z-index:3"></div>`);
      const hs = Array.from({ length: N }, () => { const e = h(`<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;visibility:hidden">${HOUSE}</div>`); grid.appendChild(e); return e; });
      root.appendChild(grid);
      const A0 = sc.data.a, B0 = sc.data.b;
      const ca = after(at(si, A0.cue, .4, sc.start + .5), sc.start + .3);
      const big = h(`<div class="piece" style="z-index:6"><div class="black" style="padding:26px 40px 30px;clip-path:${torn(9510 + si, 7)}"><div class="arc" style="font-size:150px;line-height:1;color:${Y}"><span>0</span></div><div style="font-weight:800;font-size:42px;margin-top:8px;color:#F4F0E6">${esc(A0.label)}</div></div></div>`);
      root.appendChild(big);
      const cb = after(at(si, B0.cue, .3, sent(si, 1).start + .5), ca + 1.2);
      const small = h(`<div class="piece" style="z-index:7"><div class="paper" style="padding:22px 34px 28px;display:flex;align-items:center;gap:22px;clip-path:${torn(9520 + si, 6)}"><div style="display:flex">${PERSON.repeat(3)}</div><div><div class="bod" style="font-size:110px;line-height:.9;color:${RED}">≈${fmt(B0.n)}</div><div class="mkr" style="font-size:44px">${esc(B0.label)}</div></div></div></div>`);
      root.appendChild(small);
      ev(sc.start + .2, "slap"); for (let k = 0; k < 10; k++) ev(sc.start + .3 + k * (ca + .6 - sc.start - .3) / 10, "click"); ev(ca + 1, "thump"); ev(cb + .2, "stamp");
      const pl = piece(lab, 9530 + si, { x: 60, y: 285, rot: -2 }), pbg = piece(big, 9540 + si, { x: 90, y: 690, rot: -2.5 }), psm = piece(small, 9550 + si, { x: 300, y: 990, rot: 3 });
      const span = big.querySelector("span");
      return t => {
        placePiece(pl, t, sc.start, { dx: -900, dy: 0, rot: -8 }, .35);
        const k = clamp((t - sc.start - .3) / Math.max(1, ca + .9 - sc.start - .3));
        hs.forEach((e, i) => { e.style.visibility = i < k * N ? "visible" : "hidden"; });
        placePiece(pbg, t, ca + .9, { dx: 0, dy: 0, rot: -8, s: 1.8 }, .3);
        span.textContent = fmt(A0.n * oCubic(p(t, ca + .9, .7)));
        placePiece(psm, t, cb, { dx: 0, dy: 0, rot: 14, s: 2 }, .3);
      };
    },

    pullquote(sc, si, root) {
      root.appendChild(window.bgLayer(sc.data.bg || "cream", si));
      const d = sc.data;
      let side;
      if (d.photo) { side = duo(d.photo, 560, 700, 9600 + si); side.classList.add("piece"); root.appendChild(side); side = piece(side, 9601 + si, { x: 480, y: 250, rot: 3 }); }
      else { const f = V().figure(root, d.fig, 900, 9602 + si, { x: 0, y: 0, rot: 0 }); f.pc.base = { x: W - f.w + 60, y: 1440 - 900, rot: -1.5 }; side = f.pc; }
      const q = h(`<div class="piece" style="width:${d.plain ? 860 : 820}px;z-index:5"><div class="paper" style="padding:46px 50px 56px;clip-path:${torn(9610 + si, 7)}">
        <div class="bod" style="font-size:${d.quote.length > 34 ? 84 : 104}px;line-height:1.02;letter-spacing:-1px">${d.plain ? "" : "“"}${highlightText(d.quote, d.mark)}${d.plain ? "" : "”"}</div>
        <div class="elite" style="font-size:28px;margin-top:24px;line-height:1.3">${esc(d.credit)}</div></div></div>`);
      q.appendChild(tape(300, -24, -4)); root.appendChild(q);
      const pq = piece(q, 9620 + si, { x: 60, y: 560, rot: -2 });
      const mk = q.querySelector(".mk");
      const qa = sc.start + .45, ma = after(at(si, d.cue, .2, sent(si, 0).end - .4), qa + .5);
      ev(sc.start + .2, "slide"); ev(qa + .25, "slap"); ev(ma, "marker");
      return t => {
        if (d.photo) placePiece(side, t, sc.start, { dx: 700, dy: 0, rot: 12 }, .45); else V().placeStep(side, t, sc.start, { dx: 600, dy: 0, rot: 0 }, .5, 4);
        placePiece(pq, t, qa, { dx: 0, dy: 1100, rot: 8 }, .45);
        if (mk) mk.style.transform = `scaleX(${oCubic(p(t, ma, .5)).toFixed(3)})`;
      };
    },

    bill(sc, si, root) {
      root.appendChild(window.bgLayer("ink", si));
      const d = sc.data;
      const bars = Array.from({ length: 12 }, (_, i) => 30 + ((i * 37) % 50) + i * 3);
      const el = h(`<div class="piece" style="width:860px"><div class="rcpt" style="padding:44px 48px 60px;clip-path:${torn(9700 + si, 5)}">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid ${INK};padding-bottom:16px"><div class="arc" style="font-size:58px">${esc(d.title)}</div><div class="elite" style="font-size:24px;text-align:right">Account 0042-7781<br>Residential</div></div>
        <div style="display:flex;align-items:flex-end;gap:10px;height:120px;margin:26px 0 10px">${bars.map((b, i) => `<i style="display:block;width:44px;height:${b + (i > 8 ? 30 : 0)}px;background:${i > 8 ? RED : "rgba(20,20,20,.75)"}"></i>`).join("")}</div>
        <div class="elite" style="font-size:22px;opacity:.6;margin-bottom:12px">kWh, last 12 months</div>
        ${d.rows.map((rw, k) => rw.hl
          ? `<div class="row" style="position:relative;padding:22px 4px 10px;border-top:2px dashed rgba(0,0,0,.25)"><div class="elite" style="font-size:38px">${esc(rw.label)}</div><div class="mkr" style="font-size:118px;line-height:1.05;color:${RED};margin-left:30px">${esc(rw.value)}</div><svg class="ring" width="760" height="230" style="position:absolute;left:0;top:40px;overflow:visible"></svg></div>`
          : `<div class="row" style="display:flex;justify-content:space-between;align-items:baseline;padding:20px 4px;border-top:2px dashed rgba(0,0,0,.25)"><span class="elite" style="font-size:38px">${esc(rw.label)}</span><span class="elite" style="font-size:38px;opacity:.5">${esc(rw.value)}</span></div>`).join("")}
      </div></div>`);
      root.appendChild(el);
      const pe = piece(el, 9710 + si, { x: 110, y: 270, rot: -1.5 });
      const rowEls = [...el.querySelectorAll(".row")];
      const svg = svgBox(root, W, H, 8);
      const hi = d.rows.findIndex(r => r.hl);
      const ats = d.rows.map((rw, k) => (rw.cue ? after(at(si, rw.cue, .3, sc.start + 1.5), sc.start + .6) : sc.start + .5 + k * .3));
      const ring = stroke(el.querySelector(".ring"), roughPath(ellipsePts(360, 95, 350, 90, 1.12, 60, 9720 + si), 9721, 5), RED, 9);
      const st = V().stampEl(d.stamp, 96, RED); root.appendChild(st);
      const sa = after(at(si, d.stampCue, .1, ats[hi] + .5), ats[hi] + .4);
      const note = h(`<div class="piece" style="z-index:9"><div class="sticky" style="background-color:${Y};padding:30px 34px 40px;width:400px;clip-path:${torn(9730 + si, 3, 8)}"><div class="mkr" style="font-size:56px;line-height:1.02">${esc(d.note)}</div></div></div>`);
      note.appendChild(tape(120, -22, -6, 160)); root.appendChild(note);
      const na = after(at(si, d.noteCue, .2, sent(si, 1).start), sa + .5);
      const pn = piece(note, 9740 + si, { x: 620, y: 1040, rot: 5 });
      ev(sc.start + .15, "tear"); ats.forEach(a => ev(a, "type")); ev(ats[hi] + .5, "pencil"); ev(sa + .18, "stamp"); ev(na + .2, "slap");
      return t => {
        placePiece(pe, t, sc.start, { dx: 0, dy: -1300, rot: 0 }, .55);
        rowEls.forEach((r, k) => { r.style.opacity = clamp((t - ats[k]) * 4); });
        ring.draw(ioCubic(p(t, ats[hi] + .5, .5)));
        V().placeStamp(st, t, sa, 120, 1050, -10);
        placePiece(pn, t, na, { dx: 600, dy: 200, rot: 20 }, .4);
      };
    },

    sides(sc, si, root) {
      root.appendChild(window.bgLayer("split", si));
      const d = sc.data;
      const card = (side, k) => h(`<div class="piece" style="width:900px;z-index:${5 + k}"><div class="${k ? "yellow" : "paper"}" style="padding:30px 44px 44px;clip-path:${torn(9800 + si * 3 + k, 7)}">
        <div class="chip" style="background:${k ? INK : RED};color:${k ? Y : "#F4F0E6"};font-size:40px;transform:rotate(${k ? 1.5 : -1.5}deg)">${esc(side.who.toUpperCase())}</div>
        <div class="bod" style="font-size:66px;line-height:1.04;margin-top:22px">${esc(side.says)}</div></div></div>`);
      const L = card(d.left, 0), R = card(d.right, 1);
      root.appendChild(L); root.appendChild(R);
      const vs = h(`<div class="piece" style="z-index:9"><div style="width:170px;height:170px;border-radius:50%;background:${INK};display:flex;align-items:center;justify-content:center;clip-path:${torn(9810 + si, 5, 30)}"><span class="rub" style="font-size:66px;color:${Y}">VS</span></div></div>`);
      root.appendChild(vs);
      const la = sc.start + .2, ra = after(at(si, d.right.cue, .3, sent(si, 1).start), la + 1);
      ev(la + .25, "slap"); ev(ra - .2, "thump"); ev(ra + .25, "slap");
      const pl = piece(L, 9820 + si, { x: 90, y: 260, rot: -2 }), pr = piece(R, 9821 + si, { x: 70, y: 760, rot: 1.8 }), pv = piece(vs, 9822 + si, { x: 820, y: 640, rot: -8 });
      return t => {
        placePiece(pl, t, la, { dx: -1000, dy: 0, rot: -12 }, .42);
        placePiece(pv, t, ra - .4, { dx: 0, dy: 0, rot: -60, s: .2 }, .3);
        placePiece(pr, t, ra, { dx: 1000, dy: 0, rot: 12 }, .42);
      };
    },

    doc(sc, si, root) {
      root.appendChild(window.bgLayer("kraft", si));
      const d = sc.data;
      const el = h(`<div class="piece" style="width:880px"><div class="paper" style="background-color:#F6F2E8;padding:50px 56px 70px;clip-path:${torn(9900 + si, 6)}">
        <div class="elite" style="font-size:28px;letter-spacing:2px;border-bottom:3px double ${INK};padding-bottom:14px">${esc(d.head)}</div>
        <div class="bod" style="font-size:${d.title.length > 18 ? 84 : 118}px;line-height:1;margin:30px 0 26px;letter-spacing:-1.5px">${esc(d.title)}</div>
        ${d.lines.map(l => `<div class="ln elite" style="font-size:38px;line-height:1.35;margin-top:10px">${esc(l)}</div>`).join("")}
        <div style="height:120px"></div><div class="elite" style="font-size:22px;opacity:.6;border-top:2px solid rgba(0,0,0,.4);width:360px;padding-top:6px">signature</div>
      </div></div>`);
      root.appendChild(el);
      const pe = piece(el, 9910 + si, { x: 100, y: 270, rot: -1.5 });
      const lns = [...el.querySelectorAll(".ln")];
      const svg = svgBox(el, 880, 1200, 3);
      const sig = stroke(svg, roughPath([[70, 0], [110, -60], [140, 10], [180, -50], [210, 0], [260, -30], [300, -10], [380, -40]].map(([x, y]) => [x, y + 470 + 52 * lns.length + (d.title.length > 18 ? 0 : 30)]), 9920 + si, 8), "#1d2a55", 6);
      const st = V().stampEl(d.stamp, 104, RED); root.appendChild(st);
      const l0 = sc.start + .55;
      const sa = after(at(si, d.stampCue, .1, sc.start + 1.6), l0 + .3);
      ev(sc.start + .2, "slap"); lns.forEach((_, k) => ev(l0 + k * .45, "type")); ev(sa - .5, "pencil"); ev(sa + .18, "stamp");
      let pn = null, na = 0;
      if (d.note) {
        const note = h(`<div class="piece" style="z-index:9"><div class="sticky" style="background-color:${Y};padding:28px 32px 36px;width:380px;clip-path:${torn(9930 + si, 3, 8)}"><div class="mkr" style="font-size:52px;line-height:1.02">${esc(d.note)}</div></div></div>`);
        note.appendChild(tape(110, -22, 5, 150)); root.appendChild(note);
        na = after(at(si, d.noteCue, .2, sa + .9), sa + .5); ev(na + .2, "slap");
        pn = piece(note, 9940 + si, { x: 620, y: 960, rot: -5 });
      }
      return t => {
        placePiece(pe, t, sc.start, { dx: 0, dy: 1200, rot: 6 }, .5);
        lns.forEach((l, k) => { l.style.opacity = clamp((t - l0 - k * .45) * 4); });
        sig.draw(ioCubic(p(t, sa - .55, .45)));
        V().placeStamp(st, t, sa, 420, 820, -12);
        if (pn) placePiece(pn, t, na, { dx: 500, dy: 300, rot: 25 }, .4);
      };
    },

    rules(sc, si, root) {
      root.appendChild(window.bgLayer("grid", si));
      const d = sc.data, n = d.items.length, mark = d.mark || "x";
      const ti = h(`<div class="piece"><div class="black arc" style="padding:18px 34px 22px;font-size:56px;color:${Y};clip-path:${torn(10000 + si, 5)}">${esc(d.title)}</div></div>`);
      root.appendChild(ti);
      const step = n > 3 ? 172 : 260, fs = n > 3 ? 58 : 68;
      const cols = [Y, "#FBFAF6", "#F3D27A", "#FBFAF6", Y];
      const notes = d.items.map((it, k) => {
        const el = h(`<div class="piece" style="z-index:${4 + k}"><div class="sticky" style="background-color:${cols[k % cols.length]};padding:24px 40px 30px;clip-path:${torn(10010 + si * 7 + k, 3, 10)}"><div class="mkr" style="font-size:${fs}px;line-height:1.05;${n > 3 ? "white-space:nowrap" : "max-width:640px"}">${esc(it.t)}</div></div></div>`);
        if (k % 2 === 0) el.appendChild(tape(40, -20, -8, 130));
        root.appendChild(el); return el;
      });
      const svg = svgBox(root, W, H, 12);
      const ats = d.items.map((it, k) => after(at(si, it.cue, .35, sc.start + .6 + k * .9), sc.start + .35 + k * .25));
      for (let k = 1; k < n; k++) ats[k] = Math.max(ats[k], ats[k - 1] + .35);
      const pcs = notes.map((el, k) => piece(el, 10020 + si * 7 + k, { x: (mark === "check" ? 170 : 70) + (k % 2) * 90, y: 420 + k * step, rot: (k % 2 ? 2 : -2) }));
      const marks = notes.map((el, k) => {
        const y = 420 + k * step + 50, x0 = 70 + (k % 2) * 90;
        if (mark === "check") return stroke(svg, roughPath([[40, y + 20], [85, y + 75], [165, y - 40]], 10030 + k, 6), RED, 18);
        return stroke(svg, roughPath([[x0 + 10, y + 26], [x0 + 340, y + 34], [x0 + 760, y + 18]], 10040 + k, 6), RED, 12);
      });
      ev(sc.start + .15, "slap"); ats.forEach(a => { ev(a + .25, "slap"); ev(a + .6, mark === "check" ? "pencil" : "scribble"); });
      return t => {
        placePiece(piece(ti, 10050 + si, { x: 60, y: 280, rot: -2 }), t, sc.start, { dx: -900, dy: 0, rot: -8 }, .35);
        pcs.forEach((pc, k) => placePiece(pc, t, ats[k], { dx: k % 2 ? 900 : -900, dy: 60, rot: k % 2 ? 16 : -16 }, .38));
        marks.forEach((m, k) => m.draw(ioCubic(p(t, ats[k] + .55, .3))));
      };
    },

    toggles(sc, si, root) {
      root.appendChild(window.bgLayer("ink", si));
      const d = sc.data;
      const row = (it) => {
        const off = it.value === "OFF";
        const right = off
          ? `<div class="tg" style="position:relative;width:140px;height:76px;border-radius:40px;background:${Y};border:5px solid ${INK}"><i style="position:absolute;top:6px;left:66px;width:54px;height:54px;border-radius:50%;background:${INK};display:block"></i></div>`
          : `<div class="val chip" style="background:${INK};color:${Y};font-size:52px">${esc(it.value)}</div>`;
        return `<div class="row" style="display:flex;justify-content:space-between;align-items:center;padding:30px 0;border-top:3px solid rgba(20,20,20,.15)"><div style="font-weight:800;font-size:46px">${esc(it.label)}</div>${right}</div>`;
      };
      const ph = h(`<div class="piece" style="width:800px"><div class="paper" style="padding:60px 54px 70px;border-radius:70px;border:16px solid ${INK};clip-path:${torn(10100 + si, 5, 30)}">
        <div style="width:200px;height:20px;border-radius:12px;background:${INK};margin:-30px auto 30px"></div>
        <div class="bod" style="font-size:70px;line-height:1;margin-bottom:20px">${esc(d.title)}</div>
        ${d.items.map(row).join("")}</div></div>`);
      root.appendChild(ph);
      const pp = piece(ph, 10110 + si, { x: 140, y: 250, rot: -1.5 });
      const rows = [...ph.querySelectorAll(".row")];
      const ats = d.items.map((it, k) => after(at(si, it.cue, .25, sc.start + .7 + k * .8), sc.start + .5 + k * .2));
      for (let k = 1; k < ats.length; k++) ats[k] = Math.max(ats[k], ats[k - 1] + .35);
      ats.forEach((a, k) => ev(a + .15, d.items[k].value === "OFF" ? "click" : "thump"));
      let pn = null, na = 0;
      if (d.note) {
        const note = h(`<div class="piece" style="z-index:9"><div class="sticky" style="background-color:${Y};padding:24px 30px 32px;width:360px;clip-path:${torn(10120 + si, 3, 8)}"><div class="mkr" style="font-size:50px;line-height:1.02">${esc(d.note)}</div></div></div>`);
        note.appendChild(tape(100, -22, 4, 150)); root.appendChild(note);
        na = after(at(si, d.noteCue, .2, sent(si, 1).start), ats[ats.length - 1] + .4); ev(na + .2, "slap");
        pn = piece(note, 10130 + si, { x: 640, y: 1000, rot: 6 });
      }
      ev(sc.start + .2, "slide");
      return t => {
        placePiece(pp, t, sc.start, { dx: 0, dy: 1300, rot: 8 }, .5);
        rows.forEach((r, k) => {
          const it = d.items[k], q = p(t, ats[k], .25);
          if (it.value === "OFF") {
            const tg = r.querySelector(".tg"), knob = tg.firstChild;
            knob.style.left = `${lerp(66, 6, oCubic(q)).toFixed(0)}px`;
            tg.style.background = q > .5 ? "#CFC8B8" : Y;
            r.style.opacity = 1;
          } else {
            const v = r.querySelector(".val");
            v.style.transform = `scale(${t < ats[k] ? 0 : lerp(1.8, 1, oBack(q)).toFixed(3)}) rotate(${lerp(-12, -2, q).toFixed(1)}deg)`;
          }
        });
        if (pn) placePiece(pn, t, na, { dx: 500, dy: 300, rot: 25 }, .4);
      };
    },

    flipstat(sc, si, root) {
      root.appendChild(window.bgLayer("riso", si));
      const d = sc.data;
      const pre = h(`<div class="piece"><div class="black elite" style="padding:16px 30px 20px;font-size:44px;color:#F4F0E6;clip-path:${torn(10200 + si, 4)}">${esc(d.pre)}</div></div>`);
      root.appendChild(pre);
      const ca = after(at(si, d.cue, .35, sent(si, 0).end - 1), sc.start + (d.from ? 1.2 : .5));
      let from = null, s1 = null, s2 = null, letters = [], t0 = sc.start + .15, gap = .07;
      if (d.from) {
        const rr = ransom3([[d.from]], 250, 10210 + si); from = rr.box; letters = rr.letters;
        from.style.top = "420px"; root.appendChild(from);
        const svg = svgBox(root, W, H, 9);
        s1 = stroke(svg, roughPath([[170, 470], [540, 560], [920, 650]], 10220 + si, 8), RED, 26);
        s2 = stroke(svg, roughPath([[180, 650], [560, 560], [910, 460]], 10221 + si, 8), RED, 26);
        letters.forEach((_, i) => ev(t0 + i * gap, "snip"));
        ev(ca - .55, "scribble"); ev(ca - .3, "scribble");
      }
      const big = h(`<div class="piece" style="z-index:10"><div class="black" style="padding:30px 56px 44px;clip-path:${torn(10230 + si, 8)}"><div class="bod" style="font-size:${d.to.length > 5 ? 190 : 260}px;line-height:.95;color:${Y};letter-spacing:-4px"><span>${esc(d.to)}</span></div><div class="mkr" style="font-size:50px;color:#F4F0E6;max-width:820px;line-height:1.08;margin-top:10px">${esc(d.label)}</div></div></div>`);
      root.appendChild(big);
      ev(ca + .25, "stamp"); ev(sc.start + .1, "slap");
      const pp = piece(pre, 10240 + si, { x: 60, y: 285, rot: -2 }), pb = piece(big, 10250 + si, { x: 70, y: d.from ? 790 : 540, rot: -2.5 });
      const span = big.querySelector("span"), num = parseFloat(d.to.replace(/[^0-9.]/g, "")), dec = (d.to.split(".")[1] || "").replace(/[^0-9]/g, "").length, pfx = d.to.match(/^[^0-9]*/)[0], sfx = d.to.match(/[^0-9.,]*$/)[0];
      return t => {
        placePiece(pp, t, sc.start, { dx: -900, dy: 0, rot: -8 }, .35);
        if (from) { V().showLetters(letters, t, t0, gap, 10260 + si); s1.draw(ioCubic(p(t, ca - .6, .25))); s2.draw(ioCubic(p(t, ca - .35, .25))); }
        placePiece(pb, t, ca, { dx: 0, dy: 0, rot: -10, s: 2.2 }, .3);
        const k = oCubic(p(t, ca, .6));
        span.textContent = pfx + (num * k).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + sfx;
      };
    },

    versus(sc, si, root) {
      root.appendChild(window.bgLayer("cream", si));
      const d = sc.data;
      root.appendChild(h(`<div style="position:absolute;left:-40px;top:230px;width:600px;height:1300px;background:${Y};background-image:var(--blotch),var(--grain);clip-path:${torn(10300 + si, 9, 14)}"></div>`));
      const robot = paperRobot(1, 10310 + si); root.appendChild(robot);
      const pr = piece(robot, 10311 + si, { x: 70, y: 330, rot: -3 });
      const f = V().figure(root, d.right.fig, 760, 10320 + si, { x: 0, y: 0, rot: 0 });
      f.pc.base = { x: W - f.w + 40, y: 1060 - 760, rot: 2 };
      const tag = (side, k) => h(`<div class="piece" style="width:470px;z-index:7"><div class="tag ${k ? "" : "y"}" style="padding:20px 30px 26px 80px"><div class="hole"></div><div class="elite" style="font-size:30px">${esc(side.label)}</div><div class="arc" style="font-size:88px;line-height:1">${esc(side.price)}</div><div class="elite" style="font-size:24px;margin-top:6px">${esc(d.unit || "")}</div></div></div>`);
      const tl = tag(d.left, 0), tr = tag(d.right, 1); root.appendChild(tl); root.appendChild(tr);
      const vs = ransom3([["VS"]], 130, 10340 + si, true); vs.box.style.top = "300px"; root.appendChild(vs.box);
      const svg = svgBox(root, W, H, 12);
      const ring = stroke(svg, roughPath(ellipsePts(270, 1015, 290, 125, 1.15, 60, 10350 + si), 10351, 5), RED, 12);
      const cheap = h(`<div class="piece" style="z-index:13">${marker("cheaper!", 76, RED).outerHTML}</div>`); root.appendChild(cheap);
      const la = after(at(si, d.left.cue, .3, sent(si, 1).start + .4), sc.start + .8), ra = after(at(si, d.right.cue, .3, la + 1.2), la + .6);
      ev(sc.start + .2, "slide"); ev(sc.start + .5, "slide"); ev(la + .2, "slap"); ev(ra + .2, "slap"); ev(ra + .7, "pencil"); ev(ra + 1.1, "slap");
      const ptl = piece(tl, 10360 + si, { x: 30, y: 920, rot: -4 }), ptr = piece(tr, 10361 + si, { x: 570, y: 960, rot: 3 }), pc = piece(cheap, 10363 + si, { x: 160, y: 1140, rot: -6 });
      return t => {
        V().showLetters(vs.letters, t, sc.start + .1, .08, 10370 + si);
        V().placeStep(pr, t, sc.start + .1, { dx: -600, dy: 0, rot: 0 }, .5, 4);
        V().placeStep(f.pc, t, sc.start + .4, { dx: 600, dy: 0, rot: 0 }, .5, 4);
        placePiece(ptl, t, la, { dx: 0, dy: 0, rot: -14, s: 1.9 }, .3);
        placePiece(ptr, t, ra, { dx: 0, dy: 0, rot: 14, s: 1.9 }, .3);
        ring.draw(ioCubic(p(t, ra + .6, .45)));
        placePiece(pc, t, ra + 1, { dx: 0, dy: 0, rot: 0, s: .4 }, .3);
      };
    },

    cards(sc, si, root) {
      root.appendChild(window.bgLayer("ink", si));
      const d = sc.data;
      const f = V().figure(root, d.fig, 820, 10400 + si, { x: 0, y: 0, rot: 0 });
      f.pc.base = { x: W - f.w + 80, y: 1440 - 820, rot: -1.5 }; f.pc.el.style.zIndex = 2;
      const TASKS = ["Drive a truck", "Pack boxes", "Stock shelves", "Weld a seam", "Wash dishes", "Lift a patient", "Fix an engine", "Sort mail", "Mop a floor", "Pick fruit", "Lay bricks", "Cook a meal"];
      const r = rng(10410 + si), N = 60, D = sc.end - sc.start;
      const cards = Array.from({ length: N }, (_, i) => {
        const el = h(`<div class="piece" style="z-index:3"><div class="paper elite" style="width:250px;padding:14px 16px 18px;font-size:26px;background-color:${i % 5 ? "#F4EFE3" : "#FBF3C4"};background-image:linear-gradient(rgba(200,55,45,.5) 2px,transparent 2px),var(--grain);background-size:100% 46px,auto;background-position:0 44px,0 0;clip-path:${torn(10420 + i, 2, 6)}">${esc(TASKS[i % TASKS.length])}</div></div>`);
        root.appendChild(el);
        return { pc: piece(el, 10430 + i, { x: 20 + r() * 640, y: 1350 - r() * (300 + (i / N) * 900), rot: (r() - .5) * 50 }), at: sc.start + .3 + (i / N) * D * .7 + r() * .2 };
      });
      for (let k = 0; k < 8; k++) ev(sc.start + .4 + k * (D * .7 / 8), "paper");
      const items = d.items.map((it, k) => {
        const el = h(`<div class="piece" style="z-index:8"><div class="${k ? "yellow" : "black"}" style="padding:22px 38px 28px;clip-path:${torn(10500 + k + si, 7)}"><div class="${k ? "bod" : "arc"}" style="font-size:${k ? 120 : 140}px;line-height:1;color:${k ? INK : Y}">${esc(it.big)}</div><div style="font-weight:800;font-size:40px;margin-top:4px;color:${k ? INK : "#F4F0E6"}">${esc(it.small)}</div></div></div>`);
        root.appendChild(el);
        const a = after(at(si, it.cue, .3, sc.start + 1 + k * 2), sc.start + .5 + k);
        ev(a + .25, "thump");
        return { pc: piece(el, 10510 + k, { x: 60 + k * 40, y: 330 + k * 330, rot: [-3, 2][k] || 0 }), a };
      });
      return t => {
        V().placeStep(f.pc, t, sc.start, { dx: 600, dy: 0, rot: 0 }, .5, 4);
        cards.forEach(({ pc, at: a }) => {
          if (t < a) { pc.el.style.visibility = "hidden"; return; }
          pc.el.style.visibility = "visible";
          const k = clamp((t - a) / .6), y = lerp(-300, pc.base.y, k * k);
          pc.el.style.transform = `translate(${pc.base.x.toFixed(0)}px,${y.toFixed(0)}px) rotate(${(pc.base.rot * (0.4 + .6 * k)).toFixed(1)}deg)`;
        });
        items.forEach(({ pc, a }) => placePiece(pc, t, a, { dx: 0, dy: 0, rot: -8, s: 1.8 }, .3));
      };
    },

    timeline(sc, si, root) {
      root.appendChild(window.bgLayer("kraft", si));
      const d = sc.data, span = d.to - d.from;
      const x0 = 80, x1 = 1000, y = 760;
      const ticks = Array.from({ length: span / 2 + 1 }, (_, k) => {
        const yr = d.from + k * 2, x = (k * 2) / span * (x1 - x0);
        const major = (k * 2) % 10 === 0 || k === 0;
        return `<i style="position:absolute;left:${x.toFixed(0)}px;top:0;width:4px;height:${major ? 54 : 28}px;background:${INK};display:block"></i>${major ? `<span class="arc" style="position:absolute;left:${(x - 50).toFixed(0)}px;top:62px;width:100px;text-align:center;font-size:32px">${yr}</span>` : ""}`;
      }).join("");
      const ruler = h(`<div class="piece" style="width:${x1 - x0 + 60}px;z-index:4"><div class="yellow" style="position:relative;height:130px;padding:0 30px;clip-path:${torn(10600 + si, 3, 30)}"><div style="position:relative;height:100%">${ticks}</div></div></div>`);
      root.appendChild(ruler);
      const pr = piece(ruler, 10610 + si, { x: x0 - 30, y, rot: -2 });
      const svg = svgBox(root, W, H, 6);
      const line = stroke(svg, roughPath([[x0, y - 40], [(x0 + x1) / 2, y - 70], [x1, y - 76]], 10620 + si, 6), RED, 12);
      const bot = paperRobot(.32, 10630 + si); root.appendChild(bot); bot.style.zIndex = 7;
      const chip = h(`<div class="piece" style="width:430px;z-index:7"><div class="tag" style="padding:18px 26px 22px 80px"><div class="hole"></div><div class="elite" style="font-size:28px">robot costs</div><div class="arc" style="font-size:72px;line-height:1">${esc(d.chip)}</div></div></div>`);
      root.appendChild(chip);
      const big = h(`<div class="piece" style="z-index:8"><div class="black" style="padding:24px 40px 30px;clip-path:${torn(10640 + si, 7)}"><div class="arc" style="font-size:130px;line-height:1;color:${Y}">${esc(d.label)}</div><div class="mkr" style="font-size:46px;color:#F4F0E6;margin-top:6px">${esc(d.note)}</div></div></div>`);
      root.appendChild(big);
      const ca = sc.start + .4, la = after(at(si, "at that pace", .1, sent(si, 1).start), ca + .8), ba = after(at(si, d.cue, .3, sent(si, 1).end - 1.2), la + 1);
      ev(sc.start + .15, "slap"); ev(ca + .2, "slap"); ev(la, "pencil"); ev(ba + .25, "thump");
      const pc = piece(chip, 10650 + si, { x: 80, y: 300, rot: -3 }), pb = piece(big, 10660 + si, { x: 140, y: 960, rot: 2 });
      return t => {
        placePiece(pr, t, sc.start, { dx: -1200, dy: 0, rot: -6 }, .45);
        placePiece(pc, t, ca, { dx: 0, dy: 0, rot: -14, s: 1.9 }, .3);
        const k = ioCubic(p(t, la, Math.max(.6, ba - la)));
        line.draw(k);
        if (t < sc.start + .3) bot.style.visibility = "hidden"; else {
          bot.style.visibility = "visible";
          const q = Math.floor(t * 6) % 2;
          bot.style.transform = `translate(${(x0 - 60 + k * (x1 - x0)).toFixed(0)}px,${(y - 300 - k * 30 - q * 6).toFixed(0)}px) rotate(${q ? 4 : -4}deg)`;
        }
        placePiece(pb, t, ba, { dx: 0, dy: 0, rot: -8, s: 1.8 }, .3);
      };
    },
  });

  // ── reel chrome: sticker logo, kinetic captions ──────────────────────────
  const baseBuildCaptions = window.buildCaptions;
  window.buildCaptions = function () {
    if (window.BOARD.format !== "reel") return baseBuildCaptions();
    for (const sc of T.scenes) for (const s of sc.sentences) {
      let timed;
      if (Array.isArray(s.words) && s.words.length) timed = s.words.map(x => ({ w: x.w, st: x.start, en: x.end }));
      else {
        const words = s.text.split(/\s+/), weight = words.map(w => w.length + 1.5), tot = weight.reduce((a, b) => a + b, 0);
        let acc = 0;
        timed = words.map(w => { const st = s.start + (acc / tot) * (s.end - s.start); acc += w.length + 1.5; return { w, st, en: s.start + (acc / tot) * (s.end - s.start) }; });
      }
      let chunk = [];
      const flush = () => { if (chunk.length) CAPS.push({ words: chunk, st: chunk[0].st, en: chunk[chunk.length - 1].en }); chunk = []; };
      for (const x of timed) { chunk.push(x); const len = chunk.map(c => c.w).join(" ").length; if (len > 13 || /[.,:;?!]$/.test(x.w)) flush(); }
      flush();
    }
  };
  const baseRenderCaption = window.renderCaption;
  window.renderCaption = function (t) {
    if (window.BOARD.format !== "reel") return baseRenderCaption(t);
    const el = document.getElementById("cap");
    const i = CAPS.findIndex(c => t >= c.st - .05 && t < c.en + .1);
    if (i < 0) { el.innerHTML = ""; return; }
    const c = CAPS[i], k = oBack(p(t, c.st - .05, .14));
    el.innerHTML = `<span style="transform:rotate(${(hash(i, 3) - .5) * 4}deg) scale(${lerp(.82, 1, k).toFixed(3)})">${c.words.map(w => t >= w.st - .03 && t < w.en + .02 ? `<em>${esc(w.w)}</em>` : esc(w.w)).join(" ")}</span>`;
    document.documentElement.style.setProperty("--capclip", torn(500 + i, 4, 10));
  };
  const baseSetup = window.setup;
  window.setup = function () {
    const info = baseSetup();
    if (window.BOARD.format === "reel") {
      const head = document.getElementById("head");
      head.className = "reel"; head.innerHTML = `${MARK}<b>AI Broadsheet</b>`;
      head.style.clipPath = torn(77, 3, 8);
      document.getElementById("prog").style.display = "none";
      document.getElementById("cap").classList.add("reel");
    }
    return info;
  };
})();
