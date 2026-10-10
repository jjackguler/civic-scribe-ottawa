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
          ? "Les nouvelles en IA choisies par notre rédaction, expliquées en environ une minute, avec leurs sources."
          : "AI stories selected by our newsroom, explained in about a minute, with their sources."}
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
            ? "Nos choix éditoriaux passent en premier, puis nos articles, puis les sujets rapportés par plusieurs médias. Les textes sont rédigés avec l'aide de l'IA à partir des sources citées. Des contrôles automatiques comparent les noms, les chiffres et les citations aux textes sources; ils ne remplacent pas la vérification humaine. Les voix sont synthétiques et les crédits de chaque vidéo précisent les outils et les médias utilisés. Les images d'archives du collage sont décoratives : elles ne représentent pas les personnes de la nouvelle."
            : "Our editorial selections come first, followed by our articles and stories reported by multiple outlets. Scripts are written with AI assistance from the cited sources. Automated checks compare names, numbers and quotations with those texts; they do not replace human verification. Voices are synthetic, and each video's credits identify the tools and media used. Archive images in the collage are decoration, not depictions of the people in the story."}
        </p>
        <p className="mt-3"><Link to="/standards" hash="ai-desk" className="text-lake font-semibold hover:underline">{fr ? "Nos normes" : "Our standards"}</Link></p>
      </section>
    </PageShell>
  );
}
