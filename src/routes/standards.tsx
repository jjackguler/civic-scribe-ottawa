import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";
import { StatusLegend } from "@/components/Ledger";

export const Route = createFileRoute("/standards")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Standards: the Open Desk protocol — ${SITE.name}`, fr: `Normes : le protocole Open Desk — ${SITE.name}` },
      description: { en: `The Open Desk protocol v${SITE.openDesk.protocolVersion}: who does what at ${SITE.name}, the five evidence statuses, what AI may and may not do, right of reply, archiving and corrections.`, fr: `Le protocole Open Desk v${SITE.openDesk.protocolVersion} : qui fait quoi à ${SITE.name}, les cinq statuts de preuve, ce que l'IA peut faire ou non, droit de réponse, archivage, corrections.` },
    }),
  component: Standards,
});

/** The Open Desk protocol (v0.9): how a record is opened, tested, signed and reopened. */
const PROTOCOL: { id?: string; h: Bi; p: Bi[] }[] = [
  {
    id: "open-desk",
    h: { en: "What an Open Desk newsroom does", fr: "Ce que fait une rédaction Open Desk" },
    p: [
      { en: `${SITE.name} is an Open Desk newsroom. We do not re-publish other outlets' AI news. We record what AI companies and their leaders say, test it against documents, their earlier statements and what happened next, and publish the result in the Open Desk Ledger with a status a named editor signs. Our first beat is AI and work: companies that say they are cutting or not cutting jobs because of AI.`, fr: `${SITE.name} est une rédaction Open Desk. Nous ne republions pas l'actualité IA des autres médias. Nous consignons ce que disent les entreprises d'IA et leurs dirigeants, nous le vérifions auprès des documents, de leurs déclarations antérieures et de ce qui s'est passé ensuite, puis nous publions le résultat dans le registre Open Desk avec un statut signé par un responsable éditorial nommé. Notre premier thème : l'IA et l'emploi, c'est-à-dire les entreprises qui disent supprimer ou non des emplois à cause de l'IA.` },
      { en: "Each statement becomes one record with a permanent number (OD-0001, OD-0002 …). A record never closes: every status change is added to its history with the date, the reason and the editor's name, and nothing is erased.", fr: "Chaque déclaration devient un dossier au numéro permanent (OD-0001, OD-0002…). Un dossier ne se ferme jamais : chaque changement de statut s'ajoute à son historique avec la date, la raison et le nom du responsable, et rien n'est effacé." },
    ],
  },
  {
    id: "roles",
    h: { en: "Who does what", fr: "Qui fait quoi" },
    p: [
      { en: "AI opens and prepares records: it watches public statements, splits a statement into claims that can be tested, matches them with earlier statements and documents, and flags contradictions. AI cannot write a status.", fr: "L'IA ouvre et prépare les dossiers : elle suit les déclarations publiques, découpe une déclaration en affirmations vérifiables, les rapproche des déclarations antérieures et des documents, et signale les contradictions. L'IA ne peut pas écrire un statut." },
      { en: "A reporter adds evidence, talks to former staff and experts, and sends the company its questions.", fr: "Un journaliste ajoute les preuves, interroge d'anciens employés et des spécialistes, et envoie ses questions à l'entreprise." },
      { en: "The editor is the only person who writes the status, and signs it by name. “Refuted” also needs a second reader.", fr: "Le responsable éditorial est le seul à écrire le statut, qu'il signe de son nom. « Réfuté » exige aussi une deuxième lecture." },
      { en: "Creators who share our records use only records an editor has signed, show the record number, update their post when the record changes, and take no money from a company they cover. Witnesses who give us video or testimony are asked for consent, named if they agree, and paid; we verify where and when their material was recorded.", fr: "Les créateurs qui relaient nos dossiers n'utilisent que des dossiers signés, affichent le numéro du dossier, mettent leur publication à jour quand le dossier change et n'acceptent aucun argent d'une entreprise qu'ils couvrent. Les témoins qui nous confient une vidéo ou un témoignage donnent leur consentement, sont nommés s'ils le souhaitent et sont rémunérés; nous vérifions où et quand leur document a été enregistré." },
    ],
  },
];

const PROTOCOL_AFTER: { id?: string; h: Bi; p: Bi[] }[] = [
  {
    id: "reply",
    h: { en: "Right of reply and archiving", fr: "Droit de réponse et archivage" },
    p: [
      { en: "Before any verdict, the company or person is sent written questions and given at least 48 hours to answer. Their answer is summarised on the record. If they do not answer, the record says so; we do not shorten the window.", fr: "Avant tout verdict, l'entreprise ou la personne reçoit des questions écrites et dispose d'au moins 48 heures pour répondre. Sa réponse est résumée dans le dossier. Faute de réponse, le dossier le précise; nous ne raccourcissons pas le délai." },
      { en: "Every claim is saved with an archived copy (for example on the Wayback Machine), so the record holds even if the original page changes or disappears.", fr: "Chaque affirmation est conservée avec une copie archivée (par exemple sur la Wayback Machine), pour que le dossier tienne même si la page d'origine change ou disparaît." },
    ],
  },
  {
    id: "reopen",
    h: { en: "Reopening", fr: "Réouverture" },
    p: [{ en: "Every record comes back to the desk 3 and 6 months after it opened, to check what happened next. A new status is added to the history; the old one stays visible.", fr: "Chaque dossier revient sur la table 3 et 6 mois après son ouverture, pour vérifier ce qui s'est passé ensuite. Un nouveau statut s'ajoute à l'historique; l'ancien reste visible." }],
  },
];

const SECTIONS: { id?: string; alias?: string; h: Bi; p: Bi[] }[] = [
  {
    h: { en: "Editorial leadership", fr: "Direction éditoriale" },
    p: [{ en: `Founder and editor ${SITE.editor.name} sets the editorial direction and is responsible for the publication's work and corrections. AI Broadsheet is published by ${SITE.publisher.name} in ${SITE.publisher.city} and brings together journalism, filmmaking and new forms of storytelling, with a focus on how AI affects people.`, fr: `Le fondateur et responsable éditorial ${SITE.editor.name} définit la ligne éditoriale et répond du travail de la publication et des corrections. Publié par ${SITE.publisher.name} à ${SITE.publisher.city}, AI Broadsheet associe journalisme, cinéma et nouvelles formes de récit pour explorer les effets de l'IA sur les personnes.` }],
  },
  {
    h: { en: "Accuracy and attribution", fr: "Exactitude et attribution" },
    p: [{ en: "We distinguish facts, attributed claims and opinion. Reporting should support what we publish; uncertainty is acknowledged, and material from other publishers is credited where it appears.", fr: "Nous distinguons les faits, les déclarations attribuées et l'opinion. Les informations publiées doivent être étayées; les incertitudes sont reconnues et les contenus d'autres éditeurs sont crédités là où ils apparaissent." }],
  },
  {
    id: "ai-desk",
    h: { en: "AI and editorial responsibility", fr: "IA et responsabilité éditoriale" },
    p: [{ en: "AI supports parts of our research, writing, translation and creative production. AI-assisted work is identified with a label that links to our How we use AI page, which explains each label and the human role behind it. Editorial direction and accountability remain human; AI output can contain errors, which readers can report for correction.", fr: "L'IA soutient certaines étapes de recherche, de rédaction, de traduction et de création. Les contenus réalisés avec son aide portent une étiquette, expliquée sur notre page Comment nous utilisons l'IA avec le rôle humain qui l'accompagne. La direction et la responsabilité éditoriales restent humaines; les productions de l'IA peuvent contenir des erreurs, que les lecteurs peuvent signaler pour correction." }],
  },
  {
    id: "newsroom",
    alias: "dispatches",
    h: { en: "Newsroom summaries", fr: "Résumés de la rédaction" },
    p: [
      { en: "Newsroom summaries are AI-assisted summaries of reporting by other outlets, or of an organization's own announcement. The reporting belongs to those outlets: every summary names them, links to their originals and is labelled as a summary written with AI. Automated checks compare names, numbers and quotations with the sources; they do not replace human verification.", fr: "Les résumés de la rédaction sont des résumés, rédigés avec l'aide de l'IA, de reportages d'autres médias ou de l'annonce d'une organisation. Le reportage appartient à ces médias : chaque résumé les nomme, renvoie à leurs originaux et est identifié comme un résumé rédigé avec l'IA. Des contrôles automatiques comparent les noms, les chiffres et les citations aux sources; ils ne remplacent pas la vérification humaine." },
      { en: "Summaries are not ledger records and never carry an evidence status. They are being phased out in favour of the ledger.", fr: "Les résumés ne sont pas des dossiers du registre et ne portent jamais de statut de preuve. Ils sont progressivement remplacés par le registre." },
      { en: "We call something our own only when we made it: the editor's columns, interviews, videos and immersive projects. Summaries remain the publication's responsibility, and errors in them are corrected like any other.", fr: "Nous ne disons « notre » que pour ce que nous avons fait nous-mêmes : les chroniques de l'éditeur, les entretiens, les vidéos et les projets immersifs. Les résumés restent sous la responsabilité de la publication, et leurs erreurs sont corrigées comme les autres." },
    ],
  },
  {
    h: { en: "Visual and immersive storytelling", fr: "Récits visuels et immersifs" },
    p: [{ en: "We explore short documentaries, visual explainers and immersive journalism. Reconstructions and synthetic media are identified so audiences can understand what they are seeing and hearing.", fr: "Nous explorons les courts documentaires, les explications visuelles et le journalisme immersif. Les reconstitutions et les médias synthétiques sont identifiés pour que le public comprenne ce qu'il voit et entend." }],
  },
  {
    h: { en: "Opinion", fr: "Opinion" },
    p: [{ en: "Opinion is labelled and presented under the author's name, separately from news coverage.", fr: "L'opinion est identifiée et présentée sous le nom de son auteur, séparément de l'actualité." }],
  },
  {
    h: { en: "Editorial independence", fr: "Indépendance éditoriale" },
    p: [{ en: "Advertisers and sponsors do not choose or change our coverage. Advertising and sponsored material must be clearly identified.", fr: "Les annonceurs et commanditaires ne choisissent ni ne modifient notre couverture. Les publicités et les contenus commandités doivent être clairement identifiés." }],
  },
  {
    h: { en: "Corrections", fr: "Corrections" },
    p: [{ en: "Readers can report errors through the story-page link or contact the editor. We correct errors in our own work and record corrections on the corrections page.", fr: "Les lecteurs peuvent signaler une erreur depuis la page d'un article ou contacter l'éditeur. Nous corrigeons les erreurs dans nos propres contenus et consignons les corrections sur la page dédiée." }],
  },
];

function Standards() {
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <PageIntro
        kicker={`${SITE.openDesk.method} · ${locale === "fr" ? "protocole" : "protocol"} v${SITE.openDesk.protocolVersion}`}
        title={locale === "fr" ? "Nos normes : le protocole Open Desk" : "Our standards: the Open Desk protocol"}
        dek={locale === "fr" ? "Ce que nous consignons, comment nous le vérifions, qui signe, et comment chaque dossier reste ouvert." : "What we record, how we test it, who signs, and how every record stays open."}
      />
      <div className="container-mw mt-10 max-w-3xl">
        <p className="mb-10 font-serif text-[1.1rem] leading-relaxed border-l-[4px] border-signal pl-4">
          {locale === "fr" ? "Ces normes découlent de nos valeurs : la démocratie, les droits de la personne, l'égale dignité, la liberté de croyance et de conscience — y compris de ne pas croire — et la sécurité des enfants et des familles. " : "These standards follow from our values: democracy, human rights, equal dignity, freedom of belief and conscience — including non-belief — and safety for children and families. "}
          <Link to="/values" className="text-lake font-semibold hover:underline">{locale === "fr" ? "Lire nos valeurs" : "Read what we stand for"}</Link>
        </p>
        {PROTOCOL.map(s => <Section key={s.h.en} s={s} />)}
        <section id="statuses" className="mb-10 scroll-mt-24">
          <h2 className="masthead-serif text-[1.7rem] leading-tight mb-3">{locale === "fr" ? "Les cinq statuts" : "The five statuses"}</h2>
          <div className="prose-mw mb-5"><p>{locale === "fr"
            ? "Chaque dossier porte l'un de ces cinq statuts. La concordance avec la source de l'entreprise ne suffit jamais pour « Étayé » : il faut une preuve indépendante. Nos anciens tampons correspondent ainsi : Affirmation d'entreprise → Attribué seulement, Pas encore prouvé → Non résolu, Vérifié → Étayé."
            : "Every record carries one of these five statuses. A match with the company's own source is never enough for “Supported”: it needs independent evidence. Our earlier stamps carry over as: Company claim → Attributed only, Not yet proven → Unresolved, Checked → Supported."}</p></div>
          <StatusLegend />
          <p className="mt-5"><Link to="/ledger" className="text-lake font-semibold hover:underline">{locale === "fr" ? "Voir le registre Open Desk →" : "See the Open Desk Ledger →"}</Link></p>
        </section>
        {PROTOCOL_AFTER.map(s => <Section key={s.h.en} s={s} />)}
        {SECTIONS.map(s => (
          <section key={s.h.en} id={s.id} className="mb-10 scroll-mt-24">
            {/* Older links point here by a previous name (#dispatches). */}
            {s.alias && <span id={s.alias} className="block scroll-mt-24" aria-hidden="true" />}
            <h2 className="masthead-serif text-[1.7rem] leading-tight mb-3">{pick(s.h)}</h2>
            <div className="prose-mw">{s.p.map(p => <p key={p.en}>{pick(p)}</p>)}</div>
          </section>
        ))}
        <p className="font-semibold">
          <Link to="/how-we-use-ai" className="text-lake hover:underline">{locale === "fr" ? "Comment nous utilisons l'IA" : "How we use AI"}</Link>
          <span className="mx-3 text-line">|</span>
          <Link to="/about" hash="ownership" className="text-lake hover:underline">{locale === "fr" ? "Propriété et financement" : "Ownership and funding"}</Link>
          <span className="mx-3 text-line">|</span>
          <Link to="/about" className="text-lake hover:underline">{locale === "fr" ? "Notre équipe et notre démarche" : "Our team and approach"}</Link>
          <span className="mx-3 text-line">|</span>
          <Link to="/privacy" className="text-lake hover:underline">{locale === "fr" ? "Confidentialité" : "Privacy"}</Link>
        </p>
      </div>
    </PageShell>
  );
}

function Section({ s }: { s: { id?: string; h: Bi; p: Bi[] } }) {
  const { pick } = useLocale();
  return (
    <section id={s.id} className="mb-10 scroll-mt-24">
      <h2 className="masthead-serif text-[1.7rem] leading-tight mb-3">{pick(s.h)}</h2>
      <div className="prose-mw">{s.p.map(p => <p key={p.en}>{pick(p)}</p>)}</div>
    </section>
  );
}
