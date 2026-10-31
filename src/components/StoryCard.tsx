import { t } from "@/lib/i18n";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { Story } from "@/lib/news";
import { timeAgo, topicLabel, useNow, LEVEL_LABEL, display } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { StoryImage } from "./StoryImage";
import { AiBadge } from "./Trust";

/**
 * hero  – large photo, very large headline, summary (front-page lead)
 * card  – photo above headline
 * row   – headline with a small photo on the right
 * text  – headline (and optional summary), no photo
 * list  – compact headline only, for dense headline stacks
 *
 * Every headline opens our story page, which credits the publisher, links
 * to the full article and gathers other outlets' coverage of the same event.
 */
type Variant = "hero" | "lead" | "card" | "row" | "text" | "list";

export function StoryMeta({ s, className = "", dark = false }: { s: Story; className?: string; dark?: boolean }) {
  const { locale } = useLocale();
  const now = useNow();
  return (
    <p className={`${dark ? "text-[0.8rem] text-white/65" : "meta"} flex flex-wrap gap-x-2.5 gap-y-1 ${className}`}>
      <span className={`font-semibold ${dark ? "text-white/85" : "text-ink/80"}`}>{s.source}</span>
      <time dateTime={s.publishedAt} suppressHydrationWarning>{timeAgo(s.publishedAt, now, locale)}</time>
      {s.popularity && (
        <span>
          {s.popularity.score} {s.sourceId === "hn" ? "points" : (locale === "fr" ? "votes" : "upvotes")}
          {s.popularity.comments ? ` · ${s.popularity.comments} ${locale === "fr" ? "commentaires" : "comments"}` : ""}
        </span>
      )}
    </p>
  );
}

export function storyKicker(s: Story, locale: "en" | "fr") {
  if (s.minister) return locale === "fr" ? "Ministère de l'IA" : "AI Ministry";
  if (s.level && s.level !== "federal") return LEVEL_LABEL[s.level][locale];
  if (s.kind === "lab") return locale === "fr" ? "Laboratoires" : "From the labs";
  if (s.kind === "analysis") return locale === "fr" ? "Analyse" : "Analysis";
  return topicLabel(s.topic, locale);
}

/**
 * Designed cover for a story we have no photo for (or may not show one, see
 * rights.ts): the desk and the publisher on quiet newsprint. It is a graphic,
 * never an AI picture made to look like a news photo, and it tells the reader
 * where the reporting lives.
 */
export function StoryCover({ s, size }: { s: Story; size: "hero" | "card" }) {
  const { locale } = useLocale();
  const hero = size === "hero";
  return (
    <figure aria-hidden="true" className="aspect-[16/9] relative overflow-hidden bg-ice text-ink border-t-[3px] border-ink">
      <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 13px, color-mix(in oklab, var(--ink) 9%, transparent) 13px 14px)" }} />
      <div className="absolute inset-y-0 left-[38%] w-px bg-ink/15" />
      <p className={`absolute left-4 right-4 top-3 flex items-center justify-between gap-3 ${hero ? "text-[0.8rem]" : "text-[0.68rem]"}`}>
        <span className="font-bold uppercase tracking-[0.08em] text-lake truncate">{storyKicker(s, locale)}</span>
        <span className="font-serif italic text-muted-ink shrink-0">AI Broadsheet</span>
      </p>
      <div className="absolute left-4 right-4 bottom-3 bg-ice/90 pt-2">
        <p className={`text-muted-ink ${hero ? "text-[0.85rem]" : "text-[0.7rem]"}`}>{locale === "fr" ? "Reportage de" : "Reporting by"}</p>
        <p className={`font-serif font-semibold leading-tight text-balance ${hero ? "text-[2rem] sm:text-[2.6rem]" : "text-[1.35rem]"}`}>{s.source}</p>
        <p suppressHydrationWarning className={`text-muted-ink mt-0.5 ${hero ? "text-[0.85rem]" : "text-[0.7rem]"}`}>{timeAgoLabel(s, locale)}</p>
      </div>
    </figure>
  );
}

function timeAgoLabel(s: Story, locale: "en" | "fr") {
  const d = new Date(s.publishedAt);
  return d.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Toronto" });
}

/** Link to our story page. */
export function StoryLink({ s, className, children }: { s: Story; className?: string; children: ReactNode }) {
  return (
    <Link to="/story/$id" params={{ id: s.id }} className={className}>
      {children}
    </Link>
  );
}

export function StoryCard({ s, variant = "card", showTopic = true, eager = false, badge }: {
  s: Story; variant?: Variant; showTopic?: boolean; eager?: boolean; badge?: ReactNode;
}) {
  const { locale } = useLocale();
  const [imgOk, setImgOk] = useState(true);
  const v = variant === "lead" ? "hero" : variant;
  const hasImg = !!s.image && imgOk && v !== "text" && v !== "list";
  const d = display(s, locale);

  if (v === "list") {
    return (
      <article className="group py-2.5 border-b border-line last:border-0">
        <StoryLink s={s} className="block">
          <h3 className="hl-sm text-[1.04rem] text-ink group-hover:underline decoration-1 underline-offset-2" title={d.translated || d.ai ? d.original : undefined}>{d.title}</h3>
          {(d.translated || d.ai) && <TranslatedNote ai={!!d.ai} original={d.original} compact />}
          <StoryMeta s={s} className="mt-1" />
        </StoryLink>
      </article>
    );
  }

  const titleSize =
    v === "hero" ? "text-[1.9rem] sm:text-[2.5rem] lg:text-[2.9rem] leading-[1.06]" :
    v === "row" ? "text-[1.08rem]" :
    v === "text" ? "text-[1.22rem]" : "text-[1.28rem]";

  const image = hasImg ? (
    <figure className={
      v === "row" ? "w-[38%] max-w-[150px] shrink-0 aspect-[16/10] overflow-hidden bg-ice" :
      "aspect-[16/9] overflow-hidden bg-ice relative"
    }>
      <StoryImage src={s.image!} alt="" eager={eager} className="img-cover transition-transform duration-500 group-hover:scale-[1.02]" onFail={() => setImgOk(false)} />
      {v !== "row" && (
        <figcaption className="absolute bottom-0 right-0 bg-night/75 text-white text-[0.7rem] px-1.5 py-0.5">
          Photo: {s.source}
        </figcaption>
      )}
    </figure>
  ) : v === "hero" || v === "card" ? (
    <StoryCover s={s} size={v === "hero" ? "hero" : "card"} />
  ) : null;

  return (
    <article className="group relative">
      <StoryLink s={s} className={v === "row" ? "flex gap-3 items-start" : "block"}>
        {v !== "row" && image}
        <div className={v === "row" ? "flex-1 min-w-0" : image ? (v === "hero" ? "mt-4" : "mt-2.5") : ""}>
          {(showTopic || badge) && (
            <p className="mb-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              {badge}
              {showTopic && <span className="topic">{storyKicker(s, locale)}</span>}
            </p>
          )}
          <h3 className={`hl ${titleSize} text-ink group-hover:underline decoration-1 underline-offset-4`} title={d.translated || d.ai ? d.original : undefined}>{d.title}</h3>
          {(d.translated || d.ai) && <TranslatedNote ai={!!d.ai} original={d.original} />}
          {(v === "hero" || v === "text") && d.summary && (
            <p className={`dek mt-2 ${v === "hero" ? "text-[1.15rem] line-clamp-3" : "line-clamp-2 text-[0.98rem]"}`}>{d.summary}</p>
          )}
          <StoryMeta s={s} className="mt-1.5" />
        </div>
        {v === "row" && image}
      </StoryLink>
    </article>
  );
}

/** "Developing" / "N outlets" signal on clustered stories. */
export function CoverageBadge({ outlets, developing, breaking }: { outlets: number; developing?: boolean; breaking?: boolean }) {
  const { locale } = useLocale();
  if (outlets < 2 && !developing && !breaking) return null;
  return (
    <span className="inline-flex items-center gap-2 text-[0.78rem] font-bold">
      {breaking ? (
        <span className="inline-flex items-center gap-1.5 bg-live text-white px-1.5 py-0.5">
          {locale === "fr" ? "Dernière heure" : "Breaking"}
        </span>
      ) : developing && (
        <span className="inline-flex items-center gap-1.5 text-live">
          <span className="live-dot" aria-hidden="true" />
          {locale === "fr" ? "En développement" : "Developing"}
        </span>
      )}
      {outlets >= 2 && (
        <span className="text-brass-ink">
          {locale === "fr" ? `${outlets} médias en parlent` : `${outlets} outlets reporting`}
        </span>
      )}
    </span>
  );
}

/** Label on every machine-translated or AI-desk headline, with the publisher's original. */
export function TranslatedNote({ original, compact = false, ai = false }: { original: string; compact?: boolean; ai?: boolean }) {
  const { locale } = useLocale();
  return (
    <p className="meta mt-1.5 text-[0.75rem]" title={original}>
      <AiBadge kind={ai ? "headline" : "translated"} />
      {!compact && <span className="block italic line-clamp-1 mt-1">{t("original", locale)}: {original}</span>}
    </p>
  );
}
