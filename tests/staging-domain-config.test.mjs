import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveDeployTarget } from "../scripts/monitor-digitalocean-deploy.mjs";
import { isStagingDeployment } from "../utils/seo-deployment.mjs";

const STAGING = "https://new-radio.eplus.dev";
const OLD = "radio-new.eplus.dev";
const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("develop always monitors the official new-radio staging site, never an override", () => {
  const target = resolveDeployTarget("develop", {
    DIGITALOCEAN_APP_ID: "prod-app-id",
    DIGITALOCEAN_STAGING_APP_ID: "stage-app-id",
    DIGITALOCEAN_STAGING_SITE_URL: "https://radio.eplus.dev/",
  });
  assert.deepEqual(target, {
    branch: "develop", environment: "staging",
    appId: "stage-app-id", website: STAGING + "/",
  });
});

test("CI prerender, social tags, DigitalOcean monitoring all use new-radio staging origin", async () => {
  const workflow = await read(".github/workflows/build.yml");
  assert.equal(workflow.split(STAGING).length - 1, 4);
  assert.doesNotMatch(workflow, /radio-new\.eplus\.dev/);
  assert.doesNotMatch(workflow, /DIGITALOCEAN_STAGING_SITE_URL/);
  assert.match(workflow, /DIGITALOCEAN_STAGING_APP_ID/);
  assert.match(workflow, /NUXT_PUBLIC_NO_INDEX/);
  assert.match(workflow, /github\.base_ref == 'develop'/);
  const monitor = await read("scripts/monitor-digitalocean-deploy.mjs");
  assert.match(monitor, /new-radio\.eplus\.dev/);
  assert.doesNotMatch(monitor, /radio-new\.eplus\.dev/);
  assert.doesNotMatch(monitor, /DIGITALOCEAN_STAGING_SITE_URL/);
});

test("documentation explicitly identifies official staging domain and preserves production URL", async () => {
  for (const path of ["README.md", "docs/SEO.md", "docs/PROJECT_CONTEXT.md", "docs/GITHUB_ACTIONS.md"]) {
    const text = await read(path);
    assert.ok(text.includes(STAGING), path + " must name official staging");
    assert.ok(text.includes("radio.eplus.dev"), path + " must preserve production");
    assert.ok(!text.includes(OLD), path + " must not advertise retired staging hostname");
  }
});

test("staging remains noindex, including defensive legacy alias", () => {
  assert.equal(isStagingDeployment({ siteUrl: STAGING }), true);
  assert.equal(isStagingDeployment({ siteUrl: "https://" + OLD }), true);
  assert.equal(isStagingDeployment({ siteUrl: "https://radio.eplus.dev" }), false);
});
