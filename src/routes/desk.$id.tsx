import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, Flag } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Markdown } from "@/components/Markdown";
import { ShareBar } from "@/components/ShareBar";
import { NewsletterBox, NewsletterPromo } from "@/components/NewsletterBox";
import { keepNames } from "@/components/Dispatch";
import { studioDate, StudioLink } from "@/components/StudioCards";
import { AiBadge, Breadcrumbs, PublishedBy, StampLegend, StampMark } from "@/components/Trust";
import { useLocale } from "@/lib/locale-context";
import { studioById, studioFor, readingMinutes, STUDIO } from "@/lib/studio";
import { editorMailto } from "@/lib/contact";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef, DEFAULT_OG_IMAGE, absUrl, localeOf, localePath, LANG_TAG } from "@/lib/seo";

/**
 * A Buildgena Studio dispatch: editor-approved, AI-assisted, sourced.
 * One language per piece. Read in the other language's edition, the page
 * still renders (with a note) but is noindex, so search sees one URL per piece.
 */
export const Route = createFileRoute("/desk/$id")({
  loader: ({ params }) => {
    const piece = studioById(params.id);
    if (!piece) throw notFound();
    return { piece };
  },
  head: ({ match, loaderData }) => {
    const p = loaderData?.piece;
    if (!p) return seoHead(match, { title: `${SITE.name}`, description: SITE.description, noindex: true });
    const locale = localeOf(match);
    const mismatch = p.lang !== locale;
    return seoHead(match, {
      title: `${p.title} — ${SITE.name}`,
      description: p.dek,
      image: p.cover ?? null,
      imageAlt: p.title,
      type: "article",
      publishedTime: p.approvedAt,
      modifiedTime: p.approvedAt,
      section: { en: "From our desk", fr: "De notre pupitre" },
      alternates: false,
      noindex: mismatch,
      breadcrumbs: [
        { name: { en: "From our desk", fr: "De notre pupitre" }, path: "/desk" },
        { name: p.title, path: `/desk/${p.id}` },
      ],
      jsonLd: (l, url) => [{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: p.title.slice(0, 110),
        description: p.dek,
        url,
        mainEntityOfPage: url,
        datePublished: p.approvedAt,
        dateModified: p.approvedAt,
        inLanguage: LANG_TAG[p.lang],
        isAccessibleForFree: true,
        image: [p.cover ?? DEFAULT_OG_IMAGE],
        articleSection: l === "fr" ? "De notre pupitre" : "From our desk",
        wordCount: p.body.split(/\s+/).filter(Boolean).length,
        // Drafted with AI in Buildgena Studio; a named human editor approved it.
        author: { "@type": "Organization", name: SITE.name, url: absUrl("/", l) },
        editor: { "@type": "Person", name: p.approvedBy },
        publisher: publisherRef,
        publishingPrinciples: absUrl("/how-we-use-ai", l),
        creditText: p.aiDisclosure,
        isBasedOn: p.sources.map(s => s.url),
        citation: p.sources.map(s => ({ "@type": "CreativeWork", name: s.title, url: s.url, publisher: { "@type": "Organization", name: s.publisher } })),
      }],
    });
  },
  component: StudioPiece,
});

function StudioPiece() {
  const { piece: p } = Route.useLoaderData();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const mismatch = p.lang !== locale;
  const pfr = p.lang === "fr";
  const mail = editorMailto(
    pfr ? `Erreur signalée : ${p.title}` : `Error report: ${p.title}`,
    `${absUrl(`/desk/${p.id}`, p.lang)}\n\n${pfr ? "Ce qui est inexact :" : "What is wrong:"}\n`,
  );
  const more = studioFor(locale, STUDIO).filter(x => x.id !== p.id).slice(0, 4);
  const T = (en: string, frs: string) => (pfr ? frs : en);

  return (
    <PageShell>
      <article className="container-mw pt-6" lang={LANG_TAG[p.lang]}>
        <Breadcrumbs items={[{ label: fr ? "De notre pupitre" : "From our desk", to: "/desk" }, { label: p.title }]} />
        {mismatch && (
          <p className="mt-4 border border-line bg-surface px-4 py-3 text-[0.95rem]" lang={LANG_TAG[locale]}>
            {fr ? "Cet article est publié en anglais seulement. " : "This piece is published in French only. "}
            <a href={pfr ? `/fr/desk/${p.id}` : `/desk/${p.id}`} hrefLang={p.lang} className="text-lake font-semibold underline">{fr ? "Voir l'édition anglaise" : "Read it in the French edition"}</a>
          </p>
        )}
        <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1fr)_300px] mt-6">
          <div className="min-w-0 max-w-[740px]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link to="/desk" className="kicker hover:underline">{T("From our desk", "De notre pupitre")}</Link>
              <AiBadge />
              {p.stamps.map(s => <StampMark key={s} s={s} />)}
            </p>
            <h1 className="hl text-[2.25rem] sm:text-[2.9rem] lg:text-[3.3rem] leading-[1.06] mt-3">{keepNames(p.title)}</h1>
            <p className="font-serif text-[1.25rem] sm:text-[1.4rem] leading-snug text-ink/80 mt-4">{p.dek}</p>

            <div className="mt-6 border-y border-line py-3 grid gap-1 text-[0.9rem]">
              <p className="flex flex-wrap gap-x-2 gap-y-0.5">
                <span>{T("Approved by", "Approuvé par")} <span className="font-bold">{p.approvedBy}</span></span>
                <span aria-hidden="true">·</span>
                <time dateTime={p.approvedAt}>{studioDate(p.approvedAt, p.lang)}</time>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes(p.body)} {T("min read", "min de lecture")}</span>
              </p>
              <p className="text-muted-ink">
                {p.aiDisclosure}{" "}
                <Link to="/how-we-use-ai" className="text-lake font-semibold underline">{T("How we use AI", "Comment nous utilisons l'IA")}</Link>
              </p>
            </div>

            {p.cover && (
              <figure className="mt-6">
                <div className="aspect-[16/9] overflow-hidden bg-ice">
                  <img src={p.cover} alt="" fetchPriority="high" decoding="async" className="img-cover" />
                </div>
              </figure>
            )}

            <Markdown source={p.body} className="mt-8" localize={path => localePath(path, p.lang)} />

            <section className="mt-12" aria-labelledby="sources">
              <h2 id="sources" className="kicker text-ink">{T("Sources", "Sources")}</h2>
              <ol className="mt-3 divide-y divide-line border-y border-line">
                {p.sources.map((s, i) => (
                  <li key={s.url} className="py-3 grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2">
                    <span className="font-bold text-muted-ink tabular-nums">{i + 1}.</span>
                    <span>
                      <a href={s.url} rel="noopener" className="font-semibold leading-snug hover:underline inline-flex gap-1.5 items-baseline">
                        {s.title}<ExternalLink className="h-3.5 w-3.5 shrink-0 translate-y-0.5" aria-hidden="true" />
                      </a>
                      <span className="block text-[0.88rem] text-muted-ink">{s.publisher}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-10 bg-surface border border-line p-5 sm:p-6" aria-labelledby="how-made">
              <h2 id="how-made" className="font-bold text-[1.05rem]">{T("How this piece was made", "Comment cet article a été réalisé")}</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)] text-[0.95rem]">
                <dt className="text-muted-ink">{T("AI use", "Usage de l'IA")}</dt><dd>{p.aiDisclosure}</dd>
                <dt className="text-muted-ink">{T("Approved by", "Approuvé par")}</dt><dd>{p.approvedBy}, <time dateTime={p.approvedAt}>{studioDate(p.approvedAt, p.lang)}</time></dd>
                <dt className="text-muted-ink">{T("Produced with", "Réalisé avec")}</dt><dd>{p.producedWith}</dd>
                <dt className="text-muted-ink">{T("Publisher", "Éditeur")}</dt><dd><PublishedBy /></dd>
              </dl>
              {p.stamps.length > 0 && <div className="mt-5"><StampLegend stamps={p.stamps} /></div>}
              <p className="mt-5 pt-4 border-t border-line text-[0.85rem] text-muted-ink">
                {T("Made with ", "Réalisé avec ")}
                <a href={SITE.studio.url} rel="noopener" className="font-semibold text-ink underline hover:text-lake">{SITE.studio.name}</a>
                {T(", GEN:A Labs' editor-approved newsroom app.", ", l'application de rédaction de GEN:A Labs, avec approbation éditoriale.")}
              </p>
            </section>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <ShareBar url={`/desk/${p.id}`} title={p.title} campaign="desk" />
              {mail
                ? <a href={mail} className="inline-flex items-center gap-1.5 text-[0.92rem] font-semibold text-muted-ink hover:text-ink underline"><Flag className="h-4 w-4" aria-hidden="true" />{T("Report an error", "Signaler une erreur")}</a>
                : <Link to="/corrections" hash="report" className="inline-flex items-center gap-1.5 text-[0.92rem] font-semibold text-muted-ink underline"><Flag className="h-4 w-4" aria-hidden="true" />{T("Report an error", "Signaler une erreur")}</Link>}
            </div>

            <div className="mt-12 border-t-2 border-ink pt-8">
              <NewsletterBox variant="inline" />
            </div>
          </div>

          <aside className="min-w-0 grid gap-8 content-start lg:sticky lg:top-28 lg:self-start">
            {more.length > 0 && (
              <div>
                <h2 className="kicker text-ink border-b-2 border-ink pb-2">{fr ? "Aussi de notre pupitre" : "More from our desk"}</h2>
                <ul className="divide-y divide-line">
                  {more.map(x => (
                    <li key={x.id} className="py-3">
                      <StudioLink p={x} className="hl-sm text-[1.05rem] hover:underline block">{x.title}</StudioLink>
                      <p className="meta mt-1">{studioDate(x.approvedAt, locale)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <NewsletterPromo />
            <div className="border border-line bg-surface p-4 text-[0.9rem]">
              <p className="font-bold">{fr ? "Nos normes" : "Our standards"}</p>
              <p className="text-muted-ink mt-1">{fr ? "Chaque fait vient d'une source nommée. Le travail assisté par l'IA est signalé et approuvé par une personne." : "Every fact comes from a named source. AI-assisted work is labelled and approved by a person."}</p>
              <p className="mt-2 flex flex-wrap gap-x-3"><Link to="/standards" className="text-lake font-semibold underline">{fr ? "Normes" : "Standards"}</Link><Link to="/corrections" className="text-lake font-semibold underline">Corrections</Link></p>
            </div>
          </aside>
        </div>
      </article>
    </PageShell>
  );
}
