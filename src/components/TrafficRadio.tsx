import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Volume2, Radio, RefreshCcw, Mic2 } from "lucide-react";
import { TRAFFIC_ALERTS, WEATHER_ALERTS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

function buildScript(locale: "en" | "fr") {
  const time = new Date().toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" });
  const lines: string[] = [];
  if (locale === "fr") {
    lines.push(`Bulletin circulation Ottawa, il est ${time}. Voici votre point de trafic.`);
    TRAFFIC_ALERTS.forEach(a => lines.push(`${a.location} : ${a.title.fr}. Impact ${a.impact}.`));
    WEATHER_ALERTS.forEach(w => lines.push(`Météo — ${w.title.fr} pour ${w.area}. ${w.advice.fr}`));
    lines.push("Conduisez prudemment. Prochain bulletin dans dix minutes.");
  } else {
    lines.push(`Ottawa traffic bulletin, the time is ${time}. Here's your commute update.`);
    TRAFFIC_ALERTS.forEach(a => lines.push(`${a.location}: ${a.title.en}. ${a.impact} impact.`));
    WEATHER_ALERTS.forEach(w => lines.push(`Weather — ${w.title.en} for ${w.area}. ${w.advice.en}`));
    lines.push("Drive safely. Next bulletin in ten minutes.");
  }
  return lines.join(" ");
}

export function TrafficRadio({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const script = useMemo(() => buildScript(locale), [locale, updatedAt]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
  }, [vol, src]);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/public/traffic-radio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, locale }),
      });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("audio")) {
          const blob = await res.blob();
          setSrc(URL.createObjectURL(blob));
        } else {
          setSrc(null);
        }
      }
    } catch {
      // Demo mode: no backend audio available
    } finally {
      setUpdatedAt(new Date());
      setLoading(false);
    }
  }

  function toggle() {
    if (!audioRef.current || !src) {
      setPlaying(p => !p);
      return;
    }
    if (playing) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setPlaying(p => !p);
  }

  const minsAgo = Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 60000));

  return (
    <section className={`bg-ink text-paper ${compact ? "p-4" : "p-5"} relative overflow-hidden`}>
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-civic-red/30 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="h-4 w-4 text-civic-red" />
          <span className="kicker text-civic-red">{t("trafficRadio", locale)}</span>
          {playing && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-paper/80">
              <span className="ticker-dot" /> {t("nowOnAir", locale)}
            </span>
          )}
        </div>
        <h3 className="font-display text-2xl leading-tight">{locale === "fr" ? "Bulletin de circulation d'Ottawa" : "Ottawa traffic bulletin"}</h3>
        <p className="text-paper/70 text-xs mt-1 font-sans italic">{t("voiceStyle", locale)}</p>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={toggle}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-civic-red hover:bg-paper hover:text-civic-red transition-colors"
            aria-label={playing ? "Pause" : t("listenLive", locale)}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 text-paper/70" />
              <input
                type="range" min={0} max={1} step={0.05} value={vol}
                onChange={e => setVol(parseFloat(e.target.value))}
                className="flex-1 accent-civic-red"
                aria-label="Volume"
              />
            </div>
            <div className="text-[11px] text-paper/60 mt-1">
              {t("latestUpdate", locale)} · {minsAgo === 0 ? (locale === "fr" ? "à l'instant" : "just now") : `${minsAgo} ${t("minAgo", locale)}`}
            </div>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold border border-paper/30 hover:border-paper px-2.5 py-1.5 disabled:opacity-50"
          >
            <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> {t("generateScript", locale)}
          </button>
        </div>

        {!compact && (
          <details className="mt-4 group">
            <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-paper/70 hover:text-paper inline-flex items-center gap-1.5">
              <Mic2 className="h-3 w-3" /> {locale === "fr" ? "Voir le script du bulletin" : "View bulletin script"}
            </summary>
            <p className="font-serif text-sm text-paper/85 mt-2 leading-relaxed border-l-2 border-civic-red pl-3">{script}</p>
          </details>
        )}

        {src && <audio ref={audioRef} src={src} preload="none" onEnded={() => setPlaying(false)} />}
      </div>
    </section>
  );
}
