/**
 * "Today in 60 seconds": the day's top stories as a tap-through stack.
 *
 *   <TodayLauncher />                    a row of round story bubbles (homepage top); fetches by itself
 *   <TodayLauncher initialNews={loader.news} initialDispatches={loader.dispatches} />
 *   <TodayStack />                       the full-screen stack (the /today page)
 *
 * Tap the right of a card (or swipe left, or press →) for the next story, the
 * left for the one before. Hold to pause. Auto-advance is off for readers who
 * ask for reduced motion, and there is always a pause button. No endless feed:
 * the stack ends with "You're up to date".
 */
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, ImageIcon, Pause, Play, RotateCcw, X } from "lucide-react";
import { StoryImage } from "./StoryImage";
import { storyKicker } from "./StoryCard";
import { ShareSheet } from "./ShareSheet";
import { storyCard } from "@/lib/share-content";
import { useLocale } from "@/lib/locale-context";
import { fixtureRequested } from "@/lib/dispatch";
import { buildToday, useSeen, useToday, type TodayItem } from "@/lib/youth";
import type { NewsPayload } from "@/lib/news";
import type { DispatchList } from "@/lib/dispatch";
import type { Locale } from "@/lib/i18n";

const STORY_MS = 8000;

const COPY = {
  en: {
    title: "Today in 60 seconds",
    short: "Today",
    what: "What happened",
    matters: "Why it matters to you",
    mattersGeneral: "Why stories like this matter",
    readDispatch: "Read the dispatch",
    readStory: "Read the story",
    dispatch: "Dispatch",
    outlets: (n: number) => `${n} outlets reporting`,
    from: "From",
    photo: "Photo",
    pause: "Pause",
    play: "Play",
    close: "Close and go to the front page",
    prev: "Previous story",
    next: "Next story",
    position: (i: number, n: number) => `Story ${i} of ${n}`,
    reduced: "Auto-play is off because your device asks for less motion. Tap, swipe or use the arrow keys.",
    upToDate: "You're up to date",
    upToDateSub: (n: number) => `That's the ${n} biggest AI stories today, picked by how many newsrooms are reporting them.`,
    quiz: "Test yourself: The Broadsheet 5",
    dispatches: "Read our dispatches",
    top: "See all of today's news",
    ask: "Ask the Keeper a question",
    again: "Watch again",
    how: "How we pick the stories",
    empty: "Today's stack is being put together. Check back in a few minutes.",
    home: "Go to the front page",
    launcher: "Today's top stories, 60 seconds",
    start: "Start",
    share: "Share this story as an image",
  },
  fr: {
    title: "L'actualité en 60 secondes",
    short: "Aujourd'hui",
    what: "Ce qui s'est passé",
    matters: "Pourquoi c'est important pour vous",
    mattersGeneral: "Pourquoi ce genre de nouvelle compte",
    readDispatch: "Lire la dépêche",
    readStory: "Lire la nouvelle",
    dispatch: "Dépêche",
    outlets: (n: number) => `${n} médias en parlent`,
    from: "D'après",
    photo: "Photo",
    pause: "Pause",
    play: "Lecture",
    close: "Fermer et aller à la une",
    prev: "Nouvelle précédente",
    next: "Nouvelle suivante",
    position: (i: number, n: number) => `Nouvelle ${i} sur ${n}`,
    reduced: "La lecture automatique est désactivée, car votre appareil demande moins de mouvement. Touchez, glissez ou utilisez les flèches.",
    upToDate: "Vous êtes à jour",
    upToDateSub: (n: number) => `Voilà les ${n} grandes nouvelles de l'IA aujourd'hui, choisies selon le nombre de salles de rédaction qui les rapportent.`,
    quiz: "Testez-vous : Les 5 du Broadsheet",
    dispatches: "Lire nos dépêches",
    top: "Toute l'actualité du jour",
    ask: "Poser une question au Gardien",
    again: "Revoir",
    how: "Comment nous choisissons",
    empty: "La pile du jour se prépare. Revenez dans quelques minutes.",
    home: "Aller à la une",
    launcher: "Les grandes nouvelles du jour, en 60 secondes",
    start: "Commencer",
    share: "Partager cette nouvelle en image",
  },
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

const outletLine = (xs: string[], locale: Locale) => {
  const n = xs.slice(0, 3);
  const and = locale === "fr" ? "et" : "and";
  const s = n.length <= 1 ? n.join("") : `${n.slice(0, -1).join(", ")} ${and} ${n[n.length - 1]}`;
  return xs.length > 3 ? `${s} +${xs.length - 3}` : s;
};

const kickerOf = (it: TodayItem, locale: Locale) => (it.lead ? storyKicker(it.lead, locale) : COPY[locale].dispatch);

// ── the stack ──────────────────────────────────────────────────────────────

/** The full-screen stack. Fetches the desk by itself; pass the loader's copies to start from them. */
export function TodayStack({ initialNews, initialDispatches, startId }: {
  initialNews?: NewsPayload | null;
  initialDispatches?: DispatchList | null;
  /** Item id (dispatch id or lead story id) to open first. */
  startId?: string;
}) {
  const { locale } = useLocale();
  const { stories, dispatches, loading, now } = useToday(initialNews, initialDispatches);
  const items = useMemo(() => (now == null ? [] : buildToday(stories, dispatches, locale, now)), [stories, dispatches, locale, now]);
  if (now == null || (loading && items.length === 0)) return <StackFrame><div className="grid h-full place-items-center"><span className="live-dot" aria-hidden="true" /></div></StackFrame>;
  if (items.length === 0) return <EmptyStack />;
  return <StackPlayer items={items} startId={startId} />;
}

/** The dark stage and the card frame: full screen on phones, a 9:16 card on wide screens. */
function StackFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="today-stage relative min-h-[100svh] bg-night text-white md:grid md:place-items-center md:py-6">
      <div className="today-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
      <section aria-label={label} className="relative mx-auto h-[100svh] w-full md:h-[min(88svh,860px)] md:w-auto md:aspect-[9/16]">
        {children}
      </section>
    </div>
  );
}

function EmptyStack() {
  const { locale } = useLocale();
  const L = COPY[locale];
  return (
    <StackFrame label={L.title}>
      <div className="flex h-full flex-col justify-center gap-6 p-6 md:rounded-[14px] md:bg-night-2">
        <h1 className="masthead-serif text-[2.2rem] leading-tight">{L.title}</h1>
        <p className="font-serif text-[1.15rem] text-white/80">{L.empty}</p>
        <Link to="/" className="press inline-flex min-h-12 items-center justify-center gap-2 bg-signal px-5 font-bold text-signal-ink">{L.home}</Link>
      </div>
    </StackFrame>
  );
}

function StackPlayer({ items, startId }: { items: TodayItem[]; startId?: string }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const navigate = useNavigate();
  const n = items.length;
  const first = Math.max(0, items.findIndex(x => x.id === startId));
  const [idx, setIdx] = useState(first);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [userPaused, setUserPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [drag, setDrag] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [round, setRound] = useState(0);
  const [sharing, setSharing] = useState<TodayItem | null>(null);
  const reduced = useReducedMotion();
  const { markSeen } = useSeen();
  const cardRef = useRef<HTMLDivElement>(null);
  const atEnd = idx >= n;
  // The stack holds still while the share sheet is open.
  const running = !userPaused && !held && !hidden && !reduced && !atEnd && !sharing;
  const cur = atEnd ? null : items[idx];

  useEffect(() => { if (cur) markSeen(cur.id); }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const on = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  // Focus the stack so arrow keys and screen readers start here.
  useEffect(() => { cardRef.current?.focus({ preventScroll: true }); }, []);

  const go = useCallback((to: number, manual: boolean) => {
    const next = Math.max(0, Math.min(n, to));
    if (next === idx) return;
    setDir(next > idx ? "next" : "prev");
    setIdx(next);
    if (manual) setAnnounce(next >= n ? L.upToDate : `${L.position(next + 1, n)}: ${items[next].headline}`);
  }, [idx, n, items, L]);

  const close = useCallback(() => { void navigate({ to: "/" }); }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      const onControl = !!t?.closest("a,button,input,textarea,select");
      if (e.key === "ArrowRight") { go(idx + 1, true); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { go(idx - 1, true); e.preventDefault(); }
      else if ((e.key === " " || e.key === "k") && !onControl) { setUserPaused(p => !p); e.preventDefault(); }
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, go, close]);

  // Tap, hold and swipe.
  const ptr = useRef<{ x: number; y: number; t: number; id: number; dragging: boolean; timer: ReturnType<typeof setTimeout> | null; held: boolean } | null>(null);
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("a,button")) return;
    const p = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, dragging: false, held: false, timer: null as ReturnType<typeof setTimeout> | null };
    p.timer = setTimeout(() => { p.held = true; setHeld(true); }, 220);
    ptr.current = p;
    setSnapping(false);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not supported */ }
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = ptr.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (!p.dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      p.dragging = true;
      if (p.timer) clearTimeout(p.timer);
      if (p.held) { p.held = false; setHeld(false); }
    }
    // Rubber band at the ends of the stack.
    if (p.dragging && !reduced) setDrag((idx === 0 && dx > 0) || (atEnd && dx < 0) ? dx * 0.25 : dx);
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = ptr.current;
    if (!p || p.id !== e.pointerId) return;
    ptr.current = null;
    if (p.timer) clearTimeout(p.timer);
    if (p.held) { setHeld(false); return; }
    const dx = e.clientX - p.x;
    if (p.dragging) {
      const v = dx / Math.max(1, performance.now() - p.t);
      setSnapping(true);
      setDrag(0);
      if (dx < -60 || v < -0.45) go(idx + 1, true);
      else if (dx > 60 || v > 0.45) go(idx - 1, true);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.3) go(idx - 1, true);
    else go(idx + 1, true);
  };
  const onCancel = () => {
    const p = ptr.current;
    if (p?.timer) clearTimeout(p.timer);
    ptr.current = null;
    setHeld(false);
    setSnapping(true);
    setDrag(0);
  };

  const restart = () => { setRound(r => r + 1); setDir("prev"); setIdx(0); setAnnounce(`${L.position(1, n)}: ${items[0].headline}`); };

  return (
    <StackFrame label={L.title}>
      <h1 className="sr-only">{L.title}</h1>
      <p className="sr-only" aria-live="polite">{announce}</p>

      <div
        ref={cardRef}
        tabIndex={-1}
        role="group"
        aria-roledescription={locale === "fr" ? "pile de nouvelles" : "story stack"}
        aria-label={atEnd ? L.upToDate : L.position(idx + 1, n)}
        className={`today-card relative flex h-full w-full select-none flex-col overflow-hidden bg-night-2 outline-none md:rounded-[14px] md:shadow-[0_24px_70px_rgba(0,0,0,0.5)] ${snapping ? "is-snapping" : ""}`}
        style={{ transform: drag ? `translateX(${drag}px) rotate(${drag / 60}deg)` : undefined, touchAction: "pan-y pinch-zoom" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        onContextMenu={e => { if (held) e.preventDefault(); }}
        onDragStart={e => e.preventDefault()}
        onTransitionEnd={() => setSnapping(false)}
      >
        {/* Progress */}
        <div className={`flex gap-1 px-3 pt-3 ${running ? "" : "today-paused"}`} aria-hidden="true">
          {items.map((it, k) => (
            <span key={it.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              {k === idx ? (
                <span
                  key={`${idx}-${round}`}
                  className="today-progress block h-full rounded-full bg-white"
                  style={{ ["--today-ms" as string]: `${STORY_MS}ms` }}
                  onAnimationEnd={() => go(idx + 1, false)}
                />
              ) : k < idx ? <span className="block h-full bg-white" /> : null}
            </span>
          ))}
        </div>

        {/* Top bar */}
        <div className="flex items-center gap-2 px-3 pt-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal font-serif text-[1.05rem] font-bold text-signal-ink" aria-hidden="true">B</span>
          <p className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[0.9rem] font-bold">{L.title}</span>
            <span className="block text-[0.75rem] text-white/65" suppressHydrationWarning>{atEnd ? L.upToDate : L.position(idx + 1, n)}</span>
          </p>
          {!atEnd && !reduced && (
            <button type="button" onClick={() => setUserPaused(p => !p)} aria-pressed={userPaused} className="press grid h-11 w-11 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white">
              {userPaused ? <Play className="h-5 w-5" aria-hidden="true" /> : <Pause className="h-5 w-5" aria-hidden="true" />}
              <span className="sr-only">{userPaused ? L.play : L.pause}</span>
            </button>
          )}
          <Link to="/" aria-label={L.close} className="press grid h-11 w-11 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white">
            <X className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>
        {reduced && !atEnd && <p className="px-4 pt-1 text-[0.75rem] text-white/60">{L.reduced}</p>}

        {/* The slide */}
        <div key={`${idx}-${round}`} className={`relative flex min-h-0 flex-1 flex-col ${dir === "next" ? "today-in-next" : "today-in-prev"}`}>
          {cur ? <Slide it={cur} onShare={() => setSharing(cur)} /> : <EndCard n={n} onRestart={restart} />}
        </div>

        {held && <span className="today-hold absolute left-1/2 top-16 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[0.8rem] font-semibold" aria-hidden="true">{L.pause}</span>}
      </div>

      {/* Previous / next: at the card's edges on phones (shown on keyboard focus), beside it on wide screens. */}
      <button
        type="button"
        onClick={() => go(idx - 1, true)}
        disabled={idx === 0}
        className="press today-nav absolute left-1 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-night/70 text-white opacity-0 focus-visible:opacity-100 disabled:invisible md:-left-16 md:bg-white/10 md:opacity-100 md:hover:bg-white/20"
      >
        <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        <span className="sr-only">{L.prev}</span>
      </button>
      <button
        type="button"
        onClick={() => go(idx + 1, true)}
        disabled={atEnd}
        className="press today-nav absolute right-1 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-night/70 text-white opacity-0 focus-visible:opacity-100 disabled:invisible md:-right-16 md:bg-white/10 md:opacity-100 md:hover:bg-white/20"
      >
        <ChevronRight className="h-7 w-7" aria-hidden="true" />
        <span className="sr-only">{L.next}</span>
      </button>

      {/* Outside the card, so taps in the sheet never turn the page. */}
      {sharing && (
        <ShareSheet
          open
          onOpenChange={o => { if (!o) { setSharing(null); cardRef.current?.focus({ preventScroll: true }); } }}
          content={storyCard({
            id: sharing.id,
            kind: sharing.kind,
            kicker: kickerOf(sharing, locale),
            headline: sharing.headline,
            what: sharing.what,
            outlets: sharing.outlets,
            path: sharing.link.to === "/dispatch/$id" ? `/dispatch/${sharing.link.id}` : `/story/${sharing.link.id}`,
          }, locale)}
          url={sharing.link.to === "/dispatch/$id" ? `/dispatch/${sharing.link.id}` : `/story/${sharing.link.id}`}
          title={sharing.headline}
          campaign="today"
        />
      )}
    </StackFrame>
  );
}

function Slide({ it, onShare }: { it: TodayItem; onShare: () => void }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const kicker = kickerOf(it, locale);
  const [imgOk, setImgOk] = useState(true);
  const fixture = fixtureRequested();
  return (
    <article className="flex min-h-0 flex-1 flex-col" aria-labelledby={`today-h-${it.id}`}>
      {/* The publisher's photo, or our house pattern: never an invented picture. */}
      <div className="relative mx-3 mt-3 shrink-0 basis-[34%] overflow-hidden rounded-[10px] bg-signal">
        <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--signal-ink) 0 2px, transparent 2px 20px)" }} aria-hidden="true" />
        <p className="absolute inset-x-4 bottom-3 masthead-serif text-[2.4rem] leading-[0.95] text-signal-ink text-balance" aria-hidden="true">{kicker}</p>
        {it.image && imgOk && (
          <>
            <StoryImage src={it.image} alt="" eager className="img-cover absolute inset-0 today-photo" onFail={() => setImgOk(false)} />
            <span className="absolute right-2 top-2 bg-night/80 px-1.5 py-0.5 text-[0.7rem] text-white/90">{L.photo}: {it.imageCredit}</span>
          </>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] font-bold">
          {it.kind === "dispatch" && <span className="bg-signal px-1.5 py-0.5 text-signal-ink">{L.dispatch}</span>}
          {it.outlets.length >= 2 && <span className="text-brass">{L.outlets(it.outlets.length)}</span>}
          {it.lead && it.image && imgOk && <span className="text-signal">{kicker}</span>}
        </p>
        <h2 id={`today-h-${it.id}`} className="hl mt-1.5 line-clamp-4 text-[1.6rem] leading-[1.06] text-white sm:text-[1.75rem]">{it.headline}</h2>

        <div className="mt-3 min-h-0 overflow-hidden">
          <p className="text-[0.75rem] font-bold text-signal">{L.what}</p>
          <p className="mt-0.5 line-clamp-3 font-serif text-[1.02rem] leading-snug text-white/90">{it.what}</p>
          {it.matters && (
            <div className="mt-3 border-l-[3px] border-brass pl-3">
              <p className="text-[0.75rem] font-bold text-brass">{it.mattersGeneral ? L.mattersGeneral : L.matters}</p>
              <p className="mt-0.5 line-clamp-3 font-serif text-[1.02rem] leading-snug text-white/90">{it.matters}</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex gap-2">
            {it.link.to === "/dispatch/$id" ? (
              <Link to="/dispatch/$id" params={{ id: it.link.id }} search={fixture ? ({ fixture: "1" } as never) : undefined} className="press flex min-h-12 flex-1 items-center justify-center gap-2 bg-signal px-4 font-bold text-signal-ink hover:bg-white">
                {L.readDispatch} <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <Link to="/story/$id" params={{ id: it.link.id }} className="press flex min-h-12 flex-1 items-center justify-center gap-2 bg-signal px-4 font-bold text-signal-ink hover:bg-white">
                {L.readStory} <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}
            <button type="button" onClick={onShare} aria-haspopup="dialog" className="press grid min-h-12 w-12 shrink-0 place-items-center border-2 border-white/40 text-white hover:border-signal hover:bg-signal hover:text-signal-ink">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{L.share}</span>
            </button>
          </div>
          <p className="mt-2 line-clamp-2 text-center text-[0.78rem] text-white/65">{L.from} {outletLine(it.outlets, locale)}</p>
        </div>
      </div>
    </article>
  );
}

function EndCard({ n, onRestart }: { n: number; onRestart: () => void }) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const link = "press flex min-h-12 items-center justify-between gap-3 border border-white/25 px-4 font-semibold hover:border-white hover:bg-white/5";
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5 pt-6">
      <span className="today-done grid h-16 w-16 place-items-center rounded-full bg-signal text-signal-ink" aria-hidden="true"><Check className="h-9 w-9" strokeWidth={3} /></span>
      <h2 className="masthead-serif mt-5 text-[2.5rem] leading-[1.02]">{L.upToDate}</h2>
      <p className="mt-3 font-serif text-[1.1rem] leading-snug text-white/80">{L.upToDateSub(n)}</p>
      <ul className="mt-6 grid gap-2.5">
        <li><Link to="/quiz" className="press flex min-h-12 items-center justify-between gap-3 bg-signal px-4 font-bold text-signal-ink hover:bg-white">{L.quiz} <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link></li>
        <li><Link to="/dispatch" className={link}>{L.dispatches} <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link></li>
        <li><Link to="/news" className={link}>{L.top} <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link></li>
        <li><Link to="/ask" className={link}>{L.ask} <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" /></Link></li>
      </ul>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <button type="button" onClick={onRestart} className="press inline-flex min-h-11 items-center gap-2 font-semibold text-white/85 hover:text-white">
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {L.again}
        </button>
        <Link to="/standards" className="inline-flex min-h-11 items-center text-[0.85rem] text-white/65 underline underline-offset-4 hover:text-white">{L.how}</Link>
      </div>
    </div>
  );
}

// ── the launcher ───────────────────────────────────────────────────────────

const NOT_NAMES = new Set("the a an ai ia new how why what when who this that these le la les un une des du de l comment pourquoi introducing".split(" "));

/** Capitalised only because they start a headline: never a bubble's name. */
const NOT_START = new Set(("one two three four five six seven eight nine ten provincial federal national global local study report researchers scientists experts " +
  "students teachers parents workers people companies startups chipmakers deux trois quatre cinq étude rapport chercheurs").split(" "));

/**
 * A short name for a bubble: a proper name from the headline (one inside it
 * first, since the first word is capitalised anyway), else the desk.
 */
function bubbleLabel(it: TodayItem, locale: Locale): string {
  const words = it.headline.replace(/['’]s\b/g, "").split(/[\s:,;—–]+/).map(w => w.replace(/[^\p{L}\p{N}-]/gu, "")).filter(Boolean);
  const runs: { text: string; start: boolean; multi: boolean }[] = [];
  let cur: string[] = [], at = -1;
  const flush = () => { if (cur.length) runs.push({ text: cur.join(" "), start: at === 0, multi: cur.length > 1 }); cur = []; };
  words.forEach((w, i) => {
    if (/^\p{Lu}/u.test(w) && !NOT_NAMES.has(w.toLowerCase()) && cur.length < 2) { if (!cur.length) at = i; cur.push(w); }
    else flush();
  });
  flush();
  const ok = (r: { text: string }) => r.text.length >= 3 && r.text.length <= 22;
  const pick = runs.find(r => !r.start && ok(r))
    ?? runs.find(r => r.start && (r.multi || /\d/.test(r.text)) && ok(r))
    ?? runs.find(r => r.start && !NOT_START.has(r.text.toLowerCase()) && ok(r));
  return pick?.text ?? kickerOf(it, locale);
}

/**
 * A row of round story bubbles for the top of the front page. The first opens
 * the stack from the start; each other opens it at that story. Rings go quiet
 * once a story has been seen today (remembered in this browser only).
 */
export function TodayLauncher({ initialNews, initialDispatches, dark = false, className = "" }: {
  initialNews?: NewsPayload | null;
  initialDispatches?: DispatchList | null;
  /** On a night background. */
  dark?: boolean;
  className?: string;
}) {
  const { locale } = useLocale();
  const L = COPY[locale];
  const { stories, dispatches, now } = useToday(initialNews, initialDispatches);
  const items = useMemo(() => (now == null ? [] : buildToday(stories, dispatches, locale, now)), [stories, dispatches, locale, now]);
  const { seen } = useSeen();
  const fixture = fixtureRequested();
  // Before hydration, hold the row's height so the page doesn't jump.
  if (now == null) return (initialNews?.stories.length ?? 0) > 0 ? <div className={`h-[112px] ${className}`} aria-hidden="true" /> : null;
  if (items.length === 0) return null;
  const search = (s?: string) => ({ ...(s ? { s } : {}), ...(fixture ? { fixture: 1 } : {}) }) as never;
  const label = dark ? "text-white" : "text-ink";
  return (
    <nav aria-label={L.launcher} className={className}>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-1 no-scrollbar snap-x md:mx-0 md:px-0">
        <li className="snap-start shrink-0">
          <Link to="/today" search={search()} className="group press flex w-[76px] flex-col items-center gap-1.5">
            <span className="today-ring rounded-full p-[3px]">
              <span className={`relative grid h-[62px] w-[62px] place-items-center rounded-full border-2 bg-night text-signal ${dark ? "border-night" : "border-paper"}`}>
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" aria-hidden="true" />
              </span>
            </span>
            <span className={`text-center text-[0.75rem] font-bold leading-tight ${label}`}>{L.title}</span>
          </Link>
        </li>
        {items.map(it => {
          const done = seen.has(it.id);
          const name = bubbleLabel(it, locale);
          return (
            <li key={it.id} className="snap-start shrink-0">
              <Link to="/today" search={search(it.id)} className="group press flex w-[76px] flex-col items-center gap-1.5" aria-label={`${it.headline}${done ? (locale === "fr" ? " (vue)" : " (seen)") : ""}`}>
                <span className={`rounded-full p-[3px] ${done ? (dark ? "bg-white/25" : "bg-line") : "today-ring"}`}>
                  <span className={`relative block h-[62px] w-[62px] overflow-hidden rounded-full border-2 bg-signal ${dark ? "border-night" : "border-paper"}`}>
                    <span className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--signal-ink) 0 2px, transparent 2px 12px)" }} aria-hidden="true" />
                    <span className="absolute inset-0 grid place-items-center masthead-serif text-[1.35rem] text-signal-ink" aria-hidden="true">{name.slice(0, 1)}</span>
                    {it.image && <StoryImage src={it.image} alt="" className="img-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105" />}
                  </span>
                </span>
                <span className={`line-clamp-2 text-center text-[0.75rem] font-semibold leading-tight ${done ? (dark ? "text-white/60" : "text-muted-ink") : label}`} aria-hidden="true">{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

