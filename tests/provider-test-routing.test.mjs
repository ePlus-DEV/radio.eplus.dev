import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('one-time VOH regressions are opt-in, not part of default npm test', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
  assert.equal(pkg.scripts['test:voh'], 'node --test tests/providers/voh/*.test.mjs');
  assert.match(pkg.scripts['test:all'], /npm test && npm run test:voh/);

  const root = await readdir(new URL('./', import.meta.url));
  assert.equal(root.some((name) => /^voh-.*\.test\.mjs$/.test(name)), false,
    'VOH tests must not remain in the normal tests/*.test.mjs glob');

  for (const name of ['voh-catalog-import.test.mjs', 'voh-fm956-source.test.mjs']) {
    await access(new URL('./providers/voh/' + name, import.meta.url));
  }
});

test('CI tests VOH when relevant, with no extra VOH workflow', async () => {
  const ci = await read('.github/workflows/build.yml');
  assert.match(ci, /echo "voh=\$voh" >> "\$GITHUB_OUTPUT"/);
  assert.match(ci, /scripts\/sync-voh-radios\.mjs\|tests\/providers\/voh\/\*/);
  assert.match(ci, /public\/radio\/asia\/viet-nam\.json/);
  assert.match(ci, /utils\/playback-station\.mjs\|utils\/radio-source-plan\.mjs/);
  assert.match(ci, /if: steps\.scope\.outputs\.voh == 'true'/);
  assert.match(ci, /run: npm run test:voh/);
  assert.match(ci, /run: npm test/);
  assert.match(ci, /run: npm run generate/);

  const workflows = await readdir(new URL('../.github/workflows/', import.meta.url));
  assert.deepEqual(workflows.filter((name) => name.endsWith('.yml')).sort(),
    ['build.yml', 'deploy-github-pages.yml', 'instant-audio-sync.yml']);
});

test('Pages deploy ignores one-off VOH importer, tests, docs and unrelated Actions', async () => {
  const deploy = await read('.github/workflows/deploy-github-pages.yml');
  const triggers = deploy.slice(0, deploy.indexOf('\npermissions:'));
  assert.match(triggers, /on:\s*\n  push:\s*\n    branches: \[develop, main\]/);
  assert.match(triggers, /^    paths:\s*$/m);
  for (const p of [
    'app.vue', 'nuxt.config.ts', 'package.json', 'package-lock.json',
    'components/**', 'composables/**', 'pages/**', 'stores/**',
    'public/**', 'data/**', 'lang/**', 'server/**', 'utils/**',
    'scripts/build-station-search-index.mjs',
    'scripts/generate-social-preview.mjs',
    'scripts/generate-station-og-images.mjs',
  ]) {
    assert.ok(triggers.includes('      - "' + p + '"'), p + ' must trigger a website build');
  }
  for (const excluded of [
    'docs/**', 'README.md', 'tests/**', '.github/workflows/**',
    'scripts/sync-voh-radios.mjs', 'scripts/sync-instant-audio.mjs',
  ]) {
    assert.ok(!triggers.includes('      - "' + excluded + '"'), excluded + ' must not auto-deploy');
  }
  assert.match(triggers, /^  workflow_dispatch:\s*$/m, 'explicit manual redeploy must remain available');
  assert.match(deploy, /vars\.PAGES_DEV_READY == 'true'/);
  assert.match(deploy, /vars\.PAGES_PROD_READY == 'true'/);
});
