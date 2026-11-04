/**
 * The owner's directives: newsroom/DIRECTIVES.md, a plain Markdown file the
 * owner edits in GitHub's web editor. Every run reads it. It can steer what the
 * desks write about (focus topics, first), add banned topics, set the tone, set
 * a daily target and the morning Canadian AI Brief slot.
 *
 * It can never loosen anything: the house rules (upsetting.ts, editorialGate),
 * the fact guard and the cost caps (NEWSROOM_DAILY_CAP, per-run guard) stay in
 * code. A target above the daily cap is simply never reached. Anything that
 * can't be read falls back to the defaults below and is reported in the log.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export type DirectiveTopic = { label: string; keywords: string[] };
export type Directives = {
  focus: DirectiveTopic[];
  banned: DirectiveTopic[];
  tone: string[];
  target: { min: number; max: number };
  brief: { on: boolean; title: { en: string; fr: string }; fromHour: number; toHour: number; minStories: number; maxStories: number };
  /** Where these came from ("newsroom/DIRECTIVES.md" or "defaults"), and what couldn't be read. */
  from: string;
  warnings: string[];
};

export const DEFAULT_DIRECTIVES: Directives = {
  focus: [
    { label: "Canadian AI policy and regulation", keywords: ["Canada", "Canadian", "Ottawa", "federal", "minister", "Quebec", "Québec", "Ontario"] },
    { label: "AI funding and investment in Canada", keywords: ["funding", "investment", "grant", "venture", "Cohere", "Mila", "Vector Institute", "Amii", "CIFAR"] },
    { label: "AI research", keywords: ["research", "study", "paper", "university"] },
    { label: "AI tools people can use", keywords: ["launches", "released", "available", "free", "app", "tool"] },
  ],
  banned: [],
  tone: ["Human-centred AI journalism: neither fear nor hype.", "Name people's worries plainly, then end on what the sources show people can do."],
  target: { min: 3, max: 5 },
  brief: { on: true, title: { en: "Canadian AI Brief", fr: "Le point IA canadien" }, fromHour: 6, toHour: 11, minStories: 3, maxStories: 6 },
  from: "defaults",
  warnings: [],
};

const clone = (d: Directives): Directives => structuredClone(d);

/** Splits the file into its `##` sections: heading (lowercase) → bullet lines (without "- "). Notes in brackets are dropped. */
function sections(md: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let current: string | null = null;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (h) { current = h[1].toLowerCase().replace(/\s+/g, " "); out.set(current, []); continue; }
    const b = line.match(/^\s*[-*]\s+(.+?)\s*$/);
    if (current && b && !/^\(.*\)$/.test(b[1])) out.get(current)!.push(b[1]);
  }
  return out;
}

function topics(lines: string[], warnings: string[], where: string): DirectiveTopic[] {
  return lines.map(l => {
    const [label, rest] = l.split(/\|\s*keywords?\s*:/i);
    const keywords = (rest ?? "").split(",").map(k => k.trim()).filter(k => k.length >= 2 && k.length <= 60);
    if (!rest) warnings.push(`${where}: "${label.trim().slice(0, 40)}" has no "| keywords:", so it only guides the writers`);
    return { label: label.trim().slice(0, 120), keywords: keywords.slice(0, 40) };
  }).filter(t => t.label).slice(0, 20);
}

const settings = (lines: string[]) => new Map(lines.map(l => {
  const i = l.indexOf(":");
  return i < 0 ? [l.toLowerCase(), ""] : [l.slice(0, i).trim().toLowerCase(), l.slice(i + 1).trim()];
}));

const int = (v: string | undefined, lo: number, hi: number): number | null => {
  if (!v || !/^\d{1,3}$/.test(v.trim())) return null;
  const n = Number(v);
  return n >= lo && n <= hi ? n : null;
};

/** Reads the directives text. Never throws: a broken line keeps that setting's default and adds a warning. */
export function parseDirectives(md: string | null, from = "newsroom/DIRECTIVES.md"): Directives {
  const d = clone(DEFAULT_DIRECTIVES);
  if (md === null || !md.trim()) { d.warnings.push("directives file missing or empty: using the defaults"); return d; }
  d.from = from;
  const s = sections(md);
  const w = d.warnings;
  const focus = s.get("focus topics");
  if (focus?.length) d.focus = topics(focus, w, "focus topics");
  const banned = s.get("banned topics");
  // A banned topic without keywords is still told to the writers and the standards desk; it just can't be skipped for free.
  if (banned) d.banned = topics(banned, w, "banned topics");
  const tone = s.get("tone");
  if (tone?.length) d.tone = tone.map(t => t.slice(0, 300)).slice(0, 12);

  const t = settings(s.get("daily target") ?? []);
  if (t.size) {
    const min = int(t.get("min"), 0, 50), max = int(t.get("max"), 1, 50);
    if (min === null) w.push(`daily target: min "${t.get("min") ?? ""}" is not a number from 0 to 50; using ${d.target.min}`); else d.target.min = min;
    if (max === null) w.push(`daily target: max "${t.get("max") ?? ""}" is not a number from 1 to 50; using ${d.target.max}`); else d.target.max = max;
    if (d.target.max < d.target.min) { w.push(`daily target: max ${d.target.max} is below min ${d.target.min}; using max = min`); d.target.max = d.target.min; }
  }

  const b = settings(s.get("morning brief") ?? []);
  if (b.size) {
    const on = (b.get("on") ?? "yes").toLowerCase();
    d.brief.on = !/^(no|off|false|non|0)$/.test(on);
    if (b.get("title")) d.brief.title.en = b.get("title")!.slice(0, 40);
    if (b.get("titre")) d.brief.title.fr = b.get("titre")!.slice(0, 40);
    const win = b.get("window")?.match(/^(\d{1,2})(?::00)?\s*[-–]\s*(\d{1,2})(?::00)?$/);
    if (b.has("window")) {
      const from = win ? int(win[1], 0, 23) : null, to = win ? int(win[2], 1, 24) : null;
      if (from === null || to === null || to <= from) w.push(`morning brief: window "${b.get("window")}" should look like 06:00-11:00 (whole hours); using ${d.brief.fromHour}:00-${d.brief.toHour}:00`);
      else { d.brief.fromHour = from; d.brief.toHour = to; }
    }
    const n = b.get("stories")?.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})$/);
    if (b.has("stories")) {
      const lo = n ? int(n[1], 2, 6) : null, hi = n ? int(n[2], 2, 6) : null;
      if (lo === null || hi === null || hi < lo) w.push(`morning brief: stories "${b.get("stories")}" should look like 3-6 (2 to 6); using ${d.brief.minStories}-${d.brief.maxStories}`);
      else { d.brief.minStories = lo; d.brief.maxStories = hi; }
    }
  }
  return d;
}

export const DIRECTIVES_PATH = fileURLToPath(new URL("../../newsroom/DIRECTIVES.md", import.meta.url));

export async function loadDirectives(path = DIRECTIVES_PATH): Promise<Directives> {
  const raw = await readFile(path, "utf8").catch(() => null);
  return parseDirectives(raw);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Whole-word, case-insensitive keyword match ("app" doesn't match "apple"; "Series E" matches "series E"). */
export function matchesTopic(text: string, t: DirectiveTopic): boolean {
  return t.keywords.some(k => new RegExp(`(?<![\\p{L}\\p{N}])${escape(k)}(?![\\p{L}\\p{N}])`, "iu").test(text));
}
export const bannedBy = (text: string, d: Directives) => d.banned.find(t => t.keywords.length && matchesTopic(text, t))?.label ?? null;
export const focusHits = (text: string, d: Directives) => d.focus.filter(t => matchesTopic(text, t)).map(t => t.label);

/** How many more pieces may be published today under the owner's target. It only ever stops work early: the cost caps still apply. */
export function targetRoom(publishedToday: number, d: Pick<Directives, "target">): number {
  return Math.max(0, d.target.max - publishedToday);
}

/** The local hour and date in Toronto, the site's clock. */
export function torontoClock(now = Date.now()): { hour: number; date: string } {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(now));
  const get = (t: string) => p.find(x => x.type === t)?.value ?? "";
  return { hour: Number(get("hour")), date: `${get("year")}-${get("month")}-${get("day")}` };
}

/**
 * What the writing desks are told. Guides emphasis and tone only: the block
 * says plainly that the hard rules, the house voice and the sources win.
 */
export function directivesPrompt(d: Directives, desk: "reporter" | "copy" | "standards" | "translator"): string {
  const lines: string[] = [];
  if (desk === "reporter" && d.focus.length) lines.push(`- Our readers are in Canada and these are our focus topics: ${d.focus.map(t => t.label).join("; ")}. When the sources support it, lead with what matters to readers in Canada and to people who want to use these tools; never invent a Canadian angle or an impact the sources don't state.`);
  if ((desk === "reporter" || desk === "standards") && d.banned.length) lines.push(`- We do not cover: ${d.banned.map(t => t.label).join("; ")}. ${desk === "reporter" ? 'If the event is mainly about one of these, return {"skip": true, "reason": "banned topic: <which>"}.' : "FAIL an article that is mainly about one of these."}`);
  if (desk !== "standards" && d.tone.length) lines.push(...d.tone.map(t => `- Tone: ${t}`));
  if (!lines.length) return "";
  return `\n\nThe owner's directives (newsroom/DIRECTIVES.md). They guide emphasis and tone only; they never override the hard rules, the house voice or the sources above:\n${lines.join("\n")}`;
}
