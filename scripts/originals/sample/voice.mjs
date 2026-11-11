// Voices script.json with ElevenLabs (one call per line, with timestamps) and writes
// out/line-N.mp3 plus out/timing.json. `--estimate` skips the API and guesses timings.
import fs from "node:fs";
const dir = new URL(".", import.meta.url).pathname;
const script = JSON.parse(fs.readFileSync(dir + "script.json", "utf8"));
const out = dir + "out/"; fs.mkdirSync(out, { recursive: true });
const estimate = process.argv.includes("--estimate");
const KEY = process.env.ELEVENLABS_API_KEY;
const WANT = { narrator: ["George", "Brian", "Daniel"], pip: ["Liam", "Charlie", "Will"], quill: ["Lily", "Jessica", "Laura"] };
const SETTINGS = { narrator: { stability: 0.55, similarity_boost: 0.8, style: 0.15 }, pip: { stability: 0.35, similarity_boost: 0.75, style: 0.45 }, quill: { stability: 0.4, similarity_boost: 0.75, style: 0.5 } };

async function voices() {
  const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": KEY } });
  if (!r.ok) throw new Error("voices " + r.status);
  const { voices } = await r.json(); const pick = {};
  for (const [role, names] of Object.entries(WANT)) {
    const v = names.map(n => voices.find(x => x.name.split(" ")[0] === n)).find(Boolean) || voices[0];
    pick[role] = v.voice_id; console.log(role, "→", v.name);
  }
  return pick;
}
const clean = t => t.replace(/\*/g, "");
function words(text, chars, starts, ends, offset) {
  // Map spoken words (with *key* marks) onto character timings.
  const toks = text.split(/\s+/).filter(Boolean); const res = []; let ci = 0;
  for (const tok of toks) {
    const key = /\*/.test(tok); const w = clean(tok);
    while (ci < chars.length && /\s/.test(chars[ci])) ci++;
    const s = starts[ci] ?? starts.at(-1); ci += w.length; const e = ends[Math.min(ci, ends.length) - 1] ?? s + 0.3;
    res.push({ w, key, s: +(s + offset).toFixed(3), e: +(e + offset).toFixed(3) });
  }
  return res;
}
const GAP = 0.35, SCENE_GAP = 0.55, LEAD = 0.6;
let t = LEAD, prev = null; const lines = [];
const ids = estimate ? null : await voices();
for (const [i, L] of script.lines.entries()) {
  if (prev && prev !== L.scene) t += SCENE_GAP - GAP;
  const text = clean(L.text); let dur, ws;
  if (estimate) {
    const toks = L.text.split(/\s+/); dur = toks.length / 2.7 + 0.3; let s = t;
    ws = toks.map(tok => { const w = { w: clean(tok), key: /\*/.test(tok), s: +s.toFixed(3), e: +(s + 0.33).toFixed(3) }; s += dur / toks.length; return w; });
  } else {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ids[L.who]}/with-timestamps`, {
      method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: SETTINGS[L.who] })
    });
    if (!r.ok) throw new Error(`tts line ${i}: ${r.status} ${(await r.text()).slice(0, 200)}`);
    const j = await r.json(); fs.writeFileSync(`${out}line-${i}.mp3`, Buffer.from(j.audio_base64, "base64"));
    const a = j.alignment; dur = a.character_end_times_seconds.at(-1);
    ws = words(L.text, a.characters, a.character_start_times_seconds, a.character_end_times_seconds, t);
  }
  lines.push({ i, scene: L.scene, who: L.who, start: +t.toFixed(3), end: +(t + dur).toFixed(3), words: ws });
  t += dur + GAP; prev = L.scene;
}
const total = +(t + 2.8).toFixed(2); // end card
fs.writeFileSync(out + "timing.json", JSON.stringify({ total, sources: script.sources, lines }, null, 1));
console.log("total", total, "s,", script.lines.reduce((n, l) => n + clean(l.text).length, 0), "characters");
