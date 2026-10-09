import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import type { Story } from "@/lib/news";
import { display, timeAgo, useNow } from "@/lib/news";
import type { Original } from "@/lib/originals-types";
import { useLocale } from "@/lib/locale-context";
import { StoryLink, storyKicker } from "./StoryCard";
import { StoryImage } from "./StoryImage";
import { mmss, originalKind, usePreviewOk } from "./Originals";

/** One of our own productions (explainer or opening titles) on the stage. */
export type OriginalSlide = { kind: "original"; original: Original };

export type StorySlide = {
  kind?: "story";
  story: Story;
  outlets: number;
  sources: string[];
  developing: boolean;
  breaking: boolean;
  trend: "ca" | "us" | null;
};

export type HeroSlide = StorySlide | OriginalSlide;

export const slideKey = (sl: HeroSlide) => (sl.kind === "original" ? sl.original.id : sl.story.id);
const slideTitle = (sl: HeroSlide, locale: "en" | "fr") => (sl.kind === "original" ? sl.original.title : display(sl.story, locale).title);

const SLIDE_MS = 7000;
/** Our own videos get longer on stage: the silent preview needs time to land. */
const ORIGINAL_MS = 12000;

/**
 * The front page's live desk: our own productions first, then the stories the
 * most newsrooms are covering, one at a time on a dark stage, with a live column
 * of the newest headlines beside it. Auto-advances; pauses on hover, on keyboard
 * focus, while a video plays with sound, with the pause button, and never moves
 * for reduced-motion readers.
 */
export function LiveHero({ slides, latest }: { slides: HeroSlide[]; latest: Story[] }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const paused = hover || userPaused || reduced || mediaPlaying;
  const n = slides.length;
  const idx = n ? i % n : 0;
  const curKey = n ? slideKey(slides[idx]) : "";
  const lastKey = useRef(curKey);
  useEffect(() => { lastKey.current = curKey; setMediaPlaying(false); }, [curKey]);
  // A refresh can add or drop slides; stay on the one the reader is looking at.
  const keys = slides.map(slideKey).join("|");
  useEffect(() => {
    const k = slides.findIndex(sl => slideKey(sl) === lastKey.current);
    if (k >= 0 && k !== i % Math.max(n, 1)) setI(k);
  }, [keys]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const cur = n ? slides[idx] : null;
  const slideMs = cur?.kind === "original" ? ORIGINAL_MS : SLIDE_MS;

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setI(x => (x + 1) % n), slideMs);
    return () => clearTimeout(t);
  }, [idx, paused, n, slideMs]);

  if (!cur) return null;

  return (
    <section className="bg-night text-white" aria-roledescription="carousel" aria-label={fr ? "À la une, en direct" : "Top stories, live"}>
      <div className="container-mw py-6 lg:py-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div
          className={`min-w-0 ${paused ? "hero-paused" : ""}`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(false); }}
          onKeyDown={e => {
            if (e.key === "ArrowRight") { setI(x => (x + 1) % n); e.preventDefault(); }
            if (e.key === "ArrowLeft") { setI(x => (x - 1 + n) % n); e.preventDefault(); }
          }}
        >
          {cur.kind === "original"
            ? <OriginalStage key={cur.original.id} o={cur.original} onPlayingChange={setMediaPlaying} />
            : <StoryStage key={cur.story.id} s={cur} />}

          {/* Slide picker with progress */}
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr)) auto` }} role="tablist" aria-label={fr ? "Choisir une nouvelle" : "Choose a story"}>
            {slides.map((sl, k) => (
              <button
                key={slideKey(sl)}
                role="tab"
                aria-selected={k === idx}
                aria-label={slideTitle(sl, locale)}
                onClick={() => setI(k)}
                className={`press self-start text-left min-w-0 group/tab ${k === idx ? "text-white" : "text-white/55 hover:text-white/85"}`}
              >
                <span className="block h-[3px] bg-white/15 overflow-hidden transition-[height] group-hover/tab:h-[5px]">
                  {k === idx ? (
                    <span key={`p-${idx}-${paused}`} className="block h-full bg-signal hero-progress" style={{ ["--hero-ms" as string]: `${slideMs}ms` }} />
                  ) : k < idx ? <span className="block h-full bg-white/40" /> : null}
                </span>
                <span className="hidden md:block mt-2 text-[0.8rem] font-semibold leading-snug line-clamp-2">
                  {sl.kind === "original" && <span className="text-signal">Original · </span>}
                  {slideTitle(sl, locale)}
                </span>
              </button>
            ))}
            <button
              onClick={() => setUserPaused(p => !p)}
              className="press self-start -mt-1 p-1.5 text-white/70 hover:text-white"
              aria-label={userPaused ? (fr ? "Reprendre le défilement" : "Resume rotation") : (fr ? "Mettre en pause" : "Pause rotation")}
            >
              {userPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <LiveColumn stories={latest} />
      </div>
    </section>
  );
}

/**
 * A story on the stage. The photo and the words never share pixels: the photo
 * fills the right of the stage (the top on phones) and the headline sits on a
 * solid panel that overlaps its edge, so every headline reads cleanly whatever
 * the picture behind it.
 */
function StoryStage({ s }: { s: StorySlide }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const d = display(s.story, locale);
  return (
    <StoryLink s={s.story} className="group relative grid min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] lg:grid-cols-12 bg-night-2 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass">
      {/* Photo, or the house pattern when there is none */}
      <div className="relative aspect-[16/10] lg:aspect-auto lg:[grid-column:5/13] lg:[grid-row:1] overflow-hidden">
        {s.story.image ? (
          <div className="absolute inset-0 hero-kenburns">
            <StoryImage src={s.story.image} alt="" eager className="img-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-signal" aria-hidden="true">
            <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--signal-ink) 0 2px, transparent 2px 22px)" }} />
            <p className="absolute right-6 bottom-6 left-0 text-right masthead-serif text-signal-ink text-[3.4rem] sm:text-[4.8rem] lg:text-[5.6rem] leading-none whitespace-nowrap overflow-hidden">{storyKicker(s.story, locale)}</p>
          </div>
        )}
        {/* a short fade only where the panel meets the photo */}
        <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-night-2 to-transparent" aria-hidden="true" />
        {s.story.image && <span className="absolute top-3 right-3 bg-night/80 text-white/85 text-[0.7rem] px-1.5 py-0.5">Photo: {s.story.source}</span>}
      </div>

      <div className="relative z-10 lg:[grid-column:1/8] lg:[grid-row:1] self-end flex">
        <div className="hero-in w-full bg-night-2 lg:bg-night-2/95 lg:backdrop-blur-sm p-5 sm:p-8 lg:pl-10 lg:pr-12 lg:pt-8 lg:pb-9 border-l-[6px] border-signal">
          <p className="flex flex-wrap items-center gap-2 text-[0.8rem] font-bold">
            {s.breaking ? (
              <span className="bg-live text-white px-2 py-0.5">{fr ? "Dernière heure" : "Breaking"}</span>
            ) : s.developing ? (
              <span className="inline-flex items-center gap-1.5 bg-white text-live px-2 py-0.5"><span className="live-dot" aria-hidden="true" />{fr ? "En développement" : "Developing"}</span>
            ) : null}
            {s.trend && <span className="bg-signal text-signal-ink px-2 py-0.5">{fr ? `Tendance Google ${s.trend === "ca" ? "Canada" : "É.-U."}` : `Trending on Google ${s.trend === "ca" ? "Canada" : "U.S."}`}</span>}
            <span className="text-signal">{storyKicker(s.story, locale)}</span>
            {s.outlets >= 2 && <span className="text-white/75">{fr ? `${s.outlets} médias en parlent` : `${s.outlets} outlets reporting`}</span>}
          </p>
          <h2 className="hl text-white text-[1.9rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.04] mt-3 text-balance">
            <span className="headline-sweep">{d.title}</span>
          </h2>
          {d.summary && <p className="font-serif text-white/80 text-[1.05rem] sm:text-[1.15rem] leading-relaxed mt-3 max-w-[56ch] line-clamp-3">{d.summary}</p>}
          <p className="mt-4 text-[0.85rem] text-white/65 flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-white/85">{s.story.source}</span>
            <HeroTime iso={s.story.publishedAt} />
            {d.ai && <span>{fr ? "Titre du pupitre IA" : "AI desk headline"}</span>}
            {s.sources.length > 1 && <span className="truncate">{fr ? "Aussi : " : "Also: "}{s.sources.filter(x => x !== s.story.source).slice(0, 4).join(", ")}</span>}
          </p>
        </div>
      </div>
    </StoryLink>
  );
}

/**
 * Our own production on the stage: the vertical video beside its headline.
 * It plays a silent preview while it is the active slide; the play button
 * restarts it with sound and holds the carousel until it ends or is paused.
 */
function OriginalStage({ o, onPlayingChange }: { o: Original; onPlayingChange: (v: boolean) => void }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const previewOk = usePreviewOk();
  const [sound, setSound] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);

  const start = () => {
    const v = vid.current;
    setSound(true);
    onPlayingChange(true);
    if (v) { v.muted = false; v.currentTime = 0; v.controls = true; v.loop = false; v.play().catch(() => {}); }
  };

  return (
    <div className="relative overflow-hidden min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] bg-night-2">
      {o.posterUrl && <img src={o.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover scale-125 blur-2xl opacity-40" aria-hidden="true" />}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,24,28,0.96)_0%,rgba(6,24,28,0.7)_55%,rgba(6,24,28,0.4)_100%)]" aria-hidden="true" />
      <div className="relative grid min-h-[inherit] items-center gap-6 p-5 sm:p-8 lg:p-10 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="hero-in order-2 sm:order-1 min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[0.8rem] font-bold">
            <span className="bg-signal text-signal-ink px-2 py-0.5">{fr ? "Original AI Broadsheet" : "AI Broadsheet Original"}</span>
            <span className="text-signal">{originalKind(o, fr)}</span>
            <span className="text-white/75 tabular-nums">{mmss(o.durationSec)}</span>
          </p>
          <h2 className="hl text-white text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem] leading-[1.02] mt-3 max-w-[20ch] text-balance">{o.title}</h2>
          <p className="font-serif text-white/80 text-[1.08rem] sm:text-[1.2rem] leading-relaxed mt-3 max-w-[56ch] line-clamp-3">{o.summary}</p>
          <button onClick={start} className="press mt-5 inline-flex items-center gap-2 bg-signal text-signal-ink font-bold px-5 py-2.5">
            <Volume2 className="h-5 w-5" aria-hidden="true" />
            {sound ? (fr ? "Revoir avec le son" : "Replay with sound") : (fr ? "Regarder avec le son" : "Watch with sound")}
          </button>
          <p className="mt-3 text-[0.85rem] text-white/65">
            {o.kind === "titles"
              ? (fr ? "Voix d'IA" : "AI voice")
              : (fr ? "Voix d'IA, d'après " : "AI voice, from ") + o.sources.map(x => x.name).slice(0, 3).join(", ")}
          </p>
        </div>
        <div className="order-1 sm:order-2 justify-self-center sm:justify-self-end">
          <div className="hero-in relative aspect-[9/16] h-[300px] sm:h-[400px] lg:h-[460px] bg-black shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
            {o.fileUrl ? (
              <video
                ref={vid}
                src={o.fileUrl}
                poster={o.posterUrl}
                muted
                loop
                playsInline
                autoPlay={previewOk}
                preload={previewOk ? "auto" : "none"}
                onEnded={() => onPlayingChange(false)}
                onPause={e => { if (sound && e.currentTarget.paused) onPlayingChange(false); }}
                onPlay={() => { if (sound) onPlayingChange(true); }}
                className="h-full w-full object-cover"
              >
                <track kind="captions" />
              </video>
            ) : o.posterUrl ? <img src={o.posterUrl} alt="" className="img-cover" /> : null}
            {!sound && (
              <button onClick={start} aria-label={`${fr ? "Lire" : "Play"}: ${o.title}`} className="press group absolute inset-0 grid place-items-center">
                <span className="play-ring grid place-items-center h-16 w-16 rounded-full bg-signal text-signal-ink group-hover:scale-105 transition-transform">
                  <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" aria-hidden="true" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroTime({ iso }: { iso: string }) {
  const { locale } = useLocale();
  const now = useNow();
  return <time dateTime={iso} suppressHydrationWarning>{timeAgo(iso, now, locale)}</time>;
}

/** Newest headlines with a ticking clock; new arrivals flash in and the counter bumps. */
function LiveColumn({ stories }: { stories: Story[] }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const now = useNow();
  const [clock, setClock] = useState<string | null>(null);
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString(fr ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [fr]);

  const list = stories.slice(0, 7);
  const ids = list.map(s => s.id).join(",");
  useEffect(() => {
    if (!seen.current) { seen.current = new Set(list.map(s => s.id)); return; }
    const arrived = list.filter(s => !seen.current!.has(s.id)).map(s => s.id);
    arrived.forEach(id => seen.current!.add(id));
    if (arrived.length) setFresh(new Set(arrived));
  }, [ids]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastHour = now ? stories.filter(s => now - new Date(s.publishedAt).getTime() < 3600_000).length : null;

  return (
    <aside className="min-w-0 border-t border-white/15 lg:border-t-0 lg:border-l lg:pl-6 pt-5 lg:pt-0" aria-label={fr ? "Fil en direct" : "Live feed"}>
      <div className="flex items-baseline justify-between gap-3 pb-3 border-b-[3px] border-signal">
        <p className="flex items-center gap-2 font-bold text-[1.15rem]"><span className="live-dot" aria-hidden="true" />{fr ? "En direct" : "Live"}</p>
        <p className="tabular-nums text-white/70 text-[0.9rem]" aria-live="off" suppressHydrationWarning>{clock ?? " "}</p>
      </div>
      {lastHour !== null && (
        <p key={lastHour} className="count-bump text-[0.8rem] text-white/60 mt-2">
          {fr ? `${lastHour} nouvelle${lastHour === 1 ? "" : "s"} dans la dernière heure` : `${lastHour} ${lastHour === 1 ? "story" : "stories"} in the last hour`}
        </p>
      )}
      <ol className="mt-1" aria-live="polite">
        {list.map(s => (
          <li key={s.id} className={`border-b border-white/10 last:border-0 ${fresh.has(s.id) ? "live-in" : ""}`}>
            <StoryLink s={s} className="group block py-3 transition-transform duration-200 hover:translate-x-1">
              <p className="text-[0.75rem] text-white/55 flex gap-2">
                <time dateTime={s.publishedAt} className="text-signal font-semibold" suppressHydrationWarning>{timeAgo(s.publishedAt, now, locale)}</time>
                <span className="truncate">{s.source}</span>
              </p>
              <p className="font-semibold leading-snug mt-0.5 group-hover:underline">{display(s, locale).title}</p>
            </StoryLink>
          </li>
        ))}
      </ol>
    </aside>
  );
}
