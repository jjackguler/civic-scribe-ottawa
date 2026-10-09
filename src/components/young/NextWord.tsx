import { useId, useMemo, useState } from "react";
import { BookOpen, Dices, Plus, RotateCcw, Undo2 } from "lucide-react";
import { CORPUS, START_WORDS, activityById, buildBigrams, nextOptions } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("next-word")!;
const GOAL = 3;

export function NextWord() {
  const { locale, pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const uid = useId();
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [temp, setTemp] = useState(0.7);
  const [made, setMade] = useState<string[]>([]);
  const [peek, setPeek] = useState(false);
  const [done, setDone] = useState<null | { first: boolean }>(null);
  const [lastPick, setLastPick] = useState<string | null>(null);

  const training = useMemo(() => [...CORPUS.map(c => c[locale]), ...extra], [locale, extra]);
  const model = useMemo(() => buildBigrams(training), [training]);
  const last = words[words.length - 1];
  const finished = last === ".";
  const opts = last && !finished ? nextOptions(model, last, temp).slice(0, 6) : [];
  const stuck = !!last && !finished && opts.length === 0;

  const add = (w: string, how: "you" | "model") => {
    const next = [...words, w];
    setWords(next);
    setLastPick(how === "model" ? w : null);
    if (w === "." && next.length >= 4) {
      const s = next.join(" ").replace(" .", ".");
      const all = [...made, s];
      setMade(all);
      if (all.length === GOAL && !done) setDone({ first: award("next-word", all.length) });
    }
  };

  const sample = () => {
    if (!opts.length) return;
    const all = nextOptions(model, last, temp);
    let r = Math.random();
    for (const o of all) { r -= o.p; if (r <= 0) return add(o.word, "model"); }
    add(all[all.length - 1].word, "model");
  };

  const teach = () => {
    const clean = draft.toLowerCase().replace(/[^\p{L}\p{N}' .!?-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    if (clean.split(" ").length < 3) return;
    setExtra(x => [...x, /[.!?]$/.test(clean) ? clean : `${clean} .`].slice(-8));
    setDraft("");
  };

  const replay = () => { setWords([]); setMade([]); setDone(null); setExtra([]); setLastPick(null); };

  return (
    <div className="grid gap-6 grid-cols-1">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0">
          <div className="yl-card bg-white p-5 sm:p-6">
            <p className="font-extrabold">{t("Your sentence", "Ta phrase")}</p>
            <p className="mt-3 min-h-[3.5rem] flex flex-wrap gap-2 items-center" aria-live="polite">
              {words.length === 0
                ? <span className="text-muted-ink text-[1.05rem]">{t("Pick a first word below.", "Choisis un premier mot ci-dessous.")}</span>
                : words.map((w, n) => (
                  <span key={n} className={`yl-pop inline-block rounded-[10px] border-[3px] border-ink px-2.5 py-1 text-[1.2rem] font-bold ${n === words.length - 1 && lastPick ? "yl-tone-sun" : "bg-[var(--paper)]"}`}>{w}</span>
                ))}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="yl-chip" disabled={!words.length} onClick={() => { setWords(w => w.slice(0, -1)); setLastPick(null); }}><Undo2 className="h-4 w-4" aria-hidden="true" />{t("Undo", "Annuler")}</button>
              <button type="button" className="yl-chip" disabled={!words.length} onClick={() => { setWords([]); setLastPick(null); }}><RotateCcw className="h-4 w-4" aria-hidden="true" />{t("New sentence", "Nouvelle phrase")}</button>
            </div>
          </div>

          {words.length === 0 || finished ? (
            <div className="mt-5">
              {finished && <p className="font-extrabold text-[1.1rem] mb-3">{t("Full stop! Start another one:", "Point final! Commence-en une autre :")}</p>}
              <p className="font-bold">{t("First word", "Premier mot")}</p>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {START_WORDS[locale].map(w => <button key={w} type="button" className="yl-tile yl-tone-sky" onClick={() => { setWords([w]); setLastPick(null); }}>{w}</button>)}
              </div>
            </div>
          ) : stuck ? (
            <div className="yl-card yl-deal yl-tone-coral p-5 mt-5">
              <p className="font-extrabold text-[1.15rem]">{t("Stuck!", "Bloqué!")}</p>
              <p className="mt-1 leading-relaxed">{t(`The model never saw any word after "${last}" in its training text, so it has no idea what comes next. Undo, or teach it a sentence below.`, `Le modèle n'a jamais vu de mot après « ${last} » dans son texte d'entraînement : il ne sait pas quoi mettre. Annule, ou apprends-lui une phrase plus bas.`)}</p>
            </div>
          ) : (
            <div className="mt-5">
              <p className="font-bold">{t(`What usually comes after "${last}"?`, `Qu'est-ce qui suit souvent « ${last} »?`)}</p>
              <ul className="mt-3 grid gap-2.5">
                {opts.map(o => (
                  <li key={o.word}>
                    <button type="button" onClick={() => add(o.word, "you")} className="yl-bar-btn" aria-label={t(`${o.word}: ${Math.round(o.p * 100)} percent, seen ${o.count} times`, `${o.word} : ${Math.round(o.p * 100)} pour cent, vu ${o.count} fois`)}>
                      <span className="yl-bar-fill" style={{ width: `${Math.max(3, o.p * 100)}%` }} aria-hidden="true" />
                      <span className="relative flex items-center justify-between gap-3 w-full">
                        <span className="font-extrabold text-[1.15rem]">{o.word === "." ? t(". (end)", ". (fin)") : o.word}</span>
                        <span className="text-[0.95rem] font-bold tabular-nums">{Math.round(o.p * 100)} % · {t(`seen ${o.count}×`, `vu ${o.count}×`)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="yl-btn yl-btn--big yl-btn--ink mt-4" onClick={sample}><Dices className="h-6 w-6" aria-hidden="true" />{t("Let the model pick", "Laisser le modèle choisir")}</button>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:sticky lg:top-24">
          <div className="yl-card yl-tone-sun p-5">
            <label htmlFor={`${uid}-temp`} className="font-extrabold block">{t("Surprise level", "Niveau de surprise")} <span className="font-semibold">({t("temperature", "température")}: {temp.toFixed(1)})</span></label>
            <input id={`${uid}-temp`} type="range" min={0} max={1.5} step={0.1} value={temp} onChange={e => setTemp(Number(e.target.value))} className="yl-range mt-3 w-full" />
            <div className="flex justify-between text-[0.85rem] font-bold mt-1" aria-hidden="true"><span>{t("always the top word", "toujours le mot en tête")}</span><span>{t("more random", "plus au hasard")}</span></div>
            <p className="mt-3 text-[0.98rem] leading-relaxed">{t("Real chatbots do this too: low temperature repeats the most likely words, high temperature takes more chances.", "Les vrais robots font pareil : une température basse répète les mots les plus probables, une haute prend plus de risques.")}</p>
          </div>
          <div className="yl-card bg-white p-5">
            <p className="font-extrabold">{t(`Sentences made: ${made.length} of ${GOAL}`, `Phrases créées : ${made.length} sur ${GOAL}`)}</p>
            <ol className="mt-2 grid gap-1.5 list-decimal pl-5">
              {made.map((s, n) => <li key={n} className="yl-pop leading-relaxed">{s}</li>)}
            </ol>
            {made.length > 0 && <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-ink">{t("Do they sound right? Are they true? The model can't tell. It only knows which words came next in its training text.", "Ça sonne bien? Est-ce vrai? Le modèle ne peut pas le savoir. Il sait seulement quels mots suivaient dans son texte d'entraînement.")}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="yl-card bg-white p-5">
          <button type="button" className="yl-chip" aria-expanded={peek} onClick={() => setPeek(p => !p)}><BookOpen className="h-4 w-4" aria-hidden="true" />{peek ? t("Hide the training text", "Cacher le texte d'entraînement") : t("Peek at the training text", "Voir le texte d'entraînement")}</button>
          {peek && (
            <ul className="mt-3 grid gap-1 text-[0.98rem] max-h-72 overflow-auto pr-2">
              {training.map((s, n) => <li key={n} className={n >= CORPUS.length ? "font-bold" : ""}>{s}</li>)}
            </ul>
          )}
          <p className="mt-3 text-[0.95rem] text-muted-ink">{t(`${training.length} sentences. Big models learn from billions, but the idea is the same.`, `${training.length} phrases. Les grands modèles en apprennent des milliards, mais l'idée est la même.`)}</p>
        </div>
        <div className="yl-card bg-white p-5">
          <label htmlFor={`${uid}-teach`} className="font-extrabold block">{t("Teach it a sentence", "Apprends-lui une phrase")}</label>
          <p className="text-[0.95rem] text-muted-ink mt-1">{t("Stays in this tab only: not saved, not sent. Please don't type names or personal details.", "Reste dans cet onglet seulement : ni enregistré, ni envoyé. N'écris pas de noms ni de détails personnels.")}</p>
          <div className="mt-3 flex gap-2">
            <input id={`${uid}-teach`} value={draft} maxLength={120} autoComplete="off" spellCheck onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") teach(); }}
              placeholder={t("the robot likes to dance .", "le robot aime danser .")} className="min-w-0 flex-1 rounded-[12px] border-[3px] border-ink px-3 min-h-[48px] text-[1.05rem] bg-[var(--paper)]" />
            <button type="button" className="yl-btn" onClick={teach} aria-label={t("Add sentence", "Ajouter la phrase")}><Plus className="h-5 w-5" aria-hidden="true" /></button>
          </div>
        </div>
      </div>

      {done && (
        <FinishPanel a={A} firstTime={done.first} onReplay={replay} headline={t("You just ran a language model!", "Tu viens de faire tourner un modèle de langage!")}>
          <p>{t("Big chatbots work on the same idea at a giant scale: predict a likely next word, again and again. That's why they can sound sure and still be wrong. Check facts with trusted sources.", "Les grands robots conversationnels font la même chose à très grande échelle : prédire un mot probable, encore et encore. C'est pourquoi ils peuvent sembler sûrs et se tromper. Vérifie les faits auprès de sources fiables.")}</p>
        </FinishPanel>
      )}
      {!done && <p className="sr-only">{pick({ en: "Make three sentences to earn the stamp.", fr: "Crée trois phrases pour obtenir le tampon." })}</p>}
    </div>
  );
}
