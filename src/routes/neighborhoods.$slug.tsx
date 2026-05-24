import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { ARTICLES, NEIGHBORHOOD_INFO, EVENTS, TRAFFIC_ALERTS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { ArticleCard } from "@/components/ArticleCard";
import { EventCard } from "@/components/EventCard";
import { TrafficAlertCard } from "@/components/TrafficAlertCard";
import { Users, MapPin, PenSquare } from "lucide-react";

export const Route = createFileRoute("/neighborhoods/$slug")({
  loader: ({ params }) => {
    const info = NEIGHBORHOOD_INFO.find(n => n.name.toLowerCase().replace(/\s+/g, "-") === params.slug);
    if (!info) throw notFound();
    return { info };
  },
  notFoundComponent: () => <PageShell><PageHero kicker="404" title="Neighborhood not found" /></PageShell>,
  errorComponent: ({ error }) => <PageShell><PageHero kicker="Error" title={error.message} /></PageShell>,
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.info.name} — Ottawa Civic Ledger` },
      { name: "description", content: loaderData.info.blurb.en },
      { property: "og:title", content: `${loaderData.info.name} — Ottawa Civic Ledger` },
      { property: "og:description", content: loaderData.info.blurb.en },
    ] : [],
  }),
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
        kicker={`${locale === "fr" ? "Quartier" : "Neighborhood"} · ${info.character[locale]}`}
        title={info.name}
        dek={info.blurb[locale]}
      />

      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <Stat icon={Users} label={locale === "fr" ? "Population" : "Population"} value={info.population} />
        <Stat icon={MapPin} label={locale === "fr" ? "Pupitre" : "Ward"} value={info.ward} />
        <Stat icon={PenSquare} label={locale === "fr" ? "Reporter" : "Reporter"} value={info.reporter} />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <h2 className="kicker text-civic-red mb-4 rule-bottom pb-2">{locale === "fr" ? "Reportages locaux" : "Local reporting"} <span className="text-muted-foreground">· {local.length}</span></h2>
          {local.length === 0 ? (
            <div className="bg-secondary p-6 text-center">
              <p className="font-serif italic text-muted-foreground">
                {locale === "fr" ? "Aucun article publié pour ce quartier cette semaine." : "No published stories from this neighbourhood this week."}
              </p>
              <Link to="/submit" className="inline-block mt-3 border border-ink px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper transition-colors">
                {locale === "fr" ? "Soumettre le vôtre" : "Submit yours"}
              </Link>
            </div>
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
            {events.length === 0
              ? <p className="text-sm text-muted-foreground italic font-serif">{locale === "fr" ? "Aucun événement à l'horaire." : "Nothing scheduled yet."}</p>
              : events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
          <div className="bg-secondary p-5 border-l-4 border-civic-red">
            <span className="kicker text-civic-red">{locale === "fr" ? "Reporter de quartier" : "Neighborhood reporter"}</span>
            <p className="font-display text-xl mt-1">{info.reporter}</p>
            <Link to="/submit" className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold mt-3 border-b border-ink">
              <PenSquare className="h-3 w-3" /> {locale === "fr" ? "Soumettre un tuyau" : "Send a tip"}
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="border border-rule p-4 bg-card">
      <div className="kicker text-muted-foreground inline-flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="font-display text-lg mt-1">{value}</div>
    </div>
  );
}
