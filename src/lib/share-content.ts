/**
 * What goes on a share card, built from our own content: a dispatch, a story
 * in Today's stack, the quiz score, and the card of the day. Text only, no
 * photos; every card names who reported the news.
 */
import { stripMarkers, type Dispatch, type DispatchSummary } from "./dispatch-types";
import { SENSITIVE, dayLabel, type DailyQuiz } from "./youth-core";
import { absUrl } from "./seo";
import { displayUrl } from "./share";
import { outletsLine } from "./og/shapes";
import type { ShareCardContent } from "./share-cards";
import type { Locale } from "./i18n";

const reportedBy = (outlets: string[], locale: Locale) =>
  outlets.length ? `${locale === "fr" ? "D'après" : "Reported by"} ${outletsLine(outlets, locale, 3)}` : "";

const today = (locale: Locale) =>
  new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "America/Toronto" });

export function dispatchCard(d: Dispatch | DispatchSummary, locale: Locale): ShareCardContent {
  const c = d[locale];
  const outlets = "outlets" in d ? d.outlets : [...new Set(d.sources.map(s => s.outlet))];
  return {
    locale,
    kind: "article",
    kicker: locale === "fr" ? "Dépêche" : "Dispatch",
    headline: c.headline,
    line: c.news,
    source: reportedBy(outlets, locale),
    url: displayUrl(absUrl(`/dispatch/${d.id}`, locale)),
    seed: d.id,
    dateLabel: today(locale),
  };
}

export function storyCard(s: { id: string; kind: "dispatch" | "story"; kicker: string; headline: string; what: string; outlets: string[]; path: string }, locale: Locale): ShareCardContent {
  return {
    locale,
    kind: "article",
    kicker: s.kicker,
    headline: s.headline,
    line: s.what,
    source: reportedBy(s.outlets, locale),
    url: displayUrl(absUrl(s.path, locale)),
    seed: s.id,
    dateLabel: today(locale),
  };
}

export function quizCard(quiz: DailyQuiz, answers: (number | null)[], streak: number, locale: Locale): ShareCardContent {
  const qs = quiz[locale];
  const marks = qs.map((q, i) => answers[i] === q.answer);
  const score = marks.filter(Boolean).length;
  const name = locale === "fr" ? "Les 5 du Broadsheet" : "The Broadsheet 5";
  const day = dayLabel(quiz.day, locale);
  return {
    locale,
    kind: "quiz",
    kicker: locale === "fr" ? "Quiz du jour" : "Daily quiz",
    headline: `${name} · ${day}: ${score}/${qs.length}`,
    line: locale === "fr" ? `${name} : cinq questions sur les manchettes IA du jour.` : `${name}: five questions from today's AI headlines.`,
    source: `${name} · ${day}`,
    url: displayUrl(absUrl("/quiz", locale)),
    seed: `quiz-${quiz.day}`,
    quiz: { score, total: qs.length, marks, streak, dayLabel: day },
    dateLabel: today(locale),
  };
}

// ── card of the day ─────────────────────────────────────────────────────────
/**
 * A number worth repeating: an amount, a share, a count of people or places.
 * Version numbers and product names ("Aurora-2", "GPT-5") don't count.
 */
const NUMBER = /(?:(?:US|CA|C)?\$\s?|€\s?|£\s?)?\d[\d.,   ]*\d?\s?(?:%|percent|per cent|pour cent|billion|million|thousand|milliards?|millions?|bn\b|GW|MW|TWh|GWh|km|years?|ans\b|times|fois|jobs|emplois|countries|pays|languages|langues|students|élèves|people|personnes|workers|travailleurs|hours|heures|schools|écoles)(?:\s?(?:de dollars|\$))?|(?:US|CA|C)?\$\s?\d[\d.,]*(?:\s?(?:billion|million|bn|M|B)\b)?/i;

export function keyNumber(text: string): string | null {
  const m = NUMBER.exec(text);
  if (!m) return null;
  const before = text.slice(0, m.index).slice(-1);
  if (/[\p{L}\-‑]/u.test(before)) return null;
  const big = m[0].trim().replace(/\s+/g, " ");
  return big.length <= 16 ? big : null;
}

export type CardOfTheDayPick = {
  content: ShareCardContent;
  /** Where the card leads. */
  link: { to: "/dispatch/$id"; id: string } | { to: "/quiz" };
  /** The big fact, when there is one (else the headline is the hero). */
  big?: string;
  headline: string;
  line?: string;
  source?: string;
};

/**
 * The day's most share-worthy card: a key number from the newest dispatch,
 * else the newest dispatch's news in one line, else the daily quiz. Stories
 * about death, violence or abuse are never the card of the day.
 */
export function pickCardOfTheDay(dispatches: DispatchSummary[], full: Dispatch | null, quiz: DailyQuiz | null, locale: Locale, now = Date.now()): CardOfTheDayPick | null {
  const kicker = locale === "fr" ? "La carte du jour" : "Card of the day";
  const fresh = dispatches
    .filter(d => now - Date.parse(d.createdAt) < 36 * 3600_000)
    .filter(d => !SENSITIVE.test(`${d[locale].headline} ${d[locale].news}`));
  const d = fresh[0];
  if (d) {
    const c = d[locale];
    const base = dispatchCard(d, locale);
    // Look for the number in the news line first, then the 30-second lines and confirmed points.
    const fc = full && full.id === d.id ? full[locale] : null;
    const candidates = [c.news, ...(fc ? [...fc.thirty, ...fc.confirmed.map(x => x.text)] : []), c.matters ?? ""].map(stripMarkers).filter(Boolean);
    for (const sentence of candidates) {
      const big = keyNumber(sentence);
      if (big) {
        return {
          content: { ...base, kind: "fact", kicker, big, headline: sentence, line: c.headline },
          link: { to: "/dispatch/$id", id: d.id },
          big, headline: sentence, line: c.headline, source: base.source,
        };
      }
    }
    return {
      content: { ...base, kicker },
      link: { to: "/dispatch/$id", id: d.id },
      headline: c.headline, line: c.news, source: base.source,
    };
  }
  if (quiz && quiz[locale].length >= 3) {
    const headline = locale === "fr" ? "Cinq questions sur les manchettes IA du jour. Pouvez-vous toutes les réussir?" : "Five questions from today's AI headlines. Can you get them all?";
    const big = "5/5?";
    return {
      content: {
        locale, kind: "fact", kicker, big, headline,
        line: locale === "fr" ? "Les 5 du Broadsheet, le quiz quotidien." : "The Broadsheet 5, the daily quiz.",
        url: displayUrl(absUrl("/quiz", locale)), seed: `cotd-quiz-${quiz.day}`, dateLabel: today(locale),
      },
      link: { to: "/quiz" },
      big, headline,
    };
  }
  return null;
}
