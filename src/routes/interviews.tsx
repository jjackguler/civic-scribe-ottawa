import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageIntro } from "@/components/PageShell";
import { InterviewCard } from "@/components/Media";
import { AdSlot } from "@/components/AdSlot";
import { getMediaFast, useMedia } from "@/lib/media";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/interviews")({
  loader: () => getMediaFast(),
  head: () => ({
    meta: [
      { title: `AI interviews: founders, researchers and leaders — ${SITE.name}` },
      { name: "description", content: "Long-form conversations with the people building and governing AI, on video and audio." },
    ],
  }),
  component: InterviewsPage,
});

function InterviewsPage() {
  const initial = Route.useLoaderData();
  const { data } = useMedia(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [kind, setKind] = useState<"all" | "video" | "audio">("all");
  const [limit, setLimit] = useState(12);
  const list = (data?.items ?? []).filter(m => m.interview && (kind === "all" || m.type === kind));

  const chip = (id: typeof kind, label: string) => (
    <button key={id} onClick={() => { setKind(id); setLimit(12); }} aria-pressed={kind === id}
      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border ${kind === id ? "bg-night text-white border-night" : "bg-surface border-line hover:border-night"}`}>
      {label}
    </button>
  );

  return (
    <PageShell>
      <PageIntro
        title={fr ? "Entrevues" : "Interviews"}
        dek={fr
          ? "De longues conversations avec ceux qui bâtissent et encadrent l'IA : fondateurs, chercheurs, dirigeants. En vidéo ou en audio."
          : "Long-form conversations with the people building and governing AI — founders, researchers and leaders. On video or audio."}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {chip("all", fr ? "Tout" : "All")}
          {chip("video", fr ? "Vidéo" : "Video")}
          {chip("audio", fr ? "Audio" : "Audio")}
        </div>
      </PageIntro>
      <div className="container-mw mt-10">
        {!data ? (
          <p className="dek">{t("loading", locale)}</p>
        ) : list.length === 0 ? (
          <p className="dek">{fr ? "Aucune entrevue récente pour le moment." : "No recent interviews right now."}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-3"><InterviewCard m={list[0]} large /></div>
            {list.slice(1, limit).map((m, i) => (
              <div key={m.id} className="contents">
                <InterviewCard m={m} />
                {i === 3 && <AdSlot size="mpu" placement="section" className="justify-center" />}
              </div>
            ))}
          </div>
        )}
        {list.length > limit && (
          <div className="text-center mt-12">
            <button onClick={() => setLimit(l => l + 12)} className="px-6 py-3 rounded-[4px] bg-night text-white font-semibold hover:bg-lake">
              {fr ? "Plus d'entrevues" : "More interviews"}
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
