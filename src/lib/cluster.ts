/**
 * Story clustering: which headlines from different newsrooms describe the same
 * event. Pure functions (no React, no server code) so the site and the
 * Originals pipeline (scripts/originals) share them.
 */
import type { Story } from "./news-engine";

/** Front-page pool: newsroom, lab and analysis stories about AI. */
export const isFrontPool = (s: Story) => !s.gov && s.kind !== "trending" && s.kind !== "beat";

const STOP = new Set(("the a an and or but of to in on for with at by from as is are was were be been it its this that these those " +
  "new news says say said will would could can may might how why what when who which into over after about more than just now " +
  "ai artificial intelligence report reports first big top week today year years its it's here there their they them his her " +
  "le la les des du de et en un une pour sur dans avec par est sont au aux ia").split(" "));

function tokens(title: string): string[] {
  return [...new Set(title.toLowerCase().replace(/['’]s\b/g, "").split(/[^a-z0-9àâçéèêëîïôûùüÿœ.-]+/)
    .map(w => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter(w => w.length >= 3 && !STOP.has(w)))];
}

export type Cluster = { id: string; lead: Story; stories: Story[]; sources: number; latest: string };

export function clusterStories(stories: Story[], hours = 48): Cluster[] {
  const now = Date.now();
  const pool = stories.filter(s => isFrontPool(s) && now - new Date(s.publishedAt).getTime() < hours * 3600000);
  const toks = pool.map(s => tokens(s.title));
  const df = new Map<string, number>();
  for (const ts of toks) for (const t of ts) df.set(t, (df.get(t) ?? 0) + 1);
  // A word is "telling" when few stories use it (it names this event), or
  // when it is a product/version name like gpt-6 or llama-4.
  const rareMax = Math.max(3, Math.round(pool.length * 0.08));
  const product = (t: string) => /[a-z]-?\d|\d-?[a-z]{2,}/.test(t) && !/^\$?\d+(\.\d+)?[kmb]?$/.test(t);
  const telling = (t: string) => product(t) || (df.get(t) ?? 0) <= rareMax;

  const parent = pool.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < pool.length; i++) {
    const a = new Set(toks[i]);
    for (let j = i + 1; j < pool.length; j++) {
      if (pool[i].source === pool[j].source) continue;
      const shared = toks[j].filter(t => a.has(t));
      if (shared.length < 2) continue;
      const strong = shared.filter(telling).length;
      const hasProduct = shared.some(product);
      // Conservative on purpose: a wrong "full coverage" list is worse than a missed one.
      if (strong >= 2 || (strong >= 1 && shared.length >= 3) || hasProduct) parent[find(i)] = find(j);
    }
  }
  const groups = new Map<number, Story[]>();
  pool.forEach((s, i) => { const r = find(i); groups.set(r, [...(groups.get(r) ?? []), s]); });

  return [...groups.values()]
    .map(group => {
      const sorted = [...group].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      const sources = new Set(sorted.map(s => s.source)).size;
      const lead = sorted.find(s => s.image && s.kind === "news") ?? sorted.find(s => s.image) ?? sorted[0];
      return { id: lead.id, lead, stories: [lead, ...sorted.filter(s => s !== lead)], sources, latest: sorted[0].publishedAt };
    })
    .sort((a, b) => clusterScore(b, now) - clusterScore(a, now));
}

export function clusterScore(c: Cluster, now: number) {
  const ageH = (now - new Date(c.latest).getTime()) / 3600000;
  return c.sources * 2 - ageH / 6 + (c.lead.image ? 0.5 : 0);
}

/** A story is "developing" when three or more newsrooms reported it in the last six hours. */
export function isDeveloping(c: Cluster, now = Date.now()) {
  const recent = c.stories.filter(s => now - new Date(s.publishedAt).getTime() < 6 * 3600000);
  return new Set(recent.map(s => s.source)).size >= 3;
}

/** "Breaking": three or more newsrooms reported it within the last two hours. */
export function isBreaking(c: Cluster, now = Date.now()) {
  const recent = c.stories.filter(s => now - new Date(s.publishedAt).getTime() < 2 * 3600000);
  return new Set(recent.map(s => s.source)).size >= 3;
}

