import { ogImageFor } from "@/lib/og/url";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { DispatchArticle } from "@/components/DispatchArticle";
import { getDispatch, summarize, type DispatchPage } from "@/lib/dispatch";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef, DEFAULT_OG_IMAGE, absUrl, localeOf } from "@/lib/seo";
import { setPageStatus } from "@/lib/http-status";

type Search = { fixture?: string };

export const Route = createFileRoute("/dispatch/$id")({
  validateSearch: (s: Record<string, unknown>): Search => (import.meta.env.DEV && String(s.fixture) === "1" ? { fixture: "1" } : {}),
  loaderDeps: ({ search }) => ({ fixture: search.fixture }),
  loader: async ({ params, deps, context }): Promise<DispatchPage> => {
    // Dev only: sample dispatches, since feeds and model APIs are unreachable locally.
    if (import.meta.env.DEV && deps.fixture === "1") {
      const { FIXTURES } = await import("@/lib/dispatch-fixture");
      const dispatch = FIXTURES.find(d => d.id === params.id) ?? FIXTURES[0];
      return { dispatch, audio: false, more: FIXTURES.filter(d => d !== dispatch).map(summarize) };
    }
    const page = await Promise.race([
      getDispatch({ data: { id: params.id } }),
      new Promise<DispatchPage>(r => setTimeout(() => r({ dispatch: null, audio: false, more: [], unavailable: true }), 3000)),
    ]);
    // The Newsroom wrote this event: its article is the permanent page.
    if (page.article) {
      const locale = (context as { locale?: "en" | "fr" }).locale === "fr" ? "fr" : "en";
      throw redirect({ to: "/article/$slug", params: { slug: page.article[locale] }, statusCode: 301 });
    }
    // Not 200 for an empty page, or Google files it as a soft 404: an unknown id is a real 404,
    // a lookup that failed or timed out is a temporary 503.
    if (!page.dispatch) {
      if (!page.unavailable) throw notFound();
      setPageStatus(503, 120);
    }
    return page;
  },
  head: ({ match, loaderData }) => {
    const d = loaderData?.dispatch;
    if (!d) return seoHead(match, { title: { en: `Dispatch — ${SITE.name}`, fr: `Dépêche — ${SITE.name}` }, description: SITE.description, noindex: true });
    const c = d[localeOf(match)];
    const outlets = [...new Set(d.sources.map(s => s.outlet))].join(", ");
    return seoHead(match, {
      title: `${c.headline} — ${SITE.name}`,
      description: c.news,
      image: ogImageFor("article", d.id, localeOf(match), { version: d.createdAt }),
      imageWidth: 1200, imageHeight: 630, imageAlt: c.headline,
      type: "article",
      publishedTime: d.createdAt,
      jsonLd: (l, url) => [{
        "@context": "https://schema.org",
        // A summary of other outlets' reporting: an Article with no author of its own.
        "@type": "Article",
        genre: l === "fr" ? "Résumé de la rédaction" : "Newsroom summary",
        headline: d[l].headline.slice(0, 110),
        description: d[l].news,
        abstract: d[l].thirty.join(" "),
        url,
        mainEntityOfPage: url,
        datePublished: d.createdAt,
        dateModified: d.createdAt,
        inLanguage: l === "fr" ? "fr-CA" : "en-CA",
        image: [DEFAULT_OG_IMAGE],
        publisher: publisherRef,
        isBasedOn: d.sources.map(s => s.url),
        citation: d.sources.map(s => ({ "@type": "NewsArticle", headline: s.title, url: s.url, datePublished: s.publishedAt, publisher: { "@type": "Organization", name: s.outlet } })),
        publishingPrinciples: absUrl("/standards", l),
        creditText: l === "fr" ? `Résumé de la rédaction, rédigé avec l'IA, des reportages de ${outlets}` : `Newsroom summary, written with AI, of reporting by ${outlets}`,
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
          <h1 className="masthead-serif text-[2.4rem] leading-tight">{fr ? "Ce résumé n'est pas disponible" : "This newsroom summary isn't available"}</h1>
          <p className="dek mt-3">{fr ? "Il a peut-être été retiré, ou il est encore en préparation." : "It may have been withdrawn, or it may still be in preparation."}</p>
          <Link to="/dispatch" className="inline-flex mt-6 bg-night text-white px-5 py-2.5 rounded-[4px] font-semibold hover:bg-lake">{fr ? "Tous les résumés de la rédaction" : "All newsroom summaries"}</Link>
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
