import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

test("country page feeds its catalog to shared playback and PanelStation", async () => {
  const source = await readFile(
    join(process.cwd(), "pages/[area]/[country]/index.vue"),
    "utf8",
  );

  assert.match(source, /playback\.activate\(createPlaybackStation\(/);
  assert.match(source, /stations\.value, \{ autoplay, onlyIfIdle: !autoplay \}/);
  assert.doesNotMatch(source, /<Player\s/);

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

