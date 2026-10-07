import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { EDITORIALS, formatDate } from "@/lib/editorials";
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
      </div>
    </PageShell>
  );
}
