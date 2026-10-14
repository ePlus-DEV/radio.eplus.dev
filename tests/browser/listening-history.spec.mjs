import { test, expect } from '@playwright/test';

const history = (page) => page.evaluate(() => {
  const raw = localStorage.getItem('radio_listening_library_v1');
  return raw ? JSON.parse(raw) : null;
});

const mockAudio = async (page) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {
      this.dispatchEvent(new Event('pause'));
    };
    HTMLMediaElement.prototype.load = function () {};
  });
};

const ready = async (page, path) => {
  await page.goto(path);
  await expect(page.locator('.radio-player-dock')).toBeVisible();
};

test('recent station is persisted only after playing and is not resurrected by late events', async ({ page }) => {
  await mockAudio(page);
  await ready(page, '/europe/belgium/studio-brussel');

  // Visiting a detail page is not a listen and must not add recent history.
  expect((await history(page))?.recent || []).toEqual([]);
  const dock = page.locator('.radio-player-dock');
  await dock.getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect.poll(async () => (await history(page))?.recent?.[0]?.url)
    .toBe('/europe/belgium/studio-brussel');
  await dock.getByRole('button', { name: 'Pause radio', exact: true }).click();
  await expect.poll(async () => (await history(page))?.lastState).toBe('pause');

  // The browser can deliver a queued playing event after an explicit pause.
  await page.locator('audio').first().evaluate((audio) => audio.dispatchEvent(new Event('playing')));
  expect((await history(page)).lastState).toBe('pause');
  await expect(dock.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();

  await page.goto('/');
  await page.reload();
  await expect(page.locator('.radio-player-dock').getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
  expect((await history(page)).recent[0].title).toBe('Studio Brussel');
  await page.goto('/library#recent');
  await expect(page.locator('section[aria-label="Recently played"]')).toContainText('Studio Brussel');
});

test('listening history updates an already-open library tab', async ({ page, context }) => {
  await mockAudio(page);
  const libraryTab = await context.newPage();
  await ready(libraryTab, '/library#recent');
  await ready(page, '/europe/belgium/studio-brussel');
  await page.locator('.radio-player-dock').getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect.poll(async () => (await history(page))?.recent?.length).toBe(1);
  await expect(libraryTab.locator('section[aria-label="Recently played"]')).toContainText('Studio Brussel');
  await libraryTab.close();
});

test('delete one history entry from library without affecting favorites, playback preference or other stations', async ({ page }) => {
  await ready(page, '/');
  await page.evaluate(() => {
    const first = { url: '/europe/belgium/studio-brussel', title: 'Studio Brussel', image: '/brand/onair-mark.svg' };
    const second = { url: '/europe/belgium/mnm', title: 'MNM', image: '/brand/onair-mark.svg' };
    localStorage.setItem('radio_listening_library_v1', JSON.stringify({
      recent: [first, second], favorites: [first], lastStation: first, lastState: 'pause',
    }));
  });
  await page.goto('/library#recent');
  const recent = page.locator('section[aria-label="Recently played"]');
  await expect(recent).toContainText('Studio Brussel');
  await expect(recent).toContainText('MNM');
  await recent.getByRole('button', { name: 'Remove from history: Studio Brussel' }).click();
  await expect(recent).not.toContainText('Studio Brussel');
  await expect(recent).toContainText('MNM');
  await expect(page).toHaveURL(/\/library#recent$/);
  const saved = await history(page);
  expect(saved.recent.map(item => item.title)).toEqual(['MNM']);
  expect(saved.favorites.map(item => item.title)).toEqual(['Studio Brussel']);
  expect(saved.lastStation.title).toBe('Studio Brussel');
  expect(saved.lastState).toBe('pause');
  await page.reload();
  await expect(page.locator('section[aria-label="Recently played"]')).toContainText('MNM');
  await expect(page.locator('section[aria-label="Recently played"]')).not.toContainText('Studio Brussel');
});

test('home reload restores Heart UK rather than the first featured VOV station', async ({ page }) => {
  await page.addInitScript(() => {
    const heart = { url: '/europe/united-kingdom/heart-uk', title: 'Heart UK', image: '/brand/onair-mark.svg' };
    localStorage.setItem('radio_listening_library_v1', JSON.stringify({
      recent: [heart], favorites: [], lastStation: heart, lastState: 'pause',
    }));
  });
  await ready(page, '/');
  const dock = page.locator('.radio-player-dock');
  await expect(dock.getByRole('link', { name: /Heart UK/ })).toBeVisible();
  await expect(dock.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
  expect((await history(page)).lastStation.url).toBe('/europe/united-kingdom/heart-uk');

  await page.reload();
  await expect(dock.getByRole('link', { name: /Heart UK/ })).toBeVisible();
  await expect(dock.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
  expect((await history(page)).lastStation.url).toBe('/europe/united-kingdom/heart-uk');
});

test('explicit Heart UK selection survives home reload even before stream starts', async ({ page }) => {
  await page.addInitScript(() => {
    // Audio stays pending: selection must persist without a successful "playing" event.
    HTMLMediaElement.prototype.play = () => new Promise(() => {});
    HTMLMediaElement.prototype.pause = function () { this.dispatchEvent(new Event('pause')); };
    HTMLMediaElement.prototype.load = () => {};
  });
  await ready(page, '/');
  const dock = page.locator('.radio-player-dock');
  await page.locator('#featured-radio').getByRole('button', { name: 'Play radio: Heart UK' }).click();

  await expect.poll(async () => (await history(page))?.lastStation?.url)
    .toBe('/europe/united-kingdom/heart-uk');
  expect((await history(page)).recent).toEqual([]);

  await page.reload();
  await expect(dock.getByRole('link', { name: /Heart UK/ })).toBeVisible();
  await expect(dock.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
  expect((await history(page)).lastStation.url).toBe('/europe/united-kingdom/heart-uk');
});

test('saved station also outranks country fallback on reload', async ({ page }) => {
  await page.addInitScript(() => {
    const heart = { url: '/europe/united-kingdom/heart-uk', title: 'Heart UK', image: '/brand/onair-mark.svg' };
    localStorage.setItem('radio_listening_library_v1', JSON.stringify({
      recent: [heart], favorites: [], lastStation: heart, lastState: 'pause',
    }));
  });
  await ready(page, '/asia/viet-nam');
  await expect(page.locator('.radio-player-dock').getByRole('link', { name: /Heart UK/ })).toBeVisible();
  await expect(page.locator('.radio-player-dock').getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
});
