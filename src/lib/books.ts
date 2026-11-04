/**
 * Books by the editor, for /editor ("Books by the editor") and /books/<slug>.
 *
 * An editor's page, not advertising: the page says plainly that the editor wrote the book,
 * shows only facts from the book's own listing (no ratings, no reviews, no superlatives), and
 * is linked from the footer, /about and /editor only, never from the news pages.
 */
import type { Bi } from "./i18n";

export type Book = {
  slug: string;
  title: string;
  subtitle: string;
  /** Exactly as on the book's Amazon listing. */
  author: string;
  format: Bi;
  pages: number;
  /** YYYY-MM-DD */
  published: string;
  publisher: string;
  isbn13: string;
  language: Bi;
  /** Cover from the publisher's listing, in public/. */
  cover: { src: string; width: number; height: number };
  /** Condensed from the publisher's description on Amazon. */
  description: Bi;
  /** How AI was used, as the book itself discloses (house rule: AI use is always disclosed). */
  aiNote: Bi;
  buy: { label: Bi; url: string }[];
};

export const BOOKS: Book[] = [
  {
    slug: "the-new-cave",
    title: "The New Cave",
    subtitle: "Reality, Responsibility, and the Human After AI",
    author: "Cem Jack Guler",
    format: { en: "Paperback", fr: "Livre broché" },
    pages: 199,
    published: "2026-09-03",
    publisher: "Independently published",
    isbn13: "979-8171287474",
    language: { en: "English", fr: "Anglais" },
    cover: { src: "/books/the-new-cave.jpg", width: 600, height: 960 },
    description: {
      en: "The most famous cave in philosophy is a prison; every real one was a shelter. For sixty thousand years people went into caves to survive, and later they went in on purpose, alone with a question: Hira, Sinai, the wilderness, a plague-year farmhouse. Now we have built the first cave with no solitude in it. The book asks what happens to a person when the answer always arrives first, and what reality and responsibility mean for the human after AI.",
      fr: "La caverne la plus célèbre de la philosophie est une prison; toutes les vraies ont été des abris. Pendant soixante mille ans, les humains sont entrés dans des grottes pour survivre, puis ils y sont allés exprès, seuls avec une question : Hira, le Sinaï, le désert, une ferme en temps de peste. Nous avons maintenant construit la première caverne sans solitude. Le livre demande ce qui arrive à une personne quand la réponse arrive toujours en premier, et ce que la réalité et la responsabilité signifient pour l'humain après l'IA.",
    },
    aiNote: {
      en: "The book says it was written with the help of AI.",
      fr: "Le livre indique qu'il a été écrit avec l'aide de l'IA.",
    },
    buy: [{ label: { en: "Amazon.ca", fr: "Amazon.ca" }, url: "https://www.amazon.ca/dp/B0HHNZ7JXC" }],
  },
];

export const bookBySlug = (slug: string) => BOOKS.find(b => b.slug === slug);
