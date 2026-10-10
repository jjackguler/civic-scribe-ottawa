import { createFileRoute } from "@tanstack/react-router";

/** Share image (1200×630 PNG) for the daily quiz: /og/quiz.png?d=YYYY-MM-DD&lang=fr&v=… See src/lib/og/url.ts. */
export const Route = createFileRoute("/og/quiz.png")({
  server: {
    handlers: {
      GET: async ({ request }) => (await import("@/lib/og/og.server")).ogQuiz(request),
      HEAD: async ({ request }) => (await import("@/lib/og/og.server")).ogQuiz(request),
    },
  },
});
