import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell, SectionHead } from "@/components/PageShell";
import { HeroCarousel } from "@/components/HeroCarousel";
import { LatestRail } from "@/components/LatestRail";
import { StoryCard } from "@/components/StoryCard";
import { FundingCard } from "@/components/FundingCard";
import { getAiNewsFast, useAiNews, byLocale, timeAgo, useNow, TOPICS, type Story } from "@/lib/news";
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
  const now = useNow();

  const all = byLocale(data?.stories ?? [], locale);
  const photo = all.filter(s => s.image && !s.gov);
  const used = new Set<string>();

  const heroSlides = take(photo, used, 5);
  const top = take(photo, used, 4);
  const canadaLead = take(all, used, 1, s => s.region === "canada" && !s.gov && !!s.image);
  const canadaMore = take(all, used, 4, s => s.region === "canada" && !s.gov);
  const gov = all.filter(s => s.gov).slice(0, 6);
  const labs = take(photo, used, 3, s => s.lab);
  const sections = (["policy", "business", "research", "products"] as const).map(topic => ({
    topic,
    label: TOPICS.find(x => x.id === topic)!.label,
    stories: take(all, used, 4, s => s.topic === topic && !s.gov),
  })).filter(x => x.stories.length > 0);

  const funding = PROGRAMS.filter(p => p.status === "open" || p.status === "ongoing").slice(0, 3);
  const latestEditorial = EDITORIALS[0];
  const loading = !data && !isError;

  return (
    <PageShell>
      <h1 className="sr-only">{SITE.name} — {SITE.tagline[locale]}</h1>

      {/* Front page: rotating lead photo + running latest list */}
      <section className="container-mw pt-6">
        {all.length === 0 ? (
          <div className="rounded-[8px] bg-surface border border-line p-10 text-center">
            <span className="live-dot inline-block" aria-hidden="true" />
            <p className="hl text-2xl mt-4">{loading ? t("loading", locale) : t("feedDown", locale)}</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {heroSlides.length > 0
              ? <HeroCarousel stories={heroSlides} />
              : <div className="rounded-[8px] bg-surface border border-line p-8"><StoryCard s={all[0]} variant="lead" /></div>}
            <LatestRail stories={all} fetchedAt={data?.fetchedAt} />
          </div>
        )}
      </section>

      {top.length > 0 && (
        <section className="container-mw mt-12">
          <SectionHead title={t("topStories", locale)} action={<MoreLink to="/news" />} />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {top.map(s => <StoryCard key={s.id} s={s} />)}
          </div>
        </section>
      )}

      {(canadaLead.length > 0 || canadaMore.length > 0 || gov.length > 0) && (
        <section className="container-mw mt-16">
          <SectionHead title={t("canadaDesk", locale)} action={<MoreLink to="/news" search={{ topic: "canada" }} />} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="grid gap-8 md:grid-cols-2">
              {canadaLead[0] && <div className="md:col-span-2"><StoryCard s={canadaLead[0]} variant="lead" showTopic={false} /></div>}
              {canadaMore.map(s => <StoryCard key={s.id} s={s} variant="row" showTopic={false} />)}
            </div>
            {gov.length > 0 && (
              <div className="bg-surface border border-line rounded-[8px] p-5 self-start">
                <h3 className="hl text-[1.25rem] mb-1">{t("govAnnouncements", locale)}</h3>
                <p className="meta mb-3">Canada.ca</p>
                <ul>
                  {gov.map(s => (
                    <li key={s.id} className="py-3 border-t border-line">
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="group block">
                        <p className="font-semibold leading-snug group-hover:text-lake">{s.title}</p>
                        <p className="meta mt-1" suppressHydrationWarning>{timeAgo(s.publishedAt, now, locale)}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mt-16 bg-ice">
        <div className="container-mw py-14">
          <SectionHead title={t("moneyForAi", locale)} sub={t("moneyForAiSub", locale)} action={<MoreLink to="/funding" />} />
          <div className="grid gap-6 md:grid-cols-3">
            {funding.map(p => <FundingCard key={p.id} p={p} compact />)}
          </div>
        </div>
      </section>

      {labs.length > 0 && (
        <section className="container-mw mt-16">
          <SectionHead title={t("researchLabs", locale)} />
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-3">
            {labs.map(s => <StoryCard key={s.id} s={s} showTopic={false} />)}
          </div>
        </section>
      )}

      {sections.length > 0 && (
        <section className="container-mw mt-16">
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
            {sections.map(sec => (
              <div key={sec.topic}>
                <Link to="/news" search={{ topic: sec.topic }} className="hl text-[1.4rem] hover:text-lake inline-flex items-center gap-2 pb-2 mb-2 border-b-[3px] border-ink w-full">
                  {pick(sec.label)}
                </Link>
                <div className="grid gap-5 mt-3">
                  {sec.stories.map((s, n) => <StoryCard key={s.id} s={s} variant={n === 0 && s.image ? "card" : "text"} showTopic={false} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-mw mt-20">
        <SectionHead title={t("startHere", locale)} sub={t("startHereSub", locale)} action={<MoreLink to="/learn" />} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <ol className="grid gap-px bg-line rounded-[8px] overflow-hidden border border-line">
            {GUIDES.map(g => (
              <li key={g.slug} className="bg-surface">
                <Link to="/learn/$slug" params={{ slug: g.slug }} className="group flex items-start gap-5 p-5 hover:bg-ice/50">
                  <div className="flex-1">
                    <p className="hl text-[1.25rem] group-hover:text-lake">{pick(g.title)}</p>
                    <p className="dek text-[0.98rem] mt-1">{pick(g.dek)}</p>
                  </div>
                  <span className="meta whitespace-nowrap pt-1">{g.minutes} {t("minRead", locale)}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div>
            <h3 className="hl text-[1.25rem] mb-3">{t("bestTools", locale)}</h3>
            <ul className="grid gap-2">
              {TOOLS.filter(x => ["ChatGPT", "Claude", "Gemini", "Perplexity", "DeepL", "Canva", "NotebookLM"].includes(x.name)).map(tool => (
                <li key={tool.name}>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="group flex gap-3 items-baseline bg-surface border border-line rounded-[6px] px-4 py-3 hover:border-ink">
                    <span className="font-bold min-w-[6.5rem] group-hover:text-lake">{tool.name}</span>
                    <span className="text-[0.92rem] text-muted-ink leading-snug">{pick(tool.goodFor)}</span>
                  </a>
                </li>
              ))}
            </ul>
            <Link to="/tools" className="inline-flex items-center gap-1.5 mt-4 font-semibold text-lake hover:underline">
              {t("seeAll", locale)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {latestEditorial && (
        <section className="container-mw mt-20">
          <Link to="/editor/$slug" params={{ slug: latestEditorial.slug }} className="group block bg-ink text-white rounded-[8px] p-8 sm:p-12">
            <p className="text-white/70 font-semibold">{t("editorsDesk", locale)}</p>
            <h2 className="hl text-[2rem] sm:text-[2.8rem] mt-2 max-w-3xl group-hover:underline decoration-2">{pick(latestEditorial.title)}</h2>
            <p className="font-serif text-[1.15rem] text-white/80 mt-4 max-w-2xl leading-relaxed">{pick(latestEditorial.dek)}</p>
          </Link>
        </section>
      )}
    </PageShell>
  );
}

function MoreLink({ to, search }: { to: "/news" | "/funding" | "/learn"; search?: Record<string, string> }) {
  const { locale } = useLocale();
  return (
    <Link to={to} search={search as any} className="inline-flex items-center gap-1.5 font-semibold text-lake hover:underline">
      {t("seeAll", locale)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
