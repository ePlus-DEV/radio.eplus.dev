import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, access, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { compactPrPreviewAssets } from '../scripts/compact-pr-preview-assets.mjs';

test('PR Preview keeps representative pages, flags, Global/Country artwork and Heart UK search images', async () => {
  const root = await mkdtemp(join(tmpdir(), 'onair-preview-compact-'));
  const add = async (path, content = 'image') => {
    const file = join(root, path);
    await mkdir(join(file, '..'), { recursive: true });
    await writeFile(file, content);
  };
  try {
    await add('index.html', '<img src="/pr-preview/pr-393/img/europe/united-kingdom/heart.png">');
    await add('search/stations.json', JSON.stringify([
      { station_name: 'Heart UK', station_image: '/img/europe/united-kingdom/heart.png' },
      { station_name: 'Selected', featured: true, station_image: '/img/asia/singapore/power.png' },
      { station_name: 'Unrelated', station_image: '/img/europe/france/unrelated.png' },
    ]));
    const images = [
      'img/europe/united-kingdom/heart.png',
      'img/europe/united-kingdom/unrelated.png',
      'img/europe/france/unrelated.png',
      'img/asia/singapore/power.png',
      'img/asia/viet-nam/vov.png',
      'img/global-radio/apple-music-1.png',
      'img/europe/flags/france.png',
    ];
    for (const path of images) await add(path);
    const result = await compactPrPreviewAssets(root);
    assert.deepEqual(result, { before: 7, after: 5, removed: 2 });
    for (const kept of [images[0], ...images.slice(3)]) {
      await access(join(root, kept));
    }
    await assert.rejects(access(join(root, images[1])));
    await assert.rejects(access(join(root, images[2])));
    await access(join(root, 'search/stations.json'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('production and staging generation never call preview image pruning', async () => {
  const { readFile } = await import('node:fs/promises');
  const generator = await readFile(new URL('../scripts/generate-site.mjs', import.meta.url), 'utf8');
  assert.match(generator, /if \(process\.env\.ONAIR_PR_PREVIEW === 'true'\)/);
  assert.match(generator, /await compactPrPreviewAssets\('\.output\/public'\)/);
  assert.match(generator, /await compactGeneratedSitemap\(/);
});
