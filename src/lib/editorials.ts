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
    slug: "why-maple-wire",
    date: "2026-10-06",
    title: {
      en: "Why we started an AI news wire for Canadians",
      fr: "Pourquoi nous avons lancé un fil de presse IA pour les Canadiens",
    },
    dek: {
      en: "AI is changing work, public services and everyday life faster than most of us can follow. Canadians deserve one calm place to keep up.",
      fr: "L'IA transforme le travail, les services publics et la vie quotidienne plus vite que nous ne pouvons suivre. Les Canadiens méritent un endroit calme pour s'y retrouver.",
    },
    body: [
      {
        en: "Every week brings a new model, a new government program, a new warning. Most coverage is written for engineers or investors. Very little of it answers the questions people actually ask: what does this mean for my job, my business, my family — and is there help available?",
        fr: "Chaque semaine apporte un nouveau modèle, un nouveau programme public, un nouvel avertissement. La plupart des reportages s'adressent aux ingénieurs ou aux investisseurs. Peu répondent aux vraies questions : qu'est-ce que cela change pour mon emploi, mon entreprise, ma famille — et existe-t-il de l'aide?",
      },
      {
        en: "Maple Wire gathers AI news from Canadian and international publishers, always linking back to the original reporting. Next to the headlines, we keep a plain-language list of public funding for AI projects, a short list of tools worth trying, and guides that assume no technical background.",
        fr: "Maple Wire rassemble l'actualité IA d'éditeurs canadiens et internationaux, avec toujours un lien vers le reportage original. À côté des manchettes, nous tenons une liste claire du financement public pour les projets en IA, une courte liste d'outils à essayer et des guides qui ne demandent aucune connaissance technique.",
      },
      {
        en: "Our rules are simple. We don't invent facts. Every funding program on this site links to its official page and shows the date we last checked it. Headlines come from named publishers. When we give an opinion, it lives here, on the editor's desk, clearly labelled.",
        fr: "Nos règles sont simples. Nous n'inventons pas de faits. Chaque programme de financement renvoie à sa page officielle avec la date de notre dernière vérification. Les manchettes viennent d'éditeurs nommés. Quand nous donnons notre opinion, c'est ici, au mot de la rédaction, clairement identifié.",
      },
      {
        en: "If you run a small business, work in the public sector, teach, study or are simply curious, this is for you. Tell us what you want explained next.",
        fr: "Si vous dirigez une petite entreprise, travaillez dans le secteur public, enseignez, étudiez ou êtes simplement curieux, ce site est pour vous. Dites-nous ce que vous aimeriez qu'on explique ensuite.",
      },
    ],
  },
];

export function formatDate(iso: string, locale: "en" | "fr") {
  return new Date(iso + "T12:00:00Z").toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}
