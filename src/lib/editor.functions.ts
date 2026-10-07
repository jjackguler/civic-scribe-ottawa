import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Editor's desk tools. Every call re-checks EDITOR_PASSCODE; failed attempts
 * are rate-limited per client. Nothing here writes files or sends anything.
 */

const g = globalThis as unknown as { __editorFails?: Map<string, { n: number; ts: number }> };
const fails = (g.__editorFails ??= new Map());
const WINDOW_MS = 10 * 60_000;
const MAX_FAILS = 5;

type Gate = { ok: true } | { ok: false; reason: "locked" | "wrong" | "unset" };

function gate(passcode: string): Gate {
  const expected = process.env["EDITOR_PASSCODE"];
  if (!expected) return { ok: false, reason: "unset" };
  const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const f = fails.get(ip);
  if (f && Date.now() - f.ts < WINDOW_MS && f.n >= MAX_FAILS) return { ok: false, reason: "locked" };
  // Constant-time compare.
  let diff = passcode.length ^ expected.length;
  for (let i = 0; i < Math.max(passcode.length, expected.length); i++) {
    diff |= (passcode.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  if (diff !== 0) {
    const cur = f && Date.now() - f.ts < WINDOW_MS ? f : { n: 0, ts: Date.now() };
    fails.set(ip, { n: cur.n + 1, ts: cur.ts });
    return { ok: false, reason: "wrong" };
  }
  fails.delete(ip);
  return { ok: true };
}

const pass = z.string().min(1).max(200);

export const editorUnlock = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: pass }).parse(d))
  .handler(async ({ data }) => {
    const r = gate(data.passcode);
    if (!r.ok) return { ok: false as const, reason: r.reason };
    const { claudeAvailable } = await import("./claude.server");
    const { PROGRAMS } = await import("./funding");
    return {
      ok: true as const,
      claude: claudeAvailable(),
      programs: PROGRAMS.map(p => ({ id: p.id, name: p.name.en, url: p.url, checked: p.checked })),
    };
  });

export type FundingReport = {
  id: string;
  verdict: "unchanged" | "possibly_outdated" | "error";
  disagreements: { field: string; ours: string; page: string }[];
  note: string;
  checkedAt: string;
};

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);
}

async function fetchPage(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; AIBroadsheet/1.0; +https://aibroadsheet.com)" } });
    if (!r.ok) return null;
    return htmlToText(await r.text());
  } catch { return null; } finally { clearTimeout(t); }
}

/** Check up to 3 programs per call (keeps subrequests per invocation small). */
export const fundingCheck = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: pass, ids: z.array(z.string().max(100)).min(1).max(3) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; reports: FundingReport[] }> => {
    if (!gate(data.passcode).ok) return { ok: false, reports: [] };
    const c = await import("./claude.server");
    const { PROGRAMS, STATUS_LABEL } = await import("./funding");
    const now = new Date().toISOString();
    const progs = PROGRAMS.filter(p => data.ids.includes(p.id));
    const pages = await Promise.all(progs.map(p => fetchPage(p.url)));
    const reports: FundingReport[] = [];
    const items: { id: string; ours: Record<string, string>; page: string }[] = [];
    progs.forEach((p, i) => {
      if (!pages[i]) reports.push({ id: p.id, verdict: "error", disagreements: [], note: "Official page could not be fetched within 6 seconds.", checkedAt: now });
      else items.push({
        id: p.id,
        ours: { name: p.name.en, org: p.org, status: STATUS_LABEL[p.status].en, forWhom: p.forWhom.en, whatYouGet: p.whatYouGet.en, howToStart: p.howToStart.en },
        page: pages[i]!,
      });
    });
    if (items.length) {
      const res = await c.claudeJson<{ reports?: { id: string; verdict: string; disagreements?: { field: string; ours: string; page: string }[]; note?: string }[] }>({
        task: "funding",
        model: c.SONNET,
        system: `You help a newspaper editor keep a list of Canadian AI funding programs accurate. For each item, compare "ours" (our listing) with "page" (text of the official page). Focus on status (open/closed), amounts, dates, eligibility and intake windows. Only report a disagreement when the page clearly contradicts our listing; quote our exact wording in "ours" and the page's exact wording in "page". If the page doesn't mention a detail, that is not a disagreement. Return {"reports":[{"id","verdict":"unchanged"|"possibly_outdated","disagreements":[{"field","ours","page"}],"note":"one short sentence"}]}.`,
        user: JSON.stringify({ items }),
        maxTokens: 3000,
        ttlMs: 6 * 3600_000,
      });
      for (const it of items) {
        const r = res?.reports?.find(x => x.id === it.id);
        if (!r) { reports.push({ id: it.id, verdict: "error", disagreements: [], note: "Claude did not return a report.", checkedAt: now }); continue; }
        reports.push({
          id: it.id,
          verdict: r.verdict === "possibly_outdated" ? "possibly_outdated" : "unchanged",
          disagreements: (r.disagreements ?? []).filter(d => d && typeof d.field === "string").slice(0, 8)
            .map(d => ({ field: String(d.field).slice(0, 80), ours: String(d.ours ?? "").slice(0, 400), page: String(d.page ?? "").slice(0, 400) })),
          note: String(r.note ?? "").slice(0, 300),
          checkedAt: now,
        });
      }
    }
    return { ok: true, reports };
  });

export const newsletterDraft = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: pass }).parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; en: string; fr: string; error?: string }> => {
    if (!gate(data.passcode).ok) return { ok: false, en: "", fr: "" };
    const c = await import("./claude.server");
    const { loadNews } = await import("./news-engine");
    const { clusterStories } = await import("./news");
    const { stories } = await loadNews();
    const top = clusterStories(stories).slice(0, 8).map(cl => ({
      title: cl.lead.title, source: cl.lead.source, link: cl.lead.link, summary: cl.lead.summary.slice(0, 400), outlets: cl.sources,
    }));
    if (top.length === 0) return { ok: true, en: "", fr: "", error: "No stories available right now." };
    const res = await c.claudeJson<{ en?: string; fr?: string }>({
      task: "newsletter",
      model: c.SONNET,
      system: `You draft "The Morning Broadsheet", a daily AI news email, for a human editor to review. Write it in English ("en") and in French ("fr"), plain text. Structure: one short neutral intro line; then each story as: the publisher's headline exactly as given (in "fr", keep the original headline and add a French translation in parentheses), "— Source", the link on its own line, and one neutral line of context taken ONLY from the supplied summary (no outside facts, no opinion; omit the line if the summary is empty); then a short closing line. Never invent facts, quotes or links. Return {"en":"...","fr":"..."}.`,
      user: JSON.stringify({ stories: top }),
      maxTokens: 5000,
      ttlMs: 30 * 60_000,
    });
    if (!res?.en) return { ok: true, en: "", fr: "", error: "Claude is unavailable right now. Try again later." };
    return { ok: true, en: String(res.en), fr: String(res.fr ?? "") };
  });
