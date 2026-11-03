import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { EDITORIALS, formatDate } from "@/lib/editorials";
import { BOOKS } from "@/lib/books";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/editor/")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Editor's desk — ${SITE.name}`, fr: `Mot de la rédaction — ${SITE.name}` },
      description: { en: `Opinion and analysis on artificial intelligence from the editor of ${SITE.name}.`, fr: `Opinions et analyses sur l'intelligence artificielle par la rédaction de ${SITE.name}.` },
    }),
  component: EditorIndex,
});

function EditorIndex() {
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <PageIntro
        title={t("editorsDesk", locale)}
        dek={locale === "fr"
          ? "Analyses et opinions de la rédaction sur ce que l'IA change pour les Canadiens. Ces textes sont des opinions, clairement séparées des nouvelles."
          : "Analysis and opinion from the editor on what AI is changing for Canadians. These are opinion pieces, kept clearly separate from the news."}
      />
      <div className="container-mw mt-10">
        <ul className="grid gap-px bg-line border border-line rounded-[8px] overflow-hidden max-w-4xl">
          {EDITORIALS.map(e => (
            <li key={e.slug} className="bg-surface">
              <Link to="/editor/$slug" params={{ slug: e.slug }} className="group block p-6 sm:p-8 hover:bg-ice/40">
                <p className="meta">{formatDate(e.date, locale)}</p>
                <h2 className="hl text-[1.8rem] mt-1 group-hover:text-lake">{pick(e.title)}</h2>
                <p className="dek mt-2">{pick(e.dek)}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* The editor's own books: disclosed as his, kept off the news pages. */}
        <section id="books" aria-labelledby="books-h" className="mt-14 max-w-4xl scroll-mt-24">
          <h2 id="books-h" className="masthead-serif text-[1.9rem] leading-tight">{locale === "fr" ? "Livres de l'éditeur" : "Books by the editor"}</h2>
          <p className="dek mt-1">{locale === "fr"
            ? `Écrits par ${SITE.editor.name}, l'éditeur d'AI Broadsheet. Nous les présentons parce qu'ils sont de lui, pas comme une publicité.`
            : `Written by ${SITE.editor.name}, AI Broadsheet's editor. Listed here because they are his, not as advertising.`}</p>
          <ul className="mt-5 grid gap-5">
            {BOOKS.map(b => (
              <li key={b.slug}>
                <Link to="/books/$slug" params={{ slug: b.slug }} className="group grid grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)] gap-5 items-start bg-surface border border-line p-4 sm:p-5 hover:border-night">
                  <img src={b.cover.src} width={b.cover.width} height={b.cover.height} alt="" loading="lazy" decoding="async" className="w-full h-auto ring-1 ring-line" />
                  <span className="min-w-0">
                    <span className="block hl text-[1.5rem] group-hover:text-lake">{b.title}</span>
                    <span className="block font-serif italic text-[1.08rem] text-ink/85 mt-0.5">{b.subtitle}</span>
                    <span className="block meta mt-2">{b.author} · {pick(b.format)}, {b.pages} pages · {b.published.slice(0, 4)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
