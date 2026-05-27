import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { LetterTemplate } from "@/components/editorial/Templates";
import { LETTERS } from "@/lib/editorial-data";
export const Route = createFileRoute("/letters/$slug")({
  loader: ({ params }) => { const a = LETTERS.find(l => l.slug === params.slug && l.moderation_status === "approved"); if (!a) throw notFound(); return { a }; },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.a.title.en} — Letter` }] : [] }),
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Not found</h1></PageShell>,
  component: () => { const { a } = Route.useLoaderData(); return <PageShell><EditorialSubnav /><LetterTemplate a={a} /></PageShell>; },
});
