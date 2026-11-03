/**
 * Choosing what the newsroom writes about.
 *
 * - An event several outlets report (a cluster from cluster.ts with two or
 *   more outlets), or
 * - one official announcement: the company, lab or government announcing its
 *   own news (a lab or government feed), then one newsroom's own detailed report
 *   (named as the source). Never a trending link, a rumour or a leak.
 * - Never an event we already wrote (any of its stories is in the index), one
 *   the owner killed, or one rejected in the last three days.
 * - Never a story the charter's gate keeps off the site.
 * - Only fresh events (36 hours) with enough reporting to write from.
 */
import { upsettingReasons } from "./upsetting";
import type { Story } from "../../src/lib/news-engine";
import { clusterStories, type Cluster } from "../../src/lib/cluster";
import { editorialGate, humanLens } from "../../src/lib/editorial";
import type { DispatchSource } from "../../src/lib/dispatch-types";
import { pickBackground } from "./library";
import type { Event } from "./roles";
import { DEFAULT_DIRECTIVES, bannedBy, focusHits, torontoClock, type Directives } from "./directives";

export type Seen = { ids: Set<string>; storyIds: Set<string>; killed: Set<string>; rejectedAt: Map<string, string> };
export type Skip = { id: string; title: string; why: string };

const HOURS = 36;

const STOP = new Set("about after against their there these those which while with from into over than that this what when will would could should says said new news ai".split(" "));
const words = (t: string) => new Set(t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9-]+/).filter(w => w.length >= 4 && !STOP.has(w)));
const sharedWords = (a: string, b: string) => { const A = words(a); return [...words(b)].filter(w => A.has(w)).length; };
const titleWords = (t: string) => new Set([...words(t)].filter(w => !["model", "models", "company", "companies"].includes(w)));
const sharedTitleWords = (a: string, b: string) => { const A = titleWords(a); return [...titleWords(b)].filter(w => A.has(w)).length; };
const REJECT_COOLDOWN_MS = 72 * 3600_000;
const RUMOUR = /\b(reportedly|rumou?rs?|leak(ed|s)?|sources say|could be|might be|rumeur|selon des sources)\b/i;
/** Same event, by the rule splitForReporting uses: three title words, or one title word and five words of headline plus excerpt. */
const sameEvent = (a: Story, b: Story) => sharedTitleWords(a.title, b.title) >= 3 ||
  (sharedTitleWords(a.title, b.title) >= 1 && sharedWords(`${a.title} ${a.summary ?? ""}`, `${b.title} ${b.summary ?? ""}`) >= 5);
/** Two or more outlets: one sentence each can't carry an article (the reporter skipped those, at a paid call each). */
const MULTI_MIN = 400;

/** Split transitive desk clusters before using them as evidence for one article.
 * Every included report must match the lead directly, not merely another
 * cluster member. Rich excerpts can corroborate differently worded headlines.
 * Singletons remain eligible for the existing one-source rules; we never
 * discard a story here.
 */
export function splitForReporting(clusters: Cluster[]): Cluster[] {
  return clusters.flatMap(cluster => {
    const remaining = [...cluster.stories];
    const parts: Cluster[] = [];
    while (remaining.length) {
      const lead = remaining.shift()!;
      const related = remaining.filter(s => sharedTitleWords(lead.title, s.title) >= 3 ||
        (sharedTitleWords(lead.title, s.title) >= 1 && sharedWords(`${lead.title} ${lead.summary ?? ""}`, `${s.title} ${s.summary ?? ""}`) >= 5));
      for (const s of related) remaining.splice(remaining.indexOf(s), 1);
      const stories = [lead, ...related];
      parts.push({ id: lead.id, lead, stories, sources: new Set(stories.map(s => s.source)).size,
        latest: stories.reduce((latest, s) => s.publishedAt > latest ? s.publishedAt : latest, lead.publishedAt) });
    }
    return parts;
  });
}

function toSources(stories: Story[]): { sources: DispatchSource[]; excerpts: string[] } {
  // One report per outlet (its newest), richest excerpts first, at most six, then in publishing order.
  const byOutlet = new Map<string, Story>();
  for (const s of [...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) if (!byOutlet.has(s.source)) byOutlet.set(s.source, s);
  const chosen = [...byOutlet.values()]
    .sort((a, b) => (b.summary?.length ?? 0) - (a.summary?.length ?? 0))
    .slice(0, 6)
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  return {
    sources: chosen.map((s, i) => ({ key: `s${i + 1}`, outlet: s.source, title: s.title, url: s.link, publishedAt: s.publishedAt, storyId: s.id, official: s.lab || s.gov, lang: s.lang })),
    excerpts: chosen.map(s => (s.summary ?? "").slice(0, 900)),
  };
}

function toEvent(id: string, lead: Story, stories: Story[]): Event {
  const { sources, excerpts } = toSources(stories);
  const text = sources.map((s, i) => `${s.title}. ${excerpts[i]}`).join("\n");
  return {
    id,
    topic: lead.topic,
    lens: humanLens({ title: lead.title, summary: lead.summary }),
    sources,
    excerpts,
    background: pickBackground(text).map((p, i) => ({ ...p, key: `b${i + 1}` })),
    region: stories.some(s => s.region === "canada") ? "canada" : "world",
  };
}

/**
 * Events worth writing now, best first, plus why the others were passed over.
 * The owner's directives (newsroom/DIRECTIVES.md) add banned topics, skipped
 * here before any paid call, and focus topics: Canadian stories first, then
 * stories on a focus topic, then the usual order.
 */
export function pickEvents(stories: Story[], seen: Seen, now = Date.now(), d: Directives = DEFAULT_DIRECTIVES): { events: Event[]; skipped: Skip[] } {
  const events: Event[] = [];
  const skipped: Skip[] = [];
  const fresh = (iso: string) => now - new Date(iso).getTime() < HOURS * 3600_000;
  const used = new Set<string>();
  const textOf = (group: Story[]) => group.map(s => `${s.title} ${s.summary ?? ""}`).join(" ");
  const fitForGroup = (s: Story) => fresh(s.publishedAt) && s.kind !== "trending" && !seen.storyIds.has(s.id) && !used.has(s.id) &&
    editorialGate({ title: s.title, summary: s.summary }).ok && !upsettingReasons(`${s.title} ${s.summary ?? ""}`).length && !bannedBy(`${s.title} ${s.summary ?? ""}`, d) && !RUMOUR.test(`${s.title} ${s.summary ?? ""}`);
  /** Before giving up on thin reporting: other outlets' reports of the same event, from the whole desk (government releases too). */
  const gather = (lead: Story, group: Story[]) => {
    const outlets = new Set(group.map(s => s.source));
    const more: Story[] = [];
    for (const s of stories) {
      if (outlets.size >= 6) break;
      if (outlets.has(s.source) || group.includes(s) || !fitForGroup(s) || !sameEvent(lead, s)) continue;
      more.push(s); outlets.add(s.source);
    }
    return more;
  };

  const covered = (id: string, group: Story[]) => {
    if (seen.ids.has(id) || seen.killed.has(id)) return "already written";
    if (group.some(s => seen.storyIds.has(s.id))) return "already written (shares a story with one of our newsroom summaries)";
    const r = seen.rejectedAt.get(id);
    if (r && now - new Date(r).getTime() < REJECT_COOLDOWN_MS) return "rejected recently";
    return null;
  };

  const consider = (id: string, lead: Story, group: Story[], minChars: number) => {
    const gate = editorialGate({ title: lead.title, summary: lead.summary });
    if (!gate.ok) return skipped.push({ id, title: lead.title, why: `charter gate (${gate.reason})` });
    const upset = upsettingReasons(textOf(group));
    if (upset.length) return skipped.push({ id, title: lead.title, why: `house rule, could upset or harm people (${upset.join(", ")})` });
    const banned = bannedBy(textOf(group), d);
    if (banned) return skipped.push({ id, title: lead.title, why: `owner's directives, banned topic (${banned})` });
    const why = covered(id, group);
    if (why) return skipped.push({ id, title: lead.title, why });
    if (group.some(s => used.has(s.id))) return skipped.push({ id, title: lead.title, why: "already part of another event in this run" });
    const chars = (g: Story[]) => g.reduce((t, s) => t + (s.summary?.length ?? 0), 0);
    let all = group;
    // Once two or more outlets carry the event, the multi-outlet bar applies; a lone report must carry the article alone.
    const need = (g: Story[]) => new Set(g.map(s => s.source)).size >= 2 ? Math.min(minChars, MULTI_MIN) : minChars;
    let gathered = 0;
    if (chars(all) < need(all)) {
      const more = gather(lead, all);
      gathered = more.length;
      all = [...all, ...more];
    }
    if (chars(all) < need(all)) return skipped.push({ id, title: lead.title, why: `too little reporting to write from (${chars(all)} characters of excerpts from ${new Set(all.map(s => s.source)).size} outlet(s)${gathered ? `, after gathering ${gathered} more` : ", no other outlet found"}; needs ${need(all)})` });
    for (const s of all) used.add(s.id);
    const e = toEvent(id, lead, all);
    if (gathered) e.gathered = gathered;
    events.push(e);
  };

  const clusters: Cluster[] = splitForReporting(clusterStories(stories, HOURS));
  // Government releases stay out of the front-page clusters; a release about an event outlets are
  // reporting joins that event as its official source instead of becoming a second article.
  const govFresh = stories.filter(s => s.gov && s.kind !== "trending" && fresh(s.publishedAt));
  const joined = new Set<string>();
  for (const s of govFresh) {
    const c = clusters.find(c => c.sources >= 2 && c.stories.some(x => sharedWords(x.title, s.title) >= 3));
    if (c) { c.stories.push(s); joined.add(s.id); }
  }
  // 1. Events two or more outlets report, most-covered first (cluster order).
  for (const c of clusters) if (c.sources >= 2) consider(c.id, c.lead, c.stories, MULTI_MIN);
  // 2. Official announcements: a lab announcing its own news (in the clusters) or a government release. Newest first.
  const official = [
    ...clusters.filter(c => c.sources === 1 && c.lead.lab).map(c => ({ id: c.id, lead: c.lead, group: c.stories })),
    ...govFresh.filter(s => !joined.has(s.id)).map(s => ({ id: s.id, lead: s, group: [s] })),
  ].sort((a, b) => b.lead.publishedAt.localeCompare(a.lead.publishedAt));
  // One source has to carry a whole article (120+ words): thin blog excerpts only burn a model call and get turned down.
  for (const o of official) consider(o.id, o.lead, o.group, 600);
  // 3. One newsroom's own detailed report (owner's decision, 2026-10-17): written with that outlet named as the source.
  //    Never trending links, and never rumours, leaks or "reportedly" stories; thin excerpts can't carry an article.
  for (const c of clusters) if (c.sources === 1 && !c.lead.lab) {
    if (c.lead.kind === "trending") skipped.push({ id: c.id, title: c.lead.title, why: "single outlet, a trending link" });
    else if (RUMOUR.test(`${c.lead.title} ${c.lead.summary ?? ""}`)) skipped.push({ id: c.id, title: c.lead.title, why: "single outlet, rumour or leak" });
    else consider(c.id, c.lead, c.stories, 450);
  }
  // The owner's focus: Canadian stories first, then a focus topic; ties keep the order above (most-covered first).
  const score = (e: Event) => (e.region === "canada" ? 2 : 0) + (focusHits(e.sources.map((s, i) => `${s.title} ${e.excerpts[i] ?? ""}`).join(" "), d).length ? 1 : 0);
  const ranked = events.map((e, i) => ({ e, i, s: score(e) })).sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.e);
  return { events: ranked, skipped };
}

export const briefId = (torontoDate: string) => `brief-${torontoDate}`;

/**
 * The morning Canadian AI Brief (owner's directives): once a day, in the first
 * run inside the window (Toronto time), a roundup of separate Canadian AI
 * stories, one per event, each with enough reporting for two sentences. The
 * same desks write and check it. Never a story the house rules, the charter
 * gate or the owner's banned topics keep off the site, never a rumour.
 */
export function pickBrief(stories: Story[], seen: Seen, now = Date.now(), d: Directives = DEFAULT_DIRECTIVES): { event: Event | null; why: string } {
  if (!d.brief.on) return { event: null, why: "switched off in the directives" };
  const { hour, date } = torontoClock(now);
  const window = `${d.brief.fromHour}:00-${d.brief.toHour}:00 Toronto`;
  if (hour < d.brief.fromHour || hour >= d.brief.toHour) return { event: null, why: `outside its window (${window})` };
  const id = briefId(date);
  if (seen.ids.has(id) || seen.killed.has(id)) return { event: null, why: "already published today" };
  if (seen.rejectedAt.has(id)) return { event: null, why: "turned down earlier today (see log/rejected.json)" };
  const text = (s: Story) => `${s.title} ${s.summary ?? ""}`;
  const pool = stories
    .filter(s => s.region === "canada" && s.kind !== "trending" && now - new Date(s.publishedAt).getTime() < HOURS * 3600_000)
    .filter(s => !seen.storyIds.has(s.id) && (s.summary?.length ?? 0) >= 120)
    .filter(s => editorialGate({ title: s.title, summary: s.summary }).ok && !upsettingReasons(text(s)).length && !bannedBy(text(s), d) && !RUMOUR.test(text(s)))
    // Focus topics first, then the richest reporting, then the newest.
    .sort((a, b) => focusHits(text(b), d).length - focusHits(text(a), d).length || (b.summary?.length ?? 0) - (a.summary?.length ?? 0) || b.publishedAt.localeCompare(a.publishedAt));
  const chosen: Story[] = [];
  for (const s of pool) {
    if (chosen.length >= d.brief.maxStories) break;
    if (!chosen.some(c => c.link === s.link || sameEvent(c, s))) chosen.push(s);
  }
  if (chosen.length < d.brief.minStories) return { event: null, why: `only ${chosen.length} separate Canadian stor${chosen.length === 1 ? "y" : "ies"} with enough reporting (needs ${d.brief.minStories})` };
  chosen.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  const sources: DispatchSource[] = chosen.map((s, i) => ({ key: `s${i + 1}`, outlet: s.source, title: s.title, url: s.link, publishedAt: s.publishedAt, storyId: s.id, official: s.lab || s.gov, lang: s.lang }));
  const excerpts = chosen.map(s => (s.summary ?? "").slice(0, 900));
  const all = chosen.map(text).join("\n");
  const topics = chosen.map(s => s.topic);
  const topic = topics.sort((a, b) => topics.filter(t => t === b).length - topics.filter(t => t === a).length)[0] ?? "policy";
  return {
    event: {
      id, topic, lens: humanLens({ title: chosen[0].title, summary: all }), sources, excerpts,
      background: pickBackground(all).map((p, i) => ({ ...p, key: `b${i + 1}` })),
      region: "canada", brief: { title: d.brief.title },
    },
    why: `${chosen.length} Canadian stories`,
  };
}
