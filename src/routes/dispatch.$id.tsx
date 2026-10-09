import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { DispatchArticle } from "@/components/DispatchArticle";
import { getDispatch, summarize, type DispatchPage } from "@/lib/dispatch";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef, DEFAULT_OG_IMAGE, absUrl, localeOf } from "@/lib/seo";

type Search = { fixture?: string };

export const Route = createFileRoute("/dispatch/$id")({
  validateSearch: (s: Record<string, unknown>): Search => (import.meta.env.DEV && String(s.fixture) === "1" ? { fixture: "1" } : {}),
  loaderDeps: ({ search }) => ({ fixture: search.fixture }),
  loader: async ({ params, deps }): Promise<DispatchPage> => {
    // Dev only: sample dispatches, since feeds and model APIs are unreachable locally.
    if (import.meta.env.DEV && deps.fixture === "1") {
      const { FIXTURES } = await import("@/lib/dispatch-fixture");
      const dispatch = FIXTURES.find(d => d.id === params.id) ?? FIXTURES[0];
      return { dispatch, audio: false, more: FIXTURES.filter(d => d !== dispatch).map(summarize) };
    }
    return Promise.race([
      getDispatch({ data: { id: params.id } }),
      new Promise<DispatchPage>(r => setTimeout(() => r({ dispatch: null, audio: false, more: [] }), 3000)),
    ]);
  },
  head: ({ match, loaderData }) => {
    const d = loaderData?.dispatch;
    if (!d) return seoHead(match, { title: { en: `Dispatch — ${SITE.name}`, fr: `Dépêche — ${SITE.name}` }, description: SITE.description, noindex: true });
    const c = d[localeOf(match)];
    const outlets = [...new Set(d.sources.map(s => s.outlet))].join(", ");
    return seoHead(match, {
      title: `${c.headline} — ${SITE.name}`,
      description: c.news,
      type: "article",
      publishedTime: d.createdAt,
      jsonLd: (l, url) => [{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: d[l].headline.slice(0, 110),
        description: d[l].news,
        abstract: d[l].thirty.join(" "),
        url,
        mainEntityOfPage: url,
        datePublished: d.createdAt,
        dateModified: d.createdAt,
        inLanguage: l === "fr" ? "fr-CA" : "en-CA",
        image: [DEFAULT_OG_IMAGE],
        // Our desk wrote it, with AI, from these outlets' reporting (each one cited and linked).
        author: { "@type": "Organization", name: l === "fr" ? `Pupitre d'${SITE.name}` : `${SITE.name} desk`, url: absUrl("/standards", l) },
        publisher: publisherRef,
        isBasedOn: d.sources.map(s => s.url),
        citation: d.sources.map(s => ({ "@type": "NewsArticle", headline: s.title, url: s.url, datePublished: s.publishedAt, publisher: { "@type": "Organization", name: s.outlet } })),
        publishingPrinciples: absUrl("/standards", l),
        creditText: l === "fr" ? `Écrit avec l'IA d'après les reportages de ${outlets}` : `Written with AI from reporting by ${outlets}`,
      }],
    });
  },
  component: DispatchRoute,
});

function DispatchRoute() {
  const { dispatch, audio, more } = Route.useLoaderData();
  const { locale } = useLocale();
  const fr = locale === "fr";
  if (!dispatch) {
    return (
      <PageShell>
        <div className="container-mw py-20 max-w-2xl">
          <h1 className="masthead-serif text-[2.4rem] leading-tight">{fr ? "Cette dépêche n'est pas disponible" : "This dispatch isn't available"}</h1>
          <p className="dek mt-3">{fr ? "Elle a peut-être été retirée, ou notre pupitre la rédige encore." : "It may have been withdrawn, or our desk may still be writing it."}</p>
          <Link to="/dispatch" className="inline-flex mt-6 bg-night text-white px-5 py-2.5 rounded-[4px] font-semibold hover:bg-lake">{fr ? "Toutes les dépêches" : "All dispatches"}</Link>
        </div>
      </PageShell>
    );
  }
  return (
    <PageShell>
      <DispatchArticle d={dispatch} audio={audio} more={more} />
    </PageShell>
  );
}
