import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { EditorialCard, articleHref } from "@/components/editorial/SectionIndex";
import { NewsImage } from "@/components/NewsImage";
import {
  listByType, COLUMNS, getAuthor, approvedLetters, OP_DOCS,
} from "@/lib/editorial-data";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/editorial")({
  head: () => ({
    meta: [
      { title: "Editorial — Ottawa Civic Ledger" },
      { name: "description", content: "Interviews, opinion, columns, analysis, long reads, photo essays, cartoons, letters — Ottawa Civic Ledger's editorial hub." },
      { property: "og:title", content: "Editorial — Ottawa Civic Ledger" },
    ],
  }),
  component: EditorialHub,
});

function EditorialHub() {
  const { locale } = useLocale();
  const featuredInterview = listByType("interview")[0];
  const latestOpinion = listByType("opinion")[0];
  const latestAnalysis = listByType("analysis")[0];
  const cartoon = listByType("cartoon")[0];
  const longReads = listByType("investigation").concat(listByType("essay")).slice(0, 2);
  const photoEssays = listByType("photo-essay").slice(0, 3);
  const satire = listByType("satire")[0];
  const communityVoices = listByType("community-voice").slice(0, 2);
  const letters = approvedLetters().slice(0, 3);

  return (
    <PageShell>
      <EditorialSubnav />

      <header className="mb-12 max-w-4xl">
        <div className="kicker text-civic-red">Editorial</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[1] tracking-tight mt-2">A magazine for the civic life of Ottawa.</h1>
        <p className="font-serif text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl">
          Interviews, opinion, columns, analysis, photo essays, cartoons and long reads — verified, bilingual, and paid for by readers.
        </p>
      </header>

      {/* Featured interview */}
      {featuredInterview && (
        <section className="grid lg:grid-cols-12 gap-8 border-t-2 border-ink pt-10">
          <Link to={articleHref(featuredInterview) as any} className="lg:col-span-7 group">
            <NewsImage src={featuredInterview.hero?.src || "newsprint:#1f3a4a"} headline={featuredInterview.title.en} alt="" className="w-full aspect-[4/3] object-cover" />
          </Link>
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="kicker text-civic-red">Featured Interview</div>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mt-3">
              <Link to={articleHref(featuredInterview) as any} className="hover:text-civic-red">{featuredInterview.title[locale]}</Link>
            </h2>
            <p className="font-serif text-lg text-muted-foreground mt-4">{featuredInterview.dek[locale]}</p>
            <blockquote className="font-display italic text-xl md:text-2xl border-l-4 border-civic-red pl-4 mt-6">
              "{(featuredInterview as any).key_quote?.[locale]}"
            </blockquote>
          </div>
        </section>
      )}

      {/* Opinion + Analysis band */}
      <section className="grid md:grid-cols-2 gap-10 mt-16 border-t border-rule pt-10">
        {latestOpinion && (
          <div>
            <div className="kicker text-civic-red mb-3">Latest Opinion</div>
            <EditorialCard a={latestOpinion} size="lg" />
          </div>
        )}
        {latestAnalysis && (
          <div>
            <div className="kicker text-civic-red mb-3">Latest Analysis</div>
            <EditorialCard a={latestAnalysis} size="lg" />
          </div>
        )}
      </section>

      {/* Columns strip */}
      <section className="mt-16 border-t border-rule pt-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-3xl">Columns</h2>
          <Link to="/columns" className="text-xs uppercase tracking-wider font-semibold hover:text-civic-red">All columns →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {COLUMNS.map(c => {
            const columnist = getAuthor(c.columnist_id);
            return (
              <Link key={c.slug} to="/columns/$slug" params={{ slug: c.slug }} className="block p-5 border border-ink hover:bg-secondary">
                <div className="kicker text-civic-red">Column · {c.cadence}</div>
                <h3 className="font-display text-2xl mt-2">{locale === "fr" ? c.name_fr : c.name_en}</h3>
                <p className="font-serif text-sm text-muted-foreground mt-2">{locale === "fr" ? c.description_fr : c.description_en}</p>
                {columnist && <div className="text-xs uppercase tracking-wider mt-3">By {columnist.name}</div>}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cartoon of the week */}
      {cartoon && (
        <section className="mt-16 border-t-2 border-ink pt-10">
          <div className="kicker text-civic-red mb-3">Cartoon of the week</div>
          <Link to={articleHref(cartoon) as any} className="block border-4 border-ink">
            <NewsImage src={(cartoon as any).image.src} headline={cartoon.title.en} alt={(cartoon as any).alt_text[locale]} className="w-full aspect-[16/9] object-cover" />
          </Link>
          <div className="mt-3 font-serif italic text-muted-foreground">{(cartoon as any).caption[locale]}</div>
        </section>
      )}

      {/* Long Reads */}
      {longReads.length > 0 && (
        <section className="mt-16 border-t border-rule pt-10">
          <h2 className="font-display text-3xl mb-6">Long reads & investigations</h2>
          <div className="grid md:grid-cols-2 gap-10">{longReads.map(a => <EditorialCard key={a.slug} a={a} size="lg" />)}</div>
        </section>
      )}

      {/* Photo essays */}
      {photoEssays.length > 0 && (
        <section className="mt-16 border-t border-rule pt-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-3xl">Photo essays</h2>
            <Link to="/photo-essays" className="text-xs uppercase tracking-wider font-semibold hover:text-civic-red">All photo essays →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">{photoEssays.map(a => <EditorialCard key={a.slug} a={a} />)}</div>
        </section>
      )}

      {/* Satire */}
      {satire && (
        <section className="mt-16 border-t-4 border-[#b48a00] pt-10">
          <div className="kicker text-[#8a6800] mb-3">Satire & Humor — not real news</div>
          <EditorialCard a={satire} size="lg" />
        </section>
      )}

      {/* Community + Letters */}
      <section className="mt-16 grid md:grid-cols-2 gap-10 border-t border-rule pt-10">
        <div>
          <h2 className="font-display text-2xl mb-4">Community voices</h2>
          <div className="space-y-6">{communityVoices.map(a => <EditorialCard key={a.slug} a={a} size="sm" />)}</div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl">Letters from readers</h2>
            <Link to="/letters" className="text-xs uppercase tracking-wider font-semibold hover:text-civic-red">Write a letter →</Link>
          </div>
          <ul className="space-y-4">
            {letters.map(l => (
              <li key={l.slug} className="border-b border-rule pb-4">
                <Link to="/letters/$slug" params={{ slug: l.slug }} className="font-display text-lg hover:text-civic-red">{l.title[locale]}</Link>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">— {l.writer_display_name}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Op-Docs future */}
      {OP_DOCS.length > 0 && (
        <section className="mt-16 border-t border-rule pt-10">
          <div className="kicker text-civic-red mb-3">Op-Docs — coming this season</div>
          <div className="grid md:grid-cols-2 gap-8">{OP_DOCS.map(a => <EditorialCard key={a.slug} a={a} size="md" />)}</div>
        </section>
      )}
    </PageShell>
  );
}
