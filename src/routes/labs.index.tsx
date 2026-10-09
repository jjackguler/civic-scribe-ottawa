import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Award } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ContinueCard, FrenchTag, LengthLabel, LessonOne, PathPicker, PriceTag, ProviderTag, RouteMap, ofText } from "@/components/Labs";
import { YoungLabCard } from "@/components/YoungLab";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef } from "@/lib/seo";
import {
  COURSES, FORMAT_LABEL, LABS_CHECKED, LABS_STATS, LEVEL_LABEL, PATHS, PROVIDERS,
  fmtMinutes, pathMinutes, pathProviders, providerName, requiredSteps, stepView,
  type Level, type ProviderId,
} from "@/lib/labs";
import { isComplete, pathFraction, useHydrated, useLabsProgress } from "@/lib/labs-progress";

export const Route = createFileRoute("/labs/")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `AI Broadsheet Labs: learn AI from beginner to builder — ${SITE.name}`, fr: `AI Broadsheet Labs : apprendre l'IA, de débutant à créateur — ${SITE.name}` },
      description: {
        en: `${PATHS.length} free learning paths that put the official courses from Anthropic, OpenAI, Google, Microsoft and others in order, with our own explainers. In English and French.`,
        fr: `${PATHS.length} parcours gratuits qui mettent en ordre les cours officiels d'Anthropic, d'OpenAI, de Google, de Microsoft et d'autres, avec nos propres explications. En français et en anglais.`,
      },
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: locale === "fr" ? "Parcours AI Broadsheet Labs" : "AI Broadsheet Labs paths",
        url,
        numberOfItems: PATHS.length,
        itemListElement: PATHS.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absUrl(`/labs/${p.id}`, locale),
          item: {
            "@type": "Course",
            name: p.title[locale],
            description: p.dek[locale],
            url: absUrl(`/labs/${p.id}`, locale),
            provider: publisherRef,
            inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
            educationalLevel: LEVEL_LABEL[p.level][locale],
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: 0, priceCurrency: "CAD", category: "Free" },
            hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: `PT${pathMinutes(p)}M` },
          },
        })),
      }],
    }),
  component: LabsPage,
});

function LabsPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [picked, setPicked] = useState<string | undefined>();

  return (
    <PageShell>
      {/* Hero: the route from beginner to builder */}
      <section className="bg-night text-white">
        <div className="container-mw pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="text-[0.9rem] font-semibold text-brass">
                AI Broadsheet Labs <span className="text-white/50">·</span> <span className="text-white/70">{fr ? "gratuit, bilingue, vérifié le 9 octobre 2026" : "free, bilingual, checked 9 October 2026"}</span>
              </p>
              <h1 className="masthead-serif text-[2.6rem] sm:text-[3.6rem] lg:text-[4.2rem] leading-[0.98] mt-3 max-w-[16ch]">
                {fr ? <>De « Qu'est-ce que l'IA? » à <span className="text-signal">créer avec elle</span>.</> : <>From “What is AI?” to <span className="text-signal">building with it</span>.</>}
              </h1>
              <p className="font-serif text-[1.15rem] sm:text-[1.3rem] leading-relaxed text-white/75 mt-5 max-w-[42rem]">
                {fr
                  ? "Les entreprises qui construisent l'IA offrent leurs propres cours gratuits. Nous les avons suivis, triés et mis en ordre, avec nos vidéos et guides entre les deux. Pas besoin de compte ici : votre progression reste sur cet appareil."
                  : "The companies building AI publish their own free courses. We went through them, sorted them and put them in order, with our own videos and guides in between. No account needed here: your progress stays on this device."}
              </p>
            </div>
            <div className="lg:col-span-4">
              <ContinueCard fallback={<LessonOne />} />
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/15 border-y border-white/15">
            {[
              [LABS_STATS.paths, fr ? "parcours" : "paths"],
              [LABS_STATS.courses, fr ? "cours et guides externes" : "outside courses and guides"],
              [LABS_STATS.providers, fr ? "fournisseurs, plus nous" : "providers, plus us"],
              [LABS_STATS.french, fr ? "offerts en français" : "available in French"],
            ].map(([n, label]) => (
              <div key={String(label)} className="bg-night py-4 px-3 sm:px-4 flex flex-col-reverse">
                <dt className="text-[0.85rem] text-white/70 mt-1">{label}</dt>
                <dd className="masthead-serif text-signal text-[2.2rem] leading-none tabular-nums">{n}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10">
            <RouteMap highlight={picked} />
          </div>
        </div>
      </section>

      {/* Path picker */}
      <section id="start" className="container-mw scroll-mt-20">
        <div className="py-12 sm:py-16">
          <PathPicker onPick={setPicked} />
        </div>
      </section>

      {/* Young Lab: the youth wing */}
      <section className="container-mw" aria-label={fr ? "Jeune Labo, pour les 8 à 17 ans" : "Young Lab, for ages 8 to 17"}>
        <YoungLabCard />
      </section>

      <PathsIndex />
      <Catalogue />

      {/* How we chose */}
      <section className="container-mw mt-16">
        <div className="relative pt-3 border-t-[3px] border-night">
          <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
          <h2 className="masthead-serif text-[1.75rem] sm:text-[2.05rem]">{fr ? "Comment nous avons choisi" : "How we chose"}</h2>
          <div className="mt-5 grid gap-8 md:grid-cols-3 font-serif text-[1.05rem] leading-relaxed">
            <p><strong className="font-sans">{fr ? "Les sources officielles d'abord. " : "Official sources first. "}</strong>{fr ? "Chaque cours vient de l'entreprise ou de l'organisme qui le publie : Anthropic, OpenAI, Google, Microsoft, des universités et des organismes canadiens. Les résumés sont les nôtres." : "Every course comes from the company or organization that publishes it: Anthropic, OpenAI, Google, Microsoft, universities and Canadian non-profits. The summaries are ours."}</p>
            <p><strong className="font-sans">{fr ? "Gratuit, sauf mention. " : "Free unless marked. "}</strong>{fr ? "Les étapes obligatoires sont gratuites. Quelques cours payants figurent en option, toujours identifiés. Nous ne touchons aucune commission." : "Required steps are free. A few paid courses appear as optional extras, always labelled. We earn nothing from any of them."}</p>
            <p><strong className="font-sans">{fr ? "Vérifié à la main. " : "Checked by hand. "}</strong>{fr ? `Chaque lien a été ouvert le ${LABS_CHECKED.slice(8)} octobre 2026. Quand un fournisseur n'indique pas de durée, la nôtre est une estimation, notée « env. ». Signalez une erreur à la rédaction.` : `Every link was opened on 9 October 2026. Where a provider gives no length, ours is an estimate, marked "about". Spot a problem? Tell the newsroom.`}</p>
          </div>
          <p className="mt-6"><Link to="/corrections" className="text-lake font-semibold hover:underline">{fr ? "Signaler une erreur" : "Report a problem"}</Link></p>
        </div>
      </section>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* The paths, as a table of contents                                   */
/* ------------------------------------------------------------------ */

function PathsIndex() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const hydrated = useHydrated();
  const { state } = useLabsProgress();
  return (
    <section id="paths" className="container-mw mt-12 sm:mt-16 scroll-mt-20" aria-labelledby="paths-title">
      <div className="relative pt-3 border-t-[3px] border-night">
        <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="paths-title" className="masthead-serif text-[1.75rem] sm:text-[2.05rem]">{fr ? "Les parcours" : "The paths"}</h2>
          <p className="meta">{fr ? "Dans l'ordre, du débutant au créateur" : "In order, beginner to builder"}</p>
        </div>
      </div>
      <ol className="mt-2">
        {PATHS.map(p => {
          const req = requiredSteps(p);
          const f = hydrated ? pathFraction(p, state) : 0;
          const done = hydrated && isComplete(p, state);
          const frCount = p.steps.filter(s => stepView(s).french !== "none").length;
          return (
            <li key={p.id} className="group relative grid gap-4 md:grid-cols-12 py-7 border-b border-line">
              <div className="md:col-span-1 flex md:block items-center gap-3">
                <span aria-hidden="true" className={`masthead-serif text-[2.6rem] md:text-[3.2rem] leading-[0.85] tabular-nums ${p.line === "side" ? "text-brass-ink" : "text-ink"}`}>{String(p.n).padStart(2, "0")}</span>
                {p.line === "side" && <span className="md:mt-2 inline-block text-[0.72rem] font-bold text-brass-ink border border-brass px-1.5 py-0.5 rounded-[3px]">{fr ? "Parallèle" : "Side route"}</span>}
              </div>
              <div className="md:col-span-7 min-w-0">
                <h3 className="hl text-[1.5rem] sm:text-[1.75rem] leading-tight">
                  <Link to="/labs/$path" params={{ path: p.id }} className="headline-sweep after:absolute after:inset-0 after:content-['']">{pick(p.title)}</Link>
                </h3>
                <p className="dek mt-2 max-w-[44rem]">{pick(p.dek)}</p>
                <p className="mt-3 text-[0.92rem]">
                  <span className="font-semibold">{fr ? "Vous saurez : " : "You'll be able to: "}</span>
                  <span className="text-muted-ink">{p.skills.map(s => pick(s).replace(/^./, c => c.toLowerCase())).join(" · ")}</span>
                </p>
              </div>
              <div className="md:col-span-4 md:pl-6 md:border-l border-line text-[0.9rem]">
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <dt className="text-muted-ink">{fr ? "Durée" : "Time"}</dt><dd className="font-semibold tabular-nums">{fmtMinutes(pathMinutes(p), locale)}{p.steps.some(s => s.optional) ? <span className="font-normal text-muted-ink">{fr ? ` (+ ${fmtMinutes(pathMinutes(p, true) - pathMinutes(p), locale)} en option)` : ` (+ ${fmtMinutes(pathMinutes(p, true) - pathMinutes(p), locale)} optional)`}</span> : null}</dd>
                  <dt className="text-muted-ink">{fr ? "Étapes" : "Steps"}</dt><dd className="font-semibold">{req.length}</dd>
                  <dt className="text-muted-ink">{fr ? "Niveau" : "Level"}</dt><dd className="font-semibold">{pick(LEVEL_LABEL[p.level])}</dd>
                  <dt className="text-muted-ink">{fr ? "En français" : "In French"}</dt><dd className="font-semibold">{ofText(frCount, p.steps.length, locale)}</dd>
                </dl>
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.8rem] text-muted-ink">
                  {pathProviders(p).map(id => <ProviderTag key={id} id={id} />)}
                </p>
                {f > 0 && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="relative h-[6px] flex-1 rounded-full bg-ice overflow-hidden">
                      <span className="absolute inset-y-0 left-0 bg-signal" style={{ width: `${f * 100}%` }} />
                    </span>
                    <span className="text-[0.8rem] font-semibold tabular-nums inline-flex items-center gap-1">
                      {done ? <><Award className="h-4 w-4 text-brass-ink" aria-hidden="true" /> {fr ? "Terminé" : "Complete"}</> : `${Math.round(f * 100)} %`}
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The full catalogue, as listings                                     */
/* ------------------------------------------------------------------ */

const PROVIDER_FILTERS: (ProviderId | "all" | "others")[] = ["all", "anthropic", "openai", "google", "microsoft", "others"];
const BIG: ProviderId[] = ["anthropic", "openai", "google", "kaggle", "microsoft"];

function Catalogue() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [prov, setProv] = useState<(typeof PROVIDER_FILTERS)[number]>("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [frOnly, setFrOnly] = useState(false);
  const [level, setLevel] = useState<Level | "all">("all");
  const [all, setAll] = useState(false);

  const rows = useMemo(() => COURSES.filter(c =>
    (prov === "all" || (prov === "others" ? !BIG.includes(c.provider) : prov === "google" ? c.provider === "google" || c.provider === "kaggle" : c.provider === prov)) &&
    (!freeOnly || c.price !== "paid") &&
    (!frOnly || c.french !== "none") &&
    (level === "all" || c.level === level),
  ), [prov, freeOnly, frOnly, level]);

  const chip = (active: boolean) =>
    `press rounded-full border px-3.5 py-1.5 text-[0.88rem] font-semibold transition-colors ${active ? "bg-ink text-white border-ink" : "bg-surface border-line hover:border-ink"}`;

  return (
    <section id="catalogue" className="container-mw mt-16 scroll-mt-20" aria-labelledby="catalogue-title">
      <div className="relative pt-3 border-t-[3px] border-night">
        <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="catalogue-title" className="masthead-serif text-[1.75rem] sm:text-[2.05rem]">{fr ? "Le catalogue" : "The catalogue"}</h2>
          <p className="meta">{fr ? `Liens vérifiés le 9 octobre 2026` : `Links checked 9 October 2026`}</p>
        </div>
        <p className="dek mt-1 max-w-3xl">{fr ? "Tous les cours des parcours, au même endroit. Filtrez par fournisseur, prix, langue ou niveau." : "Every course on every path, in one place. Filter by provider, price, language or level."}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={fr ? "Fournisseur" : "Provider"} className="flex flex-wrap gap-2">
          {PROVIDER_FILTERS.map(id => (
            <button key={id} type="button" aria-pressed={prov === id} onClick={() => setProv(id)} className={chip(prov === id)}>
              {id === "all" ? (fr ? "Tous" : "All") : id === "others" ? (fr ? "Universités et organismes" : "Universities and non-profits") : providerName(id, locale)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-pressed={freeOnly} onClick={() => setFreeOnly(v => !v)} className={chip(freeOnly)}>{fr ? "Gratuits seulement" : "Free only"}</button>
          <button type="button" aria-pressed={frOnly} onClick={() => setFrOnly(v => !v)} className={chip(frOnly)}>{fr ? "Offerts en français" : "Available in French"}</button>
          <label className="sr-only" htmlFor="labs-level">{fr ? "Niveau" : "Level"}</label>
          <select id="labs-level" value={level} onChange={e => setLevel(e.target.value as Level | "all")} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.88rem] font-semibold hover:border-ink">
            <option value="all">{fr ? "Tous les niveaux" : "All levels"}</option>
            {(["beginner", "intermediate", "advanced"] as Level[]).map(l => <option key={l} value={l}>{pick(LEVEL_LABEL[l])}</option>)}
          </select>
        </div>
      </div>

      <p className="meta mt-4" aria-live="polite">{fr ? `${rows.length} cours sur ${COURSES.length}` : `${rows.length} of ${COURSES.length} courses`}</p>

      <div className="mt-2 border-t-2 border-ink">
        <div className="hidden md:grid grid-cols-[150px_1fr_110px_120px_110px_90px] gap-4 py-2 text-[0.78rem] font-semibold text-muted-ink border-b border-line">
          <span>{fr ? "Fournisseur" : "Provider"}</span><span>{fr ? "Cours" : "Course"}</span><span>{fr ? "Durée" : "Length"}</span><span>{fr ? "Niveau" : "Level"}</span><span>{fr ? "Prix" : "Price"}</span><span>{fr ? "Français" : "French"}</span>
        </div>
        <ul>
          {(all ? rows : rows.slice(0, 12)).map(c => (
            <li key={c.id} className="grid gap-x-4 gap-y-1 py-4 border-b border-line md:grid-cols-[150px_1fr_110px_120px_110px_90px] md:items-baseline">
              <ProviderTag id={c.provider} className="text-[0.85rem] font-semibold" />
              <div className="min-w-0">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="group inline font-bold text-[1.02rem] leading-snug hover:text-lake">
                  {pick(c.title)}<ArrowUpRight className="inline h-3.5 w-3.5 ml-0.5 -mt-0.5 opacity-60 group-hover:opacity-100" aria-hidden="true" />
                  <span className="sr-only">{fr ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
                </a>
                <p className="text-[0.88rem] text-muted-ink mt-0.5">{pick(c.summary)}</p>
                <p className="text-[0.78rem] text-muted-ink mt-1">{c.formats.map(f => pick(FORMAT_LABEL[f])).join(" · ")}{c.certificate ? (fr ? " · certificat du fournisseur" : " · provider certificate") : ""}</p>
              </div>
              <span className="text-[0.88rem] md:block inline-flex gap-3 flex-wrap">
                <LengthLabel minutes={c.minutes} approx={c.approx} />
                <span className="md:hidden text-muted-ink">· {pick(LEVEL_LABEL[c.level])}</span>
              </span>
              <span className="hidden md:block text-[0.88rem]">{pick(LEVEL_LABEL[c.level])}</span>
              <span className="text-[0.88rem]">
                <PriceTag price={c.price} />
                {c.priceNote && <span className="block text-[0.75rem] text-muted-ink mt-0.5">{pick(c.priceNote)}</span>}
              </span>
              <span className="text-[0.88rem]">
                <FrenchTag french={c.french} frUrl={c.frUrl} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {!all && rows.length > 12 && (
        <button type="button" onClick={() => setAll(true)} className="press mt-5 inline-flex items-center gap-2 border-2 border-ink font-bold px-4 py-2 rounded-[5px] hover:bg-ice">
          {fr ? `Afficher les ${rows.length} cours` : `Show all ${rows.length} courses`}
        </button>
      )}
      <p className="meta mt-3">{fr ? "« env. » : durée estimée par nous, le fournisseur ne l'indiquant pas." : "\"about\": our estimate, where the provider doesn't give a length."}</p>
    </section>
  );
}
