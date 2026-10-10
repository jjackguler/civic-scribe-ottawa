/**
 * The copy desk's mechanical checks. No model involved.
 *
 * Fact guard: the AI desk's `unsupported()` (src/lib/ai-desk.server.ts), with
 * the Dispatch desk's extensions ported here: sentence-starting function words
 * are allowed, French elisions are taken off, and every field is checked on
 * its own. Every number and every capitalised name must appear in the
 * reporting the article was written from, or in our own background text
 * passed to the reporter. One miss rejects the draft.
 *
 * House style: no exclamation marks, no hype words, a headline that is a
 * statement, every reporting paragraph tied to a source, honest length.
 */
import { unsupported } from "../../src/lib/ai-desk.server";
import { countWords, stripAllMarkers } from "../../src/lib/newsroom-types";
import { markerKeys, type Draft } from "./shape";

/**
 * Ordinary words that may start a sentence without appearing in the sources.
 * Function words only: no nouns ("Experts", "Critics") and no dates ("Today"),
 * which would let invented facts through. Same list as the Dispatch desk.
 */
const STARTERS = (
  "whether when where while what which who whom whose why how both several some many most few neither either none no not nor " +
  "however meanwhile still also yet so then there here they them their he she his her we our you your it its if although though " +
  "because since until unless instead rather only even just each every all any another other such same than once again already " +
  "according among across about between during without within against despite beyond like unlike including is are was were has have " +
  "had do does did can could may might will would should must one that this these those but and or for in on at by to of with from " +
  "under over after before as into the a an not more less much nothing nobody someone something anything everything " +
  "il elle ils elles on nous vous ce cet cette ces c ca que qui quoi quel quelle quels quelles lorsque quand comment pourquoi ou " +
  "si mais donc ni car ainsi aussi encore toujours deja plus moins tres peu beaucoup plusieurs certains certaines chaque tous toutes " +
  "tout toute aucun aucune autre autres meme selon dans pour par sur sous avec sans entre depuis pendant avant apres jusqu reste rien " +
  "personne cependant toutefois pourtant neanmoins alors puis enfin notamment y est sont a ont etait sera pourrait peut doit fait ne pas " +
  "le la les un une des du de au aux son sa ses leur leurs en et oui non " +
  "combien chez vers parmi malgre grace puisque parce lors desormais ensuite environ pres voici"
).split(" ");

/** Our own name may appear in our copy. */
const HOUSE = ["broadsheet"];

/** French elisions ("l'", "d'", "qu'") hide the word after them; take them off so that word is checked. */
const unElide = (s: string) => s.replace(/(^|[\s«“"(])(?:[LDJMNSTC]|Qu|Jusqu|Lorsqu|Puisqu)['’](?=\p{L})/giu, "$1");

/** French ordinals ("9e", "12e année", "1er", "2nde") are the number itself: check the number. */
const unOrdinal = (s: string) => s.replace(/(\d)(?:er|re|ère|e|es|ème|eme|nde?)(?![\p{L}\p{N}])/gu, "$1");

/** Names and numbers in `fields` that `sourceText` doesn't contain. Empty = passes. */
export function factGuard(fields: string[], sourceText: string): string[] {
  const src = unElide(sourceText);
  const bad = new Set<string>();
  for (const f of fields) {
    if (!f) continue;
    for (const w of unsupported(unOrdinal(unElide(stripAllMarkers(f))), src, [...STARTERS, ...HOUSE])) bad.add(w);
  }
  return [...bad];
}

/** Every field of a reporter's or translator's draft, one at a time. */
export function draftFields(d: Draft): string[] {
  return [
    d.headline, d.dek, d.news, ...d.thirty, d.matters, ...d.unknown,
    ...d.confirmed.map(x => x.text), ...d.claimed.flatMap(x => [x.text, x.by]),
    ...d.timeline.flatMap(x => [x.when, x.text]),
    ...d.sections.flatMap(s => s.paras),
    ...d.body.plain, ...d.body.expert,
  ];
}

/**
 * Our words, not theirs: any run of 9 or more words shared with an outlet's
 * excerpt or headline (outside quotation marks) is too close to their writing.
 */
export function overlapProblems(d: Draft, sources: { outlet: string; text: string }[], n = 9): string[] {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[“”«»"][^“”«»"]*[“”«»"]/g, " | ").split(/[^a-z0-9|]+/).filter(Boolean);
  const grams = (ws: string[]) => {
    const out = new Set<string>();
    for (let i = 0; i + n <= ws.length; i++) { const g = ws.slice(i, i + n); if (!g.includes("|")) out.add(g.join(" ")); }
    return out;
  };
  const ours = grams(norm(stripAllMarkers(draftFields(d).join(" | "))));
  const problems: string[] = [];
  for (const s of sources) {
    const hit = [...grams(norm(s.text))].find(g => ours.has(g));
    if (hit) problems.push(`Too close to ${s.outlet}'s wording ("${hit}…"): say it in our own words, or quote and attribute it.`);
  }
  return problems;
}

export const HYPE = /\b(breaking|shock\w*|stunning|game[- ]?chang\w*|revolution\w*|unprecedented|bombshell|mind[- ]?blowing|insane|terrifying|apocalyp\w*|doom\w*|jaw[- ]?dropping|explosive|choc|boulevers\w*|révolution\w*|incroyable\w*|stupéfiant\w*|terrifiant\w*|sans précédent)\b/i;

/** House-style problems a copy editor fixes. Empty = clean. */
export function styleProblems(d: Draft, lang: "en" | "fr"): string[] {
  const out: string[] = [];
  const all = draftFields(d).join("\n");
  if (/!/.test(all)) out.push("Remove every exclamation mark.");
  const hype = all.match(HYPE);
  if (hype) out.push(`Remove the hype word "${hype[0]}".`);
  if (/[?]/.test(d.headline)) out.push("The headline must be a statement, not a question.");
  if (d.headline.length < 40 || d.headline.length > 110) out.push(`The headline must be 40 to 110 characters (it is ${d.headline.length}).`);
  if (/\b[A-Z]{5,}\b/.test(d.headline.replace(/\b(OpenAI|NVIDIA|UNESCO|NATO|OECD|CIFAR)\b/g, ""))) out.push("No words in ALL CAPS in the headline.");
  const words = countWords(d.sections.flatMap(s => s.paras));
  const [min, max] = lang === "fr" ? [150, 700] : [150, 600];
  if (words < min) out.push(`The article is too thin (${words} words): skip the event rather than pad it.`);
  if (words > max) out.push(`The article is too long (${words} words): cut to at most 550 words.`);
  for (const s of d.sections) {
    s.paras.forEach((p, i) => {
      const keys = markerKeys(p);
      const hasSrc = keys.some(k => k.startsWith("s"));
      const hasBg = keys.some(k => k.startsWith("b"));
      if (s.kind === "background" && !hasBg) out.push(`Background paragraph ${i + 1} must cite our background text with a [bN] marker, or be removed.`);
      if (s.kind !== "background" && !hasSrc) out.push(`Paragraph ${i + 1} of "${s.kind}" has no [sN] source marker.`);
    });
  }
  if (!d.sections.some(s => s.kind === "news" && s.paras.length)) out.push("The article must open with the news.");
  return out;
}
