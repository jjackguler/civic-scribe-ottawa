// Run with the optional local `sharp` package; generated assets are committed.
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../public/', import.meta.url);
// Preserve the uploaded artwork pointer; use a browser-exported original when
// the CDN refuses non-browser downloads. Never redraw the approved b glyph.
const pointer = JSON.parse(await readFile(new URL('../src/assets/ai-broadsheet-avatar.png.asset.json', import.meta.url), 'utf8'));
const sourceUrl = new URL(pointer.url, 'https://aibroadsheet.com').href;
const response = process.argv[2] ? null : await fetch(sourceUrl);
if (response && !response.ok) throw new Error(`Brand source returned ${response.status}; pass the downloaded original PNG path.`);
const svg = process.argv[2] ? await readFile(process.argv[2]) : Buffer.from(await response.arrayBuffer());
const ink = '#16181A';
await sharp(svg).flatten({ background: ink }).png().toFile(fileURLToPath(new URL('brand/editorial-b-master.png', root)));
await mkdir(new URL('icons/', root), { recursive: true });
for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(fileURLToPath(new URL(`icons/icon-${size}.png`, root)));
  const inner = Math.round(size * 0.8), pad = Math.floor((size - inner) / 2);
  await sharp(svg).resize(inner, inner).flatten({ background: ink })
    .extend({ top: pad, left: pad, bottom: size - inner - pad, right: size - inner - pad, background: ink })
    .png().toFile(fileURLToPath(new URL(`icons/maskable-${size}.png`, root)));
  await sharp(svg).resize(size, size).png().toFile(fileURLToPath(new URL(`brief/icon-${size}.png`, root)));
  await sharp(svg).resize(inner, inner).flatten({ background: ink })
    .extend({ top: pad, left: pad, bottom: size - inner - pad, right: size - inner - pad, background: ink })
    .png().toFile(fileURLToPath(new URL(`brief/maskable-${size}.png`, root)));
}
await sharp(svg).resize(256, 256).webp({ lossless: true }).toFile(fileURLToPath(new URL('brief/mark.webp', root)));
await sharp(svg).resize(1024, 1024).flatten({ background: ink }).png().toFile(fileURLToPath(new URL('../ios/TheBrief/Assets.xcassets/AppIcon.appiconset/icon.png', root)));
for (const [name, size] of [['favicon-96.png', 96], ['apple-touch-icon.png', 180], ['logo-192.png', 192], ['logo-512.png', 512]]) {
  await sharp(svg).resize(size, size).png().toFile(fileURLToPath(new URL(name, root)));
}
// ICO container with a PNG image, supported by modern browsers and crawlers.
const png = await sharp(svg).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header[6] = 48; header[7] = 48;
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
await writeFile(new URL('favicon.ico', root), Buffer.concat([header, png]));
console.log('Rendered editorial-b favicon, touch icon and profile marks.');
