/**
 * "How a claim moves through the desk": an interactive, step-by-step record built from the
 * fictional Halvorsen Freight case in the explainer video. Each step shows who acts (AI,
 * reporter, editor, creators) and how the record changes. Clearly labelled fictional.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import type { Status } from "@/lib/ledger-schema";
import { StatusMark } from "./Ledger";

type Actor = "ai" | "reporter" | "editor" | "creators";

const ACTOR: Record<Actor, { label: Bi; tone: string }> = {
  ai: { label: { en: "AI", fr: "IA" }, tone: "bg-ice text-ink" },
  reporter: { label: { en: "Reporter", fr: "Journaliste" }, tone: "bg-lake text-white" },
  editor: { label: { en: "Editor", fr: "Responsable éditorial" }, tone: "bg-ink text-white" },
  creators: { label: { en: "Creators", fr: "Créateurs" }, tone: "bg-signal text-signal-ink" },
};

type Step = {
  name: Bi;
  actor: Actor;
  what: Bi;
  status: Status;
  /** How much of the record is filled in by this step. */
  parts: number;
  evidence: number;
  reply: "none" | "waiting" | "closed";
  history: number;
  published?: boolean;
  reopen?: boolean;
};

const STEPS: Step[] = [
  {
    name: { en: "Capture", fr: "Capter" }, actor: "ai", status: "attributed", parts: 0, evidence: 0, reply: "none", history: 1,
    what: { en: "A press release says AI is now doing 1,200 people's work. The desk saves it with an archived copy and a time stamp, and opens record OD-9999.", fr: "Un communiqué affirme que l'IA fait désormais le travail de 1 200 personnes. Le pupitre l'enregistre avec une copie archivée et l'heure, et ouvre le dossier OD-9999." },
  },
  {
    name: { en: "Break down", fr: "Découper" }, actor: "ai", status: "attributed", parts: 3, evidence: 0, reply: "none", history: 1,
    what: { en: "AI splits the statement into three claims that can each be tested. It drafts; it does not judge.", fr: "L'IA découpe la déclaration en trois affirmations vérifiables une par une. Elle prépare; elle ne juge pas." },
  },
  {
    name: { en: "Match", fr: "Rapprocher" }, actor: "ai", status: "attributed", parts: 3, evidence: 1, reply: "none", history: 1,
    what: { en: "AI finds the CEO's February words, “AI will not replace anyone here”, and flags the contradiction for a person to check.", fr: "L'IA retrouve les propos du PDG en février, « L'IA ne remplacera personne ici », et signale la contradiction pour qu'une personne la vérifie." },
  },
  {
    name: { en: "Test", fr: "Vérifier" }, actor: "reporter", status: "unresolved", parts: 3, evidence: 3, reply: "waiting", history: 2,
    what: { en: "A reporter checks job postings, talks to a former dispatcher and sends the company written questions. The 48-hour reply clock starts.", fr: "Un journaliste vérifie les offres d'emploi, parle à un ancien répartiteur et envoie des questions écrites à l'entreprise. Le délai de réponse de 48 heures commence." },
  },
  {
    name: { en: "Verdict", fr: "Statut" }, actor: "editor", status: "conflicting", parts: 3, evidence: 3, reply: "closed", history: 3,
    what: { en: "The window closes with no answer. The editor weighs the evidence, writes the reason and signs “Conflicting evidence” by name. AI cannot write this field.", fr: "Le délai se termine sans réponse. Le responsable pèse les preuves, rédige la raison et signe « Preuves contradictoires » de son nom. L'IA ne peut pas écrire ce champ." },
  },
  {
    name: { en: "Publish", fr: "Publier" }, actor: "creators", status: "conflicting", parts: 3, evidence: 3, reply: "closed", history: 3, published: true,
    what: { en: "The record page goes live with a short story and a 60-second vertical video. Creators share it with the record number, and update their post if the record changes.", fr: "La page du dossier est publiée avec un court article et une vidéo verticale de 60 secondes. Les créateurs la relaient avec le numéro du dossier et mettent à jour leur publication si le dossier change." },
  },
  {
    name: { en: "Reopen", fr: "Rouvrir" }, actor: "editor", status: "conflicting", parts: 3, evidence: 3, reply: "closed", history: 3, published: true, reopen: true,
    what: { en: "Three and six months later the record comes back to the desk. What happened next is added to the history; nothing earlier is erased.", fr: "Trois et six mois plus tard, le dossier revient sur la table. La suite s'ajoute à l'historique; rien d'antérieur n'est effacé." },
  },
];

const PARTS: Bi[] = [
  { en: "1,200 roles are being cut.", fr: "1 200 postes sont supprimés." },
  { en: "AI tools now do that work.", fr: "Des outils d'IA font désormais ce travail." },
  { en: "In February the CEO said AI would replace no one.", fr: "En février, le PDG disait que l'IA ne remplacerait personne." },
];
const EVIDENCE: { t: Bi; kind: "contradicts" | "context" }[] = [
  { t: { en: "CEO remarks, February investor day (the company's own words)", fr: "Propos du PDG, journée investisseurs de février (paroles de l'entreprise)" }, kind: "contradicts" },
  { t: { en: "140 dispatch roles advertised abroad the same month (independent)", fr: "140 postes de répartition affichés à l'étranger le même mois (indépendant)" }, kind: "contradicts" },
  { t: { en: "Former dispatcher, on the record: “we trained the software first” (independent)", fr: "Ancien répartiteur, à visage découvert : « nous avons d'abord entraîné le logiciel » (indépendant)" }, kind: "context" },
];
const HISTORY: { s: Status; d: Bi }[] = [
  { s: "attributed", d: { en: "15 Sep · recorded from the press release", fr: "15 sept. · consigné à partir du communiqué" } },
  { s: "unresolved", d: { en: "15 Sep · testing begins", fr: "15 sept. · vérification en cours" } },
  { s: "conflicting", d: { en: "18 Sep · signed by the editor, no reply from the company", fr: "18 sept. · signé par le responsable, pas de réponse de l'entreprise" } },
];

export function DeskWalkthrough() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const step = STEPS[i];
  const last = STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setTimeout(() => {
      if (i >= last) setPlaying(false);
      else setI(i + 1);
    }, 4200);
    return () => window.clearTimeout(timer.current);
  }, [playing, i, last]);

  const go = (n: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(last, n)));
  };

  return (
    <div className="border-2 border-ink bg-surface" onKeyDown={(e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="kicker text-ink">{fr ? "Le pupitre, étape par étape" : "The desk, step by step"}</p>
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-live border border-live px-1.5 py-0.5">
          {fr ? "Exemple fictif" : "Fictional example"}
        </span>
      </div>

      {/* Step rail */}
      <ol className="flex overflow-x-auto no-scrollbar border-b border-line" role="tablist" aria-label={fr ? "Étapes" : "Steps"}>
        {STEPS.map((s, n) => (
          <li key={s.name.en} className="shrink-0">
            <button
              type="button"
              role="tab"
              aria-selected={n === i}
              onClick={() => go(n)}
              className={`relative flex items-center gap-2 px-3.5 py-3 text-[0.88rem] font-semibold whitespace-nowrap ${n === i ? "text-ink" : n < i ? "text-ink/70" : "text-muted-ink"} hover:bg-ice`}
            >
              <span
                key={n === i ? `on-${i}` : "off"}
                className={`grid place-items-center h-6 w-6 rounded-full text-[0.75rem] tabular-nums ${n === i ? "bg-ink text-white pulse-once" : n < i ? "bg-ice text-ink" : "border border-line"}`}
              >
                {n + 1}
              </span>
              {pick(s.name)}
              {n === i && <span className="absolute inset-x-3 bottom-0 h-[3px] bg-signal" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* What happens at this step */}
        <div key={i} className="enter" aria-live="polite">
          <p className="flex items-center gap-2">
            <span className={`text-[0.72rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-[3px] ${ACTOR[step.actor].tone}`}>
              {pick(ACTOR[step.actor].label)}
            </span>
            <span className="meta">{fr ? `Étape ${i + 1} sur ${STEPS.length}` : `Step ${i + 1} of ${STEPS.length}`}</span>
          </p>
          <h3 className="hl text-[1.6rem] mt-3">{pick(step.name)}</h3>
          <p className="mt-2 font-serif text-[1.08rem] leading-relaxed">{pick(step.what)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="inline-flex items-center gap-1 h-10 px-3 rounded-[4px] border border-ink/40 font-semibold disabled:opacity-40 hover:bg-ice">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {fr ? "Précédent" : "Back"}
            </button>
            <button type="button" onClick={() => (i === last ? go(0) : go(i + 1))} className="inline-flex items-center gap-1 h-10 px-4 rounded-[4px] bg-ink text-white font-semibold hover:bg-lake">
              {i === last ? (fr ? "Recommencer" : "Start again") : (fr ? "Suivant" : "Next")} <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => { if (i === last) setI(0); setPlaying((p) => !p); }}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[4px] font-semibold text-lake hover:underline"
              aria-pressed={playing}
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? (fr ? "Pause" : "Pause") : (fr ? "Lecture automatique" : "Autoplay")}
            </button>
          </div>
          <p className="mt-3 text-[0.8rem] text-muted-ink">{fr ? "Astuce : les flèches ← → du clavier changent d'étape." : "Tip: the ← → keys move between steps."}</p>
        </div>

        {/* The record as it stands after this step */}
        <div className="border border-line bg-paper p-4 sm:p-5 text-[0.93rem]">
          <p className="flex flex-wrap items-center gap-2.5">
            <span className="kicker font-mono tracking-normal text-ink">OD-9999</span>
            <StatusMark key={step.status} s={step.status} animate />
            {step.published && <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-spruce">● {fr ? "Publié" : "Live"}</span>}
          </p>
          <p className="mt-2 font-serif italic leading-snug">“AI is now doing this work. We are reducing our dispatch and back-office teams by 1,200 roles.”</p>
          <p className="meta mt-1">Halvorsen Freight · {fr ? "communiqué, 14 sept. 2026 · copie archivée" : "press release, 14 Sep 2026 · archived copy"}</p>

          {step.parts > 0 && (
            <div className="mt-4">
              <p className="kicker text-ink">{fr ? "Affirmations à vérifier" : "Claims to test"}</p>
              <ol className="mt-1.5 grid gap-1 list-decimal pl-5">
                {PARTS.slice(0, step.parts).map((p, n) => <li key={p.en} className="enter" style={{ "--delay": `${n * 80}ms` } as React.CSSProperties}>{pick(p)}</li>)}
              </ol>
            </div>
          )}
          {step.evidence > 0 && (
            <div className="mt-4">
              <p className="kicker text-ink">{fr ? "Preuves" : "Evidence"}</p>
              <ul className="mt-1.5 grid gap-1.5">
                {EVIDENCE.slice(0, step.evidence).map((e) => (
                  <li key={e.t.en} className="flex gap-2">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.kind === "contradicts" ? "bg-live" : "bg-muted-ink"}`} aria-hidden="true" />
                    <span><span className="sr-only">{e.kind === "contradicts" ? (fr ? "Contredit : " : "Conflicts: ") : (fr ? "Contexte : " : "Context: ")}</span>{pick(e.t)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {step.reply !== "none" && (
            <div className="mt-4">
              <p className="kicker text-ink">{fr ? "Droit de réponse" : "Right of reply"}</p>
              <div className="mt-1.5 h-2 bg-ice rounded-full overflow-hidden" aria-hidden="true">
                <div className={`h-full bg-lake transition-[width] duration-[1200ms] ease-out ${step.reply === "closed" ? "w-full" : "w-1/3"}`} />
              </div>
              <p className="mt-1">{step.reply === "waiting" ? (fr ? "Questions envoyées · 48 h pour répondre" : "Questions sent · 48 h to answer") : (fr ? "Délai écoulé · pas de réponse" : "Window closed · no answer")}</p>
            </div>
          )}
          <div className="mt-4">
            <p className="kicker text-ink">{fr ? "Historique du statut" : "Status history"}</p>
            <ol className="mt-1.5 grid gap-1.5">
              {HISTORY.slice(0, step.history).reverse().map((h) => (
                <li key={h.s} className="flex flex-wrap items-center gap-2">
                  <StatusMark s={h.s} className="text-[0.6rem]" />
                  <span className="text-muted-ink">{pick(h.d)}</span>
                </li>
              ))}
            </ol>
          </div>
          {step.reopen && (
            <p className="mt-4 border-t border-line pt-3 enter">
              <strong>{fr ? "Réouverture :" : "Reopens:"}</strong> 15 {fr ? "déc." : "Dec"} 2026 · 15 {fr ? "mars" : "Mar"} 2027
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
