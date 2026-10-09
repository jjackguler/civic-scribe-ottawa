import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { DispatchRail } from "@/components/Dispatch";
import { getDispatchesFast, useDispatches } from "@/lib/dispatch";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/dispatch/")({
  loader: () => getDispatchesFast(),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Dispatches — ${SITE.name}`, fr: `Dépêches — ${SITE.name}` },
      description: {
        en: "Our own articles on the AI stories several outlets are reporting: what's confirmed, what's claimed, what's still unknown, with every source linked.",
        fr: "Nos propres articles sur les nouvelles en IA que plusieurs médias rapportent : ce qui est confirmé, ce qui est affirmé, ce qu'on ignore encore, avec chaque source en lien.",
      },
    }),
  component: DispatchIndex,
});

function DispatchIndex() {
  const initial = Route.useLoaderData();
  const { data } = useDispatches(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const empty = (data?.items.length ?? 0) === 0;
  return (
    <PageShell>
      <PageIntro
        title={fr ? "Dépêches" : "Dispatches"}
        dek={fr
          ? "Quand plusieurs médias rapportent le même événement, notre pupitre écrit, avec l'IA, un article à partir de leurs reportages : ce qui est confirmé, ce qui est affirmé, ce qu'on ignore encore. Chaque source est en lien."
          : "When several outlets report the same event, our desk writes, with AI, one article from their reporting: what's confirmed, what's claimed, what's still unknown. Every source is linked."}
      >
        <p className="mt-4"><Link to="/standards" hash="dispatches" className="text-lake font-semibold hover:underline">{fr ? "Comment nous écrivons les dépêches" : "How we write dispatches"}</Link></p>
      </PageIntro>
      <div className="container-mw mt-10">
        {empty ? (
          <p className="font-serif text-[1.15rem] max-w-xl">{fr ? "Les premières dépêches arrivent bientôt." : "The first dispatches are on their way."}</p>
        ) : (
          <DispatchRail initial={initial} variant="grid" limit={24} title={false} />
        )}
      </div>
    </PageShell>
  );
}
