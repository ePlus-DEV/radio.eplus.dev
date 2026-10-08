/**
 * Deployment policy, not a branch-only source edit: when develop is promoted
 * to main, production metadata/sitemap are automatically restored.
 */
export function isStagingDeployment({ siteUrl = "", noIndex = "", environment = "", branch = "" } = {}) {
  const enabled = /^(?:true|1|yes|on)$/i.test(String(noIndex).trim());
  const stageEnv = /^(?:staging|stage|development|preview)$/i.test(String(environment).trim());
  const stageBranch = /^(?:develop|dev)$/i.test(String(branch).replace(/^refs\/heads\//, "").trim());
  let stageHost = false;
  try {
    const host = new URL(String(siteUrl)).hostname.toLowerCase();
    stageHost = host === "radio-new.eplus.dev";
  } catch { /* Missing or invalid site URL: rely on explicit deploy settings. */ }
  return enabled || stageEnv || stageBranch || stageHost;
}
