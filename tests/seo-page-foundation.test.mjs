import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();

const read = (path) => readFile(join(ROOT, path), "utf8");

test("country pages prerender station links instead of waiting for onMounted", async () => {
  const source = await read("pages/[area]/[country]/index.vue");

  assert.match(source, /await useAsyncData<CountryCatalogPayload>/);
  assert.match(source, /if \(import\.meta\.server\)/);
  assert.match(source, /readFile/);
  assert.match(source, /const stations = computed<RadioStationOption\[]>/);
  assert.match(source, /<PanelStation[\s\S]*?:stations="stations"/);
  assert.doesNotMatch(source, /const fetchData = async/);
});

test("dynamic SEO pages expose structured data and hard 404 guards", async () => {
  const [area, country, station] = await Promise.all([
    read("pages/[area]/index.vue"),
    read("pages/[area]/[country]/index.vue"),
    read("pages/[area]/[country]/[station].vue"),
  ]);

  assert.match(area, /buildBreadcrumbSchema/);
  assert.match(area, /buildCollectionPageSchema/);
  assert.match(area, /statusCode: 404/);

  assert.match(country, /buildBreadcrumbSchema/);
  assert.match(country, /buildCollectionPageSchema/);
  assert.match(country, /statusCode: 404/);

  assert.match(station, /buildBreadcrumbSchema/);
  assert.match(station, /buildRadioStationSchema/);
  assert.match(station, /statusCode: 404/);
  assert.match(station, /ogImageAlt:/);
  assert.match(station, /twitterImageAlt:/);
});

test("global metadata includes canonical social and organization identity", async () => {
  const source = await read("app.vue");

  assert.match(source, /rel: "canonical"/);
  assert.match(source, /"@type": "WebSite"/);
  assert.match(source, /"@type": "Organization"/);
  assert.match(source, /ogLocale:/);
  assert.match(source, /ogImageAlt:/);
  assert.match(source, /twitterImageAlt:/);
});

test("sitemap avoids fake deployment-time lastmod values", async () => {
  const source = await read("build/radioRoutes.ts");

  assert.doesNotMatch(source, /statSync/);
  assert.doesNotMatch(source, /mtimeMs/);
  assert.doesNotMatch(source, /lastmod:\s*new Date/);
});


test("route discovery ignores asset-only folders under public/radio", async () => {
  const source = await read("build/radioRoutes.ts");

  assert.match(source, /const countryFiles = readdirSync\(areaDir/);
  assert.match(source, /if \(countryFiles\.length === 0\) continue;/);
});

test("sitewide navigation does not crawl missing static pages", async () => {
  const [header, footer] = await Promise.all([
    read("components/AppHeader.vue"),
    read("components/AppFooter.vue"),
  ]);
  const navigation = `${header}\n${footer}`;

  for (const path of [
    "/about",
    "/privacy-policy",
    "/terms-of-use",
    "/statistics",
  ]) {
    assert.doesNotMatch(
      navigation,
      new RegExp(`(?:to|href)=["']${path.replaceAll("/", "\\/")}["']`),
      `sitewide navigation must not link to missing page ${path}`,
    );
  }
});

test("Romania artwork lives in the canonical image tree", async () => {
  const catalog = await read("public/radio/europe/romania.json");

  assert.match(catalog, /\/img\/europe\/romania\//);
  assert.doesNotMatch(catalog, /\/radio\/romania\//);

  await access(join(ROOT, "public/img/europe/romania/europa-fm.png"));
  await assert.rejects(access(join(ROOT, "public/radio/romania")));
});
