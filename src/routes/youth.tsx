import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { PickCard } from "@/components/PickCard";
import { ActivityCard } from "@/components/ActivityCard";
import { YOUTH_PICKS, ACTIVITIES } from "@/lib/guide-data";
import { useLocale } from "@/lib/locale-context";

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
  const teen = ACTIVITIES.filter(a => a.audience.includes("teens"));
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Jeunesse" : "Youth"}
        title={locale === "fr" ? "Ottawa pour les ados" : "Ottawa for teens"}
        dek={locale === "fr"
          ? "Sport libre, micro ouvert, arts, code, mentorat — choisis par et pour les jeunes."
          : "Drop-in sport, open mics, arts, code, mentorship — chosen by and for young people."}
      />

      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "À ne pas manquer" : "Don't miss"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {YOUTH_PICKS.map(p => <PickCard key={p.id} p={p} />)}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-4">{locale === "fr" ? "Plus d'activités ados" : "More teen activities"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teen.map(a => <ActivityCard key={a.id} a={a} />)}
        </div>
      </section>
    </PageShell>
  );
}
