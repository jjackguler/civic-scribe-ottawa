import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Trust";
import { NewsletterBox } from "@/components/NewsletterBox";
import { SheetStory, sheetRange } from "@/components/WeekSheet";
import { useLocale } from "@/lib/locale-context";
import { deskLabel } from "@/lib/desks";
import { latestSheet } from "@/lib/week-sheet";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/week")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `The week in AI, robotics and tech — ${SITE.name}`, fr: `La semaine en IA, robotique et techno — ${SITE.name}` },
      description: {
        en: "The stories that mattered this week in AI, robotics and technology, with the facts, the human stakes and a link to the original reporting.",
        fr: "Les nouvelles de la semaine en IA, robotique et techno, avec les faits, l'enjeu humain et un lien vers le reportage original.",
      },
      breadcrumbs: [{ name: { en: "The week", fr: "La semaine" }, path: "/week" }],
    }),
  component: Week,
});

function Week() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const e = latestSheet();
  return (
    <PageShell>
      <div className="container-mw pt-6 pb-14">
        <Breadcrumbs items={[{ label: fr ? "La semaine" : "The week" }]} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] mt-4">
          <div className="min-w-0">
            <p className="kicker">{sheetRange(e, fr)}</p>
            <h1 className="hl text-[2.2rem] sm:text-[2.8rem] leading-[1.05] mt-1">{fr ? "La semaine en IA, robotique et techno" : "The week in AI, robotics and tech"}</h1>
            <p className="dek mt-3">{e.intro[locale]}</p>
            <ol className="mt-6 border-t-2 border-ink">
              {e.items.map((it, i) => <li key={i} id={`s${i + 1}`}><SheetStory item={it} n={i + 1} /></li>)}
            </ol>
            {e.quick.length > 0 && (
              <section className="mt-8" aria-labelledby="quick">
                <h2 id="quick" className="kicker text-ink pb-1 border-b border-ink">{fr ? "En bref" : "Quick hits"}</h2>
                <ul className="divide-y divide-line">
                  {e.quick.map((q, i) => (
                    <li key={i} className="py-3">
                      <span className="kicker mr-2">{deskLabel(q.desk, locale)}</span>
                      {q.text[locale]}{" "}
                      <a href={q.source.url} target="_blank" rel="noopener" className="text-lake hover:underline">{q.source.name}</a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <p className="meta mt-8">
              {fr
                ? "Choix et rédaction : le rédacteur en chef. Les faits viennent des sources liées; les chiffres d'entreprises sont présentés comme des affirmations. "
                : "Picked and written by the editor. Every fact is on the linked page; company figures are shown as claims. "}
              <Link to="/how-we-use-ai" className="text-lake hover:underline">{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</Link>
            </p>
          </div>
          <aside className="min-w-0"><NewsletterBox /></aside>
        </div>
      </div>
    </PageShell>
  );
}
