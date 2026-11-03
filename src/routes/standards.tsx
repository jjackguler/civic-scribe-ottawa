import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/standards")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Editorial standards — ${SITE.name}`, fr: `Normes éditoriales — ${SITE.name}` },
      description: { en: `How ${SITE.name} chooses, credits and corrects the AI news it publishes, and how advertising is kept apart from it.`, fr: `Comment ${SITE.name} choisit, crédite et corrige les nouvelles en IA qu'il publie, et comment la publicité en reste séparée.` },
    }),
  component: Standards,
});

const SECTIONS: { id?: string; alias?: string; h: Bi; p: Bi[] }[] = [
  {
    h: { en: "Editorial leadership", fr: "Direction éditoriale" },
    p: [{ en: "Founder and editor Jack Guler sets the editorial direction and is responsible for the publication's work and corrections. AI Broadsheet brings together journalism, filmmaking and new forms of storytelling, with a focus on how AI affects people.", fr: "Le fondateur et responsable éditorial Jack Guler définit la ligne éditoriale et répond du travail de la publication et des corrections. AI Broadsheet associe journalisme, cinéma et nouvelles formes de récit pour explorer les effets de l'IA sur les personnes." }],
  },
  {
    h: { en: "Accuracy and attribution", fr: "Exactitude et attribution" },
    p: [{ en: "We distinguish facts, attributed claims and opinion. Reporting should support what we publish; uncertainty is acknowledged, and material from other publishers is credited where it appears.", fr: "Nous distinguons les faits, les déclarations attribuées et l'opinion. Les informations publiées doivent être étayées; les incertitudes sont reconnues et les contenus d'autres éditeurs sont crédités là où ils apparaissent." }],
  },
  {
    id: "ai-desk",
    h: { en: "AI and editorial responsibility", fr: "IA et responsabilité éditoriale" },
    p: [{ en: "AI supports parts of our research, writing, translation and creative production. AI-assisted work is identified. Editorial direction and accountability remain human; AI output can contain errors, which readers can report for correction.", fr: "L'IA soutient certaines étapes de recherche, de rédaction, de traduction et de création. Les contenus réalisés avec son aide sont identifiés. La direction et la responsabilité éditoriales restent humaines; les productions de l'IA peuvent contenir des erreurs, que les lecteurs peuvent signaler pour correction." }],
  },
  {
    id: "newsroom",
    alias: "dispatches",
    h: { en: "Newsroom summaries", fr: "Résumés de la rédaction" },
    p: [
      { en: "Newsroom summaries are AI-assisted summaries of reporting by other outlets, or of an organization's own announcement. The reporting belongs to those outlets: every summary names them, links to their originals and is labelled as a summary written with AI. Automated checks compare names, numbers and quotations with the sources; they do not replace human verification.", fr: "Les résumés de la rédaction sont des résumés, rédigés avec l'aide de l'IA, de reportages d'autres médias ou de l'annonce d'une organisation. Le reportage appartient à ces médias : chaque résumé les nomme, renvoie à leurs originaux et est identifié comme un résumé rédigé avec l'IA. Des contrôles automatiques comparent les noms, les chiffres et les citations aux sources; ils ne remplacent pas la vérification humaine." },
      { en: "We call something our own only when we made it: the editor's columns, interviews, videos and immersive projects. Summaries remain the publication's responsibility, and errors in them are corrected like any other.", fr: "Nous ne disons « notre » que pour ce que nous avons fait nous-mêmes : les chroniques de l'éditeur, les entretiens, les vidéos et les projets immersifs. Les résumés restent sous la responsabilité de la publication, et leurs erreurs sont corrigées comme les autres." },
    ],
  },
  {
    h: { en: "Visual and immersive storytelling", fr: "Récits visuels et immersifs" },
    p: [{ en: "We explore short documentaries, visual explainers and immersive journalism. Reconstructions and synthetic media are identified so audiences can understand what they are seeing and hearing.", fr: "Nous explorons les courts documentaires, les explications visuelles et le journalisme immersif. Les reconstitutions et les médias synthétiques sont identifiés pour que le public comprenne ce qu'il voit et entend." }],
  },
  {
    h: { en: "Opinion", fr: "Opinion" },
    p: [{ en: "Opinion is labelled and presented under the author's name, separately from news coverage.", fr: "L'opinion est identifiée et présentée sous le nom de son auteur, séparément de l'actualité." }],
  },
  {
    h: { en: "Editorial independence", fr: "Indépendance éditoriale" },
    p: [{ en: "Advertisers and sponsors do not choose or change our coverage. Advertising and sponsored material must be clearly identified.", fr: "Les annonceurs et commanditaires ne choisissent ni ne modifient notre couverture. Les publicités et les contenus commandités doivent être clairement identifiés." }],
  },
  {
    h: { en: "Corrections", fr: "Corrections" },
    p: [{ en: "Readers can report errors through the story-page link or contact the editor. We correct errors in our own work and record corrections on the corrections page.", fr: "Les lecteurs peuvent signaler une erreur depuis la page d'un article ou contacter l'éditeur. Nous corrigeons les erreurs dans nos propres contenus et consignons les corrections sur la page dédiée." }],
  },
];

function Standards() {
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <PageIntro
        title={locale === "fr" ? "Nos normes éditoriales" : "Our editorial standards"}
        dek={locale === "fr" ? "La confiance est notre seul produit. Voici comment nous la protégeons." : "Trust is the only thing we sell. Here is how we protect it."}
      />
      <div className="container-mw mt-10 max-w-3xl">
        <p className="mb-10 font-serif text-[1.1rem] leading-relaxed border-l-[4px] border-signal pl-4">
          {locale === "fr" ? "Ces normes découlent de nos valeurs : la démocratie, les droits de la personne, l'égale dignité, la liberté de croyance et de conscience — y compris de ne pas croire — et la sécurité des enfants et des familles. " : "These standards follow from our values: democracy, human rights, equal dignity, freedom of belief and conscience — including non-belief — and safety for children and families. "}
          <Link to="/values" className="text-lake font-semibold hover:underline">{locale === "fr" ? "Lire nos valeurs" : "Read what we stand for"}</Link>
        </p>
        {SECTIONS.map(s => (
          <section key={s.h.en} id={s.id} className="mb-10 scroll-mt-24">
            {/* Older links point here by a previous name (#dispatches). */}
            {s.alias && <span id={s.alias} className="block scroll-mt-24" aria-hidden="true" />}
            <h2 className="masthead-serif text-[1.7rem] leading-tight mb-3">{pick(s.h)}</h2>
            <div className="prose-mw">{s.p.map(p => <p key={p.en}>{pick(p)}</p>)}</div>
          </section>
        ))}
        <p className="font-semibold">
          <Link to="/about" className="text-lake hover:underline">{locale === "fr" ? "Notre équipe et notre démarche" : "Our team and approach"}</Link>
          <span className="mx-3 text-line">|</span>
          <Link to="/privacy" className="text-lake hover:underline">{locale === "fr" ? "Confidentialité" : "Privacy"}</Link>
        </p>
      </div>
    </PageShell>
  );
}
