// Temporary, narrowly scoped audit gate for an upstream advisory without a
// published fixed picomatch release. Never whitelist package names wholesale.
// Remove this exception as soon as a patched upstream version is available.
export const PICOMATCH_ADVISORY = 'https://github.com/advisories/GHSA-fc5q-39xc-vjpf';
export const EXCEPTION_EXPIRES_AT = '2026-12-01T00:00:00.000Z';

const isBlocking = (severity) => severity === 'high' || severity === 'critical';

function rootsFor(name, vulnerabilities) {
  const roots = [];
  let invalid = false;
  const walk = (packageName, visiting) => {
    if (visiting.has(packageName)) return; // Nuxt dependencies can be cyclic.
    const issue = vulnerabilities[packageName];
    if (!issue || !Array.isArray(issue.via) || issue.via.length === 0) {
      invalid = true;
      return;
    }
    const next = new Set(visiting);
    next.add(packageName);
    for (const item of issue.via) {
      if (typeof item === 'string') {
        walk(item, next);
      } else if (item && typeof item === 'object' && typeof item.name === 'string'
        && typeof item.severity === 'string' && typeof item.url === 'string') {
        if (isBlocking(item.severity)) roots.push(item);
      } else {
        invalid = true;
      }
    }
  };
  walk(name, new Set());
  return { roots, invalid };
}

export function evaluateProductionAudit(audit, now = new Date()) {
  if (!audit || typeof audit !== 'object' || audit.error
    || !audit.metadata?.vulnerabilities
    || !audit.vulnerabilities || typeof audit.vulnerabilities !== 'object'
    || Array.isArray(audit.vulnerabilities)) {
    throw new Error('npm audit response is unavailable or invalid; security gate fails closed');
  }
  const high = Number(audit.metadata.vulnerabilities.high);
  const critical = Number(audit.metadata.vulnerabilities.critical);
  if (!Number.isSafeInteger(high) || !Number.isSafeInteger(critical) || high < 0 || critical < 0) {
    throw new Error('npm audit high/critical counts are invalid');
  }
  const blockers = Object.entries(audit.vulnerabilities)
    .filter(([, issue]) => issue && isBlocking(issue.severity))
    .map(([name]) => name);
  if (!high && !critical && blockers.length === 0) {
    return { ok: true, exceptionUsed: false, affectedPackages: 0 };
  }
  if (!blockers.length || blockers.length !== high + critical) {
    throw new Error('npm audit high/critical counts do not match its vulnerability graph');
  }
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error('Invalid security audit evaluation date');
  }
  if (now.getTime() >= Date.parse(EXCEPTION_EXPIRES_AT)) {
    return { ok: false, reason: 'Temporary picomatch exception expired; re-evaluate upstream fix' };
  }

  // Every high/critical dependency chain must end exclusively in the known
  // picomatch advisory. Other advisories, missing edges and extra roots fail.
  for (const name of blockers) {
    const { roots, invalid } = rootsFor(name, audit.vulnerabilities);
    if (invalid || roots.length === 0 || roots.some(root =>
      root.name !== 'picomatch' || root.url !== PICOMATCH_ADVISORY
      || root.severity !== 'high')) {
      return { ok: false, reason: 'Unapproved high/critical security advisory in ' + name };
    }
  }
  if (!blockers.includes('picomatch')) {
    return { ok: false, reason: 'Known picomatch root is missing' };
  }
  return { ok: true, exceptionUsed: true, affectedPackages: blockers.length };
}
