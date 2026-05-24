import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About & Trust — Ottawa Civic Ledger" }] }),
  component: AboutPage,
});

function AboutPage() {
  const { locale } = useLocale();
  const sections = [
    { id: "mission", h: { en: "Our mission", fr: "Notre mission" }, p: {
      en: "Help Ottawa residents understand what's happening street by street, neighborhood by neighborhood, and connect problems with real solutions — in both official languages, with dignity.",
      fr: "Aider les résidents d'Ottawa à comprendre ce qui se passe rue par rue, quartier par quartier, et relier les problèmes à de vraies solutions — dans les deux langues officielles, avec dignité.",
    }},
    { id: "standards", h: { en: "Editorial standards", fr: "Normes éditoriales" }, p: {
      en: "We verify before we publish. We name our sources where safe. We distinguish reporting, opinion, sponsored content, and community submissions clearly on every page.",
      fr: "Nous vérifions avant de publier. Nous nommons nos sources lorsque c'est sûr. Nous distinguons clairement le reportage, l'opinion, le contenu commandité et les soumissions citoyennes.",
    }},
    { id: "factcheck", h: { en: "Fact-checking policy", fr: "Politique de vérification" }, p: {
      en: "Two independent sources for any contested claim. We publish methodology, evidence, and timestamps on every fact-check.",
      fr: "Deux sources indépendantes pour toute affirmation contestée. Nous publions la méthodologie, les preuves et l'horodatage.",
    }},
    { id: "corrections", h: { en: "Corrections policy", fr: "Politique de corrections" }, p: {
      en: "Errors are corrected quickly and publicly. Significant corrections appear at the top of the article and in a monthly index.",
      fr: "Les erreurs sont corrigées rapidement et publiquement. Les corrections importantes apparaissent en haut de l'article et dans un index mensuel.",
    }},
    { id: "community", h: { en: "Community guidelines", fr: "Lignes directrices communautaires" }, p: {
      en: "Treat people with dignity. No harassment, hate, or doxxing. Protect minors and vulnerable people. Disagreement is welcome; cruelty is not.",
      fr: "Respect et dignité. Pas de harcèlement, de haine, ni de divulgation d'informations privées. Protéger les mineurs et les personnes vulnérables.",
    }},
    { id: "funding", h: { en: "Funding transparency", fr: "Transparence du financement" }, p: {
      en: "76% reader donations, 18% local journalism grants, 6% labeled sponsorship. No donor or sponsor has editorial influence.",
      fr: "76 % dons de lecteurs, 18 % subventions au journalisme local, 6 % commandites étiquetées. Aucune influence éditoriale des donateurs.",
    }},
    { id: "privacy", h: { en: "Privacy", fr: "Vie privée" }, p: {
      en: "We collect the minimum data needed. We do not sell reader data. Our analytics are aggregated and anonymized.",
      fr: "Nous collectons le minimum nécessaire. Nous ne vendons pas les données des lecteurs. Analytique agrégée et anonymisée.",
    }},
    { id: "contact", h: { en: "Contact", fr: "Contact" }, p: {
      en: "Tips, corrections, partnerships: editor@ottawaledger.example. SecureDrop available for sensitive material.",
      fr: "Pistes, corrections, partenariats : editor@ottawaledger.example. SecureDrop disponible pour matériel sensible.",
    }},
  ];

  return (
    <PageShell narrow>
      <PageHero
        kicker={locale === "fr" ? "À propos · Confiance · Éthique" : "About · Trust · Ethics"}
        title={locale === "fr" ? "Une institution civique pour Ottawa." : "A civic institution for Ottawa."}
        dek={locale === "fr" ? "Calme, juste, indépendante, utile." : "Calm, fair, independent, useful."}
      />
      <div className="space-y-10">
        {sections.map(s => (
          <section key={s.id} id={s.id} className="scroll-mt-32">
            <h2 className="font-display text-2xl">{s.h[locale]}</h2>
            <p className="font-serif text-lg leading-relaxed text-foreground/85 mt-3">{s.p[locale]}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
