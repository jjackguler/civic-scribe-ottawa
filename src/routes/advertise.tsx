import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageShell, ZoneHead } from "@/components/PageShell";
import { AD_DIMENSIONS, type AdSize } from "@/lib/ads";
import { NEWS_SOURCES } from "@/lib/news-sources";
import { MEDIA_SOURCES } from "@/lib/media-sources";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/advertise")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Advertise with ${SITE.name}: media kit — ${SITE.name}`, fr: `Annoncer sur ${SITE.name} : trousse média — ${SITE.name}` },
      description: { en: `Reach the people building, buying and regulating AI. Display, desk and video sponsorships, interview series and newsletter placements on ${SITE.name}.`, fr: `Rejoignez ceux qui bâtissent, achètent et encadrent l'IA. Affichage, commandites de sections et de vidéos, séries d'entrevues et infolettre sur ${SITE.name}.` },
    }),
  component: Advertise,
});

const DISPLAY: { size: AdSize; where: Bi }[] = [
  { size: "billboard", where: { en: "Between front-page sections; the largest single placement.", fr: "Entre les sections de la une; le plus grand emplacement." } },
  { size: "leaderboard", where: { en: "Top of the front page, under the live ticker.", fr: "Haut de la une, sous le fil en direct." } },
  { size: "mpu", where: { en: "Beside the lead story, on every story page and in the Watch desk.", fr: "À côté de la nouvelle principale, sur chaque page d'article et dans les Vidéos." } },
  { size: "halfpage", where: { en: "Beside Featured interviews on the front page.", fr: "À côté des Entrevues à la une." } },
  { size: "mobile", where: { en: "Phone version of the billboard and leaderboard.", fr: "Version mobile du panneau et de la bannière." } },
];

const PACKAGES: { title: Bi; body: Bi }[] = [
  {
    title: { en: "Desk sponsorship", fr: "Commandite de section" },
    body: { en: "Own a topic desk for a month — “Infrastructure & chips, presented by your brand” — with every ad position on that desk.", fr: "Associez votre marque à une section pendant un mois — « Infrastructures et puces, présenté par votre marque » — avec tous les emplacements de la section." },
  },
  {
    title: { en: "Watch desk partner", fr: "Partenaire Vidéos" },
    body: { en: "Your brand alongside the day's AI video, on the front-page Watch band and the Watch page.", fr: "Votre marque aux côtés des vidéos IA du jour, dans le bandeau Vidéos de la une et la page Vidéos." },
  },
  {
    title: { en: "Interview series", fr: "Série d'entrevues" },
    body: { en: "Present the Featured interviews section. Your name on the series, never on the questions.", fr: "Présentez la section Entrevues. Votre nom sur la série, jamais sur les questions." },
  },
  {
    title: { en: "The Morning Broadsheet", fr: "Le Broadsheet du matin" },
    body: { en: "The single sponsor slot in our daily newsletter, set apart from the news and labelled.", fr: "L'unique espace commandité de notre infolettre quotidienne, séparé des nouvelles et identifié." },
  },
  {
    title: { en: "Sponsored briefing", fr: "Dossier commandité" },
    body: { en: "A clearly labelled explainer written with you — product launch, research release or event. At most one a day, never in the news feed.", fr: "Un dossier clairement identifié, rédigé avec vous — lancement, recherche ou événement. Au plus un par jour, jamais dans le fil de nouvelles." },
  },
  {
    title: { en: "Events and webinars", fr: "Événements et webinaires" },
    body: { en: "Media partnership for your conference or webinar: listings, display and newsletter mentions.", fr: "Partenariat média pour votre conférence ou webinaire : annonces, affichage et mentions dans l'infolettre." },
  },
];

const RULES: Bi[] = [
  { en: "Advertisers never choose, change or preview our coverage.", fr: "Les annonceurs ne choisissent, ne modifient ni ne voient jamais notre couverture à l'avance." },
  { en: "Every ad is labelled “Advertisement”. Sponsored content is labelled “Sponsored” and kept out of the news feed.", fr: "Chaque publicité porte la mention « Publicité ». Le contenu commandité porte la mention « Commandité » et reste hors du fil de nouvelles." },
  { en: "No ads that imitate news stories, make claims we can't check, or target children.", fr: "Aucune publicité qui imite une nouvelle, fait des affirmations invérifiables ou cible les enfants." },
];

function Advertise() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const unique = new Set([...NEWS_SOURCES.map(s => s.name), ...MEDIA_SOURCES.map(s => s.name)]).size;
  const feeds = `${Math.floor(unique / 10) * 10}+`;
  const mail = `mailto:${SITE.email.advertise}?subject=${encodeURIComponent(fr ? "Publicité sur AI Broadsheet" : "Advertising on AI Broadsheet")}`;

  return (
    <PageShell>
      <section className="bg-night text-white">
        <div className="container-mw py-14 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-end">
          <div>
            <p className="text-brass font-bold">{fr ? "Trousse média" : "Media kit"}</p>
            <h1 className="masthead-serif text-[2.6rem] sm:text-[3.6rem] leading-[1.03] mt-2">
              {fr ? "Rejoignez ceux qui bâtissent, achètent et encadrent l'IA." : "Reach the people building, buying and regulating AI."}
            </h1>
            <p className="font-serif text-white/75 text-[1.2rem] leading-relaxed mt-4 max-w-[56ch]">
              {fr
                ? `${SITE.name} est un journal de l'IA en direct, alimenté jour et nuit par ${feeds} salles de nouvelles, laboratoires, gouvernements, chaînes vidéo et balados — en anglais et en français.`
                : `${SITE.name} is a live AI newspaper, fed around the clock by ${feeds} newsrooms, labs, governments, video channels and podcasts — in English and French.`}
            </p>
          </div>
          {SITE.email.advertise && <a href={mail} className="justify-self-start lg:justify-self-end inline-flex items-center gap-2 bg-brass text-night font-bold px-6 py-3.5 rounded-[4px] hover:bg-white">
            <Mail className="h-5 w-5" aria-hidden="true" /> {fr ? "Demander les tarifs" : "Ask for rates"}
          </a>}
        </div>
      </section>

      <div className="container-mw mt-12 grid gap-12 lg:grid-cols-3">
        {[
          { h: { en: "Brand-safe by design", fr: "Sûr pour les marques" }, p: { en: "Every story comes from a named publisher and links to the original. We don't publish AI-invented news, so your brand never sits next to it.", fr: "Chaque nouvelle provient d'un éditeur nommé et renvoie à l'original. Nous ne publions aucune nouvelle inventée par l'IA : votre marque n'y est jamais associée." } },
          { h: { en: "News, video and audio", fr: "Texte, vidéo et audio" }, p: { en: "Breaking AI stories, broadcast video, long-form interviews and podcasts in one place — more reasons to come back during the day.", fr: "Nouvelles, vidéos, entrevues et balados au même endroit — plus de raisons de revenir dans la journée." } },
          { h: { en: "Canada and the world", fr: "Le Canada et le monde" }, p: { en: "Global coverage with a dedicated Canadian desk and AI Ministry tracker, in English and French.", fr: "Une couverture mondiale, avec une section canadienne et un suivi du ministère de l'IA, en anglais et en français." } },
        ].map(x => (
          <div key={x.h.en}>
            <h2 className="masthead-serif text-[1.6rem] leading-tight">{pick(x.h)}</h2>
            <p className="font-serif text-[1.08rem] leading-relaxed text-muted-ink mt-2">{pick(x.p)}</p>
          </div>
        ))}
      </div>

      <section className="container-mw mt-14">
        <ZoneHead title={fr ? "Formats d'affichage" : "Display formats"} sub={fr ? "Normes IAB. Images JPG, PNG ou GIF; balises Google Ad Manager acceptées." : "IAB standard sizes. JPG, PNG or GIF creative; Google Ad Manager tags accepted."} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {DISPLAY.map(d => {
            const dim = AD_DIMENSIONS[d.size];
            const scale = Math.min(1, 260 / dim.w, 150 / dim.h);
            return (
              <div key={d.size} className="border border-line bg-surface p-5 flex flex-col">
                <div className="h-[160px] grid place-items-center bg-ice">
                  <div className="bg-night border-t-[3px] border-brass" style={{ width: dim.w * scale, height: dim.h * scale }} aria-hidden="true" />
                </div>
                <p className="font-bold mt-4">{dim.label}</p>
                <p className="text-[0.95rem] text-muted-ink mt-1">{pick(d.where)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-mw mt-14">
        <ZoneHead title={fr ? "Commandites" : "Sponsorships"} />
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {PACKAGES.map(p => (
            <div key={p.title.en} className="border-l-[3px] border-brass pl-5">
              <h3 className="font-bold text-[1.15rem]">{pick(p.title)}</h3>
              <p className="font-serif text-[1.05rem] leading-relaxed text-muted-ink mt-1">{pick(p.body)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-mw mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <ZoneHead title={fr ? "Notre audience" : "Our audience"} />
          <p className="font-serif text-[1.12rem] leading-relaxed">
            {fr
              ? "Nous sommes une jeune publication et nous ne publions pas de chiffres que nous ne pouvons pas prouver. Chaque proposition comprend nos statistiques réelles — visiteurs, pages vues, pays et appareils — tirées de nos outils d'analyse. Les partenaires fondateurs conservent leur tarif de lancement."
              : "We're a young publication, and we don't publish numbers we can't prove. Every proposal includes our real figures — visitors, page views, countries and devices — straight from our analytics. Founding partners keep their launch pricing."}
          </p>
        </div>
        <div>
          <ZoneHead title={fr ? "Nos règles" : "Our rules"} />
          <ul className="grid gap-3">
            {RULES.map(r => (
              <li key={r.en} className="flex gap-3 font-serif text-[1.08rem] leading-relaxed">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />{pick(r)}
              </li>
            ))}
          </ul>
          <p className="mt-4"><Link to="/standards" className="text-lake font-semibold hover:underline">{fr ? "Nos normes éditoriales" : "Our editorial standards"}</Link></p>
        </div>
      </section>

      <section className="container-mw mt-14">
        <div className="bg-night text-white p-8 md:p-12 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] items-center">
          <div>
            <h2 className="masthead-serif text-[2rem] leading-tight">{fr ? "Parlons de votre campagne" : "Let's plan your campaign"}</h2>
            <p className="font-serif text-white/75 text-[1.08rem] mt-2 max-w-[60ch]">
              {fr
                ? "Dites-nous votre marque, votre objectif, vos dates et votre budget. Nous répondons avec un plan, des emplacements et des tarifs."
                : "Tell us your brand, goal, dates and budget. We'll reply with a plan, placements and rates."}
            </p>
          </div>
          {SITE.email.advertise ? <a href={mail} className="inline-flex items-center gap-2 bg-brass text-night font-bold px-6 py-3.5 rounded-[4px] hover:bg-white">
            <Mail className="h-5 w-5" aria-hidden="true" /> {SITE.email.advertise}
          </a> : <p className="text-sm text-white/75">{fr ? "Les coordonnées publicitaires seront publiées ici prochainement." : "Advertising contact details will be published here soon."}</p>}
        </div>
      </section>
    </PageShell>
  );
}
