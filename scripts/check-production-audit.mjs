#!/usr/bin/env node
// Reviewable, time-boxed exception for one upstream picomatch advisory.
// This still rejects every other high/critical advisory, malformed audit
// responses, registry failures, and security findings after the expiry.
import { spawnSync } from 'node:child_process';
import { appendFile } from 'node:fs/promises';
import {
  evaluateProductionAudit, PICOMATCH_ADVISORY, EXCEPTION_EXPIRES_AT,
} from '../utils/npm-audit-gate.mjs';

const run = spawnSync('npm', ['audit', '--omit=dev', '--audit-level=high', '--json'], {
  encoding: 'utf8', timeout: 120_000, maxBuffer: 32 * 1024 * 1024,
});
if (run.error || ![0, 1].includes(run.status)) {
  throw new Error('npm audit failed to run: ' + (run.error?.message || run.status));
}
let audit;
try { audit = JSON.parse(run.stdout); }
catch { throw new Error('npm audit did not return JSON; refusing to skip security checks'); }

const result = evaluateProductionAudit(audit);
const high = audit.metadata.vulnerabilities.high;
const critical = audit.metadata.vulnerabilities.critical;
const summary = [
  '### Production dependency security audit',
  '',
  `- npm audit: ${high} high and ${critical} critical package-level findings`,
  `- Gate: ${result.ok ? 'PASS' : 'FAIL'}`,
  `- Known upstream advisory: ${PICOMATCH_ADVISORY}`,
  `- Temporary exception expires: ${EXCEPTION_EXPIRES_AT}`,
  ...(result.exceptionUsed
    ? [`- Exception applies to ${result.affectedPackages} transitive findings from this single advisory; the dependency remains vulnerable and must be upgraded after upstream releases a fix.`]
    : []),
  ...(result.reason ? [`- Reason: ${result.reason}`] : []),
  '',
].join('\n');
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
}
console.log(summary);
if (!result.ok) process.exitCode = 1;
