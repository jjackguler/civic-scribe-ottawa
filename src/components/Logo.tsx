import { SITE } from "@/lib/site";

/**
 * A folded front page with a spark of intelligence. Use the same mark on
 * the masthead, browser tab, installed app and social profiles.
 */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string; inverse?: boolean }) {
  return (
    <img src="/favicon.svg?v=news-spark" width={size} height={size} alt="" aria-hidden="true" className={`shrink-0 ${className}`} />
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
