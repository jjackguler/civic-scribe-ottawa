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
      description: { en: `The Open Desk protocol v${SITE.openDesk.protocolVersion}: who does what at ${SITE.name}, the evidence results, the test written in advance, sources and anonymity, what AI may and may not do, right of reply, second reading, conflicts of interest and corrections.`, fr: `Le protocole Open Desk v${SITE.openDesk.protocolVersion} : qui fait quoi à ${SITE.name}, les résultats, la vérification écrite à l'avance, sources et anonymat, ce que l'IA peut faire ou non, droit de réponse, deuxième lecture, conflits d'intérêts et corrections.` },
    }),
  component: Standards,
});

/** The Open Desk protocol (v1.1, 9 Nov 2026): how a record is opened, tested, signed and reopened. */
const PROTOCOL: { id?: string; h: Bi; p: Bi[] }[] = [
  {
    id: "open-desk",
    h: { en: "What an Open Desk newsroom does", fr: "Ce que fait une rédaction Open Desk" },
    p: [
      { en: `${SITE.name} is an Open Desk newsroom. We do not re-publish other outlets' AI news. We follow what companies say about AI and jobs with tests written in advance, show the evidence, the right of reply and every change of result on the same record, and a named editor signs each result after a second person has read it. Our first beat is AI and work: companies that say they are cutting or not cutting jobs because of AI.`, fr: `${SITE.name} est une rédaction Open Desk. Nous ne republions pas l'actualité IA des autres médias. Nous suivons ce que les entreprises disent de l'IA et de l'emploi au moyen de vérifications écrites à l'avance; les éléments de preuve, le droit de réponse et chaque changement de résultat figurent dans le même dossier, et un responsable éditorial nommé signe chaque résultat après la relecture d'une deuxième personne. Notre premier thème : l'IA et l'emploi, c'est-à-dire les entreprises qui disent supprimer ou non des emplois à cause de l'IA.` },
      { en: "Each statement becomes one record with a permanent number (OD-0001, OD-0002 …). A record is never deleted: every change is added to its history with the date, the reason and the editor's name. A record goes public once the company has been sent its questions and the test is written; until then it is the desk's working file. Active follow-up can end; the record stays public and reopens when new evidence arrives.", fr: "Chaque déclaration devient un dossier au numéro permanent (OD-0001, OD-0002…). Un dossier n'est jamais supprimé : chaque changement s'ajoute à son historique avec la date, la raison et le nom du responsable. Un dossier devient public une fois les questions envoyées à l'entreprise et la vérification rédigée; d'ici là, c'est un dossier de travail du pupitre. Le suivi actif peut prendre fin; le dossier reste public et se rouvre si de nouveaux éléments apparaissent." },
      { en: "A statement that is not in the ledger has not been assessed. Its absence is not a verdict.", fr: "Une déclaration absente du registre n'a pas été évaluée. Son absence n'est pas un verdict." },
    ],
  },
  {
    id: "roles",
    h: { en: "Who does what", fr: "Qui fait quoi" },
    p: [
      { en: "AI opens and prepares records: it watches public statements, splits a statement into parts that can be tested, matches them with earlier statements and documents, and flags contradictions. A person checks every match and contradiction against the primary source before it goes into a record or into a question to the company. AI cannot write a result.", fr: "L'IA ouvre et prépare les dossiers : elle suit les déclarations publiques, découpe une déclaration en parties vérifiables, les rapproche des déclarations antérieures et des documents, et signale les contradictions. Une personne vérifie chaque rapprochement et chaque contradiction dans la source primaire avant qu'ils n'entrent dans un dossier ou dans une question à l'entreprise. L'IA ne peut pas écrire un résultat." },
      { en: "A reporter adds evidence, talks to former staff and experts, and sends the company its questions.", fr: "Un journaliste ajoute les éléments de preuve, interroge d'anciens employés et des spécialistes, et envoie ses questions à l'entreprise." },
      { en: "The editor is the only person who writes the result, and signs it by name. Every result that is a verdict (“Supported”, “Conflicting evidence”, “Refuted”) is read before publication by a second person who is not the editor.", fr: "Le responsable éditorial est le seul à écrire le résultat, qu'il signe de son nom. Tout résultat qui constitue un verdict (« Étayée », « Éléments de preuve contradictoires », « Réfutée ») est relu avant publication par une deuxième personne qui n'est pas le responsable." },
      { en: "A reader editor, who does not work on records, takes complaints about them and can ask the editor to review a result in writing. The role can be unpaid; what matters is that the person is independent of the desk. Their appointment, term, pay if any, how they can be removed and these powers are published here before the first record opens.", fr: "Un médiateur, qui ne travaille pas sur les dossiers, reçoit les plaintes à leur sujet et peut demander par écrit au responsable de réexaminer un résultat. Le rôle peut être bénévole; l'essentiel est que la personne soit indépendante du pupitre. Sa nomination, la durée de son mandat, sa rémunération le cas échéant, les conditions de sa révocation et ces pouvoirs sont publiés ici avant l'ouverture du premier dossier." },
      { en: "Creators who partner with us agree in writing to use only records an editor has signed, show the record number and the date of the result, update their post when the record changes, and take no money from a company they cover. For everyone else these are our guidelines, not rules we can enforce.", fr: "Les créateurs partenaires s'engagent par écrit à n'utiliser que des dossiers signés, à afficher le numéro du dossier et la date du résultat, à mettre leur publication à jour quand le dossier change et à n'accepter aucun argent d'une entreprise qu'ils couvrent. Pour les autres, ce sont nos lignes directrices, pas des règles que nous pouvons imposer." },
      { en: "Witnesses are asked for consent and named if they agree. We do not pay for information or interviews, and never pay anyone with a stake in the story. When a named person gives us photos or video they made themselves, we may pay a licence fee; the record says so. We verify where and when their material was recorded.", fr: "Les témoins donnent leur consentement et sont nommés s'ils le souhaitent. Nous ne payons ni l'information ni les entrevues, et ne payons jamais une personne qui a un intérêt dans l'affaire. Quand une personne nommée nous confie des photos ou des vidéos qu'elle a elle-même réalisées, nous pouvons payer des droits; le dossier le précise. Nous vérifions où et quand le document a été enregistré." },
    ],
  },
  {
    id: "test",
    h: { en: "The test comes first", fr: "La vérification d'abord" },
    p: [
      { en: "Every claim is split into four parts, each tested on its own: what happened, how many, when, and the stated cause. “Jobs were cut” and “AI caused the cuts” are different claims, and the record can say one is supported while the evidence for the other is not enough.", fr: "Chaque affirmation est découpée en quatre parties vérifiées séparément : ce qui s'est passé, combien, quand et la cause invoquée. « Des postes ont été supprimés » et « l'IA en est la cause » sont deux affirmations différentes; le dossier peut établir l'une tout en constatant que les éléments manquent pour l'autre." },
      { en: "When a record opens, before any result, we write down what will be measured, the starting value, the scope, which evidence will count, and which documents we expect and by when. If the test has to change, the change is recorded with its reason; the first version stays visible.", fr: "À l'ouverture du dossier, avant tout résultat, nous écrivons ce qui sera mesuré, le point de départ, la portée, les éléments de preuve retenus, et les documents attendus avec leur date. Si la vérification doit changer, le changement est consigné avec sa raison; la première version reste visible." },
    ],
  },
  {
    id: "sources",
    h: { en: "Sources and evidence", fr: "Sources et éléments de preuve" },
    p: [
      { en: "Every verdict rests on at least two named sources that are independent of the company, and on the best primary document available: a filing, a mass-termination notice, a court record. The company's own material shows what it said; it never counts as independent support.", fr: "Tout verdict repose sur au moins deux sources nommées et indépendantes de l'entreprise, et sur le meilleur document primaire disponible : un dépôt réglementaire, un avis de licenciement collectif, un dossier judiciaire. Les documents de l'entreprise montrent ce qu'elle a dit; ils ne comptent jamais comme un appui indépendant." },
      { en: "We grant anonymity only for a clear and pressing reason, such as the risk of losing a job. An unnamed source never counts on its own: what they say must be backed by a document. Before we promise confidentiality we tell the source, in writing, its limits: a Canadian court can order a source revealed under the Journalistic Sources Protection Act, and the promise ends if the source knowingly lies to us.", fr: "Nous n'accordons l'anonymat que pour une raison claire et pressante, comme le risque de perdre son emploi. Une source non nommée ne compte jamais seule : ce qu'elle dit doit être appuyé par un document. Avant de promettre la confidentialité, nous en expliquons les limites par écrit : un tribunal canadien peut ordonner la divulgation d'une source en vertu de la Loi sur la protection des sources journalistiques, et la promesse prend fin si la source nous ment sciemment." },
      { en: "Job cuts usually have more than one cause. Evidence of another cause, such as falling sales, does not by itself refute a claim that AI played a part. The stated cause is called refuted only on direct evidence, written on the record; otherwise the result is “Conflicting evidence” or “No conclusion yet”, and the record names each cause we found.", fr: "Les suppressions d'emplois ont rarement une seule cause. La preuve d'une autre cause, comme une baisse des ventes, ne réfute pas à elle seule l'affirmation selon laquelle l'IA a joué un rôle. La cause invoquée n'est dite réfutée que sur un élément direct, consigné au dossier; sinon le résultat est « Éléments de preuve contradictoires » ou « Aucune conclusion à ce stade », et le dossier nomme chaque cause relevée." },
      { en: "In our first season, every “Refuted” result is read by a media lawyer before publication.", fr: "Pendant notre première saison, chaque résultat « Réfutée » est relu par un avocat spécialisé en droit des médias avant publication." },
    ],
  },
];

const PROTOCOL_AFTER: { id?: string; h: Bi; p: Bi[] }[] = [
  {
    id: "reply",
    h: { en: "Right of reply and archiving", fr: "Droit de réponse et archivage" },
    p: [
      { en: "Before any verdict, the company or person is sent written questions and given five business days to answer, ending at 5 p.m. Ottawa time. Weekends and Canadian federal and Ontario statutory holidays do not count. A shorter window is used only when a written reason is published on the record, and is never under 48 hours.", fr: "Avant tout verdict, l'entreprise ou la personne reçoit des questions écrites et dispose de cinq jours ouvrables pour répondre, jusqu'à 17 h, heure d'Ottawa. Les fins de semaine et les jours fériés fédéraux et ontariens ne comptent pas. Un délai plus court n'est utilisé que si sa raison est publiée dans le dossier, et n'est jamais inférieur à 48 heures." },
      { en: "If we raise a new substantive point, the company gets more time: one extension per record at most, of up to five business days, recorded with its reason. A partial reply on the last day does not extend the window. The record shows whether a reply was received, the company declined to comment, or nothing arrived by the deadline. Silence is not evidence, and the length of a reply does not decide the result. If the company later corrects or withdraws its statement, that is recorded separately from our result.", fr: "Si nous soulevons un nouveau point de fond, l'entreprise obtient un délai supplémentaire : une seule prolongation par dossier, d'au plus cinq jours ouvrables, consignée avec sa raison. Une réponse partielle le dernier jour ne prolonge pas le délai. Le dossier indique si une réponse a été reçue, si l'entreprise a refusé de commenter ou si rien n'est arrivé à l'échéance. Le silence n'est pas une preuve, et la longueur d'une réponse ne décide pas du résultat. Si l'entreprise corrige ou retire ensuite sa déclaration, cela est consigné à part de notre résultat." },
      { en: "Every claim is saved with an archived copy (for example on the Wayback Machine), so the record holds even if the original page changes or disappears.", fr: "Chaque affirmation est conservée avec une copie archivée (par exemple sur la Wayback Machine), pour que le dossier tienne même si la page d'origine change ou disparaît." },
    ],
  },
  {
    id: "reopen",
    h: { en: "Reopening", fr: "Réouverture" },
    p: [
      { en: "Every record comes back to the desk on each document date in its test, and 3 and 6 months after it opened. At 6 months the editor decides whether to continue or close active follow-up. No verdict is forced: “No conclusion yet” can stay, with its reason, and the record reopens when new evidence arrives.", fr: "Chaque dossier revient sur la table à chaque date de document prévue dans sa vérification, ainsi que 3 et 6 mois après son ouverture. À 6 mois, le responsable décide de poursuivre ou de clore le suivi actif. Aucun verdict n'est forcé : « Aucune conclusion à ce stade » peut rester, avec sa raison, et le dossier se rouvre si de nouveaux éléments apparaissent." },
      { en: "A new result is added to the history; the old one stays visible.", fr: "Un nouveau résultat s'ajoute à l'historique; l'ancien reste visible." },
    ],
  },
  {
    id: "record-corrections",
    h: { en: "Corrections, updates and removals", fr: "Corrections, mises à jour et retraits" },
    p: [
      { en: "A change to a record is labelled as a correction (we got something wrong), an update (something new happened) or a clarification (we said it unclearly). Each is dated and signed; a correction also says how the error happened.", fr: "Toute modification d'un dossier est indiquée comme une correction (nous nous sommes trompés), une mise à jour (un fait nouveau) ou une précision (nous nous sommes mal exprimés). Chacune est datée et signée; une correction indique aussi l'origine de l'erreur." },
      { en: "If we must remove material to protect a source or someone's personal information, or on legal advice, we do not republish it, and the record says what kind of material was removed, when and why.", fr: "Si nous devons retirer un contenu pour protéger une source ou des renseignements personnels, ou sur avis juridique, nous ne le republions pas, et le dossier indique quel type de contenu a été retiré, quand et pourquoi." },
    ],
  },
  {
    id: "conflicts",
    h: { en: "Money and conflicts of interest", fr: "Argent et conflits d'intérêts" },
    p: [
      { en: "Forbidden: money, shares or paid advice from any company whose statements are in the ledger, for the desk and everyone who signs or reads a result.", fr: "Interdit : argent, actions ou conseil rémunéré de toute entreprise dont les déclarations figurent au registre, pour le pupitre et toute personne qui signe ou relit un résultat." },
      { en: "Disclosed, with the person stepping away from the record, whatever the amount: any other tie to a company or person on a record, such as a past job, a family member, a grant or a partnership.", fr: "Déclaré, la personne se retirant du dossier, quel que soit le montant : tout autre lien avec une entreprise ou une personne visée par un dossier, comme un ancien emploi, un proche, une subvention ou un partenariat." },
      { en: "Every funder that gives CAD 1,000 or more in a year is listed by name on our ownership and funding page.", fr: "Tout bailleur de fonds qui verse 1 000 $ CA ou plus par année est nommé sur notre page propriété et financement." },
    ],
  },
  {
    id: "proposals",
    h: { en: "How statements are chosen", fr: "Comment les déclarations sont choisies" },
    p: [
      { en: "Readers can propose a statement through our private tips channel. We do not publish who proposed it, and we do not publish proposals we turn down: an unchecked claim is not repeated on our site. We publish only numbers: how many proposals came in, how many became records, and the reasons, by category.", fr: "Les lecteurs peuvent proposer une déclaration par notre canal de signalement confidentiel. Nous ne publions pas l'identité de la personne, ni les propositions écartées : une affirmation non vérifiée n'est pas reprise sur notre site. Nous publions seulement des chiffres : combien de propositions sont arrivées, combien sont devenues des dossiers, et les raisons, par catégorie." },
      { en: "The desk works in seasons of 10 weeks, with at most 5 active records at once while it is a small team. Statements screened and records opened are counted separately and published. A new beat opens on a written public-interest reason from the editor.", fr: "Le pupitre travaille par saisons de 10 semaines, avec au plus 5 dossiers actifs à la fois tant que l'équipe est réduite. Les déclarations examinées et les dossiers ouverts sont comptés séparément et publiés. Un nouveau thème s'ouvre sur une justification d'intérêt public écrite par le responsable." },
      { en: "For the first 10 records, the editor and the second reader each classify the record without seeing the other's result, and we publish how often they disagreed.", fr: "Pour les 10 premiers dossiers, le responsable et la deuxième personne classent chacun le dossier sans voir le résultat de l'autre, et nous publions la fréquence de leurs désaccords." },
    ],
  },
  {
    id: "changes",
    h: { en: "Changes to this protocol", fr: "Modifications du protocole" },
    p: [
      { en: "v1.1, 9 November 2026, after an independent review. A record goes public only once the company has been sent its questions; “Recorded, not yet tested” is now the desk's internal step. We no longer pay witnesses: only a disclosed licence fee for a named person's own photos or video (CAJ Ethics Guidelines; RTDNA Code 3.3). Every verdict needs two named, independent sources (EFCSN Code 2.G). New rules on anonymous sources, on claims with several causes, and on checking AI output. One reply extension at most. Rejected proposals are no longer summarised, only counted. At most 5 active records; blind double classification for the first 10 records. Every “Refuted” is read by a media lawyer in the first season.", fr: "v1.1, 9 novembre 2026, après un examen indépendant. Un dossier ne devient public qu'une fois les questions envoyées à l'entreprise; « Déclaration consignée » est désormais une étape interne. Nous ne payons plus les témoins : seulement des droits déclarés pour les photos ou vidéos qu'une personne nommée a elle-même réalisées (CAJ; RTDNA 3.3). Tout verdict exige deux sources nommées et indépendantes (EFCSN 2.G). Nouvelles règles sur l'anonymat, les causes multiples et la vérification des productions de l'IA. Une seule prolongation du délai de réponse. Les propositions écartées ne sont plus résumées, seulement comptées. Au plus 5 dossiers actifs; double classement à l'aveugle pour les 10 premiers dossiers. Chaque « Réfutée » est relu par un avocat en droit des médias pendant la première saison." },
      { en: "v1.0, 8 November 2026. The evidence result, the stage of the review and the right of reply are kept apart; readers see the result as the stamp and the other two as small lines under it. Every verdict now needs a second reader (EFCSN Code §2.J). The reply window is five business days instead of 48 hours. Each record has a test written in advance and four parts tested separately. The 6-month return decides whether to continue or close follow-up, without forcing a verdict. Corrections are typed and signed; removals are recorded. New rules on conflicts of interest, how statements are chosen, and a reader editor. The labels were reworded (“Attributed only” is now “Recorded, not yet tested”; “Unresolved” is now “No conclusion yet”), and structured data no longer gives results a number.", fr: "v1.0, 8 novembre 2026. Le résultat, l'étape de l'examen et le droit de réponse sont désormais distincts; le résultat est affiché comme tampon, les deux autres en petites lignes dessous. Tout verdict exige maintenant une deuxième lecture (Code EFCSN §2.J). Le délai de réponse passe de 48 heures à cinq jours ouvrables. Chaque dossier comporte une vérification écrite à l'avance et quatre parties vérifiées séparément. Le retour à 6 mois décide de poursuivre ou de clore le suivi, sans forcer de verdict. Les corrections sont typées et signées; les retraits sont consignés. Nouvelles règles sur les conflits d'intérêts, le choix des déclarations et le médiateur. Les libellés ont été reformulés (« Attribuée seulement » devient « Déclaration consignée »; « Non résolue » devient « Aucune conclusion à ce stade »), et les données structurées n'attribuent plus de note chiffrée." },
      { en: "v0.9, 6 November 2026. First public version: five statuses, a 48-hour reply window, a second reader for “Refuted”, reopening at 3 and 6 months.", fr: "v0.9, 6 novembre 2026. Première version publique : cinq statuts, délai de réponse de 48 heures, deuxième lecture pour « Réfutée », réouverture à 3 et 6 mois." },
      { en: "Records keep the protocol version they were opened under.", fr: "Les dossiers conservent la version du protocole sous laquelle ils ont été ouverts." },
    ],
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
          <h2 className="masthead-serif text-[1.7rem] leading-tight mb-3">{locale === "fr" ? "Les quatre résultats publics" : "The four public results"}</h2>
          <div className="prose-mw mb-5">
            <p>{locale === "fr"
              ? "Un dossier public affiche un seul tampon : ce que montrent les éléments de preuve. Avant l'envoi des questions à l'entreprise, le dossier est « Déclaration consignée » et reste interne; cette étape n'apparaît ensuite que dans son historique. Dessous, deux petites lignes disent où en est l'examen (en cours de vérification, sous surveillance, suivi actif terminé) et où en est le droit de réponse. « Aucune conclusion à ce stade » précise toujours pourquoi : données insuffisantes, ou échéance de vérification non atteinte."
              : "A public record shows one stamp: what the evidence shows. Before the company is sent its questions, the record is “Recorded, not yet tested” and stays internal; that step then appears only in its history. Under it, two small lines say where the review stands (being tested, monitoring, active follow-up closed) and where the right of reply stands. “No conclusion yet” always says why: not enough evidence yet, or the test date has not come."}</p>
            <p>{locale === "fr"
              ? "La concordance avec la source de l'entreprise ne suffit jamais pour « Étayée » : il faut deux sources indépendantes. Nos anciens tampons correspondent ainsi : Affirmation d'entreprise → Déclaration consignée, Pas encore prouvé → Aucune conclusion à ce stade, Vérifié → Étayée par les éléments disponibles."
              : "A match with the company's own source is never enough for “Supported”: it needs two independent sources. Our earlier stamps carry over as: Company claim → Recorded, not yet tested; Not yet proven → No conclusion yet; Checked → Supported by the evidence."}</p>
          </div>
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
