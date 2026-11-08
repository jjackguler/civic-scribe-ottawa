import { createFileRoute } from "@tanstack/react-router";
import { LEDGER, NOT_IN_LEDGER, publicRecord, statusCounts } from "@/lib/ledger";
import { SITE } from "@/lib/site";

/** The Open Desk Ledger as open data: every record with its current result, stage, reply state and full history. */
export const Route = createFileRoute("/api/ledger.json")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          {
            version: 2,
            name: SITE.openDesk.ledger.en,
            publisher: SITE.name,
            protocol: `https://${SITE.domain}/standards`,
            protocolVersion: SITE.openDesk.protocolVersion,
            generatedAt: new Date().toISOString(),
            notInLedger: NOT_IN_LEDGER.en,
            counts: statusCounts(LEDGER),
            records: LEDGER.map(publicRecord),
          },
          { headers: { "cache-control": "public, max-age=300", "access-control-allow-origin": "*", "x-robots-tag": "noindex" } },
        ),
    },
  },
});
