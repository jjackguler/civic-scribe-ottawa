// Renders 1080x1350 news cards for Instagram/Facebook/LinkedIn/X from posts.json.
//   node render.mjs posts.json OUTDIR
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const [list, out] = process.argv.slice(2);
const posts = JSON.parse(await readFile(list, "utf8"));
const FSRC = "file://" + resolve(import.meta.dirname, "../originals/node_modules/@fontsource");
const html = (await readFile(resolve(import.meta.dirname, "post.html"), "utf8")).replaceAll("FSRC", FSRC);
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
for (const d of posts) {
  const f = resolve(out, "_post.html"); await writeFile(f, html); await p.goto("file://" + f);
  if (!d.photo.startsWith("http") && !d.photo.startsWith("file:")) d.photo = "file://" + resolve(d.photo);
  await p.evaluate(x => document.fonts.ready.then(() => window.build(x)), d);
  await p.evaluate(() => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = getComputedStyle(document.getElementById("ph")).backgroundImage.slice(5, -2); }));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/${d.slug}.png` });
  console.log(d.slug);
}
await b.close();
