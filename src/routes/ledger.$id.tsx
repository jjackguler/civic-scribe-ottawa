import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { Archive, ExternalLink, Flag } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Trust";
import { LT, RecordCard, StatusLines, StatusMark } from "@/components/Ledger";
import { CopyButton } from "@/components/Motion";
import { useLocale } from "@/lib/locale-context";
import {
  ACTOR_ACTION_LABEL, ASPECT_LABEL, LEDGER, PENDING_LABEL, STAGE_LABEL, STATUS_HELP, STATUS_LABEL,
  currentEntry, currentStatus, isVerdict, ledgerDate, openedAt, pickText, recordById, replyDeadline,
  replyState, reviewSchedule, type Evidence, type Finding,
} from "@/lib/ledger";
import { editorMailto } from "@/lib/contact";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef, absUrl, localePath } from "@/lib/seo";

/** How each part of the claim stands; "untested" is shown in plain words, not as a stamp. */
const FINDING_LABEL: Record<Finding, { en: string; fr: string }> = {
  untested: { en: "Not tested yet", fr: "Pas encore vérifié" },
  unresolved: STATUS_LABEL.unresolved,
  supported: STATUS_LABEL.supported,
  conflicting: STATUS_LABEL.conflicting,
  refuted: STATUS_LABEL.refuted,
};
const CORRECTION_LABEL = {
  correction: { en: "Correction", fr: "Correction" },
  update: { en: "Update", fr: "Mise à jour" },
  clarification: { en: "Clarification", fr: "Précision" },
} as const;
const REDACTION_LABEL = {
  "source-safety": { en: "to protect a source", fr: "pour protéger une source" },
  "personal-data": { en: "to protect personal information", fr: "pour protéger des renseignements personnels" },
  legal: { en: "on legal advice", fr: "sur avis juridique" },
} as const;

/**
 * One record of the Open Desk Ledger: the claim, the evidence, the right of reply,
 * the signed status and every earlier status. Records are written in English with an
 * optional French version; the French page shows English text where none exists, marked.
 */
export const Route = createFileRoute("/ledger/$id")({
  loader: ({ params }) => {
    const record = recordById(params.id);
    if (!record) throw notFound();
    // One address per record: /ledger/od-0001 → /ledger/OD-0001.
    if (record.id !== params.id) throw redirect({ to: "/ledger/$id", params: { id: record.id }, statusCode: 301 });
    return { record };
  },
  head: ({ match, loaderData }) => {
    const r = loaderData?.record;
    if (!r) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    const status = currentStatus(r);
    const entry = currentEntry(r);
    return seoHead(match, {
      title: { en: `${r.id}: ${r.headline.en}`, fr: `${r.id} : ${r.headline.fr ?? r.headline.en}` },
      description: {
        en: `${STATUS_LABEL[status].en}. ${entry.reason.en}`,
        fr: `${STATUS_LABEL[status].fr}. ${entry.reason.fr ?? entry.reason.en}`,
      },
      type: "article",
      publishedTime: openedAt(r),
      modifiedTime: entry.at,
      section: SITE.openDesk.ledger,
      breadcrumbs: [
        { name: SITE.openDesk.ledger, path: "/ledger" },
        { name: r.id, path: `/ledger/${r.id}` },
      ],
      // ClaimReview only once there is a verdict, and with no number: our results are not a 1–5 scale.
      jsonLd: (l, url) => {
        if (!isVerdict(status)) return [];
        return [
          {
            "@context": "https://schema.org",
            "@type": "ClaimReview",
            url,
            datePublished: openedAt(r),
            dateModified: entry.at,
            claimReviewed: r.claim.quote,
            author: { "@type": "Organization", name: SITE.name, url: absUrl("/", l) },
            editor: { "@type": "Person", name: entry.editor },
            publisher: publisherRef,
            publishingPrinciples: absUrl("/standards", l),
            itemReviewed: {
              "@type": "Claim",
              datePublished: r.claim.madeAt,
              appearance: [{ "@type": "CreativeWork", url: r.claim.source.url, name: r.claim.source.title }, { "@type": "CreativeWork", url: r.claim.archiveUrl }],
              author: { "@type": r.actor.kind === "executive" || r.actor.kind === "public-figure" ? "Person" : "Organization", name: r.actor.name },
            },
            reviewRating: { "@type": "Rating", alternateName: STATUS_LABEL[status][l] },
            ...(r.corrections.length ? { correction: r.corrections.map((c) => ({ "@type": "CorrectionComment", datePublished: c.at, text: c.what[l] ?? c.what.en })) } : {}),
          },
        ];
      },
    });
  },
  component: RecordPage,
});

function RecordPage() {
  const { record: r } = Route.useLoaderData();
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const status = currentStatus(r);
  const entry = currentEntry(r);
  const reply = replyState(r);
  const today = new Date().toISOString().slice(0, 10);
  const schedule = reviewSchedule(r);
  const scheduleLabel = (k: "review" | "decision" | "check", label?: string) =>
    k === "check" ? `${fr ? "Vérification" : "Check"}: ${label}` : k === "review" ? (fr ? "Revue à 3 mois" : "3-month review") : (fr ? "Revue à 6 mois : poursuivre ou clore le suivi" : "6-month review: continue or close follow-up");
  const deadline = replyDeadline(r);
  const rr = r.rightOfReply;
  const anyFallback = locale === "fr" && pickText(r.headline, locale).fallback;
  const mail = editorMailto(
    fr ? `Erreur signalée : ${r.id}` : `Error report: ${r.id}`,
    `${absUrl(`/ledger/${r.id}`, locale)}\n\n${fr ? "Ce qui est inexact :" : "What is wrong:"}\n`,
  );
  const byStance = (s: Evidence["stance"]) => r.evidence.filter((e) => e.stance === s);
  const groups: { stance: Evidence["stance"]; title: string }[] = [
    { stance: "contradicts", title: fr ? "Ce qui contredit l'affirmation" : "What conflicts with the claim" },
    { stance: "supports", title: fr ? "Ce qui étaye l'affirmation" : "What supports the claim" },
    { stance: "context", title: fr ? "Contexte" : "Context" },
  ];
  const more = LEDGER.filter((x) => x.id !== r.id).slice(0, 4);

  return (
    <PageShell>
      <article className="container-mw pt-6">
        <Breadcrumbs items={[{ label: SITE.openDesk.ledger[locale], to: "/ledger" }, { label: r.id }]} />
        {anyFallback && (
          <p className="mt-4 border border-line bg-surface px-4 py-3 text-[0.95rem]">
            Ce dossier est rédigé en anglais; la version française arrive après relecture humaine.
          </p>
        )}
        <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1fr)_300px] mt-6">
          <div className="min-w-0 max-w-[760px]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link to="/ledger" className="kicker hover:underline">{SITE.openDesk.ledger[locale]}</Link>
              <span className="kicker font-mono tracking-normal text-ink">{r.id}</span>
            </p>
            <h1 className="hl text-[2.1rem] sm:text-[2.7rem] leading-[1.08] mt-3"><LT t={r.headline} /></h1>

            {/* The claim, verbatim, with its source and archived copy. */}
            <figure className="mt-6 border-l-[4px] border-ink pl-5">
              <blockquote className="font-serif text-[1.35rem] sm:text-[1.5rem] leading-snug" lang={r.claim.lang}>
                “{r.claim.quote}”
              </blockquote>
              <figcaption className="mt-3 text-[0.92rem] text-muted-ink">
                <span className="font-semibold text-ink">{r.actor.name}</span>
                {r.actor.role ? `, ${r.actor.role}` : ""} · {r.claim.context} ·{" "}
                <time dateTime={r.claim.madeAt}>{ledgerDate(r.claim.madeAt, locale)}</time>
                <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <a href={r.claim.source.url} rel="noopener nofollow" className="text-lake font-semibold hover:underline inline-flex items-center gap-1">
                    {fr ? "Source" : "Source"}: {r.claim.source.publisher} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <a href={r.claim.archiveUrl} rel="noopener nofollow" className="text-lake font-semibold hover:underline inline-flex items-center gap-1">
                    <Archive className="h-3.5 w-3.5" aria-hidden="true" /> {fr ? "Copie archivée" : "Archived copy"}
                  </a>
                </span>
              </figcaption>
            </figure>

            {/* The signed status. */}
            <section className="mt-8 bg-surface border border-line p-5 sm:p-6" aria-labelledby="status">
              <h2 id="status" className="kicker text-ink">{fr ? "Résultat actuel" : "Current result"}</h2>
              <p className="mt-3"><StatusMark s={status} className="text-[0.8rem]" animate /></p>
              <StatusLines r={r} className="mt-3" />
              <p className="mt-3 text-[0.92rem] text-muted-ink">{pick(STATUS_HELP[status])}</p>
              <p className="mt-4 font-serif text-[1.12rem] leading-relaxed"><LT t={entry.reason} /></p>
              <p className="mt-3 text-[0.9rem]">
                {fr ? "Signé par" : "Signed by"} <strong>{entry.editor}</strong>
                {entry.secondReader && <>{fr ? ", deuxième lecture : " : ", second reader: "}<strong>{entry.secondReader}</strong></>},{" "}
                <time dateTime={entry.at}>{ledgerDate(entry.at, locale)}</time>
              </p>
            </section>

            <section className="mt-10" aria-labelledby="parts">
              <h2 id="parts" className="kicker text-ink">{fr ? "L'affirmation, en quatre parties" : "The claim, in four parts"}</h2>
              <p className="mt-1 text-[0.9rem] text-muted-ink">
                {fr ? "Chaque partie est vérifiée séparément : « des postes sont supprimés » et « l'IA en est la cause » sont deux affirmations différentes." : "Each part is tested on its own: “jobs were cut” and “AI caused the cuts” are different claims."}
              </p>
              <dl className="mt-3 divide-y divide-line border-y border-line">
                {r.parts.map((p, i) => (
                  <div key={p.aspect + i} className="py-3 grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:gap-4 sm:items-baseline">
                    <dt className="kicker text-muted-ink">{pick(ASPECT_LABEL[p.aspect])}</dt>
                    <dd className="font-serif text-[1.06rem] leading-relaxed"><LT t={p.text} /></dd>
                    <dd className={`text-[0.85rem] font-semibold ${p.finding === "untested" ? "text-muted-ink" : ""}`}>{pick(FINDING_LABEL[p.finding])}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-10" aria-labelledby="test">
              <h2 id="test" className="kicker text-ink">{fr ? "Le test, écrit à l'ouverture" : "The test, written when the record opened"}</h2>
              <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[9rem_minmax(0,1fr)] text-[0.98rem] leading-relaxed">
                <dt className="text-muted-ink">{fr ? "Ce qui est mesuré" : "What is measured"}</dt><dd><LT t={r.test.measure} /></dd>
                {r.test.baseline && <><dt className="text-muted-ink">{fr ? "Point de départ" : "Starting point"}</dt><dd><LT t={r.test.baseline} /></dd></>}
                <dt className="text-muted-ink">{fr ? "Portée" : "Scope"}</dt><dd><LT t={r.test.scope} /></dd>
                <dt className="text-muted-ink">{fr ? "Preuves retenues" : "Evidence that counts"}</dt><dd><LT t={r.test.evidenceAccepted} /></dd>
                <dt className="text-muted-ink">{fr ? "Documents attendus" : "Documents expected"}</dt>
                <dd>
                  <ul className="grid gap-1">
                    {r.test.checks.map((c) => (
                      <li key={c.document + c.expectedBy}>
                        {c.document} · <time dateTime={c.expectedBy}>{ledgerDate(c.expectedBy, locale)}</time>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
            </section>

            {groups.map(({ stance, title }) => {
              const list = byStance(stance);
              if (!list.length) return null;
              return (
                <section key={stance} className="mt-10" aria-label={title}>
                  <h2 className="kicker text-ink">{title}</h2>
                  <ol className="mt-3 divide-y divide-line border-y border-line">
                    {list.map((e) => (
                      <li key={e.url + e.addedAt} className="py-3">
                        <a href={e.url} rel="noopener nofollow" className="font-semibold leading-snug hover:underline inline-flex gap-1.5 items-baseline">
                          {e.title}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 translate-y-0.5" aria-hidden="true" />
                        </a>
                        <span className="block text-[0.88rem] text-muted-ink">
                          {e.publisher} · {e.independent ? (fr ? "source indépendante" : "independent source") : (fr ? "source liée à l'auteur de l'affirmation" : "source tied to the claimant")}
                          {e.archiveUrl && <> · <a href={e.archiveUrl} rel="noopener nofollow" className="text-lake hover:underline">{fr ? "copie archivée" : "archived copy"}</a></>}
                        </span>
                        <p className="mt-1.5 text-[0.98rem] leading-relaxed"><LT t={e.note} /></p>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}

            <section className="mt-10" aria-labelledby="reply">
              <h2 id="reply" className="kicker text-ink">{fr ? "Droit de réponse" : "Right of reply"}</h2>
              <p className="mt-3 text-[1rem] leading-relaxed">
                {fr ? "Questions envoyées à" : "Questions sent to"} {rr.to},{" "}
                <time dateTime={rr.requestedAt}>{ledgerDate(rr.requestedAt, locale)}</time>
                {fr ? ", avec réponse attendue au plus tard le " : ", with a reply due by "}
                <time dateTime={deadline}>{ledgerDate(deadline, locale)}</time>
                {fr ? ", 17 h (heure d'Ottawa)." : ", 5 p.m. Ottawa time."}
              </p>
              {rr.expedited && (
                <p className="mt-2 text-[0.92rem] text-muted-ink">
                  {fr ? "Délai raccourci : " : "Shorter window: "}<LT t={rr.expedited.reason} />
                </p>
              )}
              {rr.extensions.map((x) => (
                <p key={x.at} className="mt-2 text-[0.92rem] text-muted-ink">
                  {fr ? "Délai prolongé jusqu'au " : "Deadline extended to "}{ledgerDate(x.until, locale)} : <LT t={x.reason} />
                </p>
              ))}
              {rr.response ? (
                <blockquote className="mt-3 border-l-2 border-line pl-4 text-[1rem] leading-relaxed">
                  <LT t={rr.response.summary} />
                  <footer className="meta mt-1">
                    {rr.response.kind === "declined" ? (fr ? "Refus de commenter, le" : "Declined to comment,") : (fr ? "Réponse reçue le" : "Answer received")}{" "}
                    {ledgerDate(rr.response.receivedAt, locale)}
                    {rr.response.url && <> · <a href={rr.response.url} rel="noopener nofollow" className="text-lake hover:underline">{fr ? "texte intégral" : "full text"}</a></>}
                  </footer>
                </blockquote>
              ) : (
                <p className="mt-2 font-semibold">
                  {reply === "waiting"
                    ? (fr ? "En attente de réponse. Aucun verdict n'est publié avant la fin du délai." : "Waiting for an answer. No verdict is published before the window closes.")
                    : (fr ? "Aucune réponse reçue à l'échéance. Le silence n'est pas une preuve : le résultat repose sur les documents." : "No reply by the deadline. Silence is not evidence: the result rests on the documents.")}
                </p>
              )}
              {rr.actorAction && (
                <p className="mt-3 border-l-[3px] border-brass pl-4 text-[0.98rem]">
                  <strong>{pick(ACTOR_ACTION_LABEL[rr.actorAction.kind])}</strong>, {ledgerDate(rr.actorAction.at, locale)}. <LT t={rr.actorAction.note} />
                </p>
              )}
            </section>

            <section className="mt-10" aria-labelledby="history">
              <h2 id="history" className="kicker text-ink">{fr ? "Historique du résultat" : "History of the result"}</h2>
              <ol className="mt-4 grid gap-5 border-l-2 border-line pl-5">
                {[...r.history].reverse().map((h, i) => (
                  <li key={h.at + h.status} className="relative rise" data-reveal="" style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}>
                    <span className={`absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-ink" : "bg-line"}`} aria-hidden="true" />
                    <p className="flex flex-wrap items-center gap-3">
                      <StatusMark s={h.status} animate delay={i * 90 + 120} />
                      <time className="meta" dateTime={h.at}>{ledgerDate(h.at, locale)}</time>
                      <span className="meta">{pick(STAGE_LABEL[h.stage])}{h.pending ? ` (${pick(PENDING_LABEL[h.pending])})` : ""}</span>
                    </p>
                    <p className="mt-1.5 text-[0.98rem] leading-relaxed"><LT t={h.reason} /></p>
                    <p className="meta mt-0.5">{fr ? "Signé par" : "Signed by"} {h.editor}{h.secondReader ? ` · ${fr ? "deuxième lecture" : "second reader"}: ${h.secondReader}` : ""}</p>
                  </li>
                ))}
              </ol>
            </section>

            {(r.corrections.length > 0 || r.redactions.length > 0) && (
              <section className="mt-10" aria-labelledby="corrections">
                <h2 id="corrections" className="kicker text-ink">{fr ? "Corrections et mises à jour" : "Corrections and updates"}</h2>
                <ul className="mt-3 grid gap-3">
                  {r.corrections.map((c) => (
                    <li key={c.at + c.what.en} className="border-l-[3px] border-brass pl-4">
                      <p className="meta"><strong className="text-ink">{pick(CORRECTION_LABEL[c.kind])}</strong> · <time dateTime={c.at}>{ledgerDate(c.at, locale)}</time> · {c.editor}</p>
                      <p className="mt-1"><LT t={c.what} /></p>
                      {c.cause && <p className="mt-1 text-[0.92rem] text-muted-ink">{fr ? "Origine de l'erreur : " : "How it happened: "}<LT t={c.cause} /></p>}
                    </li>
                  ))}
                  {r.redactions.map((x) => (
                    <li key={x.at + x.what.en} className="border-l-[3px] border-line pl-4">
                      <p className="meta"><strong className="text-ink">{fr ? "Retrait" : "Removed"}</strong> {pick(REDACTION_LABEL[x.reason])} · <time dateTime={x.at}>{ledgerDate(x.at, locale)}</time> · {x.editor}</p>
                      <p className="mt-1"><LT t={x.what} /></p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="min-w-0 grid gap-8 content-start">
            <div className="border-t-2 border-ink pt-3">
              <h2 className="kicker text-ink">{fr ? "Dossier" : "Record"}</h2>
              <dl className="mt-3 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-y-1.5 text-[0.92rem]">
                <dt className="text-muted-ink">{fr ? "Numéro" : "Number"}</dt><dd className="font-mono">{r.id}</dd>
                <dt className="text-muted-ink">{fr ? "Ouvert le" : "Opened"}</dt><dd>{ledgerDate(openedAt(r), locale)}</dd>
                <dt className="text-muted-ink">{fr ? "Mis à jour" : "Updated"}</dt><dd>{ledgerDate(entry.at, locale)}</dd>
                <dt className="text-muted-ink">{fr ? "Protocole" : "Protocol"}</dt><dd>v{r.protocol}</dd>
                <dt className="text-muted-ink">{fr ? "Retour au pupitre" : "Comes back"}</dt>
                <dd>
                  {schedule.map((x) => (
                    <span key={x.date + x.kind + (x.label ?? "")} className={`block ${x.date <= today ? "text-muted-ink line-through" : ""}`}>
                      {ledgerDate(x.date, locale)}
                      <span className="block text-[0.8rem] text-muted-ink">{scheduleLabel(x.kind, x.label)}</span>
                    </span>
                  ))}
                </dd>
              </dl>
            </div>
            {r.coverage.length > 0 && (
              <div className="border-t-2 border-ink pt-3">
                <h2 className="kicker text-ink">{fr ? "Notre couverture" : "Our coverage"}</h2>
                <ul className="mt-3 grid gap-2">
                  {r.coverage.map((c) => (
                    <li key={c.href}>
                      <a href={c.href.startsWith("/") ? localePath(c.href, locale) : c.href} className="font-semibold hover:underline">{c.title}</a>
                      <span className="meta block">{c.kind === "video" ? (fr ? "Vidéo" : "Video") : (fr ? "Article" : "Story")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border-t-2 border-ink pt-3 text-[0.92rem] grid gap-3">
              <h2 className="kicker text-ink">{fr ? "Usage de l'IA" : "AI use"}</h2>
              <p><LT t={r.aiAssistance} /></p>
              <p className="text-muted-ink">{fr ? "L'IA n'attribue jamais de résultat : seul un responsable éditorial nommé le fait, après une deuxième lecture." : "AI never assigns a result: only a named editor does, after a second reading."}</p>
              <Link to="/how-we-use-ai" className="text-lake font-semibold hover:underline">{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</Link>
            </div>
            <div className="border-t-2 border-ink pt-3 grid gap-2 text-[0.92rem]">
              <h2 className="kicker text-ink">{fr ? "Citer ce dossier" : "Cite this record"}</h2>
              <CopyButton text={absUrl(`/ledger/${r.id}`, locale)} label={fr ? "Copier le lien" : "Copy link"} done={fr ? "Lien copié" : "Link copied"} />
              <CopyButton
                text={`${SITE.openDesk.ledger[locale]}, ${r.id}: ${pickText(r.headline, locale).text} ${fr ? "Résultat" : "Result"}: ${STATUS_LABEL[status][locale]} (${ledgerDate(entry.at, locale)}). ${absUrl(`/ledger/${r.id}`, locale)}`}
                label={fr ? "Copier la citation" : "Copy citation"}
                done={fr ? "Citation copiée" : "Citation copied"}
              />
            </div>
            {mail && (
              <a href={mail} className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-lake hover:underline">
                <Flag className="h-4 w-4" aria-hidden="true" /> {fr ? "Signaler une erreur dans ce dossier" : "Report an error in this record"}
              </a>
            )}
          </aside>
        </div>

        {more.length > 0 && (
          <section className="mt-16" aria-labelledby="more-records">
            <h2 id="more-records" className="hl text-[1.6rem] border-t-2 border-ink pt-3">{fr ? "Autres dossiers" : "More records"}</h2>
            <div className="mt-4 grid gap-x-8 md:grid-cols-2">
              {more.map((x) => <div key={x.id} className="py-4 border-b border-line"><RecordCard r={x} /></div>)}
            </div>
          </section>
        )}
      </article>
    </PageShell>
  );
}
