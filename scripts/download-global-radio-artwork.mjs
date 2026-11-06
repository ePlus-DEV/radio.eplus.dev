import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

// Maintainer-only artwork sync: download exact original TuneIn station images.
// Never run during npm generate/build. No secrets, streaming URLs, or scraping.
const catalogFile = 'public/catalog/providers/apple-music.json';
const catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
const stationIds = new Set([
  'apple-music-1', 'apple-music-hits', 'apple-music-country',
  'apple-music-club', 'apple-musica-uno', 'apple-music-chill',
  'apple-music-holiday-hits',
]);
const sourceIds = new Map([
  ['apple-music-1', 's345732'], ['apple-music-hits', 's345724'],
  ['apple-music-country', 's345725'], ['apple-music-club', 's345726'],
  ['apple-musica-uno', 's345727'], ['apple-music-chill', 's345733'],
  ['apple-music-holiday-hits', 's363737'],
]);
if (!Array.isArray(catalog.stations) || catalog.stations.length !== 7 ||
  new Set(catalog.stations.map(s => s.id)).size !== 7 ||
  catalog.stations.some(s => !stationIds.has(s.id))) {
  throw new Error('Unexpected Apple Music station catalog; refusing incomplete download');
}
const outputs = [];
function classify(bytes) {
  if (bytes.length >= 24 &&
    bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (width < 80 || height < 80 || width > 5000 || height > 5000) return null;
    return 'png';
  }
  if (bytes.length >= 100 && bytes[0] === 0xff && bytes[1] === 0xd8 &&
    bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9) return 'jpg';
  return null;
}
function candidates(station) {
  const sid = sourceIds.get(station.id);
  const preferred = station.artwork_source_url || station.image;
  const base = 'https://cdn-profiles.tunein.com/' + sid + '/images/';
  const urls = [preferred, base + 'logod.png', base + 'logog.png', base + 'logod.jpg', base + 'logog.jpg'];
  return [...new Set(urls)].filter(url => {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' && u.hostname === 'cdn-profiles.tunein.com' &&
        !u.username && !u.password && !u.port && !u.hash &&
        u.pathname.startsWith('/' + sid + '/images/') &&
        /^s\d+\/images\/(logod|logog)\.(png|jpg)$/.test(u.pathname.slice(1));
    } catch { return false; }
  });
}
async function download(station) {
  for (const url of candidates(station)) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ePlus-OnAir-artwork-sync/1.0)', Accept: 'image/png,image/jpeg,image/*;q=0.8' },
        redirect: 'follow', signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) { console.log(station.id, response.status, url); continue; }
      const final = new URL(response.url);
      if (final.protocol !== 'https:' || final.hostname !== 'cdn-profiles.tunein.com') continue;
      const contentLength = Number(response.headers.get('content-length') || 0);
      if (contentLength > 3_000_000) continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 1000 || bytes.length > 3_000_000) continue;
      const ext = classify(bytes);
      if (!ext) { console.log(station.id, 'invalid image bytes from', url); continue; }
      const path = 'public/img/global-radio/' + station.id + '.' + ext;
      console.log(station.id, bytes.length, ext, url);
      return { station, path, bytes, url };
    } catch (error) { console.log(station.id, error?.message || String(error)); }
  }
  throw new Error('Cannot download original TuneIn artwork for ' + station.id);
}
// Only write files / catalog after all SEVEN images are validated successfully.
for (const station of catalog.stations) outputs.push(await download(station));
await mkdir('public/img/global-radio', { recursive: true });
for (const item of outputs) {
  await writeFile(item.path, item.bytes);
  item.station.artwork_source_url = item.url; // audit trail; not emitted to search index
  item.station.image = '/' + item.path.replace(/^public\//, '');
}
await writeFile(catalogFile, JSON.stringify(catalog, null, 2) + '\n');
console.log('Downloaded ' + outputs.length + ' authentic TuneIn artwork files.');
