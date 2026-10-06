import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Landmark, BookOpen, Wrench, Coins } from "lucide-react";
import type { ReactNode } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { LatestRail } from "@/components/LatestRail";
import { StoryCard } from "@/components/StoryCard";
import { getAiNewsFast, useAiNews, byLocale, timeAgo, useNow, LEVEL_LABEL, type Story, type SectionId } from "@/lib/news";
import { PROGRAMS } from "@/lib/funding";
import { GUIDES } from "@/lib/guides";
import { TOOLS } from "@/lib/tools";
import { EDITORIALS } from "@/lib/editorials";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => getAiNewsFast(),
  head: () => ({
    meta: [
      { title: `${SITE.name} — AI news for Canada, live` },
      { name: "description", content: SITE.description.en },
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
  const initial = Route.useLoaderData();
  const { data, isError } = useAiNews(initial);
  const { locale, pick } = useLocale();

  const all = byLocale(data?.stories ?? [], locale);
  const news = all.filter(s => !s.gov);
  const photo = news.filter(s => s.image);
  const used = new Set<string>();

  // Front zone. Lead: the newest Canadian photo story among the ten newest photo stories.
  const lead = take(photo.slice(0, 10), used, 1, s => s.region === "canada")[0] ?? take(photo, used, 1)[0];
  const related = lead ? take(news, used, 3, s => s.topic === lead.topic) : [];
  const right = take(photo, used, 3);

  // AI Ministry tracker
  const official = all.filter(s => s.minister && s.gov);
  const coverage = all.filter(s => s.minister && !s.gov).slice(0, 4);

  const canadaPhotos = take(photo, used, 3, s => s.region === "canada");
  const canadaList = take(news, used, 6, s => s.region === "canada");

  // Government by level: official releases plus newsroom coverage tagged to that level.
  const govCols = (["federal", "provincial", "municipal"] as const).map(level => ({
    level,
    items: all.filter(s => s.level === level).slice(0, 5),
  }));

  const world = take(photo, used, 4, s => s.region === "world" && s.kind === "news");
  const worldList = take(news, used, 5, s => s.region === "world" && s.kind === "news");

  type Zone = { id: SectionId; title: string; stories: Story[] };
  const zones = ([
    { id: "business", title: t("business", locale), stories: take(news, used, 4, s => s.topic === "business") },
    { id: "research", title: t("research", locale), stories: take(news, used, 4, s => s.topic === "research" && s.kind !== "analysis") },
    { id: "products", title: locale === "fr" ? "Produits" : "Products", stories: take(news, used, 4, s => s.topic === "products") },
    { id: "society", title: locale === "fr" ? "Société" : "Society", stories: take(news, used, 4, s => s.topic === "society" || s.topic === "policy") },
  ] as Zone[]).filter(z => z.stories.length > 0);

  const labs = take(news, used, 4, s => s.kind === "lab");
  const analysis = take(news, used, 4, s => s.kind === "analysis");

  const loading = !data && !isError;
  const editorial = EDITORIALS[0];
  const openPrograms = PROGRAMS.filter(p => p.status === "open" || p.status === "ongoing").length;

  return (
    <PageShell>
      <h1 className="sr-only">{SITE.name} — {SITE.tagline[locale]}</h1>

      {news.length === 0 ? (
        <section className="container-mw pt-10">
          <div className="border-t-[4px] border-ink pt-10 pb-16 text-center">
            <span className="live-dot inline-block" aria-hidden="true" />
            <p className="hl text-2xl mt-4">{loading ? t("loading", locale) : t("feedDown", locale)}</p>
          </div>
        </section>
      ) : (
        <section className="container-mw pt-6">
          <div className="grid gap-x-7 gap-y-8 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
            <div className="order-3 lg:order-1">
              <LatestRail stories={news} fetchedAt={data?.fetchedAt} limit={11} />
            </div>

            <div className="order-1 lg:order-2 lg:border-x lg:border-line lg:px-7">
              {lead && <StoryCard s={lead} variant="hero" eager />}
              {related.length > 0 && (
                <ul className="mt-5 border-t border-line">
                  {related.map(s => (
                    <li key={s.id} className="py-2.5 border-b border-line">
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="group flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-live" aria-hidden="true" />
                        <span className="font-semibold leading-snug group-hover:underline">
                          {s.title} <span className="meta font-normal whitespace-nowrap">— {s.source}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="order-2 lg:order-3 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 content-start">
              {right.map(s => <StoryCard key={s.id} s={s} />)}
            </div>
          </div>
        </section>
      )}

      {/* AI Ministry tracker */}
      {(official.length > 0 || coverage.length > 0) && (
        <section className="mt-12 bg-ink text-white">
          <div className="container-mw py-10">
            <ZoneHead
              dark
              title={<span className="flex items-center gap-3"><Landmark className="h-7 w-7" aria-hidden="true" />{t("trackerTitle", locale)}</span>}
              action={<MoreLink to="/ministry" dark />}
            />
            <p className="text-white/70 -mt-2 mb-6">{t("minister", locale)} · Evan Solomon</p>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div>
                <p className="font-semibold text-white/70 mb-2">{t("officialReleases", locale)}</p>
                {official[0] && (
                  <a href={official[0].link} target="_blank" rel="noopener noreferrer" className="group block pb-5 border-b border-white/20">
                    <h3 className="hl text-[1.6rem] sm:text-[2.1rem] group-hover:underline decoration-2">{official[0].title}</h3>
                    {official[0].summary && <p className="font-serif text-white/80 mt-2 text-[1.05rem] leading-relaxed line-clamp-3">{official[0].summary}</p>}
                    <DarkMeta s={official[0]} />
                  </a>
                )}
                <ul>
                  {official.slice(1, 5).map(s => (
                    <li key={s.id} className="py-3 border-b border-white/20 last:border-0">
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="group block">
                        <p className="font-semibold leading-snug group-hover:underline">{s.title}</p>
                        <DarkMeta s={s} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:border-l lg:border-white/20 lg:pl-8">
                <p className="font-semibold text-white/70 mb-2">{t("inTheNews", locale)}</p>
                {coverage.length === 0 ? (
                  <p className="text-white/60">{t("noItems", locale)}</p>
                ) : (
                  <ul>
                    {coverage.map(s => (
                      <li key={s.id} className="py-3 border-b border-white/20 last:border-0">
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="group flex gap-3 items-start">
                          <div className="flex-1">
                            <p className="font-semibold leading-snug group-hover:underline">{s.title}</p>
                            <DarkMeta s={s} />
                          </div>
                          {s.image && <img src={s.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="w-24 aspect-[16/10] object-cover rounded-[3px]" onError={e => (e.currentTarget.style.display = "none")} />}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {(canadaPhotos.length > 0 || canadaList.length > 0) && (
        <section className="container-mw mt-12">
          <ZoneHead title={t("canadaDesk", locale)} action={<MoreLink to="/news" section="canada" />} />
          <div className="grid gap-x-7 gap-y-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
            {canadaPhotos[0] && <div className="md:col-span-2 lg:col-span-1"><StoryCard s={canadaPhotos[0]} variant="card" showTopic={false} /></div>}
            <div className="grid gap-6 content-start">
              {canadaPhotos.slice(1).map(s => <StoryCard key={s.id} s={s} showTopic={false} />)}
            </div>
            <div>
              {canadaList.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
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
                <h3 className="font-bold text-[1.05rem] pb-1 mb-1 border-b-2 border-ink">{pick(LEVEL_LABEL[col.level])}</h3>
                {col.items.length === 0
                  ? <p className="meta py-3">{t("noItems", locale)}</p>
                  : col.items.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
              </div>
            ))}
          </div>
        </section>
      )}

      {world.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead title={t("world", locale)} action={<MoreLink to="/news" section="world" />} />
          <div className="grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.1fr)]">
            {world.slice(0, 3).map(s => <StoryCard key={s.id} s={s} />)}
            <div className="sm:col-span-2 lg:col-span-1">
              {[...world.slice(3), ...worldList].map(s => <StoryCard key={s.id} s={s} variant="list" />)}
            </div>
          </div>
        </section>
      )}

      {zones.length > 0 && (
        <section className="container-mw mt-14">
          <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
            {zones.map(z => (
              <div key={z.id}>
                <ZoneHead title={z.title} action={<MoreLink to="/news" section={z.id} compact />} />
                {z.stories[0] && <StoryCard s={z.stories[0]} variant={z.stories[0].image ? "card" : "text"} showTopic={false} />}
                <div className="mt-3">
                  {z.stories.slice(1).map(s => <StoryCard key={s.id} s={s} variant="list" />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {labs.length > 0 && (
        <section className="container-mw mt-14">
          <ZoneHead title={t("researchLabs", locale)} action={<MoreLink to="/news" section="labs" />} />
          <div className="grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {labs.map(s => <StoryCard key={s.id} s={s} variant={s.image ? "card" : "text"} showTopic={false} />)}
          </div>
        </section>
      )}

      {analysis.length > 0 && (
        <section className="mt-14 bg-ice">
          <div className="container-mw py-10">
            <ZoneHead title={t("analysis", locale)} action={<MoreLink to="/news" section="analysis" />} />
            <div className="grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {analysis.map(s => <StoryCard key={s.id} s={s} variant="text" showTopic={false} />)}
            </div>
          </div>
        </section>
      )}

      {editorial && (
        <section className="container-mw mt-14">
          <ZoneHead title={t("editorsDesk", locale)} action={<MoreLink to="/editor" />} />
          <Link to="/editor/$slug" params={{ slug: editorial.slug }} className="group grid gap-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8 items-end">
            <h3 className="hl text-[1.9rem] sm:text-[2.4rem] group-hover:underline decoration-2">{pick(editorial.title)}</h3>
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
            text={locale === "fr" ? `${openPrograms} programmes ouverts ou continus, vérifiés sur les pages officielles.` : `${openPrograms} open or ongoing programs, checked against official pages.`} />
        </div>
      </section>
    </PageShell>
  );
}

function DarkMeta({ s }: { s: Story }) {
  const { locale } = useLocale();
  const now = useNow();
  return (
    <p className="text-[0.8rem] text-white/60 mt-1.5 flex gap-2.5">
      <span className="font-semibold text-white/80">{s.source}</span>
      <time dateTime={s.publishedAt} suppressHydrationWarning>{timeAgo(s.publishedAt, now, locale)}</time>
    </p>
  );
}

function Resource({ to, icon, title, text }: { to: "/learn" | "/tools" | "/funding"; icon: ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="group flex gap-3 items-start border border-line bg-surface rounded-[4px] p-4 hover:border-ink">
      <span className="mt-0.5 text-lake" aria-hidden="true">{icon}</span>
      <span>
        <span className="block font-bold group-hover:underline">{title}</span>
        <span className="block text-[0.92rem] text-muted-ink leading-snug mt-0.5">{text}</span>
      </span>
    </Link>
  );
}

function MoreLink({ to, section, dark = false, compact = false }: { to: "/news" | "/government" | "/ministry" | "/editor"; section?: SectionId; dark?: boolean; compact?: boolean }) {
  const { locale } = useLocale();
  return (
    <Link
      to={to}
      search={section ? ({ section } as never) : undefined}
      className={`inline-flex items-center gap-1 font-semibold text-[0.9rem] whitespace-nowrap hover:underline ${dark ? "text-white" : "text-lake"}`}
      aria-label={compact ? t("seeAll", locale) : undefined}
    >
      {compact ? null : t("seeAll", locale)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
