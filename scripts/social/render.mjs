// Renders 1080x1350 AI Broadsheet news cards from a JSON list (see example-posts.json).
//   node scripts/social/render.mjs posts.json OUTDIR
// Each post: {slug, photo, pos?, filter?, kicker, date, headline ("[key words]" turn yellow), deck, source, swipe?}
import { chromium } from "../originals/node_modules/playwright/index.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const here = import.meta.dirname;
const [list, out] = process.argv.slice(2);
const posts = JSON.parse(await readFile(list, "utf8"));
const html = (await readFile(resolve(here, "post.html"), "utf8"))
  .replaceAll("FSRC", "file://" + resolve(here, "../originals/node_modules/@fontsource"))
  .replaceAll("FVAR", "file://" + resolve(here, "../originals/node_modules/@fontsource-variable"))
  .replaceAll("MARK", "file://" + resolve(here, "mark.svg"));
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const page = resolve(out, "_post.html");
await writeFile(page, html);
for (const d of posts) {
  if (!/^(https?|file):/.test(d.photo)) d.photo = "file://" + resolve(d.photo);
  await p.goto("file://" + page);
  await p.evaluate(x => Promise.all(["700 80px Bod", "italic 800 80px Bod", "500 20px Bod", "500 20px Grot", "800 20px Grot"].map(f => document.fonts.load(f))).then(() => window.build(x)), d);
  await p.evaluate(() => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = getComputedStyle(document.getElementById("ph")).backgroundImage.slice(5, -2); }));
  await p.waitForTimeout(150);
  await p.screenshot({ path: resolve(out, `${d.slug}.png`) });
  console.log(d.slug);
}
await b.close();
