import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { StudioCard } from "@/components/StudioCards";
import { AiBadge, Breadcrumbs } from "@/components/Trust";
import { NewsletterPromo } from "@/components/NewsletterBox";
import { useLocale } from "@/lib/locale-context";
import { STUDIO, studioFor } from "@/lib/studio";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/desk/")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `From our desk: AI explainers for Canada — ${SITE.name}`, fr: `De notre pupitre : l'IA expliquée — ${SITE.name}` },
      description: {
        en: "Explainers and reports from the AI Broadsheet desk: drafted with AI assistance, checked and approved by a human editor, with every source listed.",
        fr: "Explications et reportages du pupitre d'AI Broadsheet : rédigés avec l'aide de l'IA, vérifiés et approuvés par un responsable éditorial, toutes sources citées.",
      },
      // A list with nothing on it yet is a thin page: keep it out of search until the first piece is approved.
      noindex: STUDIO.length === 0,
      breadcrumbs: [{ name: { en: "From our desk", fr: "De notre pupitre" }, path: "/desk" }],
    }),
  component: DeskIndex,
});

function DeskIndex() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const items = studioFor(locale, STUDIO);
  return (
    <PageShell>
      <div className="container-mw pt-6">
        <Breadcrumbs items={[{ label: fr ? "De notre pupitre" : "From our desk" }]} />
        <header className="mt-6 pb-8 border-b border-line grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-end">
          <div>
            <h1 className="hl text-[2.5rem] sm:text-[3.2rem]">{fr ? "De notre pupitre" : "From our desk"}</h1>
            <p className="font-serif text-[1.2rem] leading-relaxed text-ink/80 mt-3 max-w-[60ch]">
              {fr
                ? "Nos propres explications sur l'IA et ses effets au Canada. Chaque texte est rédigé avec l'aide de l'IA, vérifié et approuvé par un responsable éditorial nommé, et cite toutes ses sources."
                : "Our own explainers on AI and what it changes in Canada. Each piece is drafted with AI assistance, checked and approved by a named editor, and lists every source."}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-3 text-[0.9rem]">
              <AiBadge />
              <Link to="/how-we-use-ai" className="text-lake font-semibold underline">{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</Link>
            </p>
          </div>
          <NewsletterPromo />
        </header>
        {items.length === 0 ? (
          <div className="py-16 max-w-2xl">
            <p className="hl text-[1.6rem]">{fr ? "Nos premiers textes approuvés arrivent bientôt." : "Our first editor-approved pieces are on the way."}</p>
            <p className="font-serif text-[1.1rem] text-muted-ink mt-3">
              {fr ? "En attendant, lisez les " : "Meanwhile, read our "}
              <Link to="/dispatch" className="text-lake font-semibold underline">{fr ? "résumés de la rédaction" : "newsroom summaries"}</Link>
              {fr ? " ou nos " : " or our "}
              <Link to="/learn" className="text-lake font-semibold underline">{fr ? "guides" : "guides"}</Link>.
            </p>
          </div>
        ) : (
          <ul className="grid gap-x-8 gap-y-10 py-10 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => <li key={p.id} className={i === 0 ? "sm:col-span-2" : ""}><StudioCard p={p} size={i === 0 ? "lead" : "card"} /></li>)}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
