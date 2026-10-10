import { createFileRoute } from "@tanstack/react-router";

/**
 * The dispatches this Worker desk has written, in full, for the archiver
 * (.github/workflows/archive.yml), which keeps them on the `archive` branch
 * so their URLs never break. Public data: the same text as the pages.
 */
export const Route = createFileRoute("/api/dispatches.json")({
  server: {
    handlers: {
      GET: async () => {
        const { liveDispatches } = await import("@/lib/dispatch.server");
        const items = await liveDispatches().catch(() => []);
        return new Response(JSON.stringify({ at: new Date().toISOString(), items }), {
          headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=120", "x-robots-tag": "noindex" },
        });
      },
    },
  },
});
