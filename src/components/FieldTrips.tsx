import type { ReactNode } from "react";

type Tone = "mars" | "forest" | "harbour";

/** Night band with a quiet line-drawn horizon for each trip. No illustrations of animals or people: just the land. */
export function TripBand({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <Horizon tone={tone} className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full opacity-60" />
      <div className="relative">{children}</div>
    </section>
  );
}

export function Horizon({ tone, className }: { tone: Tone; className?: string }) {
  const stroke = tone === "mars" ? "var(--brass)" : tone === "forest" ? "var(--lake)" : "var(--ice)";
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="none" className={className} aria-hidden="true">
      {tone === "mars" && (
        <>
          <circle cx="300" cy="78" r="9" fill="none" stroke="var(--ice)" strokeWidth="1" />
          <path d="M0 96 C60 88 90 70 140 74 S220 96 260 86 S340 66 400 80" fill="none" stroke={stroke} strokeWidth="1.2" />
          <path d="M0 108 C80 102 160 112 240 104 S360 100 400 106" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.6" />
        </>
      )}
      {tone === "forest" && (
        <>
          {Array.from({ length: 34 }, (_, i) => {
            const x = 6 + i * 11.6;
            const h = 30 + ((i * 37) % 50);
            const lean = ((i * 13) % 9) - 4;
            return <path key={i} d={`M${x} 120 Q${x + lean} ${120 - h / 2} ${x + lean * 2} ${120 - h}`} fill="none" stroke={stroke} strokeWidth="1" />;
          })}
        </>
      )}
      {tone === "harbour" && (
        <>
          {[84, 94, 104, 114].map((y, i) => (
            <path key={y} d={`M0 ${y} Q25 ${y - 3} 50 ${y} T100 ${y} T150 ${y} T200 ${y} T250 ${y} T300 ${y} T350 ${y} T400 ${y}`} fill="none" stroke={stroke} strokeWidth={1.1 - i * 0.2} />
          ))}
          <path d="M250 82 L330 82 L318 94 L262 94 Z" fill="none" stroke="var(--brass)" strokeWidth="1.1" />
          <path d="M290 82 L290 40 M290 44 L314 76 L290 76" fill="none" stroke="var(--brass)" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}
