/**
 * AI Broadsheet Originals — one short explainer per run.
 *
 *   1. Build the news desk (same engine as the site) and pick the story the
 *      most newsrooms are covering that we haven't explained yet.
 *   2. Claude writes the script from the publishers' text; the fact guard
 *      rejects any name or number that isn't in the sources (one retry).
 *   3. ElevenLabs narrates each card with a stock voice.
 *   4. Optional: Gemini draws an abstract illustration per card (labelled).
 *   5. Cards rendered in the house style, joined with FFmpeg (1080×1920).
 *   6. Optional: upload to YouTube. Always: write the entry to the manifest.
 *
 * Usage:  npx tsx run.ts [--dry-run] [--out dir] [--manifest path]
 * Env:    ELEVENLABS_API_KEY and ANTHROPIC_API_KEY or GEMINI_API_KEY   required (not in --dry-run)
 *         GEMINI_API_KEY, GEMINI_IMAGE_MODEL               optional illustrations
 *         YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN   optional upload
 *         ORIGINALS_PRIVACY (unlisted|public|private, default unlisted)
 *         ELEVENLABS_VOICE_ID, CLAUDE_MODEL, CHROMIUM_PATH  optional overrides
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadNews } from "../../src/lib/news-engine";
import { clusterStories } from "../../src/lib/cluster";
import type { Original, OriginalsManifest } from "../../src/lib/originals-types";
import { checkScript, pickCluster, sourceText, validShape, writeScript, type Script } from "./script";
import { illustrate, pickVoice, speak, uploadToYouTube } from "./media-apis";
import { compose, renderCards, silence, readBuffer, poster as run_ffmpeg_poster } from "./render";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const arg = (name: string, def: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const OUT = resolve(arg("--out", "out"));
const MANIFEST = resolve(arg("--manifest", "manifest.json"));
const env = (k: string) => process.env[k]?.trim() || "";

function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

const FIXTURE: Script = {
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

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest: OriginalsManifest = existsSync(MANIFEST)
    ? JSON.parse(await readFile(MANIFEST, "utf8"))
    : { updatedAt: new Date().toISOString(), items: [] };
  const covered = new Set(manifest.items.flatMap(i => i.sources.map(s => s.url)));

  // 1. Story
  let script: Script;
  let sources: { name: string; url: string }[];
  if (DRY) {
    script = FIXTURE;
    sources = [{ name: "TechCrunch", url: "https://example.com/1" }, { name: "The Verge", url: "https://example.com/2" }, { name: "Wired", url: "https://example.com/3" }];
  } else {
    // A missing key is a setup gap, not a failure: say so in the run summary and stop cleanly.
    const missing = [!env("ANTHROPIC_API_KEY") && !env("GEMINI_API_KEY") ? "ANTHROPIC_API_KEY or GEMINI_API_KEY" : "", !env("ELEVENLABS_API_KEY") ? "ELEVENLABS_API_KEY" : ""].filter(Boolean);
    if (missing.length) {
      console.log(`::warning title=Originals skipped::Add repository secret(s) ${missing.join(" and ")} under Settings → Secrets and variables → Actions.`);
      return;
    }
    const desk = await loadNews();
    const clusters = clusterStories(desk.stories, 24);
    console.log(`desk: ${desk.stories.length} stories, ${clusters.filter(c => c.sources >= 2).length} multi-outlet stories`);
    const cluster = pickCluster(clusters, covered);
    if (!cluster) { console.log("Nothing new to explain right now."); return; }
    console.log(`story: ${cluster.lead.title} (${cluster.sources} outlets)`);
    const src = sourceText(cluster);
    const model = env("ANTHROPIC_API_KEY") ? env("CLAUDE_MODEL") || "claude-sonnet-5-5" : env("GEMINI_TEXT_MODEL") || "gemini-2.5-pro";
    const keys = { apiKey: env("ANTHROPIC_API_KEY") || undefined, geminiKey: env("GEMINI_API_KEY") || undefined };
    console.log(`writer: ${model}`);
    let draft = await writeScript(cluster, { ...keys, model });
    let bad = validShape(draft) ? checkScript(draft, src) : ["(invalid shape)"];
    if (bad.length) {
      console.log("fact guard, retrying without:", bad.join(", "));
      draft = await writeScript(cluster, { ...keys, model, feedback: bad });
      bad = validShape(draft) ? checkScript(draft, src) : ["(invalid shape)"];
    }
    if (!draft || bad.length) { console.log("No script passed the fact guard; nothing published.", bad); return; }
    script = draft;
    const seen = new Set<string>();
    sources = cluster.stories.filter(s => !seen.has(s.source) && seen.add(s.source)).slice(0, 6).map(s => ({ name: s.source, url: s.link }));
  }

  // 2. Voice
  const voices: string[] = [];
  let voiceName = "none (dry run)";
  if (DRY) {
    for (let k = 0; k < script.segments.length; k++) {
      const f = join(OUT, `voice-${k}.mp3`);
      await silence(Math.max(2.5, script.segments[k].say.split(/\s+/).length * 0.38), f);
      voices.push(f);
    }
  } else {
    const voice = await pickVoice(env("ELEVENLABS_API_KEY"), env("ELEVENLABS_VOICE_ID") || undefined);
    voiceName = `ElevenLabs (${voice.name})`;
    for (let k = 0; k < script.segments.length; k++) {
      const f = join(OUT, `voice-${k}.mp3`);
      await speak(env("ELEVENLABS_API_KEY"), voice.id, script.segments[k].say, f);
      voices.push(f);
    }
  }

  // 3. Illustrations (optional, never of people; labelled on the card)
  const images: (string | null)[] = script.segments.map(() => null);
  if (!DRY && env("GEMINI_API_KEY")) {
    const model = env("GEMINI_IMAGE_MODEL") || "gemini-2.5-flash-image";
    for (let k = 0; k < script.segments.length; k++) {
      const p = script.segments[k].imagePrompt;
      if (!p || script.segments[k].card.type === "sources") continue;
      const f = join(OUT, `img-${k}.png`);
      if (await illustrate(env("GEMINI_API_KEY"), p, f, model)) images[k] = f;
    }
  }

  // 4. Render
  const date = new Date().toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
  const cards = await renderCards(script, OUT, { images, sources: sources.map(s => s.name), date, chromiumPath: env("CHROMIUM_PATH") || undefined });
  const video = join(OUT, "explainer.mp4");
  const seconds = await compose(cards, voices, OUT, video);
  console.log(`rendered ${video} (${seconds.toFixed(1)} s)`);

  const transcript = script.segments.map(s => s.say).join(" ");
  const description = `${script.description}\n\nNarrated by an AI voice (${voiceName}). Script written with Claude from the publishers' reporting and checked against it.${images.some(Boolean) ? " Illustrations are AI-generated." : ""}\n\nSources:\n${sources.map(s => `${s.name}: ${s.url}`).join("\n")}`;

  // 5. Upload (optional)
  let youtubeId: string | undefined;
  let youtubePrivacy: "public" | "unlisted" | "private" | undefined;
  if (!DRY && env("YOUTUBE_REFRESH_TOKEN")) {
    const privacy = (env("ORIGINALS_PRIVACY") || "unlisted") as "public" | "unlisted" | "private";
    const up = await uploadToYouTube(
      { clientId: env("YOUTUBE_CLIENT_ID"), clientSecret: env("YOUTUBE_CLIENT_SECRET"), refreshToken: env("YOUTUBE_REFRESH_TOKEN") },
      await readBuffer(video),
      { title: script.youtubeTitle || script.title, description, tags: [...(script.tags ?? []), "AI news", "AI Broadsheet"], privacy },
    );
    youtubeId = up.id;
    youtubePrivacy = up.privacy;
    console.log(`YouTube: https://youtu.be/${youtubeId} (requested ${privacy}, YouTube set ${up.privacy})`);
  }

  // 6. Manifest entry (the workflow commits it to the media branch)
  const id = `${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}-${slug(script.title)}`;
  // The workflow attaches the video and poster to a GitHub release named after the entry.
  const repo = env("GITHUB_REPOSITORY");
  const asset = (f: string) => (repo ? `https://github.com/${repo}/releases/download/original-${id}/${f}` : undefined);
  await run_ffmpeg_poster(cards[0], join(OUT, "poster.jpg"));
  const entry: Original = {
    id, publishedAt: new Date().toISOString(), title: script.title, summary: script.summary,
    durationSec: Math.round(seconds), youtubeId, youtubePrivacy, fileUrl: asset("explainer.mp4"), posterUrl: asset("poster.jpg"),
    sources, transcript, voice: voiceName, aiImages: images.some(Boolean),
  };
  await writeFile(join(OUT, "entry.json"), JSON.stringify(entry, null, 2));
  await writeFile(join(OUT, "description.txt"), description);
  if (!DRY) {
    manifest.items = [entry, ...manifest.items].slice(0, 200);
    manifest.updatedAt = entry.publishedAt;
    await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  }
  console.log(`entry ${id}`);
}

main().catch(e => { console.error(e); process.exit(1); });
