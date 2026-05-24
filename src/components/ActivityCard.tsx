import { useState } from "react";
import { MapPin, Clock, Bookmark, BookmarkCheck, Accessibility, Train } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Activity } from "@/lib/guide-data";

const costLabel: Record<Activity["cost"], { en: string; fr: string }> = {
  "free": { en: "Free", fr: "Gratuit" },
  "under-20": { en: "Under $20", fr: "Moins de 20 $" },
  "20-50": { en: "$20–50", fr: "20–50 $" },
  "50+": { en: "$50+", fr: "50 $+" },
};

export function ActivityCard({ a, compact = false }: { a: Activity; compact?: boolean }) {
  const { locale } = useLocale();
  const [saved, setSaved] = useState(false);
  return (
    <article className="group bg-card border border-rule h-full flex flex-col overflow-hidden hover:border-ink transition-colors">
      <div className={`relative overflow-hidden bg-muted ${compact ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
        <img src={a.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        <span className="absolute top-2 left-2 bg-paper/95 backdrop-blur px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">
          {costLabel[a.cost][locale]}
        </span>
        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={() => setSaved(s => !s)}
          className="absolute top-2 right-2 h-8 w-8 grid place-items-center bg-paper/95 hover:bg-ink hover:text-paper transition-colors"
        >
          {saved ? <BookmarkCheck className="h-4 w-4 text-civic-red" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-base leading-snug group-hover:text-civic-red transition-colors line-clamp-2">{a.title[locale]}</h3>
        {!compact && <p className="text-[13px] font-serif text-muted-foreground leading-snug line-clamp-2">{a.blurb[locale]}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-auto">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{a.neighborhood}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{a.when[locale]}</span>
          {a.accessible && <span className="inline-flex items-center gap-1" title="Accessible"><Accessibility className="h-3 w-3" /></span>}
          {a.transitFriendly && <span className="inline-flex items-center gap-1" title="Transit"><Train className="h-3 w-3" /></span>}
          {a.frenchFriendly && <span className="border border-rule px-1 text-[9px] tracking-wider">FR</span>}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-civic-red" />
          {locale === "fr" ? "Mis à jour" : "Updated"} {a.updatedMinutesAgo}m {locale === "fr" ? "" : "ago"}
          <span className="opacity-50">·</span>
          <span>{a.source === "editor" ? (locale === "fr" ? "Éditeur" : "Editor") : a.source === "city" ? (locale === "fr" ? "Ville" : "City") : (locale === "fr" ? "Citoyen" : "Citizen")}</span>
        </div>
      </div>
    </article>
  );
}
