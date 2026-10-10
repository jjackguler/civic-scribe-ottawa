/**
 * DEV ONLY (loaded by /dev/social under `vite dev`): every piece of the social
 * kit with sample content, for design review and screenshots.
 */
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "./PageShell";
import { CardOfTheDay, CardOfTheDayView } from "./CardOfTheDay";
import { ShareBar } from "./ShareBar";
import { ShareImageButton } from "./ShareSheet";
import { useLocale } from "@/lib/locale-context";
import { FIXTURES } from "@/lib/dispatch-fixture";
import { dispatchCard, keyNumber, storyCard, type CardOfTheDayPick } from "@/lib/share-content";
import { CARD_FORMATS, CARD_TEMPLATES, canvasToBlob, renderShareCard, type ShareCardContent } from "@/lib/share-cards";
import { ogImagePath } from "@/lib/og/url";
import { quizDay, dayLabel } from "@/lib/youth-core";

export default function SocialPreview() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const d = FIXTURES[0];
  const article = useMemo(() => dispatchCard(d, locale), [d, locale]);
  const day = quizDay();
  const quiz: ShareCardContent = useMemo(() => ({
    locale, kind: "quiz", kicker: fr ? "Quiz du jour" : "Daily quiz",
    headline: `${fr ? "Les 5 du Broadsheet" : "The Broadsheet 5"} · 4/5`,
    source: `${fr ? "Les 5 du Broadsheet" : "The Broadsheet 5"} · ${dayLabel(day, locale)}`,
    url: "aibroadsheet.com/quiz", seed: `quiz-${day}`,
    quiz: { score: 4, total: 5, marks: [true, true, false, true, true], streak: 3, dayLabel: dayLabel(day, locale) },
  }), [locale, fr, day]);
  const sentence = fr
    ? "Selon le bureau, 40 % des employeurs de la province utilisent déjà un outil d'IA pour trier les candidatures."
    : "The office says 40% of employers in the province already use an AI tool to screen job applications.";
  const big = keyNumber(sentence) ?? "40%";
  const factPick: CardOfTheDayPick = useMemo(() => {
    const base = dispatchCard(FIXTURES[1], locale);
    return {
      content: { ...base, kind: "fact", kicker: fr ? "La carte du jour" : "Card of the day", big, headline: sentence, line: FIXTURES[1][locale].headline },
      link: { to: "/dispatch/$id", id: FIXTURES[1].id },
      big, headline: sentence, line: FIXTURES[1][locale].headline, source: base.source,
    };
  }, [locale, fr, big, sentence]);
  const story = useMemo(() => storyCard({
    id: "fx-story", kind: "story", kicker: fr ? "Travail" : "Work",
    headline: fr ? "Des enseignants de l'Ontario testent un assistant d'IA pour corriger les devoirs" : "Ontario teachers trial an AI assistant for marking homework",
    what: fr ? "Trois conseils scolaires testent l'outil cette session, avec l'accord des parents." : "Three school boards are testing the tool this term, with parents' consent.",
    outlets: ["Harbour Post"], path: "/story/fx-story",
  }, locale), [locale, fr]);
  const sober = useMemo(() => storyCard({
    id: "fx-sober", kind: "story", kicker: fr ? "Sécurité" : "Safety",
    headline: fr ? "Un rapport sur les outils d'abus en ligne mène à de nouvelles règles de sécurité" : "Report on online abuse tools leads to new safety rules",
    what: fr ? "Le régulateur exige des plateformes qu'elles retirent ces outils en 30 jours." : "The regulator says platforms must remove the tools within 30 days.",
    outlets: ["Lakeshore Tribune", "Signal Quotidien"], path: "/story/fx-sober",
  }, locale), [locale, fr]);

  const samples: { id: string; label: string; content: ShareCardContent; url: string }[] = [
    { id: "article", label: fr ? "Dépêche" : "Dispatch", content: article, url: `/dispatch/${d.id}` },
    { id: "quiz", label: fr ? "Score du quiz" : "Quiz score", content: quiz, url: "/quiz" },
    { id: "fact", label: fr ? "Carte du jour (chiffre)" : "Card of the day (number)", content: factPick.content, url: `/dispatch/${FIXTURES[1].id}` },
    { id: "story", label: fr ? "Nouvelle (pile du jour)" : "Story (Today stack)", content: story, url: "/story/fx-story" },
    { id: "sober", label: fr ? "Sujet sensible (sobre)" : "Sensitive story (sober)", content: sober, url: "/story/fx-sober" },
  ];

  return (
    <PageShell>
      <div className="container-mw grid gap-12 py-10">
        <header>
          <p className="topic">Dev</p>
          <h1 className="hl text-[2.4rem]">{fr ? "Trousse sociale" : "Social kit"}</h1>
          <p className="dek mt-2">{fr ? "Contenu d'exemple. Ajoutez ?fixture=1 pour les dépêches d'exemple." : "Sample content. Add ?fixture=1 for the sample dispatches."}</p>
        </header>

        <section className="grid gap-6" data-testid="cotd">
          <h2 className="hl text-[1.4rem]">CardOfTheDay</h2>
          <CardOfTheDay />
          <CardOfTheDayView pick={factPick} />
        </section>

        <section className="grid gap-4">
          <h2 className="hl text-[1.4rem]">{fr ? "Partager en image" : "Share as image"}</h2>
          <ul className="flex flex-wrap gap-3">
            {samples.map(s => (
              <li key={s.id} data-testid={`share-${s.id}`} className="grid gap-1">
                <span className="meta">{s.label}</span>
                <ShareImageButton content={s.content} url={s.url} title={s.content.headline} campaign="dev" />
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4">
          <h2 className="hl text-[1.4rem]">ShareBar</h2>
          <ShareBar url={`/dispatch/${d.id}`} title={d[locale].headline} campaign="dispatch" />
          <div className="bg-night p-5"><ShareBar url="/quiz" title="The Broadsheet 5" campaign="quiz" tone="dark" /></div>
        </section>

        <AllCards samples={samples} />

        <section className="grid gap-4" data-testid="og">
          <h2 className="hl text-[1.4rem]">Open Graph (1200×630)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              `${ogImagePath("article", d.id, locale, { version: "fixture" })}&fixture=1`,
              ogImagePath("quiz", undefined, locale),
              ogImagePath("section", "policy", locale),
              ogImagePath("section", "dispatch", locale),
            ].map(src => (
              <a key={src} href={src} className="block border border-line bg-surface p-2">
                <img src={src} alt="" width={1200} height={630} className="h-auto w-full" loading="lazy" />
                <span className="meta mt-1 block break-all">{src}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

/** Every template × size for each sample, rendered straight to images. */
function AllCards({ samples }: { samples: { id: string; content: ShareCardContent }[] }) {
  const [imgs, setImgs] = useState<{ key: string; src: string }[]>([]);
  const [show, setShow] = useState(false);
  useEffect(() => setShow(/[?&]cards=1\b/.test(window.location.search)), []);
  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    (async () => {
      const out: { key: string; src: string }[] = [];
      for (const s of samples) for (const t of CARD_TEMPLATES) for (const f of CARD_FORMATS) {
        const cv = await renderShareCard(s.content, t.id, f.id);
        out.push({ key: `${s.id}-${t.id}-${f.id}`, src: URL.createObjectURL(await canvasToBlob(cv)) });
      }
      if (!cancelled) setImgs(out);
    })();
    return () => { cancelled = true; };
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!show) return <p className="meta">Add ?cards=1 to render every card.</p>;
  return (
    <section className="grid gap-4" data-testid="all-cards" data-count={imgs.length}>
      <h2 className="hl text-[1.4rem]">All cards</h2>
      <div className="flex flex-wrap items-start gap-3">
        {imgs.map(i => (
          <figure key={i.key} data-card={i.key} className="w-[220px]">
            <img src={i.src} alt={i.key} className="w-full border border-line" />
            <figcaption className="meta">{i.key}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
