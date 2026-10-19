/**
 * One-off: upload the published Sir Jack Files case 1 reel to YouTube Shorts with
 * the owner's approved title and description. Usage: npx tsx noir-youtube.ts <mp4>
 */
import { readFileSync, appendFileSync } from "node:fs";
import { uploadToYouTube } from "./media-apis";

const env = (k: string) => process.env[k] ?? "";
const file = readFileSync(process.argv[2]);
const description = `The Sir Jack Files, case 1: the vanishing radiologist. In 2016, Geoffrey Hinton said we should stop training radiologists. Nine years later, Mayo Clinic's radiology staff has grown 55% to about 400 doctors, working beside 250+ AI models.

Sources: The New York Times (via Radiology Business), The Decoder, CNBC.
Full case file: https://aibroadsheet.com/originals?utm_source=youtube&utm_medium=social&utm_campaign=sir-jack-01

Narration, sound effects and music generated with ElevenLabs. Noir illustrations drawn in code; figures are anonymous silhouettes.

#Shorts #AI #FutureOfWork`;

const up = await uploadToYouTube(
  { clientId: env("YOUTUBE_CLIENT_ID"), clientSecret: env("YOUTUBE_CLIENT_SECRET"), refreshToken: env("YOUTUBE_REFRESH_TOKEN") },
  file,
  { title: "AI said this job would disappear. It grew 55%. #Shorts", description, tags: ["AI", "future of work", "radiology", "Sir Jack Files", "AI Broadsheet", "Shorts"], privacy: "public" },
).catch((e: Error) => {
  // Annotations are readable without the job log.
  console.log(`::error title=YouTube upload failed::${e.message.replace(/\s+/g, " ").slice(0, 400)}`);
  process.exit(1);
});
const line = `YouTube: https://youtube.com/shorts/${up.id} (${up.privacy})`;
console.log(line);
if (env("GITHUB_STEP_SUMMARY")) appendFileSync(env("GITHUB_STEP_SUMMARY"), line + "\n");
