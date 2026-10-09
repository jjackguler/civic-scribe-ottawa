import { Link } from "@tanstack/react-router";
import { ArrowRight, Info, Stamp as StampIcon } from "lucide-react";
import { ActivityCard, LeavesLink, YoungCrumbs, YoungShell, useT } from "@/components/YoungLab";
import { GROUP, OUTSIDE, YOUNG_CHECKED, byGroup, type Group } from "@/lib/young-lab";

/** The Explorers and Makers pages: their games, and for Makers the vetted outside courses. */
export function GroupPage({ group }: { group: Group }) {
  const { fr, pick, t } = useT();
  const g = GROUP[group];
  const other: Group = group === "explorers" ? "makers" : "explorers";
  const tone = group === "explorers" ? "yl-tone-sky" : "yl-tone-coral";
  const outside = OUTSIDE.filter(o => o.audience === "makers" || o.audience === "both");
  const checked = fr ? "9 octobre 2026" : "9 October 2026";
  return (
    <YoungShell>
      <header className={`${tone} border-b-[3px] border-ink`}>
        <div className="container-mw pt-6 pb-10 sm:pt-8 sm:pb-12">
          <YoungCrumbs />
          <p className="mt-6 inline-flex rounded-full bg-white border-[3px] border-ink px-3 py-1 font-extrabold">{pick(g.ages)}</p>
          <h1 className="yl-title yl-in text-[2.8rem] sm:text-[4rem] leading-[0.98] mt-3">{pick(g.title)}</h1>
          <p className="mt-3 text-[1.15rem] sm:text-[1.3rem] leading-relaxed max-w-[40rem]">{pick(g.dek)}</p>
        </div>
      </header>

      <div className="container-mw py-10 sm:py-12 grid gap-12">
        <section aria-labelledby="games">
          <h2 id="games" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t(`${byGroup(group).length} games`, `${byGroup(group).length} jeux`)}</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {byGroup(group).map(a => <li key={a.id} className="flex"><ActivityCard a={a} /></li>)}
          </ul>
        </section>

        {group === "makers" && (
          <section aria-labelledby="outside" className="grid gap-5">
            <div>
              <h2 id="outside" className="yl-title text-[1.9rem] sm:text-[2.3rem] leading-tight">{t("Ready for more? Free courses we checked", "Envie d'aller plus loin? Des cours gratuits vérifiés")}</h2>
              <p className="mt-2 text-[1.05rem] leading-relaxed max-w-[48rem]">
                {t(`These links leave AI Broadsheet for other websites, which have their own rules. Some ask you to make an account: talk to a parent or guardian first. Links checked ${checked}.`, `Ces liens quittent AI Broadsheet pour d'autres sites, qui ont leurs propres règles. Certains demandent un compte : parles-en d'abord à un parent ou tuteur. Liens vérifiés le ${checked}.`)}
              </p>
            </div>
            <ul className="grid gap-5 md:grid-cols-2">
              {outside.map(o => (
                <li key={o.id} className="yl-card bg-white p-5 flex flex-col">
                  <p className="font-bold text-[0.95rem] text-muted-ink">{o.who}</p>
                  <h3 className="yl-title text-[1.35rem] leading-tight mt-1">{pick(o.title)}</h3>
                  <p className="mt-2 leading-relaxed flex-1">{pick(o.note)}</p>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.95rem]">
                    <dt className="font-bold">{t("Ages", "Âge")}</dt><dd>{pick(o.ages)}</dd>
                    <dt className="font-bold">{t("Account", "Compte")}</dt><dd>{pick(o.account)}</dd>
                    <dt className="font-bold">{t("Language", "Langue")}</dt><dd>{pick(o.french)}</dd>
                  </dl>
                  <div className="mt-4"><LeavesLink href={fr && o.frUrl ? o.frUrl : o.url}>{t("Go to the course", "Aller au cours")}<span className="sr-only">: {pick(o.title)}</span></LeavesLink></div>
                </li>
              ))}
            </ul>
            <p className="flex gap-2 items-start text-[0.95rem] text-muted-ink max-w-[48rem]"><Info className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{t(`We list courses only; we earn nothing from them. Checked on ${YOUNG_CHECKED}. Spot a broken link? `, `Nous listons ces cours sans rien toucher. Vérifiés le ${YOUNG_CHECKED}. Un lien brisé? `)}<Link to="/corrections" className="font-bold text-lake underline underline-offset-4">{t("Tell the newsroom", "Écrivez à la rédaction")}</Link>.</span></p>
          </section>
        )}

        <section className="grid gap-5 md:grid-cols-2">
          <Link to={other === "explorers" ? "/labs/young/explorers" : "/labs/young/makers"} className={`yl-card yl-lift p-5 block ${other === "explorers" ? "yl-tone-sky" : "yl-tone-coral"}`}>
            <span className="block font-bold">{pick(GROUP[other].ages)}</span>
            <span className="block yl-title text-[1.6rem] mt-1">{t("Try the ", "Essaie les jeux ")}{pick(GROUP[other].title)}{t(" games", "")}</span>
            <span className="mt-3 inline-flex items-center gap-2 font-extrabold">{t("Go", "Allons-y")} <ArrowRight className="h-5 w-5" aria-hidden="true" /></span>
          </Link>
          <Link to="/labs/young/passport" className="yl-card yl-lift yl-tone-sun p-5 block">
            <span className="block font-bold">{t("Stamps stay on this device", "Les tampons restent sur cet appareil")}</span>
            <span className="block yl-title text-[1.6rem] mt-1">{t("My lab passport", "Mon passeport du labo")}</span>
            <span className="mt-3 inline-flex items-center gap-2 font-extrabold"><StampIcon className="h-5 w-5" aria-hidden="true" />{t("Open", "Ouvrir")}</span>
          </Link>
        </section>
      </div>
    </YoungShell>
  );
}
