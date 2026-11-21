/**
 * The end of every Young Lab game page, under "The big idea":
 *
 * 1. "Play next": two games picked for this player. Games they have not stamped
 *    yet come first, same age group first, in lab order after this one. Read
 *    only from this browser's own stamps (young-progress.ts); nothing is sent.
 * 2. "For teachers and parents": the weekly newsletter, signed up on beehiiv
 *    through /newsletter (beehiiv form, optional school name). UTM tags say which game the sign-up came
 *    from (utm_source=aibroadsheet, utm_medium=younglab, utm_campaign=<game id>),
 *    so beehiiv's acquisition source shows which games bring teachers.
 *    Addressed to grown-ups and marked as leaving the site, like every outside link.
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap } from "lucide-react";
import { ACTIVITY_ICON, toneClass, useT } from "@/components/YoungLab";
import { useLocale } from "@/lib/locale-context";
import { ACTIVITIES, GROUP, type Activity } from "@/lib/young-lab";
import { useYoungProgress, type YoungState } from "@/lib/young-progress";
import { useHydrated } from "@/lib/labs-progress";
import { SITE } from "@/lib/site";

/** Two games to play next: unstamped before stamped, own group before the other, then lab order after `a`. */
export function pickNext(a: Activity, state: YoungState, count = 2): Activity[] {
  const after = (x: Activity) => (x.n - a.n + ACTIVITIES.length) % ACTIVITIES.length;
  return ACTIVITIES.filter((x) => x.id !== a.id)
    .map((x) => ({ x, key: [state.stamps[x.id] ? 1 : 0, x.group === a.group ? 0 : 1, after(x)] }))
    .sort((p, q) => p.key[0] - q.key[0] || p.key[1] - q.key[1] || p.key[2] - q.key[2])
    .slice(0, count)
    .map((p) => p.x);
}

/**
 * The newsletter sign-up link for a game, with UTM tags. Goes to /newsletter, whose
 * beehiiv form asks for an optional school name and passes the UTM tags on.
 */
export function teacherSignupUrl(gameId: string, fr = false): string {
  const q = new URLSearchParams({
    utm_source: "aibroadsheet",
    utm_medium: "younglab",
    utm_campaign: gameId,
  });
  return `${fr ? "/fr" : ""}/newsletter?${q.toString()}`;
}

export function GameEnd({ a }: { a: Activity }) {
  const { pick, t } = useT();
  const { locale } = useLocale();
  const hydrated = useHydrated();
  const { state } = useYoungProgress();
  // Before hydration, pretend nothing is stamped so server and client agree.
  const next = pickNext(a, hydrated ? state : { stamps: {}, days: [] });
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <section aria-labelledby={`next-${a.id}`} className="yl-card p-5 sm:p-6">
        <h2 id={`next-${a.id}`} className="yl-title text-[1.6rem] leading-tight">
          {t("Play next", "À jouer ensuite")}
        </h2>
        <ul className="mt-4 grid gap-3">
          {next.map((x) => {
            const Icon = ACTIVITY_ICON[x.id];
            const done = hydrated && !!state.stamps[x.id];
            return (
              <li key={x.id}>
                <Link
                  to="/labs/young/$activity"
                  params={{ activity: x.id }}
                  className={`yl-card yl-lift group flex items-center gap-4 p-4 ${toneClass(x.tone)}`}
                >
                  <span className="grid place-items-center h-12 w-12 shrink-0 rounded-[14px] bg-white border-[3px] border-ink">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block yl-title text-[1.25rem] leading-tight">
                      {pick(x.title)}
                    </span>
                    <span className="block text-[0.92rem] font-semibold mt-0.5">
                      {pick(GROUP[x.group].ages)} ·{" "}
                      {t(`about ${x.minutes} min`, `env. ${x.minutes} min`)}
                      {done ? ` · ${t("stamp earned", "tampon obtenu")}` : ""}
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby={`grownups-${a.id}`} className="yl-card yl-tone-mint p-5 sm:p-6">
        <p className="font-extrabold inline-flex items-center gap-2 text-[0.95rem]">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
          {t("For teachers and parents", "Pour les enseignants et les parents")}
        </p>
        <h2 id={`grownups-${a.id}`} className="yl-title text-[1.6rem] leading-tight mt-2">
          {t(
            "New Young Lab games and lesson ideas, by email",
            "Nouveaux jeux et idées de cours, par courriel",
          )}
        </h2>
        <p className="mt-2 text-[1.02rem] leading-relaxed">
          {t(
            `${SITE.newsletter.name.en}: once a week, free. New games and printables for class, and what changed in AI for Canada, with every source named. One click to unsubscribe.`,
            `${SITE.newsletter.name.fr} : une fois par semaine, gratuit. Nouveaux jeux et fiches pour la classe, et ce qui a changé en IA pour le Canada, sources nommées. Désabonnement en un clic.`,
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={teacherSignupUrl(a.id, locale === "fr")} className="yl-btn yl-tone-sun">
            {t("Subscribe free", "M'abonner gratuitement")}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
          <Link to="/labs/young/classroom" className="yl-btn">
            {t("Classroom mode", "Mode classe")}
          </Link>
        </div>
        <p className="mt-3 text-[0.85rem] text-muted-ink">
          {t(
            "Grown-ups only: the sign-up form is beehiiv's, our newsletter service. ",
            "Réservé aux adultes : le formulaire d'inscription est celui de beehiiv, notre service d'infolettre. ",
          )}
          <Link to="/privacy" hash="newsletter" className="underline underline-offset-4">
            {t("Privacy", "Confidentialité")}
          </Link>
        </p>
      </section>
    </div>
  );
}
