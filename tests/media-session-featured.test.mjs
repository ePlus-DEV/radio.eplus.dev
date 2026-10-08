import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildRadioMediaMetadata } from "../utils/radio-media-session.mjs";
import { VIETNAM_FEATURED_STATION_IDS, selectVietnamFeaturedStations } from "../utils/featured-stations.mjs";

test("Media Session uses song artwork and details before station logo", () => {
  const result = buildRadioMediaMetadata({
    title: "Xin Đừng Nhắc Máy", artist: "B Ray", station: "Rap Việt Radio - Zing MP3",
    artwork: "https://photo-resize-zmp3.zadn.vn/image.jpg",
    fallbackArtwork: "/img/asia/viet-nam/rap-viet-radio-zing-mp3.png",
  }, "https://radio-new.eplus.dev");
  assert.deepEqual(result, {
    title: "Xin Đừng Nhắc Máy",
    artist: "B Ray",
    album: "Rap Việt Radio - Zing MP3",
    artwork: [{ src: "https://photo-resize-zmp3.zadn.vn/image.jpg" }],
  });
});

test("Media Session falls back to local station artwork and ignores invalid schemes", () => {
  const origin = "https://radio-new.eplus.dev";
  assert.deepEqual(buildRadioMediaMetadata({ title: "", station: "VOV Giao Thông TP.HCM", artwork: "data:bad", fallbackArtwork: "/img/asia/viet-nam/vov-giao-thong.png" }, origin), {
    title: "VOV Giao Thông TP.HCM",
    artist: "VOV Giao Thông TP.HCM",
    album: "VOV Giao Thông TP.HCM",
    artwork: [{ src: origin + "/img/asia/viet-nam/vov-giao-thong.png" }],
  });
  assert.deepEqual(buildRadioMediaMetadata({}, origin).artwork, [{ src: origin + "/brand/logo-share.png" }]);
});

test("Homepage featured stations contain VOV Giao Thong and Zing only", async () => {
  const catalog = JSON.parse(await readFile("public/radio/asia/viet-nam.json", "utf8"));
  const featured = selectVietnamFeaturedStations(catalog);
  const ids = featured.map(([id]) => id);
  assert.deepEqual(ids, [...VIETNAM_FEATURED_STATION_IDS]);
  assert.equal(ids[0], "vov-gt-hcm");
  assert.equal(ids.length, 10);
  assert.ok(ids.slice(1).every(id => id.includes("zing-mp3")));
  for (const unavailable of ["vov1", "vov2", "vov3", "vov5"]) {
    assert.ok(!ids.includes(unavailable), `Do not feature known unavailable station ${unavailable}`);
  }
  assert.deepEqual(selectVietnamFeaturedStations({ "vov1": catalog.vov1 }), []);
});

test("Missing or unusable featured streams are excluded rather than played", () => {
  const sample = {
    "vov-gt-hcm": { title: "VOV Giao Thong", stream: "" },
    "rap-viet-radio-zing-mp3": { title: "Rap Việt", stream: "https://example.com/radio.m3u8" },
    "edm-radio-zing-mp3": { title: "EDM", stream: "javascript:alert(1)" },
  };
  assert.deepEqual(selectVietnamFeaturedStations(sample).map(([id]) => id), ["rap-viet-radio-zing-mp3"]);
});

test("Player registers iOS track commands as station navigation", async () => {
  const source = await readFile("components/player/Player.vue", "utf8");
  assert.match(source, /nexttrack:\s*\(\) => navigateStation\(1\)/);
  assert.match(source, /previoustrack:\s*\(\) => navigateStation\(-1\)/);
  assert.match(source, /new MediaMetadata\(details\)/);
  assert.match(source, /watch\([\s\S]*?nowPlayingTitle, nowPlayingArtist, nowPlayingArtwork/);
});
