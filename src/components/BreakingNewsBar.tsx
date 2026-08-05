import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { TRAFFIC_ALERTS, WEATHER_ALERTS } from "@/lib/data";
import { useLiveFeed } from "@/lib/use-live-feed";

export function BreakingNewsBar() {
  const { locale } = useLocale();
  const { items } = useLiveFeed();

  const fallback = [
    ...WEATHER_ALERTS.map(w => ({ label: locale === "fr" ? "MÉTÉO" : "WEATHER", text: w.title[locale], canada: false, href: "/weather" })),
    ...TRAFFIC_ALERTS.map(a => ({ label: a.type.toUpperCase(), text: a.title[locale], canada: false, href: "/traffic" })),
  ];

  const live = items.slice(0, 18).map(i => ({
    label: i.region === "canada" ? "CANADA" : "OTTAWA",
    text: i.title,
    canada: i.region === "canada",
    href: i.link,
  }));

  const source = live.length > 0 ? live : fallback;
  const loop = [...source, ...source];

  return (
    <div className="bg-ink text-paper rule-bottom">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center gap-4 py-2 text-[12px]">
        <div className="flex items-center gap-2 shrink-0 font-sans uppercase tracking-[0.14em] text-[11px] font-semibold">
          <span className="ticker-dot" />
          {t("liveAlerts", locale)}
        </div>
        <div className="flex-1 overflow-hidden marquee-fade">
          <div className="flex gap-10 whitespace-nowrap animate-marquee w-max">
            {loop.map((it, i) => (
              <span key={i} className="inline-flex items-center gap-3">
                <span className={`${it.canada ? "text-river" : "text-civic-red"} font-bold tracking-widest text-[10px]`}>{it.label}</span>
                {it.href?.startsWith("http") ? (
                  <a href={it.href} target="_blank" rel="noopener noreferrer" className="font-serif hover:underline">{it.text}</a>
                ) : (
                  <span className="font-serif">{it.text}</span>
                )}
                <span className="text-paper/30">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
