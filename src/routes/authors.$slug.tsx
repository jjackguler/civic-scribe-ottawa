import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { EditorialSubnav, AuthorCard } from "@/components/editorial/EditorialPrimitives";
import { EditorialCard } from "@/components/editorial/SectionIndex";
import { AUTHORS, articlesByAuthor } from "@/lib/editorial-data";

export const Route = createFileRoute("/authors/$slug")({
  loader: ({ params }) => {
    const a = AUTHORS.find(au => au.slug === params.slug);
    if (!a) throw notFound();
    return { author: a, articles: articlesByAuthor(a.id) };
  },
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.author.name} — Ottawa Civic Ledger` }] : [] }),
  notFoundComponent: () => <PageShell><h1 className="font-display text-4xl">Author not found</h1></PageShell>,
  component: () => {
    const { author, articles } = Route.useLoaderData();
    return (
      <PageShell>
        <EditorialSubnav />
        <div className="max-w-4xl mx-auto">
          <AuthorCard author={author} />
          <h2 className="font-display text-2xl mt-12 mb-6">Archive</h2>
          {articles.length === 0 ? (
            <p className="font-serif text-muted-foreground">No articles published yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((a: any) => <EditorialCard key={`${a.type}-${a.slug}`} a={a} />)}
            </div>
          )}
        </div>
      </PageShell>
    );
  },
});
