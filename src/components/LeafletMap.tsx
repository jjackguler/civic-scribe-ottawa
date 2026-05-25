import { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MessageCircle, AlertCircle, Car, Train, CloudRain, Coffee, Trophy,
  Calendar, Shield, Heart, Search, AlertTriangle, CheckCircle, ExternalLink,
} from "lucide-react";
import type { MapSignal, SignalType } from "@/types/database";

export const SIGNAL_STYLES: Record<SignalType, { Icon: any; color: string; label: string }> = {
  "citizen-report":  { Icon: MessageCircle,  color: "#3A7D44", label: "Citizen report" },
  "breaking-news":   { Icon: AlertCircle,    color: "#C8102E", label: "Breaking news" },
  "traffic":         { Icon: Car,            color: "#E8A317", label: "Traffic" },
  "transit":         { Icon: Train,          color: "#1E5F8E", label: "Transit" },
  "weather-alert":   { Icon: CloudRain,      color: "#1E5F8E", label: "Weather" },
  "food":            { Icon: Coffee,         color: "#B87333", label: "Food & drink" },
  "sports":          { Icon: Trophy,         color: "#1E5F8E", label: "Sports" },
  "event":           { Icon: Calendar,       color: "#B87333", label: "Event" },
  "public-safety":   { Icon: Shield,         color: "#A0202C", label: "Public safety" },
  "good-news":       { Icon: Heart,          color: "#3A7D44", label: "Good news" },
  "fact-check":      { Icon: Search,         color: "#0F1419", label: "Fact check" },
  "unresolved":     { Icon: AlertTriangle,  color: "#E8A317", label: "Unresolved" },
  "solved":          { Icon: CheckCircle,    color: "#3A7D44", label: "Solved" },
};

function makeDivIcon(type: SignalType, urgent: boolean) {
  const { Icon, color } = SIGNAL_STYLES[type];
  const svg = renderToStaticMarkup(<Icon size={18} color="#fff" strokeWidth={2.4} />);
  const pulse = urgent
    ? `<span style="position:absolute;inset:-6px;border-radius:9999px;background:${color};opacity:.35;animation:civic-pulse 1.8s ease-out infinite;"></span>`
    : "";
  const html = `
    <div class="civic-marker" style="position:relative;width:36px;height:36px;">
      ${pulse}
      <div style="position:relative;width:36px;height:36px;border-radius:9999px;background:${color};opacity:.95;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.18);transition:transform .15s ease;">
        ${svg}
      </div>
    </div>`;
  return L.divIcon({
    html, className: "civic-divicon",
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -16],
  });
}

const clusterIconCreate = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 32 : count < 50 ? 40 : 48;
  const bg = count < 10 ? "#0F1419" : count < 50 ? "#C8102E" : "#B87333";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:#fff;font-family:Inter,sans-serif;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25);">${count}</div>`,
    className: "civic-cluster", iconSize: [size, size],
  });
};

function ViewportTracker({ onBounds }: { onBounds: (b: L.LatLngBounds) => void }) {
  const map = useMap();
  const timer = useRef<any>(null);
  useEffect(() => { onBounds(map.getBounds()); }, []); // eslint-disable-line
  useMapEvents({
    moveend: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onBounds(map.getBounds()), 200);
    },
  });
  return null;
}

interface Props {
  signals: MapSignal[];
  height?: string;
  dark?: boolean;
  showLiveBadge?: boolean;
  compact?: boolean;
}

export function LeafletMap({ signals, height = "500px", dark = false, showLiveBadge = true, compact = false }: Props) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  const visible = useMemo(() => {
    if (!bounds) return signals.slice(0, 60);
    const padded = bounds.pad(0.1);
    return signals.filter(s => padded.contains([s.lat, s.lng] as any));
  }, [signals, bounds]);

  const tileUrl = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="relative w-full border border-rule overflow-hidden bg-paper" style={{ height }}>
      <MapContainer
        center={[45.4215, -75.6972]}
        zoom={compact ? 11 : 12}
        scrollWheelZoom={!compact}
        style={{ height: "100%", width: "100%", background: dark ? "#0f1419" : "#f5f3ee" }}
        attributionControl={true}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains={["a", "b", "c", "d"]}
        />
        <ViewportTracker onBounds={setBounds} />
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={compact ? 40 : 60}
          iconCreateFunction={clusterIconCreate}
          showCoverageOnHover={true}
        >
          {visible.map(s => {
            const urgent = s.urgency === "critical" || s.urgency === "high";
            return (
              <Marker key={s.id} position={[s.lat, s.lng]} icon={makeDivIcon(s.type, urgent)}>
                <Popup>
                  <div style={{ minWidth: 220, fontFamily: "Inter, sans-serif" }}>
                    <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: SIGNAL_STYLES[s.type].color, fontWeight: 700 }}>
                      {SIGNAL_STYLES[s.type].label} · {s.neighborhood}
                    </div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.25, margin: "6px 0", color: "#0F1419" }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.4 }}>{s.summary}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                      <span style={{ background: "#f0ece4", padding: "2px 6px" }}>{s.verification}</span>
                      {s.source_name && <span style={{ color: "#777" }}>· {s.source_name}</span>}
                    </div>
                    {s.source_url && (
                      <a href={s.source_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11, color: "#C8102E", fontWeight: 600 }}>
                        Source <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {showLiveBadge && (
        <div className="absolute top-3 left-3 z-[400] bg-paper border border-ink px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 shadow">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-civic-red animate-pulse" />
          Prototype · Mock live data
        </div>
      )}
    </div>
  );
}
