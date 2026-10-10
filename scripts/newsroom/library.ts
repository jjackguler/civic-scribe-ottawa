/**
 * Our own reference shelf: the only place background may come from.
 *
 * The reporter never adds background from a model's memory. It gets, at most,
 * a few short passages from our own evergreen pages (the /learn guides, the
 * /labs paths and, when the site has one, the glossary), each with
 * its page, and may cite them with [bN] markers. The fact guard checks the
 * background text like the reporting.
 *
 * The SEO desk links only to pages from LINKS below, by id: never a URL the
 * model made up.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { GUIDES } from "../../src/lib/guides";
import { PATHS } from "../../src/lib/labs";
import type { Bi } from "../../src/lib/i18n";

export type Passage = { page: string; title: Bi; text: Bi };
export type LinkOption = { id: string; path: string; title: Bi };

const ROOT = resolve(import.meta.dirname, "../..");

export const LINKS: LinkOption[] = [
  { id: "labs", path: "/labs", title: { en: "AI Labs: learn AI step by step", fr: "Labos IA : apprendre l'IA pas à pas" } },
  ...PATHS.map(p => ({ id: `labs/${p.id}`, path: `/labs/${p.id}`, title: p.title })),
  { id: "learn", path: "/learn", title: { en: "Guides to using AI", fr: "Guides pour utiliser l'IA" } },
  ...GUIDES.map(g => ({ id: `learn/${g.slug}`, path: `/learn/${g.slug}`, title: g.title })),
  { id: "values", path: "/values", title: { en: "Our values", fr: "Nos valeurs" } },
  { id: "standards", path: "/standards", title: { en: "How we write and check our articles", fr: "Comment nous écrivons et vérifions nos articles" } },
];

const PASSAGES: Passage[] = [];
for (const g of GUIDES) {
  for (const b of g.blocks) {
    const texts: Bi[] = b.kind === "list" ? b.items : b.kind === "h" ? [] : [b.text];
    for (const text of texts) PASSAGES.push({ page: `/learn/${g.slug}`, title: g.title, text });
  }
}
for (const p of PATHS) PASSAGES.push({ page: `/labs/${p.id}`, title: p.title, text: p.dek });

/**
 * The glossary, when the site has one: src/lib/glossary.ts exporting
 * GLOSSARY: { slug: string; term: Bi; def: Bi }[] (served at /glossary#slug).
 */
export async function loadGlossary(): Promise<void> {
  const file = resolve(ROOT, "src/lib/glossary.ts");
  const route = ["src/routes/glossary.tsx", "src/routes/glossary.index.tsx"].some(f => existsSync(resolve(ROOT, f)));
  if (!existsSync(file) || !route) return;
  try {
    const mod = (await import(pathToFileURL(file).href)) as { GLOSSARY?: { slug?: string; term?: Bi; def?: Bi }[] };
    for (const t of mod.GLOSSARY ?? []) {
      if (!t.slug || !t.term?.en || !t.def?.en) continue;
      PASSAGES.push({ page: `/glossary#${t.slug}`, title: t.term, text: t.def });
      LINKS.push({ id: `glossary/${t.slug}`, path: `/glossary#${t.slug}`, title: t.term });
    }
  } catch (e) {
    console.warn("glossary not loaded:", (e as Error).message);
  }
}

const STOP = new Set(("the a an and or but of to in on for with at by from as is are was were be been it its this that these those " +
  "you your our we they their can will would could may might how why what when who which into over after about more than just " +
  "ai artificial intelligence new says said use using used one two also not have has had any all some").split(" "));
/** Content words, lightly stemmed ("training" → "train", "chats" → "chat"). */
const tokens = (s: string) => new Set(s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/)
  .filter(w => w.length > 3 && !STOP.has(w))
  .map(w => (w.length > 5 ? w.replace(/(ing|ed|es|s)$/, "") : w.replace(/s$/, ""))));

/** At most `n` passages that share real words with the event (none when nothing fits: background is optional). */
export function pickBackground(eventText: string, n = 3): Passage[] {
  const ev = tokens(eventText);
  const toks = PASSAGES.map(p => tokens(p.text.en));
  const df = new Map<string, number>();
  for (const t of toks) for (const w of t) df.set(w, (df.get(w) ?? 0) + 1);
  // Words most passages share ("official", "language") say little; rare shared words say the passage is on topic.
  const rare = (w: string) => (df.get(w) ?? 0) <= Math.max(2, Math.round(PASSAGES.length * 0.03));
  return PASSAGES
    .map((p, i) => {
      const shared = [...toks[i]].filter(w => ev.has(w));
      return { p, rare: shared.filter(rare).length, all: shared.length };
    })
    .filter(x => x.rare >= 2 || (x.rare >= 1 && x.all >= 4))
    .sort((a, b) => b.rare - a.rare || b.all - a.all)
    .slice(0, n)
    .map(x => x.p);
}
