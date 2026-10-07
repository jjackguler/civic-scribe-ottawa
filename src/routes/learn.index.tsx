import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageIntro } from "@/components/PageShell";
import { GUIDES } from "@/lib/guides";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/learn/")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Learn AI: plain-language guides — ${SITE.name}`, fr: `Apprendre l'IA : guides en langage clair — ${SITE.name}` },
      description: { en: `Short, practical guides to start using AI safely at home and at work, and to find AI funding in Canada.`, fr: `De courts guides pratiques pour utiliser l'IA en toute sécurité à la maison et au travail, et trouver du financement en IA au Canada.` },
    }),
  component: LearnIndex,
});

function LearnIndex() {
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <PageIntro title={t("startHere", locale)} dek={t("startHereSub", locale)} />
      <div className="container-mw mt-10">
        <ol className="grid gap-6 md:grid-cols-2">
          {GUIDES.map(g => (
            <li key={g.slug}>
              <Link to="/learn/$slug" params={{ slug: g.slug }} className="group block h-full bg-surface border border-line rounded-[8px] p-6 sm:p-7 hover:border-ink">
                <p className="meta">{pick(g.audience)} · {g.minutes} {t("minRead", locale)}</p>
                <h2 className="hl text-[1.7rem] mt-2 group-hover:text-lake">{pick(g.title)}</h2>
                <p className="dek mt-2">{pick(g.dek)}</p>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}
