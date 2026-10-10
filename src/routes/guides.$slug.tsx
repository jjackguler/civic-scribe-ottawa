import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { loadHub, type HubBlock } from "@/lib/hubs";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";
import type { Bi } from "@/lib/i18n";

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ params }) => {
    const hub = await loadHub(params.slug);
    if (!hub) throw notFound();
    return { hub };
  },
  head: ({ match, loaderData }) => {
    const h = loaderData?.hub;
    if (!h) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: h.seoTitle, description: h.description, type: "article",
      publishedTime: h.published, modifiedTime: h.updated,
      breadcrumbs: [{ name: { en: "Guides", fr: "Guides" }, path: "/glossary" }, { name: h.title, path: `/guides/${h.slug}` }],
      jsonLd: locale => [
        { "@context": "https://schema.org", "@type": "Article", headline: h.title[locale], description: h.description[locale], datePublished: h.published, dateModified: h.updated, author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name } },
        ...(h.faq.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: h.faq.map(f => ({ "@type": "Question", name: f.q[locale], acceptedAnswer: { "@type": "Answer", text: f.a[locale] } })) }] : []),
      ],
    });
  },
  component: Guide,
});

function Block({ b, pick }: { b: HubBlock; pick: (x: Bi) => string }) {
  switch (b.k) {
    case "p": return <p>{pick(b.t)}</p>;
    case "h3": return <h3 className="hl text-[1.2rem] mt-6 mb-2">{pick(b.t)}</h3>;
    case "ul": return <ul>{b.items.map((x, i) => <li key={i}>{pick(x)}</li>)}</ul>;
    case "ol": return <ol className="list-decimal pl-6 font-serif text-[1.125rem] leading-relaxed mb-5">{b.items.map((x, i) => <li key={i} className="my-1.5">{pick(x)}</li>)}</ol>;
    case "tip": return <div className="my-5 border-l-[5px] border-signal bg-signal/10 px-4 py-3">{b.label && <p className="font-bold text-[0.9rem]">{pick(b.label)}</p>}<p className="font-serif text-[1.08rem] leading-relaxed">{pick(b.t)}</p></div>;
    case "table": return (
      <div className="my-5 overflow-x-auto">
        <table className="w-full text-left text-[0.95rem] border-collapse">
          <caption className="text-left font-bold mb-2">{pick(b.caption)}</caption>
          <thead><tr>{b.head.map((h, i) => <th key={i} className="border-b-2 border-night py-2 pr-4">{pick(h)}</th>)}</tr></thead>
          <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-line py-2 pr-4 align-top">{pick(c)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
}

function Guide() {
  const { hub: h } = Route.useLoaderData();
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <header className="bg-night text-white">
        <div className="container-mw py-12 sm:py-16 max-w-4xl">
          <p className="text-signal font-bold text-[0.9rem]">{pick(h.audience)} · {h.minutes} min</p>
          <h1 className="masthead-serif text-[2.3rem] sm:text-[3.2rem] leading-[1.05] mt-2">{pick(h.title)}</h1>
          <p className="font-serif text-white/80 text-[1.15rem] leading-relaxed mt-4 max-w-[60ch]">{pick(h.dek)}</p>
          <p className="text-white/60 text-[0.85rem] mt-4">{fr ? "Mis à jour le " : "Updated "}{h.updated}</p>
        </div>
      </header>
      <div className="container-mw mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label={fr ? "Sommaire" : "Contents"} className="lg:sticky lg:top-24 self-start">
          <p className="font-bold border-b-2 border-night pb-1">{fr ? "Sommaire" : "Contents"}</p>
          <ol className="mt-2 grid gap-1.5 text-[0.95rem]">{h.sections.map(s => <li key={s.id}><a href={`#${s.id}`} className="text-lake hover:underline">{pick(s.h)}</a></li>)}</ol>
        </nav>
        <article className="prose-mw max-w-[70ch]">
          {h.sections.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2>{pick(s.h)}</h2>
              {s.blocks.map((b, i) => <Block key={i} b={b} pick={pick} />)}
            </section>
          ))}
          {h.faq.length > 0 && (
            <section id="faq">
              <h2>{fr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
              {h.faq.map((f, i) => <details key={i} className="border-b border-line py-3"><summary className="font-semibold cursor-pointer">{pick(f.q)}</summary><p className="mt-2">{pick(f.a)}</p></details>)}
            </section>
          )}
          {h.terms.length > 0 && (
            <section>
              <h2>{fr ? "Mots à connaître" : "Words to know"}</h2>
              <p className="flex flex-wrap gap-2 not-prose">{h.terms.map(t => <Link key={t} to="/glossary/$term" params={{ term: t }} className="press inline-block border border-line px-3 py-1.5 font-sans text-[0.95rem] font-semibold hover:border-night">{t.replace(/-/g, " ")}</Link>)}</p>
            </section>
          )}
          {h.sources.length > 0 && (
            <section>
              <h2>{fr ? "Sources" : "Sources"}</h2>
              <ul>{h.sources.map((s, i) => { const u = typeof s.url === "string" ? s.url : pick(s.url); return <li key={i}><a href={u} target="_blank" rel="noopener noreferrer" className="text-lake hover:underline">{pick(s.name)}</a></li>; })}</ul>
            </section>
          )}
        </article>
      </div>
    </PageShell>
  );
}
