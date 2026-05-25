import { useLocale } from "@/lib/locale-context";
import type { FoodPlace } from "@/lib/data";
import { NewsImage } from "@/components/NewsImage";
import { MapPin, Star, ShieldCheck, AlertTriangle, Flame } from "lucide-react";

export function FoodCard({ p }: { p: FoodPlace }) {
  const { locale } = useLocale();
  return (
    <article className="bg-card border border-rule overflow-hidden flex flex-col group">
      <div className="aspect-[5/3] overflow-hidden bg-muted relative">
        <NewsImage src={p.image} headline={p.name} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {p.newOpening && <span className="bg-civic-red text-white text-[10px] uppercase tracking-wider px-1.5 py-0.5 font-bold">New</span>}
          {p.recommendedBy === "trend" && <span className="bg-highlight text-ink text-[10px] uppercase tracking-wider px-1.5 py-0.5 font-bold inline-flex items-center gap-1"><Flame className="h-3 w-3" />Trending</span>}
          {p.recommendedBy === "sponsored" && <span className="bg-ink/80 text-paper text-[10px] uppercase tracking-wider px-1.5 py-0.5">Sponsored</span>}
        </div>
        <div className="absolute top-2 right-2">
          {p.verified ? (
            <span className="inline-flex items-center gap-1 bg-solution text-white text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-bold">
              <ShieldCheck className="h-3 w-3" />Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-card text-civic-red border border-civic-red/40 text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-bold">
              <AlertTriangle className="h-3 w-3" />Unverified
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="kicker text-civic-red">{p.cuisine}</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{p.priceRange}</span>
        </div>
        <h3 className="font-display text-lg leading-snug">{p.name}</h3>
        <p className="font-serif text-sm text-muted-foreground line-clamp-2">{p.blurb[locale]}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-auto pt-2 rule-top">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.neighborhood}</span>
          {p.rating > 0 && <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-highlight fill-highlight" />{p.rating.toFixed(1)} <span className="opacity-70">({p.reviews})</span></span>}
          <span className={p.openNow ? "text-solution font-semibold" : "text-muted-foreground"}>{p.openNow ? "Open now" : "Closed"}</span>
          {p.tags.slice(0, 2).map(tag => <span key={tag} className="border border-rule px-1 text-[10px] uppercase tracking-wider">{tag}</span>)}
        </div>
      </div>
    </article>
  );
}
