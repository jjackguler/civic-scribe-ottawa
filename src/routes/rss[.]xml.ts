import { createFileRoute } from "@tanstack/react-router";
import { isFrPath } from "@/lib/seo";

/** /rss.xml (English) and /fr/rss.xml (French). */
export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { buildRss } = await import("@/lib/feeds.server");
        const locale = isFrPath(new URL(request.url).pathname) ? "fr" : "en";
        return new Response(await buildRss(locale), {
          headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
