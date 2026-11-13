import { test, expect } from '@playwright/test';

const links = page => page.locator('nav.radio-library-tabs');
const selected = page => links(page).locator('a[aria-current="location"]');

test('Library deep links, Back/Forward, reload and panel selection stay synchronized', async ({ page }) => {
  // Below xl, page navigation replaces the desktop sidebar.
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/library#recent');
  await expect(selected(page)).toHaveAttribute('href', '/library#recent');
  await expect(page.locator('section[aria-label="Recently played"]')).toBeVisible();

  await links(page).locator('a[href="/library#favorites"]').click();
  await expect(page).toHaveURL(/\/library#favorites$/);
  await expect(selected(page)).toHaveAttribute('href', '/library#favorites');
  await expect(page.locator('section[aria-label="Favorites"]')).toBeVisible();

  await links(page).locator('a[href="/library#collections"]').click();
  await expect(page).toHaveURL(/\/library#collections$/);
  await expect(page.locator('section[aria-label="Collections"]')).toBeVisible();

  await links(page).locator('a[href="/library#custom"]').click();
  await expect(page).toHaveURL(/\/library#custom$/);
  await expect(page.locator('section[aria-label="Added stations"]')).toBeVisible();

  await links(page).locator('a[href="/library#stats"]').click();
  await expect(page).toHaveURL(/\/library#stats$/);
  await expect(selected(page)).toHaveAttribute('href', '/library#stats');
  await expect(page.locator('section[aria-label="Listening activity"]')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/library#custom$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/library#stats$/);
  await page.reload();
  await expect(selected(page)).toHaveAttribute('href', '/library#stats');

  await links(page).locator('a[href="/library"]').click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(selected(page)).toHaveAttribute('href', '/library');
  await expect(page.locator('section[aria-label="Overview"]')).toBeVisible();

  await page.goto('/library#unknown');
  await expect(selected(page)).toHaveAttribute('href', '/library');
});

test('mobile Library navigation has six usable touch targets, and desktop has no duplicate tabs', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/library#recent');
  const nav = links(page);
  await expect(nav.locator('a')).toHaveCount(6);
  expect(await nav.evaluate(element => getComputedStyle(element.firstElementChild).gridTemplateColumns.split(' ').length)).toBe(2);
  expect(await nav.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  const tabMetrics = await nav.locator('a').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { height: box.height, left: box.left, right: box.right, viewport: window.innerWidth };
  }));
  for (const tab of tabMetrics) {
    expect(tab.height).toBeGreaterThanOrEqual(44);
    expect(tab.left).toBeGreaterThanOrEqual(0);
    expect(tab.right).toBeLessThanOrEqual(tab.viewport);
  }

  const stats = nav.locator('a[href="/library#stats"]');
  await stats.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/library#stats$/);
  await expect(stats).toHaveAttribute('aria-current', 'location');

  await page.setViewportSize({ width: 1024, height: 768 });
  expect(await nav.evaluate(element => getComputedStyle(element.firstElementChild).gridTemplateColumns.split(' ').length)).toBe(3);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(nav).toBeHidden();
  const sidebar = page.locator('#radio-library-subnav-desktop');
  await expect(sidebar).toBeVisible();
  await expect(sidebar.locator('a')).toHaveCount(6);
});
