import { useEffect, useMemo, useRef, useState } from "react";

type AR = "16/9" | "4/3" | "1/1" | "3/4" | "21/9" | "3/2";

export interface SmartImageProps {
  query: string;
  alt: string;
  aspectRatio: AR;
  priority?: boolean;
  caption?: string;
  credit?: string;
  seed?: string;
  className?: string;
  sizes?: string;
}

const ratioMap: Record<AR, { pad: string; w: number; h: number }> = {
  "16/9": { pad: "56.25%", w: 1600, h: 900 },
  "4/3":  { pad: "75%",    w: 1200, h: 900 },
  "1/1":  { pad: "100%",   w: 1000, h: 1000 },
  "3/4":  { pad: "133.33%",w: 900,  h: 1200 },
  "21/9": { pad: "42.85%", w: 2100, h: 900 },
  "3/2":  { pad: "66.66%", w: 1500, h: 1000 },
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * SmartImage — reserved-aspect image with skeleton + blur-up + automatic fallback chain.
 * Sources tried in order: Unsplash Source → Picsum (seeded) → inline SVG newsprint placeholder.
 */
export function SmartImage({
  query, alt, aspectRatio, priority, caption, credit, seed, className = "", sizes,
}: SmartImageProps) {
  const { pad, w, h } = ratioMap[aspectRatio];
  const stableSeed = seed ?? String(hash(query));
  const chain = useMemo(() => {
    const q = encodeURIComponent(query.trim());
    return [
      `https://source.unsplash.com/${w}x${h}/?${q},ottawa`,
      `https://picsum.photos/seed/${encodeURIComponent(stableSeed)}/${w}/${h}`,
    ];
  }, [query, w, h, stableSeed]);

  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => { setLoaded(false); setFailed(false); setIdx(0); }, [query]);

  const svgFallback = useMemo(() => {
    const txt = query.slice(0, 64);
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>
        <defs>
          <pattern id='p' width='4' height='4' patternUnits='userSpaceOnUse'>
            <rect width='4' height='4' fill='#efece4'/>
            <circle cx='1' cy='1' r='0.5' fill='#c8c2b3'/>
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#p)'/>
        <text x='50%' y='50%' text-anchor='middle' font-family='Georgia, serif' font-size='${Math.round(w/22)}' fill='#5a544a'>${txt}</text>
      </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [query, w, h]);

  const src = failed ? svgFallback : chain[idx];

  return (
    <figure className={`smart-image ${className}`}>
      <div className="relative w-full overflow-hidden bg-secondary" style={{ paddingBottom: pad }}>
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-muted/40 to-secondary" aria-hidden />
        )}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (idx < chain.length - 1) setIdx(i => i + 1);
            else setFailed(true);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-700 ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"}`}
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-1.5 text-[11px] text-muted-foreground font-serif italic">
          {caption}{caption && credit ? " · " : ""}{credit && <span className="not-italic uppercase tracking-wider text-[10px]">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
