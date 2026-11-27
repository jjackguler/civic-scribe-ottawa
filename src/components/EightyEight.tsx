/**
 * "88 seconds": the whole AI day in 88 seconds, at the top of the front page.
 *
 *   <EightyEight initialNews={loader.news} initialNewsroom={loader.newsroom} />
 *
 * Up to eight slides that share 88 seconds (11 s each when there are eight). Our own
 * newsroom summaries come first; a "Breaking" slide (3+ outlets within 2 h) or a
 * "Developing" one (3+ within 6 h) jumps the queue. Other outlets' stories only fill
 * the reel when the newsroom has fewer than eight fresh pieces, and are labelled so.
 *
 * The page's own Breaking strip sits above it; here breaking slides are flagged in red.
 * It plays only while on screen and the tab is visible, pauses on hover or focus,
 * never auto-plays for readers who ask for reduced motion, and ends with
 * "You're up to date" instead of looping. The data refresh by themselves
 * (news every 90 s, newsroom every 15 min), so the reel is always current.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { AiBadge } from "./Trust";
import { useLocale } from "@/lib/locale-context";
import { useNewsroom, newsroomFixtureRequested, type NewsroomList } from "@/lib/newsroom";
import type { NewsroomSummary } from "@/lib/newsroom-types";
import {
  useAiNews,
  clusterStories,
  isBreaking,
  isDeveloping,
  display,
  timeAgo,
  useNow,
  type NewsPayload,
  type Story,
} from "@/lib/news";
import type { Locale } from "@/lib/i18n";
import { deskOf, deskOfSummary, deskLabel, type DeskId } from "@/lib/desks";
import { NewsroomCover } from "./NewsroomCover";
import type { Cover, CoverColor, CoverMotif } from "@/lib/newsroom-types";
import {
  originalPublishable,
  videoSlug,
  youtubePlayable,
  type Original,
} from "@/lib/originals-types";

const TOTAL_MS = 88_000;
const MAX_SLIDES = 8;
const TICK_MS = 100;

type Flag = "breaking" | "developing" | null;

/**
 * What the slide shows beside the words (owner, 27 Nov 2026: "no picture, no video, it looks bad").
 * Our own explainer video on the same story first; then the newsroom piece's house cover; then a
 * photo only where the publisher's terms allow it (rights.ts keeps `image` for those alone);
 * otherwise a designed card in the desk's colours. Never another publisher's photo without leave,
 * never a generated picture.
 */
export type Visual =
  | { kind: "video"; original: Original }
  | { kind: "cover"; cover: Cover; label?: string }
  | { kind: "photo"; url: string; outlet: string };

export type Slide = {
  id: string;
  /** "ours": our newsroom's summary. "watch": another outlet's story, headline and link only. */
  source: "ours" | "watch";
  /** The site desk (Canada, AI, Robotics, Tech, Human stakes), shown as the slide kicker. */
  desk: DeskId;
  flag: Flag;
  headline: string;
  what: string;
  matters: string;
  outlets: string[];
  at: string;
  visual: Visual;
  /** Article slug (ours) or story id (watch). */
  target: { to: "/article/$slug"; slug: string } | { to: "/story/$id"; id: string };
};

const COPY = {
  en: {
    title: "88 seconds",
    sub: "All of AI today, in 88 seconds. Our newsroom first, updated around the clock.",
    breaking: "Breaking",
    developing: "Developing",
    ours: "Newsroom summary",
    watch: "On our watch",
    what: "What happened",
    matters: "Why it matters",
    read: "Read it",
    source: "Go to the story",
    from: "Reported by",
    outlets: (n: number) => `${n} outlets`,
    left: (s: number) => `${s} s left`,
    pause: "Pause",
    play: "Play",
    prev: "Previous",
    next: "Next",
    replay: "Watch the 88 seconds again",
    done: "You're up to date.",
    doneSub: (n: number, o: number) =>
      `${n} stories in 88 seconds, ${o} of them from our newsroom.`,
    all: "All the latest",
    reduced: "Auto-play is off because your device asks for less motion.",
    mix: (o: number, n: number) => `${o} of ${n} from our newsroom`,
    empty: "The 88 seconds are being put together. Check back in a few minutes.",
    list: "In this reel",
  },
  fr: {
    title: "88 secondes",
    sub: "Toute l'IA du jour en 88 secondes. Notre rédaction d'abord, mis à jour en continu.",
    breaking: "Dernière heure",
    developing: "En développement",
    ours: "Résumé de la rédaction",
    watch: "Sous surveillance",
    what: "Ce qui s'est passé",
    matters: "Pourquoi c'est important",
    read: "Lire",
    source: "Voir la nouvelle",
    from: "D'après",
    outlets: (n: number) => `${n} médias`,
    left: (s: number) => `${s} s restantes`,
    pause: "Pause",
    play: "Lecture",
    prev: "Précédent",
    next: "Suivant",
    replay: "Revoir les 88 secondes",
    done: "Vous êtes à jour.",
    doneSub: (n: number, o: number) =>
      `${n} nouvelles en 88 secondes, dont ${o} de notre rédaction.`,
    all: "Toutes les nouvelles",
    reduced:
      "La lecture automatique est désactivée, car votre appareil demande moins de mouvement.",
    mix: (o: number, n: number) => `${o} sur ${n} de notre rédaction`,
    empty: "Les 88 secondes se préparent. Revenez dans quelques minutes.",
    list: "Au programme",
  },
};

const firstSentence = (t: string, max = 220) => {
  const s = (t.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t).trim();
  return s.length <= max ? s : s.slice(0, s.lastIndexOf(" ", max)).replace(/[,;:\s]+$/, "") + "…";
};

const VIDEO_STOP = new Set(
  "about after again against also among because been being from have into its more most over said says than that their them then there these they this those through under what when where which while will with would your ai".split(
    " ",
  ),
);
const titleWords = (t: string) =>
  new Set(
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 4 && !VIDEO_STOP.has(w)),
  );

/** Our explainer video on this story: it links to the article, or it is recent and shares 3+ title words. */
function videoFor(
  headline: string,
  slug: string | null,
  originals: Original[],
  now: number,
): Original | undefined {
  const playable = originals.filter(
    (o) => originalPublishable(o) && (o.fileUrl || youtubePlayable(o)),
  );
  if (slug) {
    const linked = playable.find((o) =>
      [o.readMore?.url, o.readMore?.urlFr].some((u) => u?.includes(`/article/${slug}`)),
    );
    if (linked) return linked;
  }
  const want = titleWords(headline);
  return playable.find((o) => {
    if (now - Date.parse(o.publishedAt) > 4 * 86_400_000) return false;
    const have = titleWords(o.title);
    return [...want].filter((w) => have.has(w)).length >= 3;
  });
}

const DESK_LOOK: Record<DeskId, { color: CoverColor; motif: CoverMotif }> = {
  canada: { color: "signal", motif: "rules" },
  ai: { color: "night", motif: "grid" },
  robotics: { color: "spruce", motif: "bars" },
  tech: { color: "lake", motif: "dots" },
  people: { color: "brass", motif: "rings" },
};
const BIG_SKIP = new Set(
  "a an the how why what who when where new after as at by for from in into of on over to with and but or is are was were it its this that these those le la les un une des du de et en au aux pour par sur dans".split(
    " ",
  ),
);

/** The one number or name in a headline worth setting huge: "$700M", "80%", "1 million", "Nvidia". */
function bigWord(headline: string): string {
  const num = headline.match(
    /\$?\d[\d,.]*(?:\s?(?:%|percent|per cent|pour cent|million|billion|milliards?|millions?|[MBK]\b))?/i,
  );
  if (num) {
    return num[0]
      .replace(/\s?(percent|per cent|pour cent)/i, "%")
      .replace(/\s?millions?/i, "M")
      .replace(/\s?(billion|milliards?)/i, "B")
      .replace(/[.,]+$/, "")
      .trim();
  }
  const words = headline.match(/[\p{L}\p{N}][\p{L}\p{N}&'’.-]*/gu) ?? [];
  const cap = (w?: string) => !!w && /^\p{Lu}/u.test(w) && !BIG_SKIP.has(w.toLowerCase());
  const at = words.findIndex((w) => cap(w));
  if (at < 0) return "AI";
  const one = words[at].replace(/['’]s$/i, "");
  // Two-word names ("Hugging Face", "Google DeepMind") when they still fit.
  const two = cap(words[at + 1]) ? `${one} ${words[at + 1].replace(/['’]s$/i, "")}` : "";
  return (two && two.length <= 14 ? two : one).slice(0, 14);
}

/** A designed card for a story we have no picture for: desk colours, one big word, the outlets. */
function deskCover(desk: DeskId, headline: string, outlets: string[], locale: Locale): Cover {
  const look = DESK_LOOK[desk] ?? DESK_LOOK.ai;
  const big = bigWord(headline);
  const small = outlets.slice(0, 2).join(" · ");
  return {
    ...look,
    en: { kicker: deskLabel(desk, "en"), big, small },
    fr: { kicker: deskLabel(desk, "fr"), big, small },
  };
}

/** Pick the reel: breaking first, then our newsroom, then other outlets only to fill. */
function buildSlides(
  summaries: NewsroomSummary[],
  stories: Story[],
  locale: Locale,
  now: number,
  originals: Original[] = [],
): Slide[] {
  const ageH = (iso: string) => (now - Date.parse(iso)) / 3600_000;
  const fromSummary = (a: NewsroomSummary, flag: Flag): Slide => {
    const video = videoFor(a.en.headline, a.slug.en, originals, now);
    return {
      id: a.id,
      source: "ours",
      desk: deskOfSummary(a),
      flag,
      headline: a[locale].headline,
      what: firstSentence(a[locale].dek || a[locale].news),
      matters: firstSentence(a[locale].matters ?? ""),
      outlets: a.outlets,
      at: a.createdAt,
      visual: video ? { kind: "video", original: video } : { kind: "cover", cover: a.cover },
      target: { to: "/article/$slug", slug: a.slug[locale] },
    };
  };
  const fromStory = (s: Story, outlets: string[], at: string, flag: Flag): Slide => {
    const d = display(s, locale);
    const desk = deskOf(s);
    const video = videoFor(s.title, null, originals, now);
    const visual: Visual = video
      ? { kind: "video", original: video }
      : s.image
        ? { kind: "photo", url: s.image, outlet: s.source }
        : {
            kind: "cover",
            cover: deskCover(desk, d.title, outlets, locale),
            label: `AI Broadsheet · ${COPY[locale].watch}`,
          };
    return {
      id: s.id,
      source: "watch",
      desk,
      flag,
      headline: d.title,
      what: d.summary ? firstSentence(d.summary) : "",
      matters: "",
      outlets,
      at,
      visual,
      target: { to: "/story/$id", id: s.id },
    };
  };

  const fresh = summaries
    .filter((a) => ageH(a.createdAt) < 48)
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const clusters = clusterStories(stories, 24);
  const used = new Set<string>();
  const out: Slide[] = [];

  // 1. Breaking / developing: told in our words when the newsroom has covered it.
  const hot = clusters
    .map((c) => ({
      c,
      flag: (isBreaking(c, now) ? "breaking" : isDeveloping(c, now) ? "developing" : null) as Flag,
    }))
    .filter((x) => x.flag)
    .sort((x, y) =>
      x.flag === y.flag ? y.c.sources - x.c.sources : x.flag === "breaking" ? -1 : 1,
    )
    .slice(0, 2);
  for (const { c, flag } of hot) {
    const ids = new Set(c.stories.map((s) => s.id));
    const ours = fresh.find((a) => !used.has(a.id) && a.storyIds.some((id) => ids.has(id)));
    if (ours) {
      used.add(ours.id);
      out.push(fromSummary(ours, flag));
    } else {
      const lead = c.stories.find((s) => s.lang === locale) ?? c.lead;
      out.push(fromStory(lead, [...new Set(c.stories.map((s) => s.source))], c.latest, flag));
    }
    c.stories.forEach((s) => used.add(s.id));
  }

  // 2. Our newsroom, newest first.
  for (const a of fresh) {
    if (out.length >= MAX_SLIDES) break;
    if (used.has(a.id) || a.storyIds.some((id) => used.has(id))) continue;
    used.add(a.id);
    a.storyIds.forEach((id) => used.add(id));
    out.push(fromSummary(a, null));
  }

  // 3. Only on a thin day: the events several outlets are covering.
  for (const c of clusters) {
    if (out.length >= MAX_SLIDES) break;
    if (c.sources < 2 || c.stories.some((s) => used.has(s.id))) continue;
    c.stories.forEach((s) => used.add(s.id));
    const lead = c.stories.find((s) => s.lang === locale) ?? c.lead;
    out.push(fromStory(lead, [...new Set(c.stories.map((s) => s.source))], c.latest, null));
  }
  return out;
}

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

/** true while at least a third of the element is on screen and the tab is visible. */
function useOnScreen(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.33 });
    io.observe(el);
    const vis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [ref]);
  return inView && visible;
}

export function EightyEight({
  initialNews,
  initialNewsroom,
  originals = [],
  className = "",
}: {
  initialNews?: NewsPayload | null;
  initialNewsroom?: NewsroomList | null;
  /** Our explainer videos: a slide plays the one made from its story. */
  originals?: Original[];
  className?: string;
}) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const now = useNow();
  const { data: news } = useAiNews(initialNews);
  const { data: nr } = useNewsroom(initialNewsroom);

  // Rebuild only when the data change, so a refresh never yanks the slide being read.
  const slides = useMemo(
    () =>
      now == null
        ? []
        : buildSlides(nr?.items ?? [], news?.stories ?? [], locale, Date.now(), originals),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nr, news, locale, now == null, originals],
  );
  const n = slides.length;
  const per = n > 0 ? TOTAL_MS / n : TOTAL_MS;
  const oursCount = slides.filter((s) => s.source === "ours").length;

  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root);
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [elapsed, setElapsed] = useState(0); // ms into the current slide
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false); // hover or keyboard focus inside
  const [done, setDone] = useState(false);
  const playing = !reduced && !paused && !hold && !done && onScreen && n > 0;

  useEffect(() => {
    if (i >= n && n > 0) {
      setI(n - 1);
    }
  }, [i, n]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed((e) => {
        if (e + TICK_MS < per) return e + TICK_MS;
        setI((x) => {
          if (x + 1 >= n) {
            setDone(true);
            return x;
          }
          return x + 1;
        });
        return 0;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [playing, per, n]);

  const go = (to: number) => {
    setDone(false);
    setElapsed(0);
    setI(Math.max(0, Math.min(n - 1, to)));
  };
  const replay = () => {
    setDone(false);
    setPaused(false);
    setElapsed(0);
    setI(0);
  };

  const left = Math.max(0, Math.ceil((TOTAL_MS - (Math.min(i, n - 1) * per + elapsed)) / 1000));
  const s = slides[Math.min(i, Math.max(0, n - 1))];

  return (
    <section
      ref={root}
      className={className}
      aria-labelledby="eighty-eight"
      aria-roledescription="carousel"
    >
      <div className="relative overflow-hidden bg-night text-white">
        <div
          className="p-4 sm:p-6 lg:p-8"
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false);
          }}
        >
          <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <h2 id="eighty-eight" className="flex items-center gap-3">
                <span className="live-dot" aria-hidden="true" />
                <span className="hl text-[2.2rem] sm:text-[2.8rem] leading-none tracking-tight">
                  <span className="text-brass">88</span> {locale === "fr" ? "secondes" : "seconds"}
                </span>
              </h2>
              <p className="mt-2 text-white/80 text-[0.98rem] max-w-[56ch]">{c.sub}</p>
            </div>
            {n > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="tabular-nums font-bold text-[1.6rem] leading-none text-brass mr-2"
                  aria-live="off"
                  aria-label={c.left(left)}
                >
                  {done ? "0" : left}
                  <span className="text-[0.9rem] font-semibold text-white/70"> s</span>
                </span>
                <CtlButton label={c.prev} onClick={() => go(i - 1)} disabled={i === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </CtlButton>
                {done ? (
                  <CtlButton label={c.replay} onClick={replay}>
                    <RotateCcw className="h-4 w-4" />
                  </CtlButton>
                ) : (
                  <CtlButton
                    label={paused || reduced ? c.play : c.pause}
                    onClick={() => {
                      if (reduced) go(i + 1);
                      else setPaused((p) => !p);
                    }}
                  >
                    {paused || reduced ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </CtlButton>
                )}
                <CtlButton
                  label={c.next}
                  onClick={() => (i + 1 >= n ? setDone(true) : go(i + 1))}
                  disabled={done}
                >
                  <ChevronRight className="h-4 w-4" />
                </CtlButton>
              </div>
            )}
          </header>

          {n === 0 ? (
            <p className="mt-6 text-white/80">{c.empty}</p>
          ) : (
            <>
              {/* One segment per slide, Instagram-story style. */}
              <ol className="mt-5 flex gap-1.5" aria-label={c.list}>
                {slides.map((x, k) => (
                  <li key={x.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => go(k)}
                      className="block w-full py-1.5"
                      aria-label={`${k + 1}/${n}: ${x.headline}`}
                      aria-current={k === i && !done ? "step" : undefined}
                    >
                      <span className="block h-[3px] rounded-full bg-white/25 overflow-hidden">
                        <span
                          className={`block h-full ${x.flag === "breaking" ? "bg-live" : "bg-brass"}`}
                          style={{
                            width: `${done || k < i ? 100 : k > i ? 0 : Math.min(100, (elapsed / per) * 100)}%`,
                            transition: k === i && playing ? `width ${TICK_MS}ms linear` : "none",
                          }}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
                <div
                  className="min-h-[15rem] sm:min-h-[13rem]"
                  aria-live={playing ? "off" : "polite"}
                >
                  {done ? (
                    <div className="eighty-in">
                      <p className="hl text-[2rem] sm:text-[2.4rem] leading-tight">{c.done}</p>
                      <p className="mt-2 text-white/80">{c.doneSub(n, oursCount)}</p>
                      <ul className="mt-5 grid grid-cols-4 gap-2 max-w-[34rem]" aria-label={c.list}>
                        {slides.slice(0, 8).map((x, k) => (
                          <li key={x.id}>
                            <button
                              type="button"
                              onClick={() => go(k)}
                              className="block w-full overflow-hidden ring-1 ring-white/15 hover:ring-brass focus-visible:ring-brass"
                              aria-label={`${k + 1}/${n}: ${x.headline}`}
                            >
                              <SlideVisual s={x} active={false} compact />
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={replay}
                          className="inline-flex items-center gap-2 bg-brass text-night font-bold px-4 py-2 hover:bg-white"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          {c.replay}
                        </button>
                        <Link
                          to="/news"
                          className="inline-flex items-center gap-1 border border-white/40 px-4 py-2 font-semibold hover:border-white"
                        >
                          {c.all} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    s && <SlideView key={s.id} s={s} index={i} total={n} playing={playing} />
                  )}
                </div>

                <ol className="hidden lg:grid content-start gap-0.5 border-l border-white/15 pl-6">
                  {slides.map((x, k) => (
                    <li key={x.id}>
                      <button
                        type="button"
                        onClick={() => go(k)}
                        className={`w-full text-left flex gap-3 py-1.5 group ${k === i && !done ? "text-white" : "text-white/60 hover:text-white"}`}
                      >
                        <span
                          className={`tabular-nums text-[0.8rem] font-bold pt-0.5 w-5 shrink-0 ${x.flag === "breaking" ? "text-live" : "text-brass"}`}
                        >
                          {k + 1}
                        </span>
                        <span className="w-16 shrink-0 overflow-hidden" aria-hidden="true">
                          <SlideVisual s={x} active={false} compact />
                        </span>
                        <span className="text-[0.95rem] leading-snug line-clamp-2 group-hover:underline">
                          {x.headline}
                        </span>
                      </button>
                    </li>
                  ))}
                  <li className="mt-3 text-[0.8rem] text-white/55">{c.mix(oursCount, n)}</li>
                </ol>
              </div>
              {reduced && <p className="mt-4 text-[0.82rem] text-white/60">{c.reduced}</p>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SlideView({
  s,
  index,
  total,
  playing,
}: {
  s: Slide;
  index: number;
  total: number;
  playing: boolean;
}) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const now = useNow();
  const outletLine =
    s.outlets.slice(0, 3).join(", ") + (s.outlets.length > 3 ? ` +${s.outlets.length - 3}` : "");
  return (
    <article
      className="eighty-in grid gap-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-start"
      aria-roledescription="slide"
      aria-label={`${index + 1} / ${total}`}
    >
      <SlideVisual s={s} active={playing} />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.08em]">
          {s.flag && (
            <span
              className={`px-2 py-0.5 ${s.flag === "breaking" ? "bg-live text-white" : "bg-white text-night"}`}
            >
              {s.flag === "breaking" ? c.breaking : c.developing}
            </span>
          )}
          <span className="text-white">{deskLabel(s.desk, locale)}</span>
          <span className={s.source === "ours" ? "text-brass" : "text-white/70"}>
            {s.source === "ours" ? c.ours : c.watch}
          </span>
          {s.source === "ours" && <AiBadge kind="summary" dark />}
          <span className="text-white/50 font-semibold normal-case tracking-normal">
            ·{" "}
            <time dateTime={s.at} suppressHydrationWarning>
              {timeAgo(s.at, now, locale)}
            </time>
          </span>
        </p>
        <SlideLink s={s} className="group block mt-3">
          <h3 className="hl text-[1.55rem] sm:text-[1.8rem] lg:text-[2.1rem] leading-[1.08] group-hover:underline decoration-1 underline-offset-4">
            {s.headline}
          </h3>
        </SlideLink>
        {s.what && (
          <p className="mt-3 font-serif text-[1.05rem] sm:text-[1.12rem] leading-snug text-white/85 max-w-[62ch]">
            {s.what}
          </p>
        )}
        {s.matters && (
          <p className="mt-3 text-[0.96rem] leading-snug max-w-[62ch]">
            <span className="font-bold text-brass">{c.matters}: </span>
            <span className="text-white/85">{s.matters}</span>
          </p>
        )}
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem] text-white/65">
          {s.outlets.length > 0 && (
            <span>
              {c.from} <span className="font-semibold text-white/85">{outletLine}</span>
            </span>
          )}
          <SlideLink
            s={s}
            className="inline-flex items-center gap-1 font-semibold text-brass hover:underline"
          >
            {s.source === "ours" ? c.read : c.source}{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </SlideLink>
        </p>
      </div>
    </article>
  );
}

const mmss = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;

/**
 * The slide's picture. `active`: the reel is playing this slide, so our video plays (muted, looping)
 * and covers drift slowly. `compact`: a small thumbnail (list, end card), still and without labels.
 */
function SlideVisual({
  s,
  active,
  compact = false,
}: {
  s: Slide;
  active: boolean;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const v = s.visual;
  const vid = useRef<HTMLVideoElement>(null);
  const o = v.kind === "video" ? v.original : null;
  const poster = o
    ? youtubePlayable(o) && !o.posterUrl
      ? `https://i.ytimg.com/vi/${o.youtubeId}/hqdefault.jpg`
      : o.posterUrl
    : undefined;
  const plays = !!o?.fileUrl && !compact;

  useEffect(() => {
    const el = vid.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);

  const box = `relative block aspect-video w-full overflow-hidden bg-black ${compact ? "" : "ring-1 ring-white/10"}`;

  if (v.kind === "video" && o) {
    return (
      <figure className={box}>
        {poster && (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-60"
          />
        )}
        {plays ? (
          <video
            ref={vid}
            src={o.fileUrl}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={o.title}
            className="relative h-full w-full object-contain"
          />
        ) : (
          poster && (
            <img
              src={poster}
              alt={compact ? "" : o.title}
              loading="lazy"
              className="relative h-full w-full object-contain"
            />
          )
        )}
        {!compact && (
          <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent p-3 pt-8 text-[0.8rem] font-semibold">
            <span className="inline-flex items-center gap-2">
              <span className="bg-brass px-1.5 py-0.5 text-night font-bold uppercase tracking-[0.06em] text-[0.68rem]">
                {fr ? "Notre vidéo" : "Our video"}
              </span>
              <span className="tabular-nums text-white/85">{mmss(o.durationSec)}</span>
            </span>
            <Link
              to="/video/$slug"
              params={{ slug: videoSlug(o) }}
              className="inline-flex items-center gap-1 text-white hover:text-brass"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              {fr ? "Regarder avec le son" : "Watch with sound"}
            </Link>
          </figcaption>
        )}
        {compact && (
          <span className="absolute bottom-1 left-1 grid h-5 w-5 place-items-center rounded-full bg-brass text-night">
            <Play className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
      </figure>
    );
  }

  if (v.kind === "photo") {
    return (
      <figure className={box}>
        <img
          src={v.url}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover ${active ? "eighty-drift" : ""}`}
        />
        {!compact && (
          <figcaption className="absolute bottom-0 right-0 bg-black/70 px-2 py-1 text-[0.7rem] text-white/80">
            Photo: {v.outlet}
          </figcaption>
        )}
      </figure>
    );
  }

  if (v.kind !== "cover") return null;
  return (
    <div className={box}>
      <NewsroomCover
        cover={v.cover}
        locale={locale}
        size={compact ? "thumb" : "hero"}
        label={v.label}
        className={`h-full w-full ${compact ? "!aspect-video" : ""} ${active ? "eighty-drift" : ""}`}
      />
    </div>
  );
}

function SlideLink({
  s,
  className,
  children,
}: {
  s: Slide;
  className?: string;
  children: React.ReactNode;
}) {
  if (s.target.to === "/article/$slug") {
    const fixture = newsroomFixtureRequested() ? ({ fixture: "1" } as never) : undefined;
    return (
      <Link
        to="/article/$slug"
        params={{ slug: s.target.slug }}
        search={fixture}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link to="/story/$id" params={{ id: s.target.id }} className={className}>
      {children}
    </Link>
  );
}

function CtlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/30 text-white hover:border-white hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
