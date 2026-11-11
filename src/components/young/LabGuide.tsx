import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Square, Volume2 } from "lucide-react";
import { useT } from "@/components/YoungLab";

/**
 * Bit, the Young Lab guide: a code-drawn character with a speech bubble that can
 * read itself aloud. The voice is the browser's own speech engine
 * (speechSynthesis). Only our fixed lines are spoken; nothing a young person types
 * is ever read or sent. If the browser has no speech engine the button is hidden.
 */
export const GUIDE_NAME = "Bit";

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

/** The guide itself: a friendly lab bot drawn in SVG. */
export function GuideBot({ talking = false, mood = "happy", size = 120 }: { talking?: boolean; mood?: "happy" | "wow" | "think"; size?: number }) {
  return (
    <svg viewBox="0 0 120 130" width={size} height={size * 130 / 120} className={`yl-bot ${talking ? "is-talking" : ""}`} aria-hidden="true">
      <g className="yl-bot-body" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        {/* antenna */}
        <path d="M60 22 V8" fill="none" />
        <circle className="yl-bot-light" cx="60" cy="7" r="6" fill="var(--yl-coral)" />
        {/* head */}
        <rect x="16" y="22" width="88" height="70" rx="26" fill="var(--yl-sky)" />
        {/* ears */}
        <rect x="6" y="46" width="12" height="22" rx="6" fill="var(--yl-sun)" />
        <rect x="102" y="46" width="12" height="22" rx="6" fill="var(--yl-sun)" />
        {/* face plate */}
        <rect x="28" y="34" width="64" height="46" rx="18" fill="#fff" />
        {/* eyes */}
        <g className="yl-bot-eyes" fill="var(--ink)" stroke="none">
          {mood === "wow" ? (
            <><circle cx="47" cy="53" r="7" /><circle cx="73" cy="53" r="7" /></>
          ) : mood === "think" ? (
            <><rect x="40" y="51" width="14" height="5" rx="2.5" /><circle cx="73" cy="53" r="6" /></>
          ) : (
            <><circle cx="47" cy="53" r="6" /><circle cx="73" cy="53" r="6" /></>
          )}
        </g>
        {/* mouth */}
        {talking ? (
          <ellipse className="yl-bot-mouth" cx="60" cy="69" rx="9" ry="5" fill="var(--yl-coral)" />
        ) : mood === "wow" ? (
          <circle cx="60" cy="70" r="5" fill="var(--yl-coral)" />
        ) : (
          <path d="M49 67 Q60 76 71 67" fill="none" />
        )}
        {/* body */}
        <rect x="34" y="96" width="52" height="30" rx="12" fill="var(--yl-mint)" />
        <circle cx="60" cy="111" r="6" fill="var(--yl-sun)" />
      </g>
    </svg>
  );
}

/**
 * The guide with a speech bubble. `say` is the plain text read aloud; `children`
 * is what is shown (it can hold formatting). When `say` changes, the bubble pops in again.
 */
export function LabGuide({ say, children, mood = "happy", tone = "bg-white", compact = false }: { say: string; children?: ReactNode; mood?: "happy" | "wow" | "think"; tone?: string; compact?: boolean }) {
  const { t } = useT();
  const { supported, speaking, speak, stop } = useNarrator();
  useEffect(() => { stop(); }, [say, stop]);
  return (
    <div className={`yl-guide ${compact ? "is-compact" : ""}`}>
      <div className="yl-guide-bot shrink-0">
        <GuideBot talking={speaking} mood={mood} size={compact ? 76 : 110} />
      </div>
      <div key={say} className={`yl-bubble yl-pop ${tone}`}>
        <p className="font-extrabold text-[0.95rem]">{GUIDE_NAME}</p>
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
