import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { buildSitemap } = await import("@/lib/feeds.server");
        return new Response(await buildSitemap(), {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=600" },
        });
      },
    },
  },
});
