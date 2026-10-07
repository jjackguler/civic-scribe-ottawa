import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageIntro } from "@/components/PageShell";
import { FundingCard } from "@/components/FundingCard";
import { PROGRAMS, AUDIENCE_LABEL, type Program } from "@/lib/funding";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/funding")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `AI funding and grants in Canada — ${SITE.name}`, fr: `Financement et subventions en IA au Canada — ${SITE.name}` },
      description: { en: `Federal and provincial programs that fund AI adoption, compute, talent and research in Canada — who qualifies and how to start, checked against official pages.`, fr: `Programmes fédéraux et provinciaux qui financent l'adoption de l'IA, le calcul, les talents et la recherche au Canada — admissibilité et démarches, vérifiées sur les pages officielles.` },
    }),
  component: FundingPage,
});

type Aud = Program["audience"][number] | "all";

const ORDER: Record<Program["status"], number> = { open: 0, ongoing: 1, varies: 2, closed: 3, guide: 4 };

function FundingPage() {
  const { locale, pick } = useLocale();
  const [aud, setAud] = useState<Aud>("all");
  const list = PROGRAMS
    .filter(p => aud === "all" || p.audience.includes(aud))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status]);

  const chip = (active: boolean) =>
    `px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${active ? "bg-ink text-white border-ink" : "bg-surface border-line hover:border-ink"}`;

  return (
    <PageShell>
      <PageIntro title={t("moneyForAi", locale)} dek={t("moneyForAiSub", locale)}>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={locale === "fr" ? "Filtrer par public" : "Filter by audience"}>
          <button className={chip(aud === "all")} onClick={() => setAud("all")}>{t("all", locale)}</button>
          {(["business", "nonprofits", "students", "researchers"] as const).map(a => (
            <button key={a} className={chip(aud === a)} onClick={() => setAud(a)}>{pick(AUDIENCE_LABEL[a])}</button>
          ))}
        </div>
      </PageIntro>

      <div className="container-mw mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {list.map(p => <FundingCard key={p.id} p={p} />)}
      </div>

      <div className="container-mw mt-14">
        <div className="bg-ice rounded-[8px] p-6 sm:p-8 max-w-3xl">
          <h2 className="hl text-[1.5rem]">{locale === "fr" ? "Avant de faire une demande" : "Before you apply"}</h2>
          <p className="font-serif text-[1.1rem] leading-relaxed mt-2">
            {locale === "fr"
              ? "Les programmes ouvrent et ferment, et les montants changent. Nous vérifions chaque fiche sur la page officielle et affichons la date de vérification — mais la page officielle fait toujours foi. Notre guide explique comment choisir le bon programme."
              : "Programs open and close, and amounts change. We check each listing against its official page and show the date we checked — but the official page always wins. Our guide explains how to pick the right program for you."}
          </p>
          <Link to="/learn/$slug" params={{ slug: "find-ai-funding" }} className="inline-block mt-4 font-semibold text-lake hover:underline">
            {locale === "fr" ? "Lire : Trouver du financement en IA au Canada" : "Read: How to find AI funding in Canada"}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
