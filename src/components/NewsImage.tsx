import { handleImgError, newsprintDataURI } from "@/lib/image-fallback";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  headline?: string;
  accent?: string;
}

/**
 * Editorial image wrapper.
 * - If `src` is an empty placeholder (data: SVG newsprint without a title),
 *   we rebuild it with the supplied headline so every card shows useful text.
 * - For any real URL, we keep it and fall back to a headline newsprint SVG on error.
 */
function isEmptyNewsprint(src: string) {
  // newsprintDataURI() with empty headline is what guide-data/data img() now emits.
  // Detect the encoded pattern that contains no headline text node before the watermark.
  return typeof src === "string" && src.startsWith("data:image/svg+xml") && /font-weight%3D%22700%22%3E%3C%2Ftext%3E/.test(src);
}

export function NewsImage({ src, headline = "", accent, alt = "", ...rest }: Props) {
  const finalSrc = isEmptyNewsprint(src) && headline ? newsprintDataURI(headline, 1200, 800, accent) : src;
  return <img src={finalSrc} alt={alt} onError={handleImgError(headline, accent)} {...rest} />;
}
