import { useState } from "react";
import type { Story } from "@/lib/news";
import { timeAgo, topicLabel, useNow } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { StoryImage } from "./StoryImage";

type Variant = "lead" | "card" | "row" | "text";

export function StoryMeta({ s, className = "" }: { s: Story; className?: string }) {
  const { locale } = useLocale();
  const now = useNow();
  return (
    <p className={`meta flex flex-wrap gap-x-3 gap-y-1 ${className}`}>
      <span className="font-semibold text-ink/80">{s.source}</span>
      <time dateTime={s.publishedAt} suppressHydrationWarning>{timeAgo(s.publishedAt, now, locale)}</time>
    </p>
  );
}

export function StoryCard({ s, variant = "card", showTopic = true }: { s: Story; variant?: Variant; showTopic?: boolean }) {
  const { locale } = useLocale();
  const [imgOk, setImgOk] = useState(true);
  const hasImg = !!s.image && imgOk && variant !== "text";
  const topic = s.region === "canada" ? (locale === "fr" ? "Canada" : "Canada") : topicLabel(s.topic, locale);

  const titleSize =
    variant === "lead" ? "text-[1.75rem] sm:text-[2.1rem]" :
    variant === "row" ? "text-[1.06rem]" :
    variant === "text" ? "text-[1.15rem]" : "text-[1.22rem]";

  const image = hasImg ? (
    <div className={
      variant === "row" ? "w-28 sm:w-36 shrink-0 aspect-[4/3] overflow-hidden rounded-[5px] bg-ice" :
      "aspect-[16/10] overflow-hidden rounded-[6px] bg-ice"
    }>
      <StoryImage src={s.image!} alt="" className="img-cover transition-transform duration-500 group-hover:scale-[1.03]" onFail={() => setImgOk(false)} />
    </div>
  ) : null;

  return (
    <article className="group relative">
      <a href={s.link} target="_blank" rel="noopener noreferrer" className={variant === "row" ? "flex gap-4 items-start" : "block"}>
        {variant !== "row" && image}
        <div className={variant === "row" ? "flex-1 min-w-0" : hasImg ? "mt-3" : ""}>
          {showTopic && <p className="topic mb-1">{topic}</p>}
          <h3 className={`hl ${titleSize} text-ink group-hover:text-lake transition-colors`}>{s.title}</h3>
          {(variant === "lead" || (variant === "text" && s.summary)) && s.summary && (
            <p className="dek mt-2 line-clamp-3">{s.summary}</p>
          )}
          <StoryMeta s={s} className="mt-2" />
        </div>
        {variant === "row" && image}
      </a>
    </article>
  );
}
