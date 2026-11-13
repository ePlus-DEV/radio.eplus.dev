// Audit results are evidence, not proof that a bundled browser route is exploitable.
// Normalize only package names, severities and advisory identifiers.
const SEVERITIES = ['critical', 'high', 'moderate', 'low', 'info'];

export function summarizeNpmAudit(value) {
  if (!value || typeof value !== 'object' || !value.metadata?.vulnerabilities || typeof value.vulnerabilities !== 'object') {
    throw new TypeError('npm audit returned no recognizable vulnerability data');
  }
  const counts = Object.fromEntries(SEVERITIES.map(s => [s, Number(value.metadata.vulnerabilities[s] || 0)]));
  const packages = Object.entries(value.vulnerabilities).map(([name, issue]) => {
    const advisories = (Array.isArray(issue.via) ? issue.via : [])
      .filter(v => v && typeof v === 'object')
      .map(v => ({ name: String(v.name || name), severity: String(v.severity || ''),
        url: /^https:\/\/github\.com\/advisories\/GHSA-[a-z0-9-]+$/i.test(v.url || '') ? v.url : null }));
    return {
      name, severity: String(issue.severity || 'unknown'), range: String(issue.range || ''),
      isDirect: Boolean(issue.isDirect), fixAvailable: Boolean(issue.fixAvailable),
      advisories,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return { counts, total: Object.values(counts).reduce((sum, n) => sum + n, 0), packages };
}
