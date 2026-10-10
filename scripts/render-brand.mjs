// Run with the optional local `sharp` package; generated assets are committed.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../public/', import.meta.url);
const svg = await readFile(new URL('favicon.svg', root));
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
console.log('Rendered news-spark favicon, touch icon and profile marks.');
