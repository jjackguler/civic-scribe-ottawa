import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { bookBySlug, type Book } from "@/lib/books";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, ORIGIN } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

/**
 * /books/<slug> and /fr/books/<slug>: a book by the editor. An editor's page with a clear
 * disclosure, not advertising: facts from the listing, the publisher's description condensed,
 * no ratings or reviews, and a plain link to where it is sold. Linked from /editor, /about and
 * the footer only, never from the news pages.
 */
export const Route = createFileRoute("/books/$slug")({
  loader: ({ params }) => {
    const book = bookBySlug(params.slug);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ match, loaderData }) => {
    const b = loaderData?.book;
    if (!b) return seoHead(match, { title: { en: `Book — ${SITE.name}`, fr: `Livre — ${SITE.name}` }, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: { en: `${b.title}, by ${b.author} — ${SITE.name}`, fr: `${b.title}, de ${b.author} — ${SITE.name}` },
      description: {
        en: `${b.title}: ${b.subtitle}. A book by ${b.author}, AI Broadsheet's editor. ${b.format.en}, ${b.pages} pages, 2026.`,
        fr: `${b.title} : ${b.subtitle}. Un livre de ${b.author}, éditeur d'AI Broadsheet. ${b.format.fr}, ${b.pages} pages, 2026.`,
      },
      image: `${ORIGIN}${b.cover.src}`,
      imageWidth: b.cover.width,
      imageHeight: b.cover.height,
      imageAlt: { en: `Cover of ${b.title} by ${b.author}`, fr: `Couverture de ${b.title}, de ${b.author}` },
      breadcrumbs: [
        { name: { en: "Editor's desk", fr: "Mot de la rédaction" }, path: "/editor" },
        { name: { en: b.title, fr: b.title }, path: `/books/${b.slug}` },
      ],
      jsonLd: (l, url) => [bookLd(b, l, url)],
    });
  },
  component: BookPage,
});

function bookLd(b: Book, l: Locale, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${url}#book`,
    name: b.title,
    alternativeHeadline: b.subtitle,
    author: { "@type": "Person", name: b.author, jobTitle: l === "fr" ? "Éditeur d'AI Broadsheet" : "Editor, AI Broadsheet" },
    isbn: b.isbn13.replace(/-/g, ""),
    numberOfPages: b.pages,
    bookFormat: "https://schema.org/Paperback",
    datePublished: b.published,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: b.publisher },
    image: `${ORIGIN}${b.cover.src}`,
    description: b.description.en,
    url: absUrl(`/books/${b.slug}`, l),
    sameAs: b.buy.map(x => x.url),
  };
}

const longDate = (iso: string, locale: Locale) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

function BookPage() {
  const { book: b } = Route.useLoaderData();
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const facts: [string, string][] = [
    [fr ? "Auteur" : "Author", b.author],
    [fr ? "Format" : "Format", `${pick(b.format)}, ${b.pages} pages`],
    [fr ? "Parution" : "Published", longDate(b.published, locale)],
    [fr ? "Éditeur" : "Publisher", fr ? "Publication indépendante" : b.publisher],
    [fr ? "Langue" : "Language", pick(b.language)],
    ["ISBN-13", b.isbn13],
  ];
  return (
    <PageShell>
      <article className="container-mw pt-8 pb-4 max-w-5xl">
        {/* The disclosure comes first: this is the editor's own book. */}
        <p className="border-l-[4px] border-signal bg-surface border border-line px-4 py-3 text-[0.95rem] leading-snug max-w-3xl">
          <span className="font-bold">{fr ? "Écrit par l'éditeur d'AI Broadsheet." : "Written by AI Broadsheet's editor."}</span>{" "}
          {fr
            ? `${SITE.editor.name} (${b.author} sur la couverture) dirige AI Broadsheet. Cette page présente son livre; ce n'est pas une critique ni une publicité payée.`
            : `${SITE.editor.name} (${b.author} on the cover) edits AI Broadsheet. This page presents his book; it is not a review or a paid advertisement.`}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] items-start">
          <figure className="max-w-[170px] sm:max-w-[240px] md:max-w-none">
            <img src={b.cover.src} width={b.cover.width} height={b.cover.height} alt={fr ? `Couverture de ${b.title}` : `Cover of ${b.title}`}
              className="w-full h-auto shadow-[0_18px_50px_rgba(0,0,0,0.28)] ring-1 ring-line" decoding="async" />
            <figcaption className="meta mt-2">{fr ? "Couverture tirée de la fiche du livre." : "Cover from the book's listing."}</figcaption>
          </figure>

          <div className="min-w-0">
            <p className="text-[0.85rem] font-bold">
              <Link to="/editor" hash="books" className="text-lake hover:underline">{fr ? "Livres de l'éditeur" : "Books by the editor"}</Link>
            </p>
            <h1 className="masthead-serif text-[2.6rem] sm:text-[3.4rem] leading-[1.02] mt-2">{b.title}</h1>
            <p className="font-serif italic text-[1.3rem] sm:text-[1.45rem] leading-snug mt-2 text-ink/85">{b.subtitle}</p>
            <p className="font-sans font-semibold text-[1.05rem] mt-3">{b.author}</p>

            {fr && <p className="meta mt-4">Le livre est en anglais; ce résumé est une traduction.</p>}
            <p className="font-serif text-[1.15rem] leading-relaxed mt-4 max-w-[62ch]">{pick(b.description)}</p>
            <p className="text-[0.92rem] text-muted-ink mt-3 max-w-[62ch]">{pick(b.aiNote)}</p>

            <dl className="mt-7 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-[0.95rem] max-w-xl border-t border-line pt-5">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-ink">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {b.buy.map(x => (
                <a key={x.url} href={x.url} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 min-h-11 bg-night text-white font-bold px-5 py-3 rounded-[4px] hover:bg-lake">
                  {fr ? `Voir sur ${pick(x.label)}` : `See it on ${pick(x.label)}`}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="meta mt-3 max-w-[62ch]">
              {fr
                ? "Le lien mène à la fiche du livre chez le vendeur. AI Broadsheet ne touche aucune commission sur ce lien."
                : "The link goes to the book's listing at the seller. AI Broadsheet earns no commission from this link."}
            </p>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
