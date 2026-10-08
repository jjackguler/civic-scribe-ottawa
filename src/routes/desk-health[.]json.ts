import { createFileRoute } from "@tanstack/react-router";

/** Diagnostics for the news desk (no secrets). Optional ?refresh=1 runs loadNews first. */
export const Route = createFileRoute("/desk-health.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const eng = await import("@/lib/news-engine");
        const before = eng.deskHealth();
        let after = null;
        if (new URL(request.url).searchParams.get("refresh") === "1") {
          const t0 = Date.now();
          const p = await eng.loadNews();
          after = { ms: Date.now() - t0, origin: p.origin, fetchedAt: p.fetchedAt, stories: p.stories.length, health: eng.deskHealth() };
        }
        return new Response(JSON.stringify({ before, after }, null, 2), {
          headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" },
        });
      },
    },
  },
});
