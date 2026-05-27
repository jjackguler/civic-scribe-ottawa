import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { ARTICLES, TRAFFIC_ALERTS, WEATHER_ALERTS } from "@/lib/data";
import { newsprintDataURI } from "@/lib/image-fallback";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

type BreakingCard = {
  id: string;
  kicker: string;
  title: string;
  image: string;
  href: string;
  urgent?: boolean;
  ts: string;
};

// Deterministic SVG placeholders keyed to category color. No random selection,
// no external dependency — guaranteed to render on SSR and client identically.
const ACCENT = {
  breaking: "#C8102E",
  weather:  "#1E5F8E",
  traffic:  "#B8860B",
  housing:  "#2F5233",
};

export function BreakingHero() {
  const { locale } = useLocale();
  const cards: BreakingCard[] = [
    {
      id: "b-hero",
      kicker: locale === "fr" ? "À LA UNE" : "BREAKING",
      title: ARTICLES[0].title[locale],
      image: newsprintDataURI(ARTICLES[0].title.en, 1600, 900, ACCENT.breaking),
      href: `/article/${ARTICLES[0].slug}`,
      urgent: true,
      ts: ARTICLES[0].updatedAt ?? ARTICLES[0].publishedAt,
    },
    ...WEATHER_ALERTS.slice(0, 1).map(w => ({
      id: w.id,
      kicker: locale === "fr" ? "MÉTÉO · URGENT" : "WEATHER · URGENT",
      title: w.title[locale],
      image: newsprintDataURI(w.title.en, 1600, 900, ACCENT.weather),
      href: "/weather",
      urgent: true,
      ts: w.issuedAt,
    })),
    ...TRAFFIC_ALERTS.slice(0, 1).map(a => ({
      id: a.id,
      kicker: locale === "fr" ? "TRAFIC · EN COURS" : "TRAFFIC · DEVELOPING",
      title: a.title[locale],
      image: newsprintDataURI(a.title.en, 1600, 900, ACCENT.traffic),
      href: "/traffic",
      urgent: a.impact === "high",
      ts: a.until,
    })),
    {
      id: "b-canal",
      kicker: locale === "fr" ? "EN DÉVELOPPEMENT" : "DEVELOPING",
      title: locale === "fr"
        ? "Le conseil tient un vote serré sur 312 logements abordables à Centretown"
        : "Council holds knife-edge vote on 312 affordable units in Centretown",
      image: newsprintDataURI("Council holds knife-edge vote on affordable housing", 1600, 900, ACCENT.housing),
      href: "/article/centretown-affordable-housing-vote",
      urgent: false,
      ts: "2026-05-24T12:00:00Z",
    },
  ];

  const [idx, setIdx] = useState(0);
  // Defer the interval start to after hydration to avoid SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    const i = setInterval(() => setIdx(v => (v + 1) % cards.length), 6500);
    return () => clearInterval(i);
  }, [mounted, cards.length]);

  return (
    <section className="relative overflow-hidden border border-rule bg-ink">
      <div className="relative h-[420px] sm:h-[480px] lg:h-[540px]">
        {cards.map((c, i) => (
          <div
            key={c.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-3xl p-6 sm:p-10 text-paper">
                <div className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold px-2.5 py-1 ${c.urgent ? "bg-civic-red text-white" : "bg-paper/15 text-paper"}`}>
                  {c.urgent && <AlertTriangle className="h-3 w-3" />}
                  {c.kicker}
                </div>
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.05] mt-3 max-w-2xl">
                  {c.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-paper/85">
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{new Date(c.ts).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}</span>
                  <Link to={c.href as any} className="inline-flex items-center gap-1 font-semibold border-b border-paper/60 hover:border-paper pb-0.5">
                    {locale === "fr" ? "Suivre l'histoire" : "Follow the story"} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
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
      </div>

      {/* Developing-story timeline strip */}
      <div className="bg-paper border-t border-rule px-4 sm:px-6 py-3 flex items-start gap-4 overflow-x-auto">
        <div className="shrink-0 kicker text-civic-red flex items-center gap-1.5"><span className="ticker-dot" /> {t("developingStory", locale)}</div>
        <ol className="flex items-start gap-6 text-xs">
          {[
            { time: "20:42", text: locale === "fr" ? "Bus de remplacement en route, fréquence 7–9 min" : "Replacement buses en route, every 7–9 min" },
            { time: "20:15", text: locale === "fr" ? "OC Transpo confirme une défaillance d'aiguillage" : "OC Transpo confirms switch fault near Bayview" },
            { time: "19:58", text: locale === "fr" ? "Premier rapport citoyen — quai Tunney's Pasture" : "First citizen report — Tunney's Pasture platform" },
            { time: "19:42", text: locale === "fr" ? "Capteurs OC Transpo détectent une anomalie" : "OC Transpo sensors flag anomaly" },
          ].map((s, i) => (
            <li key={i} className="shrink-0 max-w-[220px]">
              <div className="font-sans font-bold text-civic-red">{s.time}</div>
              <div className="font-serif text-foreground leading-snug">{s.text}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
