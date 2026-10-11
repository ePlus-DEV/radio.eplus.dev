import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { auditAllStationOg, collectMeta } from "../scripts/assert-all-station-social-meta.mjs";

const origin = "https://radio.eplus.dev";
const meta = (name, content, prop = "property") =>
  '<meta ' + prop + '="' + name + '" content="' + content + '">';
const fixtureHtml = (route, image, overrides = {}) => {
  const imageUrl = overrides.image || origin + image;
  const tags = [
    meta("og:image", imageUrl),
    meta("og:url", origin + route),
    meta("twitter:image", imageUrl, "name"),
    ...(overrides.noCard ? [] : [meta("twitter:card", "summary_large_image", "name")]),
    meta("og:image:width", "1200"),
    meta("og:image:height", "630"),
    meta("og:image:type", "image/jpeg"),
    meta("og:title", "Station Live Radio"),
    meta("og:description", "Listen to the station"),
    meta("description", "Listen to the station", "name"),
  ];
  return '<!doctype html><html><head>' + tags.join("") + '</head><body>Radio</body></html>';
};

async function setupFixture(root, { wrongSecondImage = false, missingCard = false } = {}) {
  const stations = ["vov1", "vov2"];
  const dir = join(root, "public", "radio", "asia");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "viet-nam.json"), JSON.stringify({
    vov1: { title: "VOV 1" }, vov2: { title: "VOV 2" },
  }));
  for (const [i, id] of stations.entries()) {
    const route = "/asia/viet-nam/" + id;
    const image = "/og/stations/asia/viet-nam/" + id + ".jpg";
    const imagePath = join(root, ".output", "public", image.slice(1));
    const htmlPath = join(root, ".output", "public", route.slice(1), "index.html");
    await mkdir(dirname(htmlPath), { recursive: true });
    await mkdir(dirname(imagePath), { recursive: true });
    await writeFile(htmlPath, fixtureHtml(route, image, {
      image: i === 1 && wrongSecondImage ? origin + "/brand/social-preview.png" : undefined,
      noCard: i === 1 && missingCard,
    }));
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#c93668" } })
      .jpeg().toFile(imagePath);
  }
}

test("meta parser selects only explicit exact property/name matches", () => {
  const html = fixtureHtml("/asia/viet-nam/vov1", "/og/stations/asia/viet-nam/vov1.jpg");
  assert.deepEqual(collectMeta(html, "property", "og:image"), [
    origin + "/og/stations/asia/viet-nam/vov1.jpg",
  ]);
  assert.deepEqual(collectMeta(html, "name", "twitter:card"), ["summary_large_image"]);
  assert.deepEqual(collectMeta(html, "property", "twitter:image"), []);
});

test("all-station audit passes valid pages and detects a wrong OG image on another station", async () => {
  const root = await mkdtemp(join(tmpdir(), "onair-og-audit-"));
  try {
    await setupFixture(root);
    let result = await auditAllStationOg({ root, origin, concurrency: 2 });
    assert.equal(result.stations, 2);
    assert.equal(result.verified, 2);
    assert.equal(result.failed, 0);

    await setupFixture(root, { wrongSecondImage: true });
    result = await auditAllStationOg({ root, origin, concurrency: 2 });
    assert.equal(result.verified, 1);
    assert.equal(result.failed, 1);
    assert.match(result.failures[0].station, /vov2/);
    assert.match(result.failures[0].error, /og:image/);

    await setupFixture(root, { missingCard: true });
    result = await auditAllStationOg({ root, origin, concurrency: 2 });
    assert.equal(result.failed, 1);
    assert.match(result.failures[0].error, /twitter:card/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
