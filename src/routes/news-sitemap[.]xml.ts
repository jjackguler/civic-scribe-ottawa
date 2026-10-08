import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { buildNewsSitemap } = await import("@/lib/feeds.server");
        return new Response(await buildNewsSitemap(), {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
