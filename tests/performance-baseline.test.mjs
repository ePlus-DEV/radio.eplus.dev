import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('performance baseline is an explicit opt-in browser command, not a new automatic tracking dependency', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const source = await readFile(new URL('../scripts/measure-client-performance.mjs', import.meta.url), 'utf8');
  const docs = await readFile(new URL('../docs/PERFORMANCE_BASELINE.md', import.meta.url), 'utf8');
  assert.equal(pkg.scripts['perf:measure'], 'node scripts/measure-client-performance.mjs');
  assert.match(source, /chromium\.launch/);
  assert.match(source, /page\.goto/);
  assert.match(source, /largest-contentful-paint/);
  assert.match(source, /layout-shift/);
  assert.match(source, /longtask/);
  assert.match(source, /search\/stations\.json/);
  assert.match(source, /pageErrors: errors/);
  assert.match(source, /PERF_IDLE_MS/);
  assert.match(source, /finally \{\s*await browser\.close\(\)/);
  assert.doesNotMatch(source, /media\.play\(|\.click\(/);
  assert.match(docs, /not.*INP|INP.*not/i);
});
