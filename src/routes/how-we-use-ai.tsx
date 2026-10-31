import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { AiBadge, Breadcrumbs, PublishedBy } from "@/components/Trust";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead, faqLd } from "@/lib/seo";

/**
 * "How we use AI": every AI label on the site, what it means, who is responsible.
 * Policy page linked from every AI-assisted item and from NewsMediaOrganization JSON-LD.
 * Keep it to principles and labels (owner decision, 28 Oct 2026): no internal pipeline
 * diagrams or numeric thresholds.
 */
export const Route = createFileRoute("/how-we-use-ai")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `How we use AI — ${SITE.name}`, fr: `Comment nous utilisons l'IA — ${SITE.name}` },
      description: {
        en: "Where AI helps at AI Broadsheet, how each AI-assisted item is labelled, what a human editor approves, what we never do with AI, and how to report an error.",
        fr: "Où l'IA intervient à AI Broadsheet, comment chaque élément assisté par l'IA est signalé, ce qu'approuve un responsable humain, ce que nous ne faisons jamais.",
      },
      breadcrumbs: [{ name: { en: "How we use AI", fr: "Comment nous utilisons l'IA" }, path: "/how-we-use-ai" }],
      jsonLd: locale => [faqLd(locale, QA)],
    }),
  component: HowWeUseAi,
});

type Label = { badge: "assisted" | "summary" | "headline" | "translated"; where: Bi; means: Bi; human: Bi };

const LABELS: Label[] = [
  {
    badge: "assisted",
    where: { en: "“From our desk” pieces (made in Buildgena Studio)", fr: "Textes « De notre pupitre » (réalisés dans Buildgena Studio)" },
    means: { en: "Drafted with AI assistance from the sources listed under the piece.", fr: "Rédigés avec l'aide de l'IA à partir des sources citées sous le texte." },
    human: { en: "A named editor edits and approves each piece before it is published. The approver and the date are shown on the page.", fr: "Un responsable éditorial nommé révise et approuve chaque texte avant sa publication. Son nom et la date figurent sur la page." },
  },
  {
    badge: "summary",
    where: { en: "Newsroom summaries (/dispatch and /article pages)", fr: "Résumés de la rédaction (pages /dispatch et /article)" },
    means: { en: "Summaries of what other outlets reported, written with AI and checked automatically against every report they cite. Each one links to those reports.", fr: "Résumés de ce que d'autres médias ont rapporté, rédigés avec l'IA et vérifiés automatiquement contre chaque reportage cité. Chacun renvoie à ces reportages." },
    human: { en: "This is routine, automated coverage under editorial rules set by the editor. Not every summary is reviewed by a person before it appears; sensitive topics can be held for review, and the editor answers for corrections.", fr: "Il s'agit d'une couverture courante et automatisée, encadrée par des règles fixées par le responsable éditorial. Chaque résumé n'est pas relu par une personne avant de paraître; les sujets sensibles peuvent être retenus pour révision, et le responsable répond des corrections." },
  },
  {
    badge: "headline",
    where: { en: "Some headlines on story cards and story pages", fr: "Certains titres sur les cartes et pages de nouvelles" },
    means: { en: "A short headline and brief written with AI from the publishers' own headlines. An automatic check rejects it if it adds a number or a name the sources don't contain. The publisher's original headline is always shown next to it.", fr: "Un court titre et résumé rédigés avec l'IA à partir des titres des éditeurs. Une vérification automatique les rejette s'ils ajoutent un chiffre ou un nom absent des sources. Le titre original de l'éditeur est toujours affiché à côté." },
    human: { en: "Automated, under rules set by the editor. Report anything wrong and we fix it.", fr: "Automatisé, selon des règles fixées par le responsable éditorial. Signalez toute erreur et nous la corrigerons." },
  },
  {
    badge: "translated",
    where: { en: "Headlines shown in the other language", fr: "Titres affichés dans l'autre langue" },
    means: { en: "Machine translation between English and French, with the original headline available.", fr: "Traduction automatique entre l'anglais et le français, le titre original restant disponible." },
    human: { en: "Automated. The link always goes to the publisher's original.", fr: "Automatisé. Le lien mène toujours à l'original de l'éditeur." },
  },
];

const NEVER: Bi[] = [
  { en: "Invent news, quotes, numbers or sources. Every fact comes from a named source, and company statements are shown as claims.", fr: "Inventer des nouvelles, des citations, des chiffres ou des sources. Chaque fait vient d'une source nommée, et les déclarations d'entreprises sont présentées comme des affirmations." },
  { en: "Make pictures or video that look like news photos or footage. Our explainers use drawn, code-made scenes, and reconstructions are labelled as reconstructions.", fr: "Créer des images ou vidéos qui ressemblent à des photos ou séquences d'actualité. Nos explicatifs utilisent des scènes dessinées par code, et les reconstitutions sont identifiées comme telles." },
  { en: "Show real people's faces in AI-made material, or put words in anyone's mouth: quoted lines come only from real records.", fr: "Montrer le visage de personnes réelles dans du contenu produit par l'IA, ou prêter des paroles à quiconque : les citations proviennent uniquement de documents réels." },
  { en: "Hide AI use. If AI helped make something, the page says so.", fr: "Cacher l'usage de l'IA. Si l'IA a aidé à produire quelque chose, la page l'indique." },
  { en: "Let advertisers or sponsors use AI to shape our coverage. They never choose, change or preview it.", fr: "Laisser des annonceurs ou commanditaires orienter notre couverture par l'IA. Ils ne la choisissent, ne la modifient ni ne la voient jamais à l'avance." },
];

const QA: { q: Bi; a: Bi }[] = [
  {
    q: { en: "Which AI models do you use?", fr: "Quels modèles d'IA utilisez-vous?" },
    a: { en: "Mainly Google's Gemini models, and Anthropic's Claude when we switch it on, for writing, translating and grouping stories. Narrated explainers use AI voices from ElevenLabs. Our privacy page lists what is sent to these providers.", fr: "Surtout les modèles Gemini de Google, et Claude d'Anthropic lorsque nous l'activons, pour rédiger, traduire et regrouper les nouvelles. Les explicatifs narrés utilisent des voix d'IA d'ElevenLabs. Notre page de confidentialité précise ce qui est transmis à ces fournisseurs." },
  },
  {
    q: { en: "Who is responsible when AI gets something wrong?", fr: "Qui est responsable lorsque l'IA se trompe?" },
    a: { en: `We are. ${SITE.editor.name}, founder and editor, is accountable for everything AI Broadsheet publishes, including AI-assisted work. Report an error and we correct it in public on the corrections page.`, fr: `Nous. ${SITE.editor.name}, fondateur et responsable éditorial, répond de tout ce qu'AI Broadsheet publie, y compris le travail assisté par l'IA. Signalez une erreur et nous la corrigerons publiquement sur la page des corrections.` },
  },
  {
    q: { en: "Do you use what I type or read to train AI?", fr: "Utilisez-vous ce que je tape ou lis pour entraîner l'IA?" },
    a: { en: "No. We don't build reader profiles. For our own writing, only publishers' public text is sent to the model provider. Questions typed into Ask the Keeper go to an AI model to get an answer, so leave out personal details.", fr: "Non. Nous ne créons pas de profils de lecteurs. Pour notre rédaction, seul le texte public des éditeurs est transmis au fournisseur du modèle. Les questions posées au Gardien sont envoyées à un modèle d'IA pour obtenir une réponse; n'y mettez pas de renseignements personnels." },
  },
];

function HowWeUseAi() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  return (
    <PageShell>
      <div className="container-mw pt-6"><Breadcrumbs items={[{ label: fr ? "Comment nous utilisons l'IA" : "How we use AI" }]} /></div>
      <header className="container-mw pt-6 pb-10 border-b border-line">
        <p className="kicker">{fr ? "Normes" : "Standards"}</p>
        <h1 className="hl text-[2.5rem] sm:text-[3.4rem] mt-2 max-w-4xl">{fr ? "Comment nous utilisons l'IA" : "How we use AI"}</h1>
        <p className="font-serif text-[1.25rem] leading-relaxed text-ink/80 mt-4 max-w-[62ch]">
          {fr
            ? "Nous couvrons l'IA et nous l'utilisons. Les deux exigent la même chose : dire clairement où elle intervient, garder une personne responsable, et corriger nos erreurs au grand jour."
            : "We cover AI, and we use it. Both call for the same things: say plainly where it helps, keep a person accountable, and fix our mistakes in the open."}
        </p>
        <p className="mt-5 text-[0.95rem] text-muted-ink"><PublishedBy /> · {fr ? "Responsable éditorial" : "Editor"}: <span className="font-semibold text-ink">{SITE.editor.name}</span></p>
      </header>

      <section className="container-mw mt-12" aria-labelledby="labels">
        <h2 id="labels" className="hl text-[1.9rem]">{fr ? "Les étiquettes que vous verrez" : "The labels you will see"}</h2>
        <p className="font-serif text-[1.1rem] text-muted-ink mt-2 max-w-[62ch]">{fr ? "Chaque élément produit avec l'aide de l'IA porte l'une de ces étiquettes." : "Everything made with AI assistance carries one of these labels."}</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-ink text-[0.85rem]">
                <th scope="col" className="py-2 pr-4 w-[13rem]">{fr ? "Étiquette" : "Label"}</th>
                <th scope="col" className="py-2 pr-4">{fr ? "Où" : "Where"}</th>
                <th scope="col" className="py-2 pr-4">{fr ? "Ce que cela veut dire" : "What it means"}</th>
                <th scope="col" className="py-2">{fr ? "Le rôle humain" : "The human role"}</th>
              </tr>
            </thead>
            <tbody className="font-serif text-[1rem] leading-snug align-top">
              {LABELS.map(l => (
                <tr key={l.badge} className="border-b border-line">
                  <td className="py-4 pr-4"><AiBadge kind={l.badge} /></td>
                  <td className="py-4 pr-4 font-sans font-semibold text-[0.92rem]">{pick(l.where)}</td>
                  <td className="py-4 pr-4">{pick(l.means)}</td>
                  <td className="py-4">{pick(l.human)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[0.95rem] text-muted-ink max-w-[70ch]">
          {fr
            ? "Sans étiquette IA : les titres des autres éditeurs (affichés tels quels, avec un lien), nos guides et le mot de la rédaction, signés. Les vidéos explicatives indiquent sur leur page si la voix est produite par l'IA."
            : "No AI label: other publishers' headlines (shown as published, with a link), and our signed guides and editor's columns. Explainer videos say on their own page when the voice is AI-generated."}
        </p>
      </section>

      <section className="container-mw mt-14 grid gap-12 lg:grid-cols-2" aria-label={fr ? "Engagements" : "Commitments"}>
        <div>
          <h2 className="hl text-[1.9rem]">{fr ? "Ce que nous ne faisons jamais" : "What we never do"}</h2>
          <ul className="mt-4 grid gap-3">
            {NEVER.map(n => (
              <li key={n.en} className="flex gap-3 font-serif text-[1.08rem] leading-relaxed">
                <span className="mt-2.5 h-2 w-2 shrink-0 bg-live" aria-hidden="true" />{pick(n)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="hl text-[1.9rem]">{fr ? "Une personne reste responsable" : "A person stays accountable"}</h2>
          <div className="mt-4 font-serif text-[1.08rem] leading-relaxed grid gap-3">
            <p>{fr
              ? `${SITE.editor.name} fixe la ligne éditoriale et les règles que suivent nos outils, et répond de tout ce que nous publions. Les textes « De notre pupitre » ne paraissent qu'après l'approbation d'un responsable éditorial, nommé sur la page.`
              : `${SITE.editor.name} sets the editorial direction and the rules our tools follow, and is accountable for everything we publish. “From our desk” pieces appear only after an editor approves them, and the approver is named on the page.`}</p>
            <p>{fr
              ? "Les textes de notre pupitre sont réalisés dans Buildgena Studio, l'application de rédaction de GEN:A Labs. Notre site n'accepte un texte de Studio que s'il cite ses sources, porte la mention d'usage de l'IA et nomme la personne qui l'a approuvé."
              : "Our desk pieces are made in Buildgena Studio, GEN:A Labs' newsroom app. Our site only accepts a Studio piece that cites its sources, carries its AI disclosure and names the person who approved it."}{" "}
              <a href={SITE.studio.url} rel="noopener" className="text-lake font-semibold underline">{SITE.studio.name}</a></p>
            <p>{fr ? "Vous avez repéré une erreur? " : "Spotted a mistake? "}<Link to="/corrections" hash="report" className="text-lake font-semibold underline">{fr ? "Signalez-la" : "Report it"}</Link>{fr ? " : nous corrigeons publiquement." : ": we correct in public."}</p>
          </div>
        </div>
      </section>

      <section className="container-mw mt-14" aria-labelledby="qa">
        <h2 id="qa" className="hl text-[1.9rem]">{fr ? "Questions" : "Questions"}</h2>
        <dl className="mt-4 divide-y divide-line border-y border-line max-w-4xl">
          {QA.map(x => (
            <div key={x.q.en} className="py-5">
              <dt className="font-bold text-[1.05rem]">{pick(x.q)}</dt>
              <dd className="font-serif text-[1.08rem] leading-relaxed text-ink/85 mt-1">{pick(x.a)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 font-semibold flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/standards" className="text-lake hover:underline">{fr ? "Normes éditoriales" : "Editorial standards"}</Link>
          <Link to="/values" className="text-lake hover:underline">{fr ? "Nos valeurs" : "What we stand for"}</Link>
          <Link to="/privacy" className="text-lake hover:underline">{fr ? "Confidentialité" : "Privacy"}</Link>
          <Link to="/about" hash="ownership" className="text-lake hover:underline">{fr ? "Propriété et financement" : "Ownership and funding"}</Link>
        </p>
      </section>
    </PageShell>
  );
}
