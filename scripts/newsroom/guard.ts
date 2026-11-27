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
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import wordListPath from "word-list";
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

// These are connective adverbs, not names. Exempt them only at the start of a
// sentence; a capitalised word elsewhere may still be a person or place.
const CONNECTIVES = new Set(["alongside", "architecturally", "inside", "instead", "meanwhile", "nevertheless", "therefore"]);
const lowerConnectives = (s: string) => s.replace(/(^|[.!?]\s+)([A-Z][a-z]+)(?=\b)/g,
  (match, prefix: string, word: string) => CONNECTIVES.has(word.toLowerCase()) ? prefix + word.toLowerCase() : match);

/**
 * Ordinary sentence openers that carry no fact of their own: "-ly" adverbs
 * ("Additionally", "Currently") and generic groups of people or things
 * ("Users", "Developers"). Exempt only at the start of a sentence. Words that
 * would invent an attribution ("Experts", "Critics", "Officials",
 * "Researchers") stay out on purpose.
 */
const GENERIC = new Set((
  "users people developers programmers residents consumers customers businesses companies organisations organizations " +
  "workers employees parents children students teachers families readers creators artists citizens governments " +
  "software tools models systems products services platforms ordinary everyday reporting further furthermore moreover " +
  "overall elsewhere together anyone everyone"
).split(" "));
/**
 * Sentence-opening adverbs, by name. Not every capitalised "-ly" word: surnames
 * end that way too ("Connolly says…", "Reilly told…") and must be in the sources.
 */
const ADVERBS = new Set((
  "additionally currently previously crucially notably importantly initially finally similarly separately specifically " +
  "ultimately consequently accordingly alternatively essentially generally typically historically technically effectively " +
  "eventually increasingly publicly officially originally practically primarily mainly largely partly fundamentally " +
  "subsequently simultaneously conversely likewise secondly thirdly firstly lastly overall"
).split(" "));
// "Residents say…", "Users told…" would put words in people's mouths: those keep the capital and must be in the sources.
const SPEAKS = /^\s+(?:\w+\s+)?(?:say|says|said|told|tell|claim\w*|warn\w*|argue\w*|believe\w*|complain\w*|fear\w*|worr\w*|report\w*|describe\w*|think|thinks|feel|feels|want|wants|demand\w*|criticis\w*|criticiz\w*|prais\w*|welcom\w*|object\w*|agree\w*|disagree\w*)\b/i;
const lowerGenericStarts = (s: string) => s.replace(/(^|[.!?:;]\s+|\s[—–-]\s)([A-Z][a-z]+)(?=\b)/g,
  (match, prefix: string, word: string, at: number, all: string) => {
    const w = word.toLowerCase();
    const adverb = ADVERBS.has(w);
    if (!adverb && !(GENERIC.has(w) && !SPEAKS.test(all.slice(at + match.length, at + match.length + 40)))) return match;
    return prefix + w;
  });

/**
 * Standard acronyms and their plurals: ordinary vocabulary, not names. "LLMs", "GPUs" and
 * "APIs" are no more a fact than "models" or "chips". Product and company names never go here.
 */
const ACRONYMS = (
  "ai ia agi ml nlp llm llms gpu gpus cpu cpus tpu tpus npu npus api apis ui ux os pc pcs it iot vr ar xr ceo ceos cto cfo coo " +
  "ipo ipos saas faq faqs pdf pdfs url urls sms gps cloud rd pme pmes ong ia-g qa sdk sdks hr kpi kpis b2b b2c " +
  // The site's own two languages: "English-language", "French-speaking" name no fact.
  "english french anglais francais"
).split(" ");

/**
 * English and French dictionary words (MIT word lists), lowercase. Loaded once, on first use.
 * Sentence-initial ordinary words ("Falling", "Hardware", "Advancements", "Technological") are
 * no fact of their own; names are checked as before.
 */
let DICT: Set<string> | null = null;
function dictionary(): Set<string> {
  if (DICT) return DICT;
  const en = readFileSync(wordListPath, "utf8").split("\n");
  const fr = createRequire(import.meta.url)("an-array-of-french-words") as string[];
  DICT = new Set([...en, ...fr].map(w => w.trim().toLowerCase()).filter(Boolean));
  return DICT;
}

/**
 * Dictionary words that are also names of companies, products, places or people the news is
 * about. At the start of a sentence they still have to be in the sources.
 */
const NAMES_IN_DICTIONARY = new Set((
  "apple meta amazon oracle shell visa intel tesla llama cohere anthropic grok perplexity mistral gemini claude copilot " +
  "alexa falcon sage slack zoom square stripe notion figure palantir telegram discord bard pi phi jasper midjourney " +
  "runway suno pika cursor replit hugging mila vector databricks snowflake adobe sony samsung " +
  "paris china turkey jordan chad georgia victoria regina hamilton windsor kingston nice bath florence york " +
  "washington lincoln jackson ottawa montreal toronto quebec canada america europe africa asia india japan korea france germany " +
  "britain ireland israel iran iraq russia ukraine poland brazil mexico chile peru cuba egypt kenya nigeria " +
  "jack mark bill grace rose june april august " +
  "parliament senate congress commons supreme crown"
).split(" "));

/** Generic nouns that would invent an attribution ("Experts", "Critics"): never exempt. */
const ATTRIBUTORS = new Set((
  "experts expert critics critic officials official researchers researcher analysts analyst scientists scientist sources source " +
  "insiders insider regulators regulator lawmakers lawmaker observers observer executives executive spokesperson spokespeople " +
  "authorities investors investor economists economist doctors doctor lawyers lawyer studies study reports report polls poll surveys survey " +
  "experts experte expertes critiques responsables chercheurs chercheuses analystes scientifiques sources autorites investisseurs"
).split(" "));

/** Capitalised words used mid-sentence anywhere in the copy: those are names, wherever else they appear. */
function midSentenceNames(fields: string[]): Set<string> {
  const out = new Set<string>();
  for (const f of fields) {
    for (const sentence of stripAllMarkers(f).split(/(?<=[.!?:;])\s+|\s[—–-]\s/)) {
      const words = sentence.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? [];
      words.forEach((w, i) => { if (i > 0 && /^\p{Lu}/u.test(w)) out.add(w.replace(/['’]s$/i, "").replace(/[.'’-]+$/, "").toLowerCase()); });
    }
  }
  return out;
}

/**
 * Sentence-initial ordinary words: lower-cased (so the guard skips them) when the word is in the
 * English or French dictionary, is not a known name, is not used as a name elsewhere in the
 * copy, is not an attribution noun, and is not followed by a speaking verb ("Mark said…").
 */
const lowerDictionaryStarts = (s: string, names: Set<string>) => s.replace(/(^|[.!?:;]\s+|\s[—–-]\s)(\p{Lu}[\p{Ll}'’-]+)(?=[^\p{L}]|$)/gu,
  (match, prefix: string, word: string, at: number, all: string) => {
    const w = word.toLowerCase();
    if (!dictionary().has(w) || NAMES_IN_DICTIONARY.has(w) || ATTRIBUTORS.has(w) || names.has(w)) return match;
    if (SPEAKS.test(all.slice(at + match.length, at + match.length + 40))) return match;
    return prefix + w;
  });

/** "AI-driven", "AI-assisted": an ordinary compound, not a name. */
const lowerAiCompounds = (s: string) => s.replace(/\bAI-([a-z]+)\b/g, "ai-$1");

/**
 * A country and its adjective are the same fact: "Chinese" is supported by
 * "China", "American" by "U.S.", "Canada" by "Ottawa" or "Canadian".
 */
const PLACES: string[][] = [
  ["China", "Chinese"], ["America", "American", "Americans", "United States", "U.S.", "US"],
  ["Canada", "Canadian", "Canadians", "Ottawa"], ["Europe", "European", "Europeans", "EU", "European Union"],
  ["Britain", "British", "UK", "U.K.", "United Kingdom"], ["France", "French", "Paris"], ["Germany", "German"],
  ["Japan", "Japanese"], ["India", "Indian"], ["Korea", "Korean", "South Korea", "South Korean"],
  ["Australia", "Australian"], ["Taiwan", "Taiwanese"], ["Italy", "Italian"], ["Spain", "Spanish"],
  ["Mexico", "Mexican"], ["Brazil", "Brazilian"], ["Quebec", "Québec", "Quebecer", "Québécois"],
  ["Asia", "Asian", "Asie", "asiatique", "asiatiques"], ["Africa", "African", "Afrique", "africain", "africaine"],
];
/** The French translator's names for the same places: a source in English supports them too. */
const FR_PLACES: Record<string, string[]> = {
  China: ["Chine", "chinois", "chinoise", "chinoises"], America: ["États-Unis", "Amérique", "américain", "américaine", "américains", "américaines"],
  Canada: ["canadien", "canadienne", "canadiens", "canadiennes"], Europe: ["européen", "européenne", "européens", "européennes", "UE", "Union européenne"],
  Britain: ["Royaume-Uni", "britannique", "britanniques"], France: ["français", "française"], Germany: ["Allemagne", "allemand", "allemande"],
  Japan: ["Japon", "japonais", "japonaise"], India: ["Inde", "indien", "indienne"], Korea: ["Corée", "Corée du Sud", "coréen", "coréenne"],
  Australia: ["Australie", "australien", "australienne"], Italy: ["Italie", "italien", "italienne"], Spain: ["Espagne", "espagnol", "espagnole"],
  Mexico: ["Mexique", "mexicain", "mexicaine"], Brazil: ["Brésil", "brésilien", "brésilienne"],
};
for (const g of PLACES) g.push(...(FR_PLACES[g[0]] ?? []));
const withPlaces = (src: string) => {
  const extra = PLACES.filter(group => group.some(n => new RegExp(`(^|[^\\p{L}])${n.replace(/\./g, "\\.")}(?![\\p{L}])`, "u").test(src)));
  return extra.length ? `${src}\n${extra.flat().join(". ")}.` : src;
};

/** French elisions ("l'", "d'", "qu'") hide the word after them; take them off so that word is checked. */
const unElide = (s: string) => s.replace(/(^|[\s«“"(])(?:[LDJMNSTC]|Qu|Jusqu|Lorsqu|Puisqu)['’](?=\p{L})/giu, "$1");

/** French ordinals ("9e", "12e année", "1er", "2nde") are the number itself: check the number. */
const unOrdinal = (s: string) => s.replace(/(\d)(?:er|re|ère|e|es|ème|eme|nde?)(?![\p{L}\p{N}])/gu, "$1");

/**
 * Numbers glued to ordinary words are the number, not a name: "1,000-agent" → "1,000 agent",
 * "500-plus" → "500 plus", "under-16s" → "under 16", "1990s" → "1990". The number itself is still
 * checked. A capitalised word joined to an ordinary one ("English-language", "CUGA-based") is
 * checked on its own capitalised part.
 */
const unCompound = (s: string) => s
  .replace(/(\d)-(?=\p{Ll})/gu, "$1 ")
  .replace(/(\p{Ll})-(?=\d)/gu, "$1 ")
  .replace(/(\d)s(?![\p{L}\p{N}])/gu, "$1")
  .replace(/(\p{Lu}[\p{L}\p{N}]*)-(?=\p{Ll}+(?![\p{L}-]))/gu, "$1 ");

/** A number spelled out at the start of a sentence ("Thirty-five", "Twelve") is the number: check its digits. */
const UNITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const spelled = (w: string): number | null => {
  const [a, b] = w.toLowerCase().split("-");
  const t = TENS.indexOf(a), u = UNITS.indexOf(a);
  if (b === undefined) return t >= 2 ? t * 10 : u >= 0 ? u : null;
  const u2 = UNITS.indexOf(b);
  return t >= 2 && u2 >= 1 && u2 <= 9 ? t * 10 + u2 : null;
};
// Only the hyphenated tens ("Thirty-five"): single number words are dictionary words and already pass.
const unSpell = (s: string) => s.replace(/(?<![\p{L}-])(\p{Lu}\p{Ll}+-\p{Ll}+)(?![\p{L}-])/gu, (m, w: string) => { const n = spelled(w); return n === null ? m : String(n); });

/** Names and numbers in `fields` that `sourceText` doesn't contain, plus any denial the sources don't make. Empty = passes. */
export function factGuard(fields: string[], sourceText: string): string[] {
  const src = withPlaces(unElide(sourceText));
  const bad = new Set<string>();
  const names = midSentenceNames(fields);
  for (const f of fields) {
    if (!f) continue;
    const text = lowerDictionaryStarts(lowerAiCompounds(lowerGenericStarts(lowerConnectives(unCompound(unSpell(unOrdinal(unElide(stripAllMarkers(f)))))))), names);
    for (const w of unsupported(text, src, [...STARTERS, ...HOUSE, ...ACRONYMS])) bad.add(w);
  }
  for (const p of negationProblems(fields, sourceText)) bad.add(p);
  return [...bad];
}

// ── meaning, not just names: a sentence that says "did not" must have a source that says so ──
const NEG = /\b(?:not|never|no longer|none|neither|nor|denied|denies|deny|refused|refuses|declined|declines|rejected|rejects)\b|n['’]t\b|\bne\b[^.!?]{0,40}\b(?:pas|jamais|plus|aucun|aucune|rien)\b|\b(?:jamais|aucun|aucune|nie|nié|refuse|refusé|rejette|rejeté)\b/i;
const NAME = /(?<![.!?]\s)(?<=\s|^)[A-Z][\p{L}\d-]{2,}/gu;
const ABOUT_REPORTING = /\b(?:reports?|reporting|reported|sources?|outlets?|excerpts?|extraits?|disent|says?|said|specif(?:y|ies|ied)|disclos\w*|confirm\w*|known|unclear|announced|names?|named|rapports?|médias?|nomm\w*|sources?|dit|précis\w*|indiqu\w*|confirm\w*|connu\w*|annonc\w*)\b/i;
const sentences = (t: string) => t.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);

/**
 * Sentences that deny or reverse something ("X did not release Y") when no
 * source sentence about the same names says anything of the kind. This is the
 * mechanical half of a meaning check: it catches a flipped verb, not every
 * change of meaning, so riskier stories still go to a human (see run.ts).
 */
export function negationProblems(fields: string[], sourceText: string): string[] {
  const srcSentences = sentences(unElide(sourceText));
  const out: string[] = [];
  for (const f of fields) {
    for (const sent of sentences(unElide(stripAllMarkers(f ?? "")))) {
      if (!NEG.test(sent)) continue;
      // What the reporting leaves open ("Neither report says…", "not yet known") is our own, honest, unknowns line.
      if (ABOUT_REPORTING.test(sent)) continue;
      // Proper names only: the first word of a sentence is capitalised anyway.
      const names = [...sent.matchAll(NAME)].filter(m => (m.index ?? 0) > 0).map(m => m[0].toLowerCase()).filter(n => !STARTERS.includes(n) && !HOUSE.includes(n));
      const byName = names.length ? srcSentences.filter(s => names.some(n => s.toLowerCase().includes(n))) : [];
      const related = byName.length ? byName : srcSentences;
      if (!related.some(s => NEG.test(s))) out.push(`denial not in the sources: "${sent.slice(0, 80)}"`);
    }
  }
  return out;
}

/** Every field of a reporter's or translator's draft, one at a time. */
/** The same fields as draftFields, each with the name the reporter's JSON uses. */
export function labeledFields(d: Draft): [string, string][] {
  return [
    ["headline", d.headline], ["dek", d.dek], ["news", d.news], ...d.thirty.map(t => ["thirty", t] as [string, string]), ["matters", d.matters],
    ...d.unknown.map(t => ["unknown", t] as [string, string]),
    ...d.confirmed.map(x => ["confirmed", x.text] as [string, string]), ...d.claimed.map(x => ["claimed", x.text] as [string, string]),
    ...d.timeline.map(x => ["timeline", x.text] as [string, string]),
    ...d.sections.flatMap(s => s.paras.map(p => [`article.${s.kind}`, p] as [string, string])),
    ...d.body.plain.map(t => ["plain", t] as [string, string]), ...d.body.expert.map(t => ["expert", t] as [string, string]),
  ];
}

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
/** Lowercase words without accents; a quoted passage becomes "|" so quoting an outlet is never "too close". */
const normWords = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[“”«»"][^“”«»"]*[“”«»"]/g, " | ").split(/[^a-z0-9|]+/).filter(Boolean);
const nGrams = (ws: string[], n: number) => {
  const out = new Set<string>();
  for (let i = 0; i + n <= ws.length; i++) { const g = ws.slice(i, i + n); if (!g.includes("|")) out.add(g.join(" ")); }
  return out;
};

/** Sentences, with any [sN] marker after the full stop kept on its own sentence. */
export const splitSentences = (t: string) => t.split(/(?<=[.!?]["”’)]?)\s+(?!\[)/).map(x => x.trim()).filter(Boolean);

/** Every n-word run in the sources' wording (what overlapProblems compares against). */
export function sourceGrams(sources: { text: string }[], n = 9): Set<string> {
  const out = new Set<string>();
  for (const s of sources) for (const g of nGrams(normWords(s.text), n)) out.add(g);
  return out;
}

/** Indexes of the sentences of `text` that hold (part of) a run of n words found in `grams`. */
export function overlappingSentences(text: string, grams: Set<string>, n = 9): number[] {
  const words: string[] = [], owner: number[] = [];
  splitSentences(text).forEach((sent, i) => { for (const w of normWords(stripAllMarkers(sent))) { words.push(w); owner.push(i); } });
  const hit = new Set<number>();
  for (let i = 0; i + n <= words.length; i++) {
    const g = words.slice(i, i + n);
    if (!g.includes("|") && grams.has(g.join(" "))) for (let k = i; k < i + n; k++) hit.add(owner[k]);
  }
  return [...hit].sort((a, b) => a - b);
}

/**
 * How many shared words count as copying. An official announcement (the lab, company or
 * government itself) names programmes, titles and products in long fixed phrases
 * ("Minister of Artificial Intelligence and Digital Innovation", "AI Compute Access Fund"),
 * so its bar is 12 words; any other outlet's writing stays at 9.
 */
export const OFFICIAL_RUN = 12;
export const runFor = (s: { official?: boolean }, n = 9) => (s.official ? Math.max(n, OFFICIAL_RUN) : n);

/** Indexes of the sentences of `text` that copy any source, each source at its own bar. */
export function copiedSentences(text: string, sources: { text: string; official?: boolean }[], n = 9): number[] {
  const hit = new Set<number>();
  for (const run of new Set(sources.map(s => runFor(s, n)))) {
    const grams = sourceGrams(sources.filter(s => runFor(s, n) === run), run);
    for (const i of overlappingSentences(text, grams, run)) hit.add(i);
  }
  return [...hit].sort((a, b) => a - b);
}

export function overlapProblems(d: Draft, sources: { outlet: string; text: string; official?: boolean }[], n = 9): string[] {
  const norm = normWords;
  const problems: string[] = [];
  for (const s of sources) {
    const run = runFor(s, n);
    const grams = (ws: string[]) => nGrams(ws, run);
    const ours = grams(norm(stripAllMarkers(draftFields(d).join(" | "))));
    const hit = [...grams(norm(s.text))].find(g => ours.has(g));
    if (!hit) continue;
    // Name the field: the phrase is often in "claimed", "expert" or "thirty", not in the article the editor looks at first.
    const where = labeledFields(d).find(([, t]) => grams(norm(stripAllMarkers(t))).has(hit))?.[0];
    problems.push(`Too close to ${s.outlet}'s wording ("${hit}…")${where ? ` in "${where}"` : ""}: say it in our own words, or quote and attribute it.`);
  }
  return problems;
}

export const HYPE = /\b(breaking|shock\w*|stunning|game[- ]?chang\w*|revolution\w*|unprecedented|bombshell|mind[- ]?blowing|insane|terrifying|apocalyp\w*|doom\w*|jaw[- ]?dropping|explosive|choc|boulevers\w*|révolution\w*|incroyable\w*|stupéfiant\w*|terrifiant\w*|sans précédent)\b/i;

/**
 * A summary claiming the reporting as ours ("we learned", "our reporting" [label-ok: names the ban], "AI Broadsheet has
 * confirmed"): the outlets did the reporting, so the copy editor must attribute it to them.
 */
export const OWN_REPORTING = /\b(we (?:have )?(?:reported|learned|confirmed|obtained|revealed|uncovered)|our (?:own )?(?:reporting|investigation|reporters?|sources)|AI Broadsheet (?:has )?(?:reported|learned|confirmed|obtained|revealed)|notre (?:reportage|enquête)|nos (?:reportages|journalistes|sources)|nous avons (?:appris|confirmé|obtenu|révélé)|AI Broadsheet a (?:appris|confirmé|obtenu|révélé))\b/i;

/** House-style problems a copy editor fixes. Empty = clean. */
export function styleProblems(d: Draft, lang: "en" | "fr"): string[] {
  const out: string[] = [];
  const all = draftFields(d).join("\n");
  if (/!/.test(all)) out.push("Remove every exclamation mark.");
  const hype = all.match(HYPE);
  if (hype) out.push(`Remove the hype word "${hype[0]}".`);
  const own = all.match(OWN_REPORTING);
  if (own) out.push(`"${own[0]}" claims the reporting as ours: this is a summary of the outlets' reporting, so attribute it to them.`);
  if (/[?]/.test(d.headline)) out.push("The headline must be a statement, not a question.");
  if (d.headline.length < 40 || d.headline.length > 110) out.push(`The headline must be 40 to 110 characters (it is ${d.headline.length}).`);
  if (/\b[A-Z]{5,}\b/.test(d.headline.replace(/\b(OpenAI|NVIDIA|UNESCO|NATO|OECD|CIFAR)\b/g, ""))) out.push("No words in ALL CAPS in the headline.");
  const words = countWords(d.sections.flatMap(s => s.paras));
  const [min, max] = lang === "fr" ? [120, 700] : [120, 600];
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
