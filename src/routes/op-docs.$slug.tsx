import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { OpDocTemplate } from "@/components/editorial/Templates";
import { getArticle } from "@/lib/editorial-data";
export const Route = createFileRoute("/op-docs/$slug")({
  loader: ({ params }) => { const a = getArticle("op-doc", params.slug); if (!a) throw notFound(); return { a: a as any }; },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.a.title.en} — Op-Doc` }] : [] }),
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Not found</h1></PageShell>,
  component: () => { const { a } = Route.useLoaderData(); return <PageShell><EditorialSubnav /><OpDocTemplate a={a} /></PageShell>; },
});
