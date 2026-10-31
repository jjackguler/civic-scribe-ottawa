import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { StoryCard, StoryLink, StoryMeta, storyKicker, TranslatedNote } from "@/components/StoryCard";
import { keepNames } from "@/components/Dispatch";
import { LatestRail } from "@/components/LatestRail";
import { NewsletterPromo } from "@/components/NewsletterBox";
import { Breadcrumbs } from "@/components/Trust";
import { AdSlot } from "@/components/AdSlot";
import {
  getAiNewsFast, useAiNews, byLocale, diversify, display, SECTIONS, SECTION_ABOUT, RELATED_SECTIONS, inSection, isFrontPool, timeAgo, useNow, type SectionId,
  type Story,
} from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead, absUrl } from "@/lib/seo";

type Search = { section?: SectionId };

const ALL_ABOUT = {
  en: "The latest artificial intelligence news from the world's newsrooms, labs and governments, filed by desk and updated through the day. Every headline links to its publisher.",
  fr: "Les dernières nouvelles sur l'intelligence artificielle des salles de rédaction, laboratoires et gouvernements, classées par section et mises à jour au fil de la journée.",
};

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
      description: section ? SECTION_ABOUT[section.id] : ALL_ABOUT,
      canonicalSearch: section ? `?section=${section.id}` : "",
      breadcrumbs: [
        { name: { en: "Latest", fr: "En continu" }, path: "/news" },
        ...(section ? [{ name: section.label, path: `/news?section=${section.id}` }] : []),
      ],
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: section ? section.label[locale] : locale === "fr" ? "Actualité IA en direct" : "AI news, live",
        url,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        isPartOf: { "@type": "WebSite", "@id": `${absUrl("/", "en")}#website` },
      }],
    });
  },
  component: NewsPage,
});

function NewsPage() {
  const initial = Route.useLoaderData();
  const { section } = Route.useSearch();
  const { data } = useAiNews(initial);
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const now = useNow();
  const [limit, setLimit] = useState(20);

  const all = byLocale(data?.stories ?? [], locale);
  const list = diversify(section ? all.filter(s => inSection(s, section)) : all.filter(isFrontPool), 3, 12);
  const current = SECTIONS.find(x => x.id === section);
  const okSources = data?.sources.filter(s => s.ok).length ?? 0;
  const related = (section && RELATED_SECTIONS[section]) || [];
  const latestElsewhere = section ? diversify(all.filter(s => isFrontPool(s) && !inSection(s, section))).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)) : [];
  const [lead, ...rest] = list;

  return (
    <PageShell>
      <div className="container-mw pt-6">
        <Breadcrumbs items={section ? [{ label: fr ? "En continu" : "Latest", to: "/news" }, { label: pick(current!.label) }] : [{ label: fr ? "En continu" : "Latest" }]} />
      </div>
      <header className="container-mw pt-5 pb-6 rule-under">
        <p className="kicker">{section ? (fr ? "Section" : "Desk") : (fr ? "Fil en direct" : "Live desk")}</p>
        <h1 className="hl text-[2.4rem] sm:text-[3.2rem] mt-1.5">{current ? pick(current.label) : fr ? "Actualités IA, en direct" : "AI news, live"}</h1>
        <p className="font-serif text-[1.15rem] leading-relaxed text-ink/80 mt-2 max-w-[66ch]">{pick(current ? SECTION_ABOUT[current.id] : ALL_ABOUT)}</p>
        {data && (
          <p className="meta mt-3" suppressHydrationWarning>
            {t("updated", locale)} {timeAgo(data.fetchedAt, now, locale)} · {okSources} {fr ? "sources actives" : "sources reporting"} · {fr ? "titres et liens vers les éditeurs" : "headlines and links to publishers"}
          </p>
        )}
      </header>
      <nav aria-label={fr ? "Sections" : "Desks"} className="container-mw rule-under">
        <ul className="flex gap-1 overflow-x-auto no-scrollbar py-2 -mx-1">
          <li className="shrink-0"><Link to="/news" search={{}} aria-current={!section ? "page" : undefined} className={chip(!section)}>{t("all", locale)}</Link></li>
          {SECTIONS.map(x => (
            <li key={x.id} className="shrink-0"><Link to="/news" search={{ section: x.id }} aria-current={section === x.id ? "page" : undefined} className={chip(section === x.id)}>{pick(x.label)}</Link></li>
          ))}
        </ul>
      </nav>

      <div className="container-mw mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {list.length === 0 ? (
            <p className="dek">{data ? (fr ? "Aucune nouvelle dans cette section pour le moment." : "No stories on this desk right now. Try All.") : t("loading", locale)}</p>
          ) : (
            <>
              <div className="border-t-2 border-ink pt-4 pb-6 border-b border-line">
                {lead.image ? <StoryCard s={lead} variant="hero" eager /> : <TextLead s={lead} showTopic={!section} />}
              </div>
              <div className="grid gap-x-8 sm:grid-cols-2">
                {rest.slice(0, limit).map((s, i) => (
                  <Fragment key={s.id}>
                    {i === 6 && <div className="sm:col-span-2 py-6 border-b border-line"><AdSlot size="leaderboard" placement="section" /></div>}
                    <div className="py-4 border-b border-line"><StoryCard s={s} variant={s.image ? "row" : "text"} showTopic={!section} /></div>
                  </Fragment>
                ))}
              </div>
              {rest.length > limit && (
                <div className="text-center mt-10">
                  <button onClick={() => setLimit(l => l + 20)} className="px-6 py-3 rounded-[4px] bg-ink text-white font-semibold hover:bg-lake">{fr ? "Plus de nouvelles" : "More stories"}</button>
                </div>
              )}
            </>
          )}
        </div>
        <aside className="min-w-0 grid gap-8 content-start">
          {related.length > 0 && (
            <div>
              <h2 className="kicker text-ink pb-1 border-b border-ink">{fr ? "Sections voisines" : "Related desks"}</h2>
              <ul className="divide-y divide-line">
                {related.map(id => (
                  <li key={id}><Link to="/news" search={{ section: id }} className="flex items-center justify-between py-2.5 font-semibold hover:text-lake">{pick(SECTIONS.find(x => x.id === id)!.label)}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></li>
                ))}
                {(section === "canada" || section === "policy" || section === "government" || section === "ministry") && (
                  <li><Link to="/canada" className="flex items-center justify-between py-2.5 font-semibold text-lake hover:underline">{fr ? "Dossier : l'IA au Canada" : "Hub: AI in Canada"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></li>
                )}
              </ul>
            </div>
          )}
          <NewsletterPromo />
          {section && latestElsewhere.length > 0 && <LatestRail stories={latestElsewhere} fetchedAt={data?.fetchedAt} limit={6} />}
          <AdSlot size="mpu" placement="section" />
        </aside>
      </div>
    </PageShell>
  );
}

const chip = (active: boolean) =>
  `inline-flex px-3 py-1.5 rounded-full text-[0.85rem] font-semibold border whitespace-nowrap ${active ? "bg-ink text-white border-ink" : "bg-surface border-line hover:border-ink"}`;

/** The desk's lead when there is no photo: a large serif headline, text-first. */
function TextLead({ s, showTopic }: { s: Story; showTopic: boolean }) {
  const { locale } = useLocale();
  const d = display(s, locale);
  return (
    <article className="group max-w-[46rem]">
      {showTopic && <p className="kicker">{storyKicker(s, locale)}</p>}
      <StoryLink s={s} className="block mt-1.5">
        <h2 className="hl text-[1.9rem] sm:text-[2.4rem] leading-[1.08] group-hover:underline decoration-1 underline-offset-4">{keepNames(d.title)}</h2>
        {d.summary && <p className="font-serif text-[1.15rem] leading-snug text-ink/80 mt-3">{d.summary}</p>}
      </StoryLink>
      {(d.ai || d.translated) && <TranslatedNote ai={!!d.ai} original={d.original} />}
      <StoryMeta s={s} className="mt-3 text-[0.88rem]" />
    </article>
  );
}
