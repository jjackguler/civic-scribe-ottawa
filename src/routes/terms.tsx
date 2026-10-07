import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { ProseSections, type ProseSection } from "@/components/ProseSections";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

const UPDATED = "2026-10-07";

export const Route = createFileRoute("/terms")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Terms of use — ${SITE.name}`, fr: `Conditions d'utilisation — ${SITE.name}` },
      description: {
        en: `The terms for reading and sharing ${SITE.name}: publishers own their content, we link to the originals, and Ontario law applies.`,
        fr: `Les conditions pour lire et partager ${SITE.name} : les éditeurs sont propriétaires de leur contenu, nous renvoyons aux originaux, et le droit de l'Ontario s'applique.`,
      },
    }),
  component: Terms,
});

function Terms() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const pub = SITE.publisher;
  const items: ProseSection[] = [
    {
      h: { en: "Who publishes this site", fr: "Qui publie ce site" },
      p: [{
        en: `${SITE.name} is published by ${pub.name}, ${pub.city}, ${pub.region}, ${pub.country}. By using the site you agree to these terms.`,
        fr: `${SITE.name} est publié par ${pub.name}, ${pub.city} (${pub.region}), ${pub.country}. En utilisant le site, vous acceptez ces conditions.`,
      }],
    },
    {
      h: { en: "Publishers own their content", fr: "Les éditeurs sont propriétaires de leur contenu" },
      p: [
        {
          en: "Headlines, short excerpts, photos, videos and podcast episodes shown here belong to the publishers credited with them. We show them to point readers to the original, and every story links to it. We don't claim any right in that content.",
          fr: "Les titres, courts extraits, photos, vidéos et épisodes de balados présentés ici appartiennent aux éditeurs crédités. Nous les présentons pour diriger les lecteurs vers l'original, et chaque nouvelle y renvoie. Nous ne revendiquons aucun droit sur ce contenu.",
        },
        {
          en: "If you are a publisher and want your content shown differently or removed, contact us and we will act promptly.",
          fr: "Si vous êtes un éditeur et souhaitez que votre contenu soit présenté autrement ou retiré, écrivez-nous et nous agirons rapidement.",
        },
      ],
    },
    {
      h: { en: "Our own writing", fr: "Nos propres textes" },
      p: [{
        en: `Editorials, guides, funding entries and page text written by ${SITE.name} are © ${pub.name}. You may quote short passages with a link back; please ask before republishing a whole piece.`,
        fr: `Les éditoriaux, guides, fiches de financement et textes rédigés par ${SITE.name} sont © ${pub.name}. Vous pouvez citer de courts passages avec un lien; demandez-nous avant de republier un texte entier.`,
      }],
    },
    {
      h: { en: "Translations", fr: "Traductions" },
      p: [{
        en: "Some headlines and excerpts are translated with Claude, an AI model, and are labelled “Translated with Claude”. The publisher's original wording is the reference; we show it alongside and link to it.",
        fr: "Certains titres et extraits sont traduits avec Claude, un modèle d'IA, et portent la mention « Traduit avec Claude ». Le texte original de l'éditeur fait foi; nous l'affichons à côté et y renvoyons.",
      }],
    },
    {
      h: { en: "No warranty", fr: "Aucune garantie" },
      p: [{
        en: "We work to keep the site accurate and available, but it is provided as is, without warranty of any kind. Nothing here is legal, financial or professional advice. Funding programs and deadlines change: always confirm on the official page before you apply or act. To the extent the law allows, we are not liable for losses arising from use of the site or of sites we link to.",
        fr: "Nous travaillons à garder le site exact et accessible, mais il est fourni tel quel, sans garantie d'aucune sorte. Rien ici ne constitue un conseil juridique, financier ou professionnel. Les programmes de financement et les dates limites changent : confirmez toujours sur la page officielle avant d'agir. Dans la mesure permise par la loi, nous ne sommes pas responsables des pertes découlant de l'utilisation du site ou des sites vers lesquels nous renvoyons.",
      }],
    },
    {
      h: { en: "Links and other sites", fr: "Liens et autres sites" },
      p: [{
        en: "Stories, videos and podcasts open on, or play from, other sites. Those sites have their own terms and privacy policies, and we are not responsible for them.",
        fr: "Les nouvelles, vidéos et balados s'ouvrent ou sont diffusés depuis d'autres sites, qui ont leurs propres conditions et politiques de confidentialité. Nous n'en sommes pas responsables.",
      }],
    },
    {
      h: { en: "Advertising", fr: "Publicité" },
      p: [
        {
          en: "Ads are labelled “Advertisement” and sponsored content is labelled “Sponsored”. Advertisers have no say over our coverage.",
          fr: "Les publicités portent la mention « Publicité » et le contenu commandité la mention « Commandité ». Les annonceurs n'ont aucun droit de regard sur notre couverture.",
        },
        <Link key="std" to="/standards" className="text-lake font-semibold hover:underline">{fr ? "Nos normes éditoriales" : "Our editorial standards"}</Link>,
      ],
    },
    {
      h: { en: "Governing law", fr: "Droit applicable" },
      p: [{
        en: "These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply there. Any dispute will be heard by the courts of Ontario.",
        fr: "Ces conditions sont régies par les lois de la province de l'Ontario et les lois fédérales du Canada qui s'y appliquent. Tout litige relève des tribunaux de l'Ontario.",
      }],
    },
    {
      h: { en: "Changes and contact", fr: "Modifications et contact" },
      p: [
        {
          en: `We may update these terms; the date below shows the latest version. Last updated ${UPDATED}.`,
          fr: `Nous pouvons modifier ces conditions; la date ci-dessous indique la dernière version. Dernière mise à jour : ${UPDATED}.`,
        },
        ...(SITE.email.editor
          ? [{ en: `Questions: ${SITE.email.editor}.`, fr: `Questions : ${SITE.email.editor}.` }]
          : []),
      ],
    },
  ];
  return (
    <PageShell>
      <PageIntro title={fr ? "Conditions d'utilisation" : "Terms of use"} dek={fr ? "Des règles simples pour lire, partager et citer le site." : "Plain rules for reading, sharing and quoting the site."} />
      <ProseSections items={items} />
    </PageShell>
  );
}
