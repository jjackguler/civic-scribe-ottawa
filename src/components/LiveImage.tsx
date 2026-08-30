import { type FeedRegion } from "@/lib/use-live-feed";

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  headline: string;
  region?: FeedRegion;
}

/**
 * Image for live RSS items.
 * A missing / empty / non-http src never reaches the DOM — we render a
 * real editorial illustration (region-specific) instead of a blank box.
 * Remote images that fail to load fall back to the same illustration on error.
 */
export function LiveImage({ src, headline, region = "ottawa", alt = "", ...rest }: Props) {
  const placeholder = region === "canada"
    ? "/illustrations/canada-federal.svg"
    : "/illustrations/general-ottawa.svg";
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
