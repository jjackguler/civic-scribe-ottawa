import { ExternalLink, Play, MessageCircle, MapPin, ShieldCheck, AlertTriangle, Bookmark, Flag } from "lucide-react";
import type { TrendItem, Platform } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

const PLATFORM_STYLE: Record<Platform, { label: string; bg: string; fg: string }> = {
  x:         { label: "X / Twitter", bg: "bg-ink",       fg: "text-paper" },
  instagram: { label: "Instagram",   bg: "bg-[oklch(0.6_0.2_18)]",  fg: "text-white" },
  tiktok:    { label: "TikTok",      bg: "bg-ink",       fg: "text-paper" },
  facebook:  { label: "Facebook",    bg: "bg-[oklch(0.45_0.15_260)]", fg: "text-white" },
  reddit:    { label: "Reddit",      bg: "bg-[oklch(0.6_0.2_30)]",   fg: "text-white" },
  youtube:   { label: "YouTube",     bg: "bg-civic-red", fg: "text-white" },
  blog:      { label: "Blog",        bg: "bg-secondary", fg: "text-foreground" },
  newsletter:{ label: "Newsletter",  bg: "bg-secondary", fg: "text-foreground" },
  rss:       { label: "RSS",         bg: "bg-secondary", fg: "text-foreground" },
};

function minutesAgo(iso: string) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

const STATUS_BADGE: Record<string, { label: { en: string; fr: string }; cls: string; icon: any }> = {
  verified:        { label: { en: "Verified",        fr: "Vérifié" },              cls: "bg-solution/15 text-solution",   icon: ShieldCheck },
  official:        { label: { en: "Official source", fr: "Source officielle" },    cls: "bg-river/15 text-river",         icon: ShieldCheck },
  developing:      { label: { en: "Developing",      fr: "En développement" },     cls: "bg-highlight/30 text-foreground",icon: AlertTriangle },
  "needs-context": { label: { en: "Needs context",   fr: "Manque de contexte" },   cls: "bg-highlight/30 text-foreground",icon: AlertTriangle },
  unverified:      { label: { en: "Unverified",      fr: "Non vérifié" },          cls: "bg-secondary text-foreground",   icon: AlertTriangle },
  misinformation:  { label: { en: "Misinfo risk",    fr: "Désinformation" },       cls: "bg-civic-red/15 text-civic-red", icon: AlertTriangle },
};

export function SocialTrendCard({ trend }: { trend: TrendItem }) {
  const { locale } = useLocale();
  const platform = trend.platforms[0];
  const pstyle = PLATFORM_STYLE[platform];
  const status = STATUS_BADGE[trend.status];
  const StatusIcon = status.icon;
  const isVideo = platform === "youtube" || platform === "tiktok";
  const src = trend.sourceUrls[0];

  return (
    <article className="group bg-card border border-rule overflow-hidden flex flex-col hover:border-ink transition-colors">
      <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-${["1517457373958-b7bdd4587205","1543007630-9710e4a00a20","1492684223066-81342ee5ff30","1517614057-3c2c5b2c1c87","1518609878373-06d740f60d8b"][trend.id.charCodeAt(trend.id.length-1) % 5]}?auto=format&fit=crop&w=800&q=70`}
          alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent" />
        <div className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ${pstyle.bg} ${pstyle.fg}`}>
          {pstyle.label}
        </div>
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="h-12 w-12 rounded-full bg-paper/90 grid place-items-center"><Play className="h-5 w-5 ml-0.5 text-ink" /></span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 text-[11px] text-paper inline-flex items-center gap-1 bg-ink/70 px-2 py-0.5">
          <MapPin className="h-3 w-3" /> {trend.neighborhood}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-wider">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-bold ${status.cls}`}>
            <StatusIcon className="h-3 w-3" /> {status.label[locale]}
          </span>
          <span className="text-muted-foreground font-semibold">{trend.mentions.toLocaleString()} {t("mentions", locale)}</span>
          <span className="text-muted-foreground ml-auto">· {minutesAgo(trend.lastUpdated)} {t("minAgo", locale)}</span>
        </div>
        <h3 className="font-display text-lg leading-snug group-hover:text-civic-red transition-colors">{trend.topic[locale]}</h3>
        <p className="font-serif text-sm text-muted-foreground mt-1 leading-snug line-clamp-3">{trend.summary[locale]}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {trend.hashtags.slice(0, 4).map(h => (
            <span key={h} className="text-[10px] font-sans text-river bg-river/10 px-1.5 py-0.5">{h}</span>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-rule flex items-center gap-2 text-[11px]">
          {src && (
            <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold hover:text-civic-red">
              <ExternalLink className="h-3 w-3" /> {t("viewSource", locale)}
            </a>
          )}
          <button className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-ink" aria-label={t("save", locale)}>
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-civic-red" aria-label={t("report", locale)}>
            <Flag className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-ink" aria-label="Comments">
            <MessageCircle className="h-3.5 w-3.5" /> {Math.floor(trend.mentions / 30)}
          </button>
        </div>
      </div>
    </article>
  );
}
