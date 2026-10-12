import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = () => readFile(new URL('../.github/workflows/build.yml', import.meta.url), 'utf8');

test('documentation and workflow-only PRs use fast CI but retain unit tests', async () => {
  const yaml = await workflow();
  assert.match(yaml, /"docs\/\*\*"/);
  assert.match(yaml, /"README\.md"/);
  assert.match(yaml, /git diff --name-only "\$PR_BASE_SHA"\.\.\.HEAD/);
  assert.match(yaml, /prerender=false\s+if \[ ! -s/);
  assert.match(yaml, /README\.md\|AGENTS\.md\|docs\/\*\|tests\/\*\|\.github\/workflows\/\*\|\.github\/dependabot\.yml/);
  assert.match(yaml, /\*\)\s+prerender=true\s+;;/);
  assert.match(yaml, /- name: "Run unit tests"\s+run: npm test/);
  assert.match(yaml, /echo "prerender=\$prerender" >> "\$GITHUB_OUTPUT"/);
});

test('prerender, output audits and browser checks are gated together', async () => {
  const yaml = await workflow();
  for (const step of [
    'Generate prerendered site',
    'Validate generated sitemap and staging indexability',
    'Assert route-specific prerendered Open Graph metadata',
    'Audit all stations Open Graph HTML and JPEG images',
    'Verify ePlus OnAir logo, social image and favicons',
    'Audit output for GitHub Pages migration readiness',
  ]) {
    const escaped = step.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(yaml, new RegExp('- name: "' + escaped + '"\\s+if: steps\\.scope\\.outputs\\.prerender == .true.'));
  }
  assert.match(yaml, /github\.base_ref == 'develop' && steps\.scope\.outputs\.prerender == 'true'/);
  assert.equal((yaml.match(/vars\.ENABLE_BROWSER_TESTS == 'true' && steps\.scope\.outputs\.prerender == 'true'/g) || []).length, 2);
});
