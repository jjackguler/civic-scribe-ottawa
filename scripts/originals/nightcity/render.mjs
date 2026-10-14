// Renders the "Night city" carousel (slides.json) to 1080x1350 PNGs.
//   cd scripts/originals/nightcity && npm i && node render.mjs [OUTDIR]
// Serves this folder over http (ES modules don't load from file://) and
// screenshots card.html?slide=N in Chromium with software WebGL.
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const here = import.meta.dirname;
const out = resolve(process.argv[2] ?? join(here, "out"));
await mkdir(out, { recursive: true });
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const path = join(here, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(here)) return res.writeHead(403).end();
  let body;
  try { body = await readFile(path); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" }).end(body);
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const { slides } = JSON.parse(await readFile(join(here, "slides.json"), "utf8"));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
page.on("console", (m) => m.type() === "error" && console.error("console:", m.text()));
for (const [i, s] of slides.entries()) {
  await page.goto(`${base}/card.html?slide=${i}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120_000 });
  await page.screenshot({ path: join(out, `${s.slug}.png`) });
  console.log(join(out, `${s.slug}.png`));
}
await browser.close();
server.close();
