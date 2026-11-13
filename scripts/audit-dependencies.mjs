#!/usr/bin/env node
// A full, non-silenced audit report. High/critical production advisories
// remain enforced independently by the existing CI `npm audit --omit=dev --audit-level=high`.
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { summarizeNpmAudit } from '../utils/npm-audit-report.mjs';

function collect(args) {
  const result = spawnSync('npm', ['audit', '--json', ...args], {
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 120_000,
  });
  if (result.error || ![0, 1].includes(result.status)) {
    throw Error('npm audit did not complete (' + (result.error?.code || result.status) + ')');
  }
  let raw;
  try { raw = JSON.parse(result.stdout); }
  catch { throw Error('npm audit output is not valid JSON'); }
  if (raw.error) throw Error('npm audit backend error: ' + String(raw.error.code || 'unknown'));
  return summarizeNpmAudit(raw);
}
const full = collect([]);
const production = collect(['--omit=dev']);
const report = { generatedAt: new Date().toISOString(), scopes: { full, production },
  caveat: 'Counts are registry audit findings for installed dependencies, not proof of runtime reachability.' };
await mkdir('reports', { recursive: true });
await writeFile('reports/npm-audit-summary.json', JSON.stringify(report, null, 2) + '\n');
const line = (label, { counts, total }) =>
  `| ${label} | ${counts.critical} | ${counts.high} | ${counts.moderate} | ${counts.low} | ${counts.info} | ${total} |`;
const markdown = [
  '# Exact-lockfile npm audit (all severities)',
  '',
  '| Scope | Critical | High | Moderate | Low | Info | Total |',
  '|---|---:|---:|---:|---:|---:|---:|',
  line('Full dependency tree', full),
  line('Production dependencies', production),
  '',
  'This reports advisories in the installed dependency tree, not whether they are reachable in public static output.',
  'Do not treat a passing high/critical gate as zero low/moderate advisories.',
  '',
  '## Affected packages (full tree)',
  ...full.packages.map(x => '- ' + x.name + ' (' + x.severity + ', ' + x.range + ')'),
  '',
].join('\n');
await writeFile('reports/npm-audit-summary.md', markdown);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);
