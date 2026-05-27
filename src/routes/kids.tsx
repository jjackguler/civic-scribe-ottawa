import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { PickCard } from "@/components/PickCard";
import { ActivityCard } from "@/components/ActivityCard";
import { KIDS_PICKS, ACTIVITIES, type Activity } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";

type Chip = { id: string; label: { en: string; fr: string }; match: (a: Activity) => boolean };
const CHIPS: Chip[] = [
  { id: "free",     label: { en: "Free",       fr: "Gratuit" },        match: a => a.cost === "free" },
  { id: "under20",  label: { en: "Under $20",  fr: "Moins de 20 $" },  match: a => a.cost === "free" || a.cost === "under-20" },
  { id: "weekend",  label: { en: "Weekend",    fr: "Week-end" },       match: a => a.weekend },
  { id: "indoor",   label: { en: "Indoor",     fr: "Intérieur" },      match: a => a.indoor },
  { id: "outdoor",  label: { en: "Outdoor",    fr: "Extérieur" },      match: a => !a.indoor },
  { id: "age04",    label: { en: "Ages 0–4",   fr: "0–4 ans" },        match: a => a.audience.includes("kids") && /toddler|0–4|story|splash/i.test(a.title.en + a.blurb.en) },
  { id: "age511",   label: { en: "Ages 5–11",  fr: "5–11 ans" },       match: a => a.audience.includes("kids") },
  { id: "transit",  label: { en: "Transit",    fr: "Transport" },      match: a => a.transitFriendly },
  { id: "access",   label: { en: "Accessible", fr: "Accessible" },     match: a => a.accessible },
  { id: "french",   label: { en: "Bilingual",  fr: "Bilingue" },       match: a => a.frenchFriendly },
];

export const Route = createFileRoute("/kids")({
  head: () => ({ meta: [
    { title: "Kids & Family in Ottawa — Free and family-friendly picks" },
    { name: "description", content: "Curated family activities, splash pads, story times, swims, parks and free events across Ottawa, by neighbourhood and age group." },
    { property: "og:title", content: "Kids & Family — Ottawa Civic Ledger" },
    { property: "og:description", content: "Family-first guide to Ottawa, week by week." },
  ]}),
  component: KidsPage,
});

function KidsPage() {
  const { locale } = useLocale();
  const [active, setActive] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setActive(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const family = useMemo(() => {
    const base = ACTIVITIES.filter(a => a.audience.includes("family") || a.audience.includes("kids"));
    const chips = CHIPS.filter(c => active.has(c.id));
    return base.filter(a => chips.every(c => c.match(a)));
  }, [active]);

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Enfants et famille" : "Kids & Family"}
        title={locale === "fr" ? "Le meilleur d'Ottawa, en famille" : "The best of Ottawa, with the family"}
        dek={locale === "fr"
          ? "Activités gratuites, sorties peu coûteuses, intérieures, extérieures, accessibles et bilingues — par quartier et groupe d'âge."
          : "Free, low-cost, indoor, outdoor, accessible and bilingual picks — by neighbourhood and age group."}
      />

      <div className="bg-secondary border-l-2 border-civic-red px-4 py-3 mb-6 text-[11px] font-sans flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span className="kicker text-civic-red">{locale === "fr" ? "Sources" : "Sources"}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-civic-red" />{locale === "fr" ? "Éditeur" : "Editor"}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-river" />{locale === "fr" ? "Ville d'Ottawa" : "City of Ottawa"}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-solution" />{locale === "fr" ? "Soumission citoyen" : "Citizen submission"}</span>
        <span className="ml-auto text-muted-foreground italic">
          {locale === "fr" ? "Aucune adresse personnelle publiée. Vérifiez les horaires avant de partir." : "No personal addresses published. Confirm hours before leaving."}
        </span>
      </div>

      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "Coups de cœur de la semaine" : "This week's picks"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KIDS_PICKS.map(p => <PickCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
          <h2 className="font-display text-2xl">{locale === "fr" ? "Plus d'activités famille" : "More family activities"}</h2>
          <span className="text-[11px] text-muted-foreground">{family.length} {locale === "fr" ? "résultats" : "results"}</span>
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
        {family.length === 0 ? (
          <p className="font-serif italic text-muted-foreground py-8">{locale === "fr" ? "Aucune activité ne correspond. Retirez un filtre." : "Nothing matches. Try removing a filter."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {family.map(a => <ActivityCard key={a.id} a={a} />)}
          </div>
        )}
      </section>

      <section className="bg-secondary p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl">{locale === "fr" ? "Conseils sécurité famille" : "Family safety tips"}</h3>
          <ul className="font-serif text-sm mt-2 text-foreground/80 max-w-3xl list-disc pl-5 space-y-1">
            <li>{locale === "fr" ? "Vérifiez les heures à jour avant de partir." : "Confirm current hours before you leave."}</li>
            <li>{locale === "fr" ? "La plupart des bibliothèques offrent l'accueil libre pour 0–6 ans." : "Most library branches offer drop-ins for ages 0–6."}</li>
            <li>{locale === "fr" ? "Les jeux d'eau ouvrent généralement à la fête de la Reine." : "Splash pads typically open by Victoria Day weekend."}</li>
            <li>{locale === "fr" ? "OC Transpo : enfants de 8 ans et moins voyagent gratuitement avec un adulte." : "OC Transpo: kids 8 and under ride free with an adult."}</li>
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
