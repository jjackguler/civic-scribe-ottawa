import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { NewsletterBox } from "@/components/NewsletterBox";
import { Breadcrumbs, PublishedBy } from "@/components/Trust";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { FOUNDING_SPONSORS } from "@/lib/ads";
import { seoHead, faqLd } from "@/lib/seo";

const FAQ: { q: Bi; a: Bi }[] = [
  {
    q: { en: "When does it start?", fr: "Quand commence-t-elle?" },
    a: { en: "With issue #1. Everyone who signs up before then gets the first issue, and every issue after it, once a week.", fr: "Avec le numéro 1. Toutes les personnes inscrites d'ici là recevront le premier numéro, puis un numéro chaque semaine." },
  },
  {
    q: { en: "Is any of it written with AI?", fr: "Une partie est-elle rédigée avec l'IA?" },
    a: { en: "Some items are drafted with AI assistance. Each one is labelled, cites its sources, and is approved by a human editor before it is sent. See How we use AI.", fr: "Certains éléments sont rédigés avec l'aide de l'IA. Chacun est signalé, cite ses sources et est approuvé par un responsable éditorial humain avant l'envoi. Voir Comment nous utilisons l'IA." },
  },
  {
    q: { en: "Will there be sponsors?", fr: "Y aura-t-il des commanditaires?" },
    a: { en: "Possibly one founding sponsor per issue, clearly labelled and set apart from the journalism. Sponsors never choose or see our coverage in advance.", fr: "Peut-être un commanditaire fondateur par numéro, clairement identifié et séparé du contenu journalistique. Les commanditaires ne choisissent ni ne voient jamais notre couverture à l'avance." },
  },
  {
    q: { en: "How do I stop it?", fr: "Comment me désabonner?" },
    a: { en: "Use the unsubscribe link at the bottom of any issue, or write to us. We act on it right away.", fr: "Utilisez le lien de désabonnement au bas de n'importe quel numéro, ou écrivez-nous. Nous y donnons suite immédiatement." },
  },
];

export const Route = createFileRoute("/newsletter")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `The Canadian AI Brief: weekly AI newsletter — ${SITE.name}`, fr: `Le Brief canadien de l'IA : infolettre hebdomadaire — ${SITE.name}` },
      description: {
        en: "A free weekly email on what changed in artificial intelligence and what it means for Canada. Named sources, AI-assisted work labelled, unsubscribe in one click.",
        fr: "Une infolettre gratuite chaque semaine : ce qui a changé en intelligence artificielle et ce que cela signifie pour le Canada. Sources nommées, désabonnement en un clic.",
      },
      breadcrumbs: [{ name: { en: "Newsletter", fr: "Infolettre" }, path: "/newsletter" }],
      jsonLd: locale => [faqLd(locale, FAQ)],
    }),
  component: Newsletter,
});

function Newsletter() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const inside: { h: Bi; p: Bi }[] = [
    { h: { en: "The week in AI, for Canada", fr: "La semaine en IA, pour le Canada" }, p: { en: "The developments that matter most, and what they change for people, workers and organisations here.", fr: "Les faits marquants, et ce qu'ils changent pour les gens, les travailleurs et les organisations d'ici." } },
    { h: { en: "Policy and public money", fr: "Politiques et fonds publics" }, p: { en: "What Ottawa, the provinces and cities announced on AI, with links to the official pages.", fr: "Ce qu'Ottawa, les provinces et les villes ont annoncé sur l'IA, avec les liens vers les pages officielles." } },
    { h: { en: "From our desk", fr: "De notre pupitre" }, p: { en: "Our own explainers and summaries: AI-assisted where noted, always sourced, approved by an editor.", fr: "Nos explications et résumés : assistés par l'IA lorsque c'est indiqué, toujours sourcés, approuvés par un responsable éditorial." } },
    { h: { en: "One thing to try", fr: "Une chose à essayer" }, p: { en: "A guide, a tool or a funding program worth your time, checked against its official page.", fr: "Un guide, un outil ou un programme de financement qui vaut le détour, vérifié auprès de sa page officielle." } },
  ];
  return (
    <PageShell>
      <div className="container-mw pt-6">
        <Breadcrumbs items={[{ label: fr ? "Infolettre" : "Newsletter" }]} />
      </div>
      <section className="container-mw pt-6 pb-12 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start">
        <div className="max-w-2xl">
          <NewsletterBox variant="page" />
        </div>
        <aside className="lg:border-l lg:border-line lg:pl-10">
          <h2 className="kicker">{fr ? "Dans chaque numéro" : "In every issue"}</h2>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {inside.map((x, i) => (
              <li key={x.h.en} className="py-4 grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span className="hl text-[1.5rem] text-brass-ink leading-none" aria-hidden="true">{i + 1}</span>
                <span>
                  <span className="block font-bold">{pick(x.h)}</span>
                  <span className="block font-serif text-[1.02rem] text-muted-ink leading-snug mt-0.5">{pick(x.p)}</span>
                </span>
              </li>
            ))}
          </ol>
          {FOUNDING_SPONSORS.length > 0 && (
            <div className="mt-6">
              <h2 className="kicker">{fr ? "Commanditaires fondateurs" : "Founding sponsors"}</h2>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                {FOUNDING_SPONSORS.map(s => <li key={s.name}><a href={s.url} rel="noopener sponsored" className="underline hover:text-lake">{s.name}</a></li>)}
              </ul>
            </div>
          )}
          <p className="mt-4 text-[0.9rem] text-muted-ink"><PublishedBy />. {fr ? "Aucun numéro n'a encore été envoyé : le numéro 1 est en préparation." : "No issue has been sent yet: issue #1 is in preparation."}</p>
        </aside>
      </section>

      <section className="bg-surface border-y border-line">
        <div className="container-mw py-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <h2 className="hl text-[1.8rem]">{fr ? "Questions fréquentes" : "Questions"}</h2>
            <p className="font-serif text-[1.05rem] text-muted-ink mt-2 max-w-[40ch]">
              {fr ? "Vous voulez commanditer le numéro 1? " : "Want to sponsor issue #1? "}
              <Link to="/advertise" className="text-lake font-semibold underline">{fr ? "Commanditaires fondateurs" : "Founding sponsors"}</Link>
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {FAQ.map(f => (
              <div key={f.q.en} className="py-4">
                <dt className="font-bold">{pick(f.q)}</dt>
                <dd className="font-serif text-[1.05rem] leading-relaxed text-ink/85 mt-1">{pick(f.a)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </PageShell>
  );
}
