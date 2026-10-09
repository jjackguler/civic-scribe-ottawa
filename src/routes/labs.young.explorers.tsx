import { createFileRoute } from "@tanstack/react-router";
import { GroupPage } from "@/components/young/GroupPage";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/labs/young/explorers")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Explorers (ages 8 to 12): Young Lab — ${SITE.name}`, fr: `Explorateurs (8 à 12 ans) : Jeune Labo — ${SITE.name}` },
      description: {
        en: "Five in-browser games about AI for ages 8 to 12: AI or not, teach the machine, spot the fake, prompt kitchen and fair or unfair. No account, no data collected.",
        fr: "Cinq jeux sur l'IA pour les 8 à 12 ans : IA ou pas, entraîne la machine, repère le faux, cuisine des requêtes et juste ou injuste. Sans compte, sans collecte de données.",
      },
    }),
  component: ExplorersPage,
});

function ExplorersPage() {
  return <GroupPage group="explorers" />;
}
