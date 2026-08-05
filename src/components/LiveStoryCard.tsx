import { useEffect, useState } from "react";
import { Clock, ExternalLink } from "lucide-react";
import { LiveImage } from "@/components/LiveImage";
import { useLocale } from "@/lib/locale-context";
import { regionKicker, type FeedItem } from "@/lib/use-live-feed";

function relative(iso: string, locale: "en" | "fr") {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!isFinite(m)) return "";
  // Upstream clocks can run slightly ahead of ours — treat that as brand new.
  if (m < 1) return locale === "fr" ? "À l'instant" : "Just now";
  if (m < 60) return `${m} ${locale === "fr" ? "min" : "min ago"}`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${locale === "fr" ? "h" : "h ago"}`;
  return `${Math.round(h / 24)} ${locale === "fr" ? "j" : "d ago"}`;
}

export function LiveStoryCard({
  item, variant = "lead",
}: { item: FeedItem; variant?: "hero" | "lead"; mounted?: boolean }) {
  const { locale } = useLocale();
  // Relative time is computed after mount only — server/client clocks differ.
  const [rel, setRel] = useState("");
  useEffect(() => { setRel(relative(item.publishedAt, locale)); }, [item.publishedAt, locale]);
  const label = item.region === "canada" ? "CANADA" : "OTTAWA";


  return (
    <article className="group">
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
        <div className={`${variant === "hero" ? "aspect-[16/10] mb-5" : "aspect-[4/3] mb-4"} overflow-hidden bg-muted`}>
          <LiveImage
            src={item.image}
            headline={item.title}
            region={item.region}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className={`kicker ${regionKicker(item.region)}`}>{label} · {item.source}</span>
        </div>
        <h3 className={`font-display leading-tight mt-2 group-hover:text-civic-red transition-colors ${variant === "hero" ? "text-3xl md:text-5xl leading-[1.05]" : "text-2xl"}`}>
          {item.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-sans">
          <span className="inline-flex items-center gap-1 min-h-4">
            <Clock className="h-3 w-3" />{mounted ? rel : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            {locale === "fr" ? "Lire à la source" : "Read at source"} <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </a>
    </article>
  );
}
