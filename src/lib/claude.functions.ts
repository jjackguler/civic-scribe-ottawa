import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public, read-only Claude helpers for readers. Clients send story ids only;
 * text is looked up server-side from the cached feed, so these endpoints can't
 * be used to run arbitrary prompts. Any failure returns an empty result.
 */

export type Translation = { title: string; summary: string };

export const translateStories = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    ids: z.array(z.string().max(200)).max(30),
    target: z.enum(["en", "fr"]),
  }).parse(d))
  .handler(async ({ data }): Promise<Record<string, Translation>> => {
    try {
      const c = await import("./claude.server");
      if (!c.claudeAvailable() || data.ids.length === 0) return {};
      const { loadNews } = await import("./news-engine");
      const { stories } = await loadNews();
      const byId = new Map(stories.map(s => [s.id, s]));
      const out: Record<string, Translation> = {};
      const todo: { id: string; title: string; summary: string }[] = [];
      for (const id of data.ids) {
        const s = byId.get(id);
        if (!s || s.lang === data.target) continue;
        const key = `tr:${data.target}:${id}:${c.hashKey(s.title)}`;
        const hit = c.cacheGet<Translation>(key);
        if (hit) out[id] = hit;
        else todo.push({ id, title: s.title, summary: s.summary.slice(0, 400) });
      }
      if (todo.length === 0) return out;
      const lang = data.target === "fr" ? "Canadian French" : "English";
      const res = await c.claudeJson<{ items?: { id: string; title: string; summary: string }[] }>({
        task: "translate",
        model: c.HAIKU,
        system: `You translate news headlines and summaries into ${lang} for a newspaper. Translate faithfully: do not add, remove, soften or sensationalise anything; keep names, products, numbers and quotes exact. Return {"items":[{"id","title","summary"}]} with one item per input, same ids. If summary is empty, return an empty summary.`,
        user: JSON.stringify({ items: todo }),
        maxTokens: 4000,
        ttlMs: 7 * 24 * 3600_000,
      });
      for (const it of res?.items ?? []) {
        const s = byId.get(it.id);
        if (!s || typeof it.title !== "string" || !it.title.trim()) continue;
        const tr = { title: it.title.trim().slice(0, 300), summary: typeof it.summary === "string" ? it.summary.trim().slice(0, 600) : "" };
        c.cacheSet(`tr:${data.target}:${it.id}:${c.hashKey(s.title)}`, tr, 7 * 24 * 3600_000);
        out[it.id] = tr;
      }
      return out;
    } catch (e) {
      console.warn("[claude] translate", (e as Error).message);
      return {};
    }
  });

/**
 * Second pass on heuristic clusters. Returns, per cluster id, the story ids
 * grouped by event. Clusters Claude didn't answer for are left out (keep as is).
 */
export const refineClusters = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    clusters: z.array(z.object({ id: z.string().max(200), ids: z.array(z.string().max(200)).min(2).max(12) })).max(12),
  }).parse(d))
  .handler(async ({ data }): Promise<Record<string, string[][]>> => {
    try {
      const c = await import("./claude.server");
      if (!c.claudeAvailable() || data.clusters.length === 0) return {};
      const { loadNews } = await import("./news-engine");
      const { stories } = await loadNews();
      const byId = new Map(stories.map(s => [s.id, s]));
      // Short numeric handles keep the prompt small and the answer easy to validate.
      const handle = new Map<string, string>();
      const payload = data.clusters.map((cl, ci) => ({
        cluster: ci,
        headlines: cl.ids.flatMap((id, i) => {
          const s = byId.get(id);
          if (!s) return [];
          const h = `${ci}.${i}`;
          handle.set(h, id);
          return [{ h, title: s.title, source: s.source }];
        }),
      })).filter(p => p.headlines.length >= 2);
      if (payload.length === 0) return {};
      const res = await c.claudeJson<{ clusters?: { cluster: number; groups: string[][] }[] }>({
        task: "group",
        model: c.HAIKU,
        system: `You check whether news headlines report the same specific event (same announcement, release, deal, ruling or incident). Headlines on the same broad topic but about different events are NOT the same event. For each cluster, partition its headline handles into groups, one group per distinct event. Every handle must appear exactly once. Return {"clusters":[{"cluster":number,"groups":[["0.0","0.1"],["0.2"]]}]}. Only group; never write or change text.`,
        user: JSON.stringify(payload),
        maxTokens: 1500,
        ttlMs: 6 * 3600_000,
      });
      const out: Record<string, string[][]> = {};
      for (const r of res?.clusters ?? []) {
        const cl = data.clusters[r.cluster];
        const p = payload.find(x => x.cluster === r.cluster);
        if (!cl || !p || !Array.isArray(r.groups)) continue;
        const want = new Set(p.headlines.map(x => x.h));
        const seen = new Set<string>();
        const groups: string[][] = [];
        let ok = true;
        for (const grp of r.groups) {
          if (!Array.isArray(grp)) { ok = false; break; }
          const ids: string[] = [];
          for (const h of grp) {
            if (typeof h !== "string" || !want.has(h) || seen.has(h)) { ok = false; break; }
            seen.add(h);
            ids.push(handle.get(h)!);
          }
          if (!ok) break;
          if (ids.length) groups.push(ids);
        }
        if (ok && seen.size === want.size) out[cl.id] = groups;
      }
      return out;
    } catch (e) {
      console.warn("[claude] group", (e as Error).message);
      return {};
    }
  });
