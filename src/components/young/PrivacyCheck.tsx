import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Lock, ShieldCheck } from "lucide-react";
import { PRIVACY_QS, activityById } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, RoundDots, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("privacy-check")!;

export function PrivacyCheck() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(PRIVACY_QS.length).fill(null));
  const [done, setDone] = useState<null | { first: boolean; score: number }>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const qRef = useRef<HTMLHeadingElement>(null);
  const q = PRIVACY_QS[i];
  const answered = sel !== null;
  const right = answered && !!q.options[sel!].best;

  useEffect(() => { if (answered) nextRef.current?.focus({ preventScroll: true }); }, [answered]);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } qRef.current?.focus({ preventScroll: true }); }, [i]);

  const choose = (n: number) => {
    if (answered) return;
    setSel(n);
    setResults(r => r.map((v, k) => (k === i ? !!q.options[n].best : v)));
  };
  const next = () => {
    if (i + 1 >= PRIVACY_QS.length) {
      const score = results.filter(Boolean).length;
      setDone({ first: award("privacy-check", score), score });
      return;
    }
    setSel(null); setI(i + 1);
  };
  const replay = () => { setI(0); setSel(null); setResults(Array(PRIVACY_QS.length).fill(null)); setDone(null); };
  const kit = PRIVACY_QS.filter((_, n) => results[n] !== null);

  if (done) {
    return (
      <FinishPanel a={A} firstTime={done.first} onReplay={replay} headline={t("Your privacy toolkit is ready.", "Ta trousse de confidentialité est prête.")}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {PRIVACY_QS.map(pq => <li key={pq.id} className="flex gap-2 items-start"><ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" /><span>{pick(pq.tool)}</span></li>)}
        </ul>
        <p className="mt-3">{t("Your information is yours. Sharing less is a smart choice, not a rude one.", "Tes renseignements t'appartiennent. Partager moins, c'est malin, pas impoli.")}</p>
      </FinishPanel>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0">
        <RoundDots total={PRIVACY_QS.length} at={i} results={results} />
        <div key={q.id} className="yl-card yl-deal yl-tone-mint p-5 sm:p-7 mt-4">
          <h2 ref={qRef} tabIndex={-1} className="yl-title text-[1.4rem] sm:text-[1.7rem] leading-snug outline-none">{pick(q.q)}</h2>
        </div>
        <div className="mt-5 grid gap-3" role="group" aria-label={t("Your choice", "Ton choix")}>
          {q.options.map((o, n) => {
            const isSel = sel === n;
            const show = answered && (o.best || isSel);
            return (
              <button key={n} type="button" onClick={() => choose(n)} disabled={answered} aria-pressed={isSel}
                className={`yl-btn yl-btn--big justify-start w-full disabled:opacity-100 ${show ? (o.best ? "yl-tone-mint" : "yl-tone-coral") : answered ? "opacity-70" : ""}`}>
                <span aria-hidden="true" className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-white border-2 border-ink font-extrabold">{String.fromCharCode(65 + n)}</span>
                <span className="flex-1">{pick(o.text)}</span>
                {answered && o.best && <Check className="h-6 w-6 shrink-0" aria-label={t("best choice", "meilleur choix")} />}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="yl-card yl-deal bg-white p-5 mt-5" aria-live="polite">
            <p className="font-extrabold text-[1.1rem]">{right ? t("Smart choice!", "Bon choix!") : t("Here's a safer choice", "Voici un choix plus sûr")}</p>
            <p className="mt-2 text-[1.05rem] leading-relaxed">{pick(q.why)}</p>
            <button ref={nextRef} type="button" className="yl-btn yl-btn--big yl-btn--ink mt-4" onClick={next}>
              {i + 1 >= PRIVACY_QS.length ? t("Finish", "Terminer") : t("Next", "Suivant")} <ArrowRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <aside className="yl-card bg-white p-5">
        <p className="font-extrabold text-[1.1rem] inline-flex items-center gap-2"><Lock className="h-5 w-5" aria-hidden="true" />{t("Your privacy toolkit", "Ta trousse de confidentialité")}</p>
        <ul className="mt-3 grid gap-2">
          {kit.length === 0
            ? <li className="text-muted-ink">{t("Answer to add your first tool.", "Réponds pour ajouter ton premier outil.")}</li>
            : kit.map(pq => <li key={pq.id} className="yl-pop flex gap-2 items-start"><ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" /><span>{pick(pq.tool)}</span></li>)}
        </ul>
        <p className="mt-4 text-[0.92rem] text-muted-ink">{t("Your answers aren't saved or sent anywhere.", "Tes réponses ne sont ni enregistrées ni envoyées.")}</p>
      </aside>
    </div>
  );
}
