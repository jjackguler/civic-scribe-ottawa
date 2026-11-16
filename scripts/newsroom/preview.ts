/**
 * Drafts waiting for the editor, as one readable page: drafts/README.md on the
 * newsroom branch (GitHub shows it under the folder list). Each draft reads as
 * it would on the site: headline, deck, the article with its source markers
 * turned into outlet names, "In 30 seconds", and the sources with links.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SECTION_HEADING, type NewsroomArticle } from "../../src/lib/newsroom-types";

export function draftMarkdown(a: NewsroomArticle, reasons: string[]): string {
  const outlet = new Map(a.sources.map(s => [s.key, s.outlet]));
  const bg = new Map(a.background.map(b => [b.key, b.title.en]));
  const name = (k: string) => outlet.get(k) ?? (bg.has(k) ? `our guide: ${bg.get(k)}` : "");
  const marks = (t: string) => t.replace(/\[((?:[sb]\d+\s*,?\s*)+)\]/g, (_, ks: string) => { const n = [...new Set(ks.split(/[\s,]+/).filter(Boolean).map(name).filter(Boolean))]; return n.length ? `(${n.join("; ")})` : ""; });
  const c = a.en;
  const lines = [
    `## ${c.headline}`,
    "",
    `*${c.dek}*`,
    "",
    `\`${a.id}\` · ${a.topic} · ${a.words.en} words · written ${a.createdAt.slice(0, 16).replace("T", " ")} UTC · held because: ${reasons.join("; ")}`,
    "",
  ];
  if (c.thirty?.length) lines.push("**In 30 seconds**", "", ...c.thirty.map(t => `- ${marks(t)}`), "");
  for (const s of c.sections) {
    const h = SECTION_HEADING[s.kind]?.en;
    if (h) lines.push(`### ${h}`, "");
    for (const p of s.paras) lines.push(marks(p), "");
  }
  if (c.faq?.length) { lines.push("### Questions", ""); for (const f of c.faq) lines.push(`**${f.q}** ${marks(f.a)}`, ""); }
  lines.push("**Sources**", "", ...a.sources.map(s => `- ${s.outlet}: [${s.title}](${s.url})`), "");
  lines.push(`French version: *${a.fr.headline}*`, "", "---", "");
  return lines.join("\n");
}

/** Rewrites drafts/README.md from drafts.json. Never throws. */
export async function writeDraftsPreview(dir: string): Promise<number> {
  try {
    const list = existsSync(join(dir, "drafts.json")) ? (JSON.parse(await readFile(join(dir, "drafts.json"), "utf8")) as { items: { id: string; reasons: string[] }[] }).items : [];
    const parts = [
      "# Drafts waiting for the editor",
      "",
      "Nothing here is on the site. To publish a draft, add its id to `approved.json` (in the folder above) and commit; the next newsroom run, within 30 minutes, publishes it. To drop one, add its id to `killed.json`.",
      "",
    ];
    let n = 0;
    for (const d of list) {
      const file = join(dir, "drafts", `${d.id}.json`);
      if (!existsSync(file)) continue;
      parts.push(draftMarkdown(JSON.parse(await readFile(file, "utf8")) as NewsroomArticle, d.reasons));
      n++;
    }
    if (!n) parts.push("No drafts right now.");
    await writeFile(join(dir, "drafts", "README.md"), parts.join("\n") + "\n");
    return n;
  } catch {
    return 0;
  }
}
