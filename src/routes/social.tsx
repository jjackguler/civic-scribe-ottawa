import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { SocialTrendCard } from "@/components/SocialTrendCard";
import { TREND_ITEMS, type Platform } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";

const PLATFORMS: { v: Platform | "all"; label: string }[] = [
  { v: "all", label: "All" },
  { v: "x", label: "X" },
  { v: "instagram", label: "Instagram" },
  { v: "tiktok", label: "TikTok" },
  { v: "facebook", label: "Facebook" },
  { v: "reddit", label: "Reddit" },
  { v: "youtube", label: "YouTube" },
  { v: "blog", label: "Blogs" },
  { v: "newsletter", label: "Newsletters" },
];

export const Route = createFileRoute("/social")({
  head: () => ({ meta: [
    { title: "Social Trends — Ottawa Civic Ledger" },
    { name: "description", content: "What Ottawa is talking about — verified social signals from X, Instagram, TikTok, YouTube, Facebook, Reddit, local blogs and newsletters." },
  ]}),
  component: SocialPage,
});

function SocialPage() {
  const { locale } = useLocale();
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const list = useMemo(
    () => platform === "all" ? TREND_ITEMS : TREND_ITEMS.filter(t => t.platforms.includes(platform)),
    [platform]
  );

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Mur social" : "Social wall"}
        title={locale === "fr" ? "Ce dont Ottawa parle aujourd'hui" : "What Ottawa is talking about today"}
        dek={locale === "fr"
          ? "Signaux publics, jamais de contenu privé. Chaque carte est étiquetée par notre rédaction avant d'apparaître."
          : "Public signals only — no private content. Every card is labelled by our newsroom before it appears."}
      />

      <div className="sticky top-[110px] z-10 bg-paper/95 backdrop-blur -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3 rule-bottom mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {PLATFORMS.map(p => (
            <button
              key={p.v}
              onClick={() => setPlatform(p.v)}
              className={`text-[11px] uppercase tracking-wider font-semibold border px-2.5 py-1 whitespace-nowrap transition-colors ${platform === p.v ? "bg-ink text-paper border-ink" : "border-rule hover:border-ink"}`}
            >
              {p.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{list.length} {locale === "fr" ? "tendances" : "trends"}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map(tr => <SocialTrendCard key={tr.id} trend={tr} />)}
      </div>
    </PageShell>
  );
}
