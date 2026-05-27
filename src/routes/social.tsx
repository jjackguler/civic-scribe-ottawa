import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { SocialTrendCard } from "@/components/SocialTrendCard";
import { TREND_ITEMS, type Platform } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import {
  TrendingUp, Rss, MessageSquare, Youtube, Send, FileEdit, ShieldCheck,
  ExternalLink, AlertTriangle, Users, Link as LinkIcon
} from "lucide-react";

export const Route = createFileRoute("/social")({
  head: () => ({ meta: [
    { title: "Free Signal Desk — What Ottawa is talking about" },
    { name: "description", content: "A free-source signal desk: Google Trends, local RSS, Reddit, YouTube RSS and reader-submitted links — every signal labelled, none paid." },
    { property: "og:title", content: "Free Signal Desk — Ottawa Civic Ledger" },
    { property: "og:description", content: "No paid social APIs. Just free public signals, clearly labelled." },
  ]}),
  component: SocialPage,
});

type Lane = {
  id: string;
  Icon: any;
  name: { en: string; fr: string };
  blurb: { en: string; fr: string };
  status: "live" | "pending" | "manual";
  sources: { label: string; url?: string; note?: string }[];
};

const LANES: Lane[] = [
  {
    id: "google-trends",
    Icon: TrendingUp,
    name: { en: "Google Trends — Ottawa", fr: "Google Tendances — Ottawa" },
    blurb: {
      en: "Top rising search queries in the Ottawa-Gatineau region, pulled from the free Google Trends RSS.",
      fr: "Requêtes en hausse dans la région Ottawa-Gatineau, via le flux RSS gratuit de Google Tendances.",
    },
    status: "pending",
    sources: [
      { label: "Google Trends — daily RSS (CA)", url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=CA" },
      { label: "Google Trends Explore — Ottawa", url: "https://trends.google.com/trends/explore?geo=CA-ON-657" },
    ],
  },
  {
    id: "rss-news",
    Icon: Rss,
    name: { en: "Local news RSS", fr: "RSS médias locaux" },
    blurb: {
      en: "Free RSS feeds from CBC Ottawa, Radio-Canada, Apt613, Le Droit, City of Ottawa newsroom.",
      fr: "Flux RSS gratuits : CBC Ottawa, Radio-Canada, Apt613, Le Droit, salle de presse Ville d'Ottawa.",
    },
    status: "live",
    sources: [
      { label: "CBC Ottawa", url: "https://www.cbc.ca/webfeed/rss/rss-canada-ottawa" },
      { label: "Radio-Canada Ottawa-Gatineau", url: "https://ici.radio-canada.ca/rss/4159" },
      { label: "City of Ottawa newsroom", url: "https://ottawa.ca/en/news" },
      { label: "Apt613", url: "https://apt613.ca/feed" },
      { label: "Le Droit", url: "https://www.ledroit.com/rss" },
    ],
  },
  {
    id: "reddit",
    Icon: MessageSquare,
    name: { en: "Reddit — r/Ottawa & neighbourhoods", fr: "Reddit — r/Ottawa et quartiers" },
    blurb: {
      en: "Top posts from r/Ottawa, r/OttawaCycling, r/Vanier, r/Kanata. Read-only JSON, no paid API.",
      fr: "Publications de r/Ottawa, r/OttawaCycling, r/Vanier, r/Kanata. JSON public, aucune API payante.",
    },
    status: "pending",
    sources: [
      { label: "r/Ottawa — top day", url: "https://www.reddit.com/r/ottawa/top/.json?t=day" },
      { label: "r/OttawaCycling", url: "https://www.reddit.com/r/ottawacycling/.json" },
      { label: "r/Kanata", url: "https://www.reddit.com/r/kanata/.json" },
      { label: "r/Vanier", url: "https://www.reddit.com/r/vanier/.json" },
    ],
  },
  {
    id: "youtube",
    Icon: Youtube,
    name: { en: "YouTube RSS — civic channels", fr: "RSS YouTube — chaînes civiques" },
    blurb: {
      en: "New uploads via YouTube's free per-channel RSS: Ottawa Council Live, OC Transpo, Ottawa Police updates.",
      fr: "Nouveaux téléversements via le flux RSS YouTube gratuit : Conseil d'Ottawa, OC Transpo, mises à jour de la police." ,
    },
    status: "manual",
    sources: [
      { label: "Ottawa Council Live", note: "channel_id pending admin config" },
      { label: "OC Transpo", note: "channel_id pending admin config" },
      { label: "Ottawa Police", note: "channel_id pending admin config" },
    ],
  },
  {
    id: "submitted",
    Icon: Users,
    name: { en: "Reader-submitted links", fr: "Liens soumis par les lecteurs" },
    blurb: {
      en: "Publicly shared posts flagged by readers. Held for editor review before they appear on the public wall.",
      fr: "Publications publiques signalées par les lecteurs. Mises en file pour revue avant publication.",
    },
    status: "pending",
    sources: [
      { label: "Submission queue (held for review)", note: "0 pending — be the first" },
    ],
  },
];

const STATUS: Record<Lane["status"], { en: string; fr: string; cls: string; Icon: any }> = {
  live:    { en: "Live source",          fr: "Source active",      cls: "bg-solution/15 text-solution border-solution/30", Icon: ShieldCheck },
  pending: { en: "Source pending review", fr: "Source en revue",   cls: "bg-highlight/30 text-foreground border-highlight", Icon: AlertTriangle },
  manual:  { en: "Manual config required", fr: "Config manuelle requise", cls: "bg-secondary text-foreground border-rule", Icon: AlertTriangle },
};

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

function LaneCard({ lane }: { lane: Lane }) {
  const { locale } = useLocale();
  const s = STATUS[lane.status];
  const SIcon = s.Icon;
  const Icon = lane.Icon;
  return (
    <article className="bg-card border border-rule p-5 flex flex-col h-full">
      <div className="flex items-start gap-3 mb-2">
        <div className="h-10 w-10 grid place-items-center bg-secondary"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight">{lane.name[locale]}</h3>
          <p className="text-[13px] font-serif text-muted-foreground mt-1 leading-snug">{lane.blurb[locale]}</p>
        </div>
      </div>
      <div className="my-2">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[10px] uppercase tracking-wider font-bold ${s.cls}`}>
          <SIcon className="h-3 w-3" /> {s[locale]}
        </span>
      </div>
      <ul className="mt-1 space-y-1 text-[12px] font-sans">
        {lane.sources.map(src => (
          <li key={src.label} className="flex items-start gap-2 py-1 rule-bottom">
            <LinkIcon className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-river hover:underline inline-flex items-center gap-1">
                  {src.label} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-ink">{src.label}</span>
              )}
              {src.note && <span className="block text-[11px] text-muted-foreground italic">{src.note}</span>}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

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
        kicker={locale === "fr" ? "Bureau des signaux libres" : "Free Signal Desk"}
        title={locale === "fr" ? "Ce dont Ottawa parle — sources libres uniquement" : "What Ottawa is talking about — free sources only"}
        dek={locale === "fr"
          ? "Pas d'API payante. Que des flux publics : Google Tendances, RSS médias locaux, Reddit, RSS YouTube et liens soumis par les lecteurs."
          : "No paid APIs. Just public feeds: Google Trends, local RSS, Reddit, YouTube RSS and reader-submitted links."}
      />

      {/* CTAs */}
      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <Link to="/submit"
          className="group flex items-start gap-3 p-4 border border-ink bg-ink text-paper hover:bg-civic-red hover:border-civic-red transition-colors">
          <Send className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <div className="font-display text-base">{locale === "fr" ? "Soumettre un lien social" : "Submit a social link"}</div>
            <p className="text-[12px] opacity-80 mt-1">{locale === "fr" ? "Public seulement. Vérifié avant publication." : "Public only. Verified before publishing."}</p>
          </div>
        </Link>
        <Link to="/submit"
          className="group flex items-start gap-3 p-4 border border-ink hover:bg-ink hover:text-paper transition-colors">
          <FileEdit className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <div className="font-display text-base">{locale === "fr" ? "Créer un brouillon" : "Create a draft"}</div>
            <p className="text-[12px] opacity-80 mt-1">{locale === "fr" ? "Transformez un signal en article civique." : "Turn a signal into a civic article."}</p>
          </div>
        </Link>
        <Link to="/fact-check"
          className="group flex items-start gap-3 p-4 border border-ink hover:bg-ink hover:text-paper transition-colors">
          <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <div className="font-display text-base">{locale === "fr" ? "Demander une vérification" : "Request a fact-check"}</div>
            <p className="text-[12px] opacity-80 mt-1">{locale === "fr" ? "Notre rédaction recoupe avec des sources primaires." : "Our newsroom cross-checks against primary sources."}</p>
          </div>
        </Link>
      </div>

      {/* Lanes */}
      <section className="mb-12">
        <header className="mb-4">
          <div className="kicker text-civic-red mb-1">{locale === "fr" ? "Voies de signaux" : "Signal lanes"}</div>
          <h2 className="font-display text-2xl md:text-3xl">{locale === "fr" ? "D'où viennent nos signaux" : "Where the signals come from"}</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANES.map(l => <LaneCard key={l.id} lane={l} />)}
        </div>
      </section>

      {/* Trend wall */}
      <section>
        <header className="mb-4 flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="kicker text-civic-red mb-1">{locale === "fr" ? "Mur des tendances" : "Trend wall"}</div>
            <h2 className="font-display text-2xl md:text-3xl">{locale === "fr" ? "Signaux récents, étiquetés" : "Recent signals, labelled"}</h2>
          </div>
          <span className="text-[11px] text-muted-foreground">{list.length} {locale === "fr" ? "tendances" : "trends"}</span>
        </header>

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
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(tr => <SocialTrendCard key={tr.id} trend={tr} />)}
        </div>
      </section>
    </PageShell>
  );
}
