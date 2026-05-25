import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingNewsBar } from "@/components/BreakingNewsBar";
import { BreakingHero } from "@/components/BreakingHero";
import { ArticleCard } from "@/components/ArticleCard";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { DonationPanel } from "@/components/DonationPanel";
import { TrafficAlertsList } from "@/components/TrafficAlertCard";
import { WeatherAlertsList } from "@/components/WeatherAlertCard";
import { FactCheckCard } from "@/components/FactCheckCard";
import { SectionTicker } from "@/components/LiveTicker";
import { Carousel, RailHeader } from "@/components/Carousel";
import { ActivityCard } from "@/components/ActivityCard";
import { DealCard } from "@/components/DealCard";
import { PickCard } from "@/components/PickCard";
import { GuideTopicCard } from "@/components/GuideTopicCard";
import { CitizenReportItem } from "@/components/CitizenReportItem";
import { OttawaLivePanel } from "@/components/OttawaLivePanel";
import { YourStreetsPanel } from "@/components/YourStreetsPanel";
import { TrafficRadio } from "@/components/TrafficRadio";
import { SocialTrendCard } from "@/components/SocialTrendCard";
import { HomepageMapEmbed } from "@/components/HomepageMapEmbed";
import { ARTICLES, FACT_CHECKS, LIVE_TICKERS, TREND_ITEMS } from "@/lib/data";
import { ACTIVITIES, DEALS, KIDS_PICKS, YOUTH_PICKS, OTTAWA_GUIDE, CANADA_GUIDE, CITIZEN_REPORTS } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Ottawa Civic Ledger — Local guide, verified deals, citizen journalism" },
    { name: "description", content: "Ottawa-first, Canada-wide. Verified local journalism, activity guides, family picks, youth events, and a deal tracker — bilingual and reader-funded." },
    { property: "og:title", content: "Ottawa Civic Ledger" },
    { property: "og:description", content: "Verified local journalism + a living guide to Ottawa." },
  ]}),
  component: Home,
});

function Home() {
  const { locale } = useLocale();
  const hero = ARTICLES[0];
  const leads = [ARTICLES[1], ARTICLES[2]];
  const todayItems = ARTICLES.slice(0, 8);
  const weekendActivities = ACTIVITIES.filter(a => a.weekend).slice(0, 10);
  const familyFree = [...KIDS_PICKS, ...ACTIVITIES.filter(a => a.audience.includes("family") && a.cost === "free")].slice(0, 8);
  const youth = YOUTH_PICKS;
  const deals = DEALS.slice(0, 8);
  const canadaGuides = CANADA_GUIDE.slice(0, 6);

  const ViewAll = ({ to, label }: { to: string; label: string }) => (
    <Link to={to as any} className="text-[11px] uppercase tracking-wider font-semibold border-b border-ink pb-0.5 hover:text-civic-red">
      {label} →
    </Link>
  );

  return (
    <div className="min-h-screen bg-paper text-foreground">
      <BreakingNewsBar />
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-14">
        {/* 1. THE SPLASH (lead story) */}
        <BreakingHero />

        {/* Lead stories under the hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7"><ArticleCard article={hero} variant="hero" /></div>
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 lg:gap-6 lg:border-l lg:border-rule lg:pl-10">
            {leads.map((a) => <ArticleCard key={a.slug} article={a} variant="lead" />)}
          </div>
        </section>

        {/* 2. YOUR STREETS — hyperlocal ward spotlight */}
        <YourStreetsPanel />

        {/* 3. OTTAWA LIVE — unified neighborhoods/traffic/transit/places panel */}
        <section>
          <RailHeader
            kicker={locale === "fr" ? "Tableau de bord" : "City dashboard"}
            title={locale === "fr" ? "Ottawa, en direct" : "Ottawa, live"}
            live={t("liveNow", locale)}
            action={<ViewAll to="/map" label={t("ottawaMap", locale)} />}
          />
          <OttawaLivePanel />
        </section>

        {/* Traffic radio companion strip */}
        <section>
          <TrafficRadio compact />
        </section>

        {/* Social trend wall */}
        <section>
          <RailHeader
            kicker={locale === "fr" ? "Mur social" : "Social wall"}
            title={t("socialTrends", locale)}
            live={t("liveNow", locale)}
            action={<ViewAll to="/social" label={t("viewAll", locale)} />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TREND_ITEMS.slice(0, 4).map(tr => <SocialTrendCard key={tr.id} trend={tr} />)}
          </div>
        </section>


        {/* Today in Ottawa live carousel */}
        <section>
          <RailHeader
            kicker={t("todayInOttawa", locale)}
            title={locale === "fr" ? "Aujourd'hui à Ottawa — en direct" : "Today in Ottawa — live"}
            live={t("liveNow", locale)}
            action={<ViewAll to="/pulse" label={t("viewAll", locale)} />}
          />
          <Carousel itemMinWidth={300}>
            {todayItems.map(a => (
              <div key={a.slug} className="carousel-item">
                <ArticleCard article={a} />
              </div>
            ))}
          </Carousel>
        </section>

        {/* This Weekend rail */}
        <section>
          <RailHeader
            kicker={locale === "fr" ? "Ce week-end" : "This weekend"}
            title={t("thisWeekend", locale)}
            action={<ViewAll to="/activities" label={t("activities", locale)} />}
          />
          <Carousel itemMinWidth={280}>
            {weekendActivities.map(a => (
              <div key={a.id} className="carousel-item"><ActivityCard a={a} compact /></div>
            ))}
          </Carousel>
        </section>

        {/* Live row: traffic + weather + ticker */}
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
            <h2 className="kicker text-civic-red mb-3">{locale === "fr" ? "Bonnes nouvelles" : "Good news"}</h2>
            <SectionTicker label={locale === "fr" ? "BONNES NOUVELLES" : "GOOD NEWS"} items={LIVE_TICKERS.good} />
            <div className="mt-3"><SectionTicker label={locale === "fr" ? "SPORTS" : "SPORTS"} items={LIVE_TICKERS.sports} /></div>
          </div>
        </section>

        {/* Family picks */}
        <section>
          <RailHeader
            kicker={locale === "fr" ? "Enfants et famille" : "Kids & family"}
            title={t("freeFamilyPicks", locale)}
            action={<ViewAll to="/kids" label={t("kidsFamily", locale)} />}
          />
          <Carousel itemMinWidth={260}>
            {familyFree.map((p: any) => (
              <div key={p.id} className="carousel-item">
                {"category" in p ? <PickCard p={p} /> : <ActivityCard a={p} compact />}
              </div>
            ))}
          </Carousel>
        </section>

        {/* Youth picks */}
        <section>
          <RailHeader
            kicker={locale === "fr" ? "Jeunesse" : "Youth"}
            title={t("youthPicks", locale)}
            action={<ViewAll to="/youth" label={t("youth", locale)} />}
          />
          <Carousel itemMinWidth={260}>
            {youth.map(p => <div key={p.id} className="carousel-item"><PickCard p={p} /></div>)}
          </Carousel>
        </section>

        {/* Neighborhood guides */}
        <section>
          <RailHeader
            kicker={t("neighborhoods", locale)}
            title={t("neighborhoodGuides", locale)}
            action={<ViewAll to="/neighborhoods" label={t("viewAll", locale)} />}
          />
          <NeighborhoodMap />
        </section>

        {/* Latest verified deals */}
        <section>
          <RailHeader
            kicker={locale === "fr" ? "Soldes et aubaines" : "Sales & deals"}
            title={t("verifiedDeals", locale)}
            live={locale === "fr" ? "Vérifié il y a quelques min" : "Updated minutes ago"}
            action={<ViewAll to="/deals" label={t("deals", locale)} />}
          />
          <Carousel itemMinWidth={260}>
            {deals.map(d => <div key={d.id} className="carousel-item"><DealCard d={d} /></div>)}
          </Carousel>
        </section>

        {/* Canada-wide guides */}
        <section>
          <RailHeader
            kicker={locale === "fr" ? "Pancanadien" : "Canada-wide"}
            title={t("canadaWideGuides", locale)}
            action={<ViewAll to="/guide/canada" label={t("canadaGuide", locale)} />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canadaGuides.map(g => <GuideTopicCard key={g.id} g={g} />)}
          </div>
        </section>

        {/* Citizen reports near you + donate */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <RailHeader
              kicker={locale === "fr" ? "Signalements citoyens" : "Citizen reports"}
              title={t("citizenReportsNear", locale)}
              live={locale === "fr" ? "Actif" : "Active"}
              action={<ViewAll to="/submit" label={t("submit", locale)} />}
            />
            <div className="bg-card border border-rule p-4">
              {CITIZEN_REPORTS.map(r => <CitizenReportItem key={r.id} r={r} />)}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <DonationPanel />
            <div className="bg-secondary p-5">
              <span className="kicker text-civic-red">{t("factCheck", locale)}</span>
              <h3 className="font-display text-xl mt-1">{locale === "fr" ? "Ce qui est vrai, ce qui ne l'est pas" : "What's true, what isn't"}</h3>
              <div className="mt-3 grid gap-3">
                {FACT_CHECKS.slice(0, 2).map(f => <FactCheckCard key={f.id} fc={f} />)}
              </div>
              <Link to="/fact-check" className="inline-block mt-3 text-[11px] uppercase tracking-wider font-semibold border-b border-ink">
                {t("viewAll", locale)} →
              </Link>
            </div>
          </div>
        </section>

        {/* Ottawa Guide topics */}
        <section>
          <RailHeader
            kicker={t("ottawaGuide", locale)}
            title={locale === "fr" ? "L'essentiel pour vivre bien à Ottawa" : "The essentials for living well in Ottawa"}
            action={<ViewAll to="/guide/ottawa" label={t("ottawaGuide", locale)} />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OTTAWA_GUIDE.slice(0, 8).map(g => <GuideTopicCard key={g.id} g={g} />)}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
