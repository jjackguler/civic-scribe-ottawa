import { SITE } from "@/lib/site";

/**
 * Mark: a front page in miniature — the masthead bar, a lead photo and its
 * column of type — with the live dot. Brass on night, night on paper.
 */
export function LogoMark({ size = 32, className = "", inverse = false }: { size?: number; className?: string; inverse?: boolean }) {
  const fg = inverse ? "#C9A24D" : "#0B2A2F";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="58" height="58" rx="7" fill="none" stroke={fg} strokeWidth="4.5" />
      <rect x="12" y="12" width="40" height="8" rx="1" fill={fg} />
      <rect x="12" y="26" width="19" height="26" rx="1" fill={fg} />
      <path d="M37 28h15M37 36h15M37 44h8" stroke={fg} strokeWidth="4" strokeLinecap="round" />
      <circle cx="51" cy="47" r="4.5" fill="#D7372F" />
    </svg>
  );
}

export function Logo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={compact ? 30 : 38} inverse={inverse} />
      <span className={`masthead-serif leading-none whitespace-nowrap ${inverse ? "text-white" : "text-ink"} ${compact ? "text-[1.5rem]" : "text-[1.9rem]"}`}>
        {SITE.name}
      </span>
    </span>
  );
}
