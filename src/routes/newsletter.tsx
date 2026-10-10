import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { NewsletterBox } from "@/components/NewsletterBox";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/newsletter")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `The Morning Broadsheet newsletter — ${SITE.name}`, fr: `L'infolettre The Morning Broadsheet — ${SITE.name}` },
      description: { en: `The AI stories that matter, in your inbox each morning. Named sources, links to the originals, mistakes corrected in public.`, fr: `Les nouvelles en IA qui comptent, dans votre boîte chaque matin. Sources nommées, liens vers les originaux, erreurs corrigées publiquement.` },
    }),
  component: Newsletter,
});

function Newsletter() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const points = fr
    ? ["La nouvelle que le plus de médias couvrent, et pourquoi elle compte.", "Les annonces des laboratoires et des gouvernements, avec les liens officiels.", "Une vidéo ou une entrevue à ne pas manquer."]
    : ["The story most newsrooms are covering, and why it matters.", "What the labs and governments announced, with the official links.", "One video or interview worth your time."];
  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw py-16">
          <NewsletterBox />
        </div>
      </section>
      <div className="container-mw mt-12 max-w-3xl">
        <h2 className="masthead-serif text-[1.8rem] mb-4">{fr ? "Dans chaque numéro" : "In every issue"}</h2>
        <ul className="grid gap-3">
          {points.map(p => (
            <li key={p} className="flex gap-3 font-serif text-[1.12rem] leading-relaxed">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />{p}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
