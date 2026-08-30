import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Weather alerts — real Environment Canada data via /api/public/weather-alerts
// ─────────────────────────────────────────────────────────────

export type LiveWeatherAlert = {
  id: string;
  title: string;
  summary: string;
  link: string;
  severity: "warning" | "watch" | "advisory" | "ended" | "info";
  updatedAt: string;
};

type WeatherState = { items: LiveWeatherAlert[]; loading: boolean; error: string | null };

export function useWeatherAlerts(refreshMs = 10 * 60_000): WeatherState {
  const [state, setState] = useState<WeatherState>({ items: [], loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/public/weather-alerts");
        const json = await res.json();
        if (cancelled) return;
        setState({ items: Array.isArray(json.items) ? json.items : [], loading: false, error: json.error ?? null });
      } catch (e: any) {
        if (cancelled) return;
        setState(s => ({ ...s, loading: false, error: String(e?.message ?? e) }));
      }
    }
    load();
    const i = setInterval(load, refreshMs);
    return () => { cancelled = true; clearInterval(i); };
  }, [refreshMs]);
  return state;
}

// ─────────────────────────────────────────────────────────────
// Traffic events — real City of Ottawa data via /api/public/ottawa-traffic
// (same endpoint the map already uses; this just exposes it as a list hook)
// ─────────────────────────────────────────────────────────────

export type LiveTrafficEvent = {
  id: string;
  type: string;
  title: string;
  description?: string;
  location?: string;
  severity: string;
  lat?: number;
  lng?: number;
  startTime?: string;
  updated?: string;
};

type TrafficState = { events: LiveTrafficEvent[]; loading: boolean; error: string | null };

export function useOttawaTrafficEvents(refreshMs = 5 * 60_000): TrafficState {
  const [state, setState] = useState<TrafficState>({ events: [], loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/public/ottawa-traffic");
        const json = await res.json();
        if (cancelled) return;
        setState({ events: Array.isArray(json.events) ? json.events : [], loading: false, error: json.error ?? null });
      } catch (e: any) {
        if (cancelled) return;
        setState(s => ({ ...s, loading: false, error: String(e?.message ?? e) }));
      }
    }
    load();
    const i = setInterval(load, refreshMs);
    return () => { cancelled = true; clearInterval(i); };
  }, [refreshMs]);
  return state;
}
