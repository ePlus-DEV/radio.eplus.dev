import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { summarizeNpmAudit } from '../utils/npm-audit-report.mjs';

test('audit summary preserves low/moderate advisories and counts without inventing reachability', () => {
  const result = summarizeNpmAudit({
    metadata: { vulnerabilities: { low: 3, moderate: 1, high: 0, critical: 0, info: 0 } },
    vulnerabilities: { deepmerge: {
      severity: 'low', range: '>=4.2.0 <=4.3.1', isDirect: false, fixAvailable: false,
      via: [{ name: 'deepmerge', severity: 'low', url: 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4' }],
    } },
  });
  assert.equal(result.counts.low, 3);
  assert.equal(result.counts.moderate, 1);
  assert.equal(result.total, 4);
  assert.equal(result.packages[0].name, 'deepmerge');
  assert.equal(result.packages[0].advisories[0].url, 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4');
  assert.throws(() => summarizeNpmAudit({ error: 'network' }), /recognizable/);
});

test('audit collection does not bypass high-severity CI gate or automatically modify dependencies', async () => {
  const source = await readFile(new URL('../scripts/audit-dependencies.mjs', import.meta.url), 'utf8');
  const workflow = await readFile(new URL('../.github/workflows/dependency-audit.yml', import.meta.url), 'utf8');
  const ci = await readFile(new URL('../.github/workflows/build.yml', import.meta.url), 'utf8');
  assert.match(source, /--omit=dev/);
  assert.match(source, /spawnSync\('npm', \['audit'/);
  assert.doesNotMatch(source, /npm audit fix|npm install |push|pull_request_target/);
  assert.match(ci, /npm audit --omit=dev --audit-level=high/);
  assert.match(workflow, /ref: staging/);
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /contents: read/);
});
