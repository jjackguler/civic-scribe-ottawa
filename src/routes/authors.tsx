import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { listAuthors, getAuthor, articlesByAuthor } from "@/lib/editorial-data";
import { NewsImage } from "@/components/NewsImage";
import { EditorialCard, articleHref } from "@/components/editorial/SectionIndex";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/authors")({
  head: () => ({ meta: [{ title: "Authors — Ottawa Civic Ledger" }] }),
  component: () => {
    const { locale } = useLocale();
    const grouped: Record<string, ReturnType<typeof listAuthors>> = {};
    listAuthors().forEach(a => { (grouped[a.role] ||= []).push(a); });
    return (
      <PageShell>
        <EditorialSubnav />
        <PageHero kicker="Newsroom" title="Authors & contributors." dek="The reporters, columnists, cartoonists, and community voices behind the Ledger." />
        <div className="space-y-12">
          {Object.entries(grouped).map(([role, list]) => (
            <section key={role}>
              <h2 className="kicker text-civic-red mb-4">{role.replace("-", " ")}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map(a => (
                  <Link key={a.id} to="/authors/$slug" params={{ slug: a.slug }} className="flex items-start gap-3 p-4 border border-rule hover:border-ink">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-rule shrink-0">
                      <NewsImage src={a.portrait_src || "newsprint:#2a2a2a"} headline={a.name} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-display text-lg">{a.name}</div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{a.neighborhood || "Ottawa"}</div>
                      <p className="text-xs font-serif mt-1 line-clamp-2">{locale === "fr" ? a.bio_fr : a.bio_en}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageShell>
    );
  },
});
