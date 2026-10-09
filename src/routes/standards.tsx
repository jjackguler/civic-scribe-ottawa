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

const SECTIONS: { id?: string; h: Bi; p: Bi[] }[] = [
  {
    h: { en: "Where our news comes from", fr: "D'où viennent nos nouvelles" },
    p: [
      { en: "Every story on AI Broadsheet comes from a named newsroom, lab, government or community source, through its public feed. We show the publisher's headline (or a labelled AI desk headline), a short excerpt and, where we may, the publisher's own photo with credit, and we link to the full article.", fr: "Chaque nouvelle d'AI Broadsheet provient d'une salle de nouvelles, d'un laboratoire, d'un gouvernement ou d'une communauté nommés, par leur fil public. Nous affichons le titre de l'éditeur (ou un titre identifié du pupitre IA), un court extrait et, quand c'est permis, la photo créditée de l'éditeur, avec un lien vers l'article complet." },
      { en: "Videos play in the publisher's own YouTube player. Podcast episodes play from the show's own audio file. Both are credited to the channel or show.", fr: "Les vidéos jouent dans le lecteur YouTube de l'éditeur. Les balados jouent depuis le fichier audio de l'émission. Les deux sont crédités." },
    ],
  },
  {
    h: { en: "How stories are filed", fr: "Comment les nouvelles sont classées" },
    p: [
      { en: "Our software sorts stories into desks using published keyword rules, and groups headlines that describe the same event so you can see every outlet's coverage side by side.", fr: "Notre logiciel classe les nouvelles par section selon des règles de mots-clés et regroupe les titres qui décrivent le même événement, pour comparer la couverture de chaque média." },
      { en: "The lead story is the event the most newsrooms are reporting right now. “Developing” means three or more outlets reported it in the last six hours. “Breaking” means three or more outlets reported it within the last two hours. These labels are counted, never chosen.", fr: "La nouvelle principale est l'événement que le plus de médias rapportent en ce moment. « En développement » signifie qu'au moins trois médias l'ont rapporté dans les six dernières heures. « Dernière heure » signifie qu'au moins trois médias l'ont rapporté dans les deux dernières heures. Ces mentions sont calculées, jamais choisies." },
    ],
  },
  {
    id: "ai-desk",
    h: { en: "The AI desk", fr: "Le pupitre IA" },
    p: [
      { en: "For the stories leading the site, Claude, an AI model made by Anthropic, writes a new headline and a brief of at most two sentences, in English and French. It works only from the headlines and excerpts the publishers themselves published for that story.", fr: "Pour les nouvelles en tête du site, Claude, un modèle d'IA d'Anthropic, rédige un nouveau titre et un résumé d'au plus deux phrases, en anglais et en français. Il travaille uniquement à partir des titres et extraits publiés par les éditeurs pour cette nouvelle." },
      { en: "It may not add any name, number, date, place, quote, motive or consequence that isn't in that text. Before anything is shown, our software checks every number and every name in the new copy against the publishers' text. If one is missing, the copy is thrown away and the publisher's headline stays.", fr: "Il ne peut ajouter aucun nom, chiffre, date, lieu, citation, motif ou conséquence absent de ce texte. Avant tout affichage, notre logiciel vérifie chaque chiffre et chaque nom du nouveau texte dans celui des éditeurs. S'il en manque un, le texte est rejeté et le titre de l'éditeur est conservé." },
      { en: "Every AI desk headline is labelled, the story page shows the publisher's original headline and excerpt, and the link to the original article is always there. If you find an error, use “Report an error”: we correct it and log it.", fr: "Chaque titre du pupitre IA est identifié, la page de la nouvelle affiche le titre et l'extrait originaux de l'éditeur, et le lien vers l'article original est toujours présent. Si vous trouvez une erreur, utilisez « Signaler une erreur » : nous la corrigeons et la consignons." },
    ],
  },
  {
    id: "dispatches",
    h: { en: "Dispatches", fr: "Les dépêches" },
    p: [
      { en: "A Dispatch is an article our desk writes, with AI, when two or more outlets are reporting the same event. The AI model (Claude, made by Anthropic, or Google's Gemini when Claude is unavailable) works only from the headlines and excerpts those outlets published. It adds no background, no reactions and nothing from memory.", fr: "Une dépêche est un article que notre pupitre écrit, avec l'IA, quand au moins deux médias rapportent le même événement. Le modèle d'IA (Claude, d'Anthropic, ou Gemini, de Google, quand Claude n'est pas disponible) travaille uniquement à partir des titres et extraits publiés par ces médias. Il n'ajoute ni contexte, ni réactions, ni rien de mémoire." },
      { en: "Before a dispatch is published, our software checks every number and every name in every part of it, in English and in French, against the outlets' text. One miss and the draft is thrown away. A point is listed as “confirmed” only when two or more outlets report it as fact, or when the company, lab or agency announced it itself; anything else is shown as a claim, in the name of whoever made it. What the reporting leaves open is listed as unknown, never guessed.", fr: "Avant la publication, notre logiciel vérifie chaque chiffre et chaque nom de chaque partie de la dépêche, en anglais et en français, dans le texte des médias. Un seul manque et le texte est rejeté. Un point n'est « confirmé » que si au moins deux médias le rapportent comme un fait, ou si l'entreprise, le laboratoire ou l'organisme l'a annoncé lui-même; sinon, il est présenté comme une affirmation, au nom de son auteur. Ce que les reportages laissent ouvert est indiqué comme inconnu, jamais deviné." },
      { en: "Every dispatch is labelled “Written by the AI Broadsheet desk with AI”, names the outlets it comes from, and links each point and each paragraph to the report it came from. “Listen” uses a synthetic ElevenLabs stock voice, or your browser's own voice. If you find an error, use “Report an error”: we correct it and log it.", fr: "Chaque dépêche porte la mention « Écrit par le pupitre d'AI Broadsheet avec l'IA », nomme les médias dont elle provient et relie chaque point et chaque paragraphe au reportage d'origine. « Écouter » utilise une voix de synthèse ElevenLabs ou la voix de votre navigateur. Si vous trouvez une erreur, utilisez « Signaler une erreur » : nous la corrigeons et la consignons." },
    ],
  },
  {
    h: { en: "Other ways we use Claude", fr: "Autres usages de Claude" },
    p: [
      { en: "Translation: headlines and summaries without an AI desk version are translated for readers of the other language, labelled “Translated with Claude”, with the original shown.", fr: "Traduction : les titres et résumés sans version du pupitre IA sont traduits pour les lecteurs de l'autre langue, avec la mention « Traduit avec Claude » et l'original affiché." },
      { en: "Grouping: Claude checks whether headlines grouped together really report the same event. Funding pages: it flags official pages that may have changed; an editor verifies and updates every listing. Newsletter: it drafts The Morning Broadsheet; an editor reviews every draft before it is sent.", fr: "Regroupement : Claude vérifie si les titres regroupés rapportent vraiment le même événement. Financement : il signale les pages officielles qui ont pu changer; un éditeur vérifie et met à jour chaque fiche. Infolettre : il prépare le Morning Broadsheet; un éditeur relit chaque brouillon avant l'envoi." },
      { en: "Claude never invents news, never writes about a story we don't have from a publisher, and never makes pictures that look like news photos.", fr: "Claude n'invente jamais de nouvelles, n'écrit jamais sur une nouvelle qu'aucun éditeur n'a publiée et ne crée jamais d'images qui ressemblent à des photos de presse." },
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
      { en: `If something on our pages is wrong — a headline filed under the wrong desk, a broken credit, an error in our own writing — use the “Report an error” link on any story page. We fix it and log every correction to our own work, dated, on the corrections page. Errors in a publisher's article belong to that publisher; we'll point you to them.`, fr: `Si quelque chose est inexact sur nos pages — une nouvelle mal classée, un crédit manquant, une erreur dans nos propres textes — utilisez le lien « Signaler une erreur » de chaque page de nouvelle. Nous corrigeons et consignons chaque correction de notre propre travail, datée, sur la page Corrections. Les erreurs dans l'article d'un éditeur relèvent de cet éditeur; nous vous dirigerons vers lui.` },
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
        <p className="mb-10 font-serif text-[1.1rem] leading-relaxed border-l-[4px] border-signal pl-4">
          {locale === "fr" ? "Ces normes découlent de nos valeurs : l'humain d'abord, la dignité de chacun, le respect de la foi et un contenu sûr pour les familles. " : "These standards follow from our values: people first, the dignity of every person, respect for faith and content that is safe for families. "}
          <Link to="/values" className="text-lake font-semibold hover:underline">{locale === "fr" ? "Lire nos valeurs" : "Read what we stand for"}</Link>
        </p>
        {SECTIONS.map(s => (
          <section key={s.h.en} id={s.id} className="mb-10 scroll-mt-24">
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
