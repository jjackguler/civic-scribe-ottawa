import { newsprintDataURI } from "@/lib/image-fallback";
import { regionAccent, type FeedRegion } from "@/lib/use-live-feed";

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  headline: string;
  region?: FeedRegion;
}

/**
 * Image for live RSS items.
 * A missing / empty / non-http src never reaches the DOM — we render the
 * newsprint SVG with the headline on the region accent colour instead.
 * Remote images that fail to load fall back to the same SVG on error.
 */
export function LiveImage({ src, headline, region = "ottawa", alt = "", ...rest }: Props) {
  const accent = regionAccent(region);
  const placeholder = newsprintDataURI(headline, 1200, 800, accent);
  const usable = typeof src === "string" && /^(https?:)?\/\//.test(src.trim());
  return (
    <img
      src={usable ? (src as string) : placeholder}
      alt={alt}
      onError={e => {
        const el = e.currentTarget;
        if (el.dataset.fallbackStep === "1") { el.onerror = null; return; }
        el.dataset.fallbackStep = "1";
        el.src = placeholder;
      }}
      {...rest}
    />
  );
}
