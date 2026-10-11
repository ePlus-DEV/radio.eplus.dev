import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";

import { stationOgPath, renderStationOg, generateStationOgImages } from "../scripts/generate-station-og-images.mjs";

test("station OG paths are stable and cannot escape the public directory", () => {
  assert.equal(stationOgPath("asia", "viet-nam", "vov1"), "/og/stations/asia/viet-nam/vov1.jpg");
  for (const invalid of ["../secrets", "..", "vov/1", "/tmp", ""]) {
    assert.throws(() => stationOgPath("asia", "viet-nam", invalid), /Invalid station OG path/);
  }
});

test("build creates distinct crawlable JPEGs from station logos and a safe missing-logo fallback", async () => {
  const root = await mkdtemp(join(tmpdir(), "onair-station-og-"));
  try {
    const catalogDir = join(root, "public", "radio", "asia");
    const logoDir = join(root, "public", "img", "asia", "viet-nam");
    await mkdir(catalogDir, { recursive: true });
    await mkdir(logoDir, { recursive: true });
    await sharp({
      create: { width: 160, height: 160, channels: 4, background: "#d42a5f" },
    }).png().toFile(join(logoDir, "vov1.png"));

    await writeFile(join(catalogDir, "viet-nam.json"), JSON.stringify({
      vov1: { title: 'VOV 1 & <Live> "Radio"', features: "/img/asia/viet-nam/vov1.png" },
      vov2: { title: "VOV 2 - missing local logo", features: "https://invalid.example/image.png" },
    }));
    const summary = await generateStationOgImages({ root, limit: 2 });
    assert.equal(summary.count, 2);
    assert.equal(summary.fallback, 1);
    assert.ok(summary.bytes > 1000);

    const first = join(root, "public", "og", "stations", "asia", "viet-nam", "vov1.jpg");
    const second = join(root, "public", "og", "stations", "asia", "viet-nam", "vov2.jpg");
    for (const name of [first, second]) {
      const meta = await sharp(name).metadata();
      assert.equal(meta.width, 1200);
      assert.equal(meta.height, 630);
      assert.equal(meta.format, "jpeg");
    }
    assert.notDeepEqual(await readFile(first), await readFile(second));

    const regenerated = await renderStationOg({
      root, area: "asia", country: "viet-nam", stationId: "vov1",
      meta: { title: "A distinctly different radio name", features: "/img/asia/viet-nam/vov1.png" },
    });
    assert.equal(regenerated.logoFound, true);
    assert.equal(regenerated.path, "/og/stations/asia/viet-nam/vov1.jpg");
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("station SEO points at generated image while station JSON-LD keeps logo artwork", async () => {
  const source = await readFile(new URL("../pages/[area]/[country]/[station].vue", import.meta.url), "utf8");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(source, /\/og\/stations\/\$\{area\.value\}\/\$\{slug\.value\}\/\$\{stationSlug\.value\}\.jpg/);
  assert.match(source, /image: stationArtwork\.value/);
  assert.match(source, /property: "og:image:width", content: "1200"/);
  assert.match(source, /property: "og:image:height", content: "630"/);
  assert.match(source, /property: "og:image:type", content: "image\/jpeg"/);
  assert.match(source, /name: "twitter:image", content: seoImage\.value/);
  for (const step of ["prebuild", "pregenerate", "predev"]) {
    assert.match(pkg.scripts[step], /generate-station-og-images\.mjs/);
  }
});
