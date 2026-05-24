import { useState } from "react";
import { Tag, MapPin, Clock, AlertCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Deal } from "@/lib/guide-data";

export function DealCard({ d }: { d: Deal }) {
  const { locale } = useLocale();
  const [saved, setSaved] = useState(false);
  const exp = new Date(d.expires);
  const days = Math.max(0, Math.ceil((exp.getTime() - Date.now()) / 86400000));
  const urgent = days <= 3;

  return (
    <article className="group bg-card border border-rule h-full flex flex-col overflow-hidden hover:border-ink transition-colors">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img src={d.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span className="bg-ink text-paper px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">{d.retailer}</span>
          {d.savings && <span className="bg-civic-red text-paper px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">-{d.savings}</span>}
        </div>
        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={() => setSaved(s => !s)}
          className="absolute top-2 right-2 h-8 w-8 grid place-items-center bg-paper/95 hover:bg-ink hover:text-paper transition-colors"
        >
          {saved ? <BookmarkCheck className="h-4 w-4 text-civic-red" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-base leading-snug line-clamp-2">{d.title[locale]}</h3>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-civic-red">{d.now}</span>
          {d.was && <span className="text-xs line-through text-muted-foreground">{d.was}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {d.store && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{d.store}</span>}
          <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{d.location === "online" ? (locale === "fr" ? "En ligne" : "Online") : d.location === "ottawa" ? "Ottawa" : "Canada"}</span>
        </div>
        {d.notes && <p className="text-[11px] font-serif italic text-muted-foreground line-clamp-2">{d.notes[locale]}</p>}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-rule">
          <span className={`text-[10px] uppercase tracking-wider font-bold inline-flex items-center gap-1 ${urgent ? "text-civic-red" : "text-muted-foreground"}`}>
            {urgent && <AlertCircle className="h-3 w-3" />}
            {locale === "fr" ? "Expire" : "Expires"} {exp.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric" })}
            {urgent && ` · ${days}${locale === "fr" ? "j" : "d"}`}
          </span>
          <button className="text-[10px] uppercase tracking-wider font-semibold hover:text-civic-red">
            {locale === "fr" ? "Meilleur prix ?" : "Better deal?"}
          </button>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {locale === "fr" ? "Vérifié il y a" : "Verified"} {d.verifiedMinutesAgo}m {locale === "fr" ? "" : "ago"}
        </div>
      </div>
    </article>
  );
}
