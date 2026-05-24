import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { SportsCard } from "@/components/SportsCard";
import { SectionTicker } from "@/components/LiveTicker";
import { SPORTS_EVENTS, LIVE_TICKERS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";

const LEAGUES = ["all", "NHL", "PWHL", "CPL", "FrontierLeague", "CEBL", "USports", "Community", "Youth", "School"] as const;

export const Route = createFileRoute("/sports")({
  head: () => ({ meta: [
    { title: "Ottawa Sports Hub — Sens, Atlético, Titans, BlackJacks, PWHL, USports & community leagues" },
    { name: "description", content: "Match results, upcoming games, tournaments, and community sports across Ottawa." },
    { property: "og:title", content: "Ottawa Sports Hub" },
    { property: "og:description", content: "Pro, university, and neighborhood sports — verified and bilingual." },
  ] }),
  component: SportsPage,
});

function SportsPage() {
  const { locale } = useLocale();
  const [league, setLeague] = useState<string>("all");

  const list = useMemo(() => SPORTS_EVENTS.filter(e => league === "all" || e.league === league), [league]);
  const live = SPORTS_EVENTS.filter(e => e.status === "live");
  const upcoming = SPORTS_EVENTS.filter(e => e.status === "scheduled");
  const results = SPORTS_EVENTS.filter(e => e.status === "final");

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Carrefour sports" : "Sports Hub"}
        title={locale === "fr" ? "Le sport d'Ottawa, des Sens aux ligues de quartier." : "Ottawa sports — from the Sens to the neighbourhood league."}
        dek={locale === "fr"
          ? "Résultats, calendriers, tournois jeunesse et conversations sociales vérifiées."
          : "Results, schedules, youth tournaments, and verified social buzz."}
      />

      <div className="mb-8"><SectionTicker label={locale === "fr" ? "SPORTS EN DIRECT" : "SPORTS NOW"} items={LIVE_TICKERS.sports} /></div>

      <div className="flex flex-wrap gap-2 mb-8">
        {LEAGUES.map(l => (
          <button
            key={l}
            onClick={() => setLeague(l)}
            className={`text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 border ${league === l ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}
          >
            {l === "all" ? (locale === "fr" ? "Toutes les ligues" : "All leagues") : l}
          </button>
        ))}
      </div>

      {live.length > 0 && (
        <Section title={locale === "fr" ? "En direct" : "Live"} items={live.filter(e => league === "all" || e.league === league)} />
      )}
      <Section title={locale === "fr" ? "À venir" : "Upcoming"} items={upcoming.filter(e => league === "all" || e.league === league)} />
      <Section title={locale === "fr" ? "Résultats récents" : "Recent results"} items={results.filter(e => league === "all" || e.league === league)} />

      {list.length === 0 && (
        <p className="text-center font-serif italic text-muted-foreground py-12">
          {locale === "fr" ? "Aucun match dans cette ligue pour le moment." : "No matches in this league right now."}
        </p>
      )}

      <section className="mt-14 grid lg:grid-cols-2 gap-6">
        <div className="bg-secondary p-6">
          <span className="kicker text-civic-red">{locale === "fr" ? "Tableau de tournoi" : "Tournament bracket"}</span>
          <h3 className="font-display text-2xl mt-1">{locale === "fr" ? "Coupe Hintonburg U13" : "Hintonburg Cup U13"}</h3>
          <p className="font-serif text-sm text-muted-foreground mt-2">{locale === "fr" ? "24 équipes, début 14 juin. Tableau interactif à venir." : "24 teams, kickoff June 14. Interactive bracket coming soon."}</p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-wider">
            {["R1", "QF", "SF", "F"].map(s => (
              <div key={s} className="bg-card border border-rule p-2 text-center">{s}</div>
            ))}
          </div>
        </div>
        <div className="bg-secondary p-6">
          <span className="kicker text-civic-red">{locale === "fr" ? "Mise en lumière communautaire" : "Community highlight"}</span>
          <h3 className="font-display text-2xl mt-1">{locale === "fr" ? "38 points : la performance secondaire 3 de Vanier" : "38 points: the grade-9 performance Vanier won't forget"}</h3>
          <p className="font-serif text-sm text-muted-foreground mt-2">{locale === "fr" ? "École secondaire De La Salle — discussion communautaire en cours." : "École secondaire De La Salle — community discussion underway."}</p>
        </div>
      </section>
    </PageShell>
  );
}

function Section({ title, items }: { title: string; items: typeof SPORTS_EVENTS }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="font-display text-2xl mb-4 rule-bottom pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(e => <SportsCard key={e.id} ev={e} />)}
      </div>
    </section>
  );
}
