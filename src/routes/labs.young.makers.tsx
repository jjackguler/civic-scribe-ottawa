import { createFileRoute } from "@tanstack/react-router";
import { GroupPage } from "@/components/young/GroupPage";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/labs/young/makers")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Makers (ages 13 to 17): Young Lab — ${SITE.name}`, fr: `Créateurs (13 à 17 ans) : Jeune Labo — ${SITE.name}` },
      description: {
        en: "For ages 13 to 17: run a tiny language model, check your privacy, build a rule-based bot, explore AI careers, and find free courses we checked.",
        fr: "Pour les 13 à 17 ans : fais tourner un mini modèle de langage, fais ton bilan de confidentialité, bâtis un robot à règles, explore les métiers de l'IA et des cours gratuits vérifiés.",
      },
    }),
  component: MakersPage,
});

function MakersPage() {
  return <GroupPage group="makers" />;
}
