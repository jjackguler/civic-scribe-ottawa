import { createFileRoute } from "@tanstack/react-router";
import { TodayStack } from "@/components/Today";
import { getAiNewsFast, type NewsPayload } from "@/lib/news";
import { getDispatchesFast, type DispatchList } from "@/lib/dispatch";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

type Search = { s?: string; fixture?: 1 };

export const Route = createFileRoute("/today")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ...((typeof s.s === "string" || typeof s.s === "number") && /^[\w-]{1,120}$/.test(String(s.s)) ? { s: String(s.s) } : {}),
    // Dev only: sample stories and dispatches, since feeds and models are unreachable locally.
    ...(import.meta.env.DEV && String(s.fixture) === "1" ? { fixture: 1 as const } : {}),
  }),
  loaderDeps: ({ search }) => ({ fixture: search.fixture }),
  loader: async ({ deps }): Promise<{ news: NewsPayload | null; dispatches: DispatchList | null }> => {
    if (import.meta.env.DEV && deps.fixture === 1) return { news: null, dispatches: null };
    const [news, dispatches] = await Promise.all([getAiNewsFast(), getDispatchesFast()]);
    return { news, dispatches };
  },
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Today in 60 seconds — ${SITE.name}`, fr: `L'actualité en 60 secondes — ${SITE.name}` },
      description: {
        en: "The day's biggest AI stories in one minute: what happened, why it matters to people, and a link to every source. Tap through, then you're up to date.",
        fr: "Les grandes nouvelles de l'IA du jour en une minute : ce qui s'est passé, pourquoi c'est important pour les gens, et un lien vers chaque source.",
      },
    }),
  component: TodayPage,
});

function TodayPage() {
  const { news, dispatches } = Route.useLoaderData();
  const { s } = Route.useSearch();
  return <TodayStack initialNews={news} initialDispatches={dispatches} startId={s} />;
}
