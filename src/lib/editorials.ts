import type { Bi } from "./i18n";

/**
 * Editor's desk — opinion and analysis written by the site's editor.
 *
 * To publish a new column (for example, one of your LinkedIn articles):
 * add an object to the top of EDITORIALS with a unique slug, today's date,
 * the title, a one-sentence dek, and the body as a list of paragraphs.
 * French is optional — leave `fr` equal to `en` until a translation exists.
 */
export type Editorial = {
  slug: string;
  date: string; // YYYY-MM-DD
  title: Bi;
  dek: Bi;
  body: Bi[];
};

export const EDITORIALS: Editorial[] = [
  {
    slug: "a-newsroom-of-one",
    date: "2026-10-06",
    title: {
      en: "A newsroom of one, built like a broadcaster",
      fr: "Une salle de rédaction d'une personne, bâtie comme un diffuseur",
    },
    dek: {
      en: "AI Broadsheet is a test of an idea: with the right tools and strict rules, one editor can run a live, trustworthy AI newspaper.",
      fr: "AI Broadsheet met une idée à l'épreuve : avec les bons outils et des règles strictes, un seul éditeur peut faire vivre un journal de l'IA fiable et en direct.",
    },
    body: [
      {
        en: "Artificial intelligence is now the busiest beat in news. Every hour brings a model release, a funding round, a lawsuit, a government announcement, a video demo, a three-hour interview. Big newsrooms put whole teams on it. Most readers still can't find one place that shows them all of it, calmly, with the sources in plain view.",
        fr: "L'intelligence artificielle est devenue le sujet le plus chargé de l'actualité. Chaque heure apporte un nouveau modèle, une levée de fonds, une poursuite, une annonce gouvernementale, une démo vidéo, une entrevue de trois heures. Les grandes rédactions y consacrent des équipes entières. La plupart des lecteurs ne trouvent toujours pas un seul endroit qui montre tout cela calmement, avec les sources bien en vue.",
      },
      {
        en: "AI Broadsheet follows dozens of newsrooms, AI labs, governments, broadcasters' video channels and podcasts around the clock. The front page leads with the story the most outlets are reporting, and every story page puts their coverage side by side so you can compare.",
        fr: "AI Broadsheet suit en continu des dizaines de salles de nouvelles, laboratoires d'IA, gouvernements, chaînes vidéo et balados. La une s'ouvre sur la nouvelle que le plus de médias rapportent, et chaque page d'article place leur couverture côte à côte pour que vous puissiez comparer.",
      },
      {
        en: "The rules are what make it trustworthy. Software sorts the news; it never writes it. Every headline comes from a named publisher and links to the original. Every photo and video is credited. Opinion lives here, on the editor's desk, and nowhere else. Advertising pays for the work and never touches it.",
        fr: "Ce sont les règles qui rendent le tout fiable. Le logiciel classe les nouvelles; il ne les écrit jamais. Chaque titre vient d'un éditeur nommé et renvoie à l'original. Chaque photo et vidéo est créditée. L'opinion se trouve ici, au mot de la rédaction, et nulle part ailleurs. La publicité finance le travail sans jamais y toucher.",
      },
      {
        en: "Tell us what we're missing — a source we should follow, a desk we should add, a story we filed in the wrong place. A newsroom of one depends on its readers.",
        fr: "Dites-nous ce qui manque — une source à suivre, une section à ajouter, une nouvelle mal classée. Une salle de rédaction d'une personne compte sur ses lecteurs.",
      },
    ],
  },
];

export function formatDate(iso: string, locale: "en" | "fr") {
  return new Date(iso + "T12:00:00Z").toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}
