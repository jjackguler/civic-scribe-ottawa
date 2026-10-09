import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Cog, Sparkles, X } from "lucide-react";
import { AI_OR_NOT, activityById, type AiOrNotItem } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, ICONS, RoundDots, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("ai-or-not")!;
const ROUND = 10;

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function AiOrNot() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  // The first round is in a fixed order so the page renders the same on the server and in the browser.
  const [deck, setDeck] = useState<AiOrNotItem[]>(() => AI_OR_NOT.slice(0, ROUND));
  const [i, setI] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(ROUND).fill(null));
  const [choice, setChoice] = useState<boolean | null>(null);
  const [done, setDone] = useState<null | { first: boolean; score: number }>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const item = deck[i];
  const flipped = choice !== null;
  const right = flipped && choice === item.ai;
  const Icon = ICONS[item.icon];

  useEffect(() => { if (flipped) nextRef.current?.focus({ preventScroll: true }); }, [flipped]);
  const moved = useRef(false);
  useEffect(() => { if (moved.current) cardRef.current?.focus({ preventScroll: true }); moved.current = true; }, [i]);

  const answer = (saysAi: boolean) => {
    if (flipped) return;
    setChoice(saysAi);
    setResults(r => r.map((v, n) => (n === i ? saysAi === item.ai : v)));
  };

  const next = () => {
    if (i + 1 >= deck.length) {
      const score = results.filter(Boolean).length;
      setDone({ first: award("ai-or-not", score), score });
      return;
    }
    setChoice(null);
    setI(i + 1);
  };

  const replay = () => {
    setDeck(shuffle(AI_OR_NOT).slice(0, ROUND));
    setI(0); setChoice(null); setResults(Array(ROUND).fill(null)); setDone(null);
  };

  if (done) {
    return (
      <FinishPanel a={A} firstTime={done.first} onReplay={replay}
        headline={done.score >= 8 ? t(`${done.score} out of ${ROUND}. You're an AI spotter!`, `${done.score} sur ${ROUND}. Tu sais repérer l'IA!`) : t(`${done.score} out of ${ROUND}, and now you know the trick.`, `${done.score} sur ${ROUND}, et maintenant tu connais le truc.`)}>
        <p>{t("The trick: if a machine learned from lots of examples, it uses AI. If it just follows a fixed rule someone wrote, it doesn't. Both kinds are useful!", "Le truc : si une machine a appris à partir de beaucoup d'exemples, elle utilise l'IA. Si elle suit une règle fixe écrite par quelqu'un, non. Les deux sortes sont utiles!")}</p>
      </FinishPanel>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div>
        <RoundDots total={deck.length} at={i} results={results} />
        <div key={`${item.id}-${i}`} className={`yl-flip yl-deal mt-4 ${flipped ? "is-flipped" : ""}`}>
          <div ref={cardRef} tabIndex={-1} className="yl-flip-inner outline-none" aria-label={t(`Card ${i + 1}: ${pick(item.name)}`, `Carte ${i + 1} : ${pick(item.name)}`)}>
            <div className="yl-face yl-card yl-tone-sun p-6 sm:p-8 flex flex-col items-center text-center justify-center min-h-[300px]" aria-hidden={flipped}>
              <span key={item.id} className="yl-pop grid place-items-center h-24 w-24 rounded-full bg-white border-[3px] border-ink">{Icon && <Icon className="h-12 w-12" aria-hidden="true" />}</span>
              <p className="yl-title text-[1.8rem] sm:text-[2.2rem] leading-tight mt-5">{pick(item.name)}</p>
              <p className="mt-2 text-[1.1rem] font-semibold">{t("Does it use AI?", "Utilise-t-il l'IA?")}</p>
            </div>
            <div className={`yl-face yl-face--back yl-card p-6 sm:p-8 flex flex-col items-center text-center justify-center min-h-[300px] ${right ? "yl-tone-mint" : "yl-tone-coral"}`} aria-hidden={!flipped}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white border-[3px] border-ink px-4 py-1.5 font-extrabold text-[1.05rem]">
                {right ? <Check className="h-5 w-5" aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
                {right ? t("You got it!", "Bravo!") : t("Not quite", "Pas tout à fait")}
              </span>
              <p className="yl-title text-[1.6rem] sm:text-[2rem] leading-tight mt-4">
                {pick(item.name)}: {item.partly ? t("partly AI", "en partie de l'IA") : item.ai ? t("uses AI", "utilise l'IA") : t("no AI", "pas d'IA")}
              </p>
              <p className="mt-3 text-[1.1rem] leading-relaxed max-w-[30rem]">{pick(item.why)}</p>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {flipped ? `${right ? t("Correct.", "Bonne réponse.") : t("Not quite.", "Pas tout à fait.")} ${pick(item.why)}` : ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {!flipped ? (
            <>
              <button type="button" className="yl-btn yl-btn--big yl-tone-sky flex-1 min-w-[150px]" onClick={() => answer(true)}>
                <Sparkles className="h-6 w-6" aria-hidden="true" /> {t("Uses AI", "Utilise l'IA")}
              </button>
              <button type="button" className="yl-btn yl-btn--big flex-1 min-w-[150px]" onClick={() => answer(false)}>
                <Cog className="h-6 w-6" aria-hidden="true" /> {t("No AI", "Pas d'IA")}
              </button>
            </>
          ) : (
            <button ref={nextRef} type="button" className="yl-btn yl-btn--big yl-btn--ink flex-1" onClick={next}>
              {i + 1 >= deck.length ? t("See my score", "Voir mon score") : t("Next card", "Carte suivante")} <ArrowRight className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <aside className="yl-card p-5 bg-white">
        <p className="font-extrabold text-[1.1rem]">{t("How to tell", "Comment savoir")}</p>
        <ul className="mt-3 grid gap-3 text-[1rem] leading-relaxed">
          <li className="flex gap-3"><span className="grid place-items-center h-9 w-9 shrink-0 rounded-full yl-tone-sky border-2 border-ink"><Sparkles className="h-4 w-4" aria-hidden="true" /></span><span><strong>{t("Uses AI: ", "Utilise l'IA : ")}</strong>{t("it learned from lots of examples and makes a best guess.", "elle a appris de beaucoup d'exemples et fait sa meilleure supposition.")}</span></li>
          <li className="flex gap-3"><span className="grid place-items-center h-9 w-9 shrink-0 rounded-full bg-white border-2 border-ink"><Cog className="h-4 w-4" aria-hidden="true" /></span><span><strong>{t("No AI: ", "Pas d'IA : ")}</strong>{t("it follows exact rules a person wrote, the same way every time.", "elle suit des règles exactes écrites par une personne, toujours pareil.")}</span></li>
        </ul>
        <p className="mt-4 text-[0.95rem] text-muted-ink">{t("Neither kind is better. A calculator is great because it never guesses!", "Aucune n'est meilleure. Une calculatrice est géniale parce qu'elle ne devine jamais!")}</p>
      </aside>
    </div>
  );
}
