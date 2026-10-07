import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { NewsletterBox } from "@/components/NewsletterBox";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: `The Morning Broadsheet newsletter — ${SITE.name}` },
      { name: "description", content: "The AI stories that matter, in your inbox each morning. Checked sources, links to the originals, nothing made up." },
    ],
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
