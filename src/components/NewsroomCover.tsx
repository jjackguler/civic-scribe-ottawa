/**
 * The house cover: our article art is typographic. A kicker, one big word or
 * number from the reporting, a short line, on a colour from our palette,
 * with a quiet motif. Never a publisher's photo, never a picture of a person.
 * An optional AI illustration (abstract, from the design desk) sits behind
 * the type and is always labelled.
 */
import type { Cover, CoverColor, CoverMotif } from "@/lib/newsroom-types";
import type { Locale } from "@/lib/i18n";
import { storeFileUrl } from "@/lib/newsroom";

const TONE: Record<CoverColor, { bg: string; ink: string; soft: string; accent: string; line: string }> = {
  night: { bg: "var(--night)", ink: "#ffffff", soft: "rgba(255,255,255,.72)", accent: "var(--signal)", line: "rgba(255,255,255,.14)" },
  lake: { bg: "var(--lake)", ink: "#ffffff", soft: "rgba(255,255,255,.78)", accent: "var(--signal)", line: "rgba(255,255,255,.16)" },
  spruce: { bg: "var(--spruce)", ink: "#ffffff", soft: "rgba(255,255,255,.78)", accent: "var(--signal)", line: "rgba(255,255,255,.15)" },
  brass: { bg: "var(--brass)", ink: "var(--ink)", soft: "rgba(16,25,27,.75)", accent: "var(--night)", line: "rgba(16,25,27,.14)" },
  signal: { bg: "var(--signal)", ink: "var(--signal-ink)", soft: "rgba(17,17,17,.72)", accent: "var(--night)", line: "rgba(17,17,17,.12)" },
  paper: { bg: "var(--ice)", ink: "var(--ink)", soft: "var(--muted-ink)", accent: "var(--lake)", line: "rgba(11,42,47,.12)" },
};

function Motif({ motif, color }: { motif: CoverMotif; color: string }) {
  const common = { "aria-hidden": true, className: "nr-motif pointer-events-none absolute inset-0 h-full w-full", preserveAspectRatio: "xMidYMid slice", viewBox: "0 0 160 90" } as const;
  switch (motif) {
    case "grid":
      return (
        <svg {...common}>
          {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={i * 10} y1={0} x2={i * 10} y2={90} stroke={color} strokeWidth={0.4} />)}
          {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 10} x2={160} y2={i * 10} stroke={color} strokeWidth={0.4} />)}
        </svg>
      );
    case "rings":
      return (
        <svg {...common}>
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={150} cy={88} r={12 + i * 11} fill="none" stroke={color} strokeWidth={0.8} />)}
        </svg>
      );
    case "bars":
      return (
        <svg {...common}>
          {[34, 52, 41, 66, 58, 74, 49, 81].map((h, i) => <rect key={i} x={84 + i * 9} y={90 - h} width={6} height={h} fill={color} />)}
        </svg>
      );
    case "dots":
      return (
        <svg {...common}>
          {Array.from({ length: 12 * 7 }, (_, i) => <circle key={i} cx={8 + (i % 12) * 13} cy={8 + Math.floor(i / 12) * 13} r={1.1} fill={color} />)}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={6 + i * 7.5} x2={160} y2={6 + i * 7.5} stroke={color} strokeWidth={i % 4 === 0 ? 1.2 : 0.4} />)}
        </svg>
      );
  }
}

/**
 * `size`: "hero" on the article page and the homepage lead, "card" in grids,
 * "thumb" for the small square next to a headline in a list.
 */
export function NewsroomCover({ cover, locale, size = "card", className = "", animate = false }: {
  cover: Cover;
  locale: Locale;
  size?: "hero" | "card" | "thumb";
  className?: string;
  /** Let the big word rise in once (the article page). */
  animate?: boolean;
}) {
  const t = TONE[cover.color] ?? TONE.night;
  const c = cover[locale];
  const big = c.big || "AI";
  // The big word fills the cover's width: shorter words are set larger (container query units).
  const bigSize = size === "thumb" ? Math.min(44, 150 / Math.max(2.4, big.length)) : Math.min(size === "hero" ? 30 : 34, 135 / Math.max(2.6, big.length));
  const illustration = cover.illustration && size !== "thumb" ? cover.illustration : null;
  const fr = locale === "fr";
  return (
    <figure
      className={`nr-cover relative overflow-hidden [container-type:inline-size] ${size === "thumb" ? "aspect-square" : "aspect-[16/9]"} ${className}`}
      style={{ background: t.bg, color: t.ink }}
      data-animate={animate || undefined}
    >
      {illustration && (
        <img src={storeFileUrl(illustration.path)} alt={illustration.alt[locale]} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-luminosity" />
      )}
      <Motif motif={cover.motif} color={t.line} />
      {size === "thumb" ? (
        <span className="absolute inset-0 flex items-center justify-center p-1.5">
          <span className="hl block max-w-full truncate leading-none tracking-[-0.03em]" style={{ fontSize: `${bigSize}cqw` }}>{big}</span>
        </span>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between p-[5.5cqw]">
          <p className="flex items-center gap-[1.6cqw] font-bold leading-none" style={{ fontSize: size === "hero" ? "clamp(0.72rem, 2.6cqw, 1.05rem)" : "clamp(0.68rem, 3.2cqw, 0.9rem)" }}>
            <span aria-hidden="true" className="nr-cover-rule inline-block h-[0.32em] w-[2.2em]" style={{ background: t.accent }} />
            <span className="truncate">{c.kicker}</span>
          </p>
          <div className="min-w-0">
            <p className="nr-cover-big hl leading-[0.86] tracking-[-0.045em] break-words" style={{ fontSize: `${bigSize}cqw` }}>{big}</p>
            {c.small && (
              <p className="mt-[2.2cqw] font-serif leading-snug" style={{ color: t.soft, fontSize: size === "hero" ? "clamp(0.85rem, 3.1cqw, 1.3rem)" : "clamp(0.75rem, 3.6cqw, 1rem)" }}>{c.small}</p>
            )}
          </div>
          <p className="flex items-center justify-between gap-2 font-semibold leading-none" style={{ color: t.soft, fontSize: "clamp(0.6rem, 2.2cqw, 0.78rem)" }}>
            <span>AI Broadsheet · {fr ? "Salle de rédaction" : "Newsroom"}</span>
            {illustration && <span className="rounded-full border px-[1.2cqw] py-[0.4cqw]" style={{ borderColor: t.soft }}>{fr ? "Illustration IA" : "AI illustration"}</span>}
          </p>
        </div>
      )}
    </figure>
  );
}
