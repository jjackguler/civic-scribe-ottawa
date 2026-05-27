import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { OpinionTemplate } from "@/components/editorial/Templates";
import { getArticle } from "@/lib/editorial-data";
import type { OpinionArticle } from "@/types/editorial";

export const Route = createFileRoute("/opinion/$slug")({
  loader: ({ params }) => {
    const a = getArticle("opinion", params.slug);
    if (!a) throw notFound();
    return { a: a as OpinionArticle };
  },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.a.title.en} — Opinion` }, { name: "description", content: loaderData.a.dek.en }] : [] }),
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Not found</h1></PageShell>,
  component: () => {
    const { a } = Route.useLoaderData();
    return <PageShell><EditorialSubnav /><OpinionTemplate a={a} /></PageShell>;
  },
});
