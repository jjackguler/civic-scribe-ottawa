import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { EDITORIALS, formatDate } from "@/lib/editorials";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/editor/$slug")({
  loader: ({ params }) => {
    const e = EDITORIALS.find(x => x.slug === params.slug);
    if (!e) throw notFound();
    return e.slug;
  },
  head: ({ params }) => {
    const e = EDITORIALS.find(x => x.slug === params.slug);
    return {
      meta: e
        ? [{ title: `${e.title.en} — ${SITE.name}` }, { name: "description", content: e.dek.en }, { property: "og:type", content: "article" }]
        : [{ title: SITE.name }],
    };
  },
  component: EditorialPage,
});

function EditorialPage() {
  const slug = Route.useLoaderData();
  const e = EDITORIALS.find(x => x.slug === slug)!;
  const { locale, pick } = useLocale();
  return (
    <PageShell>
      <article className="container-mw pt-10">
        <div className="max-w-[44rem] mx-auto">
          <Link to="/editor" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lake hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("backTo", locale)} {t("editorsDesk", locale)}
          </Link>
          <p className="mt-6 inline-block text-sm font-semibold bg-ink text-white rounded-full px-3 py-1">{locale === "fr" ? "Opinion" : "Opinion"}</p>
          <h1 className="hl text-[2.4rem] sm:text-[3.2rem] leading-[1.02] mt-3">{pick(e.title)}</h1>
          <p className="dek text-[1.3rem] mt-4">{pick(e.dek)}</p>
          <p className="meta mt-5">{locale === "fr" ? "La rédaction" : "The editor"} · {formatDate(e.date, locale)}</p>
          <div className="prose-mw mt-8">
            {e.body.map((p, i) => <p key={i}>{pick(p)}</p>)}
          </div>
        </div>
      </article>
    </PageShell>
  );
}
