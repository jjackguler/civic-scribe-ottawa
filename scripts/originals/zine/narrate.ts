/**
 * Voices the zine boards (scripts/originals/zine/boards/*.json) with ElevenLabs
 * (stock voices only) and writes <slug>/voice.wav + timing.json under OUT.
 * render.mjs picks them up from zine/voice/<slug>/.
 *   ELEVENLABS_API_KEY=sk_… npx tsx zine/narrate.ts OUT [slug …]   (run from scripts/originals)
 */
import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { narrateElevenLabs } from "../narrate";
import { pickVoice } from "../media-apis";

const [out, ...only] = process.argv.slice(2);
const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!out || !key) { console.error("usage: ELEVENLABS_API_KEY=sk_… npx tsx zine/narrate.ts OUT [slug …]"); process.exit(1); }
const voice = await pickVoice(key, process.env.ELEVENLABS_VOICE_ID || undefined);
console.log(`voice: ${voice.name}`);
const dir = join(import.meta.dirname, "boards");
for (const f of (await readdir(dir)).filter((f) => f.endsWith(".json")).sort()) {
  const board = JSON.parse(await readFile(join(dir, f), "utf8"));
  if (only.length && !only.includes(board.slug)) continue;
  const work = join(out, board.slug);
  await mkdir(work, { recursive: true });
  const t = await narrateElevenLabs(board, work, key, voice.id, process.env.ELEVENLABS_MODEL || undefined);
  console.log(`${board.slug}: ${t.duration.toFixed(1)} s`);
}
