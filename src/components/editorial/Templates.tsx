import { useLocale } from "@/lib/locale-context";
import { NewsImage } from "@/components/NewsImage";
import { getAuthor, getColumn, entriesForColumn } from "@/lib/editorial-data";
import {
  ArticleHeader, AuthorCard, PullQuote, SectionDivider, SourcesList,
  MethodologyBox, CorrectionsBox, LettersCTA, DonationInlineCTA, RelatedRail,
  MediaPlaceholder, EditorNote, EditorialLabelChip,
} from "./EditorialPrimitives";
import type {
  AnyEditorial, InterviewArticle, OpinionArticle, ColumnEntry, AnalysisArticle,
  EssayArticle, CartoonArticle, SatireArticle, PhotoEssayArticle,
  InvestigationArticle, ExplainerArticle, SolutionArticle, OpDocArticle,
  CommunityVoiceArticle, NewsArticle, LetterArticle,
} from "@/types/editorial";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Film, PlayCircle } from "lucide-react";
import { useState } from "react";

// ───────────────── Shared body ─────────────────
function Prose({ blocks }: { blocks: { en: string; fr: string }[] }) {
  const { locale } = useLocale();
  if (!blocks.length) return null;
  return (
    <div className="font-serif text-lg leading-[1.75] space-y-5 text-foreground/90">
      {blocks.map((b, i) => (
        <p key={i} className={i === 0 ? "dropcap" : ""}>{b[locale]}</p>
      ))}
    </div>
  );
}

function Hero({ article }: { article: AnyEditorial }) {
  const { locale } = useLocale();
  if (!article.hero) return null;
  return (
    <figure className="my-8 -mx-4 sm:mx-0">
      <NewsImage src={article.hero.src} headline={article.title.en} alt={article.hero[locale === "fr" ? "alt_fr" : "alt_en"]} className="w-full aspect-[16/10] object-cover" />
      <figcaption className="text-xs text-muted-foreground mt-2 font-serif italic px-4 sm:px-0">
        {article.hero.credit} · {article.hero.rights_status.replace("-", " ")}
      </figcaption>
    </figure>
  );
}

function ArticleFooter({ article }: { article: AnyEditorial }) {
  return (
    <>
      <CorrectionsBox corrections={article.corrections} />
      <SourcesList sources={article.sources} />
      {article.donation_cta && <DonationInlineCTA />}
      <LettersCTA article={article} />
      <SectionDivider />
      {article.byline_author_ids.map(id => {
        const a = getAuthor(id);
        return a ? <div key={id} className="mb-4"><AuthorCard author={a} /></div> : null;
      })}
      <RelatedRail slugs={article.related_slugs} />
    </>
  );
}

// ───────────────── News ─────────────────
export function NewsTemplate({ a }: { a: NewsArticle }) {
  return (
    <article className="max-w-3xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <Prose blocks={a.body_blocks} />
      {a.pull_quote && <PullQuote>{useLocale().locale === "fr" ? a.pull_quote.fr : a.pull_quote.en}</PullQuote>}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Interview ─────────────────
export function InterviewTemplate({ a }: { a: InterviewArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-3xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <section className="my-8 flex items-center gap-4 p-5 border-l-4 border-river bg-secondary">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-rule">
          <NewsImage src={a.person.portrait?.src || a.hero?.src || "newsprint:#1f3a4a"} headline={a.person.name} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="kicker text-river">Interview subject</div>
          <h3 className="font-display text-2xl">{a.person.name}</h3>
          <p className="text-sm text-muted-foreground">{a.person.role}{a.person.neighborhood ? ` · ${a.person.neighborhood}` : ""}</p>
        </div>
      </section>
      <p className="font-serif text-lg italic text-muted-foreground border-b border-rule pb-6">{a.intro[locale]}</p>
      <div className="my-8 space-y-7">
        {a.qa.map((qa, i) => (
          <div key={i}>
            <p className="font-display text-lg font-bold leading-snug">
              <span className="text-civic-red mr-2">Q.</span>{qa.q[locale]}
            </p>
            <p className="font-serif text-lg leading-[1.7] mt-2 pl-6 border-l-2 border-rule">
              <span className="text-civic-red mr-2 font-bold">A.</span>{qa.a[locale]}
            </p>
          </div>
        ))}
      </div>
      <PullQuote>{a.key_quote[locale]}</PullQuote>
      {(a.audio_placeholder || a.video_placeholder) && (
        <MediaPlaceholder kind={a.video_placeholder ? "video" : "audio"} label={locale === "fr" ? "Enregistrement à venir." : "Recording coming soon."} />
      )}
      {a.transcript && (
        <details className="mt-8 border border-rule p-4">
          <summary className="cursor-pointer kicker">Transcript</summary>
          <div className="mt-3 font-serif text-sm text-muted-foreground">{a.transcript[locale]}</div>
        </details>
      )}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Opinion ─────────────────
export function OpinionTemplate({ a }: { a: OpinionArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-6 p-4 border-2 border-civic-red bg-civic-red/5">
        <div className="flex items-center gap-2 text-civic-red font-bold uppercase tracking-[0.18em] text-xs">
          <AlertTriangle className="h-4 w-4" /> Opinion — this is commentary, not news reporting
        </div>
      </div>
      <ArticleHeader article={a} />
      <Hero article={a} />
      <Prose blocks={a.body_blocks} />
      {a.pull_quote && <PullQuote>{a.pull_quote[locale]}</PullQuote>}
      <EditorNote>
        <p><strong>Author disclosure:</strong> {a.author_disclosure[locale]}</p>
        {a.conflict_note && <p className="mt-2"><strong>Conflict note:</strong> {a.conflict_note[locale]}</p>}
      </EditorNote>
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Column ─────────────────
export function ColumnTemplate({ a }: { a: ColumnEntry }) {
  const { locale } = useLocale();
  const col = getColumn(a.column_slug);
  const others = entriesForColumn(a.column_slug).filter(e => e.slug !== a.slug).slice(0, 4);
  return (
    <article className="max-w-3xl mx-auto">
      {col && (
        <Link to="/columns/$slug" params={{ slug: col.slug }} className="block mb-6 p-4 border border-ink hover:bg-secondary">
          <div className="kicker text-civic-red">Column · {col.cadence}</div>
          <div className="font-display text-2xl">{locale === "fr" ? col.name_fr : col.name_en}</div>
          <p className="text-sm font-serif text-muted-foreground mt-1">{locale === "fr" ? col.description_fr : col.description_en}</p>
        </Link>
      )}
      <ArticleHeader article={a} />
      <Hero article={a} />
      <Prose blocks={a.body_blocks} />
      {others.length > 0 && (
        <section className="mt-12 border-t-2 border-ink pt-6">
          <h3 className="kicker mb-4">More from this column</h3>
          <ul className="space-y-3">
            {others.map(o => (
              <li key={o.slug}>
                <Link to="/columns/$slug/$entry" params={{ slug: a.column_slug, entry: o.slug }} className="block hover:text-civic-red">
                  <div className="font-display text-lg">{o.title[locale]}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.publishedAt).toLocaleDateString()}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Analysis ─────────────────
export function AnalysisTemplate({ a }: { a: AnalysisArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-3xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <aside className="my-8 p-6 bg-secondary border-l-4 border-ink">
        <h3 className="kicker mb-3">Key findings</h3>
        <ul className="space-y-2 font-serif text-base">
          {a.key_findings.map((k, i) => <li key={i} className="flex gap-2"><span className="text-civic-red font-bold">·</span>{k[locale]}</li>)}
        </ul>
      </aside>
      <Prose blocks={a.body_blocks} />
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Essay ─────────────────
export function EssayTemplate({ a }: { a: EssayArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-2xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <Prose blocks={a.body_blocks} />
      {a.pull_quote && <PullQuote>{a.pull_quote[locale]}</PullQuote>}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Cartoon ─────────────────
export function CartoonTemplate({ a }: { a: CartoonArticle }) {
  const { locale } = useLocale();
  const artist = getAuthor(a.artist_id);
  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center gap-3">
        <EditorialLabelChip label="CARTOON" />
        <span className="kicker text-muted-foreground">Satire · editorial illustration</span>
      </div>
      <h1 className="font-display text-4xl md:text-6xl">{a.title[locale]}</h1>
      <p className="font-serif text-lg text-muted-foreground mt-2">{a.dek[locale]}</p>
      <figure className="my-8 border-4 border-ink bg-paper">
        <NewsImage src={a.image.src} headline={a.title.en} alt={a.alt_text[locale]} className="w-full aspect-[4/3] object-cover" />
        <figcaption className="p-4 font-serif text-base">
          <strong>{a.caption[locale]}</strong>
          <span className="block text-xs uppercase tracking-wider text-muted-foreground mt-2">
            By {artist?.name || "Staff cartoonist"} · {new Date(a.publishedAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
          </span>
        </figcaption>
      </figure>
      <details className="mt-4 border border-rule p-4">
        <summary className="cursor-pointer kicker">Accessibility description</summary>
        <p className="mt-2 font-serif text-sm">{a.alt_text[locale]}</p>
      </details>
      <div className="mt-6 p-4 border-2 border-ink bg-secondary text-sm font-serif">
        This is a cartoon. It is editorial commentary, not factual reporting.
      </div>
      {artist && <div className="mt-8"><AuthorCard author={artist} /></div>}
    </article>
  );
}

// ───────────────── Satire ─────────────────
export function SatireTemplate({ a }: { a: SatireArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-6 p-4 border-4 border-[#b48a00] bg-[#fff7d6] text-ink">
        <div className="flex items-center gap-2 font-bold uppercase tracking-[0.18em] text-xs">
          <AlertTriangle className="h-4 w-4" /> Satire — this is humor, not real news
        </div>
      </div>
      <ArticleHeader article={a} />
      <Hero article={a} />
      <Prose blocks={a.body_blocks} />
      <div className="mt-8 p-4 border-2 border-[#b48a00] bg-[#fff7d6] text-sm font-serif text-ink">
        Reminder: this piece is satire. Nothing above happened.
      </div>
    </article>
  );
}

// ───────────────── Photo Essay ─────────────────
export function PhotoEssayTemplate({ a }: { a: PhotoEssayArticle }) {
  const { locale } = useLocale();
  const photographer = getAuthor(a.photographer_id);
  return (
    <article className="max-w-5xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <div className="my-10 space-y-12">
        {a.photos.map((p, i) => (
          <figure key={p.id} className={i % 3 === 0 ? "" : "max-w-3xl mx-auto"}>
            <NewsImage src={p.src} headline={p.alt_en} alt={locale === "fr" ? p.alt_fr : p.alt_en} className="w-full aspect-[3/2] object-cover" />
            <figcaption className="text-sm font-serif mt-2 italic text-muted-foreground">
              {locale === "fr" ? p.caption_fr : p.caption_en}
              <span className="block text-[10px] uppercase tracking-wider not-italic mt-1">
                {p.credit} · {p.rights_status.replace("-", " ")}{p.consent_status ? ` · consent: ${p.consent_status}` : ""}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      {photographer && <div className="mt-8"><AuthorCard author={photographer} /></div>}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Investigation / Long Read ─────────────────
export function InvestigationTemplate({ a }: { a: InvestigationArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-4xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <nav className="my-8 p-5 bg-secondary border-l-4 border-civic-red">
        <h3 className="kicker mb-3">Chapters</h3>
        <ol className="space-y-1 text-sm font-serif">
          {a.chapters.map((c, i) => (
            <li key={c.id}><a href={`#${c.id}`} className="hover:text-civic-red"><span className="text-civic-red font-bold">{String(i + 1).padStart(2, "0")}.</span> {c.title[locale]}</a></li>
          ))}
        </ol>
      </nav>
      {a.chapters.map((c, i) => (
        <section key={c.id} id={c.id} className="mt-12">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-display text-5xl text-civic-red">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="font-display text-3xl">{c.title[locale]}</h2>
          </div>
          <Prose blocks={c.body_blocks} />
        </section>
      ))}
      <MethodologyBox>{a.methodology[locale]}</MethodologyBox>
      {a.documents && (
        <section className="mt-8 p-5 bg-secondary">
          <h3 className="kicker mb-3">Documents & evidence</h3>
          <ul className="space-y-1 text-sm font-serif">
            {a.documents.map((d, i) => <li key={i}>· {d.url ? <a className="underline" href={d.url}>{d.label}</a> : d.label}</li>)}
          </ul>
        </section>
      )}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Explainer ─────────────────
export function ExplainerTemplate({ a }: { a: ExplainerArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-3xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <div className="my-8 space-y-4">
        {a.questions.map((qa, i) => (
          <details key={i} className="border border-rule p-5 open:bg-secondary">
            <summary className="cursor-pointer font-display text-xl">{qa.q[locale]}</summary>
            <p className="mt-3 font-serif text-base leading-relaxed">{qa.a[locale]}</p>
          </details>
        ))}
      </div>
      {a.glossary && (
        <section className="mt-10 p-5 bg-secondary">
          <h3 className="kicker mb-3">Glossary</h3>
          <dl className="space-y-2 text-sm font-serif">
            {a.glossary.map((g, i) => (
              <div key={i}><dt className="font-bold inline">{g.term[locale]}:</dt> <dd className="inline">{g.def[locale]}</dd></div>
            ))}
          </dl>
        </section>
      )}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Solution ─────────────────
export function SolutionStoryTemplate({ a }: { a: SolutionArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-3xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <section className="my-8 p-5 border-l-4 border-civic-red bg-secondary">
        <div className="kicker text-civic-red">The problem</div>
        <p className="font-serif text-lg mt-2">{a.problem[locale]}</p>
      </section>
      <section className="my-8">
        <div className="kicker text-solution mb-3">What the evidence shows</div>
        <ul className="space-y-3 font-serif text-base">
          {a.evidence.map((e, i) => <li key={i} className="flex gap-3"><span className="text-solution font-bold">›</span>{e[locale]}</li>)}
        </ul>
      </section>
      <section className="my-8 p-5 border-2 border-solution">
        <div className="kicker text-solution">Local application</div>
        <p className="font-serif text-lg mt-2">{a.local_application[locale]}</p>
      </section>
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Op-Doc ─────────────────
export function OpDocTemplate({ a }: { a: OpDocArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-4xl mx-auto">
      <ArticleHeader article={a} />
      <div className="my-8 relative aspect-video bg-ink text-paper flex flex-col items-center justify-center border-4 border-ink">
        <Film className="h-12 w-12 mb-3 opacity-70" />
        {a.status === "coming-soon" ? (
          <>
            <div className="kicker text-paper/70">Op-Doc · in production</div>
            <h3 className="font-display text-3xl mt-2">Coming soon</h3>
          </>
        ) : (
          <PlayCircle className="h-16 w-16" />
        )}
      </div>
      {a.credits && (
        <section className="mt-6 p-4 bg-secondary text-sm font-serif"><strong>Credits.</strong> {a.credits[locale]}</section>
      )}
      {a.transcript && (
        <details className="mt-4 border border-rule p-4">
          <summary className="cursor-pointer kicker">Transcript</summary>
          <p className="mt-2 font-serif text-sm">{a.transcript[locale]}</p>
        </details>
      )}
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Community voice ─────────────────
export function CommunityVoiceTemplate({ a }: { a: CommunityVoiceArticle }) {
  return (
    <article className="max-w-3xl mx-auto">
      <ArticleHeader article={a} />
      <Hero article={a} />
      <EditorNote>This piece is in the writer's words. We edited only for length and clarity.</EditorNote>
      <Prose blocks={a.body_blocks} />
      <ArticleFooter article={a} />
    </article>
  );
}

// ───────────────── Letter ─────────────────
export function LetterTemplate({ a }: { a: LetterArticle }) {
  const { locale } = useLocale();
  return (
    <article className="max-w-2xl mx-auto">
      <div className="mb-4"><EditorialLabelChip label="LETTER" /></div>
      <h1 className="font-display text-3xl md:text-5xl">{a.title[locale]}</h1>
      <p className="font-serif text-lg text-muted-foreground mt-2">{a.dek[locale]}</p>
      <blockquote className="my-8 border-l-4 border-ink pl-6 font-serif text-lg leading-[1.8] italic">
        {a.body[locale]}
      </blockquote>
      <div className="text-sm text-muted-foreground">— {a.writer_display_name}{a.neighborhood ? `, ${a.neighborhood}` : ""}</div>
      {a.editor_response && (
        <section className="mt-8 p-5 bg-secondary">
          <div className="kicker text-civic-red">Editor's reply</div>
          <p className="font-serif mt-2">{a.editor_response[locale]}</p>
        </section>
      )}
    </article>
  );
}
