import { readFile, writeFile, appendFile } from "node:fs/promises";

// Applied only to build output. The production source and its indexing stay intact.
const root = new URL("../.output/", import.meta.url);
const configUrl = new URL("server/wrangler.json", root);
const config = JSON.parse(await readFile(configUrl, "utf8"));
if (config.main !== "index.mjs")
  throw new Error("Unexpected generated entrypoint; review the preview wrapper.");
await writeFile(
  new URL("server/brief-preview.mjs", root),
  `
import worker from './index.mjs';
export default {
  ...worker,
  async fetch(request, env, ctx) {
    const response = await worker.fetch(request, env, ctx);
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
`,
);
config.main = "brief-preview.mjs";
config.name = "aibroadsheet-brief-preview";
config.workers_dev = true;
delete config.routes;
delete config.route;
await writeFile(configUrl, JSON.stringify(config, null, 2));
await appendFile(
  new URL("public/_headers", root),
  "\n/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n",
);
await writeFile(new URL("public/robots.txt", root), "User-agent: *\nDisallow: /\n");
console.log("Prepared separate, noindex Workers preview. No domain routes configured.");
