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

const SECTIONS: { h: Bi; p: Bi[] }[] = [
  {
    h: { en: "Where our news comes from", fr: "D'où viennent nos nouvelles" },
    p: [
      { en: "Every story on AI Broadsheet comes from a named newsroom, lab, government or community source, through its public feed. We show the publisher's headline, a short excerpt and the publisher's own photo with credit, and we link to the full article.", fr: "Chaque nouvelle d'AI Broadsheet provient d'une salle de nouvelles, d'un laboratoire, d'un gouvernement ou d'une communauté nommés, par leur fil public. Nous affichons le titre de l'éditeur, un court extrait et sa photo créditée, avec un lien vers l'article complet." },
      { en: "Videos play in the publisher's own YouTube player. Podcast episodes play from the show's own audio file. Both are credited to the channel or show.", fr: "Les vidéos jouent dans le lecteur YouTube de l'éditeur. Les balados jouent depuis le fichier audio de l'émission. Les deux sont crédités." },
    ],
  },
  {
    h: { en: "Software files stories; it doesn't write them", fr: "Le logiciel classe les nouvelles; il ne les écrit pas" },
    p: [
      { en: "Headlines are never rewritten. Our software sorts stories into desks using published keyword rules, and groups headlines that describe the same event so you can see every outlet's coverage side by side. Machine translations are labelled on every item and link to the original.", fr: "Les titres ne sont jamais réécrits. Notre logiciel classe les nouvelles par section selon des règles de mots-clés et regroupe les titres qui décrivent le même événement, pour comparer la couverture de chaque média. Les traductions automatiques sont identifiées sur chaque article et renvoient à l'original." },
      { en: "The lead story is the event the most newsrooms are reporting right now. “Developing” means three or more outlets reported it in the last six hours.", fr: "La nouvelle principale est l'événement que le plus de médias rapportent en ce moment. « En développement » signifie qu'au moins trois médias l'ont rapporté dans les six dernières heures." },
    ],
  },
  {
    h: { en: "How we use Claude", fr: "Comment nous utilisons Claude" },
    p: [
      { en: "We use Claude, an AI model made by Anthropic, for exactly four things:", fr: "Nous utilisons Claude, un modèle d'IA d'Anthropic, pour exactement quatre choses :" },
      { en: "1. Translation. English headlines and summaries are translated for French readers, and French ones for English readers. Every translated item is labelled “Translated with Claude”, shows the original headline, and links to the publisher.", fr: "1. Traduction. Les titres et résumés anglais sont traduits pour les lecteurs francophones, et inversement. Chaque élément traduit porte la mention « Traduit avec Claude », affiche le titre original et renvoie à l'éditeur." },
      { en: "2. Grouping. Claude checks whether headlines our software grouped together really report the same event, and separates the ones that don't. It only groups; it writes nothing.", fr: "2. Regroupement. Claude vérifie si les titres regroupés par notre logiciel rapportent vraiment le même événement, et sépare ceux qui ne le font pas. Il ne fait que regrouper; il n'écrit rien." },
      { en: "3. Funding-page change detection. Claude compares official program pages with our funding listings and tells an editor what may need re-checking. It never edits a listing; an editor verifies and updates it.", fr: "3. Détection des changements sur les pages de financement. Claude compare les pages officielles des programmes avec nos fiches et signale à la rédaction ce qui pourrait devoir être revérifié. Il ne modifie jamais une fiche; un éditeur vérifie et la met à jour." },
      { en: "4. Newsletter drafting. Claude drafts The Morning Broadsheet from publisher headlines and summaries. An editor reviews every draft before it is sent.", fr: "4. Rédaction de l'infolettre. Claude prépare un brouillon du Morning Broadsheet à partir des titres et résumés des éditeurs. Un éditeur relit chaque brouillon avant l'envoi." },
      { en: "Claude never writes, rewrites or invents news. Headlines and photos remain the publishers' own. Every Claude output is labelled or reviewed by a human editor before publication.", fr: "Claude n'écrit, ne réécrit et n'invente jamais de nouvelles. Les titres et les photos restent ceux des éditeurs. Chaque production de Claude est identifiée ou relue par un éditeur avant publication." },
    ],
  },
  {
    h: { en: "Headlines by our editors", fr: "Titres de la rédaction" },
    p: [
      { en: "Sometimes an editor writes a sharper headline for a big story. We do that only after reading the original article, we keep it true to the reporting, and the story page always shows the publisher's original headline.", fr: "Il arrive qu'un éditeur écrive un titre plus percutant pour une grande nouvelle. Nous le faisons seulement après avoir lu l'article original, en restant fidèles au reportage, et la page de l'article affiche toujours le titre original." },
    ],
  },
  {
    h: { en: "Opinion", fr: "Opinion" },
    p: [
      { en: "Opinion appears only on the Editor's desk, under the author's name, and is never mixed into the news feed.", fr: "L'opinion paraît seulement dans le Mot de la rédaction, sous le nom de l'auteur, et n'est jamais mêlée au fil de nouvelles." },
    ],
  },
  {
    h: { en: "Advertising and sponsorship", fr: "Publicité et commandites" },
    p: [
      { en: "Advertisers never choose, change or preview our coverage. Ads are labelled “Advertisement”; sponsored content is labelled “Sponsored” and is never placed in the news feed.", fr: "Les annonceurs ne choisissent, ne modifient ni ne voient jamais notre couverture à l'avance. Les publicités portent la mention « Publicité »; le contenu commandité porte la mention « Commandité » et n'est jamais placé dans le fil de nouvelles." },
    ],
  },
  {
    h: { en: "Corrections", fr: "Corrections" },
    p: [
      { en: `If something on our pages is wrong — a headline filed under the wrong desk, a broken credit, an error in our own writing — email ${SITE.email.editor}. We fix it and note the correction on anything we wrote ourselves. Errors in a publisher's article belong to that publisher; we'll point you to them.`, fr: `Si quelque chose est inexact sur nos pages — une nouvelle mal classée, un crédit manquant, une erreur dans nos propres textes — écrivez à ${SITE.email.editor}. Nous corrigeons et signalons la correction sur nos propres textes. Les erreurs dans l'article d'un éditeur relèvent de cet éditeur; nous vous dirigerons vers lui.` },
    ],
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
        {SECTIONS.map(s => (
          <section key={s.h.en} className="mb-10">
            <h2 className="masthead-serif text-[1.7rem] leading-tight mb-3">{pick(s.h)}</h2>
            <div className="prose-mw">{s.p.map(p => <p key={p.en}>{pick(p)}</p>)}</div>
          </section>
        ))}
        <p className="font-semibold">
          <Link to="/about" className="text-lake hover:underline">{locale === "fr" ? "Toutes nos sources" : "Every source we follow"}</Link>
          <span className="mx-3 text-line">|</span>
          <Link to="/privacy" className="text-lake hover:underline">{locale === "fr" ? "Confidentialité" : "Privacy"}</Link>
        </p>
      </div>
    </PageShell>
  );
}
