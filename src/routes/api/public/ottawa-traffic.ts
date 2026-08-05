import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/public/ottawa-traffic
 *
 * Proxies the City of Ottawa traffic events feed and caches it in-memory for ~5 min.
 * (Worker instances are short-lived, but this still prevents per-request hammering.)
 *
 * Upstream: https://traffic.ottawa.ca/map/service/events?accept-language=en
 * Returns: { ok, fetchedAt, count, events: [...] }
 */

type CacheEntry = { ts: number; payload: any };
const g = globalThis as unknown as { __ottTraffic?: CacheEntry };
const TTL_MS = 5 * 60 * 1000;

async function fetchUpstream(locale: "en" | "fr") {
  const lang = locale === "fr" ? "fr" : "en";
  const url = `https://traffic.ottawa.ca/map/service/events?accept-language=${lang}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "OttawaCivicLedger/1.0 (+civic-news)" },
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  // The feed is JSON but the City sometimes serves it as text/plain.
  const text = await res.text();
  let raw: any;
  try { raw = JSON.parse(text); } catch { raw = { events: [] }; }
  const events = Array.isArray(raw?.events) ? raw.events : Array.isArray(raw) ? raw : [];
  // Normalise a small, safe subset.
  const coordsOf = (e: any): { lat?: number; lng?: number } => {
    const raw = e?.geodata?.coordinates ?? e?.coordinates;
    let c: any = raw;
    if (typeof raw === "string") { try { c = JSON.parse(raw); } catch { c = undefined; } }
    if (Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number") {
      // GeoJSON order: [lng, lat]
      return { lng: c[0], lat: c[1] };
    }
    if (Array.isArray(c) && Array.isArray(c[0])) return coordsOf({ geodata: { coordinates: c[0] } });
    if (typeof e.latitude === "number" && typeof e.longitude === "number") return { lat: e.latitude, lng: e.longitude };
    if (typeof e.lat === "number" && typeof e.lng === "number") return { lat: e.lat, lng: e.lng };
    return {};
  };
  const normalised = events
    .map((e: any) => {
      const { lat, lng } = coordsOf(e);
      return {
        id: String(e.id ?? e.eventId ?? e.uuid ?? ""),
        type: String(e.eventType ?? e.type ?? e.category ?? "incident").toLowerCase(),
        title: String(e.headline ?? e.title ?? e.description ?? e.name ?? "Traffic event"),
        description: e.message ? String(e.message).trim() : e.description ? String(e.description) : undefined,
        location: e.headline ?? e.location ?? e.roadwayName ?? e.address ?? undefined,
        severity: String(e.priority ?? e.severity ?? "unknown").toLowerCase(),
        lat, lng,
        startTime: e.schedule?.[0]?.startDateTime ?? e.startTime ?? e.start ?? e.created ?? undefined,
        updated: e.updated ?? e.lastUpdated ?? e.modified ?? undefined,
      };
    })
    .filter((e: any) => e.id)
    .sort((a: any, b: any) => {
      const sev = (x: string) => ({ high: 3, major: 3, medium: 2, moderate: 2, low: 1, minor: 1 } as any)[String(x).toLowerCase()] ?? 0;
      const s = sev(b.severity) - sev(a.severity);
      if (s !== 0) return s;
      return String(b.updated ?? "").localeCompare(String(a.updated ?? ""));
    });
  return { events: normalised };
}

export const Route = createFileRoute("/api/public/ottawa-traffic")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const locale = url.searchParams.get("locale") === "fr" ? "fr" : "en";
        const now = Date.now();
        const cached = g.__ottTraffic;
        if (cached && now - cached.ts < TTL_MS) {
          return Response.json({
            ok: true,
            cached: true,
            fetchedAt: new Date(cached.ts).toISOString(),
            count: cached.payload.events.length,
            events: cached.payload.events,
          });
        }
        try {
          const payload = await fetchUpstream(locale);
          g.__ottTraffic = { ts: now, payload };
          return Response.json({
            ok: true,
            cached: false,
            fetchedAt: new Date(now).toISOString(),
            count: payload.events.length,
            events: payload.events,
          });
        } catch (e: any) {
          // Serve stale cache if upstream fails.
          if (cached) {
            return Response.json({
              ok: true, cached: true, stale: true,
              fetchedAt: new Date(cached.ts).toISOString(),
              count: cached.payload.events.length, events: cached.payload.events,
              error: "Upstream unavailable, served cache.",
            });
          }
          return new Response(
            JSON.stringify({ ok: false, error: String(e?.message ?? "Upstream error"), events: [] }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
