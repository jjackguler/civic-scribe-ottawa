import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/subscribe — The Canadian AI Brief sign-up.
 * Validates the address and the explicit consent, then forwards the record
 * (consent text, version, time, page) to SUBSCRIBE_WEBHOOK_URL. Stores nothing
 * and never logs the address. 503 while the webhook is not configured, so the
 * page can say sign-ups open soon and offer an email fallback.
 */
export const Route = createFileRoute("/api/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { allow, clientKey, forward, json } = await import("@/lib/forms.server");
        const { parseSubscribe, subscribePayload } = await import("@/lib/forms");
        if (!(request.headers.get("content-type") ?? "").includes("application/json"))
          return json(415, { ok: false, error: "bad" });
        const raw = await request.text();
        if (raw.length > 4000) return json(413, { ok: false, error: "bad" });
        let body: unknown;
        try {
          body = JSON.parse(raw);
        } catch {
          return json(400, { ok: false, error: "bad" });
        }
        const parsed = parseSubscribe(body);
        // A bot that filled the hidden field gets a quiet "ok" and nothing is sent.
        if (!parsed.ok && parsed.error === "bot") return json(200, { ok: true });
        if (!parsed.ok) return json(400, { ok: false, error: parsed.error });
        if (!allow(await clientKey(request, "subscribe"), 5, 10 * 60_000))
          return json(429, { ok: false, error: "rate" });
        const result = await forward("SUBSCRIBE_WEBHOOK_URL", subscribePayload(parsed.value));
        if (result === "unconfigured") return json(503, { ok: false, error: "closed" });
        if (result === "failed") return json(502, { ok: false, error: "upstream" });
        return json(200, { ok: true });
      },
    },
  },
});
