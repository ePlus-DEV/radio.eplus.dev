import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Dependabot routes routine versions to staging while retaining default-branch security updates', async () => {
  const config = await read('.github/dependabot.yml');
  assert.match(config, /version:\s*2/);
  const effective = config.split('\n').filter(line => !line.trimStart().startsWith('#')).join('\n');
  const blocks = effective.split(/(?=^  - package-ecosystem:)/m)
    .filter(value => /package-ecosystem:/.test(value));
  assert.equal(blocks.length, 4, 'two configurations per ecosystem: security/main and versions/staging');

  for (const ecosystem of ['npm', 'github-actions']) {
    const matching = blocks.filter(block =>
      block.includes('package-ecosystem: "' + ecosystem + '"'));
    assert.equal(matching.length, 2, ecosystem + ': must retain both security and version entries');
    const security = matching.find(block => !/target-branch:/.test(block));
    const versions = matching.find(block => /target-branch:\s*"staging"/.test(block));
    assert.ok(security, ecosystem + ': default-branch security entry must exist');
    assert.ok(versions, ecosystem + ': routine version updates must target staging');
    assert.match(security, /open-pull-requests-limit:\s*0/,
      'default branch must not receive ordinary version PRs');
    assert.match(versions, /open-pull-requests-limit:\s*2/,
      'preserve routine version update PR cap');
    assert.match(versions, /applies-to:\s*version-updates/);
    assert.doesNotMatch(security, /applies-to:\s*version-updates/);
    assert.doesNotMatch(versions, /applies-to:\s*security-updates/);
  }
  const mainNpm = blocks.find(block => block.includes('package-ecosystem: "npm"') &&
    !block.includes('target-branch:'));
  assert.match(mainNpm, /applies-to:\s*security-updates/);
});

test('PR CI audits the entire installed production tree for high or critical advisories', async () => {
  const ci = await read('.github/workflows/build.yml');
  const install = ci.indexOf('run: npm ci');
  const audit = ci.indexOf('run: npm audit --omit=dev --audit-level=high');
  assert.ok(install >= 0 && audit > install, 'audit must run after npm ci');
  assert.doesNotMatch(ci, /npm audit[^\n]*(?:\|\|\s*true|continue-on-error)/,
    'do not ignore high-severity security audit failures');
  assert.match(ci, /steps\.current\.outputs\.run == 'true'/,
    'retain the existing trusted PR CI scope guard');
});

test('production lockfile excludes the vulnerable nested esbuild copy', async () => {
  const manifest = JSON.parse(await read('package.json'));
  const lock = JSON.parse(await read('package-lock.json'));
  assert.deepEqual(manifest.overrides?.fontless, { esbuild: '0.28.2' });
  assert.equal(lock.packages['node_modules/esbuild']?.version, '0.28.2');
  assert.equal(lock.packages['node_modules/nuxt']?.version, '4.6.4');
  assert.equal(lock.packages['node_modules/fontless/node_modules/esbuild'], undefined);
  assert.equal(
    Object.keys(lock.packages).filter((path) =>
      path.startsWith('node_modules/fontless/node_modules/@esbuild/')).length,
    0,
    'No outdated nested esbuild platform binaries should remain',
  );
  assert.equal(lock.packages['node_modules/@nuxt/ui']?.version, '4.12.0',
    'Preserve Dependabot PR #308 when backporting security fix');
});
