import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateProductionAudit, PICOMATCH_ADVISORY, EXCEPTION_EXPIRES_AT,
} from '../utils/npm-audit-gate.mjs';

const beforeExpiry = new Date('2026-11-18T00:00:00Z');
const picomatch = () => ({
  name: 'picomatch', severity: 'high', url: PICOMATCH_ADVISORY,
});
function report(vulnerabilities) {
  const issues = Object.values(vulnerabilities);
  return {
    metadata: { vulnerabilities: {
      critical: issues.filter(v => v.severity === 'critical').length,
      high: issues.filter(v => v.severity === 'high').length,
      moderate: 0, low: 0, info: 0,
    } },
    vulnerabilities,
  };
}
function chained() {
  return report({
    picomatch: { severity: 'high', via: [picomatch()] },
    micromatch: { severity: 'high', via: ['picomatch'] },
    nuxt: { severity: 'high', via: ['micromatch'] },
  });
}

test('one upstream picomatch advisory is allowed only before its expiration', () => {
  const result = evaluateProductionAudit(chained(), beforeExpiry);
  assert.deepEqual(result, { ok: true, exceptionUsed: true, affectedPackages: 3 });
  assert.equal(evaluateProductionAudit(chained(), new Date(EXCEPTION_EXPIRES_AT)).ok, false);
});

test('independent high or critical advisories always block CI', () => {
  const another = chained();
  another.vulnerabilities.other = {
    severity: 'high', via: [{
      name: 'other', severity: 'high',
      url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc',
    }],
  };
  another.metadata.vulnerabilities.high++;
  assert.match(evaluateProductionAudit(another, beforeExpiry).reason, /Unapproved/);

  const critical = chained();
  critical.vulnerabilities.picomatch.via.push({
    name: 'picomatch', severity: 'critical',
    url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc',
  });
  assert.equal(evaluateProductionAudit(critical, beforeExpiry).ok, false);
});

test('missing audit edges, output errors and mismatched counts fail closed', () => {
  const dangling = chained();
  dangling.vulnerabilities.nuxt.via = ['missing-library'];
  assert.equal(evaluateProductionAudit(dangling, beforeExpiry).ok, false);
  assert.throws(() => evaluateProductionAudit({ error: { code: 'EAI_AGAIN' } }, beforeExpiry));
  const wrongCount = chained();
  wrongCount.metadata.vulnerabilities.high = 9;
  assert.throws(() => evaluateProductionAudit(wrongCount, beforeExpiry), /do not match/);
});

test('clean audit succeeds even after the temporary exception expires', () => {
  assert.deepEqual(evaluateProductionAudit(report({}), new Date('2027-01-01T00:00:00Z')), {
    ok: true, exceptionUsed: false, affectedPackages: 0,
  });
});
