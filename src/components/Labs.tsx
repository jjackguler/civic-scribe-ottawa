import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Play, RotateCcw } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Locale } from "@/lib/i18n";
import {
  LABS_STATS, LEVEL_LABEL, MAIN_LINE, PICKER, PROVIDERS, SIDE_ROUTES,
  fmtMinutes, pathById, pathMinutes, providerName, recommend, requiredSteps, stepView,
  type LabPath, type PickerAnswers, type ProviderId,
} from "@/lib/labs";
import { isComplete, pathFraction, resumePoint, useHydrated, useLabsProgress, type LabsState } from "@/lib/labs-progress";

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

/** A provider's name with its colour dot, set like a dateline. */
export function ProviderTag({ id, className = "" }: { id: ProviderId; className?: string }) {
  const { locale } = useLocale();
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span aria-hidden="true" className="h-2 w-2 rounded-full shrink-0" style={{ background: PROVIDERS[id].mark }} />
      {providerName(id, locale)}
    </span>
  );
}

const fr = (l: Locale) => l === "fr";

/** "3 of 5" in the reader's language. */
export const ofText = (a: number, b: number, l: Locale) => (fr(l) ? `${a} sur ${b}` : `${a} of ${b}`);

/** A station on the route line: empty ring, partly filled, or ticked. */
function Station({ fraction, done, size = 28, tone, ring = false, side = false }: { fraction: number; done: boolean; size?: number; tone: "night" | "paper"; ring?: boolean; side?: boolean }) {
  const bg = tone === "night" ? "var(--night)" : "var(--paper)";
  const fill = done
    ? "var(--signal)"
    : fraction > 0
      ? `conic-gradient(var(--signal) ${Math.round(fraction * 360)}deg, ${bg} 0)`
      : bg;
  return (
    <span
      aria-hidden="true"
      className={`relative z-10 grid place-items-center rounded-full border-[3px] shrink-0 ${side && !done ? "border-dashed border-brass" : "border-signal"} transition-[box-shadow] duration-300 ${ring ? "shadow-[0_0_0_5px_color-mix(in_oklab,var(--signal)_35%,transparent)]" : ""}`}
      style={{ width: size, height: size, background: fill }}
    >
      {done && <Check className="h-3.5 w-3.5 text-signal-ink" strokeWidth={3.5} />}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* The route map: beginner → builder                                   */
/* ------------------------------------------------------------------ */

export function RouteMap({ tone = "night", highlight, compact = false }: { tone?: "night" | "paper"; highlight?: string; compact?: boolean }) {
  const { locale, pick } = useLocale();
  const hydrated = useHydrated();
  const { state } = useLabsProgress();
  const s: LabsState = hydrated ? state : { paths: {} };
  const dark = tone === "night";

  // The solid part of the line runs to the furthest main-line path the reader has finished.
  const lastDone = MAIN_LINE.reduce((acc, p, i) => (isComplete(p, s) ? i : acc), -1);
  const reach = lastDone < 0 ? 0 : lastDone / (MAIN_LINE.length - 1);

  const muted = dark ? "text-white/65" : "text-muted-ink";
  const strong = dark ? "text-white" : "text-ink";

  const stationLabel = (p: LabPath) => {
    const f = pathFraction(p, s);
    const st = isComplete(p, s) ? (fr(locale) ? "terminé" : "done") : f > 0 ? `${Math.round(f * 100)} %` : "";
    return `${p.n}. ${pick(p.title)}${st ? ` (${st})` : ""}${highlight === p.id ? (fr(locale) ? ", recommandé" : ", recommended") : ""}`;
  };

  return (
    <nav aria-label={fr(locale) ? "Carte des parcours" : "Path map"} className="relative">
      <div className={`flex items-center justify-between text-[0.78rem] font-semibold mb-3 ${muted}`}>
        <span>{fr(locale) ? "Débutant" : "Beginner"}</span>
        <span className="hidden md:inline">{fr(locale) ? "La ligne principale" : "The main line"}</span>
        <span>{fr(locale) ? "Créateur" : "Builder"}</span>
      </div>

      <div className="relative">
        {/* the line: vertical on phones, horizontal from md up */}
        <span aria-hidden="true" className="md:hidden absolute left-[12px] top-3 bottom-8 w-[5px] rounded-full bg-signal/30" />
        <span aria-hidden="true" className="md:hidden absolute left-[12px] top-3 w-[5px] rounded-full bg-signal labs-line-fill" style={{ height: `calc((100% - 2.75rem) * ${reach})` }} />
        <span aria-hidden="true" className="hidden md:block absolute top-[11.5px] h-[5px] rounded-full bg-signal/30" style={{ left: "calc(100% / 12)", right: "calc(100% / 12)" }} />
        <span aria-hidden="true" className="hidden md:block absolute top-[11.5px] h-[5px] rounded-full bg-signal labs-line-fill" style={{ left: "calc(100% / 12)", width: `calc((100% - 100% / 6) * ${reach})` }} />

        <ol className="relative grid gap-0 md:grid-cols-6">
          {MAIN_LINE.map(p => {
            const f = pathFraction(p, s);
            const done = isComplete(p, s);
            const hi = highlight === p.id;
            return (
              <li key={p.id} className="relative">
                <Link
                  to="/labs/$path"
                  params={{ path: p.id }}
                  aria-label={stationLabel(p)}
                  className={`group flex md:flex-col md:items-center gap-4 md:gap-3 md:text-center rounded-[6px] pb-5 md:pb-0 md:px-1 focus-visible:outline-2 ${dark ? "focus-visible:outline-signal" : ""}`}
                >
                  <Station fraction={f} done={done} tone={tone} ring={hi} />
                  <span className="min-w-0 -mt-0.5 md:mt-0">
                    <span className={`block text-[0.72rem] font-bold tabular-nums ${dark ? "text-signal" : "text-brass-ink"}`}>{String(p.n).padStart(2, "0")}</span>
                    <span className={`block hl ${compact ? "text-[1rem]" : "text-[1.08rem] md:text-[1.12rem]"} leading-tight ${strong} group-hover:underline decoration-2 underline-offset-4`}>{pick(p.short)}</span>
                    {!compact && (
                      <span className={`block text-[0.78rem] mt-0.5 ${muted}`}>
                        {fmtMinutes(pathMinutes(p), locale)} · {pick(LEVEL_LABEL[p.level])}
                      </span>
                    )}
                    {hi && <span className="labs-in inline-block mt-1.5 bg-signal text-signal-ink text-[0.72rem] font-bold px-1.5 py-0.5 rounded-[3px]">{fr(locale) ? "Recommandé" : "Recommended"}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Side routes: dashed brass line, take them any time */}
      <div className={`relative mt-4 md:mt-8 pt-4 md:pt-5 border-t ${dark ? "border-white/15" : "border-line"}`}>
        <p className={`text-[0.78rem] font-semibold mb-3 ${muted}`}>{fr(locale) ? "Parcours parallèles, à prendre quand vous voulez" : "Side routes, take them any time"}</p>
        <div className="relative">
          <span aria-hidden="true" className="md:hidden absolute left-[12px] top-3 bottom-8 border-l-[3px] border-dashed border-brass" />
          <ol className="relative grid md:grid-cols-3 md:gap-6">
            {SIDE_ROUTES.map(p => {
              const f = pathFraction(p, s);
              const done = isComplete(p, s);
              const hi = highlight === p.id;
              const from = p.from ? pathById(p.from) : undefined;
              return (
                <li key={p.id}>
                  <Link to="/labs/$path" params={{ path: p.id }} aria-label={stationLabel(p)} className="group flex gap-4 pb-5 md:pb-0 rounded-[6px]">
                    <Station fraction={f} done={done} tone={tone} ring={hi} side />
                    <span className="min-w-0 -mt-0.5">
                      <span className={`block text-[0.72rem] font-bold tabular-nums ${dark ? "text-brass" : "text-brass-ink"}`}>{String(p.n).padStart(2, "0")}</span>
                      <span className={`block hl text-[1.05rem] leading-tight ${strong} group-hover:underline decoration-2 underline-offset-4`}>{pick(p.short)}</span>
                      {!compact && from && (
                        <span className={`block text-[0.78rem] mt-0.5 ${muted}`}>
                          {fmtMinutes(pathMinutes(p), locale)} · {fr(locale) ? `dès l'étape ${from.n}` : `from stop ${from.n}`}
                        </span>
                      )}
                      {hi && <span className="labs-in inline-block mt-1.5 bg-signal text-signal-ink text-[0.72rem] font-bold px-1.5 py-0.5 rounded-[3px]">{fr(locale) ? "Recommandé" : "Recommended"}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Continue where you left off                                         */
/* ------------------------------------------------------------------ */

export function ContinueCard({ tone = "night", fallback }: { tone?: "night" | "paper"; fallback?: ReactNode }) {
  const { locale, pick } = useLocale();
  const hydrated = useHydrated();
  const { state } = useLabsProgress();
  const r = hydrated ? resumePoint(state) : null;
  if (!r) return <>{fallback ?? null}</>;
  const step = r.path.steps.find(st => st.id === r.stepId)!;
  const v = stepView(step);
  const req = requiredSteps(r.path);
  const doneN = Math.round(r.fraction * req.length);
  const dark = tone === "night";
  return (
    <div className={`labs-in rounded-[8px] p-5 sm:p-6 ${dark ? "bg-night-2 text-white border border-white/10" : "bg-surface border border-line"}`}>
      <p className={`text-[0.8rem] font-semibold ${dark ? "text-brass" : "text-brass-ink"}`}>{fr(locale) ? "Reprendre là où vous étiez" : "Continue where you left off"}</p>
      <p className="hl text-[1.35rem] mt-1.5 leading-tight">{pick(r.path.title)}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className={`relative h-[6px] flex-1 rounded-full overflow-hidden ${dark ? "bg-white/15" : "bg-ice"}`}>
          <span className="absolute inset-y-0 left-0 bg-signal rounded-full" style={{ width: `${Math.max(4, r.fraction * 100)}%` }} />
        </span>
        <span className={`text-[0.8rem] tabular-nums ${dark ? "text-white/70" : "text-muted-ink"}`}>{ofText(doneN, req.length, locale)}</span>
      </div>
      <p className={`mt-3 text-[0.92rem] ${dark ? "text-white/80" : "text-muted-ink"}`}>
        {fr(locale) ? "Prochaine étape : " : "Next: "}<span className={dark ? "text-white font-semibold" : "text-ink font-semibold"}>{pick(v.title)}</span>
      </p>
      <Link
        to="/labs/$path"
        params={{ path: r.path.id }}
        hash={`step-${r.stepId}`}
        className="press mt-4 inline-flex items-center gap-2 bg-signal text-signal-ink font-bold px-4 py-2.5 rounded-[5px] hover:brightness-95"
      >
        {fr(locale) ? "Continuer" : "Continue"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

/** Shown in place of the continue card before any progress: lesson one is our own video. */
export function LessonOne({ tone = "night" }: { tone?: "night" | "paper" }) {
  const { locale } = useLocale();
  const dark = tone === "night";
  return (
    <Link
      to="/labs/$path"
      params={{ path: "start-here" }}
      hash="step-video"
      className={`group grid grid-cols-[auto_1fr] items-center gap-4 rounded-[8px] p-4 sm:p-5 ${dark ? "bg-night-2 border border-white/10 text-white hover:border-signal" : "bg-surface border border-line hover:border-ink"}`}
    >
      <span className="grid place-items-center h-14 w-14 rounded-full bg-signal text-signal-ink">
        <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className={`block text-[0.8rem] font-semibold ${dark ? "text-brass" : "text-brass-ink"}`}>{fr(locale) ? "Leçon 1 · notre vidéo · 1 min 42" : "Lesson 1 · our video · 1:42"}</span>
        <span className="block hl text-[1.2rem] leading-tight mt-0.5 group-hover:underline decoration-2 underline-offset-4">
          {fr(locale) ? "Qu'est-ce que l'IA? Les joueurs." : "What is AI? Meet the players."}
        </span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* "Where should I start?"                                             */
/* ------------------------------------------------------------------ */

export function PathPicker({ onPick }: { onPick?: (pathId: string | undefined) => void }) {
  const { locale, pick } = useLocale();
  const { setPicked } = useLabsProgress();
  const [answers, setAnswers] = useState<PickerAnswers>({});
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const headRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const uid = useId();
  const doneAll = i >= PICKER.length;
  const rec = doneAll ? recommend(answers) : null;

  useEffect(() => {
    if (!moved.current) return;
    (doneAll ? resultRef.current : headRef.current)?.focus({ preventScroll: true });
  }, [i, doneAll]);

  useEffect(() => { onPick?.(rec?.path); if (rec) setPicked(rec.path); }, [rec?.path]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (qid: string, oid: string) => {
    moved.current = true;
    setDir("fwd");
    setAnswers(a => ({ ...a, [qid]: oid }));
    setI(n => n + 1);
  };
  const back = () => { moved.current = true; setDir("back"); setI(n => Math.max(0, n - 1)); };
  const restart = () => { moved.current = true; setDir("back"); setAnswers({}); setI(0); };

  const q = PICKER[Math.min(i, PICKER.length - 1)];
  const p = rec ? pathById(rec.path)! : null;
  const also = rec?.also ? pathById(rec.also) : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h2 className="masthead-serif text-[2rem] sm:text-[2.4rem] leading-[1.05]">{fr(locale) ? "Par où commencer?" : "Where should I start?"}</h2>
        <p className="dek mt-3">{fr(locale) ? "Trois questions, et nous vous indiquons le parcours qui vous convient. Vos réponses restent sur cet appareil." : "Three questions, and we'll point you to the right path. Your answers stay on this device."}</p>
        <ol className="mt-5 flex gap-2" aria-label={fr(locale) ? "Progression du questionnaire" : "Questionnaire progress"}>
          {PICKER.map((qq, n) => (
            <li key={qq.id} className={`h-[6px] w-10 rounded-full transition-colors duration-300 ${n < i ? "bg-ink" : n === i ? "bg-signal" : "bg-line"}`}>
              <span className="sr-only">{`${n + 1}: ${n < i ? (fr(locale) ? "répondu" : "answered") : n === i ? (fr(locale) ? "en cours" : "current") : (fr(locale) ? "à venir" : "to come")}`}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="lg:col-span-8 lg:min-h-[300px]">
        {!doneAll ? (
          <div key={`q-${i}`} className={`labs-q ${dir === "back" ? "labs-q-back" : ""}`}>
            <p className="text-[0.85rem] font-semibold text-brass-ink tabular-nums">{fr(locale) ? `Question ${i + 1} sur ${PICKER.length}` : `Question ${i + 1} of ${PICKER.length}`}</p>
            <h3 ref={headRef} tabIndex={-1} id={`${uid}-q`} className="hl text-[1.6rem] sm:text-[1.9rem] mt-1 outline-none">{pick(q.q)}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="group" aria-labelledby={`${uid}-q`}>
              {q.options.map((o, n) => {
                const selected = answers[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => choose(q.id, o.id)}
                    aria-pressed={selected}
                    className={`press group text-left flex items-center gap-3 rounded-[6px] border-2 px-4 py-3.5 font-semibold transition-colors ${selected ? "border-ink bg-signal text-signal-ink" : "border-line bg-surface hover:border-ink"}`}
                  >
                    <span aria-hidden="true" className={`grid place-items-center h-7 w-7 shrink-0 rounded-full text-[0.8rem] font-bold tabular-nums ${selected ? "bg-signal-ink text-signal" : "bg-ice text-ink group-hover:bg-ink group-hover:text-white"}`}>
                      {String.fromCharCode(65 + n)}
                    </span>
                    <span>{pick(o.label)}</span>
                  </button>
                );
              })}
            </div>
            {i > 0 && (
              <button type="button" onClick={back} className="mt-5 text-[0.9rem] font-semibold text-lake hover:underline">
                {fr(locale) ? "← Question précédente" : "← Previous question"}
              </button>
            )}
          </div>
        ) : p && rec ? (
          <div className="labs-q" aria-live="polite">
            <p className="text-[0.85rem] font-semibold text-brass-ink">{fr(locale) ? "Notre recommandation" : "Our pick for you"}</p>
            <div className="mt-2 grid gap-5 sm:grid-cols-[auto_1fr] items-start">
              <span aria-hidden="true" className="masthead-serif text-[4.5rem] leading-[0.8] text-ink tabular-nums">{String(p.n).padStart(2, "0")}</span>
              <div>
                <h3 ref={resultRef} tabIndex={-1} className="hl text-[1.8rem] sm:text-[2.2rem] leading-[1.05] outline-none">{pick(p.title)}</h3>
                <p className="font-serif text-[1.12rem] leading-relaxed mt-2">{pick(rec.why)}</p>
                <p className="meta mt-2">
                  {fmtMinutes(pathMinutes(p), locale)} · {requiredSteps(p).length} {fr(locale) ? "étapes" : "steps"} · {pick(LEVEL_LABEL[p.level])}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Link to="/labs/$path" params={{ path: p.id }} className="press inline-flex items-center gap-2 bg-ink text-white font-bold px-5 py-3 rounded-[5px] hover:bg-lake">
                    {fr(locale) ? "Commencer ce parcours" : "Start this path"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {also && (
                    <Link to="/labs/$path" params={{ path: also.id }} className="font-semibold text-lake hover:underline">
                      {fr(locale) ? "Ou bien : " : "Or try: "}{pick(also.title)}
                    </Link>
                  )}
                  <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-muted-ink hover:text-ink">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> {fr(locale) ? "Recommencer" : "Start over"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home-page band                                                      */
/* ------------------------------------------------------------------ */

/**
 * AI Broadsheet Labs on the front page: what it is, the route map, and either
 * "continue where you left off" or lesson one. Drop it in anywhere:
 *   <LabsBand />
 */
export function LabsBand() {
  const { locale } = useLocale();
  return (
    <section aria-labelledby="labs-band-title" className="bg-night text-white">
      <div className="container-mw py-10 sm:py-14">
        <div className="relative pt-3 border-t-[3px] border-white/80">
          <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[0.85rem] font-semibold text-brass">AI Broadsheet Labs</p>
              <h2 id="labs-band-title" className="masthead-serif text-[2rem] sm:text-[2.5rem] leading-[1.04] mt-1">
                {fr(locale) ? "Apprenez l'IA, auprès de ceux qui la construisent" : "Learn AI from the people building it"}
              </h2>
              <p className="font-serif text-[1.08rem] leading-relaxed text-white/75 mt-3">
                {fr(locale)
                  ? `Les cours gratuits d'Anthropic, d'OpenAI, de Google, de Microsoft et d'autres, mis en ordre par notre rédaction : ${LABS_STATS.paths} parcours, de « Qu'est-ce que l'IA? » jusqu'aux agents.`
                  : `The free courses from Anthropic, OpenAI, Google, Microsoft and more, put in order by our newsroom: ${LABS_STATS.paths} paths, from "What is AI?" to building agents.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/labs" hash="start" className="press inline-flex items-center gap-2 bg-signal text-signal-ink font-bold px-4 py-2.5 rounded-[5px] hover:brightness-95">
                  {fr(locale) ? "Par où commencer?" : "Where should I start?"}
                </Link>
                <Link to="/labs" className="inline-flex items-center gap-2 border border-white/40 font-semibold px-4 py-2.5 rounded-[5px] hover:border-white">
                  {fr(locale) ? "Tous les parcours" : "All paths"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-6">
                <ContinueCard fallback={<LessonOne />} />
              </div>
            </div>
            <div className="lg:col-span-8 lg:pl-6">
              <RouteMap compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Meta line used on course rows: "45 min · Beginner". */
export function LengthLabel({ minutes, approx, className = "" }: { minutes: number; approx?: boolean; className?: string }) {
  const { locale } = useLocale();
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${className}`} title={approx ? (fr(locale) ? "Durée estimée par nous; le fournisseur ne l'indique pas." : "Our estimate; the provider doesn't state a length.") : undefined}>
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {fmtMinutes(minutes, locale, approx)}
    </span>
  );
}

export function PriceTag({ price }: { price: "free" | "free-audit" | "paid" }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  if (price === "paid") return <span className="inline-block rounded-[3px] bg-ink text-white text-[0.75rem] font-bold px-1.5 py-0.5">{fr ? "Payant" : "Paid"}</span>;
  if (price === "free-audit") return <span className="inline-block rounded-[3px] border border-ink text-[0.75rem] font-bold px-1.5 py-0.5">{fr ? "Gratuit à suivre" : "Free to audit"}</span>;
  return <span className="inline-block rounded-[3px] bg-signal text-signal-ink text-[0.75rem] font-bold px-1.5 py-0.5">{fr ? "Gratuit" : "Free"}</span>;
}

export function FrenchTag({ french, frUrl }: { french: "full" | "machine" | "none"; frUrl?: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  if (french === "none") return <span className="text-muted-ink">{fr ? "Anglais seulement" : "English only"}</span>;
  const label = french === "machine" ? (fr ? "FR (traduction auto.)" : "FR (machine)") : "FR";
  return frUrl
    ? <a href={frUrl} target="_blank" rel="noopener noreferrer" hrefLang="fr" className="font-semibold text-lake hover:underline">{label}<span className="sr-only">{fr ? " : version française (nouvel onglet)" : ": French edition (opens in a new tab)"}</span></a>
    : <span className="font-semibold" title={fr ? "Choisissez le français dans le cours" : "Pick French inside the course"}>{label}</span>;
}
