import { SITE } from "@/lib/site";

/** Mark: a signal trace forming an "M", ending in a live dot — the wire is on. */
export function LogoMark({ size = 32, className = "", inverse = false }: { size?: number; className?: string; inverse?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="14" fill={inverse ? "#fff" : "#0E2235"} />
      <path d="M12 44 L22 20 L32 38 L42 20 L48 34" fill="none" stroke={inverse ? "#0E2235" : "#fff"} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="52" cy="42" r="5.5" fill="#D3322B" />
    </svg>
  );
}

export function Logo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={compact ? 30 : 36} inverse={inverse} />
      <span className={`hl hl-wide leading-none whitespace-nowrap ${inverse ? "text-white" : "text-ink"} ${compact ? "text-[1.35rem]" : "text-[1.7rem]"}`}>{SITE.name}</span>
    </span>
  );
}
