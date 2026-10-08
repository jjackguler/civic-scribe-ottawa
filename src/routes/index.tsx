import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Landmark, BookOpen, Wrench, Coins } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { LatestRail } from "@/components/LatestRail";
import { StoryCard, StoryLink, StoryMeta, CoverageBadge } from "@/components/StoryCard";
import { AdSlot } from "@/components/AdSlot";
import { VideoPlayer, VideoTile, InterviewCard, AudioEpisode, MediaMeta } from "@/components/Media";
import { NewsletterBox } from "@/components/NewsletterBox";
import {
  getAiNewsFast, useAiNews, byLocale, diversify, clusterStories, useRefinedClusters, isDeveloping, isBreaking, isFrontPool, display,
  TOPICS, LEVEL_LABEL, inSection, type Story, type SectionId,
} from "@/lib/news";
import { useMedia, type MediaItem } from "@/lib/media";
import { GUIDES } from "@/lib/guides";
import { TOOLS } from "@/lib/tools";
import { PROGRAMS } from "@/lib/funding";
import { EDITORIALS } from "@/lib/editorials";
import { SOCIAL_PICKS } from "@/lib/social";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { Topic } from "@/lib/news-sources";
import { seoHead, organizationLd, absUrl } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: () => getAiNewsFast(),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `${SITE.name} — ${SITE.tagline.en}`, fr: `${SITE.name} — ${SITE.tagline.fr}` },
      description: SITE.description,
      jsonLd: (locale) => [
        organizationLd(locale),
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: absUrl("/", locale),
          inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
          potentialAction: {
            "@type": "SearchAction",
            target: `${absUrl("/search", locale)}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
      ],
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
const FRONT_DESKS: Topic[] = ["agents", "infrastructure", "immersive", "responsible", "business", "research", "robotics", "people"];

function Home() {
  const initial = Route.useLoaderData();
  const { data, isError } = useAiNews(initial);
  const { data: media } = useMedia();
  const { locale, pick } = useLocale();

  const all = byLocale(data?.stories ?? [], locale);
  const news = diversify(all.filter(isFrontPool));
  const heuristic = useMemo(() => clusterStories(all), [data, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const clusters = useRefinedClusters(heuristic);
  const used = new Set<string>();

  // Lead: the event most newsrooms are covering. Falls back to the newest photo story.
  const top = clusters.find(c => c.sources >= 2 && c.lead.image) ?? clusters.find(c => c.sources >= 2);
  const lead = top?.lead ?? news.find(s => s.image) ?? news[0];
  if (lead) used.add(lead.id);
  const coverage = top ? top.stories.filter(s => s.id !== lead?.id).slice(0, 4) : [];
  coverage.forEach(s => used.add(s.id));
  const related = top ? [] : take(news, used, 3, s => !!lead && s.topic === lead.topic);
  const photo = news.filter(s => s.image);
  const right = take(photo, used, 2);

  // More top stories: the next clusters with two or more outlets.
  const more = clusters
    .filter(c => c !== top && c.sources >= 2 && !used.has(c.lead.id))
    .slice(0, 4);
  more.forEach(c => c.stories.forEach(s => used.add(s.id)));
  const moreFill = take(photo, used, Math.max(0, 4 - more.length));

  const hn = all.filter(s => s.sourceId === "hn").sort((a, b) => (b.popularity?.score ?? 0) - (a.popularity?.score ?? 0)).slice(0, 6);
  const papers = all.filter(s => s.sourceId === "hf-papers").sort((a, b) => (b.popularity?.score ?? 0) - (a.popularity?.score ?? 0)).slice(0, 5);

  const desks = FRONT_DESKS.map(id => {
    const pool = all.filter(s => inSection(s, id));
    const items = take(diversify(pool, 1, 8), used, 4, s => s.kind !== "trending");
    return { id, items };
  }).filter(d => d.items.length > 0);

  const official = take(all, used, 3, s => s.minister && s.gov);
  const ministerNews = take(all, used, 3, s => s.minister && !s.gov);
  const govCols = (["federal", "provincial", "municipal"] as const).map(level => ({ level, items: all.filter(s => s.level === level).slice(0, 4) }));
  const canada = take(news, used, 5, s => s.region === "canada");
  const labs = take(news, used, 4, s => s.kind === "lab");
  const analysis = take(news, used, 4, s => s.kind === "analysis");

  const deskCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const tp of TOPICS) m.set(tp.id, all.filter(s => inSection(s, tp.id)).length);
    return m;
  }, [data, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Media desk
  const items = media?.items ?? [];
  const videos = items.filter(m => m.type === "video");
  const newsroomVideos = videos.filter(v => v.newsroom && !v.interview);
  const watchList = [...newsroomVideos.slice(0, 3), ...videos.filter(v => !v.newsroom && !v.interview).slice(0, 2)]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const interviews = items.filter(m => m.interview).slice(0, 3);
  const episodes = items.filter(m => m.type === "audio" && !interviews.includes(m)).slice(0, 4);

  const loading = !data && !isError;
  const editorial = EDITORIALS[0];
  const openPrograms = PROGRAMS.filter(p => p.status === "open" || p.status === "ongoing").length;
  // Top strip: breaking (3+ outlets in 2 h), developing (3+ in 6 h), or the newest story if under 45 minutes old.
  const newest = news.reduce<typeof news[number] | undefined>((a, b) => (!a || b.publishedAt > a.publishedAt ? b : a), undefined);
  const fresh = newest && Date.now() - new Date(newest.publishedAt).getTime() < 45 * 60_000 ? newest : null;
  const alert = top && isBreaking(top)
    ? { kind: "breaking" as const, story: top.lead, note: `${top.sources} ${locale === "fr" ? "médias" : "outlets"}` }
    : top && isDeveloping(top)
      ? { kind: "developing" as const, story: top.lead, note: `${top.sources} ${locale === "fr" ? "médias" : "outlets"}` }
      : fresh ? { kind: "just-in" as const, story: fresh, note: fresh.source } : null;

  return (
    <PageShell>
      <h1 className="sr-only">{SITE.name} — {SITE.tagline[locale]}</h1>

      {alert && (
        <div className={alert.kind === "breaking" ? "bg-live text-white" : alert.kind === "developing" ? "bg-live/90 text-white" : "bg-night text-white"}>
          <StoryLink s={alert.story} className="container-mw flex items-center gap-3 py-2.5 group">
            <span className={`shrink-0 font-bold text-[0.8rem] px-2 py-0.5 ${alert.kind === "just-in" ? "bg-brass text-night" : "bg-white text-live"} ${alert.kind === "breaking" ? "animate-pulse motion-reduce:animate-none" : ""}`}>
              {alert.kind === "breaking" ? (locale === "fr" ? "Dernière heure" : "Breaking")
                : alert.kind === "developing" ? (locale === "fr" ? "En développement" : "Developing")
                : (locale === "fr" ? "À l'instant" : "Just in")}
            </span>
            <span className="font-semibold leading-snug truncate group-hover:underline">{display(alert.story, locale).title}</span>
            <span className="hidden sm:inline shrink-0 text-white/85 text-sm ml-auto">{alert.note}</span>
          </StoryLink>
        </div>
      )}

      <AdSlot size="leaderboard" placement="home-top" className="container-mw pt-5" />

      {news.length === 0 ? (
        <section className="container-mw pt-10">
          <div className="border-t-[3px] border-night pt-10 pb-16 text-center">
            <span className="live-dot inline-block" aria-hidden="true" />
            <p className="hl text-2xl mt-4">{loading ? t("loading", locale) : t("feedDown", locale)}</p>
          </div>
        </section>
      ) : (
        <section className="container-mw pt-6">
          <div className="grid gap-x-7 gap-y-8 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
            <div className="order-3 lg:order-1">
              <LatestRail stories={news} fetchedAt={data?.fetchedAt} limit={12} />
            </div>

            <div className="order-1 lg:order-2 lg:border-x lg:border-line lg:px-7">
              {lead && (
                <StoryCard
                  s={lead}
                  variant="hero"
                  eager
                  badge={top ? <CoverageBadge outlets={top.sources} developing={isDeveloping(top)} breaking={isBreaking(top)} /> : undefined}
                />
              )}
              {coverage.length > 0 && (
                <div className="mt-5">
                  <p className="text-[0.8rem] font-bold text-muted-ink pb-1.5 border-b border-line">
                    {locale === "fr" ? "Couverture complète" : "Full coverage"}
                  </p>
                  <ul>
                    {coverage.map(s => (
                      <li key={s.id} className="py-2.5 border-b border-line">
                        <StoryLink s={s} className="group flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
                          <span className="leading-snug">
                            <span className="font-semibold group-hover:underline">{display(s, locale).title}</span>{" "}
                            <span className="meta whitespace-nowrap">— {s.source}</span>
                          </span>
                        </StoryLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {related.length > 0 && (
                <div className="mt-5 border-t border-line">
                  {related.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
                </div>
              )}
            </div>

            <div className="order-2 lg:order-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-1 content-start">
              {right.map(s => <StoryCard key={s.id} s={s} />)}
              <AdSlot size="mpu" placement="home-right" className="sm:col-span-2 lg:col-span-1" />
            </div>
          </div>
        </section>
      )}

      {(more.length > 0 || moreFill.length > 0) && (
        <section className="container-mw mt-12">
          <ZoneHead title={locale === "fr" ? "À la une" : "Top stories"} action={<MoreLink to="/news" />} />
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {more.map(c => (
              <StoryCard key={c.id} s={c.lead} variant={c.lead.image ? "card" : "text"} badge={<CoverageBadge outlets={c.sources} developing={isDeveloping(c)} breaking={isBreaking(c)} />} showTopic={false} />
            ))}
            {moreFill.map(s => <StoryCard key={s.id} s={s} />)}
          </div>
        </section>
      )}

      {watchList.length > 0 && <WatchBand videos={watchList} />}

      <section className="container-mw mt-12">
        <ZoneHead title={locale === "fr" ? "Les sections" : "The desks"} sub={locale === "fr" ? "Chaque nouvelle est classée par sujet, comme dans une vraie salle de rédaction." : "Every story is filed to a desk, the way a newsroom works."} />
        <ul className="flex flex-wrap gap-2">
          {TOPICS.map(tp => (
            <li key={tp.id}>
              <Link to="/news" search={{ section: tp.id }} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.92rem] font-semibold hover:border-night">
                {pick(tp.label)}
                <span className="text-muted-ink font-normal tabular-nums">{deskCounts.get(tp.id) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {interviews.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead title={locale === "fr" ? "Entrevues" : "Featured interviews"} action={<MoreLink to="/interviews" />} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2"><InterviewCard m={interviews[0]} large /></div>
              {interviews.slice(1).map(m => <InterviewCard key={m.id} m={m} />)}
            </div>
            <AdSlot size="halfpage" placement="home-interviews" className="hidden lg:flex" />
          </div>
        </section>
      )}

      {(hn.length > 0 || papers.length > 0 || SOCIAL_PICKS.length > 0) && (
        <section className="container-mw mt-14">
          <ZoneHead title={t("trending", locale)} action={<MoreLink to="/news" section="trending" />} />
          <div className="grid gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {hn.length > 0 && (
              <div>
                <h3 className="font-bold text-[1.02rem] pb-1 mb-1 border-b-2 border-night">{t("mostDiscussed", locale)}</h3>
                <ol>
                  {hn.map((s, i) => (
                    <li key={s.id} className="flex gap-4 py-3 border-b border-line last:border-0">
                      <span className="masthead-serif text-[1.8rem] text-brass-ink w-7 shrink-0 leading-none" aria-hidden="true">{i + 1}</span>
                      <div className="min-w-0">
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="font-semibold leading-snug hover:underline">{s.title}</a>
                        <p className="meta mt-1 flex flex-wrap gap-x-2.5">
                          <span>{s.summary}</span>
                          <a href={s.popularity?.discussUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {s.popularity?.score} {t("points", locale)} · {s.popularity?.comments ?? 0} {t("comments", locale)}
                          </a>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="meta mt-2">{locale === "fr" ? "Classement selon les votes sur Hacker News, 3 derniers jours." : "Ranked by Hacker News votes over the last 3 days."}</p>
              </div>
            )}
            <div className="grid gap-10 content-start">
              {papers.length > 0 && (
                <div>
                  <h3 className="font-bold text-[1.02rem] pb-1 mb-1 border-b-2 border-night">{t("trendingPapers", locale)}</h3>
                  <ul>
                    {papers.map(s => (
                      <li key={s.id} className="py-3 border-b border-line last:border-0">
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="group block">
                          <p className="font-semibold leading-snug group-hover:underline">{s.title}</p>
                          <p className="meta mt-1">Hugging Face Papers · {s.popularity?.score} {t("upvotes", locale)}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {SOCIAL_PICKS.length > 0 && (
                <div>
                  <h3 className="font-bold text-[1.02rem] pb-1 mb-1 border-b-2 border-night">{t("socialPicks", locale)}</h3>
                  <ul>
                    {SOCIAL_PICKS.slice(0, 5).map(p => (
                      <li key={p.url} className="py-3 border-b border-line last:border-0">
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
                          <p className="meta"><span className="font-semibold text-ink/80">{p.author}</span> · {p.platform === "x" ? "X" : p.platform === "linkedin" ? "LinkedIn" : p.platform === "youtube" ? "YouTube" : ""}</p>
                          <p className="font-semibold leading-snug mt-0.5 group-hover:underline">{pick(p.why)}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {desks.length > 0 && (
        <section className="container-mw mt-14">
          <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
            {desks.map(d => (
              <div key={d.id}>
                <ZoneHead title={<span className="block text-[1.35rem] sm:text-[1.5rem] leading-tight">{pick(TOPICS.find(x => x.id === d.id)!.label)}</span>} action={<MoreLink to="/news" section={d.id} compact />} />
                {d.items[0] && <StoryCard s={d.items[0]} variant={d.items[0].image ? "card" : "text"} showTopic={false} />}
                <div className="mt-3">
                  {d.items.slice(1).map(s => <StoryCard key={s.id} s={s} variant="list" />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AdSlot size="billboard" placement="home-mid" className="container-mw mt-14" />

      {episodes.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead title={locale === "fr" ? "À écouter" : "Listen"} action={<MoreLink to="/listen" />} />
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            {episodes.map(a => <AudioEpisode key={a.id} a={a} compact />)}
          </div>
        </section>
      )}

      <section className="mt-14 bg-night text-white">
        <div className="container-mw py-12">
          <NewsletterBox />
        </div>
      </section>

      {(official.length > 0 || ministerNews.length > 0 || canada.length > 0) && (
        <section className="container-mw mt-14">
          <div className="grid gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <ZoneHead
                title={<span className="flex items-center gap-2.5"><Landmark className="h-6 w-6 text-brass-ink" aria-hidden="true" />{t("trackerTitle", locale)}</span>}
                action={<MoreLink to="/ministry" />}
                sub={`${t("minister", locale)} · Evan Solomon`}
              />
              {official[0] && (
                <StoryLink s={official[0]} className="group block pb-4 border-b border-line">
                  <p className="topic mb-1">{t("officialReleases", locale)}</p>
                  <h3 className="hl text-[1.5rem] sm:text-[1.8rem] group-hover:underline decoration-2">{official[0].title}</h3>
                  {official[0].summary && <p className="dek mt-2 line-clamp-2">{official[0].summary}</p>}
                  <StoryMeta s={official[0]} className="mt-1.5" />
                </StoryLink>
              )}
              {[...official.slice(1), ...ministerNews].map(s => <StoryCard key={s.id} s={s} variant="list" />)}
            </div>
            <div>
              <ZoneHead title={t("canadaDesk", locale)} action={<MoreLink to="/news" section="canada" />} />
              {canada[0] && <StoryCard s={canada[0]} variant={canada[0].image ? "card" : "text"} showTopic={false} />}
              <div className="mt-3">{canada.slice(1).map(s => <StoryCard key={s.id} s={s} variant="list" />)}</div>
            </div>
          </div>
        </section>
      )}

      {govCols.some(c => c.items.length > 0) && (
        <section className="container-mw mt-14">
          <ZoneHead title={t("government", locale)} action={<MoreLink to="/government" />} />
          <div className="grid gap-x-7 gap-y-8 md:grid-cols-3">
            {govCols.map(col => (
              <div key={col.level}>
                <h3 className="font-bold text-[1.02rem] pb-1 mb-1 border-b-2 border-night">{pick(LEVEL_LABEL[col.level])}</h3>
                {col.items.length === 0
                  ? <p className="meta py-3">{t("noItems", locale)}</p>
                  : col.items.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
              </div>
            ))}
          </div>
        </section>
      )}

      {(labs.length > 0 || analysis.length > 0) && (
        <section className="container-mw mt-14">
          <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
            {labs.length > 0 && (
              <div>
                <ZoneHead title={t("researchLabs", locale)} action={<MoreLink to="/news" section="labs" />} />
                <div className="grid gap-6 sm:grid-cols-2">
                  {labs.map(s => <StoryCard key={s.id} s={s} variant={s.image ? "card" : "text"} showTopic={false} />)}
                </div>
              </div>
            )}
            {analysis.length > 0 && (
              <div>
                <ZoneHead title={t("analysis", locale)} action={<MoreLink to="/news" section="analysis" />} />
                <div className="grid gap-6 sm:grid-cols-2">
                  {analysis.map(s => <StoryCard key={s.id} s={s} variant="text" showTopic={false} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {editorial && (
        <section className="container-mw mt-14">
          <ZoneHead title={t("editorsDesk", locale)} action={<MoreLink to="/editor" />} />
          <Link to="/editor/$slug" params={{ slug: editorial.slug }} className="group grid gap-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8 items-end">
            <h3 className="masthead-serif text-[2rem] sm:text-[2.6rem] leading-[1.08] group-hover:underline decoration-2">{pick(editorial.title)}</h3>
            <p className="dek">{pick(editorial.dek)}</p>
          </Link>
        </section>
      )}

      <section className="container-mw mt-14">
        <ZoneHead title={t("resources", locale)} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Resource to="/learn" icon={<BookOpen className="h-5 w-5" />} title={t("startHere", locale)}
            text={locale === "fr" ? `${GUIDES.length} guides simples pour bien commencer avec l'IA.` : `${GUIDES.length} plain-language guides to get started with AI.`} />
          <Resource to="/tools" icon={<Wrench className="h-5 w-5" />} title={t("bestTools", locale)}
            text={locale === "fr" ? `${TOOLS.length} outils classés selon ce que vous voulez faire.` : `${TOOLS.length} tools, grouped by what you want to get done.`} />
          <Resource to="/funding" icon={<Coins className="h-5 w-5" />} title={t("moneyForAi", locale)}
            text={locale === "fr" ? `${openPrograms} programmes canadiens ouverts ou continus, vérifiés sur les pages officielles.` : `${openPrograms} open or ongoing Canadian programs, checked against official pages.`} />
        </div>
      </section>
    </PageShell>
  );
}

/** Dark broadcast band: one player, a running list beside it. */
function WatchBand({ videos }: { videos: MediaItem[] }) {
  const { locale } = useLocale();
  const [current, setCurrent] = useState(0);
  const v = videos[Math.min(current, videos.length - 1)];
  return (
    <section className="mt-14 bg-night text-white">
      <div className="container-mw py-10">
        <ZoneHead
          dark
          title={<span className="flex items-center gap-3"><span className="live-dot" aria-hidden="true" />{locale === "fr" ? "Vidéos" : "Watch"}</span>}
          action={<MoreLink to="/watch" dark />}
          sub={locale === "fr" ? "Les reportages IA des grandes chaînes, des laboratoires et des créateurs, dans le lecteur de l'éditeur." : "AI reports from broadcasters, labs and explainers, in each publisher's own player."}
        />
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div>
            <VideoPlayer key={v.id} v={v} />
            <h3 className="hl text-[1.5rem] sm:text-[1.9rem] mt-4">{v.title}</h3>
            <MediaMeta m={v} dark className="mt-2" />
          </div>
          <ul className="grid gap-4 content-start">
            {videos.map((x, i) => (
              <li key={x.id}>
                <VideoTile v={x} dark active={i === current} onSelect={() => setCurrent(i)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Resource({ to, icon, title, text }: { to: "/learn" | "/tools" | "/funding"; icon: ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="group flex gap-3 items-start border border-line bg-surface rounded-[4px] p-4 hover:border-night">
      <span className="mt-0.5 text-lake" aria-hidden="true">{icon}</span>
      <span>
        <span className="block font-bold group-hover:underline">{title}</span>
        <span className="block text-[0.92rem] text-muted-ink leading-snug mt-0.5">{text}</span>
      </span>
    </Link>
  );
}

export function MoreLink({ to, section, dark = false, compact = false }: { to: "/news" | "/government" | "/ministry" | "/editor" | "/watch" | "/listen" | "/interviews"; section?: SectionId; dark?: boolean; compact?: boolean }) {
  const { locale } = useLocale();
  return (
    <Link
      to={to}
      search={section ? ({ section } as never) : undefined}
      className={`inline-flex items-center gap-1 font-semibold text-[0.9rem] whitespace-nowrap hover:underline ${dark ? "text-brass" : "text-lake"}`}
      aria-label={compact ? t("seeAll", locale) : undefined}
    >
      {compact ? null : t("seeAll", locale)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
