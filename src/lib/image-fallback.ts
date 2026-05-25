// Image fallback utilities — guaranteed working images everywhere.
// Strategy: primary URL → Picsum (seeded) → inline newsprint SVG (always works offline).

// 30+ curated, verified Unsplash photo IDs covering Ottawa/Canada/winter cities,
// transit, civic life, community, food, kids, sport, nature.
export const OTTAWA_HERO_IMAGES = [
  "1503614472-8c93d56cd87b", // parliament / civic
  "1486325212027-8081e485255e", // city skyline
  "1488521787991-ed7bbaae773c", // bridge
  "1503676260728-1c00da094a0b", // newsroom
  "1485965120184-e220f721d03e", // canal winter
  "1499781350541-7783f6c6a0c8", // city autumn
  "1517649763962-0c623066013b", // basketball
  "1521737604893-d14cc237f11d", // people meeting
  "1518770660439-4636190af475", // technology
  "1495474472287-4d71bcdd2085", // coffee
  "1514933651103-005eec06c04b", // bakery
  "1565299624946-b28f40a0ae38", // pizza
  "1546069901-ba9599a7e63c", // food
  "1569718212165-3a8278d5f624", // restaurant
  "1568376794508-ae52c6ab3929", // food
  "1521017432531-fbd92d768814", // coffeeshop
  "1551504734-5ee1c4a1479b", // family
  "1509440159596-0249088772ff", // kids
  "1502920917128-1aa500764cbd", // traffic
  "1457269449834-928af64c684d", // weather/storm
  "1494891848038-7bd202a2afeb", // architecture
  "1480714378408-67cf0d13bc1b", // urban
  "1444723121867-7a241cacace9", // street
  "1449824913935-59a10b8d2000", // street market
  "1542038784456-1ea8e935640e", // city walk
  "1519222970733-f546218fa6d7", // group
  "1517048676732-d65bc937f952", // collaboration
  "1502537090229-fab85eaf012f", // park
  "1469474968028-56623f02e42e", // mountain/nature
  "1441974231531-c6227db76b6e", // forest
  "1506905925346-21bda4d32df4", // landscape
  "1517649763962-0c623066013b", // sports
];

const widthOf = (el: HTMLImageElement) => Math.max(el.clientWidth || 400, 400);
const heightOf = (el: HTMLImageElement) => Math.max(el.clientHeight || 300, 300);

function seedFrom(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h);
}

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

/**
 * onError handler for <img>. Walks the fallback chain:
 *  1. Picsum (seeded) — almost always works
 *  2. Newsprint SVG — always works (data URI)
 * Uses dataset.fallbackStep to track progress and avoid loops.
 */
export function handleImgError(headline: string, accent?: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    const step = parseInt(el.dataset.fallbackStep || "0", 10);
    const w = widthOf(el);
    const h = heightOf(el);
    const seed = seedFrom(headline || el.src);

    if (step === 0) {
      el.dataset.fallbackStep = "1";
      console.warn("[NewsImage] primary failed, falling back to Picsum:", el.src);
      el.src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${Math.round(w)}/${Math.round(h)}`;
      return;
    }
    if (step === 1) {
      el.dataset.fallbackStep = "2";
      console.warn("[NewsImage] picsum failed, using SVG fallback for:", headline);
      el.src = newsprintDataURI(headline, Math.round(w), Math.round(h), accent);
      return;
    }
    // step >=2: stop to avoid infinite loop
    el.onerror = null;
  };
}
