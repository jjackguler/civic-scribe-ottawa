import { createFileRoute } from "@tanstack/react-router";

/** Share image (1200×630 PNG) for a section: /og/section/<name>.png?lang=fr&v=… See src/lib/og/sections.ts. */
export const Route = createFileRoute("/og/section/$name")({
  server: {
    handlers: {
      GET: async ({ request, params }) => (await import("@/lib/og/og.server")).ogSection(request, params.name),
      HEAD: async ({ request, params }) => (await import("@/lib/og/og.server")).ogSection(request, params.name),
    },
  },
});
