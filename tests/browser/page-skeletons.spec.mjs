import { test, expect } from "@playwright/test";

test("country navigation shows a matching skeleton only while loading and leaves the dock intact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/europe");
  await page.route("**/radio/europe/belgium.json", async route => {
    await new Promise(resolve => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.locator('main a[href="/europe/belgium"]').first().click();
  const skeleton = page.locator(".radio-page-skeleton");
  await expect(skeleton).toBeVisible();
  await expect(skeleton).toHaveAttribute("role", "status");
  await expect(page.locator(".radio-player-dock")).toBeVisible();
  await expect(page).toHaveURL(/\/europe\/belgium$/);
  await expect(skeleton).toBeHidden({ timeout: 15000 });
  await expect(page.locator("main .radio-station-card").first()).toBeVisible();
});

test("direct SSR landing renders real content without a skeleton flash", async ({ page }) => {
  await page.goto("/asia/viet-nam/vov-gt-hcm");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator(".radio-page-skeleton")).toHaveCount(0);
  await expect(page.locator(".radio-player-dock")).toBeVisible();
});


test("Library direct landing has an SSR skeleton fallback and hydrates real tab content", async ({ page, request }) => {
  const response = await request.get("/library");
  expect(response.ok()).toBe(true);
  // The ClientOnly subtree is intentionally blank on the server, but it must
  // provide a recognizable placeholder rather than a bare Loading paragraph.
  expect(await response.text()).toContain("radio-library-content-skeleton");

  await page.goto("/library#stats");
  await expect(page.locator(".radio-library-tabs a[aria-current='location']")).toHaveAttribute("href", "/library#stats");
  await expect(page.locator(".radio-library-content-skeleton")).toHaveCount(0);
  await expect(page.locator('section[aria-label="Listening time"]')).toBeVisible();
  await expect(page.locator(".radio-player-dock")).toBeVisible();
});
