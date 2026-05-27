import { useEffect, useMemo, useState } from "react";
import { Play, Square, Volume2, Radio, RefreshCcw, Mic2, FileText, ListChecks } from "lucide-react";
import { TRAFFIC_ALERTS, WEATHER_ALERTS } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

type SourceRef = { id: string; kind: "traffic" | "weather"; label: string; origin: string };

function buildBulletin(locale: "en" | "fr") {
  const time = new Date().toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" });
  const lines: string[] = [];
  const sources: SourceRef[] = [];

  if (locale === "fr") {
    lines.push(`Bulletin circulation Ottawa, il est ${time}. Voici votre point de trafic.`);
    TRAFFIC_ALERTS.forEach(a => {
      lines.push(`${a.location} : ${a.title.fr}. Impact ${a.impact}.`);
      sources.push({ id: a.id, kind: "traffic", label: `${a.location} — ${a.title.fr}`, origin: "Ville d'Ottawa / 511 Ontario (démo)" });
    });
    WEATHER_ALERTS.forEach(w => {
      lines.push(`Météo — ${w.title.fr} pour ${w.area}. ${w.advice.fr}`);
      sources.push({ id: w.id, kind: "weather", label: `${w.area} — ${w.title.fr}`, origin: "Environnement Canada (démo)" });
    });
    lines.push("Conduisez prudemment. Prochain bulletin dans dix minutes.");
  } else {
    lines.push(`Ottawa traffic bulletin, the time is ${time}. Here's your commute update.`);
    TRAFFIC_ALERTS.forEach(a => {
      lines.push(`${a.location}: ${a.title.en}. ${a.impact} impact.`);
      sources.push({ id: a.id, kind: "traffic", label: `${a.location} — ${a.title.en}`, origin: "City of Ottawa / 511 Ontario (demo)" });
    });
    WEATHER_ALERTS.forEach(w => {
      lines.push(`Weather — ${w.title.en} for ${w.area}. ${w.advice.en}`);
      sources.push({ id: w.id, kind: "weather", label: `${w.area} — ${w.title.en}`, origin: "Environment Canada (demo)" });
    });
    lines.push("Drive safely. Next bulletin in ten minutes.");
  }
  return { script: lines.join(" "), lines, sources };
}

export function TrafficRadio({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.8);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const { script, lines, sources } = useMemo(() => buildBulletin(locale), [locale, updatedAt]);

  useEffect(() => {
    setUpdatedAt(new Date());
    setSpeechAvailable(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak() {
    if (!speechAvailable) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(script);
    utter.lang = locale === "fr" ? "fr-CA" : "en-CA";
    utter.rate = 0.98;
    utter.pitch = 1;
    utter.volume = vol;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang?.toLowerCase().startsWith(utter.lang.toLowerCase()))
      ?? voices.find(v => v.lang?.toLowerCase().startsWith(locale));
    if (match) utter.voice = match;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  }

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }

  function regenerate() {
    stop();
    setUpdatedAt(new Date());
  }

  const minsAgo = updatedAt ? Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 60000)) : 0;

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
        <p className="text-paper/70 text-xs mt-1 font-sans italic">
          {locale === "fr"
            ? "Démo générée localement avec la synthèse vocale de votre navigateur. Aucun service vocal payant n'est utilisé."
            : "Demo generated locally using your browser's built-in speech synthesis. No paid voice service is in use."}
        </p>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={playing ? stop : speak}
            disabled={!speechAvailable}
            className="inline-flex items-center gap-2 bg-civic-red hover:bg-paper hover:text-civic-red transition-colors px-3 h-11 text-sm font-semibold uppercase tracking-wider disabled:opacity-40"
            aria-label={playing ? "Stop" : (locale === "fr" ? "Générer le bulletin démo" : "Generate demo bulletin")}
          >
            {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing
              ? (locale === "fr" ? "Arrêter" : "Stop")
              : (locale === "fr" ? "Générer le bulletin démo" : "Generate demo bulletin")}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Volume2 className="h-3.5 w-3.5 text-paper/70" />
            <input
              type="range" min={0} max={1} step={0.05} value={vol}
              onChange={e => setVol(parseFloat(e.target.value))}
              className="flex-1 accent-civic-red"
              aria-label="Volume"
            />
          </div>
          <button
            onClick={regenerate}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold border border-paper/30 hover:border-paper px-2.5 py-1.5"
          >
            <RefreshCcw className="h-3 w-3" /> {locale === "fr" ? "Régénérer le script" : "Regenerate script"}
          </button>
        </div>

        <div className="text-[11px] text-paper/60 mt-2">
          {t("latestUpdate", locale)} · {minsAgo === 0 ? (locale === "fr" ? "à l'instant" : "just now") : `${minsAgo} ${t("minAgo", locale)}`}
          {!speechAvailable && (
            <span className="ml-2 text-civic-red">
              {locale === "fr" ? "· Synthèse vocale indisponible dans ce navigateur" : "· Speech synthesis unavailable in this browser"}
            </span>
          )}
        </div>

        {!compact && (
          <div className="mt-5 grid md:grid-cols-2 gap-4">
            <div className="border border-paper/15 p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-paper/70 mb-2">
                <FileText className="h-3 w-3" /> {locale === "fr" ? "Script du bulletin" : "Bulletin script"}
              </div>
              <ol className="font-serif text-sm text-paper/90 leading-relaxed space-y-1.5 list-decimal pl-4">
                {lines.map((l, i) => <li key={i}>{l}</li>)}
              </ol>
            </div>
            <div className="border border-paper/15 p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-paper/70 mb-2">
                <ListChecks className="h-3 w-3" /> {locale === "fr" ? "Sources utilisées" : "Sources used"}
                <span className="ml-auto text-paper/50">{sources.length}</span>
              </div>
              <ul className="text-xs text-paper/85 space-y-1.5">
                {sources.map(s => (
                  <li key={`${s.kind}-${s.id}`} className="flex gap-2">
                    <span className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${s.kind === "traffic" ? "bg-civic-red" : "bg-amber-400"}`} aria-hidden />
                    <span>
                      <span className="block font-semibold">{s.label}</span>
                      <span className="block text-paper/55 text-[11px]">{s.origin}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-paper/45 mt-3 italic">
                {locale === "fr"
                  ? "Fixtures de démonstration. Les flux 311 / 511 / Environnement Canada se branchent ici lorsqu'activés dans /admin/sources."
                  : "Demo fixtures. Live 311 / 511 / Environment Canada feeds plug in here when enabled in /admin/sources."}
              </p>
            </div>
          </div>
        )}

        {compact && (
          <details className="mt-4 group">
            <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-paper/70 hover:text-paper inline-flex items-center gap-1.5">
              <Mic2 className="h-3 w-3" /> {locale === "fr" ? "Voir le script du bulletin" : "View bulletin script"}
            </summary>
            <p className="font-serif text-sm text-paper/85 mt-2 leading-relaxed border-l-2 border-civic-red pl-3">{script}</p>
          </details>
        )}
      </div>
    </section>
  );
}
