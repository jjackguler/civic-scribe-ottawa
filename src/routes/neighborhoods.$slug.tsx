import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { ARTICLES, NEIGHBORHOOD_INFO, EVENTS, TRAFFIC_ALERTS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { ArticleCard } from "@/components/ArticleCard";
import { EventCard } from "@/components/EventCard";
import { TrafficAlertCard } from "@/components/TrafficAlertCard";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/neighborhoods/$slug")({
  loader: ({ params }) => {
    const info = NEIGHBORHOOD_INFO.find(n => n.name.toLowerCase().replace(/\s+/g, "-") === params.slug);
    if (!info) throw notFound();
    return { info };
  },
  notFoundComponent: () => <PageShell><PageHero kicker="404" title="Neighborhood not found" /></PageShell>,
  errorComponent: ({ error }) => <PageShell><PageHero kicker="Error" title={error.message} /></PageShell>,
  component: NeighborhoodDetail,
});

function NeighborhoodDetail() {
  const { info } = Route.useLoaderData();
  const { locale } = useLocale();
  const local = ARTICLES.filter(a => a.neighborhood === info.name);
  const events = EVENTS.filter(e => e.neighborhood === info.name);
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Quartier" : "Neighborhood"}
        title={info.name}
        dek={info.blurb[locale]}
      />
      <div className="grid lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <h2 className="kicker text-civic-red mb-4">{locale === "fr" ? "Reportages locaux" : "Local reporting"}</h2>
          {local.length === 0 ? (
            <p className="font-serif italic text-muted-foreground">
              {locale === "fr" ? "Aucun article publié pour ce quartier cette semaine. Soumettez le vôtre." : "No published stories from this neighborhood this week. Submit yours."}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-8">
              {local.map(a => <ArticleCard key={a.slug} article={a} />)}
            </div>
          )}
        </section>
        <aside className="space-y-8">
          <div>
            <h3 className="kicker text-civic-red mb-3">{locale === "fr" ? "Circulation" : "Traffic"}</h3>
            <div className="bg-card border border-rule p-4">
              {TRAFFIC_ALERTS.slice(0, 3).map(a => <TrafficAlertCard key={a.id} alert={a} />)}
            </div>
          </div>
          <div>
            <h3 className="kicker text-civic-red mb-3">{locale === "fr" ? "Événements" : "Events"}</h3>
            {events.length === 0 ? <p className="text-sm text-muted-foreground italic font-serif">{locale === "fr" ? "Aucun événement à l'horaire." : "Nothing scheduled yet."}</p> : events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
          <div className="bg-secondary p-5">
            <span className="kicker text-civic-red">{locale === "fr" ? "Reporter de quartier" : "Neighborhood reporter"}</span>
            <p className="font-display text-xl mt-1">{info.reporter}</p>
            <p className="text-sm font-serif text-muted-foreground mt-2">{locale === "fr" ? "Population estimée" : "Estimated population"}: {info.population}</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
