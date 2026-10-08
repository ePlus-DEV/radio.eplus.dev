import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isStagingDeployment } from "../utils/seo-deployment.mjs";

const read = path => readFile(path, "utf8");

test("staging detection covers explicit flags, develop branch and exact preview domain", () => {
  assert.equal(isStagingDeployment({ noIndex: "true" }), true);
  assert.equal(isStagingDeployment({ noIndex: "1" }), true);
  assert.equal(isStagingDeployment({ environment: "staging" }), true);
  assert.equal(isStagingDeployment({ branch: "develop" }), true);
  assert.equal(isStagingDeployment({ branch: "refs/heads/develop" }), true);
  assert.equal(isStagingDeployment({ siteUrl: "https://radio-new.eplus.dev" }), true);
});

test("production is always indexable by default after branch promotion", () => {
  assert.equal(isStagingDeployment({ environment: "production", branch: "main", siteUrl: "https://radio.eplus.dev" }), false);
  assert.equal(isStagingDeployment({ environment: "production", branch: "master", siteUrl: "https://radio.eplus.dev" }), false);
  assert.equal(isStagingDeployment({ siteUrl: "https://maliciousradio-new.eplus.dev" }), false);
  assert.equal(isStagingDeployment({ siteUrl: "" }), false);
});

test("Nuxt SEO output is guarded but radio routes remain prerenderable", async () => {
  const [config, app, robots, staticSeo] = await Promise.all([
    read("nuxt.config.ts"),
    read("app.vue"),
    read("server/routes/robots.txt.ts"),
    read("composables/useStaticPageSeo.ts"),
  ]);
  assert.match(config, /const noIndex = isStagingDeployment/);
  assert.match(config, /...\(!noIndex \? \["@nuxtjs\/sitemap"\] : \[\]\)/);
  assert.match(config, /\.\.\.radioSeoRoutes\.map/);
  assert.match(config, /"\/robots.txt"/);
  assert.match(app, /robots: "noindex, nofollow, noarchive"/);
  assert.match(app, /link: noIndex \? \[\] : \[/);
  assert.match(app, /script: noIndex \? \[\] : \[/);
  assert.match(robots, /if \(config.public.noIndex\)/);
  assert.match(robots, /return "User-agent: \*\\nAllow: \/\\n"/);
  assert.doesNotMatch(robots, /return "User-agent: \*\\nDisallow: \/\\n"/);
  assert.match(robots, /Sitemap:/);
  assert.match(staticSeo, /script: noIndex \? \[\] : \[/);
  for (const path of ["pages/index.vue", "pages/[area]/index.vue", "pages/[area]/[country]/index.vue", "pages/[area]/[country]/[station].vue"]) {
    const src = await read(path);
    assert.match(src, /script: noIndex \? \[\] : \[/, path);
    assert.match(src, /noIndex/, path);
  }
});
