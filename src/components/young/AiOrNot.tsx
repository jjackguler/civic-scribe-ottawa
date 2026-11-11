import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Cog, Layers, RotateCcw, Sparkles, X } from "lucide-react";
import { AI_OR_NOT, activityById, type AiOrNotItem } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, ICONS, RoundDots, usePlaying, useT } from "@/components/YoungLab";
import { LabGuide } from "@/components/young/LabGuide";
import type { Bi } from "@/lib/i18n";

const A = activityById("ai-or-not")!;

type Level = 1 | 2 | 3;
type Answer = "ai" | "no" | "partly";
const LEVELS: Level[] = [1, 2, 3];

const LEVEL_INFO: Record<Level, { name: Bi; tone: string; hint: Bi; lesson: Bi }> = {
  1: {
    name: { en: "Warm-up", fr: "Échauffement" },
    tone: "yl-tone-sun",
    hint: {
      en: "Here's the trick. Ask: did this machine learn from lots of examples, or does it follow one exact rule a person wrote? Learned means AI.",
      fr: "Voici le truc. Demande-toi : cette machine a-t-elle appris à partir de beaucoup d'exemples, ou suit-elle une règle exacte écrite par une personne? Si elle a appris, c'est de l'IA.",
    },
    lesson: {
      en: "AI learns from examples and makes a best guess. Machines with fixed rules do the same thing every time. Both are useful!",
      fr: "L'IA apprend à partir d'exemples et fait sa meilleure supposition. Les machines à règles fixes font toujours la même chose. Les deux sont utiles!",
    },
  },
  2: {
    name: { en: "Trickier", fr: "Plus difficile" },
    tone: "yl-tone-sky",
    hint: {
      en: "Now it gets sneaky. Some machines look simple but learned a lot. Others look clever but just follow rules. Think about what the machine has to guess.",
      fr: "Ça se corse. Certaines machines ont l'air simples mais ont beaucoup appris. D'autres ont l'air malines mais suivent juste des règles. Pense à ce que la machine doit deviner.",
    },
    lesson: {
      en: "If a machine has to guess something new, like which email is junk or whose face this is, it probably learned from examples. If it just counts or follows a timer, it doesn't.",
      fr: "Si une machine doit deviner quelque chose de nouveau, comme quel courriel est un pourriel ou à qui est ce visage, elle a sans doute appris à partir d'exemples. Si elle compte ou suit une minuterie, non.",
    },
  },
  3: {
    name: { en: "Expert", fr: "Expert" },
    tone: "yl-tone-coral",
    hint: {
      en: "Expert level, and a new button: Partly AI. Some things mix both: one part follows rules and another part learned from examples. And watch out: people sometimes say AI for things that never learn!",
      fr: "Niveau expert, avec un nouveau bouton : En partie de l'IA. Certaines choses mélangent les deux : une partie suit des règles et une autre a appris à partir d'exemples. Et attention : on dit parfois IA pour des choses qui n'apprennent jamais!",
    },
    lesson: {
      en: "Real machines are often a mix. The same job, like heating a house, can be done with a simple rule or with AI. The question is always: did it learn from examples?",
      fr: "Les vraies machines sont souvent un mélange. Le même travail, comme chauffer une maison, peut se faire avec une règle simple ou avec l'IA. La question reste : a-t-elle appris à partir d'exemples?",
    },
  },
};

const keyOf = (it: AiOrNotItem): Answer => (it.partly ? "partly" : it.ai ? "ai" : "no");
const deckFor = (l: Level) => AI_OR_NOT.filter(x => x.level === l);

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

type Phase = "levels" | "play" | "levelDone" | "done";

export function AiOrNot() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const [phase, setPhase] = useState<Phase>("levels");
  const [level, setLevel] = useState<Level>(1);
  const [scores, setScores] = useState<Partial<Record<Level, number>>>({});
  // Each level starts in a fixed order so the page renders the same on the server and in the browser.
  const [deck, setDeck] = useState<AiOrNotItem[]>(() => deckFor(1));
  const [i, setI] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [choice, setChoice] = useState<Answer | null>(null);
  const [firstStamp, setFirstStamp] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const flipped = choice !== null;
  const item = deck[i];
  const right = flipped && !!item && choice === keyOf(item);

  useEffect(() => { if (flipped) nextRef.current?.focus({ preventScroll: true }); }, [flipped]);
  const moved = useRef(false);
  useEffect(() => { if (moved.current && phase === "play") cardRef.current?.focus({ preventScroll: true }); moved.current = true; }, [i, phase]);
  useEffect(() => { if (phase !== "play") topRef.current?.focus({ preventScroll: false }); }, [phase]);

  const start = (l: Level, mix = false) => {
    const d = deckFor(l);
    setLevel(l);
    setDeck(mix ? shuffle(d) : d);
    setI(0); setChoice(null); setResults(Array(d.length).fill(null));
    setPhase("play");
  };

  const answer = (a: Answer) => {
    if (flipped || !item) return;
    setChoice(a);
    setResults(r => r.map((v, n) => (n === i ? a === keyOf(item) : v)));
  };

  const next = () => {
    if (i + 1 < deck.length) { setChoice(null); setI(i + 1); return; }
    const score = results.filter(Boolean).length;
    const all = { ...scores, [level]: Math.max(score, scores[level] ?? 0) };
    setScores(all);
    // The stamp comes with the warm-up, so younger players earn it too. Best score counts all levels.
    const total = LEVELS.reduce((s, l) => s + (all[l] ?? 0), 0);
    const first = award("ai-or-not", total);
    if (level === 3) { setFirstStamp(first); setPhase("done"); return; }
    setFirstStamp(first);
    setPhase("levelDone");
  };

  const total = LEVELS.reduce((s, l) => s + (scores[l] ?? 0), 0);
  const max = AI_OR_NOT.length;

  /* ---------- Level picker ---------- */
  if (phase === "levels") {
    const nextUp = LEVELS.find(l => scores[l] === undefined) ?? 1;
    return (
      <div ref={topRef} tabIndex={-1} className="grid gap-6 outline-none">
        <LabGuide say={t(
          "Hi, I'm Bit! Lots of machines around you seem smart. But which ones really use AI? Start with the warm-up. Each level gets a little harder.",
          "Salut, je suis Bit! Plein de machines autour de toi ont l'air intelligentes. Mais lesquelles utilisent vraiment l'IA? Commence par l'échauffement. Chaque niveau est un peu plus difficile.",
        )} />
        <div className="yl-levels" role="list" aria-label={t("Levels", "Niveaux")}>
          {LEVELS.map(l => {
            const info = LEVEL_INFO[l];
            const done = scores[l] !== undefined;
            return (
              <div role="listitem" key={l} className="flex">
                <button type="button" className={`yl-level w-full ${info.tone}`} onClick={() => start(l)} aria-current={l === nextUp ? "step" : undefined}>
                  <span className="yl-level-num bg-white">{done ? <Check className="h-6 w-6" aria-hidden="true" /> : l}</span>
                  <span className="yl-title text-[1.2rem] sm:text-[1.45rem] leading-tight">{pick(info.name)}</span>
                  <span className="yl-level-bars" aria-hidden="true">{LEVELS.map(b => <span key={b} className={b <= l ? "is-on" : ""} style={{ height: `${6 + b * 4}px` }} />)}</span>
                  <span className="text-[0.92rem] font-bold">
                    {done ? t(`${scores[l]} of ${deckFor(l).length}`, `${scores[l]} sur ${deckFor(l).length}`) : l === nextUp ? t("Start here", "Commence ici") : t(`${deckFor(l).length} cards`, `${deckFor(l).length} cartes`)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" className="yl-btn yl-btn--big yl-btn--ink justify-self-start" onClick={() => start(nextUp)}>
          {t(`Play level ${nextUp}: ${pick(LEVEL_INFO[nextUp].name)}`, `Jouer au niveau ${nextUp} : ${pick(LEVEL_INFO[nextUp].name)}`)} <ArrowRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    );
  }

  /* ---------- Level finished ---------- */
  if (phase === "levelDone") {
    const s = scores[level] ?? 0;
    const n = deckFor(level).length;
    const nextLevel = (level + 1) as Level;
    const good = s >= n - 1;
    return (
      <section ref={topRef} tabIndex={-1} className="yl-card bg-white p-5 sm:p-8 grid gap-5 outline-none" aria-labelledby="level-done">
        <p className="font-bold inline-flex items-center gap-2"><Layers className="h-5 w-5" aria-hidden="true" />{t(`Level ${level} of 3 done`, `Niveau ${level} sur 3 terminé`)}{firstStamp && level === 1 ? t(" · New stamp in your passport!", " · Nouveau tampon dans ton passeport!") : ""}</p>
        <h2 id="level-done" className="yl-title text-[2rem] sm:text-[2.5rem] leading-[1.05]">
          {good ? t(`${s} out of ${n}. Brilliant!`, `${s} sur ${n}. Génial!`) : t(`${s} out of ${n}. You're getting it!`, `${s} sur ${n}. Tu y arrives!`)}
        </h2>
        <LabGuide mood={good ? "wow" : "happy"} tone={LEVEL_INFO[level].tone} say={`${pick(LEVEL_INFO[level].lesson)} ${t(`Ready for level ${nextLevel}?`, `Prêt pour le niveau ${nextLevel}?`)}`} />
        <div className="flex flex-wrap gap-3">
          <button type="button" className="yl-btn yl-btn--big yl-btn--ink" onClick={() => start(nextLevel)}>
            {t(`Level ${nextLevel}: ${pick(LEVEL_INFO[nextLevel].name)}`, `Niveau ${nextLevel} : ${pick(LEVEL_INFO[nextLevel].name)}`)} <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </button>
          <button type="button" className="yl-btn" onClick={() => start(level, true)}><RotateCcw className="h-5 w-5" aria-hidden="true" />{t("Try this level again", "Refaire ce niveau")}</button>
          <button type="button" className="yl-btn" onClick={() => setPhase("levels")}><Layers className="h-5 w-5" aria-hidden="true" />{t("All levels", "Tous les niveaux")}</button>
        </div>
      </section>
    );
  }

  /* ---------- All three done ---------- */
  if (phase === "done") {
    return (
      <FinishPanel a={A} firstTime={firstStamp} onReplay={() => { setScores({}); start(1, true); }}
        headline={total >= max - 3 ? t(`${total} out of ${max}. You're an AI expert!`, `${total} sur ${max}. Tu es un expert de l'IA!`) : t(`${total} out of ${max}, across all three levels. Well done!`, `${total} sur ${max}, sur les trois niveaux. Bravo!`)}>
        <p>{pick(LEVEL_INFO[3].lesson)}</p>
      </FinishPanel>
    );
  }

  /* ---------- Playing ---------- */
  const info = LEVEL_INFO[level];
  const Icon = ICONS[item.icon];
  const verdict = (k: Answer) => (k === "partly" ? t("partly AI", "en partie de l'IA") : k === "ai" ? t("uses AI", "utilise l'IA") : t("no AI", "pas d'IA"));
  const reaction = right
    ? t(`Yes! ${pick(item.why)}`, `Oui! ${pick(item.why)}`)
    : t(`Tricky one! ${pick(item.why)}`, `Pas facile! ${pick(item.why)}`);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <span className={`inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-3 py-1 font-extrabold ${info.tone}`}>
            {t(`Level ${level}`, `Niveau ${level}`)} · {pick(info.name)}
          </span>
          <button type="button" className="font-bold underline underline-offset-4 decoration-2 min-h-[44px]" onClick={() => setPhase("levels")}>{t("All levels", "Tous les niveaux")}</button>
        </div>
        <div className="mt-3"><RoundDots total={deck.length} at={i} results={results} /></div>
        <div key={`${item.id}-${i}`} className={`yl-flip ${flipped && !right ? "yl-wiggle" : "yl-deal"} mt-4 ${flipped ? "is-flipped" : ""}`}>
          <div ref={cardRef} tabIndex={-1} className="yl-flip-inner outline-none" aria-label={t(`Card ${i + 1}: ${pick(item.name)}`, `Carte ${i + 1} : ${pick(item.name)}`)}>
            <div className={`yl-face yl-card ${info.tone} p-6 sm:p-8 flex flex-col items-center text-center justify-center min-h-[300px]`} aria-hidden={flipped}>
              <span key={item.id} className="yl-pop grid place-items-center h-24 w-24 rounded-full bg-white border-[3px] border-ink">{Icon && <Icon className="h-12 w-12" aria-hidden="true" />}</span>
              <p className="yl-title text-[1.8rem] sm:text-[2.2rem] leading-tight mt-5">{pick(item.name)}</p>
              <p className="mt-2 text-[1.1rem] font-semibold">{t("Does it use AI?", "Utilise-t-il l'IA?")}</p>
            </div>
            <div className={`yl-face yl-face--back yl-card p-6 sm:p-8 flex flex-col items-center text-center justify-center min-h-[300px] ${right ? "yl-tone-mint" : "yl-tone-grape"}`} aria-hidden={!flipped}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border-[3px] border-ink px-4 py-1.5 font-extrabold text-[1.05rem]">
                {right ? <Check className="h-5 w-5" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
                {right ? t("You got it!", "Bravo!") : t("Not quite", "Pas tout à fait")}
              </span>
              <p className="yl-title text-[1.6rem] sm:text-[2rem] leading-tight mt-4">{pick(item.name)}: {verdict(keyOf(item))}</p>
              <p className="mt-3 text-[1.1rem] leading-relaxed max-w-[30rem]">{pick(item.why)}</p>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {flipped ? `${right ? t("Correct.", "Bonne réponse.") : t("Not quite.", "Pas tout à fait.")} ${pick(item.why)}` : ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {!flipped ? (
            <>
              <button type="button" className="yl-btn yl-btn--big yl-tone-sky flex-1 min-w-[150px]" onClick={() => answer("ai")}>
                <Sparkles className="h-6 w-6" aria-hidden="true" /> {t("Uses AI", "Utilise l'IA")}
              </button>
              {level === 3 && (
                <button type="button" className="yl-btn yl-btn--big yl-tone-sun flex-1 min-w-[150px]" onClick={() => answer("partly")}>
                  <Layers className="h-6 w-6" aria-hidden="true" /> {t("Partly AI", "En partie")}
                </button>
              )}
              <button type="button" className="yl-btn yl-btn--big flex-1 min-w-[150px]" onClick={() => answer("no")}>
                <Cog className="h-6 w-6" aria-hidden="true" /> {t("No AI", "Pas d'IA")}
              </button>
            </>
          ) : (
            <button ref={nextRef} type="button" className="yl-btn yl-btn--big yl-btn--ink flex-1" onClick={next}>
              {i + 1 >= deck.length ? t("Finish the level", "Terminer le niveau") : t("Next card", "Carte suivante")} <ArrowRight className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <aside className="grid gap-4">
        {flipped
          ? <LabGuide compact mood={right ? "wow" : "think"} tone={right ? "yl-tone-mint" : "bg-white"} say={reaction} />
          : <LabGuide compact tone="bg-white" say={i === 0 ? pick(info.hint) : t("Did it learn from examples, or follow a rule?", "A-t-elle appris à partir d'exemples, ou suit-elle une règle?")} />}
        <div className="yl-card p-4 bg-white">
          <p className="font-extrabold">{t("How to tell", "Comment savoir")}</p>
          <ul className="mt-2 grid gap-2 text-[0.98rem] leading-relaxed">
            <li className="flex gap-3"><Sparkles className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" /><span><strong>{t("Uses AI: ", "Utilise l'IA : ")}</strong>{t("learned from lots of examples, makes a best guess.", "a appris de beaucoup d'exemples, fait sa meilleure supposition.")}</span></li>
            <li className="flex gap-3"><Cog className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" /><span><strong>{t("No AI: ", "Pas d'IA : ")}</strong>{t("follows exact rules a person wrote.", "suit des règles exactes écrites par une personne.")}</span></li>
            {level === 3 && <li className="flex gap-3"><Layers className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" /><span><strong>{t("Partly: ", "En partie : ")}</strong>{t("a mix of both.", "un mélange des deux.")}</span></li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}
