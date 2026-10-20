import { createFileRoute } from "@tanstack/react-router";

/** /podcast.xml: After the Headline, for Apple Podcasts, Spotify and any podcast app. */
export const Route = createFileRoute("/podcast.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { buildPodcastRss } = await import("@/lib/podcast");
        return new Response(await buildPodcastRss(), {
          headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=600" },
        });
      },
    },
  },
});
