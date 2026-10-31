import { createFileRoute, Link, notFound, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Flag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { StoryCard, StoryLink, StoryMeta, CoverageBadge, storyKicker } from "@/components/StoryCard";
import { StoryImage } from "@/components/StoryImage";
import { ArticleTools } from "@/components/MobileApp";
import { AdSlot } from "@/components/AdSlot";
import { LatestRail } from "@/components/LatestRail";
import { NewsletterBox, NewsletterPromo } from "@/components/NewsletterBox";
import { ExplainLike12 } from "@/components/YouthKit";
import { FromOurDesk } from "@/components/StudioCards";
import { keepNames } from "@/components/Dispatch";
import { AiBadge, Breadcrumbs } from "@/components/Trust";
import { getAiNewsFast, useAiNews, byLocale, diversify, clusterStories, isDeveloping, isBreaking, isFrontPool, display, inSection, SECTIONS, type NewsPayload } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { editorMailto } from "@/lib/contact";
import { seoHead, publisherRef, DEFAULT_OG_IMAGE, localeOf } from "@/lib/seo";

/**
 * A story from another publisher's feed: their headline, the source, the time
 * and a clear way to read the full story where it was reported (headline and
 * link only for most publishers, see rights.ts). Our value is the context:
 * who else is covering it, our own explainers, and the desk it belongs to.
 * These pages are noindex: search is pointed at our own journalism instead.
 */
export const Route = createFileRoute("/story/$id")({
  loader: async ({ params }) => {
    const payload = await getAiNewsFast();
    const story = payload?.stories.find(s => s.id === params.id) ?? null;
    // A full desk without this story: it has aged out (30 days). Answer 404 rather than a thin page.
    if (!story && payload && payload.stories.length > 0 && !payload.partial) throw notFound();
    return { payload, story };
  },
  head: ({ match, loaderData }) => {
    const s = loaderData?.story;
    if (!s) return seoHead(match, { title: { en: `Story — ${SITE.name}`, fr: `Nouvelle — ${SITE.name}` }, description: SITE.description, noindex: true });
    const ai = s.ai?.[localeOf(match)];
    const headline = ai?.title || s.title;
    const description = ai?.summary || s.summary || `${s.source}: ${s.title}`;
    return seoHead(match, {
      title: `${headline} — ${SITE.name}`,
      description,
      // A publisher's headline and link: useful to readers, not our journalism.
      noindex: true,
      image: s.image,
      type: "article",
      publishedTime: s.publishedAt,
      modifiedTime: s.ai?.at ?? s.publishedAt,
      jsonLd: (_locale, url) => [{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: headline.slice(0, 110),
        description,
        url,
        mainEntityOfPage: url,
        datePublished: s.publishedAt,
        dateModified: s.ai?.at ?? s.publishedAt,
        inLanguage: s.lang === "fr" ? "fr-CA" : "en",
        image: s.image ? [s.image] : [DEFAULT_OG_IMAGE],
        // The reporting is the publisher's; we credit it and link to it.
        author: { "@type": "Organization", name: s.source },
        isBasedOn: s.link,
        publisher: publisherRef,
      }],
    });
  },
  notFoundComponent: StoryGone,
  component: StoryPage,
});

function StoryGone() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <div className="container-mw py-16 max-w-2xl">
        <p className="kicker">404</p>
        <h1 className="hl text-[2.4rem] leading-tight mt-2">{fr ? "Cette nouvelle a quitté le fil" : "This story has left the desk"}</h1>
        <p className="font-serif text-[1.15rem] text-ink/80 mt-3">{fr ? "Nous gardons les titres des autres éditeurs pendant 30 jours. Le reportage reste disponible chez son éditeur; les plus récents sont à la une." : "We keep other publishers' headlines for 30 days. The reporting is still at its publisher; the newest stories are on the front page."}</p>
        <p className="mt-6 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex bg-ink text-white px-5 py-2.5 rounded-[4px] font-semibold hover:bg-lake">{fr ? "Aller à la une" : "Go to the front page"}</Link>
          <Link to="/news" className="inline-flex border border-ink px-5 py-2.5 rounded-[4px] font-semibold hover:bg-ice">{fr ? "Toutes les nouvelles" : "All the latest"}</Link>
        </p>
      </div>
    </PageShell>
  );
}

function StoryPage() {
  const { id } = Route.useParams();
  const { payload, story: initialStory } = Route.useLoaderData();
  const { data } = useAiNews(payload as NewsPayload | null);
  const { locale, pick } = useLocale();
  const all = byLocale(data?.stories ?? [], locale);
  const s = all.find(x => x.id === id) ?? initialStory;
  const clusters = useMemo(() => clusterStories(all, 72), [data, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const fr = locale === "fr";

  if (!s) {
    return (
      <PageShell>
        <div className="container-mw py-20 max-w-2xl">
          <p className="hl text-2xl flex items-center gap-3"><span className="live-dot" aria-hidden="true" />{t("loading", locale)}</p>
        </div>
      </PageShell>
    );
  }

  const d = display(s, locale);
  const cluster = clusters.find(c => c.stories.some(x => x.id === s.id));
  const coverage = cluster ? cluster.stories.filter(x => x.id !== s.id) : [];
  const deskId = s.tags?.[0] ?? s.topic;
  const desk = SECTIONS.find(x => x.id === deskId);
  const more = diversify(all.filter(x => x.id !== s.id && !coverage.includes(x) && inSection(x, deskId)), 1, 8).slice(0, 6);
  const latest = diversify(all.filter(isFrontPool));
  const excerpt = d.ai ? s.summary : d.summary;

  return (
    <PageShell>
      <article className="container-mw pt-6">
        <Breadcrumbs items={[{ label: fr ? "En continu" : "Latest", to: "/news" }, ...(desk ? [{ label: pick(desk.label), to: "/news", search: { section: desk.id } }] : []), { label: d.title }]} />
        <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1fr)_300px] mt-6">
          <div className="min-w-0 max-w-[760px]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link to="/news" search={{ section: deskId }} className="kicker hover:underline">{storyKicker(s, locale)}</Link>
              {cluster && <CoverageBadge outlets={cluster.sources} developing={isDeveloping(cluster)} breaking={isBreaking(cluster)} />}
            </p>
            <h1 className="hl text-[2.1rem] sm:text-[2.8rem] lg:text-[3.15rem] leading-[1.07] mt-3">{keepNames(d.title)}</h1>
            {d.edited && (
              <p className="meta mt-3">{fr ? `Titre de la rédaction. Titre original de ${s.source} :` : `Headline by our editors. Original headline from ${s.source}:`} <span className="italic">“{s.title}”</span></p>
            )}
            {(d.ai || d.translated) && (
              <p className="mt-3 text-[0.85rem] text-muted-ink">
                <AiBadge kind={d.ai ? "headline" : "translated"} />{" "}
                {d.ai
                  ? (fr ? `Rédigé avec l'IA à partir du seul texte des éditeurs, vérifié automatiquement. Titre original de ${s.source} :` : `Written with AI from the publishers' own text, checked automatically. Original headline from ${s.source}:`)
                  : (fr ? `Titre original de ${s.source} :` : `Original headline from ${s.source}:`)}{" "}
                <span className="italic">“{s.title}”</span>{" "}
                <Link to="/how-we-use-ai" className="text-lake font-semibold hover:underline">{fr ? "Comment ça marche" : "How this works"}</Link>
              </p>
            )}
            <StoryMeta s={s} className="mt-4 text-[0.9rem]" />

            {s.image && (
              <figure className="mt-6">
                <div className="aspect-[16/9] overflow-hidden bg-ice"><StoryImage src={s.image} alt="" eager className="img-cover" /></div>
                <figcaption className="meta mt-1.5">Photo: {s.source}</figcaption>
              </figure>
            )}

            {d.ai && d.summary && (
              <div className="mt-6 bg-surface border border-line border-t-2 border-t-ink p-5">
                <p className="text-[0.8rem] font-bold text-muted-ink mb-1">{fr ? `Résumé du pupitre IA, d'après ${d.ai.join(", ")}` : `AI desk brief, from reporting by ${d.ai.join(", ")}`}</p>
                <p className="reader-copy font-serif text-[1.22rem] leading-relaxed">{d.summary}</p>
              </div>
            )}
            {excerpt && (
              <div className="mt-6 border-l-[3px] border-brass pl-5">
                <p className="text-[0.8rem] font-bold text-muted-ink mb-1">{fr ? `Extrait de ${s.source}` : `From ${s.source}`}</p>
                <p className="reader-copy font-serif text-[1.22rem] leading-relaxed">{excerpt}</p>
              </div>
            )}

            {/* The main action: read it where it was reported. */}
            <a href={s.link} target="_blank" rel="noopener" className="group mt-7 flex items-center justify-between gap-4 bg-ink text-white px-5 sm:px-6 py-5 hover:bg-lake">
              <span>
                <span className="block text-[0.75rem] font-bold uppercase tracking-[0.08em] text-white/75">{fr ? "Le reportage complet" : "The full story"}</span>
                <span className="block font-serif text-[1.35rem] sm:text-[1.5rem] leading-tight mt-1">{fr ? `Lire sur ${s.source}` : `Read it at ${s.source}`}</span>
              </span>
              <ExternalLink className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <p className="meta mt-3 max-w-[64ch]">
              {fr
                ? `Le titre et le reportage appartiennent à ${s.source}. ${SITE.name} affiche le titre et un lien, sans reprendre le texte ni les photos, sauf si l'éditeur le permet. `
                : `The headline and the reporting belong to ${s.source}. ${SITE.name} shows the headline and a link, without reusing the text or photos unless the publisher allows it. `}
              <Link to="/standards" className="text-lake font-semibold hover:underline">{fr ? "Nos normes" : "Our standards"}</Link>
            </p>

            <ArticleTools title={d.title} summary={d.summary || s.summary || ""} source={s.source} publishedAt={s.publishedAt} />

            <ExplainLike12 storyIds={[s.id, ...coverage.map(x => x.id)]} className="mt-6" />

            {coverage.length > 0 && (
              <section className="mt-12">
                <ZoneHead title={fr ? "Couverture complète" : "Full coverage"} sub={fr ? `Comment ${cluster!.sources} médias rapportent cette nouvelle.` : `How ${cluster!.sources} newsrooms are reporting this story.`} />
                <ul className="divide-y divide-line border-b border-line">
                  {coverage.slice(0, 10).map(x => (
                    <li key={x.id} className="py-3">
                      <StoryLink s={x} className="group grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4 items-start">
                        <span className="font-bold text-[0.88rem] text-brass-ink">{x.source}</span>
                        <span className="min-w-0">
                          <span className="block hl-sm text-[1.05rem] group-hover:underline">{display(x, locale).title}</span>
                          <StoryMeta s={x} className="mt-0.5" />
                        </span>
                      </StoryLink>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <ReportError title={s.title} />

            <div className="mt-12 border-t-2 border-ink pt-8"><NewsletterBox variant="inline" /></div>

            {more.length > 0 && (
              <section className="mt-14">
                <ZoneHead
                  title={fr ? `Plus dans ${storyKicker(s, locale)}` : `More in ${storyKicker(s, locale)}`}
                  action={<Link to="/news" search={{ section: deskId }} className="shrink-0 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-lake hover:underline">{t("seeAll", locale)} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
                />
                <div className="grid gap-x-8 sm:grid-cols-2">
                  {more.map(x => <div key={x.id} className="py-3 border-b border-line"><StoryCard s={x} variant="text" showTopic={false} /></div>)}
                </div>
              </section>
            )}
          </div>

          <aside className="min-w-0 grid gap-8 content-start [&>*]:min-w-0">
            <LatestRail stories={latest} fetchedAt={data?.fetchedAt} limit={8} />
            <NewsletterPromo />
            <AdSlot size="mpu" placement="story" />
          </aside>
        </div>
      </article>
      <FromOurDesk className="container-mw mt-14" limit={3} />
    </PageShell>
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
  const mail = editorMailto(fr ? `Erreur signalée : ${title}` : `Error report: ${title}`, fr ? `Page : ${url}\n\nCe qui est inexact :\n` : `Page: ${url}\n\nWhat is wrong:\n`);
  const cls = "inline-flex items-center gap-1.5 mt-8 text-[0.92rem] font-semibold text-muted-ink hover:text-ink underline underline-offset-2";
  return mail
    ? <a href={mail} className={cls}><Flag className="h-4 w-4" aria-hidden="true" />{label}</a>
    : <Link to="/corrections" hash="report" className={cls}><Flag className="h-4 w-4" aria-hidden="true" />{label}</Link>;
}
