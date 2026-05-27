// Image fallback utilities — guaranteed working images everywhere.
// Strategy: primary URL → inline newsprint SVG (always works offline).
// Picsum removed per editorial rule: no random external images.

const widthOf = (el: HTMLImageElement) => Math.max(el.clientWidth || 400, 400);
const heightOf = (el: HTMLImageElement) => Math.max(el.clientHeight || 300, 300);

export function newsprintDataURI(headline: string, w = 1200, h = 800, accent = "#8b1d24") {
  const safe = (headline || "Ottawa Civic Ledger").slice(0, 90).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="g" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="3" fill="${accent}"/>
      <circle cx="1" cy="1" r="0.4" fill="rgba(255,255,255,0.07)"/>
    </pattern>
    <linearGradient id="v" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.55)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#v)"/>
  <text x="48" y="${h - 80}" font-family="Georgia, 'Playfair Display', serif" font-size="${Math.round(w/22)}" fill="#f5f1e8" font-weight="700">${safe}</text>
  <text x="48" y="${h - 32}" font-family="Inter, system-ui, sans-serif" font-size="${Math.round(w/55)}" fill="rgba(245,241,232,0.65)" letter-spacing="3">OTTAWA CIVIC LEDGER</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** onError handler: primary URL → newsprint SVG. No Picsum, no randomness. */
export function handleImgError(headline: string, accent?: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.dataset.fallbackStep === "1") { el.onerror = null; return; }
    el.dataset.fallbackStep = "1";
    const w = widthOf(el), h = heightOf(el);
    el.src = newsprintDataURI(headline, Math.round(w), Math.round(h), accent);
  };
}

// Kept for backward-compatibility imports elsewhere.
export const OTTAWA_HERO_IMAGES: string[] = [];
