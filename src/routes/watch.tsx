import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { VideoPlayer, VideoTile, MediaMeta } from "@/components/Media";
import { AdSlot } from "@/components/AdSlot";
import { getMediaFast, useMedia } from "@/lib/media";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";

type Filter = "all" | "newsroom" | "explainers" | "interviews";

export const Route = createFileRoute("/watch")({
  loader: () => getMediaFast(),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Watch: AI news video — ${SITE.name}`, fr: `Vidéos : l’actualité de l’IA — ${SITE.name}` },
      description: { en: `The latest artificial intelligence video from broadcasters, AI labs, explainers and interview shows, in one place.`, fr: `Les dernières vidéos sur l'intelligence artificielle des télédiffuseurs, laboratoires, vulgarisateurs et émissions d'entrevues, au même endroit.` },
    }),
  component: WatchPage,
});

function WatchPage() {
  const initial = Route.useLoaderData();
  const { data } = useMedia(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(18);

  const videos = (data?.items ?? []).filter(m => m.type === "video");
  const list = videos.filter(v =>
    filter === "all" ? true :
    filter === "newsroom" ? v.newsroom && !v.interview :
    filter === "interviews" ? v.interview :
    !v.newsroom && !v.interview);
  const [feature, ...rest] = list;

  const chips: [Filter, string][] = [
    ["all", fr ? "Tout" : "All"],
    ["newsroom", fr ? "Reportages" : "Newsrooms"],
    ["explainers", fr ? "Laboratoires et vulgarisation" : "Labs & explainers"],
    ["interviews", fr ? "Entrevues" : "Interviews"],
  ];

  return (
    <PageShell>
      <div className="bg-night text-white">
        <div className="container-mw pt-10 pb-10">
          <h1 className="masthead-serif text-[2.6rem] sm:text-[3.4rem] leading-[1.05] flex items-center gap-4">
            <span className="live-dot" aria-hidden="true" />{fr ? "Vidéos" : "Watch"}
          </h1>
          <p className="font-serif text-white/75 text-[1.15rem] mt-3 max-w-3xl">
            {fr
              ? "Les reportages des grandes chaînes, les démonstrations des laboratoires et les meilleures explications sur l'IA. Chaque vidéo joue dans le lecteur de son éditeur, créditée à sa chaîne."
              : "Broadcast reports, lab demos and the best AI explainers. Every video plays in its publisher's own player, credited to its channel."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={fr ? "Filtrer" : "Filter"}>
            {chips.map(([id, label]) => (
              <button key={id} onClick={() => { setFilter(id); setLimit(18); }} aria-pressed={filter === id}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border ${filter === id ? "bg-brass text-night border-brass" : "border-white/30 hover:border-white"}`}>
                {label}
              </button>
            ))}
          </div>
          {feature && (
            <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
              <VideoPlayer key={feature.id} v={feature} eager />
              <div>
                <h2 className="hl text-[1.7rem] sm:text-[2.2rem]">{feature.title}</h2>
                <MediaMeta m={feature} dark className="mt-2" />
                {feature.summary && <p className="font-serif text-white/75 mt-3 leading-relaxed line-clamp-5">{feature.summary}</p>}
                <a href={feature.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-brass font-semibold hover:underline">
                  {fr ? "Voir sur YouTube" : "Watch on YouTube"}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-mw mt-10">
        {!data ? (
          <p className="dek">{t("loading", locale)}</p>
        ) : list.length === 0 ? (
          <p className="dek">{fr ? "Aucune vidéo dans cette catégorie pour le moment." : "No videos in this category right now."}</p>
        ) : (
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, limit).map((v, i) => (
              <div key={v.id} className={i === 5 ? "contents" : ""}>
                <VideoTile v={v} />
                {i === 5 && <AdSlot size="mpu" placement="watch" className="sm:col-span-2 lg:col-span-1" />}
              </div>
            ))}
          </div>
        )}
        {rest.length > limit && (
          <div className="text-center mt-12">
            <button onClick={() => setLimit(l => l + 18)} className="px-6 py-3 rounded-[4px] bg-night text-white font-semibold hover:bg-lake">
              {fr ? "Plus de vidéos" : "More videos"}
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

