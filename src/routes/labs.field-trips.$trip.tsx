import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, RotateCcw, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHead, SourceList } from "@/components/LabBits";
import { TripBand } from "@/components/FieldTrips";
import { TripPlayer } from "@/components/TripPlayer";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef } from "@/lib/seo";
import { FIELD_TRIPS, TRIPS, tripBySlug, type Claim, type Question } from "@/lib/field-trips";

export const Route = createFileRoute("/labs/field-trips/$trip")({
  loader: ({ params }) => {
    const t = tripBySlug(params.trip);
    if (!t) throw notFound();
    return { slug: t.slug };
  },
  head: ({ match, params }) => {
    const t = tripBySlug(params.trip);
    if (!t) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: { en: `${t.title.en} — ${FIELD_TRIPS.title.en}, ${SITE.name} Labs`, fr: `${t.title.fr} — ${FIELD_TRIPS.title.fr}, ${SITE.name} Labs` },
      description: t.dek,
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: t.title[locale],
        description: t.dek[locale],
        url,
        publisher: publisherRef,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        learningResourceType: "Interactive lesson",
        educationalLevel: t.ages[locale],
        timeRequired: `PT${t.minutes}M`,
        isAccessibleForFree: true,
        about: [t.subject.en, "World models", "Generative AI"],
        isPartOf: { "@type": "CreativeWorkSeries", name: FIELD_TRIPS.title[locale] },
        citation: t.sources.map(s => s.url),
      }],
    });
  },
  component: TripPage,
});

function TripPage() {
  const { slug } = Route.useLoaderData();
  const t = tripBySlug(slug)!;
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const i = TRIPS.findIndex(x => x.slug === t.slug);
  const next = TRIPS[(i + 1) % TRIPS.length];

  return (
    <PageShell>
      <TripBand tone={t.tone}>
        <div className="container-mw pt-8 pb-10 sm:pt-12 sm:pb-14">
          <Link to="/labs/field-trips" className="inline-flex items-center gap-1.5 text-[0.95rem] font-semibold text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {pick(FIELD_TRIPS.title)}
          </Link>
          <p className="mt-6 text-[0.9rem] font-semibold text-brass">
            {fr ? `Sortie ${t.n} sur ${TRIPS.length}` : `Trip ${t.n} of ${TRIPS.length}`} <span className="text-white/50">·</span> <span className="text-white/75">{pick(t.subject)} · {pick(t.ages)} · {t.minutes} min</span>
          </p>
          <h1 className="masthead-serif text-[2.4rem] sm:text-[3.3rem] leading-[1] mt-2 max-w-[20ch] hero-in">{pick(t.title)}</h1>
          <p className="font-serif text-[1.12rem] sm:text-[1.25rem] leading-relaxed text-white/80 mt-4 max-w-[42rem]">{pick(t.dek)}</p>
          <p className="meta mt-5 text-white/60">{pick(t.place)} · {pick(t.recorded)}</p>
        </div>
      </TripBand>

      <div className="container-mw">
        <p className="mt-6 rounded-[6px] border-l-4 border-brass bg-ice px-4 py-3 text-[0.98rem] leading-relaxed">
          <strong>{fr ? "Fait avec l'IA. " : "Made with AI. "}</strong>
          {fr
            ? "Nous avons d'abord bâti cette leçon dans Project Genie, le modèle de monde de Google. Les questions et les explications ci-dessous ont été réécrites et vérifiées par la rédaction, sources à l'appui. Ce que la machine a mal fait est listé plus bas."
            : "We first built this lesson in Project Genie, Google's world model. The questions and explanations below were rewritten and checked by the newsroom against the sources listed. What the machine got wrong is listed further down."}
        </p>
      </div>

      {t.genie && (
        <section className="container-mw mt-8" aria-labelledby="genie-title">
          <div className="grid gap-4 rounded-[10px] bg-night text-white p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 id="genie-title" className="masthead-serif text-[1.5rem] sm:text-[1.75rem]">{fr ? "Vivez-la en 3D dans Project Genie" : "Live it in 3D in Project Genie"}</h2>
              <p className="mt-1.5 text-[0.98rem] leading-relaxed text-white/75 max-w-2xl">
                {fr
                  ? "Marchez dans le monde que nous avons créé et répondez aux questions sur place. Il faut un compte Google ayant accès à Project Genie (offert avec Google AI Ultra). Sans accès, le quiz ci-dessous suffit."
                  : "Walk through the world we built and answer the questions inside it. You need a Google account with access to Project Genie (part of Google AI Ultra). No access? The quiz below covers the same lesson."}
              </p>
            </div>
            <a href={t.genie} target="_blank" rel="noopener noreferrer" className="justify-self-start inline-flex items-center gap-2 rounded-[5px] bg-signal text-signal-ink font-bold px-4 py-2.5">
              {fr ? "Ouvrir dans Genie" : "Open in Genie"} <ArrowUpRight className="h-5 w-5" aria-hidden="true" /><span className="sr-only">{fr ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
            </a>
          </div>
        </section>
      )}


      <section className="container-mw mt-12 sm:mt-16" aria-labelledby="quiz-title">
        <SectionHead id="quiz-title" kicker={fr ? "À vous" : "Your turn"} title={fr ? "Trois étapes, trois questions" : "Three stages, three questions"} />
        {t.video && t.stops ? (
          <TripPlayer key={t.slug} src={t.video} poster={t.poster} questions={t.questions} stops={t.stops} glitches={t.glitches ?? []} />
        ) : (
          <Quiz key={t.slug} questions={t.questions} />
        )}
      </section>

      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="spot-title">
        <SectionHead id="spot-title" kicker={fr ? "Esprit critique" : "Think like an editor"} title={fr ? "Vrai ou faux? Repérez les erreurs" : "True or false? Spot the mistakes"} />
        <p className="dek mt-1 max-w-3xl">
          {fr
            ? "Certaines de ces phrases viennent de la machine, d'autres de nous. Marquez chacune vraie ou fausse, puis vérifiez."
            : "Some of these sentences came from the machine, some from us. Mark each one true or false, then check."}
        </p>
        <SpotTheMistake key={t.slug} claims={t.claims} />
      </section>

      {t.gotWrong.length > 0 && (
      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="wrong-title">
        <SectionHead id="wrong-title" kicker={fr ? "Carnet de bord" : "Field notes"} title={fr ? "Ce que la machine a mal fait" : "What the machine got wrong"} />
        <ul className="mt-5 border-t-2 border-ink">
          {t.gotWrong.map((g, k) => (
            <li key={k} className="grid grid-cols-[2rem_1fr] gap-2 py-4 border-b border-line">
              <span aria-hidden="true" className="masthead-serif text-[1.4rem] leading-none tabular-nums text-brass-ink">{k + 1}</span>
              <p className="text-[1.02rem] leading-relaxed">{pick(g)}</p>
            </li>
          ))}
        </ul>
        <p className="meta mt-3 max-w-3xl">
          {fr
            ? "Seulement ce que nous avons vu dans nos propres séances. Un modèle de monde dessine ce qui est plausible, pas ce qui est vrai : il faut vérifier."
            : "Only what we saw in our own sessions. A world model draws what looks plausible, not what is true: check it."}
          {" "}<Link to="/labs/world-model" className="text-lake font-semibold hover:underline">{fr ? "Pourquoi il oublie" : "Why it forgets"}</Link>
        </p>
      </section>
      )}

      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="class-title">
        <div className="bg-signal text-signal-ink rounded-[10px] p-6 sm:p-9">
          <p className="text-[0.78rem] font-bold tracking-[0.12em]">{fr ? `EN CLASSE · ${t.minutes} MINUTES` : `FOR THE CLASSROOM · ${t.minutes} MINUTES`}</p>
          <h2 id="class-title" className="masthead-serif text-[1.8rem] sm:text-[2.1rem] mt-2">{fr ? "À poursuivre ensemble" : "Keep going together"}</h2>
          <ol className="mt-4 list-decimal pl-5 grid gap-2 text-[1.02rem] leading-relaxed max-w-3xl">
            {t.classroom.map((c, k) => <li key={k}>{pick(c)}</li>)}
          </ol>
          {t.tryAtHome && <p className="mt-4 font-semibold max-w-3xl">{fr ? "À la maison : " : "At home: "}{pick(t.tryAtHome)}</p>}
        </div>
      </section>

      <section className="container-mw mt-14 sm:mt-16" aria-labelledby="sources-title">
        <SectionHead id="sources-title" title="Sources" />
        <SourceList items={t.sources.map(s => ({ title: s.title, url: s.url, note: pick(s.covers) }))} />
        <p className="meta mt-5 max-w-3xl">
          {fr
            ? "Le quiz tourne dans votre navigateur. Rien de ce que vous répondez n'est envoyé ailleurs."
            : "The quiz runs in your browser. Nothing you answer is sent anywhere."}
          {" "}<Link to="/how-we-use-ai" className="text-lake font-semibold hover:underline">{fr ? "Notre utilisation de l'IA" : "How we use AI"}</Link>
        </p>
        <Link to="/labs/field-trips/$trip" params={{ trip: next.slug }} className="mt-8 inline-flex items-center gap-2 rounded-[5px] bg-night text-white font-bold px-4 py-2.5">
          {fr ? "Sortie suivante : " : "Next trip: "}{pick(next.title)} <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </section>
    </PageShell>
  );
}

const LETTERS = ["A", "B", "C", "D"];

function Quiz({ questions }: { questions: Question[] }) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const done = step >= questions.length;
  const score = picked.filter((p, k) => p !== null && questions[k].choices[p]?.correct).length;

  if (done) {
    return (
      <div className="mt-6 rounded-[10px] bg-night text-white p-6 sm:p-9">
        <p className="kicker text-brass">{fr ? "Sortie terminée" : "Trip complete"}</p>
        <p className="masthead-serif text-[2.2rem] mt-1 tabular-nums">{score} / {questions.length}</p>
        <p className="mt-2 text-white/80 max-w-2xl">
          {score === questions.length
            ? (fr ? "Parfait. Maintenant, faites mieux que la machine : repérez ses erreurs ci-dessous." : "Perfect. Now beat the machine: spot its mistakes below.")
            : (fr ? "Relisez les explications, puis repérez les erreurs de la machine ci-dessous." : "Read the explanations again, then spot the machine's mistakes below.")}
        </p>
        <button type="button" onClick={() => { setStep(0); setPicked(questions.map(() => null)); }} className="mt-5 inline-flex items-center gap-2 rounded-[5px] border border-white/40 px-4 py-2 font-semibold hover:bg-white/10">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {fr ? "Recommencer" : "Play again"}
        </button>
      </div>
    );
  }

  const q = questions[step];
  const mine = picked[step];
  const answered = mine !== null;

  return (
    <div className="mt-6 rounded-[10px] border-2 border-night p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.85rem] font-bold tracking-[0.08em] text-brass-ink uppercase">{pick(q.stage)}</p>
        <ol className="flex gap-1.5" aria-label={fr ? "Progression" : "Progress"}>
          {questions.map((_, k) => (
            <li key={k} className={`h-2 w-8 rounded-full ${k < step ? "bg-lake" : k === step ? "bg-signal" : "bg-line"}`}>
              <span className="sr-only">{k + 1}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 font-serif italic text-[1.05rem] text-muted-ink">{pick(q.scene)}</p>
      <h3 className="hl text-[1.45rem] sm:text-[1.7rem] mt-2">{pick(q.q)}</h3>
      <div className="mt-5 grid gap-2.5" role="group" aria-label={pick(q.q)}>
        {q.choices.map((c, k) => {
          const isMine = mine === k;
          const state = !answered ? "idle" : c.correct ? "right" : isMine ? "wrong" : "dim";
          const cls = {
            idle: "border-line hover:border-night hover:bg-ice",
            right: "border-lake bg-ice",
            wrong: "border-brass-ink bg-[#f6efe2]",
            dim: "border-line opacity-60",
          }[state];
          return (
            <button
              key={k}
              type="button"
              disabled={answered}
              aria-pressed={isMine}
              onClick={() => setPicked(p => p.map((v, j) => (j === step ? k : v)))}
              className={`flex items-center gap-3 rounded-[8px] border-2 px-4 py-3 text-left text-[1.02rem] transition-colors ${cls}`}
            >
              <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold ${state === "right" ? "bg-lake text-white" : state === "wrong" ? "bg-brass-ink text-white" : "bg-night text-white"}`}>
                {state === "right" ? <Check className="h-4 w-4" /> : state === "wrong" ? <X className="h-4 w-4" /> : LETTERS[k]}
              </span>
              <span>{pick(c.text)}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 hero-in" aria-live="polite">
          <p className="font-bold">{q.choices[mine!]?.correct ? (fr ? "Exact." : "That's right.") : (fr ? "Pas tout à fait." : "Not quite.")}</p>
          <p className="mt-1 text-[1.02rem] leading-relaxed max-w-3xl">{pick(q.why)}</p>
          <button type="button" onClick={() => setStep(s => s + 1)} className="mt-4 inline-flex items-center gap-2 rounded-[5px] bg-signal text-signal-ink font-bold px-4 py-2.5">
            {step + 1 < questions.length ? (fr ? "Étape suivante" : "Next stage") : (fr ? "Voir le résultat" : "See my score")} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function SpotTheMistake({ claims }: { claims: Claim[] }) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [marks, setMarks] = useState<(boolean | null)[]>(() => claims.map(() => null));
  const [checked, setChecked] = useState(false);
  const all = marks.every(m => m !== null);
  const right = marks.filter((m, k) => m !== null && m === !claims[k].wrong).length;

  return (
    <div className="mt-6">
      <ul className="grid gap-3">
        {claims.map((c, k) => {
          const m = marks[k];
          const ok = m !== null && m === !c.wrong;
          return (
            <li key={k} className={`rounded-[8px] border-2 p-4 sm:p-5 ${checked ? (ok ? "border-lake" : "border-brass-ink") : "border-line"}`}>
              <p className="font-serif text-[1.1rem] leading-relaxed">{pick(c.text)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[true, false].map(v => (
                  <button
                    key={String(v)}
                    type="button"
                    disabled={checked}
                    aria-pressed={m === v}
                    onClick={() => setMarks(ms => ms.map((x, j) => (j === k ? v : x)))}
                    className={`rounded-[5px] border-2 px-3.5 py-1.5 text-[0.95rem] font-semibold ${m === v ? "border-night bg-night text-white" : "border-line hover:border-night"}`}
                  >
                    {v ? (fr ? "Vrai" : "True") : (fr ? "Faux" : "False")}
                  </button>
                ))}
                {checked && (
                  <span className={`ml-1 inline-flex items-center gap-1 text-[0.9rem] font-bold ${ok ? "text-lake" : "text-brass-ink"}`}>
                    {ok ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
                    {c.wrong ? (fr ? "Faux" : "False") : (fr ? "Vrai" : "True")}
                  </span>
                )}
              </div>
              {checked && (
                <p className="mt-3 text-[0.98rem] leading-relaxed hero-in">
                  <span className={`mr-2 inline-block rounded-[4px] px-2 py-0.5 text-[0.75rem] font-bold tracking-[0.06em] uppercase ${c.machine ? "bg-signal text-signal-ink" : "bg-ice text-ink"}`}>
                    {c.machine ? (fr ? "Dit par la machine" : "Said by the machine") : (fr ? "Écrit par nous" : "Written by us")}
                  </span>
                  {pick(c.note)}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {!checked ? (
          <button type="button" disabled={!all} onClick={() => setChecked(true)} className="inline-flex items-center gap-2 rounded-[5px] bg-signal text-signal-ink font-bold px-4 py-2.5 disabled:opacity-50">
            {fr ? "Vérifier" : "Check my answers"}
          </button>
        ) : (
          <>
            <p className="font-bold tabular-nums" aria-live="polite">{right} / {claims.length} {fr ? "justes" : "right"}</p>
            <button type="button" onClick={() => { setChecked(false); setMarks(claims.map(() => null)); }} className="inline-flex items-center gap-2 rounded-[5px] border-2 border-night px-4 py-2 font-semibold">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {fr ? "Recommencer" : "Try again"}
            </button>
          </>
        )}
        {!all && !checked && <p className="meta">{fr ? "Marquez toutes les phrases pour vérifier." : "Mark every sentence to check."}</p>}
      </div>
    </div>
  );
}
