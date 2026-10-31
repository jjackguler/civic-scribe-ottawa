import { useEffect, useRef, useState } from "react";
import type { Story } from "@/lib/news";
import { timeAgo, useNow, display } from "@/lib/news";
import { StoryLink, TranslatedNote } from "./StoryCard";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

/**
 * Running list of the newest stories. When a background refresh brings in
 * new stories, they wait behind a "Show N new stories" button instead of
 * shifting the list while someone is reading it.
 */
export function LatestRail({ stories, fetchedAt, limit = 12 }: { stories: Story[]; fetchedAt?: string; limit?: number }) {
  const { locale } = useLocale();
  const now = useNow();
  const [shown, setShown] = useState<Story[]>(stories);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const known = useRef(new Set(stories.map(s => s.id)));

  useEffect(() => {
    if (shown.length === 0 && stories.length > 0) {
      setShown(stories);
      known.current = new Set(stories.map(s => s.id));
    }
  }, [stories, shown.length]);

  const pending = stories.filter(s => !known.current.has(s.id));

  const reveal = () => {
    setFresh(new Set(pending.map(s => s.id)));
    pending.forEach(s => known.current.add(s.id));
    setShown(stories);
  };

  return (
    <aside className="flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b-2 border-ink">
        <h2 className="font-sans font-bold uppercase tracking-[0.08em] text-[0.8rem] flex items-center gap-2.5">
          <span className="live-dot" aria-hidden="true" />
          {t("latest", locale)}
        </h2>
        {fetchedAt && (
          <span className="meta" suppressHydrationWarning>
            {t("updated", locale)} {timeAgo(fetchedAt, now, locale)}
          </span>
        )}
      </div>

      {pending.length > 0 && (
        <button
          onClick={reveal}
          className="mt-3 rounded-full bg-live text-white text-sm font-semibold py-2 hover:brightness-110"
        >
          {t("showNew", locale, { n: pending.length })}
        </button>
      )}

      <ol className="flex-1">
        {shown.slice(0, limit).map(s => (
          <li key={s.id} className={`py-3 border-b border-line last:border-0 ${fresh.has(s.id) ? "flash-new" : ""}`}>
            <StoryLink s={s} className="group block">
              <p className="meta mb-0.5 flex gap-2">
                <time dateTime={s.publishedAt} className="font-bold text-live tabular-nums" suppressHydrationWarning>{timeAgo(s.publishedAt, now, locale)}</time>
                <span className="truncate">{s.source}</span>
              </p>
              {(() => { const d = display(s, locale); return (<>
                <p className="hl-sm text-[1.02rem] group-hover:underline underline-offset-2" title={d.translated ? d.original : undefined}>{d.title}</p>
                {d.translated && <TranslatedNote original={d.original} compact />}
              </>); })()}
            </StoryLink>
          </li>
        ))}
      </ol>
    </aside>
  );
}
