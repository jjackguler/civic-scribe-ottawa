import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { OriginalCard, mmss } from "@/components/Originals";
import { NewsletterBox } from "@/components/NewsletterBox";
import { AdSlot } from "@/components/AdSlot";
import { getOriginalsFast } from "@/lib/originals";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { caseName, isSirJack, originalPublishable, originalSection, videoLd, videoSlug, type Original } from "@/lib/originals-types";
import { seoHead, publisherRef } from "@/lib/seo";

/**
 * One Original on its own page: the player, the full narration as text, the sources
 * and more cases. Search engines rank pages, not players, so every video gets an
 * address of its own (/video/<slug of its title>) with VideoObject data.
 */
export const Route = createFileRoute("/video/$slug")({
  loader: async ({ params }) => {
    const items = ((await getOriginalsFast(6000))?.items ?? []).filter(originalPublishable);
    const o = items.find(x => videoSlug(x) === params.slug || x.id === params.slug);
    if (!o) throw notFound();
    const shelf = originalSection(o);
    const more = items.filter(x => x.id !== o.id && originalSection(x) === shelf).slice(0, 4);
    return { o, more };
  },
  head: ({ match, loaderData }) => {
    const o = loaderData?.o;
    if (!o) return seoHead(match, { title: SITE.name, description: SITE.description, noindex: true });
    const name = isSirJack(o) ? caseName(o.title) : o.title;
    return seoHead(match, {
      title: { en: `${name} (video) — ${SITE.name}`, fr: `${name} (vidéo) — ${SITE.name}` },
      description: { en: o.summary, fr: o.summary },
      image: o.posterUrl,
      imageWidth: o.posterUrl ? (o.aspect === "16:9" ? 1920 : 1080) : undefined,
      imageHeight: o.posterUrl ? (o.aspect === "16:9" ? 1080 : 1920) : undefined,
      publishedTime: o.publishedAt,
      breadcrumbs: [
        isSirJack(o) ? { name: { en: "The Sir Jack Files", fr: "Les dossiers Sir Jack" }, path: "/sir-jack" } : { name: { en: "Explainers", fr: "Explicatifs" }, path: "/originals" },
        { name: { en: name, fr: name }, path: `/video/${videoSlug(o)}` },
      ],
      jsonLd: (_l, url) => [{ "@context": "https://schema.org", ...videoLd(o, url, publisherRef, true) }],
    });
  },
  component: VideoPage,
});

function VideoPage() {
  const { o, more } = Route.useLoaderData();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const wide = o.aspect === "16:9";
  const jack = isSirJack(o);
  const date = new Date(o.publishedAt).toLocaleDateString(fr ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <PageShell>
      <article className="container-mw mt-10 max-w-5xl">
        <p className="meta">
          {jack
            ? <Link to="/sir-jack" className="text-lake hover:underline">{fr ? "Les dossiers Sir Jack" : "The Sir Jack Files"}</Link>
            : <Link to="/originals" className="text-lake hover:underline">{fr ? "Explicatifs" : "Explainers"}</Link>}
          {" · "}<time dateTime={o.publishedAt}>{date}</time>{" · "}{mmss(o.durationSec)}
        </p>
        <h1 className="masthead-serif text-[2.2rem] sm:text-[3rem] leading-[1.05] mt-2">{o.title}</h1>
        <p className="font-serif text-[1.25rem] leading-relaxed mt-4 max-w-3xl">{o.summary}</p>

        <div className={`mt-8 grid gap-10 ${wide ? "" : "md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]"} items-start`}>
          <div className={wide ? "max-w-4xl" : "max-w-[320px]"}><OriginalCard o={o} own /></div>
          <div>
            <h2 className="hl text-[1.4rem]">{fr ? "Ce que dit la vidéo" : "What the video says"}</h2>
            {fr && <p className="meta mt-1">Narration en anglais.</p>}
            <div className="font-serif text-[1.12rem] leading-relaxed mt-3 space-y-4 max-w-[62ch]">
              {paragraphs(o.transcript).map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <h2 className="hl text-[1.4rem] mt-10">{fr ? "Sources" : "Sources"}</h2>
            <ul className="mt-3 grid gap-2">
              {o.sources.map(s => (
                <li key={s.url} className="border-l-[4px] border-l-brass bg-surface border border-line p-3">
                  <a href={s.url} target="_blank" rel="noopener" className="font-semibold text-lake hover:underline">{s.name}</a>
                </li>
              ))}
            </ul>
            {o.readMore && (
              <a href={fr && o.readMore.urlFr ? o.readMore.urlFr : o.readMore.url} className="inline-block font-bold underline underline-offset-4 decoration-2 mt-5"
                {...(/^https?:/.test(o.readMore.url) ? { target: "_blank", rel: "noopener" } : {})}>
                {fr ? o.readMore.fr : o.readMore.en} →
              </a>
            )}
            <p className="text-[0.85rem] text-muted-foreground mt-6 max-w-[62ch]">
              {o.credits ?? (fr ? "Voix synthétique ; illustrations dessinées en code." : "Synthetic voice; illustrations drawn in code.")}
              {" "}<Link to="/corrections" className="text-lake hover:underline">{fr ? "Signaler une erreur" : "Report a mistake"}</Link>
            </p>
          </div>
        </div>
      </article>

      <AdSlot size="leaderboard" placement="section" className="container-mw mt-10" />

      {more.length > 0 && (
        <section className="container-mw mt-10">
          <h2 className="masthead-serif text-[1.9rem] mb-5">{jack ? (fr ? "Autres affaires" : "More cases") : (fr ? "Autres explicatifs" : "More explainers")}</h2>
          <div className="grid gap-x-6 gap-y-10 grid-cols-2 md:grid-cols-4">
            {more.map((x: Original) => <OriginalCard key={x.id} o={x} />)}
          </div>
        </section>
      )}

      <section className="bg-night text-white mt-12">
        <div className="container-mw py-12">
          <NewsletterBox variant="band" />
        </div>
      </section>
    </PageShell>
  );
}

/** The narration as readable paragraphs of about four sentences. */
function paragraphs(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["”']?\s*/g) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 4) out.push(sentences.slice(i, i + 4).join("").trim());
  return out.filter(Boolean);
}
