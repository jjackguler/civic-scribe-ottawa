import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ADSENSE_CLIENT, adsAllowed } from "@/lib/ads";

type ConsentWindow = Window & {
  adsbygoogle?: unknown[] & { pauseAdRequests?: number };
  googlefc?: {
    callbackQueue: Record<string, () => void>[];
    showRevocationMessage?: () => void;
  };
};

/** CMP review mode. Never resumes ad requests, even after consent. */
export default function GoogleConsent() {
  const path = useRouterState({ select: state => state.location.pathname });
  const [ready, setReady] = useState(false);
  const eligible = adsAllowed(path) && !/^\/(?:fr\/)?app(?:\/|$)/.test(path);
  useEffect(() => {
    // Keep previews and the separate PWA out of the newspaper's CMP/advertising setup.
    if (!eligible || window.location.hostname !== "aibroadsheet.com") return;
    const w = window as ConsentWindow;
    w.adsbygoogle ||= [];
    // Set synchronously BEFORE loading Google's tag. No code sets this back to zero.
    w.adsbygoogle.pauseAdRequests = 1;
    w.googlefc ||= { callbackQueue: [] };
    let active = true;
    w.googlefc.callbackQueue.push({ CONSENT_API_READY: () => { if (active) setReady(true); } });
    if (!document.getElementById("google-cmp-review")) {
      const script = document.createElement("script");
      script.id = "google-cmp-review";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.appendChild(script);
    }
    return () => { active = false; };
  }, [eligible]);

  if (!eligible || !ready) return null;
  return <button type="button" className="fixed bottom-3 left-3 z-40 rounded border border-ink/20 bg-paper px-3 py-2 text-xs text-ink shadow-sm" onClick={() => {
    const fc = (window as ConsentWindow).googlefc;
    fc?.callbackQueue.push({ CONSENT_API_READY: () => fc.showRevocationMessage?.() });
  }}>{path.startsWith("/fr") ? "Choix de confidentialité" : "Privacy choices"}</button>;
}
