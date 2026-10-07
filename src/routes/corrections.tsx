import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro, ZoneHead } from "@/components/PageShell";
import { ProseSections, type ProseSection } from "@/components/ProseSections";
import { useLocale } from "@/lib/locale-context";
import { CORRECTIONS } from "@/lib/corrections";
import { editorMailto } from "@/lib/contact";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/corrections")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Corrections — ${SITE.name}`, fr: `Corrections — ${SITE.name}` },
      description: {
        en: `How ${SITE.name} handles errors, how to report one, and every correction we have made.`,
        fr: `Comment ${SITE.name} traite les erreurs, comment en signaler une, et toutes les corrections apportées.`,
      },
    }),
  component: Corrections,
});

function Corrections() {
  const { locale, pick } = useLocale();
  const fr = locale === "fr";
  const mail = editorMailto(fr ? "Signaler une erreur" : "Report an error");
  const items: ProseSection[] = [
    {
      h: { en: "Our policy", fr: "Notre politique" },
      p: [
        {
          en: "When we get something wrong in our own work — a credit, the desk a story is filed under, an editor's headline, a translation, a guide or a funding entry — we fix it as soon as we confirm it, and log it below with the date.",
          fr: "Quand nous nous trompons dans notre propre travail — un crédit, la section d'une nouvelle, un titre de la rédaction, une traduction, un guide ou une fiche de financement — nous corrigeons dès que l'erreur est confirmée, et la consignons ci-dessous avec la date.",
        },
        {
          en: "An error inside a publisher's article belongs to that publisher. We will tell you who to contact, and if the publisher corrects or withdraws the story we follow their change.",
          fr: "Une erreur dans l'article d'un éditeur relève de cet éditeur. Nous vous dirons qui joindre et, si l'éditeur corrige ou retire la nouvelle, nous suivons son changement.",
        },
      ],
    },
    {
      id: "report",
      h: { en: "Report an error", fr: "Signaler une erreur" },
      p: [
        {
          en: "Tell us the page address and what is wrong. Every story page has a “Report an error” link that fills in the address for you.",
          fr: "Indiquez-nous l'adresse de la page et ce qui est inexact. Chaque page de nouvelle a un lien « Signaler une erreur » qui remplit l'adresse pour vous.",
        },
        mail ? (
          <a key="m" href={mail} className="text-lake font-semibold hover:underline">{SITE.email.editor}</a>
        ) : (
          { en: "Our corrections inbox opens with the launch of the site.", fr: "Notre adresse pour les corrections ouvrira au lancement du site." }
        ),
      ],
    },
  ];
  return (
    <PageShell>
      <PageIntro title={fr ? "Corrections" : "Corrections"} dek={fr ? "Nous corrigeons nos erreurs au grand jour." : "We fix our mistakes in the open."} />
      <ProseSections items={items} />
      <section className="container-mw mt-6 max-w-3xl">
        <ZoneHead title={fr ? "Registre des corrections" : "Corrections log"} />
        {CORRECTIONS.length === 0 ? (
          <p className="font-serif text-[1.12rem] leading-relaxed text-muted-ink">
            {fr ? "Aucune correction pour l'instant. Chaque correction apparaîtra ici, datée." : "No corrections yet. Each one will appear here, dated."}
          </p>
        ) : (
          <ol className="grid gap-5">
            {CORRECTIONS.map(c => (
              <li key={c.date + c.page} className="border-l-[3px] border-brass pl-4">
                <p className="meta">
                  <time dateTime={c.date}>{new Date(`${c.date}T12:00:00`).toLocaleDateString(fr ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" })}</time>
                  {" — "}
                  <Link to={c.page as never} className="text-lake hover:underline">{c.page}</Link>
                </p>
                <p className="font-serif text-[1.08rem] leading-relaxed mt-1">{pick(c.what)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </PageShell>
  );
}
