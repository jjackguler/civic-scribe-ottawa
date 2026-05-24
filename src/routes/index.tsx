import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingNewsBar } from "@/components/BreakingNewsBar";
import { ArticleCard } from "@/components/ArticleCard";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { DonationPanel } from "@/components/DonationPanel";
import { WeatherAlertsList } from "@/components/WeatherAlertCard";
import { TrafficAlertsList } from "@/components/TrafficAlertCard";
import { FactCheckCard } from "@/components/FactCheckCard";
import { SolutionCard } from "@/components/SolutionCard";
import { EventCard } from "@/components/EventCard";
import { JobCard } from "@/components/JobCard";
import { TrendCard } from "@/components/TrendCard";
import { SportsCard } from "@/components/SportsCard";
import { FoodCard } from "@/components/FoodCard";
import { SectionTicker } from "@/components/LiveTicker";
import { ARTICLES, FACT_CHECKS, SOLUTIONS, EVENTS, JOBS, TREND_ITEMS, SPORTS_EVENTS, FOOD_PLACES, TOPIC_CLUSTERS, LIVE_TICKERS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { Hash, TrendingUp } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ottawa Civic Ledger — Local news, street by street" },
      { name: "description", content: "Verified bilingual local journalism for Ottawa: neighborhoods, fact-checks, solutions, traffic, weather, jobs and events." },
    ],
  }),
  component: Home,
});

function Home() {
  const { locale } = useLocale();
  const hero = ARTICLES[0];
  const leads = [ARTICLES[1], ARTICLES[2]];
  const todayInOttawa = ARTICLES.slice(3, 7);

  return (
    <div className="min-h-screen bg-paper text-foreground">
      <BreakingNewsBar />
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Hero grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7"><ArticleCard article={hero} variant="hero" /></div>
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 lg:gap-6 lg:border-l lg:border-rule lg:pl-10">
            {leads.map((a) => <ArticleCard key={a.slug} article={a} variant="lead" />)}
          </div>
        </section>

        <hr className="my-12 border-rule" />

        {/* Live row */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="kicker text-civic-red mb-3">{t("liveUpdates", locale)}</h2>
            <TrafficAlertsList />
          </div>
          <div className="lg:col-span-4">
            <h2 className="kicker text-civic-red mb-3">{t("weather", locale)}</h2>
            <WeatherAlertsList />
          </div>
          <div className="lg:col-span-4">
            <h2 className="kicker text-civic-red mb-3">{t("todayInOttawa", locale)}</h2>
            <div className="bg-card border border-rule p-2">
              {todayInOttawa.map((a) => (
                <div key={a.slug} className="p-3"><ArticleCard article={a} variant="compact" /></div>
              ))}
            </div>
          </div>
        </section>

        <hr className="my-12 border-rule" />

        {/* Neighborhood section */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="kicker text-civic-red">{t("neighborhoods", locale)}</span>
              <h2 className="font-display text-3xl md:text-4xl mt-1">{t("whatsNear", locale)}</h2>
              <p className="font-serif text-muted-foreground mt-2 max-w-2xl">
                {locale === "fr"
                  ? "Reportages quartier par quartier, signalements citoyens, événements, et ressources locales."
                  : "Reporting block by block — citizen reports, events, traffic, and resources for every neighborhood."}
              </p>
            </div>
            <Link to="/neighborhoods" className="hidden md:inline-flex text-xs uppercase tracking-wider font-semibold border-b border-ink pb-0.5">
              {locale === "fr" ? "Tous les quartiers" : "All neighborhoods"} →
            </Link>
          </div>
          <NeighborhoodMap />
        </section>

        <hr className="my-12 border-rule" />

        {/* Fact check + solutions */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span className="kicker text-civic-red">{t("factCheck", locale)}</span>
                <h2 className="font-display text-3xl mt-1">{locale === "fr" ? "Ce qui est vrai, ce qui ne l'est pas" : "What's true, what isn't"}</h2>
              </div>
              <Link to="/fact-check" className="text-xs uppercase tracking-wider font-semibold border-b border-ink">{locale === "fr" ? "Tous" : "All"} →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {FACT_CHECKS.slice(0, 4).map((f) => <FactCheckCard key={f.id} fc={f} />)}
            </div>
          </div>
          <div className="lg:col-span-5">
            <DonationPanel />
            <div className="mt-6 bg-secondary p-5">
              <span className="kicker text-civic-red">{t("submit", locale)}</span>
              <h3 className="font-display text-xl mt-1">{locale === "fr" ? "Vous voyez quelque chose près de chez vous ?" : "See something on your block?"}</h3>
              <p className="text-sm font-serif text-muted-foreground mt-2">
                {locale === "fr" ? "Soumettez un reportage citoyen. Nos éditeurs vérifient et publient avec contexte." : "Submit a citizen report. Our editors verify and publish with context."}
              </p>
              <Link to="/submit" className="inline-block mt-3 border border-ink px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper">
                {t("submit", locale)}
              </Link>
            </div>
          </div>
        </section>

        <hr className="my-12 border-rule" />

        {/* Solutions */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="kicker text-solution">{t("solutions", locale)}</span>
              <h2 className="font-display text-3xl mt-1">{locale === "fr" ? "Du problème à la solution" : "From problem to what works"}</h2>
            </div>
            <Link to="/solutions" className="text-xs uppercase tracking-wider font-semibold border-b border-ink">{locale === "fr" ? "Toutes" : "All"} →</Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {SOLUTIONS.map((s) => <SolutionCard key={s.id} s={s} />)}
          </div>
        </section>

        <hr className="my-12 border-rule" />

        {/* More reporting */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-display text-3xl">{locale === "fr" ? "Plus de reportages" : "More reporting"}</h2>
            <span className="kicker text-muted-foreground">Ottawa · Canada · World</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {ARTICLES.slice(3).map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </section>

        <hr className="my-12 border-rule" />

        {/* Events + Jobs */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <div className="flex items-end justify-between mb-3">
              <h2 className="font-display text-2xl">{t("events", locale)}</h2>
              <Link to="/events" className="text-xs uppercase tracking-wider font-semibold border-b border-ink">{locale === "fr" ? "Tout" : "All"} →</Link>
            </div>
            <div>{EVENTS.slice(0, 4).map((e) => <EventCard key={e.id} event={e} />)}</div>
          </div>
          <div className="lg:col-span-6">
            <div className="flex items-end justify-between mb-3">
              <h2 className="font-display text-2xl">{t("jobs", locale)}</h2>
              <Link to="/jobs" className="text-xs uppercase tracking-wider font-semibold border-b border-ink">{locale === "fr" ? "Tout" : "All"} →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {JOBS.slice(0, 4).map((j) => <JobCard key={j.id} job={j} />)}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
