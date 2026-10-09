import { createFileRoute } from "@tanstack/react-router";

/** MP3 of a Dispatch read aloud (?lang=en|fr). See src/lib/dispatch-audio.server.ts. */
export const Route = createFileRoute("/api/dispatch-audio/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { dispatchAudio } = await import("@/lib/dispatch-audio.server");
        return dispatchAudio(request, params.id);
      },
    },
  },
});
