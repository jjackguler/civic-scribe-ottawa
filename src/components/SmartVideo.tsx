import { useState } from "react";
import { Play, AlertTriangle, VolumeX } from "lucide-react";

export interface SmartVideoProps {
  src: string;
  source: "youtube" | "vimeo" | "direct" | "pexels";
  title: string;
  aspectRatio?: "16/9" | "9/16" | "1/1";
  poster?: string;
  autoplay?: boolean; // muted only
  caption?: string;
  contentWarning?: string;
  className?: string;
}

const pad: Record<NonNullable<SmartVideoProps["aspectRatio"]>, string> = {
  "16/9": "56.25%", "9/16": "177.77%", "1/1": "100%",
};

function buildEmbed(src: string, source: SmartVideoProps["source"], autoplay?: boolean) {
  const a = autoplay ? "1" : "0";
  switch (source) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${src}?rel=0&modestbranding=1&playsinline=1&mute=1&autoplay=${a}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${src}?muted=1&dnt=1&autoplay=${a}`;
    default:
      return src;
  }
}

export function SmartVideo({
  src, source, title, aspectRatio = "16/9", poster, autoplay, caption, contentWarning, className = "",
}: SmartVideoProps) {
  const [accepted, setAccepted] = useState(!contentWarning);
  const [playing, setPlaying] = useState(!!autoplay);
  const ratio = pad[aspectRatio];
  const isFrame = source === "youtube" || source === "vimeo";

  return (
    <figure className={`smart-video ${className}`}>
      <div className="relative w-full overflow-hidden bg-ink" style={{ paddingBottom: ratio }}>
        {!accepted && contentWarning && (
          <div className="absolute inset-0 grid place-items-center bg-ink/95 text-paper p-6 text-center z-10">
            <div className="max-w-sm">
              <AlertTriangle className="h-6 w-6 text-civic-red mx-auto" />
              <p className="font-display text-lg mt-2">Content advisory</p>
              <p className="text-sm text-paper/80 mt-1">{contentWarning}</p>
              <button
                onClick={() => { setAccepted(true); setPlaying(true); }}
                className="mt-4 bg-civic-red text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold"
              >Continue</button>
            </div>
          </div>
        )}

        {accepted && !playing && (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 group"
            aria-label={`Play video: ${title}`}
          >
            {poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <span className="absolute left-4 right-4 bottom-4 text-left text-paper">
              <span className="kicker text-civic-red flex items-center gap-1"><VolumeX className="h-3 w-3" /> Muted</span>
              <span className="font-display text-lg mt-1 block leading-tight">{title}</span>
            </span>
            <span className="absolute inset-0 grid place-items-center">
              <span className="h-14 w-14 rounded-full bg-civic-red grid place-items-center group-hover:scale-105 transition-transform">
                <Play className="h-6 w-6 text-paper ml-0.5" />
              </span>
            </span>
          </button>
        )}

        {accepted && playing && isFrame && (
          <iframe
            src={buildEmbed(src, source, true)}
            title={title}
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}
        {accepted && playing && !isFrame && (
          <video src={src} poster={poster} controls muted playsInline className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      {caption && (
        <figcaption className="mt-1.5 text-[11px] text-muted-foreground font-serif italic">{caption}</figcaption>
      )}
    </figure>
  );
}
