import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { Link } from "@tanstack/react-router";
import { NEWS_SOURCES, NO_FEED_SOURCES, type Kind } from "@/lib/news-sources";
import { MEDIA_SOURCES } from "@/lib/media-sources";
import { useAiNews } from "@/lib/news";
import { useMedia } from "@/lib/media";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { editorMailto } from "@/lib/contact";
import { t } from "@/lib/i18n";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `About and standards — ${SITE.name}`, fr: `À propos et normes — ${SITE.name}` },
      description: { en: `How ${SITE.name} finds, checks and credits AI news, video and podcasts — who runs it, and every source we follow.`, fr: `Comment ${SITE.name} trouve, vérifie et crédite l'actualité, les vidéos et les balados sur l'IA — qui le dirige, et toutes nos sources.` },
    }),
  component: About,
});

const RULES = [
  {
    en: "We never invent news. Every story comes from a named publisher's public feed and links to the original. AI desk headlines are labelled and checked against the publisher's own text.",
    fr: "Nous n'inventons jamais de nouvelles. Chaque nouvelle provient du fil public d'un éditeur nommé et renvoie à l'original. Les titres du pupitre IA sont identifiés et vérifiés dans le texte de l'éditeur.",
  },
  {
    en: "We show short excerpts only, and credit the publisher on every story and every photo. Photos are the publisher's own. Where we have no photo we may use, we show a designed cover with the headline, never an AI picture made to look like a news photo.",
    fr: "Nous n'affichons que de courts extraits et citons l'éditeur sur chaque article et chaque photo. Les photos sont celles de l'éditeur. Sans photo utilisable, nous affichons une couverture graphique avec le titre, jamais une image d'IA imitant une photo de presse.",
  },
  {
    en: "Funding listings are checked against the official program page, with the date we checked. If we're not sure a program is open, we say so.",
    fr: "Les fiches de financement sont vérifiées sur la page officielle du programme, avec la date de vérification. Si nous ne sommes pas sûrs qu'un programme est ouvert, nous le disons.",
  },
  {
    en: "Opinion lives on the Editor's desk and is labelled as opinion. It is never mixed into the news feed.",
    fr: "L'opinion se trouve dans le Mot de la rédaction et est identifiée comme telle. Elle n'est jamais mêlée au fil de nouvelles.",
  },
  {
    en: "Tool recommendations are independent. We don't take payment for listings and we don't quote prices, because they change too often.",
    fr: "Nos recommandations d'outils sont indépendantes. Nous n'acceptons aucun paiement pour y figurer et n'indiquons pas de prix, car ils changent trop souvent.",
  },
];

const KINDS: { id: Kind; label: { en: string; fr: string } }[] = [
  { id: "gov", label: { en: "Governments", fr: "Gouvernements" } },
  { id: "news", label: { en: "Newsrooms", fr: "Salles de nouvelles" } },
  { id: "lab", label: { en: "AI labs", fr: "Laboratoires d'IA" } },
  { id: "beat", label: { en: "Specialist newsrooms (VR, robotics, data centres)", fr: "Médias spécialisés (RV, robotique, centres de données)" } },
  { id: "analysis", label: { en: "Analysis and newsletters", fr: "Analyses et infolettres" } },
  { id: "trending", label: { en: "Community signals", fr: "Signaux de la communauté" } },
];

function About() {
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <PageIntro title={locale === "fr" ? `À propos de ${SITE.name}` : `About ${SITE.name}`} dek={pick(SITE.description)} />
      <WhoRunsThis />
      <div className="container-mw mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section>
          <h2 className="masthead-serif text-[1.8rem] pb-2 mb-4 border-b-[3px] border-night">{locale === "fr" ? "Nos règles" : "Our standards"}</h2>
          <ul className="prose-mw">
            {RULES.map((r, i) => <li key={i}>{pick(r)}</li>)}
          </ul>
        </section>
        <section>
          <h2 className="masthead-serif text-[1.8rem] pb-2 mb-4 border-b-[3px] border-night">{locale === "fr" ? "Nos sources" : "Where the news comes from"}</h2>
          {KINDS.map(k => {
            const list = NEWS_SOURCES.filter(s => s.kind === k.id);
            const seen = new Set<string>();
            return (
              <div key={k.id} className="mb-6">
                <h3 className="font-bold mb-1">{pick(k.label)}</h3>
                <ul className="text-[0.95rem] leading-relaxed">
                  {list.filter(s => !seen.has(s.name) && seen.add(s.name)).map(s => (
                    <li key={s.id}><a href={s.home} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a></li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="mb-6">
            <h3 className="font-bold mb-1">{locale === "fr" ? "Vidéos et balados" : "Video and podcasts"}</h3>
            <ul className="text-[0.95rem] leading-relaxed">
              {MEDIA_SOURCES.map(s => <li key={s.id}><a href={s.home} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a></li>)}
            </ul>
          </div>
          <h3 className="font-bold mb-1">{locale === "fr" ? "Suivis sans fil RSS public" : "Followed, no public feed"}</h3>
          <ul className="text-[0.95rem] leading-relaxed">
            {NO_FEED_SOURCES.map(s => <li key={s.name}><a href={s.home} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.name}</a></li>)}
          </ul>
          <p className="mt-6">
            <a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer" className="text-lake font-semibold hover:underline">{t("builtWithClaude", locale)}</a>
          </p>
          <p className="mt-2"><Link to="/standards" className="text-lake font-semibold hover:underline">{locale === "fr" ? "Lire nos normes éditoriales" : "Read our editorial standards"}</Link></p>
        </section>
      </div>
      <DeskStatus />
    </PageShell>
  );
}

/** Live health of every feed: which ones answered on the last check. */
function DeskStatus() {
  const { locale } = useLocale();
  const { data: news } = useAiNews(undefined);
  const { data: media } = useMedia();
  const rows = [
    ...(news?.sources ?? []).map(s => ({ id: s.id, name: s.name, ok: s.ok, count: s.count, note: s.error, waiting: !s.checkedAt })),
    ...(media?.sources ?? []).map(s => ({ id: s.id, name: s.name, ok: s.ok, count: s.count, note: s.ok ? s.feedTitle : s.error, waiting: !s.ok && !s.error })),
  ];
  if (rows.length === 0) return null;
  return (
    <section id="status" className="container-mw mt-14">
      <h2 className="masthead-serif text-[1.8rem] pb-2 mb-4 border-b-[3px] border-night">{locale === "fr" ? "État des sources" : "Desk status"}</h2>
      <p className="meta mb-4">{locale === "fr" ? "Chaque source est vérifiée toutes les quelques minutes. Une source en panne n'empêche jamais les autres." : "Every source is checked every few minutes. One failing source never blocks the rest."}</p>
      {news && (
        <p className="meta mb-4">
          {locale === "fr" ? "Fil construit" : "Desk built"} {new Date(news.fetchedAt).toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" })}
          {" — "}{news.origin ?? "built"}{news.sharedCache ? (locale === "fr" ? ", cache partagé actif" : ", shared cache on") : (locale === "fr" ? ", cache partagé indisponible" : ", shared cache unavailable")}
          {news.background === false ? (locale === "fr" ? ", mise à jour pendant la requête" : ", refreshed in-request") : ""}
        </p>
      )}
      <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3 text-[0.9rem]">
        {rows.map(r => (
          <li key={r.id} className="py-1.5 border-b border-line flex gap-2 items-baseline">
            <span className={`h-2 w-2 shrink-0 rounded-full ${r.ok ? "bg-spruce" : r.waiting ? "bg-line" : "bg-live"}`} aria-hidden="true" />
            <span className="font-semibold">{r.name}</span>
            <span className="text-muted-ink">{r.ok ? `${r.count}` : r.waiting ? (locale === "fr" ? "en file d'attente" : "queued") : (locale === "fr" ? "hors ligne" : "offline")}</span>
            {r.note && <span className="text-muted-ink truncate" title={r.note}>· {r.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Who publishes and edits the site. Editor details appear once they are set in site.ts. */
function WhoRunsThis() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const ed = SITE.editor;
  const pub = SITE.publisher;
  const mail = editorMailto();
  return (
    <section className="container-mw mt-10" aria-labelledby="who">
      <div className="bg-night text-white p-7 md:p-9 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start">
        <div>
          <h2 id="who" className="masthead-serif text-[1.9rem] leading-tight text-brass">{fr ? "Qui dirige ce site" : "Who runs this"}</h2>
          <p className="font-serif text-white/80 text-[1.1rem] leading-relaxed mt-2">
            {fr
              ? `${SITE.name} est publié par ${pub.name}, à ${pub.city}, ${pub.country}.`
              : `${SITE.name} is published by ${pub.name} in ${pub.city}, ${pub.country}.`}
          </p>
        </div>
        <div className="font-serif text-[1.1rem] leading-relaxed">
          {ed.name ? (
            <>
              <p className="font-sans font-bold text-[1.25rem]">{ed.name}</p>
              {pick(ed.role) && <p className="text-brass font-sans font-semibold">{pick(ed.role)}</p>}
              {pick(ed.bio) && <p className="text-white/80 mt-2">{pick(ed.bio)}</p>}
            </>
          ) : (
            <p className="text-white/80">
              {fr
                ? "Une seule personne choisit les sources, écrit les éditoriaux et les guides, et répond des corrections. Le logiciel recueille et classe les nouvelles; il ne les écrit pas."
                : "One editor chooses the sources, writes the editorials and guides, and answers for corrections. Software gathers and files the news; it doesn't write it."}
            </p>
          )}
          {mail && (
            <p className="mt-3"><a href={mail} className="text-brass font-sans font-semibold hover:underline">{SITE.email.editor}</a></p>
          )}
          <p className="mt-3 font-sans text-[0.95rem]">
            <Link to="/corrections" className="text-white/85 underline hover:text-white">{fr ? "Corrections" : "Corrections"}</Link>
            {"  "}
            <Link to="/terms" className="ml-4 text-white/85 underline hover:text-white">{fr ? "Conditions d'utilisation" : "Terms of use"}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
