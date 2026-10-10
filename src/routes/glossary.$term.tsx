import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { loadGlossary, viewTerm, GLOSSARY_UPDATED } from "@/lib/glossary";
import { hubMeta } from "@/lib/hubs";
import { SITE } from "@/lib/site";
import { seoHead, absUrl } from "@/lib/seo";

export const Route = createFileRoute("/glossary/$term")({
  loader: async ({ params }) => {
    const all = await loadGlossary();
    const t = all.find(x => x.slug === params.term);
    if (!t) throw notFound();
    return { t, en: viewTerm(t, all, "en"), fr: viewTerm(t, all, "fr") };
  },
  head: ({ match, loaderData }) => {
    const d = loaderData;
    if (!d) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    return seoHead(match, {
      title: { en: `What is ${d.en.term}? AI glossary — ${SITE.name}`, fr: `${d.fr.term} : définition — ${SITE.name}` },
      description: { en: d.en.short, fr: d.fr.short },
      modifiedTime: GLOSSARY_UPDATED,
      breadcrumbs: [{ name: { en: "Glossary", fr: "Glossaire" }, path: "/glossary" }, { name: { en: d.en.term, fr: d.fr.term }, path: `/glossary/${d.t.slug}` }],
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org", "@type": "DefinedTerm", name: d[locale].term, description: d[locale].short, url,
        inDefinedTermSet: absUrl("/glossary", locale),
      }],
    });
  },
  component: Term,
});

function Term() {
  const d = Route.useLoaderData();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const v = d[locale];
  return (
    <PageShell>
      <article className="container-mw mt-10 max-w-3xl">
        <p className="meta"><Link to="/glossary" className="text-lake hover:underline">{fr ? "Glossaire" : "Glossary"}</Link> · {v.categoryLabel}</p>
        <h1 className="masthead-serif text-[2.4rem] sm:text-[3.2rem] leading-[1.05] mt-2">{v.term}</h1>
        {v.aka && <p className="meta mt-1">{fr ? "Aussi appelé " : "Also called "}{v.aka}</p>}
        <p className="font-serif text-[1.25rem] leading-relaxed mt-5">{v.short}</p>
        <div className="mt-6 bg-signal text-signal-ink p-5">
          <p className="font-bold text-[0.9rem]">{fr ? "En une ligne, pour un jeune de 12 ans" : "In one line, for a 12-year-old"}</p>
          <p className="hl text-[1.3rem] mt-1">{v.kid}</p>
        </div>
        <h2 className="hl text-[1.4rem] mt-8">{fr ? "Un exemple" : "An example"}</h2>
        <p className="font-serif text-[1.1rem] leading-relaxed mt-2">{v.example}</p>
        <h2 className="hl text-[1.4rem] mt-8">{fr ? "Pourquoi c'est important pour les gens" : "Why it matters to people"}</h2>
        <p className="font-serif text-[1.1rem] leading-relaxed mt-2">{v.why}</p>
        {(v.related.length > 0 || v.links.length > 0) && (
          <div className="mt-10 border-t-2 border-night pt-4 grid gap-4 sm:grid-cols-2">
            {v.related.length > 0 && (
              <div>
                <h2 className="font-bold">{fr ? "Termes liés" : "Related terms"}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {v.related.map(r => <li key={r.slug}><Link to="/glossary/$term" params={{ term: r.slug }} className="press inline-block border border-line px-3 py-1.5 font-semibold hover:border-night">{r.term}</Link></li>)}
                </ul>
              </div>
            )}
            {v.links.length > 0 && (
              <div>
                <h2 className="font-bold">{fr ? "Aller plus loin" : "Go further"}</h2>
                <ul className="mt-2 grid gap-1">
                  {v.links.map((l, i) => (
                    <li key={i}>
                      {l.labs && <Link to="/labs/$path" params={{ path: l.labs }} className="text-lake font-semibold hover:underline">{fr ? "Parcours Labs" : "Labs path"}: {l.labs}</Link>}
                      {l.learn && <Link to="/learn/$slug" params={{ slug: l.learn }} className="text-lake font-semibold hover:underline">{fr ? "Guide" : "Guide"}: {l.learn}</Link>}
                      {l.hub && hubMeta(l.hub) && <Link to="/guides/$slug" params={{ slug: l.hub }} className="text-lake font-semibold hover:underline">{fr ? hubMeta(l.hub)!.title.fr : hubMeta(l.hub)!.title.en}</Link>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </article>
    </PageShell>
  );
}
