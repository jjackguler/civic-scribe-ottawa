import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHead, SourceList } from "@/components/LabBits";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef } from "@/lib/seo";
import type { Bi } from "@/lib/i18n";

/**
 * Teach the Machine: a classroom game about learning from examples.
 * Students tell a tiny machine which objects float. It guesses new objects by
 * finding the most similar example it was taught (nearest neighbour). Then
 * they see the one rule that works everywhere: density compared with water.
 * Runs in the browser; nothing is sent anywhere.
 */

export const Route = createFileRoute("/labs/teach-the-machine")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Teach the machine: will it float? A classroom game about how AI learns — ${SITE.name} Labs`, fr: `Apprenez à la machine : flotte ou coule? Un jeu de classe sur l'apprentissage de l'IA — ${SITE.name} Labs` },
      description: {
        en: "Teach a tiny machine which objects float, then watch it guess new ones. A 30-minute lesson on examples, rules and why AI fails outside what it has seen.",
        fr: "Apprenez à une petite machine quels objets flottent, puis regardez-la deviner. Une leçon de 30 minutes sur les exemples, les règles et les limites de l'IA.",
      },
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: locale === "fr" ? "Apprenez à la machine" : "Teach the machine",
        url,
        publisher: publisherRef,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        learningResourceType: "Lesson plan",
        educationalLevel: locale === "fr" ? "9 à 14 ans" : "Ages 9 to 14",
        timeRequired: "PT30M",
        isAccessibleForFree: true,
        about: ["Machine learning", "Training data", "Buoyancy", "Density"],
      }],
    }),
  component: TeachPage,
});

type Obj = { id: string; name: Bi; g: number; cm3: number };

/** Approximate everyday values; real objects vary. Floats when density (g ÷ cm³) is below water's 1 g/cm³. */
const TRAIN: Obj[] = [
  { id: "cork", name: { en: "Cork stopper", fr: "Bouchon de liège" }, g: 2.4, cm3: 10 },
  { id: "ice", name: { en: "Ice cube", fr: "Glaçon" }, g: 9.2, cm3: 10 },
  { id: "pine", name: { en: "Pine block", fr: "Bloc de pin" }, g: 50, cm3: 100 },
  { id: "candle", name: { en: "Wax candle", fr: "Bougie de cire" }, g: 90, cm3: 100 },
  { id: "bolt", name: { en: "Steel bolt", fr: "Boulon d'acier" }, g: 39, cm3: 5 },
  { id: "marble", name: { en: "Glass marble", fr: "Bille de verre" }, g: 5, cm3: 2 },
  { id: "pebble", name: { en: "Pebble", fr: "Caillou" }, g: 26, cm3: 10 },
  { id: "coin", name: { en: "Coin", fr: "Pièce de monnaie" }, g: 6.3, cm3: 0.8 },
];

const TEST: Obj[] = [
  { id: "apple", name: { en: "Apple", fr: "Pomme" }, g: 180, cm3: 220 },
  { id: "orange", name: { en: "Orange, with peel", fr: "Orange, avec la peau" }, g: 200, cm3: 235 },
  { id: "peeled", name: { en: "Orange, peeled", fr: "Orange, pelée" }, g: 160, cm3: 150 },
  { id: "egg", name: { en: "Fresh egg", fr: "Œuf frais" }, g: 60, cm3: 56 },
  { id: "log", name: { en: "Big log", fr: "Grosse bûche" }, g: 5000, cm3: 9000 },
  { id: "anchor", name: { en: "Small iron anchor", fr: "Petite ancre de fer" }, g: 4000, cm3: 510 },
];

const floats = (o: Obj) => o.g / o.cm3 < 1;

/** Nearest neighbour on log scales: the machine only knows "this looks like something I was shown". */
function guess(o: Obj, taught: { o: Obj; float: boolean }[]) {
  let best: { o: Obj; float: boolean } | null = null;
  let bestD = Infinity;
  for (const t of taught) {
    const d = Math.hypot(Math.log(o.g) - Math.log(t.o.g), Math.log(o.cm3) - Math.log(t.o.cm3));
    if (d < bestD) { bestD = d; best = t; }
  }
  return best;
}

/* Plot frame: volume across, mass up, both on log scales. */
const W = 560, H = 360, PAD = 40;
const LX = [Math.log(0.5), Math.log(20000)];
const LY = [Math.log(1), Math.log(10000)];
const px = (cm3: number) => PAD + ((Math.log(cm3) - LX[0]) / (LX[1] - LX[0])) * (W - PAD * 2);
const py = (g: number) => H - PAD - ((Math.log(g) - LY[0]) / (LY[1] - LY[0])) * (H - PAD * 2);

function TeachPage() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [labels, setLabels] = useState<Record<string, boolean>>({});
  const [tested, setTested] = useState(false);
  const [rule, setRule] = useState(false);

  const taught = useMemo(() => TRAIN.filter(o => o.id in labels).map(o => ({ o, float: labels[o.id] })), [labels]);
  const ready = taught.some(t => t.float) && taught.some(t => !t.float);
  const results = TEST.map(o => {
    const nn = guess(o, taught);
    return { o, said: nn?.float ?? false, like: nn?.o, truth: floats(o) };
  });
  const score = results.filter(r => r.said === r.truth).length;
  const wrongTeaching = taught.filter(t => t.float !== floats(t.o));

  const reset = () => { setLabels({}); setTested(false); setRule(false); };

  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw pt-10 pb-12 sm:pt-14 sm:pb-16">
          <p className="text-[0.9rem] font-semibold text-brass">
            AI Broadsheet Labs <span className="text-white/50">·</span> <span className="text-white/70">{fr ? "pour la classe · 9 à 14 ans · 30 minutes" : "for the classroom · ages 9 to 14 · 30 minutes"}</span>
          </p>
          <h1 className="masthead-serif text-[2.6rem] sm:text-[3.6rem] leading-[0.98] mt-3 max-w-[16ch] hero-in">
            {fr ? <>Apprenez à la machine : <span className="text-signal">flotte ou coule?</span></> : <>Teach the machine: <span className="text-signal">will it float?</span></>}
          </h1>
          <p className="font-serif text-[1.15rem] sm:text-[1.3rem] leading-relaxed text-white/75 mt-5 max-w-[42rem]">
            {fr
              ? "Une IA n'apprend pas des règles : elle apprend des exemples qu'on lui donne. Montrez à une petite machine quels objets flottent, puis donnez-lui des objets qu'elle n'a jamais vus. Elle se trompera, et vous saurez pourquoi."
              : "An AI does not learn rules: it learns from the examples you give it. Show a tiny machine which objects float, then hand it things it has never seen. It will get some wrong, and you will see why."}
          </p>
        </div>
      </section>

      <section className="container-mw mt-10 sm:mt-14" aria-labelledby="teach-title">
        <SectionHead id="teach-title" kicker={fr ? "Étape 1" : "Step 1"} title={fr ? "Enseignez : flotte ou coule?" : "Teach it: float or sink?"} />
        <p className="dek mt-1 max-w-3xl">
          {fr
            ? "Pour chaque objet, dites à la machine ce que vous pensez. Pas besoin de tous les faire, mais il lui faut au moins un exemple de chaque."
            : "For each object, tell the machine what you think. You don't have to do them all, but it needs at least one example of each."}
        </p>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {TRAIN.map(o => {
            const v = labels[o.id];
            return (
              <li key={o.id} className="rounded-[8px] border-2 border-line p-3.5">
                <p className="hl text-[1.1rem]">{pick(o.name)}</p>
                <p className="meta tabular-nums">{fmt(o.g, locale)} g · {fmt(o.cm3, locale)} cm³</p>
                <div className="mt-2.5 flex gap-2">
                  {[true, false].map(f => (
                    <button
                      key={String(f)}
                      type="button"
                      disabled={tested}
                      aria-pressed={v === f}
                      onClick={() => setLabels(l => ({ ...l, [o.id]: f }))}
                      className={`flex-1 rounded-[5px] border-2 px-2 py-1.5 text-[0.92rem] font-semibold ${v === f ? (f ? "border-lake bg-lake text-white" : "border-night bg-night text-white") : "border-line hover:border-night"}`}
                    >
                      {f ? (fr ? "Flotte" : "Floats") : (fr ? "Coule" : "Sinks")}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {!tested ? (
            <button type="button" disabled={!ready} onClick={() => setTested(true)} className="rounded-[5px] bg-signal text-signal-ink font-bold px-4 py-2.5 disabled:opacity-50">
              {fr ? `Tester la machine sur ${TEST.length} nouveaux objets` : `Test the machine on ${TEST.length} new objects`}
            </button>
          ) : (
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-[5px] border-2 border-night px-4 py-2 font-semibold">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {fr ? "Tout recommencer" : "Start over"}
            </button>
          )}
          {!ready && <p className="meta">{fr ? "Il faut au moins un « flotte » et un « coule »." : "It needs at least one “floats” and one “sinks”."}</p>}
          {ready && !tested && <p className="meta tabular-nums">{fr ? `${taught.length} exemples appris` : `${taught.length} examples taught`}</p>}
        </div>
      </section>

      {tested && (
        <section className="container-mw mt-12 hero-in" aria-labelledby="test-title">
          <SectionHead id="test-title" kicker={fr ? "Étape 2" : "Step 2"} title={fr ? `La machine a eu ${score} sur ${TEST.length}` : `The machine got ${score} out of ${TEST.length}`} />
          <ul className="mt-5 border-t-2 border-ink">
            {results.map(r => {
              const ok = r.said === r.truth;
              return (
                <li key={r.o.id} className="grid gap-1 sm:grid-cols-12 py-3.5 border-b border-line">
                  <p className="sm:col-span-3 hl text-[1.1rem]">{pick(r.o.name)}</p>
                  <p className="sm:col-span-6 text-[0.98rem] leading-relaxed">
                    {fr ? "La machine : " : "Machine: "}<strong>{r.said ? (fr ? "flotte" : "floats") : (fr ? "coule" : "sinks")}</strong>
                    {r.like && <span className="text-muted-ink">{fr ? `, parce que ça ressemble le plus à « ${r.like.name.fr} »` : `, because it looks most like “${r.like.name.en}”`}</span>}
                  </p>
                  <p className={`sm:col-span-3 font-bold ${ok ? "text-lake" : "text-brass-ink"}`}>
                    {fr ? "En vrai : " : "Really: "}{r.truth ? (fr ? "flotte" : "floats") : (fr ? "coule" : "sinks")} {ok ? "✓" : "✗"}
                  </p>
                </li>
              );
            })}
          </ul>
          {wrongTeaching.length > 0 && (
            <p className="mt-4 rounded-[6px] border-l-4 border-brass bg-ice px-4 py-3 text-[0.98rem] leading-relaxed">
              <strong>{fr ? "Attention : " : "Heads up: "}</strong>
              {fr
                ? `vous lui avez appris quelque chose de faux (${wrongTeaching.map(t => t.o.name.fr).join(", ")}). Elle l'a cru. Une machine ne sait que ce qu'on lui montre, erreurs comprises.`
                : `you taught it something wrong (${wrongTeaching.map(t => t.o.name.en).join(", ")}). It believed you. A machine only knows what it is shown, mistakes included.`}
            </p>
          )}
          <p className="mt-4 text-[1.02rem] leading-relaxed max-w-3xl">
            {fr
              ? "La machine compare la taille et le poids d'un nouvel objet avec les exemples qu'elle a vus, et copie la réponse du plus proche. Les fruits, l'œuf, la bûche et l'ancre sont bien plus gros que tout ce que vous lui avez montré : elle devine loin de ses exemples."
              : "The machine compares a new object's size and weight with the examples it has seen, and copies the answer of the closest one. The fruit, the egg, the log and the anchor are bigger than anything you showed it: it is guessing far from its examples."}
          </p>

          <figure className="mt-6">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[760px] rounded-[8px] border-2 border-line bg-white" role="img" aria-label={fr ? "Graphique : volume à l'horizontale, masse à la verticale, échelles logarithmiques" : "Chart: volume across, mass up, log scales"}>
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--line)" />
              <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--line)" />
              <text x={W - PAD} y={H - 12} textAnchor="end" fontSize="12" fill="var(--muted-ink)">{fr ? "volume (cm³) →" : "volume (cm³) →"}</text>
              <text x={12} y={PAD - 12} fontSize="12" fill="var(--muted-ink)">{fr ? "↑ masse (g)" : "↑ mass (g)"}</text>
              {rule && (
                <g className="hero-in">
                  <line x1={px(1)} y1={py(1)} x2={px(10000)} y2={py(10000)} stroke="var(--brass)" strokeWidth="2.5" strokeDasharray="6 4" />
                  <text x={px(1000) + 8} y={py(1000) - 8} fontSize="13" fontWeight="700" fill="var(--brass-ink)">{fr ? "1 g par cm³ : l'eau" : "1 g per cm³: water"}</text>
                  <text x={px(2000)} y={py(300)} fontSize="12" fill="var(--lake)">{fr ? "sous la ligne : flotte" : "below the line: floats"}</text>
                  <text x={px(2)} y={py(60)} fontSize="12" fill="var(--ink)">{fr ? "au-dessus : coule" : "above: sinks"}</text>
                </g>
              )}
              {taught.map(t => (
                <circle key={t.o.id} cx={px(t.o.cm3)} cy={py(t.o.g)} r="6" fill={t.float ? "var(--lake)" : "var(--ink)"}>
                  <title>{pick(t.o.name)}</title>
                </circle>
              ))}
              {results.map(r => (
                <g key={r.o.id}>
                  <rect x={px(r.o.cm3) - 6} y={py(r.o.g) - 6} width="12" height="12" fill="white" stroke={r.said === r.truth ? "var(--lake)" : "var(--brass-ink)"} strokeWidth="2.5" />
                  {(() => {
                    const left = r.o.id === "peeled" || r.o.id === "egg";
                    return <text x={px(r.o.cm3) + (left ? -10 : 10)} y={py(r.o.g) + (r.o.id === "peeled" ? -6 : 4)} textAnchor={left ? "end" : "start"} fontSize="11" fill="var(--muted-ink)">{pick(r.o.name)}</text>;
                  })()}
                </g>
              ))}
            </svg>
            <figcaption className="meta mt-2 max-w-3xl">
              {fr
                ? "Ronds : vos exemples (bleu = flotte, noir = coule). Carrés : les nouveaux objets (bleu = bonne réponse, or = erreur). Échelles logarithmiques; valeurs approximatives."
                : "Circles: your examples (blue = floats, black = sinks). Squares: the new objects (blue = right, gold = wrong). Log scales; values are approximate."}
            </figcaption>
          </figure>

          {!rule ? (
            <button type="button" onClick={() => setRule(true)} className="mt-5 rounded-[5px] bg-signal text-signal-ink font-bold px-4 py-2.5">
              {fr ? "Étape 3 : montrer la règle d'Archimède" : "Step 3: show Archimedes' rule"}
            </button>
          ) : (
            <div className="mt-6 bg-ice rounded-[10px] p-6 sm:p-8 grid gap-4 md:grid-cols-12 hero-in">
              <p className="md:col-span-4 masthead-serif text-[1.5rem] leading-tight">{fr ? "Une seule ligne suffit" : "One line does it"}</p>
              <div className="md:col-span-8 font-serif text-[1.08rem] leading-relaxed grid gap-3">
                <p>{fr
                  ? "Divisez la masse par le volume : c'est la densité. Moins de 1 gramme par centimètre cube, l'objet flotte dans l'eau douce; plus, il coule. La ligne marche pour un bouchon comme pour une bûche de 5 kg, parce que c'est une règle, pas une ressemblance."
                  : "Divide mass by volume: that is density. Under 1 gram per cubic centimetre, it floats in fresh water; over, it sinks. The line works for a cork and for a 5 kg log alike, because it is a rule, not a resemblance."}</p>
                <p>{fr
                  ? "Regardez l'orange : avec sa peau pleine de petites poches d'air, elle flotte. Pelée, elle coule. Même fruit, autre densité. Aucune machine ne le devine si personne ne lui a montré."
                  : "Look at the orange: with its peel full of tiny air pockets, it floats. Peeled, it sinks. Same fruit, different density. No machine guesses that unless someone showed it."}</p>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="plan-title">
        <div className="bg-signal text-signal-ink rounded-[10px] p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.78rem] font-bold tracking-[0.12em]">{fr ? "PLAN DE LEÇON · 30 MINUTES" : "LESSON PLAN · 30 MINUTES"}</p>
              <h2 id="plan-title" className="masthead-serif text-[1.8rem] sm:text-[2.1rem] mt-2">{fr ? "Faites-le pour vrai, avec un bac d'eau" : "Do it for real, with a tub of water"}</h2>
            </div>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-[5px] border-2 border-current px-3.5 py-2 font-semibold print:hidden">
              <Printer className="h-4 w-4" aria-hidden="true" /> {fr ? "Imprimer" : "Print"}
            </button>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <p className="font-bold">{fr ? "Matériel" : "You need"}</p>
              <p className="mt-1 text-[1.02rem] leading-relaxed">{fr
                ? "Un bac d'eau, une balance de cuisine, une tasse à mesurer, une orange, une pomme, un bouchon, un caillou, une pièce, une bougie."
                : "A tub of water, a kitchen scale, a measuring cup, an orange, an apple, a cork, a pebble, a coin, a candle."}</p>
              <p className="font-bold mt-4">{fr ? "Déroulement" : "How it runs"}</p>
              <ol className="mt-1 list-decimal pl-5 grid gap-1.5 text-[1.02rem] leading-relaxed">
                <li>{fr ? "5 min : la classe joue la machine. Un élève reçoit trois exemples, puis devine les autres objets sans toucher l'eau." : "5 min: the class plays the machine. One student is given three examples, then guesses the rest without touching the water."}</li>
                <li>{fr ? "10 min : on teste tout dans le bac. Où le « modèle » s'est-il trompé?" : "10 min: test everything in the tub. Where did the “model” go wrong?"}</li>
                <li>{fr ? "10 min : on pèse et on mesure. Calculez masse ÷ volume pour chaque objet." : "10 min: weigh and measure. Work out mass ÷ volume for each object."}</li>
                <li>{fr ? "5 min : pelez l'orange et recommencez. Discussion." : "5 min: peel the orange and try again. Discuss."}</li>
              </ol>
            </div>
            <div>
              <p className="font-bold">{fr ? "Questions de discussion" : "Talk about it"}</p>
              <ul className="mt-1 list-disc pl-5 grid gap-1.5 text-[1.02rem] leading-relaxed">
                <li>{fr ? "Pourquoi la machine se trompe-t-elle plus sur les gros objets?" : "Why does the machine get big objects wrong more often?"}</li>
                <li>{fr ? "Si on lui apprend une erreur, que fait-elle? Qui est responsable?" : "If you teach it a mistake, what does it do? Whose fault is it?"}</li>
                <li>{fr ? "Quels exemples ajouteriez-vous pour l'aider? Combien en faudrait-il?" : "Which examples would you add to help it? How many would it take?"}</li>
                <li>{fr ? "Une règle comme la densité marche partout. Pourquoi les IA n'apprennent-elles pas toujours des règles?" : "A rule like density works everywhere. Why don't AIs always learn rules?"}</li>
              </ul>
              <p className="mt-4 font-semibold">
                {fr ? "Pour aller plus loin : " : "Go further: "}
                <Link to="/labs/field-trips/$trip" params={{ trip: "archimedes-harbour" }} className="underline underline-offset-4">{fr ? "la sortie au port d'Archimède" : "the Archimedes' harbour field trip"}</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-mw mt-14 sm:mt-16" aria-labelledby="sources-title">
        <SectionHead id="sources-title" title="Sources" />
        <SourceList items={[
          { title: "USGS Water Science School, “Water density”", url: "https://www.usgs.gov/water-science-school/science/water-density", note: fr ? "L'eau douce fait environ 1 g par cm³; la glace est moins dense" : "Fresh water is about 1 g per cm³; ice is less dense" },
          { title: "Scientific American, “Bring Science Home: How metal boats float”", url: "https://www.scientificamerican.com/article/bring-science-home-how-metal-boats-float/", note: fr ? "Un objet qui flotte déplace son propre poids d'eau" : "A floating object displaces its own weight of water" },
          { title: "MEL Science, “Does an orange float or sink?”", url: "https://melscience.com/GB-en/articles/does-orange-float-or-sink/", note: fr ? "L'orange pelée coule" : "Why a peeled orange sinks" },
        ]} />
        <p className="meta mt-5 max-w-3xl">
          {fr
            ? "Les masses et volumes sont des valeurs courantes, approximatives : les vrais objets varient. Le jeu tourne dans votre navigateur et n'envoie rien."
            : "Masses and volumes are typical, approximate values: real objects vary. The game runs in your browser and sends nothing anywhere."}
          {" "}<Link to="/how-we-use-ai" className="text-lake font-semibold hover:underline">{fr ? "Notre utilisation de l'IA" : "How we use AI"}</Link>
        </p>
      </section>
    </PageShell>
  );
}

function fmt(n: number, locale: string) {
  return n.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 1 });
}
