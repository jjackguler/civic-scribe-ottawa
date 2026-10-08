import { useState } from "react";
import { Play } from "lucide-react";
import type { Original } from "@/lib/originals";
import { youtubePlayable } from "@/lib/originals-types";
import { timeAgo, useNow } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** One AI Broadsheet explainer: vertical video, click to play (privacy-enhanced YouTube player). */
export function OriginalCard({ o }: { o: Original }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const now = useNow();
  const [playing, setPlaying] = useState(false);
  const yt = youtubePlayable(o);
  const poster = yt ? `https://i.ytimg.com/vi/${o.youtubeId}/hqdefault.jpg` : o.posterUrl;
  return (
    <article className="min-w-0">
      <div className="relative aspect-[9/16] bg-signal overflow-hidden">
        {playing && !yt ? (
          <video src={o.fileUrl} poster={o.posterUrl} controls autoPlay playsInline className="absolute inset-0 h-full w-full object-cover bg-black">
            <track kind="captions" />
          </video>
        ) : playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${o.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={o.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="group absolute inset-0 w-full text-left" aria-label={`${fr ? "Lire" : "Play"}: ${o.title}`}>
            {poster && <img src={poster} alt="" loading="lazy" referrerPolicy="no-referrer" className={`img-cover ${yt ? "scale-[1.35]" : ""}`} />}
            <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,17,0.92),rgba(17,17,17,0.1)_60%)]" />
            <span className="absolute left-4 top-4 bg-signal text-signal-ink text-[0.75rem] font-bold px-2 py-0.5">{fr ? "Explicatif" : "Explainer"}</span>
            <span className="absolute right-4 top-4 bg-black/70 text-white text-[0.75rem] font-semibold px-2 py-0.5 tabular-nums">{mmss(o.durationSec)}</span>
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid place-items-center h-16 w-16 rounded-full bg-signal text-signal-ink shadow-lg group-hover:scale-105 transition-transform">
                <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" aria-hidden="true" />
              </span>
            </span>
            <span className="absolute left-4 right-4 bottom-4 text-white font-bold text-[1.1rem] leading-snug line-clamp-3">{o.title}</span>
          </button>
        )}
      </div>
      <p className="text-[0.88rem] opacity-80 mt-2 line-clamp-2">{o.summary}</p>
      <p className="text-[0.8rem] opacity-70 mt-1">
        <time dateTime={o.publishedAt} suppressHydrationWarning>{timeAgo(o.publishedAt, now, locale)}</time>
        {" · "}{fr ? "Voix d'IA, d'après " : "AI voice, from "}{o.sources.map(s => s.name).slice(0, 3).join(", ")}
      </p>
    </article>
  );
}
