import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

/**
 * DEV ONLY: the social kit on one page (card of the day, every share card,
 * the share bar and the OG images), with sample content. Open
 * /dev/social?fixture=1 under `vite dev`. A 404 in production builds, where
 * the preview module isn't even bundled.
 */
const Preview = import.meta.env.DEV ? lazy(() => import("@/components/SocialPreview")) : null;

export const Route = createFileRoute("/dev/social")({
  validateSearch: (s: Record<string, unknown>): { fixture?: 1 } => (import.meta.env.DEV && String(s.fixture) === "1" ? { fixture: 1 } : {}),
  loader: () => {
    if (!import.meta.env.DEV) throw notFound();
    return null;
  },
  head: () => ({ meta: [{ title: "Social kit (dev) — AI Broadsheet" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (Preview ? <Suspense fallback={null}><Preview /></Suspense> : null),
});
