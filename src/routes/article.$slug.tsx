import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ARTICLES } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { StatusBadge, ArticleCard } from "@/components/ArticleCard";
import { DonationPanel } from "@/components/DonationPanel";
import { Clock, MapPin, Share2, PenSquare, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/article/$slug")({
  loader: ({ params }) => {
    const article = ARTICLES.find(a => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Article not found</h1></PageShell>,
  errorComponent: ({ error }) => <PageShell><h1 className="font-display text-2xl">{error.message}</h1></PageShell>,
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.article.title.en} — Ottawa Civic Ledger` },
      { name: "description", content: loaderData.article.dek.en },
      { property: "og:title", content: loaderData.article.title.en },
      { property: "og:description", content: loaderData.article.dek.en },
      { property: "og:image", content: loaderData.article.image },
    ] : [],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const { locale } = useLocale();
  const related = ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3);
  const published = new Date(article.publishedAt);
  const updated = article.updatedAt ? new Date(article.updatedAt) : null;
  const fmt = (d: Date) => d.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "long", timeStyle: "short" });

  return (
    <PageShell>
      <article className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className="kicker text-civic-red">{article.kicker[locale]}</span>
          <StatusBadge status={article.status} />
        </div>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight">{article.title[locale]}</h1>
        <p className="font-serif text-xl md:text-2xl text-muted-foreground mt-4 leading-snug">{article.dek[locale]}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-sm rule-bottom rule-top py-3">
          <span className="font-semibold">{article.byline}</span>
          <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.readMinutes} {t("minRead", locale)}</span>
          {article.neighborhood && <span className="text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{article.neighborhood}</span>}
          <span className="text-muted-foreground">{fmt(published)}</span>
          {updated && <span className="text-civic-red">{t("updated", locale)} {fmt(updated)}</span>}
          <button className="ml-auto inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold hover:text-civic-red"><Share2 className="h-3.5 w-3.5" />Share</button>
        </div>

        <figure className="my-8 -mx-4 sm:mx-0">
          <img src={article.image} alt="" className="w-full aspect-[16/10] object-cover" />
          <figcaption className="text-xs text-muted-foreground mt-2 font-serif italic px-4 sm:px-0">
            {locale === "fr" ? "Photo : Archives du Registre Civique" : "Photo: Ottawa Civic Ledger archives"}
          </figcaption>
        </figure>

        <div className="font-serif text-lg leading-[1.75] space-y-5 text-foreground/90">
          <p className="dropcap">
            {locale === "fr"
              ? "Au cœur d'Ottawa, les enjeux quotidiens des résidents méritent une couverture sérieuse et calme. Ce reportage rassemble les voix locales, les documents publics et les données vérifiables pour aider les lecteurs à comprendre — et à agir."
              : "In Ottawa's daily life, the issues that shape residents' streets deserve calm, serious coverage. This story brings together local voices, public records, and verifiable data to help readers understand — and act."}
          </p>
          <p>{article.dek[locale]}</p>
          {article.pullQuote && (
            <blockquote className="border-l-4 border-civic-red pl-6 py-2 my-8 font-display text-2xl md:text-3xl leading-snug italic">
              "{article.pullQuote[locale]}"
            </blockquote>
          )}
          <p>
            {locale === "fr"
              ? "Notre équipe vérifie chaque affirmation avant publication. Lorsque les sources ne sont pas encore disponibles, nous étiquetons l'article comme « en développement » et nous le mettons à jour publiquement à mesure que les faits évoluent."
              : "Our team verifies each claim before publication. Where sources aren't yet available, we mark the story as developing and update it publicly as the facts change."}
          </p>
          <p>
            {locale === "fr"
              ? "Pour chaque problème significatif, nous publions également une section solutions qui rassemble les approches éprouvées ailleurs au Canada et dans le monde — sans prétendre qu'une recette unique convienne à toutes les rues d'Ottawa."
              : "For every significant problem, we also publish a solutions section that gathers approaches proven elsewhere in Canada and around the world — without pretending one recipe fits every Ottawa street."}
          </p>
        </div>

        {article.sources && (
          <section className="mt-10 p-5 bg-secondary">
            <h3 className="kicker text-civic-red mb-3">{locale === "fr" ? "Sources" : "Sources"}</h3>
            <ul className="space-y-1 text-sm font-serif">
              {article.sources.map((s, i) => <li key={i}>· {s.label}</li>)}
            </ul>
          </section>
        )}

        <section className="mt-8 p-5 border border-rule flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-civic-red shrink-0 mt-0.5" />
          <div className="text-sm font-serif">
            <strong className="font-sans uppercase text-xs tracking-wider">{locale === "fr" ? "Politique de correction" : "Corrections policy"}</strong>
            <p className="mt-1">{locale === "fr" ? "Une erreur ? Nous corrigeons rapidement et publiquement. Écrivez-nous." : "Spotted an error? We correct quickly and publicly. Write to us."}</p>
          </div>
        </section>

        <section className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to="/submit" className="flex-1 text-center bg-civic-red text-white py-3 text-sm uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2">
            <PenSquare className="h-4 w-4" />{locale === "fr" ? "Vous avez plus d'informations ?" : "Have more information?"}
          </Link>
          <Link to="/donate" className="flex-1 text-center border border-ink py-3 text-sm uppercase tracking-wider font-semibold">{t("donate", locale)}</Link>
        </section>
      </article>

      <hr className="my-14 border-rule max-w-3xl mx-auto" />

      <section className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl mb-6">{locale === "fr" ? "À lire ensuite" : "Read next"}</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {related.map(a => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </section>

      <div className="max-w-3xl mx-auto mt-14">
        <DonationPanel />
      </div>
    </PageShell>
  );
}
