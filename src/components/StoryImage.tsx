import { useState } from "react";

/**
 * Publisher photo, hot-linked with no referrer and credited to its source.
 * If it fails to load, it removes itself so the card falls back to text —
 * we never substitute illustrations or stock art for news photos.
 *
 * House treatment (our visual desk): every photo is printed in the paper's
 * look — near-monochrome, a little contrast, a signal-yellow wash and a fine
 * halftone screen — so pictures from many publishers read as one newspaper.
 * Hover or focus brings the original colour back. The picture itself is not
 * altered or cropped beyond the frame, and the credit stays with the publisher.
 */
export function StoryImage({
  src, alt, className = "", eager = false, onFail, plain = false,
}: { src: string; alt: string; className?: string; eager?: boolean; onFail?: () => void; plain?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  const img = (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`${className} ${plain ? "" : "house-photo"}`}
      onError={() => { setFailed(true); onFail?.(); }}
    />
  );
  if (plain) return img;
  return (
    <span className="house-photo-frame">
      {img}
      <span className="house-photo-wash" aria-hidden="true" />
    </span>
  );
}
