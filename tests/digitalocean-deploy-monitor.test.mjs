import test from "node:test";
import assert from "node:assert/strict";
import {
  commitHashes, matchesCommit, findMatchingDeployment, checkSourceRepository,
  evaluateDeployment, doApiGet, verifyWebsite, monitor,
} from "../scripts/monitor-digitalocean-deploy.mjs";

const SHA = "0ac4bef71d08587cfe5bed526116f735e5c5a1d0";
const OTHER = "1111111111111111111111111111111111111111";
const ID = "f81d4fae-7dec-11d0-a765-00a0c91e6bf6";
const component = (sha) => ({ name: "radio", source_commit_hash: sha });
const deployment = (id, sha, phase = "ACTIVE") => ({
  id, phase, created_at: "2026-10-12T10:00:00Z", static_sites: [component(sha)],
});
const app = (active, inProgress) => ({
  spec: { static_sites: [{ name: "radio", github: {
    repo: "ePlus-DEV/radio.eplus.dev", branch: "main",
  } }] },
  active_deployment: active, ...(inProgress ? { in_progress_deployment: inProgress } : {}),
});
const json = (object, status = 200) => ({
  ok: status >= 200 && status < 300, status, json: async () => object,
});
const html = (status = 200, type = "text/html; charset=utf-8") => ({
  status, headers: { get: (key) => key === "content-type" ? type : null },
  body: { cancel: async () => {} },
});

test("commit detection uses component source hashes and strict cause fallback", () => {
  assert.deepEqual(commitHashes({ services: [component(SHA)], workers: [component(SHA)] }), [SHA]);
  assert.equal(matchesCommit(deployment("a", SHA), SHA), true);
  assert.equal(matchesCommit(deployment("a", OTHER), SHA), false);
  assert.equal(matchesCommit({ cause: "commit 0ac4bef pushed to github/ePlus-DEV/radio.eplus.dev" }, SHA), true);
  assert.equal(matchesCommit({ cause: "manually re-deployed 0ac4bef" }, SHA), false);
  assert.equal(matchesCommit({ phase: "ACTIVE" }, SHA), false);
  assert.equal(matchesCommit({ static_sites: [component(OTHER)],
    cause: "commit 0ac4bef pushed to github/ePlus-DEV/radio.eplus.dev" }, SHA), false);
});

test("finds latest deployment for specific SHA, not arbitrary active deployment", () => {
  const old = deployment("old", SHA, "ERROR");
  old.created_at = "2026-10-11T10:00:00Z";
  const newDeploy = deployment("new", SHA, "BUILDING");
  assert.equal(findMatchingDeployment(app(deployment("active", OTHER)), [old, newDeploy], SHA).id, "new");
  assert.equal(findMatchingDeployment(app(deployment("active", OTHER)), [], SHA), null);
});

test("does not report success before matching commit is the active deployment", () => {
  const old = deployment("old", OTHER);
  const building = deployment("pending", SHA, "BUILDING");
  assert.equal(evaluateDeployment(app(old, building), [building], SHA).state, "waiting");
  assert.equal(evaluateDeployment(app(old), [deployment("done", SHA)], SHA).state, "waiting");
  assert.equal(evaluateDeployment(app(deployment("done", SHA)), [], SHA).state, "active");
  assert.deepEqual(evaluateDeployment(app(old), [deployment("failed", SHA, "ERROR")], SHA),
    { state: "failed", phase: "ERROR", id: "failed" });
});

test("checks GitHub source branch when app spec includes GitHub components", () => {
  assert.doesNotThrow(() => checkSourceRepository(app(deployment("ok", SHA)), "ePlus-DEV/radio.eplus.dev"));
  assert.throws(() => checkSourceRepository(app(deployment("ok", SHA)), "someone/other"), /not configured/);
  assert.throws(() => checkSourceRepository({
    spec: { static_sites: [{ github: { repo: "ePlus-DEV/radio.eplus.dev", branch: "develop" } }] },
  }, "ePlus-DEV/radio.eplus.dev"), /not configured/);
});

test("DigitalOcean API is always read-only and does not expose token in errors", async () => {
  let request;
  const result = await doApiGet(async (url, options) => {
    request = { url, options };
    return json({ deployments: [] });
  }, ID, "test-token", "/deployments?per_page=20");
  assert.deepEqual(result, { deployments: [] });
  assert.equal(request.options.method, "GET");
  assert.match(request.url, /api.digitalocean.com\/v2\/apps\/.+\/deployments/);
  assert.equal(request.options.headers.authorization, "Bearer test-token");
  await assert.rejects(doApiGet(async () => json({}, 403), ID, "test-token", ""),
    (err) => err.message.includes("HTTP 403") && !err.message.includes("test-token"));
});

test("website must actually answer HTML 200, not redirect, fail, or JSON", async () => {
  assert.equal(await verifyWebsite(async () => html(), "https://radio.eplus.dev/"), true);
  assert.equal(await verifyWebsite(async () => html(302), "https://radio.eplus.dev/"), false);
  assert.equal(await verifyWebsite(async () => html(200, "application/json"), "https://radio.eplus.dev/"), false);
});

test("monitor waits for deployment matching SHA to become live and website healthy", async () => {
  const old = deployment("old", OTHER);
  const building = deployment("pending", SHA, "BUILDING");
  const active = deployment("pending", SHA, "ACTIVE");
  let cycles = 0;
  let websiteCalls = 0;
  const requests = [];
  const fetcher = async (url) => {
    requests.push(url);
    if (url.includes("api.digitalocean.com") && url.endsWith("/deployments?per_page=20")) {
      return json({ deployments: [cycles === 0 ? building : active] });
    }
    if (url.includes("api.digitalocean.com")) {
      return json({ app: app(cycles === 0 ? old : active,
        cycles === 0 ? building : undefined) });
    }
    websiteCalls++;
    return html();
  };
  const output = await monitor({
    appId: ID, token: "demo", expectedSha: SHA, fetcher,
    sleep: async () => { cycles++; }, maxAttempts: 3, log: () => {},
  });
  assert.equal(output.state, "active");
  assert.equal(cycles, 1);
  assert.equal(websiteCalls, 1);
  assert.ok(requests.some((url) => url.includes("/deployments?per_page=20")));
});

test("monitor fails closed on incorrect app, failed deploy, missing secrets and timeout", async () => {
  await assert.rejects(monitor({ token: "yes", expectedSha: SHA }), /DIGITALOCEAN_APP_ID/);
  await assert.rejects(monitor({ appId: ID, expectedSha: SHA }), /DIGITALOCEAN_API_TOKEN/);
  const activeOther = deployment("current", OTHER);
  const fetcher = async (url) => url.includes("/deployments?")
    ? json({ deployments: [deployment("bad", SHA, "ERROR")] })
    : json({ app: app(activeOther) });
  await assert.rejects(monitor({
    appId: ID, token: "yes", expectedSha: SHA, fetcher,
    maxAttempts: 2, sleep: async () => {}, log: () => {},
  }), /ended in ERROR/);
  const unknownFetcher = async (url) => url.includes("/deployments?")
    ? json({ deployments: [] }) : json({ app: app(activeOther) });
  await assert.rejects(monitor({
    appId: ID, token: "yes", expectedSha: SHA, fetcher: unknownFetcher,
    maxAttempts: 2, sleep: async () => {}, log: () => {},
  }), /Timed out/);
});
