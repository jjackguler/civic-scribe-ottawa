import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { PickCard } from "@/components/PickCard";
import { ActivityCard } from "@/components/ActivityCard";
import { YOUTH_PICKS, ACTIVITIES, type Activity } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";

type Chip = { id: string; label: { en: string; fr: string }; match: (a: Activity) => boolean };
const CHIPS: Chip[] = [
  { id: "free",     label: { en: "Free",       fr: "Gratuit" },        match: a => a.cost === "free" },
  { id: "under20",  label: { en: "Under $20",  fr: "Moins de 20 $" },  match: a => a.cost === "free" || a.cost === "under-20" },
  { id: "weekend",  label: { en: "Weekend",    fr: "Week-end" },       match: a => a.weekend },
  { id: "indoor",   label: { en: "Indoor",     fr: "Intérieur" },      match: a => a.indoor },
  { id: "outdoor",  label: { en: "Outdoor",    fr: "Extérieur" },      match: a => !a.indoor },
  { id: "age1214",  label: { en: "Ages 12–14", fr: "12–14 ans" },      match: a => a.audience.includes("teens") },
  { id: "age1517",  label: { en: "Ages 15–17", fr: "15–17 ans" },      match: a => a.audience.includes("teens") },
  { id: "transit",  label: { en: "Transit",    fr: "Transport" },      match: a => a.transitFriendly },
  { id: "access",   label: { en: "Accessible", fr: "Accessible" },     match: a => a.accessible },
  { id: "french",   label: { en: "Bilingual",  fr: "Bilingue" },       match: a => a.frenchFriendly },
];

export const Route = createFileRoute("/youth")({
  head: () => ({ meta: [
    { title: "Youth in Ottawa — Teen-friendly activities, sports, arts" },
    { name: "description", content: "Drop-ins, open mics, skate jams, code clubs, sports and creative spaces for teens across Ottawa." },
    { property: "og:title", content: "Youth — Ottawa Civic Ledger" },
    { property: "og:description", content: "Built for teens, with teens, in Ottawa." },
  ]}),
  component: YouthPage,
});

function YouthPage() {
  const { locale } = useLocale();
  const [active, setActive] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setActive(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const teen = useMemo(() => {
    const base = ACTIVITIES.filter(a => a.audience.includes("teens"));
    const chips = CHIPS.filter(c => active.has(c.id));
    return base.filter(a => chips.every(c => c.match(a)));
  }, [active]);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Jeunesse" : "Youth"}
        title={locale === "fr" ? "Ottawa pour les ados" : "Ottawa for teens"}
        dek={locale === "fr"
          ? "Sport libre, micro ouvert, arts, code, mentorat — choisis par et pour les jeunes."
          : "Drop-in sport, open mics, arts, code, mentorship — chosen by and for young people."}
      />

      <div className="bg-secondary border-l-2 border-civic-red px-4 py-3 mb-6 text-[11px] font-sans flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span className="kicker text-civic-red">{locale === "fr" ? "Sources" : "Sources"}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-civic-red" />{locale === "fr" ? "Éditeur" : "Editor"}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-river" />{locale === "fr" ? "Ville d'Ottawa" : "City of Ottawa"}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-solution" />{locale === "fr" ? "Soumission citoyen (revue)" : "Citizen submission (reviewed)"}</span>
        <span className="ml-auto text-muted-foreground italic">
          {locale === "fr" ? "Confidentialité : aucun nom complet de mineur sans consentement." : "Privacy: no full names of minors without consent."}
        </span>
      </div>

      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "À ne pas manquer" : "Don't miss"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {YOUTH_PICKS.map(p => <PickCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
          <h2 className="font-display text-2xl">{locale === "fr" ? "Plus d'activités ados" : "More teen activities"}</h2>
          <span className="text-[11px] text-muted-foreground">{teen.length} {locale === "fr" ? "résultats" : "results"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {CHIPS.map(c => {
            const on = active.has(c.id);
            return (
              <button key={c.id} onClick={() => toggle(c.id)}
                className={`text-[11px] uppercase tracking-wider font-semibold border px-3 py-1.5 transition-colors ${on ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}>
                {c.label[locale]}
              </button>
            );
          })}
          {active.size > 0 && (
            <button onClick={() => setActive(new Set())} className="text-[11px] text-civic-red hover:underline ml-1">
              {locale === "fr" ? "Effacer" : "Clear"}
            </button>
          )}
        </div>
        {teen.length === 0 ? (
          <p className="font-serif italic text-muted-foreground py-8">{locale === "fr" ? "Aucune activité ne correspond. Retirez un filtre." : "Nothing matches. Try removing a filter."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teen.map(a => <ActivityCard key={a.id} a={a} />)}
          </div>
        )}
      </section>

      <section className="bg-secondary p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl">{locale === "fr" ? "Soutien ados à Ottawa" : "Teen support in Ottawa"}</h3>
          <ul className="font-serif text-sm mt-2 text-foreground/80 list-disc pl-5 space-y-1">
            <li>{locale === "fr" ? "Jeunesse, J'écoute — texto 686868, 24/7, bilingue." : "Kids Help Phone — text 686868, 24/7, bilingual."}</li>
            <li>{locale === "fr" ? "Centres communautaires : accueil libre gratuit dans 30+ sites de la Ville." : "Community centres: free drop-in at 30+ City sites."}</li>
            <li>{locale === "fr" ? "OC Transpo : laissez-passer mensuel ado à tarif réduit." : "OC Transpo: discounted monthly youth pass."}</li>
          </ul>
        </div>
        <div className="md:text-right flex md:flex-col gap-3 md:items-end items-start">
          <Link to="/submit" className="inline-block border border-ink px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper">
            {locale === "fr" ? "Soumettre une activité" : "Submit an activity"}
          </Link>
          <Link to="/activities" className="inline-block border border-ink px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-ink hover:text-paper">
            {locale === "fr" ? "Tout voir" : "Browse all"}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
