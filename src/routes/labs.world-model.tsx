import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHead } from "@/components/LabBits";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef } from "@/lib/seo";
import type { Bi } from "@/lib/i18n";

/**
 * Inside a World Model: a playable explainer. A tiny "world model" draws the
 * room around you one view at a time and keeps only a short memory, the way
 * Genie-style models do. Turn away, come back, and see what it forgot.
 * Everything runs in the browser; nothing is sent anywhere.
 */

export const Route = createFileRoute("/labs/world-model")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Inside a world model: play with an AI's short memory — ${SITE.name} Labs`, fr: `Dans un modèle de monde : jouez avec la mémoire courte d'une IA — ${SITE.name} Labs` },
      description: {
        en: "World models like Google DeepMind's Genie 4 build a place you can walk through, one frame at a time. Turn around in our toy world and see why they forget what is behind you.",
        fr: "Les modèles de monde comme Genie 4 de Google DeepMind bâtissent un lieu où l'on peut marcher, image par image. Tournez-vous dans notre petit monde et voyez pourquoi ils oublient ce qui est derrière vous.",
      },
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: locale === "fr" ? "Dans un modèle de monde" : "Inside a world model",
        url,
        publisher: publisherRef,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        learningResourceType: "Interactive explainer",
        educationalLevel: locale === "fr" ? "11 ans et plus" : "Ages 11 and up",
        isAccessibleForFree: true,
        about: ["World models", "Generative AI", "Object permanence"],
      }],
    }),
  component: WorldModelPage,
});

/* ------------------------------------------------------------------ */
/* The toy world                                                       */
/* ------------------------------------------------------------------ */

type Thing = { id: string; label: Bi; shape: Shape };
type Shape = "tree" | "rock" | "fire" | "hut" | "water" | "bush" | "log" | "person" | "hill" | "bird";

/** What the model "knows" a prehistoric camp tends to contain. It picks from this when it has to imagine a view. */
const POOL: Thing[] = [
  { id: "acacia", label: { en: "Acacia tree", fr: "Acacia" }, shape: "tree" },
  { id: "rock", label: { en: "Big rock", fr: "Gros rocher" }, shape: "rock" },
  { id: "fire", label: { en: "Campfire", fr: "Feu de camp" }, shape: "fire" },
  { id: "shelter", label: { en: "Branch shelter", fr: "Abri de branches" }, shape: "hut" },
  { id: "pool", label: { en: "Water hole", fr: "Point d'eau" }, shape: "water" },
  { id: "bush", label: { en: "Thorn bush", fr: "Buisson épineux" }, shape: "bush" },
  { id: "log", label: { en: "Fallen log", fr: "Tronc couché" }, shape: "log" },
  { id: "hunter", label: { en: "Someone resting", fr: "Quelqu'un au repos" }, shape: "person" },
  { id: "hill", label: { en: "Low hill", fr: "Colline" }, shape: "hill" },
  { id: "birds", label: { en: "Birds overhead", fr: "Oiseaux" }, shape: "bird" },
];

const SLOTS = 8; // 8 directions, 45° each
const VIEW = 3; // you see 3 directions at once
const DIRS: Bi[] = [
  { en: "N", fr: "N" }, { en: "NE", fr: "NE" }, { en: "E", fr: "E" }, { en: "SE", fr: "SE" },
  { en: "S", fr: "S" }, { en: "SW", fr: "SO" }, { en: "W", fr: "O" }, { en: "NW", fr: "NO" },
];

type Memory = { thing: Thing; seen: number } | null;

/** Small seeded random, so the first walk is the same for everyone. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function Glyph({ shape, className = "" }: { shape: Shape; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {shape === "tree" && <><path {...common} d="M32 58V30" /><path {...common} d="M10 26c8-8 36-8 44 0-8 4-36 4-44 0z" /><path {...common} d="M32 30l-10-6M32 30l10-6" /></>}
      {shape === "rock" && <path {...common} d="M8 52l8-18 12-8 14 4 10 12 4 10z" />}
      {shape === "fire" && <><path {...common} d="M32 50c-9 0-13-7-10-14 2-5 6-7 6-14 7 4 12 10 12 17 0 2 3-1 3-5 4 5 3 16-11 16z" /><path {...common} d="M18 56h28M22 52l20 6M42 52l-20 6" /></>}
      {shape === "hut" && <><path {...common} d="M8 54L32 14l24 40z" /><path {...common} d="M26 54V40h12v14M20 34l-6 10M44 34l6 10" /></>}
      {shape === "water" && <><path {...common} d="M6 44c6-4 10 4 16 0s10 4 16 0 10 4 16 0 6 2 4 2" /><path {...common} d="M10 54c6-4 10 4 16 0s10 4 16 0 10 4 12 2" /></>}
      {shape === "bush" && <path {...common} d="M10 52c-4-10 6-16 10-12 0-10 12-12 14-4 4-8 16-4 14 6 8 0 8 10 4 10z" />}
      {shape === "log" && <><rect {...common} x="8" y="36" width="44" height="14" rx="7" /><circle {...common} cx="52" cy="43" r="7" /></>}
      {shape === "person" && <><circle {...common} cx="24" cy="24" r="6" /><path {...common} d="M24 30v10l16 4M24 40l-8 14M40 44l10 10" /></>}
      {shape === "hill" && <path {...common} d="M4 54c10-20 18-26 28-26s18 8 28 26z" />}
      {shape === "bird" && <><path {...common} d="M10 28c4-4 8-4 10 0 2-4 6-4 10 0" /><path {...common} d="M34 20c4-4 8-4 10 0 2-4 6-4 10 0" /><path {...common} d="M22 42c3-3 6-3 8 0 2-3 5-3 8 0" /></>}
    </svg>
  );
}

function ToyWorld() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [memory, setMemory] = useState(3); // how many turns the model remembers a view
  const [heading, setHeading] = useState(0);
  const [step, setStep] = useState(0);
  const [mem, setMem] = useState<Memory[]>(() => Array(SLOTS).fill(null));
  const [changed, setChanged] = useState<Set<number>>(new Set());
  const [changes, setChanges] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const rand = useRef(rng(1921));

  const visible = useMemo(() => Array.from({ length: VIEW }, (_, i) => (heading - 1 + i + SLOTS) % SLOTS), [heading]);

  /** The model draws the view: remembered slots stay, forgotten ones are imagined again. */
  const render = useCallback((h: number, s: number, prev: Memory[]) => {
    const next = [...prev];
    const flips = new Set<number>();
    const notes: string[] = [];
    for (let i = 0; i < VIEW; i++) {
      const slot = (h - 1 + i + SLOTS) % SLOTS;
      const m = next[slot];
      if (m && s - m.seen <= memory) {
        next[slot] = { thing: m.thing, seen: s };
      } else {
        const thing = POOL[Math.floor(rand.current() * POOL.length)];
        if (m && m.thing.id !== thing.id) {
          flips.add(slot);
          notes.push(fr
            ? `${pick(DIRS[slot])} : « ${pick(m.thing.label)} » est devenu « ${pick(thing.label)} »`
            : `${pick(DIRS[slot])}: “${pick(m.thing.label)}” became “${pick(thing.label)}”`);
        }
        next[slot] = { thing, seen: s };
      }
    }
    return { next, flips, notes };
  }, [memory, fr, pick]);

  // First view
  useEffect(() => {
    const { next } = render(0, 0, Array(SLOTS).fill(null));
    setMem(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const turn = (dir: -1 | 1) => {
    const h = (heading + dir + SLOTS) % SLOTS;
    const s = step + 1;
    const { next, flips, notes } = render(h, s, mem);
    setHeading(h);
    setStep(s);
    setMem(next);
    setChanged(flips);
    if (flips.size) {
      setChanges(c => c + flips.size);
      setLog(l => [...notes, ...l].slice(0, 6));
    }
  };

  const reset = () => {
    rand.current = rng(1921);
    const { next } = render(0, 0, Array(SLOTS).fill(null));
    setHeading(0); setStep(0); setMem(next); setChanged(new Set()); setChanges(0); setLog([]);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); turn(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); turn(1); }
  };

  return (
    <div className="rounded-[10px] bg-night text-white p-5 sm:p-7" onKeyDown={onKey}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8rem] font-bold tracking-[0.12em] text-brass">{fr ? "LE MONDE-JOUET · UN CAMP, IL Y A UN MILLION D'ANNÉES" : "THE TOY WORLD · A CAMP, ONE MILLION YEARS AGO"}</p>
        <p className="text-[0.85rem] text-white/70 tabular-nums" aria-live="polite">
          {fr ? `Vous regardez vers ${pick(DIRS[heading])} · tour ${step}` : `Facing ${pick(DIRS[heading])} · turn ${step}`}
        </p>
      </div>

      {/* The view: three directions */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3" role="img" aria-label={fr ? "Ce que le modèle dessine devant vous" : "What the model draws in front of you"}>
        {visible.map(slot => {
          const m = mem[slot];
          const flip = changed.has(slot);
          return (
            <div key={`${slot}-${step}`} className={`relative rounded-[8px] border-2 ${flip ? "border-signal" : "border-white/15"} bg-night-2 p-3 sm:p-4 aspect-[4/5] flex flex-col items-center justify-center text-center hero-in`}>
              <span className="absolute left-2 top-2 text-[0.75rem] font-bold text-white/50">{pick(DIRS[slot])}</span>
              {flip && <span className="absolute right-2 top-2 bg-signal text-signal-ink text-[0.62rem] sm:text-[0.7rem] font-bold tracking-[0.08em] px-1.5 py-0.5 rounded-[3px]">{fr ? "CHANGÉ" : "CHANGED"}</span>}
              {m && <Glyph shape={m.thing.shape} className="h-14 w-14 sm:h-24 sm:w-24 text-signal" />}
              {m && <span className="mt-2 text-[0.82rem] sm:text-[1rem] font-semibold leading-tight">{pick(m.thing.label)}</span>}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => turn(-1)} className="press inline-flex min-h-[44px] items-center gap-2 rounded-[5px] border-2 border-white/80 px-4 font-bold hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />{fr ? "Tourner à gauche" : "Turn left"}
        </button>
        <button type="button" onClick={() => turn(1)} className="press inline-flex min-h-[44px] items-center gap-2 rounded-[5px] bg-signal text-signal-ink px-4 font-bold">
          {fr ? "Tourner à droite" : "Turn right"}<ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={reset} className="press inline-flex min-h-[44px] items-center gap-2 rounded-[5px] px-3 text-white/80 hover:text-white">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />{fr ? "Recommencer" : "Start again"}
        </button>
        <span className="text-[0.82rem] text-white/60">{fr ? "Astuce : les flèches du clavier marchent aussi." : "Tip: your arrow keys work too."}</span>
      </div>

      {/* Memory slider */}
      <div className="mt-6 grid gap-4 md:grid-cols-12 md:items-center border-t border-white/15 pt-5">
        <label htmlFor="wm-memory" className="md:col-span-4">
          <span className="block font-bold">{fr ? "Mémoire du modèle" : "The model's memory"}</span>
          <span className="block text-[0.88rem] text-white/70">
            {memory >= SLOTS
              ? (fr ? "Assez pour faire tout le tour : rien ne change." : "Enough for a full circle: nothing changes.")
              : (fr ? `Il se souvient d'une vue pendant ${memory} tour${memory > 1 ? "s" : ""}.` : `It remembers a view for ${memory} turn${memory > 1 ? "s" : ""}.`)}
          </span>
        </label>
        <input id="wm-memory" type="range" min={1} max={SLOTS} value={memory} onChange={e => setMemory(Number(e.target.value))} className="md:col-span-5 accent-[var(--signal)] h-2" />
        <p className="md:col-span-3 md:text-right">
          <span className="masthead-serif text-signal text-[2.2rem] leading-none tabular-nums">{changes}</span>
          <span className="block text-[0.85rem] text-white/70">{fr ? "choses changées derrière votre dos" : "things changed behind your back"}</span>
        </p>
      </div>

      {log.length > 0 && (
        <ul className="mt-4 grid gap-1 text-[0.88rem] text-white/80" aria-live="polite">
          {log.map((l, i) => <li key={`${l}-${i}`}>· {l}</li>)}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const STEPS: { t: Bi; b: Bi }[] = [
  {
    t: { en: "You describe a place", fr: "Vous décrivez un lieu" },
    b: { en: "A sentence or a picture. Genie 4 turns it into a first frame.", fr: "Une phrase ou une image. Genie 4 en fait une première image." },
  },
  {
    t: { en: "You press a key", fr: "Vous appuyez sur une touche" },
    b: { en: "Walk, turn, jump. Your action is part of the input.", fr: "Marcher, tourner, sauter. Votre geste fait partie de la demande." },
  },
  {
    t: { en: "It guesses the next frame", fr: "Il devine l'image suivante" },
    b: { en: "From the frames it has made so far and your action, 24 times a second. There is no stored 3D map.", fr: "À partir des images déjà faites et de votre geste, 24 fois par seconde. Il n'y a pas de carte 3D en mémoire." },
  },
  {
    t: { en: "Old frames fade", fr: "Les vieilles images s'effacent" },
    b: { en: "It can only look back so far. What left the screen long ago may be re-imagined, differently.", fr: "Il ne peut regarder en arrière que jusqu'à un certain point. Ce qui a quitté l'écran depuis longtemps peut être réinventé, autrement." },
  },
];

const USES: { k: Bi; good: Bi; risk: Bi }[] = [
  {
    k: { en: "Training robots", fr: "Entraîner des robots" },
    good: { en: "Practise in thousands of made-up kitchens before touching a real one.", fr: "S'exercer dans des milliers de cuisines inventées avant d'en toucher une vraie." },
    risk: { en: "If the made-up physics is wrong, the robot learns the wrong lesson.", fr: "Si la physique inventée est fausse, le robot apprend la mauvaise leçon." },
  },
  {
    k: { en: "Games and stories", fr: "Jeux et récits" },
    good: { en: "A world that appears as you walk, from one sentence.", fr: "Un monde qui apparaît pendant qu'on marche, à partir d'une phrase." },
    risk: { en: "Short sessions, lag, and a world that drifts after a minute or two.", fr: "Séances courtes, délai, et un monde qui dérive après une minute ou deux." },
  },
  {
    k: { en: "History class", fr: "Cours d'histoire" },
    good: { en: "Stand in a 1921 lab or a cave hearth and ask better questions.", fr: "Se tenir dans un labo de 1921 ou près d'un foyer de caverne, et poser de meilleures questions." },
    risk: { en: "It looks like a documentary but invents faces, objects and views.", fr: "On dirait un documentaire, mais l'IA invente des visages, des objets et des vues." },
  },
];

function WorldModelPage() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw pt-8 pb-10 sm:pt-12 sm:pb-14">
          <p className="text-[0.9rem]">
            <Link to="/labs" className="text-white/70 hover:text-white">Labs</Link>
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="border border-brass text-brass text-[0.85rem] font-semibold px-3 py-1 rounded-full">{fr ? "Explication jouable" : "Playable explainer"}</span>
            <span className="border border-white/25 text-[0.85rem] px-3 py-1 rounded-full">{fr ? "11 ans et plus · 10 minutes" : "Ages 11 and up · 10 minutes"}</span>
          </div>
          <h1 className="masthead-serif text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem] leading-[1] mt-4 max-w-[18ch]">
            {fr ? <>Dans un <span className="text-signal">modèle de monde</span></> : <>Inside a <span className="text-signal">world model</span></>}
          </h1>
          <p className="font-serif text-[1.15rem] sm:text-[1.3rem] leading-relaxed text-white/80 mt-5 max-w-[46rem]">
            {fr
              ? "Genie 4, de Google DeepMind, bâtit un lieu où l'on peut marcher, à partir d'une phrase. Il ne construit pas de carte : il devine l'image suivante, encore et encore. Tournez-vous dans notre petit monde et voyez ce que ça veut dire."
              : "Google DeepMind's Genie 4 builds a place you can walk through from one sentence. It doesn't build a map: it guesses the next picture, again and again. Turn around in our toy world and see what that means."}
          </p>
        </div>
      </section>

      <section className="container-mw mt-10 sm:mt-14" aria-labelledby="play-title">
        <SectionHead id="play-title" kicker={fr ? "À vous" : "Your turn"} title={fr ? "Faites le tour, puis revenez" : "Turn all the way round, then come back"} />
        <p className="dek mt-1 max-w-3xl">
          {fr
            ? "Le modèle dessine trois directions à la fois. Avec une mémoire courte, ce qui était derrière vous est réinventé quand vous revenez. Montez la mémoire et recommencez."
            : "The model draws three directions at a time. With a short memory, what was behind you gets re-imagined when you look again. Raise the memory and try again."}
        </p>
        <div className="mt-6"><ToyWorld /></div>
        <p className="meta mt-3 max-w-3xl">
          {fr
            ? "Un jouet, pas Genie : il choisit au hasard dans une liste de choses qu'on trouve dans un camp. Mais l'effet est le même que celui que nous avons filmé dans Genie 4."
            : "A toy, not Genie: it picks at random from a list of things a camp might hold. But the effect is the one we filmed in Genie 4."}
        </p>
      </section>

      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="how-title">
        <SectionHead id="how-title" kicker={fr ? "Comment ça marche" : "How it works"} title={fr ? "Quatre étapes, 24 fois par seconde" : "Four steps, 24 times a second"} />
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={i} className="border-t-[3px] border-signal pt-3">
              <span aria-hidden="true" className="masthead-serif text-[2.2rem] leading-none tabular-nums text-brass-ink">{i + 1}</span>
              <h3 className="hl text-[1.25rem] mt-1">{pick(s.t)}</h3>
              <p className="mt-1.5 text-[0.98rem] leading-relaxed text-muted-ink">{pick(s.b)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 bg-ice rounded-[10px] p-6 sm:p-8 grid gap-4 md:grid-cols-12">
          <p className="md:col-span-4 masthead-serif text-[1.5rem] leading-tight">{fr ? "Le mot à retenir : la permanence de l'objet" : "The word to know: object permanence"}</p>
          <p className="md:col-span-8 font-serif text-[1.08rem] leading-relaxed">
            {fr
              ? "Un bébé apprend vers huit mois qu'un jouet caché sous une couverture existe toujours. Les modèles de monde ont encore du mal avec ça. Google indique que les séances de Genie 4 restent cohérentes environ deux minutes; dans notre propre essai, l'image était la plus stable pendant la première minute."
              : "Around eight months old, a baby learns that a toy under a blanket is still there. World models still struggle with that. Google says Genie 4 sessions hold together for about two minutes; in our own test the picture was steadiest in the first minute."}
          </p>
        </div>
      </section>

      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="uses-title">
        <SectionHead id="uses-title" kicker={fr ? "Utile, et risqué" : "Useful, and risky"} title={fr ? "À quoi ça sert, et où ça trompe" : "Where it helps, and where it misleads"} />
        <div className="mt-6 border-t-2 border-ink">
          {USES.map((u, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-12 py-5 border-b border-line">
              <p className="md:col-span-3 hl text-[1.25rem]">{pick(u.k)}</p>
              <p className="md:col-span-4 text-[1rem] leading-relaxed"><strong className="text-lake">{fr ? "Aide : " : "Helps: "}</strong>{pick(u.good)}</p>
              <p className="md:col-span-5 text-[1rem] leading-relaxed"><strong className="text-brass-ink">{fr ? "Risque : " : "Risk: "}</strong>{pick(u.risk)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="class-title">
        <div className="bg-signal text-signal-ink rounded-[10px] p-6 sm:p-9">
          <p className="text-[0.78rem] font-bold tracking-[0.12em]">{fr ? "EN CLASSE · 15 MINUTES" : "FOR THE CLASSROOM · 15 MINUTES"}</p>
          <h2 id="class-title" className="masthead-serif text-[1.8rem] sm:text-[2.1rem] mt-2">{fr ? "Le jeu du dos tourné" : "The back-turned game"}</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <ol className="list-decimal pl-5 grid gap-2 text-[1.02rem] leading-relaxed">
              <li>{fr ? "Un élève décrit la classe en trois phrases, sans regarder derrière lui." : "One student describes the classroom in three sentences without looking behind them."}</li>
              <li>{fr ? "Il se retourne 30 secondes, puis décrit de nouveau le mur qu'il ne voyait plus." : "They turn away for 30 seconds, then describe the wall they could no longer see."}</li>
              <li>{fr ? "La classe compare : qu'est-ce qui a été oublié, ajouté, inventé?" : "The class compares: what was forgotten, added, invented?"}</li>
            </ol>
            <ul className="list-disc pl-5 grid gap-2 text-[1.02rem] leading-relaxed">
              <li>{fr ? "Pourquoi une machine qui devine l'image suivante finit-elle par dériver?" : "Why does a machine that guesses the next picture drift over time?"}</li>
              <li>{fr ? "Qu'est-ce qui rendrait sa mémoire plus longue, et qu'est-ce que ça coûterait?" : "What would give it a longer memory, and what would that cost?"}</li>
              <li>{fr ? "Quand une scène générée a l'air vraie, qu'est-ce qui vous aide à vérifier?" : "When a generated scene looks real, what helps you check it?"}</li>
            </ul>
          </div>
          <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-bold">
            <Link to="/labs/history" className="underline underline-offset-4">{fr ? "Voir de vraies séances Genie 4" : "See real Genie 4 sessions"}</Link>
            <Link to="/labs/young/classroom" className="underline underline-offset-4">{fr ? "Mode classe du Jeune Labo" : "Young Lab classroom mode"}</Link>
          </p>
        </div>
      </section>

      <section className="container-mw mt-14 sm:mt-16" aria-labelledby="sources-title">
        <SectionHead id="sources-title" title="Sources" />
        <ul className="mt-3 grid gap-2">
          {[
            { title: "Google DeepMind, “Genie 4: A new generation of world simulation”", url: "https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation/" },
            { title: "Google, “Genie 4 is now available” (Project Genie)", url: "https://blog.google/innovation-and-ai/models-and-research/google-deepmind/genie-4-now-available-project-genie/" },
            { title: "TechCrunch, “Google’s Genie 4 world model adds audio, more realistic worlds and real-time steering”", url: "https://techcrunch.com/2026/10/27/googles-genie-4-world-model-adds-audio-more-realistic-worlds-and-real-time-steering/" },
          ].map(s => (
            <li key={s.url} className="text-[0.95rem]">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lake hover:underline">
                {s.title}<ArrowUpRight className="inline h-3.5 w-3.5 ml-0.5 -mt-0.5" aria-hidden="true" /><span className="sr-only">{fr ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="meta mt-5 max-w-3xl">
          {fr
            ? "Le monde-jouet tourne dans votre navigateur. Rien de ce que vous faites n'est envoyé ailleurs. Texte rédigé et vérifié par la rédaction."
            : "The toy world runs in your browser. Nothing you do is sent anywhere. Text written and checked by the newsroom."}
          {" "}<Link to="/how-we-use-ai" className="text-lake font-semibold hover:underline">{fr ? "Notre utilisation de l'IA" : "How we use AI"}</Link>
        </p>
      </section>
    </PageShell>
  );
}
