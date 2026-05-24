import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Pick } from "@/lib/guide-data";

export function PickCard({ p }: { p: Pick }) {
  const { locale } = useLocale();
  const [saved, setSaved] = useState(false);
  return (
    <article className="group bg-card border border-rule h-full flex flex-col overflow-hidden hover:border-ink transition-colors">
      <div className="aspect-[16/10] overflow-hidden bg-muted relative">
        <img src={p.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        <span className="absolute top-2 left-2 bg-paper/95 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">{p.category[locale]}</span>
        <button onClick={() => setSaved(s => !s)} aria-label="Save"
          className="absolute top-2 right-2 h-8 w-8 grid place-items-center bg-paper/95 hover:bg-ink hover:text-paper transition-colors">
          {saved ? <BookmarkCheck className="h-4 w-4 text-civic-red" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-display text-base leading-snug group-hover:text-civic-red transition-colors line-clamp-2">{p.title[locale]}</h3>
        <p className="text-[13px] font-serif text-muted-foreground line-clamp-2 leading-snug">{p.blurb[locale]}</p>
        {p.neighborhood && <span className="text-[11px] text-muted-foreground mt-auto">{p.neighborhood}</span>}
      </div>
    </article>
  );
}
