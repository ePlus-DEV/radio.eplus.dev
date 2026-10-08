import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
