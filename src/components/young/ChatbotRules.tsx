import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, MessageSquareText, Play, Plus, Trash2, UserRound, X } from "lucide-react";
import { BOT_FALLBACK, BOT_KEYWORDS, BOT_REPLIES, BOT_TESTS, activityById, keywordHits, runBot, type BotRule } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, useReducedMotion, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("chatbot-rules")!;
type Outcome = { id: string; fired: number; ok: boolean };

export function ChatbotRules() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const reduce = useReducedMotion();
  const uid = useId();
  const [rules, setRules] = useState<BotRule[]>([{ keyword: "hello", reply: "r-hello" }]);
  const [running, setRunning] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [tried, setTried] = useState("");
  const [done, setDone] = useState<null | { first: boolean }>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const msg = (n: number) => pick(BOT_TESTS[n].text);
  const evaluate = (rs: BotRule[]): Outcome[] => BOT_TESTS.map((m, n) => {
    const fired = runBot(rs, msg(n));
    const reply = fired >= 0 ? rs[fired].reply : null;
    return { id: m.id, fired, ok: reply === m.expect };
  });

  const edit = (k: number, patch: Partial<BotRule>) => { setOutcomes([]); setRules(rs => rs.map((r, n) => (n === k ? { ...r, ...patch } : r))); };
  const move = (k: number, d: -1 | 1) => { setOutcomes([]); setRules(rs => { const a = [...rs]; const j = k + d; if (j < 0 || j >= a.length) return a; [a[k], a[j]] = [a[j], a[k]]; return a; }); };
  const remove = (k: number) => { setOutcomes([]); setRules(rs => rs.filter((_, n) => n !== k)); };
  const addRule = () => {
    const unused = BOT_KEYWORDS.find(k => !rules.some(r => r.keyword === k.id));
    if (!unused) return;
    setOutcomes([]);
    setRules(rs => [...rs, { keyword: unused.id, reply: BOT_REPLIES[0].id }]);
  };

  const run = () => {
    const all = evaluate(rules);
    setOutcomes([]);
    if (reduce) { finish(all); return; }
    let n = 0;
    const step = () => {
      setRunning(n);
      setOutcomes(all.slice(0, n + 1));
      n++;
      if (n < all.length) timer.current = setTimeout(step, 650);
      else timer.current = setTimeout(() => finish(all), 650);
    };
    step();
  };
  const finish = (all: Outcome[]) => {
    setRunning(null);
    setOutcomes(all);
    resultsRef.current?.focus({ preventScroll: true });
    if (all.every(o => o.ok) && !done) setDone({ first: award("chatbot-rules", all.length) });
  };

  const hints: string[] = [];
  if (outcomes.length === BOT_TESTS.length && running === null) {
    BOT_TESTS.forEach((m, n) => {
      const o = outcomes[n];
      if (o.ok) return;
      const firedKw = o.fired >= 0 ? rules[o.fired].keyword : null;
      if (m.expect === "r-safety" && firedKw !== "safety") hints.push(rules.some(r => r.keyword === "safety") ? t("A message about feeling unsafe was caught by another rule. Safety rules go first!", "Un message sur la sécurité a été attrapé par une autre règle. La sécurité passe en premier!") : t("Nobody handles messages about feeling scared or hurt. Add a safety rule.", "Aucune règle ne gère les messages de peur ou de blessure. Ajoute une règle de sécurité."));
      else if (firedKw === "hello" && m.expect && m.expect !== "r-hello") hints.push(t("The greeting rule answered a real question. Put specific rules above the greeting.", "La règle des salutations a répondu à une vraie question. Place les règles précises au-dessus."));
      else if (m.expect && !rules.some(r => r.keyword === BOT_REPLIES.find(x => x.id === m.expect)?.id.replace("r-", ""))) hints.push(t("One kind of question has no rule yet. Add a rule for it.", "Un type de question n'a pas encore de règle. Ajoutes-en une."));
      else if (o.fired >= 0 && m.expect === null) hints.push(t("A message the bot can't help with got a reply anyway. Check your keywords.", "Un message hors sujet a reçu une réponse quand même. Vérifie tes mots-clés."));
      else hints.push(t("A rule has the right keyword but the wrong reply. Match each keyword to its answer.", "Une règle a le bon mot-clé mais la mauvaise réponse. Associe chaque mot-clé à sa réponse."));
    });
  }
  const uniqueHints = [...new Set(hints)];
  const score = outcomes.filter(o => o.ok).length;
  const triedFired = tried.trim() ? runBot(rules, tried) : null;
  const replay = () => { setRules([{ keyword: "hello", reply: "r-hello" }]); setOutcomes([]); setDone(null); setTried(""); };

  return (
    <div className="grid gap-6 grid-cols-1">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        {/* Flow chart */}
        <div className="min-w-0">
          <h2 className="yl-title text-[1.5rem] sm:text-[1.8rem]">{t("Your library help-desk bot", "Ton robot d'accueil de la bibliothèque")}</h2>
          <p className="mt-1 leading-relaxed">{t("A message comes in at the top. The bot checks each rule in order and uses the first one that matches.", "Un message arrive en haut. Le robot vérifie chaque règle dans l'ordre et utilise la première qui correspond.")}</p>
          <ol className="yl-flow mt-5">
            <li className="yl-flow-start"><MessageSquareText className="h-5 w-5" aria-hidden="true" />{t("Message arrives", "Un message arrive")}</li>
            {rules.map((r, k) => {
              const hit = running !== null && outcomes[running]?.fired === k;
              const kwLabel = pick(BOT_KEYWORDS.find(x => x.id === r.keyword)!.label);
              return (
                <li key={`${r.keyword}-${k}`} className={`yl-flow-rule yl-in ${hit ? "is-hit" : ""}`}>
                  <div className="yl-flow-q">
                    <span className="yl-diamond" aria-hidden="true"><span>{k + 1}</span></span>
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`${uid}-k${k}`} className="block text-[0.9rem] font-bold">{t(`Rule ${k + 1}: if the message has…`, `Règle ${k + 1} : si le message contient…`)}</label>
                      <select id={`${uid}-k${k}`} value={r.keyword} onChange={e => edit(k, { keyword: e.target.value })} className="yl-select mt-1">
                        {BOT_KEYWORDS.map(kw => <option key={kw.id} value={kw.id}>{pick(kw.label)}</option>)}
                      </select>
                      <label htmlFor={`${uid}-r${k}`} className="block text-[0.9rem] font-bold mt-2">{t("…then reply:", "…alors répondre :")}</label>
                      <select id={`${uid}-r${k}`} value={r.reply} onChange={e => edit(k, { reply: e.target.value })} className="yl-select mt-1">
                        {BOT_REPLIES.map(rp => <option key={rp.id} value={rp.id}>{pick(rp.text).slice(0, 60)}{pick(rp.text).length > 60 ? "…" : ""}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="yl-chip" disabled={k === 0} onClick={() => move(k, -1)} aria-label={t(`Move rule ${k + 1} up (${kwLabel})`, `Monter la règle ${k + 1} (${kwLabel})`)}><ArrowUp className="h-4 w-4" aria-hidden="true" />{t("Up", "Monter")}</button>
                    <button type="button" className="yl-chip" disabled={k === rules.length - 1} onClick={() => move(k, 1)} aria-label={t(`Move rule ${k + 1} down (${kwLabel})`, `Descendre la règle ${k + 1} (${kwLabel})`)}><ArrowDown className="h-4 w-4" aria-hidden="true" />{t("Down", "Descendre")}</button>
                    <button type="button" className="yl-chip" disabled={rules.length === 1} onClick={() => remove(k)} aria-label={t(`Remove rule ${k + 1}`, `Retirer la règle ${k + 1}`)}><Trash2 className="h-4 w-4" aria-hidden="true" />{t("Remove", "Retirer")}</button>
                  </div>
                  <p className="yl-flow-no" aria-hidden="true">{t("no match? keep going", "pas trouvé? on continue")}</p>
                </li>
              );
            })}
            <li className={`yl-flow-end ${running !== null && outcomes[running]?.fired === -1 ? "is-hit" : ""}`}>
              <UserRound className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span><strong>{t("No rule matched: ", "Aucune règle : ")}</strong>{pick(BOT_FALLBACK)}</span>
            </li>
          </ol>
          <button type="button" className="yl-btn mt-4" disabled={rules.length >= BOT_KEYWORDS.length} onClick={addRule}><Plus className="h-5 w-5" aria-hidden="true" />{t("Add a rule", "Ajouter une règle")}</button>
        </div>

        {/* Tests */}
        <div className="grid gap-4 lg:sticky lg:top-24">
          <div className="yl-card yl-tone-coral p-5">
            <h3 ref={resultsRef} tabIndex={-1} className="font-extrabold text-[1.15rem] outline-none">{t("Test with six real messages", "Teste avec six vrais messages")}</h3>
            <button type="button" className="yl-btn yl-btn--big yl-btn--ink mt-3 w-full" onClick={run} disabled={running !== null}><Play className="h-6 w-6" aria-hidden="true" />{running !== null ? t("Testing…", "Test en cours…") : t("Run the tests", "Lancer les tests")}</button>
            <ul className="mt-4 grid gap-2.5" aria-live="polite">
              {BOT_TESTS.map((m, n) => {
                const o = outcomes[n];
                const reply = o ? (o.fired >= 0 ? pick(BOT_REPLIES.find(r => r.id === rules[o.fired]?.reply)!.text) : pick(BOT_FALLBACK)) : null;
                return (
                  <li key={m.id} className={`rounded-[14px] border-[3px] border-ink bg-white p-3 ${o ? "yl-pop" : ""}`}>
                    <p className="font-bold leading-snug">“{msg(n)}”</p>
                    {o && (
                      <p className="mt-1.5 flex gap-2 items-start text-[0.95rem] leading-snug">
                        {o.ok ? <Check className="h-5 w-5 shrink-0 text-spruce" aria-label={t("good reply", "bonne réponse")} /> : <X className="h-5 w-5 shrink-0 text-live" aria-label={t("wrong reply", "mauvaise réponse")} />}
                        <span>{reply}</span>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            {outcomes.length === BOT_TESTS.length && running === null && (
              <div className="mt-4">
                <p className="font-extrabold text-[1.1rem]">{t(`${score} of ${BOT_TESTS.length} handled well`, `${score} sur ${BOT_TESTS.length} bien gérés`)}</p>
                {uniqueHints.length > 0 && <ul className="mt-2 grid gap-1.5 list-disc pl-5">{uniqueHints.map(h => <li key={h}>{h}</li>)}</ul>}
              </div>
            )}
          </div>
          <div className="yl-card bg-white p-5">
            <label htmlFor={`${uid}-try`} className="font-extrabold block">{t("Try your own message", "Essaie ton propre message")}</label>
            <p className="text-[0.92rem] text-muted-ink mt-1">{t("Checked right here in your browser. Not saved, not sent.", "Vérifié ici, dans ton navigateur. Ni enregistré, ni envoyé.")}</p>
            <input id={`${uid}-try`} value={tried} maxLength={100} autoComplete="off" onChange={e => setTried(e.target.value)} placeholder={t("when do you close?", "à quelle heure vous fermez?")} className="mt-2 w-full rounded-[12px] border-[3px] border-ink px-3 min-h-[48px] text-[1.05rem] bg-[var(--paper)]" />
            {triedFired !== null && (
              <p className="mt-3 leading-relaxed" aria-live="polite">
                <strong>{triedFired >= 0 ? t(`Rule ${triedFired + 1} fires: `, `La règle ${triedFired + 1} s'applique : `) : t("No rule: ", "Aucune règle : ")}</strong>
                {triedFired >= 0 ? pick(BOT_REPLIES.find(r => r.id === rules[triedFired].reply)!.text) : pick(BOT_FALLBACK)}
                {triedFired >= 0 && BOT_KEYWORDS.filter(k => k.id !== rules[triedFired].keyword && keywordHits(k.id, tried)).length > 0 && (
                  <span className="block text-[0.92rem] text-muted-ink mt-1">{t("Other rules matched too, but the first one wins.", "D'autres règles correspondaient aussi, mais la première l'emporte.")}</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <aside className="rounded-[20px] border-[3px] border-dashed border-ink p-5 bg-white/70">
        <p className="font-extrabold">{t("Rules bot or AI chatbot?", "Robot à règles ou robot d'IA?")}</p>
        <p className="mt-1 leading-relaxed">{t("Your bot follows exact rules: it's predictable and you can always see why it answered. AI chatbots guess their answers from patterns: more flexible, but harder to check. Either way, a good bot puts safety first and hands off to a person when it can't help.", "Ton robot suit des règles exactes : il est prévisible et on sait toujours pourquoi il répond. Les robots d'IA devinent leurs réponses à partir de régularités : plus souples, mais plus difficiles à vérifier. Dans les deux cas, un bon robot met la sécurité en premier et passe le relais à une personne quand il ne peut pas aider.")}</p>
      </aside>

      {done && (
        <FinishPanel a={A} firstTime={done.first} onReplay={replay} headline={t("Six for six. Your bot is ready!", "Six sur six. Ton robot est prêt!")}>
          <p>{t("You learned the two big rules of bot design: order matters, and safety goes first. A bot that knows when to say \"let me get a person\" is a good bot.", "Tu as appris les deux grandes règles : l'ordre compte, et la sécurité passe en premier. Un robot qui sait dire « je vais chercher une personne » est un bon robot.")}</p>
        </FinishPanel>
      )}
    </div>
  );
}
