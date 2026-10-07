import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageShell, PageIntro } from "@/components/PageShell";
import { TOOLS, TOOL_CATEGORIES } from "@/lib/tools";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/tools")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `The best AI tools to try — ${SITE.name}`, fr: `Les meilleurs outils d'IA à essayer — ${SITE.name}` },
      description: { en: `A short, practical list of AI tools for everyday life and work — assistants, research, translation, design, meetings and building apps.`, fr: `Une courte liste pratique d'outils d'IA pour la vie et le travail — assistants, recherche, traduction, design, réunions et création d'applications.` },
    }),
  component: ToolsPage,
});

function ToolsPage() {
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <PageIntro
        title={t("bestTools", locale)}
        dek={locale === "fr"
          ? "Une courte liste d'outils utiles, classés selon ce que vous voulez faire. Les forfaits et prix changent souvent : vérifiez sur le site de chaque outil."
          : "A short list of genuinely useful tools, grouped by what you want to get done. Plans and prices change often — check each tool's site."}
      />
      <div className="container-mw mt-10 grid gap-14">
        {TOOL_CATEGORIES.map(cat => {
          const tools = TOOLS.filter(x => x.category === cat.id);
          if (!tools.length) return null;
          return (
            <section key={cat.id}>
              <h2 className="hl text-[1.6rem] pb-2 mb-5 border-b-[3px] border-ink">{pick(cat.label)}</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map(tool => (
                  <li key={tool.name}>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="group block h-full bg-surface border border-line rounded-[8px] p-5 hover:border-ink">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="hl text-[1.3rem] group-hover:text-lake">{tool.name}</p>
                          <p className="meta">{tool.maker}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-ink mt-1.5" aria-hidden="true" />
                      </div>
                      <p className="font-serif text-[1.02rem] leading-relaxed mt-3">{pick(tool.goodFor)}</p>
                      <p className="mt-3 flex gap-2 flex-wrap">
                        {tool.freePlan && <span className="text-xs font-semibold rounded-full bg-ice px-2.5 py-1">{t("free", locale)}</span>}
                        {tool.canadian && <span className="text-xs font-semibold rounded-full bg-ink text-white px-2.5 py-1">{locale === "fr" ? "Canadien" : "Made in Canada"}</span>}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
