import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { TRAFFIC_ALERTS, WEATHER_ALERTS } from "@/lib/data";

export function BreakingNewsBar() {
  const { locale } = useLocale();
  const items = [
    ...WEATHER_ALERTS.map(w => ({ label: locale === "fr" ? "MÉTÉO" : "WEATHER", text: w.title[locale] })),
    ...TRAFFIC_ALERTS.map(a => ({ label: a.type.toUpperCase(), text: a.title[locale] })),
    { label: locale === "fr" ? "VILLE" : "CITY", text: locale === "fr" ? "Conseil municipal : vote sur les logements abordables à Centretown" : "City council: vote on Centretown affordable housing" },
  ];
  const loop = [...items, ...items];
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
                <span className="text-civic-red font-bold tracking-widest text-[10px]">{it.label}</span>
                <span className="font-serif">{it.text}</span>
                <span className="text-paper/30">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
