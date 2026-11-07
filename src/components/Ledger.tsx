/**
 * The Open Desk Ledger on lists, record pages and the front page.
 * Statuses are shown as stamps with their meaning spelled out next to them.
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import {
  LEDGER, STATUSES, STATUS_HELP, STATUS_LABEL, currentEntry, currentStatus, ledgerDate, pickText,
  statusCounts, type LedgerRecord, type LedgerText, type Status,
} from "@/lib/ledger";
import { SITE } from "@/lib/site";
import { CountUp } from "./Motion";
import { ExplainerVideo } from "./ExplainerVideo";

export const STATUS_TONE: Record<Status, string> = {
  attributed: "text-muted-ink",
  unresolved: "text-brass-ink",
  supported: "text-spruce",
  conflicting: "text-live",
  refuted: "bg-live text-white !border-live",
};

export function StatusMark({ s, className = "", animate = false, delay = 0 }: { s: Status; className?: string; animate?: boolean; delay?: number }) {
  const { pick } = useLocale();
  return (
    <span
      className={`stamp ${STATUS_TONE[s]} ${className}`}
      title={pick(STATUS_HELP[s])}
      data-reveal={animate ? "" : undefined}
      style={delay ? ({ "--delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {pick(STATUS_LABEL[s])}
    </span>
  );
}

/** Record text in the reader's language; English is marked when French is missing. */
export function LT({ t, className }: { t: LedgerText; className?: string }) {
  const { locale } = useLocale();
  const { text, fallback } = pickText(t, locale);
  return (
    <span className={className} lang={fallback ? "en-CA" : undefined}>
      {text}
      {fallback && <span className="sr-only"> (en anglais)</span>}
    </span>
  );
}

/** The five statuses with what each one means, optionally with counts and filter links. */
export function StatusLegend({
  counts,
  active,
  linked = false,
  compact = false,
}: {
  counts?: Record<Status, number>;
  active?: Status | null;
  linked?: boolean;
  /** Stamp above its meaning, for narrow columns. */
  compact?: boolean;
}) {
  const row = compact ? "flex flex-col gap-1.5" : "flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3";
  const { pick } = useLocale();
  return (
    <ul className="grid gap-3">
      {STATUSES.map((s) => {
        const body = (
          <>
            <span className={`shrink-0 pt-0.5 ${compact ? "" : "sm:w-[11.5rem]"}`}>
              <StatusMark s={s} />
            </span>
            <span className="text-[0.92rem] text-muted-ink leading-snug">
              {counts && <strong className="text-ink mr-1.5"><CountUp to={counts[s]} /></strong>}
              {pick(STATUS_HELP[s])}
            </span>
          </>
        );
        return (
          <li key={s}>
            {linked ? (
              <Link
                to="/ledger"
                search={{ status: active === s ? undefined : s } as never}
                aria-current={active === s ? "true" : undefined}
                className={`${row} rounded-[3px] p-1.5 -m-1.5 hover:bg-ice ${active === s ? "bg-ice outline outline-1 outline-ink/30" : ""}`}
              >
                {body}
              </Link>
            ) : (
              <div className={row}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** One record on a list. */
export function RecordCard({ r, size = "card" }: { r: LedgerRecord; size?: "lead" | "card" }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const entry = currentEntry(r);
  return (
    <article className="group lift">
      <Link to="/ledger/$id" params={{ id: r.id }} className="block">
        <p className="flex flex-wrap items-center gap-2.5">
          <span className="kicker font-mono tracking-normal">{r.id}</span>
          <StatusMark s={currentStatus(r)} animate />
        </p>
        <h3 className={`hl mt-2 group-hover:underline decoration-1 underline-offset-4 ${size === "lead" ? "text-[1.8rem] sm:text-[2.2rem] leading-[1.1]" : "text-[1.2rem] leading-snug"}`}>
          <LT t={r.headline} />
        </h3>
        <blockquote className={`mt-2 font-serif italic text-ink/75 border-l-2 border-line pl-3 ${size === "lead" ? "text-[1.12rem]" : "text-[0.98rem] line-clamp-3"}`} lang={r.claim.lang}>
          “{r.claim.quote}”
        </blockquote>
        <p className="meta mt-2">
          {r.actor.name}
          {r.actor.role ? `, ${r.actor.role}` : ""} · {fr ? "Statut signé par" : "Status signed by"} {entry.editor},{" "}
          <time dateTime={entry.at}>{ledgerDate(entry.at, locale)}</time>
        </p>
      </Link>
    </article>
  );
}

/**
 * Front page: the ledger leads. With records, the latest change leads and the next four follow;
 * before the first record, a short band says what the desk is and when it opens.
 */
export function LedgerFront({ className = "" }: { className?: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const records = LEDGER;
  const counts = statusCounts(records);
  const [lead, ...rest] = records;
  return (
    <section className={className} aria-labelledby="open-desk-ledger">
      <div className="pt-3 border-t-[3px] border-ink">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">{SITE.name} — {SITE.openDesk.subtitle[locale]}</p>
            <h2 id="open-desk-ledger" className="hl text-[1.9rem] sm:text-[2.3rem] leading-tight mt-1">
              {SITE.openDesk.ledger[locale]}
            </h2>
          </div>
          <Link to="/ledger" className="inline-flex items-center gap-1 text-[0.92rem] font-semibold text-lake hover:underline">
            {fr ? "Tout le registre" : "The full ledger"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-2 font-serif text-[1.08rem] leading-relaxed text-ink/80 max-w-3xl">
          {fr
            ? "Nous consignons ce que disent les entreprises d'IA et leurs dirigeants, nous le vérifions auprès des documents, de leurs déclarations antérieures et des résultats, puis un responsable éditorial signe le statut. Chaque dossier est rouvert après 3 et 6 mois."
            : "We record what AI companies and their leaders say, test it against documents, their earlier statements and outcomes, and a named editor signs the status. Every record is reopened after 3 and 6 months."}{" "}
          <Link to="/standards" hash="statuses" className="font-sans text-[0.92rem] text-lake font-semibold hover:underline">
            {fr ? "Les cinq statuts →" : "The five statuses →"}
          </Link>
        </p>
      </div>
      {lead ? (
        <div className="mt-6 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <RecordCard r={lead} size="lead" />
            {rest.length > 0 && (
              <div className="mt-8 grid gap-x-8 sm:grid-cols-2 border-t border-ink/80">
                {rest.slice(0, 4).map((r) => (
                  <div key={r.id} className="py-4 border-b border-line">
                    <RecordCard r={r} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <aside className="min-w-0 lg:border-l lg:border-line lg:pl-8">
            <h3 className="kicker text-ink pb-1 border-b border-ink mb-4">{fr ? "Le registre en chiffres" : "The ledger so far"}</h3>
            <StatusLegend counts={counts} compact />
          </aside>
        </div>
      ) : (
        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-surface border border-line p-5 sm:p-6">
          <div>
            <p className="hl text-[1.35rem] leading-snug">
              {fr ? "Les premiers dossiers ouvrent bientôt." : "The first records open soon."}
            </p>
            <p className="mt-2 text-[0.95rem] text-muted-ink leading-relaxed">
              {fr
                ? "Notre premier thème : les entreprises qui disent réduire leurs effectifs à cause de l'IA. Chaque dossier aura un numéro permanent (OD-0001, OD-0002…), ses sources archivées, le droit de réponse de l'entreprise et l'historique de chaque changement de statut."
                : "Our first beat: companies that say they are cutting jobs because of AI. Each record gets a permanent number (OD-0001, OD-0002 …), archived sources, the company's right of reply and the history of every status change."}
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.92rem] font-semibold">
              <Link to="/open-desk" className="text-lake hover:underline">{fr ? "Qu'est-ce qu'Open Desk?" : "What is Open Desk?"}</Link>
              <Link to="/standards" className="text-lake hover:underline">{fr ? "Le protocole Open Desk" : "The Open Desk protocol"}</Link>
              <Link to="/tips" className="text-lake hover:underline">{fr ? "Signaler une déclaration" : "Flag a statement"}</Link>
            </p>
          </div>
          <StatusLegend />
        </div>
      )}
    </section>
  );
}

/** Front page: what Open Desk is, in one band, with the explainer video. */
export function OpenDeskBand({ className = "" }: { className?: string }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const steps = fr
    ? [["Consigner", "ce que disent les entreprises d'IA, avec une copie archivée"], ["Vérifier", "auprès des documents, des paroles antérieures et des témoins"], ["Signer", "un statut, par un responsable nommé, jamais par l'IA"], ["Rouvrir", "chaque dossier après 3 et 6 mois"]]
    : [["Record", "what AI companies say, with an archived copy"], ["Test", "against documents, earlier words and witnesses"], ["Sign", "a status, by a named editor, never by AI"], ["Reopen", "every record after 3 and 6 months"]];
  return (
    <section className={className} aria-labelledby="open-desk-band">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center bg-surface border border-line p-5 sm:p-8">
        <div>
          <p className="kicker">{SITE.openDesk.method}</p>
          <h2 id="open-desk-band" className="hl text-[1.9rem] sm:text-[2.3rem] leading-[1.08] mt-1">
            {fr ? <>Les machines cherchent. Les humains décident. <span className="marker" data-reveal="">Ce qui a été dit reste au dossier.</span></> : <>Machines scan. People decide. <span className="marker" data-reveal="">What was said stays on the record.</span></>}
          </h2>
          <ol className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {steps.map(([h, p], n) => (
              <li key={h} className="rise flex gap-3" data-reveal="" style={{ "--delay": `${n * 80}ms` } as React.CSSProperties}>
                <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full bg-ink text-white text-[0.8rem] font-bold">{n + 1}</span>
                <span className="text-[0.95rem] leading-snug"><strong>{h}</strong> {p}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-semibold text-[0.95rem]">
            <Link to="/open-desk" className="text-lake hover:underline inline-flex items-center gap-1">{fr ? "Qu'est-ce que le journalisme Open Desk?" : "What is Open Desk Journalism?"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/open-desk" hash="desk" className="text-lake hover:underline">{fr ? "Le pupitre, étape par étape" : "The desk, step by step"}</Link>
          </p>
        </div>
        <ExplainerVideo compact />
      </div>
    </section>
  );
}
