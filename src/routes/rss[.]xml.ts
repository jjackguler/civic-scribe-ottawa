import { createFileRoute } from "@tanstack/react-router";
import { isFrPath } from "@/lib/seo";

/** /rss.xml (English) and /fr/rss.xml (French). */
export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { buildRss } = await import("@/lib/feeds.server");
        const locale = isFrPath(new URL(request.url).pathname) ? "fr" : "en";
        const xml = await buildRss(locale);
        if (!xml) {
          return new Response("The news desk is starting up. Try again in a minute.", {
            status: 503,
            headers: { "content-type": "text/plain; charset=utf-8", "retry-after": "60", "cache-control": "no-store" },
          });
        }
        return new Response(xml, {
          headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
