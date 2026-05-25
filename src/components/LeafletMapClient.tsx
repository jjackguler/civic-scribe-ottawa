import { lazy, Suspense, useEffect, useState } from "react";
import type { MapSignal } from "@/types/database";

// Lazy-load Leaflet (browser-only) to avoid SSR `window is not defined`
const LeafletMapInner = lazy(() =>
  import("./LeafletMap").then(m => ({ default: m.LeafletMap }))
);

export { SIGNAL_STYLES } from "@/lib/signal-styles";

interface Props {
  signals: MapSignal[];
  height?: string;
  dark?: boolean;
  showLiveBadge?: boolean;
  compact?: boolean;
}

export function LeafletMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const fallback = (
    <div className="w-full border border-rule bg-secondary flex items-center justify-center text-[11px] uppercase tracking-wider text-muted-foreground"
         style={{ height: props.height ?? "500px" }}>
      Loading editorial map…
    </div>
  );
  if (!mounted) return fallback;
  return (
    <Suspense fallback={fallback}>
      <LeafletMapInner {...props} />
    </Suspense>
  );
}
