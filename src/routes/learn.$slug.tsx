import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { GUIDES } from "@/lib/guides";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/learn/$slug")({
  loader: ({ params }) => {
    const guide = GUIDES.find(g => g.slug === params.slug);
    if (!guide) throw notFound();
    return guide.slug;
  },
  head: ({ match, params }) => {
    const g = GUIDES.find(x => x.slug === params.slug);
    if (!g) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: { en: `${g.title.en} — ${SITE.name}`, fr: `${g.title.fr} — ${SITE.name}` },
      description: g.dek,
      type: "article",
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: g.title[locale],
        description: g.dek[locale],
        url,
        mainEntityOfPage: url,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        timeRequired: `PT${g.minutes}M`,
        author: { "@type": "Organization", name: SITE.name },
        publisher: publisherRef,
        image: DEFAULT_OG_IMAGE,
      }],
    });
  },
  component: GuidePage,
});

function GuidePage() {
  const slug = Route.useLoaderData();
  const g = GUIDES.find(x => x.slug === slug)!;
  const { locale, pick } = useLocale();
  const others = GUIDES.filter(x => x.slug !== slug).slice(0, 3);

  return (
    <PageShell>
      <article className="container-mw pt-10">
        <div className="max-w-[44rem] mx-auto">
          <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lake hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("backTo", locale)} {t("learn", locale)}
          </Link>
          <p className="meta mt-6">{pick(g.audience)} · {g.minutes} {t("minRead", locale)}</p>
          <h1 className="hl text-[2.4rem] sm:text-[3.2rem] leading-[1.02] mt-2">{pick(g.title)}</h1>
          <p className="dek text-[1.3rem] mt-4">{pick(g.dek)}</p>

          <div className="prose-mw mt-10">
            {g.blocks.map((b, i) => {
              if (b.kind === "h") return <h2 key={i}>{pick(b.text)}</h2>;
              if (b.kind === "p") return <p key={i}>{pick(b.text)}</p>;
              if (b.kind === "list") return <ul key={i}>{b.items.map((it, j) => <li key={j}>{pick(it)}</li>)}</ul>;
              return (
                <aside key={i} className="not-prose my-8 flex gap-4 bg-ice rounded-[8px] p-5">
                  <Lightbulb className="h-5 w-5 text-lake shrink-0 mt-1" aria-hidden="true" />
                  <p className="font-serif text-[1.08rem] leading-relaxed">{pick(b.text)}</p>
                </aside>
              );
            })}
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="container-mw mt-16">
          <div className="max-w-[44rem] mx-auto border-t-[3px] border-ink pt-6">
            <h2 className="hl text-[1.4rem] mb-4">{locale === "fr" ? "À lire ensuite" : "Read next"}</h2>
            <ul className="grid gap-4">
              {others.map(o => (
                <li key={o.slug}>
                  <Link to="/learn/$slug" params={{ slug: o.slug }} className="group block">
                    <p className="hl text-[1.2rem] group-hover:text-lake">{pick(o.title)}</p>
                    <p className="text-muted-ink text-[0.95rem]">{pick(o.dek)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageShell>
  );
}
