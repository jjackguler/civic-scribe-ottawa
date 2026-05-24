import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { EVENTS } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events in Ottawa — Ottawa Civic Ledger" }] }),
  component: EventsPage,
});

function EventsPage() {
  const { locale } = useLocale();
  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Événements" : "Events"}
        title={locale === "fr" ? "Ce qui se passe à Ottawa cette semaine" : "What's happening in Ottawa this week"}
      />
      <div className="max-w-3xl">
        {EVENTS.map(e => <EventCard key={e.id} event={e} />)}
      </div>
    </PageShell>
  );
}
