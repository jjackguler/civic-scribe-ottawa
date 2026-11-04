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

export function Logo({ compact = false, inverse = false, masthead = false }: { compact?: boolean; inverse?: boolean; masthead?: boolean }) {
  return (
    <span className={`inline-flex items-center ${masthead ? "gap-3" : "gap-2.5"}`}>
      <LogoMark size={masthead ? 46 : compact ? 30 : 38} inverse={inverse} />
      <span className={`brand-wordmark leading-none whitespace-nowrap ${inverse ? "text-brand-paper" : "text-brand-ink"} ${masthead ? "text-[2.1rem] lg:text-[2.7rem]" : compact ? "text-[1.5rem]" : "text-[1.9rem]"}`}>
        {/* Title case with "AI" in gold: in Bodoni capitals "BROADSHEET" split into "BRO ADSHEET". */}
        <span className={inverse ? "text-brand-gold" : undefined}>AI</span>{"\u00a0"}Broadsheet
      </span>
    </span>
  );
}
