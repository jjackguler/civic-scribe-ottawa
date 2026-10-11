import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { VALUES, LENS_LABEL, type Lens } from "@/lib/editorial";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/values")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `What we stand for — ${SITE.name}`, fr: `Nos valeurs — ${SITE.name}` },
      description: {
        en: "AI news grounded in democracy, human rights, equal dignity, freedom of belief and non-belief, children's rights and independent, accountable journalism.",
        fr: "Des nouvelles en IA fondées sur la démocratie, les droits de la personne, l'égale dignité, la liberté de croire ou non, les droits des enfants et un journalisme indépendant et responsable.",
      },
    }),
  component: Values,
});

function Values() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw py-14 sm:py-20">
          <h1 className="masthead-serif text-[2.6rem] sm:text-[4rem] leading-[1.02] max-w-[16ch]">
            {fr ? "Des nouvelles sur l'IA, pour les gens." : "News about AI, for people."}
          </h1>
          <p className="font-serif text-white/80 text-[1.15rem] sm:text-[1.3rem] leading-relaxed mt-5 max-w-[58ch]">
            {fr
              ? "AI Broadsheet est un journal fondé sur la démocratie et les droits universels de la personne. Ces valeurs guident nos rédacteurs, humains comme IA, chaque jour."
              : "AI Broadsheet is a newspaper grounded in democracy and universal human rights. These values guide our writers, human and AI, every day."}
          </p>
        </div>
      </section>

      <div className="container-mw mt-12">
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 max-w-5xl">
        {VALUES.map(v => (
          <section key={v.id} id={v.id} className="border-t-[3px] border-signal pt-4 scroll-mt-24">
            <h2 className="hl text-[1.5rem] sm:text-[1.7rem]">{pick(v.h)}</h2>
            <p className="font-serif text-[1.08rem] leading-relaxed mt-2 text-ink/85">{pick(v.p)}</p>
          </section>
        ))}
        </div>
      </div>

      <section className="container-mw mt-14">
        <div className="bg-ice/60 border border-line p-6 sm:p-8 max-w-5xl">
          <h2 className="hl text-[1.4rem]">{fr ? "Comment ces règles sont appliquées" : "How these rules are applied"}</h2>
          <ul className="mt-3 grid gap-2 font-serif text-[1.05rem] leading-relaxed list-disc pl-5">
            <li>{fr ? "Un filtre écarte le contenu sexuellement explicite; les reportages d'intérêt public sur les abus décrivent le tort et la réponse, sans détails sexuels ou graphiques." : "A filter removes sexually explicit content; public-interest reporting on abuse describes the harm and the response, without sexual or graphic detail."}</li>
            <li>{fr ? "Chaque outil de rédaction IA (titres, dépêches, vidéos, le Gardien, le quiz) reçoit les mêmes consignes : droits de la personne, valeurs démocratiques, égale dignité, liberté de croyance et de conscience, y compris de ne pas croire, et traitement équitable des personnes religieuses et non religieuses. Aucun propos ne doit ridiculiser, rabaisser ou discriminer. Le contenu reste sûr pour les familles, sans peur ni battage." : "Every AI writer (headlines, dispatches, videos, the Keeper, the quiz) gets the same brief: human rights, democratic values, equal dignity, freedom of belief and conscience, including non-belief, and equal treatment of religious and non-religious people. No mockery, demeaning language or discrimination. Content stays family-safe, without fear or hype."}</li>
            <li>{fr ? "Les faits viennent uniquement des reportages cités; chaque nom et chiffre est vérifié. Les textes écrits avec l'IA sont identifiés, et nos erreurs sont corrigées publiquement." : "Facts come only from the reporting we cite; every name and number is checked. AI-written work is labelled, and our errors are corrected in public."}</li>
            <li>{fr ? "Le pupitre « L'humain d'abord » met en avant ce que chaque nouvelle change pour les gens : " : "The People first desk highlights what each story changes for people: "}{(Object.keys(LENS_LABEL) as Lens[]).map(l => pick(LENS_LABEL[l]).toLowerCase()).join(", ")}.</li>
          </ul>
          <p className="mt-4 font-semibold flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/standards" className="text-lake hover:underline">{fr ? "Nos normes éditoriales" : "Our editorial standards"}</Link>
            <Link to="/corrections" className="text-lake hover:underline">{fr ? "Corrections" : "Corrections"}</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
