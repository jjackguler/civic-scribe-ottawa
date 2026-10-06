import { ExternalLink } from "lucide-react";
import type { Program } from "@/lib/funding";
import { AUDIENCE_LABEL, STATUS_LABEL } from "@/lib/funding";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

const STATUS_STYLE: Record<Program["status"], string> = {
  open: "bg-spruce text-white",
  ongoing: "bg-ice text-ink",
  closed: "bg-surface text-muted-ink border border-line",
  varies: "bg-ice text-ink",
  guide: "bg-surface text-lake border border-lake/40",
};

export function FundingCard({ p, compact = false }: { p: Program; compact?: boolean }) {
  const { locale, pick } = useLocale();
  const checked = new Date(p.checked + "T12:00:00").toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "long", day: "numeric", year: "numeric" });
  return (
    <article className="bg-surface rounded-[8px] border border-line p-5 flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_STYLE[p.status]}`}>{pick(STATUS_LABEL[p.status])}</span>
        {p.audience.map(a => (
          <span key={a} className="text-xs text-muted-ink">{pick(AUDIENCE_LABEL[a])}</span>
        ))}
      </div>
      <h3 className="hl text-[1.3rem] text-ink">{pick(p.name)}</h3>
      <p className="meta mt-1">{p.org}</p>
      <dl className="mt-4 grid gap-3 text-[0.97rem] leading-relaxed flex-1">
        <div>
          <dt className="font-semibold">{t("whoFor", locale)}</dt>
          <dd className="font-serif text-ink/85">{pick(p.forWhom)}</dd>
        </div>
        {!compact && (
          <>
            <div>
              <dt className="font-semibold">{t("whatYouGet", locale)}</dt>
              <dd className="font-serif text-ink/85">{pick(p.whatYouGet)}</dd>
            </div>
            <div>
              <dt className="font-semibold">{locale === "fr" ? "Comment commencer" : "How to start"}</dt>
              <dd className="font-serif text-ink/85">{pick(p.howToStart)}</dd>
            </div>
          </>
        )}
      </dl>
      <div className="mt-5 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-2">
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-lake hover:underline">
          {t("officialPage", locale)} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <span className="meta">{t("lastChecked", locale)}: {checked}</span>
      </div>
    </article>
  );
}
