import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, ChefHat, Lightbulb, Star, Trash2 } from "lucide-react";
import { ORDERS, SHELF_HINT, SHELF_LABEL, activityById, scorePrompt, type KitchenScore, type Shelf, type Tile } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("prompt-kitchen")!;
const SHELVES: Shelf[] = ["role", "task", "detail", "tone"];
const SHELF_TONE: Record<Shelf, string> = { role: "yl-tone-sky", task: "yl-tone-sun", detail: "yl-tone-mint", tone: "yl-tone-grape" };

export function PromptKitchen() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const [o, setO] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [served, setServed] = useState<KitchenScore | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState<null | { first: boolean }>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLHeadingElement>(null);
  const order = ORDERS[o];
  const tiles = (s: Shelf) => order.tiles.filter(x => x.shelf === s);
  const chosen = picked.map(id => order.tiles.find(x => x.id === id)).filter(Boolean) as Tile[];

  useEffect(() => { if (served) resultRef.current?.focus({ preventScroll: false }); }, [served]);
  const firstRender = useRef(true);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } orderRef.current?.focus(); }, [o]);

  const toggle = (tile: Tile) => {
    setServed(null);
    setPicked(p => {
      if (p.includes(tile.id)) return p.filter(x => x !== tile.id);
      if (tile.shelf === "detail") {
        const ds = p.filter(id => order.tiles.find(x => x.id === id)?.shelf === "detail");
        const keep = ds.length >= 2 ? p.filter(id => id !== ds[0]) : p;
        return [...keep, tile.id];
      }
      return [...p.filter(id => order.tiles.find(x => x.id === id)?.shelf !== tile.shelf), tile.id];
    });
  };

  const serve = () => setServed(scorePrompt(order, picked));
  const nextOrder = () => {
    const all = [...scores, served?.score ?? 0];
    if (o + 1 >= ORDERS.length) {
      setDone({ first: award("prompt-kitchen", Math.round(all.reduce((a, b) => a + b, 0) / all.length)) });
      return;
    }
    setScores(all); setO(o + 1); setPicked([]); setServed(null);
  };
  const replay = () => { setO(0); setPicked([]); setServed(null); setScores([]); setDone(null); };

  if (done) {
    return (
      <FinishPanel a={A} firstTime={done.first} onReplay={replay} headline={t("Three orders served, chef!", "Trois commandes servies, chef!")}>
        <p>{t("Your recipe for a good prompt: a role, one clear task, a couple of specific details, and a tone. And the secret ingredient: leave out names, schools, addresses and passwords. Always.", "Ta recette d'une bonne requête : un rôle, une tâche claire, quelques détails précis et un ton. L'ingrédient secret : laisser de côté noms, écoles, adresses et mots de passe. Toujours.")}</p>
      </FinishPanel>
    );
  }

  const ordered = SHELVES.flatMap(s => chosen.filter(c => c.shelf === s));

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div className="min-w-0">
        <div className="yl-ticket">
          <p className="font-bold text-[0.95rem] inline-flex items-center gap-2"><ChefHat className="h-5 w-5" aria-hidden="true" />{t(`Order ${o + 1} of ${ORDERS.length}`, `Commande ${o + 1} sur ${ORDERS.length}`)}</p>
          <h2 ref={orderRef} tabIndex={-1} className="yl-title text-[1.4rem] sm:text-[1.6rem] leading-snug mt-1 outline-none">{pick(order.goal).replace(/^[^:]+:\s*/, "")}</h2>
        </div>

        <div className="mt-6 grid gap-5">
          {SHELVES.map(s => (
            <fieldset key={s} className="min-w-0">
              <legend className="flex flex-wrap items-baseline gap-x-3">
                <span className={`inline-block rounded-full border-[3px] border-ink px-3 py-0.5 font-extrabold ${SHELF_TONE[s]}`}>{pick(SHELF_LABEL[s])}</span>
                <span className="text-[0.95rem] font-semibold text-muted-ink">{pick(SHELF_HINT[s])}</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {tiles(s).map(tile => {
                  const on = picked.includes(tile.id);
                  return (
                    <button key={tile.id} type="button" aria-pressed={on} onClick={() => toggle(tile)} className={`yl-tile ${on ? SHELF_TONE[s] : ""}`}>
                      {pick(tile.text)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 grid gap-4">
        <div className="yl-card bg-white p-5">
          <p className="font-extrabold inline-flex items-center gap-2"><ChefHat className="h-5 w-5" aria-hidden="true" />{t("Your prompt", "Ta requête")}</p>
          <div className="yl-pot mt-3" aria-live="polite">
            {ordered.length === 0
              ? <p className="text-muted-ink">{t("Tap tiles to add ingredients.", "Touche des tuiles pour ajouter des ingrédients.")}</p>
              : (
                <p className="text-[1.08rem] leading-[2.1]">
                  {ordered.map(c => (
                    <span key={c.id} className={`yl-pop inline rounded-[8px] border-2 border-ink px-1.5 py-0.5 mr-1.5 [box-decoration-break:clone] ${SHELF_TONE[c.shelf]} ${c.personal ? "outline-[3px] outline-dashed outline-live" : ""}`}>{pick(c.text)}</span>
                  ))}
                </p>
              )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="yl-btn yl-btn--big yl-btn--ink flex-1" disabled={picked.length === 0} onClick={serve}>{t("Serve it!", "Servir!")}</button>
            <button type="button" className="yl-btn" disabled={picked.length === 0} onClick={() => { setPicked([]); setServed(null); }} aria-label={t("Empty the bowl", "Vider le bol")}><Trash2 className="h-5 w-5" aria-hidden="true" /></button>
          </div>
        </div>

        {served && (
          <div ref={resultRef} tabIndex={-1} className={`yl-card yl-deal p-5 outline-none ${served.personal ? "yl-tone-coral" : served.stars >= 2 ? "yl-tone-mint" : "yl-tone-sun"}`} aria-live="polite">
            {served.personal ? (
              <p className="font-extrabold text-[1.2rem] inline-flex items-center gap-2"><AlertTriangle className="h-6 w-6" aria-hidden="true" />{t("Personal info spotted!", "Renseignement personnel repéré!")}</p>
            ) : (
              <div className="flex items-center gap-2" role="img" aria-label={t(`${served.stars} of 3 stars`, `${served.stars} étoiles sur 3`)}>
                {[1, 2, 3].map(n => (
                  <Star key={n} className={`h-10 w-10 ${n <= served.stars ? "yl-star-on" : ""}`} style={{ animationDelay: `${n * 140}ms` }} fill={n <= served.stars ? "var(--signal)" : "white"} strokeWidth={2.5} aria-hidden="true" />
                ))}
                <span className="ml-2 font-extrabold text-[1.2rem] tabular-nums">{served.score} / 100</span>
              </div>
            )}
            {served.tips.length > 0 ? (
              <ul className="mt-3 grid gap-2">
                {served.tips.map((tip, n) => (
                  <li key={n} className="flex gap-2 items-start leading-relaxed"><Lightbulb className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" /><span>{pick(tip)}</span></li>
                ))}
              </ul>
            ) : <p className="mt-3 font-semibold">{t("Perfect recipe. Clear, specific, kind and private.", "Recette parfaite. Claire, précise, bienveillante et privée.")}</p>}
            {served.stars >= 2 ? (
              <button type="button" className="yl-btn yl-btn--ink mt-4" onClick={nextOrder}>
                {o + 1 >= ORDERS.length ? t("Finish", "Terminer") : t("Next order", "Commande suivante")} <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : <p className="mt-3 font-bold">{t("Change some tiles and serve it again. Two stars moves you on.", "Change des tuiles et sers de nouveau. Deux étoiles pour passer à la suite.")}</p>}
          </div>
        )}
        <p className="text-[0.92rem] text-muted-ink">{t("The kitchen scores your recipe with simple rules, right in your browser. Nothing is sent to an AI.", "La cuisine note ta recette avec des règles simples, dans ton navigateur. Rien n'est envoyé à une IA.")}</p>
      </div>
    </div>
  );
}
