import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ExternalLink, Link2, Check, Flag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { StoryCard, StoryLink, StoryMeta, CoverageBadge, storyKicker } from "@/components/StoryCard";
import { StoryImage } from "@/components/StoryImage";
import { ArticleTools } from "@/components/MobileApp";
import { AdSlot } from "@/components/AdSlot";
import { LatestRail } from "@/components/LatestRail";
import { NewsletterBox } from "@/components/NewsletterBox";
import { ExplainLike12 } from "@/components/YouthKit";
import { getAiNewsFast, useAiNews, byLocale, diversify, clusterStories, isDeveloping, isBreaking, isFrontPool, display, inSection } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { editorMailto } from "@/lib/contact";
import { seoHead, publisherRef, DEFAULT_OG_IMAGE, localeOf } from "@/lib/seo";

export const Route = createFileRoute("/story/$id")({
  loader: async ({ params }) => {
    const payload = await getAiNewsFast();
    return { payload, story: payload?.stories.find(s => s.id === params.id) ?? null };
  },
  head: ({ match, loaderData }) => {
    const s = loaderData?.story;
    if (!s) return seoHead(match, { title: { en: `Story — ${SITE.name}`, fr: `Nouvelle — ${SITE.name}` }, description: SITE.description, noindex: true });
    // The AI desk's headline and brief (labelled on the page) when there is one.
    const ai = s.ai?.[localeOf(match)];
    const headline = ai?.title || s.title;
    const description = ai?.summary || s.summary || `${s.source}: ${s.title}`;
    return seoHead(match, {
      title: `${headline} — ${SITE.name}`,
      description,
      // A publisher's headline, excerpt and link: useful to readers, not our journalism.
      // Search engines are pointed at our own articles, guides and glossary instead.
      noindex: true,
      image: s.image,
      type: "article",
      publishedTime: s.publishedAt,
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: headline.slice(0, 110),
        description,
        url,
        mainEntityOfPage: url,
        datePublished: s.publishedAt,
        inLanguage: s.lang === "fr" ? "fr-CA" : "en",
        image: s.image ? [s.image] : [DEFAULT_OG_IMAGE],
        // The reporting is the publisher's; we credit it and link to it.
        author: { "@type": "Organization", name: s.source },
        isBasedOn: s.link,
        publisher: publisherRef,
      }],
    });
  },
  component: StoryPage,
});

function StoryPage() {
  const { id } = Route.useParams();
  const { payload, story: initialStory } = Route.useLoaderData();
  const { data } = useAiNews(payload);
  const { locale } = useLocale();
  const all = byLocale(data?.stories ?? [], locale);
  const s = all.find(x => x.id === id) ?? initialStory;
  const clusters = useMemo(() => clusterStories(all, 72), [data, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) {
    return (
      <PageShell>
        <div className="container-mw py-20 max-w-2xl">
          {!data ? (
            <p className="hl text-2xl flex items-center gap-3"><span className="live-dot" aria-hidden="true" />{t("loading", locale)}</p>
          ) : (
            <>
              <h1 className="masthead-serif text-[2.4rem] leading-tight">{locale === "fr" ? "Cette nouvelle a quitté le fil en direct" : "This story has left the live desk"}</h1>
              <p className="dek mt-3">{locale === "fr" ? "Nous gardons les nouvelles des 30 derniers jours. Les plus récentes sont à la une." : "We keep the last 30 days of stories on the desk. The newest are on the front page."}</p>
              <Link to="/" className="inline-flex mt-6 bg-night text-white px-5 py-2.5 rounded-[4px] font-semibold hover:bg-lake">{locale === "fr" ? "Aller à la une" : "Go to the front page"}</Link>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const d = display(s, locale);
  const cluster = clusters.find(c => c.stories.some(x => x.id === s.id));
  const coverage = cluster ? cluster.stories.filter(x => x.id !== s.id) : [];
  const deskId = s.tags?.[0] ?? s.topic;
  const more = diversify(all.filter(x => x.id !== s.id && !coverage.includes(x) && inSection(x, deskId)), 1, 8).slice(0, 4);
  const latest = diversify(all.filter(isFrontPool));
  const fr = locale === "fr";

  return (
    <PageShell>
      <article className="container-mw pt-8">
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 max-w-[820px]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link to="/news" search={{ section: deskId }} className="topic hover:underline">{storyKicker(s, locale)}</Link>
              {cluster && <CoverageBadge outlets={cluster.sources} developing={isDeveloping(cluster)} breaking={isBreaking(cluster)} />}
            </p>
            <h1 className="hl text-[2.1rem] sm:text-[2.9rem] lg:text-[3.3rem] leading-[1.03] mt-2">{d.title}</h1>
            {d.edited && (
              <p className="meta mt-3">
                {fr ? `Titre de la rédaction. Titre original de ${s.source} :` : `Headline by our editors. Original headline from ${s.source}:`} <span className="italic">“{s.title}”</span>
              </p>
            )}
            {d.ai && (
              <p className="meta mt-3">
                <span className="font-semibold">{fr ? "Titre et résumé du pupitre IA" : "Headline and brief by our AI desk"}</span>{" "}
                {fr ? `(Claude, à partir du seul texte des éditeurs, vérifié automatiquement). Titre original de ${s.source} :` : `(Claude, working only from the publishers' text, checked automatically). Original headline from ${s.source}:`}{" "}
                <span className="italic">“{s.title}”</span>{" "}
                <Link to="/standards" hash="ai-desk" className="text-lake font-semibold hover:underline">{fr ? "Comment ça marche" : "How this works"}</Link>
              </p>
            )}
            {d.translated && (
              <p className="meta mt-3">
                <span className="font-semibold">{fr ? "Traduit avec Claude." : "Translated with Claude."}</span>{" "}
                {fr ? `Titre original de ${s.source} :` : `Original headline from ${s.source}:`} <span className="italic">“{s.title}”</span>
              </p>
            )}
            <StoryMeta s={s} className="mt-3 text-[0.9rem]" />
            <ArticleTools title={d.title} summary={d.summary || s.summary || ''} source={s.source} publishedAt={s.publishedAt} />

            {s.image && (
              <figure className="mt-6">
                <div className="aspect-[16/9] overflow-hidden bg-ice">
                  <StoryImage src={s.image} alt="" eager className="img-cover" />
                </div>
                <figcaption className="meta mt-1.5">Photo: {s.source}</figcaption>
              </figure>
            )}

            {d.ai && d.summary && (
              <div className="mt-6 bg-surface border border-line border-t-[3px] border-t-night p-5">
                <p className="text-[0.8rem] font-bold text-muted-ink mb-1">
                  {fr ? `Résumé du pupitre IA, d'après ${d.ai.join(", ")}` : `AI desk brief, from reporting by ${d.ai.join(", ")}`}
                </p>
                <p className="reader-copy font-serif text-[1.25rem] leading-relaxed">{d.summary}</p>
              </div>
            )}
            {(d.ai ? s.summary : d.summary) && (
              <div className="mt-6 border-l-[3px] border-brass pl-5">
                <p className="text-[0.8rem] font-bold text-muted-ink mb-1">{fr ? `Extrait de ${s.source}` : `From ${s.source}`}</p>
                <p className="reader-copy font-serif text-[1.25rem] leading-relaxed">{d.ai ? s.summary : d.summary}</p>
              </div>
            )}

            {/* Shown only when one of our dispatches covers this event. */}
            <ExplainLike12 storyIds={[s.id, ...coverage.map(x => x.id)]} className="mt-6" />

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href={s.link} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-night text-white font-bold px-5 py-3 rounded-[4px] hover:bg-lake">
                {fr ? `Lire l'article complet sur ${s.source}` : `Read the full story at ${s.source}`}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <Share title={d.title} />
            </div>

            {coverage.length > 0 && (
              <section className="mt-12">
                <ZoneHead title={fr ? "Couverture complète" : "Full coverage"} sub={fr ? `Comment ${cluster!.sources} médias rapportent cette nouvelle.` : `How ${cluster!.sources} newsrooms are reporting this story.`} />
                <ul>
                  {coverage.slice(0, 10).map(x => (
                    <li key={x.id} className="py-3 border-b border-line">
                      <StoryLink s={x} className="group flex gap-4 items-start">
                        <span className="w-32 shrink-0 font-bold text-[0.9rem] text-brass-ink">{x.source}</span>
                        <span className="min-w-0">
                          <span className="block font-semibold leading-snug group-hover:underline">{display(x, locale).title}</span>
                          <StoryMeta s={x} className="mt-0.5" />
                        </span>
                      </StoryLink>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="meta mt-10 max-w-[64ch]">
              {fr
                ? `${SITE.name} réunit les nouvelles de salles de rédaction, laboratoires et gouvernements. Nous ne réécrivons pas les faits : le titre, l'extrait et la photo appartiennent à l'éditeur, crédité ci-dessus. `
                : `${SITE.name} gathers stories from newsrooms, labs and governments. We don't rewrite the facts: the headline, excerpt and photo belong to the publisher credited above. `}
              <Link to="/standards" className="text-lake font-semibold hover:underline">{fr ? "Nos normes" : "Our standards"}</Link>
            </p>
            <ReportError title={s.title} />

            {more.length > 0 && (
              <section className="mt-12">
                <ZoneHead title={fr ? `Plus dans ${storyKicker(s, locale)}` : `More in ${storyKicker(s, locale)}`} />
                <div className="grid gap-6 sm:grid-cols-2">
                  {more.map(x => <StoryCard key={x.id} s={x} variant={x.image ? "card" : "text"} showTopic={false} />)}
                </div>
              </section>
            )}
          </div>

          <aside className="min-w-0 grid gap-8 content-start [&>*]:min-w-0">
            <AdSlot size="mpu" placement="story" />
            <LatestRail stories={latest} fetchedAt={data?.fetchedAt} limit={8} />
            <div className="bg-night text-white p-5">
              <NewsletterBox variant="card" />
            </div>
          </aside>
        </div>
      </article>
    </PageShell>
  );
}

function Share({ title }: { title: string }) {
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`https://${SITE.domain}`);
  useEffect(() => setUrl(window.location.href), []);
  const btn = "inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-2.5 rounded-[4px] text-sm font-semibold hover:border-night";
  return (
    <div className="flex flex-wrap gap-2" aria-label={locale === "fr" ? "Partager" : "Share"}>
      <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>LinkedIn</a>
      <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>X</a>
      <button
        className={btn}
        onClick={() => { navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        {copied ? (locale === "fr" ? "Lien copié" : "Link copied") : (locale === "fr" ? "Copier le lien" : "Copy link")}
      </button>
    </div>
  );
}

/** "Report an error": opens an email with the page address filled in, or the corrections page while no inbox is set. */
function ReportError({ title }: { title: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const publicHref = useRouterState({ select: st => st.location.publicHref ?? st.location.href });
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}${publicHref}`;
  const label = fr ? "Signaler une erreur" : "Report an error";
  const mail = editorMailto(
    fr ? `Erreur signalée : ${title}` : `Error report: ${title}`,
    fr ? `Page : ${url}\n\nCe qui est inexact :\n` : `Page: ${url}\n\nWhat is wrong:\n`,
  );
  const cls = "inline-flex items-center gap-1.5 mt-4 text-[0.92rem] font-semibold text-muted-ink hover:text-ink underline underline-offset-2";
  return mail ? (
    <a href={mail} className={cls}><Flag className="h-4 w-4" aria-hidden="true" />{label}</a>
  ) : (
    <Link to="/corrections" hash="report" className={cls}><Flag className="h-4 w-4" aria-hidden="true" />{label}</Link>
  );
}
