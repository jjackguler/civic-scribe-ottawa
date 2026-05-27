import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { getColumn, getAuthor, entriesForColumn } from "@/lib/editorial-data";
import { EditorialCard } from "@/components/editorial/SectionIndex";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/columns/$slug")({
  loader: ({ params }) => {
    const c = getColumn(params.slug);
    if (!c) throw notFound();
    return { c, entries: entriesForColumn(c.slug) };
  },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.c.name_en} — Column` }] : [] }),
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Column not found</h1></PageShell>,
  component: () => {
    const { c, entries } = Route.useLoaderData();
    const { locale } = useLocale();
    const columnist = getAuthor(c.columnist_id);
    return (
      <PageShell>
        <EditorialSubnav />
        <header className="mb-10 max-w-4xl">
          <div className="kicker text-civic-red">Column · {c.cadence}</div>
          <h1 className="font-display text-5xl md:text-7xl mt-2">{locale === "fr" ? c.name_fr : c.name_en}</h1>
          <p className="font-serif text-lg text-muted-foreground mt-4">{locale === "fr" ? c.description_fr : c.description_en}</p>
          {columnist && <div className="mt-4 text-sm uppercase tracking-wider">By <Link to="/authors/$slug" params={{ slug: columnist.slug }} className="underline hover:text-civic-red">{columnist.name}</Link></div>}
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {entries.map(e => <EditorialCard key={e.slug} a={e} />)}
        </div>
      </PageShell>
    );
  },
});
