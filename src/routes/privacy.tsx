import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Privacy — ${SITE.name}`, fr: `Confidentialité — ${SITE.name}` },
      description: { en: `What ${SITE.name} collects (very little), how we use Claude, and what third parties such as YouTube, analytics and advertisers may collect.`, fr: `Ce que ${SITE.name} recueille (très peu), comment nous utilisons Claude, et ce que des tiers comme YouTube, l'outil de mesure et les annonceurs peuvent recueillir.` },
    }),
  component: Privacy,
});

function Privacy() {
  const { locale, pick } = useLocale();
  const provider = SITE.newsletter.provider;
  const items: { h: Bi; p: Bi }[] = [
    {
      h: { en: "No accounts, no profile", fr: "Aucun compte, aucun profil" },
      p: { en: "You can read everything without signing up. We don't ask for your name and we don't build a profile of you.", fr: "Vous pouvez tout lire sans inscription. Nous ne demandons pas votre nom et ne créons aucun profil." },
    },
    {
      h: { en: "Nothing stored in your browser", fr: "Rien n'est enregistré dans votre navigateur" },
      p: { en: "We set no cookies of our own. Your language is part of the page address (/fr for French), so there is nothing to remember.", fr: "Nous ne déposons aucun témoin. La langue fait partie de l'adresse de la page (/fr pour le français); il n'y a donc rien à mémoriser." },
    },
    {
      h: { en: "Visitor statistics", fr: "Statistiques de visite" },
      p: SITE.cloudflareAnalyticsToken
        ? { en: "We use Cloudflare Web Analytics to count visits in aggregate (pages, countries, devices, referring sites). It uses no cookies, does not fingerprint you and does not track you across sites. We use the totals to see what readers find useful and to show advertisers real numbers.", fr: "Nous utilisons Cloudflare Web Analytics pour compter les visites de façon globale (pages, pays, appareils, sites d'origine). L'outil n'utilise aucun témoin, ne crée pas d'empreinte numérique et ne vous suit pas d'un site à l'autre. Nous utilisons ces totaux pour savoir ce qui est utile aux lecteurs et montrer de vrais chiffres aux annonceurs." }
        : { en: "We plan to use Cloudflare Web Analytics, which counts visits in aggregate without cookies or tracking across sites. This page will say when it is switched on.", fr: "Nous prévoyons d'utiliser Cloudflare Web Analytics, qui compte les visites de façon globale, sans témoins ni suivi d'un site à l'autre. Cette page indiquera quand l'outil sera activé." },
    },
    {
      h: { en: "How we use Claude", fr: "Comment nous utilisons Claude" },
      p: { en: "We use Claude, an AI model made by Anthropic, to translate public headlines and excerpts between English and French, and to group stories that report the same event. Only that public publisher text is sent to Anthropic's API. Nothing about you — no address, no device details, no reading history — is ever sent. Translations are labelled and link to the original. Claude does not write or rewrite the news.", fr: "Nous utilisons Claude, un modèle d'IA conçu par Anthropic, pour traduire des titres et extraits publics entre l'anglais et le français, et pour regrouper les nouvelles qui rapportent le même événement. Seul ce texte public des éditeurs est envoyé à l'API d'Anthropic. Rien à votre sujet — ni adresse, ni détails de l'appareil, ni historique de lecture — n'est jamais envoyé. Les traductions sont identifiées et renvoient à l'original. Claude n'écrit ni ne réécrit les nouvelles." },
    },
    {
      h: { en: "Video, audio and photos", fr: "Vidéo, audio et photos" },
      p: { en: "Videos use YouTube's privacy-enhanced player and load nothing from YouTube until you press play. Podcast audio loads from the show's host when you press Listen. News photos load from each publisher's site.", fr: "Les vidéos utilisent le lecteur à confidentialité renforcée de YouTube et ne chargent rien avant que vous appuyiez sur Lecture. L'audio des balados se charge depuis l'hébergeur de l'émission quand vous appuyez sur Écouter. Les photos se chargent depuis le site de chaque éditeur." },
    },
    {
      h: { en: "Advertising", fr: "Publicité" },
      p: ADSENSE_CLIENT
        ? { en: "We use Google AdSense. Google and its partners may use cookies to show ads based on your visits to this and other sites. You can turn off personalized ads at adssettings.google.com.", fr: "Nous utilisons Google AdSense. Google et ses partenaires peuvent utiliser des témoins pour afficher des annonces selon vos visites sur ce site et d'autres. Vous pouvez désactiver la personnalisation sur adssettings.google.com." }
        : { en: "Ads on this site are currently our own promotions or direct campaigns shown as images; they don't track you. If we add an ad network such as Google AdSense, this page will say so first.", fr: "Les publicités de ce site sont nos propres promotions ou des campagnes directes affichées en image; elles ne vous suivent pas. Si nous ajoutons un réseau comme Google AdSense, cette page l'indiquera d'abord." },
    },
    {
      h: { en: "Newsletter and consent", fr: "Infolettre et consentement" },
      p: {
        en: `${provider ? `Our newsletter is sent by ${provider}.` : "Our newsletter is sent by a newsletter provider."} You sign up on the provider's own page, under its privacy policy; we never store email addresses ourselves. In line with Canada's Anti-Spam Legislation (CASL), we send it only to people who have given express consent by subscribing and confirming, every issue says who sent it, and every issue has a one-click unsubscribe link.`,
        fr: `${provider ? `Notre infolettre est envoyée par ${provider}.` : "Notre infolettre est envoyée par un fournisseur spécialisé."} L'inscription se fait sur la page du fournisseur, selon sa politique de confidentialité; nous ne conservons jamais nous-mêmes d'adresses courriel. Conformément à la Loi canadienne anti-pourriel (LCAP), nous l'envoyons seulement aux personnes qui ont donné leur consentement exprès en s'abonnant et en confirmant; chaque envoi indique qui l'expédie et comporte un lien de désabonnement en un clic.`,
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
          <section key={i.h.en} className="mb-8">
            <h2 className="masthead-serif text-[1.5rem] leading-tight mb-2">{pick(i.h)}</h2>
            <p className="font-serif text-[1.12rem] leading-relaxed">{pick(i.p)}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
