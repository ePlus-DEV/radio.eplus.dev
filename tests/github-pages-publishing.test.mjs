import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkPagesBuild } from '../scripts/check-pages-build.mjs';

const read = file => readFile(file, 'utf8');

test('GitHub Pages publishing keeps private source, separate targets and credentials', async () => {
  const workflow = await read('.github/workflows/deploy-github-pages.yml');
  assert.match(workflow, /branches: \[develop, main\]/);
  assert.match(workflow, /PAGES_DEV_READY/);
  assert.match(workflow, /vars\.PAGES_DEV_SITE_URL/);
  assert.match(workflow, /https:\/\/eplus-dev\.github\.io/);
  assert.match(workflow, /DEV requires its own HTTPS origin at the site root/);
  assert.match(workflow, /PAGES_PROD_READY/);
  assert.match(workflow, /ePlus-DEV\/ePlus-DEV\.github\.io/);
  assert.match(workflow, /ePlus-DEV\/onair-production-pages/);
  assert.match(workflow, /NUXT_PUBLIC_SITE_URL:/);
  assert.match(workflow, /NUXT_PUBLIC_NO_INDEX:/);
  assert.match(workflow, /rsync -a --delete/);
  assert.match(workflow, /\.output\/public/);
  assert.match(workflow, /\.nojekyll/);
  assert.match(workflow, /radio\.eplus\.dev/);
  assert.match(workflow, /process\.stdout\.write\(url\.hostname \+ /);
  assert.match(workflow, /rm -f "\$target\/CNAME"/);
  assert.match(workflow, /secrets\.PAGES_DEPLOY_TOKEN/);
  assert.doesNotMatch(workflow, /pull_request:/, 'Credentials must never run for PRs');
  assert.doesNotMatch(workflow, /--force|push -f/, 'Do not rewrite Pages history each deploy');
});

test('Pages bundle audit checks noindex, sitemap, source maps and limits', async () => {
  const root = await mkdtemp(join(tmpdir(), 'onair-pages-'));
  try {
    await mkdir(join(root, '_nuxt'));
    await writeFile(join(root, '_nuxt', 'app.js'), 'console.log("ok");');
    await writeFile(join(root, 'index.html'), '<html><head><meta name="robots" content="noindex, nofollow"></head></html>');
    await writeFile(join(root, 'robots.txt'), 'User-agent: *\\nAllow: /\\n');
    assert.equal((await checkPagesBuild(root, 'staging')).count, 3);
    await assert.rejects(checkPagesBuild(root, 'production'), /robots metadata/);

    await writeFile(join(root, '_nuxt', 'app.js.map'), '{}');
    await assert.rejects(checkPagesBuild(root, 'staging'), /source maps/);
    await rm(join(root, '_nuxt', 'app.js.map'));
    await writeFile(join(root, 'index.html'), '<html><head><meta name="robots" content="index, follow"></head></html>');
    await writeFile(join(root, 'robots.txt'), 'User-agent: *\\nAllow: /\\nSitemap: https://radio.eplus.dev/sitemap.xml\\n');
    assert.equal((await checkPagesBuild(root, 'production')).count, 3);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
