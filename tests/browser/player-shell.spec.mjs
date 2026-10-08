import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const dock = page => page.locator('.radio-player-dock');
async function ready(page, path) {
  await page.goto(path);
  await page.waitForFunction(() => Boolean(document.querySelector('#__nuxt')?.__vue_app__));
  await expect(dock(page)).toBeVisible();
}
async function mockMedia(page) {
  await page.addInitScript(() => {
    window.radioMediaCalls = { play: 0, load: 0 };
    HTMLMediaElement.prototype.play = function () {
      window.radioMediaCalls.play += 1;
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () { this.dispatchEvent(new Event('pause')); };
    HTMLMediaElement.prototype.load = function () { window.radioMediaCalls.load += 1; };
  });
  await page.route(/api\.webrad\.io/, route => route.fulfill({ json: { success: false } }));
  await page.route(/api\.iconify\.design/, route => route.abort());
}

test('audio, volume and selected station survive home/region/country navigation; pause stays paused', async ({ page }) => {
  await mockMedia(page);
  await ready(page, '/europe/belgium/studio-brussel');
  // Client-only controls must render from the static bundle without an icon API.
  await expect.poll(() => dock(page).locator('.iconify').evaluateAll(icons =>
    icons.length >= 5 && icons.every(icon => getComputedStyle(icon).maskImage !== 'none'),
  )).toBe(true);
  await dock(page).getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect(dock(page).getByRole('button', { name: 'Pause radio', exact: true })).toBeVisible();
  await page.evaluate(() => { window.radioSavedAudio = document.querySelector('audio'); });
  await dock(page).getByRole('slider', { name: 'Volume', exact: true }).first().evaluate(input => { input.value = '0.37'; input.dispatchEvent(new Event('input', { bubbles: true })); });
  const before = await page.evaluate(() => ({ ...window.radioMediaCalls }));
  await page.locator('header a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.locator('main a[href="/asia"]').first().click();
  await expect(page).toHaveURL(/\/asia$/);
  await page.locator('main a[href="/asia/viet-nam"]').first().click();
  await expect(page).toHaveURL(/\/asia\/viet-nam$/);
  expect(await page.evaluate(() => document.querySelector('audio') === window.radioSavedAudio)).toBe(true);
  expect(await page.locator('audio').evaluate(audio => audio.volume)).toBeCloseTo(0.37);
  expect(await page.evaluate(() => window.radioMediaCalls)).toEqual(before);
  await expect(dock(page).getByRole('link')).toContainText('Studio Brussel');
  await dock(page).getByRole('button', { name: 'Pause radio', exact: true }).click();
  await page.locator('header a[href="/"]').first().click();
  await expect(dock(page).getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.radioMediaCalls.play)).toBe(before.play);
  await dock(page).getByRole('button', { name: /^Next station:/ }).click();
  await expect(page).toHaveURL(/\/europe\/belgium\/mnm$/);
  await expect(dock(page).getByRole('link')).toContainText('MNM');
  await expect(dock(page).getByRole('button', { name: 'Pause radio', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.querySelector('audio') === window.radioSavedAudio)).toBe(true);
});

test('station cards start the selected station while retaining real navigation links', async ({ page }) => {
  await mockMedia(page);
  await ready(page, '/europe/belgium');
  await page.locator('main a[href="/europe/belgium/mnm"]').click();
  await expect(page).toHaveURL(/\/europe\/belgium\/mnm$/);
  await expect(dock(page).getByRole('link')).toContainText('MNM');
  await expect(dock(page).getByRole('button', { name: 'Pause radio', exact: true })).toBeVisible();
});

test('pausing during a pending play request ignores its late completion', async ({ page }) => {
  await mockMedia(page);
  await ready(page, '/europe/belgium/studio-brussel');
  await page.evaluate(() => {
    HTMLMediaElement.prototype.play = function () {
      return new Promise(resolve => { window.radioResolvePlay = resolve; });
    };
  });
  await dock(page).getByRole('button', { name: 'Play radio', exact: true }).click();
  await dock(page).getByRole('button', { name: 'Pause radio', exact: true }).click();
  await page.evaluate(() => window.radioResolvePlay());
  await expect(dock(page).getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
});

test('Nuxt UI language/theme menus close on selection and Escape; search traps and restores focus', async ({ page }) => {
  await mockMedia(page);
  await ready(page, '/europe/belgium');
  const language = page.getByRole('button', { name: 'Language:', exact: true });
  await language.click();
  await page.getByRole('menuitemcheckbox', { name: /Tiếng Việt/ }).click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  const vietnameseLanguage = page.getByRole('button', { name: 'Ngôn ngữ:', exact: true });
  await vietnameseLanguage.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(vietnameseLanguage).toBeFocused();
  await vietnameseLanguage.click();
  await page.getByRole('menuitemcheckbox', { name: /English/ }).click();
  const theme = page.locator('header').getByRole('button', { name: /^(System|Light|Dark)$/ });
  await theme.click();
  await page.getByRole('menuitemcheckbox', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('menu')).toHaveCount(0);
  const searchTrigger = page.locator('header').getByRole('button', { name: 'Search...', exact: true });
  await searchTrigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#search-input')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.getByRole('dialog').evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(searchTrigger).toBeFocused();
});

test('320px mobile dock and drawer stay inside the viewport, including long RTL metadata', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockMedia(page);
  await ready(page, '/europe/belgium/studio-brussel');
  await page.evaluate(() => {
    document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$pinia._s.get('playback').station.title = 'محطة راديو بعنوان طويل جداً '.repeat(12);
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await dock(page).getByRole('button', { name: 'Channels & schedule', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect.poll(async () => {
    const bounds = await dialog.boundingBox();
    return bounds.x + bounds.width;
  }).toBeLessThanOrEqual(321);
  await expect(dialog.getByRole('slider', { name: 'Volume', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(dock(page).getByRole('button', { name: 'Channels & schedule', exact: true })).toBeFocused();
});

test('real hls.js playback waits for a local manifest, continues across pages and keeps one audio element', async ({ page }) => {
  const manifest = await readFile(new URL('./fixtures/live.m3u8', import.meta.url), 'utf8');
  const segment = await readFile(new URL('./fixtures/radio-fixture-0.ts', import.meta.url));
  await page.route(/\.m3u8(?:$|[?])/, route => route.fulfill({ body: manifest, contentType: 'application/vnd.apple.mpegurl', headers: { 'access-control-allow-origin': '*' } }));
  await page.route('**/radio-fixture-0.ts', route => route.fulfill({ body: segment, contentType: 'video/mp2t', headers: { 'access-control-allow-origin': '*' } }));
  await page.route(/zing\.eplus\.dev\/api\//, route => route.fulfill({ json: { err: 0, data: { items: [] } }, headers: { 'access-control-allow-origin': '*' } }));
  await ready(page, '/asia/viet-nam/edm-radio-zing-mp3');
  await dock(page).getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect(dock(page).getByRole('button', { name: 'Pause radio', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('audio').evaluate(audio => audio.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => page.locator('audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
  await page.evaluate(() => { window.radioSavedAudio = document.querySelector('audio'); });
  await page.locator('header a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => document.querySelector('audio') === window.radioSavedAudio)).toBe(true);
  expect(await page.locator('audio').evaluate(audio => audio.paused)).toBe(false);
  await expect(dock(page).getByRole('link')).toContainText('EDM');
});
