/**
 * /article/<slug> (English) and /fr/article/<slug> (French): a Newsroom
 * article's permanent URL. Each language has its own slug; the other
 * language's slug redirects (301) to the right one. A killed article answers
 * 410 (src/server.ts) and shows a short notice; an unknown slug is a 404.
 */
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { NewsroomArticleView } from "@/components/NewsroomArticle";
import { getArticlePage, fixtureArticlePage, articleOgImage, BYLINE, FORMAT_LABEL, TOPIC_KICKER, stripAllMarkers, type ArticlePage, type NewsroomArticle } from "@/lib/newsroom";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef, absUrl, localeOf } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

type Search = { fixture?: string };

const articleUrl = (a: NewsroomArticle, l: Locale) => absUrl(`/article/${a.slug[l]}`, l);

/** <title>: the SEO title, with the site name when it still fits in 60 characters. */
const pageTitle = (seoTitle: string) => (seoTitle.length + SITE.name.length + 3 <= 60 ? `${seoTitle} — ${SITE.name}` : seoTitle);

function articleLd(a: NewsroomArticle, l: Locale, url: string): unknown[] {
  const c = a[l];
  const outlets = [...new Set(a.sources.map(s => s.outlet))].join(", ");
  const body = c.sections.flatMap(s => s.paras).map(stripAllMarkers).join("\n\n");
  const out: unknown[] = [{
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: c.headline.slice(0, 110),
    alternativeHeadline: c.seoTitle,
    description: c.metaDescription,
    abstract: c.thirty.join(" "),
    articleBody: body,
    wordCount: a.words[l],
    keywords: c.keywords.join(", "),
    articleSection: TOPIC_KICKER[a.topic]?.[l] ?? FORMAT_LABEL[a.format][l],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: a.createdAt,
    dateModified: a.updatedAt,
    inLanguage: l === "fr" ? "fr-CA" : "en-CA",
    image: [articleOgImage(a)],
    // Our newsroom wrote it, with AI, from these outlets' reporting (each one cited and linked).
    author: { "@type": "Organization", name: BYLINE[l], url: absUrl("/standards", l) + "#newsroom" },
    publisher: publisherRef,
    isAccessibleForFree: true,
    isBasedOn: a.sources.map(s => s.url),
    citation: a.sources.map(s => ({ "@type": "NewsArticle", headline: s.title, url: s.url, datePublished: s.publishedAt, publisher: { "@type": "Organization", name: s.outlet } })),
    publishingPrinciples: absUrl("/standards", l),
    creditText: l === "fr" ? `Écrit avec l'IA par notre salle de rédaction, d'après les reportages de ${outlets}` : `Written with AI by our newsroom, from reporting by ${outlets}`,
  }];
  if (c.faq.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage: l === "fr" ? "fr-CA" : "en-CA",
      mainEntity: c.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  out.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE.name, item: absUrl("/", l) },
      { "@type": "ListItem", position: 2, name: l === "fr" ? "Salle de rédaction" : "Newsroom", item: absUrl("/dispatch", l) },
      { "@type": "ListItem", position: 3, name: c.headline.slice(0, 110), item: url },
    ],
  });
  return out;
}

export const Route = createFileRoute("/article/$slug")({
  validateSearch: (s: Record<string, unknown>): Search => (import.meta.env.DEV && String(s.fixture) === "1" ? { fixture: "1" } : {}),
  loaderDeps: ({ search }) => ({ fixture: search.fixture }),
  loader: async ({ params, deps, context }): Promise<ArticlePage> => {
    const page = import.meta.env.DEV && deps.fixture === "1"
      ? await fixtureArticlePage(params.slug)
      : await Promise.race([
          getArticlePage({ data: { slug: params.slug } }),
          new Promise<ArticlePage>(r => setTimeout(() => r({ status: "unavailable" }), 6000)),
        ]);
    if (page.status === "missing") throw notFound();
    const locale: Locale = (context as { locale?: Locale }).locale === "fr" ? "fr" : "en";
    // One URL per language: the other language's slug (or an old one) moves here for good.
    if (page.status === "ok" && page.article.slug[locale] !== params.slug) {
      throw redirect({ to: "/article/$slug", params: { slug: page.article.slug[locale] }, search: deps.fixture ? { fixture: deps.fixture } : {}, statusCode: 301 });
    }
    return page;
  },
  head: ({ match, loaderData }) => {
    const l = localeOf(match);
    if (!loaderData || loaderData.status !== "ok") {
      const killed = loaderData?.status === "killed";
      return seoHead(match, {
        title: killed ? { en: `Article withdrawn — ${SITE.name}`, fr: `Article retiré — ${SITE.name}` } : { en: `Article — ${SITE.name}`, fr: `Article — ${SITE.name}` },
        description: SITE.description,
        noindex: true,
      });
    }
    const a = loaderData.article;
    const c = a[l];
    const head = seoHead(match, {
      title: pageTitle(c.seoTitle),
      description: c.metaDescription,
      image: articleOgImage(a),
      type: "article",
      publishedTime: a.createdAt,
      jsonLd: (loc) => articleLd(a, loc, articleUrl(a, loc)),
    });
    // Each language has its own slug, so the alternates are not the same path under /fr:
    // canonical and hreflang are set here from the article (seoHead would mirror this page's path).
    head.links = [
      { rel: "canonical", href: articleUrl(a, l) },
      { rel: "alternate", hrefLang: "en", href: articleUrl(a, "en") },
      { rel: "alternate", hrefLang: "fr", href: articleUrl(a, "fr") },
      { rel: "alternate", hrefLang: "x-default", href: articleUrl(a, "en") },
    ];
    head.meta = head.meta.map(m => (m.property === "og:url" ? { ...m, content: articleUrl(a, l) } : m));
    head.meta.push(
      { property: "article:modified_time", content: a.updatedAt },
      { property: "article:section", content: TOPIC_KICKER[a.topic]?.[l] ?? FORMAT_LABEL[a.format][l] },
      ...c.keywords.map(k => ({ property: "article:tag", content: k })),
      { property: "article:author", content: BYLINE[l] },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "twitter:label1", content: l === "fr" ? "D'après" : "Reported by" },
      { name: "twitter:data1", content: [...new Set(a.sources.map(s => s.outlet))].slice(0, 3).join(", ") },
    );
    return head;
  },
  component: ArticleRoute,
});

function ArticleRoute() {
  const page = Route.useLoaderData();
  const { locale } = useLocale();
  const fr = locale === "fr";
  if (page.status !== "ok") {
    const killed = page.status === "killed";
    return (
      <PageShell>
        <div className="container-mw py-20 max-w-2xl">
          <p className="topic">{fr ? "Salle de rédaction" : "Newsroom"}</p>
          <h1 className="masthead-serif text-[2.4rem] leading-tight mt-2">
            {killed ? (fr ? "Cet article a été retiré" : "This article has been withdrawn") : (fr ? "Cet article n'est pas disponible pour le moment" : "This article isn't available right now")}
          </h1>
          {killed && <p className="font-serif text-[1.2rem] mt-3 italic">“{page.headline[locale]}”</p>}
          <p className="dek mt-3">
            {killed
              ? (fr ? "Notre rédaction l'a retiré. Si nous y avons trouvé une erreur, elle est consignée sur la page Corrections." : "Our newsroom took it down. If we found an error in it, it is logged on our corrections page.")
              : (fr ? "Réessayez dans quelques minutes." : "Please try again in a few minutes.")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/dispatch" className="inline-flex bg-night text-white px-5 py-2.5 rounded-[4px] font-semibold hover:bg-lake">{fr ? "Tous nos articles" : "All our articles"}</Link>
            {killed && <Link to="/corrections" className="inline-flex border border-night px-5 py-2.5 rounded-[4px] font-semibold hover:bg-ice">{fr ? "Corrections" : "Corrections"}</Link>}
          </div>
        </div>
      </PageShell>
    );
  }
  return (
    <PageShell>
      <NewsroomArticleView a={page.article} related={page.related} />
    </PageShell>
  );
}
