import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHead } from "@/components/LabBits";
import { Horizon } from "@/components/FieldTrips";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef } from "@/lib/seo";
import { FIELD_TRIPS, TRIPS } from "@/lib/field-trips";

export const Route = createFileRoute("/labs/field-trips/")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `${FIELD_TRIPS.title.en}: Mars, ants and Archimedes — ${SITE.name} Labs`, fr: `${FIELD_TRIPS.title.fr} : Mars, fourmis et Archimède — ${SITE.name} Labs` },
      description: FIELD_TRIPS.dek,
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: FIELD_TRIPS.title[locale],
        url,
        numberOfItems: TRIPS.length,
        itemListElement: TRIPS.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absUrl(`/labs/field-trips/${t.slug}`, locale),
          item: {
            "@type": "LearningResource",
            name: t.title[locale],
            description: t.dek[locale],
            url: absUrl(`/labs/field-trips/${t.slug}`, locale),
            publisher: publisherRef,
            isAccessibleForFree: true,
          },
        })),
      }],
    }),
  component: FieldTripsPage,
});

function FieldTripsPage() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw pt-10 pb-12 sm:pt-14 sm:pb-16">
          <p className="text-[0.9rem] font-semibold text-brass">
            AI Broadsheet Labs <span className="text-white/50">·</span> <span className="text-white/70">{fr ? "faites avec l'IA, vérifiées par la rédaction" : "made with AI, checked by the newsroom"}</span>
          </p>
          <h1 className="masthead-serif text-[2.6rem] sm:text-[3.6rem] leading-[0.98] mt-3 max-w-[18ch] hero-in">
            {fr ? <>Trois sorties dans un monde <span className="text-signal">qu'une IA a imaginé</span>.</> : <>Three field trips into a world <span className="text-signal">an AI imagined</span>.</>}
          </h1>
          <p className="font-serif text-[1.15rem] sm:text-[1.3rem] leading-relaxed text-white/75 mt-5 max-w-[42rem]">{pick(FIELD_TRIPS.dek)}</p>
        </div>
      </section>

      <section className="container-mw mt-10" aria-labelledby="trips-title">
        <h2 id="trips-title" className="sr-only">{fr ? "Les sorties" : "The trips"}</h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {TRIPS.map(t => (
            <li key={t.slug}>
              <Link to="/labs/field-trips/$trip" params={{ trip: t.slug }} className="group flex h-full flex-col rounded-[10px] border-2 border-night overflow-hidden hover:bg-ice transition-colors">
                <span className="relative block aspect-[16/7] bg-night">
                  <Horizon tone={t.tone} className="absolute inset-0 h-full w-full" />
                  <span className="absolute left-4 top-3 masthead-serif text-[2rem] leading-none text-white/90 tabular-nums">{t.n}</span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="text-[0.85rem] font-semibold text-brass-ink">{pick(t.subject)} · {pick(t.ages)} · {t.minutes} min</span>
                  <span className="masthead-serif text-[1.6rem] leading-[1.08] mt-1">{pick(t.title)}</span>
                  <span className="mt-2 text-[0.98rem] leading-relaxed text-muted-ink flex-1">{pick(t.dek)}</span>
                  <span className="mt-4 inline-flex items-center gap-2 font-bold text-lake">{fr ? "Partir" : "Go"} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="how-title">
        <SectionHead id="how-title" kicker={fr ? "Comment nous les avons faites" : "How we made them"} title={fr ? "Une IA dessine, la rédaction vérifie" : "The AI draws, the newsroom checks"} />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              t: fr ? "1. Bâtir dans Genie" : "1. Build in Genie",
              b: fr
                ? "Nous avons décrit chaque leçon à Project Genie (Genie 4) en mode Histoire interactive : trois étapes, une question par étape."
                : "We described each lesson to Project Genie (Genie 4) in Interactive Story mode: three stages, one question per stage.",
            },
            {
              t: fr ? "2. Jouer et noter les erreurs" : "2. Play it and log the errors",
              b: fr
                ? "Nous avons joué chaque sortie et noté ce qui clochait : un ciel de la mauvaise couleur, un navire absent, une règle de physique mal dite."
                : "We played each trip and wrote down what went wrong: a sky the wrong colour, a missing ship, a physics rule stated wrongly.",
            },
            {
              t: fr ? "3. Réécrire et sourcer" : "3. Rewrite and source",
              b: fr
                ? "Les questions de cette page sont les nôtres, vérifiées auprès de la NASA, d'universités et de Scientific American. Elles marchent sans compte Genie."
                : "The questions on these pages are ours, checked against NASA, universities and Scientific American. They work without a Genie account.",
            },
          ].map(s => (
            <div key={s.t} className="border-t-[3px] border-signal pt-3">
              <h3 className="hl text-[1.2rem]">{s.t}</h3>
              <p className="mt-1.5 text-[0.98rem] leading-relaxed text-muted-ink">{s.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-bold">
          <Link to="/labs/world-model" className="text-lake hover:underline">{fr ? "Dans un modèle de monde : pourquoi il oublie" : "Inside a world model: why it forgets"}</Link>
          <Link to="/labs/teach-the-machine" className="text-lake hover:underline">{fr ? "Apprenez à la machine : flotte ou coule?" : "Teach the machine: float or sink?"}</Link>
          <Link to="/how-we-use-ai" className="text-lake hover:underline">{fr ? "Notre utilisation de l'IA" : "How we use AI"}</Link>
        </p>
      </section>
    </PageShell>
  );
}
