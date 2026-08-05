import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Clock, ExternalLink } from "lucide-react";
import { ARTICLES } from "@/lib/data";
import { newsprintDataURI } from "@/lib/image-fallback";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { useLiveFeed, regionAccent, regionBadge, type FeedItem } from "@/lib/use-live-feed";

type BreakingCard = {
  id: string;
  kicker: string;
  region: "ottawa" | "canada";
  title: string;
  image: string;
  href: string;
  external: boolean;
  urgent: boolean;
  source?: string;
  ts: string;
};

function toCard(item: FeedItem): BreakingCard {
  return {
    id: item.id,
    kicker: item.region === "canada" ? `CANADA · ${item.source}` : `OTTAWA · ${item.source}`,
    region: item.region,
    title: item.title,
    image: item.image || newsprintDataURI(item.title, 1600, 900, regionAccent(item.region)),
    href: item.link,
    external: true,
    urgent: item.urgent,
    source: item.source,
    ts: item.publishedAt,
  };
}

function fallbackCards(locale: "en" | "fr"): BreakingCard[] {
  return ARTICLES.slice(0, 3).map(a => ({
    id: a.slug,
    kicker: locale === "fr" ? "À LA UNE" : "BREAKING",
    region: "ottawa" as const,
    title: a.title[locale],
    image: newsprintDataURI(a.title.en, 1600, 900, "#C8102E"),
    href: `/article/${a.slug}`,
    external: false,
    urgent: true,
    ts: a.updatedAt ?? a.publishedAt,
  }));
}

export function BreakingHero() {
  const { locale } = useLocale();
  const { items, loading } = useLiveFeed();

  const live = useMemo(() => items.slice(0, 5).map(toCard), [items]);
  const fallback = useMemo(() => fallbackCards(locale), [locale]);

  // Cards only swap between slides, never mid-transition.
  const [cards, setCards] = useState<BreakingCard[]>(fallback);
  const pendingRef = useRef<BreakingCard[] | null>(null);
  useEffect(() => {
    const next = live.length > 0 ? live : fallback;
    if (cards.length === 0) { setCards(next); return; }
    pendingRef.current = next;
    // Adopt immediately when the current list is only the placeholder set.
    if (cards === fallback || cards[0]?.id === fallback[0]?.id) {
      setCards(next);
      pendingRef.current = null;
    }
  }, [live, fallback]); // eslint-disable-line react-hooks/exhaustive-deps

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!mounted || paused || reduced || cards.length < 2) return;
    const i = setInterval(() => {
      // Apply any queued re-ranking at the slide boundary.
      if (pendingRef.current) {
        setCards(pendingRef.current);
        pendingRef.current = null;
        setIdx(0);
        return;
      }
      setIdx(v => (v + 1) % cards.length);
    }, 8000);
    return () => clearInterval(i);
  }, [mounted, paused, reduced, cards.length]);

  useEffect(() => { if (idx >= cards.length) setIdx(0); }, [cards.length, idx]);

  const fmt = (ts: string) =>
    new Date(ts).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
      hour: "2-digit", minute: "2-digit", month: "short", day: "numeric",
    });

  return (
    <section
      className="relative overflow-hidden border border-rule bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-[420px] sm:h-[480px] lg:h-[540px]">
        {cards.map((c, i) => (
          <div
            key={c.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <LiveImage
              src={c.image}
              headline={c.title}
              region={c.region}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-3xl p-6 sm:p-10 text-paper">
                <div className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold px-2.5 py-1 ${c.urgent ? regionBadge(c.region) : "bg-paper/15 text-paper"}`}>
                  {c.urgent && <AlertTriangle className="h-3 w-3" />}
                  {c.kicker}
                </div>
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.05] mt-3 max-w-2xl">
                  {c.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-paper/85">
                  {/* Rendered after hydration only — server/client timezones differ. */}
                  <span className="inline-flex items-center gap-1.5 min-h-4">
                    <Clock className="h-3.5 w-3.5" />{mounted ? fmt(c.ts) : ""}
                  </span>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex items-center gap-1 font-semibold border-b border-paper/60 hover:border-paper pb-0.5"
                  >
                    {locale === "fr" ? "Suivre l'histoire" : "Follow the story"}
                    {c.external ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i} onClick={() => setIdx(i)}
              className={`h-1.5 transition-all ${i === idx ? "w-8 bg-civic-red" : "w-4 bg-paper/40 hover:bg-paper/70"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {mounted && loading && (
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.18em] text-paper/70">
            {locale === "fr" ? "Chargement des fils…" : "Loading live feeds…"}
          </div>
        )}
      </div>

      {/* Developing-story timeline strip */}
      <div className="bg-paper border-t border-rule px-4 sm:px-6 py-3 flex items-start gap-4 overflow-x-auto">
        <div className="shrink-0 kicker text-civic-red flex items-center gap-1.5"><span className="ticker-dot" /> {t("developingStory", locale)}</div>
        <ol className="flex items-start gap-6 text-xs">
          {(cards.length > 1 ? cards.slice(0, 4) : []).map((c) => (
            <li key={`strip-${c.id}`} className="shrink-0 max-w-[240px]">
              <div className={`font-sans font-bold ${c.region === "canada" ? "text-river" : "text-civic-red"}`}>{c.source ?? "Ottawa"}</div>
              <div className="font-serif text-foreground leading-snug line-clamp-2">{c.title}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
