import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Story } from "@/lib/news";
import { display, timeAgo, useNow } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { StoryLink, storyKicker } from "./StoryCard";
import { StoryImage } from "./StoryImage";

export type HeroSlide = {
  story: Story;
  outlets: number;
  sources: string[];
  developing: boolean;
  breaking: boolean;
  trend: "ca" | "us" | null;
};

const SLIDE_MS = 7000;

/**
 * The front page's live desk: the five stories the most newsrooms are
 * covering, one at a time on a dark stage, with a live column of the newest
 * headlines beside it. Auto-advances every 7 s; pauses on hover, on keyboard
 * focus, with the pause button, and never moves for reduced-motion readers.
 */
export function LiveHero({ slides, latest }: { slides: HeroSlide[]; latest: Story[] }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const paused = hover || userPaused || reduced;
  const n = slides.length;
  const idx = n ? i % n : 0;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setI(x => (x + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [idx, paused, n]);

  if (n === 0) return null;
  const s = slides[idx];
  const d = display(s.story, locale);

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
          <StoryLink s={s.story} className="group block relative overflow-hidden min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] bg-night-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass">
            {/* Backdrop: the publisher's photo, or the house pattern when there is none */}
            {s.story.image ? (
              <div key={`img-${s.story.id}`} className="absolute inset-0 hero-kenburns">
                <StoryImage src={s.story.image} alt="" eager className="img-cover" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-signal" aria-hidden="true">
                <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--signal-ink) 0 2px, transparent 2px 22px)" }} />
                <p className="absolute left-6 top-6 right-0 masthead-serif text-signal-ink text-[3.4rem] sm:text-[4.8rem] lg:text-[5.6rem] leading-none whitespace-nowrap overflow-hidden">{storyKicker(s.story, locale)}</p>
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,24,28,0.97)_0%,rgba(6,24,28,0.85)_38%,rgba(6,24,28,0.25)_70%,rgba(6,24,28,0.05)_100%)]" aria-hidden="true" />
            {s.story.image && <span className="absolute top-3 right-3 bg-night/75 text-white/85 text-[0.7rem] px-1.5 py-0.5">Photo: {s.story.source}</span>}

            <div key={s.story.id} className="hero-in absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
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
              <h2 className="hl text-white text-[2rem] sm:text-[2.8rem] lg:text-[3.4rem] leading-[1.02] mt-3 max-w-[22ch] text-balance group-hover:underline decoration-2 underline-offset-4">
                {d.title}
              </h2>
              {d.summary && <p className="font-serif text-white/80 text-[1.08rem] sm:text-[1.2rem] leading-relaxed mt-3 max-w-[60ch] line-clamp-2">{d.summary}</p>}
              <p className="mt-3 text-[0.85rem] text-white/65 flex flex-wrap gap-x-3 gap-y-1">
                <span className="font-semibold text-white/85">{s.story.source}</span>
                <HeroTime iso={s.story.publishedAt} />
                {d.ai && <span>{fr ? "Titre du pupitre IA" : "AI desk headline"}</span>}
                {s.sources.length > 1 && <span className="truncate">{fr ? "Aussi : " : "Also: "}{s.sources.filter(x => x !== s.story.source).slice(0, 4).join(", ")}</span>}
              </p>
            </div>
          </StoryLink>

          {/* Slide picker with progress */}
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr)) auto` }} role="tablist" aria-label={fr ? "Choisir une nouvelle" : "Choose a story"}>
            {slides.map((sl, k) => (
              <button
                key={sl.story.id}
                role="tab"
                aria-selected={k === idx}
                aria-label={display(sl.story, locale).title}
                onClick={() => setI(k)}
                className={`text-left min-w-0 group/tab ${k === idx ? "text-white" : "text-white/55 hover:text-white/85"}`}
              >
                <span className="block h-[3px] bg-white/15 overflow-hidden">
                  {k === idx ? (
                    <span key={`p-${idx}-${paused}`} className="block h-full bg-signal hero-progress" style={{ ["--hero-ms" as string]: `${SLIDE_MS}ms` }} />
                  ) : k < idx ? <span className="block h-full bg-white/40" /> : null}
                </span>
                <span className="hidden md:block mt-2 text-[0.8rem] font-semibold leading-snug line-clamp-2">{display(sl.story, locale).title}</span>
              </button>
            ))}
            <button
              onClick={() => setUserPaused(p => !p)}
              className="self-start -mt-1 p-1.5 text-white/70 hover:text-white"
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

function HeroTime({ iso }: { iso: string }) {
  const { locale } = useLocale();
  const now = useNow();
  return <time dateTime={iso} suppressHydrationWarning>{timeAgo(iso, now, locale)}</time>;
}

/** Newest headlines with a ticking clock; new arrivals flash in. */
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
        <p className="tabular-nums text-white/70 text-[0.9rem]" aria-live="off" suppressHydrationWarning>{clock ?? " "}</p>
      </div>
      {lastHour !== null && (
        <p className="text-[0.8rem] text-white/60 mt-2">
          {fr ? `${lastHour} nouvelle${lastHour === 1 ? "" : "s"} dans la dernière heure` : `${lastHour} ${lastHour === 1 ? "story" : "stories"} in the last hour`}
        </p>
      )}
      <ol className="mt-1" aria-live="polite">
        {list.map(s => (
          <li key={s.id} className={`border-b border-white/10 last:border-0 ${fresh.has(s.id) ? "live-in" : ""}`}>
            <StoryLink s={s} className="group block py-3">
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
