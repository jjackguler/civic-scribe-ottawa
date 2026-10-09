import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, Printer, Trash2 } from "lucide-react";
import { PrintPortal, Stamp, YoungCrumbs, YoungShell, usePrint, useT } from "@/components/YoungLab";
import { SITE } from "@/lib/site";
import { seoHead } from "@/lib/seo";
import { ACTIVITIES, GROUP } from "@/lib/young-lab";
import { stampCount, useYoungProgress, type YoungState } from "@/lib/young-progress";
import { useHydrated } from "@/lib/labs-progress";

export const Route = createFileRoute("/labs/young/passport")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `My lab passport: Young Lab — ${SITE.name}`, fr: `Mon passeport du labo : Jeune Labo — ${SITE.name}` },
      description: {
        en: "Your Young Lab stamps, kept only in this browser. Nothing is sent anywhere.",
        fr: "Tes tampons du Jeune Labo, gardés seulement dans ce navigateur. Rien n'est envoyé.",
      },
      noindex: true,
    }),
  component: PassportPage,
});

function PassportGrid({ state, live }: { state: YoungState; live: boolean }) {
  const { fr, pick, t } = useT();
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(fr ? "fr-CA" : "en-CA", { day: "numeric", month: "long", year: "numeric" });
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
      {ACTIVITIES.map(a => {
        const s = live ? state.stamps[a.id] : undefined;
        return (
          <li key={a.id} className="flex flex-col items-center text-center">
            <Stamp activity={a} earned={!!s} size={128} />
            <p className="mt-2 font-extrabold leading-tight">{pick(a.title)}</p>
            <p className="text-[0.9rem] text-muted-ink">{s ? t(`Stamped ${fmt(s.at)}`, `Tamponné le ${fmt(s.at)}`) : pick(GROUP[a.group].title)}</p>
            {!s && live && <Link to="/labs/young/$activity" params={{ activity: a.id }} className="yl-no-print mt-1 inline-flex min-h-[44px] items-center font-bold text-lake underline underline-offset-4">{t("Play to earn it", "Joue pour l'obtenir")}</Link>}
          </li>
        );
      })}
    </ul>
  );
}

function PassportPage() {
  const { t } = useT();
  const hydrated = useHydrated();
  const { state, clear } = useYoungProgress();
  const [confirm, setConfirm] = useState(false);
  const { printing, print } = usePrint();
  const n = hydrated ? stampCount(state) : 0;
  const days = hydrated ? state.days.length : 0;

  return (
    <YoungShell>
      <header className="yl-tone-grape border-b-[3px] border-ink">
        <div className="container-mw pt-6 pb-10">
          <YoungCrumbs />
          <h1 className="yl-title yl-in text-[2.6rem] sm:text-[3.6rem] leading-[1] mt-5">{t("My lab passport", "Mon passeport du labo")}</h1>
          <p className="mt-3 text-[1.15rem] leading-relaxed max-w-[40rem]">{t("Finish a game to stamp it here. Your passport lives only in this browser, on this device.", "Termine un jeu pour le tamponner ici. Ton passeport vit seulement dans ce navigateur, sur cet appareil.")}</p>
        </div>
      </header>

      <div className="container-mw py-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="yl-card yl-passport p-5 sm:p-8" aria-label={t("Stamps", "Tampons")}>
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
            <p className="yl-title text-[1.6rem]">{t(`${n} of ${ACTIVITIES.length} stamps`, `${n} tampons sur ${ACTIVITIES.length}`)}</p>
            {n === ACTIVITIES.length && <p className="yl-chip pointer-events-none yl-tone-sun">{t("Every stamp! Lab legend.", "Tous les tampons! Légende du labo.")}</p>}
          </div>
          <PassportGrid state={state} live={hydrated} />
        </section>

        <aside className="grid gap-4">
          <div className="yl-card yl-tone-sun p-5">
            <p className="font-extrabold inline-flex items-center gap-2"><CalendarHeart className="h-5 w-5" aria-hidden="true" />{t("Lab days", "Jours de labo")}</p>
            <p className="yl-title text-[2.6rem] leading-none mt-2 tabular-nums">{days}</p>
            <p className="mt-2 leading-relaxed">{t("Days you earned a stamp. This number only goes up: there's no streak to lose, and breaks are good for brains.", "Les jours où tu as obtenu un tampon. Ce nombre ne fait que monter : pas de série à perdre, et les pauses font du bien au cerveau.")}</p>
          </div>
          <div className="yl-card bg-white p-5 grid gap-3">
            <button type="button" className="yl-btn" onClick={() => print(["passport"])}><Printer className="h-5 w-5" aria-hidden="true" />{t("Print my passport", "Imprimer mon passeport")}</button>
            {!confirm ? (
              <button type="button" className="yl-btn" disabled={n === 0 && days === 0} onClick={() => setConfirm(true)}><Trash2 className="h-5 w-5" aria-hidden="true" />{t("Clear my passport", "Effacer mon passeport")}</button>
            ) : (
              <div role="alertdialog" aria-labelledby="clear-q" className="rounded-[14px] border-[3px] border-ink p-4 yl-tone-coral">
                <p id="clear-q" className="font-extrabold">{t("Remove all stamps from this device?", "Retirer tous les tampons de cet appareil?")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="yl-btn yl-btn--ink" onClick={() => { clear(); setConfirm(false); }}>{t("Yes, clear", "Oui, effacer")}</button>
                  <button type="button" className="yl-btn" onClick={() => setConfirm(false)} autoFocus>{t("Keep them", "Les garder")}</button>
                </div>
              </div>
            )}
            <p className="text-[0.92rem] text-muted-ink">{t("We can't see your passport. Clearing your browser's site data removes it too.", "Nous ne voyons pas ton passeport. Effacer les données du site dans ton navigateur le supprime aussi.")}</p>
          </div>
        </aside>
      </div>

      {printing && (
        <PrintPortal>
          <div className="yl-sheet">
            <p className="yl-title text-[1.6rem]">{t("My lab passport", "Mon passeport du labo")} · AI Broadsheet Young Lab</p>
            <p className="mb-6">{t(`${n} of ${ACTIVITIES.length} stamps · ${days} lab days`, `${n} tampons sur ${ACTIVITIES.length} · ${days} jours de labo`)}</p>
            <PassportGrid state={state} live={hydrated} />
          </div>
        </PrintPortal>
      )}
    </YoungShell>
  );
}
