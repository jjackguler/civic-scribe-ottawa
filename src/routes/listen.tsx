import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageIntro, ZoneHead } from "@/components/PageShell";
import { AudioEpisode } from "@/components/Media";
import { AdSlot } from "@/components/AdSlot";
import { getMediaFast, useMedia } from "@/lib/media";
import { MEDIA_SOURCES } from "@/lib/media-sources";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/listen")({
  loader: () => getMediaFast(),
  head: () => ({
    meta: [
      { title: `AI podcasts: the latest episodes — ${SITE.name}` },
      { name: "description", content: "New episodes from the most-listened AI podcasts, playable right here: Hard Fork, Lex Fridman, Dwarkesh, Latent Space, No Priors and more." },
    ],
  }),
  component: ListenPage,
});

function ListenPage() {
  const initial = Route.useLoaderData();
  const { data } = useMedia(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const episodes = (data?.items ?? []).filter(m => m.type === "audio");
  const shows = MEDIA_SOURCES.filter(s => s.type === "podcast");

  return (
    <PageShell>
      <PageIntro
        title={fr ? "Balados" : "Podcasts"}
        dek={fr
          ? "Les nouveaux épisodes des balados IA les plus écoutés. Écoutez ici, directement depuis le fichier de l'émission, ou ouvrez la page de l'épisode."
          : "New episodes from the AI podcasts people actually listen to. Play them here, straight from each show's own feed, or open the episode page."}
      />
      <div className="container-mw mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {!data ? (
            <p className="dek">{t("loading", locale)}</p>
          ) : episodes.length === 0 ? (
            <p className="dek">{fr ? "Aucun nouvel épisode pour le moment." : "No new episodes right now."}</p>
          ) : (
            <ul className="grid gap-8">
              {episodes.slice(0, 30).map(a => <li key={a.id} className="pb-8 border-b border-line last:border-0"><AudioEpisode a={a} /></li>)}
            </ul>
          )}
        </div>
        <aside className="grid gap-8 content-start">
          <AdSlot size="mpu" placement="section" />
          <div>
            <ZoneHead title={<span className="text-[1.4rem]">{fr ? "Émissions suivies" : "Shows we follow"}</span>} />
            <ul>
              {shows.map(s => (
                <li key={s.id} className="py-2 border-b border-line">
                  <a href={s.home} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{s.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
