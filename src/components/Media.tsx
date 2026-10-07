import { useState } from "react";
import { Headphones, Play } from "lucide-react";
import type { MediaItem } from "@/lib/media";
import { formatDuration, formatViews } from "@/lib/media";
import { timeAgo, useNow } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";

/**
 * YouTube video in YouTube's own player (privacy-enhanced mode). Nothing
 * loads from YouTube until the reader presses play.
 */
export function VideoPlayer({ v, eager = false }: { v: MediaItem; eager?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const { locale } = useLocale();
  return (
    <div className="relative aspect-video bg-black overflow-hidden">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${v.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={v.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button onClick={() => setPlaying(true)} className="group absolute inset-0 w-full" aria-label={`${locale === "fr" ? "Lire" : "Play"}: ${v.title}`}>
          <img src={v.image ?? ""} alt="" loading={eager ? "eager" : "lazy"} referrerPolicy="no-referrer" className="img-cover opacity-90 group-hover:opacity-100" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid place-items-center h-16 w-16 rounded-full bg-live text-white shadow-lg group-hover:scale-105 transition-transform">
              <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute left-0 bottom-0 bg-night/80 text-white text-[0.72rem] px-2 py-1">Video: {v.source}</span>
        </button>
      )}
    </div>
  );
}

export function MediaMeta({ m, dark = false, className = "", hideSource = false }: { m: MediaItem; dark?: boolean; className?: string; hideSource?: boolean }) {
  const { locale } = useLocale();
  const now = useNow();
  const dur = formatDuration(m.duration);
  const views = formatViews(m.views);
  return (
    <p className={`${dark ? "text-white/65" : "text-muted-ink"} text-[0.8rem] flex flex-wrap gap-x-2.5 gap-y-0.5 ${className}`}>
      {!hideSource && <span className={`font-semibold ${dark ? "text-white/90" : "text-ink/80"}`}>{m.source}</span>}
      <time dateTime={m.publishedAt} suppressHydrationWarning>{timeAgo(m.publishedAt, now, locale)}</time>
      {dur && <span>{dur}</span>}
      {views && <span>{views} {locale === "fr" ? "vues" : "views"}</span>}
    </p>
  );
}

/** Thumbnail tile that selects a video into a player (or opens it inline). */
export function VideoTile({ v, onSelect, active = false, dark = false }: { v: MediaItem; onSelect?: () => void; active?: boolean; dark?: boolean }) {
  const [playing, setPlaying] = useState(false);
  if (!onSelect && playing) return <div><VideoPlayer v={v} /><p className={`font-semibold leading-snug mt-2 ${dark ? "text-white" : ""}`}>{v.title}</p></div>;
  return (
    <button
      onClick={() => (onSelect ? onSelect() : setPlaying(true))}
      className={`group text-left w-full ${onSelect ? "flex gap-3 items-start" : "block"}`}
      aria-pressed={onSelect ? active : undefined}
    >
      <span className={`relative block overflow-hidden bg-black shrink-0 ${onSelect ? "w-[42%] max-w-[168px] aspect-video" : "aspect-video"} ${active ? "outline outline-[3px] outline-brass" : ""}`}>
        <img src={v.image ?? ""} alt="" loading="lazy" referrerPolicy="no-referrer" className="img-cover group-hover:opacity-90" />
        <span className="absolute left-1.5 bottom-1.5 grid place-items-center h-7 w-7 rounded-full bg-live text-white">
          <Play className="h-3.5 w-3.5 translate-x-px" fill="currentColor" aria-hidden="true" />
        </span>
      </span>
      <span className={`block min-w-0 ${onSelect ? "" : "mt-2"}`}>
        <span className={`block font-semibold leading-snug line-clamp-3 group-hover:underline ${dark ? "text-white" : "text-ink"}`}>{v.title}</span>
        <MediaMeta m={v} dark={dark} className="mt-1" />
      </span>
    </button>
  );
}

/** Podcast episode with the show's own audio file. */
export function AudioEpisode({ a, compact = false }: { a: MediaItem; compact?: boolean }) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <article className="flex gap-4 items-start">
      {a.image ? (
        <img src={a.image} alt="" loading="lazy" referrerPolicy="no-referrer" className={`${compact ? "w-16 h-16" : "w-24 h-24"} shrink-0 object-cover bg-ice`} />
      ) : (
        <span className={`${compact ? "w-16 h-16" : "w-24 h-24"} shrink-0 grid place-items-center bg-night text-brass`}><Headphones className="h-7 w-7" aria-hidden="true" /></span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[0.78rem] font-bold text-brass-ink">{a.source}</p>
        <h3 className={`font-semibold leading-snug ${compact ? "text-[0.98rem] line-clamp-2" : "text-[1.08rem]"}`}>{a.title}</h3>
        <MediaMeta m={a} hideSource className="mt-0.5" />
        {!compact && a.summary && <p className="dek text-[0.95rem] mt-1.5 line-clamp-2">{a.summary}</p>}
        <div className="mt-2">
          {open ? (
            <audio controls autoPlay preload="none" src={a.audioUrl} className="w-full h-10" />
          ) : (
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-night text-white text-sm font-semibold pl-2 pr-4 py-1.5 hover:bg-lake">
              <span className="grid place-items-center h-6 w-6 rounded-full bg-brass text-night"><Play className="h-3 w-3 translate-x-px" fill="currentColor" aria-hidden="true" /></span>
              {locale === "fr" ? "Écouter" : "Listen"}
            </button>
          )}
          <a href={a.link} target="_blank" rel="noopener noreferrer" className="ml-3 text-sm text-lake font-semibold hover:underline">
            {locale === "fr" ? "Page de l'épisode" : "Episode page"}
          </a>
        </div>
      </div>
    </article>
  );
}

/** Dark interview card, for video or audio conversations. */
export function InterviewCard({ m, large = false }: { m: MediaItem; large?: boolean }) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <article className={`bg-night text-white flex flex-col h-full ${large ? "md:flex-row" : ""}`}>
      <div className={`relative ${large ? "md:w-[48%] shrink-0" : ""}`}>
        {m.type === "video" && open ? (
          <VideoPlayer v={m} />
        ) : (
          <button onClick={() => setOpen(true)} className="group block w-full relative aspect-video bg-black overflow-hidden" aria-label={`${m.type === "video" ? (locale === "fr" ? "Regarder" : "Watch") : (locale === "fr" ? "Écouter" : "Listen")}: ${m.title}`}>
            {m.image && <img src={m.image} alt="" loading="lazy" referrerPolicy="no-referrer" className={`img-cover ${m.type === "audio" ? "object-contain bg-night-2" : ""} group-hover:opacity-90`} />}
            <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 bg-live text-white text-xs font-bold px-2 py-1">
              {m.type === "video" ? <Play className="h-3 w-3" fill="currentColor" aria-hidden="true" /> : <Headphones className="h-3 w-3" aria-hidden="true" />}
              {m.type === "video" ? (locale === "fr" ? "Vidéo" : "Watch") : (locale === "fr" ? "Audio" : "Listen")}
            </span>
          </button>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[0.75rem] font-bold text-brass">{locale === "fr" ? "Entrevue" : "Interview"}</p>
        <h3 className={`hl mt-1 ${large ? "text-[1.6rem] sm:text-[2rem]" : "text-[1.25rem]"}`}>{m.title}</h3>
        {large && m.summary && <p className="font-serif text-white/75 mt-3 leading-relaxed line-clamp-4">{m.summary}</p>}
        <MediaMeta m={m} dark className="mt-auto pt-3" />
        {m.type === "audio" && open && <audio controls autoPlay preload="none" src={m.audioUrl} className="w-full h-10 mt-3" />}
      </div>
    </article>
  );
}
