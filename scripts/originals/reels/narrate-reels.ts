/**
 * Voices every storyboard in scripts/originals/reels/*.json with ElevenLabs
 * (stock voice only) and writes <slug>/voice.wav + timing.json under OUT.
 *   ELEVENLABS_API_KEY=… npx tsx reels/narrate-reels.ts OUT [slug …]
 */
import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { narrateElevenLabs } from "../narrate";
import { pickVoice } from "../media-apis";

const [out, ...only] = process.argv.slice(2);
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error("ELEVENLABS_API_KEY missing"); process.exit(1); }
// Stock voices only. If listing voices is not allowed for this key, use the premade "Brian" voice by id.
const voice = await pickVoice(key, process.env.ELEVENLABS_VOICE_ID || undefined).catch(async e => {
  const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": key } });
  console.warn(`voices list failed (${String(e).slice(0, 80)}): ${r.status} ${(await r.text()).slice(0, 300)}`);
  return { id: "nPczCjzI2devNBz1zQrb", name: "Brian (premade)" };
});
console.log(`voice: ${voice.name}`);
const dir = import.meta.dirname;
for (const f of (await readdir(dir)).filter(f => f.endsWith(".json")).sort()) {
  const board = JSON.parse(await readFile(join(dir, f), "utf8"));
  if (only.length && !only.includes(board.slug)) continue;
  const work = join(out, board.slug);
  await mkdir(work, { recursive: true });
  const t = await narrateElevenLabs(board, work, key, voice.id, process.env.ELEVENLABS_MODEL || undefined);
  console.log(`${board.slug}: ${t.duration.toFixed(1)} s, ${board.scenes.map((s: { say: string[] }) => s.say.join(" ")).join(" ").length} chars`);
}
