import { useEffect, useState } from "react";
import type { MapSignal } from "@/types/database";

export type RawTrafficEvent = {
  id: string;
  type: string;
  title: string;
  description?: string;
  location?: string;
  severity?: string;
  lat?: number;
  lng?: number;
  startTime?: string;
  updated?: string;
};

type State = {
  mapped: MapSignal[];
  unmapped: RawTrafficEvent[];
  live: boolean;
  loading: boolean;
  error: string | null;
};

function urgency(sev?: string): MapSignal["urgency"] {
  const s = String(sev ?? "").toLowerCase();
  if (s.includes("high") || s.includes("major")) return "critical";
  if (s.includes("medium") || s.includes("moderate")) return "high";
  return "medium";
}

function toSignal(e: RawTrafficEvent): MapSignal {
  const now = new Date().toISOString();
  return {
    id: `ott-traffic-${e.id}`,
    type: "traffic",
    title: e.title,
    summary: e.description ?? (typeof e.location === "string" ? e.location : "City of Ottawa traffic event"),
    lat: e.lat as number,
    lng: e.lng as number,
    neighborhood: typeof e.location === "string" ? e.location : "Ottawa",
    urgency: urgency(e.severity),
    verification: "official-source",
    source_type: "official",
    source_name: "City of Ottawa traffic events",
    source_url: "https://traffic.ottawa.ca/",
    created_at: e.startTime ?? now,
    updated_at: e.updated ?? e.startTime ?? now,
    language: "both",
  };
}

/** Consumes the existing /api/public/ottawa-traffic proxy. Client-side only. */
export function useOttawaTraffic(locale: "en" | "fr" = "en", refreshMs = 5 * 60_000): State {
  const [state, setState] = useState<State>({ mapped: [], unmapped: [], live: false, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/public/ottawa-traffic?locale=${locale}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json?.ok) throw new Error(json?.error ?? "Traffic feed unavailable");
        const events: RawTrafficEvent[] = Array.isArray(json.events) ? json.events : [];
        const mapped = events.filter(e => typeof e.lat === "number" && typeof e.lng === "number").map(toSignal);
        const unmapped = events.filter(e => typeof e.lat !== "number" || typeof e.lng !== "number");
        setState({ mapped, unmapped, live: events.length > 0, loading: false, error: null });
      } catch (e: any) {
        if (cancelled) return;
        setState(s => ({ ...s, loading: false, live: false, error: String(e?.message ?? e) }));
      }
    }
    load();
    const i = setInterval(load, refreshMs);
    return () => { cancelled = true; clearInterval(i); };
  }, [locale, refreshMs]);

  return state;
}
