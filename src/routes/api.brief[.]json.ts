import { createFileRoute } from "@tanstack/react-router";
import { buildBriefFeed } from "@/lib/brief-feed";
import { getNewsroomFast } from "@/lib/newsroom";
import { getOriginalsFast } from "@/lib/originals";

/** Public editorial feed shared by the website and the native reader. No account data. */
export const Route = createFileRoute("/api/brief.json")({
  server: { handlers: { GET: async ({ request }) => {
    const locale = new URL(request.url).searchParams.get("lang") === "fr" ? "fr" : "en";
    const [newsroom, originals] = await Promise.all([getNewsroomFast(2500), getOriginalsFast(2500)]);
    return Response.json({ version: 1, fetchedAt: new Date().toISOString(), locale,
      items: buildBriefFeed(newsroom?.items ?? [], originals?.items ?? [], locale),
    }, { headers: { "cache-control": "public, max-age=120", "x-robots-tag": "noindex" } });
  } } },
});
