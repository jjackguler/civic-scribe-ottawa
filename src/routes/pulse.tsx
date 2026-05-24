import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { TrendCard } from "@/components/TrendCard";
import { SectionTicker } from "@/components/LiveTicker";
import { TREND_ITEMS, TOPIC_CLUSTERS, NEIGHBORHOOD_SIGNALS, LIVE_TICKERS, SOCIAL_FEED_SOURCES } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";
import { Activity, MapPin, Hash, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/pulse")({
  head: () => ({ meta: [
    { title: "Ottawa Pulse — Live civic and social signals" },
    { name: "description", content: "Live signals from across X, Reddit, TikTok, Instagram, Facebook, YouTube, blogs, newsletters, and official Ottawa sources — reviewed by editors before publication." },
    { property: "og:title", content: "Ottawa Pulse — Live civic and social signals" },
    { property: "og:description", content: "Verified social listening for Ottawa, neighborhood by neighborhood." },
  ] }),
  component: PulsePage,
});

function PulsePage() {
  const { locale } = useLocale();
  const [hood, setHood] = useState<string>("all");

  const filtered = useMemo(() => {
    if (hood === "all") return TREND_ITEMS;
    return TREND_ITEMS.filter(t => t.neighborhood === hood);
  }, [hood]);

  const topHoods = useMemo(() =>
    [...NEIGHBORHOOD_SIGNALS].sort((a, b) => b.pulse - a.pulse).slice(0, 9), []);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Pouls d'Ottawa" : "Ottawa Pulse"}
        title={locale === "fr" ? "Ce dont Ottawa parle en ce moment." : "What Ottawa is talking about, right now."}
        dek={locale === "fr"
          ? "Signaux en direct depuis X, Reddit, TikTok, Instagram, Facebook, YouTube, blogues locaux, infolettres, et sources officielles. Examinés par nos éditeurs avant publication."
          : "Live signals from X, Reddit, TikTok, Instagram, Facebook, YouTube, local blogs, newsletters, and official sources. Reviewed by editors before publication."}
      />

      <div className="space-y-3 mb-10">
        <SectionTicker label={locale === "fr" ? "EN DIRECT" : "LIVE NOW"} items={LIVE_TICKERS.breaking} />
        <SectionTicker label={locale === "fr" ? "SPORTS" : "SPORTS"} items={LIVE_TICKERS.sports} />
        <SectionTicker label={locale === "fr" ? "BOUFFE" : "FOOD"} items={LIVE_TICKERS.food} />
        <SectionTicker label={locale === "fr" ? "BONNES NOUVELLES" : "GOOD NEWS"} items={LIVE_TICKERS.good} />
      </div>

      {/* Topic clusters */}
      <section className="mb-10">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <span className="kicker text-civic-red">{locale === "fr" ? "Sujets en grappe" : "Topic clusters"}</span>
            <h2 className="font-display text-2xl mt-1">{locale === "fr" ? "Conversations dominantes" : "Dominant conversations"}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPIC_CLUSTERS.map(tc => (
            <span key={tc.id} className="inline-flex items-center gap-2 bg-card border border-rule px-3 py-1.5 text-sm">
              <Hash className="h-3.5 w-3.5 text-civic-red" />
              <span className="font-semibold">{tc.label[locale]}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{tc.count.toLocaleString()} · +{tc.delta}%</span>
            </span>
          ))}
        </div>
      </section>

      {/* Neighborhood pulse grid */}
      <section className="mb-12">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <span className="kicker text-civic-red">{locale === "fr" ? "Carte d'écoute sociale" : "Social listening map"}</span>
            <h2 className="font-display text-2xl mt-1">{locale === "fr" ? "Quartiers les plus actifs" : "Most active neighborhoods"}</h2>
          </div>
          <Link to="/neighborhoods" className="text-xs uppercase tracking-wider font-semibold border-b border-ink">
            {locale === "fr" ? "Tous les quartiers" : "All neighborhoods"} →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topHoods.map(n => (
            <button
              key={n.neighborhood}
              onClick={() => setHood(n.neighborhood)}
              className={`text-left bg-card border p-4 transition-colors ${hood === n.neighborhood ? "border-ink" : "border-rule hover:border-ink"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 kicker"><MapPin className="h-3 w-3" />{n.neighborhood}</span>
                <span className="inline-flex items-center gap-1.5 text-[11px]">
                  <Activity className="h-3 w-3 text-civic-red" />
                  <span className="tabular-nums font-semibold">{n.pulse}</span>
                </span>
              </div>
              <div className="h-1 bg-secondary mb-3 overflow-hidden">
                <div className="h-full bg-civic-red" style={{ width: `${n.pulse}%` }} />
              </div>
              <ul className="font-serif text-sm space-y-1">
                {n.topIssues.slice(0, 2).map((iss, i) => <li key={i}>• {iss[locale]}</li>)}
              </ul>
              <div className="text-[11px] text-muted-foreground mt-3 flex justify-between">
                <span>{n.trendingPosts} posts</span>
                <span>{n.submissions} submissions</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trend feed */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <span className="kicker text-civic-red">{locale === "fr" ? "Signaux en cours" : "Live signals"}</span>
            <h2 className="font-display text-2xl mt-1">
              {hood === "all" ? (locale === "fr" ? "Toute la ville" : "Citywide") : hood}
            </h2>
          </div>
          {hood !== "all" && (
            <button onClick={() => setHood("all")} className="text-xs uppercase tracking-wider font-semibold border-b border-ink">
              {locale === "fr" ? "Réinitialiser" : "Reset"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(tr => <TrendCard key={tr.id} trend={tr} />)}
        </div>
      </section>

      {/* Sources */}
      <section className="mt-14 bg-secondary p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-solution" />
          <span className="kicker">{locale === "fr" ? "Sources surveillées" : "Sources we monitor"}</span>
        </div>
        <p className="font-serif text-sm text-muted-foreground max-w-3xl mb-4">
          {locale === "fr"
            ? "Nous suivons des comptes publics et flux légaux. Aucun contenu privé. Toute publication issue d'un signal social est étiquetée et vérifiée avant publication."
            : "We monitor public accounts and legal feeds. No private content. Anything that becomes news from a social signal is labelled and verified first."}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {SOCIAL_FEED_SOURCES.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-card border border-rule px-3 py-2">
              <span className="truncate">
                <span className="font-semibold">{s.name}</span>
                <span className="text-[11px] text-muted-foreground ml-1 uppercase">{s.platform}</span>
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">{s.credibility}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
