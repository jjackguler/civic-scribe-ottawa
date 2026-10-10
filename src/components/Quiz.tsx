/**
 * The Broadsheet 5: the daily news quiz.
 *
 *   <QuizPlayer quiz={quiz} />   the quiz itself (the /quiz page)
 *   <QuizCard />                 a teaser card for the front page; fetches by itself
 *   <QuizCard initial={loaderQuiz} />
 *
 * Answers and the streak stay in this browser. The share text holds only the
 * day, the score and the address of the quiz.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { ArrowRight, Check, Copy, Flame, Share2, X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { absUrl } from "@/lib/seo";
import { dayLabel, useDailyQuiz, useQuizLocal, type DailyQuiz, type QuizDayState, type QuizQ } from "@/lib/youth";
import type { Locale } from "@/lib/i18n";
import { quizCard } from "@/lib/share-content";
import { ShareImageButton } from "./ShareSheet";

const COPY = {
  en: {
    name: "The Broadsheet 5",
    kicker: "Daily news quiz",
    dek: "Five questions from today's AI headlines. About two minutes.",
    play: "Play today's five",
    resume: "Keep going",
    seeAnswers: "See your answers",
    scored: (s: number, t: number) => `You scored ${s} out of ${t} today`,
    question: (i: number, n: number) => `Question ${i} of ${n}`,
    right: "Right!",
    wrong: "Not quite.",
    theAnswer: "The answer:",
    next: "Next question",
    finish: "See your score",
    yourAnswer: "Your answer",
    rightAnswer: "Right answer",
    srRight: "Correct.",
    srWrong: (a: string) => `Not quite. The answer is ${a}.`,
    fromDispatch: "From our dispatch",
    aiNote: "Written with AI, checked word for word against the headline",
    streak: (n: number) => (n === 1 ? "1 day streak" : `${n} day streak`),
    streakNote: "Your streak lives only on this device.",
    share: "Share your score",
    copied: "Copied. Paste it anywhere.",
    shared: "Shared.",
    review: "Your answers",
    tomorrow: "Five new questions tomorrow.",
    today60: "Catch up in 60 seconds",
    messages: [
      "Every expert started somewhere. Today's stories are a good read, and there are five new questions tomorrow.",
      "Every expert started somewhere. Today's stories are a good read, and there are five new questions tomorrow.",
      "A good start. The stories behind these questions are worth a look.",
      "Solid. You know what's going on.",
      "Sharp. Only one slipped by.",
      "Perfect score. You really follow the news.",
    ],
    unavailable: "Today's quiz is being set from the morning's headlines. Check back soon.",
    shareTitle: "The Broadsheet 5",
    keys: "Tip: press 1 to 4 to answer.",
  },
  fr: {
    name: "Les 5 du Broadsheet",
    kicker: "Quiz quotidien",
    dek: "Cinq questions sur les manchettes IA du jour. Environ deux minutes.",
    play: "Jouer aux 5 du jour",
    resume: "Continuer",
    seeAnswers: "Voir vos réponses",
    scored: (s: number, t: number) => `Votre score aujourd'hui : ${s} sur ${t}`,
    question: (i: number, n: number) => `Question ${i} sur ${n}`,
    right: "Bravo!",
    wrong: "Pas tout à fait.",
    theAnswer: "La réponse :",
    next: "Question suivante",
    finish: "Voir votre score",
    yourAnswer: "Votre réponse",
    rightAnswer: "Bonne réponse",
    srRight: "Bonne réponse.",
    srWrong: (a: string) => `Pas tout à fait. La réponse est ${a}.`,
    fromDispatch: "Tiré de notre dépêche",
    aiNote: "Écrite avec l'IA, vérifiée mot pour mot dans le titre",
    streak: (n: number) => (n === 1 ? "1 jour de suite" : `${n} jours de suite`),
    streakNote: "Votre série n'existe que sur cet appareil.",
    share: "Partager votre score",
    copied: "Copié. Collez-le où vous voulez.",
    shared: "Partagé.",
    review: "Vos réponses",
    tomorrow: "Cinq nouvelles questions demain.",
    today60: "L'actualité en 60 secondes",
    messages: [
      "Tout expert a commencé quelque part. Les nouvelles du jour valent la lecture, et cinq nouvelles questions arrivent demain.",
      "Tout expert a commencé quelque part. Les nouvelles du jour valent la lecture, et cinq nouvelles questions arrivent demain.",
      "Un bon début. Les nouvelles derrière ces questions valent le détour.",
      "Solide. Vous savez ce qui se passe.",
      "Bien vu. Une seule vous a échappé.",
      "Score parfait. Vous suivez vraiment l'actualité.",
    ],
    unavailable: "Le quiz du jour se prépare à partir des manchettes du matin. Revenez bientôt.",
    shareTitle: "Les 5 du Broadsheet",
    keys: "Astuce : appuyez sur 1 à 4 pour répondre.",
  },
};

const LETTERS = ["A", "B", "C", "D"];
const sig = (qs: QuizQ[]) => qs.map(q => q.id);
const scoreOf = (qs: QuizQ[], answers: (number | null)[]) => qs.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);

/** The share line: day, score and a link. No names, no personal data. */
export function shareText(quiz: DailyQuiz, answers: (number | null)[], locale: Locale) {
  const qs = quiz[locale];
  const marks = qs.map((q, i) => (answers[i] === q.answer ? "●" : "○")).join("");
  return `${COPY[locale].shareTitle} · ${dayLabel(quiz.day, locale)}\n${marks} ${scoreOf(qs, answers)}/${qs.length}\n${absUrl("/quiz", locale)}`;
}

/** The streak, with a flame that grows a little each day (capped) and pops when it goes up. */
export function StreakFlame({ count, grew = false, dark = false }: { count: number; grew?: boolean; dark?: boolean }) {
  const { locale } = useLocale();
  if (count <= 0) return null;
  const size = 20 + Math.min(count, 10) * 2.4;
  return (
    <span className="inline-flex items-center gap-1.5 font-bold">
      <span className={`streak-flame inline-grid place-items-center ${grew ? "streak-grow" : ""} ${dark ? "text-signal" : "text-live"}`} style={{ width: size, height: size }} aria-hidden="true">
        <Flame className="h-full w-full" fill="currentColor" strokeWidth={1.5} />
      </span>
      <span>{COPY[locale].streak(count)}</span>
    </span>
  );
}

// ── the player ─────────────────────────────────────────────────────────────

export function QuizPlayer({ quiz }: { quiz: DailyQuiz }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const qs = quiz[locale];
  const n = qs.length;
  const { days, streak, save, ready } = useQuizLocal();
  const stored = days[quiz.day];
  const same = !!stored && stored.qids.join("|") === sig(qs).join("|");
  const state: QuizDayState = same ? stored : { qids: sig(qs), answers: qs.map(() => null) };
  const answers = state.answers;
  const [pos, setPos] = useState<number | "score" | null>(null);
  const [grew, setGrew] = useState(false);
  const [live, setLive] = useState("");
  const nextRef = useRef<HTMLButtonElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  // Where to start: the first unanswered question, or the score card.
  useEffect(() => {
    if (!ready || pos !== null) return;
    if (stored && !same && stored.done) { setPos("score"); return; }
    const first = answers.findIndex(a => a == null);
    setPos(first < 0 ? "score" : first);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (k: number) => {
    if (typeof pos !== "number" || answers[pos] != null) return;
    const next = [...answers];
    next[pos] = k;
    const done = next.every(a => a != null);
    const q = qs[pos];
    if (done) setGrew(true);
    save(quiz.day, { qids: sig(qs), answers: next, done, score: done ? scoreOf(qs, next) : undefined, total: n });
    setLive(k === q.answer ? L.srRight : L.srWrong(q.options[q.answer]));
    // Move to the explanation and its "Next" button (scrolls it into view on short screens).
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      nextRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      nextRef.current?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typeof pos !== "number" || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input,textarea,select")) return;
      const k = ["1", "2", "3", "4"].indexOf(e.key);
      if (k >= 0 && k < qs[pos].options.length && answers[pos] == null) { choose(k); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const advance = () => {
    if (typeof pos !== "number") return;
    setLive("");
    setPos(pos + 1 >= n ? "score" : pos + 1);
    requestAnimationFrame(() => headRef.current?.focus({ preventScroll: false }));
  };

  if (pos === null) return <div className="min-h-[420px]" aria-busy="true" />;
  if (pos === "score") {
    const s = same ? scoreOf(qs, answers) : stored?.score ?? 0;
    const total = same ? n : stored?.total ?? n;
    return <ScoreCard quiz={quiz} answers={same ? answers : null} score={s} total={total} streak={streak} grew={grew} headRef={headRef} />;
  }

  const q = qs[pos];
  const picked = answers[pos];
  const answered = picked != null;
  const right = picked === q.answer;

  return (
    <div className="quiz-q" key={q.id}>
      <p className="sr-only" aria-live="assertive">{live}</p>
      {/* Progress */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.9rem] font-bold text-muted-ink">{L.question(pos + 1, n)}</p>
        <ol className="flex gap-1.5" aria-hidden="true">
          {qs.map((x, i) => (
            <li key={x.id} className={`h-2.5 w-7 rounded-full ${answers[i] == null ? (i === pos ? "bg-night" : "bg-line") : answers[i] === x.answer ? "bg-spruce" : "bg-live"}`} />
          ))}
        </ol>
      </div>

      <h2 ref={headRef} tabIndex={-1} className="hl mt-4 text-[1.55rem] leading-[1.12] outline-none sm:text-[1.9rem]">{q.prompt}</h2>
      {q.kind === "ledger" && <p className="meta mt-1">{L.fromDispatch}</p>}
      {q.kind === "ai" && <p className="meta mt-1">{L.aiNote}</p>}
      {q.quote && (
        <blockquote lang={q.quoteLang} className="mt-4 border-l-[4px] border-signal bg-surface px-4 py-3 font-serif text-[1.2rem] leading-snug sm:text-[1.3rem]">
          {q.quote}
        </blockquote>
      )}

      <ul className="mt-5 grid gap-2.5" role="list">
        {q.options.map((o, k) => {
          const isPick = picked === k;
          const isRight = k === q.answer;
          const tone = !answered
            ? "bg-surface border-line hover:border-night hover:-translate-y-0.5"
            : isRight ? `bg-spruce border-spruce text-white ${isPick ? "quiz-pop" : "quiz-reveal"}`
            : isPick ? "bg-surface border-live quiz-shake"
            : "bg-surface border-line opacity-55";
          return (
            <li key={k}>
              <button
                type="button"
                onClick={() => choose(k)}
                disabled={answered}
                aria-describedby={answered && (isPick || isRight) ? `qnote-${q.id}-${k}` : undefined}
                className={`quiz-opt press flex min-h-14 w-full items-center gap-3 border-2 px-3.5 py-2.5 text-left text-[1.05rem] font-semibold transition-[transform,background-color,border-color,opacity] duration-200 disabled:cursor-default ${tone}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.9rem] font-bold ${answered && isRight ? "bg-white text-spruce" : answered && isPick ? "bg-live text-white" : "bg-ice text-ink"}`} aria-hidden="true">
                  {answered && isRight ? <Check className="h-5 w-5" strokeWidth={3} /> : answered && isPick ? <X className="h-5 w-5" strokeWidth={3} /> : LETTERS[k]}
                </span>
                <span className="min-w-0 flex-1">{o}</span>
                {answered && (isPick || isRight) && (
                  <span id={`qnote-${q.id}-${k}`} className={`shrink-0 text-[0.78rem] font-bold ${isRight ? "text-white/90" : "text-live"}`}>
                    {isRight ? L.rightAnswer : L.yourAnswer}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {!answered && <p className="meta mt-3 hidden sm:block">{L.keys}</p>}

      {answered && (
        <div className="quiz-explain mt-5 border-t-[3px] border-night bg-surface p-4 sm:p-5">
          <p className={`hl text-[1.3rem] ${right ? "text-spruce" : "text-live"}`}>{right ? L.right : L.wrong}</p>
          {!right && <p className="mt-1 font-semibold">{L.theAnswer} {q.options[q.answer]}</p>}
          <p className="mt-2 font-serif text-[1.08rem] leading-relaxed">{q.explain}</p>
          <QuizLinkTo q={q} />
          <button ref={nextRef} type="button" onClick={advance} className="press mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-night px-5 font-bold text-white hover:bg-lake sm:w-auto">
            {pos + 1 >= n ? L.finish : L.next} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function QuizLinkTo({ q, compact = false }: { q: QuizQ; compact?: boolean }) {
  const cls = `inline-flex items-center gap-1 font-semibold text-lake hover:underline ${compact ? "text-[0.9rem] min-h-11" : "mt-2 min-h-11"}`;
  return q.link.to === "/dispatch/$id"
    ? <Link to="/dispatch/$id" params={{ id: q.link.id }} className={cls}>{q.linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    : <Link to="/story/$id" params={{ id: q.link.id }} className={cls}>{q.linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>;
}

function ScoreCard({ quiz, answers, score, total, streak, grew, headRef }: {
  quiz: DailyQuiz; answers: (number | null)[] | null; score: number; total: number; streak: number; grew: boolean;
  headRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const qs = quiz[locale];
  const [status, setStatus] = useState("");
  const text = useMemo(() => (answers ? shareText(quiz, answers, locale) : ""), [quiz, answers, locale]);
  const card = useMemo(() => (answers ? quizCard(quiz, answers, streak, locale) : null), [quiz, answers, streak, locale]);
  const msg = L.messages[Math.round((score / Math.max(1, total)) * 5)] ?? L.messages[0];
  useEffect(() => { headRef.current?.focus({ preventScroll: true }); }, [headRef]);

  const share = async () => {
    try {
      if (typeof navigator.share === "function") { await navigator.share({ title: L.shareTitle, text }); setStatus(L.shared); return; }
    } catch { /* cancelled or blocked: fall back to copying */ }
    try { await navigator.clipboard.writeText(text); setStatus(L.copied); } catch { setStatus(""); }
  };

  return (
    <div className="quiz-score">
      <div className="bg-night p-6 text-white sm:p-8">
        <p className="text-[0.9rem] font-bold text-signal">{L.name} · {dayLabel(quiz.day, locale)}</p>
        <h2 ref={headRef} tabIndex={-1} className="masthead-serif mt-2 text-[4.2rem] leading-none outline-none sm:text-[5.2rem]">
          <span className="score-in inline-block">{score}</span><span className="text-white/50"> / {total}</span>
          <span className="sr-only">. {L.scored(score, total)}</span>
        </h2>
        {answers && (
          <ol className="mt-4 flex gap-2" aria-hidden="true">
            {qs.map((q, i) => (
              <li key={q.id} className={`score-dot grid h-9 w-9 place-items-center rounded-full ${answers[i] === q.answer ? "bg-spruce" : "bg-live"}`} style={{ animationDelay: `${i * 90}ms` }}>
                {answers[i] === q.answer ? <Check className="h-5 w-5" strokeWidth={3} /> : <X className="h-5 w-5" strokeWidth={3} />}
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 max-w-[46ch] font-serif text-[1.2rem] leading-snug text-white/90">{msg}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <StreakFlame count={streak} grew={grew} dark />
          {streak > 0 && <span className="text-[0.82rem] text-white/60">{L.streakNote}</span>}
        </div>
      </div>

      {answers && (
        <div className="border-x border-b border-line bg-surface p-5 sm:p-6">
          <pre className="whitespace-pre-wrap border border-line bg-paper px-3 py-2 font-sans text-[0.95rem]" aria-label={L.share}>{text}</pre>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={share} className="press inline-flex min-h-12 items-center gap-2 bg-signal px-5 font-bold text-signal-ink hover:brightness-95">
              {typeof navigator !== "undefined" && typeof navigator.share === "function" ? <Share2 className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
              {L.share}
            </button>
            {card && <ShareImageButton content={card} url="/quiz" title={`${L.shareTitle} · ${score}/${total}`} campaign="quiz" className="min-h-12 rounded-none!" />}
            <p className="text-[0.9rem] font-semibold text-spruce" aria-live="polite">{status}</p>
          </div>
        </div>
      )}

      {answers && (
        <section className="mt-10" aria-labelledby="quiz-review-h">
          <h3 id="quiz-review-h" className="hl text-[1.35rem]">{L.review}</h3>
          <ol className="mt-3">
            {qs.map((q, i) => {
              const ok = answers[i] === q.answer;
              return (
                <li key={q.id} className="flex gap-3 border-b border-line py-3">
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${ok ? "bg-spruce" : "bg-live"}`} aria-label={ok ? L.srRight : L.wrong}>
                    {ok ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{q.prompt}</p>
                    {q.quote && <p lang={q.quoteLang} className="mt-0.5 font-serif text-muted-ink leading-snug">{q.quote}</p>}
                    <p className="mt-1 text-[0.92rem]"><span className="text-muted-ink">{L.rightAnswer}:</span> <span className="font-semibold">{q.options[q.answer]}</span></p>
                    <QuizLinkTo q={q} compact />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="font-semibold">{L.tomorrow}</p>
        <Link to="/today" className="inline-flex min-h-11 items-center gap-1 font-semibold text-lake hover:underline">{L.today60} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

// ── the teaser ─────────────────────────────────────────────────────────────

/** Front-page card: today's quiz, your score if you've played, your streak. Hides itself when there is no quiz. */
export function QuizCard({ initial, className = "" }: { initial?: DailyQuiz | null; className?: string }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const { data: quiz } = useDailyQuiz(initial);
  const { days, streak, ready } = useQuizLocal();
  const qs = quiz?.[locale] ?? [];
  if (!quiz || qs.length < 3) return null;
  const st = ready ? days[quiz.day] : undefined;
  const same = !!st && st.qids.join("|") === sig(qs).join("|");
  const started = same && st.answers.some(a => a != null);
  const done = !!st?.done;
  return (
    <section aria-labelledby="quiz-card-h" className={`relative overflow-hidden bg-signal text-signal-ink ${className}`}>
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border-[14px] border-signal-ink/10" aria-hidden="true" />
      <div className="relative p-5 sm:p-6">
        <p className="text-[0.85rem] font-bold">{L.kicker} · <span suppressHydrationWarning>{dayLabel(quiz.day, locale)}</span></p>
        <h2 id="quiz-card-h" className="masthead-serif mt-1 text-[2.1rem] leading-none sm:text-[2.4rem]">{L.name}</h2>
        <p className="mt-2 max-w-[38ch] font-semibold">{done ? L.scored(st?.score ?? 0, st?.total ?? qs.length) : L.dek}</p>
        <ol className="mt-4 flex gap-1.5" aria-hidden="true">
          {qs.map((q, i) => {
            const a = same ? st!.answers[i] : null;
            return <li key={q.id} className={`h-2.5 w-9 rounded-full ${a == null ? "bg-signal-ink/20" : a === q.answer ? "bg-spruce" : "bg-live"}`} />;
          })}
        </ol>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link to="/quiz" className="press inline-flex min-h-12 items-center gap-2 bg-night px-5 font-bold text-white hover:bg-lake">
            {done ? L.seeAnswers : started ? L.resume : L.play} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <StreakFlame count={streak} />
        </div>
      </div>
    </section>
  );
}

export const QUIZ_NAME = { en: COPY.en.name, fr: COPY.fr.name };
export const QUIZ_UNAVAILABLE = { en: COPY.en.unavailable, fr: COPY.fr.unavailable };
