import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Square, Volume2 } from "lucide-react";
import { useT } from "@/components/YoungLab";

/**
 * The Young Lab note: a calm card of guidance that can read itself aloud. There is
 * deliberately no mascot or robot (owner decision, 15 Nov 2026). The voice is the browser's own speech engine
 * (speechSynthesis). Only our fixed lines are spoken; nothing a young person types
 * is ever read or sent. If the browser has no speech engine the button is hidden.
 */


function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const base = lang.slice(0, 2);
  const same = voices.filter(v => v.lang.replace("_", "-").toLowerCase().startsWith(base));
  return (
    same.find(v => v.localService && v.lang.toLowerCase().includes("ca")) ??
    same.find(v => v.localService) ??
    same.find(v => v.lang.toLowerCase().includes("ca")) ??
    same[0]
  );
}

/** Read fixed lines aloud with the browser's speech engine. */
export function useNarrator() {
  const { fr } = useT();
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => {
      alive.current = false;
      try { window.speechSynthesis?.cancel(); } catch { /* nothing to stop */ }
    };
  }, []);

  const stop = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const lang = fr ? "fr-CA" : "en-CA";
      u.lang = lang;
      const v = pickVoice(lang);
      if (v) u.voice = v;
      u.rate = 0.95;
      u.pitch = 1.1;
      u.onstart = () => alive.current && setSpeaking(true);
      u.onend = () => alive.current && setSpeaking(false);
      u.onerror = () => alive.current && setSpeaking(false);
      synth.speak(u);
    } catch {
      setSpeaking(false);
    }
  }, [fr, supported]);

  return { supported, speaking, speak, stop };
}

/**
 * The guide with a speech bubble. `say` is the plain text read aloud; `children`
 * is what is shown (it can hold formatting). When `say` changes, the bubble pops in again.
 */
export function LabGuide({ say, children, tone = "bg-white", compact = false }: { say: string; children?: ReactNode; mood?: "happy" | "wow" | "think"; tone?: string; compact?: boolean }) {
  const { t } = useT();
  const { supported, speaking, speak, stop } = useNarrator();
  useEffect(() => { stop(); }, [say, stop]);
  return (
    <div className={`yl-guide ${compact ? "is-compact" : ""}`}>
      <div key={say} className={`yl-bubble yl-pop ${tone}`}>
        <p className="yl-kicker">{t("Lab note", "Note du labo")}</p>
        <div className="mt-1 text-[1.08rem] sm:text-[1.15rem] leading-relaxed">{children ?? say}</div>
        {supported && (
          <button type="button" className="yl-chip mt-3 !min-h-[40px] text-[0.95rem]" onClick={() => (speaking ? stop() : speak(say))} aria-pressed={speaking}>
            {speaking ? <Square className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            {speaking ? t("Stop", "Arrêter") : t("Read it to me", "Lis-le-moi")}
          </button>
        )}
      </div>
    </div>
  );
}
