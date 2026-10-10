/**
 * Card of the day: the day's most share-worthy fact as one big card with a
 * share button. A key number from the newest dispatch when it has one, else
 * the dispatch in one line, else the daily quiz. Hides itself when there is
 * nothing to show.
 *
 *   <CardOfTheDay />                                  fetches by itself
 *   <CardOfTheDay initialDispatches={loader.dispatches} initialQuiz={loader.quiz} />
 *
 * Dev: open any page with ?fixture=1 to see it with sample dispatches.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { fixtureRequested, useDispatches, type DispatchList } from "@/lib/dispatch";
import { useDailyQuiz, type DailyQuiz } from "@/lib/youth";
import { pickCardOfTheDay, type CardOfTheDayPick } from "@/lib/share-content";
import { ransomStyles, seedOf, tornRect } from "@/lib/og/shapes";
import { keepNames } from "./Dispatch";
import { ShareImageButton } from "./ShareSheet";

const COPY = {
  en: { kicker: "Card of the day", read: "Read the dispatch", play: "Play today's quiz", share: "Share this card" },
  fr: { kicker: "La carte du jour", read: "Lire la dépêche", play: "Jouer au quiz du jour", share: "Partager cette carte" },
};

/** Cut-out letters for a kicker, as HTML (shown in capitals). Screen readers get the words once, as written. */
export function RansomKicker({ text, seed, on = "yellow", className = "" }: { text: string; seed: number; on?: "dark" | "yellow" | "light"; className?: string }) {
  const shown = text.toUpperCase();
  const styles = useMemo(() => ransomStyles(shown, seed, on), [shown, seed, on]);
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-[0.12em] gap-y-1 ${className}`}>
      <span className="sr-only">{text}</span>
      {[...shown].map((ch, i) => {
        if (ch === " ") return <span key={i} className="w-[0.3em]" aria-hidden="true" />;
        const st = styles[i];
        const clip = tornRect(0, 0, 100, 100, seed * 31 + i, { amp: 3.5, step: 9 }).map(([x, y]) => `${Math.max(0, Math.min(100, x)).toFixed(1)}% ${Math.max(0, Math.min(100, y)).toFixed(1)}%`).join(",");
        return (
          <span
            key={i}
            aria-hidden="true"
            className="cotd-letter inline-grid place-items-center px-[0.2em] pb-[0.06em] pt-[0.1em] leading-none"
            style={{
              background: st.bg,
              color: st.fg,
              fontFamily: st.face === "grotesk" ? "var(--font-display)" : "var(--font-serif)",
              fontStyle: st.face === "serif-italic" ? "italic" : "normal",
              fontWeight: st.weight,
              fontSize: `${st.scale}em`,
              transform: `translateY(${st.dy * 0.08}em) rotate(${st.rot}deg)`,
              clipPath: `polygon(${clip})`,
              ["--i" as string]: i,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

export function CardOfTheDay({ initialDispatches, initialQuiz, className = "" }: {
  initialDispatches?: DispatchList | null;
  initialQuiz?: DailyQuiz | null;
  className?: string;
}) {
  const { locale } = useLocale();
  const { data: dl } = useDispatches(initialDispatches);
  const { data: quiz } = useDailyQuiz(initialQuiz);
  // The pick depends on the time: make it after hydration so server and browser agree.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  const pick = useMemo(() => (now == null ? null : pickCardOfTheDay(dl?.items ?? [], null, quiz ?? null, locale, now)), [dl, quiz, locale, now]);
  if (!pick) return null;
  return <CardOfTheDayView pick={pick} className={className} />;
}

/** The card itself, for a pick made elsewhere (see pickCardOfTheDay). */
export function CardOfTheDayView({ pick, className = "" }: { pick: CardOfTheDayPick; className?: string }) {
  const { locale } = useLocale();
  const T = COPY[locale];
  // Read after hydration so the server's links match the browser's.
  const [fixture, setFixture] = useState(false);
  useEffect(() => setFixture(fixtureRequested()), []);
  const seed = seedOf(pick.content.seed) % 997;
  const linkPath = pick.link.to === "/quiz" ? "/quiz" : `/dispatch/${pick.link.id}`;
  const bigLen = pick.big?.length ?? 0;
  const hid = useId();

  return (
    <section aria-labelledby={hid} className={`cotd relative overflow-hidden bg-signal text-signal-ink ${className}`}>
      <div className="cotd-dots pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative grid gap-5 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10 lg:p-9">
        <div className="min-w-0">
          <h2 id={hid} className="text-[1.25rem] sm:text-[1.45rem]">
            <RansomKicker text={T.kicker} seed={seed} />
          </h2>
          {pick.big ? (
            <>
              <p className="cotd-big mt-4 font-display font-black leading-[0.88] tracking-[-0.03em]" style={{ fontSize: bigLen > 8 ? "clamp(3.4rem, 13vw, 7.5rem)" : "clamp(4.6rem, 22vw, 10.5rem)" }}>
                {pick.big}
              </p>
              <p className="hl mt-3 max-w-[34ch] text-[1.35rem] leading-[1.12] sm:text-[1.7rem]">{keepNames(pick.headline)}</p>
              {pick.line && <p className="mt-3 max-w-[60ch] font-serif text-[1.05rem] leading-snug text-signal-ink/80">{pick.line}</p>}
            </>
          ) : (
            <>
              <p className="hl mt-4 max-w-[24ch] text-[2rem] leading-[1.02] sm:text-[2.7rem] lg:text-[3.1rem]">{keepNames(pick.headline)}</p>
              {pick.line && (
                <p className="mt-4 max-w-[58ch] font-serif text-[1.15rem] leading-snug sm:text-[1.3rem]">
                  <span className="cotd-mark">{pick.line}</span>
                </p>
              )}
            </>
          )}
          {pick.source && <p className="mt-4 text-[0.9rem] font-semibold text-signal-ink/75">{pick.source}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-stretch">
          <ShareImageButton
            content={pick.content}
            url={linkPath}
            title={pick.headline}
            campaign="card-of-the-day"
            tone="light"
            className="min-h-12 !rounded-none border-night bg-night !text-white hover:!bg-lake"
          />
          {pick.link.to === "/quiz" ? (
            <Link to="/quiz" search={fixture ? ({ fixture: 1 } as never) : undefined} className="press inline-flex min-h-12 items-center justify-center gap-2 border-2 border-night px-4 font-bold hover:bg-night hover:text-white">
              {T.play} <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          ) : (
            <Link to="/dispatch/$id" params={{ id: pick.link.id }} search={fixture ? ({ fixture: "1" } as never) : undefined} className="press inline-flex min-h-12 items-center justify-center gap-2 border-2 border-night px-4 font-bold hover:bg-night hover:text-white">
              {T.read} <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
