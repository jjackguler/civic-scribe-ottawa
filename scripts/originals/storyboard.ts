/**
 * The storyboard writer for collage explainers: one model call returns a whole
 * storyboard in the exact schema collage.html + collage-v2.js render (see the
 * hand-made storyboard.*.json). Every spoken line and every on-screen word,
 * number and name goes through the fact guard; one retry with the problems
 * listed; otherwise nothing is made.
 */
import { unsupported } from "../../src/lib/ai-desk.server";
import { HOUSE_VOICE, HOUSE_WORDS } from "./script";
import type { Brief } from "./pick";
import type { KitFigure } from "./collage/kit";
import { SkipRun, limitError } from "./util";

export type Scene = { type: string; bg: string; say: string[]; [k: string]: unknown };
export type Board = {
  title: string;
  summary: string;
  date: string;
  sources: { name: string; url: string }[];
  scenes: Scene[];
  tags: string[];
};

/** Scene types the automatic writer may use, the backgrounds each reads well on, and the first choice. */
const BGS: Record<string, string[]> = {
  ransom: ["newsprint", "split"],
  clippings: ["board", "kraft", "slate"],
  numbers: ["yellow"],
  scraps: ["kraft", "board", "slate"],
  bigwords: ["cream", "kraft"],
  note: ["board", "slate", "kraft"],
  check: ["yellow", "cream"],
  quote: ["slate", "board"],
  stamp: ["slate", "kraft"],
  bars: ["yellow", "cream"],
  prices: ["kraft", "cream"],
  receipt: ["slate", "board"],
  figure: ["cream", "kraft"],
  crossout: ["board", "kraft"],
  outro: ["board"],
};
export const SCENE_TYPES = Object.keys(BGS);

const SPEC = `Scene types (every scene also has "type", "bg" and "say"):
- ransom: the opener. "words": 1-3 words cut out like a ransom note, CAPITALS, each at most 7 letters (at most 8 when there are 3 words). "clips": 1-2 newspaper clippings [{"source": n, "mark": "optional: exact words from that source's headline to highlight"}]. bg: newsprint or split.
- clippings: 1-3 clippings [{"source": n, "cue": "a word from say when it lands", "mark": "optional exact words of that headline"}]. bg: board, kraft or slate.
- numbers: 1-3 big counting numbers. "items": [{"value": 4000 (a number, as in the sources), "decimals": 0-2, "prefix": "optional, e.g. ~ or $", "suffix": "optional, at most 3 characters, e.g. % or M", "label": "at most 6 words"}]. Say each number with the same digits. bg: yellow.
- scraps: 2-3 torn paper strips. "items": ["at most 28 characters each"], "cues": [one word from say per item, same order], "circle": index of the strip circled in red pencil (optional). bg: kraft, board or slate.
- bigwords: 2-3 huge words. "words": [{"t": "CAPITALS, at most 9 characters", "s": "black|red|white"}], "note": "optional typed note, at most 60 characters". bg: cream or kraft.
- note: a key point. "big": "at most 22 characters", "small": "at most 90 characters", "credit": "optional, at most 50 characters", "cue": "the word in say when the big note slaps down". Needs 2 sentences in say. bg: board, slate or kraft.
- check: confirmed good news. "big": "at most 24 characters", "small": "at most 70 characters". bg: yellow or cream.
- quote: "label": "CAPITALS, at most 14 characters, e.g. WIKIMEDIA SAYS", "quote": "words copied exactly from a quotation in the sources (at most 20 words)", "credit": "who said it, as reported by whom", "paraphrase": true only when the words are a faithful summary of a stated position rather than an exact quotation (then no quotation marks are shown). bg: slate or board.
- stamp: a notepad page with a red rubber stamp. "pageTitle": "at most 20 characters", "lines": ["1-3 handwritten lines, at most 28 characters each"], "stamp": "one or two short words, at most 9 characters (it is stamped very large), e.g. FAILED", "cue": "the word in say when the stamp lands". bg: slate or kraft.
- bars: a bar chart of 2-4 values from the sources. "unit": "at most 40 characters", "items": [{"label": "at most 18 characters", "value": number, "hi": true for the one to highlight}], "min": "optional number below the smallest value", "stamp": "at most 18 characters", "cue": "word in say when the stamp lands". bg: yellow or cream.
- prices: old and new price tags next to a cut-out figure. "figure": FIGURE, "items": [1-2 of {"label": "at most 16 characters", "old": "e.g. $0.067", "new": "e.g. $0.0336", "cue": "word in say for the old price", "cueNew": "words in say for the new price"}]. bg: kraft or cream.
- receipt: a till receipt of changes. "title": "at most 30 characters", "rows": [2-3 of {"label": "at most 24 characters", "old": "...", "new": "...", "cue": "word in say", "circle": true for rows to circle}], "footer": "optional, at most 36 characters". bg: slate or board.
- figure: a scissor-cut archive figure with a quotation on paper. "figure": FIGURE, "side": "left|right", "quote": "words copied exactly from a quotation in the sources (at most 10 words)", "credit": "who said it", "cue": "the word in say to underline". bg: cream or kraft.
- crossout: a tempting wrong reading, crossed out in red, then the correct reading. "note": "the wrong reading, at most 40 characters", "verdict": "the correct reading, at most 40 characters", "cue": "word in say when it is crossed out", "verdictCue": "word in say for the verdict". bg: board or kraft.
- outro: always the last scene. "lines": ["line 1, at most 22 characters", "line 2, at most 24 characters"] (both lines are also spoken, word for word), "figure": optional FIGURE. The last sentence of say is "Sources: <the outlets>." bg: board.`;

const SYSTEM = `You storyboard 45-75 second vertical explainer videos for AI Broadsheet, a human-centred AI news site, in its newspaper-collage style: torn clippings, ransom-note letters, scissor-cut archive figures, red pencil, rubber stamps, price tags, receipts and paper wipes. Style: Vox-like clarity, calm and direct, no hype.

You get ONE story: the publishers' headlines and excerpts (numbered sources), sometimes our own newsroom's article about it, sometimes an editor's note. Return JSON:
{
 "title": "our headline for the video, 40-80 characters, no question, no exclamation mark",
 "summary": "one sentence, at most 200 characters",
 "tags": ["5 to 8 short tags"],
 "scenes": [ { "type": "...", "bg": "...", "say": ["sentence", "sentence"], ...fields of that type } ]
}

${SPEC}

FIGURE is one of the cut-out names listed in the request (only those exist). The figures are anonymous archive photographs used as decoration that fits the topic: never present a figure as a person in the story, never as someone who did wrong.
Backgrounds (bg): newsprint, split, kraft, cream, slate, yellow, board.

Rules:
- 7 to 10 scenes, 115 to 175 words of narration in total ("say" holds 1-3 short sentences per scene, each at most 24 words). Start with ransom or clippings; end with outro. Vary the scene types; do not repeat a type more than twice.
- The first scene hooks with the news itself. Explain what happened, the key numbers, what is claimed and by whom, what is not known yet, and why it matters to people where the sources say so.
- Use ONLY facts written in the text you are given. Do not add any name, number, date, place, quote, cause or consequence that is not there. Keep names and numbers exactly as written. Say who claims what.
- Every on-screen word, number and name must also come from the sources (plain connecting words are fine). Numbers on screen must be spoken in the narration too.
- A quote is shown only when those exact words are in quotation marks in the sources; otherwise use "paraphrase": true, or another scene type.
- No questions in the title, no exclamation marks, no "breaking", "shocking" or hype words, no puns about real people.
- If the text is too thin for a fair 45-second explainer, or the story is about children, health, elections or accusations against named people, return {"skip": true, "reason": "..."}.

${HOUSE_VOICE}

Reply with JSON only.`;

/** Plain words an on-screen line may use without the sources (the guard only checks names and numbers). */
const DISPLAY_WORDS = ["not", "no", "yes", "now", "new", "old", "more", "less", "half", "price", "prices", "up", "down", "how", "the", "a", "an", "of", "in", "on", "to", "or", "is", "are", "was", "be", "isn't", "aren't", "doesn't", "don't", "didn't", "won't", "can't", "can", "will", "may", "per", "than", "then", "still", "just", "only", "even", "yet", "these", "those", "their", "its", "our", "he", "she", "them", "with", "without", "from", "by", "at", "as", "about", "after", "before", "into", "over", "under", "out", "all", "every", "each", "some", "many", "most", "first", "last", "big", "small", "fine", "print", "read", "check", "checked", "claim", "claims", "fact", "facts", "careful", "nobody", "nothing", "never", "because", "what's", "here's", "who's", "where", "when", "which", "while", "though", "although", "if", "unless", "until", "since", "yet", "too", "very", "lot", "lots", "bigger", "smaller", "cheaper", "pricier", "faster", "slower", "same", "different", "other", "another", "known", "unknown", "open", "closed", "free", "paid", "good", "bad", "plain", "short", "long", "takeaway", "bottom", "line", "meanwhile", "instead", "however", "still", "again", "one", "two", "three", "first", "second", "third"];
const ALLOW = [...HOUSE_WORDS, ...DISPLAY_WORDS];

const words = (s: string) => s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[“”«»„"]/g, '"').replace(/[‘’`]/g, "'").replace(/[–—]/g, "-").replace(/\s+/g, " ").toLowerCase().trim();
const shortDate = (iso?: string) => { const d = iso ? new Date(iso) : null; return d && !isNaN(+d) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""; };
const fmtN = (n: number, d = 0) => d ? n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : Math.round(n).toLocaleString("en-US");
export const listNames = (xs: string[]) => xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

/** The request: numbered sources, our reporting, the editor's note, and the material available. */
function userMessage(brief: Brief, figures: KitFigure[], feedback?: string[]): string {
  const req = {
    sources: brief.items.map((it, i) => ({ n: i + 1, publisher: it.publisher, headline: it.headline, excerpt: it.excerpt || undefined, published: it.published })),
    ourReporting: brief.reporting,
    editorsNote: brief.origin.note ? `${brief.origin.note} (guides the emphasis only; it is not a source of facts)` : undefined,
    figures: figures.map(f => ({ name: f.name, shows: f.about })),
  };
  let s = JSON.stringify(req, null, 1);
  if (!figures.length) s += `\n\nNo cut-out figures are available this time: do not use the figure or prices scene types, and leave "figure" out of the outro.`;
  if (feedback?.length) s += `\n\nYour previous storyboard had these problems. Fix every one (use the sources' own words, or drop the line):\n- ${feedback.join("\n- ")}`;
  return s;
}

type Keys = { anthropic?: string; gemini?: string; claudeModel: string; geminiModel: string };

async function callClaude(system: string, user: string, key: string, model: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 6000, system, messages: [{ role: "user", content: user }] }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch (e) { throw new SkipRun("Claude unavailable", `Claude did not answer (${(e as Error).message}).`); }
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 529 || res.status >= 500) throw new SkipRun("Claude unavailable", `Claude answered HTTP ${res.status}.`);
    throw limitError("Claude", res.status, body) ?? new Error(`Claude HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const body = await res.json() as { content?: { type: string; text?: string }[] };
  return (body.content ?? []).map(b => b.text ?? "").join("");
}

async function callGemini(system: string, user: string, key: string, model: string): Promise<{ text: string; model: string }> {
  // Google retires model names for new keys and the free tier runs out: try the chain, then skip cleanly.
  let last = "", quota = false, down = false;
  for (const m of [...new Set([model, "gemini-3.8-flash", "gemini-flash-latest"])]) {
    let res: Response;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": key, "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { maxOutputTokens: 16384, temperature: 0.5, responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(180_000),
      });
    } catch (e) { last = `Gemini ${m}: ${(e as Error).message}`; down = true; console.warn(last); continue; }
    if (!res.ok) {
      const body = await res.text();
      last = `Gemini ${m} HTTP ${res.status}: ${body.slice(0, 200)}`;
      console.warn(last);
      if (res.status === 400 && /api key/i.test(body)) throw new SkipRun("Gemini key", "Gemini rejected the API key (HTTP 400). Check the GEMINI_API_KEY secret.");
      if (res.status === 401 || res.status === 403) throw limitError("Gemini", res.status, body)!;
      if (res.status === 429) { quota = true; continue; }
      if (res.status === 404 || res.status >= 500) { down = down || res.status >= 500; continue; }
      throw new Error(last);
    }
    const body = await res.json() as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    return { text: (body.candidates?.[0]?.content?.parts ?? []).filter(p => !p.thought).map(p => p.text ?? "").join(""), model: m };
  }
  if (quota) throw new SkipRun("Gemini quota", `Every Gemini model in the chain answered HTTP 429 (quota). Last: ${last.slice(0, 160)}`);
  if (down) throw new SkipRun("Gemini unavailable", `Gemini did not answer. Last: ${last.slice(0, 160)}`);
  throw new Error(last || "No Gemini model answered");
}

/** One model call: Claude when its key is set (falling back to Gemini on a quota/credit problem), else Gemini. */
async function callWriter(user: string, keys: Keys): Promise<{ raw: unknown; model: string }> {
  const parse = (text: string) => { try { return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); } catch { return null; } };
  if (keys.anthropic) {
    try { return { raw: parse(await callClaude(SYSTEM, user, keys.anthropic, keys.claudeModel)), model: keys.claudeModel }; }
    catch (e) {
      if (!(e instanceof SkipRun) || !keys.gemini) throw e;
      console.warn(`${e.message} Trying Gemini.`);
    }
  }
  if (keys.gemini) { const r = await callGemini(SYSTEM, user, keys.gemini, keys.geminiModel); return { raw: parse(r.text), model: r.model }; }
  throw new SkipRun("No writer key", "Add the GEMINI_API_KEY or ANTHROPIC_API_KEY repository secret.");
}

/**
 * Model output → storyboard in the renderer's schema. Clippings get the publishers'
 * real headlines from our source list (never the model's copy of them).
 */
export function normalize(raw: unknown, brief: Brief, figures: KitFigure[], date: string): { board: Board; errors: string[] } {
  const errors: string[] = [];
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const figNames = new Set(figures.map(f => f.name));
  const shown = brief.sources.slice(0, 4);
  const clip = (c: unknown, withCue: boolean) => {
    const o = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
    const n = Number(o.source);
    const it = brief.items[n - 1];
    if (!Number.isInteger(n) || !it) { errors.push(`clip source ${JSON.stringify(o.source)} is not one of the numbered sources`); return null; }
    const mark = str(o.mark);
    return {
      outlet: it.publisher, date: shortDate(it.published), headline: it.headline,
      ...(mark && it.headline.includes(mark) ? { mark } : {}),
      ...(withCue ? { cue: str(o.cue) || it.publisher } : {}),
    };
  };
  const scenes: Scene[] = (Array.isArray(r.scenes) ? r.scenes : []).map((x: unknown, i: number) => {
    const s = { ...(x && typeof x === "object" ? x : {}) } as Scene;
    s.type = str(s.type);
    s.say = (Array.isArray(s.say) ? s.say : typeof s.say === "string" ? [s.say] : []).map(str).filter(Boolean);
    if (!BGS[s.type]) { errors.push(`scene ${i + 1}: type "${s.type}" does not exist`); return s; }
    if (!BGS[s.type].includes(str(s.bg))) s.bg = BGS[s.type][0];
    if (s.type === "ransom") {
      s.words = (Array.isArray(s.words) ? s.words : []).map(w => str(w).toUpperCase()).filter(Boolean);
      s.clips = (Array.isArray(s.clips) ? s.clips : []).slice(0, 2).map(c => clip(c, false)).filter(Boolean);
    }
    if (s.type === "clippings") s.clips = (Array.isArray(s.clips) ? s.clips : []).slice(0, 3).map(c => clip(c, true)).filter(Boolean);
    if (s.type === "stamp") s.page = "note";
    if (s.type === "receipt") s.footer = str(s.footer);
    if (s.type === "quote") s.label = str(s.label).toUpperCase();
    if (s.type === "bigwords" && Array.isArray(s.words)) s.words = s.words.map(w => ({ t: str((w as { t?: unknown }).t).toUpperCase(), s: ["black", "red", "white"].includes(str((w as { s?: unknown }).s)) ? str((w as { s?: unknown }).s) : "black" }));
    if (s.type === "outro") {
      if (s.figure && !figNames.has(str(s.figure))) delete s.figure;
      const names = listNames(shown.map(x => x.name));
      if (!/^sources?\b/i.test(s.say[s.say.length - 1] ?? "")) s.say.push(`Sources: ${names}.`);
    }
    return s;
  });
  const board: Board = {
    title: str(r.title), summary: str(r.summary), date,
    sources: shown.map(s => ({ name: s.name, url: s.url })),
    scenes,
    tags: (Array.isArray(r.tags) ? r.tags : []).map(str).filter(t => t && t.length <= 40).slice(0, 8),
  };
  return { board, errors };
}

/** Shape and layout rules (what fits on a 1080×1920 frame). */
export function validate(b: Board, figures: KitFigure[]): string[] {
  const e: string[] = [];
  const figNames = new Set(figures.map(f => f.name));
  if (b.title.length < 20 || b.title.length > 100) e.push(`title must be 40-80 characters (got ${b.title.length})`);
  if (/[?!]/.test(b.title) || /\b(breaking|shocking)\b/i.test(b.title)) e.push("title: no question or exclamation marks, no hype words");
  if (!b.summary || b.summary.length > 260) e.push("summary: one sentence, at most 200 characters");
  const n = b.scenes.length;
  if (n < 6 || n > 11) e.push(`7 to 10 scenes (got ${n})`);
  if (n && !["ransom", "clippings"].includes(b.scenes[0].type)) e.push("the first scene must be ransom or clippings");
  if (n && b.scenes[n - 1].type !== "outro") e.push("the last scene must be outro");
  if (b.scenes.slice(0, -1).some(s => s.type === "outro")) e.push("only the last scene may be an outro");
  const total = b.scenes.reduce((a, s) => a + s.say.reduce((x, y) => x + words(y), 0), 0);
  if (total < 100 || total > 195) e.push(`narration must be 115-175 words in total (got ${total})`);
  const len = (i: number, field: string, v: unknown, max: number, min = 1) => {
    const s = typeof v === "string" ? v : "";
    if (s.trim().length < min || s.length > max) e.push(`scene ${i + 1} (${b.scenes[i].type}): "${field}" must be ${min > 1 ? `${min}-` : ""}at most ${max} characters (got ${JSON.stringify(v ?? null)})`);
  };
  const arr = (v: unknown) => (Array.isArray(v) ? v : []) as Record<string, unknown>[];
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  b.scenes.forEach((s, i) => {
    const at = `scene ${i + 1} (${s.type})`;
    if (!BGS[s.type]) return;
    if (s.say.length < 1 || s.say.length > 3) e.push(`${at}: "say" needs 1-3 sentences`);
    s.say.forEach(x => { if (words(x) > 28) e.push(`${at}: sentence too long (${words(x)} words): "${x.slice(0, 60)}…"`); });
    if (/!/.test(s.say.join(" "))) e.push(`${at}: no exclamation marks`);
    switch (s.type) {
      case "ransom": {
        const w = (s.words as string[]) ?? [];
        if (w.length < 1 || w.length > 3) e.push(`${at}: 1-3 words`);
        const max = w.length >= 3 ? 8 : 7;
        w.forEach(x => { if (x.replace(/[^A-Z0-9]/g, "").length > max || x.length > max + 1) e.push(`${at}: "${x}" is too long for one row (at most ${max} letters)`); });
        break;
      }
      case "clippings": if (arr(s.clips).length < 1) e.push(`${at}: needs 1-3 clips`); break;
      case "numbers": {
        const it = arr(s.items);
        if (it.length < 1 || it.length > 3) e.push(`${at}: 1-3 items`);
        it.forEach(x => {
          if (!num(x.value)) e.push(`${at}: value must be a number (got ${JSON.stringify(x.value)})`);
          else if (`${str(x.prefix)}${fmtN(x.value as number, Number(x.decimals) || 0)}${str(x.suffix)}`.length > 8) e.push(`${at}: "${x.value}" is too wide; put the unit in the label`);
          len(i, "label", x.label, 40);
          if (str(x.suffix).length > 3) e.push(`${at}: suffix at most 3 characters`);
        });
        break;
      }
      case "scraps": {
        const it = (s.items as unknown[]) ?? [];
        if (!Array.isArray(it) || it.length < 2 || it.length > 3) e.push(`${at}: 2-3 items`);
        else it.forEach(x => len(i, "items", x, 30));
        if (!Array.isArray(s.cues) || (s.cues as unknown[]).length !== (Array.isArray(it) ? it.length : 0)) e.push(`${at}: one cue word per item`);
        if (s.circle != null && !(Number.isInteger(s.circle) && (s.circle as number) >= 0 && (s.circle as number) < (Array.isArray(it) ? it.length : 0))) delete s.circle;
        break;
      }
      case "bigwords": {
        const w = arr(s.words);
        if (w.length < 2 || w.length > 3) e.push(`${at}: 2-3 words`);
        w.forEach(x => len(i, "words.t", x.t, 9));
        if (s.note != null) len(i, "note", s.note, 70);
        break;
      }
      case "note": len(i, "big", s.big, 24); len(i, "small", s.small, 100); if (s.credit != null && s.credit !== "") len(i, "credit", s.credit, 60); break;
      case "check": len(i, "big", s.big, 26); len(i, "small", s.small, 80); break;
      case "quote": len(i, "label", s.label, 15); len(i, "quote", s.quote, 160, 4); len(i, "credit", s.credit, 80); break;
      case "stamp": {
        len(i, "pageTitle", s.pageTitle, 22); len(i, "stamp", s.stamp, 9);
        const l = (s.lines as unknown[]) ?? [];
        if (!Array.isArray(l) || l.length < 1 || l.length > 3) e.push(`${at}: 1-3 lines`); else l.forEach(x => len(i, "lines", x, 30));
        break;
      }
      case "bars": {
        const it = arr(s.items);
        if (it.length < 2 || it.length > 4) e.push(`${at}: 2-4 items`);
        it.forEach(x => { len(i, "label", x.label, 20); if (!num(x.value)) e.push(`${at}: value must be a number`); });
        const vals = it.map(x => x.value).filter(num) as number[];
        if (vals.length >= 2 && Math.max(...vals) === Math.min(...vals)) e.push(`${at}: the values must differ`);
        if (s.min != null && (!num(s.min) || (s.min as number) >= Math.min(...vals))) delete s.min;
        len(i, "unit", s.unit, 44); len(i, "stamp", s.stamp, 20);
        break;
      }
      case "prices": {
        if (!figNames.has(str(s.figure))) e.push(`${at}: figure must be one of ${[...figNames].join(", ") || "(none available: use another type)"}`);
        const it = arr(s.items);
        if (it.length < 1 || it.length > 2) e.push(`${at}: 1-2 items`);
        it.forEach(x => { len(i, "label", x.label, 18); len(i, "old", x.old, 9); len(i, "new", x.new, 9); });
        break;
      }
      case "receipt": {
        len(i, "title", s.title, 32);
        const it = arr(s.rows);
        if (it.length < 2 || it.length > 3) e.push(`${at}: 2-3 rows`);
        it.forEach(x => { len(i, "label", x.label, 26); len(i, "old", x.old, 12); len(i, "new", x.new, 10); });
        if (str(s.footer).length > 40) e.push(`${at}: footer at most 36 characters`);
        break;
      }
      case "figure":
        if (!figNames.has(str(s.figure))) e.push(`${at}: figure must be one of ${[...figNames].join(", ") || "(none available: use another type)"}`);
        if (!["left", "right"].includes(str(s.side))) s.side = "left";
        len(i, "quote", s.quote, 70, 4); len(i, "credit", s.credit, 60);
        break;
      case "crossout": len(i, "note", s.note, 44); len(i, "verdict", s.verdict, 44); break;
      case "outro": {
        const l = (s.lines as unknown[]) ?? [];
        if (!Array.isArray(l) || l.length !== 2) e.push(`${at}: exactly 2 lines`); else { len(i, "lines[0]", l[0], 24); len(i, "lines[1]", l[1], 26); }
        break;
      }
    }
  });
  return e;
}

/** Everything a viewer hears or reads, as separate lines for the fact guard. */
export function boardLines(b: Board): { spoken: string[]; shown: string[]; quotes: string[] } {
  const spoken = b.scenes.map(s => s.say.join(" "));
  const shown: string[] = [b.title, b.summary];
  const quotes: string[] = [];
  const add = (...v: unknown[]) => v.forEach(x => { if (typeof x === "string" && x.trim()) shown.push(x); else if (typeof x === "number") shown.push(fmtN(x)); });
  const arr = (v: unknown) => (Array.isArray(v) ? v : []) as Record<string, unknown>[];
  for (const s of b.scenes) {
    switch (s.type) {
      case "ransom": add((s.words as string[]).join(" ")); break;
      case "numbers": arr(s.items).forEach(x => add(`${str(x.prefix)}${num(x.value) ? fmtN(x.value as number, Number(x.decimals) || 0) : ""}${str(x.suffix)} ${str(x.label)}`)); break;
      case "scraps": add(...((s.items as string[]) ?? [])); break;
      case "bigwords": add(arr(s.words).map(w => str(w.t)).join(" "), s.note); break;
      case "note": add(s.big, s.small, s.credit); break;
      case "check": add(s.big, s.small); break;
      case "quote": add(s.label, s.credit); if (s.paraphrase) add(s.quote); else quotes.push(str(s.quote)); break;
      case "stamp": add(s.pageTitle, ...((s.lines as string[]) ?? []), s.stamp); break;
      case "bars": add(s.unit, s.stamp); arr(s.items).forEach(x => add(`${str(x.label)} ${num(x.value) ? fmtN(x.value as number) : ""}`)); break;
      case "prices": arr(s.items).forEach(x => add(`${str(x.label)} ${str(x.old)} ${str(x.new)}`)); break;
      case "receipt": add(s.title, s.footer); arr(s.rows).forEach(x => add(`${str(x.label)} ${str(x.old)} ${str(x.new)}`)); break;
      case "figure": add(s.credit); quotes.push(str(s.quote)); break;
      case "crossout": add(s.note, s.verdict); break;
      case "outro": add(...((s.lines as string[]) ?? [])); break;
    }
  }
  return { spoken, shown, quotes };
}
const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);

/** The fact guard over the whole storyboard: names and numbers (spoken and shown) and verbatim quotes. */
export function guard(b: Board, source: string): string[] {
  const { spoken, shown, quotes } = boardLines(b);
  const bad = [...new Set([
    ...unsupported(spoken.join(" "), source, ALLOW),
    ...unsupported(shown.map(x => x.replace(/[.!?:;]+$/, "")).join(". "), source, ALLOW),
  ])];
  const out = bad.length ? [`not in the sources: ${bad.join(", ")}`] : [];
  const src = fold(source);
  for (const q of quotes) {
    const f = fold(q).replace(/^["']|["'.,]+$/g, "");
    if (f && !src.includes(f)) out.push(`quote not found word for word in the sources: "${q}" (copy the exact words, or set "paraphrase": true on a quote scene)`);
  }
  return out;
}

export type WriteResult = { board: Board; model: string; attempts: number } | { board: null; reason: string; model: string; attempts: number };

/** Writes, checks, retries once with the problems listed. */
export async function writeStoryboard(brief: Brief, figures: KitFigure[], keys: Keys, date: string): Promise<WriteResult> {
  let feedback: string[] | undefined;
  let model = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const r = await callWriter(userMessage(brief, figures, feedback), keys);
    model = r.model;
    const raw = r.raw as { skip?: boolean; reason?: string } | null;
    if (raw && raw.skip) return { board: null, reason: `the writer declined: ${raw.reason || "too thin"}`, model, attempts: attempt };
    if (!raw) { feedback = ["the reply was not valid JSON"]; continue; }
    const { board, errors } = normalize(raw, brief, figures, date);
    const problems = [...errors, ...validate(board, figures), ...guard(board, brief.sourceText)];
    if (!problems.length) return { board, model, attempts: attempt };
    console.log(`storyboard attempt ${attempt}: ${problems.length} problem(s)\n  - ${problems.slice(0, 12).join("\n  - ")}`);
    feedback = problems.slice(0, 25);
  }
  return { board: null, reason: `fact guard / layout check failed twice: ${feedback?.slice(0, 5).join("; ")}`, model, attempts: 2 };
}

/** Dry runs: a fixed storyboard about the pipeline itself (fixture text, no API calls). */
export function fixtureBoard(figures: KitFigure[], date: string, sources: { name: string; url: string; title: string; publishedAt?: string }[]): Board {
  const fig = (pref: string[]) => pref.find(n => figures.some(f => f.name === n)) ?? figures[0]?.name;
  const a = fig(["librarian", "operator"]), b = fig(["photographer", "painter"]);
  const clip = (k: number, mark?: string) => ({ outlet: sources[k].name, date: shortDate(sources[k].publishedAt), headline: sources[k].title, ...(mark ? { mark } : {}) });
  const scenes: Scene[] = [
    { type: "ransom", bg: "newsprint", say: ["This is a dry run of the AI Broadsheet collage explainer, rendered without any API calls."], words: ["DRY", "RUN"], clips: [clip(0), clip(1, "checked against the sources")] },
    { type: "numbers", bg: "yellow", say: ["Each video is drawn at 30 frames a second.", "The frame is 1,080 pixels wide."], items: [{ value: 30, label: "frames a second" }, { value: 1080, label: "pixels wide" }] },
    { type: "scraps", bg: "kraft", say: ["Every scene is paper: clippings, notes and stamps.", "Each piece lands on a spoken word."], items: ["Clippings", "Notes and stamps", "Lands on a word"], cues: ["clippings", "stamps", "word"], circle: 2 },
    a
      ? { type: "figure", bg: "cream", side: "left", say: ["Archive figures are public domain photographs, cut out like magazine paper.", "They are decoration, never the people in the story."], figure: a, quote: "Facts only from the sources", credit: "AI Broadsheet house rule", cue: "decoration" }
      : { type: "check", bg: "yellow", say: ["Archive figures appear when the assets branch has them."], big: "No figures today", small: "The kit had no cut-outs" },
    { type: "stamp", bg: "slate", page: "note", say: ["Before anything is drawn, a fact guard reads every line.", "Anything the sources don't say is rejected."], pageTitle: "Fact guard", lines: ["names → in the sources?", "numbers → in the sources?"], stamp: "Rejected", cue: "rejected" },
    { type: "bigwords", bg: "cream", say: ["Facts only, from the sources."], words: [{ t: "FACTS", s: "black" }, { t: "ONLY", s: "red" }], note: "Every name and number is checked" },
    { type: "outro", bg: "board", say: ["That's the whole pipeline.", `Sources: ${listNames(sources.map(s => s.name))}.`], lines: ["That's the whole", "pipeline."], ...(b ? { figure: b } : {}) },
  ];
  return { title: "Dry run: how our collage explainers are made", summary: "A test render with fixture text, silent narration and placeholder timing.", date, sources: sources.map(s => ({ name: s.name, url: s.url })), scenes, tags: ["test"] };
}
