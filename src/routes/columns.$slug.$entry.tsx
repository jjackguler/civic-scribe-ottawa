import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { ColumnTemplate } from "@/components/editorial/Templates";
import { getArticle } from "@/lib/editorial-data";
import type { ColumnEntry } from "@/types/editorial";

export const Route = createFileRoute("/columns/$slug/$entry")({
  loader: ({ params }) => {
    const a = getArticle("column", params.entry);
    if (!a) throw notFound();
    return { a: a as ColumnEntry };
  },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.a.title.en} — Column` }] : [] }),
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Not found</h1></PageShell>,
  component: () => {
    const { a } = Route.useLoaderData();
    return <PageShell><EditorialSubnav /><ColumnTemplate a={a} /></PageShell>;
  },
});
