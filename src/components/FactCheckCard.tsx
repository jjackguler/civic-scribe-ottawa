import { type FactCheck } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { Check, X, AlertCircle, HelpCircle, Loader2 } from "lucide-react";

const STATUS = {
  verified: { label: { en: "Verified", fr: "Vérifié" }, color: "bg-solution text-white", Icon: Check },
  false: { label: { en: "False", fr: "Faux" }, color: "bg-civic-red text-white", Icon: X },
  misleading: { label: { en: "Misleading", fr: "Trompeur" }, color: "bg-highlight text-ink", Icon: AlertCircle },
  "needs-context": { label: { en: "Needs context", fr: "Manque de contexte" }, color: "bg-river text-white", Icon: HelpCircle },
  review: { label: { en: "Under review", fr: "En examen" }, color: "bg-muted text-foreground", Icon: Loader2 },
} as const;

export function FactCheckCard({ fc }: { fc: FactCheck }) {
  const { locale } = useLocale();
  const s = STATUS[fc.status];
  const Icon = s.Icon;
  return (
    <article className="bg-card border border-rule p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] uppercase tracking-wider font-bold ${s.color}`}>
          <Icon className="h-3 w-3" />{s.label[locale]}
        </span>
        <span className="text-[11px] text-muted-foreground">{new Date(fc.updatedAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}</span>
      </div>
      <blockquote className="font-display text-xl leading-snug mt-4 border-l-2 border-civic-red pl-4">
        {fc.claim[locale]}
      </blockquote>
      <p className="font-serif text-sm text-muted-foreground mt-3 flex-1">{fc.summary[locale]}</p>
      <div className="text-[11px] text-muted-foreground mt-4 rule-top pt-3">
        <strong className="font-sans uppercase tracking-wider">Source:</strong> {fc.source}
      </div>
    </article>
  );
}
