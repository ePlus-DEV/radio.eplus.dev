// Read-only DigitalOcean App Platform deployment monitor.
// Does not create deployments or change App Platform settings.
import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const KEYS = ["services", "static_sites", "workers", "jobs", "functions"];
const FAILED = new Set(["ERROR", "FAILED", "CANCELED", "CANCELLED", "SUPERSEDED"]);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function commitHashes(deployment) {
  if (!deployment || typeof deployment !== "object") return [];
  return [...new Set(KEYS.flatMap((key) =>
    (Array.isArray(deployment[key]) ? deployment[key] : [])
      .map((item) => String(item?.source_commit_hash || "").trim().toLowerCase())
      .filter((hash) => /^[0-9a-f]{7,40}$/.test(hash)),
  ))];
}

export function matchesCommit(deployment, expectedSha) {
  const target = String(expectedSha || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(target)) return false;
  const hashes = commitHashes(deployment);
  if (hashes.length) return hashes.some((hash) => target.startsWith(hash));
  // Only accept DigitalOcean's conventional "commit <sha> pushed to" cause.
  const cause = /^commit\s+([0-9a-f]{7,40})\s+pushed\s+to\b/i.exec(
    String(deployment?.cause || "").trim(),
  );
  return Boolean(cause && target.startsWith(cause[1].toLowerCase()));
}

export function findMatchingDeployment(app, history, sha) {
  const matches = [
    app?.in_progress_deployment,
    app?.active_deployment,
    ...(Array.isArray(history) ? history : []),
  ].filter((item) => item?.id && matchesCommit(item, sha));
  const byId = new Map();
  for (const entry of matches) {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  }
  return [...byId.values()].sort((a, b) =>
    Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0))[0] || null;
}

export function checkSourceRepository(app, repository, branch = "main") {
  const githubSources = KEYS.flatMap((key) =>
    (Array.isArray(app?.spec?.[key]) ? app.spec[key] : [])
      .map((component) => component.github)
      .filter((source) => typeof source?.repo === "string"));
  // Images and non-GitHub sources can still be checked by component commit hash.
  if (!githubSources.length) return;
  if (!githubSources.some((source) =>
    source.repo.toLowerCase() === repository.toLowerCase() && source.branch === branch)) {
    throw new Error("DigitalOcean app is not configured for " + repository + "@" +
      branch + "; verify DIGITALOCEAN_APP_ID.");
  }
}

export function evaluateDeployment(app, history, sha) {
  const deployment = findMatchingDeployment(app, history, sha);
  if (!deployment) return { state: "waiting", phase: "NOT_FOUND", id: "" };
  const phase = String(deployment.phase || "").toUpperCase();
  if (FAILED.has(phase)) return { state: "failed", phase, id: deployment.id };
  const live = app?.active_deployment;
  const active = live?.id === deployment.id &&
    String(live?.phase || "").toUpperCase() === "ACTIVE" && phase === "ACTIVE";
  return { state: active ? "active" : "waiting", phase: phase || "UNKNOWN", id: deployment.id };
}

export async function doApiGet(fetcher, appId, token, path) {
  const response = await fetcher("https://api.digitalocean.com/v2/apps/" + appId + path, {
    method: "GET",
    headers: { authorization: "Bearer " + token, accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = new Error("DigitalOcean API HTTP " + response.status + " for " + path);
    error.retryable = response.status === 429 || response.status >= 500;
    throw error;
  }
  return response.json();
}

export async function verifyWebsite(fetcher, url) {
  try {
    const response = await fetcher(url, {
      method: "GET",
      redirect: "manual",
      headers: { "cache-control": "no-cache", accept: "text/html" },
      signal: AbortSignal.timeout(12000),
    });
    await response.body?.cancel?.();
    return response.status === 200 &&
      String(response.headers.get("content-type") || "").toLowerCase().includes("text/html");
  } catch {
    return false;
  }
}

export async function monitor({
  appId, token, expectedSha, repository = "ePlus-DEV/radio.eplus.dev",
  website = "https://radio.eplus.dev/", fetcher = fetch, sleep = delay,
  maxAttempts = 105, intervalMs = 20000, log = console.log,
} = {}) {
  if (!/^[0-9a-f-]{8,64}$/i.test(String(appId || ""))) {
    throw new Error("DIGITALOCEAN_APP_ID is missing or invalid. Set the GitHub Actions repository variable.");
  }
  if (!token) throw new Error("DIGITALOCEAN_API_TOKEN is missing. Set the GitHub Actions secret with app:read scope.");
  if (!/^[0-9a-f]{40}$/i.test(String(expectedSha || ""))) throw new Error("Expected a full GitHub commit SHA.");
  const url = new URL(website);
  if (url.protocol !== "https:" || url.hostname !== "radio.eplus.dev") {
    throw new Error("Production health check must use https://radio.eplus.dev/.");
  }

  let last = "";
  let transientErrors = 0;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const [details, recent] = await Promise.all([
        doApiGet(fetcher, appId, token, ""),
        doApiGet(fetcher, appId, token, "/deployments?per_page=20"),
      ]);
      if (!details.app) throw new Error("DigitalOcean API returned no app.");
      checkSourceRepository(details.app, repository);
      const verdict = evaluateDeployment(details.app, recent.deployments, expectedSha);
      const current = verdict.phase + " (" + (verdict.id || "not found") + ")";
      if (current !== last) {
        log("DigitalOcean " + expectedSha.slice(0, 12) + ": " + current);
        last = current;
      }
      if (verdict.state === "failed") throw new Error(
        "Deployment " + verdict.id + " ended in " + verdict.phase + ".");
      if (verdict.state === "active") {
        if (await verifyWebsite(fetcher, website)) {
          log("Confirmed: matching commit ACTIVE on DigitalOcean, production HTTP 200 HTML.");
          return { ...verdict, expectedSha, website };
        }
        log("Correct deployment is ACTIVE, but website health check has not passed.");
      }
      transientErrors = 0;
    } catch (error) {
      if (!error.retryable) throw error;
      transientErrors++;
      if (transientErrors >= 5) throw new Error(
        "DigitalOcean API still unavailable after retries: " + error.message);
      log("Temporary DigitalOcean API error; retrying (" + transientErrors + "/5).");
    }
    if (attempt < maxAttempts - 1) await sleep(intervalMs);
  }
  throw new Error("Timed out waiting for DigitalOcean to activate commit " + expectedSha +
    " and serve HTTP 200 HTML. Check App Platform Activity and main auto-deploy settings.");
}

async function main() {
  const appId = process.env.DIGITALOCEAN_APP_ID || "";
  const result = await monitor({
    appId,
    token: process.env.DIGITALOCEAN_API_TOKEN,
    expectedSha: process.env.GITHUB_SHA,
  });
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, [
      "## DigitalOcean production deployment",
      "",
      "Commit: " + result.expectedSha,
      "",
      "Deployment: " + result.id,
      "",
      "DigitalOcean: **" + result.phase + "** (active deployment)",
      "",
      "Production: " + result.website + " (HTTP 200 HTML)",
      "",
      "App Platform: https://cloud.digitalocean.com/apps/" + appId,
      "",
      "Note: the API validates the active source commit; the HTTP test checks availability, not CDN cache freshness.",
      "",
    ].join("\n"));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (error) => {
    console.error("::error::" + error.message);
    if (process.env.GITHUB_STEP_SUMMARY) {
      await appendFile(process.env.GITHUB_STEP_SUMMARY,
        "## DigitalOcean deployment verification failed\n\n" + error.message +
        "\n\nCheck App Platform Activity and GitHub Actions variable/secret configuration.\n");
    }
    process.exitCode = 1;
  });
}
