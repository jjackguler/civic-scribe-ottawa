/**
 * The Newsroom article page: our headline, our text, our cover, our voice,
 * with every fact tied to the outlet that reported it.
 *
 * Built from the Dispatch page's parts (DispatchArticle.tsx): "In 30
 * seconds", the reading-depth switch, "Who reported what", Listen, Report an
 * error and Your take. Added here: the byline and AI label, the typographic
 * cover, section headings, our own background pages, FAQ, further reading
 * and related articles.
 */
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, ExternalLink } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { useLocale } from "@/lib/locale-context";
import { timeAgo, useNow } from "@/lib/news";
import { localePath } from "@/lib/seo";
import { splitMarkers, stripMarkers, type DispatchSource } from "@/lib/dispatch";
import { BYLINE, FORMAT_LABEL, SECTION_HEADING, TOPIC_KICKER, type NewsroomArticle, type NewsroomSummary } from "@/lib/newsroom";
import type { Locale } from "@/lib/i18n";
import { NewsroomCover } from "./NewsroomCover";
import { NewsroomGrid } from "./NewsroomLead";
import { keepNames, listOutlets } from "./Dispatch";
import { Chip, DepthSwitch, EaseHeight, Ledger, Listen, ReportError, ThirtySeconds, clock, useDepth } from "./DispatchArticle";
import { YourTake } from "./YouthKit";
import { ShareBar } from "./ShareBar";
import { ArticleTools } from "./MobileApp";

const COPY = {
  en: {
    word: "Newsroom",
    by: "By",
    reportedBy: "Reported by",
    label: (o: string, m: string) => `Written with AI (${m}) by our newsroom, checked against the reporting of ${o}.`,
    how: "How our newsroom works",
    story: "The story",
    expert: "For specialists",
    plainNote: "The plain version: the same news in everyday words.",
    unfolded: "How it unfolded",
    unfoldedSub: "Times as the sources state them.",
    sources: "Sources",
    sourcesSub: "Every fact in this article comes from these reports. Read them in full.",
    readAt: "Read at",
    reported: "Published",
    official: "Own announcement",
    faq: "Questions readers ask",
    further: "On AI Broadsheet",
    furtherSub: "Our own guides for the background.",
    background: "Background from our guide",
    related: "More from our newsroom",
    words: (n: number) => `${Math.max(1, Math.round(n / 220))} min read`,
    published: "Published",
    updated: "Updated",
  },
  fr: {
    word: "Rédaction",
    by: "Par la",
    reportedBy: "D'après les reportages de",
    label: (o: string, m: string) => `Écrit avec l'IA (${m}) par notre salle de rédaction, vérifié contre les reportages de ${o}.`,
    how: "Comment travaille notre rédaction",
    story: "L'article",
    expert: "Pour les spécialistes",
    plainNote: "La version simple : la même nouvelle, en mots de tous les jours.",
    unfolded: "Le déroulement",
    unfoldedSub: "Les moments tels que les sources les donnent.",
    sources: "Sources",
    sourcesSub: "Chaque fait de cet article vient de ces reportages. Lisez-les en entier.",
    readAt: "Lire sur",
    reported: "Publié",
    official: "Annonce officielle",
    faq: "Les questions des lecteurs",
    further: "Sur AI Broadsheet",
    furtherSub: "Nos propres guides, pour le contexte.",
    background: "Contexte tiré de notre guide",
    related: "Autres articles de la rédaction",
    words: (n: number) => `${Math.max(1, Math.round(n / 220))} min de lecture`,
    published: "Publié",
    updated: "Mis à jour",
  },
} as const;

const MODEL = { claude: "Claude", gemini: "Gemini" } as const;

function longDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { timeZone: "America/Toronto", year: "numeric", month: "long", day: "numeric" });
}

/** A paragraph with its source badges ([s1] → the outlet) and background links ([b1] → our guide). */
function Para({ p, bySrc, bg }: { p: string; bySrc: Map<string, DispatchSource>; bg: Map<string, { path: string; title: string }> }) {
  const { locale } = useLocale();
  return (
    <p>
      {splitMarkers(p).map((run, i) => {
        const srcs = run.keys.map(k => bySrc.get(k)).filter((s): s is DispatchSource => !!s);
        const refs = run.keys.map(k => bg.get(k)).filter((b): b is { path: string; title: string } => !!b);
        if (srcs.length + refs.length === 0) return <span key={i}>{run.text}</span>;
        // The last word travels with its badges so a badge never starts a line on its own.
        const m = run.text.match(/^([\s\S]*?)(\S+)$/);
        return (
          <span key={i}>
            {m ? m[1] : run.text}
            <span className="whitespace-nowrap">
              {m ? m[2] : ""}
              {srcs.map(s => (
                <a key={s.key} href={s.url} target="_blank" rel="noopener" title={s.outlet} aria-label={`${locale === "fr" ? "Source :" : "Source:"} ${s.outlet}`}
                  className="ml-1 inline-flex h-[1.25em] min-w-[1.25em] -translate-y-[0.15em] items-center justify-center rounded-full bg-night px-1 align-middle font-sans text-[0.68em] font-bold text-white no-underline hover:bg-lake">
                  {s.key.slice(1)}
                </a>
              ))}
              {refs.map(b => (
                <a key={b.path} href={localePath(b.path, locale)} title={b.title}
                  className="ml-1 inline-flex h-[1.25em] -translate-y-[0.15em] items-center gap-0.5 rounded-full border border-lake px-1.5 align-middle font-sans text-[0.66em] font-bold text-lake no-underline hover:bg-lake hover:text-white">
                  <BookOpen className="h-[1em] w-[1em]" aria-hidden="true" />{locale === "fr" ? "Guide" : "Guide"}
                </a>
              ))}
            </span>
          </span>
        );
      })}
    </p>
  );
}

function Timeline({ a, locale }: { a: NewsroomArticle; locale: Locale }) {
  const L = COPY[locale];
  const c = a[locale];
  const bySrc = new Map(a.sources.map(s => [s.key, s]));
  if (c.timeline.length === 0) return null;
  return (
    <section aria-labelledby="nr-unfold-h">
      <h2 id="nr-unfold-h" className="hl text-[1.2rem]">{L.unfolded}</h2>
      <p className="meta mt-1">{L.unfoldedSub}</p>
      <ol className="mt-4 relative border-l-2 border-night pl-5 grid gap-5">
        {c.timeline.map((e, i) => (
          <li key={i} className="relative">
            <span aria-hidden="true" className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-night bg-signal" />
            <p className="text-[0.85rem] font-bold text-brass-ink">{e.when}</p>
            <p className="mt-0.5 leading-snug">{e.text}</p>
            <p className="mt-2 flex flex-wrap gap-1.5">{e.src.map(k => bySrc.get(k) && <Chip key={k} s={bySrc.get(k)!} />)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Block({ id, title, sub, children, className = "" }: { id: string; title: string; sub?: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="hl text-[1.2rem]">{title}</h2>
      {sub && <p className="meta mt-1">{sub}</p>}
      {children}
    </section>
  );
}

/** "Written with AI by our newsroom, checked against the reporting of …" — on every article. */
export function NewsroomLabel({ a, dark = false, className = "" }: { a: NewsroomArticle; dark?: boolean; className?: string }) {
  const { locale } = useLocale();
  const outlets = listOutlets([...new Set(a.sources.map(s => s.outlet))], locale);
  return (
    <p className={`text-[0.92rem] leading-snug ${dark ? "text-white/80" : "text-muted-ink"} ${className}`}>
      {COPY[locale].label(outlets, MODEL[a.model] ?? "AI")}{" "}
      <Link to="/standards" hash="newsroom" className={`font-semibold underline underline-offset-2 ${dark ? "text-signal" : "text-lake"} hover:no-underline`}>{COPY[locale].how}</Link>
    </p>
  );
}

export function NewsroomArticleView({ a, related }: { a: NewsroomArticle; related: NewsroomSummary[] }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const c = a[locale];
  const now = useNow();
  const [depth, setDepth] = useDepth();
  const bySrc = useMemo(() => new Map(a.sources.map(s => [s.key, s])), [a]);
  const bg = useMemo(() => new Map(a.background.map(b => [b.key, { path: b.path, title: b.title[locale] }])), [a, locale]);
  const sources = [...a.sources].sort((x, y) => x.publishedAt.localeCompare(y.publishedAt));
  const outlets = [...new Set(sources.map(s => s.outlet))];
  const words = c.sections.flatMap(s => s.paras);
  // The depth switch measures each depth's length; "expert" is the article plus the specialists' notes.
  const depthBody = { plain: c.body.plain, standard: words, expert: [...words, ...c.body.expert] };
  const spoken = useMemo(() => [
    locale === "fr" ? "Un article de la salle de rédaction d'AI Broadsheet, écrit avec l'IA." : "An AI Broadsheet Newsroom article, written with AI.",
    `${c.headline}.`, c.dek, ...words.map(stripMarkers),
    `${L.reportedBy} ${listOutlets(outlets, locale)}.`,
  ].join("\n\n").slice(0, 4000), [c, words, outlets, locale, L]);

  const further = [
    ...a.background.map(b => ({ path: b.path, label: b.title[locale] })),
    ...c.links,
  ].filter((x, i, all) => all.findIndex(y => y.path === x.path) === i).slice(0, 5);

  const sectionsView = (
    <div className="prose-mw nr-prose mt-6">
      {c.sections.map(s => (
        <div key={s.kind} data-kind={s.kind}>
          {SECTION_HEADING[s.kind][locale] && <h2>{SECTION_HEADING[s.kind][locale]}</h2>}
          {s.kind === "background" && <p className="text-[0.85rem]! font-sans! font-semibold! text-muted-ink! mb-2!">{L.background}</p>}
          {s.paras.map((p, i) => <Para key={i} p={p} bySrc={bySrc} bg={bg} />)}
        </div>
      ))}
    </div>
  );

  return (
    <article lang={locale === "fr" ? "fr-CA" : "en-CA"} className="nr-article">
      <header className="bg-night text-white">
        <div className="container-mw pt-7 pb-8 sm:pt-10 sm:pb-11">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.85rem] font-bold">
            <Link to="/dispatch" className="bg-signal text-signal-ink px-2 py-0.5 hover:bg-white">{L.word}</Link>
            <span className="text-brass">{FORMAT_LABEL[a.format][locale]}</span>
            {TOPIC_KICKER[a.topic] && <span className="text-white/70">{TOPIC_KICKER[a.topic][locale]}</span>}
            <time dateTime={a.createdAt} className="font-semibold text-white/70" suppressHydrationWarning>{timeAgo(a.createdAt, now, locale)}</time>
          </p>
          <div className="mt-5 grid gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start">
            <div className="min-w-0">
              <h1 className="hl text-[2.05rem] sm:text-[2.9rem] lg:text-[3.45rem] leading-[1.02] max-w-[22ch]">{keepNames(c.headline)}</h1>
              {c.dek && <p className="mt-5 max-w-[60ch] font-serif text-[1.2rem] sm:text-[1.35rem] leading-snug text-white/90">{c.dek}</p>}
              <div className="mt-6 border-l-[4px] border-signal pl-4 text-[0.92rem] leading-relaxed">
                <p>
                  <span className="text-white/70">{L.by} </span>
                  <Link to="/standards" hash="newsroom" className="font-bold text-white hover:underline">{BYLINE[locale]}</Link>
                  <span className="text-white/50"> · </span>
                  <span className="text-white/70">{L.words(a.words[locale])}</span>
                </p>
                <p className="text-white/70" suppressHydrationWarning>
                  {L.published} <time dateTime={a.createdAt}>{longDate(a.createdAt, locale)}</time>
                  {a.updatedAt.slice(0, 16) !== a.createdAt.slice(0, 16) && <> · {L.updated} <time dateTime={a.updatedAt}>{longDate(a.updatedAt, locale)}</time></>}
                </p>
                <p className="mt-1">
                  <span className="text-white/70">{L.reportedBy} </span>
                  <a href="#sources" className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">{listOutlets(outlets, locale)}</a>
                </p>
              </div>
            </div>
            <div className="grid gap-4 min-w-0">
              <NewsroomCover cover={a.cover} locale={locale} size="hero" animate className="ring-1 ring-white/15" />
              <Listen d={a} audio={false} text={spoken} />
            </div>
          </div>
          <NewsroomLabel a={a} dark className="mt-7 max-w-[80ch]" />
        </div>
      </header>

      <div className="container-mw pt-9 sm:pt-12">
        <ArticleTools title={c.headline} summary={c.dek} source="AI Broadsheet Newsroom" publishedAt={a.createdAt} />
        <ThirtySeconds lines={c.thirty} />
      </div>

      <div className="container-mw pt-12 sm:pt-14 grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 max-w-[760px]">
          {a.format === "timeline" && <Timeline a={a} locale={locale} />}
          <section aria-labelledby="nr-story-h" className={a.format === "timeline" ? "mt-12" : ""}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="nr-story-h" className="masthead-serif text-[1.75rem] sm:text-[2.05rem] leading-tight">{L.story}</h2>
              <DepthSwitch value={depth} onChange={setDepth} body={depthBody} />
            </div>
            <EaseHeight k={depth}>
              {depth === "plain" ? (
                <div className="prose-mw nr-prose mt-6">
                  <p className="text-[0.9rem]! font-sans! text-muted-ink!">{L.plainNote}</p>
                  {c.body.plain.map((p, i) => <Para key={i} p={p} bySrc={bySrc} bg={bg} />)}
                </div>
              ) : (
                <>
                  {sectionsView}
                  {depth === "expert" && c.body.expert.length > 0 && (
                    <div className="prose-mw nr-prose mt-2 border-l-[4px] border-brass pl-5">
                      <h2 className="mt-2!">{L.expert}</h2>
                      {c.body.expert.map((p, i) => <Para key={i} p={p} bySrc={bySrc} bg={bg} />)}
                    </div>
                  )}
                </>
              )}
            </EaseHeight>
          </section>

          <div className="mt-6 border-t border-line pt-5 grid gap-3">
            <NewsroomLabel a={a} />
            <ReportError title={c.headline} />
          </div>
        </div>

        <aside className="min-w-0 grid gap-10 content-start">
          {a.format !== "timeline" && <Timeline a={a} locale={locale} />}
          <Block id="nr-sources-h" title={L.sources} sub={L.sourcesSub}>
            <ol id="sources" className="mt-3 scroll-mt-24">
              {sources.map(s => (
                <li key={s.key} className="py-3 border-b border-line">
                  <a href={s.url} target="_blank" rel="noopener" className="group flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-night px-1.5 text-[0.78rem] font-bold text-white tabular-nums">{s.key.slice(1)}</span>
                    <span className="min-w-0">
                      <span className="block font-bold text-[0.92rem]">{s.outlet}{s.official && <span className="ml-2 text-[0.75rem] font-semibold text-brass-ink">{L.official}</span>}</span>
                      <span className="block leading-snug group-hover:underline" lang={s.lang === "fr" ? "fr" : "en"}>{s.title}</span>
                      <time dateTime={s.publishedAt} className="meta mt-1 block" suppressHydrationWarning>{L.reported} {clock(s.publishedAt, locale)}</time>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-lake">{L.readAt} {s.outlet}<ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </Block>
          {further.length > 0 && (
            <Block id="nr-further-h" title={L.further} sub={L.furtherSub}>
              <ul className="mt-3 grid gap-2">
                {further.map(l => (
                  <li key={l.path}>
                    <a href={localePath(l.path, locale)} className="group flex items-start justify-between gap-3 border border-line bg-surface p-3 hover:border-night">
                      <span className="font-semibold leading-snug group-hover:underline">{l.label}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-lake" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </aside>
      </div>

      <div className="container-mw pt-12 sm:pt-14">
        <div className="relative pt-3 border-t-[3px] border-night">
          <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
          <Ledger d={a} />
        </div>
      </div>

      <div className="container-mw pt-12 sm:pt-14 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 max-w-[760px]">
          {c.faq.length > 0 && (
            <section aria-labelledby="nr-faq-h" id="faq">
              <h2 id="nr-faq-h" className="masthead-serif text-[1.75rem] sm:text-[2.05rem] leading-tight">{L.faq}</h2>
              <div className="mt-4 border-t-[3px] border-night">
                {c.faq.map((f, i) => (
                  <details key={i} className="nr-faq group border-b border-line" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 font-bold text-[1.08rem] leading-snug [&::-webkit-details-marker]:hidden">
                      <span>{f.q}</span>
                      <span aria-hidden="true" className="nr-faq-mark mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-night text-[0.9rem] leading-none">+</span>
                    </summary>
                    <p className="pb-5 font-serif text-[1.12rem] leading-relaxed max-w-[64ch]">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
          <ShareBar url={`/article/${a.slug[locale]}`} title={c.headline} text={`${c.headline}\n${c.dek}`} campaign="article" className={c.faq.length > 0 ? "mt-12" : "mt-6"} />
          <YourTake dispatchId={a.id} headline={c.headline} className="mt-6" />
        </div>
      </div>

      {related.length > 0 && (
        <div className="container-mw pt-14">
          <h2 className="masthead-serif text-[1.75rem] sm:text-[2.05rem] leading-tight mb-5">{L.related}</h2>
          <NewsroomGrid items={related} columns={4} />
        </div>
      )}
    </article>
  );
}
