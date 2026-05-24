import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({
  children,
  itemMinWidth = 280,
}: { children: ReactNode; itemMinWidth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <div className="relative group">
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-fade-x"
        style={{ scrollPaddingLeft: 8 }}
      >
        <style>{`
          .carousel-item { flex: 0 0 auto; width: min(${itemMinWidth}px, 82vw); scroll-snap-align: start; }
          @media (min-width: 768px) { .carousel-item { width: ${itemMinWidth}px; } }
        `}</style>
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center bg-paper border border-rule shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 hover:bg-ink hover:text-paper"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center bg-paper border border-rule shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 hover:bg-ink hover:text-paper"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RailHeader({
  kicker, title, action, live,
}: { kicker: string; title: string; action?: ReactNode; live?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="kicker text-civic-red">{kicker}</span>
          {live && (
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-civic-red pulse-ring" />
              {live}
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl md:text-3xl mt-1 leading-tight">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
