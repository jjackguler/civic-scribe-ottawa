/**
 * The AI Broadsheet Newsroom: original articles, written with AI by a staged
 * editorial team, from events several outlets report (or one party's own
 * official announcement). See docs/newsroom.md.
 *
 *   1. Build the news desk (same engine as the site) and pick events we
 *      haven't written (pick.ts).
 *   2. Reporter → copy editor → standards editor → translator → SEO editor →
 *      page designer (roles.ts), each a separate model call with its own role
 *      prompt and the house voice. Any desk can stop the article; the reason
 *      is logged in the store.
 *   3. Write articles/<id>.json and index.json into the store folder; the
 *      workflow commits it to the `newsroom` branch.
 *
 * Usage:  npx tsx scripts/newsroom/run.ts [--dry-run] [--store dir] [--max n]
 *   --dry-run   fixture desk + canned desk replies: no feeds, no API, no key; writes to out/newsroom-store
 * Env:    ANTHROPIC_API_KEY or GEMINI_API_KEY (one is required outside --dry-run; Claude is used when both are set)
 *         NEWSROOM_MAX_PER_RUN (default 4), NEWSROOM_DAILY_CAP (default 40): events attempted
 *         NEWSROOM_GEMINI_WRITER (gemini-2.5-pro), NEWSROOM_GEMINI_CHECKER (gemini-2.5-flash)
 *         NEWSROOM_CLAUDE_WRITER / CLAUDE_MODEL, NEWSROOM_CLAUDE_CHECKER
 *         GEMINI_IMAGE_MODEL (optional: abstract cover illustrations; needs GEMINI_API_KEY)
 */
import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { humanLens } from "../../src/lib/editorial";
import { countWords, uniqueSlug, type NewsroomArticle, type NewsroomCopy, type RoleNote } from "../../src/lib/newsroom-types";
import { cannedModels, illustrate, liveModels, type Models } from "./models";
import { LINKS, loadGlossary } from "./library";
import { pickEvents } from "./pick";
import { copyEditor, pageDesigner, reporter, seoEditor, standardsEditor, translator, type Event, type Seo, type SeoCopy } from "./roles";
import type { Draft } from "./shape";
import { openStore, type Store } from "./store";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
/** NEWSROOM_REVIEW=off publishes everything that passes the desks; the default holds risky stories for a human. */
const REVIEW = (process.env.NEWSROOM_REVIEW ?? "risky").trim().toLowerCase();

/**
 * Stories a human editor must approve before they go out: anything that could
 * damage a person's reputation, or touches health, money, elections, children
 * or safety. Low-risk news (launches, research, tools) is published by the desks.
 */
export function riskReasons(a: { lens?: string[]; en: { headline: string; news?: string; dek?: string } }): string[] {
  const text = `${a.en.headline} ${a.en.dek ?? ""} ${a.en.news ?? ""}`;
  const out: string[] = [];
  const rules: [RegExp, string][] = [
    [/\b(accus\w*|alleg\w*|lawsuit|sued|sues|suing|charged|arrest\w*|police|crime|criminal|fraud\w*|scandal|misconduct|fired|firing|harass\w*|investigat\w*|court|guilty|defam\w*)\b/i, "people's reputations or the law"],
    [/\b(health|medical|patients?|hospital\w*|diagnos\w*|drugs?|mental|suicide|self-harm|death|died|dies|killed)\b/i, "health or life"],
    [/\b(stocks?|shares|invest\w*|crypto\w*|bitcoin|valuation|earnings|bank\w*|loan\w*)\b/i, "money and investing"],
    [/\b(election\w*|vot(e|er|ers|ing)|ballot\w*|campaign\w*|candidate\w*|referendum)\b/i, "elections"],
    [/\b(child|children|kids?|minors?|teen\w*|students?|school\w*)\b/i, "children"],
    [/\b(war|military|weapon\w*|attack\w*|terror\w*|drone strike|security breach|hack\w*|leak\w*)\b/i, "conflict or security"],
  ];
  for (const [re, why] of rules) if (re.test(text)) out.push(why);
  for (const l of a.lens ?? []) if (["children", "health", "democracy", "safety"].includes(l) && !out.length) out.push(`people-first lens: ${l}`);
  return [...new Set(out)];
}
const arg = (name: string, def: string) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const env = (k: string) => process.env[k]?.trim() || "";
const STORE = resolve(arg("--store", DRY ? "out/newsroom-store" : "newsroom-store"));
const MAX = Math.max(0, Number(arg("--max", env("NEWSROOM_MAX_PER_RUN") || "4")) || 0);
const DAILY = Math.max(0, Number(env("NEWSROOM_DAILY_CAP") || "40") || 0);

const summary: string[] = [];
const log = (line: string) => { console.log(line); summary.push(line); };

/** One article in one language, as the site stores it. */
function finalCopy(d: Draft, s: SeoCopy, links: string[], lang: "en" | "fr"): NewsroomCopy {
  const standard = d.sections.flatMap(x => x.paras);
  return {
    headline: s.headline,
    news: d.news,
    thirty: d.thirty,
    confirmed: d.confirmed,
    claimed: d.claimed,
    unknown: d.unknown,
    matters: d.matters,
    timeline: d.timeline,
    body: { plain: d.body.plain, standard, expert: d.body.expert },
    seoTitle: s.seoTitle,
    dek: s.dek,
    metaDescription: s.metaDescription,
    keywords: s.keywords,
    sections: d.sections,
    faq: s.faq,
    links: links.map(id => LINKS.find(l => l.id === id)!).filter(Boolean).map(l => ({ path: l.path, label: l.title[lang] })),
  };
}

async function writeOne(m: Models, store: Store, e: Event): Promise<"published" | "held" | "rejected"> {
  const roles: RoleNote[] = [];
  const headline = e.sources[0]?.title ?? e.id;
  const stop = async (stage: string, n: RoleNote) => {
    roles.push(n);
    await store.reject({ id: e.id, at: new Date().toISOString(), stage, headline, reasons: n.notes });
    log(`  ✗ ${stage}: ${n.notes.slice(0, 4).join(" | ")}`);
    return "rejected" as const;
  };

  const rep = await reporter(m, e);
  if (!rep.ok) return stop("reporter", rep.note);
  roles.push(rep.note);
  log(`  reporter: ${rep.note.notes.join(", ")}`);

  const copy = await copyEditor(m, e, rep.value);
  if (!copy.ok) return stop("copy", copy.note);
  roles.push(copy.note);
  log(`  copy: ${copy.note.verdict}${copy.note.verdict === "fixed" ? ` (${copy.note.notes.length} problems fixed)` : ""}`);

  const std = await standardsEditor(m, e, copy.value);
  if (!std.ok) return stop("standards", std.note);
  roles.push(std.note);
  log(`  standards: pass`);

  const fr = await translator(m, e, copy.value);
  if (!fr.ok) return stop("translator", fr.note);
  roles.push(fr.note);
  log(`  translator: ${fr.note.verdict}`);

  const seo = await seoEditor(m, e, copy.value, fr.value, LINKS);
  if (!seo.ok) return stop("seo", seo.note);
  roles.push(seo.note);
  const design = await pageDesigner(m, e, copy.value, fr.value);
  if (!design.ok) return stop("designer", design.note);
  roles.push(design.note);

  const cover = design.value.cover;
  const imageModel = env("GEMINI_IMAGE_MODEL");
  if (!DRY && design.value.illustration && imageModel && env("GEMINI_API_KEY")) {
    await store.ensureImages();
    if (await illustrate(env("GEMINI_API_KEY"), imageModel, design.value.illustration.prompt, store.imagePath(e.id))) {
      cover.illustration = { path: `images/${e.id}.png`, alt: design.value.illustration.alt, model: imageModel };
      log(`  designer: illustration drawn (${imageModel})`);
    }
  }

  const taken = store.slugsTaken();
  const slugEn = uniqueSlug(seo.value.en.slug, taken);
  taken.add(slugEn);
  const slugFr = uniqueSlug(seo.value.fr.slug, taken);
  const now = new Date().toISOString();
  const s: Seo = seo.value;
  const article: NewsroomArticle = {
    version: 1,
    id: e.id,
    slug: { en: slugEn, fr: slugFr },
    createdAt: now,
    updatedAt: now,
    topic: e.topic,
    format: design.value.format,
    sources: e.sources,
    background: e.background.filter(b => [...copy.value.sections, ...fr.value.sections].some(x => x.paras.some(p => p.includes(b.key)))).map(b => ({ key: b.key, path: b.page, title: b.title })),
    cover,
    en: finalCopy(copy.value, s.en, s.links, "en"),
    fr: finalCopy(fr.value, s.fr, s.links, "fr"),
    model: m.provider === "gemini" ? "gemini" : "claude",
    words: { en: countWords(copy.value.sections.flatMap(x => x.paras)), fr: countWords(fr.value.sections.flatMap(x => x.paras)) },
    lens: humanLens({ title: copy.value.headline, summary: copy.value.news }),
    roles,
  };
  const risk = riskReasons(article);
  if (risk.length && REVIEW !== "off") {
    await store.hold(article, risk);
    log(`  ⏸ held for the editor (${risk.join("; ")}): add "${article.id}" to approved.json on the newsroom branch to publish`);
    return "held";
  }
  await store.publish(article);
  log(`  ✓ published /article/${slugEn} · /fr/article/${slugFr} (${article.words.en} words, ${article.format})`);
  return "published";
}

async function main() {
  // The desk's own background writers (AI desk headlines, Worker dispatches) must not spend from this run.
  process.env["MAX_DAILY_CLAUDE_CALLS"] = "-1";

  let models: Models;
  let stories;
  if (DRY) {
    const [{ FIXTURE_STORIES }, { CANNED }] = await Promise.all([import("./fixture-stories"), import("./fixtures")]);
    stories = FIXTURE_STORIES;
    models = cannedModels(CANNED);
    log(`Newsroom dry run: fixture desk, canned desk replies, store ${STORE}`);
  } else {
    const live = liveModels();
    if (!live) {
      // A missing key is a setup gap, not a failure: say so and stop cleanly.
      console.log("::warning title=Newsroom skipped::Add repository secret GEMINI_API_KEY or ANTHROPIC_API_KEY under Settings → Secrets and variables → Actions.");
      return;
    }
    models = live;
    const { loadNews } = await import("../../src/lib/news-engine");
    const desk = await loadNews();
    stories = desk.stories;
    log(`Newsroom: ${desk.stories.length} stories on the desk; writer ${models.model("writer")}, checks ${models.model("checker")}`);
  }
  await loadGlossary();
  const store = await openStore(STORE);

  const today = new Date().toISOString().slice(0, 10);
  const doneToday = store.index.items.filter(i => i.createdAt.startsWith(today)).length + store.rejected.filter(r => r.at.startsWith(today)).length;
  const budget = Math.min(MAX, Math.max(0, DAILY - doneToday));
  if (budget === 0) { log(`Caps reached (${doneToday} attempted today, cap ${DAILY}; ${MAX} per run). Nothing to do.`); return finish(models); }

  const seen = {
    ids: new Set(store.index.items.map(i => i.id)),
    storyIds: new Set(store.index.items.flatMap(i => i.storyIds)),
    killed: store.killed,
    rejectedAt: new Map(store.rejected.map(r => [r.id, r.at] as const)),
  };
  // The editor's approvals first: held articles whose ids are now in approved.json.
  for (const id of await store.releaseApproved()) log(`✓ published ${id} (approved by the editor)`);
  const { events, skipped } = pickEvents(stories, seen);
  for (const s of skipped.slice(0, 12)) console.log(`skip ${s.id}: ${s.why} — ${s.title}`);
  if (events.length === 0) { log("No new events to write."); return finish(models); }

  let published = 0, rejected = 0, held = 0;
  for (const e of events.slice(0, budget)) {
    if (store.has(e.id)) continue;
    log(`\n▸ ${e.id}: ${e.sources[0]?.title} (${new Set(e.sources.map(s => s.outlet)).size} outlet(s)${e.sources.some(s => s.official) ? ", official" : ""})`);
    try {
      const r = await writeOne(models, store, e);
      if (r === "published") published++; else if (r === "held") held++; else rejected++;
    } catch (err) {
      // An unexpected error stops this event only; nothing half-written reaches the store.
      log(`  ✗ error: ${(err as Error).message}`);
      rejected++;
    }
  }
  log(`\n${published} published, ${held} held for the editor, ${rejected} turned down, ${Math.max(0, events.length - budget)} left for a later run.`);
  return finish(models);
}

async function finish(m: Models) {
  log(`Model calls: ${m.usage.calls} (≈${m.usage.inTokens} tokens in, ${m.usage.outTokens} out; ${m.provider}).`);
  const file = env("GITHUB_STEP_SUMMARY");
  if (file) await appendFile(file, `## Newsroom\n\n\`\`\`\n${summary.join("\n")}\n\`\`\`\n`).catch(() => {});
}

main().then(() => process.exit(0), e => { console.error(e); process.exit(1); });
