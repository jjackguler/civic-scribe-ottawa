import { MapPin } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { CitizenReport } from "@/lib/guide-data";

const statusDot: Record<CitizenReport["status"], string> = {
  verified: "bg-solution",
  developing: "bg-civic-red",
  submitted: "bg-river",
};

export function CitizenReportItem({ r }: { r: CitizenReport }) {
  const { locale } = useLocale();
  return (
    <div className="flex items-start gap-3 py-3 rule-bottom last:border-0">
      <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${statusDot[r.status]} ${r.status === "developing" ? "pulse-ring" : ""}`} />
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-base leading-snug">{r.title[locale]}</h4>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground mt-1">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.neighborhood}</span>
          <span>{r.category[locale]}</span>
          <span className="italic">{r.by}</span>
          <span>{r.minutesAgo}m {locale === "fr" ? "" : "ago"}</span>
        </div>
      </div>
    </div>
  );
}
