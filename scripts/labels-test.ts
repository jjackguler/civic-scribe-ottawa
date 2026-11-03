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
  // Newsroom summaries are other outlets' reporting, summarized with AI: "Newsroom summaries" /
  // "Résumés de la rédaction". Only work we made ourselves may be called ours.
  [/\bour (?:own )?(?:articles?|reporting|stories)\b/i, "presents summaries of others' reporting as ours"],
  [/\bnos (?:propres )?articles\b|\bnotre reportage\b|\bnos reportages\b/i, "présente des résumés comme nos propres reportages"],
  [/\b(?:written|reported) by (?:our|the AI Broadsheet) (?:newsroom|desk)\b|\bécrit(?:e|s)? (?:avec l'IA )?par (?:notre|la) (?:salle de )?rédaction\b/i, "byline on a summary"],
];
/** Lines that name a banned phrase in order to forbid it (the newsroom's prompt and guard). */
const QUOTES_A_BAN = /never write "we reported"|OWN_REPORTING|label-ok/;

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
    if (f.endsWith("labels-test.ts") || f.endsWith("newsroom/test.ts")) continue;
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (REAL_APPROVAL.test(line) || QUOTES_A_BAN.test(line)) return;
      for (const [re, why] of BANNED) if (re.test(line)) hits.push(`${relative(ROOT, f)}:${i + 1}: ${why}: ${line.trim().slice(0, 140)}`);
    });
  }
}
if (hits.length) {
  console.error(`Untruthful labels (${hits.length}):\n${hits.join("\n")}`);
  process.exit(1);
}
console.log("Label checks passed: no unapproved human-review claims, no summaries passed off as our reporting.");
