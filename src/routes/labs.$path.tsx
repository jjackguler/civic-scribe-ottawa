import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Award, Check, Printer, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OriginalCard } from "@/components/Originals";
import { FrenchTag, LengthLabel, PriceTag, ProviderTag, ofText } from "@/components/Labs";
import { getOriginalsFast, useOriginals } from "@/lib/originals";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef, DEFAULT_OG_IMAGE } from "@/lib/seo";
import {
  FORMAT_LABEL, LEVEL_LABEL, MAIN_LINE, PROVIDERS,
  fmtMinutes, pathById, pathMinutes, pathProviders, providerName, requiredSteps, stepView,
  type LabPath, type Step,
} from "@/lib/labs";
import { isComplete, pathFraction, useHydrated, useLabsProgress } from "@/lib/labs-progress";

export const Route = createFileRoute("/labs/$path")({
  loader: async ({ params }) => {
    const p = pathById(params.path);
    if (!p) throw notFound();
    const originals = p.steps.some(s => s.kind === "video") ? await getOriginalsFast() : null;
    return { id: p.id, originals };
  },
  head: ({ match, params }) => {
    const p = pathById(params.path);
    if (!p) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: { en: `${p.title.en}: a free AI learning path — ${SITE.name} Labs`, fr: `${p.title.fr} : un parcours gratuit — ${SITE.name} Labs` },
      description: p.dek,
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "Course",
        name: p.title[locale],
        description: p.dek[locale],
        url,
        image: DEFAULT_OG_IMAGE,
        provider: publisherRef,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        educationalLevel: LEVEL_LABEL[p.level][locale],
        audience: { "@type": "Audience", audienceType: p.audience[locale] },
        teaches: p.skills.map(s => s[locale]),
        timeRequired: `PT${pathMinutes(p)}M`,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: 0, priceCurrency: "CAD", category: "Free" },
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: `PT${pathMinutes(p)}M` },
        syllabusSections: p.steps.map(s => {
          const v = stepView(s);
          return {
            "@type": "Syllabus",
            name: v.title[locale],
            description: v.summary[locale],
            timeRequired: `PT${v.minutes}M`,
            ...(v.course ? { url: locale === "fr" && v.course.frUrl ? v.course.frUrl : v.course.url } : {}),
          };
        }),
        hasPart: p.steps.flatMap(s => {
          const v = stepView(s);
          return v.course ? [{
            "@type": "Course",
            name: v.course.title.en,
            url: v.course.url,
            provider: { "@type": "Organization", name: PROVIDERS[v.course.provider].name },
            isAccessibleForFree: v.course.price !== "paid",
          }] : [];
        }),
        mainEntityOfPage: url,
        isPartOf: { "@type": "ItemList", name: "AI Broadsheet Labs", url: absUrl("/labs", locale) },
      }],
    });
  },
  component: PathPage,
});

function PathPage() {
  const { id, originals } = Route.useLoaderData();
  const p = pathById(id)!;
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const hydrated = useHydrated();
  const { state, toggle, touch, resetPath } = useLabsProgress();
  const req = requiredSteps(p);
  const doneSet = new Set(hydrated ? state.paths[p.id]?.done ?? [] : []);
  const doneN = req.filter(s => doneSet.has(s.id)).length;
  const complete = hydrated && isComplete(p, state);
  const [justDone, setJustDone] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const frCount = p.steps.filter(s => stepView(s).french !== "none").length;

  const onToggle = (stepId: string) => {
    const wasComplete = isComplete(p, state);
    const nowDone = toggle(p.id, stepId);
    setJustDone(nowDone ? stepId : null);
    if (nowDone && !wasComplete) {
      // Did that tick finish the path?
      const willBe = req.every(s => s.id === stepId || doneSet.has(s.id));
      if (willBe) setCelebrate(true);
    }
  };

  useEffect(() => {
    if (!celebrate) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => certRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }), reduce ? 0 : 450);
    return () => clearTimeout(t);
  }, [celebrate]);

  // Arriving from "continue": open at that step.
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h) document.getElementById(h)?.scrollIntoView({ block: "start" });
  }, []);

  const required = p.steps.filter(s => !s.optional);
  const optional = p.steps.filter(s => s.optional);
  // The solid line runs to the last finished required step.
  const lastIdx = required.reduce((acc, s, i) => (doneSet.has(s.id) ? i : acc), -1);
  const lineFill = lastIdx < 0 ? 0 : lastIdx / Math.max(1, required.length - 1);

  const mainIdx = MAIN_LINE.findIndex(x => x.id === p.id);
  const nextPath = mainIdx >= 0 ? MAIN_LINE[mainIdx + 1] : p.from ? MAIN_LINE[MAIN_LINE.findIndex(x => x.id === p.from) + 1] : undefined;

  return (
    <PageShell>
      {/* Header */}
      <header className="bg-night text-white">
        <div className="container-mw pt-8 pb-10 sm:pt-10 sm:pb-12">
          <Link to="/labs" className="inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> AI Broadsheet Labs
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-[0.9rem] font-semibold text-brass">
                {p.line === "side" ? (fr ? `Parcours parallèle ${p.n}` : `Side route ${p.n}`) : (fr ? `Parcours ${p.n} sur ${MAIN_LINE.length}` : `Path ${p.n} of ${MAIN_LINE.length}`)}
                <span className="text-white/50"> · </span>
                <span className="text-white/75">{pick(p.audience)}</span>
              </p>
              <h1 className="masthead-serif text-[2.4rem] sm:text-[3.4rem] leading-[1.0] mt-2">{pick(p.title)}</h1>
              <p className="font-serif text-[1.15rem] sm:text-[1.25rem] leading-relaxed text-white/75 mt-4 max-w-[44rem]">{pick(p.dek)}</p>
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[0.9rem]">
                <div><dt className="text-white/60">{fr ? "Durée" : "Time"}</dt><dd className="font-bold text-[1.1rem] tabular-nums">{fmtMinutes(pathMinutes(p), locale)}</dd></div>
                <div><dt className="text-white/60">{fr ? "Étapes" : "Steps"}</dt><dd className="font-bold text-[1.1rem]">{req.length}{optional.length ? <span className="font-normal text-white/60"> + {optional.length} {fr ? "en option" : "optional"}</span> : null}</dd></div>
                <div><dt className="text-white/60">{fr ? "Niveau" : "Level"}</dt><dd className="font-bold text-[1.1rem]">{pick(LEVEL_LABEL[p.level])}</dd></div>
                <div><dt className="text-white/60">{fr ? "En français" : "In French"}</dt><dd className="font-bold text-[1.1rem]">{ofText(frCount, p.steps.length, locale)}</dd></div>
                <div><dt className="text-white/60">{fr ? "Prix" : "Price"}</dt><dd className="font-bold text-[1.1rem]">{fr ? "Gratuit" : "Free"}</dd></div>
              </dl>
            </div>
            <div className="lg:col-span-4">
              <div className="rounded-[8px] border border-white/15 p-5">
                <p className="text-[0.85rem] font-semibold text-brass">{fr ? "Vous saurez" : "You'll be able to"}</p>
                <ul className="mt-2 grid gap-2">
                  {p.skills.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-[0.95rem] leading-snug">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-signal" aria-hidden="true" strokeWidth={3} /> {pick(s)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* progress along the bottom of the header */}
          <div className="mt-8 flex items-center gap-4" aria-live="polite">
            <span className="relative h-[8px] flex-1 rounded-full bg-white/15 overflow-hidden">
              <span className="labs-bar absolute inset-y-0 left-0 bg-signal rounded-full" style={{ width: `${(doneN / req.length) * 100}%` }} />
            </span>
            <span className="text-[0.9rem] font-semibold tabular-nums whitespace-nowrap">
              {hydrated ? (fr ? `${doneN} sur ${req.length} étapes terminées` : `${doneN} of ${req.length} steps done`) : (fr ? `${req.length} étapes` : `${req.length} steps`)}
            </span>
          </div>
        </div>
      </header>

      <div className="container-mw mt-10 grid gap-10 lg:grid-cols-12">
        {/* Steps along the route line */}
        <div className="lg:col-span-8">
          <StepList
            path={p} steps={required} startAt={1} lineFill={lineFill} doneSet={doneSet} justDone={justDone}
            onToggle={onToggle} onOpen={stepId => touch(p.id, stepId)} originals={originals}
          />

          {complete && (
            <div ref={certRef} className="mt-6 scroll-mt-24">
              <Certificate path={p} animate={celebrate} completedAt={state.paths[p.id]?.completedAt} />
            </div>
          )}

          {optional.length > 0 && (
            <section className="mt-12" aria-labelledby="optional-title">
              <div className="flex items-baseline gap-3 border-t-2 border-dashed border-brass pt-4">
                <h2 id="optional-title" className="masthead-serif text-[1.6rem]">{fr ? "Pour aller plus loin" : "Go further"}</h2>
                <p className="meta">{fr ? "En option; ne compte pas pour le certificat" : "Optional; not needed for the certificate"}</p>
              </div>
              <div className="mt-6">
                <StepList
                  path={p} steps={optional} startAt={required.length + 1} lineFill={-1} doneSet={doneSet} justDone={justDone} dashed
                  onToggle={onToggle} onOpen={stepId => touch(p.id, stepId)} originals={originals}
                />
              </div>
            </section>
          )}
        </div>

        {/* Aside */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 grid gap-6">
            <div className="rounded-[8px] bg-surface border border-line p-5">
              <p className="text-[0.85rem] font-semibold text-brass-ink">{fr ? "Votre progression" : "Your progress"}</p>
              <p className="masthead-serif text-[2.6rem] leading-none mt-2 tabular-nums">
                {hydrated ? Math.round(pathFraction(p, state) * 100) : 0}<span className="text-[1.4rem]"> %</span>
              </p>
              <p className="text-[0.88rem] text-muted-ink mt-2">
                {fr ? "Cochez chaque étape une fois terminée. La progression reste sur cet appareil; rien n'est envoyé." : "Tick each step when you've done it. Progress stays on this device; nothing is sent anywhere."}
              </p>
              {hydrated && doneSet.size > 0 && (
                <button type="button" onClick={() => { resetPath(p.id); setCelebrate(false); setJustDone(null); }} className="mt-3 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-muted-ink hover:text-ink">
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {fr ? "Remettre à zéro" : "Reset this path"}
                </button>
              )}
            </div>
            <div className="rounded-[8px] border border-line p-5">
              <p className="text-[0.85rem] font-semibold text-brass-ink">{fr ? "Qui enseigne ici" : "Who teaches on this path"}</p>
              <ul className="mt-2 grid gap-1.5 text-[0.92rem]">
                {pathProviders(p).map(id => <li key={id}><ProviderTag id={id} /></li>)}
              </ul>
            </div>
            {nextPath && (
              <Link to="/labs/$path" params={{ path: nextPath.id }} className="group rounded-[8px] bg-night text-white p-5 block hover:bg-night-2">
                <span className="block text-[0.85rem] font-semibold text-brass">{fr ? "Parcours suivant" : "Next on the line"}</span>
                <span className="block hl text-[1.3rem] mt-1 leading-tight group-hover:underline decoration-2 underline-offset-4">{String(nextPath.n).padStart(2, "0")} · {pick(nextPath.title)}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-[0.85rem] text-white/70">{fmtMinutes(pathMinutes(nextPath), locale)} · {pick(LEVEL_LABEL[nextPath.level])} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            )}
            <Link to="/labs" hash="paths" className="text-lake font-semibold hover:underline text-[0.95rem]">{fr ? "Tous les parcours" : "All paths"}</Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

type ListProps = {
  path: LabPath;
  steps: Step[];
  startAt: number;
  /** 0..1 how far the solid line runs; -1 for no solid line (optional steps). */
  lineFill: number;
  doneSet: Set<string>;
  justDone: string | null;
  dashed?: boolean;
  onToggle: (stepId: string) => void;
  onOpen: (stepId: string) => void;
  originals: Awaited<ReturnType<typeof getOriginalsFast>>;
};

function StepList({ path, steps, startAt, lineFill, doneSet, justDone, dashed, onToggle, onOpen, originals }: ListProps) {
  return (
    <ol className="relative">
      {/* the route line, from the first station's centre to the last */}
      <span aria-hidden="true" className={`absolute left-[19px] top-5 bottom-10 w-[4px] -translate-x-1/2 ${dashed ? "border-l-[3px] border-dashed border-brass w-0" : "bg-line rounded-full"}`} />
      {lineFill >= 0 && (
        <span aria-hidden="true" className="labs-line-fill absolute left-[19px] top-5 w-[4px] -translate-x-1/2 bg-signal rounded-full" style={{ height: `calc((100% - 3.75rem) * ${lineFill})` }} />
      )}
      {steps.map((s, i) => (
        <StepItem key={s.id} path={path} step={s} n={startAt + i} done={doneSet.has(s.id)} pop={justDone === s.id} onToggle={onToggle} onOpen={onOpen} originals={originals} />
      ))}
    </ol>
  );
}

function StepItem({ path, step, n, done, pop, onToggle, onOpen, originals }: {
  path: LabPath; step: Step; n: number; done: boolean; pop: boolean;
  onToggle: (id: string) => void; onOpen: (id: string) => void; originals: ListProps["originals"];
}) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const hydrated = useHydrated();
  const v = stepView(step);
  const c = v.course;
  const titleId = `step-${step.id}-title`;

  const kind =
    step.kind === "video" ? (fr ? "Notre vidéo" : "Our video")
      : step.kind === "guide" ? (fr ? "Notre guide" : "Our guide")
        : step.kind === "page" ? (fr ? "Sur notre site" : "On our site")
          : (fr ? "Cours" : "Course");

  const href = c ? (fr && c.frUrl ? c.frUrl : c.url) : undefined;
  const openLabel = step.kind === "video" ? (fr ? "Regarder ci-dessous" : "Watch below")
    : step.kind === "guide" ? (fr ? "Lire le guide" : "Read the guide")
      : step.kind === "page" ? (fr ? "Ouvrir la page" : "Open the page")
        : c && c.formats.includes("video") ? (fr ? "Suivre le cours" : "Take the course") : (fr ? "Lire" : "Read it");

  const original = step.kind === "video" ? originals?.items.find(o => o.id === step.originalId) : undefined;

  return (
    <li id={`step-${step.id}`} className="relative pl-[60px] sm:pl-[68px] pb-10 scroll-mt-24">
      {/* Station: the tick-box on the line */}
      <button
        type="button"
        onClick={() => onToggle(step.id)}
        aria-pressed={hydrated ? done : false}
        aria-label={`${done ? (fr ? "Terminé" : "Done") : (fr ? "Marquer comme terminé" : "Mark as done")}: ${pick(v.title)}`}
        className={`press absolute left-0 top-0 z-10 grid place-items-center h-10 w-10 rounded-full border-[3px] text-[0.95rem] font-bold tabular-nums transition-colors duration-200 ${done ? "bg-signal border-signal text-signal-ink" : "bg-paper border-ink text-ink hover:bg-ice"} ${pop ? "labs-tick" : ""}`}
      >
        {done ? <Check className="h-5 w-5" strokeWidth={3.5} aria-hidden="true" /> : n}
      </button>

      <article aria-labelledby={titleId} className={`rounded-[8px] border bg-surface p-5 sm:p-6 transition-colors ${done ? "border-signal/70" : "border-line"}`}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem]">
          <span className="font-semibold text-muted-ink">{fr ? `Étape ${n}` : `Step ${n}`}</span>
          <span aria-hidden="true" className="text-line">|</span>
          <span className="font-semibold">{kind}</span>
          <span aria-hidden="true" className="text-line">|</span>
          <ProviderTag id={v.provider} className="font-semibold" />
          {step.optional && <span className="ml-1 rounded-[3px] border border-brass text-brass-ink font-bold text-[0.72rem] px-1.5 py-0.5">{fr ? "En option" : "Optional"}</span>}
        </p>

        <div className={step.kind === "video" ? "mt-3 grid gap-5 sm:grid-cols-[1fr_200px]" : "mt-2"}>
          <div className="min-w-0">
            <h3 id={titleId} className="hl text-[1.35rem] sm:text-[1.5rem] leading-tight">
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => onOpen(step.id)} className="hover:text-lake">
                  {pick(v.title)}<ArrowUpRight className="inline h-4 w-4 ml-1 -mt-1 opacity-60" aria-hidden="true" />
                  <span className="sr-only">{fr ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
                </a>
              ) : step.kind === "guide" ? (
                <Link to="/learn/$slug" params={{ slug: step.slug }} onClick={() => onOpen(step.id)} className="hover:text-lake">{pick(v.title)}</Link>
              ) : step.kind === "page" ? (
                <Link to={step.to} onClick={() => onOpen(step.id)} className="hover:text-lake">{pick(v.title)}</Link>
              ) : pick(v.title)}
            </h3>
            <p className="font-serif text-[1.06rem] leading-relaxed mt-2">{pick(v.summary)}</p>
            {step.why && (
              <p className="mt-3 border-l-[3px] border-signal pl-3 font-serif italic text-[1rem] text-muted-ink">{pick(step.why)}</p>
            )}

            <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.85rem]">
              <li><LengthLabel minutes={v.minutes} approx={v.approx} /></li>
              <li>{pick(LEVEL_LABEL[v.level])}</li>
              {c && <li className="text-muted-ink">{c.formats.map(f => pick(FORMAT_LABEL[f])).join(" · ")}</li>}
              <li><PriceTag price={v.price} /></li>
              <li><FrenchTag french={v.french} frUrl={c?.frUrl} /></li>
              {c?.certificate && <li className="inline-flex items-center gap-1 text-muted-ink"><Award className="h-3.5 w-3.5" aria-hidden="true" />{fr ? "Certificat du fournisseur" : "Provider certificate"}</li>}
            </ul>
            {c?.priceNote && <p className="mt-2 text-[0.8rem] text-muted-ink">{pick(c.priceNote)}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => onOpen(step.id)} className="press inline-flex items-center gap-1.5 bg-ink text-white font-bold px-4 py-2.5 rounded-[5px] hover:bg-lake">
                  {openLabel} {c ? <span className="font-normal opacity-80">{fr ? `chez ${providerName(c.provider, locale)}` : `at ${providerName(c.provider, locale)}`}</span> : null}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : step.kind === "guide" ? (
                <Link to="/learn/$slug" params={{ slug: step.slug }} onClick={() => onOpen(step.id)} className="press inline-flex items-center gap-1.5 bg-ink text-white font-bold px-4 py-2.5 rounded-[5px] hover:bg-lake">
                  {openLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : step.kind === "page" ? (
                <Link to={step.to} onClick={() => onOpen(step.id)} className="press inline-flex items-center gap-1.5 bg-ink text-white font-bold px-4 py-2.5 rounded-[5px] hover:bg-lake">
                  {openLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => onToggle(step.id)}
                aria-pressed={hydrated ? done : false}
                className={`press inline-flex items-center gap-1.5 rounded-[5px] border-2 px-4 py-2 font-bold ${done ? "border-signal bg-signal/20" : "border-ink hover:bg-ice"}`}
              >
                {done ? <><Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> {fr ? "Terminé" : "Done"}</> : (fr ? "Marquer comme terminé" : "Mark as done")}
              </button>
            </div>
          </div>

          {step.kind === "video" && (
            <div className="max-w-[220px] text-ink">
              {original ? (
                <OriginalCard o={original} />
              ) : (
                <Link to="/originals" className="grid place-items-center aspect-[9/16] bg-signal text-signal-ink font-bold text-center p-4 rounded-[4px]">
                  {fr ? "Voir la vidéo dans Explicatifs" : "Watch it in Explainers"}
                </Link>
              )}
            </div>
          )}
        </div>
      </article>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* The "path complete" moment                                          */
/* ------------------------------------------------------------------ */

function Certificate({ path, animate, completedAt }: { path: LabPath; animate: boolean; completedAt?: string }) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const { state, setName } = useLabsProgress();
  const [name, setLocalName] = useState(state.name ?? "");
  const date = new Date(completedAt ?? Date.now()).toLocaleDateString(fr ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" });
  const steps = requiredSteps(path).map(stepView);
  const hours = fmtMinutes(pathMinutes(path), locale);

  const print = () => {
    document.documentElement.classList.add("labs-printing");
    const off = () => { document.documentElement.classList.remove("labs-printing"); window.removeEventListener("afterprint", off); };
    window.addEventListener("afterprint", off);
    window.print();
    setTimeout(off, 1000);
  };

  return (
    <section aria-labelledby="cert-title" className={`labs-cert relative bg-surface p-2 sm:p-3 border-[3px] border-brass rounded-[4px] ${animate ? "labs-cert-in" : ""}`}>
      <div className="border border-brass/70 px-5 py-8 sm:px-10 sm:py-10 text-center">
        <span aria-hidden="true" className={`absolute right-4 top-4 sm:right-6 sm:top-6 grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-signal text-signal-ink border-[3px] border-signal-ink ${animate ? "labs-seal" : ""}`}>
          <Award className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
        </span>
        <p className="masthead-serif text-[1.05rem] text-brass-ink">AI Broadsheet Labs</p>
        <h2 id="cert-title" className="masthead-serif text-[1.9rem] sm:text-[2.4rem] leading-tight mt-1">{fr ? "Parcours terminé" : "Path complete"}</h2>
        <p className="font-serif italic text-muted-ink mt-4">{fr ? "Ceci atteste que" : "This records that"}</p>
        <label htmlFor="cert-name" className="sr-only">{fr ? "Votre nom pour le certificat" : "Your name for the certificate"}</label>
        <input
          id="cert-name"
          value={name}
          onChange={e => setLocalName(e.target.value)}
          onBlur={() => setName(name.trim())}
          placeholder={fr ? "Votre nom" : "Your name"}
          maxLength={80}
          className="labs-cert-name mt-1 w-full max-w-[26rem] mx-auto block bg-transparent text-center masthead-serif text-[1.6rem] sm:text-[2rem] border-b-2 border-ink/30 focus:border-ink outline-none py-1 placeholder:text-ink/30"
        />
        <p className="font-serif italic text-muted-ink mt-4">{fr ? "a terminé le parcours" : "has completed the path"}</p>
        <p className="hl text-[1.5rem] sm:text-[1.9rem] leading-tight mt-1">{pick(path.title)}</p>
        <p className="meta mt-2">{fr ? `${steps.length} étapes · ${hours} · terminé le ${date}` : `${steps.length} steps · ${hours} · completed ${date}`}</p>
        <ul className="mt-6 grid gap-1.5 sm:grid-cols-2 text-left max-w-[34rem] mx-auto text-[0.9rem]">
          {path.skills.map((s, i) => (
            <li key={i} className="flex gap-2"><Check className="h-4 w-4 mt-0.5 shrink-0 text-brass-ink" strokeWidth={3} aria-hidden="true" />{pick(s)}</li>
          ))}
        </ul>
        <p className="mt-6 text-[0.8rem] text-muted-ink">
          {fr ? "Avec des cours de " : "With courses from "}{[...new Set(steps.map(s => s.provider))].map(id => providerName(id, locale)).join(", ")}.
        </p>
        <p className="mt-6 text-[0.75rem] text-muted-ink max-w-[30rem] mx-auto">
          {fr
            ? "Une trace personnelle de votre autoformation, pas un titre reconnu. Les fournisseurs remettent leurs propres certificats pour leurs cours."
            : "A personal record of self-study, not an accredited credential. Providers issue their own certificates for their courses."}
        </p>
        <div className="labs-no-print mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={print} className="press inline-flex items-center gap-2 bg-ink text-white font-bold px-4 py-2.5 rounded-[5px] hover:bg-lake">
            <Printer className="h-4 w-4" aria-hidden="true" /> {fr ? "Imprimer ou enregistrer en PDF" : "Print or save as PDF"}
          </button>
          <Link to="/labs" hash="paths" className="inline-flex items-center gap-2 border-2 border-ink font-bold px-4 py-2 rounded-[5px] hover:bg-ice">
            {fr ? "Choisir le parcours suivant" : "Choose your next path"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
