import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const provider = JSON.parse(await readFile(new URL('../../public/catalog/providers/apple-music.json', import.meta.url)));
const pathFor = station => '/global-radio/apple-music/' + station.id;
const hits = provider.stations.find(station => station.id === 'apple-music-hits');
const savedLibrary = (station, overrides = {}) => ({
  recent: [],
  favorites: [],
  lastStation: {
    url: pathFor(station),
    title: station.title,
    image: station.image,
    countryKey: 'global_radio.title',
    ...overrides,
  },
  lastState: 'play',
});
const currentPlayback = page => page.evaluate(() => {
  const store = document.querySelector('#__nuxt')?.__vue_app__
    ?.config.globalProperties.$pinia._s.get('playback');
  const audio = document.querySelector('audio');
  return {
    title: store?.station?.title || '',
    url: store?.station?.url || '',
    image: store?.station?.image || '',
    sources: store?.station?.sources || [],
    lease: store?.globalRadioLease || null,
    playRequest: store?.playRequest || 0,
    playing: store?.playing || false,
    audioSrc: audio?.currentSrc || '',
    queueSize: store?.stations?.length || 0,
  };
});

for (const station of provider.stations) {
  test(`Global Radio restores ${station.title} selection after F5 without audio, signed token or autoplay`, async ({ page }) => {
    await page.addInitScript(library => {
      localStorage.setItem('radio_listening_library_v1', JSON.stringify(library));
    }, savedLibrary(station));
    await page.goto(pathFor(station));
    const dock = page.locator('.radio-player-dock');
    await expect(dock.locator('.radio-player-title')).toHaveText(station.title);
    await expect(dock.locator('.radio-player-main-action')).toBeEnabled();
    await expect(page.locator('audio')).toHaveCount(1);

    await page.reload();
    await expect(dock.locator('.radio-player-title')).toHaveText(station.title);
    await expect(dock.locator('.radio-player-main-action')).toBeEnabled();

    const state = await currentPlayback(page);
    expect(state).toMatchObject({
      title: station.title,
      url: pathFor(station),
      sources: [],
      lease: null,
      playRequest: 0,
      playing: false,
      audioSrc: '',
    });
    await expect.poll(async () => (await currentPlayback(page)).queueSize).toBe(provider.stations.length);
    const storage = await page.evaluate(() => localStorage.getItem('radio_listening_library_v1'));
    expect(storage).not.toMatch(/accessKey|itsliveradio\.apple\.com|m3u8/);
  });
}

test('F5 while browsing another Global detail preserves the actually selected station', async ({ page }) => {
  await page.addInitScript(library => {
    localStorage.setItem('radio_listening_library_v1', JSON.stringify(library));
  }, savedLibrary(hits));
  await page.goto('/global-radio/apple-music/apple-music-1');
  await expect(page.locator('main h1')).toHaveText('Apple Music 1');
  await expect(page.locator('.radio-player-dock .radio-player-title')).toHaveText('Apple Music Hits');
  expect((await currentPlayback(page)).url).toBe(pathFor(hits));

  await page.reload();
  await expect(page.locator('main h1')).toHaveText('Apple Music 1');
  await expect(page.locator('.radio-player-dock .radio-player-title')).toHaveText('Apple Music Hits');
  expect((await currentPlayback(page)).sources).toEqual([]);
});

test('a Country detail deep link still owns its own station instead of restoring saved Global history', async ({ page }) => {
  await page.addInitScript(library => {
    localStorage.setItem('radio_listening_library_v1', JSON.stringify(library));
  }, savedLibrary(hits));
  await page.goto('/europe/belgium/studio-brussel');
  await expect(page.locator('main h1')).toContainText('Studio Brussel');
  await expect.poll(async () => (await currentPlayback(page)).url)
    .toBe('/europe/belgium/studio-brussel');
});

test('canonical Global metadata replaces stale saved title/artwork without triggering audio', async ({ page }) => {
  await page.addInitScript(library => {
    localStorage.setItem('radio_listening_library_v1', JSON.stringify(library));
  }, savedLibrary(hits, { title: 'Old Apple Name', image: '/brand/onair-mark.svg' }));
  await page.goto(pathFor(hits));
  await expect(page.locator('.radio-player-dock .radio-player-title')).toHaveText(hits.title);
  await expect.poll(async () => (await currentPlayback(page)).image).toContain(hits.image);
  expect(await currentPlayback(page)).toMatchObject({
    title: hits.title,
    sources: [],
    lease: null,
    playRequest: 0,
    playing: false,
  });
});

test('Global details without listening history stay passive and never auto-start a station', async ({ page }) => {
  await page.goto(pathFor(hits));
  await expect(page.locator('main h1')).toHaveText(hits.title);
  await expect(page.locator('audio')).toHaveCount(1);
  const state = await currentPlayback(page);
  expect(state).toMatchObject({ url: '', playRequest: 0, playing: false, audioSrc: '' });
});
