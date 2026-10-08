import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageIntro, ZoneHead } from "@/components/PageShell";
import { Showcase, TrendsPanel } from "@/components/Showcase";
import { AdSlot } from "@/components/AdSlot";
import { getPulseFast, usePulse } from "@/lib/pulse";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/showcase")({
  loader: () => getPulseFast(),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Made with AI: projects, open source and demos this week — ${SITE.name}`, fr: `Fait avec l'IA : projets, code ouvert et démos de la semaine — ${SITE.name}` },
      description: {
        en: "What people are building with Claude, ChatGPT, Gemini and open models: Show HN projects, rising open-source AI repositories and demos you can try, updated through the day.",
        fr: "Ce que les gens construisent avec Claude, ChatGPT, Gemini et les modèles ouverts : projets Show HN, dépôts d'IA en code ouvert en vogue et démos à essayer, mis à jour au fil de la journée.",
      },
    }),
  component: ShowcasePage,
});

function ShowcasePage() {
  const initial = Route.useLoaderData();
  const { data } = usePulse(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <PageIntro
        title={fr ? "Fait avec l'IA" : "Made with AI"}
        dek={fr
          ? "Les projets que les gens livrent cette semaine avec l'IA — à lire, à installer ou à essayer. Chaque élément renvoie à son créateur."
          : "What people shipped with AI this week — to read about, install or try. Every item links to its maker."}
      />
      <section className="container-mw mt-10">
        {!data ? (
          <p className="hl text-xl flex items-center gap-3"><span className="live-dot" aria-hidden="true" />{t("loading", locale)}</p>
        ) : (
          <Showcase pulse={data} limit={10} />
        )}
      </section>
      <section className="container-mw mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <ZoneHead title={fr ? "Tendances de recherche" : "Search trends"} />
          {data && <TrendsPanel pulse={data} />}
        </div>
        <AdSlot size="mpu" placement="section" />
      </section>
      <p className="container-mw meta mt-8 max-w-3xl">
        {fr
          ? "Sources : Hacker News (Show HN), GitHub, Hugging Face Spaces et Google Trends. Nous excluons les projets pour adultes. La présence d'un projet ici n'est pas une recommandation : vérifiez sa licence et sa sécurité avant de l'utiliser."
          : "Sources: Hacker News (Show HN), GitHub, Hugging Face Spaces and Google Trends. We leave out adult projects. A project appearing here is not an endorsement: check its licence and security before you use it."}
      </p>
    </PageShell>
  );
}
