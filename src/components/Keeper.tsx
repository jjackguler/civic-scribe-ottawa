import { useEffect, useId, useRef, useState, type Ref } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { localePath, stripFr } from "@/lib/seo";
import { KEEPER_NAME, MAX_MESSAGE, STORE, SUGGESTIONS, type AtmosId } from "@/lib/keeper";

/**
 * The Keeper, drawn: a night-shift archivist made of the things a newsroom
 * keeps — a card-catalogue face behind round spectacles, a green eyeshade,
 * a long coat, an open ledger and a brass key. Our own design.
 *
 * Speech level comes in as the CSS variable --k-level (0..1), set directly on
 * the <svg> by whoever is speaking, so talking never re-renders React.
 * `talking="loop"` plays a generic talking cycle when there's no level signal.
 */
export function KeeperFigure({
  talking = false,
  className = "",
  svgRef,
  decorative = false,
  variant = "full",
}: {
  talking?: boolean | "loop";
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
  decorative?: boolean;
  /** "head" crops to the face, for small buttons. */
  variant?: "full" | "head";
}) {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const label = locale === "fr" ? "Le Gardien, un personnage d'archiviste dessiné. C'est une IA." : "The Keeper, an illustrated archivist character. It's an AI.";
  return (
    <svg
      ref={svgRef}
      viewBox={variant === "head" ? "56 34 128 128" : "0 0 240 300"}
      className={`keeper-fig ${talking ? "is-talking" : ""} ${talking === "loop" ? "is-looping" : ""} ${className}`}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    >
      <defs>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--k-glow)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--k-glow)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`coat-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--k-coat)" />
          <stop offset="100%" stopColor="var(--k-coat-2)" />
        </linearGradient>
      </defs>
      {/* Halo: brightens with the voice */}
      <circle className="k-halo" cx="120" cy="96" r="92" fill={`url(#halo-${uid})`} />
      <g className="k-body">
        {/* Coat */}
        <path d="M58 300 C62 230 74 178 120 170 C166 178 178 230 182 300 Z" fill={`url(#coat-${uid})`} />
        <path d="M120 170 L104 214 L120 206 L136 214 Z" fill="var(--k-collar)" />
        <path d="M120 206 L120 300" stroke="var(--k-line)" strokeWidth="1.5" opacity="0.5" />
        {/* Neck */}
        <rect x="111" y="150" width="18" height="24" rx="6" fill="var(--k-face-2)" />
        {/* Key on its chain, worn over the coat */}
        <path d="M112 196 C114 208 117 214 120 216 C123 214 126 208 128 196" fill="none" stroke="var(--k-brass)" strokeWidth="1.4" />
        <g className="k-key">
          <circle cx="120" cy="222" r="5.5" fill="none" stroke="var(--k-brass)" strokeWidth="2.6" />
          <path d="M120 227.5 V238 M120 233 H125 M120 237 H124" stroke="var(--k-brass)" strokeWidth="2.6" strokeLinecap="round" />
        </g>
        {/* Ledger, held open */}
        <g className="k-ledger">
          <path d="M66 246 L118 238 L118 286 L66 292 Z" fill="var(--k-page)" stroke="var(--k-line)" strokeWidth="1.5" />
          <path d="M174 246 L122 238 L122 286 L174 292 Z" fill="var(--k-page)" stroke="var(--k-line)" strokeWidth="1.5" />
          <path d="M74 254 L110 249 M74 262 L110 257 M74 270 L104 266 M130 249 L166 254 M130 257 L166 262 M130 265 L156 269" stroke="var(--k-ink)" strokeWidth="1.6" opacity="0.45" strokeLinecap="round" />
          <path className="k-ribbon" d="M146 286 L146 300 L150 296 L154 300 L154 287" fill="var(--k-accent)" />
          {/* Hands */}
          <ellipse cx="64" cy="270" rx="9" ry="11" fill="var(--k-face-2)" />
          <ellipse cx="176" cy="270" rx="9" ry="11" fill="var(--k-face-2)" />
        </g>
        {/* Head: a catalogue card with rounded corners and a brass rim */}
        <g className="k-head">
          <rect x="70" y="52" width="100" height="104" rx="30" fill="var(--k-face)" stroke="var(--k-brass)" strokeWidth="3" />
          <path d="M84 70 H156" stroke="var(--k-ink)" strokeWidth="1" opacity="0.18" />
          <path d="M84 140 H156" stroke="var(--k-ink)" strokeWidth="1" opacity="0.18" />
          {/* Eyeshade */}
          <path d="M62 66 C80 44 160 44 178 66 L166 76 C146 64 94 64 74 76 Z" fill="var(--k-visor)" opacity="0.92" />
          <path d="M70 58 C96 40 144 40 170 58" fill="none" stroke="var(--k-visor-band)" strokeWidth="5" strokeLinecap="round" />
          {/* Spectacles and eyes */}
          <g fill="none" stroke="var(--k-ink)" strokeWidth="2.6">
            <circle cx="100" cy="102" r="15" />
            <circle cx="140" cy="102" r="15" />
            <path d="M115 101 C118 97 122 97 125 101" />
          </g>
          <g className="k-eyes" fill="var(--k-ink)">
            <circle cx="100" cy="103" r="4.2" />
            <circle cx="140" cy="103" r="4.2" />
          </g>
          {/* Brows lift a little while talking */}
          <g className="k-brows" stroke="var(--k-ink)" strokeWidth="2.6" strokeLinecap="round">
            <path d="M90 82 Q100 78 110 82" />
            <path d="M130 82 Q140 78 150 82" />
          </g>
          {/* Mouth: scales open with the voice */}
          <g className="k-mouth">
            <ellipse cx="120" cy="132" rx="11" ry="6" fill="var(--k-ink)" />
          </g>
          <path className="k-smile" d="M108 130 Q120 138 132 130" fill="none" stroke="var(--k-ink)" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/** Ambient visuals for each atmosphere. Lightweight, decorative, and still under reduced motion. */
export function AmbientLayer({ atmos }: { atmos: AtmosId }) {
  if (atmos === "calm") return null;
  return (
    <div className={`keeper-ambient keeper-ambient--${atmos}`} aria-hidden="true">
      {atmos === "night" && <NightWindows />}
      {atmos === "reading" && <><div className="k-lamp" /><DustMotes /></>}
      {atmos === "studio" && <><div className="k-spot" /><div className="k-scan" /><div className="k-onair"><span />ON AIR</div></>}
    </div>
  );
}

function NightWindows() {
  // A fixed skyline: windows that light and dim slowly, like a newsroom across the street.
  const wins: { x: number; y: number; d: number }[] = [];
  const towers = [[0, 140, 90], [100, 90, 70], [180, 160, 120], [310, 60, 80], [400, 120, 100], [510, 80, 70], [590, 150, 110], [710, 100, 90], [810, 130, 80], [900, 70, 100]];
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (const [x, top, w] of towers) {
    for (let yy = 300 - top + 14; yy < 290; yy += 16) for (let xx = x + 10; xx < x + w - 10; xx += 14) if (rnd() > 0.55) wins.push({ x: xx, y: yy, d: Math.round(rnd() * 12) });
  }
  return (
    <svg className="k-skyline" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice">
      {towers.map(([x, top, w]) => <rect key={x} x={x} y={300 - top} width={w} height={top} fill="var(--k-tower)" />)}
      {wins.map((w, i) => <rect key={i} x={w.x} y={w.y} width="6" height="8" className={i % 3 === 0 ? "k-win k-win--flicker" : "k-win"} style={{ animationDelay: `${w.d}s` }} />)}
    </svg>
  );
}

function DustMotes() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0, w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const motes = Array.from({ length: 28 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6, vx: (Math.random() - 0.5) * 0.00006, vy: -0.00002 - Math.random() * 0.00005, p: Math.random() * 6 }));
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(64, t - last); last = t;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx * dt; m.y += m.vy * dt; m.p += dt / 1400;
        if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
        if (m.x < -0.02) m.x = 1.02; if (m.x > 1.02) m.x = -0.02;
        ctx.globalAlpha = 0.25 + 0.25 * Math.sin(m.p);
        ctx.beginPath(); ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2); ctx.fillStyle = "#8a6a2a"; ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    vis();
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", vis); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="k-motes" />;
}

/**
 * Compact homepage entry point. Sends the reader to /ask with their question,
 * or straight into the guided tour.
 */
export function AskKeeperBand({ className = "" }: { className?: string }) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const inputId = useId();
  const go = (question?: string, tour?: boolean) =>
    navigate({ to: "/ask", search: { q: question?.trim() ? question.trim().slice(0, MAX_MESSAGE) : undefined, tour: tour ? 1 : undefined } });
  return (
    <section className={`keeper-band ${className}`} aria-labelledby={`${inputId}-h`} data-atmos="night">
      <div className="container-mw flex items-start gap-4 sm:gap-8 py-7 md:py-8">
        <KeeperFigure decorative className="w-[72px] sm:w-[110px] md:w-[132px] shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 id={`${inputId}-h`} className="masthead-serif text-[1.7rem] md:text-[2.1rem] leading-tight text-white">{fr ? "Demandez au Gardien" : "Ask the Keeper"}</h2>
          <p className="mt-1 text-white/80 text-[1.02rem] max-w-2xl">
            {fr
              ? "Notre archiviste IA explique l'actualité de l'IA en mots simples et montre ses sources. C'est une IA, pas une personne."
              : "Our AI archivist explains today's AI news in plain words and shows its sources. It's an AI, not a person."}
          </p>
          <form className="mt-4 flex flex-col sm:flex-row gap-2 max-w-2xl" onSubmit={e => { e.preventDefault(); go(q); }}>
            <label htmlFor={inputId} className="sr-only">{fr ? "Votre question pour le Gardien" : "Your question for the Keeper"}</label>
            <input
              id={inputId}
              value={q}
              onChange={e => setQ(e.target.value)}
              maxLength={MAX_MESSAGE}
              placeholder={pick(SUGGESTIONS[0])}
              className="w-full sm:w-auto sm:flex-1 min-w-0 h-12 shrink-0 rounded-[5px] bg-white text-ink px-4 text-[1rem] placeholder:text-muted-ink border-2 border-transparent focus-visible:border-signal focus-visible:outline-none"
            />
            <button type="submit" className="press h-12 px-5 rounded-[5px] bg-signal text-signal-ink font-semibold hover:brightness-95">
              {fr ? "Demander" : "Ask"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.95rem]">
            <button type="button" onClick={() => go(undefined, true)} className="text-signal font-semibold underline underline-offset-4 hover:no-underline min-h-[44px]">
              {fr ? "Faire la visite guidée" : "Take the guided tour"}
            </button>
            <button type="button" onClick={() => go(pick(SUGGESTIONS[1]))} className="text-white/85 underline underline-offset-4 hover:text-white min-h-[44px] text-left">
              {pick(SUGGESTIONS[1])}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Floating "Ask the Keeper" button. Hidden on /ask itself. On phones it's a
 * small round button that tucks away while the reader scrolls down, so it
 * never sits on top of what they're reading, and comes back on scroll up.
 * The reader can hide it for the rest of the visit.
 */
export function KeeperLauncher() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const path = useRouterState({ select: s => stripFr(s.location.pathname) });
  const [hidden, setHidden] = useState(true);
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try { dismissed = window.sessionStorage.getItem(STORE.launcherHidden) === "1"; } catch { /* storage blocked */ }
    setHidden(dismissed);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const nearEnd = window.innerHeight + y > document.documentElement.scrollHeight - 160;
      if (Math.abs(y - lastY) > 12) { setTucked(y > lastY && y > 120 && !nearEnd ? true : nearEnd); lastY = y; }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (hidden || path === "/ask") return null;
  const dismiss = () => {
    try { window.sessionStorage.setItem(STORE.launcherHidden, "1"); } catch { /* storage blocked */ }
    setHidden(true);
  };
  const name = fr ? "Demandez au Gardien" : "Ask the Keeper";
  return (
    <div className={`keeper-launcher ${tucked ? "is-tucked" : ""}`} data-atmos="night">
      <a href={localePath("/ask", locale)} className="keeper-launcher__btn press" aria-label={`${name} (${fr ? "assistant IA" : "AI assistant"})`}>
        <KeeperFigure decorative variant="head" className="keeper-launcher__face" />
        <span className="keeper-launcher__label">{name}</span>
        <span className="keeper-launcher__ai" aria-hidden="true">AI</span>
      </a>
      <button type="button" onClick={dismiss} className="keeper-launcher__x" aria-label={fr ? "Masquer le bouton du Gardien pour cette visite" : "Hide the Keeper button for this visit"}>
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export { KEEPER_NAME };
