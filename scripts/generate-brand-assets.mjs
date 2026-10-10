/**
 * Render ePlus OnAir brand SVGs into raster assets consumed by social scrapers,
 * PWA launchers and browsers that do not support vector icons.
 *
 * Run before Nuxt dev/build/generate. The SVG files are the single source of truth.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

const dir = resolve('public/brand');
const mark = await readFile(join(dir, 'onair-mark.svg'));
const share = await readFile(join(dir, 'onair-share.svg'));

const icons = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ...[57, 60, 72, 76, 114, 120, 144, 152, 180].map(size => [
    `apple-touch-icon-${size}x${size}.png`, size,
  ]),
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
  ['mstile-150x150.png', 150],
];

await Promise.all(icons.map(async ([filename, size]) => {
  await sharp(mark).resize(size, size).png().toFile(join(dir, filename));
}));

// PNG is much more widely supported than SVG in Open Graph and social cards.
await sharp(share).resize(1200, 630).png().toFile(join(dir, 'onair-share.png'));
// Preserve the legacy image path for older crawlers and cached share links.
await sharp(share).resize(1200, 630).png().toFile(join(dir, 'logo-share.png'));

// A multi-format favicon that includes one PNG image at 32x32.
const favicon = await readFile(join(dir, 'favicon-32x32.png'));
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // icon type
icoHeader.writeUInt16LE(1, 4); // one image
icoHeader.writeUInt8(32, 6);
icoHeader.writeUInt8(32, 7);
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(favicon.length, 14);
icoHeader.writeUInt32LE(22, 18);
const ico = Buffer.concat([icoHeader, favicon]);
await Promise.all([
  writeFile(join(dir, 'favicon.ico'), ico),
  writeFile(resolve('public/favicon.ico'), ico),
]);

console.log(`ePlus OnAir branding: ${icons.length} PNG icons, Open Graph PNG and favicon generated`);
