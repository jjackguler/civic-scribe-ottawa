import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

/**
 * /subscribe: a link we can share (LinkedIn, social bios) that doesn't show our
 * newsletter provider. 302 to the provider's subscribe page, passing the query
 * string (utm_source, utm_medium, utm_campaign …) through unchanged so the
 * provider records where the subscriber came from.
 */
export const Route = createFileRoute("/subscribe")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const target = new URL(
          "/subscribe",
          SITE.newsletter.url || "https://aibroadsheet.beehiiv.com",
        );
        target.search = new URL(request.url).search;
        return new Response(null, {
          status: 302,
          headers: { location: target.toString(), "cache-control": "no-store" },
        });
      },
    },
  },
});
