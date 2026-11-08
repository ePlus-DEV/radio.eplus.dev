import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildRadioMediaMetadata, registerRadioMediaActions, createRadioMediaSession } from "../utils/radio-media-session.mjs";

test('hardware actions navigate stations and unsupported actions do not prevent cleanup', () => {
  const actions = new Map();
  const calls = [];
  const session = { metadata: {}, setActionHandler(action, handler) {
    if (action === 'seekforward') throw new Error('unsupported');
    actions.set(action, handler);
  } };
  const cleanup = registerRadioMediaActions(session, {
    play: () => calls.push('play'), pause: () => calls.push('pause'),
    next: () => calls.push('next'), previous: () => calls.push('previous'),
  });
  for (const action of ['play', 'pause', 'nexttrack', 'previoustrack', 'seekbackward']) actions.get(action)();
  assert.deepEqual(calls, ['play', 'pause', 'next', 'previous', 'previous']);
  assert.equal(actions.get('seekto'), null);
  cleanup();
  assert.equal(session.metadata, null);
  for (const action of ['play', 'pause', 'nexttrack', 'previoustrack', 'seekbackward']) assert.equal(actions.get(action), null);
});

test('forward and backward seek controls switch live stations without seeking', () => {
  const actions = new Map();
  const calls = [];
  registerRadioMediaActions({ setActionHandler: (action, handler) => actions.set(action, handler) }, {
    play() {}, pause() {}, next: () => calls.push('next'), previous: () => calls.push('previous'),
  });
  actions.get('seekforward')();
  actions.get('seekbackward')();
  assert.deepEqual(calls, ['next', 'previous']);
  assert.equal(actions.get('seekto'), null);
});
import {
  VIETNAM_FEATURED_STATION_IDS,
  HOMEPAGE_FEATURED_STATION_PATHS,
  selectVietnamFeaturedStations,
  selectHomepageFeaturedStations,
  insertHolidayFeaturedStation,
} from "../utils/featured-stations.mjs";

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
  assert.deepEqual(buildRadioMediaMetadata({}, origin).artwork, [{ src: origin + "/brand/android-chrome-512x512.png" }]);
});

test("Homepage featured stations contain VOV Giao Thong and Zing only", async () => {
  const catalog = JSON.parse(await readFile("public/radio/asia/viet-nam.json", "utf8"));
  const featured = selectVietnamFeaturedStations(catalog);
  const ids = featured.map(([id]) => id);
  assert.deepEqual(ids, [...VIETNAM_FEATURED_STATION_IDS]);
  assert.equal(ids[0], "vov-gt-hcm");
  assert.equal(ids.length, 8);
  assert.deepEqual(ids.slice(-2), ["c-pop-zing-mp3", "acoustic-radio-zing-mp3"]);
  assert.ok(["kpop-radio-zing-mp3", "bolero-zing-mp3", "cham-radio-zing-mp3"].every(id => !ids.includes(id)));
  assert.ok(ids.slice(1).every(id => id.includes("zing-mp3")));
  for (const unavailable of ["vov1", "vov2", "vov3", "vov5"]) {
    assert.ok(!ids.includes(unavailable), `Do not feature known unavailable station ${unavailable}`);
  }
  assert.deepEqual(selectVietnamFeaturedStations({ "vov1": catalog.vov1 }), []);
});

test("Homepage featured radio includes Heart UK and Power 98 Love Songs with unique country routes", async () => {
  const [vn, uk, sg] = await Promise.all([
    readFile("public/radio/asia/viet-nam.json", "utf8"),
    readFile("public/radio/europe/united-kingdom.json", "utf8"),
    readFile("public/radio/asia/singapore.json", "utf8"),
  ]);
  const featured = selectHomepageFeaturedStations({
    "asia/viet-nam": JSON.parse(vn),
    "europe/united-kingdom": JSON.parse(uk),
    "asia/singapore": JSON.parse(sg),
  });
  assert.equal(HOMEPAGE_FEATURED_STATION_PATHS.length, VIETNAM_FEATURED_STATION_IDS.length + 1);
  assert.equal(HOMEPAGE_FEATURED_STATION_PATHS.length, 9);
  assert.equal(featured.length, 9);
  assert.deepEqual(featured.map(entry => entry.path), [...HOMEPAGE_FEATURED_STATION_PATHS]);
  assert.equal(featured[0].path, "asia/viet-nam/vov-gt-hcm");
  assert.equal(featured.find(entry => entry.id === "heart-uk")?.meta.title, "Heart UK");
  assert.equal(featured.find(entry => entry.id === "power")?.meta.title, "Power 98 Love Songs");
  assert.deepEqual(featured.slice(1, 3).map(entry => entry.path), [
    "europe/united-kingdom/heart-uk",
    "asia/singapore/power",
  ]);
  assert.equal(new Set(featured.map(entry => entry.path)).size, featured.length);
  assert.deepEqual(featured.slice(-2).map(entry => entry.id), ["c-pop-zing-mp3", "acoustic-radio-zing-mp3"]);
  for (const unavailable of ["vov1", "vov2", "vov3", "vov5"]) {
    assert.ok(!featured.some(entry => entry.id === unavailable));
  }
});

test("Homepage curation skips unavailable stations without substituting another country's stream", () => {
  const selected = selectHomepageFeaturedStations({
    "asia/viet-nam": { "vov-gt-hcm": { title: "VOV GT", stream: "https://radio.example/live.mp3" } },
    "europe/united-kingdom": { "heart-uk": { title: "Heart", stream: "" } },
    "asia/singapore": { power: { title: "Power", stream: "https://radio.example/power" } },
  });
  assert.deepEqual(selected.map(entry => entry.path), [
    "asia/viet-nam/vov-gt-hcm",
    "asia/singapore/power",
  ]);
});

test("Featured cards use each station's country metadata for direct playback", async () => {
  const source = await readFile("pages/index.vue", "utf8");
  assert.match(source, /selectHomepageFeaturedStations\(featuredCatalogs\.value/);
  assert.match(source, /area, country, id, meta/);
  assert.match(source, /playback\.activate\(createPlaybackStation\(/);
  assert.match(source, /featuredEntries\.value\.find\(entry =>/);
  assert.match(source, /featuredStations\.value, \{ autoplay: true \}/);
});

test("Featured radio cards toggle play/pause with the global player without leaving the page", async () => {
  const [card, home] = await Promise.all([
    readFile("components/panel/FeaturedStations.vue", "utf8"),
    readFile("pages/index.vue", "utf8"),
  ]);

  // Match station URLs, not only short IDs; the carousel mixes countries.
  assert.match(card, /:key="station\.url \|\| station\.id"/);
  assert.match(card, /station\.url === activeStationUrl/);
  assert.match(home, /:active-station-url="playback\.station\?\.url"/);

  // Keep the direct-play control separate from the station details link.
  assert.match(card, /:to="station\.url"/);
  assert.match(card, /@click="emit\('select-station', station\)"/);
  assert.match(card, /:name="isConnecting\(station\) \? 'i-lucide-loader-circle' : isPlaying\(station\) \? 'i-lucide-pause' : 'i-lucide-play'"/);
  assert.match(card, /:aria-pressed="isPlaying\(station\)"/);

  // Pause the active stream; resume with a play request; otherwise activate the chosen catalog.
  assert.match(home, /playback\.station\?\.url === station\.url && playback\.station\.sources\.length/);
  assert.match(home, /if \(playback\.playing \|\| playback\.waiting\) playback\.pauseRequest \+= 1/);
  assert.match(home, /else playback\.requestStation\(station\.url\)/);
  assert.match(home, /playback\.activate\(createPlaybackStation\([\s\S]*?featuredStations\.value, \{ autoplay: true \}/);
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
  assert.match(source, /next:\s*\(\) => navigateStation\(1\)/);
  assert.match(source, /previous:\s*\(\) => navigateStation\(-1\)/);
  assert.match(source, /radioMediaSession\.update/);
  assert.match(source, /watch\([\s\S]*?nowPlayingTitle, nowPlayingArtist, nowPlayingArtwork/);
});

test('Media Session controller synchronizes metadata and owns handler lifecycle', () => {
  const handlers = new Map();
  const session = { setActionHandler: (action, handler) => handlers.set(action, handler) };
  let playing = false; let title = 'First'; let next = 0;
  const controller = createRadioMediaSession({
    getEnvironment: () => ({ session, Metadata: class { constructor(value) { Object.assign(this, value); } }, origin: 'https://radio.eplus.dev' }),
    getDetails: () => ({ title, station: 'Radio', playing }),
    actions: { play() {}, pause() {}, next: () => next++, previous() {} },
  });
  controller.mount(); controller.mount(); controller.update();
  assert.equal(session.metadata.title, 'First');
  assert.equal(session.playbackState, 'paused');
  playing = true; title = 'Second'; controller.update();
  assert.equal(session.metadata.title, 'Second');
  assert.equal(session.playbackState, 'playing');
  handlers.get('nexttrack')(); assert.equal(next, 1);
  controller.dispose(); controller.dispose();
  assert.equal(session.metadata, null); assert.equal(handlers.get('nexttrack'), null);
});

test('Media Session controller tolerates unavailable browser APIs', () => {
  const controller = createRadioMediaSession({ getEnvironment: () => ({}), getDetails: () => { throw new Error('should not read details'); }, actions: {} });
  assert.doesNotThrow(() => { controller.mount(); controller.update(); controller.dispose(); });
});

test('homepage replaces Rap Viet with Holiday Hits using public provider metadata', async () => {
  const provider = JSON.parse(await readFile('public/catalog/providers/apple-music.json', 'utf8'));
  const country = [
    { id: 'vov', title: 'VOV', url: '/asia/viet-nam/vov' },
    { id: 'heart', title: 'Heart', url: '/europe/united-kingdom/heart' },
    { id: 'power', title: 'Power', url: '/asia/singapore/power' },
    { id: 'edm', title: 'EDM', url: '/asia/viet-nam/edm' },
  ];
  const items = insertHolidayFeaturedStation(country, provider);
  assert.equal(items[3].id, 'apple-music-holiday-hits');
  assert.equal(items[3].url, '/global-radio/apple-music/apple-music-holiday-hits');
  assert.equal(items[3].image, '/img/global-radio/apple-music-holiday-hits.png');
  assert.ok(!HOMEPAGE_FEATURED_STATION_PATHS.some(path => path.includes('rap-viet-radio-zing-mp3')));
  assert.equal(items.length, country.length + 1);
  assert.deepEqual(insertHolidayFeaturedStation(country, { stations: [] }), country);
  assert.ok(!JSON.stringify(items).includes('accessKey'));
});

test('homepage sends Holiday Hits to the existing Global playback resolver', async () => {
  const home = await readFile('pages/index.vue', 'utf8');
  assert.match(home, /useAuthorizedGlobalRadioPlayback/);
  assert.match(home, /if \(holiday\) void playApple\(holiday\)/);
  assert.match(home, /pendingStationId/);
  assert.match(home, /resolverError/);
});
