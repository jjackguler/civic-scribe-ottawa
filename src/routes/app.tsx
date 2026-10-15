import { createFileRoute } from "@tanstack/react-router";
import { BriefApp } from "@/components/BriefApp";
import { getNewsroomFast } from "@/lib/newsroom";
import { getOriginalsFast } from "@/lib/originals";
import { seoHead } from "@/lib/seo";
import briefCss from "../brief.css?url";

export const Route = createFileRoute("/app")({
  validateSearch: (s: Record<string, unknown>) => ({
    story: typeof s.story === "string" ? s.story.slice(0, 200) : undefined,
  }),
  loader: async () => {
    const [newsroom, originals] = await Promise.all([getNewsroomFast(350), getOriginalsFast(350)]);
    return { newsroom, originals };
  },
  head: ({ match }) => {
    const head = seoHead(match, {
      title: { en: "The Brief — AI Broadsheet", fr: "Le Brief — AI Broadsheet" },
      description: {
        en: "AI news in a new rhythm. Swipe through short videos, visual explainers and the evidence behind the headlines.",
        fr: "L’actualité IA à un nouveau rythme. Vidéos courtes, explications visuelles et sources derrière les titres.",
      },
    });
    return {
      ...head,
      meta: [...head.meta, { name: "theme-color", content: "#111b13" }],
      links: [
        ...head.links,
        { rel: "stylesheet", href: briefCss },
        { rel: "apple-touch-icon", href: "/brief/icon-192.png", sizes: "192x192" },
      ],
    };
  },
  component: AppPage,
});
function AppPage() {
  const initial = Route.useLoaderData();
  const { story } = Route.useSearch();
  return <BriefApp initial={initial} initialStory={story} />;
}
