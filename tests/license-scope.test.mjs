import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('original application software declares MIT without changing the standard permission grant', async () => {
  const [license, manifest] = await Promise.all([read('LICENSE'), read('package.json')]);
  assert.match(license, /^MIT License\n/);
  assert.match(license, /Permission is hereby granted, free of charge/);
  assert.match(license, /use, copy, modify, merge, publish, distribute, sublicense, and\/or sell/);
  assert.match(license, /THE SOFTWARE IS PROVIDED "AS IS"/);
  assert.equal(JSON.parse(manifest).license, 'MIT');
  assert.equal(JSON.parse(manifest).private, true, 'publishing npm package is unrelated to open-source license');
});

test('license scope explicitly excludes streams, provider catalogs, station images, and marks', async () => {
  const [readme, rights, contributing, agents] = await Promise.all([
    read('README.md'),
    read('CONTENT_AND_THIRD_PARTY_RIGHTS.md'),
    read('CONTRIBUTING.md'),
    read('AGENTS.md'),
  ]);
  assert.match(readme, /\[MIT License\]\(\.\/LICENSE\)/);
  assert.match(readme, /\[Content & third-party rights\]\(\.\/CONTENT_AND_THIRD_PARTY_RIGHTS\.md\)/);
  for (const pattern of [
    'public/radio/**', 'public/catalog/providers/**', 'public/img/**',
    'public/brand/**', 'data/instant-audio-countries.json', 'data/world.ts',
  ]) assert.ok(rights.includes(pattern), `rights policy should mention ${pattern}`);
  assert.match(rights, /not.*licensed by ePlus OnAir/i);
  assert.match(rights, /report@eplus\.dev/);
  assert.match(contributing, /MIT License/);
  assert.match(agents, /Licensing and rights guardrails/);
});

test('environment files remain ignored and public Nuxt settings are not described as secret', async () => {
  const [ignore, rights] = await Promise.all([read('.gitignore'), read('CONTENT_AND_THIRD_PARTY_RIGHTS.md')]);
  assert.match(ignore, /^\.env\n/m);
  assert.match(ignore, /^\.env\.\*\n/m);
  assert.match(ignore, /^!\.env\.example\n/m);
  assert.match(rights, /browser-visible/);
  assert.match(rights, /not distributed/);
});
