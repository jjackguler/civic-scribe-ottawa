import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { InterviewTemplate } from "@/components/editorial/Templates";
import { getArticle } from "@/lib/editorial-data";
import type { InterviewArticle } from "@/types/editorial";

export const Route = createFileRoute("/interviews/$slug")({
  loader: ({ params }) => {
    const a = getArticle("interview", params.slug);
    if (!a) throw notFound();
    return { a: a as InterviewArticle };
  },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.a.title.en} — Interview` }, { name: "description", content: loaderData.a.dek.en }] : [] }),
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Interview not found</h1></PageShell>,
  component: () => {
    const { a } = Route.useLoaderData();
    return <PageShell><EditorialSubnav /><InterviewTemplate a={a} /></PageShell>;
  },
});
