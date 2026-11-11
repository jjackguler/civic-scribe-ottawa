import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Megaphone, PenLine, Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Trust";
import { StatusLegend } from "@/components/Ledger";
import { DeskWalkthrough } from "@/components/DeskWalkthrough";
import { ExplainerVideo, EXPLAINER } from "@/components/ExplainerVideo";
import { CountUp } from "@/components/Motion";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef, ORIGIN } from "@/lib/seo";

/**
 * "What is Open Desk Journalism": definition, why, the six commitments, who does what,
 * the interactive desk walkthrough, the explainer video, first-season targets and what we do
 * not claim. Sources: the owner's concept paper v2 and transition plan (Nov 2026).
 */
export const Route = createFileRoute("/open-desk")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `What is Open Desk Journalism? — ${SITE.name}`, fr: `Qu'est-ce que le journalisme Open Desk? — ${SITE.name}` },
      description: {
        en: "Open Desk Journalism lets readers follow who made a claim, what evidence supports it, what a human editor checked and why it changed. Our aims, commitments and targets.",
        fr: "Le journalisme Open Desk permet de suivre qui a fait une affirmation, quelles preuves l'étayent, ce qu'un responsable a vérifié et pourquoi elle a changé.",
      },
      image: `${ORIGIN}${EXPLAINER.poster}`,
      imageWidth: 1280,
      imageHeight: 720,
      breadcrumbs: [{ name: { en: "Open Desk Journalism", fr: "Journalisme Open Desk" }, path: "/open-desk" }],
      jsonLd: (l, url) => [
        {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: l === "fr" ? "Open Desk : la méthode en 3 minutes 30" : "Open Desk, explained in 3½ minutes",
          description: "How a claim moves through the Open Desk: capture, break down, match, test, verdict, publish, reopen. Fictional example case.",
          thumbnailUrl: [`${ORIGIN}${EXPLAINER.poster}`],
          contentUrl: `${ORIGIN}${EXPLAINER.src}`,
          uploadDate: EXPLAINER.uploadDate,
          duration: EXPLAINER.duration,
          inLanguage: "en",
          publisher: publisherRef,
          url,
        },
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url,
          name: "Open Desk Journalism",
          publisher: publisherRef,
          publishingPrinciples: absUrl("/standards", l),
        },
      ],
    }),
  component: OpenDesk,
});

const COMMITMENTS: { h: Bi; p: Bi }[] = [
  {
    h: { en: "We separate attribution from verification", fr: "Nous séparons l'attribution de la vérification" },
    p: { en: "Quoting a company correctly is not the same as accepting what it says. A company's announcement shows that it said something; on its own it never counts as independent support.", fr: "Citer correctement une entreprise ne revient pas à accepter ce qu'elle dit. Son annonce prouve qu'elle l'a dit; à elle seule, elle ne compte jamais comme une preuve indépendante." },
  },
  {
    h: { en: "Every important claim gets a traceable record", fr: "Chaque affirmation importante a un dossier traçable" },
    p: { en: "Claims that could change what a reader understands or decides get a permanent number, the source passage, an archived copy and the evidence for and against. We also say what the evidence does not show.", fr: "Les affirmations qui peuvent changer ce qu'un lecteur comprend ou décide reçoivent un numéro permanent, le passage source, une copie archivée et les preuves pour et contre. Nous disons aussi ce que les preuves ne montrent pas." },
  },
  {
    h: { en: "A person is responsible for what we publish", fr: "Une personne répond de ce que nous publions" },
    p: { en: "Choosing the story, judging the evidence, giving the right of reply, approving and correcting stay with a named editor. AI is a tool; its output is never proof of its own accuracy.", fr: "Le choix du sujet, le jugement des preuves, le droit de réponse, l'approbation et la correction restent à un responsable nommé. L'IA est un outil; ce qu'elle produit ne prouve jamais sa propre exactitude." },
  },
  {
    h: { en: "Change stays visible", fr: "Les changements restent visibles" },
    p: { en: "A new development, a correction, a clarification and a retraction are named as what they are. Every change of result keeps its date, reason and signature, and the earlier result stays on the page.", fr: "Un fait nouveau, une correction, une précision et un retrait sont nommés comme tels. Chaque changement de résultat garde sa date, sa raison et sa signature, et l'ancien résultat reste affiché." },
  },
  {
    h: { en: "We listen to readers and protect sources", fr: "Nous écoutons les lecteurs et protégeons les sources" },
    p: { en: "Readers can suggest claims, bring documents and challenge a record. Accuracy is not a vote: the editor weighs the evidence and explains the decision. Whistleblowers, children and people under pressure can stay anonymous, for stated reasons.", fr: "Les lecteurs peuvent proposer des affirmations, apporter des documents et contester un dossier. L'exactitude ne se vote pas : le responsable pèse les preuves et explique sa décision. Lanceurs d'alerte, enfants et personnes sous pression peuvent rester anonymes, pour des raisons énoncées." },
  },
  {
    h: { en: "Evidence does not bend to tone or funders", fr: "Les preuves ne plient ni devant le ton ni devant les financeurs" },
    p: { en: "Hope, solutions and harm appear as far as the evidence shows them, no further. No sponsor or supporter can choose a story, set a result, see it before publication or stop it, and we take no money from companies on the ledger.", fr: "L'espoir, les solutions et les torts apparaissent dans la mesure où les preuves les montrent, pas davantage. Aucun commanditaire ni soutien ne peut choisir un sujet, fixer un résultat, le voir avant publication ou l'arrêter, et nous n'acceptons aucun argent des entreprises inscrites au registre." },
  },
];

const ROLES: { icon: typeof Bot; h: Bi; p: Bi }[] = [
  { icon: Bot, h: { en: "AI: speed", fr: "L'IA : la vitesse" }, p: { en: "Watches public statements, opens records, splits claims, matches earlier words and documents, flags contradictions. Never writes a result.", fr: "Suit les déclarations publiques, ouvre les dossiers, découpe les affirmations, rapproche paroles et documents antérieurs, signale les contradictions. N'écrit jamais un résultat." } },
  { icon: Search, h: { en: "Reporters: evidence", fr: "Les journalistes : les preuves" }, p: { en: "Check documents, talk to former staff and experts, send the company its questions and wait for the answer.", fr: "Vérifient les documents, interrogent anciens employés et spécialistes, envoient leurs questions à l'entreprise et attendent sa réponse." } },
  { icon: PenLine, h: { en: "The editor: the decision", fr: "Le responsable : la décision" }, p: { en: "The only person who writes a result, with the reason, signed by name. Every verdict is read first by a second person.", fr: "La seule personne qui écrit un résultat, avec sa raison, signé de son nom. Chaque verdict est d'abord relu par une deuxième personne." } },
  { icon: Megaphone, h: { en: "Creators: reach", fr: "Les créateurs : la portée" }, p: { en: "Share signed records in their own voice, show the record number and update their post when the record changes. Witnesses are asked for consent and credited; we never pay for information.", fr: "Relaient les dossiers signés avec leur propre voix, affichent le numéro et mettent à jour leur publication quand le dossier change. Les témoins donnent leur consentement et sont crédités; nous ne payons jamais l'information." } },
];

const TARGETS: { n: number; suffix?: string; h: Bi }[] = [
  { n: 25, h: { en: "statements screened in the first 10 weeks; we publish how many became records, and why", fr: "déclarations examinées en 10 semaines; nous publions combien sont devenues des dossiers, et pourquoi" } },
  { n: 5, h: { en: "active records at most at any time, so each one gets real testing", fr: "dossiers actifs au plus à la fois, pour que chacun soit vraiment vérifié" } },
  { n: 5, h: { en: "business days of right of reply before any verdict", fr: "jours ouvrables de droit de réponse avant tout verdict" } },
  { n: 80, suffix: "%", h: { en: "of readers in a short test we will run tell “no conclusion yet” from “supported by the evidence”", fr: "des lecteurs, lors d'un court test que nous mènerons, distinguent « aucune conclusion » et « étayée par les éléments disponibles »" } },
];

function OpenDesk() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <div className="container-mw pt-6">
        <Breadcrumbs items={[{ label: fr ? "Journalisme Open Desk" : "Open Desk Journalism" }]} />
      </div>

      {/* Hero */}
      <header className="container-mw mt-6 pb-10 border-b border-line grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-start">
        <div>
          <p className="kicker">{SITE.name} — {SITE.openDesk.subtitle[locale]}</p>
          <h1 className="hl text-[2.6rem] sm:text-[3.6rem] leading-[1.02] mt-2">
            {fr ? <>Nous ne vous demandons pas de nous croire. <span className="marker" data-reveal="">Nous vous montrons le dossier.</span></> : <>We don't ask you to trust us. <span className="marker" data-reveal="">We show you the record.</span></>}
          </h1>
          <p className="font-serif text-[1.22rem] leading-relaxed text-ink/80 mt-5 max-w-[56ch]">
            {fr
              ? "Le journalisme Open Desk est une façon de faire du journalisme où chaque lecteur peut suivre qui a fait une affirmation importante, quelles preuves l'étayent ou la contredisent, ce qu'un responsable humain a vérifié, et pourquoi l'information a changé depuis."
              : "Open Desk Journalism is a way of reporting in which any reader can follow who made an important claim, what evidence supports or contradicts it, what a human editor checked, and why the information has changed since."}
          </p>
          <p className="mt-6 flex flex-wrap gap-3">
            <Link to="/ledger" className="inline-flex items-center gap-2 h-11 px-5 rounded-[4px] bg-ink text-white font-bold hover:bg-lake">
              {fr ? "Ouvrir le registre" : "Open the ledger"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#desk" className="inline-flex items-center h-11 px-5 rounded-[4px] border border-ink font-bold hover:bg-ice">
              {fr ? "Voir le pupitre en action" : "See the desk at work"}
            </a>
          </p>
        </div>
        <ExplainerVideo />
      </header>

      <div className="container-mw max-w-[1100px]">
        {/* Why */}
        <section className="mt-14 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] rise" data-reveal="" aria-labelledby="why">
          <h2 id="why" className="hl text-[1.9rem] leading-tight">{fr ? "Pourquoi" : "Why we do this"}</h2>
          <div className="prose-mw font-serif text-[1.12rem] leading-relaxed grid gap-4">
            <p>{fr
              ? "Quand une entreprise annonce qu'elle supprime des emplois « à cause de l'IA », la phrase fait le tour des médias en quelques heures. Presque personne ne vérifie ensuite si c'était vrai : si le travail a vraiment été automatisé, déplacé ailleurs, ou si l'IA servait d'explication commode. Et presque personne ne revient voir six mois plus tard."
              : "When a company says it is cutting jobs “because of AI”, the line travels through the news in hours. Almost nobody checks later whether it was true: whether the work was really automated, moved somewhere else, or whether AI was a convenient explanation. And almost nobody comes back six months on."}</p>
            <p>{fr
              ? "Ces annonces orientent des décisions réelles : ce qu'on étudie, où l'on postule, ce que les gouvernements réglementent. Nous voulons qu'elles restent au dossier, vérifiées, avec leur suite."
              : "Those announcements steer real decisions: what people study, where they apply, what governments regulate. We want them kept on the record, tested, and followed up."}</p>
            <p className="font-sans text-[1rem]"><strong>{fr ? "Notre promesse :" : "Our promise:"}</strong> {fr ? "nous ne suivons pas seulement ce qui a été dit, mais les preuves qui l'appuient et ce qui s'est passé ensuite." : "we follow not only what was said, but the evidence behind it and what happened next."}</p>
          </div>
        </section>

        {/* Aims */}
        <section className="mt-16" aria-labelledby="aims">
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <h2 id="aims" className="hl text-[1.9rem] leading-tight">{fr ? "Ce que nous visons" : "What we aim for"}</h2>
            <ol className="grid gap-4 sm:grid-cols-2">
              {[
                { en: "A public, permanent record of what powerful actors in AI say about work, kept before a claim goes viral, not after.", fr: "Un registre public et permanent de ce que disent les acteurs puissants de l'IA sur le travail, tenu avant qu'une affirmation ne devienne virale, pas après." },
                { en: "Readers who can tell at a glance whether a claim is only recorded, still without a conclusion, supported, contradicted by other evidence or refuted.", fr: "Des lecteurs qui voient d'un coup d'œil si une affirmation est seulement consignée, encore sans conclusion, étayée, contredite par d'autres éléments ou réfutée." },
                { en: "AI that makes a small desk fast, with people who stay accountable for every decision.", fr: "Une IA qui rend un petit pupitre rapide, avec des personnes qui répondent de chaque décision." },
                { en: "Creators and witnesses as partners: credited, and tied to a record that can be checked. We do not pay for information.", fr: "Des créateurs et des témoins comme partenaires : crédités, et liés à un dossier vérifiable. Nous ne payons pas l'information." },
              ].map((a, n) => (
                <li key={a.en} className="rise border-t-2 border-ink pt-3" data-reveal="" style={{ "--delay": `${n * 80}ms` } as React.CSSProperties}>
                  <span className="font-mono text-[0.8rem] text-muted-ink">0{n + 1}</span>
                  <p className="mt-1 text-[1.02rem] leading-relaxed">{pick(a)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The desk, interactive */}
        <section id="desk" className="mt-16 scroll-mt-20" aria-labelledby="desk-h">
          <h2 id="desk-h" className="hl text-[1.9rem] leading-tight">{fr ? "Comment une affirmation traverse le pupitre" : "How a claim moves through the desk"}</h2>
          <p className="mt-2 text-muted-ink max-w-[62ch]">{fr ? "Sept étapes, de la déclaration au résultat signé, puis la réouverture. Avancez à votre rythme." : "Seven steps, from the statement to the signed result, then the reopening. Go at your own pace."}</p>
          <div className="mt-5"><DeskWalkthrough /></div>
        </section>

        {/* Who does what */}
        <section className="mt-16" aria-labelledby="roles">
          <h2 id="roles" className="hl text-[1.9rem] leading-tight">{fr ? "L'IA va vite. Les humains décident." : "AI brings speed. People decide."}</h2>
          <p className="mt-2 text-muted-ink max-w-[62ch]">{fr ? "Tous travaillent sur le même dossier, et personne ne peut trancher seul en dehors de son rôle." : "Everyone works on the same record, and no one can rule outside their role."}</p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map(({ icon: Icon, h, p }, n) => (
              <li key={h.en} className="lift rise bg-surface border border-line p-5" data-reveal="" style={{ "--delay": `${n * 90}ms` } as React.CSSProperties}>
                <Icon className="h-6 w-6 text-lake" aria-hidden="true" />
                <h3 className="font-bold text-[1.08rem] mt-3">{pick(h)}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted-ink leading-relaxed">{pick(p)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Statuses */}
        <section className="mt-16 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]" aria-labelledby="statuses-h">
          <div>
            <h2 id="statuses-h" className="hl text-[1.9rem] leading-tight">{fr ? "Cinq résultats, pas un score" : "Five results, not a score"}</h2>
            <p className="mt-2 text-muted-ink">{fr ? "Pas de pourcentage de vérité. Un résultat peut évoluer dans un sens comme dans l'autre quand de nouveaux éléments arrivent. Sous le tampon, deux petites lignes disent où en sont l'examen et le droit de réponse." : "No truth percentage. A result can move either way as new evidence arrives. Under the stamp, two small lines say where the review and the right of reply stand."}</p>
          </div>
          <StatusLegend />
        </section>

        {/* Commitments */}
        <section className="mt-16" aria-labelledby="commitments">
          <h2 id="commitments" className="hl text-[1.9rem] leading-tight">{fr ? "Six engagements" : "Six commitments"}</h2>
          <ol className="mt-6 grid gap-x-10 gap-y-7 md:grid-cols-2">
            {COMMITMENTS.map((c, n) => (
              <li key={c.h.en} className="rise grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3" data-reveal="" style={{ "--delay": `${(n % 2) * 90}ms` } as React.CSSProperties}>
                <span className="hl text-[2rem] leading-none text-brass-ink tabular-nums">{n + 1}</span>
                <div>
                  <h3 className="font-bold text-[1.1rem] leading-snug">{pick(c.h)}</h3>
                  <p className="mt-1.5 text-[0.98rem] leading-relaxed text-ink/85">{pick(c.p)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Targets */}
        <section className="mt-16 bg-night text-white -mx-4 sm:mx-0 px-5 sm:px-8 py-10" aria-labelledby="targets">
          <h2 id="targets" className="hl text-[1.9rem] leading-tight text-white">{fr ? "Nos cibles pour la première saison" : "Our targets for the first season"}</h2>
          <p className="mt-2 text-white/70 max-w-[62ch]">{fr ? "Ce sont des objectifs, pas des résultats. Nous publierons ce que nous atteignons, et ce que nous manquons." : "These are goals, not results. We will publish what we reach, and what we miss."}</p>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TARGETS.map((t) => (
              <li key={t.h.en} className="border-t border-white/25 pt-3">
                <p className="hl text-[3rem] leading-none text-brass"><CountUp to={t.n} />{t.suffix}</p>
                <p className="mt-2 text-[0.95rem] text-white/80 leading-snug">{pick(t.h)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.9rem] text-white/70">{fr ? "Notre premier thème : l'IA et l'emploi. D'autres suivront (économie, droits) quand ce pupitre aura fait ses preuves." : "Our first beat: AI and work. Others (the economy, rights) follow once this desk has proved itself."}</p>
        </section>

        {/* What we don't claim */}
        <section className="mt-16 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]" aria-labelledby="limits">
          <h2 id="limits" className="hl text-[1.9rem] leading-tight">{fr ? "Ce que nous ne prétendons pas" : "What we don't claim"}</h2>
          <ul className="grid gap-3 text-[1.02rem] leading-relaxed list-disc pl-5">
            <li>{fr ? "Nous n'avons pas inventé la citation des sources, la correction publique ou la responsabilité humaine. Ce que nous ajoutons, c'est une vérification écrite avant le résultat, un verdict qui attend la fin du droit de réponse, et un calendrier de retour fixé dès l'ouverture." : "We did not invent citing sources, public corrections or human responsibility. What we add is a test written before the result, a verdict that waits for the right of reply, and return dates set when the record opens."}</li>
            <li>{fr ? "Un résultat n'est pas une note de vérité sur une entreprise : il porte sur une affirmation précise, à une date précise. Une déclaration absente du registre n'a pas été évaluée." : "A result is not a truth score for a company: it is about one claim, at one date. A statement that is not in the ledger has not been assessed."}</li>
            <li>{fr ? "Une méthode ne garantit pas l'absence d'erreur. Quand nous nous trompons, la correction est datée et publique." : "A method is no guarantee against error. When we get it wrong, the correction is dated and public."}</li>
          </ul>
        </section>

        {/* Take part */}
        <section className="mt-16 border-t-2 border-ink pt-6" aria-labelledby="take-part">
          <h2 id="take-part" className="hl text-[1.9rem] leading-tight">{fr ? "Participer" : "Take part"}</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/tips", h: { en: "Flag a statement", fr: "Signaler une déclaration" }, p: { en: "Seen a company blame or credit AI for jobs? Send it to the desk.", fr: "Une entreprise accuse ou crédite l'IA pour des emplois? Envoyez-la au pupitre." } },
              { to: "/corrections", h: { en: "Challenge a record", fr: "Contester un dossier" }, p: { en: "Bring a document or point out an error. We answer with reasons.", fr: "Apportez un document ou signalez une erreur. Nous répondons, raisons à l'appui." } },
              { to: "/ledger", h: { en: "Follow the ledger", fr: "Suivre le registre" }, p: { en: "Every record, its result and its history, open to all.", fr: "Chaque dossier, son résultat et son historique, ouverts à tous." } },
              { to: "/newsletter", h: { en: "Get the weekly brief", fr: "Recevoir le brief" }, p: { en: "The week's records in your inbox.", fr: "Les dossiers de la semaine dans votre boîte." } },
            ].map((x) => (
              <li key={x.to}>
                <Link to={x.to as never} className="lift group block h-full bg-surface border border-line p-5">
                  <span className="font-bold text-[1.05rem] group-hover:underline inline-flex items-center gap-1">{pick(x.h)} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                  <span className="block mt-1.5 text-[0.93rem] text-muted-ink">{pick(x.p)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.92rem]">
            <Link to="/standards" className="text-lake font-semibold hover:underline">{fr ? `Le protocole Open Desk v${SITE.openDesk.protocolVersion}, en détail →` : `The Open Desk protocol v${SITE.openDesk.protocolVersion}, in full →`}</Link>
          </p>
        </section>
      </div>
    </PageShell>
  );
}
