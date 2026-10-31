import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { StoryCard } from "@/components/StoryCard";
import { NewsletterBox } from "@/components/NewsletterBox";
import { Breadcrumbs } from "@/components/Trust";
import {
  getAiNewsFast,
  useAiNews,
  byLocale,
  diversify,
  inSection,
  timeAgo,
  useNow,
  LEVEL_LABEL,
} from "@/lib/news";
import { PROGRAMS, STATUS_LABEL } from "@/lib/funding";
import { HUBS } from "@/lib/hubs";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead, absUrl } from "@/lib/seo";

/**
 * AI in Canada: the evergreen hub. Everything here comes from data already on
 * the site: the live Canada desk and government feeds, the AI Ministry record,
 * the checked funding programs (funding.ts) and the Canadian guides (hubs.ts).
 */
const CANADA_GUIDES = ["ai-and-jobs-in-canada", "ai-and-privacy", "ai-for-small-business"];

export const Route = createFileRoute("/canada")({
  loader: () => getAiNewsFast(),
  head: ({ match }) =>
    seoHead(match, {
      title: {
        en: `AI in Canada: policy, funding and news — ${SITE.name}`,
        fr: `L'IA au Canada : politiques, financement, nouvelles — ${SITE.name}`,
      },
      description: {
        en: "Canada's AI news in one place: federal and provincial announcements, the AI Ministry, funding programs checked against official pages, and plain guides.",
        fr: "L'actualité canadienne de l'IA en un seul endroit : annonces fédérales et provinciales, ministère de l'IA, programmes de financement vérifiés et guides clairs.",
      },
      breadcrumbs: [{ name: { en: "AI in Canada", fr: "L'IA au Canada" }, path: "/canada" }],
      jsonLd: (locale) => [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: locale === "fr" ? "L'IA au Canada" : "AI in Canada",
          url: absUrl("/canada", locale),
          inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
          about: { "@type": "Country", name: "Canada" },
          hasPart: [
            ...HUBS.filter((h) => CANADA_GUIDES.includes(h.slug)).map((h) => ({
              "@type": "Article",
              name: h.title[locale],
              url: absUrl(`/guides/${h.slug}`, locale),
            })),
            {
              "@type": "WebPage",
              name: locale === "fr" ? "Financement de l'IA au Canada" : "AI funding in Canada",
              url: absUrl("/funding", locale),
            },
            {
              "@type": "WebPage",
              name: locale === "fr" ? "Suivi du ministère de l'IA" : "AI Ministry tracker",
              url: absUrl("/ministry", locale),
            },
          ],
        },
      ],
    }),
  component: CanadaHub,
});

function CanadaHub() {
  const initial = Route.useLoaderData();
  const { data } = useAiNews(initial);
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const now = useNow();
  const all = byLocale(data?.stories ?? [], locale);
  const canada = diversify(
    all.filter((s) => inSection(s, "canada")),
    2,
    10,
  ).slice(0, 7);
  const ministry = all
    .filter(
      (s) =>
        s.minister &&
        s.gov &&
        (s.lang === locale || !all.some((x) => x.minister && x.gov && x.lang === locale)),
    )
    .slice(0, 5);
  const levels = (["federal", "provincial", "municipal"] as const).map((level) => ({
    level,
    items: all.filter((s) => s.gov && s.level === level && !s.minister).slice(0, 4),
  }));
  const open = PROGRAMS.filter((p) => p.status === "open" || p.status === "ongoing");
  const guides = HUBS.filter((h) => CANADA_GUIDES.includes(h.slug));

  return (
    <PageShell>
      <div className="container-mw pt-6">
        <Breadcrumbs items={[{ label: fr ? "L'IA au Canada" : "AI in Canada" }]} />
      </div>
      <header className="container-mw pt-6 pb-8 rule-under grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-end">
        <div>
          <p className="kicker">{fr ? "Dossier permanent" : "Hub"}</p>
          <h1 className="hl text-[2.6rem] sm:text-[3.6rem] mt-2">
            {fr ? "L'IA au Canada" : "AI in Canada"}
          </h1>
          <p className="font-serif text-[1.22rem] leading-relaxed text-ink/80 mt-3 max-w-[60ch]">
            {fr
              ? "Ce que les gouvernements annoncent, l'argent public disponible, les règles qui s'appliquent et les nouvelles du jour, au même endroit. Mis à jour au fil de la journée."
              : "What governments are announcing, the public money on offer, the rules that apply and the day's news, in one place. Updated through the day."}
          </p>
        </div>
        <nav
          aria-label={fr ? "Dans ce dossier" : "In this hub"}
          className="grid grid-cols-2 gap-2 text-[0.92rem]"
        >
          {[
            ["#ministry", fr ? "Ministère de l'IA" : "AI Ministry"],
            ["#funding", fr ? "Financement" : "Funding"],
            ["#governments", fr ? "Gouvernements" : "Governments"],
            ["#guides", fr ? "Guides" : "Guides"],
          ].map(([h, l]) => (
            <a
              key={h}
              href={h}
              className="flex items-center justify-between border border-line bg-surface px-3 py-2.5 font-semibold hover:border-ink"
            >
              {l}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </header>

      <div className="container-mw mt-10 grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="ca-news">
          <ZoneHead
            id="ca-news"
            title={fr ? "Les nouvelles" : "The news"}
            action={<More to="/news" section="canada" />}
            sub={
              fr
                ? "Ce que rapportent les médias canadiens et internationaux sur l'IA au Canada. Chaque titre renvoie à son éditeur."
                : "What Canadian and international outlets report about AI in Canada. Every headline links to its publisher."
            }
          />
          {canada.length === 0 ? (
            <p className="dek">
              {data
                ? fr
                  ? "Rien de nouveau pour le moment."
                  : "Nothing new right now."
                : t("loading", locale)}
            </p>
          ) : (
            <div className="grid gap-x-8 sm:grid-cols-2">
              <div className="sm:col-span-2 pb-4 mb-2 border-b border-line">
                <StoryCard s={canada[0]} variant="text" />
              </div>
              {canada.slice(1).map((s) => (
                <StoryCard key={s.id} s={s} variant="list" />
              ))}
            </div>
          )}
        </section>

        <section id="ministry" aria-labelledby="ca-ministry" className="scroll-mt-28">
          <ZoneHead
            id="ca-ministry"
            title={fr ? "Ministère de l'IA" : "AI Ministry"}
            action={<More to="/ministry" />}
            sub={t("minister", locale)}
          />
          {ministry.length === 0 ? (
            <p className="text-muted-ink text-[0.95rem]">
              {fr ? "Aucun communiqué récent." : "No recent releases."}
            </p>
          ) : (
            <ol className="divide-y divide-line border-b border-line">
              {ministry.map((s) => (
                <li key={s.id} className="py-3">
                  <a href={s.link} rel="noopener" className="group block">
                    <span className="meta block" suppressHydrationWarning>
                      {t("officialReleases", locale)} · {timeAgo(s.publishedAt, now, locale)}
                    </span>
                    <span className="hl-sm text-[1.05rem] group-hover:underline inline-flex gap-1.5 items-baseline">
                      {s.title}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section
        id="funding"
        className="container-mw mt-14 scroll-mt-28"
        aria-labelledby="ca-funding"
      >
        <ZoneHead
          id="ca-funding"
          title={fr ? "Financement de l'IA au Canada" : "AI funding in Canada"}
          action={<More to="/funding" />}
          sub={
            fr
              ? `${open.length} programmes ouverts ou continus, chacun vérifié sur sa page officielle. La page officielle fait foi.`
              : `${open.length} open or ongoing programs, each checked against its official page. The official page is the authority.`
          }
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.slice(0, 6).map((p) => (
            <li key={p.id} className="border border-line bg-surface p-4 flex flex-col">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-spruce">
                {pick(STATUS_LABEL[p.status])}
              </p>
              <p className="hl-sm text-[1.12rem] mt-1.5">{pick(p.name)}</p>
              <p className="text-[0.88rem] text-muted-ink mt-1">{p.org}</p>
              <p className="font-serif text-[0.98rem] leading-snug text-ink/85 mt-2 line-clamp-3">
                {pick(p.whatYouGet)}
              </p>
              <p className="mt-auto pt-3 text-[0.85rem] flex flex-wrap gap-x-3">
                <a
                  href={p.url}
                  rel="noopener"
                  className="text-lake font-semibold underline inline-flex items-center gap-1"
                >
                  {t("officialPage", locale)}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <span className="text-muted-ink">
                  {t("lastChecked", locale)} {p.checked}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="governments"
        className="container-mw mt-14 scroll-mt-28"
        aria-labelledby="ca-gov"
      >
        <ZoneHead
          id="ca-gov"
          title={fr ? "Ce que disent les gouvernements" : "What governments are saying"}
          action={<More to="/government" />}
          sub={
            fr
              ? "Communiqués officiels sur l'IA, par ordre de gouvernement. Titre et lien seulement; le texte complet est sur le site officiel."
              : "Official releases about AI, by level of government. Headline and link only; the full text is on the official site."
          }
        />
        <div className="grid gap-x-8 gap-y-8 md:grid-cols-3">
          {levels.map((col) => (
            <div key={col.level}>
              <h3 className="font-bold text-[0.95rem] pb-1 border-b border-ink">
                {pick(LEVEL_LABEL[col.level])}
              </h3>
              {col.items.length === 0 ? (
                <p className="meta py-3">{t("noItems", locale)}</p>
              ) : (
                col.items.map((s) => <StoryCard key={s.id} s={s} variant="list" />)
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="guides" className="container-mw mt-14 scroll-mt-28" aria-labelledby="ca-guides">
        <ZoneHead
          id="ca-guides"
          title={fr ? "Guides pour le Canada" : "Guides for Canada"}
          sub={
            fr
              ? "Des réponses claires et sourcées aux questions que les Canadiens posent le plus."
              : "Plain, sourced answers to the questions Canadians ask most."
          }
        />
        <ul className="grid gap-6 md:grid-cols-3">
          {guides.map((h) => (
            <li key={h.slug}>
              <Link
                to="/guides/$slug"
                params={{ slug: h.slug }}
                className="group block border-t-2 border-ink pt-3"
              >
                <p className="kicker">{pick(h.audience)}</p>
                <p className="hl text-[1.35rem] mt-1.5 group-hover:underline">{pick(h.title)}</p>
                <p className="font-serif text-[1rem] text-ink/80 mt-2 leading-snug">
                  {pick(h.description)}
                </p>
                <p className="meta mt-2">
                  {h.minutes} {t("minRead", locale)} · {fr ? "Mis à jour le" : "Updated"}{" "}
                  {h.updated}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-mw mt-16">
        <div className="bg-night text-white p-7 md:p-10">
          <NewsletterBox variant="band" />
        </div>
      </section>
    </PageShell>
  );
}

function More({
  to,
  section,
}: {
  to: "/news" | "/ministry" | "/funding" | "/government";
  section?: "canada";
}): ReactNode {
  const { locale } = useLocale();
  return (
    <Link
      to={to}
      search={section ? ({ section } as never) : undefined}
      className="shrink-0 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-lake hover:underline"
    >
      {t("seeAll", locale)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
