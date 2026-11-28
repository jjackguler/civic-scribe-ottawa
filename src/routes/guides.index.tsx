import { createFileRoute, redirect } from "@tanstack/react-router";

// /guides had no index page and answered 404, but older reports, posts and outside links use it.
// The guides list lives at /learn (the French router keeps the /fr prefix on the redirect).
export const Route = createFileRoute("/guides/")({
  beforeLoad: () => {
    throw redirect({ to: "/learn", statusCode: 301 });
  },
});
