import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Phone, Printer, ShieldCheck } from "lucide-react";
import { ACTIVITY_ICON, LeavesLink, PrintPortal, SafetyPromise, YoungCrumbs, YoungShell, toneClass, usePrint, useT } from "@/components/YoungLab";
import { SITE } from "@/lib/site";
import { seoHead, publisherRef } from "@/lib/seo";
import { ACTIVITIES, GROUP, OUTSIDE, type Activity } from "@/lib/young-lab";

export const Route = createFileRoute("/labs/young/grown-ups")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Young Lab for parents and teachers — ${SITE.name}`, fr: `Le Jeune Labo pour les parents et les enseignants — ${SITE.name}` },
      description: {
        en: "Learning objectives, conversation starters, safety notes and printable activity sheets for Young Lab, our free AI games for ages 8 to 17.",
        fr: "Objectifs d'apprentissage, pistes de discussion, notes de sécurité et fiches à imprimer pour le Jeune Labo, nos jeux gratuits sur l'IA pour les 8 à 17 ans.",
      },
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: locale === "fr" ? "Le Jeune Labo pour les parents et les enseignants" : "Young Lab for parents and teachers",
        url,
        audience: { "@type": "EducationalAudience", educationalRole: ["parent", "teacher"] },
        publisher: publisherRef,
      }],
    }),
  component: GrownUps,
});

function Sheet({ a, onPrint }: { a: Activity; onPrint?: () => void }) {
  const { pick, t } = useT();
  const Icon = ACTIVITY_ICON[a.id];
  return (
    <article id={onPrint ? `sheet-${a.id}` : undefined} className="yl-sheet yl-card bg-white p-5 sm:p-7 scroll-mt-24">
      <div className="flex items-start gap-4">
        <span className={`grid place-items-center h-14 w-14 shrink-0 rounded-[16px] border-[3px] border-ink ${toneClass(a.tone)}`}><Icon className="h-7 w-7" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[0.95rem]">{pick(GROUP[a.group].title)} · {pick(GROUP[a.group].ages)} · <Clock className="inline h-4 w-4 -mt-0.5" aria-hidden="true" /> {t(`about ${a.minutes} min`, `env. ${a.minutes} min`)}</p>
          <h3 className="yl-title text-[1.6rem] leading-tight mt-0.5">{pick(a.title)}</h3>
          <p className="mt-2 text-[1.05rem] leading-relaxed"><strong>{t("Big idea: ", "Grande idée : ")}</strong>{pick(a.teaches)}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-3">
        <div>
          <h4 className="font-extrabold">{t("Learners will be able to", "Les jeunes pourront")}</h4>
          <ul className="mt-2 grid gap-1.5 list-disc pl-5 leading-relaxed">{a.objectives.map((o, n) => <li key={n}>{pick(o)}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-extrabold">{t("Talk about it", "Pour en parler")}</h4>
          <ul className="mt-2 grid gap-1.5 list-disc pl-5 leading-relaxed">{a.starters.map((o, n) => <li key={n}>{pick(o)}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-extrabold">{t("Unplugged version", "Version sans écran")}</h4>
          <ol className="mt-2 grid gap-1.5 list-decimal pl-5 leading-relaxed">{a.sheet.map((o, n) => <li key={n}>{pick(o)}</li>)}</ol>
        </div>
      </div>
      <div className="yl-sheet-lines" aria-hidden="true">
        <p className="font-bold">{t("Notes and drawings", "Notes et dessins")}</p>
        <span /><span /><span /><span />
      </div>
      {onPrint && (
        <div className="yl-no-print mt-5 flex flex-wrap gap-3">
          <button type="button" className="yl-btn" onClick={onPrint}><Printer className="h-5 w-5" aria-hidden="true" />{t("Print this sheet", "Imprimer cette fiche")}</button>
          <Link to="/labs/young/$activity" params={{ activity: a.id }} className="yl-btn yl-tone-sun">{t("Open the game", "Ouvrir le jeu")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
        </div>
      )}
    </article>
  );
}

function GrownUps() {
  const { fr, pick, t } = useT();
  const { printing, print } = usePrint();
  const resources = OUTSIDE.filter(o => o.audience === "grownups" || o.audience === "both");
  const checked = fr ? "9 octobre 2026" : "9 October 2026";

  return (
    <YoungShell>
      <header className="yl-tone-mint border-b-[3px] border-ink">
        <div className="container-mw pt-6 pb-10 sm:pb-12">
          <YoungCrumbs />
          <h1 className="yl-title yl-in text-[2.5rem] sm:text-[3.6rem] leading-[1] mt-5 max-w-[18ch]">{t("Young Lab for parents and teachers", "Le Jeune Labo pour les parents et les enseignants")}</h1>
          <p className="mt-3 text-[1.15rem] sm:text-[1.25rem] leading-relaxed max-w-[46rem]">{t("Nine short games that build AI literacy with a human-centred view: how it works, where it falls short, and how to use it with fairness, honesty and care for others. Neither hype nor fear.", "Neuf jeux courts pour développer la littératie en IA dans une perspective centrée sur l'humain : comment elle fonctionne, où elle échoue, et comment l'utiliser avec équité, honnêteté et respect des autres. Ni engouement aveugle ni peur.")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="yl-btn yl-btn--ink" onClick={() => print(ACTIVITIES.map(a => a.id))}><Printer className="h-5 w-5" aria-hidden="true" />{t("Print all nine sheets", "Imprimer les neuf fiches")}</button>
            <a href="#safety" className="yl-btn"><ShieldCheck className="h-5 w-5" aria-hidden="true" />{t("Safety notes", "Notes de sécurité")}</a>
          </div>
        </div>
      </header>

      <div className="container-mw py-10 sm:py-12 grid gap-14">
        <section aria-labelledby="at-a-glance">
          <h2 id="at-a-glance" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("At a glance", "En un coup d'œil")}</h2>
          <div className="mt-5 overflow-x-auto rounded-[16px] border-[3px] border-ink bg-white">
            <table className="w-full min-w-[640px] text-left">
              <thead className="yl-tone-sun">
                <tr className="border-b-[3px] border-ink">
                  <th scope="col" className="p-3">{t("Game", "Jeu")}</th>
                  <th scope="col" className="p-3">{t("Ages", "Âge")}</th>
                  <th scope="col" className="p-3">{t("Time", "Durée")}</th>
                  <th scope="col" className="p-3">{t("Big idea", "Grande idée")}</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITIES.map(a => (
                  <tr key={a.id} className="border-b border-line align-top">
                    <th scope="row" className="p-3"><a href={`#sheet-${a.id}`} className="font-extrabold underline underline-offset-4">{pick(a.title)}</a></th>
                    <td className="p-3 whitespace-nowrap">{pick(GROUP[a.group].ages)}</td>
                    <td className="p-3 whitespace-nowrap">{a.minutes} min</td>
                    <td className="p-3 leading-relaxed">{pick(a.teaches)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="safety" aria-labelledby="safety-title" className="scroll-mt-24 grid gap-5">
          <h2 id="safety-title" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("How we keep it safe", "Comment nous assurons la sécurité")}</h2>
          <SafetyPromise />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="yl-card bg-white p-5 leading-relaxed">
              <h3 className="font-extrabold text-[1.15rem]">{t("What is stored, and where", "Ce qui est conservé, et où")}</h3>
              <ul className="mt-2 grid gap-2 list-disc pl-5">
                <li>{t("Only which games were finished, when, and a best score, in this browser's local storage (key \"aib-young-v1\"). A count of games finished this visit (for the break reminder) is forgotten when the tab closes. No name, age, school or location is ever asked for.", "Seulement les jeux terminés, la date et le meilleur score, dans le stockage local du navigateur (clé « aib-young-v1 »). Un compteur des jeux terminés pendant la visite (pour le rappel de pause) s'efface à la fermeture de l'onglet. On ne demande jamais de nom, d'âge, d'école ni de lieu.")}</li>
                <li>{t("Two games have a text box (Next-word machine and Build your first chatbot). What's typed there is processed by the page itself, is never saved, and is never sent to a server or an AI model.", "Deux jeux ont une zone de texte (La machine à mot suivant et Construis ton premier robot). Ce qu'on y écrit est traité par la page elle-même, n'est jamais enregistré et n'est jamais envoyé à un serveur ni à un modèle d'IA.")}</li>
                <li>{t("No open-ended chat with an AI model, no ads on Young Lab pages, and no embedded videos or widgets from other sites.", "Aucun clavardage libre avec un modèle d'IA, aucune publicité dans le Jeune Labo, et aucune vidéo ni aucun gadget intégré d'autres sites.")}</li>
                <li>{t("To clear everything: open My passport and choose Clear, or clear this site's data in your browser.", "Pour tout effacer : ouvrez Mon passeport et choisissez Effacer, ou effacez les données du site dans le navigateur.")}</li>
              </ul>
            </div>
            <div className="yl-card bg-white p-5 leading-relaxed">
              <h3 className="font-extrabold text-[1.15rem]">{t("Calm by design", "Calme par conception")}</h3>
              <ul className="mt-2 grid gap-2 list-disc pl-5">
                <li>{t("Every game has a clear end. No endless feeds, timers or countdowns.", "Chaque jeu a une fin claire. Pas de fil sans fin, de minuterie ni de compte à rebours.")}</li>
                <li>{t("Stamps celebrate finishing, never punish stopping. \"Lab days\" only counts up; there's no streak to lose.", "Les tampons célèbrent la fin d'un jeu, sans jamais punir l'arrêt. Les « jours de labo » ne font que monter : pas de série à perdre.")}</li>
                <li>{t("After a few games, Young Lab gently suggests a break.", "Après quelques jeux, le Jeune Labo propose gentiment une pause.")}</li>
                <li>{t("All animation stops when the device asks for reduced motion. Every game works with a keyboard and a screen reader.", "Toute animation s'arrête quand l'appareil demande moins de mouvement. Chaque jeu fonctionne au clavier et avec un lecteur d'écran.")}</li>
              </ul>
            </div>
          </div>
          <div className="yl-card yl-tone-sky p-5 flex gap-4 items-start">
            <span className="grid place-items-center h-12 w-12 shrink-0 rounded-full bg-white border-[3px] border-ink"><Phone className="h-6 w-6" aria-hidden="true" /></span>
            <p className="leading-relaxed">
              <strong>{t("If a young person needs to talk: ", "Si un jeune a besoin de parler : ")}</strong>
              {t("in Canada, Kids Help Phone is free and open 24/7 at 1-800-668-6868, or text 686868. The chatbot game teaches this number as its first, most important rule.", "au Canada, Jeunesse, J'écoute est gratuit et ouvert jour et nuit au 1-800-668-6868, ou par texto au 686868. Le jeu du robot enseigne ce numéro comme première règle, la plus importante.")}
            </p>
          </div>
        </section>

        <section aria-labelledby="sheets" className="grid gap-6">
          <div>
            <h2 id="sheets" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("Activity sheets", "Fiches d'activité")}</h2>
            <p className="mt-1 text-[1.05rem] max-w-[46rem]">{t("Each sheet prints on its own page, with an unplugged version you can do with paper and pencils.", "Chaque fiche s'imprime sur sa propre page, avec une version sans écran à faire avec papier et crayons.")}</p>
          </div>
          {ACTIVITIES.map(a => <Sheet key={a.id} a={a} onPrint={() => print([a.id])} />)}
        </section>

        <section aria-labelledby="more" className="grid gap-5">
          <div>
            <h2 id="more" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("Going further", "Pour aller plus loin")}</h2>
            <p className="mt-1 text-[1.05rem] max-w-[46rem]">{t(`Free resources we checked on ${checked}. They leave AI Broadsheet and have their own privacy rules; some ask teachers or teens to register.`, `Des ressources gratuites vérifiées le ${checked}. Elles quittent AI Broadsheet et ont leurs propres règles de confidentialité; certaines demandent une inscription.`)}</p>
          </div>
          <ul className="grid gap-5 md:grid-cols-2">
            {resources.map(o => (
              <li key={o.id} className="yl-card bg-white p-5 flex flex-col">
                <p className="font-bold text-[0.95rem] text-muted-ink">{o.who} · {pick(o.ages)}</p>
                <h3 className="yl-title text-[1.3rem] leading-tight mt-1">{pick(o.title)}</h3>
                <p className="mt-2 leading-relaxed flex-1">{pick(o.note)}</p>
                <p className="mt-2 text-[0.95rem]">{pick(o.account)} · {pick(o.french)}</p>
                <div className="mt-4"><LeavesLink href={fr && o.frUrl ? o.frUrl : o.url}>{t("Open the resource", "Ouvrir la ressource")}<span className="sr-only">: {pick(o.title)}</span></LeavesLink></div>
              </li>
            ))}
          </ul>
          <p className="text-[0.95rem] text-muted-ink">{t("For adults who want to learn more themselves, ", "Pour les adultes qui veulent apprendre à leur tour, ")}<Link to="/labs" className="font-bold text-lake underline underline-offset-4">{t("AI Broadsheet Labs has free learning paths", "AI Broadsheet Labs propose des parcours gratuits")}</Link>.</p>
        </section>
      </div>

      {printing && (
        <PrintPortal>
          {ACTIVITIES.filter(a => printing.includes(a.id)).map(a => <Sheet key={a.id} a={a} />)}
        </PrintPortal>
      )}
    </YoungShell>
  );
}
