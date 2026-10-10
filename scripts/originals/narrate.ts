/**
 * Narration for the collage renderer: one voice.wav for the whole video and a
 * timing.json in the format collage.html reads (the same layout tts_kokoro.py
 * writes), with exact word timings added from ElevenLabs' character alignment:
 *
 *   { "duration": 63.2, "scenes": [ { "start", "end", "sentences": [
 *       { "text", "start", "end", "words": [ { "w", "start", "end" } ] } ] } ] }
 *
 * One ElevenLabs request per scene (its sentences joined), so the pauses between
 * scenes are ours and every sentence's start and end come from the alignment.
 */
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { speakWithTimestamps, type Alignment } from "./media-apis";

export type Word = { w: string; start: number; end: number };
export type Sentence = { text: string; start: number; end: number; words?: Word[] };
export type Timing = { duration: number; scenes: { start: number; end: number; sentences: Sentence[] }[] };

const SR = 44100;
/** Same pacing as tts_kokoro.py. */
const SCENE_GAP = 0.55, LEAD_IN = 0.6, TAIL = 1.6, SENT_GAP = 0.28;
const r3 = (x: number) => Math.round(x * 1000) / 1000;

/** MP3 bytes → mono 16-bit PCM at 44.1 kHz. */
function decode(mp3: Buffer): Promise<Buffer> {
  return new Promise((res, rej) => {
    const ff = spawn("ffmpeg", ["-loglevel", "error", "-i", "pipe:0", "-f", "s16le", "-ac", "1", "-ar", String(SR), "pipe:1"]);
    const out: Buffer[] = [];
    ff.stdout.on("data", d => out.push(d));
    ff.on("error", rej);
    ff.on("close", c => (c === 0 ? res(Buffer.concat(out)) : rej(new Error(`ffmpeg decode exit ${c}`))));
    ff.stdin.on("error", () => { /* ffmpeg closed early; the exit code tells */ });
    ff.stdin.end(mp3);
  });
}

const silence = (sec: number) => Buffer.alloc(Math.round(sec * SR) * 2);

function wav(pcm: Buffer): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/**
 * Sentence and word times (seconds from the clip start) from a character alignment.
 * When the alignment doesn't line up with our text character for character, the
 * positions are mapped proportionally.
 */
export function timesFromAlignment(sentences: string[], a: Alignment | null, clipSec: number): Sentence[] {
  const text = sentences.join(" ");
  const n = a?.characters?.length ?? 0;
  const exact = !!a && a.characters.join("") === text;
  const at = (i: number, end: boolean): number => {
    if (!a || !n) return (Math.min(text.length, Math.max(0, i + (end ? 1 : 0))) / Math.max(1, text.length)) * clipSec;
    const j = exact ? i : Math.min(n - 1, Math.max(0, Math.round((i / Math.max(1, text.length - 1)) * (n - 1))));
    return end ? a.character_end_times_seconds[j] : a.character_start_times_seconds[j];
  };
  const out: Sentence[] = [];
  let pos = 0;
  for (const s of sentences) {
    const words: Word[] = [];
    for (const m of s.matchAll(/\S+/g)) {
      const i0 = pos + m.index!, i1 = i0 + m[0].length - 1;
      words.push({ w: m[0], start: r3(at(i0, false)), end: r3(at(i1, true)) });
    }
    const start = words.length ? words[0].start : at(pos, false);
    const end = words.length ? words[words.length - 1].end : at(pos + s.length - 1, true);
    out.push({ text: s, start: r3(start), end: r3(Math.max(end, start + 0.2)), words });
    pos += s.length + 1;
  }
  return out;
}

type Board = { scenes: { say: string[] }[] };

/** ElevenLabs narration (one request per scene) → voice.wav + timing.json in `work`. */
export async function narrateElevenLabs(board: Board, work: string, apiKey: string, voiceId: string, model?: string): Promise<Timing> {
  const pcm: Buffer[] = [silence(LEAD_IN)];
  let t = LEAD_IN;
  const scenes: Timing["scenes"] = [];
  for (const [k, sc] of board.scenes.entries()) {
    const text = sc.say.join(" ");
    const { mp3, alignment } = await speakWithTimestamps(apiKey, voiceId, text, model);
    const clip = await decode(mp3);
    const sec = clip.length / 2 / SR;
    if (!alignment) console.warn(`  scene ${k + 1}: no alignment from ElevenLabs; timing estimated from text length`);
    const sentences = timesFromAlignment(sc.say, alignment, sec).map(s => ({
      ...s, start: r3(s.start + t), end: r3(s.end + t), words: s.words?.map(w => ({ ...w, start: r3(w.start + t), end: r3(w.end + t) })),
    }));
    const start = t;
    pcm.push(clip, silence(SCENE_GAP));
    t += sec + SCENE_GAP;
    scenes.push({ start: r3(start), end: r3(t), sentences });
  }
  pcm.push(silence(TAIL));
  t += TAIL;
  scenes[scenes.length - 1].end = r3(t);
  const timing: Timing = { duration: r3(t), scenes };
  await writeFile(join(work, "voice.wav"), wav(Buffer.concat(pcm)));
  await writeFile(join(work, "timing.json"), JSON.stringify(timing, null, 1));
  return timing;
}

/** Dry runs: silent narration and placeholder timing (about 3 words a second), no API calls. */
export async function placeholderNarration(board: Board, work: string): Promise<Timing> {
  let t = LEAD_IN;
  const scenes: Timing["scenes"] = [];
  for (const sc of board.scenes) {
    const start = t;
    const sentences: Sentence[] = [];
    sc.say.forEach((text, i) => {
      const words: Word[] = [];
      const s0 = t;
      for (const w of text.split(/\s+/).filter(Boolean)) {
        const d = 0.1 + w.length * 0.035;
        words.push({ w, start: r3(t), end: r3(t + d) });
        t += d + 0.04;
      }
      sentences.push({ text, start: r3(s0), end: r3(t), words });
      t += i < sc.say.length - 1 ? SENT_GAP : SCENE_GAP;
    });
    scenes.push({ start: r3(start), end: r3(t), sentences });
  }
  t += TAIL;
  scenes[scenes.length - 1].end = r3(t);
  const timing: Timing = { duration: r3(t), scenes };
  await writeFile(join(work, "voice.wav"), wav(silence(t)));
  await writeFile(join(work, "timing.json"), JSON.stringify(timing, null, 1));
  return timing;
}
