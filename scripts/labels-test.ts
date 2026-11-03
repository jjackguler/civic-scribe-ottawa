/**
 * Truthful labels: the site, the video templates and the newsroom never say a
 * person checked or approved something unless an editor actually did. Automated
 * checks are described as automated ("checked against the sources"). Fails on
 * phrases that claim a human review we can't show.
 *
 *   npx tsx scripts/labels-test.ts
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIRS = ["src", "scripts/originals", "scripts/newsroom", "public"];
const EXT = /\.(tsx?|mjs|js|html|json|md|txt|xml)$/;
const SKIP = /node_modules|\/out\/|\/build\/|routeTree\.gen\.ts$/;
/**
 * A real human approval may say so: the owner's approved.json, or a line marked
 * `label-ok` where a person really does the check each time (say who, in the comment).
 */
const REAL_APPROVAL = /approved\.json|releaseApproved|label-ok/;

/** Claims of a human check or approval. The owner approves before anything says this. */
const BANNED: [RegExp, string][] = [
  [/\b(checked|reviewed|approved|verified|vetted|fact[- ]checked)\s+by\s+(our|the)\s+(editors?|editorial team|journalists?|reporters?|newsroom staff)\b/i, "claims a human editor checked it"],
  [/\b(our|the)\s+editors?\s+(checked|reviewed|approved|verified|vetted)\b/i, "claims a human editor checked it"],
  [/\b(vérifi|révis|approuv)\w*\s+par\s+(nos|notre|la|les)\s+(rédacteurs?|rédactrices?|éditeurs?|éditrices?|journalistes?|rédaction)\b/i, "dit qu'un rédacteur humain a vérifié"],
  [/\bbuilt from court records\b|\btirées? des dossiers judiciaires\b/i, "not every special edition comes from court records"],
];

function* files(dir: string): Generator<string> {
  let names: string[] = [];
  try { names = readdirSync(dir); } catch { return; }
  for (const n of names) {
    const p = join(dir, n);
    if (SKIP.test(p)) continue;
    const st = statSync(p);
    if (st.isDirectory()) yield* files(p);
    else if (EXT.test(n) && st.size < 2_000_000) yield p;
  }
}

const hits: string[] = [];
for (const d of DIRS) {
  for (const f of files(join(ROOT, d))) {
    if (f.endsWith("labels-test.ts")) continue;
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (REAL_APPROVAL.test(line)) return;
      for (const [re, why] of BANNED) if (re.test(line)) hits.push(`${relative(ROOT, f)}:${i + 1}: ${why}: ${line.trim().slice(0, 140)}`);
    });
  }
}
if (hits.length) {
  console.error(`Untruthful labels (${hits.length}):\n${hits.join("\n")}`);
  process.exit(1);
}
console.log("Label checks passed: no unapproved human-review claims.");
