import { SITE } from "@/lib/site";
import avatarAsset from "@/assets/ai-broadsheet-avatar.png.asset.json";
const avatarUrl = new URL(avatarAsset.url, `https://${SITE.domain}`).href;

/**
 * Broadsheet's gold lowercase b and red news dot. Use this mark on
 * the masthead, browser tab, installed app and social profiles.
 */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string; inverse?: boolean }) {
  return (
    <img src={avatarUrl} width={size} height={size} alt="" aria-hidden="true" className={`shrink-0 rounded-[4px] ${className}`} />
  );
}

export function Logo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={compact ? 30 : 38} inverse={inverse} />
      <span className={`brand-wordmark leading-none whitespace-nowrap ${inverse ? "text-brand-paper" : "text-brand-ink"} ${compact ? "text-[1.5rem]" : "text-[1.9rem]"}`}>
        {SITE.name}
      </span>
    </span>
  );
}
