import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, Stamp as StampIcon } from "lucide-react";
import { ACTIVITY_ICON, ActivityCard, SafetyPromise, Stamp, YoungCrumbs, YoungShell, toneClass, useT } from "@/components/YoungLab";
import { SITE } from "@/lib/site";
import { seoHead, absUrl, publisherRef } from "@/lib/seo";
import { ACTIVITIES, GROUP, byGroup, type Group } from "@/lib/young-lab";
import { stampCount, useYoungProgress } from "@/lib/young-progress";
import { useHydrated } from "@/lib/labs-progress";

export const Route = createFileRoute("/labs/young/")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Young Lab: AI games for ages 8 to 17 — ${SITE.name}`, fr: `Jeune Labo : jeux sur l'IA pour les 8 à 17 ans — ${SITE.name}` },
      description: {
        en: "Nine free, bilingual games that teach how AI works, how to spot fakes and how to use AI fairly. No account, and nothing a young person types ever leaves the device.",
        fr: "Neuf jeux gratuits et bilingues pour comprendre l'IA, repérer les faux et l'utiliser avec équité. Pas de compte, et rien de ce qu'un jeune écrit ne quitte l'appareil.",
      },
      jsonLd: (locale, url) => [{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: locale === "fr" ? "Jeune Labo" : "Young Lab",
        url,
        isPartOf: { "@type": "CollectionPage", name: "AI Broadsheet Labs", url: absUrl("/labs", locale) },
        publisher: publisherRef,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        hasPart: ACTIVITIES.map(a => ({ "@type": "LearningResource", name: a.title[locale], url: absUrl(`/labs/young/${a.id}`, locale), learningResourceType: "Game", isAccessibleForFree: true })),
      }],
    }),
  component: YoungHome,
});

/** Chunky shapes for the hero. Decorative only. */
function HeroArt() {
  return (
    <svg viewBox="0 0 320 280" className="w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[420px] h-auto" aria-hidden="true">
      <g stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round">
        <circle className="yl-shape yl-shape-1" cx="118" cy="120" r="82" fill="var(--yl-sky)" />
        <rect className="yl-shape yl-shape-2" x="176" y="40" width="104" height="104" rx="22" fill="var(--yl-coral)" transform="rotate(10 228 92)" />
        <polygon className="yl-shape yl-shape-3" points="200,262 300,262 250,170" fill="var(--yl-mint)" />
        <rect className="yl-shape yl-shape-4" x="34" y="196" width="128" height="56" rx="28" fill="var(--yl-grape)" />
      </g>
      {/* little lab sparks */}
      <g stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" className="yl-shape yl-shape-5">
        <path d="M118 84 v72 M82 120 h72" />
        <path d="M228 74 l14 14 M242 74 l-14 14" transform="rotate(10 235 81)" />
      </g>
      <g fill="var(--ink)" className="yl-shape yl-shape-6">
        <circle cx="70" cy="224" r="7" /><circle cx="98" cy="224" r="7" /><circle cx="126" cy="224" r="7" />
      </g>
    </svg>
  );
}

function YoungHome() {
  const { pick, t } = useT();
  const hydrated = useHydrated();
  const { state } = useYoungProgress();
  const n = hydrated ? stampCount(state) : 0;

  const door = (g: Group, tone: "sky" | "coral") => (
    <Link to={g === "explorers" ? "/labs/young/explorers" : "/labs/young/makers"} className={`yl-card yl-lift group block p-5 sm:p-6 ${toneClass(tone)}`}>
      <span className="flex items-baseline justify-between gap-3 flex-wrap">
        <span className="yl-title text-[2rem] sm:text-[2.4rem] leading-none">{pick(GROUP[g].title)}</span>
        <span className="rounded-full bg-white border-[3px] border-ink px-3 py-0.5 font-extrabold">{pick(GROUP[g].ages)}</span>
      </span>
      <span className="block mt-3 text-[1.05rem] leading-relaxed">{pick(GROUP[g].dek)}</span>
      <span className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
        {byGroup(g).map(a => { const I = ACTIVITY_ICON[a.id]; return <span key={a.id} className="grid place-items-center h-11 w-11 rounded-[12px] bg-white border-[3px] border-ink"><I className="h-5 w-5" /></span>; })}
      </span>
      <span className="mt-4 inline-flex items-center gap-2 font-extrabold text-[1.1rem] group-hover:underline underline-offset-4">
        {g === "explorers" ? t("Start exploring", "Commencer l'exploration") : t("Start making", "Commencer à créer")} <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </span>
    </Link>
  );

  return (
    <YoungShell>
      <section className="yl-tone-sun border-b-[3px] border-ink overflow-hidden">
        <div className="container-mw pt-6 pb-10 sm:pt-8 sm:pb-14">
          <YoungCrumbs />
          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="yl-in inline-flex items-center gap-2 rounded-full bg-white border-[3px] border-ink px-3 py-1 font-extrabold">
                {t("Young Lab · ages 8 to 17", "Jeune Labo · 8 à 17 ans")}
              </p>
              <h1 className="yl-title yl-in text-[2.7rem] sm:text-[4rem] lg:text-[4.6rem] leading-[0.98] mt-4 max-w-[13ch]">
                {t("How does AI work? Play and find out.", "Comment marche l'IA? Joue et découvre-le.")}
              </h1>
              <p className="yl-in mt-4 text-[1.15rem] sm:text-[1.3rem] leading-relaxed max-w-[38rem]">
                {t("Sort, teach, spot, cook up prompts and build a bot. Every game runs right here on your device: no account, no chat with an AI, and nothing you type is sent anywhere.", "Trie, entraîne, repère, cuisine des requêtes et bâtis un robot. Chaque jeu fonctionne ici, sur ton appareil : pas de compte, pas de clavardage avec une IA, et rien de ce que tu écris n'est envoyé.")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/labs/young/explorers" className="yl-btn yl-btn--big yl-tone-sky">{t("I'm 8 to 12", "J'ai 8 à 12 ans")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
                <Link to="/labs/young/makers" className="yl-btn yl-btn--big yl-tone-coral">{t("I'm 13 to 17", "J'ai 13 à 17 ans")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
                <Link to="/labs/young/grown-ups" className="yl-btn yl-btn--big"><HeartHandshake className="h-5 w-5" aria-hidden="true" />{t("I'm a grown-up", "Je suis un adulte")}</Link>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroArt />
            </div>
          </div>
        </div>
      </section>

      <div className="container-mw py-10 sm:py-14 grid gap-12 sm:gap-16">
        <section aria-labelledby="doors" className="grid gap-5">
          <h2 id="doors" className="sr-only">{t("Pick your wing", "Choisis ton aile")}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {door("explorers", "sky")}
            {door("makers", "coral")}
          </div>
        </section>

        <section aria-labelledby="passport-strip" className="yl-card bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="passport-strip" className="yl-title text-[1.7rem] sm:text-[2rem] leading-tight">{t("Your lab passport", "Ton passeport du labo")}</h2>
              <p className="mt-1 text-[1.05rem]">{n === 0 ? t("Finish a game to earn its stamp. Collect all nine!", "Termine un jeu pour obtenir son tampon. Collectionne les neuf!") : t(`${n} of ${ACTIVITIES.length} stamps so far. Nice work!`, `${n} tampons sur ${ACTIVITIES.length} jusqu'ici. Beau travail!`)}</p>
            </div>
            <Link to="/labs/young/passport" className="yl-btn yl-tone-sun"><StampIcon className="h-5 w-5" aria-hidden="true" />{t("Open my passport", "Ouvrir mon passeport")}</Link>
          </div>
          <ul className="mt-5 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 justify-items-center">
            {ACTIVITIES.map(a => (
              <li key={a.id}>
                <Link to="/labs/young/$activity" params={{ activity: a.id }} className="block rounded-full" aria-label={pick(a.title)}>
                  <Stamp activity={a} earned={hydrated && !!state.stamps[a.id]} size={88} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="all-games">
          <h2 id="all-games" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("All nine games", "Les neuf jeux")}</h2>
          <p className="mt-1 text-[1.05rem]">{t("Explorers can try Makers games, and Makers can play the Explorers ones. Go where you're curious.", "Les Explorateurs peuvent essayer les jeux des Créateurs, et vice versa. Suis ta curiosité.")}</p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVITIES.map(a => <li key={a.id} className="flex"><ActivityCard a={a} /></li>)}
          </ul>
        </section>

        <section aria-labelledby="promise">
          <h2 id="promise" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("Our promise", "Notre promesse")}</h2>
          <p className="mt-1 text-[1.05rem] max-w-[46rem]">{t("Young Lab was built to be calm and safe. Learning about AI shouldn't cost you your privacy.", "Le Jeune Labo est conçu pour être calme et sûr. Apprendre l'IA ne devrait pas coûter ta vie privée.")}</p>
          <div className="mt-5"><SafetyPromise /></div>
        </section>

        <section aria-labelledby="grownups" className="yl-card yl-tone-mint p-5 sm:p-7 grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 id="grownups" className="yl-title text-[1.7rem] sm:text-[2rem] leading-tight">{t("For parents and teachers", "Pour les parents et les enseignants")}</h2>
            <p className="mt-2 text-[1.05rem] leading-relaxed max-w-[44rem]">{t("What each game teaches, learning objectives, conversation starters, safety notes and printable activity sheets for unplugged lessons.", "Ce que chaque jeu enseigne, des objectifs d'apprentissage, des pistes de discussion, des notes de sécurité et des fiches à imprimer pour des leçons sans écran.")}</p>
          </div>
          <Link to="/labs/young/grown-ups" className="yl-btn yl-btn--big yl-btn--ink">{t("Grown-ups' guide", "Guide des adultes")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
        </section>
      </div>
    </YoungShell>
  );
}
