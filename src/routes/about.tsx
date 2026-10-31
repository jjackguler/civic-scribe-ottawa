import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Trust";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { editorMailto } from "@/lib/contact";
import { seoHead, absUrl, ORIGIN, organizationLd } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `About AI Broadsheet: who we are, who owns us — ${SITE.name}`, fr: `À propos d'AI Broadsheet : qui nous sommes — ${SITE.name}` },
      description: {
        en: `AI Broadsheet is a bilingual Canadian AI publication, published by GEN:A Labs in Ottawa and edited by ${SITE.editor.name}. Ownership, funding, how we work and how to reach us.`,
        fr: `AI Broadsheet est une publication canadienne bilingue sur l'IA, publiée par GEN:A Labs à Ottawa et dirigée par ${SITE.editor.name}. Propriété, financement, démarche et contact.`,
      },
      breadcrumbs: [{ name: { en: "About", fr: "À propos" }, path: "/about" }],
      jsonLd: locale => [organizationLd(locale), {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        url: absUrl("/about", locale),
        about: { "@id": `${ORIGIN}/#organization` },
        mainEntity: {
          "@type": "Person",
          "@id": `${ORIGIN}/#editor`,
          name: SITE.editor.name,
          alternateName: [...SITE.editor.alternateName],
          jobTitle: SITE.editor.role[locale],
          worksFor: { "@id": `${ORIGIN}/#organization` },
          description: SITE.editor.bio[locale],
        },
      }],
    }),
  component: About,
});

function About() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <div className="container-mw pt-6"><Breadcrumbs items={[{ label: fr ? "À propos" : "About" }]} /></div>
      <header className="container-mw pt-6 pb-10 border-b border-line">
        <p className="kicker">{fr ? "À propos" : "About"}</p>
        <h1 className="hl text-[2.5rem] sm:text-[3.4rem] mt-2 max-w-4xl">{fr ? `À propos d'${SITE.name}` : `About ${SITE.name}`}</h1>
        <p className="font-serif text-[1.25rem] leading-relaxed text-ink/80 mt-4 max-w-[62ch]">
          {fr
            ? "Une publication canadienne indépendante et bilingue sur l'intelligence artificielle et ses effets sur les personnes, portée par le journalisme, le cinéma et de nouvelles formes de récit."
            : "An independent, bilingual Canadian publication about artificial intelligence and its impact on people, told through journalism, filmmaking and new forms of storytelling."}
        </p>
      </header>
      <WhoRunsThis />
      <Ownership />
      <HowWeWork />
      <Contact />
    </PageShell>
  );
}

function WhoRunsThis() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const ed = SITE.editor;
  const mail = editorMailto();
  return (
    <section id="who" className="container-mw mt-12 scroll-mt-28" aria-labelledby="who-h">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <h2 id="who-h" className="hl text-[1.9rem]">{fr ? "Qui dirige ce site" : "Who runs this"}</h2>
        <div className="border-l-[3px] border-ink pl-6">
          <p className="text-[1.3rem] font-bold">{ed.name}</p>
          <p className="kicker mt-1">{pick(ed.role)}</p>
          <p className="font-serif text-[1.12rem] leading-relaxed mt-3">{pick(ed.bio)}</p>
          {mail && <p className="mt-3"><a href={mail} className="text-lake font-semibold underline">{SITE.email.editor}</a></p>}
        </div>
      </div>
    </section>
  );
}

function Ownership() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const pub = SITE.publisher;
  return (
    <section id="ownership" className="container-mw mt-14 scroll-mt-28" aria-labelledby="ownership-h">
      <div className="bg-night text-white p-7 md:p-10 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <div>
          <h2 id="ownership-h" className="hl text-[1.9rem] text-white">{fr ? "Propriété et financement" : "Ownership and funding"}</h2>
          <p className="mt-3 text-white/80">{fr ? `Publié par ${pub.name}, ${pub.city}` : `Published by ${pub.name}, ${pub.city}`}</p>
        </div>
        <div className="font-serif text-[1.1rem] leading-relaxed text-white/90 grid gap-4">
          <p>
            {fr ? `${SITE.name} appartient à ` : `${SITE.name} is owned and published by `}
            <a href={pub.url} rel="noopener" className="font-sans font-semibold text-brass underline">{pub.name}</a>
            {fr
              ? `, une entreprise de ${pub.city} (${pub.region}, ${pub.country}) fondée par ${SITE.editor.name}, qui la publie.`
              : `, a company in ${pub.city}, ${pub.region}, ${pub.country}, founded by ${SITE.editor.name}.`}
          </p>
          <p>{fr
            ? "Aujourd'hui, le site n'affiche aucune publicité payante : la publicité Google est désactivée et aucune campagne directe n'est en cours."
            : "Today the site carries no paid advertising: Google advertising is switched off and no direct campaigns are running."}</p>
          <p>{fr
            ? "Les revenus futurs pourraient venir de commanditaires fondateurs de notre infolettre hebdomadaire et d'annonces clairement identifiées, selon des règles publiées. Les commanditaires ne choisissent ni ne voient jamais notre couverture."
            : "Future revenue may come from founding sponsors of our weekly newsletter and from clearly labelled advertising, under published rules. Sponsors never choose or preview our coverage."}{" "}
            <Link to="/advertise" className="font-sans font-semibold text-brass underline">{fr ? "Commanditaires fondateurs" : "Founding sponsors"}</Link></p>
          <p className="font-sans text-[0.95rem] text-white/80">
            {fr ? "Nos textes « De notre pupitre » sont réalisés dans " : "Our “From our desk” pieces are made in "}
            <a href={SITE.studio.url} rel="noopener" className="font-semibold text-white underline hover:text-brass">{SITE.studio.name}</a>
            {fr ? ", l'application de rédaction de GEN:A Labs." : ", GEN:A Labs' newsroom app."}
            {" "}<a href={pub.url} rel="noopener" className="inline-flex items-center gap-1 font-semibold text-white underline hover:text-brass">buildgena.ca<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </p>
        </div>
      </div>
    </section>
  );
}

function HowWeWork() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  return (
    <section id="how-we-work" className="container-mw mt-14 scroll-mt-28" aria-labelledby="how-we-work-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <h2 id="how-we-work-title" className="hl text-[1.9rem]">{fr ? "Comment nous travaillons" : "How we work"}</h2>
        <div className="prose-mw">
          <p>{fr
            ? "Nous développons Open Desk Journalism, une démarche centrée sur les personnes qui associe jugement éditorial, collaboration et nouvelles formes de récit. Nous nous intéressons à ce que l'IA change dans le travail, les droits et la vie quotidienne, au Canada et ailleurs."
            : "We are developing Open Desk Journalism, a human-centred approach combining editorial judgment, collaboration and new forms of storytelling. Our focus is what AI changes in people's work, rights and everyday lives, in Canada and beyond."}</p>
          <h3 className="font-sans font-bold text-[1.1rem] mt-6 mb-2">{fr ? "Une rédaction dirigée par l'éditeur" : "An editor-led newsroom"}</h3>
          <p>{fr
            ? `Le fondateur et responsable éditorial, ${SITE.editor.name}, définit la ligne éditoriale et les priorités de la publication. Il apporte son expérience du journalisme et du cinéma et répond du travail publié et des corrections. Une petite équipe se constitue progressivement avec des étudiants universitaires bénévoles, autour d'entretiens et de projets journalistiques.`
            : `Founder and editor ${SITE.editor.name} sets the editorial direction and the publication's priorities. He brings together his journalism and filmmaking experience and is responsible for published work and corrections. A small team is taking shape with volunteer university students, beginning with interviews and reporting projects.`}</p>
          <h3 className="font-sans font-bold text-[1.1rem] mt-6 mb-2">{fr ? "Journalisme, IA et création" : "Journalism, AI and creative production"}</h3>
          <p>{fr
            ? "Nous associons articles, entretiens, courts documentaires et explications visuelles. L'IA soutient certaines étapes de recherche, de rédaction, de traduction et de création; chaque élément produit avec son aide est signalé, et la responsabilité éditoriale reste humaine."
            : "We bring together articles, interviews, short documentaries and visual explainers. AI supports parts of our research, writing, translation and creative work; everything made with its help is labelled, and editorial responsibility remains human."}{" "}
            <Link to="/how-we-use-ai" className="text-lake font-semibold underline">{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</Link></p>
          <h3 className="font-sans font-bold text-[1.1rem] mt-6 mb-2">{fr ? "Journalisme immersif" : "Immersive journalism"}</h3>
          <p>{fr
            ? "Nous développons aussi des expériences de journalisme immersif avec Unreal Engine, Blender et des méthodes de création assistées par l'IA. Des événements et des lieux historiques prennent forme en environnements 3D et en récits à 360 degrés. Les reconstitutions sont clairement identifiées."
            : "We are also developing immersive journalism experiences with Unreal Engine, Blender and AI-assisted creative workflows. Historical events and locations take shape as 3D environments and 360-degree narratives. Reconstructions are clearly identified."}{" "}
            <Link to="/immersive" className="text-lake font-semibold underline">{fr ? "Explorer" : "Explore"}</Link></p>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const rows: [string, React.ReactNode][] = [
    [fr ? "Rédaction et corrections" : "Editor and corrections", <a key="e" href={`mailto:${SITE.email.editor}`} className="text-lake font-semibold underline">{SITE.email.editor}</a>],
    [fr ? "Général et commandites" : "General and sponsorship", <a key="g" href={`mailto:${SITE.email.general}`} className="text-lake font-semibold underline">{SITE.email.general}</a>],
    [fr ? "Tuyaux et propositions" : "Tips and pitches", <Link key="t" to="/tips" className="text-lake font-semibold underline">{fr ? "Envoyer un tuyau" : "Send a tip"}</Link>],
    [fr ? "Éditeur" : "Publisher", <a key="p" href={SITE.publisher.url} rel="noopener" className="text-lake font-semibold underline">{SITE.publisher.name} · buildgena.ca</a>],
  ];
  return (
    <section id="contact" className="container-mw mt-14 scroll-mt-28" aria-labelledby="contact-h">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <h2 id="contact-h" className="hl text-[1.9rem]">{fr ? "Nous joindre" : "Contact"}</h2>
        <div>
          <dl className="divide-y divide-line border-y border-line">
            {rows.map(([k, v]) => (
              <div key={k} className="py-3 grid gap-1 sm:grid-cols-[14rem_minmax(0,1fr)]">
                <dt className="text-muted-ink">{k}</dt><dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 font-semibold flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/standards" className="text-lake hover:underline">{fr ? "Normes éditoriales" : "Editorial standards"}</Link>
            <Link to="/corrections" className="text-lake hover:underline">Corrections</Link>
            <Link to="/values" className="text-lake hover:underline">{fr ? "Nos valeurs" : "What we stand for"}</Link>
            <Link to="/terms" className="text-lake hover:underline">{fr ? "Conditions d'utilisation" : "Terms of use"}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
