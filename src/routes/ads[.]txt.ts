import { createFileRoute } from "@tanstack/react-router";
import { adsTxt } from "@/lib/ads";

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: () => new Response(adsTxt(), {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=300",
        },
      }),
    },
  },
});
