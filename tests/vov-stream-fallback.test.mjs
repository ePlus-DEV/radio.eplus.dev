import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createPlaybackStation } from "../utils/playback-station.mjs";
import { buildPlaybackSources } from "../utils/radio-source-plan.mjs";

const catalog = JSON.parse(
  await readFile(new URL("../public/radio/asia/viet-nam.json", import.meta.url), "utf8"),
);

const restoredVovIds = ["vov1", "vov2", "vov3", "vov5", "vov-english", "vov-247"];

test("VOV stations prioritize direct HTTPS HLS with source fallbacks", () => {
  for (const id of restoredVovIds) {
    const meta = catalog[id];
    assert.ok(meta, `Missing VOV catalog entry: ${id}`);
    assert.equal(meta.type, "application/x-mpegURL", id);
    assert.equal(meta.cros, false, `HLS must not use the legacy CORS proxy: ${id}`);
    assert.match(meta.stream, /^https:\/\/.+\.m3u8$/i, id);
    assert.ok(meta.streams?.length > 0, `No fallback configured: ${id}`);

    const station = createPlaybackStation({
      area: "asia",
      country: "viet-nam",
      id,
      meta,
      corsServer: "https://proxy.example/",
    });
    const sources = buildPlaybackSources(station.sources, "https://proxy.example/");
    assert.equal(sources[0].src, meta.stream, id);
    assert.equal(sources[0].proxied, false, id);
    assert.equal(new Set(sources.map(source => source.src)).size, sources.length, id);
    assert.ok(
      sources.some(source => source.src !== meta.stream),
      `No distinct playable fallback: ${id}`,
    );
  }
});

test("VOV1 and VOV2 keep separate broadcaster-operated HLS endpoints", () => {
  for (const id of ["vov1", "vov2"]) {
    const meta = catalog[id];
    assert.match(new URL(meta.stream).hostname, /^(?:stream-cdn\.vov\.vn)$/);
    assert.ok(meta.streams.some(entry =>
      new URL(entry.url).hostname === "str.vov.gov.vn"
      && entry.type === "application/x-mpegURL"
      && entry.cros === false
    ), `${id}: no VOV Live fallback`);
  }
});

test("VOV3/VOV5/English sources remain station-specific", () => {
  assert.match(catalog.vov3.stream, /\/vov3\.sdp_aac\/playlist\.m3u8$/);
  assert.match(catalog.vov5.stream, /\/vov5\.sdp_aac\/playlist\.m3u8$/);
  assert.match(catalog["vov-english"].stream, /\/vov247vov5English\.sdp_aac\/playlist\.m3u8$/);
  assert.match(catalog["vov-247"].stream, /\/vov24_7-audio_only\.m3u8$/);
});
