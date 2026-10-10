// AI Broadsheet collage explainer, v2: mixed-media backgrounds (kraft, cream,
// newsprint, split red, slate), scissor-cut figures from public-domain photos,
// ransom-note letters, red pencil, coffee stains, price tags, receipts, bars.
// Loaded after collage.html's main script; adds builders to BUILD.
(() => {
  const A = n => `ASSET_DIR/${n}`;
  const RED = "#C8372D", CREAM = "#F2EDE2";
  const NEWS = ["newsprint/page-a.jpg", "newsprint/page-b.jpg"];
  const figSize = name => (B.assets && B.assets.figs && B.assets.figs[name]) || [800, 1000];
  const css = document.createElement("style");
  css.textContent = `
  .bg2{position:absolute;inset:-40px;overflow:hidden;background-image:var(--blotch),var(--grain)}
  .np{position:absolute;overflow:hidden}
  .np img{width:100%;height:100%;object-fit:cover;display:block}
  .stain{position:absolute;border-radius:50%;mix-blend-mode:multiply}
  .fig{filter:drop-shadow(0 22px 22px rgba(0,0,0,.45)) drop-shadow(0 3px 3px rgba(0,0,0,.35))}
  .fig img{display:block}
  .rl{display:inline-block;font-size:var(--fs);line-height:1;padding:.08em .14em .1em;margin:0 .03em;vertical-align:middle}
  .anton{font-family:Anton,Impact,sans-serif;letter-spacing:.5px}
  .elite{font-family:Elite,monospace}
  .hand{font-family:Hand,cursive}
  .strip{display:inline-block;font-family:Anton,sans-serif;line-height:.92;padding:.06em .22em .1em}
  .tag{position:relative;background:#E9DFC7;background-image:var(--blotch),var(--grain);clip-path:polygon(9% 0,100% 0,100% 100%,9% 100%,0 50%)}
  .tag.y{background-color:var(--y)}
  .tag .hole{position:absolute;left:5.5%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#2a2723;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)}
  .rcpt{background:#FBFAF6;background-image:var(--grain)}
  .poly{background:#FBFAF6;padding:12px 12px 34px;background-image:var(--grain)}
  .poly div{width:150px;height:150px;background-size:cover;background-position:center;filter:grayscale(1) contrast(1.1)}
  `;
  document.head.appendChild(css);

  // ── decor ──────────────────────────────────────────────────────────────────
  function svgEl(parent, z = 1) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", W + 80); s.setAttribute("height", H + 80);
    s.style.cssText = `position:absolute;left:0;top:0;z-index:${z};overflow:visible;pointer-events:none`;
    parent.appendChild(s); return s;
  }
  function path(svg, d, color, w, op = 1, extra = "") {
    const e = document.createElementNS("http://www.w3.org/2000/svg", "path");
    e.setAttribute("d", d); e.setAttribute("fill", "none"); e.setAttribute("stroke", color);
    e.setAttribute("stroke-width", w); e.setAttribute("stroke-linecap", "round"); e.setAttribute("stroke-linejoin", "round");
    e.setAttribute("opacity", op); if (extra) e.setAttribute("style", extra);
    svg.appendChild(e); return e;
  }
  /** Loose pencil hatching, like the red crayon marks in a sketchbook collage. */
  function scribble(svg, x, y, w, hgt, seed, color = RED, n = 12, width = 3) {
    const r = rng(seed); let d = "";
    for (let i = 0; i < n; i++) {
      const x0 = x + r() * w, y0 = y + r() * hgt, len = 120 + r() * 260, a = -1.2 + r() * .5;
      d += `M${x0.toFixed(0)} ${y0.toFixed(0)} q ${(len * .5 * Math.cos(a) + (r() - .5) * 40).toFixed(0)} ${(len * .5 * Math.sin(a) + (r() - .5) * 40).toFixed(0)} ${(len * Math.cos(a)).toFixed(0)} ${(len * Math.sin(a)).toFixed(0)} `;
    }
    path(svg, d, color, width, .78); path(svg, d, color, width * .45, .5, "transform:translate(3px,2px)");
  }
  function zigzag(svg, x, y, w, seed, color = "#2a2a2a") {
    const r = rng(seed); let d = `M${x} ${y}`;
    for (let i = 0; i < 9; i++) d += ` L${(x + (i + 1) * w / 9).toFixed(0)} ${(y + (i % 2 ? -1 : 1) * (18 + r() * 26)).toFixed(0)}`;
    path(svg, d, color, 2.2, .7);
  }
  function stain(parent, x, y, size, seed) {
    const r = rng(seed), c = "110,62,18";
    const s = h(`<div class="stain"></div>`);
    s.style.cssText += `left:${x}px;top:${y}px;width:${size}px;height:${size * (0.9 + r() * .2)}px;background:radial-gradient(closest-side,rgba(${c},.05) 0%,rgba(${c},.07) 62%,rgba(${c},.34) 71%,rgba(${c},.12) 77%,transparent 84%);transform:rotate(${(r() * 90).toFixed(0)}deg)`;
    parent.appendChild(s);
    for (let i = 0; i < 4; i++) { // drips
      const d = h(`<div class="stain"></div>`), ds = 10 + r() * 22;
      d.style.cssText += `left:${(x + r() * size * 1.3 - size * .15).toFixed(0)}px;top:${(y + r() * size * 1.3 - size * .15).toFixed(0)}px;width:${ds}px;height:${ds}px;background:radial-gradient(closest-side,rgba(${c},.45),rgba(${c},.18) 70%,transparent)`;
      parent.appendChild(d);
    }
  }
  function paint(svg, x, y, len, seed) {
    const r = rng(seed); const a = -0.5 + r() * .4;
    const d = `M${x} ${y} q ${(len * .5).toFixed(0)} ${(-30 + r() * 60).toFixed(0)} ${(len * Math.cos(a)).toFixed(0)} ${(len * Math.sin(a)).toFixed(0)}`;
    path(svg, d, "#FBF8F0", 30, .5, "filter:url(#none)"); path(svg, d, "#FBF8F0", 12, .65, "transform:translate(8px,10px)");
  }
  function newsPiece(parent, src, x, y, w, hgt, rot, seed, filter, op = 1) {
    const e = h(`<div class="np"><img src="${A(src)}"></div>`);
    e.style.cssText += `left:${x}px;top:${y}px;width:${w}px;height:${hgt}px;transform:rotate(${rot}deg);clip-path:${torn(seed, 9)};opacity:${op}`;
    e.firstChild.style.filter = filter;
    e.firstChild.style.objectPosition = `${(hash(seed) * 100).toFixed(0)}% ${(hash(seed, 2) * 100).toFixed(0)}%`;
    parent.appendChild(e); return e;
  }

  window.bgLayer = (kind, si) => {
    const el = h(`<div class="bg2"></div>`), seed = 5000 + si * 97, r = rng(seed);
    const svg = () => svgEl(el, 3);
    if (kind === "kraft") {
      el.style.backgroundColor = "#C2924A";
      newsPiece(el, NEWS[si % 2], 40 + r() * 80, 120, 640, 980, -3 + r() * 6, seed + 1, "grayscale(1) sepia(.5) contrast(1.05)", .55);
      newsPiece(el, NEWS[(si + 1) % 2], 560, 900 + r() * 160, 540, 700, 4 - r() * 6, seed + 2, "grayscale(1) sepia(.35)", .45);
      stain(el, 700 + r() * 200, 200 + r() * 200, 300, seed + 3); stain(el, 40, 1350, 240, seed + 4);
      const s = svg(); scribble(s, 600, 260, 420, 600, seed + 5); scribble(s, 40, 1150, 400, 400, seed + 6, "#3a342c", 7, 2); paint(s, 80, 1600, 380, seed + 7);
      const t = h(`<div style="position:absolute;left:${720 + r() * 120}px;top:60px;width:200px;height:56px;background:#151515;transform:rotate(${(-6 + r() * 12).toFixed(1)}deg);clip-path:${torn(seed + 8, 4, 6)}"></div>`); el.appendChild(t);
    } else if (kind === "cream") {
      el.style.backgroundColor = "#EBE3D2";
      const grid = h(`<div style="position:absolute;right:20px;top:${260 + r() * 300}px;width:420px;height:620px;background-color:#F4F1EA;background-image:linear-gradient(rgba(60,80,110,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(60,80,110,.22) 1px,transparent 1px);background-size:28px 28px;transform:rotate(${(2 - r() * 4).toFixed(1)}deg);clip-path:${torn(seed + 1, 6)};box-shadow:0 6px 12px rgba(0,0,0,.15)"></div>`); el.appendChild(grid);
      newsPiece(el, NEWS[si % 2], 30, 1180, 560, 420, -2, seed + 2, "grayscale(1) contrast(1.1)", .8);
      stain(el, 60, 260, 260, seed + 3);
      const s = svg(); scribble(s, 100, 1400, 600, 300, seed + 4, "#2d2a26", 9, 2); zigzag(s, 640, 1260, 360, seed + 5, RED);
    } else if (kind === "newsprint") {
      el.style.backgroundColor = "#D9D4C7";
      newsPiece(el, NEWS[si % 2], 0, 0, W + 80, H + 80, 0, seed + 1, "grayscale(1) contrast(1.15) brightness(1.02)", 1);
      el.lastChild.style.clipPath = "none";
      el.appendChild(h(`<div style="position:absolute;inset:0;background:rgba(18,18,18,.22)"></div>`));
      const s = svg(); scribble(s, 650, 1450, 380, 300, seed + 2, RED, 9, 3);
    } else if (kind === "split") {
      el.style.backgroundColor = "#D9D4C7";
      newsPiece(el, NEWS[0], 0, 0, 560, H + 80, 0, seed + 1, "grayscale(1) contrast(1.2)", 1); el.lastChild.style.clipPath = "none";
      const right = newsPiece(el, NEWS[1], 540, 0, 600, H + 80, 0, seed + 2, "grayscale(1) contrast(1.2) brightness(1.1)", 1);
      right.style.clipPath = `polygon(3% 0,100% 0,100% 100%,0 100%,2% 40%)`;
      right.appendChild(h(`<div style="position:absolute;inset:0;background:${RED};mix-blend-mode:multiply"></div>`));
      el.appendChild(h(`<div style="position:absolute;inset:0;background:rgba(18,18,18,.12)"></div>`));
    } else if (kind === "slate") {
      el.style.backgroundColor = "#4A5867";
      for (let i = 0; i < 3; i++) {
        const st = h(`<div style="position:absolute;left:${(r() * 800).toFixed(0)}px;top:${(200 + r() * 1500).toFixed(0)}px;width:${(240 + r() * 300).toFixed(0)}px;height:${(30 + r() * 40).toFixed(0)}px;background:var(--y);background-image:var(--grain);transform:rotate(${(-8 + r() * 16).toFixed(1)}deg);clip-path:${torn(seed + 10 + i, 4, 8)};box-shadow:0 4px 8px rgba(0,0,0,.25)"></div>`);
        el.appendChild(st);
      }
      const s = svg(); const r2 = rng(seed + 20);
      const d = `M${900} ${1250} C ${1000} ${1050}, ${980} ${800}, ${880} ${640}`;
      path(s, d, "#C9D466", 9, .75, "stroke-dasharray:28 22");
      el.appendChild(h(`<div style="position:absolute;left:${(60 + r2() * 200).toFixed(0)}px;top:${(1320 + r2() * 200).toFixed(0)}px;width:150px;height:150px;border-radius:50%;background:var(--y);background-image:var(--grain);opacity:.9"></div>`));
    } else if (kind === "yellow") {
      el.style.backgroundColor = "#F5C400";
      el.appendChild(h(`<div style="position:absolute;inset:0;opacity:.08;background:repeating-linear-gradient(135deg,#111 0 3px,transparent 3px 30px)"></div>`));
      const s = svg(); scribble(s, 680, 1300, 360, 300, seed + 2, "#141414", 7, 2.5);
    } else {
      el.style.backgroundColor = "var(--board)";
      newsPiece(el, NEWS[si % 2], 600, 1150, 520, 600, 5, seed + 1, "grayscale(1) brightness(.55)", .5);
    }
    return el;
  };

  // ── helpers for v2 scenes ─────────────────────────────────────────────────
  function cueMaybe(si, word, lead = .12) {
    if (!word) return null;
    for (const s of T.scenes[si].sentences) {
      const i = s.text.toLowerCase().indexOf(word.toLowerCase());
      if (i >= 0) return Math.max(T.scenes[si].start, s.start + (i / s.text.length) * (s.end - s.start) - lead);
    }
    return null;
  }
  /** Cut-outs move in held steps, like paper moved by hand between frames. */
  function placeStep(pc, t, at, from, dur = .5, steps = 4) {
    const k = Math.floor(clamp((t - at) / dur) * steps) / steps;
    placePiece(pc, at + k * dur, at, from, dur);
    if (t < at) pc.el.style.visibility = "hidden";
  }
  function figure(root, name, height, seed, base) {
    const [fw, fh] = figSize(name), w = Math.round(fw * height / fh);
    const el = h(`<div class="piece fig" style="filter:none"><div class="fig"><img src="${A("figs/" + name + ".png")}" style="height:${height}px;width:${w}px"></div></div>`);
    root.appendChild(el);
    return { pc: piece(el, seed, base), w, h: height };
  }
  const STY = [
    { bg: "#141414", fg: "#F4F0E6", f: "anton" }, { bg: CREAM, fg: "#141414", f: "serif", w: 800 },
    { bg: "#F5C400", fg: "#141414", f: "grot", w: 900 }, { bg: "news", fg: "#141414", f: "anton" },
    { bg: RED, fg: "#F4F0E6", f: "anton" }, { bg: CREAM, fg: "#141414", f: "elite" },
  ];
  function ransom(words, fs, seed) {
    const box = h(`<div style="position:absolute;left:0;right:0;text-align:center"></div>`);
    const letters = []; const r = rng(seed);
    words.forEach((w, wi) => {
      const row = h(`<div style="display:flex;justify-content:center;align-items:center;margin:${wi ? 18 : 0}px 0 0"></div>`);
      [...w].forEach((ch, ci) => {
        if (ch === " ") { row.appendChild(h(`<span style="display:inline-block;width:${fs * .35}px"></span>`)); return; }
        const st = STY[Math.floor(r() * STY.length)];
        const bg = st.bg === "news" ? `background:linear-gradient(rgba(255,255,255,.5),rgba(255,255,255,.5)),url('${A(NEWS[0])}') ${Math.floor(r() * 100)}% ${Math.floor(r() * 100)}%/700px;filter:grayscale(1)` : `background-color:${st.bg};background-image:var(--grain)`;
        const fam = st.f === "anton" ? "anton" : st.f === "elite" ? "elite" : st.f === "serif" ? "serif" : "";
        const size = fs * (0.82 + r() * .3);
        const L = h(`<span class="rl ${fam}" style="--fs:${size.toFixed(0)}px;${bg};color:${st.fg};font-weight:${st.w || 400};clip-path:${torn(seed * 10 + wi * 50 + ci, 3, 5)};box-shadow:0 6px 10px rgba(0,0,0,.3)">${esc(ch)}</span>`);
        L.dataset.rot = ((r() - .5) * 14).toFixed(1); L.dataset.dy = ((r() - .5) * 18).toFixed(0);
        row.appendChild(L); letters.push(L);
      });
      box.appendChild(row);
    });
    return { box, letters };
  }
  function showLetters(letters, t, t0, gap, seed) {
    const q = Math.floor(t * FPS_Q);
    letters.forEach((L, i) => {
      const at = t0 + i * gap;
      if (t < at) { L.style.visibility = "hidden"; return; }
      L.style.visibility = "visible";
      const k = oBack(p(t, at, .18)), s = lerp(1.7, 1, k);
      const jr = (hash(seed + i, q) - .5) * 1.2;
      L.style.transform = `translateY(${L.dataset.dy}px) rotate(${(+L.dataset.rot + jr).toFixed(1)}deg) scale(${s.toFixed(3)})`;
      L.style.opacity = Math.min(1, k * 1.5);
    });
  }
  function clipEl(c, w, seed) {
    return h(`<div class="piece" style="width:${w}px"><div class="paper" style="padding:30px 38px 36px;clip-path:${torn(seed, 8)}">
      <div class="outlet"><span>${esc(c.outlet)}</span><span>${esc(c.date || "")}</span></div>
      <div class="hd" style="font-size:52px">${highlightText(c.headline, c.mark)}</div>
      <div class="bars"><i style="width:94%"></i><i style="width:70%"></i></div></div></div>`);
  }
  function stampEl(text, size = 92, color = RED) {
    const st = h(`<div style="position:absolute;left:0;top:0;z-index:8"><div class="anton" style="border:11px solid ${color};color:${color};line-height:1;padding:16px 34px 20px;white-space:nowrap;text-align:center;font-size:${size}px;letter-spacing:2px">${esc(text.toUpperCase())}</div></div>`);
    const ink = st.firstChild, m = grainSvg(0.5, 1.6, 2);
    ink.style.webkitMaskImage = m; ink.style.maskImage = m; ink.style.maskSize = "420px"; ink.style.webkitMaskSize = "420px";
    return st;
  }
  function placeStamp(st, t, at, x, y, rot) {
    if (t < at) { st.style.visibility = "hidden"; return; }
    st.style.visibility = "visible";
    const k = p(t, at, .2);
    st.style.opacity = Math.min(1, k * 2.5) * .92;
    st.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${lerp(2.3, 1, oCubic(k)).toFixed(3)})`;
  }
  const ORIG = { stamp: BUILD.stamp, scraps: BUILD.scraps, outro: BUILD.outro };

  Object.assign(BUILD, {
    ransom(sc, si, root) {
      const words = sc.data.words, n = words.join("").replace(/ /g, "").length;
      const { box, letters } = ransom(words, n > 10 ? 120 : 150, 60 + si);
      box.style.top = "300px"; root.appendChild(box);
      const t0 = sc.start + .15, gap = Math.min(.11, (sent(si, 0).end - sc.start) * .4 / n);
      letters.forEach((_, i) => { if (i % 2 === 0) ev(t0 + i * gap, "snip"); });
      const after = t0 + n * gap + .25;
      const clips = (sc.data.clips || []).slice(0, 2).map((c, k) => {
        const el = clipEl(c, k ? 860 : 900, 6100 + si * 10 + k); root.appendChild(el);
        el.appendChild(tape(k ? 600 : 120, -24, k ? 5 : -4));
        ev(after + k * .9 + .3, "slap");
        return piece(el, 6200 + k, { x: k ? 160 : 50, y: k ? 1010 : 720, rot: k ? 2.2 : -2.6 });
      });
      return t => {
        showLetters(letters, t, t0, gap, 70 + si);
        clips.forEach((pc, k) => placePiece(pc, t, after + k * .9, { dx: k ? 900 : -900, dy: 120, rot: k ? 14 : -14 }, .45));
      };
    },

    figure(sc, si, root) {
      const left = sc.data.side !== "right";
      const fh = 1080, fg = figure(root, sc.data.figure, fh, 6300 + si, { x: 0, y: 0, rot: 0 });
      fg.pc.base = { x: left ? -30 : W - fg.w + 30, y: 1430 - fh, rot: left ? 1.5 : -1.5 };
      const q = h(`<div class="piece" style="width:610px;z-index:4"><div class="paper" style="padding:44px 44px 54px;clip-path:${torn(6400 + si, 7)}">
        <div class="serif" style="font-style:italic;font-weight:600;font-size:72px;line-height:1.06">“${esc(sc.data.quote)}”</div>
        <div class="elite" style="font-size:28px;margin-top:22px">— ${esc(sc.data.credit)}</div></div></div>`);
      const und = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      und.setAttribute("width", 540); und.setAttribute("height", 40); und.style.cssText = "position:absolute;left:36px;bottom:96px;overflow:visible;z-index:3";
      q.appendChild(und); q.appendChild(tape(220, -24, 3, 170));
      root.appendChild(q);
      const line = stroke(und, roughPath([[0, 20], [270, 26], [530, 14]], 4, 4), RED, 9);
      const pq = piece(q, 6410 + si, { x: left ? 440 : 30, y: 330, rot: left ? 2 : -2 });
      const a = sc.start + .05, qa = sc.start + .6, uc = cueMaybe(si, sc.data.cue || "") ?? sent(si, 1).start;
      ev(a + .2, "slide"); ev(qa + .3, "slap"); ev(uc + .1, "pencil");
      return t => {
        placeStep(fg.pc, t, a, { dx: left ? -700 : 700, dy: 0, rot: 0 }, .6, 5);
        placePiece(pq, t, qa, { dx: left ? 800 : -800, dy: -60, rot: 10 }, .45);
        line.draw(ioCubic(p(t, uc, .5)));
      };
    },

    scraps(sc, si, root) {
      if (!sc.data.cues) return ORIG.scraps(sc, si, root);
      root.appendChild(h(`<div class="board"></div>`));
      const items = sc.data.items, n = items.length;
      const spots = [{ x: 60, y: 340, rot: -3.5 }, { x: 170, y: 640, rot: 2.6 }, { x: 80, y: 940, rot: -1.6 }].slice(0, n);
      const pcs = items.map((txt, k) => {
        const mirror = sc.data.mirror === k;
        const el = h(`<div class="piece"><div class="${k === n - 1 && !mirror ? "black" : "paper"}" style="padding:30px 46px 38px;clip-path:${torn(6500 + k + si * 7, 6)}"><div class="anton" style="font-size:${Math.min(86, 830 / (0.47 * txt.length)).toFixed(0)}px;line-height:1;white-space:nowrap;letter-spacing:1px;${k === n - 1 && !mirror ? "color:var(--y)" : ""}"><span class="mt" style="display:inline-block">${esc(txt)}</span></div></div></div>`);
        root.appendChild(el);
        if (k === 0) el.appendChild(tape(40, -22, -6, 150));
        return piece(el, 6510 + k + si * 7, spots[k]);
      });
      const at = items.map((_, k) => cueMaybe(si, sc.data.cues[k], .3) ?? sc.start + k * 1.2);
      at.forEach(x => ev(x + .3, "slap"));
      const svg = svgLayer(root); svg.style.zIndex = 6;
      const ci = sc.data.circle ?? -1;
      const ring = ci >= 0 ? stroke(svg, roughPath(ellipsePts(spots[ci].x + 400, spots[ci].y + 70, 470, 115, 1.12, 70, 5), 3, 4), RED, 12) : null;
      const rc = ci >= 0 ? at[ci] + .7 : 0;
      if (ring) ev(rc, "pencil");
      const mi = sc.data.mirror, mt = mi != null ? pcs[mi].el.querySelector(".mt") : null, flip = mi != null ? at[mi] + 1.4 : 0;
      return t => {
        pcs.forEach((pc, k) => placePiece(pc, t, at[k], { dx: k % 2 ? 900 : -900, dy: 80, rot: k % 2 ? 18 : -18 }, .45));
        if (ring) ring.draw(ioCubic(p(t, rc, .6)));
        if (mt) mt.style.transform = `scaleX(${t < flip ? -1 : lerp(-1, 1, oBack(p(t, flip, .35))).toFixed(3)})`;
      };
    },

    stamp(sc, si, root) {
      if (sc.data.page !== "note") return ORIG.stamp(sc, si, root);
      const lines = sc.data.lines || [];
      const pad = h(`<div class="piece" style="width:820px"><div style="position:relative;background:#F7E98C;background-image:linear-gradient(rgba(70,110,170,.35) 2px,transparent 2px),var(--grain);background-size:100% 64px,auto;background-position:0 150px,0 0;padding:60px 60px 90px 120px;clip-path:${torn(6600 + si, 5)}">
        <div style="position:absolute;left:92px;top:0;bottom:0;width:3px;background:rgba(200,55,45,.55)"></div>
        <div class="elite" style="font-size:52px;margin-bottom:34px">${esc(sc.data.pageTitle || "")}</div>
        ${lines.map(l => `<div class="hand" style="font-size:58px;line-height:64px;color:#1d2a55">${esc(l)}</div>`).join("")}</div></div>`);
      pad.appendChild(tape(330, -24, -3)); root.appendChild(pad);
      const st = stampEl(sc.data.stamp, 150); root.appendChild(st);
      const pp = piece(pad, 6610 + si, { x: 130, y: 340, rot: -2.5 });
      const at = cueMaybe(si, sc.data.cue || "failed", .2) ?? sent(si, 1).start;
      ev(sc.start + .3, "slap"); ev(at + .18, "stamp");
      return t => {
        placePiece(pp, t, sc.start, { dx: 0, dy: 1200, rot: 8 });
        const sh = p(t, at + .18, .25);
        if (sh > 0 && sh < 1) pp.el.style.transform += ` translate(${(Math.sin(sh * 40) * 9 * (1 - sh)).toFixed(1)}px,0)`;
        placeStamp(st, t, at, 300, 520, -12);
      };
    },

    flood(sc, si, root) {
      const fg = figure(root, sc.data.figure, 760, 6700 + si, { x: 0, y: 0, rot: 0 });
      fg.pc.base = { x: (W - fg.w) / 2 + 60, y: 1440 - 760, rot: 0 };
      fg.pc.el.style.zIndex = 2;
      const r = rng(6800 + si), N = 90;
      const LBL = ["GET /w/api.php", "GET /wiki/…", "SPARQL query", "GET /w/index.php", "action=query", "GET /entity/Q…", "crawl", "GET /w/api.php"];
      const D = sc.end - sc.start;
      const papers = Array.from({ length: N }, (_, i) => {
        const env = r() < .45, w = env ? 170 : 220, hgt = env ? 108 : 70;
        const el = h(env
          ? `<div class="piece" style="z-index:3;width:${w}px;height:${hgt}px"><div class="paper" style="width:100%;height:100%;background-color:#EFE6D2"><svg width="${w}" height="${hgt}" style="position:absolute;left:0;top:0"><path d="M2 2 L${w / 2} ${hgt * .55} L${w - 2} 2" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none"/></svg></div></div>`
          : `<div class="piece" style="z-index:3"><div class="paper elite" style="padding:12px 18px 14px;font-size:26px;white-space:nowrap;clip-path:${torn(6900 + i, 3, 6)}">${esc(LBL[i % LBL.length])}</div></div>`);
        root.appendChild(el);
        const at = sc.start + .4 + (i / N) * D * .8 + r() * .2;
        const land = 1500 - r() * (240 + (i / N) * 900);
        return { pc: piece(el, 7000 + i, { x: 20 + r() * 900, y: land, rot: (r() - .5) * 60 }), at };
      });
      for (let k = 0; k < 9; k++) ev(sc.start + .5 + k * (D * .8 / 9), "paper");
      const cards = sc.data.items.map((it, k) => {
        const el = h(`<div class="piece" style="z-index:6"><div class="black" style="padding:22px 36px 28px;clip-path:${torn(7200 + k, 7)}"><div class="anton" style="font-size:118px;line-height:1;color:var(--y)">${esc(it.big)}</div><div style="font-weight:700;font-size:36px;margin-top:6px">${esc(it.small)}</div></div></div>`);
        root.appendChild(el);
        const at = cueMaybe(si, it.cue, .25) ?? sc.start + k;
        ev(at + .25, "thump");
        return { pc: piece(el, 7300 + k, { x: 50 + k * 70, y: 300 + k * 250, rot: [-3, 2, -1.5][k] }), at };
      });
      return t => {
        placeStep(fg.pc, t, sc.start, { dx: 0, dy: 700, rot: 0 }, .5, 4);
        papers.forEach(({ pc, at }) => {
          if (t < at) { pc.el.style.visibility = "hidden"; return; }
          pc.el.style.visibility = "visible";
          const k = clamp((t - at) / .7), y = lerp(-300, pc.base.y, k * k);
          pc.el.style.transform = `translate(${pc.base.x.toFixed(0)}px,${y.toFixed(0)}px) rotate(${(pc.base.rot * (0.4 + .6 * k)).toFixed(1)}deg)`;
        });
        cards.forEach(({ pc, at }) => placePiece(pc, t, at, { dx: 0, dy: 0, rot: -8, s: 1.8 }, .3));
      };
    },

    bigwords(sc, si, root) {
      const r = rng(7400 + si);
      const ws = sc.data.words.map((w, k) => {
        const len = w.t.length, fs = Math.min(250, 900 / (0.56 * len + 0.44));
        const sty = w.s === "black" ? "background:#141414;color:#F4F0E6" : w.s === "red" ? `background:${RED};color:#F4F0E6` : `background:${CREAM};color:#141414`;
        const el = h(`<div class="piece"><div class="strip" style="font-size:${fs.toFixed(0)}px;${sty};background-image:var(--grain);clip-path:${torn(7500 + k + si, 9)}">${esc(w.t)}</div></div>`);
        root.appendChild(el);
        const x = k % 2 ? 1080 - 50 - (len * .56 + .44) * fs : 60;
        return { pc: piece(el, 7600 + k, { x: Math.max(30, x), y: 320 + k * 285, rot: (r() - .5) * 6 }), w };
      });
      const s0 = T.scenes[si].sentences[0], N = ws.length;
      const at = ws.map(({ w }, k) => cueMaybe(si, w.t.toLowerCase(), .2) ?? (s0.start + (s0.end - s0.start) * (k / N) * .8));
      at.forEach(x => ev(x + .2, "slap"));
      let note = null, pn = null, na = 0;
      if (sc.data.note) {
        note = h(`<div class="piece" style="z-index:5"><div class="paper elite" style="padding:22px 30px 26px;font-size:34px;max-width:720px;clip-path:${torn(7700 + si, 4)}">${esc(sc.data.note)}</div></div>`);
        root.appendChild(note); pn = piece(note, 7710 + si, { x: 260, y: 1180, rot: 2 }); na = at[0] - sc.start > 1.5 ? sc.start + .35 : at[N - 1] + .6; ev(na + .2, "type");
      }
      return t => {
        ws.forEach(({ pc }, k) => placePiece(pc, t, at[k], { dx: k % 2 ? 700 : -700, dy: 0, rot: k % 2 ? 8 : -8 }, .32));
        if (pn) placePiece(pn, t, na, { dx: 0, dy: 400, rot: 6 }, .4);
      };
    },

    form(sc, si, root) {
      const f = h(`<div class="piece" style="width:860px"><div class="paper" style="padding:50px 56px 60px;background-color:#F3EFE4;clip-path:${torn(7800 + si, 6)}">
        <div class="elite" style="font-size:46px;border-bottom:3px solid #141414;padding-bottom:16px;margin-bottom:26px">${esc(sc.data.formTitle)}</div>
        ${sc.data.rows.map(rw => `<div style="display:flex;align-items:center;gap:26px;margin:22px 0"><div style="width:58px;height:58px;border:5px solid #141414;flex:none"></div><div class="elite" style="font-size:40px">${esc(rw)}</div></div>`).join("")}
        <div class="elite" style="font-size:26px;opacity:.6;margin-top:30px">Signature ____________________</div></div></div>`);
      f.appendChild(tape(330, -24, 2)); root.appendChild(f);
      const pf = piece(f, 7810 + si, { x: 110, y: 330, rot: -1.5 });
      let fg = null, lbl = null, pl = null;
      const ca = cueMaybe(si, "community", .2) ?? sc.start + 1;
      if (sc.data.figure || true) {
        fg = figure(root, sc.data.figure || "community", 470, 7820 + si, { x: 0, y: 0, rot: 0 });
        fg.pc.base = { x: W - fg.w - 10, y: 1430 - 470 - 20, rot: -2 };
        lbl = h(`<div class="piece" style="z-index:7"><div class="paper hand" style="font-size:64px;color:${RED};white-space:nowrap;padding:6px 26px 12px;clip-path:${torn(7835 + si, 4)}">the community →</div></div>`);
        root.appendChild(lbl); pl = piece(lbl, 7830 + si, { x: 60, y: 1010, rot: -4 });
      }
      const st = stampEl(sc.data.stamp, 96); root.appendChild(st);
      const at = cueMaybe(si, sc.data.cue || "nobody", .2) ?? sent(si, 1).start;
      ev(sc.start + .3, "slap"); ev(ca + .2, "slide"); ev(at + .18, "stamp");
      return t => {
        placePiece(pf, t, sc.start, { dx: 0, dy: 1100, rot: 6 });
        if (fg) { placeStep(fg.pc, t, ca, { dx: 600, dy: 0, rot: 0 }, .5, 4); placePiece(pl, t, ca + .4, { dx: 0, dy: 0, rot: 0, s: .6 }, .3); pl.el.style.opacity = clamp((t - ca - .4) * 4); }
        placeStamp(st, t, at, 170, 600, -9);
      };
    },

    check(sc, si, root) {
      const big = h(`<div class="piece" style="width:900px"><div class="black" style="padding:60px 60px 70px 180px;clip-path:${torn(7900 + si, 8)}"><div class="anton" style="font-size:118px;line-height:1;color:#F4F0E6">${esc(sc.data.big.toUpperCase())}</div></div></div>`);
      root.appendChild(big);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", 200); svg.setAttribute("height", 200); svg.style.cssText = "position:absolute;left:24px;top:40px;overflow:visible";
      big.appendChild(svg);
      const ck = stroke(svg, roughPath([[10, 90], [60, 150], [170, 10]], 9, 6), "#F5C400", 22);
      const sm = h(`<div class="piece"><div class="paper" style="padding:26px 36px 30px;clip-path:${torn(7910 + si, 5)}"><div class="elite" style="font-size:36px;max-width:700px">${esc(sc.data.small)}</div></div></div>`);
      root.appendChild(sm);
      const pb = piece(big, 7920 + si, { x: 90, y: 360, rot: -2 }), ps = piece(sm, 7921 + si, { x: 200, y: 1100, rot: 2.5 });
      const ca = sc.start + .5;
      ev(sc.start + .25, "thump"); ev(ca + .1, "pencil"); ev(ca + 1.1, "slap");
      return t => { placePiece(pb, t, sc.start, { dx: 0, dy: 0, rot: -8, s: 1.8 }, .32); ck.draw(ioCubic(p(t, ca, .45))); placePiece(ps, t, ca + .9, { dx: -900, dy: 0, rot: -8 }); };
    },

    quote(sc, si, root) {
      const { box, letters } = ransom([sc.data.label || "OPENAI SAYS"], 92, 8000 + si);
      box.style.top = "330px"; root.appendChild(box);
      const t0 = sc.start + .1, gap = .06;
      letters.forEach((_, i) => { if (i % 2 === 0) ev(t0 + i * gap, "snip"); });
      const qa = t0 + letters.length * gap + .3;
      const q = h(`<div class="piece" style="width:900px"><div class="black" style="padding:54px 56px 60px;clip-path:${torn(8010 + si, 7)}">
        <div class="serif" style="font-weight:600;font-size:66px;line-height:1.1;color:#F4F0E6">${sc.data.paraphrase ? "" : "“"}${esc(sc.data.quote)}${sc.data.paraphrase ? "" : "”"}</div>
        <div class="elite" style="font-size:28px;margin-top:26px;color:var(--y)">${esc(sc.data.credit)}</div></div></div>`);
      q.appendChild(tape(360, -24, 4)); root.appendChild(q);
      const pq = piece(q, 8020 + si, { x: 90, y: 560, rot: -1.5 });
      ev(qa + .3, "slap");
      return t => { showLetters(letters, t, t0, gap, 8030 + si); placePiece(pq, t, qa, { dx: 0, dy: 1000, rot: 8 }); };
    },

    outro(sc, si, root) {
      const upd = ORIG.outro(sc, si, root);
      if (!sc.data.figure) return upd;
      const fg = figure(root, sc.data.figure, 560, 8100 + si, { x: 0, y: 0, rot: 0 });
      fg.pc.base = { x: W - fg.w + 130, y: 1440 - 560 - 30, rot: -2 };
      root.prepend(fg.pc.el);
      const c = cueMaybe(si, "sources", .3) ?? sc.start + 2;
      return t => { upd(t); placeStep(fg.pc, t, c + .2, { dx: 500, dy: 0, rot: 0 }, .5, 4); };
    },

    prices(sc, si, root) {
      const fg = figure(root, sc.data.figure, 980, 8200 + si, { x: 0, y: 0, rot: 0 });
      fg.pc.base = { x: -90, y: 1440 - 980, rot: 1 };
      const svg = svgLayer(root); svg.style.zIndex = 9;
      const items = sc.data.items.map((it, k) => {
        const y0 = 320 + k * 450;
        const old = h(`<div class="piece" style="width:520px;z-index:5"><div class="tag" style="padding:30px 40px 34px 90px"><div class="hole"></div><div class="elite" style="font-size:32px">${esc(it.label)}</div><div class="anton" style="font-size:118px;line-height:1;color:#3a352e">${esc(it.old)}</div></div></div>`);
        const nw = h(`<div class="piece" style="width:520px;z-index:7"><div class="tag y" style="padding:30px 40px 34px 90px"><div class="hole"></div><div class="elite" style="font-size:32px">now</div><div class="anton" style="font-size:130px;line-height:1">${esc(it.new)}</div></div></div>`);
        root.appendChild(old); root.appendChild(nw);
        const at = cueMaybe(si, it.cue, .3) ?? sc.start + k * 2;
        const nt = cueMaybe(si, it.cueNew || "", .2) ?? at + 1.6;
        const strike = stroke(svg, roughPath([[560, y0 + 150], [760, y0 + 135], [980, y0 + 120]], 30 + k, 8), RED, 14);
        ev(at + .25, "slap"); ev(at + .9, "pencil"); ev(nt + .2, "thump");
        return { po: piece(old, 8300 + k, { x: 500, y: y0, rot: -3 + k * 2 }), pn: piece(nw, 8310 + k, { x: 540, y: y0 + 190, rot: 3 - k * 2 }), at, nt, strike };
      });
      ev(sc.start + .2, "slide");
      return t => {
        placeStep(fg.pc, t, sc.start + .05, { dx: -600, dy: 0, rot: 0 }, .55, 5);
        items.forEach(it => {
          placePiece(it.po, t, it.at, { dx: 700, dy: -200, rot: 20 }, .45);
          it.strike.draw(ioCubic(p(t, it.at + .8, .35)));
          placePiece(it.pn, t, it.nt, { dx: 0, dy: 0, rot: -10, s: 1.8 }, .3);
        });
      };
    },

    receipt(sc, si, root) {
      const rows = sc.data.rows;
      const el = h(`<div class="piece" style="width:760px"><div class="rcpt elite" style="padding:56px 50px 80px;clip-path:polygon(${Array.from({ length: 31 }, (_, i) => `${(i / 30 * 100).toFixed(2)}% ${i % 2 ? 0 : 14}px`).join(",")},${Array.from({ length: 31 }, (_, i) => `${(100 - i / 30 * 100).toFixed(2)}% calc(100% - ${i % 2 ? 0 : 14}px)`).join(",")})">
        <div style="text-align:center;font-size:34px;border-bottom:3px dashed #141414;padding-bottom:20px;margin-bottom:10px">${esc(sc.data.title)}</div>
        ${rows.map((rw, k) => `<div class="row" data-k="${k}" style="padding:26px 6px;border-bottom:2px dashed rgba(0,0,0,.25)"><div style="font-size:34px">${esc(rw.label)}</div><div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px"><span style="font-size:44px;text-decoration:line-through;opacity:.5">${esc(rw.old)}</span><span style="font-size:30px">→</span><span class="anton" style="font-size:96px;line-height:1">${esc(rw.new)}</span></div></div>`).join("")}
        ${(sc.data.footer ?? "*** list prices, standard tier ***") ? `<div style="text-align:center;font-size:26px;margin-top:24px;opacity:.7">${esc(sc.data.footer ?? "*** list prices, standard tier ***")}</div>` : ""}</div></div>`);
      root.appendChild(el);
      const pr = piece(el, 8400 + si, { x: 160, y: 300, rot: -1.5 });
      const rowEls = [...el.querySelectorAll(".row")];
      const svg = svgLayer(root); svg.style.zIndex = 9;
      const ats = rows.map((rw, k) => cueMaybe(si, rw.cue, .3) ?? sc.start + .4 + k * .8);
      const rings = rows.map((rw, k) => rw.circle ? stroke(svg, roughPath(ellipsePts(540, 300 + 150 + k * 205 + 90, 400, 120, 1.1, 60, 9 + k), 5, 4), RED, 11) : null);
      ev(sc.start + .2, "tear"); ats.forEach((a, k) => { ev(a, "type"); if (rings[k]) ev(a + .9, "pencil"); });
      return t => {
        placePiece(pr, t, sc.start, { dx: 0, dy: -1300, rot: 0 }, .7);
        rowEls.forEach((r, k) => { r.style.opacity = clamp((t - ats[k]) * 3); });
        rings.forEach((rg, k) => rg && rg.draw(ioCubic(p(t, ats[k] + .9, .55))));
      };
    },

    frames(sc, si, root) {
      const strip = h(`<div class="piece"><div class="yellow anton" style="font-size:70px;padding:16px 36px 20px;clip-path:${torn(8500 + si, 5)}">Built on Gemini 3.6 Flash</div></div>`);
      root.appendChild(strip);
      const ps = piece(strip, 8510 + si, { x: 70, y: 300, rot: -2 });
      const thumbs = (B.assets && B.assets.thumbs) || [];
      const n = sc.data.count || 14, cols = 5;
      const at0 = cueMaybe(si, "14", .2) ?? sent(si, 1).start;
      const r = rng(8520 + si);
      const ph = Array.from({ length: n }, (_, i) => {
        const el = h(`<div class="piece"><div class="poly"><div style="background-image:url('${A(thumbs[i % Math.max(1, thumbs.length)] || "")}')"></div></div></div>`);
        root.appendChild(el);
        ev(at0 + i * .07, i % 3 ? "click" : "shutter");
        return piece(el, 8530 + i, { x: 60 + (i % cols) * 196 + (r() - .5) * 14, y: 450 + Math.floor(i / cols) * 215 + (r() - .5) * 14, rot: (r() - .5) * 10 });
      });
      const lbl = h(`<div class="piece" style="z-index:6"><div class="black" style="padding:18px 34px 22px;clip-path:${torn(8540 + si, 5)}"><span class="anton" style="font-size:96px;color:var(--y)">${esc(sc.data.big)}</span><span style="font-weight:800;font-size:40px;margin-left:18px">${esc(sc.data.small)}</span></div></div>`);
      root.appendChild(lbl);
      const pl = piece(lbl, 8550 + si, { x: 90, y: 1150, rot: 1.5 });
      const la = cueMaybe(si, "4k", .3) ?? at0 + n * .07 + .5;
      ev(sc.start + .2, "slap"); ev(la + .2, "thump");
      let fg = null;
      if (sc.data.figure) {
        fg = figure(root, sc.data.figure, 760, 8560 + si, { x: 0, y: 0, rot: 0 });
        fg.pc.base = { x: W - fg.w + 40, y: 1440 - 760, rot: -1.5 };
        root.insertBefore(fg.pc.el, strip);
        ev(sc.start + .6, "slide");
      }
      return t => {
        if (fg) placeStep(fg.pc, t, sc.start + .5, { dx: 600, dy: 0, rot: 0 }, .5, 4);
        placePiece(ps, t, sc.start, { dx: -900, dy: 0, rot: -10 }, .4);
        ph.forEach((pc, i) => placePiece(pc, t, at0 + i * .07, { dx: 0, dy: 0, rot: 20, s: 1.6 }, .22));
        placePiece(pl, t, la, { dx: 0, dy: 0, rot: -8, s: 1.8 }, .3);
      };
    },

    bars(sc, si, root) {
      const lab = h(`<div class="piece"><div class="paper elite" style="padding:16px 26px 20px;font-size:34px;clip-path:${torn(8600 + si, 4)}">${esc(sc.data.unit)}</div></div>`);
      root.appendChild(lab);
      const pl = piece(lab, 8610 + si, { x: 70, y: 320, rot: -1.5 });
      const max = Math.max(...sc.data.items.map(i => i.value)), min = sc.data.min ?? 0;
      const bars = sc.data.items.map((it, k) => {
        const wfull = 260 + (it.value - min) / (max - min) * 640;
        const el = h(`<div style="position:absolute;left:70px;top:${460 + k * 250}px">
          <div style="font-weight:800;font-size:42px;margin-bottom:10px">${esc(it.label)}</div>
          <div class="bar" style="height:120px;width:${wfull.toFixed(0)}px;background:${it.hi ? RED : "#141414"};background-image:var(--grain);clip-path:${torn(8620 + k, 6, 12)};transform-origin:0 50%;display:flex;align-items:center;justify-content:flex-end;padding-right:26px"><span class="anton" style="font-size:84px;color:#F4F0E6">0</span></div></div>`);
        root.appendChild(el);
        return { el, bar: el.querySelector(".bar"), num: el.querySelector("span"), it, wfull };
      });
      const st = stampEl(sc.data.stamp, 80, "#141414"); root.appendChild(st);
      const a = sc.start + .4, sa = cueMaybe(si, sc.data.cue || "independent", .2) ?? sent(si, 1).start;
      bars.forEach((_, k) => ev(a + k * .45, "slide")); ev(sa + .18, "stamp");
      return t => {
        placePiece(pl, t, sc.start, { dx: -800, dy: 0, rot: -8 }, .4);
        bars.forEach((b, k) => {
          const x = oCubic(p(t, a + k * .45, .9));
          b.el.style.opacity = t < a + k * .45 ? 0 : 1;
          b.bar.style.width = `${Math.max(150, b.wfull * x).toFixed(0)}px`;
          b.num.textContent = fmt(b.it.value * x);
        });
        placeStamp(st, t, sa, 300, 1180, -8);
      };
    },
  });
})();
