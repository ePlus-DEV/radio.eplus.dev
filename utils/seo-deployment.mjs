/**
 * Staging indexability depends only on hosting configuration. The exact
 * staging origin provides a safe fallback if the noindex flag is missing.
 * Production remains indexable when promoted from develop to main.
 */
export function isStagingDeployment({ siteUrl = "", noIndex = "" } = {}) {
  const enabled = /^(?:true|1|yes|on)$/i.test(String(noIndex).trim());
  let stageHost = false;
  try {
    const host = new URL(String(siteUrl)).hostname.toLowerCase();
    stageHost = host === "radio-new.eplus.dev" || host === "new-radio.eplus.dev";
  } catch { /* Explicit noindex flag remains sufficient without a valid origin. */ }
  return enabled || stageHost;
}
