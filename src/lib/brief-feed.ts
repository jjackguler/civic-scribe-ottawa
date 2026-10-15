import type { Locale } from "./i18n";
import { NEWSROOM_RAW, type NewsroomSummary } from "./newsroom-types";
import { originalPublishable, type Original } from "./originals-types";

export type BriefSource = { name: string; url: string };
export type Brief = {
  id: string;
  title: string;
  summary: string;
  context: string;
  caveat: string;
  topic: string;
  format: "brief" | "carousel" | "video";
  date?: string;
  image?: string;
  video?: string;
  duration?: number;
  path: string;
  coverWord?: string;
  sources: BriefSource[];
  aiLabel: string;
  transcript?: string;
  credits?: string;
};

/** Original evergreen explanations, never presented as today's breaking news. */
export function starterBriefs(locale: Locale): Brief[] {
  const fr = locale === "fr";
  const prefix = fr ? "/fr" : "";
  return [
    {
      id: "read-the-number",
      topic: fr ? "Culture IA" : "AI literacy",
      format: "carousel",
      title: fr ? "Le score ne raconte pas toute l’histoire." : "The score isn’t the whole story.",
      summary: fr
        ? "Un bon résultat à un test d’IA ne garantit pas la même performance dans la vie réelle."
        : "An impressive AI benchmark measures a defined test. Your actual task can be a different test entirely.",
      context: fr
        ? "Le NIST distingue le résultat sur un test fixe de la performance estimée sur un ensemble plus large de tâches similaires. Les hypothèses et l’incertitude comptent."
        : "NIST distinguishes accuracy on a fixed benchmark from estimated performance across a wider set of similar tasks. The assumptions and uncertainty behind the number matter.",
      caveat: fr
        ? "Demandez ce qui a été testé, par qui et dans quelles conditions. Cette explication ne classe aucun modèle."
        : "Ask what was tested, who ran it and under what conditions. This explainer does not rank any particular model.",
      image: "/brief/benchmark.webp",
      path: prefix + "/app?story=read-the-number",
      sources: [
        {
          name: "NIST · AI 800-3 · February 2026",
          url: "https://www.nist.gov/publications/expanding-ai-evaluation-toolbox-statistical-models",
        },
      ],
      aiLabel: fr ? "Illustration IA · texte assisté par IA" : "AI illustration · AI-assisted text",
    },
    {
      id: "find-the-cracks",
      topic: fr ? "Culture IA" : "AI literacy",
      format: "brief",
      title: fr ? "Ils cherchent les failles. Exprès." : "They’re trying to break it. On purpose.",
      summary: fr
        ? "Une équipe rouge pousse un système vers l’échec pour découvrir ses points faibles."
        : "An AI red team pushes a system toward failure so its weak spots can be found and fixed.",
      context: fr
        ? "Selon le NIST, cette démarche structurée emploie souvent des méthodes adverses. L’IMDA souligne le rôle des langues, des cultures et de l’expertise des testeurs."
        : "NIST describes a structured test that often uses adversarial methods. Singapore’s IMDA shows why testers’ expertise, languages and cultural contexts affect what gets found.",
      caveat: fr
        ? "Ne pas trouver de faille pendant un exercice ne prouve pas qu’il n’en existe aucune. Testez uniquement des systèmes pour lesquels vous avez une autorisation."
        : "Finding no failure in one exercise does not prove there are none. Test only systems you are authorized to test.",
      image: "/brief/red-team.webp",
      path: prefix + "/app?story=find-the-cracks",
      sources: [
        { name: "NIST · Red teaming", url: "https://csrc.nist.gov/glossary/term/red_teaming" },
        {
          name: "Singapore IMDA · January 2025",
          url: "https://www.imda.gov.sg/resources/blog/blog-articles/2025/01/red-teaming-challenge",
        },
      ],
      aiLabel: fr ? "Illustration IA · texte assisté par IA" : "AI illustration · AI-assisted text",
    },
    {
      id: "benchmark-in-18",
      topic: fr ? "Culture IA" : "AI literacy",
      format: "video",
      title: fr ? "Un grand score. Une petite question." : "Big score. One small question.",
      summary: fr
        ? "Avant de croire un classement d’IA, demandez : que mesure-t-il vraiment ?"
        : "Before you trust an AI leaderboard, ask: what does it actually measure?",
      context: fr
        ? "Un test contrôlé fournit des indices utiles. Les outils, les questions et le contexte de déploiement peuvent changer les résultats."
        : "A controlled test provides useful evidence. Different tools, questions and deployment conditions can change the result.",
      caveat: fr
        ? "Vidéo muette avec texte à l’écran. Aucune garantie de performance dans le monde réel."
        : "Silent edit with on-screen text. A benchmark is evidence, not a guarantee of real-world performance.",
      image: "/brief/benchmark.webp",
      video: "/brief/benchmark-18.mp4",
      duration: 18,
      path: prefix + "/app?story=benchmark-in-18",
      sources: [
        {
          name: "NIST · AI 800-3 · February 2026",
          url: "https://www.nist.gov/publications/expanding-ai-evaluation-toolbox-statistical-models",
        },
      ],
      aiLabel: fr ? "Illustration IA · montage original" : "AI illustration · original edit",
      transcript: fr
        ? "Un score élevé ne garantit rien. Il mesure un test défini. Demandez ce qui a été testé, par qui et dans quelles conditions."
        : "A high benchmark score isn’t a promise. It measures one defined test under set conditions. Change the data, tools or time limit, and the score can change. Real users add messy context the test may miss. Ask what was tested, by whom and under what conditions.",
    },
  ];
}

export function newsroomBrief(a: NewsroomSummary, locale: Locale): Brief {
  const c = a[locale];
  return {
    id: "article-" + a.id,
    title: c.headline,
    summary: c.dek || c.news,
    context: c.matters || c.news,
    caveat:
      locale === "fr"
        ? "Consultez l’article complet pour les sources, les limites et les mises à jour."
        : "Open the full article for its source ledger, limitations and updates.",
    topic: a.topic,
    format: "carousel",
    date: a.updatedAt,
    coverWord: a.cover[locale].big,
    image: a.cover.illustration
      ? `${NEWSROOM_RAW}/${a.cover.illustration.path.replace(/^\/+/, "")}`
      : undefined,
    path: `${locale === "fr" ? "/fr" : ""}/article/${a.slug[locale]}`,
    // The summary index contains outlet names, not URLs. Never invent source links.
    sources: [],
    aiLabel: locale === "fr" ? "Rédaction assistée par IA" : "AI-assisted reporting",
  };
}

export function originalBrief(o: Original, locale: Locale = "en"): Brief {
  return {
    id: "video-" + o.id,
    title: o.title,
    summary: o.summary,
    context: o.transcript,
    caveat:
      "This is an AI-assisted explainer. Check the linked reporting for the original evidence.",
    topic: locale === "fr" ? "Originals · EN" : "Originals",
    format: "video",
    date: o.publishedAt,
    image: o.posterUrl,
    video: o.fileUrl,
    duration: o.durationSec,
    path: `${locale === "fr" ? "/fr" : ""}/app?story=video-${o.id}`,
    sources: o.sources,
    transcript: o.transcript,
    credits: o.credits,
    aiLabel: o.aiImages ? "AI visuals & voice" : "AI voice · credits in sources",
  };
}

export function buildBriefFeed(
  articles: NewsroomSummary[],
  originals: Original[],
  locale: Locale,
): Brief[] {
  const news = articles
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 20)
    .map((a) => newsroomBrief(a, locale));
  // Only site-owned, publishable files enter the native player. No third-party autoplay iframe.
  const videos = originals
    .filter((o) => o.kind !== "titles" && originalPublishable(o) && !!o.fileUrl)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 8)
    .map((o) => originalBrief(o, locale));
  const feed: Brief[] = [];
  const seeds = starterBriefs(locale);
  if (news[0]) feed.push(news.shift()!);
  else feed.push(seeds.shift()!);
  if (videos[0]) feed.push(videos.shift()!);
  feed.push(...seeds, ...news, ...videos);
  return [...new Map(feed.map((item) => [item.id, item])).values()];
}

export const BRIEF_SAVED_KEY = "ab-brief-saved-v1";
/** Bound local metadata; never store full transcripts, video or external article content. */
export function parseBriefSaved(raw: string | null): Brief[] {
  try {
    const data: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    return data
      .flatMap((item: unknown): Brief[] => {
        if (!item || typeof item !== "object") return [];
        const s = item as Brief;
        if (
          typeof s.id !== "string" ||
          !s.id ||
          s.id.length > 200 ||
          seen.has(s.id) ||
          typeof s.title !== "string" ||
          !s.title.trim()
        )
          return [];
        if (
          typeof s.path !== "string" ||
          !/^\/(?:fr\/)?(?:app\?story=[\w-]+|article\/[\w%-]+|original\/[\w%-]+)$/.test(s.path) ||
          /%(?:2f|5c|00)/i.test(s.path)
        )
          return [];
        seen.add(s.id);
        const text = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
        const asset = (v: unknown) =>
          typeof v === "string" && (/^https:\/\//.test(v) || /^\/(?!\/)/.test(v))
            ? v.slice(0, 2000)
            : undefined;
        return [
          {
            id: s.id,
            path: s.path,
            title: text(s.title, 300),
            summary: text(s.summary, 1400),
            context: text(s.context, 1400),
            caveat: text(s.caveat, 800),
            topic: text(s.topic, 80),
            format: s.format === "video" ? "video" : s.format === "carousel" ? "carousel" : "brief",
            date: text(s.date, 40) || undefined,
            image: asset(s.image),
            video: asset(s.video),
            duration:
              typeof s.duration === "number" ? Math.min(Math.max(s.duration, 0), 3600) : undefined,
            aiLabel: text(s.aiLabel, 150),
            coverWord: text(s.coverWord, 60) || undefined,
            sources: Array.isArray(s.sources)
              ? s.sources
                  .filter(
                    (x) =>
                      x &&
                      typeof x.name === "string" &&
                      typeof x.url === "string" &&
                      /^https:\/\//.test(x.url),
                  )
                  .slice(0, 12)
                  .map((x) => ({ name: x.name.slice(0, 160), url: x.url.slice(0, 2000) }))
              : [],
          },
        ];
      })
      .slice(0, 100);
  } catch {
    return [];
  }
}

export function briefShareUrl(brief: Brief): string {
  const host = /^\/(?:fr\/)?app(?:\?|$)/.test(brief.path)
    ? "https://app.aibroadsheet.com"
    : "https://aibroadsheet.com";
  return host + brief.path;
}
