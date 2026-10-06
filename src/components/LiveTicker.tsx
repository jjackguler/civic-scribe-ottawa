import { useAiNews, byLocale } from "@/lib/news";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

/** Running wire of the newest headlines, under the masthead on every page. */
export function LiveTicker() {
  const { locale } = useLocale();
  const { data } = useAiNews(undefined);
  const items = byLocale(data?.stories ?? [], locale).filter(s => !s.gov).slice(0, 14);

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="flex items-center gap-1.5 shrink-0 font-bold text-white bg-live rounded-[3px] px-2 py-0.5">
        <span className="live-dot" style={{ background: "#fff" }} aria-hidden="true" />
        {t("live", locale)}
      </span>
      <div className="flex-1 overflow-hidden fade-edges" aria-live="off">
        {items.length > 0 ? (
          <div className="flex w-max gap-10 animate-ticker whitespace-nowrap pl-3">
            {[...items, ...items].map((s, i) => (
              <a
                key={`${s.id}-${i}`}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-semibold text-ink"
                tabIndex={i >= items.length ? -1 : 0}
                aria-hidden={i >= items.length ? true : undefined}
              >
                <span className="text-muted-ink font-normal mr-2">{s.source}</span>
                {s.title}
              </a>
            ))}
          </div>
        ) : (
          <span className="text-muted-ink pl-3">{t("loading", locale)}</span>
        )}
      </div>
    </div>
  );
}
