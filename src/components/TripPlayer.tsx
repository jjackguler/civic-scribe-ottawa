import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Eye, RotateCcw, X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Glitch, Question } from "@/lib/field-trips";

/**
 * Plays a recorded Genie session as an interactive lesson: the video stops at
 * each stage, the question card opens over it, and play resumes after the
 * answer. "Catch the glitch" lets the viewer press a button when they see the
 * machine get something wrong; a press inside a logged glitch window scores.
 */
export function TripPlayer({ src, poster, questions, stops, glitches }: {
  src: string;
  poster?: string;
  questions: Question[];
  /** Seconds into the video where each question opens, same order as `questions`. */
  stops: number[];
  glitches: Glitch[];
}) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const ref = useRef<HTMLVideoElement>(null);
  const [asking, setAsking] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [found, setFound] = useState<number[]>([]);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const nextStop = answers.findIndex(a => a === null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      if (nextStop >= 0 && asking === null && v.currentTime >= stops[nextStop]) {
        v.pause();
        setAsking(nextStop);
      }
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [nextStop, asking, stops]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 4500);
    return () => window.clearTimeout(id);
  }, [flash]);

  const spot = () => {
    const t = ref.current?.currentTime ?? 0;
    const i = glitches.findIndex((g, k) => !found.includes(k) && t >= g.from - 1 && t <= g.to + 2);
    if (i >= 0) {
      setFound(f => [...f, i]);
      setFlash({ ok: true, text: pick(glitches[i].label) });
    } else if (glitches.some((g, k) => found.includes(k) && t >= g.from - 1 && t <= g.to + 2)) {
      setFlash({ ok: true, text: fr ? "Déjà repérée." : "Already caught that one." });
    } else {
      setFlash({ ok: false, text: fr ? "Rien d'anormal ici. Continuez à regarder." : "Nothing wrong right here. Keep watching." });
    }
  };

  const resume = () => { setAsking(null); void ref.current?.play(); };
  const restart = () => {
    setAnswers(questions.map(() => null)); setFound([]); setAsking(null); setFlash(null);
    if (ref.current) { ref.current.currentTime = 0; void ref.current.play(); }
  };

  const q = asking !== null ? questions[asking] : null;
  const mine = asking !== null ? answers[asking] : null;
  const score = answers.filter((a, k) => a !== null && questions[k].choices[a]?.correct).length;
  const finished = nextStop === -1;

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-[10px] bg-night">
        <video ref={ref} src={src} poster={poster} controls={asking === null} playsInline preload="metadata" className="block w-full aspect-video" />
        {q && (
          <div className="absolute inset-0 grid place-items-center bg-night/55 p-3 sm:p-6">
            <div className="w-full max-w-xl rounded-[10px] bg-paper text-ink p-4 sm:p-6 hero-in" role="dialog" aria-label={pick(q.q)}>
              <p className="text-[0.78rem] font-bold tracking-[0.08em] text-brass-ink uppercase">{pick(q.stage)}</p>
              <h3 className="hl text-[1.2rem] sm:text-[1.4rem] mt-1">{pick(q.q)}</h3>
              <div className="mt-3 grid gap-2">
                {q.choices.map((c, k) => {
                  const answered = mine !== null;
                  const state = !answered ? "idle" : c.correct ? "right" : mine === k ? "wrong" : "dim";
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={answered}
                      onClick={() => setAnswers(a => a.map((v, j) => (j === asking ? k : v)))}
                      className={`flex items-center gap-2.5 rounded-[7px] border-2 px-3 py-2 text-left text-[0.97rem] ${
                        { idle: "border-line hover:border-night", right: "border-lake bg-ice", wrong: "border-brass-ink", dim: "border-line opacity-60" }[state]
                      }`}
                    >
                      <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-night text-white text-[0.8rem] font-bold">
                        {state === "right" ? <Check className="h-3.5 w-3.5" /> : state === "wrong" ? <X className="h-3.5 w-3.5" /> : "ABC"[k]}
                      </span>
                      {pick(c.text)}
                    </button>
                  );
                })}
              </div>
              {mine !== null && (
                <div className="mt-3" aria-live="polite">
                  <p className="text-[0.95rem] leading-relaxed">{pick(q.why)}</p>
                  <button type="button" onClick={resume} className="mt-3 inline-flex items-center gap-2 rounded-[5px] bg-signal text-signal-ink font-bold px-3.5 py-2">
                    {fr ? "Reprendre la visite" : "Keep exploring"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {flash && (
          <p className={`absolute left-3 right-3 top-3 sm:left-auto sm:max-w-sm rounded-[7px] px-3.5 py-2.5 text-[0.95rem] font-semibold shadow-lg hero-in ${flash.ok ? "bg-signal text-signal-ink" : "bg-paper text-ink"}`} aria-live="polite">
            {flash.text}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {glitches.length > 0 && (
          <button type="button" onClick={spot} disabled={asking !== null} className="inline-flex items-center gap-2 rounded-[5px] bg-night text-white font-bold px-4 py-2.5 disabled:opacity-50">
            <Eye className="h-5 w-5" aria-hidden="true" /> {fr ? "Erreur repérée!" : "Caught a glitch!"}
          </button>
        )}
        <p className="meta tabular-nums">
          {fr ? `Questions : ${score} / ${questions.length}` : `Questions: ${score} / ${questions.length}`}
          {glitches.length > 0 && (fr ? ` · Erreurs repérées : ${found.length} / ${glitches.length}` : ` · Glitches caught: ${found.length} / ${glitches.length}`)}
        </p>
        {finished && (
          <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-[5px] border-2 border-night px-3.5 py-2 font-semibold">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {fr ? "Recommencer" : "Play again"}
          </button>
        )}
      </div>
      <p className="meta mt-2 max-w-3xl">
        {fr
          ? "Images générées par IA (Genie 4), pas une vraie prise de vue. La vidéo s'arrête à chaque étape pour une question. Quand vous voyez la machine se tromper, appuyez sur « Erreur repérée! »."
          : "AI-generated footage (Genie 4), not real camera footage. The video stops at each stage for a question. When you see the machine get something wrong, press “Caught a glitch!”."}
      </p>
    </div>
  );
}
