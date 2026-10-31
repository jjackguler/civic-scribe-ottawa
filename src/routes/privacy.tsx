import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { adsenseReady } from "@/lib/ads";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Privacy — ${SITE.name}`, fr: `Confidentialité — ${SITE.name}` },
      description: { en: `What ${SITE.name} collects (very little), how we use AI models, and what third parties such as YouTube, analytics and advertisers may collect.`, fr: `Ce que ${SITE.name} recueille (très peu), comment nous utilisons les modèles d'IA, et ce que des tiers comme YouTube, l'outil de mesure et les annonceurs peuvent recueillir.` },
    }),
  component: Privacy,
});

function Privacy() {
  const { locale, pick } = useLocale();
  const provider = SITE.newsletter.provider;
  const items: { id?: string; h: Bi; p: Bi }[] = [
    {
      h: { en: "Who is responsible", fr: "Qui est responsable" },
      p: { en: `${SITE.name} is published by ${SITE.publisher.name} in ${SITE.publisher.city}, ${SITE.publisher.region}, ${SITE.publisher.country}. You can read everything without an account. We don't ask for your name and we don't build a profile of you.`, fr: `${SITE.name} est publié par ${SITE.publisher.name} à ${SITE.publisher.city} (${SITE.publisher.region}, ${SITE.publisher.country}). Vous pouvez tout lire sans compte. Nous ne demandons pas votre nom et ne créons aucun profil.` },
    },
    {
      h: { en: "Storage on your device", fr: "Stockage sur votre appareil" },
      p: { en: "The Brief uses local browser storage for saved stories, preferences and local interactions, and a service-worker cache for offline use. These records stay on this device; clearing site data removes them. Privacy preferences may also be stored locally. Language is part of the page address (/fr for French).", fr: "The Brief utilise le stockage local du navigateur pour les articles enregistrés, les préférences et les interactions locales, ainsi qu'un cache de service worker pour l'accès hors ligne. Ces données restent sur cet appareil; effacer les données du site les supprime. Les choix de confidentialité peuvent aussi être conservés localement. La langue fait partie de l'adresse (/fr pour le français)." },
    },
    {
      h: { en: "Visitor statistics", fr: "Statistiques de visite" },
      p: SITE.cloudflareAnalyticsToken
        ? { en: "We use Cloudflare Web Analytics to count visits in aggregate (pages, countries, devices, referring sites). It uses no cookies, does not fingerprint you and does not track you across sites. We use the totals to see what readers find useful and to show advertisers real numbers.", fr: "Nous utilisons Cloudflare Web Analytics pour compter les visites de façon globale (pages, pays, appareils, sites d'origine). L'outil n'utilise aucun témoin, ne crée pas d'empreinte numérique et ne vous suit pas d'un site à l'autre. Nous utilisons ces totaux pour savoir ce qui est utile aux lecteurs et montrer de vrais chiffres aux annonceurs." }
        : { en: "We plan to use Cloudflare Web Analytics, which counts visits in aggregate without cookies or tracking across sites. This page will say when it is switched on.", fr: "Nous prévoyons d'utiliser Cloudflare Web Analytics, qui compte les visites de façon globale, sans témoins ni suivi d'un site à l'autre. Cette page indiquera quand l'outil sera activé." },
    },
    {
      h: { en: "How we use AI models", fr: "Comment nous utilisons les modèles d'IA" },
      p: { en: "We use Google's Gemini models (and Anthropic's Claude when we switch it on) to write labelled headlines, briefs and newsroom articles from publishers' public reporting, to translate between English and French, and to group stories that report the same event. For that work, only the publishers' public text is sent to the model provider. If you use Ask the Keeper, the questions you type or say are sent to an AI model to get an answer, so leave out personal details. Voice uses your browser's speech recognition or, only after you agree, Convai's voice service, and spoken replies are made with ElevenLabs. We never send your address, device details or reading history. Everything AI writes is labelled and links to the original.", fr: "Nous utilisons les modèles Gemini de Google (et Claude d'Anthropic lorsque nous l'activons) pour rédiger des titres, résumés et articles identifiés à partir des reportages publics des éditeurs, les traduire entre l'anglais et le français, et regrouper les nouvelles qui rapportent le même événement. Pour ce travail, seul le texte public des éditeurs est envoyé au fournisseur du modèle. Si vous utilisez Demandez au Gardien, les questions que vous tapez ou dites sont envoyées à un modèle d'IA pour obtenir une réponse; n'y mettez pas de renseignements personnels. La voix utilise la reconnaissance vocale de votre navigateur ou, seulement avec votre accord, le service vocal de Convai, et les réponses parlées sont produites avec ElevenLabs. Nous n'envoyons jamais votre adresse, les détails de votre appareil ni votre historique de lecture. Tout ce que l'IA rédige est identifié et renvoie à l'original." },
    },
    {
      h: { en: "Video, audio and photos", fr: "Vidéo, audio et photos" },
      p: { en: "Videos use YouTube's privacy-enhanced player and load nothing from YouTube until you press play. Podcast audio loads from the show's host when you press Listen. News photos load from each publisher's site.", fr: "Les vidéos utilisent le lecteur à confidentialité renforcée de YouTube et ne chargent rien avant que vous appuyiez sur Lecture. L'audio des balados se charge depuis l'hébergeur de l'émission quand vous appuyez sur Écouter. Les photos se chargent depuis le site de chaque éditeur." },
    },
    {
      h: { en: "Advertising", fr: "Publicité" },
      p: adsenseReady()
        ? { en: "We use Google AdSense. Google and its partners may use cookies or local storage, including for non-personalised ads. Personalised ads may use your visits to this and other sites. Use the consent controls to manage your choices; Google's advertising settings are also available at adssettings.google.com.", fr: "Nous utilisons Google AdSense. Google et ses partenaires peuvent utiliser des témoins ou le stockage local, y compris pour les annonces non personnalisées. Les annonces personnalisées peuvent utiliser vos visites sur ce site et d'autres. Gérez vos choix avec les contrôles de consentement; les paramètres publicitaires de Google sont aussi disponibles sur adssettings.google.com." }
        : { en: "Google advertising is disabled while our AdSense application and consent integration are reviewed. On eligible newspaper pages we load Google's certified consent-management service through its AdSense tag, with ad requests paused. Google receives the connection information needed to deliver this service and may store your consent choices. Where the service applies, use Privacy choices to manage or withdraw consent. Giving consent does not enable ads during this review. Our own promotions and direct image campaigns do not track you.", fr: "La publicité Google est désactivée pendant l'examen de notre demande AdSense et de l'intégration du consentement. Sur les pages admissibles du journal, nous chargeons le service certifié de gestion du consentement de Google via sa balise AdSense, avec les demandes publicitaires suspendues. Google reçoit les informations de connexion nécessaires et peut conserver vos choix. Lorsque le service s'applique, utilisez Choix de confidentialité pour gérer ou retirer votre consentement. Donner son consentement n'active pas les annonces pendant cet examen. Nos propres promotions et campagnes directes en image ne vous suivent pas." },
    },
    {
      id: "newsletter",
      h: { en: "Newsletter and consent", fr: "Infolettre et consentement" },
      p: {
        en: `When you sign up for ${SITE.newsletter.name.en}, we ask for your email address and your express consent: a box you tick yourself, next to the exact wording you agree to. The form sends your address, that wording, its version, the time and the page you signed up on to our mailing list${provider ? `, run with ${provider}` : ""}, operated for ${SITE.publisher.name}. The website itself keeps no copy: your address is not stored in your browser, in a database of ours or in our logs. We use it only to send the newsletter and never sell or share it. In line with Canada's Anti-Spam Legislation (CASL), every issue names the sender and how to reach us, and has a one-click unsubscribe link; we act on unsubscribe requests right away, and in any case within 10 business days. You can also withdraw consent by writing to ${SITE.email.general}.`,
        fr: `Lorsque vous vous inscrivez au ${SITE.newsletter.name.fr}, nous demandons votre adresse courriel et votre consentement exprès : une case que vous cochez vous-même, à côté du texte exact auquel vous consentez. Le formulaire transmet votre adresse, ce texte, sa version, l'heure et la page d'inscription à notre liste d'envoi${provider ? `, gérée avec ${provider}` : ""}, exploitée pour ${SITE.publisher.name}. Le site lui-même n'en garde aucune copie : votre adresse n'est conservée ni dans votre navigateur, ni dans une base de données à nous, ni dans nos journaux. Nous l'utilisons seulement pour envoyer l'infolettre et ne la vendons ni ne la partageons jamais. Conformément à la Loi canadienne anti-pourriel (LCAP), chaque envoi indique l'expéditeur et comment le joindre, et comporte un lien de désabonnement en un clic; nous donnons suite aux demandes de désabonnement immédiatement, et dans tous les cas en moins de 10 jours ouvrables. Vous pouvez aussi retirer votre consentement en écrivant à ${SITE.email.general}.`,
      },
    },
    {
      id: "tips",
      h: { en: "Tips and pitches", fr: "Tuyaux et propositions" },
      p: {
        en: `Messages sent with the tip form go to the newsroom's inbox at ${SITE.publisher.name}; the website keeps no copy and does not log them. Your name and contact details are optional. We use them only to follow up on your message, and never publish them without your permission. The form is not anonymous or end-to-end encrypted, so don't send anything that could put you or others at risk.`,
        fr: `Les messages envoyés avec le formulaire de tuyaux arrivent dans la boîte de la rédaction de ${SITE.publisher.name}; le site n'en garde aucune copie et ne les journalise pas. Votre nom et vos coordonnées sont facultatifs. Nous les utilisons seulement pour donner suite à votre message, et ne les publions jamais sans votre accord. Le formulaire n'est ni anonyme ni chiffré de bout en bout : n'envoyez rien qui pourrait vous mettre, ou mettre d'autres personnes, en danger.`,
      },
    },
    {
      h: { en: "Questions", fr: "Questions" },
      p: SITE.email.editor
        ? { en: `Email ${SITE.email.editor}.`, fr: `Écrivez à ${SITE.email.editor}.` }
        : { en: `Write to ${SITE.publisher.name}, ${SITE.publisher.city}, ${SITE.publisher.country}. A privacy contact address opens with the launch of the site.`, fr: `Écrivez à ${SITE.publisher.name}, ${SITE.publisher.city}, ${SITE.publisher.country}. Une adresse pour les questions de confidentialité ouvrira au lancement du site.` },
    },
  ];
  return (
    <PageShell>
      <PageIntro title={locale === "fr" ? "Confidentialité" : "Privacy"} dek={locale === "fr" ? "Nous recueillons très peu, et nous le disons clairement." : "We collect very little, and we say so plainly."} />
      <div className="container-mw mt-10 max-w-3xl">
        {items.map(i => (
          <section key={i.h.en} id={i.id} className="mb-8 scroll-mt-28">
            <h2 className="masthead-serif text-[1.5rem] leading-tight mb-2">{pick(i.h)}</h2>
            <p className="font-serif text-[1.12rem] leading-relaxed">{pick(i.p)}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
