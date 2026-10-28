import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { editorMailto } from "@/lib/contact";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `About — ${SITE.name}`, fr: `À propos — ${SITE.name}` },
      description: { en: `Meet the editor and the team behind ${SITE.name}, and discover our human-centred approach to AI and immersive journalism.`, fr: `Découvrez l'éditeur et l'équipe d'${SITE.name}, ainsi que notre approche humaine de l'IA et du journalisme immersif.` },
    }),
  component: About,
});

function About() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageIntro
        title={locale === "fr" ? `À propos d'${SITE.name}` : `About ${SITE.name}`}
        dek={locale === "fr"
          ? "Une publication indépendante consacrée à l'IA et à ses effets sur les personnes, portée par le journalisme, le cinéma et de nouvelles formes de récit."
          : "An independent publication exploring AI and its impact on people through journalism, filmmaking and new forms of storytelling."}
      />
      <WhoRunsThis />
      <HowWeWork />
    </PageShell>
  );
}

function HowWeWork() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  return (
    <section id="how-we-work" className="container-mw mt-10 scroll-mt-28" aria-labelledby="how-we-work-title">
      <h2 id="how-we-work-title" className="masthead-serif text-[1.8rem] pb-2 mb-4 border-b-[3px] border-night">{fr ? "Comment nous travaillons" : "How we work"}</h2>
      <div className="prose-mw max-w-3xl">
        <p>{fr
          ? "Nous développons Open Desk Journalism, une démarche centrée sur les personnes qui associe jugement éditorial, collaboration et nouvelles formes de récit. Nous nous intéressons à ce que l'IA change dans le travail, les droits et la vie quotidienne."
          : "We are developing Open Desk Journalism, a human-centred approach combining editorial judgment, collaboration and new forms of storytelling. Our focus is what AI changes in people's work, rights and everyday lives."}</p>
        <h3 className="font-sans font-bold text-[1.1rem] mt-6 mb-2">{fr ? "Une rédaction dirigée par l'éditeur" : "An editor-led newsroom"}</h3>
        <p>{fr
          ? "Le fondateur et responsable éditorial, Jack Guler, définit la ligne éditoriale et les priorités de la publication. Il apporte son expérience du journalisme et du cinéma et répond du travail publié et des corrections. Une petite équipe se constitue progressivement avec des étudiants universitaires bénévoles, autour d'entretiens et de projets journalistiques."
          : "Founder and editor Jack Guler sets the editorial direction and the publication's priorities. He brings together his journalism and filmmaking experience and is responsible for published work and corrections. A small team is taking shape with volunteer university students, beginning with interviews and reporting projects."}</p>
        <h3 className="font-sans font-bold text-[1.1rem] mt-6 mb-2">{fr ? "Journalisme et création" : "Journalism and creative production"}</h3>
        <p>{fr
          ? "Nous associons articles, entretiens, courts documentaires et explications visuelles. L'IA soutient certaines étapes de recherche et de création; la direction éditoriale et la responsabilité restent humaines."
          : "We bring together articles, interviews, short documentaries and visual explainers. AI supports parts of our research and creative work, while editorial direction and responsibility remain human."}</p>
        <h3 className="font-sans font-bold text-[1.1rem] mt-6 mb-2">{fr ? "Journalisme immersif" : "Immersive journalism"}</h3>
        <p>{fr
          ? "Nous développons aussi des expériences de journalisme immersif avec Unreal Engine, Blender et des méthodes de création assistées par l'IA. Des événements et des lieux historiques prennent forme en environnements 3D réalistes et en récits à 360 degrés, pour permettre au public d'explorer le contexte d'une histoire. Les reconstitutions sont clairement identifiées."
          : "We are also developing immersive journalism experiences with Unreal Engine, Blender and AI-assisted creative workflows. Historical events and locations take shape as realistic 3D environments and 360-degree narratives, inviting audiences to explore a story's context. Reconstructions are clearly identified."}</p>
        <p className="font-sans">
          <Link to="/standards" className="text-lake font-semibold hover:underline">{fr ? "Nos normes éditoriales" : "Our editorial standards"}</Link>
          {" · "}
          <Link to="/corrections" className="text-lake font-semibold hover:underline">{fr ? "Corrections" : "Corrections"}</Link>
          {" · "}
          <Link to="/immersive" className="text-lake font-semibold hover:underline">{fr ? "Explorer le journalisme immersif" : "Explore immersive journalism"}</Link>
        </p>
      </div>
    </section>
  );
}

/** Who publishes and edits the site. Editor details appear once they are set in site.ts. */
function WhoRunsThis() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const ed = SITE.editor;
  const pub = SITE.publisher;
  const mail = editorMailto();
  return (
    <section className="container-mw mt-10" aria-labelledby="who">
      <div className="bg-night text-white p-7 md:p-9 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start">
        <div>
          <h2 id="who" className="masthead-serif text-[1.9rem] leading-tight text-brass">{fr ? "Qui dirige ce site" : "Who runs this"}</h2>
          <p className="font-serif text-white/80 text-[1.1rem] leading-relaxed mt-2">
            {fr
              ? `${SITE.name} est publié par ${pub.name}, à ${pub.city}, ${pub.country}.`
              : `${SITE.name} is published by ${pub.name} in ${pub.city}, ${pub.country}.`}
          </p>
        </div>
        <div className="font-serif text-[1.1rem] leading-relaxed">
          {ed.name ? (
            <>
              <p className="font-sans font-bold text-[1.25rem]">{ed.name}</p>
              {pick(ed.role) && <p className="text-brass font-sans font-semibold">{pick(ed.role)}</p>}
              {pick(ed.bio) && <p className="text-white/80 mt-2">{pick(ed.bio)}</p>}
            </>
          ) : (
            <p className="text-white/80">
              {fr
                ? "La direction éditoriale définit les priorités de la publication et répond du travail publié et des corrections."
                : "Editorial leadership sets the publication’s priorities and is responsible for published work and corrections."}
            </p>
          )}
          {mail && (
            <p className="mt-3"><a href={mail} className="text-brass font-sans font-semibold hover:underline">{SITE.email.editor}</a></p>
          )}
          <p className="mt-3 font-sans text-[0.95rem]">
            <Link to="/corrections" className="text-white/85 underline hover:text-white">{fr ? "Corrections" : "Corrections"}</Link>
            {"  "}
            <Link to="/terms" className="ml-4 text-white/85 underline hover:text-white">{fr ? "Conditions d'utilisation" : "Terms of use"}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
