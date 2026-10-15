// Separate PWA hostname; leave the main newspaper and email DNS untouched.
import "./prepare-brief-preview.mjs";
import { readFile, writeFile } from "node:fs/promises";
const root = new URL("../.output/", import.meta.url);
const configUrl = new URL("server/wrangler.json", root);
const config = JSON.parse(await readFile(configUrl, "utf8"));
config.name = "aibroadsheet-brief";
config.workers_dev = false;
config.routes = [{ pattern: "app.aibroadsheet.com", custom_domain: true }];
config.main = "brief-host.mjs";
await writeFile(
  new URL("server/brief-host.mjs", root),
  `
import worker from './brief-preview.mjs';
export default {
  ...worker,
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/fr' || url.pathname === '/fr/') {
      url.pathname = url.pathname.startsWith('/fr') ? '/fr/app' : '/app';
      return new Response(null, { status: 302, headers: { Location: url.toString(), 'X-Robots-Tag': 'noindex' } });
    }
    return worker.fetch(request, env, ctx);
  }
};
`,
);
await writeFile(configUrl, JSON.stringify(config, null, 2));
console.log("Prepared app.aibroadsheet.com only. Newspaper SEO remains on aibroadsheet.com.");
