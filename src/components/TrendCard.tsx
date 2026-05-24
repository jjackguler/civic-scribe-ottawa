import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import type { TrendItem, SignalStatus, Platform } from "@/lib/data";
import { TrendingUp, MapPin, Clock, ShieldCheck, AlertTriangle, HelpCircle, Loader2, Megaphone, Globe2 } from "lucide-react";

const STATUS_META: Record<SignalStatus, { label: { en: string; fr: string }; cls: string; Icon: typeof ShieldCheck }> = {
  verified:        { label: { en: "Verified",                fr: "Vérifié" },                  cls: "bg-solution text-white",      Icon: ShieldCheck },
  official:        { label: { en: "Officially confirmed",    fr: "Confirmé officiellement" },  cls: "bg-river text-white",         Icon: Megaphone },
  developing:      { label: { en: "Developing",              fr: "En développement" },         cls: "bg-highlight text-ink",       Icon: Loader2 },
  unverified:      { label: { en: "Unverified signal",       fr: "Signal non vérifié" },       cls: "bg-muted text-foreground border border-rule", Icon: HelpCircle },
  "needs-context": { label: { en: "Needs context",           fr: "Manque de contexte" },       cls: "bg-river/10 text-river border border-river/40", Icon: HelpCircle },
  misinformation:  { label: { en: "Misinformation risk",     fr: "Risque de désinformation" }, cls: "bg-civic-red text-white",     Icon: AlertTriangle },
};

const PLATFORM_LABEL: Record<Platform, string> = {
  x: "X", instagram: "IG", tiktok: "TikTok", facebook: "FB", reddit: "Reddit",
  youtube: "YT", blog: "Blog", newsletter: "Newsletter", city: "City",
  club: "Club", event: "Event", venue: "Venue", rss: "RSS",
};

export function TrendCard({ trend, compact = false }: { trend: TrendItem; compact?: boolean }) {
  const { locale } = useLocale();
  const s = STATUS_META[trend.status];
  const Icon = s.Icon;
  const fmt = (iso: string) => new Date(iso).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" });

  return (
    <article className="bg-card border border-rule p-5 flex flex-col gap-3 group hover:border-ink transition-colors">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] font-bold ${s.cls}`}>
          <Icon className="h-3 w-3" /> {s.label[locale]}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <TrendingUp className={`h-3 w-3 ${trend.delta >= 0 ? "text-solution" : "text-civic-red"}`} />
          <span className="tabular-nums font-semibold">{trend.delta >= 0 ? "+" : ""}{trend.delta}%</span>
          <span>· {trend.mentions.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")} {t("mentions", locale)}</span>
        </span>
      </div>

      <h3 className="font-display text-xl leading-snug">{trend.topic[locale]}</h3>
      {!compact && <p className="font-serif text-sm text-muted-foreground">{trend.summary[locale]}</p>}

      <div className="flex flex-wrap items-center gap-1.5">
        {trend.hashtags.map(h => (
          <span key={h} className="text-[11px] font-sans text-river border border-river/30 bg-river/5 px-1.5 py-0.5">{h}</span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground rule-top pt-3 mt-auto">
        <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" />
          {trend.platforms.map(p => PLATFORM_LABEL[p]).join(" · ")}
        </span>
        {trend.neighborhood && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{trend.neighborhood}</span>}
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(trend.lastUpdated)}</span>
        <span className="uppercase tracking-wider text-[10px] border border-rule px-1">{trend.language}</span>
        {trend.misinfoRisk === "high" && (
          <span className="inline-flex items-center gap-1 text-civic-red font-semibold uppercase tracking-wider text-[10px]">
            <AlertTriangle className="h-3 w-3" /> {t("misinformationRisk", locale)}
          </span>
        )}
      </div>
    </article>
  );
}
