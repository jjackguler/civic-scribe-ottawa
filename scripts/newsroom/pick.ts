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

export type Seen = { ids: Set<string>; storyIds: Set<string>; killed: Set<string>; rejectedAt: Map<string, string> };
export type Skip = { id: string; title: string; why: string };

const HOURS = 36;

const STOP = new Set("about after against their there these those which while with from into over than that this what when will would could should says said new news ai".split(" "));
const words = (t: string) => new Set(t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9-]+/).filter(w => w.length >= 4 && !STOP.has(w)));
const sharedWords = (a: string, b: string) => { const A = words(a); return [...words(b)].filter(w => A.has(w)).length; };
const REJECT_COOLDOWN_MS = 72 * 3600_000;

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
  };
}

/** Events worth writing now, best first, plus why the others were passed over. */
export function pickEvents(stories: Story[], seen: Seen, now = Date.now()): { events: Event[]; skipped: Skip[] } {
  const events: Event[] = [];
  const skipped: Skip[] = [];
  const fresh = (iso: string) => now - new Date(iso).getTime() < HOURS * 3600_000;

  const covered = (id: string, group: Story[]) => {
    if (seen.ids.has(id) || seen.killed.has(id)) return "already written";
    if (group.some(s => seen.storyIds.has(s.id))) return "already written (shares a story with one of our articles)";
    const r = seen.rejectedAt.get(id);
    if (r && now - new Date(r).getTime() < REJECT_COOLDOWN_MS) return "rejected recently";
    return null;
  };

  const consider = (id: string, lead: Story, group: Story[], minChars: number) => {
    const gate = editorialGate({ title: lead.title, summary: lead.summary });
    if (!gate.ok) return skipped.push({ id, title: lead.title, why: `charter gate (${gate.reason})` });
    const upset = upsettingReasons(group.map(s => `${s.title} ${s.summary ?? ""}`).join(" "));
    if (upset.length) return skipped.push({ id, title: lead.title, why: `house rule, could upset or harm people (${upset.join(", ")})` });
    const why = covered(id, group);
    if (why) return skipped.push({ id, title: lead.title, why });
    const chars = group.reduce((t, s) => t + (s.summary?.length ?? 0), 0);
    if (chars < minChars) return skipped.push({ id, title: lead.title, why: `too little reporting to write from (${chars} characters of excerpts)` });
    events.push(toEvent(id, lead, group));
  };

  const clusters: Cluster[] = clusterStories(stories, HOURS);
  // Government releases stay out of the front-page clusters; a release about an event outlets are
  // reporting joins that event as its official source instead of becoming a second article.
  const govFresh = stories.filter(s => s.gov && s.kind !== "trending" && fresh(s.publishedAt));
  const joined = new Set<string>();
  for (const s of govFresh) {
    const c = clusters.find(c => c.sources >= 2 && c.stories.some(x => sharedWords(x.title, s.title) >= 3));
    if (c) { c.stories.push(s); joined.add(s.id); }
  }
  // 1. Events two or more outlets report, most-covered first (cluster order).
  for (const c of clusters) if (c.sources >= 2) consider(c.id, c.lead, c.stories, 240);
  // 2. Official announcements: a lab announcing its own news (in the clusters) or a government release. Newest first.
  const official = [
    ...clusters.filter(c => c.sources === 1 && c.lead.lab).map(c => ({ id: c.id, lead: c.lead, group: c.stories })),
    ...govFresh.filter(s => !joined.has(s.id)).map(s => ({ id: s.id, lead: s, group: [s] })),
  ].sort((a, b) => b.lead.publishedAt.localeCompare(a.lead.publishedAt));
  // One source has to carry a whole article (120+ words): thin blog excerpts only burn a model call and get turned down.
  for (const o of official) consider(o.id, o.lead, o.group, 600);
  // 3. One newsroom's own detailed report (owner's decision, 2026-10-17): written with that outlet named as the source.
  //    Never trending links, and never rumours, leaks or "reportedly" stories; thin excerpts can't carry an article.
  const RUMOUR = /\b(reportedly|rumou?rs?|leak(ed|s)?|sources say|could be|might be|rumeur|selon des sources)\b/i;
  for (const c of clusters) if (c.sources === 1 && !c.lead.lab) {
    if (c.lead.kind === "trending") skipped.push({ id: c.id, title: c.lead.title, why: "single outlet, a trending link" });
    else if (RUMOUR.test(`${c.lead.title} ${c.lead.summary ?? ""}`)) skipped.push({ id: c.id, title: c.lead.title, why: "single outlet, rumour or leak" });
    else consider(c.id, c.lead, c.stories, 450);
  }
  return { events, skipped };
}
