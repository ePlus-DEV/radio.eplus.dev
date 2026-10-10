import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const output = '.output/public';
const files = [
  ['brand/onair-share.png', 1200, 630],
  ['brand/logo-share.png', 1200, 630],
  ['brand/favicon-16x16.png', 16, 16],
  ['brand/favicon-32x32.png', 32, 32],
  ['brand/apple-touch-icon.png', 180, 180],
  ['brand/android-chrome-192x192.png', 192, 192],
  ['brand/android-chrome-512x512.png', 512, 512],
  ['brand/mstile-150x150.png', 150, 150],
];

for (const [name, width, height] of files) {
  const png = await readFile(`${output}/${name}`);
  assert.ok(png.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `Invalid PNG: ${name}`);
  assert.equal(png.readUInt32BE(16), width, `Wrong width: ${name}`);
  assert.equal(png.readUInt32BE(20), height, `Wrong height: ${name}`);
}
for (const file of ['brand/favicon.ico', 'favicon.ico']) {
  const icon = await readFile(`${output}/${file}`);
  assert.equal(icon.readUInt16LE(2), 1, `Invalid ICO: ${file}`);
}
const html = await readFile(`${output}/index.html`, 'utf8');
assert.match(html, /ePlus OnAir/);
assert.match(html, /Listen Beyond Borders/);
assert.doesNotMatch(html, /Radio ePlus/i);
console.log('PASS: OnAir branding, 8 raster sizes, favicon and prerendered homepage');
