import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Coins, Landmark, Wrench } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { LatestRail } from "@/components/LatestRail";
import { StoryCard, StoryLink, CoverageBadge } from "@/components/StoryCard";
import { AdSlot } from "@/components/AdSlot";
import { VideoPlayer, VideoTile, InterviewCard, AudioEpisode, MediaMeta } from "@/components/Media";
import { NewsletterBox } from "@/components/NewsletterBox";
import { OriginalCard } from "@/components/Originals";
import { LiveHero, ownDate, type HeroSlide, type OwnItem } from "@/components/LiveHero";
import { TodayLauncher } from "@/components/Today";
import { originalSection } from "@/lib/originals-types";
import { DispatchRail } from "@/components/Dispatch";
import { NewsroomLead } from "@/components/NewsroomLead";
import { FromOurDesk } from "@/components/StudioCards";
import { TrustBar } from "@/components/Trust";
import { LedgerFront, OpenDeskBand } from "@/components/Ledger";
import { LabsBand } from "@/components/Labs";
import { AskKeeperBand } from "@/components/Keeper";
import { QuizCard } from "@/components/Quiz";
import { YoungLabBand } from "@/components/YoungLab";
import { usePulse, getPulseFast, trendMatch, type PulsePayload } from "@/lib/pulse";
import { useOriginals, getOriginalsFast } from "@/lib/originals";
import { getDispatchesFast } from "@/lib/dispatch";
import { getDailyQuizFast } from "@/lib/youth";
import { getNewsroomFast, useNewsroom } from "@/lib/newsroom";
import {
  getFrontPageNews, useAiNews, byLocale, diversify, clusterStories, useRefinedClusters, isDeveloping, isBreaking, isFrontPool, display,
  type Story, type SectionId,
} from "@/lib/news";
import { useMedia, type MediaItem } from "@/lib/media";
import { GUIDES } from "@/lib/guides";
import { TOOLS } from "@/lib/tools";
import { PROGRAMS } from "@/lib/funding";
import { HUBS } from "@/lib/hubs";
import { EDITORIALS } from "@/lib/editorials";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
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
      title: { en: `${SITE.name}: ${SITE.openDesk.subtitle.en}`, fr: `${SITE.name} : ${SITE.openDesk.subtitle.fr}` },
      description: {
        en: "An Open Desk newsroom from Ottawa: what AI companies say about jobs and AI, recorded, tested against the evidence and signed by a named editor, in English and French.",
        fr: "Une rédaction Open Desk à Ottawa : ce que disent les entreprises d'IA sur l'emploi, consigné, vérifié et signé par un responsable nommé, en français et en anglais.",
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

  const articles = nrData?.items ?? [];
  // Other outlets' events get one compact block lower on the page (owner, 10 Nov 2026: the front was drowning in them).
  const topClusters = ranked.slice(0, 6);
  topClusters.forEach(c => c.stories.forEach(s => used.add(s.id)));
  const newestFirst = [...news].sort((x, y) => y.publishedAt.localeCompare(x.publishedAt));

  const canada = take(news, used, 5, s => s.region === "canada");
  const official = all.filter(s => s.minister && s.gov && s.lang === locale).slice(0, 3);

  // The stage (owner decision, 10 Nov 2026: bring back the first edition's hero). Our own work holds it:
  // our newest videos, with one of our newsroom's articles in every other slot. Other outlets' events
  // only stand in while our own lists are empty.
  const ownAll = [...(originals?.items ?? [])].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const stageVideos = ownAll.slice(0, 4);
  const stageArticles = articles.slice(0, articles.length >= 5 ? 2 : 1);
  const ownStage: HeroSlide[] = stageVideos.flatMap((o, i) => [
    { kind: "original" as const, original: o },
    ...(stageArticles[i] ? [{ kind: "article" as const, article: stageArticles[i] }] : []),
  ]);
  const storySlides: HeroSlide[] = ranked.slice(0, 5).map(c => ({
    kind: "story" as const, story: c.lead, outlets: c.sources, sources: [...new Set(c.stories.map(s => s.source))],
    developing: isDeveloping(c), breaking: isBreaking(c), trend: trendMatch(c.lead, pulse),
  }));
  const slides: HeroSlide[] = (ownStage.length > 0 ? ownStage : storySlides).slice(0, 6);
  // Beside the stage: the rest of our own work, newest first, at most two from any one shelf.
  const perShelf = new Map<string, number>();
  const columnVideos = ownAll.filter(o => {
    if (stageVideos.includes(o)) return false;
    const shelf = originalSection(o), k = perShelf.get(shelf) ?? 0;
    if (k >= 2) return false;
    perShelf.set(shelf, k + 1);
    return true;
  });
  const columnArticles = articles.filter(a => !stageArticles.includes(a)).slice(0, 2);
  const ownColumn: OwnItem[] = [
    ...columnArticles.map(a => ({ kind: "article" as const, article: a })),
    ...columnVideos.slice(0, 6 - columnArticles.length).map(o => ({ kind: "original" as const, original: o })),
  ].sort((x, y) => ownDate(y).localeCompare(ownDate(x)));

  const ownVideos = ownAll.slice(0, 8);
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
      <h1 className="sr-only">{SITE.name} — {SITE.openDesk.subtitle[locale]}</h1>


      {/* Today in 60 seconds: the round story bubbles of the first edition (owner asked for them back, 10 Nov 2026). */}
      <div className="bg-night"><TodayLauncher initialNews={initial} initialDispatches={dispatches} dark className="container-mw pt-4 pb-1" /></div>

      {/* Breaking or developing: one line, only when several outlets are on the same event. */}
      {alert && (
        <div className={alert.kind === "breaking" ? "bg-live text-white" : "bg-ink text-white"}>
          <StoryLink s={alert.story} className="container-mw flex items-center gap-3 py-2.5 group">
            <span className={`shrink-0 font-bold text-[0.72rem] uppercase tracking-[0.08em] px-2 py-0.5 ${alert.kind === "breaking" ? "bg-white text-live animate-pulse motion-reduce:animate-none" : "bg-live text-white"}`}>
              {alert.kind === "breaking" ? (fr ? "Dernière heure" : "Breaking") : (fr ? "En développement" : "Developing")}
            </span>
            <span className="font-serif font-semibold text-[1.05rem] leading-snug truncate group-hover:underline">{display(alert.story, locale).title}</span>
            <span className="hidden sm:inline shrink-0 text-white/85 text-sm ml-auto">{alert.outlets} {fr ? "médias" : "outlets"}</span>
          </StoryLink>
        </div>
      )}

      {/* Front-page slot for a short "news in seconds" feature: add it here, between the strip and the stage. */}

      {/* The stage: our own videos and articles, the first edition's hero. */}
      {slides.length === 0 ? (
        <section className="container-mw pt-10">
          <div className="border-t-[3px] border-night pt-10 pb-16 text-center">
            <span className="live-dot inline-block" aria-hidden="true" />
            <p className="hl text-2xl mt-4">{loading ? t("loading", locale) : t("feedDown", locale)}</p>
          </div>
        </section>
      ) : (
        <LiveHero slides={slides} latest={newestFirst} own={ownColumn} />
      )}

      {/* Open Desk: the ledger of recorded and tested claims, right under our own work. */}
      <LedgerFront className="container-mw mt-12" />
      <OpenDeskBand className="container-mw mt-10" />

      <div className="container-mw mt-8"><TrustBar /></div>

      <FromOurDesk className="container-mw mt-12" />

      {/* Our newsroom's summaries (the lead above is left out) and dispatches. */}
      <NewsroomLead initial={newsroom} exclude={stageArticles.map(a => a.id)} className="container-mw mt-12" />

      {/* Young Lab: the part of the site real readers (classrooms) use most. */}
      <div className="mt-14"><YoungLabBand /></div>
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

      {/* Other outlets, once and compactly: the events several newsrooms are covering, and the running list. */}
      {(topClusters.length > 0 || newestFirst.length > 0) && (
        <section className="container-mw mt-14" aria-labelledby="other-outlets">
          <ZoneHead id="other-outlets" title={fr ? "Ailleurs dans l'actualité IA" : "Elsewhere in AI news"} sub={fr ? "Titres d'autres médias, avec un lien vers leur reportage." : "Headlines from other newsrooms, linked to their reporting."} action={<MoreLink to="/news" />} />
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-x-8 sm:grid-cols-2 content-start border-t border-ink/80">
              {topClusters.map(c => (
                <div key={c.id} className="py-4 border-b border-line">
                  <StoryCard s={c.lead} variant="text" showTopic badge={<><CoverageBadge outlets={c.sources} developing={isDeveloping(c)} breaking={isBreaking(c)} /><TrendBadge s={c.lead} pulse={pulse} /></>} />
                </div>
              ))}
            </div>
            <aside className="min-w-0 grid gap-6 content-start lg:border-l lg:border-line lg:pl-8">
              <LatestRail stories={newestFirst} fetchedAt={data?.fetchedAt} limit={6} />
              <AdSlot size="mpu" placement="home-right" />
            </aside>
          </div>
        </section>
      )}

      <section className="mt-14 bg-night text-white">
        <div className="container-mw py-12"><NewsletterBox variant="band" /></div>
      </section>

      <AdSlot size="leaderboard" placement="home-top" className="container-mw mt-14" />

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
