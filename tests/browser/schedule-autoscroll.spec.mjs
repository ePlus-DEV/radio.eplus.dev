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

test('16:29 ICT shows a Now marker in an unlisted interval, then switches to 16:30 programme', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  // 09:29 UTC = 16:29 ICT, exactly between FM91 (ends 16:15)
  // and Giờ cao điểm chiều (starts 16:30).
  await page.clock.install({ time: new Date('2026-10-14T09:29:00Z') });
  await page.goto('/asia/viet-nam/vov-gt-hcm');
  await page.waitForFunction(() => Boolean(document.querySelector('#__nuxt')?.__vue_app__));
  await page.locator('.radio-player-dock').getByRole('button', { name: 'Channels & schedule' }).click();
  await queue(page).getByRole('tab', { name: /Schedule/ }).click();

  const marker = queue(page).locator('[data-schedule-now]');
  await expect(marker).toBeVisible();
  await expect(marker).toContainText('16:29');
  await expect(marker).toContainText('No programme details are listed for this time');
  await expect(marker).toContainText('Giờ cao điểm chiều');
  await expect(marker).toContainText('16:30');
  await expect.poll(() => marker.evaluate(row => {
    const viewport = row.closest('.radio-scrollbar').getBoundingClientRect();
    const box = row.getBoundingClientRect();
    return box.top >= viewport.top && box.bottom <= viewport.bottom;
  })).toBe(true);

  const nextSlot = queue(page).locator('[data-program-index="7"]');
  await expect(nextSlot.locator('.absolute.inset-y-2')).toHaveCount(0);

  // No invented live programme during the gap; exactly at 16:30 the
  // synthetic marker vanishes and the next actual reference slot is active.
  await page.clock.runFor(60_000);
  await expect(marker).toHaveCount(0);
  await expect(nextSlot.locator('.absolute.inset-y-2')).toHaveCount(1);
});

test('manual browsing in a missing-guide window does not get auto-recentered', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.clock.install({ time: new Date('2026-10-14T04:30:00Z') }); // 11:30 ICT
  await page.goto('/asia/viet-nam/vov-gt-hcm');
  await page.waitForFunction(() => Boolean(document.querySelector('#__nuxt')?.__vue_app__));
  await page.locator('.radio-player-dock').getByRole('button', { name: 'Channels & schedule' }).click();
  await queue(page).getByRole('tab', { name: /Schedule/ }).click();

  const scroll = scrollArea(page);
  const marker = queue(page).locator('[data-schedule-now]');
  await expect(marker).toContainText('11:30');
  await expect(marker).toContainText('12:30');
  await scroll.evaluate(node => { node.scrollTop = 0; });
  await scroll.dispatchEvent('wheel', { deltaY: -200, bubbles: true });
  await page.clock.runFor(16_000);
  expect(await scroll.evaluate(node => node.scrollTop)).toBe(0);
  await queue(page).getByRole('button', { name: 'Jump to current time' }).click();
  await expect.poll(() => scroll.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
});

test('1-second time bar moves during an unlisted gap and transfers into scheduled show', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.clock.install({ time: new Date('2026-10-14T09:29:00Z') });
  await page.goto('/asia/viet-nam/vov-gt-hcm');
  await page.waitForFunction(() => Boolean(document.querySelector('#__nuxt')?.__vue_app__));
  await page.locator('.radio-player-dock').getByRole('button', { name: 'Channels & schedule' }).click();
  await queue(page).getByRole('tab', { name: /Schedule/ }).click();

  const marker = queue(page).locator('[data-schedule-now]');
  const time = marker.locator('[data-schedule-clock]');
  const line = marker.locator('[data-schedule-time-progress]');
  await expect(time).toHaveText('16:29:00');
  const initialProgress = await line.evaluate(element => parseFloat(element.style.width));
  expect(initialProgress).toBeCloseTo(93.333, 1);

  await page.clock.runFor(2_000);
  await expect(time).toHaveText('16:29:02');
  const advancedProgress = await line.evaluate(element => parseFloat(element.style.width));
  expect(advancedProgress).toBeGreaterThan(initialProgress);

  await page.clock.runFor(58_000); // Exactly 16:30 ICT.
  await expect(marker).toHaveCount(0);
  const programme = queue(page).locator('[data-program-index="7"]');
  await expect(programme.locator('[data-schedule-clock]')).toContainText('16:30:00');
  const showProgress = programme.locator('[data-schedule-time-progress]');
  await expect(showProgress).toHaveCount(1);
  expect(await showProgress.evaluate(element => parseFloat(element.style.width))).toBe(0);
  await page.clock.runFor(2_000);
  expect(await showProgress.evaluate(element => parseFloat(element.style.width))).toBeGreaterThan(0);
});
