import { useEffect, useRef, useState } from "react";
import type { Story } from "@/lib/news";
import { timeAgo, topicLabel, useNow } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

const INTERVAL = 7000;

/** Top photo stories, one at a time. Pauses on hover/focus; no auto-advance for reduced motion. */
export function HeroCarousel({ stories }: { stories: Story[] }) {
  const { locale } = useLocale();
  const now = useNow();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const reduced = useRef(false);

  const slides = stories.filter(s => s.image && !broken.has(s.id)).slice(0, 5);
  const idx = slides.length ? i % slides.length : 0;

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2 || reduced.current) return;
    const id = setInterval(() => setI(v => v + 1), INTERVAL);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;
  const cur = slides[idx];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("topStories", locale)}
      className="relative overflow-hidden rounded-[8px] bg-ink aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((s, n) => (
        <img
          key={s.id}
          src={s.image!}
          alt=""
          referrerPolicy="no-referrer"
          loading={n === 0 ? "eager" : "lazy"}
          onError={() => setBroken(b => new Set(b).add(s.id))}
          className={`absolute inset-0 img-cover transition-opacity duration-700 ${n === idx ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e2235f2] via-[#0e223566] to-transparent" aria-hidden="true" />

      <a
        href={cur.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-x-0 bottom-0 p-5 sm:p-8 text-white group"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-white/85 mb-2">
          {cur.region === "canada" ? "Canada" : topicLabel(cur.topic, locale)}
        </p>
        <h2 className="hl text-[1.9rem] sm:text-[2.6rem] lg:text-[3rem] max-w-3xl group-hover:underline decoration-2">{cur.title}</h2>
        {cur.summary && <p className="font-serif text-white/85 text-[1.05rem] leading-snug mt-3 max-w-2xl line-clamp-2 hidden sm:block">{cur.summary}</p>}
        <p className="text-sm text-white/75 mt-3 flex gap-3">
          <span className="font-semibold text-white">{cur.source}</span>
          <time dateTime={cur.publishedAt} suppressHydrationWarning>{timeAgo(cur.publishedAt, now, locale)}</time>
          <span>{t("photo", locale)}: {cur.source}</span>
        </p>
      </a>

      {slides.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5" role="tablist">
          {slides.map((s, n) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={n === idx}
              aria-label={`${n + 1} / ${slides.length}`}
              onClick={() => setI(n)}
              className={`h-1.5 rounded-full transition-all ${n === idx ? "w-8 bg-white" : "w-3 bg-white/45 hover:bg-white/75"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
