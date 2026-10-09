import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Search } from "lucide-react";
import { FAKE_PAIRS, activityById, type PicCard, type TextCard } from "@/lib/young-lab";
import { useYoungProgress } from "@/lib/young-progress";
import { FinishPanel, RoundDots, usePlaying, useT } from "@/components/YoungLab";

const A = activityById("spot-the-fake")!;

/* Simple drawn scenes. No real people, no faces: shapes only. */
function Scene({ card }: { card: PicCard }) {
  const { pick, t } = useT();
  const fake = card.variant === "fake";
  const ink = "#10191b";
  return (
    <svg viewBox="0 0 200 150" className="w-full h-auto block rounded-[12px] border-[3px] border-ink bg-[#cfeefd]" role="img" aria-label={pick(card.alt)}>
      {card.scene === "sign" && (
        <g>
          <rect x="0" y="120" width="200" height="30" fill="#c9c2b4" />
          <rect x="22" y="38" width="156" height="86" fill="#f6d6a8" stroke={ink} strokeWidth="2.5" />
          <rect x="34" y="18" width="132" height="28" rx="5" fill="#fffaf0" stroke={ink} strokeWidth="2.5" />
          <text x="100" y="38" textAnchor="middle" fontSize={fake ? 15 : 16} fontWeight="800" fill={ink} fontFamily="Schibsted Grotesk, sans-serif">
            {fake ? t("Bkaery Brea", "Boulnagreie") : t("Bakery", "Boulangerie")}
          </text>
          {/* window with loaves */}
          <rect x="34" y="58" width="72" height="50" fill="#e9f7ff" stroke={ink} strokeWidth="2.5" />
          <ellipse cx="54" cy="96" rx="13" ry="7" fill="#d79a4a" stroke={ink} strokeWidth="2" />
          <ellipse cx="84" cy="96" rx="13" ry="7" fill="#d79a4a" stroke={ink} strokeWidth="2" />
          {/* door */}
          <rect x="120" y="58" width="44" height="66" fill="#8a5a3c" stroke={ink} strokeWidth="2.5" />
          {fake
            ? <circle cx="70" cy="74" r="4" fill="#f5c400" stroke={ink} strokeWidth="2" />
            : <circle cx="156" cy="92" r="4" fill="#f5c400" stroke={ink} strokeWidth="2" />}
        </g>
      )}
      {card.scene === "shadows" && (
        <g>
          <rect x="0" y="96" width="200" height="54" fill="#9bd47a" />
          <g transform="translate(26 26)">
            <circle r="13" fill="#f5c400" stroke={ink} strokeWidth="2.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(d => <line key={d} x1="0" y1="-18" x2="0" y2="-24" stroke={ink} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${d})`} />)}
          </g>
          {/* house and its shadow (away from the sun: to the right) */}
          <polygon points="150,112 196,128 196,140 150,124" fill="#000" opacity="0.22" />
          <rect x="112" y="72" width="40" height="40" fill="#ff8a6b" stroke={ink} strokeWidth="2.5" />
          <polygon points="106,74 132,52 158,74" fill="#c9b2ff" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="126" y="90" width="12" height="22" fill="#fffaf0" stroke={ink} strokeWidth="2" />
          {/* tree and its shadow */}
          {fake
            ? <ellipse cx="34" cy="120" rx="30" ry="6" fill="#000" opacity="0.22" />
            : <ellipse cx="96" cy="120" rx="30" ry="6" fill="#000" opacity="0.22" />}
          <rect x="62" y="84" width="8" height="34" fill="#8a5a3c" stroke={ink} strokeWidth="2" />
          <circle cx="66" cy="72" r="20" fill="#4caf50" stroke={ink} strokeWidth="2.5" />
        </g>
      )}
      {card.scene === "dog" && (
        <g>
          <rect x="0" y="104" width="200" height="46" fill="#9bd47a" />
          {/* bench */}
          <rect x="128" y="86" width="60" height="8" fill="#8a5a3c" stroke={ink} strokeWidth="2" />
          <rect x="132" y="94" width="6" height="20" fill="#8a5a3c" stroke={ink} strokeWidth="2" />
          <rect x="178" y="94" width="6" height="20" fill="#8a5a3c" stroke={ink} strokeWidth="2" />
          {/* dog */}
          {(fake ? [44, 54, 66, 80, 92] : [46, 58, 80, 92]).map(x => <rect key={x} x={x} y="98" width="7" height="20" rx="3" fill="#d79a4a" stroke={ink} strokeWidth="2" />)}
          <ellipse cx="70" cy="92" rx="34" ry="16" fill="#d79a4a" stroke={ink} strokeWidth="2.5" />
          <path d="M36 86 Q 22 70 30 62" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          <circle cx="108" cy="74" r="16" fill="#d79a4a" stroke={ink} strokeWidth="2.5" />
          <ellipse cx="100" cy="62" rx="5" ry="10" fill="#8a5a3c" stroke={ink} strokeWidth="2" transform="rotate(-20 100 62)" />
          <circle cx="112" cy="72" r="2.4" fill={ink} />
          <circle cx="123" cy="78" r="3" fill={ink} />
          <rect x="94" y="84" width="16" height="5" rx="2" fill="#d7372f" stroke={ink} strokeWidth="1.5" />
          {/* leash */}
          {fake
            ? <path d="M108 88 Q 120 104 132 96" fill="none" stroke="#d7372f" strokeWidth="3" strokeLinecap="round" />
            : <path d="M108 88 Q 124 106 140 90" fill="none" stroke="#d7372f" strokeWidth="3" strokeLinecap="round" />}
        </g>
      )}
    </svg>
  );
}

function Post({ card }: { card: TextCard }) {
  const { pick } = useT();
  const who = pick(card.who);
  return (
    <div className="text-left">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid place-items-center h-11 w-11 rounded-full border-[3px] border-ink yl-tone-sky font-extrabold text-[1.1rem]">{who.charAt(0)}</span>
        <span className="min-w-0">
          <span className="block font-extrabold leading-tight">{who}</span>
          <span className="block text-[0.9rem] text-muted-ink">{pick(card.meta)}</span>
        </span>
      </div>
      <p className="mt-3 text-[1.08rem] leading-relaxed">{pick(card.body)}</p>
    </div>
  );
}

export function SpotFake() {
  const { pick, t } = useT();
  const { award } = useYoungProgress();
  usePlaying();
  const [i, setI] = useState(0);
  const [pickd, setPickd] = useState<0 | 1 | null>(null);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(FAKE_PAIRS.length).fill(null));
  const [done, setDone] = useState<null | { first: boolean; score: number }>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLHeadingElement>(null);
  const pair = FAKE_PAIRS[i];
  const answered = pickd !== null;
  const right = answered && pickd === pair.fake;

  useEffect(() => { if (answered) nextRef.current?.focus({ preventScroll: true }); }, [answered]);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } promptRef.current?.focus({ preventScroll: true }); }, [i]);

  const choose = (k: 0 | 1) => {
    if (answered) return;
    setPickd(k);
    setResults(r => r.map((v, n) => (n === i ? k === pair.fake : v)));
  };
  const next = () => {
    if (i + 1 >= FAKE_PAIRS.length) {
      const score = results.filter(Boolean).length;
      setDone({ first: award("spot-the-fake", score), score });
      return;
    }
    setPickd(null); setI(i + 1);
  };
  const replay = () => { setI(0); setPickd(null); setResults(Array(FAKE_PAIRS.length).fill(null)); setDone(null); };

  if (done) {
    return (
      <FinishPanel a={A} firstTime={done.first} onReplay={replay} headline={t("Always ask: who made this, and why?", "Demande-toi toujours : qui a fait ceci, et pourquoi?")}>
        <p>{t(`You found ${done.score} of ${FAKE_PAIRS.length} fakes. Clues help, but they won't always be there: generators keep getting better. The question that always works is who made it and why. If you're not sure, ask a grown-up you trust, and don't share it yet.`, `Tu as trouvé ${done.score} faux sur ${FAKE_PAIRS.length}. Les indices aident, mais ils ne seront pas toujours là : les générateurs s'améliorent. La question qui marche toujours : qui l'a fait et pourquoi? Dans le doute, demande à un adulte de confiance et ne partage pas tout de suite.`)}</p>
      </FinishPanel>
    );
  }

  return (
    <div>
      <RoundDots total={FAKE_PAIRS.length} at={i} results={results} />
      <h2 ref={promptRef} tabIndex={-1} className="yl-title text-[1.6rem] sm:text-[2rem] leading-tight mt-4 outline-none">{pick(pair.prompt)}</h2>
      <p className="mt-1 text-[1.02rem]">{t("Tap the one you think was made up.", "Touche celui que tu crois inventé.")}</p>
      <div key={pair.id} className="mt-5 grid gap-5 md:grid-cols-2">
        {pair.cards.map((c, k) => {
          const isFake = k === pair.fake;
          const mine = pickd === k;
          return (
            <div key={k} className="relative yl-deal" style={{ animationDelay: `${k * 80}ms` }}>
              <button type="button" onClick={() => choose(k as 0 | 1)} disabled={answered} aria-pressed={mine}
                className={`yl-card yl-lift w-full p-4 sm:p-5 block text-left disabled:cursor-default ${answered ? (isFake ? "yl-tone-coral" : "yl-tone-mint") : "bg-white"} ${answered && !mine ? "opacity-90" : ""}`}>
                <span className="sr-only">{t(`Option ${k === 0 ? "A" : "B"}: `, `Choix ${k === 0 ? "A" : "B"} : `)}</span>
                {c.kind === "text" ? <Post card={c} /> : <Scene card={c} />}
                <span className="mt-4 flex items-center justify-between gap-3">
                  <span className="font-extrabold text-[1.05rem]">{t(`Option ${k === 0 ? "A" : "B"}`, `Choix ${k === 0 ? "A" : "B"}`)}</span>
                  {!answered && <span className="yl-chip pointer-events-none">{t("This one is made up", "Celui-ci est inventé")}</span>}
                </span>
              </button>
              {answered && (
                <span className={`yl-sticker yl-thump ${isFake ? "yl-sticker--fake" : "yl-sticker--real"}`} aria-hidden="true">
                  {isFake ? t("Made up", "Inventé") : t("Real", "Vrai")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {answered && (
        <div className="yl-card yl-deal bg-white p-5 sm:p-6 mt-6" aria-live="polite">
          <p className={`inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-3 py-1 font-extrabold ${right ? "yl-tone-mint" : "yl-tone-sun"}`}>
            {right ? <Check className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
            {right ? t("Good eye! The clues:", "Bon œil! Les indices :") : t(`It was option ${pair.fake === 0 ? "A" : "B"}. Here are the clues:`, `C'était le choix ${pair.fake === 0 ? "A" : "B"}. Voici les indices :`)}
          </p>
          <ul className="mt-4 grid gap-2.5">
            {pair.clues.map((c, n) => (
              <li key={n} className="flex gap-3 items-start text-[1.05rem] leading-relaxed">
                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full yl-tone-sun border-2 border-ink"><Search className="h-4 w-4" aria-hidden="true" /></span>
                <span>{pick(c)}</span>
              </li>
            ))}
          </ul>
          <button ref={nextRef} type="button" className="yl-btn yl-btn--big yl-btn--ink mt-5" onClick={next}>
            {i + 1 >= FAKE_PAIRS.length ? t("Finish", "Terminer") : t("Next pair", "Paire suivante")} <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
