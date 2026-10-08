import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

test("station route owns one catalog source and resets route-scoped async state", async () => {
  const page = await readFile(
    join(root, "pages/[area]/[country]/[station].vue"),
    "utf8",
  );
  const panel = await readFile(
    join(root, "components/panel/Station.vue"),
    "utf8",
  );

  assert.match(page, /const stationCatalogKey = computed/);
  assert.match(page, /stationCatalogPayload\.value\?\.key === stationCatalogKey\.value/);
  assert.match(page, /const resetRouteScopedState = \(\): void =>/);
  assert.match(page, /lyric_popup\.value = false/);
  assert.match(page, /requestVersion \+= 1/);
  assert.match(page, /clearPolling\(\)/);

  assert.doesNotMatch(page, /@update-data=/);
  assert.doesNotMatch(page, /handleDataFromChild/);
  assert.doesNotMatch(panel, /\$fetch</);
  assert.doesNotMatch(panel, /emit\("update-data"/);
});

test("Zing-only behavior is provider-scoped and not Vietnam-scoped", async () => {
  const page = await readFile(
    join(root, "pages/[area]/[country]/[station].vue"),
    "utf8",
  );

  assert.match(page, /v-if="isZingStation"/);
  assert.match(page, /if \(isZingScheduleUrl\(url\)\)/);
  assert.doesNotMatch(page, /slug\.value === "viet-nam"/);
});
