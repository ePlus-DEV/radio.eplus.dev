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

test('desktop queue stays beside the catalog while scrolling and stops before the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 920 });
  await mockMedia(page);
  await page.route(/zing\.eplus\.dev\/api\//, route => route.fulfill({
    json: { err: 0, data: { items: [{ title: 'EDM schedule fixture', startTime: 1791446400, endTime: 1791450000 }] } },
    headers: { 'access-control-allow-origin': '*' },
  }));
  await ready(page, '/asia/viet-nam/edm-radio-zing-mp3');
  const panel = page.locator('.radio-right-panel');
  const footer = page.locator('footer');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('tab', { name: /Schedule/ })).toBeVisible();
  await page.locator('header a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 500);
  });
  await expect.poll(async () => (await panel.boundingBox()).y).toBeCloseTo(96, 0);

  for (const [theme, tab] of [['Light', /Schedule/], ['Dark', /All channels/]]) {
    await panel.getByRole('tab', { name: tab }).click();
    await page.locator('header').getByRole('button', { name: /^(System|Light|Dark)$/ }).click();
    await page.getByRole('menuitemcheckbox', { name: theme, exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(async () => {
      const panelBounds = await panel.boundingBox();
      const footerBounds = await footer.boundingBox();
      return panelBounds.y + panelBounds.height <= footerBounds.y;
    }).toBe(true);
    const footerLink = footer.locator('nav a').first();
    await expect(footerLink).toBeInViewport();
    expect(await footerLink.evaluate(link => {
      const bounds = link.getBoundingClientRect();
      const target = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      return link.contains(target);
    })).toBe(true);
  }

  await dock(page).getByRole('button', { name: 'Channels & schedule', exact: true }).click();
  await expect(panel).toBeHidden();
  await dock(page).getByRole('button', { name: 'Channels & schedule', exact: true }).click();
  await expect(panel).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const panelBounds = await panel.boundingBox();
  const footerBounds = await footer.boundingBox();
  expect(panelBounds.y + panelBounds.height).toBeLessThanOrEqual(footerBounds.y);
  await page.locator('header a[href="/"]').first().click();
  await page.locator('main a[href="/europe"]').first().click();
  await expect(page).toHaveURL(/\/europe$/);
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => {
    const panelBounds = await panel.boundingBox();
    const footerBounds = await footer.boundingBox();
    return panelBounds.y + panelBounds.height <= footerBounds.y;
  }).toBe(true);
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

test('mobile web-volume slider has a usable touch target and changes volume', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockMedia(page);
  await ready(page, '/europe/belgium/studio-brussel');
  await dock(page).getByRole('button', { name: 'Channels & schedule', exact: true }).click();
  const slider = page.getByRole('dialog').getByRole('slider', { name: 'Volume', exact: true });
  await expect(slider).toBeVisible();
  const bounds = await slider.boundingBox();
  expect(bounds.height).toBeGreaterThanOrEqual(40);
  expect(bounds.width).toBeGreaterThanOrEqual(64);
  await page.mouse.click(bounds.x + bounds.width * 0.25, bounds.y + bounds.height / 2);
  await expect.poll(() => page.locator('audio').evaluate(media => media.volume)).toBeLessThan(0.8);
});

test('iOS volume controls show hardware instructions rather than an inoperative slider', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });
  try {
    const page = await context.newPage();
    await mockMedia(page);
    await ready(page, '/europe/belgium/studio-brussel');
    await dock(page).getByRole('button', { name: 'Channels & schedule', exact: true }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByRole('slider', { name: 'Volume', exact: true })).toHaveCount(0);
    await expect(drawer.getByRole('note')).toContainText("On iPhone or iPad");
  } finally {
    await context.close();
  }
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
