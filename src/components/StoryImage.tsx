import { useState } from "react";

/**
 * Publisher photo, hot-linked with no referrer and credited to its source.
 * If it fails to load, it removes itself so the card falls back to text —
 * we never substitute illustrations or stock art for news photos.
 */
export function StoryImage({
  src, alt, className = "", eager = false, onFail,
}: { src: string; alt: string; className?: string; eager?: boolean; onFail?: () => void }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => { setFailed(true); onFail?.(); }}
    />
  );
}
