import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/public/weather-alerts
 *
 * Real Environment Canada weather warnings for Ottawa-Carleton.
 * Same pattern as /api/public/news-feeds: in-memory cache, 10 min TTL,
 * stale-cache-on-failure. Free, official, no API key.
 */

type WeatherAlertItem = {
  id: string;
  title: string;
  summary: string;
  link: string;
  severity: "warning" | "watch" | "advisory" | "ended" | "info";
  updatedAt: string;
};

type Payload = { items: WeatherAlertItem[]; ok: boolean; error?: string };
type CacheEntry = { ts: number; payload: Payload };

const g = globalThis as unknown as { __ottWeather?: CacheEntry };
const TTL_MS = 10 * 60 * 1000;
const UA = "Mozilla/5.0 (compatible; OttawaCivicLedger/1.0; +civic-news)";

// English feed for Ottawa (on-118). French: meteo.gc.ca/rss/warning/on-118_f.xml
const FEED_URL = "https://weather.gc.ca/rss/warning/on-118_e.xml";

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

function severityOf(title: string): WeatherAlertItem["severity"] {
  const t = title.toLowerCase();
  if (t.includes("ended") || t.includes("no watches or warnings")) return "ended";
  if (t.includes("warning")) return "warning";
  if (t.includes("watch")) return "watch";
  if (t.includes("advisory") || t.includes("statement")) return "advisory";
  return "info";
}

function parse(xml: string): WeatherAlertItem[] {
  const blocks = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const out: WeatherAlertItem[] = [];
  for (const b of blocks) {
    const title = tag(b, "title");
    if (!title) continue;
    // Skip the routine "no watches or warnings in effect" placeholder entry.
    if (/no watches or warnings/i.test(title)) continue;
    const hrefMatch = b.match(/<link[^>]*href=["']([^"']+)["']/i);
    const updated = tag(b, "updated") || tag(b, "published");
    out.push({
      id: hrefMatch?.[1] ?? title,
      title,
      summary: tag(b, "summary").slice(0, 280),
      link: hrefMatch?.[1] ?? "https://weather.gc.ca/city/pages/on-118_metric_e.html",
      severity: severityOf(title),
      updatedAt: updated ? new Date(updated).toISOString() : new Date().toISOString(),
    });
  }
  return out.slice(0, 15);
}

async function fetchAlerts(): Promise<Payload> {
  const res = await fetch(FEED_URL, { headers: { "User-Agent": UA, Accept: "application/atom+xml, application/xml, text/xml, */*" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  if (!/<feed[\s>]/i.test(xml)) throw new Error("Not an Atom feed (blocked or HTML response)");
  return { items: parse(xml), ok: true };
}

export const Route = createFileRoute("/api/public/weather-alerts")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();
        const cached = g.__ottWeather;
        if (cached && now - cached.ts < TTL_MS) {
          return Response.json({ cached: true, fetchedAt: new Date(cached.ts).toISOString(), ...cached.payload });
        }
        try {
          const payload = await fetchAlerts();
          g.__ottWeather = { ts: now, payload };
          return Response.json({ cached: false, fetchedAt: new Date(now).toISOString(), ...payload });
        } catch (e: any) {
          console.error(`[weather-alerts] failed: ${e?.message ?? e}`);
          if (cached) {
            return Response.json({ cached: true, stale: true, fetchedAt: new Date(cached.ts).toISOString(), ...cached.payload, error: "Upstream unavailable, served cache." });
          }
          // Return 200 with ok:false — an upstream outage is not an app error,
          // and a 5xx here trips the global error overlay / blank screen.
          return Response.json({ ok: false, items: [], error: String(e?.message ?? e) });
        }
      },
    },
  },
});
