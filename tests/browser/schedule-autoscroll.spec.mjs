import { test, expect } from '@playwright/test';

const queue = page => page.locator('.radio-right-panel');
const scrollArea = page => queue(page).locator('.radio-scrollbar[tabindex="0"]');
const visibleCurrent = page => queue(page).locator('[data-program-index="6"]'); // HCM FM91 at 14:30.

test('VOV Giao thông guide opens at the current Vietnam programme, not the first row', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  // 08:00 UTC = 15:00 Vietnam time, inside the 14:30–16:15 reference slot.
  await page.clock.install({ time: new Date('2026-10-14T08:00:00Z') });
  await page.goto('/asia/viet-nam/vov-gt-hcm');
  await page.waitForFunction(() => Boolean(document.querySelector('#__nuxt')?.__vue_app__));
  await page.locator('.radio-player-dock').getByRole('button', { name: 'Channels & schedule' }).click();
  await expect(queue(page)).toBeVisible();
  await queue(page).getByRole('tab', { name: /Schedule/ }).click();

  const scroll = scrollArea(page);
  const current = visibleCurrent(page);
  await expect(current).toBeVisible();
  await expect(current).toContainText('FM91');
  await expect.poll(() => scroll.evaluate(element => element.scrollTop)).toBeGreaterThan(40);
  await expect.poll(() => current.evaluate(row => {
    const viewport = row.closest('.radio-scrollbar').getBoundingClientRect();
    const target = row.getBoundingClientRect();
    return target.top >= viewport.top && target.bottom <= viewport.bottom;
  })).toBe(true);

  // A manual browse is never snapped back by a routine clock tick.
  await scroll.evaluate(element => { element.scrollTop = 0; });
  await scroll.dispatchEvent('wheel', { deltaY: -200, bubbles: true });
  await page.clock.runFor(31_000);
  expect(await scroll.evaluate(element => element.scrollTop)).toBe(0);

  // An explicit "jump to now" button restores the active row.
  await queue(page).getByRole('button', { name: 'Jump to current time' }).click();
  await expect.poll(() => scroll.evaluate(element => element.scrollTop)).toBeGreaterThan(40);

  // Switching away and back to Schedule must center the active row again.
  await queue(page).getByRole('tab', { name: /All channels/ }).click();
  await scroll.evaluate(element => { element.scrollTop = 0; });
  await queue(page).getByRole('tab', { name: /Schedule/ }).click();
  await expect.poll(() => scroll.evaluate(element => element.scrollTop)).toBeGreaterThan(40);
});

test('guide in a gap focuses the next slot without labeling it as live', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  // 08:20 UTC = 15:20; instead test 11:30 ICT gap between 11:00 and 12:30.
  await page.clock.install({ time: new Date('2026-10-14T04:30:00Z') });
  await page.goto('/asia/viet-nam/vov-gt-hcm');
  await page.waitForFunction(() => Boolean(document.querySelector('#__nuxt')?.__vue_app__));
  await page.locator('.radio-player-dock').getByRole('button', { name: 'Channels & schedule' }).click();
  await queue(page).getByRole('tab', { name: /Schedule/ }).click();

  const nextSlot = queue(page).locator('[data-program-index="5"]'); // 12:30
  await expect(nextSlot).toBeVisible();
  await expect.poll(() => nextSlot.evaluate(row => {
    const viewport = row.closest('.radio-scrollbar').getBoundingClientRect();
    const box = row.getBoundingClientRect();
    return box.top >= viewport.top && box.bottom <= viewport.bottom;
  })).toBe(true);
  await expect(nextSlot.locator('.absolute.inset-y-2')).toHaveCount(0);
});
