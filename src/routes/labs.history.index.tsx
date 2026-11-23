import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef } from "@/lib/seo";
import { EPISODES, SERIES } from "@/lib/history-series";

export const Route = createFileRoute("/labs/history/")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `${SERIES.title.en}: a Labs series — ${SITE.name}`, fr: `${SERIES.title.fr} : une série Labs — ${SITE.name}` },
      description: SERIES.dek,
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "CreativeWorkSeries",
        name: SERIES.title[locale],
        description: SERIES.dek[locale],
        url,
        publisher: publisherRef,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        hasPart: EPISODES.map(e => ({ "@type": "LearningResource", name: e.title[locale], url: absUrl(`/labs/history/${e.slug}`, locale) })),
      }],
    }),
  component: SeriesPage,
});

function SeriesPage() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw pt-8 pb-12 sm:pt-12 sm:pb-16">
          <p className="text-[0.9rem]"><Link to="/labs" className="text-white/70 hover:text-white">Labs</Link></p>
          <p className="mt-5 text-[0.9rem] font-semibold text-brass">{fr ? "Une série Labs" : "A Labs series"}</p>
          <h1 className="masthead-serif text-[2.6rem] sm:text-[3.6rem] leading-[0.98] mt-2 max-w-[18ch]">{pick(SERIES.title)}</h1>
          <p className="font-serif text-[1.15rem] sm:text-[1.3rem] leading-relaxed text-white/80 mt-5 max-w-[44rem]">{pick(SERIES.dek)}</p>
          <p className="mt-4 text-[0.9rem] text-white/60 max-w-[44rem]">
            {fr
              ? "Chaque image générée est identifiée comme telle. Les personnes historiques ne sont jamais montrées : les visages sont inventés et nous le disons."
              : "Every generated image is labelled. Historical people are never shown: the faces are invented, and we say so."}
          </p>
        </div>
      </section>

      <section className="container-mw mt-12" aria-label={fr ? "Épisodes" : "Episodes"}>
        <ol className="grid gap-6 md:grid-cols-2">
          {EPISODES.map(e => (
            <li key={e.slug}>
              <Link to="/labs/history/$episode" params={{ episode: e.slug }} className="group block border border-line rounded-[10px] overflow-hidden hover:border-ink">
                <span className="relative block aspect-video bg-night">
                  <img src={e.poster} alt={pick(e.beats[0].alt)} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 bg-signal text-signal-ink text-[0.72rem] font-bold tracking-[0.12em] px-2 py-1 rounded-[3px]">{fr ? "GÉNÉRÉ PAR IA" : "AI-GENERATED"}</span>
                </span>
                <span className="block p-5">
                  <span className="block text-[0.85rem] font-semibold text-brass-ink">{fr ? `Épisode ${e.n}` : `Episode ${e.n}`} · {e.tool.split(" (")[0]}</span>
                  <span className="block hl text-[1.5rem] leading-tight mt-1 group-hover:underline">{pick(e.title)}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-lake">{fr ? "Voir l'épisode" : "Watch the episode"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}
