import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Bot, Check, Eraser, Plus, X } from "lucide-react";
import { MISSING_FRUIT, TEST_FRUIT, TRAIN_FRUIT, activityById, nearest, type Example, type Fruit } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("teach-the-machine")!;

/** Colour from the x feature: 0 green → 0.5 yellow → 1 red. */
function fruitColor(x: number) {
  const g = [76, 175, 80], y = [245, 196, 0], r = [215, 55, 47];
  const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const c = x < 0.5 ? mix(g, y, x / 0.5) : mix(y, r, (x - 0.5) / 0.5);
  return `rgb(${c.join(",")})`;
}

/** A simple drawn fruit, centred on 0,0, about 20 units wide. */
function FruitShape({ kind, x }: { kind: Fruit["kind"] | "dot"; x: number }) {
  const fill = fruitColor(x);
  const stroke = "var(--ink)";
  if (kind === "banana") return <path d="M-10 -4 Q 0 12 11 -6 Q 0 5 -10 -4 Z" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />;
  if (kind === "lemon") return <ellipse cx="0" cy="0" rx="10" ry="7.5" fill={fill} stroke={stroke} strokeWidth="1.6" />;
  if (kind === "strawberry") return (
    <g>
      <path d="M-8 -4 Q 0 -8 8 -4 Q 6 6 0 10 Q -6 6 -8 -4 Z" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-4 -6 L0 -9 L4 -6" fill="none" stroke="#2b6a4e" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
  if (kind === "dot") return <circle r="6" fill={fill} stroke={stroke} strokeWidth="1.6" />;
  // apple and lime: round, the apple gets a stem and a leaf
  return (
    <g>
      <circle r="9" fill={fill} stroke={stroke} strokeWidth="1.6" />
      {kind === "apple" && <>
        <path d="M0 -9 L1 -13" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M1 -12 Q 6 -15 7 -10 Q 3 -9 1 -12 Z" fill="#2b6a4e" />
      </>}
    </g>
  );
}

function FruitIcon({ f, size = 56 }: { f: { kind: Fruit["kind"]; x: number }; size?: number }) {
  return (
    <svg viewBox="-16 -16 32 32" width={size} height={size} aria-hidden="true">
      <FruitShape kind={f.kind} x={f.x} />
    </svg>
  );
}

type Labelled = Example & { kind: Fruit["kind"] | "dot"; name?: string };
type Phase = "teach" | "test" | "lesson" | "more" | "retest" | "done";

const px = (x: number) => 6 + x * 88;
const py = (y: number) => 6 + (1 - y) * 88;

function Board({ examples, probe, onTap, tapLabel }: { examples: Labelled[]; probe?: { f: Fruit; near: Labelled | null } | null; onTap?: (x: number, y: number) => void; tapLabel?: string }) {
  const { t } = useT();
  const both = examples.some(e => e.apple) && examples.some(e => !e.apple);
  const cells = useMemo(() => {
    if (!both) return [];
    const out: { x: number; y: number; apple: boolean }[] = [];
    const N = 22;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const cx = (i + 0.5) / N, cy = (j + 0.5) / N;
      out.push({ x: i / N, y: j / N, apple: !!nearest(examples, cx, cy)?.apple });
    }
    return out;
  }, [examples, both]);
  const svgRef = useRef<SVGSVGElement>(null);
  const tap = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onTap || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * 100, sy = ((e.clientY - r.top) / r.height) * 100;
    const x = Math.min(1, Math.max(0, (sx - 6) / 88)), y = Math.min(1, Math.max(0, 1 - (sy - 6) / 88));
    onTap(x, y);
  };
  return (
    <figure className="yl-card bg-white p-3 sm:p-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <div className="flex flex-col justify-between items-center text-[0.8rem] font-bold py-2" aria-hidden="true">
          <span>{t("round", "rond")}</span>
          <span className="[writing-mode:vertical-rl] rotate-180 text-muted-ink">{t("shape", "forme")}</span>
          <span>{t("long", "long")}</span>
        </div>
        <div>
          <svg ref={svgRef} viewBox="0 0 100 100" className={`w-full aspect-square rounded-[12px] border-[3px] border-ink bg-[var(--paper)] ${onTap ? "cursor-crosshair touch-manipulation" : ""}`} onPointerDown={onTap ? tap : undefined}
            role="img" aria-label={t(`The robot's board: ${examples.length} examples. Green zone means apple, pink zone means not an apple.`, `Le tableau du robot : ${examples.length} exemples. Zone verte : pomme; zone rose : pas une pomme.`)}>
            {cells.map((c, k) => (
              <rect key={k} x={6 + c.x * 88} y={6 + (1 - c.y - 1 / 22) * 88} width={88 / 22 + 0.2} height={88 / 22 + 0.2} fill={c.apple ? "var(--yl-mint)" : "var(--yl-coral)"} opacity="0.32" />
            ))}
            {probe?.near && (
              <line className="yl-draw" pathLength={1} x1={px(probe.f.x)} y1={py(probe.f.y)} x2={px(probe.near.x)} y2={py(probe.near.y)} stroke="var(--ink)" strokeWidth="1.4" strokeDasharray="1" />
            )}
            {examples.map(e => (
              <g key={e.id} transform={`translate(${px(e.x)} ${py(e.y)}) scale(0.32)`} className="yl-drop">
                <circle r="15" fill="white" stroke={e.apple ? "var(--spruce)" : "var(--live)"} strokeWidth="4" />
                <FruitShape kind={e.kind} x={e.x} />
              </g>
            ))}
            {probe && (
              <g transform={`translate(${px(probe.f.x)} ${py(probe.f.y)}) scale(0.42)`} className="yl-pop-svg">
                <circle r="16" fill="var(--signal)" stroke="var(--ink)" strokeWidth="3" strokeDasharray="4 3" />
                <FruitShape kind={probe.f.kind} x={probe.f.x} />
              </g>
            )}
          </svg>
        </div>
        <span aria-hidden="true" />
        <div>
          <div aria-hidden="true">
            <div className="h-3 rounded-full border-2 border-ink" style={{ background: "linear-gradient(90deg, rgb(76,175,80), rgb(245,196,0), rgb(215,55,47))" }} />
            <div className="flex justify-between text-[0.8rem] font-bold mt-1"><span>{t("green", "vert")}</span><span className="text-muted-ink">{t("colour", "couleur")}</span><span>{t("red", "rouge")}</span></div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.9rem] font-semibold">
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-4 rounded-full border-[3px] border-spruce bg-white" aria-hidden="true" />{t("You said: apple", "Tu as dit : pomme")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-4 rounded-full border-[3px] border-live bg-white" aria-hidden="true" />{t("You said: not an apple", "Tu as dit : pas une pomme")}</span>
        {tapLabel && <span className="text-muted-ink">{tapLabel}</span>}
      </figcaption>
    </figure>
  );
}

export function TeachMachine() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const [phase, setPhase] = useState<Phase>("teach");
  const [examples, setExamples] = useState<Labelled[]>([]);
  const [own, setOwn] = useState<boolean>(true);
  const [ti, setTi] = useState(0);
  const [results, setResults] = useState<{ f: Fruit; guess: boolean; near: Labelled | null }[]>([]);
  const [first, setFirst] = useState<boolean | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  const tray = phase === "more" ? MISSING_FRUIT : TRAIN_FRUIT;
  const labelled = (id: string) => examples.find(e => e.id === id);
  const trayDone = tray.every(f => labelled(f.id));
  const testing = phase === "test" || phase === "retest";
  const probe = testing && ti < TEST_FRUIT.length ? TEST_FRUIT[ti] : null;
  const shown = results[ti];

  // Move focus to the new step's heading when the step changes (not on first load).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    headRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const label = (f: Fruit, apple: boolean) => {
    setExamples(xs => [...xs.filter(e => e.id !== f.id), { id: f.id, x: f.x, y: f.y, apple, kind: f.kind, name: pick(f.name) }]);
  };

  const addOwn = (x: number, y: number) => {
    setExamples(xs => [...xs, { id: `own-${Date.now()}-${xs.length}`, x, y, apple: own, kind: "dot" }]);
  };

  const guess = () => {
    if (!probe) return;
    const near = nearest(examples, probe.x, probe.y) as Labelled | null;
    setResults(r => [...r, { f: probe, guess: !!near?.apple, near }]);
  };

  const nextTest = () => {
    if (ti + 1 < TEST_FRUIT.length) { setTi(ti + 1); return; }
    const wrong = results.filter(r => r.guess !== r.f.apple).length;
    if (phase === "test" && wrong > 0) setPhase("lesson");
    else { setFirst(award("teach-the-machine", 4 - wrong)); setPhase("done"); }
  };

  const restartTests = (p: Phase) => { setResults([]); setTi(0); setPhase(p); };

  const replay = () => { setExamples([]); setResults([]); setTi(0); setFirst(null); setPhase("teach"); };

  if (phase === "done") {
    return (
      <FinishPanel a={A} firstTime={!!first} onReplay={replay} headline={t("Your robot learned fairly!", "Ton robot a appris de façon équitable!")}>
        <p>{t("A machine only knows what it was shown. When the examples include every kind of apple, it does a better job for every kind of apple. The same goes for people: technology works for everyone only when everyone is included.", "Une machine ne connaît que ce qu'on lui montre. Quand les exemples incluent toutes les sortes de pommes, elle fait mieux pour toutes les pommes. C'est pareil pour les gens : la technologie fonctionne pour tous seulement quand tout le monde est inclus.")}</p>
      </FinishPanel>
    );
  }

  const stepTitle =
    phase === "teach" ? t("Step 1: Teach the robot", "Étape 1 : Entraîne le robot")
      : phase === "test" ? t("Step 2: Test the robot", "Étape 2 : Teste le robot")
        : phase === "lesson" ? t("Hmm. Why did it get some wrong?", "Hum. Pourquoi s'est-il trompé?")
          : phase === "more" ? t("Step 3: Show it more apples", "Étape 3 : Montre-lui plus de pommes")
            : t("Step 4: Test it again", "Étape 4 : Teste-le encore");

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-start">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-12 w-12 rounded-full bg-white border-[3px] border-ink shrink-0"><Bot className="h-6 w-6" aria-hidden="true" /></span>
          <h2 ref={headRef} tabIndex={-1} className="yl-title text-[1.6rem] sm:text-[1.9rem] leading-tight outline-none">{stepTitle}</h2>
        </div>

        {(phase === "teach" || phase === "more") && (
          <>
            <p className="mt-3 text-[1.08rem] leading-relaxed">
              {phase === "teach"
                ? t("Tell the robot what each fruit is. It will remember each one on its board.", "Dis au robot ce qu'est chaque fruit. Il s'en souviendra sur son tableau.")
                : t("These apples were missing. Add them to the robot's examples.", "Ces pommes manquaient. Ajoute-les aux exemples du robot.")}
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tray.map(f => {
                const l = labelled(f.id);
                return (
                  <li key={f.id} className={`yl-card bg-white p-3 flex items-center gap-3 ${l ? "yl-done" : ""}`}>
                    <FruitIcon f={f} />
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold">{pick(f.name)}</p>
                      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t(`What is the ${pick(f.name)}?`, `Qu'est-ce que : ${pick(f.name)}?`)}>
                        <button type="button" aria-pressed={l?.apple === true} onClick={() => label(f, true)} className="yl-chip">{t("Apple", "Pomme")}</button>
                        <button type="button" aria-pressed={l?.apple === false} onClick={() => label(f, false)} className="yl-chip">{t("Not an apple", "Pas une pomme")}</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" disabled={!trayDone} className="yl-btn yl-btn--big yl-btn--ink" onClick={() => restartTests(phase === "teach" ? "test" : "retest")}>
                {phase === "teach" ? t("Test the robot", "Tester le robot") : t("Test it again", "Le tester encore")} <ArrowRight className="h-6 w-6" aria-hidden="true" />
              </button>
              {!trayDone && <span className="text-[0.95rem] font-semibold">{t(`${tray.filter(f => labelled(f.id)).length} of ${tray.length} taught`, `${tray.filter(f => labelled(f.id)).length} sur ${tray.length} appris`)}</span>}
            </div>
            <details className="mt-6 rounded-[16px] border-[3px] border-ink bg-white p-4">
              <summary className="font-extrabold cursor-pointer min-h-[44px] flex items-center">{t("Free play: add your own dots", "Jeu libre : ajoute tes propres points")}</summary>
              <p className="mt-2 leading-relaxed">{t("Pick a group, then tap the board to add a dot. Watch the coloured zones move: that's the robot changing its mind.", "Choisis un groupe, puis touche le tableau pour ajouter un point. Regarde les zones bouger : c'est le robot qui change d'idée.")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" aria-pressed={own} onClick={() => setOwn(true)} className="yl-chip"><Plus className="h-4 w-4" aria-hidden="true" />{t("Apple dots", "Points pomme")}</button>
                <button type="button" aria-pressed={!own} onClick={() => setOwn(false)} className="yl-chip"><Plus className="h-4 w-4" aria-hidden="true" />{t("Not-apple dots", "Points pas pomme")}</button>
                <button type="button" onClick={() => setExamples(xs => xs.filter(e => !e.id.startsWith("own-")))} className="yl-chip"><Eraser className="h-4 w-4" aria-hidden="true" />{t("Clear my dots", "Effacer mes points")}</button>
              </div>
            </details>
          </>
        )}

        {testing && probe && (
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2" aria-hidden="true">
              {TEST_FRUIT.map((f, n) => {
                const r = results[n];
                return <span key={f.id} className={`h-3.5 w-3.5 rounded-full border-2 border-ink ${r ? (r.guess === r.f.apple ? "bg-[var(--yl-mint)]" : "bg-[var(--yl-coral)]") : n === ti ? "bg-signal" : "bg-white"}`} />;
              })}
            </div>
            <div key={`${phase}-${ti}`} className="yl-card yl-deal bg-white p-5 mt-3 flex flex-col sm:flex-row gap-5 sm:items-center">
              <span className="grid place-items-center h-24 w-24 rounded-full yl-tone-sun border-[3px] border-ink shrink-0 self-center"><FruitIcon f={probe} size={64} /></span>
              <div className="flex-1">
                <p className="text-[1.05rem] font-semibold">{t("Mystery fruit", "Fruit mystère")} {ti + 1}</p>
                {!shown ? (
                  <>
                    <p className="yl-title text-[1.5rem] leading-tight mt-1">{t("Robot, is this an apple?", "Robot, est-ce une pomme?")}</p>
                    <button type="button" className="yl-btn yl-btn--big yl-tone-sky mt-4" onClick={guess}><Bot className="h-6 w-6" aria-hidden="true" />{t("Ask the robot", "Demander au robot")}</button>
                  </>
                ) : (
                  <div aria-live="polite">
                    <p className="yl-title text-[1.5rem] leading-tight mt-1">
                      {t("Robot says: ", "Le robot dit : ")}{shown.guess ? t("apple!", "pomme!") : t("not an apple!", "pas une pomme!")}
                    </p>
                    <p className={`mt-2 inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-3 py-1 font-extrabold ${shown.guess === probe.apple ? "yl-tone-mint" : "yl-tone-coral"}`}>
                      {shown.guess === probe.apple ? <Check className="h-5 w-5" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
                      {t("It's really a ", "C'est en fait : ")}{pick(probe.name).toLowerCase()}
                    </p>
                    <p className="mt-2 leading-relaxed">
                      {shown.near
                        ? t(`Closest thing it was shown: ${shown.near.name ?? "one of your dots"}, which you called ${shown.near.apple ? "an apple" : "not an apple"}.`, `La chose la plus proche qu'il a vue : ${shown.near.name ?? "un de tes points"}, que tu as appelé ${shown.near.apple ? "pomme" : "pas une pomme"}.`)
                        : t("It has no examples yet!", "Il n'a encore aucun exemple!")}
                    </p>
                    <button type="button" className="yl-btn yl-btn--ink mt-4" onClick={nextTest}>
                      {ti + 1 < TEST_FRUIT.length ? t("Next mystery fruit", "Fruit mystère suivant") : t("See how it did", "Voir le résultat")} <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "lesson" && (
          <div className="yl-card yl-deal yl-tone-grape p-5 sm:p-6 mt-4">
            <p className="text-[1.15rem] leading-relaxed">
              {t("The robot isn't silly. It only knows what it was shown. You showed it red apples only, so it learned that apples are red. A green apple looked more like the lime!", "Le robot n'est pas bête. Il ne connaît que ce qu'on lui a montré. Tu ne lui as montré que des pommes rouges, alors il a appris que les pommes sont rouges. La pomme verte ressemblait plus à la lime!")}
            </p>
            <p className="mt-3 text-[1.08rem] leading-relaxed">
              {t("This happens with real AI too. If a computer learns from photos of only some kinds of people, it works worse for everyone else. That isn't fair, and it can be fixed: show it more variety.", "Ça arrive aussi avec la vraie IA. Si un ordinateur apprend avec des photos de certaines personnes seulement, il fonctionne moins bien pour les autres. Ce n'est pas juste, et ça se corrige : il faut lui montrer plus de variété.")}
            </p>
            <button type="button" className="yl-btn yl-btn--big yl-btn--ink mt-5" onClick={() => setPhase("more")}>
              {t("Show it more apples", "Lui montrer plus de pommes")} <ArrowRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-24">
        <Board examples={examples} probe={shown ? { f: shown.f, near: shown.near } : probe ? { f: probe, near: null } : null}
          onTap={phase === "teach" || phase === "more" ? addOwn : undefined}
          tapLabel={phase === "teach" || phase === "more" ? t("Tip: open Free play to tap the board.", "Astuce : ouvre le Jeu libre pour toucher le tableau.") : undefined} />
      </div>
    </div>
  );
}
