import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { browserSpeechAvailable, speak, stopSpeaking, type SpeechHandle } from "@/lib/keeper-voice";
import { readRate } from "@/lib/keeper";

const BLOCKS = "h1, h2, h3, h4, p, li, blockquote, figcaption, dt, dd";

/** Visible, readable text blocks inside the target, in reading order. */
function collectBlocks(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(BLOCKS)).filter(el => {
    if (el.closest("nav, footer, [aria-hidden='true'], [data-read-skip], .sr-only, button, form, [role='dialog']")) return false;
    // Skip a block whose parent block will already be read (e.g. a <p> inside an <li>).
    if (el.parentElement?.closest(BLOCKS) && root.contains(el.parentElement.closest(BLOCKS))) return false;
    const text = el.innerText?.trim();
    if (!text || text.length < 2) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}

/**
 * "Read this page to me": reads the page's text aloud with the browser voice,
 * outlining the paragraph being read. Any page can use it:
 *
 *   <ReadAloudButton />                    // reads <main>
 *   <ReadAloudButton target="#article" />  // reads one element
 *
 * Mark parts to skip with data-read-skip. Speed follows the reader's
 * setting from /ask. Renders nothing where the browser has no speech voice.
 */
export function ReadAloudButton({ target = "main", className = "", tone = "light" }: { target?: string; className?: string; tone?: "light" | "dark" }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [status, setStatus] = useState("");
  const blocks = useRef<HTMLElement[]>([]);
  const index = useRef(0);
  const handle = useRef<SpeechHandle | null>(null);
  const run = useRef(0);

  useEffect(() => { setReady(browserSpeechAvailable()); }, []);
  useEffect(() => () => { run.current++; handle.current?.stop(); clearMark(); }, []);

  function clearMark() {
    document.querySelectorAll(".keeper-reading").forEach(el => el.classList.remove("keeper-reading"));
  }

  function playFrom(i: number) {
    const myRun = ++run.current;
    const list = blocks.current;
    const step = (k: number) => {
      if (run.current !== myRun) return;
      if (k >= list.length) { clearMark(); setState("idle"); setStatus(fr ? "Lecture terminée." : "Finished reading."); index.current = 0; return; }
      index.current = k;
      const el = list[k];
      clearMark();
      el.classList.add("keeper-reading");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      handle.current = speak(el.innerText, { locale, rate: readRate() });
      void handle.current.done.then(() => { if (run.current === myRun) step(k + 1); });
    };
    setState("playing");
    step(i);
  }

  function start() {
    const root = document.querySelector(target);
    if (!root) return;
    blocks.current = collectBlocks(root);
    if (!blocks.current.length) { setStatus(fr ? "Rien à lire sur cette page." : "There's nothing to read on this page."); return; }
    setStatus(fr ? `Lecture de la page : ${blocks.current.length} passages.` : `Reading the page: ${blocks.current.length} passages.`);
    playFrom(0);
  }
  function pause() { run.current++; handle.current?.stop(); setState("paused"); setStatus(fr ? "En pause." : "Paused."); }
  function resume() { setStatus(fr ? "Reprise de la lecture." : "Reading again."); playFrom(index.current); }
  function stop() { run.current++; stopSpeaking(); clearMark(); index.current = 0; setState("idle"); setStatus(fr ? "Lecture arrêtée." : "Stopped reading."); }

  if (!ready) return null;
  const dark = tone === "dark";
  const base = `press inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[5px] font-semibold text-[0.95rem] border-2 ${dark ? "border-white/70 text-white hover:bg-white/10" : "border-ink text-ink hover:bg-ice"}`;
  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`} data-read-skip>
      {state === "idle" && (
        <button type="button" className={base} onClick={start}>
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          {fr ? "Lisez-moi cette page" : "Read this page to me"}
        </button>
      )}
      {state === "playing" && (
        <button type="button" className={base} onClick={pause}>
          <Pause className="w-4 h-4" aria-hidden="true" />
          {fr ? "Pause" : "Pause"}
        </button>
      )}
      {state === "paused" && (
        <button type="button" className={base} onClick={resume}>
          <Play className="w-4 h-4" aria-hidden="true" />
          {fr ? "Reprendre" : "Resume"}
        </button>
      )}
      {state !== "idle" && (
        <button type="button" className={base} onClick={stop}>
          <Square className="w-4 h-4" aria-hidden="true" />
          {fr ? "Arrêter" : "Stop"}
        </button>
      )}
      <span className="sr-only" role="status">{status}</span>
    </div>
  );
}
