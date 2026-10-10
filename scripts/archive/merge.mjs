// Merge the live site's dispatches into the archive file. No API keys needed.
//   node merge.mjs <live.json> <archive/dispatches.json>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const [livePath, archPath] = process.argv.slice(2);
const live = JSON.parse(readFileSync(livePath, "utf8")).items ?? [];
const arch = existsSync(archPath) ? JSON.parse(readFileSync(archPath, "utf8")) : { items: [] };
const byId = new Map(arch.items.map(d => [d.id, d]));
let added = 0;
for (const d of live) {
  if (!d?.id || !d?.en?.headline || !d?.fr?.headline) continue;
  if (!byId.has(d.id)) added++;
  byId.set(d.id, d);
}
const items = [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 2000);
writeFileSync(archPath, JSON.stringify({ updatedAt: new Date().toISOString(), items }));
console.log(`archive: ${items.length} dispatches (${added} new)`);
