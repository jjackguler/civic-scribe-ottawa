import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/tip — "Pitch a story / send a tip".
 * Validates and forwards the message to TIP_WEBHOOK_URL. Stores nothing and
 * never logs the message or the contact. 503 while the webhook is not set,
 * so the page offers the editor's email instead.
 */
export const Route = createFileRoute("/api/tip")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { allow, clientKey, forward, json } = await import("@/lib/forms.server");
        const { parseTip, tipPayload } = await import("@/lib/forms");
        if (!(request.headers.get("content-type") ?? "").includes("application/json"))
          return json(415, { ok: false, error: "bad" });
        const raw = await request.text();
        if (raw.length > 12000) return json(413, { ok: false, error: "bad" });
        let body: unknown;
        try {
          body = JSON.parse(raw);
        } catch {
          return json(400, { ok: false, error: "bad" });
        }
        const parsed = parseTip(body);
        if (!parsed.ok && parsed.error === "bot") return json(200, { ok: true });
        if (!parsed.ok) return json(400, { ok: false, error: parsed.error });
        if (!allow(await clientKey(request, "tip"), 4, 30 * 60_000))
          return json(429, { ok: false, error: "rate" });
        const result = await forward("TIP_WEBHOOK_URL", tipPayload(parsed.value));
        if (result === "unconfigured") return json(503, { ok: false, error: "closed" });
        if (result === "failed") return json(502, { ok: false, error: "upstream" });
        return json(200, { ok: true });
      },
    },
  },
});
