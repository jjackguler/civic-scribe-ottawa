import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { OriginalCard } from "@/components/Originals";
import { getOriginalsFast, useOriginals } from "@/lib/originals";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/originals")({
  loader: () => getOriginalsFast(),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Explainers: AI news in a minute — ${SITE.name}`, fr: `Explicatifs : l'actualité IA en une minute — ${SITE.name}` },
      description: {
        en: "Short video explainers of the day's biggest AI stories, written from the publishers' reporting and checked against it, with an AI voice.",
        fr: "De courtes vidéos qui expliquent les grandes nouvelles en IA du jour, écrites à partir des reportages des éditeurs et vérifiées, avec une voix d'IA.",
      },
    }),
  component: OriginalsPage,
});

function OriginalsPage() {
  const initial = Route.useLoaderData();
  const { data } = useOriginals(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const items = data?.items ?? [];
  return (
    <PageShell>
      <PageIntro
        title={fr ? "Explicatifs" : "Explainers"}
        dek={fr
          ? "Les grandes nouvelles en IA du jour, expliquées en une minute. Deux par jour."
          : "The day's biggest AI stories, explained in about a minute. Two a day."}
      />
      <section className="container-mw mt-10">
        {items.length === 0 ? (
          <p className="font-serif text-[1.15rem] max-w-xl">{fr ? "Les premiers explicatifs arrivent bientôt." : "The first explainers are on their way."}</p>
        ) : (
          <div className="grid gap-x-6 gap-y-10 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {items.map(o => <OriginalCard key={o.id} o={o} />)}
          </div>
        )}
      </section>
      <section className="container-mw mt-14 max-w-3xl">
        <h2 className="masthead-serif text-[1.6rem] mb-2">{fr ? "Comment ils sont faits" : "How they're made"}</h2>
        <p className="font-serif text-[1.1rem] leading-relaxed">
          {fr
            ? "Notre système choisit la nouvelle que le plus de médias rapportent. Claude écrit le texte uniquement à partir de leurs titres et extraits; chaque nom et chaque chiffre est vérifié dans ces textes, sinon la vidéo n'est pas publiée. La voix est une voix de synthèse ElevenLabs. Les illustrations, quand il y en a, sont générées par IA et identifiées; nous ne fabriquons jamais d'images qui ressemblent à des photos de presse. Chaque vidéo nomme ses sources."
            : "Our system picks the story the most newsrooms are reporting. Claude writes the script only from their headlines and excerpts; every name and number is checked against that text, or the video isn't published. The voice is a synthetic ElevenLabs voice. Illustrations, when there are any, are AI-generated and labelled; we never make pictures that look like news photos. Every video names its sources."}
        </p>
        <p className="mt-3"><Link to="/standards" hash="ai-desk" className="text-lake font-semibold hover:underline">{fr ? "Nos normes" : "Our standards"}</Link></p>
      </section>
    </PageShell>
  );
}
