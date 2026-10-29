import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Landmark, BookOpen, Wrench, Coins, Baby } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { StoryCard, StoryLink, StoryMeta, CoverageBadge } from "@/components/StoryCard";
import { LiveHero, ownDate, type HeroSlide, type OwnItem, type StorySlide } from "@/components/LiveHero";
import { usePulse, getPulseFast, trendMatch } from "@/lib/pulse";
import { useOriginals, getOriginalsFast } from "@/lib/originals";
import { originalSection } from "@/lib/originals-types";
import { OriginalCard } from "@/components/Originals";
import { NextCase } from "@/components/SirJack";
import { humanLens, LENS_LABEL } from "@/lib/editorial";
import { getNewsroomFast, useNewsroom } from "@/lib/newsroom";
import {
  getFrontPageNews, useAiNews, byLocale, diversify, clusterStories, useRefinedClusters, isDeveloping, isBreaking, isFrontPool, display,
  DESKS, inSection, type Story, type SectionId,
} from "@/lib/news";
import { PROGRAMS } from "@/lib/funding";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead, organizationLd, absUrl } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async () => {
    // Secondary desks hydrate through their own hooks; none can delay first paint.
    const [news, pulse, originals, newsroom] = await Promise.all([
      getFrontPageNews().catch(() => null), getPulseFast(150), getOriginalsFast(150), getNewsroomFast(150),
    ]);
    return { news, pulse, originals, newsroom };
  },
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `${SITE.name} — ${SITE.tagline.en}`, fr: `${SITE.name} — ${SITE.tagline.fr}` },
      description: SITE.tagline,
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

function Home() {
  const { news: initial, pulse: initialPulse, originals: initialOriginals, newsroom } = Route.useLoaderData();
  const { data: originals } = useOriginals(initialOriginals);
  const { data, isError } = useAiNews(initial);
  const { data: pulse } = usePulse(initialPulse);
  const { locale, pick } = useLocale();

  const all = byLocale(data?.stories ?? [], locale);
  const news = diversify(all.filter(isFrontPool));
  const heuristic = useMemo(() => clusterStories(all), [data, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  const clusters = useRefinedClusters(heuristic);
  const used = new Set<string>();

  // Hero: the five events the most newsrooms are covering (Google-trending ones
  // first among equals), then the newest photo stories to fill.
  const heroClusters = clusters
    .filter(c => c.sources >= 2)
    .map(c => {
      // Freshness keeps the stage live: the newest reporting climbs, yesterday's slides away.
      const ageH = (Date.now() - Math.max(...c.stories.map(x => new Date(x.publishedAt).getTime()))) / 3600_000;
      const fresh = ageH < 1 ? 18 : ageH < 3 ? 10 : ageH < 8 ? 4 : ageH > 24 ? -15 : 0;
      return { c, score: c.sources * 10 + fresh + (trendMatch(c.lead, pulse) ? 15 : 0) + (isBreaking(c) ? 20 : isDeveloping(c) ? 8 : 0) };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, 5)
    .map(x => x.c);
  const storySlides: StorySlide[] = heroClusters.map(c => (
    { story: c.lead, outlets: c.sources, sources: [...new Set(c.stories.map(s => s.source))], developing: isDeveloping(c), breaking: isBreaking(c), trend: trendMatch(c.lead, pulse) }
  ));

  // Our own work holds the stage: our newest videos, with one of our newsroom's articles in
  // every other slot (two once the newsroom has five or more). No outlet's photo or headline
  // leads the page; the events most outlets are covering lead Top stories below instead.
  // The wire stories above only stand in while our own lists are still loading.
  const { data: nrData } = useNewsroom(newsroom);
  const articles = nrData?.items ?? [];
  const ownAll = [...(originals?.items ?? [])].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const stageVideos = ownAll.slice(0, 4);
  const stageArticles = articles.slice(0, articles.length >= 5 ? 2 : 1);
  const ownStage: HeroSlide[] = stageVideos.flatMap((o, i) => [
    { kind: "original" as const, original: o },
    ...(stageArticles[i] ? [{ kind: "article" as const, article: stageArticles[i] }] : []),
  ]);
  const ownOnStage = ownStage.length > 0;
  const stageClusters = ownOnStage ? [] : heroClusters;
  stageClusters.forEach(c => c.stories.forEach(s => used.add(s.id)));
  const slides: HeroSlide[] = (ownOnStage ? ownStage : storySlides).slice(0, 6);
  // Beside the stage: the rest of our own work, newest first, as a mix: up to two articles,
  // then videos with at most two from any one shelf (so one series never fills the column).
  const perShelf = new Map<string, number>();
  const columnVideos = ownAll.filter(o => {
    if (stageVideos.includes(o)) return false;
    const shelf = originalSection(o), n = perShelf.get(shelf) ?? 0;
    if (n >= 2) return false;
    perShelf.set(shelf, n + 1);
    return true;
  });
  const columnArticles = articles.filter(a => !stageArticles.includes(a)).slice(0, 2);
  const ownColumn: OwnItem[] = [
    ...columnArticles.map(a => ({ kind: "article" as const, article: a })),
    ...columnVideos.slice(0, 6 - columnArticles.length).map(o => ({ kind: "original" as const, original: o })),
  ].sort((x, y) => ownDate(y).localeCompare(ownDate(x)));
  const inColumn = new Set(ownColumn.map(x => (x.kind === "original" ? x.original.id : x.article.id)));
  const top = heroClusters[0];
  const newestFirst = [...news].sort((x, y) => y.publishedAt.localeCompare(x.publishedAt));

  // The front page has six parts (owner's brief, 29 Oct 2026): our own work on the stage, then
  // Canada, Rights & power, Work & culture beside Research, the Sir Jack Files, and the world in brief.
  // Canadian stories come first in every desk; the full feed stays on /news.
  const canadaFirst = (xs: Story[]) => [...xs.filter(s => s.region === "canada"), ...xs.filter(s => s.region !== "canada")];
  const official = take(all, used, 2, s => s.minister && s.gov);
  const canada = take(news, used, 5, s => inSection(s, "canada"));
  const rights = take(canadaFirst(news), used, 6, s => inSection(s, "rights"));
  const work = take(canadaFirst(news), used, 4, s => inSection(s, "work"));
  const science = take(canadaFirst(news), used, 4, s => inSection(s, "science"));
  // The world, briefly: the events the most outlets are covering, one line each.
  const world = clusters
    .filter(c => !stageClusters.includes(c) && c.sources >= 2 && !used.has(c.lead.id))
    .slice(0, 5);
  world.forEach(c => c.stories.forEach(s => used.add(s.id)));

  const loading = !data && !isError;
  const openPrograms = PROGRAMS.filter(p => p.status === "open" || p.status === "ongoing").length;
  // Top strip: breaking (3+ outlets in 2 h), developing (3+ in 6 h), or the newest story if under 45 minutes old.
  const newest = news.reduce<typeof news[number] | undefined>((a, b) => (!a || b.publishedAt > a.publishedAt ? b : a), undefined);
  const fresh = newest && Date.now() - new Date(newest.publishedAt).getTime() < 45 * 60_000 ? newest : null;
  const alert: { kind: "breaking" | "developing" | "just-in"; story: Story; note: string } | null = top && isBreaking(top)
    ? { kind: "breaking" as const, story: top.lead, note: `${top.sources} ${locale === "fr" ? "médias" : "outlets"}` }
    : top && isDeveloping(top)
      ? { kind: "developing" as const, story: top.lead, note: `${top.sources} ${locale === "fr" ? "médias" : "outlets"}` }
      : fresh ? { kind: "just-in" as const, story: fresh, note: fresh.source } : null;
  // With our own work on the stage, Breaking and Developing reach readers through this strip.
  const showStrip = !!alert && (ownOnStage || (alert.kind === "just-in" && !storySlides.some(sl => sl.story.id === alert.story.id)));
  const desk = (id: SectionId) => DESKS.find(d => d.id === id)!;

  return (
    <PageShell>
      <h1 className="sr-only">{SITE.name} — {SITE.tagline[locale]}</h1>

      {/* The hero already carries Breaking/Developing for its lead; the strip only adds a different, newer story. */}
      {alert && showStrip && (
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

      {/* 1. Our own work on the stage */}
      {news.length === 0 && slides.length === 0 ? (
        <section className="container-mw pt-10">
          <div className="border-t-[3px] border-night pt-10 pb-16 text-center">
            <span className="live-dot inline-block" aria-hidden="true" />
            <p className="hl text-2xl mt-4">{loading ? t("loading", locale) : t("feedDown", locale)}</p>
          </div>
        </section>
      ) : (
        <LiveHero slides={slides} latest={newestFirst} own={ownColumn} />
      )}

      {/* 2. Canada */}
      {(official.length > 0 || canada.length > 0) && (
        <section className="container-mw mt-12">
          <ZoneHead title={pick(desk("canada").label)} sub={pick(desk("canada").dek)} action={<MoreLink to="/news" section="canada" />} />
          <div className="grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              {official[0] ? (
                <StoryLink s={official[0]} className="group block pb-4 border-b border-line">
                  <p className="topic mb-1 inline-flex items-center gap-1.5"><Landmark className="h-4 w-4" aria-hidden="true" />{t("officialReleases", locale)} · Evan Solomon</p>
                  <h3 className="hl text-[1.5rem] sm:text-[1.8rem] group-hover:underline decoration-2">{official[0].title}</h3>
                  {official[0].summary && <p className="dek mt-2 line-clamp-2">{official[0].summary}</p>}
                  <StoryMeta s={official[0]} className="mt-1.5" />
                </StoryLink>
              ) : canada[0] && <StoryCard s={canada[0]} variant={canada[0].image ? "card" : "text"} showTopic={false} />}
              {official.slice(1).map(s => <StoryCard key={s.id} s={s} variant="list" />)}
            </div>
            <div>{(official[0] ? canada : canada.slice(1)).map(s => <StoryCard key={s.id} s={s} variant="list" />)}</div>
          </div>
        </section>
      )}

      {/* 3. Rights & power */}
      {rights.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead
            title={pick(desk("rights").label)}
            sub={pick(desk("rights").dek)}
            action={<MoreLink to="/news" section="rights" />}
          />
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {rights.map(s => (
              <StoryCard
                key={s.id}
                s={s}
                variant={s.image ? "card" : "text"}
                badge={humanLens(s).length > 0 ? <span className="inline-flex flex-wrap gap-1.5">{humanLens(s).map(l => <span key={l} className="text-[0.75rem] font-bold bg-lake/10 text-lake px-1.5 py-0.5">{pick(LENS_LABEL[l])}</span>)}</span> : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Work & culture, beside Research */}
      {(work.length > 0 || science.length > 0) && (
        <section className="container-mw mt-14">
          <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
            {(["work", "science"] as const).map(id => {
              const items = id === "work" ? work : science;
              if (items.length === 0) return null;
              return (
                <div key={id}>
                  <ZoneHead title={pick(desk(id).label)} sub={pick(desk(id).dek)} action={<MoreLink to="/news" section={id} />} />
                  {items[0] && <StoryCard s={items[0]} variant={items[0].image ? "card" : "text"} showTopic={false} />}
                  <div className="mt-3">{items.slice(1).map(s => <StoryCard key={s.id} s={s} variant="list" />)}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. The Sir Jack Files and our explainers */}
      {(originals?.items.length ?? 0) > 0 && (
        <section className="mt-14 bg-signal text-signal-ink">
          <div className="container-mw py-10">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
              <div>
                <h2 className="masthead-serif text-[2.2rem] sm:text-[2.8rem] leading-none">{locale === "fr" ? "Les dossiers Sir Jack" : "The Sir Jack Files"}</h2>
                <p className="font-semibold mt-2">{locale === "fr" ? "Des cas réels d'IA, racontés avec des scènes dessinées à la main en code." : "Real AI cases, told with scenes drawn by hand in code."}</p>
              </div>
              <Link to="/originals" className="inline-flex items-center gap-1 font-bold underline underline-offset-4 decoration-2">{locale === "fr" ? "Tous les explicatifs" : "All explainers"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <NextCase variant="strip" />
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {ownAll.filter(o => !stageVideos.includes(o) && !inColumn.has(o.id)).slice(0, 4).map(o => <OriginalCard key={o.id} o={o} />)}
            </div>
          </div>
        </section>
      )}

      {/* 6. The world, briefly */}
      {world.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead title={pick(desk("world").label)} sub={pick(desk("world").dek)} action={<MoreLink to="/news" section="world" />} />
          <ol className="grid gap-x-8 md:grid-cols-2">
            {world.map(c => (
              <li key={c.id}>
                <StoryCard s={c.lead} variant="list" badge={<CoverageBadge outlets={c.sources} developing={isDeveloping(c)} breaking={isBreaking(c)} />} />
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="container-mw mt-14">
        <ZoneHead title={t("resources", locale)} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Resource to="/labs" icon={<BookOpen className="h-5 w-5" />} title={locale === "fr" ? "Apprendre l'IA" : "Learn AI"}
            text={locale === "fr" ? "Des parcours gratuits, du débutant à l'expert." : "Free learning paths, from beginner to builder."} />
          <Resource to="/labs/young" icon={<Baby className="h-5 w-5" />} title="Young Lab"
            text={locale === "fr" ? "Des jeux pour les 8 à 17 ans, sans collecte de données." : "Games for ages 8 to 17. Nothing a child types is collected."} />
          <Resource to="/funding" icon={<Coins className="h-5 w-5" />} title={t("moneyForAi", locale)}
            text={locale === "fr" ? `${openPrograms} programmes canadiens ouverts ou continus, vérifiés sur les pages officielles.` : `${openPrograms} open or ongoing Canadian programs, checked against official pages.`} />
          <Resource to="/about" icon={<Wrench className="h-5 w-5" />} title="Open Desk Journalism"
            text={locale === "fr" ? "Qui nous sommes et comment nous travaillons." : "Who we are and how we work."} />
        </div>
      </section>
    </PageShell>
  );
}

function Resource({ to, icon, title, text }: { to: "/labs" | "/labs/young" | "/funding" | "/about"; icon: ReactNode; title: string; text: string }) {
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

export function MoreLink({ to, section, dark = false, compact = false }: { to: "/news" | "/government" | "/ministry" | "/editor" | "/watch" | "/listen" | "/interviews" | "/showcase"; section?: SectionId; dark?: boolean; compact?: boolean }) {
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
