import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { ShieldCheck, AlertTriangle, Mail, BookOpen } from "lucide-react";

export const Route = createFileRoute("/ethics")({
  head: () => ({ meta: [
    { title: "Ethics, corrections & values — Ottawa Civic Ledger" },
    { name: "description", content: "Our editorial values, content advisory policy, corrections policy and ombudsperson contact." },
    { property: "og:title", content: "Ethics — Ottawa Civic Ledger" },
    { property: "og:description", content: "Human rights, dignity, truth. Read our standards." },
  ]}),
  component: EthicsPage,
});

function EthicsPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";

  return (
    <PageShell>
      <PageHero
        kicker={fr ? "Éthique et valeurs" : "Ethics & values"}
        title={fr ? "Ce que nous publions, et pourquoi" : "What we publish, and why"}
        dek={fr
          ? "Cette publication est construite sur des valeurs non négociables. Nous les rendons publiques."
          : "This publication is built on non-negotiable values. We make them public."}
      />

      <div className="grid lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8 prose-civic">
          <section className="mb-10">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-civic-red" /><h2 className="font-display text-2xl">{fr ? "Nous défendons" : "We stand for"}</h2></div>
            <ul className="mt-3 space-y-2 font-serif text-[17px] leading-relaxed list-disc pl-6">
              <li>{fr ? "Les droits humains, la démocratie, la justice, l'équité." : "Human rights, democracy, justice, fairness."}</li>
              <li>{fr ? "L'antiracisme et l'inclusion active." : "Anti-racism and active inclusion."}</li>
              <li>{fr ? "Briser les préjugés par des récits honnêtes." : "Breaking down prejudice through honest storytelling."}</li>
              <li>{fr ? "La tolérance et le pluralisme." : "Tolerance and pluralism."}</li>
              <li>{fr ? "Les solutions plutôt que le désespoir." : "Solutions over despair."}</li>
              <li>{fr ? "Les voix locales, marginalisées, citoyennes." : "Local voices, marginalized voices, citizen voices."}</li>
              <li>{fr ? "La beauté, la bienveillance, l'optimisme civique." : "Beauty, kindness, civic optimism."}</li>
              <li>{fr ? "La vérité, la vérification, le sourçage." : "Truth, fact-checking, sourcing."}</li>
            </ul>
          </section>

          <section className="mb-10">
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-civic-red" /><h2 className="font-display text-2xl">{fr ? "Ce que nous refusons" : "What we refuse"}</h2></div>
            <p className="font-serif italic text-muted-foreground mt-1">{fr ? "Nous ne ferons jamais la promotion, surtout auprès des jeunes lecteurs, de :" : "We will never promote, especially to young readers:"}</p>
            <ul className="mt-3 space-y-2 font-serif text-[17px] leading-relaxed list-disc pl-6">
              <li>{fr ? "Nudité gratuite, contenu érotique, sexualisation." : "Gratuitous nudity, erotic content, sexualization."}</li>
              <li>{fr ? "Glorification ou normalisation de l'alcool auprès des mineurs." : "Alcohol glorification or normalization to minors."}</li>
              <li>{fr ? "Racisme, xénophobie, discours haineux." : "Racism, xenophobia, hate speech of any kind."}</li>
              <li>{fr ? "Sensationnalisme, exploitation, voyeurisme du traumatisme." : "Sensationalism, exploitation, trauma porn."}</li>
              <li>{fr ? "Photos d'arrestation, défilés des accusés, couverture qui retire la dignité." : "Mugshots, perp walks, dignity-stripping crime coverage."}</li>
              <li>{fr ? "Désinformation, complots, allégations non vérifiées." : "Misinformation, conspiracy, unverified claims."}</li>
            </ul>
          </section>

          <section className="mb-10">
            <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-civic-red" /><h2 className="font-display text-2xl">{fr ? "Ton éditorial" : "Editorial tone"}</h2></div>
            <ul className="mt-3 space-y-2 font-serif text-[17px] leading-relaxed list-disc pl-6">
              <li>{fr ? "Recommander le beau et le bon." : "Recommend the good and the beautiful."}</li>
              <li>{fr ? "Tenir le pouvoir responsable avec faits et dignité, jamais avec cruauté." : "Hold power accountable with facts and dignity, never with cruelty."}</li>
              <li>{fr ? "Rendre les lecteurs plus avisés, plus bienveillants, plus connectés à leur ville." : "Make readers smarter, kinder, more connected to their city."}</li>
              <li>{fr ? "Ne jamais frapper vers le bas — surtout pas les nouveaux arrivants, les personnes sans logis, les peuples autochtones, les personnes en situation de handicap, les communautés LGBTQ+." : "Never punch down — especially newcomers, unhoused, Indigenous, disabled, LGBTQ+ communities."}</li>
            </ul>
          </section>

          <section className="mb-10 bg-secondary p-5">
            <h2 className="font-display text-2xl">{fr ? "Politique de corrections" : "Corrections policy"}</h2>
            <p className="font-serif text-[17px] mt-2 leading-relaxed">
              {fr
                ? "Si nous avons fait une erreur, nous la corrigeons promptement, visiblement, et avec une note datée au bas de l'article. Les corrections importantes sont également annoncées en page d'accueil."
                : "If we make a mistake we correct it promptly, visibly, and with a dated note at the foot of the article. Material corrections are also flagged on the homepage."}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl">{fr ? "Avis sur le contenu" : "Content advisory"}</h2>
            <p className="font-serif text-[17px] mt-2 leading-relaxed">
              {fr
                ? "Les sujets difficiles sont précédés d'un avertissement. Aucune vidéo ne démarre automatiquement avec son. Les sections jeunesse sont filtrées séparément."
                : "Difficult topics are preceded by an advisory. No video autoplays with sound. Youth sections are filtered separately."}
            </p>
          </section>

          <section className="mb-10 border border-rule p-5">
            <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-civic-red" /><h2 className="font-display text-2xl">{fr ? "Médiatrice" : "Ombudsperson"}</h2></div>
            <p className="font-serif text-[17px] mt-2 leading-relaxed">
              {fr ? "Pour signaler une plainte éditoriale ou demander une rectification :" : "To report an editorial complaint or request a correction:"}
            </p>
            <p className="font-display text-lg mt-2">ombuds@civicledger.ca</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{fr ? "Réponse sous 72 heures" : "Reply within 72 hours"}</p>
          </section>
        </article>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-ink text-paper p-5">
            <span className="kicker text-civic-red">{fr ? "Engagement public" : "Public pledge"}</span>
            <p className="font-display text-xl mt-2 leading-tight">{fr ? "Construire avec dignité. Construire avec soin." : "Build with dignity. Build with care."}</p>
            <p className="font-serif italic text-paper/80 text-sm mt-2">{fr ? "Pour chaque lecteur — surtout le plus jeune." : "For every reader — especially the youngest."}</p>
          </div>
          <div className="bg-card border border-rule p-5">
            <span className="kicker text-civic-red">{fr ? "Méthodologie autochtone" : "Indigenous methodology"}</span>
            <p className="font-serif text-sm mt-2 leading-relaxed">
              {fr
                ? "La couverture des sujets anishinaabeg algonquin est élaborée en consultation avec la communauté."
                : "Coverage of Anishinaabeg Algonquin topics is developed in consultation with community."}
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
