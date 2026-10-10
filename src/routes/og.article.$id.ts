import { createFileRoute } from "@tanstack/react-router";

/** Share image (1200×630 PNG) for a dispatch: /og/article/<id>.png?lang=fr&v=… See src/lib/og/url.ts. */
export const Route = createFileRoute("/og/article/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => (await import("@/lib/og/og.server")).ogArticle(request, params.id),
      HEAD: async ({ request, params }) => (await import("@/lib/og/og.server")).ogArticle(request, params.id),
    },
  },
});
