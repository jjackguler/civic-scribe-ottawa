/**
 * Uploads published Sir Jack Files reels to YouTube Shorts. Reads a list of uploads
 * (id, title, description, tags) from noir-publish/youtube.json, takes each MP4 from
 * the media branch and prints the YouTube id per reel. Usage: npx tsx noir-youtube.ts <dir>
 */
import { readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { uploadToYouTube } from "./media-apis";

const env = (k: string) => process.env[k] ?? "";
const creds = { clientId: env("YOUTUBE_CLIENT_ID"), clientSecret: env("YOUTUBE_CLIENT_SECRET"), refreshToken: env("YOUTUBE_REFRESH_TOKEN") };
const jobs = JSON.parse(readFileSync(new URL("./noir-publish/youtube.json", import.meta.url), "utf8")) as { id: string; title: string; description: string; tags: string[] }[];
let failed = 0;
for (const j of jobs) {
  try {
    const up = await uploadToYouTube(creds, readFileSync(join(process.argv[2], `${j.id}.mp4`)), { title: j.title, description: j.description, tags: j.tags, privacy: "public" });
    const line = `YouTube ${j.id}: https://youtube.com/shorts/${up.id} (${up.privacy})`;
    console.log(line);
    if (env("GITHUB_STEP_SUMMARY")) appendFileSync(env("GITHUB_STEP_SUMMARY"), line + "\n");
  } catch (e) {
    failed++;
    // Annotations are readable without the job log.
    console.log(`::error title=YouTube upload failed (${j.id})::${(e as Error).message.replace(/\s+/g, " ").slice(0, 400)}`);
  }
}
process.exit(failed ? 1 : 0);
