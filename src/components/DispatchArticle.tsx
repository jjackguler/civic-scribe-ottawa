/**
 * The Dispatch page: a news article laid out as evidence, not as a column of
 * prose. The news in one line; the story in 30 seconds; who reported what,
 * sorted into what's confirmed, what's claimed and what's still unknown; why
 * it matters; then the story itself at the depth the reader picks.
 */
import { Link, useRouterState } from "@tanstack/react-router";
import { CircleCheck, Quote, CircleHelp, ExternalLink, Headphones, Pause, Play, Flag } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { useLocale } from "@/lib/locale-context";
import { timeAgo, useNow } from "@/lib/news";
import { editorMailto } from "@/lib/contact";
import { DEPTHS, splitMarkers, spokenText, stripMarkers, type Dispatch, type DispatchDepth, type DispatchSource, type DispatchSummary } from "@/lib/dispatch";
import type { Locale } from "@/lib/i18n";
import { DispatchRail, DISPATCH_WORD, keepNames, listOutlets, ReportDots, spanLabel } from "./Dispatch";
import { YourTake } from "./YouthKit";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const COPY = {
  en: {
    theNews: "The news",
    thirty: "In 30 seconds",
    ledger: "Who reported what",
    ledgerSub: "Each point links to the outlet that reported it. Point at one to see where it came from.",
    confirmed: "What's confirmed",
    confirmedSub: "Reported as fact by two or more outlets, or announced by the company or agency itself.",
    claimed: "What's claimed",
    claimedSub: "Said by someone, in their name. Others haven't confirmed it yet.",
    unknown: "What's still unknown",
    unknownSub: "What the reporting doesn't say yet.",
    claimBy: "Claim by",
    official: "Own announcement",
    matters: "Why it matters to you",
    story: "The story",
    depth: "Reading depth",
    depths: { plain: "Plain", standard: "Standard", expert: "Expert" } as Record<DispatchDepth, string>,
    depthHint: { plain: "No jargon", standard: "Newspaper", expert: "Every detail" } as Record<DispatchDepth, string>,
    read: "read",
    unfolded: "How it unfolded",
    unfoldedSub: "Times as the sources state them.",
    sources: "Sources",
    sourcesSub: "Everything in this dispatch comes from these reports. Read them in full.",
    readAt: "Read at",
    reported: "Reported",
    source: "Source",
    report: "Report an error",
    more: "More dispatches",
  },
  fr: {
    theNews: "La nouvelle",
    thirty: "En 30 secondes",
    ledger: "Qui rapporte quoi",
    ledgerSub: "Chaque point renvoie au média qui l'a rapporté. Pointez-en un pour voir d'où il vient.",
    confirmed: "Ce qui est confirmé",
    confirmedSub: "Rapporté comme un fait par au moins deux médias, ou annoncé par l'entreprise ou l'organisme lui-même.",
    claimed: "Ce qui est affirmé",
    claimedSub: "Dit par quelqu'un, en son nom. Les autres ne l'ont pas encore confirmé.",
    unknown: "Ce qu'on ignore encore",
    unknownSub: "Ce que les reportages ne disent pas encore.",
    claimBy: "Affirmé par",
    official: "Annonce officielle",
    matters: "Pourquoi c'est important pour vous",
    story: "L'article",
    depth: "Niveau de lecture",
    depths: { plain: "Simple", standard: "Standard", expert: "Expert" } as Record<DispatchDepth, string>,
    depthHint: { plain: "Sans jargon", standard: "Journal", expert: "Tous les détails" } as Record<DispatchDepth, string>,
    read: "de lecture",
    unfolded: "Le déroulement",
    unfoldedSub: "Les moments tels que les sources les donnent.",
    sources: "Sources",
    sourcesSub: "Tout ce que dit cette dépêche vient de ces reportages. Lisez-les en entier.",
    readAt: "Lire sur",
    reported: "Publié",
    source: "Source",
    report: "Signaler une erreur",
    more: "Autres dépêches",
  },
} as const;

function clock(iso: string, locale: Locale) {
  return new Date(iso).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** "Written by the AI Broadsheet desk with AI, from reporting by …" — on every dispatch. */
export function DispatchLabel({ d, dark = false, className = "" }: { d: Dispatch; dark?: boolean; className?: string }) {
  const { locale } = useLocale();
  const outlets = [...new Set(d.sources.map(s => s.outlet))];
  const fr = locale === "fr";
  return (
    <p className={`text-[0.92rem] leading-snug ${dark ? "text-white/80" : "text-muted-ink"} ${className}`}>
      {fr ? "Écrit par le pupitre d'AI Broadsheet avec l'IA, d'après les reportages de " : "Written by the AI Broadsheet desk with AI, from reporting by "}
      <span className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{listOutlets(outlets, locale)}</span>.{" "}
      <Link to="/standards" hash="dispatches" className={`font-semibold underline underline-offset-2 ${dark ? "text-signal" : "text-lake"} hover:no-underline`}>
        {fr ? "Comment nous écrivons les dépêches" : "How we write dispatches"}
      </Link>
    </p>
  );
}

// ── In 30 seconds ──────────────────────────────────────────────────────────
function ThirtySeconds({ lines }: { lines: string[] }) {
  const { locale } = useLocale();
  const ref = useRef<HTMLOListElement>(null);
  const [state, setState] = useState<"static" | "armed" | "play">("static");
  // Arm (hide) only once JS runs and motion is allowed; play once when seen.
  useIso(() => {
    const el = ref.current;
    if (!el || reducedMotion() || typeof IntersectionObserver === "undefined") return;
    setState("armed");
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { setState("play"); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section aria-labelledby="d30-h">
      <h2 id="d30-h" className="hl text-[1.05rem] text-muted-ink">{COPY[locale].thirty}</h2>
      <ol ref={ref} data-state={state} className="d30 mt-3 grid gap-4 md:grid-cols-3 md:gap-6">
        {lines.map((l, i) => (
          <li key={i} className="d30-line" style={{ ["--i" as string]: i }}>
            <span className="flex items-baseline gap-3">
              <span className="masthead-serif text-[2.2rem] leading-none text-brass-ink tabular-nums" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="hl text-[1.18rem] sm:text-[1.3rem] leading-snug text-ink">{l}</span>
            </span>
            <span className="d30-rule mt-3 block h-[3px] bg-night" style={{ ["--i" as string]: i }} aria-hidden="true" />
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Who reported what ──────────────────────────────────────────────────────
type Active = { keys: string[]; from: HTMLElement; origin: "claim" | "stamp"; id: number } | null;
type Wire = { d: string; k: string; x1: number; y1: number; x2: number; y2: number };

function Chip({ s, onActive, onLeave, dark = false }: { s: DispatchSource; onActive?: (el: HTMLElement) => void; onLeave?: (el: HTMLElement) => void; dark?: boolean }) {
  const { locale } = useLocale();
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener"
      data-chip={s.key}
      aria-label={`${COPY[locale].source} ${s.key.slice(1)}: ${s.outlet} (${locale === "fr" ? "nouvel onglet" : "opens in a new tab"})`}
      onMouseEnter={e => onActive?.(e.currentTarget)}
      onMouseLeave={e => onLeave?.(e.currentTarget)}
      onFocus={e => onActive?.(e.currentTarget)}
      className={`relative z-[1] inline-flex items-center gap-1.5 max-w-full rounded-full border px-2 py-0.5 text-[0.78rem] font-semibold leading-tight hover:bg-night hover:text-white hover:border-night ${dark ? "border-white/40 text-white" : "border-line bg-paper text-ink"}`}
    >
      <span className="tabular-nums text-[0.7rem] font-bold opacity-70" aria-hidden="true">{s.key.slice(1)}</span>
      <span className="truncate">{s.outlet}</span>
    </a>
  );
}

function Ledger({ d }: { d: Dispatch }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const c = d[locale];
  const bySrc = useMemo(() => new Map(d.sources.map(s => [s.key, s])), [d]);
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const seq = useRef(0);

  const activate = useCallback((keys: string[], from: HTMLElement | null, origin: "claim" | "stamp") => {
    setActive(from ? { keys, from, origin, id: ++seq.current } : null);
  }, []);

  // Draw a wire from the claim (or chip) to each outlet it came from, or from an outlet to its claims.
  const draw = useCallback(() => {
    const root = box.current;
    if (!root || !active || !window.matchMedia("(min-width: 1024px)").matches) { setWires([]); return; }
    const r0 = root.getBoundingClientRect();
    const at = (el: Element, edge: "top" | "bottom") => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2 - r0.left, y: (edge === "top" ? r.top : r.bottom) - r0.top }; };
    const out: Wire[] = [];
    if (active.origin === "claim") {
      const a = at(active.from, "top");
      for (const k of active.keys) {
        const stamp = root.querySelector(`[data-stamp="${k}"]`);
        if (!stamp) continue;
        const b = at(stamp, "bottom");
        out.push({ k, x1: a.x, y1: a.y, x2: b.x, y2: b.y, d: `M${a.x},${a.y} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y}` });
      }
    } else {
      const a = at(active.from, "bottom");
      root.querySelectorAll<HTMLElement>("[data-claim]").forEach((el, i) => {
        if (!(el.dataset.claim ?? "").split(" ").some(k => active.keys.includes(k))) return;
        const b = at(el, "top");
        out.push({ k: `${i}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, d: `M${a.x},${a.y} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y}` });
      });
    }
    setWires(out);
  }, [active]);

  useEffect(() => {
    draw();
    if (!active) return;
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [active, draw]);

  const lit = (k: string) => !!active?.keys.includes(k);
  const dim = (keys: string[]) => !!active && !keys.some(k => active.keys.includes(k));
  const sources = [...d.sources].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  const clear = () => setActive(null);
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") clear(); };

  const claimProps = (keys: string[]) => ({
    "data-claim": keys.join(" "),
    tabIndex: 0,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => activate(keys, e.currentTarget, "claim"),
    onFocus: (e: React.FocusEvent<HTMLElement>) => { if (e.target === e.currentTarget) activate(keys, e.currentTarget, "claim"); },
  });
  const chipActive = (k: string) => (el: HTMLElement) => activate([k], el, "claim");
  // Back from a chip to its card: the card's wires again.
  const chipLeave = (el: HTMLElement) => {
    const card = el.closest<HTMLElement>("[data-claim]");
    if (card) activate((card.dataset.claim ?? "").split(" "), card, "claim");
  };

  return (
    <section aria-labelledby="ledger-h" className="relative" ref={box} onMouseLeave={clear} onKeyDown={esc} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) clear(); }}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h2 id="ledger-h" className="masthead-serif text-[1.75rem] sm:text-[2.05rem] leading-tight">{L.ledger}</h2>
        <p className="meta max-w-[52ch]">{L.ledgerSub}</p>
      </div>

      {/* The source strip doubles as the reporting timeline: outlets in the order they published. */}
      <ol className="relative mt-5 -mx-4 px-4 scroll-px-4 md:mx-0 md:px-0 md:scroll-px-0 flex gap-3 overflow-x-auto snap-x no-scrollbar lg:grid lg:overflow-visible pb-1" style={{ gridTemplateColumns: `repeat(${sources.length}, minmax(0, 1fr))` }}>
        <span aria-hidden="true" className="hidden lg:block absolute left-0 right-0 top-[23px] h-[2px] bg-night" />
        {sources.map(s => (
          <li key={s.key} className="snap-start shrink-0 w-[72%] sm:w-[44%] lg:w-auto">
            <a
              href={s.url}
              target="_blank"
              rel="noopener"
              data-stamp={s.key}
              data-lit={lit(s.key)}
              onMouseEnter={e => activate([s.key], e.currentTarget, "stamp")}
              onFocus={e => activate([s.key], e.currentTarget, "stamp")}
              className={`dispatch-stamp relative block h-full border-2 p-3 pt-2.5 ${lit(s.key) ? "bg-night text-white border-night" : active ? "bg-paper border-line text-muted-ink" : "bg-surface border-night/80 text-ink"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[0.78rem] font-bold tabular-nums ${lit(s.key) ? "bg-signal text-signal-ink" : "bg-night text-white"}`}>{s.key.slice(1)}</span>
                <time dateTime={s.publishedAt} className={`text-[0.78rem] tabular-nums ${lit(s.key) ? "text-white/80" : "text-muted-ink"}`} suppressHydrationWarning>{clock(s.publishedAt, locale)}</time>
              </span>
              <span className="mt-2 block font-bold leading-tight">{s.outlet}</span>
              {s.official && <span className={`mt-1 block text-[0.75rem] font-semibold ${lit(s.key) ? "text-signal" : "text-brass-ink"}`}>{L.official}</span>}
              <span className="sr-only"> ({locale === "fr" ? "nouvel onglet" : "opens in a new tab"})</span>
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-6">
        <Column icon={<CircleCheck className="h-5 w-5 text-spruce" aria-hidden="true" />} title={L.confirmed} sub={L.confirmedSub} tone="confirmed">
          {c.confirmed.map((x, i) => (
            <li key={i} {...claimProps(x.src)} className={`dispatch-claim bg-surface border border-line border-l-[4px] border-l-spruce p-4 ${dim(x.src) ? "opacity-45" : ""} ${active?.origin === "stamp" && !dim(x.src) ? "shadow-[0_0_0_2px_var(--night)]" : ""}`}>
              <p className="font-serif text-[1.08rem] leading-snug">{x.text}</p>
              <p className="mt-3 flex flex-wrap gap-1.5">{x.src.map(k => bySrc.get(k) && <Chip key={k} s={bySrc.get(k)!} onActive={chipActive(k)} onLeave={chipLeave} />)}</p>
            </li>
          ))}
        </Column>
        <Column icon={<Quote className="h-5 w-5 text-brass-ink" aria-hidden="true" />} title={L.claimed} sub={L.claimedSub} tone="claimed">
          {c.claimed.map((x, i) => (
            <li key={i} {...claimProps(x.src)} className={`dispatch-claim bg-surface border border-line border-l-[4px] border-l-brass p-4 ${dim(x.src) ? "opacity-45" : ""} ${active?.origin === "stamp" && !dim(x.src) ? "shadow-[0_0_0_2px_var(--night)]" : ""}`}>
              <p className="text-[0.78rem] font-bold text-brass-ink">{L.claimBy} {x.by}</p>
              <p className="mt-1 font-serif text-[1.08rem] leading-snug">{x.text}</p>
              <p className="mt-3 flex flex-wrap gap-1.5">{x.src.map(k => bySrc.get(k) && <Chip key={k} s={bySrc.get(k)!} onActive={chipActive(k)} onLeave={chipLeave} />)}</p>
            </li>
          ))}
        </Column>
        <Column icon={<CircleHelp className="h-5 w-5 text-muted-ink" aria-hidden="true" />} title={L.unknown} sub={L.unknownSub} tone="unknown">
          {c.unknown.map((x, i) => (
            <li key={i} className={`border-2 border-dashed border-line p-4 ${active ? "opacity-45" : ""} dispatch-claim`}>
              <p className="font-serif text-[1.08rem] leading-snug text-ink/85">{x}</p>
            </li>
          ))}
        </Column>
      </div>

      {wires.length > 0 && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {wires.map(w => (
            <g key={`${active?.id}-${w.k}`}>
              <path d={w.d} pathLength={1} fill="none" stroke="var(--night)" strokeWidth={2} className="dispatch-wire" />
              <circle cx={w.x1} cy={w.y1} r={4} fill="var(--signal)" stroke="var(--night)" strokeWidth={2} />
              <circle cx={w.x2} cy={w.y2} r={4} fill="var(--signal)" stroke="var(--night)" strokeWidth={2} />
            </g>
          ))}
        </svg>
      )}
    </section>
  );
}

function Column({ icon, title, sub, children, tone }: { icon: ReactNode; title: string; sub: string; children: ReactNode; tone: string }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  if (items.length === 0) return null;
  return (
    <div data-tone={tone} className="min-w-0">
      <h3 className="hl text-[1.2rem] flex items-center gap-2">{icon}{title}</h3>
      <p className="meta mt-1 min-h-[2.6em]">{sub}</p>
      <ul className="mt-3 grid gap-3">{children}</ul>
    </div>
  );
}

// ── Reading depth ──────────────────────────────────────────────────────────
const DEPTH_KEY = "dispatch-depth";

function useDepth(): [DispatchDepth, (d: DispatchDepth) => void] {
  const [depth, setDepth] = useState<DispatchDepth>("standard");
  useEffect(() => {
    try { const v = localStorage.getItem(DEPTH_KEY); if (v && (DEPTHS as string[]).includes(v)) setDepth(v as DispatchDepth); } catch { /* private mode */ }
  }, []);
  const set = (d: DispatchDepth) => { setDepth(d); try { localStorage.setItem(DEPTH_KEY, d); } catch { /* ignore */ } };
  return [depth, set];
}

const minutes = (paras: string[], locale: Locale) => {
  const words = paras.map(stripMarkers).join(" ").split(/\s+/).length;
  const s = Math.max(20, Math.round((words / 220) * 60));
  return s < 60 ? `${Math.round(s / 10) * 10} s` : `${Math.round(s / 60)} min`;
};

function DepthSwitch({ value, onChange, body }: { value: DispatchDepth; onChange: (d: DispatchDepth) => void; body: Record<DispatchDepth, string[]> }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const i = DEPTHS.indexOf(value);
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const n = e.key === "Home" ? 0 : e.key === "End" ? DEPTHS.length - 1 : (i + step + DEPTHS.length) % DEPTHS.length;
    onChange(DEPTHS[n]);
    refs.current[n]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={L.depth} onKeyDown={key} className="relative grid grid-cols-3 rounded-[6px] border-2 border-night bg-surface p-1 w-full sm:w-[420px]">
      <span aria-hidden="true" className="dispatch-depth-thumb absolute top-1 bottom-1 left-1 rounded-[3px] bg-night" style={{ width: "calc((100% - 0.5rem) / 3)", transform: `translateX(${i * 100}%)` }} />
      {DEPTHS.map((d, n) => (
        <button
          key={d}
          ref={el => { refs.current[n] = el; }}
          type="button"
          role="radio"
          aria-checked={value === d}
          tabIndex={value === d ? 0 : -1}
          onClick={() => onChange(d)}
          className={`relative z-[1] flex flex-col items-center rounded-[3px] px-2 py-1.5 leading-tight transition-colors duration-200 ${value === d ? "text-white" : "text-ink hover:bg-ice"}`}
        >
          <span className="font-bold text-[0.95rem]">{L.depths[d]}</span>
          <span className={`text-[0.72rem] ${value === d ? "text-white/75" : "text-muted-ink"}`}>{L.depthHint[d]} · {minutes(body[d], locale)}</span>
        </button>
      ))}
    </div>
  );
}

/** The column eases to the new length while the paragraphs re-set. */
function EaseHeight({ children, k }: { children: ReactNode; k: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  const first = useRef(true);
  useEffect(() => {
    const el = inner.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    // The inner element is re-mounted for each depth: observe the new one.
    const measure = () => { if (el.isConnected) setH(el.offsetHeight); };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [k]);
  useEffect(() => { first.current = false; }, [k]);
  return (
    <div ref={outer} className="dispatch-height overflow-hidden -mx-1 px-1" style={h == null ? undefined : { height: h }}>
      <div ref={inner} key={k} className={`flow-root ${first.current ? "" : "dispatch-depth-in"}`}>{children}</div>
    </div>
  );
}

function Paragraph({ p, bySrc }: { p: string; bySrc: Map<string, DispatchSource> }) {
  const { locale } = useLocale();
  return (
    <p>
      {splitMarkers(p).map((run, i) => {
        const badges = run.keys.map(k => bySrc.get(k)).filter((s): s is DispatchSource => !!s);
        if (badges.length === 0) return <span key={i}>{run.text}</span>;
        // The last word travels with its badges so a badge never starts a line on its own.
        const m = run.text.match(/^([\s\S]*?)(\S+)$/);
        return (
          <span key={i}>
            {m ? m[1] : run.text}
            <span className="whitespace-nowrap">
              {m ? m[2] : ""}
              {badges.map(s => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  title={s.outlet}
                  aria-label={`${COPY[locale].source}: ${s.outlet}`}
                  className="ml-1 inline-flex h-[1.25em] min-w-[1.25em] -translate-y-[0.15em] items-center justify-center rounded-full bg-night px-1 align-middle font-sans text-[0.68em] font-bold text-white no-underline hover:bg-lake"
                >
                  {s.key.slice(1)}
                </a>
              ))}
            </span>
          </span>
        );
      })}
    </p>
  );
}

// ── Listen ─────────────────────────────────────────────────────────────────
type Voice = "idle" | "loading" | "playing" | "paused";

function Listen({ d, audio }: { d: Dispatch; audio: boolean }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [state, setState] = useState<Voice>("idle");
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<"tts" | "browser" | null>(audio ? "tts" : null);
  const el = useRef<HTMLAudioElement | null>(null);
  const text = useMemo(() => spokenText(d, locale), [d, locale]);
  const [canBrowser, setCanBrowser] = useState(false);
  useEffect(() => { setCanBrowser(typeof window !== "undefined" && "speechSynthesis" in window); }, []);
  useEffect(() => { if (!audio && canBrowser) setMode("browser"); }, [audio, canBrowser]);
  useEffect(() => () => { el.current?.pause(); if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  const speakInBrowser = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = fr ? "fr-CA" : "en-CA";
    const v = synth.getVoices().find(x => x.lang.toLowerCase().startsWith(fr ? "fr" : "en"));
    if (v) u.voice = v;
    u.rate = 1;
    u.onboundary = e => setProgress(Math.min(1, e.charIndex / text.length));
    u.onend = () => { setState("idle"); setProgress(1); };
    u.onerror = () => setState("idle");
    synth.speak(u);
    setMode("browser");
    setState("playing");
  };

  const toggle = () => {
    if (mode === "browser" || (!audio && canBrowser)) {
      const synth = window.speechSynthesis;
      if (state === "playing") { synth.pause(); setState("paused"); return; }
      if (state === "paused") { synth.resume(); setState("playing"); return; }
      speakInBrowser();
      return;
    }
    if (!el.current) {
      const a = new Audio(`/api/dispatch-audio/${encodeURIComponent(d.id)}?lang=${locale}&v=${encodeURIComponent(d.createdAt.slice(0, 16))}`);
      a.preload = "auto";
      a.ontimeupdate = () => a.duration && setProgress(a.currentTime / a.duration);
      a.onplaying = () => setState("playing");
      a.onpause = () => setState(s => (s === "loading" ? s : "paused"));
      a.onended = () => { setState("idle"); setProgress(1); };
      // No key, over the daily cap or a network error: the browser's own voice reads it.
      a.onerror = () => { el.current = null; if (canBrowser) speakInBrowser(); else setState("idle"); };
      el.current = a;
    }
    const a = el.current;
    if (state === "playing") { a.pause(); return; }
    setState("loading");
    a.play().catch(() => { el.current = null; if (canBrowser) speakInBrowser(); else setState("idle"); });
  };

  if (!audio && !canBrowser) return null;
  const words = text.split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 160));
  const label = state === "playing" ? (fr ? "Pause" : "Pause") : state === "paused" ? (fr ? "Reprendre" : "Resume") : state === "loading" ? (fr ? "Chargement…" : "Loading…") : (fr ? "Écouter" : "Listen");
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={state === "playing"}
        className="press inline-flex shrink-0 items-center gap-2 rounded-full bg-signal px-4 py-2.5 font-bold text-signal-ink hover:bg-white focus-visible:outline-white"
      >
        {state === "playing" ? <Pause className="h-4 w-4" aria-hidden="true" /> : state === "idle" ? <Headphones className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        {label}
        <span className="font-semibold opacity-75">· {mins} min</span>
      </button>
      <span className="min-w-0 flex-1">
        <span className="block h-[3px] w-full bg-white/20" aria-hidden="true">
          <span className="block h-full bg-signal origin-left" style={{ transform: `scaleX(${progress})` }} />
        </span>
        <span className="mt-1 block text-[0.75rem] text-white/70">
          {mode === "browser" ? (fr ? "Lu par la voix de votre navigateur" : "Read by your browser's voice") : (fr ? "Voix d'IA (ElevenLabs)" : "AI voice (ElevenLabs)")}
        </span>
      </span>
    </div>
  );
}

// ── report an error ────────────────────────────────────────────────────────
function ReportError({ title }: { title: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const publicHref = useRouterState({ select: st => st.location.publicHref ?? st.location.href });
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const mail = editorMailto(fr ? `Erreur signalée : ${title}` : `Error report: ${title}`, fr ? `Page : ${origin}${publicHref}\n\nCe qui est inexact :\n` : `Page: ${origin}${publicHref}\n\nWhat is wrong:\n`);
  const cls = "inline-flex items-center gap-1.5 text-[0.92rem] font-semibold text-muted-ink hover:text-ink underline underline-offset-2";
  const inner = <><Flag className="h-4 w-4" aria-hidden="true" />{COPY[locale].report}</>;
  return mail ? <a href={mail} className={cls}>{inner}</a> : <Link to="/corrections" hash="report" className={cls}>{inner}</Link>;
}

// ── the page ───────────────────────────────────────────────────────────────
export function DispatchArticle({ d, audio, more }: { d: Dispatch; audio: boolean; more: DispatchSummary[] }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const c = d[locale];
  const now = useNow();
  const [depth, setDepth] = useDepth();
  const bySrc = useMemo(() => new Map(d.sources.map(s => [s.key, s])), [d]);
  const sources = [...d.sources].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));

  return (
    <article lang={locale === "fr" ? "fr-CA" : "en-CA"}>
      {/* Masthead band */}
      <header className="bg-night text-white">
        <div className="container-mw pt-7 pb-8 sm:pt-10 sm:pb-11">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.85rem] font-bold">
            <Link to="/dispatch" className="bg-signal text-signal-ink px-2 py-0.5 hover:bg-white">{DISPATCH_WORD[locale]}</Link>
            <span className="text-brass">{locale === "fr" ? `${new Set(d.sources.map(s => s.outlet)).size} médias` : `${new Set(d.sources.map(s => s.outlet)).size} outlets`}</span>
            <time dateTime={d.createdAt} className="font-semibold text-white/70" suppressHydrationWarning>{timeAgo(d.createdAt, now, locale)}</time>
          </p>
          <div className="mt-4 grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div className="min-w-0">
              <h1 className="hl text-[2.05rem] sm:text-[2.9rem] lg:text-[3.6rem] leading-[1.02] max-w-[22ch]">{keepNames(c.headline)}</h1>
              <div className="mt-6 max-w-[62ch] border-l-[4px] border-signal pl-4">
                <p className="text-[0.8rem] font-bold text-signal">{L.theNews}</p>
                <p className="mt-1 font-serif text-[1.22rem] sm:text-[1.4rem] leading-snug text-white">{c.news}</p>
              </div>
            </div>
            <div className="grid gap-4 lg:pb-1">
              <Listen d={d} audio={audio} />
              <div className="border-t border-white/15 pt-3">
                <ReportDots times={sources.map(s => s.publishedAt)} dark />
                <p className="mt-1.5 flex justify-between gap-3 text-[0.75rem] text-white/70" suppressHydrationWarning>
                  <span>{sources[0] && clock(sources[0].publishedAt, locale)}</span>
                  <span>{spanLabel(sources.map(s => s.publishedAt), locale)}</span>
                </p>
              </div>
            </div>
          </div>
          <DispatchLabel d={d} dark className="mt-7 max-w-[80ch]" />
        </div>
      </header>

      <div className="container-mw pt-9 sm:pt-12">
        <ThirtySeconds lines={c.thirty} />
      </div>

      <div className="container-mw pt-12 sm:pt-14">
        <div className="relative pt-3 border-t-[3px] border-night">
          <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
          <Ledger d={d} />
        </div>
      </div>

      <div className="container-mw pt-12 sm:pt-14 grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 max-w-[760px]">
          <section aria-labelledby="matters-h" className="bg-signal text-signal-ink p-5 sm:p-6">
            <h2 id="matters-h" className="hl text-[1.3rem]">{L.matters}</h2>
            <p className="mt-2 font-serif text-[1.2rem] sm:text-[1.3rem] leading-snug">{c.matters}</p>
          </section>

          <section aria-labelledby="story-h" className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="story-h" className="masthead-serif text-[1.75rem] sm:text-[2.05rem] leading-tight">{L.story}</h2>
              <DepthSwitch value={depth} onChange={setDepth} body={c.body} />
            </div>
            <EaseHeight k={depth}>
              <div className="prose-mw mt-6">
                {c.body[depth].map((p, i) => <Paragraph key={i} p={p} bySrc={bySrc} />)}
              </div>
            </EaseHeight>
          </section>

          <div className="mt-6 border-t border-line pt-5 grid gap-3">
            <DispatchLabel d={d} />
            <ReportError title={c.headline} />
          </div>

          <YourTake dispatchId={d.id} headline={c.headline} className="mt-10" />
        </div>

        <aside className="min-w-0 grid gap-10 content-start">
          {c.timeline.length > 0 && (
            <section aria-labelledby="unfold-h">
              <h2 id="unfold-h" className="hl text-[1.2rem]">{L.unfolded}</h2>
              <p className="meta mt-1">{L.unfoldedSub}</p>
              <ol className="mt-4 relative border-l-2 border-night pl-5 grid gap-5">
                {c.timeline.map((e, i) => (
                  <li key={i} className="relative">
                    <span aria-hidden="true" className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-night bg-signal" />
                    <p className="text-[0.85rem] font-bold text-brass-ink">{e.when}</p>
                    <p className="mt-0.5 leading-snug">{e.text}</p>
                    <p className="mt-2 flex flex-wrap gap-1.5">{e.src.map(k => bySrc.get(k) && <Chip key={k} s={bySrc.get(k)!} />)}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section aria-labelledby="sources-h">
            <h2 id="sources-h" className="hl text-[1.2rem]">{L.sources}</h2>
            <p className="meta mt-1">{L.sourcesSub}</p>
            <ol className="mt-3">
              {sources.map(s => (
                <li key={s.key} className="py-3 border-b border-line">
                  <a href={s.url} target="_blank" rel="noopener" className="group flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-night px-1.5 text-[0.78rem] font-bold text-white tabular-nums">{s.key.slice(1)}</span>
                    <span className="min-w-0">
                      <span className="block font-bold text-[0.92rem]">{s.outlet}</span>
                      <span className="block leading-snug group-hover:underline" lang={s.lang === "fr" ? "fr" : "en"}>{s.title}</span>
                      <time dateTime={s.publishedAt} className="meta mt-1 block" suppressHydrationWarning>{L.reported} {clock(s.publishedAt, locale)}</time>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-lake">{L.readAt} {s.outlet}<ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      {more.length > 0 && (
        <div className="container-mw pt-14">
          <DispatchRail initial={{ items: more, audio }} exclude={d.id} limit={4} />
        </div>
      )}
    </article>
  );
}
