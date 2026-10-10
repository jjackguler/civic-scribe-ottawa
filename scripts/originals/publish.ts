/**
 * Publishes what run.ts made, like the hand-made explainers: the MP4 and the
 * poster are committed to the media branch under originals/files/, then the
 * manifest entry is added with fileUrl/posterUrl pinned to that commit on
 * jsDelivr (cdn.jsdelivr.net/gh/<repo>@<sha>/originals/files/<id>.mp4), in a
 * second commit. Queue and skip-log changes are committed too. Then one push.
 *
 *   npx tsx publish.ts [--out out] [--media ../../../media] [--no-push]
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Original, OriginalsManifest } from "../../src/lib/originals-types";
import { env, flushSummary, note, warn } from "./util";

const git = promisify(execFile);
const args = process.argv.slice(2);
const arg = (name: string, def: string) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const OUT = resolve(arg("--out", "out"));
const MEDIA = resolve(arg("--media", "../../../media"));
const PUSH = !args.includes("--no-push");
const REPO = env("GITHUB_REPOSITORY") || "jjackguler/civic-scribe-ottawa";

const g = async (...a: string[]) => (await git("git", a, { cwd: MEDIA, maxBuffer: 1 << 24 })).stdout.trim();
const dirty = async () => (await g("status", "--porcelain", "--", "originals")).length > 0;

async function main() {
  if (!existsSync(join(MEDIA, ".git"))) throw new Error(`${MEDIA} is not a checkout of the media branch`);
  await g("config", "user.name", "AI Broadsheet Originals");
  await g("config", "user.email", "actions@users.noreply.github.com");
  const entryFile = join(OUT, "entry.json");
  let made: Original | null = null;
  let commits = 0;

  if (existsSync(entryFile)) {
    const entry = JSON.parse(await readFile(entryFile, "utf8")) as Original;
    const files = join(MEDIA, "originals", "files");
    await mkdir(files, { recursive: true });
    await copyFile(join(OUT, "explainer.mp4"), join(files, `${entry.id}.mp4`));
    await copyFile(join(OUT, "poster.jpg"), join(files, `${entry.id}.jpg`));
    await g("add", `originals/files/${entry.id}.mp4`, `originals/files/${entry.id}.jpg`);
    await g("commit", "-m", `Originals: ${entry.title} (files)`);
    commits++;
    const sha = await g("rev-parse", "HEAD");
    const cdn = (f: string) => `https://cdn.jsdelivr.net/gh/${REPO}@${sha}/originals/files/${f}`;
    entry.fileUrl = cdn(`${entry.id}.mp4`);
    entry.posterUrl = cdn(`${entry.id}.jpg`);
    const mPath = join(MEDIA, "originals", "manifest.json");
    const manifest: OriginalsManifest = existsSync(mPath) ? JSON.parse(await readFile(mPath, "utf8")) : { updatedAt: entry.publishedAt, items: [] };
    manifest.items = [entry, ...manifest.items.filter(i => i.id !== entry.id)].slice(0, 200);
    manifest.updatedAt = entry.publishedAt;
    await writeFile(mPath, JSON.stringify(manifest, null, 1) + "\n");
    made = entry;
  }
  if (await dirty()) {
    await g("add", "-A", "originals");
    await g("commit", "-m", made ? `Originals: list ${made.title}` : "Originals: queue and skip log");
    commits++;
  }
  if (!commits) { note("No new explainer."); return; }
  if (!PUSH) { note(`publish: ${commits} commit(s) made locally (--no-push)`); if (made) note(`would publish ${made.fileUrl}`); return; }
  for (let attempt = 1; ; attempt++) {
    try { await g("push", "origin", "HEAD:media"); break; } catch (e) {
      if (attempt >= 3) throw e;
      // Someone else (the owner editing queue.json) pushed meanwhile: replay ours on top.
      // Rebasing gives the files commit a new SHA (the old one is never pushed), so re-pin.
      await g("pull", "--rebase", "origin", "media");
      if (made) await repin(made);
    }
  }
  if (made) note(`published ${made.fileUrl}`);
}

/** After a rebase the files commit has a new SHA: point the manifest entry at it. */
async function repin(entry: Original) {
  const sha = await g("log", "-1", "--format=%H", "--", `originals/files/${entry.id}.mp4`);
  const mPath = join(MEDIA, "originals", "manifest.json");
  const manifest: OriginalsManifest = JSON.parse(await readFile(mPath, "utf8"));
  const it = manifest.items.find(i => i.id === entry.id);
  if (!it || !sha || it.fileUrl?.includes(sha)) return;
  const cdn = (f: string) => `https://cdn.jsdelivr.net/gh/${REPO}@${sha}/originals/files/${f}`;
  it.fileUrl = cdn(`${entry.id}.mp4`); it.posterUrl = cdn(`${entry.id}.jpg`);
  entry.fileUrl = it.fileUrl;
  await writeFile(mPath, JSON.stringify(manifest, null, 1) + "\n");
  await g("add", "originals/manifest.json");
  await g("commit", "-m", `Originals: re-pin ${entry.title}`);
}

main().catch(e => { warn("Publishing failed", (e as Error).message.slice(0, 300)); process.exitCode = 1; }).finally(() => flushSummary("Publish"));
