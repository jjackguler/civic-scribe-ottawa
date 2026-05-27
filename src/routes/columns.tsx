import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { COLUMNS, getAuthor, entriesForColumn } from "@/lib/editorial-data";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/columns")({
  head: () => ({ meta: [{ title: "Columns — Ottawa Civic Ledger" }] }),
  component: () => {
    const { locale } = useLocale();
    return (
      <PageShell>
        <EditorialSubnav />
        <PageHero kicker="Columns" title="Voices on a schedule." dek="Recurring columnists on the city, the river, and the buses." />
        <div className="grid md:grid-cols-2 gap-8">
          {COLUMNS.map(c => {
            const columnist = getAuthor(c.columnist_id);
            const entries = entriesForColumn(c.slug);
            return (
              <Link key={c.slug} to="/columns/$slug" params={{ slug: c.slug }} className="block p-6 border border-ink hover:bg-secondary">
                <div className="kicker text-civic-red">Column · {c.cadence}</div>
                <h3 className="font-display text-3xl mt-2">{locale === "fr" ? c.name_fr : c.name_en}</h3>
                <p className="font-serif text-base mt-3 text-muted-foreground">{locale === "fr" ? c.description_fr : c.description_en}</p>
                {columnist && <div className="text-xs uppercase tracking-wider mt-4">By {columnist.name} · {entries.length} {entries.length === 1 ? "entry" : "entries"}</div>}
              </Link>
            );
          })}
        </div>
      </PageShell>
    );
  },
});
