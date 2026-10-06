import { useAiNews, byLocale } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

/** Thin running wire of the newest headlines across every page. */
export function LiveTicker() {
  const { locale } = useLocale();
  const { data } = useAiNews(undefined);
  const items = byLocale(data?.stories ?? [], locale).slice(0, 14);

  return (
    <div className="bg-ink text-white text-[0.875rem]">
      <div className="container-mw flex items-center gap-4 h-9">
        <span className="flex items-center gap-2 shrink-0 font-semibold">
          <span className="live-dot" aria-hidden="true" />
          {t("live", locale)}
        </span>
        <div className="flex-1 overflow-hidden fade-edges" aria-live="off">
          {items.length > 0 ? (
            <div className="flex w-max gap-10 animate-ticker whitespace-nowrap">
              {[...items, ...items].map((s, i) => (
                <a
                  key={`${s.id}-${i}`}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  tabIndex={i >= items.length ? -1 : 0}
                  aria-hidden={i >= items.length ? true : undefined}
                >
                  <span className="text-white/60 mr-2">{s.source}</span>
                  {s.title}
                </a>
              ))}
            </div>
          ) : (
            <span className="text-white/60">{t("loading", locale)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
