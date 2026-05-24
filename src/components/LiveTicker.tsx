import { useLocale } from "@/lib/locale-context";
import type { LiveTickerItem } from "@/lib/data";

const toneColor: Record<LiveTickerItem["tone"], string> = {
  neutral: "text-foreground",
  alert: "text-civic-red",
  good: "text-solution",
  sport: "text-river",
  food: "text-highlight",
  transit: "text-river",
  weather: "text-civic-red",
};

export function LiveTicker({
  items, title, tone = "ink", speed = "normal",
}: {
  items: LiveTickerItem[];
  title?: string;
  tone?: "ink" | "paper" | "muted";
  speed?: "normal" | "slow";
}) {
  const { locale } = useLocale();
  const loop = [...items, ...items];
  const bg = tone === "ink" ? "bg-ink text-paper" : tone === "muted" ? "bg-secondary" : "bg-card border border-rule";
  const anim = speed === "slow" ? "animate-ticker-x-slow" : "animate-ticker-x";
  return (
    <div className={`${bg} rule-bottom`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-stretch gap-4 py-2.5 text-[12px]">
        {title && (
          <div className="shrink-0 flex items-center gap-2 pr-3 border-r border-current/20">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-civic-red pulse-ring" />
            <span className="font-sans uppercase tracking-[0.16em] text-[10.5px] font-bold">{title}</span>
          </div>
        )}
        <div className="flex-1 overflow-hidden scroll-fade-x">
          <div className={`flex gap-10 whitespace-nowrap ${anim} w-max`}>
            {loop.map((it, i) => (
              <span key={i} className="inline-flex items-center gap-3">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${toneColor[it.tone]}`}>{it.label[locale]}</span>
                <span className="font-serif">{it.text[locale]}</span>
                {it.source && <span className="text-[10px] opacity-60 italic">— {it.source}</span>}
                {it.time && <span className="text-[10px] opacity-60 tabular-nums">{it.time}</span>}
                <span className="opacity-30">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionTicker({
  items, label,
}: { items: LiveTickerItem[]; label: string }) {
  const { locale } = useLocale();
  const loop = [...items, ...items];
  return (
    <div className="bg-card border border-rule">
      <div className="flex items-stretch">
        <div className="shrink-0 px-3 py-2 bg-ink text-paper flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-civic-red pulse-ring" />
          <span className="kicker">{label}</span>
        </div>
        <div className="flex-1 overflow-hidden scroll-fade-x">
          <div className="flex gap-8 whitespace-nowrap animate-ticker-x py-2 px-4 w-max text-sm">
            {loop.map((it, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${toneColor[it.tone]}`}>{it.label[locale]}</span>
                <span className="font-serif">{it.text[locale]}</span>
                <span className="opacity-30">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
