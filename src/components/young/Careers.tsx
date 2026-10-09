import { useState } from "react";
import { BookOpen, Heart, RotateCcw } from "lucide-react";
import { CAREERS, INTERESTS, activityById, type Interest } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, ICONS, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("career-paths")!;
const GOAL = 5;
const TONES = ["yl-tone-sun", "yl-tone-sky", "yl-tone-coral", "yl-tone-mint", "yl-tone-grape"];

export function Careers() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const [likes, setLikes] = useState<Interest[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [done, setDone] = useState<null | { first: boolean }>(null);

  const shown = likes.length ? CAREERS.filter(c => c.interests.some(i => likes.includes(i))) : CAREERS;
  const flip = (id: string) => {
    setOpen(o => (o.includes(id) ? o.filter(x => x !== id) : [...o, id]));
    if (!seen.includes(id)) {
      const s = [...seen, id];
      setSeen(s);
      if (s.length === GOAL && !done) setDone({ first: award("career-paths", s.length) });
    }
  };
  const replay = () => { setOpen([]); setSeen([]); setLikes([]); setDone(null); };

  return (
    <div className="grid gap-6 grid-cols-1">
      <div>
        <h2 className="yl-title text-[1.5rem] sm:text-[1.8rem]">{t("What do you like?", "Qu'est-ce que tu aimes?")}</h2>
        <p className="mt-1">{t("Pick any to filter, or just explore them all. Flip five cards to earn the stamp.", "Choisis pour filtrer, ou explore-les toutes. Retourne cinq cartes pour le tampon.")}</p>
        <div className="mt-3 flex flex-wrap gap-2.5" role="group" aria-label={t("Interests", "Intérêts")}>
          {INTERESTS.map(i => (
            <button key={i.id} type="button" aria-pressed={likes.includes(i.id)} onClick={() => setLikes(l => (l.includes(i.id) ? l.filter(x => x !== i.id) : [...l, i.id]))} className="yl-chip">
              <Heart className="h-4 w-4" aria-hidden="true" />{pick(i.label)}
            </button>
          ))}
        </div>
        <p className="mt-3 font-bold" aria-live="polite">{t(`${shown.length} jobs · ${Math.min(seen.length, GOAL)} of ${GOAL} explored`, `${shown.length} métiers · ${Math.min(seen.length, GOAL)} sur ${GOAL} explorés`)}</p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c, n) => {
          const Icon = ICONS[c.icon] ?? BookOpen;
          const isOpen = open.includes(c.id);
          const tone = TONES[CAREERS.indexOf(c) % TONES.length];
          return (
            <li key={c.id} className={`yl-flip ${isOpen ? "is-flipped" : ""}`}>
              <button type="button" onClick={() => flip(c.id)} aria-expanded={isOpen} className="yl-flip-inner w-full text-left rounded-[20px]" style={{ animationDelay: `${n * 40}ms` }}>
                <span className={`yl-face yl-card yl-lift p-5 flex flex-col min-h-[230px] ${tone}`} aria-hidden={isOpen}>
                  <span className="grid place-items-center h-14 w-14 rounded-[16px] bg-white border-[3px] border-ink"><Icon className="h-7 w-7" aria-hidden="true" /></span>
                  <span className="yl-title text-[1.4rem] leading-tight mt-4 block">{pick(c.title)}</span>
                  <span className="mt-auto pt-3 font-bold inline-flex items-center gap-1.5"><RotateCcw className="h-4 w-4" aria-hidden="true" />{t("Flip to see", "Retourne pour voir")}</span>
                </span>
                <span className="yl-face yl-face--back yl-card bg-white p-5 flex flex-col min-h-[230px]" aria-hidden={!isOpen}>
                  <span className="font-extrabold text-[1.1rem] block">{pick(c.title)}</span>
                  <span className="mt-2 block leading-relaxed">{pick(c.does)}</span>
                  <span className="mt-2 block text-[0.95rem]"><strong>{t("Subjects: ", "Matières : ")}</strong>{pick(c.subjects)}</span>
                  <span className="mt-1 block text-[0.95rem]"><strong>{t("Human skill: ", "Qualité humaine : ")}</strong>{pick(c.human)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {done && (
        <FinishPanel a={A} firstTime={done.first} onReplay={replay} headline={t("There's a place for you in AI.", "Il y a une place pour toi en IA.")}>
          <p>{t("AI needs coders and mathematicians, and also people who care about fairness, art, health, teaching and the law. The most important skill on every card is a human one.", "L'IA a besoin de programmeurs et de matheux, mais aussi de gens qui tiennent à la justice, à l'art, à la santé, à l'enseignement et au droit. La qualité la plus importante sur chaque carte est humaine.")}</p>
        </FinishPanel>
      )}
    </div>
  );
}
