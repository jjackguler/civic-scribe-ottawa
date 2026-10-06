import { useState } from "react";
import type { Story } from "@/lib/news";
import { timeAgo, topicLabel, useNow, LEVEL_LABEL } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { StoryImage } from "./StoryImage";

/**
 * hero  – full-width photo, very large headline, summary (front-page lead)
 * card  – photo above headline
 * row   – headline with a small photo on the right
 * text  – headline (and optional summary), no photo
 * list  – compact headline only, for dense headline stacks
 */
type Variant = "hero" | "lead" | "card" | "row" | "text" | "list";

export function StoryMeta({ s, className = "" }: { s: Story; className?: string }) {
  const { locale } = useLocale();
  const now = useNow();
  return (
    <p className={`meta flex flex-wrap gap-x-2.5 gap-y-1 ${className}`}>
      <span className="font-semibold text-ink/80">{s.source}</span>
      <time dateTime={s.publishedAt} suppressHydrationWarning>{timeAgo(s.publishedAt, now, locale)}</time>
    </p>
  );
}

export function storyKicker(s: Story, locale: "en" | "fr") {
  if (s.minister) return locale === "fr" ? "Ministère de l'IA" : "AI Ministry";
  if (s.level && s.level !== "federal") return LEVEL_LABEL[s.level][locale];
  if (s.kind === "lab") return locale === "fr" ? "Laboratoires" : "AI labs";
  if (s.kind === "analysis") return locale === "fr" ? "Analyse" : "Analysis";
  if (s.region === "canada") return "Canada";
  return topicLabel(s.topic, locale);
}

export function StoryCard({ s, variant = "card", showTopic = true, eager = false }: { s: Story; variant?: Variant; showTopic?: boolean; eager?: boolean }) {
  const { locale } = useLocale();
  const [imgOk, setImgOk] = useState(true);
  const v = variant === "lead" ? "hero" : variant;
  const hasImg = !!s.image && imgOk && v !== "text" && v !== "list";

  if (v === "list") {
    return (
      <article className="group py-2.5 border-b border-line last:border-0">
        <a href={s.link} target="_blank" rel="noopener noreferrer" className="block">
          <h3 className="font-semibold leading-snug text-[0.98rem] text-ink group-hover:underline decoration-1">{s.title}</h3>
          <StoryMeta s={s} className="mt-1" />
        </a>
      </article>
    );
  }

  const titleSize =
    v === "hero" ? "text-[1.9rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.02]" :
    v === "row" ? "text-[1.02rem]" :
    v === "text" ? "text-[1.12rem]" : "text-[1.18rem]";

  const image = hasImg ? (
    <figure className={
      v === "row" ? "w-[38%] max-w-[150px] shrink-0 aspect-[16/10] overflow-hidden rounded-[3px] bg-ice" :
      v === "hero" ? "aspect-[16/9] overflow-hidden rounded-[3px] bg-ice relative" :
      "aspect-[16/9] overflow-hidden rounded-[3px] bg-ice relative"
    }>
      <StoryImage src={s.image!} alt="" eager={eager} className="img-cover transition-transform duration-500 group-hover:scale-[1.02]" onFail={() => setImgOk(false)} />
      {v !== "row" && (
        <figcaption className="absolute bottom-0 right-0 bg-ink/70 text-white text-[0.7rem] px-1.5 py-0.5">
          {locale === "fr" ? "Photo" : "Photo"}: {s.source}
        </figcaption>
      )}
    </figure>
  ) : null;

  return (
    <article className="group relative">
      <a href={s.link} target="_blank" rel="noopener noreferrer" className={v === "row" ? "flex gap-3 items-start" : "block"}>
        {v !== "row" && image}
        <div className={v === "row" ? "flex-1 min-w-0" : hasImg ? (v === "hero" ? "mt-4" : "mt-2.5") : ""}>
          {showTopic && <p className="topic mb-1">{storyKicker(s, locale)}</p>}
          <h3 className={`hl ${titleSize} text-ink group-hover:underline decoration-2 underline-offset-4`}>{s.title}</h3>
          {(v === "hero" || v === "text") && s.summary && (
            <p className={`dek mt-2 ${v === "hero" ? "text-[1.15rem] line-clamp-3" : "line-clamp-2 text-[0.98rem]"}`}>{s.summary}</p>
          )}
          <StoryMeta s={s} className="mt-1.5" />
        </div>
        {v === "row" && image}
      </a>
    </article>
  );
}
