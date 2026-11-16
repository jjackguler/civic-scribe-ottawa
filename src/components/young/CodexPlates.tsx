import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useT } from "@/components/YoungLab";
import type { Bi } from "@/lib/i18n";

/**
 * "Open the machine": three everyday machines drawn like plates from an inventor's
 * notebook, in 3D (three.js, loaded only on this page). Each plate can be turned and
 * opened up, and the player decides: did it learn from examples, or does it follow a
 * rule a person wrote? Everything is drawn in code. Labels and answers live in the DOM
 * beside the canvas, so screen readers and keyboards get the same lesson.
 */

type Label = { name: Bi; note: Bi };
type PartSpec = {
  geo: string; color: string; pos: [number, number, number]; rot?: [number, number, number];
  ex?: [number, number, number]; spin?: "x" | "y" | "z" | "-z"; label?: Label; anchor?: [number, number, number];
  opacity?: number; card?: boolean; name?: string; extra?: string;
};
type Plate = { id: string; title: Bi; q: Bi; answer: "ai" | "rule"; right: Bi; wrong: Bi; ask: Bi; focusY: number; span: number; parts: PartSpec[] };

const PAPER = "#efe2c3", PAPER2 = "#e2cfa6", BRASS = "#d4a03a", RED = "#c0482c", DARK = "#5a4632";
const bi = (en: string, fr: string): Bi => ({ en, fr });

function calculatorParts(): PartSpec[] {
  const p: PartSpec[] = [
    { geo: "box:3.2,0.5,4.4", color: PAPER, pos: [0, 0.25, 0], label: { name: bi("Case", "Boîtier"), note: bi("Holds the parts.", "Tient les pièces.") }, anchor: [1.6, 0, 1.5] },
    { geo: "cyl:0.42,0.42,2.3", color: BRASS, pos: [0, 0.95, -0.4], rot: [0, 0, Math.PI / 2], ex: [0, 0.9, 0], spin: "x", extra: "pins",
      label: { name: bi("Rule drum", "Tambour à règles"), note: bi("Pins set by a person. They never change.", "Des picots placés par une personne. Ils ne changent jamais.") }, anchor: [1.2, 0, 0] },
    { geo: "gear:0.55,10", color: PAPER2, pos: [-1, 0.95, 0.9], ex: [-0.6, 0.9, 0.3], spin: "z", label: { name: bi("Gears", "Engrenages"), note: bi("Carry the answer to the window.", "Portent la réponse jusqu'à la fenêtre.") }, anchor: [-0.5, 0.3, 0] },
    { geo: "gear:0.38,8", color: PAPER2, pos: [-0.3, 0.95, 1.15], ex: [-0.3, 0.9, 0.4], spin: "-z" },
    { geo: "box:3.2,0.32,4.4", color: PAPER, pos: [0, 0.66, 0], ex: [0, 2.3, 0], label: { name: bi("Lid", "Couvercle"), note: bi("Lift it to see inside.", "Soulève-le pour voir dedans.") }, anchor: [-1.6, 0.2, -1.5] },
    { geo: "box:2.4,0.12,0.9", color: "#cfe0d6", pos: [0, 0.88, -1.55], ex: [0, 2.3, 0], label: { name: bi("Window", "Fenêtre"), note: bi("Shows 4. Every single time.", "Affiche 4. À chaque fois.") }, anchor: [1.1, 0.1, 0] },
  ];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const accent = (r === 1 && c === 1) || (r === 3 && c === 3);
    p.push({ geo: "cyl:0.24,0.24,0.18", color: accent ? RED : PAPER2, pos: [-1.05 + c * 0.7, 0.91, -0.35 + r * 0.62], ex: [0, 3.1, 0],
      label: r === 3 && c === 3 ? { name: bi("Buttons", "Touches"), note: bi("You press 2 + 2 =", "Tu tapes 2 + 2 =") } : undefined, anchor: [0.2, 0.1, 0] });
  }
  return p;
}
function musicParts(): PartSpec[] {
  const p: PartSpec[] = [{ geo: "box:4.6,0.4,3.2", color: PAPER, pos: [0, 0.2, 0], label: { name: bi("Base", "Socle"), note: bi("The app on your phone.", "L'appli sur ton téléphone.") }, anchor: [-2.3, 0, 1.6] }];
  for (let i = 0; i < 7; i++) p.push({ geo: "cyl:0.85,0.85,0.07", color: i === 4 ? RED : i % 2 ? DARK : PAPER2, pos: [-1.4, 0.45 + i * 0.08, 0], ex: [-0.4 - i * 0.05, 0.35 + i * 0.42, (i - 3) * 0.12], spin: "y",
    label: i === 6 ? { name: bi("Songs you played", "Les chansons écoutées"), note: bi("The examples it learns from.", "Les exemples dont elle apprend.") } : undefined, anchor: [-0.7, 0, 0.3] });
  p.push({ geo: "torus:0.75,0.07", color: BRASS, pos: [0.35, 1.25, 0], rot: [0, -0.5, 0], ex: [0, 0.9, 0], extra: "grid", label: { name: bi("Pattern finder", "Chercheur de motifs"), note: bi("Notices what your songs share.", "Remarque ce que tes chansons ont en commun.") }, anchor: [0, 0.8, 0] });
  p.push({ geo: "cyl:0.25,0.25,0.9", color: PAPER2, pos: [0.35, 0.65, 0], ex: [0, 0.5, 0] });
  p.push({ geo: "cyl:0.68,0.68,0.16", color: PAPER, pos: [1.6, 0.5, 0], ex: [0.4, 1.1, 0], extra: "needle", label: { name: bi("Best-guess dial", "Cadran du meilleur pari"), note: bi("Picks a song you might like. It can be wrong.", "Choisit une chanson qui pourrait te plaire. Il peut se tromper.") }, anchor: [0.5, 0, 0.5] });
  return p;
}
function doorParts(): PartSpec[] {
  return [
    { geo: "box:5,0.2,2", color: PAPER2, pos: [0, 0.1, 0], label: { name: bi("Floor track", "Rail au sol"), note: bi("The doors slide along it.", "Les portes glissent dessus.") }, anchor: [-2.5, 0, 1] },
    { geo: "box:0.3,3.4,0.5", color: PAPER, pos: [-2.35, 1.9, 0] },
    { geo: "box:0.3,3.4,0.5", color: PAPER, pos: [2.35, 1.9, 0] },
    { geo: "box:5,0.6,0.7", color: PAPER, pos: [0, 3.9, 0], ex: [0, 0.9, 0], label: { name: bi("Top beam", "Poutre du haut"), note: bi("Hides the motor.", "Cache le moteur.") }, anchor: [2.5, 0.3, 0] },
    { geo: "box:2.1,3.2,0.12", color: "#d9e4dc", pos: [-1.08, 1.8, 0.05], ex: [-1, 0, 0], label: { name: bi("Doors", "Portes"), note: bi("Slide open, slide closed.", "S'ouvrent et se ferment en glissant.") }, anchor: [-0.6, 0.6, 0.1] },
    { geo: "box:2.1,3.2,0.12", color: "#d9e4dc", pos: [1.08, 1.8, 0.05], ex: [1, 0, 0] },
    { geo: "cyl:0.22,0.22,1.4", color: DARK, pos: [0, 3.9, 0], rot: [0, 0, Math.PI / 2], ex: [0, 1.7, 0], spin: "x", label: { name: bi("Motor", "Moteur"), note: bi("Turns when the rule says so.", "Tourne quand la règle le dit.") }, anchor: [0.7, 0, 0] },
    { geo: "dome:0.28", color: BRASS, pos: [0, 3.6, 0.4], rot: [Math.PI, 0, 0], ex: [0, 0.9, 0.7], label: { name: bi("Sensor", "Capteur"), note: bi("Notices movement. That is all.", "Remarque un mouvement. C'est tout.") }, anchor: [0, 0, 0.2] },
    { geo: "cone:1.5,3.3", color: "#f3e3a8", pos: [0, 1.85, 1.05], ex: [0, 0.9, 0.7], opacity: 0.18, name: "beam" },
    { geo: "box:1.4,0.9,0.04", color: "#ffffff", pos: [2.9, 2.7, 0.7], rot: [0, -0.3, 0.06], ex: [0.2, 0.3, 0.4], card: true, label: { name: bi("Rule card", "Carte-règle"), note: bi("IF something moves, THEN open.", "SI quelque chose bouge, ALORS ouvre.") }, anchor: [0.75, 0.3, 0] },
  ];
}

const PLATES: Plate[] = [
  { id: "calculator", title: bi("Plate I · The calculator", "Planche I · La calculatrice"), q: bi("Press 2 + 2. What happens inside?", "Tape 2 + 2. Que se passe-t-il dedans?"), answer: "rule",
    right: bi("Not AI. The rule drum was set by a person. Same buttons, same answer, forever.", "Pas de l'IA. Le tambour a été réglé par une personne. Mêmes touches, même réponse, pour toujours."),
    wrong: bi("Look again. Nothing inside learns. The pins on the drum were set once, by a person.", "Regarde encore. Rien ne s'apprend dedans. Les picots ont été placés une fois, par une personne."),
    ask: bi("Ask the class: could a calculator ever surprise you?", "Demande à la classe : une calculatrice peut-elle te surprendre?"), focusY: 1.4, span: 12.5, parts: calculatorParts() },
  { id: "music", title: bi("Plate II · The music app", "Planche II · L'appli de musique"), q: bi("How does it choose the next song for you?", "Comment choisit-elle ta prochaine chanson?"), answer: "ai",
    right: bi("AI. It learned from hundreds of songs you played, found a pattern, and makes a best guess.", "De l'IA. Elle a appris de centaines de chansons écoutées, a trouvé un motif et fait un pari."),
    wrong: bi("Look at the stack of songs. Nobody wrote a rule for you. It learned from your examples.", "Regarde la pile de chansons. Personne n'a écrit de règle pour toi. Elle a appris de tes exemples."),
    ask: bi("Ask the class: what happens if you only ever play one kind of song?", "Demande à la classe : que se passe-t-il si tu n'écoutes qu'un seul genre?"), focusY: 1.4, span: 12.5, parts: musicParts() },
  { id: "door", title: bi("Plate III · The automatic door", "Planche III · La porte automatique"), q: bi("How does the door know you are there?", "Comment la porte sait-elle que tu es là?"), answer: "rule",
    right: bi("Not AI. A sensor and one rule: if something moves, open. It never learns anything new.", "Pas de l'IA. Un capteur et une règle : si ça bouge, ouvre. Elle n'apprend jamais rien."),
    wrong: bi("Read the rule card. A person wrote one rule. The door does not learn from examples.", "Lis la carte-règle. Une personne a écrit une règle. La porte n'apprend pas d'exemples."),
    ask: bi("Ask the class: why does the door open for a cat, or a leaf?", "Demande à la classe : pourquoi la porte s'ouvre-t-elle pour un chat ou une feuille?"), focusY: 2.3, span: 17.5, parts: doorParts() },
];
const NUMERALS = ["I", "II", "III"];

export function CodexPlates({ onDone }: { onDone?: () => void }) {
  const { t, pick, fr } = useT();
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leadersRef = useRef<SVGSVGElement>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState(0);
  const [chosen, setChosen] = useState<"ai" | "rule" | null>(null);
  const [ready, setReady] = useState<"loading" | "ok" | "fail">("loading");
  const [narrow, setNarrow] = useState(false);
  const api = useRef<{ load: (i: number) => void; setOpen: (v: number) => void } | null>(null);
  const plate = PLATES[cur];
  const labelled = plate.parts.filter(p => p.label);

  // Build the scene once three.js has loaded.
  useEffect(() => {
    let alive = true, raf = 0, cleanup = () => {};
    import("three").then(THREE => {
      if (!alive || !canvasRef.current || !stageRef.current) return;
      const stage = stageRef.current, cv = canvasRef.current;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { setReady("fail"); return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      scene.add(new THREE.AmbientLight(0xffffff, 2.4));
      const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(-4, 8, 6); scene.add(sun);
      const ink = new THREE.Color("#2e2318");

      const hatch = (step: number, alpha: number) => {
        const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d")!;
        x.fillStyle = "#fff"; x.fillRect(0, 0, 128, 128); x.strokeStyle = `rgba(70,50,30,${alpha})`; x.lineWidth = 1.1;
        for (let i = -128; i < 256; i += step) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); }
        const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(2, 2); tx.colorSpace = THREE.SRGBColorSpace; return tx;
      };
      const HATCH = hatch(7, 0.28);
      const ruleCard = () => {
        const c = document.createElement("canvas"); c.width = 280; c.height = 180; const x = c.getContext("2d")!;
        x.fillStyle = "#fbf3df"; x.fillRect(0, 0, 280, 180); x.strokeStyle = "#5a4632"; x.lineWidth = 3; x.strokeRect(10, 10, 260, 160);
        x.fillStyle = "#2e2318"; x.textAlign = "center"; x.font = "700 30px Georgia, serif"; x.fillText(fr ? "RÈGLE" : "RULE", 140, 52);
        x.font = "italic 26px Georgia, serif"; x.fillText(fr ? "SI ça bouge" : "IF it moves", 140, 100); x.fillStyle = "#b5432a"; x.fillText(fr ? "ALORS ouvre" : "THEN open", 140, 140);
        const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
      };
      const gearGeo = (r: number, teeth: number, thick: number) => {
        const s = new THREE.Shape(), n = teeth * 4;
        for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, rr = Math.floor(i / 2) % 2 ? r * 0.82 : r; if (i) s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.moveTo(rr, 0); }
        const h = new THREE.Path(); h.absarc(0, 0, r * 0.3, 0, Math.PI * 2, true); s.holes.push(h);
        const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false }); g.translate(0, 0, -thick / 2); return g;
      };
      const makeGeo = (spec: string) => {
        const [kind, args] = spec.split(":"), a = args.split(",").map(Number);
        switch (kind) {
          case "box": return new THREE.BoxGeometry(a[0], a[1], a[2]);
          case "cyl": return new THREE.CylinderGeometry(a[0], a[1], a[2], 32);
          case "gear": return gearGeo(a[0], a[1], 0.14);
          case "torus": return new THREE.TorusGeometry(a[0], a[1], 10, 40);
          case "dome": return new THREE.SphereGeometry(a[0], 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
          default: return new THREE.ConeGeometry(a[0], a[1], 24, 1, true);
        }
      };
      type Built = { g: InstanceType<typeof THREE.Group>; spec: PartSpec; base: InstanceType<typeof THREE.Vector3>; ex: InstanceType<typeof THREE.Vector3>; needle?: InstanceType<typeof THREE.Group> };
      const build = (spec: PartSpec): Built => {
        const g = new THREE.Group(), geo = makeGeo(spec.geo);
        const mat = new THREE.MeshLambertMaterial({ color: spec.color, map: spec.card ? ruleCard() : HATCH, transparent: !!spec.opacity, opacity: spec.opacity ?? 1, side: spec.opacity ? THREE.DoubleSide : THREE.FrontSide, depthWrite: !spec.opacity });
        g.add(new THREE.Mesh(geo, mat));
        const edges = new THREE.EdgesGeometry(geo, spec.opacity ? 60 : 28);
        g.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: ink, transparent: !!spec.opacity, opacity: spec.opacity ? 0.7 : 1 })));
        const loose = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.35 })); loose.scale.setScalar(1.012); loose.position.set(0.01, 0.012, 0); g.add(loose);
        let needle: Built["needle"];
        if (spec.extra === "pins") for (let i = 0; i < 14; i++) { const a = i * 2.4, pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), new THREE.MeshLambertMaterial({ color: DARK })); pin.position.set(Math.cos(a) * 0.44, -1 + i * 0.15, Math.sin(a) * 0.44); pin.lookAt(0, pin.position.y, 0); pin.rotateX(Math.PI / 2); g.add(pin); }
        if (spec.extra === "grid") for (let k = -2; k <= 2; k++) { const len = 2 * Math.sqrt(Math.max(0, 0.72 * 0.72 - (k * 0.26) ** 2)); const v = new THREE.Mesh(new THREE.BoxGeometry(0.025, len, 0.025), new THREE.MeshLambertMaterial({ color: DARK })); v.position.set(k * 0.26, 0, 0); g.add(v); const h = v.clone(); h.rotation.z = Math.PI / 2; h.position.set(0, k * 0.26, 0); g.add(h); }
        if (spec.extra === "needle") { const n = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.62, 8), new THREE.MeshLambertMaterial({ color: RED })); n.rotation.z = -Math.PI / 2; n.position.set(0.25, 0.1, 0); needle = new THREE.Group(); needle.add(n); g.add(needle); }
        g.position.set(...spec.pos); if (spec.rot) g.rotation.set(...spec.rot);
        return { g, spec, base: g.position.clone(), ex: new THREE.Vector3(...(spec.ex ?? [0, 0, 0])), needle };
      };

      // soft contact shadow
      const sc = document.createElement("canvas"); sc.width = sc.height = 128; { const x = sc.getContext("2d")!; const gr = x.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, "rgba(60,40,20,.35)"); gr.addColorStop(1, "rgba(60,40,20,0)"); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); }
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; scene.add(shadow);

      const group = new THREE.Group(); scene.add(group);
      let built: Built[] = [], plateI = 0, explode = 0, target = 0, yaw = -0.6, pitch = 0.42, touched = false, W = 1, H = 1;
      const load = (i: number) => {
        plateI = i; group.clear(); built = PLATES[i].parts.map(build); built.forEach(b => group.add(b.g));
        const box = new THREE.Box3().setFromObject(group), ctr = box.getCenter(new THREE.Vector3()); group.position.set(-ctr.x, 0, -ctr.z);
        explode = 0; target = 0;
      };
      const resize = () => { W = stage.clientWidth; H = stage.clientHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); setNarrow(W < 620); };
      const ro = new ResizeObserver(resize); ro.observe(stage); resize();

      let drag: { x: number; y: number; t: string } | null = null;
      const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, t: e.pointerType }; touched = true; stage.setPointerCapture(e.pointerId); };
      const move = (e: PointerEvent) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; yaw += dx * 0.008; if (drag.t === "mouse") pitch = Math.max(0.08, Math.min(1.1, pitch + dy * 0.005)); };
      const up = () => { drag = null; };
      stage.addEventListener("pointerdown", down); stage.addEventListener("pointermove", move); stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);

      const v = new THREE.Vector3();
      let last = performance.now(), clock = 0;
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
        explode = reduce ? target : explode + (target - explode) * Math.min(1, dt * 3.2);
        if (!touched && !reduce) yaw += dt * 0.12;
        const pl = PLATES[plateI], dist = pl.span * (W < 620 ? 1.12 : 1);
        camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, 1.6 + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
        camera.lookAt(0, pl.focusY, 0);
        for (const b of built) {
          b.g.position.copy(b.base).addScaledVector(b.ex, explode);
          if (b.spec.spin && !reduce) { const ax = b.spec.spin.replace("-", "") as "x" | "y" | "z"; b.g.rotation[ax] += dt * 0.8 * (b.spec.spin[0] === "-" ? -1 : 1) * (0.3 + explode); }
          if (b.needle) b.needle.rotation.y = reduce ? 0.6 : 0.6 + Math.sin(clock * 1.7) * 0.7 * explode;
          if (b.spec.name === "beam") b.g.visible = explode > 0.4;
        }
        renderer.render(scene, camera);
        // labels: pins at the anchor, notes stacked in the side margins
        const items: { k: number; x: number; y: number; lx?: number; ly?: number }[] = [];
        built.filter(b => b.spec.label).forEach((b, k) => { v.set(...(b.spec.anchor ?? [0, 0, 0])); b.g.localToWorld(v); v.project(camera); items.push({ k, x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H }); });
        const lay = (arr: typeof items, left: boolean) => { let y = 44; arr.sort((a, b) => a.y - b.y).forEach(it => { const hgt = labelRefs.current[it.k]?.offsetHeight ?? 60; it.ly = Math.max(y, it.y - 14); y = it.ly + hgt + 10; it.lx = left ? 14 : W - 204; }); const over = y - 10 - (H - 12); if (over > 0) arr.forEach(it => { it.ly! -= over; }); };
        lay(items.filter(i => i.x < W / 2), true); lay(items.filter(i => i.x >= W / 2), false);
        let d = "";
        for (const it of items) {
          const pin = pinRefs.current[it.k], lab = labelRefs.current[it.k];
          if (pin) { pin.style.transform = `translate(${it.x - 11}px, ${it.y - 11}px)`; }
          if (lab && W >= 620) { lab.style.transform = `translate(${it.lx}px, ${it.ly}px)`; const ex = it.lx! < W / 2 ? it.lx! + 186 : it.lx! - 6, ey = it.ly! + 12; d += `M${it.x} ${it.y}L${(it.x + ex) / 2} ${ey}L${ex} ${ey}`; }
        }
        leadersRef.current?.firstElementChild?.setAttribute("d", d);
        raf = requestAnimationFrame(frame);
      };
      api.current = { load, setOpen: (x: number) => { target = x; } };
      load(0); setReady("ok"); raf = requestAnimationFrame(frame);
      cleanup = () => { ro.disconnect(); stage.removeEventListener("pointerdown", down); stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerup", up); stage.removeEventListener("pointercancel", up); renderer.dispose(); };
    }).catch(() => setReady("fail"));
    return () => { alive = false; cancelAnimationFrame(raf); cleanup(); };
  }, [reduce, fr]);

  const choosePlate = (i: number) => { setCur(i); setOpen(0); setChosen(null); api.current?.load(i); };
  const setOpenV = (v: number) => { setOpen(v); api.current?.setOpen(v / 100); };
  const answer = (a: "ai" | "rule") => { setChosen(a); if (open < 70) setOpenV(100); };
  const ok = chosen === plate.answer;

  return (
    <section className="yl-codex" aria-labelledby="codex-title">
      <div className="yl-codex-head">
        <div>
          <p className="yl-codex-kicker">{t("Before you play · Open the machine", "Avant de jouer · Ouvre la machine")}</p>
          <h2 id="codex-title" className="yl-codex-title">{pick(plate.title)}</h2>
        </div>
        <div className="yl-codex-tabs" role="group" aria-label={t("Choose a plate", "Choisis une planche")}>
          {PLATES.map((p, i) => <button key={p.id} type="button" aria-current={i === cur} aria-label={pick(p.title)} onClick={() => choosePlate(i)}>{NUMERALS[i]}</button>)}
        </div>
      </div>
      <div className="yl-codex-body">
        <div>
          <div ref={stageRef} className="yl-codex-stage" aria-hidden="true">
            <canvas ref={canvasRef} />
            <svg ref={leadersRef} className="yl-codex-leaders"><path fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" /></svg>
            {labelled.map((p, k) => (
              <div key={`${plate.id}-${k}`}>
                <div ref={el => { pinRefs.current[k] = el; }} className="yl-codex-pin">{String.fromCharCode(65 + k)}</div>
                {!narrow && <div ref={el => { labelRefs.current[k] = el; }} className="yl-codex-label"><b>{pick(p.label!.name)}</b>{pick(p.label!.note)}</div>}
              </div>
            ))}
            <span className="yl-codex-drag">{t("drag to turn ↻", "glisse pour tourner ↻")}</span>
            {ready === "fail" && <p className="yl-codex-fallback">{t("This device can't draw the 3D plate. The parts are listed below.", "Cet appareil ne peut pas dessiner la planche 3D. Les pièces sont listées dessous.")}</p>}
          </div>
          <ul className={`yl-codex-legend ${narrow || ready === "fail" ? "" : "sr-only"}`}>
            {labelled.map((p, k) => <li key={k}><span className="yl-codex-key">{String.fromCharCode(65 + k)}</span><b>{pick(p.label!.name)}.</b> {pick(p.label!.note)}</li>)}
          </ul>
        </div>
        <div className="yl-codex-side">
          <p className="yl-codex-q">{pick(plate.q)}</p>
          <label className="yl-codex-slider">
            <span>{t("Open it up", "Ouvre-la")}</span>
            <input type="range" min={0} max={100} value={open} onChange={e => setOpenV(Number(e.target.value))} />
          </label>
          <div className="grid gap-2">
            <button type="button" className="yl-codex-ans" aria-pressed={chosen === "ai"} onClick={() => answer("ai")}>{t("It learned from examples. That is AI.", "Elle a appris d'exemples. C'est de l'IA.")}</button>
            <button type="button" className="yl-codex-ans" aria-pressed={chosen === "rule"} onClick={() => answer("rule")}>{t("It follows rules a person wrote. Not AI.", "Elle suit des règles écrites par une personne. Pas de l'IA.")}</button>
          </div>
          <div className="yl-codex-feedback" aria-live="polite">
            {chosen ? (
              <>
                <span className={ok ? "is-ok" : "is-no"}>{ok ? t("Right!", "Bravo!") : t("Not quite.", "Pas tout à fait.")}</span>
                {pick(ok ? plate.right : plate.wrong)}
                <span className="yl-codex-ask">{pick(plate.ask)}</span>
              </>
            ) : t("Open the machine first, then choose.", "Ouvre d'abord la machine, puis choisis.")}
          </div>
          {chosen && ok && (cur < PLATES.length - 1
            ? <button type="button" className="yl-btn" onClick={() => choosePlate(cur + 1)}>{t(`Next: plate ${NUMERALS[cur + 1]}`, `Suivante : planche ${NUMERALS[cur + 1]}`)}</button>
            : onDone && <button type="button" className="yl-btn yl-btn--ink" onClick={onDone}>{t("Now play the game", "Maintenant, joue")}</button>)}
        </div>
      </div>
    </section>
  );
}
