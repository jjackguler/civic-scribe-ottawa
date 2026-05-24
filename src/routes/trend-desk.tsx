import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { TrendCard } from "@/components/TrendCard";
import { TREND_ITEMS, NEIGHBORHOODS, type TrendItem, type SignalStatus, type Platform } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";

const PLATFORMS: Platform[] = ["x", "instagram", "tiktok", "facebook", "reddit", "youtube", "blog", "newsletter", "rss"];
const CATEGORIES: TrendItem["category"][] = ["politics", "transit", "sports", "food", "weather", "safety", "culture", "education", "housing", "good-news", "events"];
const STATUSES: SignalStatus[] = ["unverified", "developing", "verified", "needs-context", "misinformation", "official"];
const URGENCIES = ["low", "medium", "high", "breaking"] as const;
const SENTIMENTS = ["positive", "neutral", "concerned", "outraged", "celebratory"] as const;

export const Route = createFileRoute("/trend-desk")({
  head: () => ({ meta: [
    { title: "Trend Desk — Editorial review of Ottawa social signals" },
    { name: "description", content: "Editor cockpit for reviewing trending topics, hashtags, and citizen-submitted links before they become news." },
    { property: "og:title", content: "Trend Desk — Ottawa Civic Ledger" },
    { property: "og:description", content: "Where editors decide what's news and what's just noise." },
  ] }),
  component: TrendDeskPage,
});

function TrendDeskPage() {
  const { locale } = useLocale();
  const [platform, setPlatform] = useState<string>("all");
  const [hood, setHood] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");
  const [urgency, setUrgency] = useState<string>("all");
  const [sentiment, setSentiment] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [lang, setLang] = useState<string>("all");
  const [needsReview, setNeedsReview] = useState(false);
  const [factCheck, setFactCheck] = useState(false);
  const [good, setGood] = useState(false);

  const list = useMemo(() => TREND_ITEMS.filter(t =>
    (platform === "all" || t.platforms.includes(platform as Platform)) &&
    (hood === "all" || t.neighborhood === hood) &&
    (cat === "all" || t.category === cat) &&
    (urgency === "all" || t.urgency === urgency) &&
    (sentiment === "all" || t.sentiment === sentiment) &&
    (status === "all" || t.status === status) &&
    (lang === "all" || t.language === lang) &&
    (!needsReview || t.needsReview) &&
    (!factCheck || t.needsFactCheck) &&
    (!good || t.goodNews)
  ), [platform, hood, cat, urgency, sentiment, status, lang, needsReview, factCheck, good]);

  const Filt = ({ value, set, opts, label }: { value: string; set: (v: string) => void; opts: readonly string[]; label: string }) => (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <select value={value} onChange={e => set(e.target.value)} className="bg-paper border border-rule px-2 py-1.5 text-sm focus:outline-none focus:border-civic-red">
        <option value="all">{locale === "fr" ? "Tous" : "All"}</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Bureau des tendances" : "Trend Desk"}
        title={locale === "fr" ? "Bureau éditorial des signaux sociaux" : "Editorial cockpit for social signals"}
        dek={locale === "fr"
          ? "Chaque signal est trié, étiqueté et soumis à un éditeur avant de devenir un article. Aucun reposting automatique."
          : "Every signal is triaged, labelled, and reviewed by an editor before becoming news. Nothing auto-publishes."}
      />

      <div className="bg-card border border-rule p-4 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-civic-red" />
          <span className="kicker">{locale === "fr" ? "Filtres" : "Filters"}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Filt value={platform} set={setPlatform} opts={PLATFORMS} label="Platform" />
          <Filt value={hood}     set={setHood}     opts={NEIGHBORHOODS as unknown as string[]} label="Neighborhood" />
          <Filt value={cat}      set={setCat}      opts={CATEGORIES} label="Category" />
          <Filt value={urgency}  set={setUrgency}  opts={URGENCIES} label="Urgency" />
          <Filt value={sentiment} set={setSentiment} opts={SENTIMENTS} label="Sentiment" />
          <Filt value={status}   set={setStatus}   opts={STATUSES} label="Verification" />
          <Filt value={lang}     set={setLang}     opts={["en", "fr", "other"]} label="Language" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { v: needsReview, s: setNeedsReview, l: locale === "fr" ? "Examen requis" : "Needs review" },
            { v: factCheck,   s: setFactCheck,   l: locale === "fr" ? "Vérif. nécessaire" : "Needs fact-check" },
            { v: good,        s: setGood,        l: locale === "fr" ? "Bonnes nouvelles" : "Good news" },
          ].map(c => (
            <button
              key={c.l}
              onClick={() => c.s(!c.v)}
              className={`text-[11px] uppercase tracking-wider font-semibold border px-2.5 py-1 ${c.v ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}
            >
              {c.l}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          {list.length} {locale === "fr" ? "signaux correspondants" : "matching signals"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map(tr => <TrendCard key={tr.id} trend={tr} />)}
      </div>

      <section className="mt-14 bg-secondary p-6">
        <h3 className="font-display text-2xl">{locale === "fr" ? "Principe : signal communautaire, pas machine à rumeurs" : "Principle: community signal, not rumor machine"}</h3>
        <p className="font-serif mt-2 text-foreground/80 max-w-3xl">
          {locale === "fr"
            ? "Une tendance n'est pas un fait. Chaque sujet est étiqueté — non vérifié, en développement, vérifié, manque de contexte, ou risque de désinformation — avant d'apparaître au public."
            : "A trend is not a fact. Every topic is labelled — unverified, developing, verified, needs context, or misinformation risk — before it ever reaches the public."}
        </p>
      </section>
    </PageShell>
  );
}
