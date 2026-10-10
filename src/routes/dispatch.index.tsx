import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { DispatchRail } from "@/components/Dispatch";
import { NewsroomGrid } from "@/components/NewsroomLead";
import { getDispatchesFast, useDispatches } from "@/lib/dispatch";
import { getNewsroomFast, useNewsroom } from "@/lib/newsroom";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

/**
 * Our own articles. Once the Newsroom (scripts/newsroom) has published, this
 * page lists its articles; until then, the Worker-side Dispatch desk's.
 */
export const Route = createFileRoute("/dispatch/")({
  loader: async () => {
    const [dispatches, newsroom] = await Promise.all([getDispatchesFast(), getNewsroomFast()]);
    return { dispatches, newsroom };
  },
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Our articles: the Newsroom — ${SITE.name}`, fr: `Nos articles : la salle de rédaction — ${SITE.name}` },
      description: {
        en: "Our own articles on the AI stories several outlets are reporting: what's confirmed, what's claimed, what's still unknown, and why it matters to people, with every source linked.",
        fr: "Nos propres articles sur les nouvelles en IA que plusieurs médias rapportent : ce qui est confirmé, ce qui est affirmé, ce qu'on ignore encore et pourquoi c'est important, avec chaque source en lien.",
      },
    }),
  component: DispatchIndex,
});

function DispatchIndex() {
  const initial = Route.useLoaderData();
  const { data } = useDispatches(initial.dispatches);
  const { data: nr } = useNewsroom(initial.newsroom);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const articles = nr?.items ?? [];
  const empty = articles.length === 0 && (data?.items.length ?? 0) === 0;
  return (
    <PageShell>
      <PageIntro
        title={fr ? "Nos articles" : "Our articles"}
        dek={fr
          ? "Quand plusieurs médias rapportent le même événement, ou qu'une entreprise, un laboratoire ou un gouvernement annonce sa propre nouvelle, notre salle de rédaction écrit l'article, avec l'IA, à partir de leurs reportages : ce qui est confirmé, ce qui est affirmé, ce qu'on ignore encore. Chaque source est en lien."
          : "When several outlets report the same event, or a company, lab or government announces its own news, our newsroom writes the article, with AI, from their reporting: what's confirmed, what's claimed, what's still unknown. Every source is linked."}
      >
        <p className="mt-4"><Link to="/standards" hash="newsroom" className="text-lake font-semibold hover:underline">{fr ? "Comment travaille notre rédaction" : "How our newsroom works"}</Link></p>
      </PageIntro>
      <div className="container-mw mt-10">
        {empty ? (
          <p className="font-serif text-[1.15rem] max-w-xl">{fr ? "Les premiers articles arrivent bientôt." : "The first articles are on their way."}</p>
        ) : articles.length > 0 ? (
          <NewsroomGrid items={articles} />
        ) : (
          <DispatchRail initial={initial.dispatches} variant="grid" limit={24} title={false} />
        )}
      </div>
    </PageShell>
  );
}
