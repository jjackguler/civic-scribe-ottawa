import { handleImgError } from "@/lib/image-fallback";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  headline?: string;
  accent?: string;
}

/** Img wrapper with bullet-proof fallback chain: primary → Picsum → newsprint SVG. */
export function NewsImage({ src, headline = "", accent, alt = "", ...rest }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      onError={handleImgError(headline, accent)}
      {...rest}
    />
  );
}
