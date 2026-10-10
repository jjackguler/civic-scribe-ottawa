/**
 * The editorial team. Each desk is a separate model call with its own role
 * prompt plus the house voice, and each one's verdict is kept with the article.
 *
 *   reporter   → writes the English article from the sources (and our own background text only)
 *   copy       → mechanical fact guard + house style; one rewrite pass when it fails
 *   standards  → checks the charter; a fail is never published
 *   translator → Canadian French, same guard, one retry
 *   seo        → titles, dek, meta description, slugs, keywords, FAQ, internal links
 *   designer   → article format and the typographic house cover
 */
import { VALUES, editorialGate } from "../../src/lib/editorial";
import type { DispatchSource } from "../../src/lib/dispatch-types";
import {
  COVER_COLORS, COVER_MOTIFS, FORMATS, TOPIC_KICKER, countWords, slugify,
  type ArticleFormat, type Cover, type CoverText, type Faq, type RoleName, type RoleNote,
} from "../../src/lib/newsroom-types";
import type { Models } from "./models";
import { alignFrench, shapeDraft, toRaw, type Draft, type RawDraft } from "./shape";
import { draftFields, factGuard, overlapProblems, styleProblems } from "./guard";
import type { LinkOption, Passage } from "./library";

/**
 * Same house voice as src/lib/editorial.ts (HOUSE_VOICE), copied by hand
 * because the pipeline runs outside the site bundle. Keep them in sync.
 */
export const HOUSE_VOICE = `House voice of AI Broadsheet (applies to everything you write):
- Human-centred: where the sources allow, say what the news means for people (rights, work, privacy, children, safety, democracy). Never invent an impact the sources don't support.
- Dignity: never demean any person or group; no stereotypes; no language that ranks one race, nation, religion or group above another. Report hateful acts as harms, never repeat slurs.
- Respect for faith: never mock religion, belief or God, and do not write in a voice that dismisses faith. Report people of every belief, and none, fairly.
- Family-safe: no sexual, erotic or graphic detail of any kind. If a story involves abuse, describe the harm and the response only, without detail.
- Balanced: neither fear nor hype about technology; no sensational words, no exclamation marks.`;

export type Event = {
  id: string;
  topic: string;
  lens: string[];
  sources: DispatchSource[];
  /** Each outlet's excerpt, aligned with `sources`. */
  excerpts: string[];
  background: (Passage & { key: string })[];
};

export type Outcome<T> = { ok: true; value: T; note: RoleNote } | { ok: false; note: RoleNote };

const now = () => new Date().toISOString();
const note = (role: RoleName, model: string, verdict: RoleNote["verdict"], notes: string[]): RoleNote => ({ role, model, at: now(), verdict, notes: notes.slice(0, 20) });

/** Everything the fact guard accepts for this event: the reporting plus our own background text. */
export function sourceText(e: Event, lang: "en" | "fr" | "both" = "both"): string {
  const reporting = e.sources.map((s, i) => `${s.outlet}: ${s.title}. ${e.excerpts[i] ?? ""}`).join("\n");
  const bg = e.background.map(b => [lang !== "fr" ? b.text.en : "", lang !== "en" ? b.text.fr : "", b.title.en, b.title.fr].join(" ")).join("\n");
  return `${reporting}\n${bg}`;
}

const sourcesFor = (e: Event) => e.sources.map((s, i) => ({
  key: s.key, outlet: s.outlet, official: s.official, published: s.publishedAt, lang: s.lang, headline: s.title, excerpt: e.excerpts[i] ?? "",
}));
const backgroundFor = (e: Event, lang: "en" | "fr") => e.background.map(b => ({ key: b.key, page: b.page, title: b.title[lang], text: b.text[lang] }));

const RULES = `Hard rules:
- Facts ONLY from the sources' headlines and excerpts. Do not add any name, number, date, place, quote, motive, reaction or consequence that is not written there. Nothing from memory: no history, no earlier products, no figures you remember.
- Background ONLY from the "background" passages you are given (our own pages), cited with their [bN] marker, and only in article.background. If none fits the story, leave article.background empty.
- Keep every name, product name and number exactly as written in the sources (no unit or currency conversion). Never count the outlets.
- Our own words: never copy a sentence from a source; never reuse more than 8 words in a row from a source, except names, titles and direct quotes, which must be in quotation marks and attributed by name.
- Start sentences with a name from the sources or a plain function word (It, This, The, Whether, Both…). Never "Experts", "Critics", "Analysts", "Observers", "Today", "Yesterday".
- Plain verbs, short sentences, active voice. No hype, no exclamation marks, no questions in the headline, no ALL CAPS.
- A prediction, a promise or a figure from one party is a claim: write it in their name ("Northwind says…"), never as fact. Never present speculation as fact.
- If the sources disagree on a fact, give each version, attributed.`;

const SHAPE = `Return JSON:
{"headline": 50-95 characters, who did what, active voice, a statement,
 "dek": 1-2 sentences under the headline (at most 40 words) that add the most important detail,
 "news": one sentence, at most 25 words: the news,
 "thirty": exactly 3 lines, each at most 14 words, that tell the story in 30 seconds,
 "confirmed": 0-4 [{"text", "src": ["s1","s3"]}] facts stated as fact by two or more independent outlets (a company, lab or agency announcing its own news goes in "claimed", by that party),
 "claimed": 0-4 [{"text", "by", "src": [...]}] statements made by someone, in their name ("by" is that party as named in the sources; "text" written as "X says…"),
 "unknown": 1-3 short lines naming what the sources leave open, phrased neutrally ("Whether…", "When…", "How much…"), never speculating,
 "matters": at most 2 plain sentences on what this changes for an ordinary person, ONLY as far as the sources say; if they say nothing about impact, say plainly what is different now,
 "article": {
   "news": 1-2 paragraphs: what happened, who did it, when, as the sources state it,
   "known": 1-3 paragraphs: what is confirmed, what is claimed and by whom, what is still unknown, in prose,
   "matters": 1-2 paragraphs: why it matters to people (rights, work, privacy, children, safety, democracy, money) as far as the sources support it,
   "background": 0-2 paragraphs from the background passages only, each sentence ending with its [bN] marker
 },
 "plain": 2 short paragraphs for someone new to AI: the same news in everyday words, every technical term explained,
 "expert": 1-3 short paragraphs for specialists: the precise terms and figures the sources give, and where the outlets' accounts differ,
 "timeline": [{"when", "text", "src"}] ONLY for times or dates the sources themselves state ("when" copied as written); otherwise []}

Markers: end every sentence in "article", "plain" and "expert" that carries a fact with the source marker(s) it comes from, like "[s2]" or "[s1,s3]" ([bN] for background).
Length: "article" should be 300 to 550 words WHEN the reporting supports it. If it supports less, write less (never under 120 words): a short, exact article is better than a padded one. Never repeat a point or fill with generalities. If the reporting can't support 120 words of real information, return {"skip": true, "reason": "..."}.
Shape: "article" is an object whose values are ARRAYS of paragraph strings, e.g. {"news": ["…[s1]", "…[s2]"], "known": ["…"], "matters": ["…"], "background": []}.`;

// ── reporter ───────────────────────────────────────────────────────────────
const REPORTER = `You are the reporter at the AI Broadsheet Newsroom, a bilingual (English / Canadian French) human-centred AI news site in Canada. You write ONE original news article in English about ONE event, from the reporting of the outlets you are given, each as {key, outlet, official, published, lang, headline, excerpt}. "official": true means the outlet is the company, lab or government announcing its own news. Our headline, our structure, our words; their facts, credited.

${SHAPE}

${RULES}

${HOUSE_VOICE}`;

export async function reporter(m: Models, e: Event): Promise<Outcome<Draft>> {
  const raw = await m.json<RawDraft>("reporter", "writer", REPORTER, JSON.stringify({ event: { topic: e.topic, peopleSide: e.lens }, sources: sourcesFor(e), background: backgroundFor(e, "en") }), { id: e.id, attempt: 0 }, 6000);
  const d = shapeDraft(raw, e.sources, e.background.map(b => b.key), e.sources.map((x, i) => `${x.title}. ${e.excerpts[i] ?? ""}`).join("\n"));
  if (typeof d === "string") return { ok: false, note: note("reporter", m.model("writer"), "fail", [d]) };
  return { ok: true, value: d, note: note("reporter", m.model("writer"), "done", [`${countWords(d.sections.flatMap(s => s.paras))} words`, `${d.sections.map(s => s.kind).join(" → ")}`]) };
}

// ── copy editor ────────────────────────────────────────────────────────────
const COPY = `You are the copy editor at the AI Broadsheet Newsroom. You get an article (JSON), the sources it was written from, our background passages, and a list of problems found by our checks. Fix exactly those problems and return the whole article in the same JSON shape.
- Words flagged as "not in the sources" must go: remove the claim, or replace the word with the words the sources actually use. Never add a new fact to replace it.
- Keep every [sN] / [bN] marker on the sentence it supports. Keep the structure. Tighten, don't pad.
- House style: plain verbs, short sentences, active voice, no hype, no exclamation marks, headline a statement.

${RULES}

${HOUSE_VOICE}`;

/** Every mechanical check the copy desk runs on a draft. */
export function copyProblems(d: Draft, e: Event, lang: "en" | "fr"): { facts: string[]; style: string[] } {
  const facts = factGuard(draftFields(d), sourceText(e));
  const style = [...styleProblems(d, lang), ...overlapProblems(d, e.sources.map((s, i) => ({ outlet: s.outlet, text: `${s.title}. ${e.excerpts[i] ?? ""}` })))];
  const gate = editorialGate({ title: d.headline, summary: draftFields(d).join(" ") });
  if (!gate.ok) style.push("Explicit content: the charter does not allow it.");
  return { facts, style };
}

const describe = (p: { facts: string[]; style: string[] }) => [
  ...(p.facts.length ? [`Not in the sources (names or numbers): ${p.facts.slice(0, 16).join(", ")}.`] : []),
  ...p.style,
];

export async function copyEditor(m: Models, e: Event, d: Draft): Promise<Outcome<Draft>> {
  const first = copyProblems(d, e, "en");
  if (!first.facts.length && !first.style.length) return { ok: true, value: d, note: note("copy", "mechanical", "pass", ["fact guard: every name and number found in the sources", "house style: clean"]) };
  const problems = describe(first);
  const raw = await m.json<RawDraft>("copy", "writer", COPY, JSON.stringify({ problems, article: toRaw(d), sources: sourcesFor(e), background: backgroundFor(e, "en") }), { id: e.id, attempt: 0 }, 6000);
  const fixed = shapeDraft(raw, e.sources, e.background.map(b => b.key), e.sources.map((x, i) => `${x.title}. ${e.excerpts[i] ?? ""}`).join("\n"));
  if (typeof fixed === "string") return { ok: false, note: note("copy", m.model("writer"), "fail", [...problems, `rewrite: ${fixed}`]) };
  const again = copyProblems(fixed, e, "en");
  if (again.facts.length || again.style.length) return { ok: false, note: note("copy", m.model("writer"), "fail", [...problems, "after the rewrite:", ...describe(again)]) };
  return { ok: true, value: fixed, note: note("copy", m.model("writer"), "fixed", problems) };
}

// ── standards editor ───────────────────────────────────────────────────────
const CHARTER = VALUES.map(v => `- ${v.h.en}: ${v.p.en}`).join("\n");
const STANDARDS = `You are the standards editor at the AI Broadsheet Newsroom. You decide whether an article may be published under our charter. You get the article and the sources.

Our charter:
${CHARTER}

FAIL the article (pass: false) if ANY of these is true:
- it demeans a person or group, uses a stereotype, or ranks one race, nation, religion or group above another;
- it mocks religion, belief or God, or its voice dismisses faith;
- it has sexual, erotic or graphic detail, or violence for its own sake;
- it spreads fear or hype: sensational framing, alarm the sources don't support, or salesmanship for a product;
- it presents speculation as fact: a prediction, promise, motive or figure from one party stated as certain, or a consequence the sources don't state;
- it claims an impact on people that the sources don't support;
- it is unfair to someone named: an accusation without their side when the sources give it.
Minor wording issues are notes, not failures.

Return {"pass": true|false, "reasons": ["why it fails, one line each"], "notes": ["optional advice"]}.

${HOUSE_VOICE}`;

export async function standardsEditor(m: Models, e: Event, d: Draft): Promise<Outcome<null>> {
  const gate = editorialGate({ title: d.headline, summary: draftFields(d).join(" ") });
  if (!gate.ok) return { ok: false, note: note("standards", "mechanical", "fail", ["explicit content (editorialGate)"]) };
  const r = await m.json<{ pass?: unknown; reasons?: unknown; notes?: unknown }>("standards", "checker", STANDARDS, JSON.stringify({ article: toRaw(d), sources: sourcesFor(e) }), { id: e.id, attempt: 0 }, 1200);
  if (!r || typeof r.pass !== "boolean") return { ok: false, note: note("standards", m.model("checker"), "fail", ["no verdict from the standards desk"]) };
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map(x => x.slice(0, 300)) : []);
  if (!r.pass) return { ok: false, note: note("standards", m.model("checker"), "fail", list(r.reasons).length ? list(r.reasons) : ["failed without a reason"]) };
  return { ok: true, value: null, note: note("standards", m.model("checker"), "pass", list(r.notes)) };
}

// ── translator ─────────────────────────────────────────────────────────────
const TRANSLATOR = `You are the translator at the AI Broadsheet Newsroom. You get an English article (JSON) and the sources it was written from. Write the same article in Canadian French for the same readers: natural French newspaper style (the register of Le Devoir or La Presse), not a word-for-word translation. Canadian usage (courriel, clavardage, fin de semaine, cellulaire); "IA" for AI.

Return exactly the same JSON shape with the same number of items in every list, in the same order, the same "src" arrays, the same article sections, and the same [sN] / [bN] markers in the same sentences. Headline 50-110 characters.

${RULES}
- Keep names exactly as written in the sources; use a French form of a name only if a French source writes it that way. You may use a decimal comma and "%" with a space.

${HOUSE_VOICE}`;

export async function translator(m: Models, e: Event, en: Draft): Promise<Outcome<Draft>> {
  let bad: string[] = [];
  const notes: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const retry = bad.length ? `\n\nA previous French version was rejected: ${bad.slice(0, 14).join("; ")}. Fix exactly that.` : "";
    const raw = await m.json<RawDraft>("translator", "writer", TRANSLATOR, JSON.stringify({ english: toRaw(en), sources: sourcesFor(e), background: backgroundFor(e, "fr") }) + retry, { id: e.id, attempt }, 7000);
    const fr = shapeDraft(raw, e.sources, e.background.map(b => b.key), e.sources.map((x, i) => `${x.title}. ${e.excerpts[i] ?? ""}`).join("\n"));
    if (typeof fr === "string") { bad = [`shape: ${fr}`]; notes.push(`attempt ${attempt + 1}: ${fr}`); continue; }
    const misaligned = alignFrench(fr, en);
    if (misaligned) { bad = [misaligned]; notes.push(`attempt ${attempt + 1}: ${misaligned}`); continue; }
    const p = copyProblems(fr, e, "fr");
    if (p.facts.length || p.style.length) { bad = describe(p); notes.push(`attempt ${attempt + 1}: ${bad.join(" ")}`); continue; }
    return { ok: true, value: fr, note: note("translator", m.model("writer"), attempt ? "fixed" : "pass", [...notes, `${countWords(fr.sections.flatMap(s => s.paras))} mots`]) };
  }
  return { ok: false, note: note("translator", m.model("writer"), "fail", notes) };
}

// ── SEO / headline editor ──────────────────────────────────────────────────
export type SeoCopy = { seoTitle: string; headline: string; dek: string; metaDescription: string; slug: string; keywords: string[]; faq: Faq[] };
export type Seo = { en: SeoCopy; fr: SeoCopy; links: string[] };

const SEO = `You are the SEO and headline editor at the AI Broadsheet Newsroom. You get our finished article in English and French and a list of our own evergreen pages. Write, for each language:
- "seoTitle": the page title for search, at most 60 characters: the main name and the news, plain words, no clickbait, no site name;
- "headline": our display headline, 50-100 characters, specific, active, a statement, strictly what the article says (you may keep the reporter's);
- "dek": 1-2 sentences, at most 220 characters, the most useful detail after the headline;
- "metaDescription": at most 155 characters, what the reader will learn, no "click here";
- "slug": 3-8 lowercase words for the URL, in that language, no dates;
- "keywords": 3-6 search terms people would use, in that language;
- "faq": up to 3 {"q","a"} pairs a reader would ask that the article itself answers; answers 1-2 sentences using only the article's facts. Fewer is fine; none is fine.
And "links": 1-4 ids from the list of our pages that would genuinely help a reader of this article (ids only, from the list).

Every name and number you use must already be in the article, written exactly as there. No hype, no exclamation marks, no questions in titles, no ALL CAPS.
Return {"en": {...}, "fr": {...}, "links": [...]}.

${HOUSE_VOICE}`;

const DANGLING = /\s+(a|an|the|of|to|on|in|for|and|or|with|by|at|as|its|their|de|d'|la|le|les|l'|du|des|un|une|et|ou|sur|pour|dans|par|aux?|en|à)$/i;

/** Shorten to `max` characters: at a comma or colon when that keeps most of it, else at a word, never ending on a small word. */
export const clip = (s: string, max: number) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max + 1);
  const punct = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf(": "), cut.lastIndexOf(" — "), cut.lastIndexOf(" : "));
  if (punct >= max * 0.45) return cut.slice(0, punct).trim();
  const at = cut.lastIndexOf(" ");
  let out = cut.slice(0, at > max * 0.5 ? at : max).replace(/[\s,;:–—-]+$/, "");
  while (DANGLING.test(out)) out = out.replace(DANGLING, "");
  return out;
};

export async function seoEditor(m: Models, e: Event, en: Draft, fr: Draft, links: LinkOption[]): Promise<Outcome<Seo>> {
  const view = (d: Draft) => ({ headline: d.headline, dek: d.dek, news: d.news, article: d.sections.flatMap(s => s.paras) });
  const r = await m.json<{ en?: Partial<SeoCopy>; fr?: Partial<SeoCopy>; links?: unknown }>("seo", "checker", SEO, JSON.stringify({ en: view(en), fr: view(fr), pages: links.map(l => ({ id: l.id, title: l.title.en })) }), { id: e.id, attempt: 0 }, 2500);
  const notes: string[] = [];
  const src = sourceText(e);
  const one = (raw: Partial<SeoCopy> | undefined, d: Draft, lang: "en" | "fr"): SeoCopy => {
    const s = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
    const ok = (field: string, v: string) => {
      if (!v) return false;
      const bad = factGuard([v], src);
      if (bad.length) { notes.push(`${lang} ${field} dropped (not in the sources: ${bad.join(", ")})`); return false; }
      if (/!/.test(v)) { notes.push(`${lang} ${field} dropped (exclamation mark)`); return false; }
      return true;
    };
    let headline = s(raw?.headline);
    if (!(ok("headline", headline) && headline.length >= 40 && headline.length <= 110 && !/\?/.test(headline))) headline = d.headline;
    let dek = s(raw?.dek);
    if (!(ok("dek", dek) && dek.length <= 260)) dek = d.dek;
    let seoTitle = s(raw?.seoTitle);
    if (!ok("seoTitle", seoTitle)) seoTitle = headline.length <= 60 ? headline : d.headline.length <= 60 ? d.headline : headline;
    if (seoTitle.length > 60) { notes.push(`${lang} seoTitle clipped to 60 characters`); seoTitle = clip(seoTitle, 60); }
    let metaDescription = s(raw?.metaDescription);
    if (!ok("metaDescription", metaDescription)) metaDescription = d.news;
    if (metaDescription.length > 155) metaDescription = clip(metaDescription, 154) + "…";
    const slug = slugify(s(raw?.slug) || seoTitle, { lang, max: 72 }) || slugify(headline, { lang });
    const keywords = [...new Set((Array.isArray(raw?.keywords) ? raw!.keywords : []).map(k => s(k).toLowerCase()).filter(k => k && k.length <= 40 && ok("keyword", k)))].slice(0, 6);
    const faq = (Array.isArray(raw?.faq) ? raw!.faq : [])
      .map(x => ({ q: s((x as Faq)?.q).slice(0, 160), a: s((x as Faq)?.a).slice(0, 400) }))
      .filter(x => x.q && x.a && ok("faq", `${x.q} ${x.a}`))
      .slice(0, 3);
    return { seoTitle, headline, dek, metaDescription, slug, keywords, faq };
  };
  const ids = new Set(links.map(l => l.id));
  const picked = (Array.isArray(r?.links) ? r!.links : []).filter((x): x is string => typeof x === "string" && ids.has(x)).slice(0, 4);
  const value: Seo = { en: one(r?.en, en, "en"), fr: one(r?.fr, fr, "fr"), links: picked };
  if (!r) notes.push("no reply: kept the reporter's headline and dek, built titles and slugs mechanically");
  return { ok: true, value, note: note("seo", m.model("checker"), r ? "done" : "fixed", [`en: ${value.en.seoTitle} (${value.en.seoTitle.length})`, `fr: ${value.fr.seoTitle} (${value.fr.seoTitle.length})`, ...notes]) };
}

// ── page designer ──────────────────────────────────────────────────────────
export type Design = { format: ArticleFormat; cover: Cover; illustration: { prompt: string; alt: { en: string; fr: string } } | null };

const DESIGNER = `You are the page designer at the AI Broadsheet Newsroom. Our article art is typographic: a house cover with a kicker, one big word or number, and a short line, on a colour from our palette. We never use publishers' photos and never picture real people.

Choose:
- "format": "numbers" only if the article has a striking figure from the sources; "timeline" only if the article has 3 or more dated events; "people" when the story is mainly about what happens to people (workers, students, patients, voters); "explainer" when the news needs explaining how something works; otherwise "standard".
- "color": one of ${COVER_COLORS.join(", ")} (night is the default; lake for government and policy; spruce for health, work and people; brass for money and business; signal for a number; paper for quiet stories).
- "motif": one of ${COVER_MOTIFS.join(", ")}.
- "en" and "fr": {"kicker": 1-3 words, "big": ONE word, name or number copied exactly from the article (at most 14 characters), "small": at most 8 words, optional}.
- "illustration": null, or {"prompt": an abstract idea (shapes, flows, structures; never people, faces, hands, real products, logos or text), "alt_en", "alt_fr"} only for "explainer" or "standard" when an abstract picture would truly help.
Return {"format", "color", "motif", "en": {...}, "fr": {...}, "illustration"}.

${HOUSE_VOICE}`;

const PEOPLE_RE = /\b(person|people|man|men|woman|women|child|children|kid|face|faces|portrait|crowd|worker|student|ceo|founder|minister|politician|hand|hands|figure|silhouette|personne|gens|homme|femme|enfant|visage|foule)\b/i;

export function fallbackCover(e: Event, en: Draft, fr: Draft): Cover {
  const num = (d: Draft) => d.news.match(/\d[\d.,]*\s*(%|per cent|pour cent)?/)?.[0]?.trim();
  const name = (d: Draft) => d.headline.split(/\s+/).find((w, i) => i < 4 && /^\p{Lu}[\p{L}\p{N}-]{2,13}$/u.test(w)) ?? d.headline.split(/\s+/)[0];
  const text = (d: Draft, lang: "en" | "fr"): CoverText => ({ kicker: e.topic ? topicKicker(e.topic, lang) : lang === "fr" ? "Nouvelle" : "News", big: num(d) ?? name(d) });
  return { color: "night", motif: "rules", en: text(en, "en"), fr: text(fr, "fr") };
}

const topicKicker = (t: string, lang: "en" | "fr") => TOPIC_KICKER[t]?.[lang] ?? (lang === "fr" ? "Nouvelle" : "News");

export async function pageDesigner(m: Models, e: Event, en: Draft, fr: Draft): Promise<Outcome<Design>> {
  const r = await m.json<{ format?: unknown; color?: unknown; motif?: unknown; en?: Partial<CoverText>; fr?: Partial<CoverText>; illustration?: { prompt?: unknown; alt_en?: unknown; alt_fr?: unknown } | null }>(
    "designer", "checker", DESIGNER,
    JSON.stringify({ topic: e.topic, peopleSide: e.lens, en: { headline: en.headline, news: en.news, thirty: en.thirty, timeline: en.timeline.length }, fr: { headline: fr.headline, news: fr.news } }),
    { id: e.id, attempt: 0 }, 900,
  );
  const fb = fallbackCover(e, en, fr);
  const notes: string[] = [];
  const src = sourceText(e);
  const coverText = (raw: Partial<CoverText> | undefined, lang: "en" | "fr"): CoverText => {
    const s = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
    const kicker = s(raw?.kicker, 32);
    const big = s(raw?.big, 14);
    const small = s(raw?.small, 70);
    const pass = (v: string) => v && !factGuard([v], src).length;
    if (!pass(big)) notes.push(`${lang} big word not from the reporting: used "${fb[lang].big}"`);
    return { kicker: pass(kicker) ? kicker : fb[lang].kicker, big: pass(big) ? big : fb[lang].big, ...(pass(small) ? { small } : {}) };
  };
  let format = (FORMATS as unknown[]).includes(r?.format) ? (r!.format as ArticleFormat) : "standard";
  if (format === "timeline" && en.timeline.length < 3) { notes.push("timeline needs 3 dated events: standard"); format = "standard"; }
  const cover: Cover = {
    color: (COVER_COLORS as unknown[]).includes(r?.color) ? (r!.color as Cover["color"]) : fb.color,
    motif: (COVER_MOTIFS as unknown[]).includes(r?.motif) ? (r!.motif as Cover["motif"]) : fb.motif,
    en: coverText(r?.en, "en"),
    fr: coverText(r?.fr, "fr"),
  };
  let illustration: Design["illustration"] = null;
  const ip = r?.illustration;
  if (ip && typeof ip.prompt === "string" && (format === "explainer" || format === "standard")) {
    if (PEOPLE_RE.test(ip.prompt)) notes.push("illustration refused: it would show people");
    else illustration = { prompt: ip.prompt.slice(0, 400), alt: { en: String(ip.alt_en ?? "Abstract illustration").slice(0, 160), fr: String(ip.alt_fr ?? "Illustration abstraite").slice(0, 160) } };
  }
  if (!r) notes.push("no reply: house cover built mechanically");
  return { ok: true, value: { format, cover, illustration }, note: note("designer", m.model("checker"), r ? "done" : "fixed", [`format: ${format}`, `cover: ${cover.color}/${cover.motif} "${cover.en.big}"`, ...notes]) };
}
