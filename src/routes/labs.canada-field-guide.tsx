import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Gamepad2, Lock, MonitorPlay, RotateCcw, Stamp, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef, ORIGIN } from "@/lib/seo";
import { BOOKS } from "@/lib/books";
import { BookShelf } from "@/components/BookShelf";
import { CARDS, FIELD_GUIDE as G, WINGS, rankFor, type Card, type WingId } from "@/lib/canada-field-guide";

export const Route = createFileRoute("/labs/canada-field-guide")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `${G.title.en}: a playable lesson made with AI — ${SITE.name} Labs`, fr: `${G.title.fr} : une leçon jouable créée avec l'IA — ${SITE.name} Labs` },
      description: G.dek,
      image: `${ORIGIN}${G.share}`,
      imageAlt: { en: "AI-generated image: a canvas tent and campfires in a snowy forest at night.", fr: "Image générée par IA : une tente en toile et des feux de camp dans une forêt enneigée, la nuit." },
      breadcrumbs: [
        { name: { en: "Labs", fr: "Labs" }, path: "/labs" },
        { name: G.title, path: `/labs/${G.slug}` },
      ],
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: G.title[locale],
        description: G.dek[locale],
        url,
        image: `${ORIGIN}${G.share}`,
        publisher: publisherRef,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        learningResourceType: ["Game", "Quiz", "Video"],
        educationalLevel: locale === "fr" ? "9 ans et plus" : "Ages 9 and up",
        isAccessibleForFree: true,
        about: ["Indigenous innovations in Canada", "Canadian inventions", "Dinosaurs of Alberta", "Generative AI in education", "World models"],
        hasPart: CARDS.map(c => ({ "@type": "Quiz", name: c.title[locale], url: `${absUrl(`/labs/${G.slug}`, locale)}#card-${c.id}` })),
        video: { "@type": "VideoObject", name: G.title[locale], contentUrl: G.video[locale], thumbnailUrl: G.poster, uploadDate: G.recorded, description: G.dek[locale] },
      }],
    }),
  component: FieldGuidePage,
});

/* ------------------------------------------------------------------ */
/* Stamps, kept on this device only                                    */
/* ------------------------------------------------------------------ */
const KEY = "aib-canada-field-guide-stamps";
function useStamps() {
  const [stamps, setStamps] = useState<string[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setStamps(JSON.parse(raw)); } catch { /* storage unavailable */ }
  }, []);
  const save = (next: string[]) => {
    setStamps(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  return {
    stamps,
    add: (id: string) => { if (!stamps.includes(id)) save([...stamps, id]); },
    reset: () => save([]),
  };
}

function FieldGuidePage() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const book = BOOKS[0];

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-night text-white">
        <div className="container-mw pt-8 pb-12 sm:pt-12 sm:pb-16">
          <p className="text-[0.9rem]">
            <Link to="/labs" className="text-white/70 hover:text-white">Labs</Link>
            <span className="text-white/40"> / </span>
            <span className="text-white/90">{pick(G.title)}</span>
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="bg-signal text-signal-ink font-bold text-[0.75rem] tracking-[0.12em] px-2.5 py-1 rounded-[3px]">{fr ? "GÉNÉRÉ PAR IA" : "AI-GENERATED"}</span>
            <span className="border border-brass text-brass text-[0.85rem] font-semibold px-3 py-1 rounded-full">{fr ? "Leçon jouable" : "Playable lesson"}</span>
            <span className="border border-white/25 text-[0.85rem] px-3 py-1 rounded-full">{fr ? "9 ans et plus" : "Ages 9 and up"}</span>
            <span className="border border-white/25 text-[0.85rem] px-3 py-1 rounded-full">{fr ? "Gratuit · bilingue" : "Free · bilingual"}</span>
          </div>
          <h1 className="masthead-serif text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem] leading-[1] mt-4 max-w-[18ch]">{pick(G.title)}</h1>
          <p className="font-serif text-[1.15rem] sm:text-[1.3rem] leading-relaxed text-white/80 mt-5 max-w-[46rem]">{pick(G.dek)}</p>

          <figure className="mt-9">
            <div className="relative overflow-hidden rounded-[8px] bg-black aspect-video">
              <video key={locale} src={pick(G.video)} poster={G.poster} controls preload="metadata" playsInline className="h-full w-full object-cover" />
            </div>
            <figcaption className="mt-3 text-[0.9rem] leading-relaxed text-white/70 max-w-[52rem]">
              {fr
                ? "Enregistré dans Project Genie, le modèle de monde de Google DeepMind, le 23 novembre 2026 : d'abord l'interface du jeu, puis la visite automatique, où chacun des neuf mondes tourne sur 360° avant un court voyage : on monte dans le canot et on pagaie sur le lac, on suit l'Albertosaurus et le Borealopelta à bonne distance. Chaque image est générée par le modèle; la vidéo est muette et se termine par nos sources et notre note sur le droit d'auteur. Aucune personne réelle n'apparaît."
                : "Recorded in Project Genie, Google DeepMind's world model, on 23 November 2026: first the game's interface, then the Auto Tour, where each of the nine worlds turns a full 360° and then sets off on a short journey: into the canoe and across the lake, tracking the Albertosaurus and the Borealopelta from a safe distance. Every frame was generated by the model; the video has no sound and ends with our sources and copyright note. No real person appears."}
            </figcaption>
          </figure>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#play" className="inline-flex items-center gap-2 rounded-[5px] bg-signal text-signal-ink font-bold px-5 py-3">
              <Gamepad2 className="h-5 w-5" aria-hidden="true" />{fr ? "Jouer ici, gratuitement" : "Play here, free"}
            </a>
            <a href={G.genieUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-[5px] border border-white/40 font-semibold px-5 py-3 hover:border-white">
              <MonitorPlay className="h-5 w-5" aria-hidden="true" />{fr ? "Ouvrir le monde 3D dans Project Genie" : "Open the 3D world in Project Genie"}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only">{fr ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Two ways to play */}
      <section className="container-mw mt-12 sm:mt-16" aria-labelledby="ways-title">
        <SectionHead id="ways-title" kicker={fr ? "Avant de commencer" : "Before you start"} title={fr ? "Deux façons de jouer" : "Two ways to play"} />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="border-2 border-lake rounded-[8px] p-5 sm:p-6">
            <p className="kicker">{fr ? "Sur cette page · pour tout le monde" : "On this page · for everyone"}</p>
            <h3 className="hl text-[1.35rem] mt-1">{fr ? "Le passeport de terrain" : "The field passport"}</h3>
            <p className="mt-2 text-[1rem] leading-relaxed">{fr ? "Les neuf cartes, leurs faits vérifiés et un quiz de trois questions chacune. Réussissez un quiz pour obtenir le tampon. Aucun compte : vos tampons restent sur cet appareil. Fonctionne sur téléphone, tablette et ordinateur." : "All nine cards, their checked facts and a three-question quiz for each. Pass a quiz to earn its stamp. No account: your stamps stay on this device. Works on phones, tablets and computers."}</p>
          </div>
          <div className="border-2 border-signal rounded-[8px] p-5 sm:p-6">
            <p className="kicker !text-brass-ink">{fr ? "Sur Project Genie · avec un forfait Google" : "On Project Genie · with a Google plan"}</p>
            <h3 className="hl text-[1.35rem] mt-1">{fr ? "Le monde 3D complet" : "The full 3D world"}</h3>
            <p className="mt-2 text-[1rem] leading-relaxed">{fr ? "Marchez dans chaque scène, écoutez le guide audio et jouez la mission de camp d'hiver. Google demande d'être connecté avec un forfait Google AI qui donne accès à Project Genie (Google indique le forfait Ultra). Le monde ne peut pas être intégré ici : la connexion Google ne fonctionne pas à l'intérieur d'un autre site." : "Walk into each scene, hear the audio guide and play the winter camp mission. Google requires you to sign in with a Google AI plan that includes Project Genie (Google points to its Ultra plan). The world cannot be embedded here: Google sign-in does not work inside another website."}</p>
          </div>
        </div>
      </section>

      {/* The free, playable version */}
      <section id="play" className="container-mw mt-14 sm:mt-20 scroll-mt-20" aria-labelledby="play-title">
        <SectionHead id="play-title" kicker={fr ? "Jouer" : "Play"} title={fr ? "Votre passeport de terrain" : "Your field passport"} />
        <Passport />
      </section>

      {/* Inside the Genie version */}
      <section className="container-mw mt-14 sm:mt-20" aria-labelledby="inside-title">
        <SectionHead id="inside-title" kicker={fr ? "Dans le monde 3D" : "Inside the 3D world"} title={fr ? "Ce que fait la version Genie" : "What the Genie version does"} />
        <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
          <ul className="lg:col-span-7 grid gap-3">
            {INSIDE.map((x, i) => (
              <li key={i} className="flex gap-4 bg-ice rounded-[8px] p-4">
                <span aria-hidden="true" className="masthead-serif text-[1.8rem] leading-none text-brass-ink w-6">{i + 1}</span>
                <span className="text-[1.02rem] leading-relaxed"><strong>{pick(x.k)}</strong> {pick(x.v)}</span>
              </li>
            ))}
          </ul>
          <figure className="lg:col-span-5">
            <img src="/labs/canada-field-guide/snowshoes.jpg" alt={fr ? "Image générée par IA : la mission de camp d'hiver, une tente et des feux dans la neige la nuit." : "AI-generated image: the winter camp mission, a tent and fires in the snow at night."} loading="lazy" className="w-full aspect-video object-cover rounded-[8px]" />
            <figcaption className="meta mt-2">{fr ? "Mission « Une nuit sur la piste » : six étapes, une jauge de chaleur et un écusson à la fin." : "\"Night on the Snow Trail\": six steps, a warmth meter and a badge at the end."}</figcaption>
          </figure>
        </div>
      </section>

      {/* How it was made */}
      <section id="how" className="container-mw mt-14 sm:mt-20 scroll-mt-20" aria-labelledby="how-title">
        <SectionHead id="how-title" kicker={fr ? "L'IA en éducation, un exemple concret" : "AI in education, a worked example"} title={fr ? "Comment nous l'avons fait, étape par étape" : "How we made it, step by step"} />
        <ol className="mt-4">
          {MADE.map((m, i) => (
            <li key={i} className="grid gap-3 md:grid-cols-12 py-6 border-b border-line">
              <span aria-hidden="true" className="md:col-span-1 masthead-serif text-[2.4rem] leading-[0.85] tabular-nums text-brass-ink">{i + 1}</span>
              <div className="md:col-span-11 max-w-[46rem]">
                <h3 className="hl text-[1.3rem]">{pick(m.title)}</h3>
                <p className="mt-1.5 text-[1rem] leading-relaxed text-muted-ink">{pick(m.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Real vs generated */}
      <section id="check" className="container-mw mt-14 sm:mt-20 scroll-mt-20" aria-labelledby="check-title">
        <SectionHead id="check-title" kicker={fr ? "Vérifié" : "Checked"} title={fr ? "Ce que l'IA a mal fait" : "What the AI got wrong"} />
        <p className="dek mt-1 max-w-3xl">{fr ? "Un modèle de monde produit ce qui a l'air vrai. Nous avons noté chaque écart entre ce que nous avions demandé et ce qu'il a montré." : "A world model makes things that look right. We logged every gap between what we asked for and what it showed."}</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {WRONG.map((w, i) => (
            <li key={i} className="border-2 border-signal rounded-[8px] p-5">
              <p className="hl text-[1.1rem]">{pick(w.k)}</p>
              <p className="mt-1.5 text-[0.98rem] leading-relaxed text-muted-ink">{pick(w.v)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 bg-ice rounded-[8px] p-5 text-[1rem] leading-relaxed max-w-4xl">
          <strong>{fr ? "Contenu autochtone. " : "Indigenous content. "}</strong>
          {fr
            ? "Les trois cartes autochtones s'appuient sur L'Encyclopédie canadienne et présentent ces savoirs comme des traditions vivantes. Nous voulons les faire relire par des éducatrices et éducateurs algonquins anishinaabeg et haudenosaunee. Une correction ou une suggestion? Écrivez à la rédaction."
            : "The three Indigenous cards draw on The Canadian Encyclopedia and present these as living traditions. We want them reviewed by Algonquin Anishinaabe and Haudenosaunee educators. A correction or a suggestion? Write to the newsroom."}
          {" "}<Link to="/corrections" className="text-lake font-semibold hover:underline">{fr ? "Signaler une erreur" : "Report a problem"}</Link>
        </p>
      </section>

      {/* Classroom */}
      <section id="class" className="container-mw mt-14 sm:mt-20 scroll-mt-20" aria-labelledby="class-title">
        <div className="bg-signal text-signal-ink rounded-[10px] p-6 sm:p-9">
          <p className="text-[0.78rem] font-bold tracking-[0.12em]">{fr ? "EN CLASSE · 9 À 17 ANS" : "FOR THE CLASSROOM · AGES 9 TO 17"}</p>
          <h2 id="class-title" className="masthead-serif text-[1.8rem] sm:text-[2.1rem] mt-2">{fr ? "Trois activités de 15 minutes" : "Three 15-minute activities"}</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-3 list-decimal pl-5 text-[1.02rem] leading-relaxed">
            <li><strong>{fr ? "Le passeport. " : "The passport. "}</strong>{fr ? "En équipes de deux, gagnez les neuf tampons. Chaque bonne réponse doit être justifiée à voix haute avec un fait de la carte." : "In pairs, earn all nine stamps. Each right answer has to be justified out loud with a fact from the card."}</li>
            <li><strong>{fr ? "Repérez l'invention. " : "Spot the invention. "}</strong>{fr ? "Regardez la vidéo. Notez trois choses que l'IA a inventées (indice : regardez les mains et le guidon). Comparez avec notre liste." : "Watch the video. Write down three things the AI invented (hint: look at the handlebars). Compare with our list."}</li>
            <li><strong>{fr ? "Votre carte. " : "Your own card. "}</strong>{fr ? "Choisissez une invention ou un lieu de votre région. Écrivez trois faits avec une source pour chacun, puis trois questions de quiz." : "Pick an invention or a place from your region. Write three facts, each with a source, then three quiz questions."}</li>
          </ol>
          <p className="mt-5"><Link to="/labs/young/classroom" className="font-bold underline underline-offset-4">{fr ? "Mode classe du Jeune Labo" : "Young Lab classroom mode"}</Link></p>
        </div>
      </section>

      {/* Book: from the editor's shelf */}
      {book && (
        <section className="container-mw mt-14 sm:mt-20" aria-labelledby="book-title">
          <SectionHead id="book-title" kicker={fr ? "À lire avec ce labo" : "Read alongside this lab"} title={fr ? "De l'étagère de l'éditeur" : "From the editor's shelf"} />
          <BookShelf />
        </section>
      )}

      {/* Sources and disclosure */}
      <section id="sources" className="container-mw mt-14 sm:mt-16 scroll-mt-20" aria-labelledby="sources-title">
        <SectionHead id="sources-title" title="Sources" />
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {CARDS.flatMap(c => c.sources.map(s => ({ ...s, card: c }))).map(s => (
            <li key={s.url} className="text-[0.95rem]">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lake hover:underline">
                {s.title}<ArrowUpRight className="inline h-3.5 w-3.5 ml-0.5 -mt-0.5" aria-hidden="true" /><span className="sr-only">{fr ? " (nouvel onglet)" : " (opens in a new tab)"}</span>
              </a>
              <span className="text-muted-ink"> · {pick(s.card.title)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-[8px] border-2 border-night p-5 sm:p-6 max-w-4xl">
          <h3 className="hl text-[1.2rem]">{fr ? "Droit d'auteur" : "Copyright"}</h3>
          <ul className="mt-3 grid gap-2 text-[0.98rem] leading-relaxed">
            {(fr ? [
              "Les faits viennent de sources publiques nommées sur chaque carte. Ils sont reformulés dans nos propres mots : aucun passage n'est copié.",
              "Aucune photo, œuvre, logo ni personnage protégé n'a été utilisé, téléversé ou imité pour créer les mondes.",
              "Les images et la vidéo ont été générées par Project Genie (Google DeepMind), selon les conditions d'utilisation de Google. Nous ne revendiquons aucun droit sur ce que le modèle a généré.",
              "Aucun visage ni aucune ressemblance d'une personne réelle n'apparaît.",
              "Textes, quiz et design de cette page © 2026 AI Broadsheet · GEN:A Labs.",
            ] : [
              "The facts come from public sources named on every card. They are rewritten in our own words: no passage is copied.",
              "No copyrighted photographs, artwork, logos or characters were used, uploaded or imitated to make the worlds.",
              "The images and video were generated by Project Genie (Google DeepMind), under Google's terms of service. We claim no rights in what the model generated.",
              "No real person's face or likeness appears.",
              "Text, quizzes and design on this page © 2026 AI Broadsheet · GEN:A Labs.",
            ]).map(x => (
              <li key={x} className="flex gap-2.5"><Check className="h-4 w-4 mt-1.5 shrink-0 text-brass-ink" aria-hidden="true" /><span>{x}</span></li>
            ))}
          </ul>
        </div>
        <p className="meta mt-5 max-w-3xl">
          {fr
            ? "Utilisation de l'IA : les images, la vidéo et l'interface du monde Genie sont générées par IA et identifiées comme telles. Les faits, les quiz et le texte de cette page ont été rédigés et vérifiés par la rédaction. Project Genie est un produit de Google; AI Broadsheet n'a aucun lien commercial avec Google."
            : "How we used AI: the images, the video and the Genie world's interface were generated by AI and are labelled as such. The facts, quizzes and text on this page were written and checked by the newsroom. Project Genie is a Google product; AI Broadsheet has no commercial relationship with Google."}
          {" "}<Link to="/how-we-use-ai" className="text-lake font-semibold hover:underline">{fr ? "Notre utilisation de l'IA" : "How we use AI"}</Link>
        </p>
        <p className="mt-8 flex flex-wrap gap-6">
          <Link to="/labs" className="inline-flex items-center gap-2 font-semibold text-lake hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{fr ? "Tous les labos" : "All of Labs"}</Link>
          <Link to="/labs/history" className="inline-flex items-center gap-2 font-semibold text-lake hover:underline">{fr ? "Série : l'histoire, reconstruite par l'IA" : "Series: History, rebuilt by AI"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </p>
      </section>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Passport: cards, quiz, stamps                                       */
/* ------------------------------------------------------------------ */
function Passport() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const { stamps, add, reset } = useStamps();
  const [wing, setWing] = useState<WingId | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const shown = CARDS.filter(c => wing === "all" || c.wing === wing);
  const rank = rankFor(stamps.length);
  const current = CARDS.find(c => c.id === open);

  return (
    <div className="mt-6">
      {/* Progress */}
      <div className="rounded-[10px] bg-night text-white p-5 sm:p-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-[0.85rem] font-semibold text-brass">{fr ? "Rang" : "Rank"}</p>
          <p className="masthead-serif text-[1.7rem] leading-tight" aria-live="polite">{pick(rank.name)}</p>
          <div className="mt-3 h-2.5 rounded-full bg-white/15 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={CARDS.length} aria-valuenow={stamps.length} aria-label={fr ? "Tampons obtenus" : "Stamps earned"}>
            <div className="h-full bg-signal transition-[width] duration-500" style={{ width: `${(stamps.length / CARDS.length) * 100}%` }} />
          </div>
          <p className="mt-2 text-[0.92rem] text-white/75">{fr ? `${stamps.length} tampon${stamps.length > 1 ? "s" : ""} sur ${CARDS.length}` : `${stamps.length} of ${CARDS.length} stamps`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {WINGS.map(w => {
            const n = CARDS.filter(c => c.wing === w.id).length;
            const got = CARDS.filter(c => c.wing === w.id && stamps.includes(c.id)).length;
            return (
              <span key={w.id} className={`rounded-full border px-3 py-1.5 text-[0.85rem] ${got === n ? "border-signal text-signal" : "border-white/25 text-white/80"}`}>
                {pick(w.title)} · {got}/{n}
              </span>
            );
          })}
        </div>
      </div>

      {stamps.length === CARDS.length && (
        <div className="mt-5 rounded-[10px] border-2 border-signal p-5 sm:p-6 flex flex-wrap items-center gap-4 justify-between">
          <p className="text-[1.05rem]"><strong className="masthead-serif text-[1.4rem] block">{fr ? "Passeport complet!" : "Passport complete!"}</strong>{fr ? "Vous avez les neuf tampons. Vous êtes une légende du terrain." : "You have all nine stamps. You are a Canada Field Legend."}</p>
          <button type="button" onClick={reset} className="press inline-flex items-center gap-2 rounded-[5px] border border-line px-4 py-2 font-semibold hover:border-ink"><RotateCcw className="h-4 w-4" aria-hidden="true" />{fr ? "Recommencer" : "Start over"}</button>
        </div>
      )}

      {/* Wing filter */}
      <div role="tablist" aria-label={fr ? "Filtrer par aile" : "Filter by wing"} className="mt-6 flex flex-wrap gap-2">
        {[{ id: "all" as const, title: { en: "All nine", fr: "Les neuf" } }, ...WINGS].map(w => (
          <button key={w.id} type="button" role="tab" aria-selected={wing === w.id} onClick={() => setWing(w.id)}
            className={`press min-h-[44px] rounded-full border px-4 text-[0.95rem] font-semibold transition-colors ${wing === w.id ? "bg-ink text-white border-ink" : "bg-surface border-line hover:border-ink"}`}>
            {pick(w.title)}
          </button>
        ))}
      </div>
      {wing !== "all" && <p className="dek mt-3">{pick(WINGS.find(w => w.id === wing)!.dek)}</p>}

      {/* Cards */}
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(c => {
          const got = stamps.includes(c.id);
          return (
            <li key={c.id} id={`card-${c.id}`} className="scroll-mt-24">
              <button type="button" onClick={() => setOpen(c.id)} aria-haspopup="dialog"
                className={`group w-full text-left rounded-[10px] overflow-hidden border-2 transition-colors ${got ? "border-signal" : "border-line hover:border-ink"}`}>
                <span className="relative block aspect-video bg-night">
                  <img src={c.img} alt={pick(c.alt)} loading="lazy" className={`h-full w-full object-cover transition duration-500 ${got ? "" : "saturate-[0.35] group-hover:saturate-100"}`} />
                  <span className="absolute left-2 top-2 bg-night/85 text-white text-[0.72rem] font-semibold px-2 py-0.5 rounded-[3px]">{fr ? "Généré par IA" : "AI-generated"}</span>
                  {got && (
                    <span className="absolute right-3 bottom-3 grid place-items-center h-16 w-16 rounded-full border-[3px] border-signal bg-night/80 text-signal rotate-[-12deg] shadow-lg" aria-label={fr ? "Tampon obtenu" : "Stamp earned"}>
                      <Stamp className="h-7 w-7" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="block p-4">
                  <span className="block text-[0.78rem] font-bold tracking-[0.08em] text-brass-ink">#{String(c.n).padStart(3, "0")} · {pick(WINGS.find(w => w.id === c.wing)!.title).toUpperCase()}</span>
                  <span className="block hl text-[1.3rem] mt-1">{pick(c.title)}</span>
                  <span className="block text-[0.92rem] text-muted-ink mt-0.5">{pick(c.place)}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[0.92rem] font-semibold text-lake">
                    {got ? <><Check className="h-4 w-4" aria-hidden="true" />{fr ? "Tampon obtenu · revoir" : "Stamped · review"}</> : <><Lock className="h-4 w-4" aria-hidden="true" />{fr ? "Lire et passer le quiz" : "Read and take the quiz"}</>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {stamps.length > 0 && stamps.length < CARDS.length && (
        <p className="mt-5"><button type="button" onClick={reset} className="text-[0.9rem] text-muted-ink underline underline-offset-4 hover:text-ink">{fr ? "Effacer mes tampons" : "Clear my stamps"}</button></p>
      )}

      {current && <CardDialog card={current} stamped={stamps.includes(current.id)} onClose={() => setOpen(null)} onPass={() => add(current.id)} />}
    </div>
  );
}

function shuffle<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

function CardDialog({ card, stamped, onClose, onPass }: { card: Card; stamped: boolean; onClose: () => void; onPass: () => void }) {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const [step, setStep] = useState<"read" | "quiz" | "done">("read");
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  // Option order is shuffled for every question and every attempt.
  const order = useMemo(() => card.quiz.map(q => shuffle(q.options.map((_, i) => i))), [card, round]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const q = card.quiz[qi];
  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore(s => s + 1);
  };
  const next = () => {
    if (qi < card.quiz.length - 1) { setQi(qi + 1); setPicked(null); return; }
    setStep("done");
    if (score === card.quiz.length) onPass();
  };
  const retry = () => { setQi(0); setPicked(null); setScore(0); setRound(r => r + 1); setStep("quiz"); };
  const passed = step === "done" && score === card.quiz.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-night/80 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="card-dialog-title" onClick={e => e.stopPropagation()}
        className="bg-surface w-full sm:max-w-[46rem] max-h-[92vh] overflow-y-auto rounded-t-[14px] sm:rounded-[14px] shadow-2xl">
        <div className="relative">
          <img src={card.img} alt={pick(card.alt)} className="w-full aspect-[16/7] object-cover" />
          <span className="absolute left-3 top-3 bg-night/85 text-white text-[0.75rem] font-semibold px-2 py-0.5 rounded-[3px]">{fr ? "Image générée par IA" : "AI-generated image"}</span>
          <button type="button" onClick={onClose} className="absolute right-3 top-3 grid place-items-center h-10 w-10 rounded-full bg-night/85 text-white hover:bg-night" aria-label={fr ? "Fermer" : "Close"}><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <div className="p-5 sm:p-7">
          <p className="text-[0.78rem] font-bold tracking-[0.08em] text-brass-ink">#{String(card.n).padStart(3, "0")} · {pick(card.place).toUpperCase()}</p>
          <h3 id="card-dialog-title" className="masthead-serif text-[1.9rem] leading-tight mt-1">{pick(card.title)}</h3>

          {step === "read" && (
            <>
              <ul className="mt-4 grid gap-3">
                {card.facts.map((f, i) => (
                  <li key={i} className="flex gap-3 text-[1.02rem] leading-relaxed">
                    <span aria-hidden="true" className="masthead-serif text-[1.4rem] leading-none text-brass-ink w-5 shrink-0">{i + 1}</span>
                    <span>{pick(f)}</span>
                  </li>
                ))}
              </ul>
              <p className="meta mt-4">{fr ? "Sources : " : "Sources: "}{card.sources.map((s, i) => (
                <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noopener noreferrer" className="text-lake hover:underline">{s.title}</a></span>
              ))}</p>
              <button type="button" onClick={() => setStep("quiz")} className="press mt-6 inline-flex items-center gap-2 rounded-[5px] bg-signal text-signal-ink font-bold px-5 py-3">
                {stamped ? (fr ? "Refaire le quiz" : "Take the quiz again") : (fr ? "Passer le quiz : 3 questions" : "Take the quiz: 3 questions")}<ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}

          {step === "quiz" && (
            <div className="mt-4">
              <p className="text-[0.85rem] font-semibold text-muted-ink">{fr ? `Question ${qi + 1} sur ${card.quiz.length}` : `Question ${qi + 1} of ${card.quiz.length}`}</p>
              <p className="hl text-[1.25rem] mt-1">{pick(q.q)}</p>
              <div className="mt-4 grid gap-2.5" role="group" aria-label={pick(q.q)}>
                {order[qi].map(i => {
                  const isRight = i === q.answer;
                  const state = picked === null ? "idle" : isRight ? "right" : picked === i ? "wrong" : "dim";
                  return (
                    <button key={i} type="button" onClick={() => answer(i)} disabled={picked !== null}
                      className={`press min-h-[48px] text-left rounded-[8px] border-2 px-4 py-2.5 text-[1rem] font-semibold transition-colors ${
                        state === "right" ? "border-green-700 bg-green-50 text-green-900" :
                        state === "wrong" ? "border-red-700 bg-red-50 text-red-900" :
                        state === "dim" ? "border-line opacity-60" : "border-line hover:border-ink"}`}>
                      {pick(q.options[i])}
                      {state === "right" && <Check className="inline h-4 w-4 ml-2" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <div className="mt-4" aria-live="polite">
                  <p className="text-[1rem] leading-relaxed"><strong>{picked === q.answer ? (fr ? "Exact. " : "Right. ") : (fr ? "Pas tout à fait. " : "Not quite. ")}</strong>{pick(q.why)}</p>
                  <button type="button" onClick={next} className="press mt-4 inline-flex items-center gap-2 rounded-[5px] bg-ink text-white font-bold px-5 py-2.5">
                    {qi < card.quiz.length - 1 ? (fr ? "Question suivante" : "Next question") : (fr ? "Voir le résultat" : "See the result")}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="mt-5 text-center" aria-live="polite">
              {passed ? (
                <>
                  <span className="mx-auto grid place-items-center h-24 w-24 rounded-full border-4 border-signal text-brass-ink rotate-[-12deg]">
                    <Stamp className="h-10 w-10" aria-hidden="true" />
                  </span>
                  <p className="masthead-serif text-[1.7rem] mt-4">{fr ? "Tampon obtenu!" : "Stamp earned!"}</p>
                  <p className="text-[1rem] text-muted-ink mt-1">{fr ? `3 sur 3. ${pick(card.title)} est dans votre passeport.` : `3 out of 3. ${pick(card.title)} is in your passport.`}</p>
                </>
              ) : (
                <>
                  <p className="masthead-serif text-[1.7rem]">{fr ? `${score} sur ${card.quiz.length}` : `${score} out of ${card.quiz.length}`}</p>
                  <p className="text-[1rem] text-muted-ink mt-1">{fr ? "Il faut 3 bonnes réponses pour le tampon. Relisez la carte et réessayez : l'ordre des réponses change." : "You need all 3 for the stamp. Read the card again and retry: the answers change order."}</p>
                </>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {!passed && <button type="button" onClick={() => setStep("read")} className="press rounded-[5px] border border-line px-4 py-2.5 font-semibold hover:border-ink">{fr ? "Relire la carte" : "Read the card"}</button>}
                {!passed && <button type="button" onClick={retry} className="press rounded-[5px] bg-signal text-signal-ink px-4 py-2.5 font-bold">{fr ? "Réessayer" : "Try again"}</button>}
                <button type="button" onClick={onClose} className="press rounded-[5px] bg-ink text-white px-4 py-2.5 font-bold">{fr ? "Retour au passeport" : "Back to the passport"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHead({ id, title, kicker }: { id: string; title: string; kicker?: string }) {
  return (
    <div className="relative pt-3 border-t-[3px] border-night">
      <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
      {kicker && <p className="kicker mt-1">{kicker}</p>}
      <h2 id={id} className="masthead-serif text-[1.75rem] sm:text-[2.05rem] mt-1">{title}</h2>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */
type KV = { k: { en: string; fr: string }; v: { en: string; fr: string } };

const INSIDE: KV[] = [
  { k: { en: "A map from orbit.", fr: "Une carte vue de l'orbite." }, v: { en: "Nine glowing beacons placed on the real geography, from the Ottawa River to Fort McMurray.", fr: "Neuf balises lumineuses placées sur la vraie géographie, de la rivière des Outaouais à Fort McMurray." } },
  { k: { en: "A world for each card.", fr: "Un monde pour chaque carte." }, v: { en: "Walk the shore of a Shield lake, a 1920s lab or the Red Deer River badlands with the keyboard.", fr: "Marchez au clavier sur la rive d'un lac du Bouclier, dans un labo des années 1920 ou dans les badlands de la rivière Red Deer." } },
  { k: { en: "A field audio guide and quiz.", fr: "Un guide audio et un quiz." }, v: { en: "The same checked facts as on this page, with shuffled answers and a stamp for a perfect score.", fr: "Les mêmes faits vérifiés que sur cette page, avec des réponses mélangées et un tampon pour un sans-faute." } },
  { k: { en: "A winter camp mission.", fr: "Une mission de camp d'hiver." }, v: { en: "Snowshoe to camp at night, light a flashlight, build a fire, pitch a tent, cook bannock and wait for dawn.", fr: "En raquettes jusqu'au camp la nuit : allumer une lampe, faire un feu, monter la tente, cuire de la bannique et attendre l'aube." } },
  { k: { en: "Ranks and a passport.", fr: "Des rangs et un passeport." }, v: { en: "From Rookie Explorer to Canada Field Legend, with a progress bar and a ring for each wing.", fr: "D'explorateur débutant à légende du terrain, avec une barre de progression et un anneau par aile." } },
];

const MADE: { title: { en: string; fr: string }; body: { en: string; fr: string } }[] = [
  { title: { en: "We started from Google's own example", fr: "Nous sommes partis de l'exemple de Google" }, body: { en: "Project Genie lets you copy (\"remix\") a published experience. We remixed Google's Dino Field Guide and kept its structure: worlds, an audio guide, a quiz and a collection.", fr: "Project Genie permet de copier (« remixer ») une expérience publiée. Nous avons remixé le Dino Field Guide de Google et gardé sa structure : des mondes, un guide audio, un quiz et une collection." } },
  { title: { en: "We checked the facts before writing a single prompt", fr: "Nous avons vérifié les faits avant d'écrire la moindre consigne" }, body: { en: "Nine cards, three facts each, every one traced to The Canadian Encyclopedia, a government page, UNESCO or a museum. The AI was told to use only those facts.", fr: "Neuf cartes, trois faits chacune, tous tirés de L'Encyclopédie canadienne, d'une page gouvernementale, de l'UNESCO ou d'un musée. L'IA avait pour consigne de n'utiliser que ces faits." } },
  { title: { en: "One long instruction, in plain English", fr: "Une seule longue consigne, en langage courant" }, body: { en: "We described the three wings, the nine scenes, the quiz and the rules (no real people's faces, Indigenous innovations shown as living traditions) in a single message to Genie's builder agent. It wrote the whole interface itself.", fr: "Nous avons décrit les trois ailes, les neuf scènes, le quiz et les règles (aucun visage de personne réelle, des innovations autochtones présentées comme des traditions vivantes) en un seul message à l'agent de Genie. Il a écrit toute l'interface lui-même." } },
  { title: { en: "We played it and sent bug reports", fr: "Nous y avons joué et signalé les bogues" }, body: { en: "The first build showed a black screen. Then the right answer was always the first option, the map was a blob and the collection could not be opened. Each fix was one short message.", fr: "La première version affichait un écran noir. Ensuite, la bonne réponse était toujours la première, la carte n'était qu'une tache et la collection ne s'ouvrait pas. Chaque correction a pris un court message." } },
  { title: { en: "We pushed it to look real", fr: "Nous l'avons rendu photoréaliste" }, body: { en: "We asked for photorealistic art everywhere: a map from orbit, photo-style cards, metal-and-wax stamps. Then we added the night camp mission.", fr: "Nous avons demandé un style photoréaliste partout : une carte vue de l'orbite, des cartes au style photo, des tampons en métal et en cire. Puis nous avons ajouté la mission de camp de nuit." } },
  { title: { en: "The lesson we learned", fr: "La leçon que nous en avons tirée" }, body: { en: "Night would not stay night: mid-game instructions faded and the world drifted back to daylight. What worked was changing the scene's starting description. The first sentence a world model reads matters most.", fr: "La nuit ne tenait pas : les consignes données en cours de partie s'estompaient et le monde revenait au jour. Ce qui a fonctionné, c'est de changer la description de départ de la scène. La première phrase que lit un modèle de monde compte le plus." } },
];

const WRONG: KV[] = [
  { k: { en: "The canoe goes missing.", fr: "Le canot disparaît." }, v: { en: "The starting picture has a birchbark canoe, but once you move it stays just out of view. The card image here is the starting picture.", fr: "L'image de départ montre un canot d'écorce, mais dès qu'on bouge il reste hors champ. L'image de la carte ici est l'image de départ." } },
  { k: { en: "Snowshoes become a snowmobile.", fr: "Les raquettes deviennent une motoneige." }, v: { en: "We asked for a walk on snowshoes. The model drew snowmobile handlebars in front of the camera.", fr: "Nous avions demandé une marche en raquettes. Le modèle a dessiné un guidon de motoneige devant la caméra." } },
  { k: { en: "\"No people\" is a suggestion.", fr: "« Aucune personne » reste une suggestion." }, v: { en: "Near the end of the camp mission an invented camper walked in. He is not a real person; we cut him from the video.", fr: "Vers la fin de la mission, un campeur inventé est apparu. Ce n'est pas une personne réelle; nous l'avons retiré de la vidéo." } },
  { k: { en: "Space turns into science fiction.", fr: "L'espace vire à la science-fiction." }, v: { en: "The first Canadarm scene showed made-up spaceships over a grey, moon-like surface. The second try is closer, but the lettering on the arm is garbled.", fr: "La première scène du Canadarm montrait des vaisseaux inventés au-dessus d'un sol lunaire. Le deuxième essai est plus proche, mais l'inscription sur le bras est illisible." } },
];
