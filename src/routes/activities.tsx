import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { ActivityCard } from "@/components/ActivityCard";
import { ACTIVITIES, type Activity } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";
import { Map as MapIcon, List } from "lucide-react";

type Chip = { id: string; label: { en: string; fr: string }; match: (a: Activity) => boolean };

const CHIPS: Chip[] = [
  { id: "today",    label: { en: "Today",     fr: "Aujourd'hui" },   match: a => a.todayOpen },
  { id: "weekend",  label: { en: "Weekend",   fr: "Week-end" },      match: a => a.weekend },
  { id: "free",     label: { en: "Free",      fr: "Gratuit" },       match: a => a.cost === "free" },
  { id: "under20",  label: { en: "Under $20", fr: "Moins de 20 $" }, match: a => a.cost === "free" || a.cost === "under-20" },
  { id: "kids",     label: { en: "Kids",      fr: "Enfants" },       match: a => a.audience.includes("kids") },
  { id: "family",   label: { en: "Family",    fr: "Famille" },       match: a => a.audience.includes("family") },
  { id: "teens",    label: { en: "Teens",     fr: "Ados" },          match: a => a.audience.includes("teens") },
  { id: "indoor",   label: { en: "Indoor",    fr: "Intérieur" },     match: a => a.indoor },
  { id: "outdoor",  label: { en: "Outdoor",   fr: "Extérieur" },     match: a => !a.indoor },
  { id: "access",   label: { en: "Accessible", fr: "Accessible" },   match: a => a.accessible },
  { id: "french",   label: { en: "FR friendly", fr: "Bilingue" },    match: a => a.frenchFriendly },
  { id: "transit",  label: { en: "Transit",   fr: "Transport" },     match: a => a.transitFriendly },
];

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [
    { title: "Activities in Ottawa — Verified family-friendly things to do" },
    { name: "description", content: "Museums, libraries, parks, festivals, sports, workshops and free events across Ottawa." },
    { property: "og:title", content: "Activities in Ottawa — Ottawa Civic Ledger" },
    { property: "og:description", content: "Curated, verified things to do in Ottawa." },
  ]}),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const { locale } = useLocale();
  const [active, setActive] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"list" | "map">("list");
  const toggle = (id: string) => setActive(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const list = useMemo(() => {
    const chips = CHIPS.filter(c => active.has(c.id));
    return ACTIVITIES.filter(a => chips.every(c => c.match(a)));
  }, [active]);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Activités" : "Activities"}
        title={locale === "fr" ? "Quoi faire à Ottawa — vérifié" : "What to do in Ottawa — verified"}
        dek={locale === "fr"
          ? "Musées, bibliothèques, parcs, festivals, sports, ateliers et événements gratuits."
          : "Museums, libraries, parks, festivals, sports, workshops, and free events."}
      />

      <div className="sticky top-[140px] md:top-[180px] z-20 -mx-4 sm:mx-0 mb-6 bg-paper/95 backdrop-blur py-2 rule-bottom">
        <div className="flex items-center gap-2 px-4 sm:px-0 overflow-x-auto no-scrollbar">
          {CHIPS.map(c => {
            const on = active.has(c.id);
            return (
              <button key={c.id} onClick={() => toggle(c.id)}
                className={`shrink-0 text-[11px] uppercase tracking-wider font-semibold border px-3 py-1.5 transition-colors ${on ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}>
                {c.label[locale]}
              </button>
            );
          })}
          <div className="ml-auto shrink-0 inline-flex border border-rule">
            <button onClick={() => setView("list")} aria-pressed={view === "list"} className={`px-2 py-1 ${view === "list" ? "bg-ink text-paper" : ""}`}><List className="h-4 w-4" /></button>
            <button onClick={() => setView("map")} aria-pressed={view === "map"} className={`px-2 py-1 ${view === "map" ? "bg-ink text-paper" : ""}`}><MapIcon className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4">{list.length} {locale === "fr" ? "activités" : "activities"}</p>

      {view === "list" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(a => <ActivityCard key={a.id} a={a} />)}
        </div>
      ) : (
        <div className="bg-card border border-rule p-6">
          <div className="aspect-[16/9] bg-secondary relative overflow-hidden">
            <div className="absolute inset-0 grid place-items-center text-muted-foreground font-serif italic">
              {locale === "fr" ? "Carte interactive — démonstration" : "Interactive map — prototype"}
            </div>
            <div className="absolute inset-0">
              {list.slice(0, 12).map((a, i) => (
                <span key={a.id}
                  className="absolute w-3 h-3 rounded-full bg-civic-red ring-4 ring-civic-red/20 pulse-ring"
                  style={{ left: `${(i * 73) % 90 + 4}%`, top: `${(i * 41) % 80 + 8}%` }}
                  title={a.title[locale]} />
              ))}
            </div>
          </div>
          <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {list.map(a => (
              <li key={a.id} className="flex items-center gap-2 py-1 rule-bottom">
                <span className="w-1.5 h-1.5 rounded-full bg-civic-red" />
                <span className="font-display">{a.title[locale]}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">{a.neighborhood}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {list.length === 0 && (
        <p className="text-center font-serif italic text-muted-foreground py-12">
          {locale === "fr" ? "Aucune activité ne correspond. Retirez un filtre." : "Nothing matches. Try removing a filter."}
        </p>
      )}

      <section className="mt-14 bg-secondary p-6 grid md:grid-cols-2 gap-4 items-center">
        <div>
          <h3 className="font-display text-2xl">{locale === "fr" ? "Vous connaissez une bonne activité ?" : "Know a great activity?"}</h3>
          <p className="font-serif text-sm mt-2 text-foreground/80">
            {locale === "fr" ? "Soumettez-la. Nos éditeurs vérifient avant publication." : "Submit it. Our editors verify before publishing."}
          </p>
        </div>
        <div className="md:text-right">
          <Link to="/submit" className="inline-block border border-ink px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper">
            {locale === "fr" ? "Soumettre une activité" : "Submit an activity"}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
