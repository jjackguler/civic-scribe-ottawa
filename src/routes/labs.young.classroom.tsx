import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Copy, FileText, MessageCircle, MonitorPlay, Pencil, Share2, Sparkles } from "lucide-react";
import { ACTIVITY_ICON, SafetyPromise, YoungCrumbs, YoungShell, toneClass, useT } from "@/components/YoungLab";
import { LabGuide } from "@/components/young/LabGuide";
import { SITE } from "@/lib/site";
import { absUrl, publisherRef, seoHead } from "@/lib/seo";
import { GROUP, byGroup, type Activity } from "@/lib/young-lab";

export const Route = createFileRoute("/labs/young/classroom")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Young Lab in the classroom: AI lessons with no setup — ${SITE.name}`, fr: `Le Jeune Labo en classe : des leçons sur l'IA sans installation — ${SITE.name}` },
      description: {
        en: "Teach AI literacy in one class period. Free, bilingual games for ages 8 to 17: no accounts, no sign-ups, nothing students type leaves the device. Share one link.",
        fr: "Enseignez la littératie en IA en une période. Jeux gratuits et bilingues pour les 8 à 17 ans : pas de compte, pas d'inscription, rien de ce que les élèves écrivent ne quitte l'appareil. Un seul lien à partager.",
      },
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: locale === "fr" ? "Le Jeune Labo en classe" : "Young Lab in the classroom",
        url,
        audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
        publisher: publisherRef,
      }],
    }),
  component: Classroom,
});

function CopyLink({ a }: { a: Activity }) {
  const { locale, t } = useT();
  const [copied, setCopied] = useState(false);
  const url = absUrl(`/labs/young/${a.id}`, locale);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers: select the text in a temporary field.
      const f = document.createElement("textarea");
      f.value = url; document.body.appendChild(f); f.select();
      try { document.execCommand("copy"); } catch { /* the link is still shown */ }
      f.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button type="button" className="yl-btn" onClick={copy} aria-live="polite">
      {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
      {copied ? t("Link copied", "Lien copié") : t("Copy student link", "Copier le lien élève")}
    </button>
  );
}

function LessonRow({ a, step }: { a: Activity; step: number }) {
  const { pick, t } = useT();
  const Icon = ACTIVITY_ICON[a.id];
  return (
    <li className="yl-card bg-white p-5 sm:p-6 grid gap-4 md:grid-cols-[auto_1fr] md:items-start">
      <div className="flex md:flex-col items-center gap-3">
        <span className="yl-step-num">{step}</span>
        <span className={`grid place-items-center h-14 w-14 rounded-[16px] border-[3px] border-ink ${toneClass(a.tone)}`}><Icon className="h-7 w-7" aria-hidden="true" /></span>
      </div>
      <div className="min-w-0">
        <p className="font-bold text-[0.95rem] inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{t(`${a.minutes} min of play`, `${a.minutes} min de jeu`)}</p>
        <h3 className="yl-title text-[1.6rem] leading-tight mt-0.5">{pick(a.title)}</h3>
        <p className="mt-1.5 text-[1.05rem] leading-relaxed"><strong>{t("Big idea: ", "Grande idée : ")}</strong>{pick(a.teaches)}</p>
        <p className="mt-1.5 text-[1rem] leading-relaxed"><strong>{t("Ask after: ", "Demandez ensuite : ")}</strong>{pick(a.starters[0])}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/labs/young/$activity" params={{ activity: a.id }} className="yl-btn yl-btn--ink"><MonitorPlay className="h-5 w-5" aria-hidden="true" />{t("Open on the board", "Ouvrir au tableau")}</Link>
          <CopyLink a={a} />
          <Link to="/labs/young/grown-ups" hash={`sheet-${a.id}`} className="yl-btn"><FileText className="h-5 w-5" aria-hidden="true" />{t("Lesson sheet", "Fiche de leçon")}</Link>
        </div>
      </div>
    </li>
  );
}

const FLOW = [
  { min: 5, icon: Sparkles, en: "Hook", fr: "Accroche", den: "Ask the class the game's big question. Hands up, no wrong answers.", dfr: "Posez la grande question du jeu. Mains levées, pas de mauvaise réponse." },
  { min: 15, icon: MonitorPlay, en: "Play", fr: "Jouer", den: "On the board together, or in pairs on their own devices.", dfr: "Au tableau tous ensemble, ou en duo sur leurs appareils." },
  { min: 10, icon: MessageCircle, en: "Talk", fr: "Discuter", den: "Use the questions on the lesson sheet.", dfr: "Utilisez les questions de la fiche de leçon." },
  { min: 10, icon: Pencil, en: "Unplugged", fr: "Sans écran", den: "The paper-and-pencil version on the same sheet.", dfr: "La version papier-crayon sur la même fiche." },
  { min: 5, icon: Check, en: "Exit question", fr: "Question de sortie", den: "Each student shares one thing they learned today, out loud or on a sticky note.", dfr: "Chaque élève partage une chose apprise aujourd'hui, à voix haute ou sur un papillon adhésif." },
];

function Classroom() {
  const { fr, pick, t } = useT();
  const explorers = byGroup("explorers");
  const makers = byGroup("makers");
  return (
    <YoungShell>
      <header className="yl-tone-mint border-b-[3px] border-ink">
        <div className="container-mw pt-6 pb-10 sm:pt-8 sm:pb-12">
          <YoungCrumbs />
          <p className="mt-6 inline-flex rounded-full bg-white border-[3px] border-ink px-3 py-1 font-extrabold">{t("For teachers", "Pour le personnel enseignant")}</p>
          <h1 className="yl-title yl-in text-[2.6rem] sm:text-[3.8rem] leading-[0.98] mt-3 max-w-[16ch]">{t("Teach AI in one class period.", "Enseignez l'IA en une période.")}</h1>
          <p className="mt-3 text-[1.15rem] sm:text-[1.3rem] leading-relaxed max-w-[42rem]">{t("Free, bilingual games. No accounts, no sign-ups, no setup. Share one link and press play.", "Des jeux gratuits et bilingues. Pas de compte, pas d'inscription, rien à installer. Partagez un lien et lancez le jeu.")}</p>
          <div className="mt-6 max-w-[44rem]">
            <LabGuide say={t(
              "Hello, teachers! I'm Bit. Pick a game below, put it on the board or share the link, then use the lesson sheet to talk about it. Students can press Read it to me if they want me to read aloud.",
              "Bonjour! Je suis Bit. Choisissez un jeu ci-dessous, affichez-le au tableau ou partagez le lien, puis utilisez la fiche de leçon pour en discuter. Les élèves peuvent appuyer sur Lis-le-moi pour que je lise à voix haute.",
            )} />
          </div>
        </div>
      </header>

      <div className="container-mw py-10 sm:py-12 grid gap-12 sm:gap-14">
        <section aria-labelledby="three-steps">
          <h2 id="three-steps" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("Three steps", "Trois étapes")}</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { n: 1, icon: MonitorPlay, en: "Pick a game", fr: "Choisissez un jeu", den: "Start with lesson 1 below. Each game is 5 to 12 minutes of play.", dfr: "Commencez par la leçon 1 ci-dessous. Chaque jeu dure de 5 à 12 minutes." },
              { n: 2, icon: Share2, en: "Share one link", fr: "Partagez un lien", den: "Put it on the board, or copy the student link into Nearpod, Google Classroom or Teams.", dfr: "Affichez-le au tableau, ou collez le lien élève dans Nearpod, Google Classroom ou Teams." },
              { n: 3, icon: MessageCircle, en: "Talk about it", fr: "Discutez-en", den: "The lesson sheet has questions and a paper version. No screens needed.", dfr: "La fiche de leçon contient des questions et une version papier. Sans écran." },
            ].map(s => (
              <li key={s.n} className="yl-card bg-white p-5 flex gap-4 items-start">
                <span className="yl-step-num">{s.n}</span>
                <div>
                  <p className="yl-title text-[1.35rem] leading-tight inline-flex items-center gap-2"><s.icon className="h-5 w-5" aria-hidden="true" />{fr ? s.fr : s.en}</p>
                  <p className="mt-1.5 leading-relaxed">{fr ? s.dfr : s.den}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="unit">
          <h2 id="unit" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("A five-lesson unit for ages 8 to 12", "Une unité de cinq leçons pour les 8 à 12 ans")}</h2>
          <p className="mt-1 text-[1.05rem] max-w-[46rem]">{t("Play them in this order: what AI is, how it learns, how to spot fakes, how to ask it well, and whether it's fair.", "Jouez-les dans cet ordre : ce qu'est l'IA, comment elle apprend, repérer les faux, bien lui demander, et est-ce juste.")}</p>
          <ol className="mt-6 grid gap-5">
            {explorers.map((a, n) => <LessonRow key={a.id} a={a} step={n + 1} />)}
          </ol>
        </section>

        <section aria-labelledby="flow" className="yl-card yl-tone-sun p-5 sm:p-7">
          <h2 id="flow" className="yl-title text-[1.7rem] sm:text-[2rem] leading-tight">{t("A 45-minute lesson", "Une leçon de 45 minutes")}</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-5">
            {FLOW.map(f => (
              <li key={f.en} className="bg-white border-[3px] border-ink rounded-[16px] p-4">
                <p className="font-extrabold inline-flex items-center gap-2"><f.icon className="h-5 w-5" aria-hidden="true" />{fr ? f.fr : f.en}</p>
                <p className="yl-title text-[1.6rem] leading-none mt-2">{f.min} min</p>
                <p className="mt-2 text-[0.98rem] leading-relaxed">{fr ? f.dfr : f.den}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="share" className="grid gap-5 md:grid-cols-2">
          <div className="yl-card bg-white p-5 sm:p-6">
            <h2 id="share" className="yl-title text-[1.6rem] leading-tight">{t("Using Nearpod, Google Classroom or Teams?", "Vous utilisez Nearpod, Google Classroom ou Teams?")}</h2>
            <ol className="mt-3 grid gap-2 list-decimal pl-5 leading-relaxed">
              <li>{t("Press Copy student link on the game you want.", "Appuyez sur Copier le lien élève pour le jeu voulu.")}</li>
              <li>{t("Add it as a website or web link (in Nearpod: web content).", "Ajoutez-le comme site ou lien Web (dans Nearpod : contenu Web).")}</li>
              <li>{t("Students open it and play. No login and no class code.", "Les élèves l'ouvrent et jouent. Ni connexion ni code de classe.")}</li>
            </ol>
          </div>
          <div className="yl-card bg-white p-5 sm:p-6">
            <h2 className="yl-title text-[1.6rem] leading-tight">{t(`Older students (${pick(GROUP.makers.ages)})`, `Élèves plus âgés (${pick(GROUP.makers.ages)})`)}</h2>
            <ul className="mt-3 grid gap-2">
              {makers.map(a => (
                <li key={a.id}>
                  <Link to="/labs/young/$activity" params={{ activity: a.id }} className="inline-flex items-center gap-2 min-h-[44px] font-bold underline underline-offset-4 decoration-2">
                    {pick(a.title)} <span className="font-normal no-underline">· {a.minutes} min</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="safe">
          <h2 id="safe" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("Safe to use at school", "Sûr à l'école")}</h2>
          <div className="mt-5"><SafetyPromise /></div>
          <p className="mt-5"><Link to="/labs/young/grown-ups" className="yl-btn">{t("All lesson sheets and safety notes", "Toutes les fiches et notes de sécurité")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link></p>
        </section>
      </div>
    </YoungShell>
  );
}
