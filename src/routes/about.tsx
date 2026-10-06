import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { NEWS_SOURCES, NO_FEED_SOURCES, type Kind } from "@/lib/news-sources";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About and standards — ${SITE.name}` },
      { name: "description", content: `How ${SITE.name} finds, checks and credits AI news and funding information for Canadians.` },
    ],
  }),
  component: About,
});

const RULES = [
  {
    en: "We never invent news. Every headline comes from a named publisher's public feed, and every story links to the original.",
    fr: "Nous n'inventons jamais de nouvelles. Chaque manchette provient du fil public d'un éditeur nommé, et chaque article renvoie à l'original.",
  },
  {
    en: "We show short excerpts only, and credit the publisher on every story and every photo. Photos are the publisher's own; if one doesn't load, we show the headline without a picture rather than a stand-in graphic.",
    fr: "Nous n'affichons que de courts extraits et citons l'éditeur sur chaque article et chaque photo. Les photos sont celles de l'éditeur; si l'une ne se charge pas, nous affichons la manchette sans image plutôt qu'un visuel de remplacement.",
  },
  {
    en: "Funding listings are checked against the official program page, with the date we checked. If we're not sure a program is open, we say so.",
    fr: "Les fiches de financement sont vérifiées sur la page officielle du programme, avec la date de vérification. Si nous ne sommes pas sûrs qu'un programme est ouvert, nous le disons.",
  },
  {
    en: "Opinion lives on the Editor's desk and is labelled as opinion. It is never mixed into the news feed.",
    fr: "L'opinion se trouve dans le Mot de la rédaction et est identifiée comme telle. Elle n'est jamais mêlée au fil de nouvelles.",
  },
  {
    en: "Tool recommendations are independent. We don't take payment for listings and we don't quote prices, because they change too often.",
    fr: "Nos recommandations d'outils sont indépendantes. Nous n'acceptons aucun paiement pour y figurer et n'indiquons pas de prix, car ils changent trop souvent.",
  },
];

const KINDS: { id: Kind; label: { en: string; fr: string } }[] = [
  { id: "gov", label: { en: "Governments", fr: "Gouvernements" } },
  { id: "news", label: { en: "Newsrooms", fr: "Salles de nouvelles" } },
  { id: "lab", label: { en: "AI labs", fr: "Laboratoires d'IA" } },
  { id: "analysis", label: { en: "Analysis and newsletters", fr: "Analyses et infolettres" } },
];

function About() {
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <PageIntro title={locale === "fr" ? `À propos de ${SITE.name}` : `About ${SITE.name}`} dek={pick(SITE.description)} />
      <div className="container-mw mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section>
          <h2 className="hl text-[1.8rem] pb-2 mb-4 border-b-[3px] border-ink">{locale === "fr" ? "Nos règles" : "Our standards"}</h2>
          <ul className="prose-mw">
            {RULES.map((r, i) => <li key={i}>{pick(r)}</li>)}
          </ul>
        </section>
        <section>
          <h2 className="hl text-[1.8rem] pb-2 mb-4 border-b-[3px] border-ink">{locale === "fr" ? "Nos sources" : "Where the news comes from"}</h2>
          {KINDS.map(k => {
            const list = NEWS_SOURCES.filter(s => s.kind === k.id);
            const seen = new Set<string>();
            return (
              <div key={k.id} className="mb-6">
                <h3 className="font-bold mb-1">{pick(k.label)}</h3>
                <ul className="text-[0.95rem] leading-relaxed">
                  {list.filter(s => !seen.has(s.name) && seen.add(s.name)).map(s => (
                    <li key={s.id}><a href={s.home} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a></li>
                  ))}
                </ul>
              </div>
            );
          })}
          <h3 className="font-bold mb-1">{locale === "fr" ? "Suivis sans fil RSS public" : "Followed, no public feed"}</h3>
          <ul className="text-[0.95rem] leading-relaxed">
            {NO_FEED_SOURCES.map(s => <li key={s.name}><a href={s.home} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a></li>)}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
