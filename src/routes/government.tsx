import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { StoryCard } from "@/components/StoryCard";
import { getAiNewsFast, useAiNews, byLocale, LEVEL_LABEL } from "@/lib/news";
import { NEWS_SOURCES } from "@/lib/news-sources";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/government")({
  loader: () => getAiNewsFast(),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `AI and government in Canada: federal, provincial, municipal — ${SITE.name}`, fr: `L'IA et les gouvernements au Canada : fédéral, provincial, municipal — ${SITE.name}` },
      description: { en: `Artificial intelligence announcements from the Government of Canada, provinces and cities, with news coverage of AI in public services.`, fr: `Annonces sur l'intelligence artificielle du gouvernement du Canada, des provinces et des villes, et la couverture de l'IA dans les services publics.` },
    }),
  component: GovernmentPage,
});

const LEVELS = ["federal", "provincial", "municipal"] as const;

function GovernmentPage() {
  const initial = Route.useLoaderData();
  const { data } = useAiNews(initial);
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const all = byLocale(data?.stories ?? [], locale);
  const status = new Map((data?.sources ?? []).map(s => [s.id, s]));

  return (
    <PageShell>
      <PageIntro
        title={fr ? "L'IA et les gouvernements" : "AI and government"}
        dek={fr
          ? "Annonces officielles sur l'IA du fédéral, des provinces et des villes, et ce que les salles de nouvelles en disent."
          : "Official AI announcements from Ottawa, the provinces and cities — and what newsrooms are reporting about them."}
      >
        <Link to="/ministry" className="inline-block mt-5 font-semibold text-lake hover:underline">
          {fr ? "Suivre le ministère de l'IA" : "Follow the AI Ministry tracker"}
        </Link>
      </PageIntro>

      <div className="container-mw mt-10 grid gap-x-8 gap-y-12 lg:grid-cols-3">
        {LEVELS.map(level => {
          const officialItems = all.filter(s => s.gov && s.level === level).slice(0, 12);
          const newsItems = all.filter(s => !s.gov && s.level === level).slice(0, 8);
          const feeds = NEWS_SOURCES.filter(s => s.kind === "gov" && s.level === level);
          return (
            <section key={level}>
              <h2 className="hl text-[1.8rem] pt-3 border-t-[4px] border-ink">{pick(LEVEL_LABEL[level])}</h2>
              <h3 className="font-semibold text-muted-ink mt-4 mb-1">{t("officialReleases", locale)}</h3>
              {officialItems.length === 0
                ? <p className="meta py-2">{t("noItems", locale)}</p>
                : officialItems.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
              <h3 className="font-semibold text-muted-ink mt-6 mb-1">{t("inTheNews", locale)}</h3>
              {newsItems.length === 0
                ? <p className="meta py-2">{t("noItems", locale)}</p>
                : newsItems.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
              <p className="meta mt-5">
                {fr ? "Sources officielles suivies : " : "Official sources followed: "}
                {feeds.map((f, i) => {
                  const st = status.get(f.id);
                  return (
                    <span key={f.id}>
                      {i > 0 && ", "}
                      <a href={f.home} target="_blank" rel="noopener noreferrer" className="underline">{f.name}</a>
                      {st && !st.ok && <span className="text-live"> ({fr ? "indisponible" : "unavailable"})</span>}
                    </span>
                  );
                })}
              </p>
            </section>
          );
        })}
      </div>

      <div className="container-mw mt-12">
        <p className="meta max-w-3xl">
          {fr
            ? "Les flux provinciaux et municipaux couvrent tous les sujets; nous n'affichons que les communiqués qui mentionnent l'IA. La couverture des villes et provinces provient des salles de nouvelles locales de CBC."
            : "Provincial and city feeds cover every topic; we show only releases that mention AI. City and provincial coverage comes from CBC's local newsrooms and other Canadian outlets."}
        </p>
      </div>
    </PageShell>
  );
}
