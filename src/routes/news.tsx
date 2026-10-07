import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageIntro } from "@/components/PageShell";
import { StoryCard } from "@/components/StoryCard";
import { getAiNewsFast, useAiNews, byLocale, diversify, SECTIONS, inSection, isFrontPool, timeAgo, useNow, type SectionId } from "@/lib/news";
import { AdSlot } from "@/components/AdSlot";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

type Search = { section?: SectionId };

export const Route = createFileRoute("/news")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const v = s.section ?? s.topic;
    return { section: typeof v === "string" && SECTIONS.some(x => x.id === v) ? (v as SectionId) : undefined };
  },
  loader: () => getAiNewsFast(),
  head: ({ match }) => {
    const section = SECTIONS.find(x => x.id === (match.search as { section?: string }).section);
    return seoHead(match, {
      title: section
        ? { en: `${section.label.en}: AI news — ${SITE.name}`, fr: `${section.label.fr} : actualité IA — ${SITE.name}` }
        : { en: `AI news, live — ${SITE.name}`, fr: `Actualité IA en direct — ${SITE.name}` },
      description: {
        en: "The latest artificial intelligence news from the world's newsrooms, labs and governments, filed by topic and updated through the day.",
        fr: "Les dernières nouvelles sur l'intelligence artificielle des salles de rédaction, laboratoires et gouvernements du monde, classées par thème et mises à jour au fil de la journée.",
      },
      canonicalSearch: section ? `?section=${section.id}` : "",
    });
  },
  component: NewsPage,
});

function NewsPage() {
  const initial = Route.useLoaderData();
  const { section } = Route.useSearch();
  const { data } = useAiNews(initial);
  const { locale, pick } = useLocale();
  const now = useNow();
  const [limit, setLimit] = useState(24);

  const all = byLocale(data?.stories ?? [], locale);
  const list = diversify(section ? all.filter(s => inSection(s, section)) : all.filter(isFrontPool), 3, 12);
  const current = SECTIONS.find(x => x.id === section);
  const okSources = data?.sources.filter(s => s.ok).length ?? 0;

  const chip = (active: boolean) =>
    `px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${active ? "bg-night text-white border-night" : "bg-surface border-line hover:border-night"}`;

  return (
    <PageShell>
      <PageIntro
        title={current ? pick(current.label) : locale === "fr" ? "Actualités IA, en direct" : "AI news, live"}
        dek={locale === "fr"
          ? "Les manchettes des salles de nouvelles, laboratoires et gouvernements du monde, mises à jour toute la journée. Chaque article renvoie à sa source."
          : "Headlines from the world's newsrooms, labs and governments, refreshed through the day. Every story links to its original source."}
      >
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Sections">
          <Link to="/news" search={{}} className={chip(!section)}>{t("all", locale)}</Link>
          {SECTIONS.map(x => (
            <Link key={x.id} to="/news" search={{ section: x.id }} className={chip(section === x.id)}>{pick(x.label)}</Link>
          ))}
        </div>
        {data && (
          <p className="meta mt-4" suppressHydrationWarning>
            {t("updated", locale)} {timeAgo(data.fetchedAt, now, locale)} · {okSources} {locale === "fr" ? "sources actives" : "sources reporting"}
          </p>
        )}
      </PageIntro>

      <div className="container-mw mt-10">
        {list.length === 0 ? (
          <p className="dek">{data ? (locale === "fr" ? "Aucune nouvelle dans cette catégorie pour le moment." : "No stories in this topic right now. Try All.") : t("loading", locale)}</p>
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {list.slice(0, limit).map((s, i) => (
                <div key={s.id} className="contents">
                  <StoryCard s={s} variant={s.image ? "card" : "text"} />
                  {i === 4 && <AdSlot size="mpu" placement="section" />}
                </div>
              ))}
            </div>
            {list.length > limit && (
              <div className="text-center mt-12">
                <button onClick={() => setLimit(l => l + 24)} className="px-6 py-3 rounded-[6px] bg-night text-white font-semibold hover:bg-lake">
                  {locale === "fr" ? "Plus de nouvelles" : "More stories"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
