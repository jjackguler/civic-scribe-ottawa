import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { useLocale } from "@/lib/locale-context";
import type { Bi } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy — ${SITE.name}` },
      { name: "description", content: `What ${SITE.name} collects (very little), and what third parties such as YouTube and advertisers may collect.` },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { locale, pick } = useLocale();
  const items: { h: Bi; p: Bi }[] = [
    {
      h: { en: "No accounts, no profile", fr: "Aucun compte, aucun profil" },
      p: { en: "You can read everything without signing up. We don't ask for your name and we don't build a profile of you.", fr: "Vous pouvez tout lire sans inscription. Nous ne demandons pas votre nom et ne créons aucun profil." },
    },
    {
      h: { en: "What your browser keeps", fr: "Ce que votre navigateur conserve" },
      p: { en: "Your language choice (English or French) is saved in your own browser so the site remembers it. Nothing else.", fr: "Votre choix de langue (anglais ou français) est enregistré dans votre navigateur pour que le site s'en souvienne. Rien d'autre." },
    },
    {
      h: { en: "Visitor statistics", fr: "Statistiques de visite" },
      p: { en: "Our host counts visits in aggregate (pages, countries, devices) so we know what readers find useful and can show advertisers real numbers. These figures don't identify you.", fr: "Notre hébergeur compte les visites de façon globale (pages, pays, appareils) pour savoir ce qui est utile et montrer de vrais chiffres aux annonceurs. Ces données ne vous identifient pas." },
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
      h: { en: "Newsletter", fr: "Infolettre" },
      p: { en: "Newsletter sign-ups are handled by our newsletter provider on its own page, under its privacy policy. You can unsubscribe from any issue.", fr: "Les inscriptions à l'infolettre sont gérées par notre fournisseur, sur sa propre page et selon sa politique. Vous pouvez vous désabonner depuis chaque envoi." },
    },
    {
      h: { en: "Questions", fr: "Questions" },
      p: { en: `Email ${SITE.email.editor}.`, fr: `Écrivez à ${SITE.email.editor}.` },
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
