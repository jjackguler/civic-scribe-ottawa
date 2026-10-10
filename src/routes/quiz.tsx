import { ogImageFor } from "@/lib/og/url";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { TodayLauncher } from "@/components/Today";
import { QuizPlayer, QUIZ_NAME, QUIZ_UNAVAILABLE, StreakFlame } from "@/components/Quiz";
import { dayLabel, getDailyQuizFast, useDailyQuiz, useQuizLocal, type DailyQuiz } from "@/lib/youth";
import { useLocale } from "@/lib/locale-context";
import { SITE } from "@/lib/site";
import { localeOf, seoHead } from "@/lib/seo";

type Search = { fixture?: 1 };

export const Route = createFileRoute("/quiz")({
  // Dev only: a quiz built from sample stories, since feeds and models are unreachable locally.
  validateSearch: (s: Record<string, unknown>): Search => (import.meta.env.DEV && String(s.fixture) === "1" ? { fixture: 1 as const } : {}),
  loaderDeps: ({ search }) => ({ fixture: search.fixture }),
  loader: async ({ deps }): Promise<DailyQuiz | null> => (import.meta.env.DEV && deps.fixture === 1 ? null : getDailyQuizFast()),
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `The Broadsheet 5: today's AI news quiz — ${SITE.name}`, fr: `Les 5 du Broadsheet : le quiz de l'actualité IA — ${SITE.name}` },
      description: {
        en: "Five questions from today's AI headlines, every answer linked to the story. Two minutes, a new quiz every day.",
        fr: "Cinq questions sur les manchettes IA du jour, chaque réponse liée à sa nouvelle. Deux minutes, un nouveau quiz chaque jour.",
      },
      image: ogImageFor("quiz", undefined, localeOf(match)),
      imageWidth: 1200, imageHeight: 630,
    }),
  component: QuizPage,
});

function QuizPage() {
  const initial = Route.useLoaderData();
  const { data: quiz, isLoading } = useDailyQuiz(initial);
  const { locale } = useLocale();
  const fr = locale === "fr";
  const { streak } = useQuizLocal();
  const qs = quiz?.[locale] ?? [];

  return (
    <PageShell>
      <header className="bg-night text-white">
        <div className="container-mw py-8 sm:py-10">
          <p className="text-[0.9rem] font-bold text-signal">
            {fr ? "Quiz quotidien" : "Daily news quiz"}
            {quiz && <> · <span suppressHydrationWarning>{dayLabel(quiz.day, locale)}</span></>}
          </p>
          <h1 className="masthead-serif mt-2 text-[2.6rem] leading-none sm:text-[3.6rem]">{QUIZ_NAME[locale]}</h1>
          <p className="mt-3 max-w-[52ch] font-serif text-[1.15rem] text-white/80">
            {fr ? "Cinq questions sur les manchettes IA du jour. Chaque réponse mène à sa nouvelle." : "Five questions from today's AI headlines. Every answer leads to its story."}
          </p>
          {streak > 0 && <p className="mt-4"><StreakFlame count={streak} dark /></p>}
          <TodayLauncher dark className="mt-6" />
        </div>
      </header>

      <div className="container-mw grid gap-x-12 gap-y-10 pb-16 pt-8 lg:grid-cols-[minmax(0,680px)_300px]">
        <div className="min-w-0">
          {qs.length >= 3 && quiz ? (
            <QuizPlayer quiz={quiz} />
          ) : isLoading ? (
            <p className="flex items-center gap-3 font-semibold"><span className="live-dot" aria-hidden="true" />{fr ? "Chargement du quiz…" : "Loading the quiz…"}</p>
          ) : (
            <div className="border-t-[3px] border-night pt-5">
              <p className="font-serif text-[1.2rem]">{QUIZ_UNAVAILABLE[locale]}</p>
              <Link to="/today" className="mt-4 inline-flex min-h-12 items-center gap-2 bg-night px-5 font-bold text-white hover:bg-lake">
                {fr ? "L'actualité en 60 secondes" : "Today in 60 seconds"} <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        <aside className="grid content-start gap-6">
          <section aria-labelledby="quiz-how-h" className="border-t-[3px] border-night pt-3">
            <h2 id="quiz-how-h" className="hl text-[1.15rem]">{fr ? "Comment ça marche" : "How it works"}</h2>
            <ul className="mt-2 grid gap-2 text-[0.95rem] leading-snug">
              <li>{fr ? "Les questions viennent des manchettes du jour et de nos dépêches. Chaque réponse renvoie à sa source." : "Questions come from today's headlines and our dispatches. Every answer links to its source."}</li>
              <li>{fr ? "Certaines peuvent être écrites avec l'IA : elles ne sont gardées que si la réponse figure mot pour mot dans le titre ou l'extrait." : "Some may be written with AI: they're kept only if the answer appears word for word in the headline or excerpt."}</li>
              <li>{fr ? "Pas de nouvelles tragiques en quiz : le malheur des gens n'est pas un jeu." : "No tragic stories as trivia: people's misfortune isn't a game."}</li>
              <li>{fr ? "Votre score et votre série restent sur cet appareil. Le partage n'envoie que le score." : "Your score and streak stay on this device. Sharing sends only the score."}</li>
            </ul>
            <Link to="/standards" className="mt-3 inline-flex min-h-11 items-center text-[0.92rem] font-semibold text-lake hover:underline">{fr ? "Nos normes" : "Our standards"}</Link>
          </section>
          <Link to="/today" className="group block bg-signal p-4 text-signal-ink">
            <span className="block text-[0.82rem] font-bold">{fr ? "Pas encore à jour?" : "Not caught up yet?"}</span>
            <span className="masthead-serif mt-1 block text-[1.5rem] leading-tight group-hover:underline">{fr ? "L'actualité en 60 secondes" : "Today in 60 seconds"}</span>
          </Link>
        </aside>
      </div>
    </PageShell>
  );
}
