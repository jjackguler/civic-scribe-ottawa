import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Landmark } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { StoryCard } from "@/components/StoryCard";
import { getAiNewsFast, useAiNews, byLocale, timeAgo, useNow, type Story } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/ministry")({
  loader: () => getAiNewsFast(),
  head: () => ({
    meta: [
      { title: `AI Ministry tracker: Minister Evan Solomon — ${SITE.name}` },
      { name: "description", content: "Every official release from Canada's Minister of Artificial Intelligence and Digital Innovation, plus news coverage of the ministry, updated through the day." },
    ],
  }),
  component: MinistryPage,
});

function daysAgo(s: Story, days: number) {
  return Date.now() - new Date(s.publishedAt).getTime() < days * 86400000;
}

function MinistryPage() {
  const initial = Route.useLoaderData();
  const { data } = useAiNews(initial);
  const { locale } = useLocale();
  const now = useNow();

  const all = byLocale(data?.stories ?? [], locale);
  // Official releases come in both languages; show the reader's language.
  const official = all.filter(s => s.minister && s.gov && s.lang === locale);
  const officialAny = official.length > 0 ? official : all.filter(s => s.minister && s.gov);
  const coverage = all.filter(s => s.minister && !s.gov);
  const federal = all.filter(s => s.gov && s.level === "federal" && !s.minister).slice(0, 8);
  const last30 = now == null ? null : officialAny.filter(s => daysAgo(s, 30)).length;
  const fr = locale === "fr";

  return (
    <PageShell>
      <section className="bg-ink text-white">
        <div className="container-mw py-10 sm:py-14">
          <p className="flex items-center gap-2 font-semibold text-white/70"><Landmark className="h-5 w-5" aria-hidden="true" />{t("trackerTitle", locale)}</p>
          <h1 className="hl text-[2.4rem] sm:text-[3.4rem] mt-2 max-w-4xl">{t("minister", locale)}</h1>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3 max-w-4xl">
            <div className="border-t border-white/25 pt-3">
              <dt className="text-white/60 text-sm">{fr ? "Ministre" : "Minister"}</dt>
              <dd className="font-bold text-xl mt-1">Hon. Evan Solomon</dd>
              <dd className="text-white/60 text-sm">{fr ? "En poste depuis mai 2025" : "In office since May 2025"}</dd>
            </div>
            <div className="border-t border-white/25 pt-3">
              <dt className="text-white/60 text-sm">{fr ? "Communiqués, 30 derniers jours" : "Releases, last 30 days"}</dt>
              <dd className="font-bold text-xl mt-1" suppressHydrationWarning>{last30 ?? "—"}</dd>
            </div>
            <div className="border-t border-white/25 pt-3">
              <dt className="text-white/60 text-sm">{fr ? "Dernier communiqué" : "Latest release"}</dt>
              <dd className="font-bold text-xl mt-1" suppressHydrationWarning>{officialAny[0] ? timeAgo(officialAny[0].publishedAt, now, locale) : "—"}</dd>
            </div>
          </dl>
          <p className="mt-8 text-white/70 max-w-3xl leading-relaxed">
            {fr
              ? "Cette page suit automatiquement les communiqués publiés au nom du ministre sur Canada.ca, ainsi que la couverture médiatique qui le mentionne. Nous n'ajoutons ni ne résumons rien : chaque titre renvoie à sa source."
              : "This page automatically follows releases published under the minister's name on Canada.ca, plus news coverage that mentions him. We don't add or rewrite anything — every headline links to its source."}
          </p>
          <a href={fr ? "https://www.canada.ca/fr/innovation-sciences-developpement-economique/nouvelles.html" : "https://www.canada.ca/en/innovation-science-economic-development/news.html"}
            target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-4 font-semibold underline underline-offset-4">
            {fr ? "Salle de nouvelles d'ISDE sur Canada.ca" : "ISED newsroom on Canada.ca"} <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <div className="container-mw mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section>
          <h2 className="hl text-[1.8rem] pt-3 border-t-[4px] border-ink mb-2">{t("officialReleases", locale)}</h2>
          {officialAny.length === 0 ? (
            <p className="dek py-4">{data ? t("noItems", locale) : t("loading", locale)}</p>
          ) : (
            <ol>
              {officialAny.map(s => (
                <li key={s.id} className="py-4 border-b border-line">
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4">
                    <time dateTime={s.publishedAt} className="meta pt-1" suppressHydrationWarning>
                      {new Date(s.publishedAt).toLocaleDateString(fr ? "fr-CA" : "en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Toronto" })}
                    </time>
                    <span>
                      <span className="block font-bold text-[1.1rem] leading-snug group-hover:underline">{s.title}</span>
                      {s.summary && <span className="block dek text-[0.98rem] mt-1 line-clamp-2">{s.summary}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside>
          <h2 className="hl text-[1.8rem] pt-3 border-t-[4px] border-ink mb-4">{t("inTheNews", locale)}</h2>
          {coverage.length === 0
            ? <p className="dek">{t("noItems", locale)}</p>
            : <div className="grid gap-6">{coverage.slice(0, 8).map((s, i) => <StoryCard key={s.id} s={s} variant={i === 0 && s.image ? "card" : "row"} showTopic={false} />)}</div>}

          {federal.length > 0 && (
            <>
              <h2 className="hl text-[1.4rem] pt-3 border-t-[4px] border-ink mt-12 mb-1">{fr ? "Autres annonces fédérales sur l'IA" : "Other federal AI announcements"}</h2>
              {federal.map(s => <StoryCard key={s.id} s={s} variant="list" />)}
            </>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
