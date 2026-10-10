/**
 * AI Broadsheet Originals: one short explainer per run.
 *
 *   1. Story: the owner's queue, else our newest newsroom article, else the desk's
 *      multi-outlet story (pick.ts). Risky topics only when the owner queued them.
 *   2. Storyboard (collage style, the default): one model call returns the whole
 *      storyboard in the collage schema; the fact guard checks every spoken and
 *      on-screen word, name and number (one retry). Cards style: the old card script.
 *   3. Voice: ElevenLabs with character timestamps → voice.wav + timing.json.
 *   4. Render: collage/render-collage.ts (Chromium frame by frame, CC0 sounds and
 *      music from the assets branch), poster JPG.
 *   5. Optional: YouTube upload. Always: out/entry.json for publish.ts, which commits
 *      the video to the media branch and lists it in the manifest.
 *
 * Usage:  npx tsx run.ts [--dry-run] [--out dir] [--media <media branch checkout>] [--stills auto|1.5,6]
 * Env:    ELEVENLABS_API_KEY and GEMINI_API_KEY or ANTHROPIC_API_KEY     required (not in --dry-run)
 *         ORIGINALS_STYLE (collage|cards, default collage)
 *         ASSETS_DIR (assets branch checkout) or COLLAGE_ASSETS (a built kit), COLLAGE_FIGS_DIR
 *         ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL, ORIGINALS_GEMINI_MODEL, CLAUDE_MODEL, CHROMIUM_PATH
 *         YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, ORIGINALS_PRIVACY   optional upload
 */
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, stat, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Original, OriginalsManifest } from "../../src/lib/originals-types";
import { chooseStory, FIXTURE_BRIEF, type Brief, type Origin } from "./pick";
import { fixtureBoard, validate, writeStoryboard, type Board } from "./storyboard";
import { narrateElevenLabs, placeholderNarration, type Timing } from "./narrate";
import { buildKit, creditsLine, loadKit, type Kit } from "./collage/kit";
import { pickVoice, speak, uploadToYouTube } from "./media-apis";
import { checkScript, validShape, writeScript, type Script } from "./script";
import { compose, renderCards, silence, readBuffer, poster as cardPoster } from "./render";
import { SkipRun, env, flushSummary, note, slug, warn } from "./util";

const run = promisify(execFile);
const HERE = import.meta.dirname;
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const arg = (name: string, def: string) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const OUT = resolve(arg("--out", "out"));
/** The media branch checkout (its originals/ folder holds manifest.json, queue.json, skipped.json). */
const MEDIA = resolve(arg("--media", "../../../media"));
const ORIG = join(MEDIA, "originals");
const STILLS = arg("--stills", "");
const STYLE = (env("ORIGINALS_STYLE") || "collage").toLowerCase() === "cards" ? "cards" : "collage";
const DATE = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Toronto" });

type Made = { title: string; summary: string; video: string; poster: string; seconds: number; transcript: string; voice: string; credits?: string; model: string; tags: string[]; aiImages: boolean };

// ── collage style ──────────────────────────────────────────────────────────
async function getKit(): Promise<Kit | null> {
  const prebuilt = env("COLLAGE_ASSETS") ? await loadKit(env("COLLAGE_ASSETS")) : null;
  if (prebuilt) return prebuilt;
  const src = env("ASSETS_DIR");
  if (!src || !existsSync(src)) {
    warn("No collage assets", "ASSETS_DIR (a checkout of the assets branch) is not set: the video will have no archive figures, newspaper pages, sounds or music.");
    return null;
  }
  const kit = await buildKit(src, join(OUT, "kit"), { figsDir: env("COLLAGE_FIGS_DIR") || undefined });
  note(`kit: ${kit.figures.length} figures, ${Object.keys(kit.sfxSources).length} sound takes, music ${kit.music ? kit.music.split("/").pop() : "none"}`);
  return kit;
}

function renderCollage(board: string, work: string, out: string, stills?: string): Promise<void> {
  return new Promise((res, rej) => {
    const p = spawn("npx", ["tsx", join(HERE, "collage/render-collage.ts"), board, work, out, ...(stills ? ["--stills", stills] : [])], { cwd: HERE, stdio: "inherit", env: process.env });
    p.on("error", rej);
    p.on("close", c => (c === 0 ? res() : rej(new Error(`render-collage exited ${c}`))));
  });
}

async function fileSize(f: string) { return (await stat(f)).size; }

async function makeCollage(brief: Brief): Promise<Made | string | null> {
  const kit = await getKit();
  if (kit) {
    process.env.COLLAGE_ASSETS = kit.dir;
    if (kit.sfxMap && !env("COLLAGE_SFX_MAP")) process.env.COLLAGE_SFX_MAP = kit.sfxMap;
    if (kit.music && !env("COLLAGE_MUSIC")) process.env.COLLAGE_MUSIC = kit.music;
  }
  const figures = kit?.figures ?? [];

  // Storyboard
  let board: Board;
  let model = "fixture";
  if (DRY) {
    board = fixtureBoard(figures, DATE, FIXTURE_BRIEF.sources);
    const problems = validate(board, figures).filter(p => !/narration must be|7 to 10 scenes/.test(p)); // the fixture is short on purpose
    if (problems.length) throw new Error(`fixture storyboard: ${problems.join("; ")}`);
  } else {
    const r = await writeStoryboard(brief, figures, {
      anthropic: env("ANTHROPIC_API_KEY") || undefined, gemini: env("GEMINI_API_KEY") || undefined,
      claudeModel: env("CLAUDE_MODEL") || "claude-sonnet-5-5", geminiModel: env("ORIGINALS_GEMINI_MODEL") || "gemini-3.8-flash",
    }, DATE);
    model = r.model;
    if (!r.board) return r.reason;
    board = r.board;
    note(`storyboard: ${board.scenes.length} scenes (${board.scenes.map(s => s.type).join(", ")}), writer ${r.model}, ${r.attempts === 1 ? "passed the fact guard first time" : "passed on the retry"}`);
  }
  const work = join(OUT, "work");
  await mkdir(work, { recursive: true });
  const boardPath = join(OUT, "storyboard.json");
  await writeFile(boardPath, JSON.stringify(board, null, 2));

  // Voice
  let timing: Timing;
  let voice = "none (dry run)";
  if (DRY) timing = await placeholderNarration(board, work);
  else {
    const v = await pickVoice(env("ELEVENLABS_API_KEY"), env("ELEVENLABS_VOICE_ID") || undefined);
    voice = `ElevenLabs (${v.name})`;
    timing = await narrateElevenLabs(board, work, env("ELEVENLABS_API_KEY"), v.id, env("ELEVENLABS_MODEL") || undefined);
  }
  note(`narration: ${timing.duration.toFixed(1)} s, ${voice}`);

  // Render
  if (STILLS) {
    const times = STILLS === "auto" ? timing.scenes.map(s => +(s.start + (s.end - s.start) * 0.72).toFixed(2)).join(",") : STILLS;
    await renderCollage(boardPath, work, join(OUT, "explainer.mp4"), times);
    note(`stills at ${times} s in ${work}`);
    return null;
  }
  const video = join(OUT, "explainer.mp4");
  await renderCollage(boardPath, work, video);
  // jsDelivr serves files up to 20 MB: squeeze the rare long, busy video.
  if (await fileSize(video) > 19_000_000) {
    const tmp = join(OUT, "explainer-small.mp4");
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", video, "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-c:a", "copy", "-movflags", "+faststart", tmp]);
    await rename(tmp, video);
  }
  const poster = join(OUT, "poster.jpg");
  const at = Math.max(0.5, Math.min(timing.duration - 0.2, timing.scenes[0].end - 0.4));
  await run("ffmpeg", ["-y", "-loglevel", "error", "-ss", at.toFixed(2), "-i", video, "-frames:v", "1", "-vf", "scale=540:960", "-q:v", "4", poster]);

  // Credits: the figures, pages, music and recordings this video actually used.
  let credits: string | undefined;
  if (kit) {
    const used = existsSync(join(work, "sfx-used.json")) ? JSON.parse(await readFile(join(work, "sfx-used.json"), "utf8")) as { files: string[] } : { files: [] };
    const figs = board.scenes.map(s => s.figure).filter((f): f is string => typeof f === "string");
    const newsprint = board.scenes.some(s => ["newsprint", "split", "kraft", "cream", "board"].includes(s.bg) || s.type === "ransom");
    credits = creditsLine(kit, { figures: [...new Set(figs)], newsprint, sfxFiles: used.files }, `AI voice, ${voice}`);
  }
  return {
    title: board.title, summary: board.summary, video, poster, seconds: timing.duration,
    transcript: board.scenes.map(s => s.say.join(" ")).join(" "), voice, credits, model, tags: board.tags, aiImages: false,
  };
}

// ── cards style (the original renderer, kept as a fallback: ORIGINALS_STYLE=cards) ──
const FIXTURE_SCRIPT: Script = {
  title: "Dry run: how the pipeline renders an explainer",
  summary: "A test render with placeholder text and silent narration.",
  segments: [
    { say: "This is a dry run of the AI Broadsheet explainer pipeline.", card: { type: "headline", big: "OpenAI ships GPT-6 with agents", small: "TechCrunch, The Verge and Wired reported the launch" } },
    { say: "Each card is held for as long as its narration.", card: { type: "number", big: "3", small: "newsrooms reported the story within two hours" } },
    { say: "Quotes appear only when the publisher printed them.", card: { type: "quote", big: "Built for business users", small: "OpenAI, as quoted by TechCrunch" } },
    { say: "Facts come only from the publishers' own text.", card: { type: "fact", big: "Every name and number is checked against the sources", small: "Anything missing rejects the script" } },
    { say: "And the last card names the sources.", card: { type: "sources", big: "Sources", small: "Read the full stories on aibroadsheet.com" } },
  ],
  youtubeTitle: "Dry run", description: "Dry run", tags: ["test"],
};

async function makeCards(brief: Brief): Promise<Made | string> {
  let script: Script;
  let model = "fixture";
  if (DRY) script = FIXTURE_SCRIPT;
  else {
    model = env("ANTHROPIC_API_KEY") ? env("CLAUDE_MODEL") || "claude-sonnet-5-5" : env("ORIGINALS_GEMINI_MODEL") || "gemini-3.8-flash";
    const keys = { apiKey: env("ANTHROPIC_API_KEY") || undefined, geminiKey: env("GEMINI_API_KEY") || undefined };
    let draft = await writeScript(brief, { ...keys, model });
    let bad = validShape(draft) ? checkScript(draft, brief.sourceText) : ["(invalid shape)"];
    if (bad.length) {
      note(`fact guard, retrying without: ${bad.join(", ")}`);
      draft = await writeScript(brief, { ...keys, model, feedback: bad });
      bad = validShape(draft) ? checkScript(draft, brief.sourceText) : ["(invalid shape)"];
    }
    if (!draft || bad.length) return `no script passed the fact guard (${bad.join(", ") || "writer declined"})`;
    script = draft;
  }
  const voices: string[] = [];
  let voiceName = "none (dry run)";
  const v = DRY ? null : await pickVoice(env("ELEVENLABS_API_KEY"), env("ELEVENLABS_VOICE_ID") || undefined);
  if (v) voiceName = `ElevenLabs (${v.name})`;
  for (let k = 0; k < script.segments.length; k++) {
    const f = join(OUT, `voice-${k}.mp3`);
    if (!v) await silence(Math.max(2.5, script.segments[k].say.split(/\s+/).length * 0.38), f);
    else await speak(env("ELEVENLABS_API_KEY"), v.id, script.segments[k].say, f);
    voices.push(f);
  }
  const cards = await renderCards(script, OUT, { images: script.segments.map(() => null), sources: brief.sources.map(s => s.name), date: DATE, chromiumPath: env("CHROMIUM_PATH") || undefined });
  const video = join(OUT, "explainer.mp4");
  const seconds = await compose(cards, voices, OUT, video);
  const poster = join(OUT, "poster.jpg");
  await cardPoster(cards[0], poster);
  return { title: script.title, summary: script.summary, video, poster, seconds, transcript: script.segments.map(s => s.say).join(" "), voice: voiceName, model, tags: script.tags ?? [], aiImages: false };
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  await mkdir(OUT, { recursive: true });
  note(`Originals ${STYLE} style${DRY ? " (dry run: fixture text, silent narration, no API calls)" : ""}`);
  const manifestPath = join(ORIG, "manifest.json");
  const manifest: OriginalsManifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : { updatedAt: new Date().toISOString(), items: [] };

  if (!DRY) {
    // A missing key is a setup gap, not a failure: say so in the run summary and stop cleanly.
    const missing = [!env("ANTHROPIC_API_KEY") && !env("GEMINI_API_KEY") ? "GEMINI_API_KEY (or ANTHROPIC_API_KEY)" : "", !env("ELEVENLABS_API_KEY") ? "ELEVENLABS_API_KEY" : ""].filter(Boolean);
    if (missing.length) { warn("Originals skipped", `Add repository secret(s) ${missing.join(" and ")} under Settings → Secrets and variables → Actions.`); return; }
  }

  const pick = DRY ? { brief: FIXTURE_BRIEF, done: async () => {} } : await chooseStory({ mediaDir: ORIG, manifest, write: true });
  const brief = pick.brief;
  if (!brief) { note("Nothing new to explain right now."); return; }

  const made = STYLE === "cards" ? await makeCards(brief) : await makeCollage(brief);
  if (made === null) return; // stills only
  if (typeof made === "string") {
    warn("No explainer this run", `${made}. Story: ${brief.lead}`);
    await pick.done({ status: "skipped", reason: made });
    return;
  }
  note(`rendered ${made.video} (${made.seconds.toFixed(1)} s, ${((await fileSize(made.video)) / 1e6).toFixed(1)} MB)`);

  const id = `${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}-${slug(made.title)}`;
  const sources = brief.sources.map(s => ({ name: s.name, url: s.url }));
  const writer = made.model.startsWith("claude") ? "Claude" : made.model.startsWith("gemini") ? "Gemini" : "a fixture";
  const description = `${made.summary}\n\nNarrated by an AI voice (${made.voice}). ${STYLE === "collage" ? "Storyboard" : "Script"} written with ${writer} from the publishers' reporting and checked against it.${made.credits ? `\n\n${made.credits}` : ""}\n\nSources:\n${sources.map(s => `${s.name}: ${s.url}`).join("\n")}`;

  // Upload (optional)
  let youtubeId: string | undefined;
  let youtubePrivacy: Original["youtubePrivacy"];
  if (!DRY && env("YOUTUBE_REFRESH_TOKEN")) {
    const privacy = (env("ORIGINALS_PRIVACY") || "unlisted") as "public" | "unlisted" | "private";
    try {
      const up = await uploadToYouTube(
        { clientId: env("YOUTUBE_CLIENT_ID"), clientSecret: env("YOUTUBE_CLIENT_SECRET"), refreshToken: env("YOUTUBE_REFRESH_TOKEN") },
        await readBuffer(made.video),
        { title: made.title, description, tags: [...made.tags, "AI news", "AI Broadsheet"], privacy },
      );
      youtubeId = up.id; youtubePrivacy = up.privacy;
      note(`YouTube: https://youtu.be/${youtubeId} (requested ${privacy}, YouTube set ${up.privacy})`);
    } catch (e) {
      warn("YouTube upload failed", `${(e as Error).message.slice(0, 200)}. The site plays its own copy.`);
    }
  }

  // The manifest entry; publish.ts pins fileUrl/posterUrl to the media commit and lists it.
  const entry: Original & { origin: Origin } = {
    id, kind: "explainer", publishedAt: new Date().toISOString(), title: made.title, summary: made.summary,
    durationSec: Math.round(made.seconds), youtubeId, youtubePrivacy,
    sources, transcript: made.transcript, voice: made.voice, aiImages: made.aiImages,
    ...(made.credits ? { credits: made.credits } : {}),
    origin: brief.origin,
  };
  await writeFile(join(OUT, "entry.json"), JSON.stringify(entry, null, 2));
  await writeFile(join(OUT, "description.txt"), description);
  if (!DRY) await pick.done({ status: "made", id });
  note(`entry ${id}: “${made.title}”`);
}

main()
  .catch(async e => {
    if (e instanceof SkipRun) { warn(e.title, e.message); return; }
    console.error(e);
    note(`failed: ${(e as Error).message}`);
    process.exitCode = 1;
  })
  .finally(() => flushSummary("Originals"));
