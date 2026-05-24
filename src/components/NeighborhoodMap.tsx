import { Link } from "@tanstack/react-router";
import { NEIGHBORHOOD_INFO } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";

// Approximate normalized coords (0-1) within Ottawa region for stylized map
const COORDS: Record<string, [number, number]> = {
  "Downtown": [0.52, 0.42],
  "Centretown": [0.50, 0.48],
  "ByWard Market": [0.55, 0.40],
  "Sandy Hill": [0.57, 0.45],
  "Glebe": [0.49, 0.55],
  "Old Ottawa South": [0.51, 0.62],
  "Little Italy": [0.45, 0.52],
  "Chinatown": [0.46, 0.48],
  "Hintonburg": [0.41, 0.46],
  "Westboro": [0.36, 0.43],
  "Vanier": [0.60, 0.42],
  "Alta Vista": [0.58, 0.58],
  "Nepean": [0.34, 0.62],
  "Barrhaven": [0.28, 0.78],
  "Kanata": [0.14, 0.45],
  "Orleans": [0.82, 0.30],
  "Gloucester": [0.70, 0.50],
  "Rural Ottawa": [0.85, 0.82],
};

export function NeighborhoodMap() {
  const { locale } = useLocale();
  return (
    <div className="relative w-full aspect-[16/10] bg-river/5 border border-rule overflow-hidden">
      {/* River flourish */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,28 C20,22 40,38 55,32 C72,26 88,40 100,34" fill="none" stroke="oklch(0.48 0.08 230 / 0.25)" strokeWidth="2.5" />
        <path d="M0,28 C20,22 40,38 55,32 C72,26 88,40 100,34" fill="none" stroke="oklch(0.48 0.08 230 / 0.5)" strokeWidth="0.4" strokeDasharray="0.6 0.6" />
        <text x="3" y="26" fontSize="2" fill="oklch(0.48 0.08 230 / 0.7)" fontStyle="italic" fontFamily="serif">Ottawa River · Rivière des Outaouais</text>
      </svg>

      {NEIGHBORHOOD_INFO.map((n) => {
        const [x, y] = COORDS[n.name] ?? [0.5, 0.5];
        return (
          <Link
            key={n.name}
            to="/neighborhoods/$slug"
            params={{ slug: n.name.toLowerCase().replace(/\s+/g, "-") }}
            className="absolute group"
            style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: "translate(-50%,-50%)" }}
          >
            <span className="block w-2.5 h-2.5 rounded-full bg-civic-red ring-4 ring-civic-red/15 group-hover:ring-civic-red/30 transition" />
            <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-[11px] font-sans font-semibold text-foreground/80 group-hover:text-civic-red">
              {n.name}
            </span>
          </Link>
        );
      })}

      <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-paper/80 px-2 py-1 backdrop-blur">
        {locale === "fr" ? "Cliquez sur un quartier pour explorer" : "Tap a neighbourhood to explore"}
      </div>
    </div>
  );
}
