import { createFileRoute } from "@tanstack/react-router";
import { LEDGER, publicRecord, statusCounts } from "@/lib/ledger";
import { SITE } from "@/lib/site";

/** The Open Desk Ledger as open data: every record with its current status and full history. */
export const Route = createFileRoute("/api/ledger.json")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          {
            version: 1,
            name: SITE.openDesk.ledger.en,
            publisher: SITE.name,
            protocol: `https://${SITE.domain}/standards`,
            protocolVersion: SITE.openDesk.protocolVersion,
            generatedAt: new Date().toISOString(),
            counts: statusCounts(LEDGER),
            records: LEDGER.map(publicRecord),
          },
          { headers: { "cache-control": "public, max-age=300", "access-control-allow-origin": "*", "x-robots-tag": "noindex" } },
        ),
    },
  },
});
