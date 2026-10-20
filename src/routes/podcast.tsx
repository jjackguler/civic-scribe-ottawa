import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { NewsletterBox } from "@/components/NewsletterBox";
import { getPodcast, usePodcast, type PodcastEpisode } from "@/lib/podcast";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, ORIGIN, publisherRef } from "@/lib/seo";

const mins = (s: number) => `${Math.round(s / 60)} min`;
const iso = (s: number) => `PT${Math.floor(s / 60)}M${s % 60}S`;

export const Route = createFileRoute("/podcast")({
  loader: () => getPodcast(),
  head: ({ match, loaderData }) =>
    seoHead(match, {
      title: { en: `After the Headline: the AI Broadsheet podcast — ${SITE.name}`, fr: `After the Headline : le balado d'AI Broadsheet — ${SITE.name}` },
      description: {
        en: "The story under the AI story: short conversations from the AI Broadsheet newsroom, every number sourced, voices disclosed.",
        fr: "L'histoire derrière la nouvelle en IA : de courtes conversations de la rédaction d'AI Broadsheet, chaque chiffre sourcé, voix déclarées.",
      },
      image: loaderData?.imageUrl || undefined,
      imageWidth: loaderData?.imageUrl ? 3000 : undefined,
      imageHeight: loaderData?.imageUrl ? 3000 : undefined,
      jsonLd: () => [{
        "@context": "https://schema.org", "@type": "PodcastSeries", name: "After the Headline", url: `${ORIGIN}/podcast`, webFeed: `${ORIGIN}/podcast.xml`,
        image: loaderData?.imageUrl, publisher: publisherRef,
        episode: (loaderData?.episodes ?? []).map(e => ({ "@type": "PodcastEpisode", name: e.title, description: e.summary, datePublished: e.publishedAt, url: `${ORIGIN}/podcast#${e.id}`, timeRequired: iso(e.durationSec), associatedMedia: { "@type": "MediaObject", contentUrl: e.fileUrl } })),
      }],
    }),
  component: PodcastPage,
});

function Episode({ e, fr }: { e: PodcastEpisode; fr: boolean }) {
  return (
    <article id={e.id} className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] py-8 border-b border-line scroll-mt-24">
      {e.imageUrl && <img src={e.imageUrl} alt="" loading="lazy" className="w-[180px] h-[180px] object-cover" />}
      <div className="min-w-0">
        <p className="text-[0.8rem] font-bold tracking-[0.16em] uppercase text-muted-foreground">
          {fr ? "Épisode" : "Episode"} {e.number} · {mins(e.durationSec)}{e.opinion && <span className="ml-2 bg-[#D9412B] text-white px-2 py-0.5">{fr ? "Opinion" : "Opinion"}</span>}
        </p>
        <h2 className="masthead-serif text-[1.7rem] leading-tight mt-1">{e.title}</h2>
        <p className="font-serif text-[1.05rem] leading-relaxed mt-2 max-w-[62ch]">{e.summary}</p>
        <audio controls preload="none" src={e.fileUrl} className="w-full max-w-xl mt-4" />
        <p className="text-[0.8rem] opacity-70 mt-2">{fr ? "Voix : " : "Voices: "}{e.voices} · {fr ? "D'après " : "From "}{e.sources.map(s => s.name).slice(0, 3).join(", ")}</p>
        <details className="mt-3"><summary className="cursor-pointer text-[0.9rem] font-semibold">{fr ? "Transcription et sources" : "Transcript and sources"}</summary>
          <ul className="mt-2 text-[0.88rem] list-disc pl-5">{e.sources.map(s => <li key={s.url}><a className="text-lake hover:underline" href={s.url} target="_blank" rel="noopener">{s.name}</a></li>)}</ul>
          <p className="mt-3 whitespace-pre-line text-[0.92rem] leading-relaxed opacity-85">{e.transcript}</p>
        </details>
      </div>
    </article>
  );
}

function PodcastPage() {
  const initial = Route.useLoaderData();
  const { data } = usePodcast(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const eps = data?.episodes ?? [];
  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw py-12 grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] items-center">
          {data?.imageUrl && <img src={data.imageUrl} alt="After the Headline" className="w-[260px] h-[260px] object-cover shadow-2xl" />}
          <div>
            <p className="text-brass font-bold text-[0.8rem] tracking-[0.22em] uppercase">{fr ? "Le balado d'AI Broadsheet" : "The AI Broadsheet podcast"}</p>
            <h1 className="masthead-serif text-[2.6rem] sm:text-[3.6rem] leading-none mt-2">After the Headline</h1>
            <p className="font-serif text-[1.15rem] text-white/80 mt-4 max-w-[52ch]">{fr ? "L'histoire derrière la nouvelle. Des conversations courtes, chaque chiffre sourcé, voix synthétiques déclarées." : "The story under the story. Short conversations, every number sourced, synthetic voices disclosed."}</p>
            <p className="mt-5 flex flex-wrap gap-3 text-[0.9rem] font-bold">
              <a href="/podcast.xml" className="px-4 py-2 rounded-[4px] bg-brass text-night">RSS</a>
              <Link to="/sir-jack" className="px-4 py-2 rounded-[4px] border border-white/30">{fr ? "Les dossiers Sir Jack" : "The Sir Jack Files"}</Link>
            </p>
          </div>
        </div>
      </section>
      <section className="container-mw mt-6 max-w-5xl">
        {eps.length === 0 ? <p className="font-serif text-[1.1rem] py-10">{fr ? "Le premier épisode arrive bientôt." : "The first episode is on its way."}</p> : eps.map(e => <Episode key={e.id} e={e} fr={fr} />)}
      </section>
      <section className="bg-night text-white mt-10"><div className="container-mw py-12"><NewsletterBox variant="band" /></div></section>
    </PageShell>
  );
}
