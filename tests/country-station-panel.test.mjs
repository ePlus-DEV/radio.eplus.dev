import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("country page feeds the same station list to Player and PanelStation", async () => {
  const source = await readFile(
    join(process.cwd(), "pages/[area]/[country]/index.vue"),
    "utf8",
  );

  assert.match(
    source,
    /<Player[\s\S]*?:stations="stations"[\s\S]*?:active-station-id="activeStationId"/,
  );

  assert.match(
    source,
    /<PanelStation[\s\S]*?:stations="stations"[\s\S]*?:active-station-id="activeStationId"[\s\S]*?:country-name="countryName"/,
  );

  assert.doesNotMatch(
    source,
    /<PanelStation\s*\/>/,
    "PanelStation must not fall back to an empty station list on the country page",
  );
});
