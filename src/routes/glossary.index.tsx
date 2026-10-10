import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { loadGlossary, CATEGORY_LABEL, CATEGORY_ORDER, foldKey, sortTerms, cardOf, GLOSSARY_UPDATED, type GlossaryCategory } from "@/lib/glossary";
import { HUBS } from "@/lib/hubs";
import { SITE } from "@/lib/site";
import { seoHead, absUrl } from "@/lib/seo";

export const Route = createFileRoute("/glossary/")({
  loader: async () => ({ terms: await loadGlossary() }),
  head: ({ match, loaderData }) =>
    seoHead(match, {
      title: { en: `AI glossary: AI words explained in plain language — ${SITE.name}`, fr: `Glossaire de l'IA en langage clair — ${SITE.name}` },
      description: {
        en: `${loaderData?.terms.length ?? 80}+ AI terms explained simply, from "agent" to "prompt", with a one-line version for kids and why each matters to people.`,
        fr: `Plus de ${loaderData?.terms.length ?? 80} termes de l'IA expliqués simplement, de « agent » à « requête », avec une version pour les jeunes.`,
      },
      modifiedTime: GLOSSARY_UPDATED,
      breadcrumbs: [{ name: { en: "Glossary", fr: "Glossaire" }, path: "/glossary" }],
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org", "@type": "DefinedTermSet", name: locale === "fr" ? "Glossaire de l'IA" : "AI glossary", url,
        hasDefinedTerm: (loaderData?.terms ?? []).map(t => ({ "@type": "DefinedTerm", name: t.term[locale], description: t.short[locale], url: absUrl(`/glossary/${t.slug}`, locale) })),
      }],
    }),
  component: Glossary,
});

function Glossary() {
  const { terms } = Route.useLoaderData();
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<GlossaryCategory | "all">("all");
  const cards = useMemo(() => sortTerms(terms.map(t => cardOf(t, locale)), locale), [terms, locale]);
  const shown = cards.filter(c => (cat === "all" || c.category === cat) && (!q || foldKey(`${c.term} ${c.aka ?? ""} ${c.short}`).includes(foldKey(q))));
  const letters = [...new Set(shown.map(c => foldKey(c.term)[0].toUpperCase()))];

  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw py-12 sm:py-16">
          <h1 className="masthead-serif text-[2.6rem] sm:text-[3.6rem] leading-[1.02]">{fr ? "Le glossaire de l'IA" : "The AI glossary"}</h1>
          <p className="font-serif text-white/80 text-[1.15rem] leading-relaxed mt-4 max-w-[56ch]">
            {fr ? `${terms.length} mots de l'actualité IA, expliqués simplement, avec une version d'une ligne pour les jeunes et ce que chacun change pour les gens.` : `${terms.length} words from AI news, explained simply, each with a one-line version for young readers and what it means for people.`}
          </p>
          <label className="block mt-6 max-w-xl">
            <span className="sr-only">{fr ? "Chercher un terme" : "Search the glossary"}</span>
            <input value={q} onChange={e => setQ(e.target.value)} type="search" placeholder={fr ? "Chercher : agent, requête, hypertrucage…" : "Search: agent, prompt, deepfake…"}
              className="w-full bg-white text-ink px-4 py-3 text-[1.05rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={fr ? "Catégories" : "Categories"}>
            {(["all", ...CATEGORY_ORDER] as const).map(c => (
              <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
                className={`press min-h-[40px] px-3.5 text-[0.9rem] font-semibold border ${cat === c ? "bg-signal text-signal-ink border-signal" : "border-white/30 text-white/85 hover:border-white"}`}>
                {c === "all" ? (fr ? "Tout" : "All") : pick(CATEGORY_LABEL[c])}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container-mw mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {shown.length === 0 && <p className="hl text-xl">{fr ? "Aucun terme ne correspond. Essayez un mot plus court." : "No term matches. Try a shorter word."}</p>}
          {letters.map(L => (
            <section key={L} aria-labelledby={`l-${L}`} className="mb-8">
              <h2 id={`l-${L}`} className="masthead-serif text-[2rem] text-brass-ink border-b-2 border-night pb-1 mb-2">{L}</h2>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {shown.filter(c => foldKey(c.term)[0].toUpperCase() === L).map(c => (
                  <li key={c.slug} className="py-3 border-b border-line">
                    <Link to="/glossary/$term" params={{ term: c.slug }} className="group block">
                      <span className="hl text-[1.15rem] group-hover:underline">{c.term}</span>
                      {c.aka && <span className="meta ml-2">{c.aka}</span>}
                      <span className="block text-[0.95rem] text-muted-ink mt-0.5 line-clamp-2">{c.kid}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className="grid gap-4 content-start">
          <h2 className="font-bold border-b-2 border-night pb-1">{fr ? "Guides complets" : "Full guides"}</h2>
          {HUBS.map(h => (
            <Link key={h.slug} to="/guides/$slug" params={{ slug: h.slug }} className="group block">
              <span className="font-semibold group-hover:underline">{pick(h.title)}</span>
              <span className="block meta">{pick(h.short)}</span>
            </Link>
          ))}
          <p className="meta">{fr ? "Mis à jour le " : "Updated "}{GLOSSARY_UPDATED}</p>
        </aside>
      </div>
    </PageShell>
  );
}
