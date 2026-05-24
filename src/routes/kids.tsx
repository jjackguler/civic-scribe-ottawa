import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { PickCard } from "@/components/PickCard";
import { ActivityCard } from "@/components/ActivityCard";
import { KIDS_PICKS, ACTIVITIES } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/kids")({
  head: () => ({ meta: [
    { title: "Kids & Family in Ottawa — Free and family-friendly picks" },
    { name: "description", content: "Curated family activities, splash pads, story times, swims, parks and free events across Ottawa." },
    { property: "og:title", content: "Kids & Family — Ottawa Civic Ledger" },
    { property: "og:description", content: "Family-first guide to Ottawa, week by week." },
  ]}),
  component: KidsPage,
});

function KidsPage() {
  const { locale } = useLocale();
  const family = ACTIVITIES.filter(a => a.audience.includes("family") || a.audience.includes("kids"));
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Enfants et famille" : "Kids & Family"}
        title={locale === "fr" ? "Le meilleur d'Ottawa, en famille" : "The best of Ottawa, with the family"}
        dek={locale === "fr"
          ? "Activités gratuites, sorties peu coûteuses, intérieures, extérieures, accessibles et bilingues."
          : "Free, low-cost, indoor, outdoor, accessible, and bilingual picks — all year."}
      />

      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "Coups de cœur de la semaine" : "This week's picks"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KIDS_PICKS.map(p => <PickCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "Plus d'activités famille" : "More family activities"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {family.map(a => <ActivityCard key={a.id} a={a} />)}
        </div>
      </section>

      <section className="bg-secondary p-6">
        <h3 className="font-display text-2xl">{locale === "fr" ? "Conseils sécurité famille" : "Family safety tips"}</h3>
        <ul className="font-serif text-sm mt-2 text-foreground/80 max-w-3xl list-disc pl-5 space-y-1">
          <li>{locale === "fr" ? "Vérifiez les heures à jour avant de partir." : "Confirm current hours before you leave."}</li>
          <li>{locale === "fr" ? "La plupart des bibliothèques offrent l'accueil libre pour 0–6 ans." : "Most library branches offer drop-ins for ages 0–6."}</li>
          <li>{locale === "fr" ? "Les jeux d'eau ouvrent généralement à la fête de la Reine." : "Splash pads typically open by Victoria Day weekend."}</li>
        </ul>
      </section>
    </PageShell>
  );
}
