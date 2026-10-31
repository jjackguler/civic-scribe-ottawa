import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Coins, Landmark, Wrench } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { LatestRail } from "@/components/LatestRail";
import { StoryCard, StoryLink, StoryMeta, CoverageBadge } from "@/components/StoryCard";
import { AdSlot } from "@/components/AdSlot";
import { VideoPlayer, VideoTile, InterviewCard, AudioEpisode, MediaMeta } from "@/components/Media";
import { NewsletterBox, NewsletterPromo } from "@/components/NewsletterBox";
import { TrendsPanel, Thumb } from "@/components/Showcase";
import { OriginalCard } from "@/components/Originals";
import { DispatchRail, keepNames, listOutlets } from "@/components/Dispatch";
import { NewsroomCover } from "@/components/NewsroomCover";
import { NewsroomLead } from "@/components/NewsroomLead";
import { FromOurDesk, StudioCard } from "@/components/StudioCards";
import { AiBadge, TrustBar } from "@/components/Trust";
import { LabsBand } from "@/components/Labs";
import { AskKeeperBand } from "@/components/Keeper";
import { QuizCard } from "@/components/Quiz";
import { YoungLabBand } from "@/components/YoungLab";
import { usePulse, getPulseFast, trendMatch, type PulsePayload } from "@/lib/pulse";
import { useOriginals, getOriginalsFast } from "@/lib/originals";
import { getDispatchesFast } from "@/lib/dispatch";
import { getDailyQuizFast } from "@/lib/youth";
import { getNewsroomFast, useNewsroom, FORMAT_LABEL, newsroomFixtureRequested, type NewsroomSummary } from "@/lib/newsroom";
import { humanLens, LENS_LABEL } from "@/lib/editorial";
import {
  getFrontPageNews, useAiNews, byLocale, diversify, clusterStories, useRefinedClusters, isDeveloping, isBreaking, isFrontPool, display,
  TOPICS, inSection, timeAgo, useNow, type Story, type SectionId, type Cluster,
} from "@/lib/news";
import { useMedia, type MediaItem } from "@/lib/media";
import { GUIDES } from "@/lib/guides";
import { TOOLS } from "@/lib/tools";
import { PROGRAMS } from "@/lib/funding";
import { HUBS } from "@/lib/hubs";
import { EDITORIALS } from "@/lib/editorials";
import { STUDIO } from "@/lib/studio";
import { useLocale } from "@/lib/locale-context";
import { t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { Topic } from "@/lib/news-sources";
import { seoHead, organizationLd, websiteLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async () => {
    // Secondary desks hydrate through their own hooks; none can delay first paint.
    const [news, pulse, originals, dispatches, quiz, newsroom] = await Promise.all([
      getFrontPageNews().catch(() => null), getPulseFast(150), getOriginalsFast(150),
      getDispatchesFast(150), getDailyQuizFast(150), getNewsroomFast(150),
    ]);
    return { news, pulse, originals, dispatches, quiz, newsroom };
  },
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `${SITE.name}: AI news for Canada, with the human stakes`, fr: `${SITE.name} : l'actualité de l'IA pour le Canada` },
      description: {
        en: "Independent, bilingual AI news from Ottawa: what's changing in artificial intelligence, what it means for Canada, with every source named and AI-assisted work labelled.",
        fr: "Actualité indépendante et bilingue de l'IA, depuis Ottawa : ce qui change en intelligence artificielle et ce que cela signifie pour le Canada, sources nommées.",
      },
      jsonLd: locale => [organizationLd(locale), websiteLd(locale)],
    }),
  component: Home,
});

/** Take up to n stories that pass pred and haven't been used on the page yet. */
function take(pool: Story[], used: Set<string>, n: number, pred: (s: Story) => boolean = () => true) {
  const out: Story[] = [];
  for (const s of pool) {
    if (out.length >= n) break;
    if (used.has(s.id) || !pred(s)) continue;
    used.add(s.id);
    out.push(s);
  }
  return out;
}

/** The desks shown as a grid on the front page, in order. */
const FRONT_DESKS: Topic[] = ["policy", "business", "research", "responsible", "agents", "infrastructure", "people", "health"];

const CANADA_HUBS = ["ai-and-jobs-in-canada", "ai-and-privacy"];

function Home() {
  const { news: initial, pulse: initialPulse, originals: initialOriginals, dispatches, quiz, newsroom } = Route.useLoaderData();
  const { data: originals } = useOriginals(initialOriginals);
  const { data, isError } = useAiNews(initial);
  const { data: pulse } = usePulse(initialPulse);
  const { data: media } = useMedia();
  const { data: nrData } = useNewsroom(newsroom);
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const now = useNow();

  const all = byLocale(data?.stories ?? [], locale);
  const news = diversify(all.filter(isFrontPool));
  const heuristic = useMemo(() => clusterStories(all), [data, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const clusters = useRefinedClusters(heuristic);
  const used = new Set<string>();

  // The events most newsrooms are covering, fresher first among equals.
  const ranked = clusters
    .filter(c => c.sources >= 2)
    .map(c => {
      const ageH = (Date.now() - Math.max(...c.stories.map(x => new Date(x.publishedAt).getTime()))) / 3600_000;
      const fresh = ageH < 1 ? 18 : ageH < 3 ? 10 : ageH < 8 ? 4 : ageH > 24 ? -15 : 0;
      return { c, score: c.sources * 10 + fresh + (trendMatch(c.lead, pulse) ? 15 : 0) + (isBreaking(c) ? 20 : isDeveloping(c) ? 8 : 0) };
    })
    .sort((x, y) => y.score - x.score)
    .map(x => x.c);

  // Our own work leads (owner decision): a fresh Studio piece, else the newest newsroom summary.
  // Only when neither exists does the event most outlets are covering take the lead.
  const studioLead = STUDIO.find(p => p.lang === locale && Date.now() - Date.parse(p.approvedAt) < 48 * 3600_000) ?? null;
  const articles = nrData?.items ?? [];
  // A newsroom summary leads only while it is fresh (36 h); after that the top event does.
  const articleLead = studioLead ? null : articles.find(a => Date.now() - Date.parse(a.createdAt) < 36 * 3600_000) ?? null;
  const clusterLead = !studioLead && !articleLead ? ranked[0] ?? null : null;
  if (clusterLead) clusterLead.stories.forEach(s => used.add(s.id));
  const topClusters = ranked.filter(c => c !== clusterLead).slice(0, clusterLead ? 4 : 6);
  topClusters.forEach(c => c.stories.forEach(s => used.add(s.id)));
  const moreClusters = ranked.filter(c => c !== clusterLead && !topClusters.includes(c)).slice(0, 6);
  moreClusters.forEach(c => c.stories.forEach(s => used.add(s.id)));
  const newestFirst = [...news].sort((x, y) => y.publishedAt.localeCompare(x.publishedAt));
  // Fill the front's left column under the top events, so it reads as long as the Latest rail.
  const moreHeadlines = take(newestFirst, used, clusterLead ? 6 : 4, s => s.kind !== "trending");

  const peopleFirst = take(news, used, 6, s => humanLens(s).length > 0 && s.kind !== "trending");
  const canada = take(news, used, 5, s => s.region === "canada");
  const official = all.filter(s => s.minister && s.gov && s.lang === locale).slice(0, 3);
  const desks = FRONT_DESKS.map(id => ({ id, items: take(diversify(all.filter(s => inSection(s, id)), 1, 8), used, 4, s => s.kind !== "trending") })).filter(d => d.items.length > 0);
  const analysis = take(news, used, 4, s => s.kind === "analysis");
  const labs = take(news, used, 4, s => s.kind === "lab");
  const hn = all.filter(s => s.sourceId === "hn").sort((a, b) => (b.popularity?.score ?? 0) - (a.popularity?.score ?? 0)).slice(0, 5);
  const papers = all.filter(s => s.sourceId === "hf-papers").sort((a, b) => (b.popularity?.score ?? 0) - (a.popularity?.score ?? 0)).slice(0, 5);

  const ownVideos = [...(originals?.items ?? [])].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 8);
  const items = media?.items ?? [];
  const videos = items.filter(m => m.type === "video");
  const watchList = [...videos.filter(v => v.newsroom && !v.interview).slice(0, 3), ...videos.filter(v => !v.newsroom && !v.interview).slice(0, 2)].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const interviews = items.filter(m => m.interview).slice(0, 3);
  const episodes = items.filter(m => m.type === "audio" && !interviews.includes(m)).slice(0, 4);
  const editorial = EDITORIALS[0];
  const openPrograms = PROGRAMS.filter(p => p.status === "open" || p.status === "ongoing").length;
  const loading = !data && !isError;

  // Top strip: breaking (3+ outlets in 2 h) or developing (3+ in 6 h).
  const top = ranked[0];
  const alert = top && (isBreaking(top) || isDeveloping(top)) ? { kind: isBreaking(top) ? "breaking" as const : "developing" as const, story: top.lead, outlets: top.sources } : null;

  return (
    <PageShell>
      <h1 className="sr-only">{SITE.name} — {fr ? "l'actualité de l'IA pour le Canada" : "AI news for Canada"}</h1>

      {alert && (
        <div className={alert.kind === "breaking" ? "bg-live text-white" : "bg-ink text-white"}>
          <StoryLink s={alert.story} className="container-mw flex items-center gap-3 py-2.5 group">
            <span className={`shrink-0 font-bold text-[0.72rem] uppercase tracking-[0.08em] px-2 py-0.5 ${alert.kind === "breaking" ? "bg-white text-live" : "bg-live text-white"}`}>
              {alert.kind === "breaking" ? (fr ? "Dernière heure" : "Breaking") : (fr ? "En développement" : "Developing")}
            </span>
            <span className="font-serif font-semibold text-[1.05rem] leading-snug truncate group-hover:underline">{display(alert.story, locale).title}</span>
            <span className="hidden sm:inline shrink-0 text-white/85 text-sm ml-auto">{alert.outlets} {fr ? "médias" : "outlets"}</span>
          </StoryLink>
        </div>
      )}

      {/* The front: our lead and the top events on the left, the running Latest list on the right. */}
      <section className="container-mw pt-6 sm:pt-8" aria-label={fr ? "À la une" : "Top of the front page"}>
        {news.length === 0 && !articleLead && !studioLead ? (
          <div className="border-t-2 border-ink pt-10 pb-16 text-center">
            <span className="live-dot inline-block" aria-hidden="true" />
            <p className="hl text-2xl mt-4">{loading ? t("loading", locale) : t("feedDown", locale)}</p>
          </div>
        ) : (
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              {studioLead && <div className="border-t-2 border-ink pt-4"><StudioCard p={studioLead} size="lead" /></div>}
              {articleLead && <ArticleLead a={articleLead} locale={locale} />}
              {clusterLead && <ClusterLead c={clusterLead} pulse={pulse} />}
              {topClusters.length > 0 && (
                <div className="mt-8 grid gap-x-8 sm:grid-cols-2 border-t border-ink/80">
                  {topClusters.map(c => (
                    <div key={c.id} className="py-4 border-b border-line">
                      <StoryCard s={c.lead} variant="text" showTopic badge={<CoverageBadge outlets={c.sources} developing={isDeveloping(c)} breaking={isBreaking(c)} />} />
                    </div>
                  ))}
                </div>
              )}
              {moreHeadlines.length > 0 && (
                <div className="mt-8">
                  <h2 className="kicker text-ink pb-1 border-b border-ink">{t("moreHeadlines", locale)}</h2>
                  <div className="grid gap-x-8 sm:grid-cols-2">{moreHeadlines.map(s => <StoryCard key={s.id} s={s} variant="list" />)}</div>
                </div>
              )}
            </div>
            <aside className="min-w-0 grid gap-6 content-start lg:border-l lg:border-line lg:pl-8">
              <LatestRail stories={newestFirst} fetchedAt={data?.fetchedAt} limit={8} />
              <Link to="/news" className="inline-flex items-center gap-1 text-[0.9rem] font-semibold text-lake hover:underline">{fr ? "Toutes les nouvelles" : "All the latest"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <NewsletterPromo />
            </aside>
          </div>
        )}
      </section>

      <div className="container-mw mt-8"><TrustBar /></div>
      <section className="container-mw mt-6" aria-labelledby="open-desk-intro">
        <div className="grid gap-2 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8 items-baseline">
          <h2 id="open-desk-intro" className="hl text-[1.25rem]">Open Desk Journalism</h2>
          <p className="font-serif text-[1.05rem] leading-relaxed text-ink/80 max-w-3xl">
            {fr
              ? `Sous la direction de ${SITE.editor.name}, nous associons journalisme, cinéma et création assistée par l'IA pour raconter les enjeux humains de l'intelligence artificielle. `
              : `Led by editor ${SITE.editor.name}, we combine journalism, filmmaking and AI-assisted creativity to tell the human stories behind artificial intelligence. `}
            <Link to="/about" hash="how-we-work" className="font-sans text-[0.92rem] text-lake font-semibold hover:underline">{fr ? "Comment nous travaillons →" : "How we work →"}</Link>
          </p>
        </div>
      </section>

      <FromOurDesk className="container-mw mt-12" exclude={studioLead?.id} />

      {/* Our newsroom's summaries (the lead above is left out) and dispatches. */}
      <NewsroomLead initial={newsroom} exclude={articleLead ? [articleLead.id] : []} className="container-mw mt-12" />
      {/* Dispatches are listed only until the newsroom publishes (their pages then redirect to its articles). */}
      {articles.length === 0 && <DispatchRail initial={dispatches} className="container-mw mt-12" />}

      {/* Video strip: our own explainers. */}
      {ownVideos.length > 0 && (
        <section className="mt-14 bg-night text-white" aria-labelledby="watch-ours">
          <div className="container-mw py-10">
            <ZoneHead dark id="watch-ours" title={fr ? "Nos vidéos explicatives" : "Our explainer videos"} sub={fr ? "Une histoire de l'actualité expliquée en environ une minute. Sources et transcription sur chaque page." : "One story from the news, explained in about a minute. Sources and transcript on every page."} action={<MoreLink to="/originals" dark />} />
            <ul className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {ownVideos.map(o => <li key={o.id} className={`snap-start shrink-0 ${o.aspect === "16:9" ? "w-[300px] sm:w-[400px]" : "w-[170px] sm:w-[200px]"}`}><OriginalCard o={o} /></li>)}
            </ul>
          </div>
        </section>
      )}

      {/* AI in Canada: the live desk, the ministry record and the evergreen hubs. */}
      <section className="container-mw mt-14" aria-labelledby="ai-canada">
        <ZoneHead id="ai-canada" title={fr ? "L'IA au Canada" : "AI in Canada"} sub={fr ? "Nouvelles, annonces officielles, argent public et guides pratiques." : "News, official announcements, public money and practical guides."} action={<MoreLink to="/canada" />} />
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-3">
          <div>
            <h3 className="kicker text-ink pb-1 border-b border-ink">{t("canadaDesk", locale)}</h3>
            {canada.length === 0 ? <p className="meta py-3">{t("noItems", locale)}</p> : canada.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
          </div>
          <div>
            <h3 className="kicker text-ink pb-1 border-b border-ink flex items-center gap-2"><Landmark className="h-4 w-4" aria-hidden="true" />{t("trackerTitle", locale)}</h3>
            {official.length === 0 ? <p className="meta py-3">{fr ? "Aucun communiqué récent." : "No recent releases."}</p> : official.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
            <Link to="/ministry" className="mt-3 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-lake hover:underline">{fr ? "Tout le suivi" : "The full tracker"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <ul className="grid gap-3 content-start">
            <HubLink to="/funding" kicker={fr ? "Financement" : "Funding"} title={fr ? "Financement de l'IA au Canada" : "AI funding in Canada"} text={fr ? `${openPrograms} programmes ouverts ou continus, vérifiés sur les pages officielles.` : `${openPrograms} open or ongoing programs, checked against official pages.`} />
            {HUBS.filter(h => CANADA_HUBS.includes(h.slug)).map(h => (
              <HubLink key={h.slug} to="/guides/$slug" params={{ slug: h.slug }} kicker={fr ? "Guide" : "Guide"} title={pick(h.short)} text={pick(h.description)} />
            ))}
          </ul>
        </div>
      </section>

      {moreClusters.length > 0 && (
        <section className="container-mw mt-14" aria-labelledby="top-stories">
          <ZoneHead id="top-stories" title={t("topStories", locale)} sub={fr ? "Les événements que plusieurs médias couvrent. Titres et liens vers les reportages originaux." : "The events several outlets are covering. Headlines and links to the original reporting."} action={<MoreLink to="/news" />} />
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3 content-start">
              {moreClusters.map(c => (
                <div key={c.id} className="border-t border-line pt-3">
                  <StoryCard s={c.lead} variant="text" badge={<><CoverageBadge outlets={c.sources} developing={isDeveloping(c)} breaking={isBreaking(c)} /><TrendBadge s={c.lead} pulse={pulse} /></>} />
                </div>
              ))}
            </div>
            <div className="grid gap-6 content-start">
              <AdSlot size="mpu" placement="home-right" />
              {pulse && <TrendsPanel pulse={pulse} />}
            </div>
          </div>
        </section>
      )}

      <section className="mt-14 bg-night text-white">
        <div className="container-mw py-12"><NewsletterBox variant="band" /></div>
      </section>

      {desks.length > 0 && (
        <section className="container-mw mt-14" aria-labelledby="the-desks">
          <ZoneHead id="the-desks" title={fr ? "Les sections" : "The desks"} sub={fr ? "Chaque nouvelle est classée par sujet, comme dans une salle de rédaction." : "Every story is filed to a desk, the way a newsroom works."} />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
            {desks.map(d => (
              <div key={d.id}>
                <h3 className="flex items-center justify-between gap-2 pb-1 border-b border-ink">
                  <Link to="/news" search={{ section: d.id }} className="kicker text-ink hover:text-lake">{pick(TOPICS.find(x => x.id === d.id)!.label)}</Link>
                  <MoreLink to="/news" section={d.id} compact />
                </h3>
                {d.items.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
              </div>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label={fr ? "Tous les thèmes" : "All desks"}>
            {TOPICS.filter(tp => !FRONT_DESKS.includes(tp.id)).map(tp => (
              <li key={tp.id}><Link to="/news" search={{ section: tp.id }} className="inline-flex rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.9rem] font-semibold hover:border-ink">{pick(tp.label)}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <AdSlot size="leaderboard" placement="home-top" className="container-mw mt-14" />

      {peopleFirst.length > 0 && (
        <section className="container-mw mt-14" aria-labelledby="people-first">
          <ZoneHead id="people-first" title={fr ? "L'humain d'abord" : "People first"} sub={fr ? "Ce que l'IA change cette semaine pour les droits, le travail, les enfants et la démocratie." : "What AI is changing this week for people's rights, work, children and democracy."} action={<Link to="/values" className="inline-flex items-center gap-1 font-semibold text-[0.9rem] text-lake hover:underline">{fr ? "Nos valeurs" : "Our values"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>} />
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {peopleFirst.map(s => (
              <div key={s.id} className="border-t border-line pt-3">
                <StoryCard s={s} variant="text" showTopic={false} badge={<span className="inline-flex flex-wrap gap-1.5">{humanLens(s).map(l => <span key={l} className="text-[0.72rem] font-bold uppercase tracking-[0.05em] text-lake">{pick(LENS_LABEL[l])}</span>)}</span>} />
              </div>
            ))}
          </div>
        </section>
      )}

      {(analysis.length > 0 || labs.length > 0) && (
        <section className="container-mw mt-14 grid gap-x-10 gap-y-12 lg:grid-cols-2">
          {analysis.length > 0 && (
            <div>
              <ZoneHead title={t("analysis", locale)} action={<MoreLink to="/news" section="analysis" />} />
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{analysis.map(s => <StoryCard key={s.id} s={s} variant="text" showTopic={false} />)}</div>
            </div>
          )}
          {labs.length > 0 && (
            <div>
              <ZoneHead title={t("researchLabs", locale)} action={<MoreLink to="/news" section="labs" />} />
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{labs.map(s => <StoryCard key={s.id} s={s} variant="text" showTopic={false} />)}</div>
            </div>
          )}
        </section>
      )}

      {(hn.length > 0 || papers.length > 0) && (
        <section className="container-mw mt-14" aria-labelledby="trending">
          <ZoneHead id="trending" title={t("trending", locale)} action={<MoreLink to="/news" section="trending" />} />
          <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
            {hn.length > 0 && (
              <div>
                <h3 className="kicker text-ink pb-1 border-b border-ink">{t("mostDiscussed", locale)}</h3>
                <ol>
                  {hn.map((s, i) => (
                    <li key={s.id} className="flex gap-4 py-3 border-b border-line last:border-0">
                      <span className="hl text-[1.6rem] text-brass-ink w-6 shrink-0 leading-none" aria-hidden="true">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="hl-sm text-[1.04rem] hover:underline">{s.title}</a>
                        <p className="meta mt-1"><a href={s.popularity?.discussUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.popularity?.score} {t("points", locale)} · {s.popularity?.comments ?? 0} {t("comments", locale)}</a></p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="meta mt-2">{fr ? "Classement selon les votes sur Hacker News, 3 derniers jours." : "Ranked by Hacker News votes over the last 3 days."}</p>
              </div>
            )}
            {papers.length > 0 && (
              <div>
                <h3 className="kicker text-ink pb-1 border-b border-ink">{t("trendingPapers", locale)}</h3>
                <ul>
                  {papers.map(s => (
                    <li key={s.id} className="py-3 border-b border-line last:border-0">
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="group flex gap-3">
                        <Thumb src={s.image} label={s.title} />
                        <span className="min-w-0">
                          <span className="block hl-sm text-[1.02rem] group-hover:underline">{s.title}</span>
                          <span className="meta mt-1 block">arXiv · {s.popularity?.score} {t("upvotes", locale)} {fr ? "sur Hugging Face" : "on Hugging Face"}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="container-mw mt-14 mb-14 grid gap-8 lg:grid-cols-2 items-start">
        <QuizCard initial={quiz} />
        {editorial && (
          <section aria-labelledby="eds-desk">
            <ZoneHead id="eds-desk" title={t("editorsDesk", locale)} action={<MoreLink to="/editor" />} />
            <Link to="/editor/$slug" params={{ slug: editorial.slug }} className="group block">
              <p className="kicker">{fr ? "Opinion" : "Opinion"}</p>
              <h3 className="hl text-[1.8rem] sm:text-[2.1rem] leading-[1.1] mt-1 group-hover:underline decoration-1">{pick(editorial.title)}</h3>
              <p className="dek mt-2">{pick(editorial.dek)}</p>
              <p className="meta mt-2 font-semibold text-ink">{SITE.editor.name}</p>
            </Link>
          </section>
        )}
      </div>

      <LabsBand />
      <YoungLabBand />

      {watchList.length > 0 && <WatchBand videos={watchList} />}

      {interviews.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead title={fr ? "Entrevues" : "Interviews"} action={<MoreLink to="/interviews" />} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2"><InterviewCard m={interviews[0]} large /></div>
              {interviews.slice(1).map(m => <InterviewCard key={m.id} m={m} />)}
            </div>
            <AdSlot size="halfpage" placement="home-interviews" className="hidden lg:flex" />
          </div>
        </section>
      )}

      {episodes.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead title={fr ? "À écouter" : "Listen"} action={<MoreLink to="/listen" />} />
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">{episodes.map(a => <AudioEpisode key={a.id} a={a} compact />)}</div>
        </section>
      )}

      <AdSlot size="billboard" placement="home-mid" className="container-mw mt-14" />

      <div className="mt-14"><AskKeeperBand /></div>

      <section className="container-mw mt-14">
        <ZoneHead title={t("resources", locale)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Resource to="/learn" icon={<BookOpen className="h-5 w-5" />} title={t("startHere", locale)} text={fr ? `${GUIDES.length} guides simples pour bien commencer avec l'IA.` : `${GUIDES.length} plain-language guides to get started with AI.`} />
          <Resource to="/tools" icon={<Wrench className="h-5 w-5" />} title={t("bestTools", locale)} text={fr ? `${TOOLS.length} outils classés selon ce que vous voulez faire.` : `${TOOLS.length} tools, grouped by what you want to get done.`} />
          <Resource to="/funding" icon={<Coins className="h-5 w-5" />} title={t("moneyForAi", locale)} text={fr ? `${openPrograms} programmes canadiens ouverts ou continus, vérifiés sur les pages officielles.` : `${openPrograms} open or ongoing Canadian programs, checked against official pages.`} />
        </div>
      </section>
    </PageShell>
  );
}

/** Our newsroom's newest summary, leading the page (labelled as an AI-assisted summary). */
function ArticleLead({ a, locale }: { a: NewsroomSummary; locale: Locale }) {
  const now = useNow();
  const fr = locale === "fr";
  const c = a[locale];
  const fixture = newsroomFixtureRequested() ? ({ fixture: "1" } as never) : undefined;
  return (
    <article className="group border-t-2 border-ink pt-4 grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-start">
      <div className="min-w-0 md:order-2">
        <Link to="/article/$slug" params={{ slug: a.slug[locale] }} search={fixture} tabIndex={-1} aria-hidden="true">
          <NewsroomCover cover={a.cover} locale={locale} size="hero" />
        </Link>
      </div>
      <div className="min-w-0 md:order-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="kicker">{fr ? "De notre rédaction" : "From our newsroom"}{FORMAT_LABEL[a.format] ? ` · ${FORMAT_LABEL[a.format][locale]}` : ""}</span>
          <AiBadge kind="summary" />
        </p>
        <Link to="/article/$slug" params={{ slug: a.slug[locale] }} search={fixture} className="block mt-3">
          <h2 className="hl text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.06] group-hover:underline decoration-1 underline-offset-4">{keepNames(c.headline)}</h2>
        </Link>
        {c.dek && <p className="font-serif text-[1.18rem] sm:text-[1.25rem] leading-snug text-ink/80 mt-3">{c.dek}</p>}
        <p className="meta mt-4 flex flex-wrap gap-x-2">
          <span>{fr ? "D'après" : "Reported by"} <span className="font-semibold text-ink">{listOutlets(a.outlets.slice(0, 3), locale)}</span>{a.outlets.length > 3 ? ` +${a.outlets.length - 3}` : ""}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={a.createdAt} suppressHydrationWarning>{timeAgo(a.createdAt, now, locale)}</time>
        </p>
      </div>
    </article>
  );
}

/** When we have nothing of our own yet: the event most outlets are covering, text-led. */
function ClusterLead({ c, pulse }: { c: Cluster; pulse: PulsePayload | undefined }) {
  const { locale } = useLocale();
  const d = display(c.lead, locale);
  const others = c.stories.filter(s => s.id !== c.lead.id).slice(0, 3);
  return (
    <article className="border-t-2 border-ink pt-4">
      <p className="flex flex-wrap items-center gap-2.5"><CoverageBadge outlets={c.sources} developing={isDeveloping(c)} breaking={isBreaking(c)} /><TrendBadge s={c.lead} pulse={pulse} /></p>
      <StoryLink s={c.lead} className="group block mt-2">
        <h2 className="hl text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.05] group-hover:underline decoration-1 underline-offset-4">{keepNames(d.title)}</h2>
        {d.summary && <p className="font-serif text-[1.2rem] leading-snug text-ink/80 mt-3 max-w-[60ch]">{d.summary}</p>}
      </StoryLink>
      {d.ai && <p className="mt-2"><AiBadge kind="headline" /> <span className="meta">{locale === "fr" ? "Titre original" : "Original headline"}: <span className="italic">{d.original}</span></span></p>}
      <StoryMeta s={c.lead} className="mt-3 text-[0.88rem]" />
      {others.length > 0 && (
        <ul className="mt-4 grid gap-2 border-l-2 border-line pl-4">
          {others.map(s => (
            <li key={s.id}><StoryLink s={s} className="group text-[0.95rem]"><span className="font-semibold">{s.source}</span>: <span className="group-hover:underline">{display(s, locale).title}</span></StoryLink></li>
          ))}
        </ul>
      )}
    </article>
  );
}

function HubLink({ to, params, kicker, title, text }: { to: "/funding" | "/guides/$slug"; params?: { slug: string }; kicker: string; title: string; text: string }) {
  return (
    <li>
      <Link to={to} params={params as never} className="group block border border-line bg-surface p-4 hover:border-ink">
        <span className="kicker">{kicker}</span>
        <span className="block hl text-[1.2rem] mt-1 group-hover:underline">{title}</span>
        <span className="block text-[0.9rem] text-muted-ink mt-1 leading-snug line-clamp-2">{text}</span>
      </Link>
    </li>
  );
}

/** Dark broadcast band: one player, a running list beside it (publishers' own players). */
function WatchBand({ videos }: { videos: MediaItem[] }) {
  const { locale } = useLocale();
  const [current, setCurrent] = useState(0);
  const v = videos[Math.min(current, videos.length - 1)];
  return (
    <section className="mt-14 bg-night text-white">
      <div className="container-mw py-10">
        <ZoneHead dark title={locale === "fr" ? "À voir ailleurs" : "Watch: from other channels"} action={<MoreLink to="/watch" dark />} sub={locale === "fr" ? "Les reportages IA des grandes chaînes, des laboratoires et des créateurs, dans le lecteur de l'éditeur." : "AI reports from broadcasters, labs and explainers, in each publisher's own player."} />
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div>
            <VideoPlayer key={v.id} v={v} />
            <h3 className="hl text-[1.5rem] sm:text-[1.8rem] mt-4">{v.title}</h3>
            <MediaMeta m={v} dark className="mt-2" />
          </div>
          <ul className="grid gap-4 content-start">
            {videos.map((x, i) => <li key={x.id}><VideoTile v={x} dark active={i === current} onSelect={() => setCurrent(i)} /></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Resource({ to, icon, title, text }: { to: "/learn" | "/tools" | "/funding"; icon: ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="group flex gap-3 items-start border border-line bg-surface p-4 hover:border-ink">
      <span className="mt-0.5 text-lake" aria-hidden="true">{icon}</span>
      <span>
        <span className="block font-bold group-hover:underline">{title}</span>
        <span className="block text-[0.92rem] text-muted-ink leading-snug mt-0.5">{text}</span>
      </span>
    </Link>
  );
}

export function MoreLink({ to, section, dark = false, compact = false }: { to: "/news" | "/government" | "/ministry" | "/editor" | "/watch" | "/listen" | "/interviews" | "/showcase" | "/originals" | "/canada"; section?: SectionId; dark?: boolean; compact?: boolean }) {
  const { locale } = useLocale();
  return (
    <Link
      to={to}
      search={section ? ({ section } as never) : undefined}
      className={`shrink-0 inline-flex items-center gap-1 font-semibold text-[0.9rem] whitespace-nowrap hover:underline ${dark ? "text-brass" : "text-lake"}`}
      aria-label={compact ? t("seeAll", locale) : undefined}
    >
      {compact ? null : t("seeAll", locale)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

/** "Trending on Google" when a trending search term appears in the headline. */
function TrendBadge({ s, pulse }: { s: Story; pulse: PulsePayload | undefined }) {
  const { locale } = useLocale();
  const region = trendMatch(s, pulse);
  if (!region) return null;
  const where = region === "ca" ? "Canada" : locale === "fr" ? "É.-U." : "U.S.";
  return <span className="text-[0.72rem] font-bold uppercase tracking-[0.05em] text-brass-ink">{locale === "fr" ? `Tendance Google ${where}` : `Trending on Google ${where}`}</span>;
}
