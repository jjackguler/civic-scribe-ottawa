import { handleImgError, newsprintDataURI } from "@/lib/image-fallback";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  headline?: string;
  accent?: string;
}

/**
 * Editorial image wrapper.
 * - `newsprint:<color>` sentinel → deterministic editorial SVG with the card headline.
 * - Real URL → kept as-is, falls back to a headline newsprint SVG on error.
 */
export function NewsImage({ src, headline = "", accent, alt = "", ...rest }: Props) {
  let finalSrc = src;
  if (typeof src === "string" && src.startsWith("newsprint:")) {
    const color = src.slice("newsprint:".length) || accent;
    finalSrc = newsprintDataURI(headline || "Ottawa Civic Ledger", 1200, 800, color);
  }
  return <img src={finalSrc} alt={alt} onError={handleImgError(headline, accent)} {...rest} />;
}
