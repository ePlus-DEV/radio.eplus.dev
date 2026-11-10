import { test, expect } from '@playwright/test';

const hitsPath = '/global-radio/apple-music/apple-music-hits';
const savedHits = {
  recent: [],
  favorites: [],
  lastStation: {
    url: hitsPath,
    title: 'Apple Music Hits',
    image: '/brand/onair-mark.svg',
    countryKey: 'global_radio.title',
  },
  lastState: 'play',
};

test('Apple Music Hits remains selected after F5, but audio never auto-resumes', async ({ page }) => {
  // Seed exactly what the player saves after a user has selected this station.
  // No signed URL or accessKey may be persisted.
  await page.addInitScript(library => {
    localStorage.setItem('radio_listening_library_v1', JSON.stringify(library));
  }, savedHits);
  await page.goto(hitsPath);
  const dock = page.locator('.radio-player-dock');
  const currentTitle = dock.locator('.radio-player-title');
  await expect(currentTitle).toHaveText('Apple Music Hits');
  await expect(dock.locator('.radio-player-main-action')).toBeEnabled();
  await expect(page.locator('audio')).toHaveCount(1);

  await page.reload();
  await expect(currentTitle).toHaveText('Apple Music Hits');
  await expect(dock.locator('.radio-player-main-action')).toBeEnabled();

  const state = await page.evaluate(() => {
    const store = document.querySelector('#__nuxt')?.__vue_app__
      ?.config.globalProperties.$pinia._s.get('playback');
    const audio = document.querySelector('audio');
    return {
      title: store?.station?.title,
      url: store?.station?.url,
      sources: store?.station?.sources,
      lease: store?.globalRadioLease,
      playRequest: store?.playRequest,
      playing: store?.playing,
      audioSrc: audio?.currentSrc || '',
    };
  });
  expect(state).toEqual({
    title: 'Apple Music Hits',
    url: hitsPath,
    sources: [],
    lease: null,
    playRequest: 0,
    playing: false,
    audioSrc: '',
  });
});

test('reloading a different Apple Music detail page does not replace it with history', async ({ page }) => {
  await page.addInitScript(library => {
    localStorage.setItem('radio_listening_library_v1', JSON.stringify(library));
  }, savedHits);
  await page.goto('/global-radio/apple-music/apple-music-1');
  await expect(page.locator('main h1')).toHaveText('Apple Music 1');
  const current = await page.evaluate(() => {
    const store = document.querySelector('#__nuxt')?.__vue_app__
      ?.config.globalProperties.$pinia._s.get('playback');
    return store?.station?.url || null;
  });
  expect(current).toBeNull();
});
