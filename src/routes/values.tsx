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
        en: "Human-centred AI news: human rights, democracy, the dignity of every person, respect for faith, and content that is safe for families and children.",
        fr: "Des nouvelles en IA centrées sur l'humain : droits de la personne, démocratie, dignité de chacun, respect de la foi et contenu sûr pour les familles et les enfants.",
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
              ? "AI Broadsheet est un journal centré sur l'humain. Voici ce que nous défendons, et les règles que nos rédacteurs, humains comme IA, suivent chaque jour."
              : "AI Broadsheet is a human-centred newspaper. This is what we stand for, and the rules our writers, human and AI, follow every day."}
          </p>
        </div>
      </section>

      <div className="container-mw mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 max-w-5xl">
        {VALUES.map(v => (
          <section key={v.id} id={v.id} className="border-t-[3px] border-signal pt-4 scroll-mt-24">
            <h2 className="hl text-[1.5rem] sm:text-[1.7rem]">{pick(v.h)}</h2>
            <p className="font-serif text-[1.08rem] leading-relaxed mt-2 text-ink/85">{pick(v.p)}</p>
          </section>
        ))}
      </div>

      <section className="container-mw mt-14 max-w-5xl">
        <div className="bg-ice/60 border border-line p-6 sm:p-8">
          <h2 className="hl text-[1.4rem]">{fr ? "Comment ces règles sont appliquées" : "How these rules are applied"}</h2>
          <ul className="mt-3 grid gap-2 font-serif text-[1.05rem] leading-relaxed list-disc pl-5">
            <li>{fr ? "Un filtre écarte automatiquement les nouvelles dont le titre ou l'extrait est sexuellement explicite, avant qu'elles n'arrivent sur le site." : "A filter automatically removes stories whose headline or excerpt is sexually explicit, before they reach the site."}</li>
            <li>{fr ? "Chaque texte écrit avec l'IA (titres, dépêches, vidéos, le Gardien, le quiz) reçoit la même consigne de voix : centrée sur l'humain, respectueuse de chacun et de la foi, sûre pour les familles, sans peur ni battage." : "Every AI writer on the site (headlines, dispatches, videos, the Keeper, the quiz) gets the same voice brief: human-centred, respectful of every person and of faith, family-safe, neither fear nor hype."}</li>
            <li>{fr ? "Ces consignes règlent le ton, jamais les faits : les faits viennent uniquement des reportages cités, et chaque nom et chiffre est vérifié." : "The brief shapes tone, never facts: facts come only from the reporting we cite, and every name and number is checked."}</li>
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
