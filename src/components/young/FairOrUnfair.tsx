import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Heart, Scale, ThumbsDown, ThumbsUp, Wrench } from "lucide-react";
import { FAIR_CASES, activityById } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, ICONS, RoundDots, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("fair-or-unfair")!;

export function FairOrUnfair() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const [i, setI] = useState(0);
  const [vote, setVote] = useState<boolean | null>(null);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(FAIR_CASES.length).fill(null));
  const [done, setDone] = useState<null | { first: boolean }>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const storyRef = useRef<HTMLParagraphElement>(null);
  const c = FAIR_CASES[i];
  const Icon = ICONS[c.icon] ?? Scale;
  const answered = vote !== null;
  const agree = answered && vote === c.fair;

  useEffect(() => { if (answered) nextRef.current?.focus({ preventScroll: true }); }, [answered]);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } storyRef.current?.focus({ preventScroll: true }); }, [i]);

  const choose = (fair: boolean) => {
    if (answered) return;
    setVote(fair);
    setResults(r => r.map((v, n) => (n === i ? fair === c.fair : v)));
  };
  const next = () => {
    if (i + 1 >= FAIR_CASES.length) { setDone({ first: award("fair-or-unfair", results.filter(Boolean).length) }); return; }
    setVote(null); setI(i + 1);
  };
  const replay = () => { setI(0); setVote(null); setResults(Array(FAIR_CASES.length).fill(null)); setDone(null); };
  const earnedValues = FAIR_CASES.filter((_, n) => results[n] !== null);

  if (done) {
    return (
      <FinishPanel a={A} firstTime={done.first} onReplay={replay} headline={t("Every person counts.", "Chaque personne compte.")}>
        <p>{t("Fair technology sees and includes everyone, explains its choices, and lets a person step in. When something feels unfair, it's right to ask why, and to ask for a human.", "Une technologie juste voit et inclut tout le monde, explique ses choix et laisse une personne intervenir. Quand quelque chose semble injuste, on a raison de demander pourquoi, et de demander un humain.")}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FAIR_CASES.map(fc => <li key={fc.id} className="yl-chip pointer-events-none yl-tone-grape"><Heart className="h-4 w-4" aria-hidden="true" />{pick(fc.value)}</li>)}
        </ul>
      </FinishPanel>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0">
        <RoundDots total={FAIR_CASES.length} at={i} results={results.map(r => (r === null ? null : true))} />
        <article key={c.id} className="yl-card yl-deal yl-tone-grape p-5 sm:p-7 mt-4">
          <div className="flex items-start gap-4">
            <span className="grid place-items-center h-16 w-16 shrink-0 rounded-[18px] bg-white border-[3px] border-ink"><Icon className="h-8 w-8" aria-hidden="true" /></span>
            <p ref={storyRef} tabIndex={-1} className="text-[1.15rem] sm:text-[1.25rem] leading-relaxed font-semibold outline-none">{pick(c.story)}</p>
          </div>
        </article>

        {!answered ? (
          <div className="mt-6 grid grid-cols-2 gap-3" role="group" aria-label={t("Is this fair?", "Est-ce juste?")}>
            <button type="button" className="yl-btn yl-btn--big yl-tone-mint" onClick={() => choose(true)}><ThumbsUp className="h-6 w-6" aria-hidden="true" />{t("Fair", "Juste")}</button>
            <button type="button" className="yl-btn yl-btn--big yl-tone-coral" onClick={() => choose(false)}><ThumbsDown className="h-6 w-6" aria-hidden="true" />{t("Unfair", "Injuste")}</button>
          </div>
        ) : (
          <div className="yl-card yl-deal bg-white p-5 sm:p-6 mt-6" aria-live="polite">
            <p className={`inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-3 py-1 font-extrabold ${agree ? "yl-tone-mint" : "yl-tone-sun"}`}>
              {agree ? <Check className="h-5 w-5" aria-hidden="true" /> : <Scale className="h-5 w-5" aria-hidden="true" />}
              {agree ? t("We agree!", "On est d'accord!") : t("Let's think about it together", "Réfléchissons-y ensemble")}
            </p>
            <p className="mt-3 text-[1.1rem] leading-relaxed">{pick(c.why)}</p>
            {c.fix && (
              <p className="mt-3 flex gap-3 items-start text-[1.05rem] leading-relaxed">
                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full yl-tone-sky border-2 border-ink"><Wrench className="h-4 w-4" aria-hidden="true" /></span>
                <span><strong>{t("Make it fairer: ", "Pour plus de justice : ")}</strong>{pick(c.fix)}</span>
              </p>
            )}
            <p className="mt-4 inline-flex items-center gap-2 yl-chip pointer-events-none yl-tone-grape yl-thump"><Heart className="h-4 w-4" aria-hidden="true" />{pick(c.value)}</p>
            <div>
              <button ref={nextRef} type="button" className="yl-btn yl-btn--big yl-btn--ink mt-5" onClick={next}>
                {i + 1 >= FAIR_CASES.length ? t("Finish", "Terminer") : t("Next story", "Histoire suivante")} <ArrowRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="yl-card bg-white p-5">
        <p className="font-extrabold text-[1.1rem]">{t("Your fairness toolkit", "Ta trousse de l'équité")}</p>
        <p className="mt-1 text-[0.95rem] text-muted-ink">{t("Collect an idea with every story.", "Récolte une idée à chaque histoire.")}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {earnedValues.length === 0
            ? <li className="text-muted-ink">{t("Nothing yet. Judge your first story!", "Rien encore. Juge ta première histoire!")}</li>
            : earnedValues.map(fc => <li key={fc.id} className="yl-chip pointer-events-none yl-tone-grape yl-pop"><Heart className="h-4 w-4" aria-hidden="true" />{pick(fc.value)}</li>)}
        </ul>
        <p className="mt-4 text-[0.95rem] leading-relaxed">{t("There's no score to lose here. Fairness is about thinking it through.", "Pas de points à perdre ici. L'équité, c'est prendre le temps d'y réfléchir.")}</p>
      </aside>
    </div>
  );
}
